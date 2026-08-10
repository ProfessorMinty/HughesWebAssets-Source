(function bootstrapClassroomExplorationsHub() {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var mountId = script.getAttribute("data-mount") || "hrv-classroom-explorations-root";
  var mount = document.getElementById(mountId);
  if (!mount || mount.getAttribute("data-hrv-hub-bootstrap") === "started") return;
  mount.setAttribute("data-hrv-hub-bootstrap", "started");

  var runtimeUrl = new URL(script.getAttribute("data-runtime") || "./assets/classroom-explorations-hub.js", script.src).href;
  var stylesheetUrl = new URL(script.getAttribute("data-stylesheet") || "./assets/classroom-explorations-hub.css", script.src).href;
  var manifestUrl = new URL(script.getAttribute("data-manifest") || "./hub.manifest.json", script.src).href;
  var layout = script.getAttribute("data-layout") === "contained" ? "contained" : "viewport";

  if (!document.querySelector('link[data-hrv-explorations-hub-styles="' + stylesheetUrl + '"]')) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = stylesheetUrl;
    stylesheet.setAttribute("data-hrv-explorations-hub-styles", stylesheetUrl);
    document.head.appendChild(stylesheet);
  }

  import(runtimeUrl)
    .then(function mountRuntime(runtime) {
      if (typeof runtime.mountClassroomExplorationsHub !== "function") {
        throw new Error("Classroom Explorations Hub runtime export is missing.");
      }
      return runtime.mountClassroomExplorationsHub(mount, {
        manifestUrl: manifestUrl,
        layout: layout
      }).ready;
    })
    .then(function markReady() {
      mount.setAttribute("data-hrv-hub-bootstrap", "ready");
    })
    .catch(function preserveNativeFallback(error) {
      mount.setAttribute("data-hrv-hub-bootstrap", "failed");
      mount.setAttribute("data-hrv-hub-error", error && error.message ? error.message : "runtime-load-failed");
      var fallback = mount.querySelector("[data-hrv-native-fallback]");
      if (fallback) fallback.removeAttribute("hidden");
    });
})();
