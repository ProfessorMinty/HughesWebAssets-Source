(function loadClassroomExplorationsHubRelease() {
  "use strict";

  var releaseBase = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@__IMMUTABLE_COMMIT_SHA__/releases/classroom-explorations-hub/__RELEASE__/";
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
