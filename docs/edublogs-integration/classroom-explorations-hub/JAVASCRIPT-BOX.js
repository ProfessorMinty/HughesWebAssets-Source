(function loadClassroomExplorationsHubRelease() {
  "use strict";

  var releaseBase = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@42d251fff66e038d6ca383a0262e0fe87b1a032a/releases/classroom-explorations-hub/2026.08.10.2/";
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
    if (mount) mount.setAttribute("data-hrv-hub-bootstrap", "failed");
  };
  document.head.appendChild(script);
})();
