(function () {
  "use strict";

  var mount = document.getElementById("hrv-photo-album");
  if (!mount || mount.getAttribute("data-hrv-page-loader") === "started") {
    return;
  }

  var releaseCommit = "d036ff1a61bba7b7efced91c2f30881aa0e0d98a";
  var releaseBase =
    "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@" +
    releaseCommit +
    "/releases/photo-album/2026.08.18.1/";

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

  loader.addEventListener("error", function () {
    console.error("[HRV Photo Album] Repository bootstrap failed to load.");
  });

  document.head.appendChild(loader);
})();
