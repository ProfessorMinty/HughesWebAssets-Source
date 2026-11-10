(() => {
  "use strict";
  const script = document.currentScript,
    root = document.getElementById(
      script?.dataset.mount || "hrv-classroom-explorations-root",
    );
  if (
    !root ||
    root.dataset.hrvSelectionStarted === "true" ||
    root.dataset.hrvBootstrapStarted === "true"
  )
    return;
  const channel = script?.dataset.channel || "production",
    base = "https://cdn.nlightlabs.com/hrv/classroom-explorations-hub/";
  const runtimeFingerprint =
    "701f8d054faf436ac3dab7244d648e6afeaf6b3fc6cf271400a38ec9a26d5244";
  const id =
      /^hub-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/,
    hex = /^[a-f0-9]{64}$/,
    commit = /^[a-f0-9]{40}$/;
  root.dataset.hrvSelectionStarted = "true";
  root.dataset.hrvState = "loading";
  root.setAttribute("aria-busy", "true");
  let settled = false;
  const abort = new AbortController();
  const timer = setTimeout(
    () => fail(new Error("Hub selection timed out")),
    18000,
  );
  function matches(event) {
    return event.detail?.pageId === "hrv-page:classroom-explorations";
  }
  function cleanup() {
    clearTimeout(timer);
    window.removeEventListener("hrv:page-ready", ready);
    window.removeEventListener("hrv:page-error", failed);
  }
  function ready(event) {
    if (matches(event)) {
      settled = true;
      cleanup();
    }
  }
  function failed(event) {
    if (matches(event)) {
      settled = true;
      cleanup();
      abort.abort();
    }
  }
  function fail(error) {
    if (settled) return;
    settled = true;
    cleanup();
    abort.abort();
    root.dataset.hrvState = "unavailable";
    root.removeAttribute("aria-busy");
    const notice = root.querySelector("[data-hrv-outage-notice]");
    if (notice) notice.hidden = false;
    console.error("[HRV Hub selection]", error.message);
    window.dispatchEvent(
      new CustomEvent("hrv:page-error", {
        detail: {
          pageId: "hrv-page:classroom-explorations",
          message: "The museum is temporarily unavailable.",
        },
      }),
    );
  }
  function requireValue(value, message) {
    if (!value) throw new Error(message);
  }
  function canonical(value) {
    if (Array.isArray(value)) return value.map(canonical);
    if (value && typeof value === "object")
      return Object.fromEntries(
        Object.keys(value)
          .sort()
          .map((key) => [key, canonical(value[key])]),
      );
    return value;
  }
  async function hash(text) {
    return [
      ...new Uint8Array(
        await crypto.subtle.digest("SHA-256", new TextEncoder().encode(text)),
      ),
    ]
      .map((v) => v.toString(16).padStart(2, "0"))
      .join("");
  }
  async function read(url, maximum) {
    const response = await fetch(url, {
      credentials: "omit",
      redirect: "error",
      cache: "no-store",
      signal: abort.signal,
    });
    requireValue(
      response.status === 200 && response.body,
      "Hub publication unavailable",
    );
    const reader = response.body.getReader(),
      decoder = new TextDecoder("utf-8", { fatal: true });
    let text = "",
      bytes = 0;
    try {
      while (true) {
        const part = await reader.read();
        if (part.done) break;
        bytes += part.value.length;
        if (bytes > maximum) {
          await reader.cancel();
          throw new Error("Hub publication too large");
        }
        text += decoder.decode(part.value, { stream: true });
      }
      return text + decoder.decode();
    } finally {
      reader.releaseLock();
    }
  }
  window.addEventListener("hrv:page-ready", ready);
  window.addEventListener("hrv:page-error", failed);
  (async () => {
    requireValue(
      ["review", "production"].includes(channel),
      "Unknown Hub channel",
    );
    const selection = JSON.parse(
      await read(
        base + "channels/" + channel + ".json?hrv=" + Date.now(),
        65536,
      ),
    );
    requireValue(
      selection.schemaVersion === "hrv-hub-selection/1.0.0" &&
        selection.pageId === "hrv-page:classroom-explorations" &&
        selection.channel === channel &&
        Number.isSafeInteger(selection.generation) &&
        selection.generation > 0 &&
        selection.runtimeFingerprint === runtimeFingerprint,
      "Unsupported Hub selection",
    );
    const ref = selection.publication;
    requireValue(
      ref &&
        id.test(ref.id) &&
        hex.test(ref.sha256) &&
        commit.test(ref.sourceCommit) &&
        /^sha256:[a-f0-9]{64}$/.test(ref.snapshotId),
      "Invalid Hub publication identity",
    );
    const publicationBase = base + "publications/" + ref.id + "/";
    requireValue(
      ref.url === publicationBase + "publication.json",
      "Hub publication escaped its approved location",
    );
    const bytes = await read(ref.url, 65536);
    requireValue(
      (await hash(bytes)) === ref.sha256,
      "Hub publication integrity failure",
    );
    const publication = JSON.parse(bytes);
    requireValue(
      publication.schemaVersion === "1.0" &&
        publication.publicationId === ref.id &&
        publication.pageId === "hrv-page:classroom-explorations" &&
        publication.pageType === "classroom-explorations-hub" &&
        publication.sourceRevision === ref.sourceCommit &&
        publication.content?.snapshotId === ref.snapshotId &&
        publication.content?.runtimeSchemaVersion === "1.0" &&
        publication.content.manifest.path ===
          publicationBase + "manifest.json" &&
        hex.test(publication.content.manifest.sha256),
      "Hub publication does not match its accepted selection",
    );
    requireValue(
      (await hash(JSON.stringify(canonical(publication.runtime)))) ===
        runtimeFingerprint,
      "Hub runtime changed without a reviewed loader",
    );
    if (settled || abort.signal.aborted) return;
    root.dataset.hrvSelectedPublication = ref.id;
    root.dataset.hrvSelectedSource = ref.sourceCommit;
    root.dataset.hrvPublicationChannel = channel;
    root.dataset.hrvPublicationGeneration = String(selection.generation);
    const bootstrap = document.createElement("script");
    bootstrap.src = publication.runtime.bootstrap.path;
    bootstrap.crossOrigin = "anonymous";
    bootstrap.integrity =
      "sha256-" +
      btoa(
        String.fromCharCode(
          ...publication.runtime.bootstrap.sha256
            .match(/../g)
            .map((v) => parseInt(v, 16)),
        ),
      );
    bootstrap.dataset.mount = root.id;
    bootstrap.dataset.publication = ref.url;
    bootstrap.addEventListener(
      "error",
      () => fail(new Error("Hub runtime unavailable")),
      { once: true },
    );
    document.head.append(bootstrap);
  })().catch(fail);
})();
