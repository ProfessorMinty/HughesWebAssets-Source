(function loadClassroomExplorationsHubRelease() {
  "use strict";

  var releaseBase = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@f99bf79eb5deb2bb052ca2ad4f6ef45a6f76f130/releases/classroom-explorations-hub/2026.08.10.4/";
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
      mount.setAttribute("data-hrv-hub-error", "museum-release-bootstrap-load-failed");
    }
  };
  document.head.appendChild(script);
})();

(function restoreClassroomExplorationsAutoScroll() {
  "use strict";

  var DELAY_MS = 700;
  var EXTRA_OFFSET = 12;

  function shouldSkip() {
    if (window.location.hash) return true;
    if (window.location.href.indexOf("customize.php") !== -1) return true;
    if (document.body && document.body.classList.contains("wp-admin")) return true;
    if (window.scrollY > 40) return true;
    return false;
  }

  function fixedTopOffset() {
    var offset = 0;
    var adminBar = document.getElementById("wpadminbar");
    if (adminBar && window.getComputedStyle(adminBar).position === "fixed") {
      offset += adminBar.offsetHeight || 0;
    }
    return offset;
  }

  function scrollToMuseum() {
    if (shouldSkip()) return;
    var target = document.getElementById("hrv-classroom-explorations-root");
    if (!target) return;

    var targetY = window.scrollY + target.getBoundingClientRect().top - fixedTopOffset() - EXTRA_OFFSET;
    if (targetY <= 40) return;

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
    });
  }

  function schedule() {
    window.setTimeout(scrollToMuseum, DELAY_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", schedule, { once: true });
  } else {
    schedule();
  }
})();
