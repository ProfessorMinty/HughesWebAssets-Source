/*
 * Hughes Room Views — permanent global site shell
 * Version: 2026.11.20.1
 *
 * Global responsibilities: shared effects preference and guarded sitewide scroll.
 * Page/application behavior does not belong here.
 */
(function () {
  "use strict";

  var VERSION = "2026.11.20.1";
  var EFFECTS_KEY = "hrv:effects:v1";
  var EFFECTS_EVENT = "hrv:effectschange";
  var prior = window.__HRV_SITE_SHELL__;
  if (prior && prior.version === VERSION) return;
  if (prior && typeof prior.destroy === "function") prior.destroy();

  var mode = "full";
  var control = null;
  var saveNotice = null;
  var scrollTimer = null;
  var destroyed = false;
  var visitorInteracted = false;
  var instance = { version: VERSION, destroy: destroy };
  window.__HRV_SITE_SHELL__ = instance;

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

  function validMode(value) {
    return value === "full" || value === "reduced";
  }

  function applyMode(next) {
    mode = validMode(next) ? next : "full";
    document.documentElement.setAttribute("data-hrv-effects", mode);
    if (control) control.setAttribute("aria-pressed", String(mode === "reduced"));
    window.dispatchEvent(new CustomEvent(EFFECTS_EVENT, {
      detail: { version: 1, mode: mode }
    }));
  }

  function readMode() {
    try {
      var value = window.localStorage.getItem(EFFECTS_KEY);
      return validMode(value) ? value : "full";
    } catch (_) {
      return "full";
    }
  }

  function toggleEffects() {
    visitorInteracted = true;
    var next = mode === "full" ? "reduced" : "full";
    applyMode(next);
    try {
      window.localStorage.setItem(EFFECTS_KEY, next);
      saveNotice.textContent = "";
      saveNotice.hidden = true;
    } catch (_) {
      saveNotice.textContent = "Your choice works on this page. This browser could not save it for next time.";
      saveNotice.hidden = false;
    }
  }

  function syncEffects(event) {
    try {
      if (event.storageArea && event.storageArea !== window.localStorage) return;
    } catch (_) { return; }
    if (event.key !== EFFECTS_KEY && event.key !== null) return;
    applyMode(event.key === null ? "full" : event.newValue);
  }

  function mountEffectsControl() {
    if (destroyed || isAdminOrCustomizerContext() || !document.body) return;
    var wrap = document.createElement("div");
    wrap.id = "hrv-effects-control";
    wrap.className = "hrv-shell-effects";
    control = document.createElement("button");
    control.type = "button";
    control.className = "hrv-shell-effects-toggle";
    control.textContent = "Reduced effects";
    control.setAttribute("aria-pressed", String(mode === "reduced"));
    control.setAttribute("aria-describedby", "hrv-effects-help");
    control.addEventListener("click", toggleEffects);
    var help = document.createElement("span");
    help.id = "hrv-effects-help";
    help.className = "hrv-shell-effects-help";
    help.textContent = "Reduce decorative movement and effects across Hughes Room Views.";
    saveNotice = document.createElement("span");
    saveNotice.className = "hrv-shell-effects-notice";
    saveNotice.setAttribute("role", "status");
    saveNotice.hidden = true;
    wrap.appendChild(control);
    wrap.appendChild(help);
    wrap.appendChild(saveNotice);
    // The preference is discoverable in the shared header, without floating over a lesson.
    var host = document.querySelector("[data-hrv-effects-control-host], .site-header, .header-area");
    if (host) host.appendChild(wrap);
    else document.body.insertBefore(wrap, document.body.firstChild);
  }

  function shouldSkipAutoScroll() {
    if (visitorInteracted) return true;
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
    if (destroyed || shouldSkipAutoScroll()) return;

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
      behavior: mode === "reduced" ? "instant" : "smooth"
    });
  }

  function onReady() {
    if (destroyed) return;
    mountEffectsControl();
    scrollTimer = window.setTimeout(autoScrollBelowHeader, DELAY_MS);
  }

  function noteInteraction() { visitorInteracted = true; }

  function destroy() {
    destroyed = true;
    window.clearTimeout(scrollTimer);
    document.removeEventListener("DOMContentLoaded", onReady);
    window.removeEventListener("storage", syncEffects);
    window.removeEventListener("pointerdown", noteInteraction);
    window.removeEventListener("keydown", noteInteraction);
    if (control) control.removeEventListener("click", toggleEffects);
    var wrap = document.getElementById("hrv-effects-control");
    if (wrap) wrap.remove();
    if (window.__HRV_SITE_SHELL__ === instance) delete window.__HRV_SITE_SHELL__;
  }

  // Full effects are the product default. An OS preference never changes this saved choice.
  applyMode(readMode());
  window.addEventListener("storage", syncEffects);
  window.addEventListener("pointerdown", noteInteraction, { passive: true });
  window.addEventListener("keydown", noteInteraction);
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", onReady, { once: true });
  } else {
    onReady();
  }

  document.documentElement.setAttribute("data-hrv-site-shell", VERSION);
})();
