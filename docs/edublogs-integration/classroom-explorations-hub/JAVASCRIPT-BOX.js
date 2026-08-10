(function loadClassroomExplorationsHubRelease() {
  "use strict";

  var releaseBase = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@4752a2973bccb9b55e0d3c4071a14b8b0c74aba1/releases/classroom-explorations-hub/2026.08.10.3/";
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
      mount.setAttribute("data-hrv-hub-error", "release-bootstrap-load-failed");
    }
  };
  document.head.appendChild(script);
})();
