(function bootstrapClassroomExplorationsHub() {
  "use strict";

  var script = document.currentScript;
  if (!script) return;

  var mountId = script.getAttribute("data-mount") || "hrv-classroom-explorations-root";
  var mount = document.getElementById(mountId);
  if (!mount || mount.getAttribute("data-hrv-hub-bootstrap") === "started") return;

  var fallbackHtml = mount.innerHTML;
  var runtimeUrl = new URL(script.getAttribute("data-runtime") || "./assets/classroom-explorations-hub.js", script.src).href;
  var stylesheetUrl = new URL(script.getAttribute("data-stylesheet") || "./assets/classroom-explorations-hub.css", script.src).href;
  var manifestUrl = new URL(script.getAttribute("data-manifest") || "./hub.manifest.json", script.src).href;
  var layout = script.getAttribute("data-layout") === "contained" ? "contained" : "viewport";
  var manifestBlobUrl = null;

  mount.setAttribute("data-hrv-hub-bootstrap", "started");
  mount.setAttribute("aria-busy", "true");

  function loadStylesheet() {
    var selector = 'link[data-hrv-explorations-hub-styles="' + stylesheetUrl + '"]';
    var existing = document.querySelector(selector);
    if (existing && existing.sheet) return Promise.resolve();

    return new Promise(function (resolve, reject) {
      var stylesheet = existing || document.createElement("link");
      var timeout = window.setTimeout(function () {
        reject(new Error("Classroom Explorations Hub stylesheet timed out."));
      }, 8000);

      stylesheet.addEventListener("load", function () {
        window.clearTimeout(timeout);
        resolve();
      }, { once: true });
      stylesheet.addEventListener("error", function () {
        window.clearTimeout(timeout);
        reject(new Error("Classroom Explorations Hub stylesheet failed to load."));
      }, { once: true });

      if (!existing) {
        stylesheet.rel = "stylesheet";
        stylesheet.href = stylesheetUrl;
        stylesheet.setAttribute("data-hrv-explorations-hub-styles", stylesheetUrl);
        document.head.appendChild(stylesheet);
      }
    });
  }

  function preflightManifest() {
    var controller = new AbortController();
    var timeout = window.setTimeout(function () { controller.abort(); }, 8000);

    return fetch(manifestUrl, {
      credentials: "omit",
      cache: "no-cache",
      signal: controller.signal
    }).then(function (response) {
      if (!response.ok) throw new Error("Classroom Explorations Hub manifest request failed (" + response.status + ").");
      return response.json();
    }).then(function (manifest) {
      if (!manifest || manifest.schemaVersion !== "1.0") throw new Error("Unsupported Classroom Explorations Hub manifest schema.");
      if (!manifest.page || manifest.page.id !== "classroom-explorations-hub") throw new Error("Unexpected Classroom Explorations Hub manifest page id.");
      if (!Array.isArray(manifest.records) || !Array.isArray(manifest.schoolYears)) throw new Error("Classroom Explorations Hub manifest collections are missing.");

      var ids = Object.create(null);
      manifest.records.forEach(function (record) {
        if (!record || typeof record.id !== "string" || ids[record.id]) throw new Error("Classroom Explorations Hub manifest contains an invalid or duplicate record id.");
        ids[record.id] = true;
      });

      manifestBlobUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: "application/json" }));
      return manifestBlobUrl;
    }).finally(function () {
      window.clearTimeout(timeout);
    });
  }

  Promise.all([
    loadStylesheet(),
    import(runtimeUrl),
    preflightManifest()
  ]).then(function (parts) {
    var runtime = parts[1];
    var validatedManifestUrl = parts[2];
    if (typeof runtime.mountClassroomExplorationsHub !== "function") {
      throw new Error("Classroom Explorations Hub runtime export is missing.");
    }

    return runtime.mountClassroomExplorationsHub(mount, {
      manifestUrl: validatedManifestUrl,
      layout: layout
    }).ready;
  }).then(function () {
    mount.removeAttribute("aria-busy");
    mount.setAttribute("data-hrv-hub-bootstrap", "ready");
    if (manifestBlobUrl) URL.revokeObjectURL(manifestBlobUrl);
  }).catch(function (error) {
    if (manifestBlobUrl) URL.revokeObjectURL(manifestBlobUrl);
    mount.innerHTML = fallbackHtml;
    mount.removeAttribute("aria-busy");
    mount.setAttribute("data-hrv-hub-bootstrap", "failed");
    mount.setAttribute("data-hrv-hub-error", error && error.message ? error.message : "runtime-load-failed");
    var fallback = mount.querySelector("[data-hrv-native-fallback]");
    if (fallback) fallback.removeAttribute("hidden");
  });
})();
