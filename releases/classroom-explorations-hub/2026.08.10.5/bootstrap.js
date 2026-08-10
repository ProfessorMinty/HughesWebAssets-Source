(function bootstrapClassroomExplorationsHub() {
  "use strict";

  var VERSION = "0.2.0";
  var KEY = "__HRV_CLASSROOM_EXPLORATIONS_BOOTSTRAP__";
  var EXPECTED_SYSTEM = "classroom-explorations-hub";
  var EXPECTED_SCHEMA = "1.0";
  var script = document.currentScript;

  if (!script) {
    console.error("[HRV HUB BOOTSTRAP] document.currentScript is unavailable; enhancement refused.");
    return;
  }

  var mountId = script.getAttribute("data-mount") || "hrv-classroom-explorations-root";
  var routeId = script.getAttribute("data-route") || "classroom-explorations";
  var expectedPath = script.getAttribute("data-path") || "/classroom-explorations/";
  var releaseUrl = script.getAttribute("data-release-manifest") || "";
  var layout = script.getAttribute("data-layout") === "contained" ? "contained" : "viewport";
  var timeoutMs = Number(script.getAttribute("data-timeout") || 12000);
  var mount = document.getElementById(mountId);
  var manifestBlobUrl = null;

  function log(level, message, detail) {
    var method = console[level] || console.log;
    method.call(console, "[HRV HUB BOOTSTRAP] " + message, detail || "");
  }

  function status(message, kind) {
    if (!mount) return;
    var node = mount.querySelector("[data-hrv-native-status]");
    if (!node) return;
    node.textContent = message;
    node.setAttribute("data-state", kind || "info");
  }

  function fail(code, message, error) {
    if (manifestBlobUrl) {
      URL.revokeObjectURL(manifestBlobUrl);
      manifestBlobUrl = null;
    }
    document.documentElement.classList.remove("hrv-route-classroom-explorations-ready");
    if (mount) {
      mount.removeAttribute("aria-busy");
      mount.setAttribute("data-hrv-state", "failed");
      mount.setAttribute("data-hrv-failure", code);
      mount.setAttribute("data-hrv-hub-bootstrap", "failed");
      mount.setAttribute("data-hrv-hub-error", error && error.message ? error.message : code);
      status(message, "failed");
    }
    log("error", code + ": " + message, error || "");
  }

  function fetchJson(url, label) {
    var controller = new AbortController();
    var timer = window.setTimeout(function () { controller.abort(); }, timeoutMs);
    return fetch(url, {
      credentials: "omit",
      cache: "no-store",
      signal: controller.signal
    }).then(function (response) {
      if (!response.ok) throw new Error(label + " returned HTTP " + response.status);
      return response.json();
    }).finally(function () {
      window.clearTimeout(timer);
    });
  }

  function resolveReleaseAsset(releaseBase, asset, label) {
    if (!asset || typeof asset.path !== "string" || !asset.path) {
      throw new Error("Release manifest is missing " + label + " path.");
    }
    var url = new URL(asset.path, releaseBase).href;
    if (!/^https:\/\//i.test(url)) throw new Error(label + " must resolve to HTTPS.");
    return url;
  }

  function loadStyle(url, marker) {
    return new Promise(function (resolve, reject) {
      var selector = 'link[data-hrv-repository-style="' + marker + '"]';
      var existing = document.querySelector(selector);
      if (existing && existing.href === url && existing.sheet) {
        resolve(existing);
        return;
      }

      var link = document.createElement("link");
      var timer = window.setTimeout(function () {
        reject(new Error(marker + " stylesheet timed out."));
      }, timeoutMs);
      link.rel = "stylesheet";
      link.href = url;
      link.setAttribute("data-hrv-repository-style", marker);
      link.addEventListener("load", function () {
        window.clearTimeout(timer);
        resolve(link);
      }, { once: true });
      link.addEventListener("error", function () {
        window.clearTimeout(timer);
        reject(new Error(marker + " stylesheet failed to load: " + url));
      }, { once: true });
      document.head.appendChild(link);
    });
  }

  function validateContentManifest(manifest) {
    if (!manifest || manifest.schemaVersion !== EXPECTED_SCHEMA) throw new Error("Unsupported Hub content schema.");
    if (!manifest.page || manifest.page.id !== EXPECTED_SYSTEM) throw new Error("Unexpected Hub content page id.");
    if (!manifest.page.museum) throw new Error("Hub museum identity contract is missing.");
    if (!Array.isArray(manifest.records) || !Array.isArray(manifest.schoolYears)) throw new Error("Hub content collections are missing.");

    var ids = Object.create(null);
    manifest.records.forEach(function (record) {
      if (!record || typeof record.id !== "string" || ids[record.id]) {
        throw new Error("Hub content contains an invalid or duplicate record id.");
      }
      ids[record.id] = true;
    });
  }

  function scheduleAutoScroll() {
    window.setTimeout(function () {
      if (window.location.hash) return;
      if (window.location.href.indexOf("customize.php") !== -1) return;
      if (document.body && document.body.classList.contains("wp-admin")) return;
      if (window.scrollY > 40) return;
      if (!mount) return;

      var offset = 12;
      var adminBar = document.getElementById("wpadminbar");
      if (adminBar && window.getComputedStyle(adminBar).position === "fixed") {
        offset += adminBar.offsetHeight || 0;
      }

      var targetY = window.scrollY + mount.getBoundingClientRect().top - offset;
      if (targetY <= 40) return;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth"
      });
    }, 700);
  }

  if (!mount) {
    log("error", "Mount root not found.", mountId);
    return;
  }

  if (window[KEY]) {
    mount.setAttribute("data-hrv-duplicate-bootstrap", "ignored");
    log("warn", "Duplicate bootstrap ignored.");
    return;
  }
  window[KEY] = { version: VERSION, startedAt: Date.now(), routeId: routeId };

  var currentPath = new URL(window.location.href).pathname;
  if (currentPath !== expectedPath) {
    fail("route-mismatch", "The enhanced museum did not start because this is not its approved route.");
    return;
  }

  if (mount.getAttribute("data-hrv-page") !== routeId ||
      mount.getAttribute("data-hrv-page-system") !== EXPECTED_SYSTEM ||
      mount.getAttribute("data-hrv-schema") !== EXPECTED_SCHEMA) {
    fail("contract-mismatch", "The native route shell does not match the Classroom Explorations contract.");
    return;
  }

  if (!mount.querySelector("[data-hrv-fallback]")) {
    fail("fallback-missing", "The required readable museum fallback is missing, so enhancement was refused.");
    return;
  }

  if (!releaseUrl) {
    fail("release-url-missing", "The immutable Hub release address is missing.");
    return;
  }

  mount.setAttribute("aria-busy", "true");
  mount.setAttribute("data-hrv-state", "checking");
  mount.setAttribute("data-hrv-hub-bootstrap", "checking");
  status("Checking the immutable Classroom Explorations release…");

  fetchJson(releaseUrl, "Release manifest")
    .then(function (release) {
      if (!release || release.schemaVersion !== EXPECTED_SCHEMA || release.pageSystem !== EXPECTED_SYSTEM) {
        throw new Error("Unsupported or incorrect Hub release manifest.");
      }
      if (release.minimumBootstrapVersion && release.minimumBootstrapVersion !== VERSION) {
        throw new Error("Hub release requires bootstrap " + release.minimumBootstrapVersion + "; loaded " + VERSION + ".");
      }
      if (!release.deploymentReady) throw new Error("Hub release is not marked deploymentReady.");
      if (!release.route ||
          release.route.id !== routeId ||
          release.route.path !== expectedPath ||
          release.route.mount !== mountId ||
          release.route.pageSystem !== EXPECTED_SYSTEM ||
          release.route.schemaVersion !== EXPECTED_SCHEMA) {
        throw new Error("Hub release route contract does not match the Edublogs shell.");
      }
      if (!release.assets) throw new Error("Hub release asset map is missing.");

      var releaseBase = new URL("./", releaseUrl).href;
      var compatStyleUrl = resolveReleaseAsset(releaseBase, release.assets.compatStyle, "host compatibility stylesheet");
      var styleUrl = resolveReleaseAsset(releaseBase, release.assets.style, "museum stylesheet");
      var runtimeUrl = resolveReleaseAsset(releaseBase, release.assets.script, "runtime");
      var contentUrl = resolveReleaseAsset(releaseBase, release.assets.content, "content manifest");

      mount.setAttribute("data-hrv-release", release.release);
      mount.setAttribute("data-hrv-source-commit", release.sourceCommit || "unknown");
      mount.setAttribute("data-hrv-state", "loading-assets");
      mount.setAttribute("data-hrv-hub-bootstrap", "loading-assets");
      status("Opening the Classroom Explorations museum…");

      return Promise.all([
        loadStyle(compatStyleUrl, "classroom-explorations-host-compat"),
        loadStyle(styleUrl, "classroom-explorations-hub"),
        import(runtimeUrl),
        fetchJson(contentUrl, "Hub content manifest")
      ]).then(function (parts) {
        var runtime = parts[2];
        var manifest = parts[3];
        validateContentManifest(manifest);
        return { release: release, runtime: runtime, manifest: manifest };
      });
    })
    .then(function (bundle) {
      if (!bundle.runtime || typeof bundle.runtime.mountClassroomExplorationsHub !== "function") {
        throw new Error("Hub renderer entry point is unavailable.");
      }

      manifestBlobUrl = URL.createObjectURL(new Blob([JSON.stringify(bundle.manifest)], { type: "application/json" }));
      mount.setAttribute("data-hrv-state", "mounting");
      mount.setAttribute("data-hrv-hub-bootstrap", "mounting");

      return bundle.runtime.mountClassroomExplorationsHub(mount, {
        manifestUrl: manifestBlobUrl,
        layout: layout
      }).ready;
    })
    .then(function () {
      if (manifestBlobUrl) {
        URL.revokeObjectURL(manifestBlobUrl);
        manifestBlobUrl = null;
      }
      mount.removeAttribute("aria-busy");
      mount.setAttribute("data-hrv-state", "ready");
      mount.setAttribute("data-hrv-hub-bootstrap", "ready");
      document.documentElement.classList.add("hrv-route-classroom-explorations-ready");
      status("Classroom Explorations museum loaded.", "ready");
      scheduleAutoScroll();
      log("info", "Classroom Explorations museum ready.", {
        release: mount.getAttribute("data-hrv-release"),
        sourceCommit: mount.getAttribute("data-hrv-source-commit")
      });
    })
    .catch(function (error) {
      fail("enhancement-failed", "The enhanced museum is unavailable. The readable Classroom Explorations fallback remains on this page.", error);
    });
})();
