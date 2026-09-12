(() => {
  "use strict";
  const script = document.currentScript;
  const mountId = script?.dataset.mount || "hrv-classroom-explorations-root";
  let publicationUrl = script?.dataset.publication || "";
  const root = document.getElementById(mountId);
  const outageHtml = root?.innerHTML || "";
  const outageClassName = root?.className || "";

  const showLoading = () => {
    if (!root) return;
    root.setAttribute("aria-busy", "true");
    root.dataset.hrvState = "loading";

    let notice = root.querySelector("[data-hrv-outage-notice]");
    if (!notice) {
      notice = document.createElement("section");
      notice.className = "hrv-hub-outage";
      notice.dataset.hrvOutageNotice = "";
      notice.append(
        Object.assign(document.createElement("p"), { className: "hrv-hub-outage__eyebrow" }),
        Object.assign(document.createElement("h2"), { className: "hrv-hub-outage__title" }),
        Object.assign(document.createElement("p"), { className: "hrv-hub-outage__copy" })
      );
      root.append(notice);
    }

    notice.hidden = false;
    notice.classList.add("hrv-hub-loading");
    notice.dataset.hrvLoadingNotice = "";
    notice.setAttribute("role", "status");
    notice.setAttribute("aria-live", "polite");

    const eyebrow = notice.querySelector(".hrv-hub-outage__eyebrow");
    const title = notice.querySelector(".hrv-hub-outage__title");
    const copy = notice.querySelector(".hrv-hub-outage__copy");
    if (eyebrow) eyebrow.textContent = "The museum doors are opening";
    if (title) title.textContent = "Opening Classroom Explorations…";
    if (copy) copy.textContent = "Gathering the latest exhibit, learning lantern, and classroom archives.";

    const productionTitle = notice.querySelector(".hrv-outage-copy h1");
    const productionCopy = notice.querySelectorAll(".hrv-outage-copy p");
    if (productionTitle) productionTitle.textContent = "Opening Classroom Explorations…";
    if (productionCopy[0]) {
      productionCopy[0].textContent = "Gathering the latest exhibit, learning lantern, and classroom archives.";
    }
    if (productionCopy[1]) {
      productionCopy[1].textContent = "The museum will open automatically when everything is ready.";
    }
  };

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

  document
    .querySelectorAll([
      "style[data-hrv-classroom-hub-style]",
      "link[data-hrv-review-style]",
      "link[data-hrv-review-style-group]",
      "script[data-hrv-review-runtime]"
    ].join(","))
    .forEach((element) => element.remove());
  root.classList.remove("hrv-hub-v2", "hrv-hub-v3");
  [
    "data-hrv-review-bootstrap",
    "data-hrv-review-release",
    "data-hrv-review-commit",
    "data-hrv-repository-handoff"
  ].forEach((attribute) => root.removeAttribute(attribute));

  root.dataset.hrvBootstrapStarted = "true";
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

  showLoading();

  const hashBytes = async (bytes) => {
    const digest = await crypto.subtle.digest("SHA-256", bytes);
    return [...new Uint8Array(digest)]
      .map((byte) => byte.toString(16).padStart(2, "0"))
      .join("");
  };

  const hashText = async (text) => hashBytes(new TextEncoder().encode(text));

  const fetchTextVerified = async (url, expectedHash) => {
    const response = await fetch(url, { credentials: "omit", cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const text = await response.text();
    const actual = await hashText(text);
    if (actual !== expectedHash) throw new Error(`Integrity mismatch for ${url}`);
    return text;
  };

  const fetchBytesVerified = async (url, expectedHash) => {
    const response = await fetch(url, { credentials: "omit", cache: "no-store" });
    if (!response.ok) throw new Error(`HTTP ${response.status} for ${url}`);
    const bytes = await response.arrayBuffer();
    const actual = await hashBytes(bytes);
    if (actual !== expectedHash) throw new Error(`Integrity mismatch for ${url}`);
    return bytes;
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

      const artworkKeys = [
        "pastExplorations",
        "pastTwwl",
        "pastYears",
        "frameTopLeft",
        "frameTopRight",
        "frameMiddleLeft",
        "frameMiddleRight",
        "frameBottomLeft",
        "frameBottomRight"
      ];
      const artwork = publication.runtime.artwork;
      if (
        !artwork ||
        Object.keys(artwork).sort().join("|") !== [...artworkKeys].sort().join("|") ||
        artworkKeys.some((key) => (
          typeof artwork[key]?.path !== "string" ||
          !/^[a-f0-9]{64}$/.test(artwork[key]?.sha256 || "") ||
          artwork[key]?.mediaType !== "image/webp"
        ))
      ) {
        throw new Error("Unsupported runtime artwork contract.");
      }

      const [cssText, compatText, jsText, manifestText, artworkBytes] = await Promise.all([
        fetchTextVerified(resolve(publication.runtime.style.path), publication.runtime.style.sha256),
        fetchTextVerified(resolve(publication.runtime.hostCompat.path), publication.runtime.hostCompat.sha256),
        fetchTextVerified(resolve(publication.runtime.script.path), publication.runtime.script.sha256),
        fetchTextVerified(resolve(publication.content.manifest.path), publication.content.manifest.sha256),
        Promise.all(artworkKeys.map(async (key) => [
          key,
          await fetchBytesVerified(resolve(artwork[key].path), artwork[key].sha256),
          artwork[key].mediaType
        ]))
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

      const artworkUrls = Object.fromEntries(artworkBytes.map(([key, bytes, mediaType]) => [
        key,
        URL.createObjectURL(new Blob([bytes], { type: mediaType }))
      ]));
      const runtimeAssets = { artwork: artworkUrls };
      let artworkOwnedByRuntime = false;

      const moduleUrl = URL.createObjectURL(
        new Blob([jsText], { type: "text/javascript" })
      );

      try {
        const module = await import(moduleUrl);
        if (typeof module.mountClassroomExplorationsHub !== "function") {
          throw new Error("Renderer mount export missing.");
        }
        const controller = module.mountClassroomExplorationsHub(root, manifest, runtimeAssets);
        artworkOwnedByRuntime = controller?.runtimeAssets === runtimeAssets;
      } finally {
        URL.revokeObjectURL(moduleUrl);
        if (!artworkOwnedByRuntime) {
          Object.values(artworkUrls).forEach((url) => URL.revokeObjectURL(url));
        }
      }
    } catch (error) {
      document
        .querySelectorAll("style[data-hrv-classroom-hub-style]")
        .forEach((element) => element.remove());
      showOutage("Classroom Explorations could not load.", error);
    }
  })();
})();
