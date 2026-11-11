(function () {
  "use strict";
  var script = document.currentScript;
  if (!script) return;
  var root = document.getElementById(script.getAttribute("data-mount") || "hrv-mushroom-exploration-root");
  if (!root || root.getAttribute("data-mushroom-bootstrap") === "started") return;
  root.setAttribute("data-mushroom-bootstrap", "started");
  var before = root.innerHTML;
  var styles = [];
  var runtimeController;
  var startupExpired = false;
  var fetchController = new AbortController();
  function fail() {
    startupExpired = true;
    fetchController.abort();
    if (runtimeController) runtimeController.destroy();
    styles.forEach(function (link) { link.remove(); });
    root.innerHTML = before;
    root.setAttribute("data-hrv-state", "unavailable");
    root.removeAttribute("data-mushroom-bootstrap");
  }
  var deadline = setTimeout(fail, 12000);
  function loadStyle(name) {
    return new Promise(function (resolve, reject) {
      var link = document.createElement("link");
      link.rel = "stylesheet"; link.href = new URL(name, script.src).href;
      styles.push(link); link.onload = resolve; link.onerror = reject;
      document.head.appendChild(link);
    });
  }
  var sourceUrl = new URL("../source/mushrooms.source.json", script.src);
  if (sourceUrl.protocol !== "https:") { clearTimeout(deadline); fail(); return; }
  Promise.all([
    fetch(sourceUrl.href, { credentials: "omit", redirect: "error", signal: fetchController.signal }).then(async function (response) {
      if (!response.ok) throw new Error("Mushroom source unavailable");
      var reader = response.body && response.body.getReader();
      if (!reader) throw new Error("Mushroom source is empty");
      var bytes = 0, text = "", decoder = new TextDecoder("utf-8", { fatal: true });
      try {
        while (true) {
          var chunk = await reader.read();
          if (chunk.done) break;
          bytes += chunk.value.byteLength;
          if (bytes > 200000) { await reader.cancel(); throw new Error("Mushroom source exceeds its bound"); }
          text += decoder.decode(chunk.value, { stream: true });
        }
        text += decoder.decode();
      } finally { reader.releaseLock(); }
      return JSON.parse(text);
    }),
    import(new URL("./runtime.js", script.src).href),
    loadStyle("./exhibit.css"), loadStyle("./host-compat.css")
  ]).then(function (results) {
    if (startupExpired) return;
    // The Edublogs entry point never permits draft science.
    runtimeController = results[1].mountMushroomExhibit(root, results[0], { allowDraft: false });
    clearTimeout(deadline);
  }).catch(function () { clearTimeout(deadline); fail(); });
})();
