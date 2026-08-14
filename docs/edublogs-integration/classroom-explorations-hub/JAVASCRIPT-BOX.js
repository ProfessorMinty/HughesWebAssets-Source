(function () {
  "use strict";

  var MOUNT_ID = "hrv-classroom-explorations-root";
  var RELEASE_COMMIT = "2e88d949e694f822d4253027e0bda8c77ecd5ee5";
  var RELEASE_BASE =
    "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@" +
    RELEASE_COMMIT +
    "/releases/classroom-explorations-hub/";

  function startClassroomExplorations() {
    var root = document.getElementById(MOUNT_ID);
    if (!root || root.getAttribute("data-hrv-doorway-started") === "true") return;

    root.setAttribute("data-hrv-doorway-started", "true");

    var bootstrap = document.createElement("script");
    bootstrap.src = RELEASE_BASE + "runtime/2026.08.14.1/bootstrap.js";
    bootstrap.crossOrigin = "anonymous";
    bootstrap.integrity = "sha256-O/ja6JE/B+NASAsvMpT1SAf3EI1+G5LS0o3Pp2frX3o=";
    bootstrap.setAttribute("data-mount", MOUNT_ID);
    bootstrap.setAttribute(
      "data-publication",
      RELEASE_BASE + "publications/pub-2026-08-14-001/publication.json"
    );

    bootstrap.addEventListener(
      "error",
      function () {
        root.setAttribute("data-hrv-state", "unavailable");
      },
      { once: true }
    );

    document.head.appendChild(bootstrap);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", startClassroomExplorations, { once: true });
  } else {
    startClassroomExplorations();
  }
})();
