(function () {
  "use strict";

  function injectPhotoAlbum() {
    var mount = document.getElementById("hrv-photo-album");
    if (!mount || mount.getAttribute("data-hrv-repository-handoff") === "started") return;

    mount.setAttribute("data-hrv-repository-handoff", "started");

    var loader = document.createElement("script");
    loader.src = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@a38a2eb2eb7a9f5e9300b4861bfeae721ec74eb6/releases/photo-album/2026.08.18.8/bootstrap.js";
    loader.crossOrigin = "anonymous";
    loader.setAttribute("data-mount", "hrv-photo-album");
    loader.setAttribute("data-runtime", "./assets/photo-album.js");
    loader.setAttribute("data-stylesheet", "./assets/photo-album.css");
    loader.setAttribute("data-manifest", "https://hrv-photo-album.drminty17.workers.dev/manifest.json");
    loader.setAttribute("data-layout", "viewport");
    document.head.appendChild(loader);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", injectPhotoAlbum, { once: true });
  } else {
    injectPhotoAlbum();
  }
})();
