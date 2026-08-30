(function () {
  "use strict";

  var MOUNT_ID = "hrv-classroom-explorations-root";
  var PAGE_ID = "hrv-page:classroom-explorations";
  var RELEASE_COMMIT = "47eab7374968ffd1896dca7c4fd3a19dff1fb96b";
  var RELEASE_BASE =
    "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@" +
    RELEASE_COMMIT +
    "/releases/classroom-explorations-hub/";

  function startClassroomExplorations() {
    var root = document.getElementById(MOUNT_ID);
    if (!root || root.getAttribute("data-hrv-doorway-started") === "true") return;

    var notice = root.querySelector("[data-hrv-outage-notice]");
    var settled = false;
    var timer = null;

    function hideOutage() {
      if (notice) notice.hidden = true;
    }

    function showOutage() {
      root.setAttribute("data-hrv-state", "unavailable");
      notice = root.querySelector("[data-hrv-outage-notice]");
      if (notice) notice.hidden = false;
    }

    function cleanup() {
      if (timer !== null) {
        window.clearTimeout(timer);
        timer = null;
      }
      window.removeEventListener("hrv:page-ready", onReady);
      window.removeEventListener("hrv:page-error", onError);
    }

    function eventMatchesPage(event) {
      return !event.detail || !event.detail.pageId || event.detail.pageId === PAGE_ID;
    }

    function onReady(event) {
      if (!eventMatchesPage(event)) return;
      settled = true;
      cleanup();
    }

    function onError(event) {
      if (!eventMatchesPage(event)) return;
      settled = true;
      cleanup();
      showOutage();
    }

    root.setAttribute("data-hrv-doorway-started", "true");
    root.setAttribute("data-hrv-state", "loading");
    hideOutage();

    window.addEventListener("hrv:page-ready", onReady);
    window.addEventListener("hrv:page-error", onError);

    var bootstrap = document.createElement("script");
    bootstrap.src = RELEASE_BASE + "runtime/2026.08.30.3/bootstrap.js";
    bootstrap.crossOrigin = "anonymous";
    bootstrap.integrity = "sha256-rHAcNpBvZDT+1OQkkFc9kXK6WKgms44/bUYz0F7sXy0=";
    bootstrap.setAttribute("data-mount", MOUNT_ID);
    bootstrap.setAttribute(
      "data-publication",
      RELEASE_BASE + "publications/pub-2026-08-30-003/publication.json"
    );

    bootstrap.addEventListener(
      "error",
      function () {
        if (settled) return;
        settled = true;
        cleanup();
        showOutage();
      },
      { once: true }
    );

    timer = window.setTimeout(function () {
      if (settled || root.getAttribute("data-hrv-state") === "ready") return;
      settled = true;
      cleanup();
      showOutage();
    }, 20000);

    document.head.appendChild(bootstrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startClassroomExplorations, { once: true });
  } else {
    startClassroomExplorations();
  }
})();
