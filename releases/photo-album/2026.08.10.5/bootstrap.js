(function bootstrapHughesRoomViewsPhotoAlbum() {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var mountId = script.getAttribute("data-mount") || "hrv-photo-album";
  var mount = document.getElementById(mountId);
  if (!mount || mount.getAttribute("data-hrv-bootstrap") === "started") return;
  mount.setAttribute("data-hrv-bootstrap", "started");

  var runtimeUrl = new URL(script.getAttribute("data-runtime") || "./assets/photo-album.js", script.src).href;
  var stylesheetUrl = new URL(script.getAttribute("data-stylesheet") || "./assets/photo-album.css", script.src).href;
  var manifestUrl = script.getAttribute("data-manifest") || "https://hrv-photo-album.drminty17.workers.dev/manifest.json";
  var layout = script.getAttribute("data-layout") === "contained" ? "contained" : "viewport";

  if (!document.querySelector('link[data-hrv-photo-album-styles="' + stylesheetUrl + '"]')) {
    var stylesheet = document.createElement("link");
    stylesheet.rel = "stylesheet";
    stylesheet.href = stylesheetUrl;
    stylesheet.setAttribute("data-hrv-photo-album-styles", stylesheetUrl);
    document.head.appendChild(stylesheet);
  }

  import(runtimeUrl)
    .then(function mountRuntime(runtime) {
      if (typeof runtime.mountPhotoAlbum !== "function") throw new Error("Photo Album runtime export is missing.");
      return runtime.mountPhotoAlbum(mount, { manifestUrl: manifestUrl, layout: layout }).ready;
    })
    .catch(function preserveFallback() {
      mount.setAttribute("data-hrv-bootstrap", "failed");
      mount.setAttribute("role", "status");
      mount.textContent = "The Photo Album is temporarily unavailable. Please try again soon.";
    });
})();
