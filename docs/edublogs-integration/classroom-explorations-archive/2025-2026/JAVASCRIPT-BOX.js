(function () {
  "use strict";

  var MOUNT_ID = "hrv-classroom-explorations-archive-root";
  var PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";
  var RELEASE_COMMIT = "9deaf1723109c5259b5813d271a23d336d68559d";
  var RUNTIME_VERSION = "2026.09.12.1";
  var PUBLICATION_ID = "pub-2026-09-12-001";
  var BOOTSTRAP_INTEGRITY = "sha256-ReDjv/QalAFhiBB79JidFRP9rUUiFCrl9JeKY0JqByY=";
  var RELEASE_BASE =
    "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@" +
    RELEASE_COMMIT +
    "/releases/classroom-explorations-archive/";

  function startClassroomExplorationsArchive() {
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
      return event && event.detail && event.detail.pageId === PAGE_ID;
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
    bootstrap.src = RELEASE_BASE + "runtime/" + RUNTIME_VERSION + "/bootstrap.js";
    bootstrap.async = true;
    bootstrap.crossOrigin = "anonymous";
    bootstrap.integrity = BOOTSTRAP_INTEGRITY;
    bootstrap.setAttribute("data-hrv-archive-bootstrap", PUBLICATION_ID);
    bootstrap.setAttribute("data-mount", MOUNT_ID);
    bootstrap.setAttribute(
      "data-publication",
      RELEASE_BASE + "publications/" + PUBLICATION_ID + "/publication.json"
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
      if (settled) return;
      if (root.getAttribute("data-hrv-state") === "ready") {
        settled = true;
        cleanup();
        return;
      }
      settled = true;
      cleanup();
      showOutage();
    }, 20000);

    document.head.appendChild(bootstrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startClassroomExplorationsArchive, { once: true });
  } else {
    startClassroomExplorationsArchive();
  }
})();
