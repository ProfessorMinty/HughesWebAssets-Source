(function () {
  "use strict";

  var TEMPORARY_BANNER_ID = "hrv-photo-album-construction-banner";

  function ensureTemporaryConstructionBanner(mount) {
    var albumsSection = mount.querySelector(".hrv-albums-section");
    var existing = mount.querySelector("#" + TEMPORARY_BANNER_ID);

    if (!albumsSection) {
      if (existing) existing.remove();
      return;
    }

    if (existing && existing.nextElementSibling === albumsSection) {
      return;
    }

    if (existing) existing.remove();

    var banner = document.createElement("div");
    banner.id = TEMPORARY_BANNER_ID;
    banner.className = "hrv-notice hrv-photo-album-construction-banner";
    banner.setAttribute("role", "status");
    banner.textContent =
      "🚧 Photo Album Under Construction · We’re still putting the finishing touches on the full Photo Album. In the meantime, enjoy these pretty pictures while we finish building it!";

    albumsSection.parentNode.insertBefore(banner, albumsSection);
  }

  function watchForTemporaryConstructionBanner(mount) {
    ensureTemporaryConstructionBanner(mount);

    var observer = new MutationObserver(function () {
      ensureTemporaryConstructionBanner(mount);
    });

    observer.observe(mount, {
      childList: true,
      subtree: true
    });
  }

  function loadHughesRoomViewsPhotoAlbum() {
    var mount = document.getElementById("hrv-photo-album");

    if (!mount) {
      console.error(
        "[HRV Photo Album] Mount #hrv-photo-album was not found."
      );
      return;
    }

    if (mount.getAttribute("data-hrv-page-loader") === "started") {
      watchForTemporaryConstructionBanner(mount);
      return;
    }

    var releaseCommit = "e555716fea82082c12629d135f861c1190816f5a";
    var releaseBase =
      "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@" +
      releaseCommit +
      "/releases/photo-album/2026.08.10.10/";

    mount.setAttribute("data-hrv-page-loader", "started");
    watchForTemporaryConstructionBanner(mount);

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
      console.error(
        "[HRV Photo Album] Repository bootstrap failed to load:",
        loader.src
      );
      mount.setAttribute("data-hrv-bootstrap", "failed");
      mount.setAttribute("aria-busy", "false");
      var message = mount.querySelector(".hrv-photo-album-bridge__message");
      if (message) {
        message.textContent =
          "The Photo Album is temporarily unavailable. Please try again soon.";
      }
    });

    document.head.appendChild(loader);
  }

  if (document.readyState === "loading") {
    document.addEventListener(
      "DOMContentLoaded",
      loadHughesRoomViewsPhotoAlbum,
      { once: true }
    );
  } else {
    loadHughesRoomViewsPhotoAlbum();
  }
})();
