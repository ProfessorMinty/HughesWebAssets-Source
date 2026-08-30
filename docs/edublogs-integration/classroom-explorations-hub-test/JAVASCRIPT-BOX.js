(function () {
  "use strict";

  var RELEASE = "2026.08.29.5-review";
  var MOUNT_ID = "hrv-classroom-explorations-root";
  var MUSEUM_ASSET =
    "https://cdn.nlightlabs.com/assets/icon/icon/museum-e141ca5eb8/museum-e141ca5eb8.webp";

  function normalizeOutageCard(mount) {
    var scene = mount.querySelector(".hrv-hub-outage__scene");
    if (!scene) return;

    var legacyAnimal = scene.querySelector(
      ".hrv-hub-outage__puppy, svg[aria-label*='puppy' i]"
    );
    var guide = scene.querySelector("[data-hrv-guide-asset]");

    if (legacyAnimal || !guide) {
      scene.replaceChildren();

      var fallback = document.createElement("span");
      fallback.className = "hrv-hub-outage__guide-fallback";
      fallback.textContent = "🏛️";

      guide = document.createElement("img");
      guide.className = "hrv-hub-outage__guide";
      guide.setAttribute("data-hrv-guide-asset", "");
      guide.alt = "";
      guide.decoding = "async";
      guide.src = MUSEUM_ASSET;

      var question = document.createElement("span");
      question.className = "hrv-hub-outage__question";
      question.textContent = "?";

      var map = document.createElement("span");
      map.className = "hrv-hub-outage__map";
      map.textContent = "🗺️";

      scene.append(fallback, guide, question, map);
    }

    var markReady = function () {
      if (guide.naturalWidth > 0) mount.classList.add("hrv-guide-ready");
    };

    var markUnavailable = function () {
      mount.classList.remove("hrv-guide-ready");
      guide.hidden = true;
    };

    guide.addEventListener("load", markReady, { once: true });
    guide.addEventListener("error", markUnavailable, { once: true });

    if (guide.complete) {
      if (guide.naturalWidth > 0) markReady();
      else markUnavailable();
    }
  }

  function startHubReview() {
    var mount = document.getElementById(MOUNT_ID);
    if (!mount || mount.dataset.hrvRepositoryHandoff === "started") return;

    normalizeOutageCard(mount);
    mount.dataset.hrvRepositoryHandoff = "started";
    mount.dataset.hrvReviewRelease = RELEASE;

    var repository = "ProfessorMinty/HughesWebAssets-Source";
    var reviewRef = "hub-authoring-v2-2026-08-28";
    var base =
      "https://cdn.jsdelivr.net/gh/" + repository + "@" + reviewRef + "/";
    var cacheKey = "?v=" + encodeURIComponent(RELEASE);

    var loader = document.createElement("script");
    loader.src =
      base +
      "apps/classroom-explorations-hub/src/review-bootstrap.js" +
      cacheKey;
    loader.async = false;
    loader.crossOrigin = "anonymous";

    loader.dataset.mount = MOUNT_ID;
    loader.dataset.pageId = "hrv-page:classroom-explorations";
    loader.dataset.sourceRef = reviewRef;
    loader.dataset.release = RELEASE;
    loader.dataset.source =
      base +
      "apps/classroom-explorations-hub/source/hub.source.json" +
      cacheKey;
    loader.dataset.routes =
      base + "registry/hrv-routes.source.json" + cacheKey;
    loader.dataset.control =
      base +
      "apps/classroom-explorations-hub/source/hub.control.json" +
      cacheKey;
    loader.dataset.runtime =
      base +
      "apps/classroom-explorations-hub/src/runtime-v3.js" +
      cacheKey;
    loader.dataset.stylesheets = [
      "hub-foundation.css",
      "hub-hero-and-map.css",
      "hub-feature-rooms.css",
      "hub-galleries-and-motion.css",
      "hub-responsive.css"
    ].map(function (name) {
      return base + "apps/classroom-explorations-hub/src/" + name + cacheKey;
    }).join("|");
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
    document.addEventListener("DOMContentLoaded", startHubReview, {
      once: true
    });
  } else {
    startHubReview();
  }
})();
