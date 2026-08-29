(function () {
  "use strict";

  function startHubReview() {
    var mount = document.getElementById(
      "hrv-classroom-explorations-root"
    );
    if (!mount || mount.dataset.hrvRepositoryHandoff === "started") return;

    mount.dataset.hrvRepositoryHandoff = "started";

    var repository = "ProfessorMinty/HughesWebAssets-Source";
    var reviewRef = "hub-authoring-v2-2026-08-28";
    var release = "2026.08.28.3-review";
    var base =
      "https://cdn.jsdelivr.net/gh/" +
      repository +
      "@" +
      reviewRef +
      "/";
    var cacheKey = "?v=" + encodeURIComponent(release);

    var loader = document.createElement("script");
    loader.src =
      base +
      "apps/classroom-explorations-hub/src/review-bootstrap.js" +
      cacheKey;
    loader.async = false;
    loader.crossOrigin = "anonymous";

    loader.dataset.mount = "hrv-classroom-explorations-root";
    loader.dataset.pageId = "hrv-page:classroom-explorations";
    loader.dataset.sourceRef = reviewRef;
    loader.dataset.source =
      base +
      "apps/classroom-explorations-hub/source/hub.source.json" +
      cacheKey;
    loader.dataset.routes =
      base +
      "registry/hrv-routes.source.json" +
      cacheKey;
    loader.dataset.control =
      base +
      "apps/classroom-explorations-hub/source/hub.control.json" +
      cacheKey;
    loader.dataset.runtime =
      base +
      "apps/classroom-explorations-hub/src/runtime-v3.js" +
      cacheKey;
    loader.dataset.stylesheet =
      base +
      "apps/classroom-explorations-hub/src/hub-v3.css" +
      cacheKey;
    loader.dataset.hostStylesheet =
      base +
      "apps/classroom-explorations-hub/src/host-compat.css" +
      cacheKey;
    loader.dataset.timeout = "20000";

    loader.addEventListener(
      "error",
      function () {
        delete mount.dataset.hrvRepositoryHandoff;
        mount.dataset.hrvState = "unavailable";

        var notice = mount.querySelector("[data-hrv-outage-notice]");
        if (notice) notice.hidden = false;

        console.error(
          "[HRV Hub Test] Repository bootstrap failed to load."
        );
      },
      { once: true }
    );

    document.head.appendChild(loader);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      startHubReview,
      { once: true }
    );
  } else {
    startHubReview();
  }
})();
