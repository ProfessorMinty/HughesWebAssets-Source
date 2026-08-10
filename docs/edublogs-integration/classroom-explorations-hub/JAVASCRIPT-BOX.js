(function loadClassroomExplorationsHubRelease() {
  "use strict";

  var releaseBase = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@f99bf79eb5deb2bb052ca2ad4f6ef45a6f76f130/releases/classroom-explorations-hub/2026.08.10.4/";
  var script = document.createElement("script");
  script.src = releaseBase + "bootstrap.js";
  script.async = true;
  script.setAttribute("data-mount", "hrv-classroom-explorations-root");
  script.setAttribute("data-runtime", releaseBase + "assets/classroom-explorations-hub.js");
  script.setAttribute("data-stylesheet", releaseBase + "assets/classroom-explorations-hub.css");
  script.setAttribute("data-manifest", releaseBase + "hub.manifest.json");
  script.setAttribute("data-layout", "viewport");
  script.onerror = function preserveNativeFallback() {
    var mount = document.getElementById("hrv-classroom-explorations-root");
    if (mount) {
      mount.setAttribute("data-hrv-hub-bootstrap", "failed");
      mount.setAttribute("data-hrv-hub-error", "museum-release-bootstrap-load-failed");
    }
  };
  document.head.appendChild(script);
})();
