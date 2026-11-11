(function () {
  'use strict';
  var script = document.currentScript;
  if (!script) return;
  var root = document.getElementById(script.getAttribute('data-mount') || 'hrv-mushroom-exploration-root');
  if (!root || root.getAttribute('data-mushroom-bootstrap') === 'started') return;
  root.setAttribute('data-mushroom-bootstrap', 'started');
  var original = root.innerHTML, abort = new AbortController(), styles = [], controller, objectURL;
  var settled = false, deadline = setTimeout(function () { fail(new Error('Startup timed out')); }, 20000);
  var base = new URL('./', script.src), manifestURL = new URL('../release.json', script.src);
  var expectedHash = script.getAttribute('data-release-sha256');
  var version = script.getAttribute('data-release-version');
  function notify(name) { window.dispatchEvent(new CustomEvent(name, { detail:{ pageId:'hrv-page:mushrooms-2026-2027' } })); }
  function fail() {
    if (settled) return;
    settled = true; clearTimeout(deadline); abort.abort(); controller?.destroy();
    styles.forEach(function (style) { style.remove(); });
    if (objectURL) URL.revokeObjectURL(objectURL);
    root.innerHTML = original; root.setAttribute('data-hrv-state', 'unavailable'); root.removeAttribute('data-mushroom-bootstrap');
    notify('hrv:mushrooms-error');
  }
  function sha256(bytes) { return crypto.subtle.digest('SHA-256', bytes).then(function (digest) { return Array.from(new Uint8Array(digest), function (byte) { return byte.toString(16).padStart(2, '0'); }).join(''); }); }
  async function bytes(url, maximum) {
    var response = await fetch(url, { credentials:'omit', redirect:'error', signal:abort.signal, cache:'force-cache' });
    if (!response.ok || !response.body) throw new Error('Release file unavailable');
    var reader = response.body.getReader(), size = 0, chunks = [];
    try {
      while (true) {
        var part = await reader.read(); if (part.done) break;
        size += part.value.byteLength; if (size > maximum) { await reader.cancel(); throw new Error('Release file exceeds its bound'); }
        chunks.push(part.value);
      }
    } finally { reader.releaseLock(); }
    var result = new Uint8Array(size), offset = 0;
    chunks.forEach(function (part) { result.set(part, offset); offset += part.byteLength; }); return result;
  }
  function pathSafe(path) { return typeof path === 'string' && /^[a-zA-Z0-9_./-]+$/.test(path) && !path.startsWith('/') && !path.split('/').some(function (part) { return !part || part === '.' || part === '..'; }); }
  async function start() {
    if (base.protocol !== 'https:' || !/^[a-f0-9]{64}$/.test(expectedHash || '') || !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(version || '')) throw new Error('Release pin required');
    var manifestBytes = await bytes(manifestURL.href, 100000);
    if (await sha256(manifestBytes) !== expectedHash) throw new Error('Release manifest integrity failure');
    var text = new TextDecoder('utf-8', { fatal:true });
    var manifest = JSON.parse(text.decode(manifestBytes));
    if (manifest.schemaVersion !== '1.0.0' || manifest.application !== 'hrv-page:mushrooms-2026-2027' || manifest.version !== version || !Array.isArray(manifest.files) || manifest.files.length > 80) throw new Error('Release manifest mismatch');
    var paths = new Set(), total = 0;
    manifest.files.forEach(function (file) {
      if (!pathSafe(file.path) || paths.has(file.path) || !/^[a-f0-9]{64}$/.test(file.sha256) || !Number.isSafeInteger(file.bytes) || file.bytes < 1 || file.bytes > 20000000) throw new Error('Invalid release file');
      paths.add(file.path); total += file.bytes;
    });
    if (total > 32000000 || !['runtime.js','exhibit.css','host-compat.css','mushrooms.source.json'].every(function (name) { return paths.has('src/' + name); })) throw new Error('Release entries missing');
    var verified = new Map();
    await Promise.all(manifest.files.map(async function (file) {
      var data = await bytes(new URL('../' + file.path, script.src).href, file.bytes);
      if (data.byteLength !== file.bytes || await sha256(data) !== file.sha256) throw new Error('Release asset integrity failure');
      verified.set(file.path, data);
    }));
    if (settled) return;
    var source = JSON.parse(text.decode(verified.get('src/mushrooms.source.json')));
    if (source.data?.meta?.state !== 'review-ready' || source.data?.meta?.researchStatus !== 'reviewed') throw new Error('Unreviewed release source');
    objectURL = URL.createObjectURL(new Blob([verified.get('src/runtime.js')], { type:'text/javascript' }));
    var runtime = await import(objectURL);
    if (settled) return;
    runtime.configureMushroomReleaseAssetBase(new URL('runtime.js', base).href);
    ['exhibit.css', 'host-compat.css'].forEach(function (name) {
      var style = document.createElement('style'); style.setAttribute('data-hrv-mushrooms-style', name);
      style.textContent = text.decode(verified.get('src/' + name)).replaceAll('./assets/', new URL('assets/', base).href);
      document.head.appendChild(style); styles.push(style);
    });
    controller = runtime.mountMushroomExhibit(root, source, { allowDraft:false });
    if (settled) { controller.destroy(); return; }
    settled = true; clearTimeout(deadline); URL.revokeObjectURL(objectURL); objectURL = null;
    notify('hrv:mushrooms-ready');
  }
  start().catch(fail);
})();
