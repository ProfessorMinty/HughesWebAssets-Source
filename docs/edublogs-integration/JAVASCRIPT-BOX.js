(function loadHughesRoomViewsPhotoAlbum() {
  "use strict";

  var mount = document.getElementById("hrv-photo-album");
  if (!mount || mount.getAttribute("data-hrv-page-loader") === "started") return;

  var releaseCommit = "__IMMUTABLE_COMMIT_SHA__";
  var releaseBase =
    "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@" +
    releaseCommit +
    "/releases/photo-album/2026.08.10.2/";

  mount.setAttribute("data-hrv-page-loader", "started");

  var loader = document.createElement("script");
  loader.src = releaseBase + "bootstrap.js";
  loader.crossOrigin = "anonymous";
  loader.setAttribute("data-mount", "hrv-photo-album");
  loader.setAttribute("data-runtime", "./assets/photo-album.js");
  loader.setAttribute("data-stylesheet", "./assets/photo-album.css");
  loader.setAttribute(
    "data-manifest",
    "https://hrv-photo-album.drminty17.workers.dev/manifest.json"
  );
  loader.setAttribute("data-layout", "viewport");

  loader.addEventListener("error", function showRepositoryFallback() {
    mount.setAttribute("data-hrv-bootstrap", "failed");
    mount.setAttribute("aria-busy", "false");
    var message = mount.querySelector(".hrv-photo-album-bridge__message");
    if (message) {
      message.textContent =
        "The Photo Album is temporarily unavailable. Please try again soon.";
    }
  });

  document.head.appendChild(loader);
})();
