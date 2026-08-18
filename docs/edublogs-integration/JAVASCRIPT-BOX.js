(function () {
  "use strict";

  function injectPhotoAlbum() {
    var mount = document.getElementById("hrv-photo-album");
    if (!mount || mount.getAttribute("data-hrv-repository-handoff") === "started") return;

    mount.setAttribute("data-hrv-repository-handoff", "started");

    var loader = document.createElement("script");
    loader.src = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@b8f8c51ca3f23f279360f23bdd956e39ca64eb23/releases/photo-album/2026.08.18.6/bootstrap.js";
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
