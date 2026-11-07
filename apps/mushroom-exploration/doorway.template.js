(function () {
  'use strict';
  var MOUNT_ID = 'hrv-mushroom-exploration-root';
  var BOOTSTRAP_URL = '__BOOTSTRAP_URL__';
  var BOOTSTRAP_SHA256 = '__BOOTSTRAP_SHA256__';
  var RELEASE_ROOT = '__RELEASE_ROOT__';
  var RELEASE_SHA256 = '__RELEASE_SHA256__';
  var RELEASE_VERSION = '__RELEASE_VERSION__';
  function install() {
    var root = document.getElementById(MOUNT_ID);
    if (!root) {
      var hosts = document.querySelectorAll('article.page .entry-content');
      if (hosts.length !== 1) return;
      root = document.createElement('div'); root.id = MOUNT_ID;
      root.setAttribute('role', 'region'); root.setAttribute('aria-label', 'Our classroom mushroom-growing story'); hosts[0].prepend(root);
    }
    if (root.getAttribute('data-mushroom-doorway') === 'started' || root.getAttribute('data-hrv-state') === 'ready') return;
    if (!document.getElementById('hrv-mushroom-fallback-style')) {
      var style = document.createElement('style'); style.id = 'hrv-mushroom-fallback-style';
      style.textContent = '#'+MOUNT_ID+':not([data-hrv-state="ready"]){box-sizing:border-box;padding:28px;background:#183b31;color:#fff1cf;border:1px solid #859765;border-radius:6px;font:18px/1.6 system-ui,sans-serif;}#'+MOUNT_ID+' .hrv-mushroom-retry{min-height:48px;margin-top:16px;padding:10px 20px;border:1px solid #e8c481;border-radius:4px;background:#e8c481;color:#183b31;font:inherit;cursor:pointer;}';
      document.head.appendChild(style);
    }
    var settled = false, timer, bootstrap, blobURL, abort = new AbortController();
    function cleanup() { clearTimeout(timer); window.removeEventListener('hrv:mushrooms-ready', ready); window.removeEventListener('hrv:mushrooms-error', failed); if(blobURL){URL.revokeObjectURL(blobURL);blobURL=null;} }
    function matches(event) { return event.detail?.pageId === 'hrv-page:mushrooms-2026-2027'; }
    function ready(event) { if (!matches(event) || settled) return; settled = true; cleanup(); }
    function showFallback() {
      root.setAttribute('data-hrv-state','unavailable'); root.removeAttribute('data-mushroom-doorway'); root.removeAttribute('data-mushroom-bootstrap');
      var title = document.createElement('h2'); title.textContent = 'Our mushroom story is taking a little rest.';
      var copy = document.createElement('p'); copy.textContent = 'Please try opening our growing story again in a moment.';
      var retry = document.createElement('button'); retry.type = 'button'; retry.className = 'hrv-mushroom-retry'; retry.textContent = 'Try again'; retry.addEventListener('click',install,{once:true});
      root.replaceChildren(title,copy,retry);
    }
    function failed(event) { if (event && !matches(event) || settled) return; settled = true; abort.abort(); cleanup(); bootstrap?.remove(); showFallback(); }
    root.setAttribute('data-mushroom-doorway','started'); root.setAttribute('data-hrv-state','loading');
    var loading = document.createElement('p'); loading.textContent = 'Opening our classroom growing story…'; root.replaceChildren(loading);
    window.addEventListener('hrv:mushrooms-ready',ready); window.addEventListener('hrv:mushrooms-error',failed);
    timer = setTimeout(function(){failed();},25000);
    async function open() {
      var response=await fetch(BOOTSTRAP_URL,{credentials:'omit',redirect:'error',signal:abort.signal,cache:'force-cache'});
      if(!response.ok||!response.body)throw new Error('Bootstrap unavailable');
      var reader=response.body.getReader(),chunks=[],size=0;
      try{while(true){var part=await reader.read();if(part.done)break;size+=part.value.length;if(size>30000){await reader.cancel();throw new Error('Bootstrap too large');}chunks.push(part.value);}}finally{reader.releaseLock();}
      var bytes=new Uint8Array(size),offset=0;chunks.forEach(function(part){bytes.set(part,offset);offset+=part.length;});
      var digest=Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256',bytes)),function(b){return b.toString(16).padStart(2,'0');}).join('');
      if(digest!==BOOTSTRAP_SHA256)throw new Error('Bootstrap integrity failure');
      if(settled)return;
      blobURL=URL.createObjectURL(new Blob([bytes],{type:'text/javascript'}));
      bootstrap = document.createElement('script'); bootstrap.src = blobURL;
      bootstrap.setAttribute('data-mount',MOUNT_ID); bootstrap.setAttribute('data-release-root',RELEASE_ROOT); bootstrap.setAttribute('data-release-sha256',RELEASE_SHA256); bootstrap.setAttribute('data-release-version',RELEASE_VERSION);
      bootstrap.addEventListener('error',function(){failed();},{once:true});document.head.appendChild(bootstrap);
    }
    open().catch(function(){failed();});
  }
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',install,{once:true});else install();
})();
