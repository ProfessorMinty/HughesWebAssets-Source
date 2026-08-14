(() => {
  "use strict";
  const script = document.currentScript;
  const mountId = script?.dataset.mount || "hrv-classroom-explorations-root";
  let publicationUrl = script?.dataset.publication || "";
  const root = document.getElementById(mountId);
  const outageHtml = root?.innerHTML || "";
  const outageClassName = root?.className || "";

  const showOutage = (message, error) => {
    if (root) {
      document.documentElement.classList.remove("hrv-page-classroom-explorations-ready");
      root.className = outageClassName;
      root.innerHTML = outageHtml;
      root.removeAttribute("aria-busy");
      root.dataset.hrvState = "unavailable";
      const notice = root.querySelector("[data-hrv-outage-notice]");
      if (notice) notice.hidden = false;
    }
    console.error("[HRV Classroom Explorations]", message, error || "");
    window.dispatchEvent(new CustomEvent("hrv:page-error", {
      detail: { pageId: "hrv-page:classroom-explorations", message }
    }));
  };

  if (!root) return;
  if (root.dataset.hrvBootstrapStarted === "true") {
    root.dataset.hrvDuplicateInit = "ignored";
    return;
  }

  root.dataset.hrvBootstrapStarted = "true";
  const initialNotice = root.querySelector("[data-hrv-outage-notice]");
  if (initialNotice) initialNotice.hidden = true;

  let publicationResolved;
  try {
    publicationResolved = new URL(publicationUrl, window.location.href);
  } catch {
    publicationResolved = null;
  }

  const localPreview =
    publicationResolved &&
    ["localhost", "127.0.0.1"].includes(publicationResolved.hostname);

  if (!publicationResolved || (publicationResolved.protocol !== "https:" && !localPreview)) {
    showOutage("Classroom Explorations could not load.", new Error("Missing secure immutable publication URL."));
    return;
  }

  root.setAttribute("aria-busy", "true");
  root.dataset.hrvState = "loading";

  const hashText = async (text) => {
    const bytes = new TextEncoder().encode(text);
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const fetchTextVerified = async (url, expectedHash) => {
    const response = await fetch(url, { credentials: "omit", cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const text = await response.text();
    const actual = await hashText(text);
    if (actual !== expectedHash) throw new Error(`Integrity mismatch for ${url}`);
    return text;
  };

  publicationUrl = publicationResolved.href;
  const resolve = (path) => new URL(path, publicationUrl).href;

  (async () => {
    try {
      const publicationResponse = await fetch(publicationUrl, {
        credentials: "omit",
        cache: "no-store"
      });
      if (!publicationResponse.ok) {
        throw new Error(`Publication HTTP ${publicationResponse.status}`);
      }

      const publication = await publicationResponse.json();
      if (
        publication.schemaVersion !== "1.0" ||
        publication.pageId !== "hrv-page:classroom-explorations" ||
        publication.pageType !== "classroom-explorations-hub" ||
        publication.runtime.runtimeSchemaVersion !== "1.0" ||
        publication.content.runtimeSchemaVersion !== "1.0"
      ) {
        throw new Error("Unsupported publication contract.");
      }

      const [cssText, compatText, jsText, manifestText] = await Promise.all([
        fetchTextVerified(resolve(publication.runtime.style.path), publication.runtime.style.sha256),
        fetchTextVerified(resolve(publication.runtime.hostCompat.path), publication.runtime.hostCompat.sha256),
        fetchTextVerified(resolve(publication.runtime.script.path), publication.runtime.script.sha256),
        fetchTextVerified(resolve(publication.content.manifest.path), publication.content.manifest.sha256)
      ]);

      const manifest = JSON.parse(manifestText);
      if (
        manifest.runtimeSchemaVersion !== "1.0" ||
        manifest.snapshotId !== publication.content.snapshotId ||
        manifest.page?.id !== publication.pageId
      ) {
        throw new Error("Runtime/content compatibility check failed.");
      }

      const style = document.createElement("style");
      style.dataset.hrvClassroomHubStyle = "app";
      style.textContent = cssText;

      const compat = document.createElement("style");
      compat.dataset.hrvClassroomHubStyle = "host";
      compat.textContent = compatText;

      document.head.append(style, compat);

      const moduleUrl = URL.createObjectURL(
        new Blob([jsText], { type: "text/javascript" })
      );

      try {
        const module = await import(moduleUrl);
        if (typeof module.mountClassroomExplorationsHub !== "function") {
          throw new Error("Renderer mount export missing.");
        }
        module.mountClassroomExplorationsHub(root, manifest);
      } finally {
        URL.revokeObjectURL(moduleUrl);
      }
    } catch (error) {
      document
        .querySelectorAll("style[data-hrv-classroom-hub-style]")
        .forEach((element) => element.remove());
      showOutage("Classroom Explorations could not load.", error);
    }
  })();
})();
