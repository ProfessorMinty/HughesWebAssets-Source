(function () {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var mountId = script.getAttribute("data-mount") || "hrv-classroom-explorations-root";
  var pageId = script.getAttribute("data-page-id") || "hrv-page:classroom-explorations";
  var sourceUrl = script.getAttribute("data-source");
  var routesUrl = script.getAttribute("data-routes");
  var controlUrl = script.getAttribute("data-control");
  var runtimeUrl = script.getAttribute("data-runtime");
  var legacyStylesheetUrl = script.getAttribute("data-stylesheet");
  var stylesheetsValue = script.getAttribute("data-stylesheets") || "";
  var stylesheetUrls = stylesheetsValue
    .split("|")
    .map(function (url) { return url.trim(); })
    .filter(Boolean);
  if (!stylesheetUrls.length && legacyStylesheetUrl) {
    stylesheetUrls.push(legacyStylesheetUrl);
  }
  var hostStylesheetUrl = script.getAttribute("data-host-stylesheet");
  var sourceRef = script.getAttribute("data-source-ref") || "review";
  var releaseId = script.getAttribute("data-release") || sourceRef;
  var timeoutMs = Number(script.getAttribute("data-timeout") || 20000);
  var root = document.getElementById(mountId);

  if (!root || root.getAttribute("data-hrv-review-bootstrap") === "started") return;

  var preservedFallback = root.innerHTML;
  var timer = null;
  var settled = false;

  function dispatch(name, detail) {
    window.dispatchEvent(new CustomEvent(name, {
      detail: Object.assign({ pageId: pageId, release: releaseId }, detail || {})
    }));
  }

  function restoreFallback(error) {
    if (settled) return;
    settled = true;
    if (timer !== null) window.clearTimeout(timer);
    root.innerHTML = preservedFallback;
    root.removeAttribute("aria-busy");
    root.setAttribute("data-hrv-state", "unavailable");
    var notice = root.querySelector("[data-hrv-outage-notice]");
    if (notice) notice.hidden = false;
    console.error("[HRV Hub Review] Repository application failed to start.", error);
    dispatch("hrv:page-error", {
      code: error && error.code ? error.code : "HUB_REVIEW_BOOTSTRAP_FAILED",
      message: error && error.message ? error.message : "The Hub review runtime failed to start."
    });
  }

  function removeStaleReviewAssets() {
    document
      .querySelectorAll('link[data-hrv-review-style-group="app"]')
      .forEach(function (link) {
        if (link.getAttribute("data-hrv-review-release") !== releaseId) {
          link.remove();
        }
      });

    document
      .querySelectorAll('script[data-hrv-review-runtime]')
      .forEach(function (runtime) {
        if (runtime.getAttribute("data-hrv-review-release") !== releaseId) {
          runtime.remove();
        }
      });
  }

  function loadStylesheet(url, marker, group) {
    if (!url) return Promise.resolve();
    var selector = 'link[data-hrv-review-style="' + marker + '"]';
    var existing = document.querySelector(selector);
    if (existing) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet";
      link.href = url;
      link.crossOrigin = "anonymous";
      link.setAttribute("data-hrv-review-style", marker);
      link.setAttribute("data-hrv-review-style-group", group);
      link.setAttribute("data-hrv-review-release", releaseId);
      link.addEventListener("load", resolve, { once: true });
      link.addEventListener("error", function () {
        reject(new Error("Stylesheet failed to load: " + url));
      }, { once: true });
      document.head.appendChild(link);
    });
  }

  function loadStylesheets(urls) {
    if (!urls.length) {
      return Promise.reject(new Error("Missing Hub review stylesheet URLs."));
    }

    return Promise.all(
      urls.map(function (url, index) {
        return loadStylesheet(
          url,
          "app-" + releaseId + "-" + String(index),
          "app"
        );
      })
    );
  }

  function loadRuntime(url) {
    if (!url) return Promise.reject(new Error("Missing Hub review runtime URL."));

    var marker = "runtime-" + releaseId;
    var existing = document.querySelector(
      'script[data-hrv-review-runtime="' + marker + '"]'
    );
    if (existing && window.HRVClassroomExplorationsV2) {
      return Promise.resolve();
    }
    if (existing) existing.remove();

    return new Promise(function (resolve, reject) {
      var runtime = document.createElement("script");
      runtime.src = url;
      runtime.async = false;
      runtime.crossOrigin = "anonymous";
      runtime.setAttribute("data-hrv-review-runtime", marker);
      runtime.setAttribute("data-hrv-review-release", releaseId);
      runtime.addEventListener("load", function () {
        if (!window.HRVClassroomExplorationsV2) {
          reject(new Error("Hub review runtime loaded without registering its API."));
          return;
        }
        resolve();
      }, { once: true });
      runtime.addEventListener("error", function () {
        reject(new Error("Hub review runtime failed to load: " + url));
      }, { once: true });
      document.head.appendChild(runtime);
    });
  }

  function fetchJson(url, label) {
    if (!url) return Promise.reject(new Error("Missing " + label + " URL."));
    return fetch(url, {
      method: "GET",
      mode: "cors",
      crdentials: "omit",
      cache: "no-store",
      headers: { Accept: "application/json" }
    }).then(function (response) {
      if (!response.ok) {
        throw new Error(label + " request failed with HTTP " + response.status + ".");
      }
      return response.json();
    });
  }

  removeStaleReviewAssets();
  root.setAttribute("data-hrv-review-bootstrap", "started");
  root.setAttribute("data-hrv-state", "loading");
  root.setAttribute("data-hrv-review-release", releaseId);
  root.setAttribute("aria-busy", "true");
  var notice = root.querySelector("[data-hrv-outage-notice]");
  if (notice) notice.hidden = true;

  timer = window.setTimeout(function () {
    restoreFallback(new Error("Hub review startup timed out."));
  }, timeoutMs);

  Promise.all([
    loadStylesheet(hostStylesheetUrl, "host-" + releaseId, "host"),
    loadStylesheets(stylesheetUrls),
    loadRuntime(runtimeUrl),
    fetchJson(sourceUrl, "Hub authoring source"),
    fetchJson(routesUrl, "Hub route registry"),
    controlUrl ? fetchJson(controlUrl, "Hub control manifest") : Promise.resolve(null)
  ]).then(function (values) {
    if (settled) return;
    var source = values[3];
    var routes = values[4];
    var control = values[5];

    window.HRVClassroomExplorationsV2.mount(root, {
      source: source,
      routes: routes,
      control: control,
      sourceRef: sourceRef,
      hostPath: window.location.pathname
    });

    settled = true;
    if (timer !== null) window.clearTimeout(timer);
    root.removeAttribute("aria-busy");
  }).catch(restoreFallback);
})();