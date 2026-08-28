(function () {
  "use strict";

  function startHubReview() {
    var mount = document.getElementById("hrv-classroom-explorations-root");
    if (!mount || mount.getAttribute("data-hrv-repository-handoff") === "started") return;

    mount.setAttribute("data-hrv-repository-handoff", "started");

    var repository = "ProfessorMinty/HughesWebAssets-Source";
    var reviewRef = "hub-authoring-v2-2026-08-28";
    var release = "2026.08.28.1-review";
    var base = "https://cdn.jsdelivr.net/gh/" + repository + "@" + reviewRef + "/";
    var cacheKey = "?v=" + encodeURIComponent(release);

    var loader = document.createElement("script");
    loader.src = base + "apps/classroom-explorations-hub/src/review-bootstrap.js" + cacheKey;
    loader.async = false;
    loader.crossOrigin = "anonymous";
    loader.setAttribute("data-mount", "hrv-classroom-explorations-root");
    loader.setAttribute("data-page-id", "hrv-page:classroom-explorations");
    loader.setAttribute("data-source-ref", reviewRef);
    loader.setAttribute("data-source", base + "apps/classroom-explorations-hub/source/hub.source.json" + cacheKey);
    loader.setAttribute("data-routes", base + "registry/hrv-routes.source.json" + cacheKey);
    loader.setAttribute("data-control", base + "apps/classroom-explorations-hub/source/hub.control.json" + cacheKey);
    loader.setAttribute("data-runtime", base + "apps/classroom-explorations-hub/src/runtime-v2.js" + cacheKey);
    loader.setAttribute("data-stylesheet", base + "apps/classroom-explorations-hub/src/hub-v2.css" + cacheKey);
    loader.setAttribute("data-host-stylesheet", base + "apps/classroom-explorations-hub/src/host-compat.css" + cacheKey);
    loader.setAttribute("data-timeout", "20000");

    loader.addEventListener("error", function () {
      mount.removeAttribute("data-hrv-repository-handoff");
      mount.setAttribute("data-hrv-state", "unavailable");
      var notice = mount.querySelector("[data-hrv-outage-notice]");
      if (notice) notice.hidden = false;
      console.error("[HRV Hub Test] Repository bootstrap failed to load.");
    }, { once: true });

    document.head.appendChild(loader);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startHubReview, { once: true });
  } else {
    startHubReview();
  }
})();
