(function () {
  'use strict';
  var studioOrigin = 'https://lanternworks.nlightlabs.com';
  var production = 'https://cdn.nlightlabs.com/hrv/hub-preview/';
  function start() {
    var mount = document.getElementById('lanternworks-hub-preview');
    if (location.origin !== 'https://rmhughes.edublogs.org' ||
        location.pathname !== '/lanternworks-hub-preview/' || window.top !== window ||
        !mount || !document.body.classList.contains('logged-in') || !window.opener ||
        mount.dataset.lanternworksPreviewStarted) return;
    mount.dataset.lanternworksPreviewStarted = 'true';
    var opener = window.opener;
    window.addEventListener('message', function activate(event) {
      if (event.origin !== studioOrigin || event.source !== opener || !event.data || event.data.type !== 'ping') return;
      window.removeEventListener('message', activate);
      load().catch(function () { /* Keep the installed unavailable notice. */ });
    });
    async function load() {
      var response = await fetch(production + 'current.json', {
        credentials: 'omit', cache: 'no-store', redirect: 'error', signal: AbortSignal.timeout(12000)
      });
      if (response.status !== 200 || !response.body ||
          !/^application\/json(?:\s*;|$)/i.test(response.headers.get('content-type') || '')) return;
      var reader = response.body.getReader(), length = 0, text = '', decoder = new TextDecoder('utf-8', {fatal:true});
      try {
        for (;;) {
          var part = await reader.read();
          if (part.done) break;
          length += part.value.byteLength;
          if (length > 1024) { await reader.cancel(); return; }
          text += decoder.decode(part.value, {stream:true});
        }
        text += decoder.decode();
      } finally { reader.releaseLock(); }
      var selected = JSON.parse(text);
      if (!selected || typeof selected !== 'object' || Array.isArray(selected) ||
          Object.keys(selected).length !== 2 || selected.schemaVersion !== 1 ||
          typeof selected.sha256 !== 'string' || !/^[a-f0-9]{64}$/.test(selected.sha256)) return;
      var script = document.createElement('script');
      script.crossOrigin = 'anonymous';
      script.integrity = 'sha256-' + btoa(String.fromCharCode.apply(null,
        selected.sha256.match(/../g).map(function (byte) { return parseInt(byte,16); })));
      script.src = production + 'releases/' + selected.sha256 + '/bridge.js';
      document.head.appendChild(script);
    }
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', start, {once:true});
  else start();
})();
