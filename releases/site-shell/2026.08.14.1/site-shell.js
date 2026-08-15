/*
 * Hughes Room Views — permanent global site shell
 * Version: 2026.08.14.1
 *
 * Global responsibility: guarded delayed scroll below repeated Amadeus chrome.
 * Page/application behavior does not belong here.
 */
(function () {
  "use strict";

  if (window.__HRV_SITE_SHELL_20260814_1__) return;
  window.__HRV_SITE_SHELL_20260814_1__ = true;

  var DELAY_MS = 700;
  var EXTRA_OFFSET = 12;
  var MANUAL_SCROLL_THRESHOLD = 40;
  var MIN_USEFUL_TARGET_Y = 160;
  var FALLBACK_TARGET_Y = 520;

  function isAdminOrCustomizerContext() {
    if (window.location.href.indexOf("customize.php") !== -1) return true;
    if (window.location.pathname.indexOf("/wp-admin/") === 0) return true;
    if (document.body && document.body.classList.contains("wp-admin")) return true;
    return false;
  }

  function shouldSkipAutoScroll() {
    if (window.location.hash) return true;
    if (isAdminOrCustomizerContext()) return true;

    /* Never fight a visitor who already started moving the page. */
    if (window.scrollY > MANUAL_SCROLL_THRESHOLD) return true;

    return false;
  }

  function getFixedTopOffset() {
    var offset = 0;
    var adminBar = document.getElementById("wpadminbar");

    if (adminBar && window.getComputedStyle(adminBar).position === "fixed") {
      offset += adminBar.offsetHeight || 0;
    }

    return offset;
  }

  function findContentTarget() {
    return document.querySelector(
      "[data-hrv-auto-scroll-target], " +
      ".entry-content > *:first-child, " +
      ".site-content, " +
      "#content"
    );
  }

  function autoScrollBelowHeader() {
    if (shouldSkipAutoScroll()) return;

    var target = findContentTarget();
    if (!target) return;

    var fixedOffset = getFixedTopOffset();
    var rect = target.getBoundingClientRect();
    var targetY = window.scrollY + rect.top - fixedOffset - EXTRA_OFFSET;

    /*
     * Some Amadeus layouts report a target too near the top even though the
     * repeated banner/navigation still dominates the initial viewport.
     */
    if (targetY < MIN_USEFUL_TARGET_Y) {
      targetY = FALLBACK_TARGET_Y;
    }

    window.scrollTo({
      top: Math.max(0, targetY),
      behavior: "smooth"
    });
  }

  function scheduleAutoScroll() {
    window.setTimeout(autoScrollBelowHeader, DELAY_MS);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", scheduleAutoScroll, { once: true });
  } else {
    scheduleAutoScroll();
  }

  document.documentElement.setAttribute("data-hrv-site-shell", "2026.08.14.1");
})();
