(() => {
  "use strict";

  const PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";
  const PAGE_TYPE = "classroom-explorations-archive";
  const script = document.currentScript;
  const mountId = script?.dataset.mount || "hrv-classroom-explorations-archive-root";
  let publicationUrl = script?.dataset.publication || "";
  const root = document.getElementById(mountId);
  const outageHtml = root?.innerHTML || "";
  const outageClassName = root?.className || "";

  const showOutage = (message, error) => {
    if (root) {
      document.documentElement.classList.remove("hrv-page-classroom-explorations-archive-ready");
      root.className = outageClassName;
      root.innerHTML = outageHtml;
      root.removeAttribute("aria-busy");
      root.dataset.hrvState = "unavailable";
      const notice = root.querySelector("[data-hrv-outage-notice]");
      if (notice) notice.hidden = false;
    }
    console.error("[HRV Classroom Explorations Archive]", message, error || "");
    window.dispatchEvent(new CustomEvent("hrv:page-error", {
      detail: { pageId: PAGE_ID, message }
    }));
  };

  if (!root) return;
  if (root.dataset.hrvBootstrapStarted === "true") {
    root.dataset.hrvDuplicateInit = "ignored";
    return;
  }

  document
    .querySelectorAll("style[data-hrv-classroom-explorations-archive-style]")
    .forEach((element) => element.remove());
  root.classList.remove("hrv-archive-v1", "hrv-archive-v2");
  root.dataset.hrvBootstrapStarted = "true";

  const initialNotice = root.querySelector("[data-hrv-outage-notice]");
  if (initialNotice) initialNotice.hidden = true;

  let publicationResolved;
  try {
    publicationResolved = new URL(publicationUrl, window.location.href);
  } catch {
    publicationResolved = null;
  }

  const localPreview = publicationResolved &&
    ["localhost", "127.0.0.1"].includes(publicationResolved.hostname);

  if (!publicationResolved || (publicationResolved.protocol !== "https:" && !localPreview)) {
    showOutage("The Classroom Explorations archive could not load.", new Error("Missing secure immutable publication URL."));
    return;
  }

  root.setAttribute("aria-busy", "true");
  root.dataset.hrvState = "loading";

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
        publication.pageId !== PAGE_ID ||
        publication.pageType !== PAGE_TYPE ||
        publication.runtime?.runtimeSchemaVersion !== "1.0" ||
        publication.content?.runtimeSchemaVersion !== "1.0"
      ) {
        throw new Error("Unsupported archive publication contract.");
      }

      const artworkKeys = [
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
        throw new Error("Unsupported archive artwork contract.");
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
        manifest.page?.id !== publication.pageId ||
        manifest.page?.type !== publication.pageType
      ) {
        throw new Error("Archive runtime/content compatibility check failed.");
      }

      const style = document.createElement("style");
      style.dataset.hrvClassroomExplorationsArchiveStyle = "app";
      style.textContent = cssText;

      const compat = document.createElement("style");
      compat.dataset.hrvClassroomExplorationsArchiveStyle = "host";
      compat.textContent = compatText;
      document.head.append(style, compat);

      const artworkUrls = Object.fromEntries(artworkBytes.map(([key, bytes, mediaType]) => [
        key,
        URL.createObjectURL(new Blob([bytes], { type: mediaType }))
      ]));
      const runtimeAssets = { artwork: artworkUrls };
      let artworkOwnedByRuntime = false;
      const moduleUrl = URL.createObjectURL(new Blob([jsText], { type: "text/javascript" }));

      try {
        const module = await import(moduleUrl);
        if (typeof module.mountClassroomExplorationsArchive !== "function") {
          throw new Error("Archive renderer mount export missing.");
        }
        const controller = module.mountClassroomExplorationsArchive(root, manifest, runtimeAssets);
        artworkOwnedByRuntime = controller?.runtimeAssets === runtimeAssets;
      } finally {
        URL.revokeObjectURL(moduleUrl);
        if (!artworkOwnedByRuntime) {
          Object.values(artworkUrls).forEach((url) => URL.revokeObjectURL(url));
        }
      }
    } catch (error) {
      document
        .querySelectorAll("style[data-hrv-classroom-explorations-archive-style]")
        .forEach((element) => element.remove());
      showOutage("The Classroom Explorations archive could not load.", error);
    }
  })();
})();
