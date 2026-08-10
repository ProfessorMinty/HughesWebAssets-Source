/* Hughes Room Views · Classroom Explorations Hub · Edublogs JavaScript tab
   Tiny page-local loader only. The repository owns the actual museum. */
(() => {
  'use strict';

  const KEY = '__HRV_CLASSROOM_EXPLORATIONS_PAGE_LOADER__';
  const VERSION = 'page-local-0.3.0';
  const ROOT_ID = 'hrv-classroom-explorations-root';
  const PAGE_ID = 'classroom-explorations';
  const PAGE_SYSTEM = 'classroom-explorations-hub';
  const EXPECTED_PATH = '/classroom-explorations/';
  const EXPECTED_RELEASE = '2026.08.10.6';
  const RELEASE_MANIFEST = 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@f440b1fcff21f59a19fbd4375f526190863108f5/releases/classroom-explorations-hub/2026.08.10.6/release.json';
  const TIMEOUT_MS = 12000;
  const STYLE_MARKER = 'data-hrv-classroom-explorations-style';

  function ready(callback) {
    if (document.readyState === 'loading') {
      document.addEventListener('DOMContentLoaded', callback, { once: true });
    } else {
      callback();
    }
  }

  function status(root, message, state = 'info') {
    const node = root.querySelector('[data-hrv-native-status]');
    if (!node) return;
    node.textContent = message;
    node.dataset.state = state;
  }

  async function fetchJson(url, label) {
    const controller = new AbortController();
    const timer = window.setTimeout(() => controller.abort(), TIMEOUT_MS);
    try {
      const response = await fetch(url, {
        credentials: 'omit',
        cache: 'no-store',
        signal: controller.signal
      });
      if (!response.ok) throw new Error(`${label} returned HTTP ${response.status}`);
      return await response.json();
    } finally {
      window.clearTimeout(timer);
    }
  }

  function resolveReleaseAsset(releaseBase, asset, label) {
    if (!asset || typeof asset.path !== 'string' || !asset.path) {
      throw new Error(`Release manifest is missing ${label} path.`);
    }
    const url = new URL(asset.path, releaseBase).href;
    if (!/^https:\/\//i.test(url)) throw new Error(`${label} must resolve to HTTPS.`);
    return url;
  }

  function loadStyle(url, role) {
    return new Promise((resolve, reject) => {
      const selector = `link[${STYLE_MARKER}="${role}"]`;
      const existing = document.querySelector(selector);
      if (existing && existing.href === url && existing.sheet) {
        resolve(existing);
        return;
      }

      const link = document.createElement('link');
      const timer = window.setTimeout(() => {
        reject(new Error(`${role} stylesheet timed out.`));
      }, TIMEOUT_MS);

      link.rel = 'stylesheet';
      link.href = url;
      link.setAttribute(STYLE_MARKER, role);
      link.addEventListener('load', () => {
        window.clearTimeout(timer);
        resolve(link);
      }, { once: true });
      link.addEventListener('error', () => {
        window.clearTimeout(timer);
        reject(new Error(`${role} stylesheet failed: ${url}`));
      }, { once: true });
      document.head.appendChild(link);
    });
  }

  function removeInjectedStyles() {
    document.querySelectorAll(`link[${STYLE_MARKER}]`).forEach((link) => link.remove());
  }

  function validateContentManifest(manifest) {
    if (!manifest || manifest.schemaVersion !== '1.0') throw new Error('Unsupported Hub content schema.');
    if (!manifest.page || manifest.page.id !== PAGE_SYSTEM) throw new Error('Unexpected Hub content page id.');
    if (!manifest.page.museum) throw new Error('Hub museum identity contract is missing.');
    if (!Array.isArray(manifest.records) || !Array.isArray(manifest.schoolYears)) {
      throw new Error('Hub content collections are missing.');
    }

    const ids = new Set();
    manifest.records.forEach((record) => {
      if (!record || typeof record.id !== 'string' || ids.has(record.id)) {
        throw new Error('Hub content contains an invalid or duplicate record id.');
      }
      ids.add(record.id);
    });
  }

  function describeNode(node) {
    if (!(node instanceof Element)) return null;
    const rect = node.getBoundingClientRect();
    return {
      tag: node.tagName.toLowerCase(),
      id: node.id || '',
      classes: [...node.classList].slice(0, 10).join(' '),
      role: node.getAttribute('role') || '',
      page: node.getAttribute('data-hrv-page') || '',
      pageSystem: node.getAttribute('data-hrv-page-system') || '',
      left: Math.round(rect.left * 10) / 10,
      right: Math.round(rect.right * 10) / 10,
      width: Math.round(rect.width * 10) / 10,
      text: (node.textContent || '').replace(/\s+/g, ' ').trim().slice(0, 120)
    };
  }

  function inspectMotion(root, selector) {
    const node = root.querySelector(selector);
    if (!node) return { selector, state: 'missing' };
    const style = getComputedStyle(node);
    return {
      selector,
      animationName: style.animationName,
      animationDuration: style.animationDuration,
      animationIterationCount: style.animationIterationCount,
      animationPlayState: style.animationPlayState,
      transform: style.transform
    };
  }

  function collectIntegrationDiagnostics(root, release) {
    const scrolling = document.scrollingElement || document.documentElement;
    const clientWidth = scrolling.clientWidth;
    const scrollWidth = scrolling.scrollWidth;
    const overflow = [];

    document.body.querySelectorAll('*').forEach((node) => {
      const rect = node.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      if (rect.left < -1 || rect.right > clientWidth + 1) overflow.push(describeNode(node));
    });

    const ancestry = [];
    let current = root;
    for (let depth = 0; current && depth < 8; depth += 1, current = current.parentElement) {
      ancestry.push({
        depth,
        node: describeNode(current),
        nextSibling: describeNode(current.nextElementSibling),
        previousSibling: describeNode(current.previousElementSibling)
      });
    }

    const motion = {
      reducedMotion: Boolean(window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches),
      floatingIcon: inspectMotion(root, '.pi'),
      compass: inspectMotion(root, '.hero-badge'),
      beam: inspectMotion(root, '.beam'),
      aurora: inspectMotion(root, '.aurora'),
      greenhouseRing: inspectMotion(root, '.zinnia-visual .ring.one'),
      lantern: inspectMotion(root, '.lantern-orb')
    };

    const report = {
      version: 1,
      loaderVersion: VERSION,
      release: release?.release || '',
      sourceCommit: release?.sourceCommit || '',
      viewport: {
        innerWidth: window.innerWidth,
        clientWidth,
        scrollWidth,
        overflowDelta: scrollWidth - clientWidth
      },
      overflowElements: overflow.slice(0, 80),
      mountAncestry: ancestry,
      motion
    };

    window.__HRV_CLASSROOM_EXPLORATIONS_DIAGNOSTICS__ = report;
    console.groupCollapsed('[HRV HUB] Classroom Explorations integration diagnostics');
    console.log('Release', { release: report.release, sourceCommit: report.sourceCommit, loaderVersion: VERSION });
    console.log('Viewport', report.viewport);
    console.log('Motion', report.motion);
    console.table(report.overflowElements);
    console.log('Mount ancestry and adjacent siblings', report.mountAncestry);
    console.log('Full report: window.__HRV_CLASSROOM_EXPLORATIONS_DIAGNOSTICS__');
    console.groupEnd();
  }

  function scheduleIntegrationDiagnostics(root, release) {
    requestAnimationFrame(() => {
      requestAnimationFrame(() => collectIntegrationDiagnostics(root, release));
    });
  }

  function scheduleAutoScroll(root) {
    window.setTimeout(() => {
      if (window.location.hash) return;
      if (window.location.href.includes('customize.php')) return;
      if (document.body && document.body.classList.contains('wp-admin')) return;
      if (window.scrollY > 40) return;

      let offset = 12;
      const adminBar = document.getElementById('wpadminbar');
      if (adminBar && getComputedStyle(adminBar).position === 'fixed') {
        offset += adminBar.offsetHeight || 0;
      }

      const targetY = window.scrollY + root.getBoundingClientRect().top - offset;
      if (targetY <= 40) return;
      window.scrollTo({
        top: Math.max(0, targetY),
        behavior: window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
      });
    }, 700);
  }

  ready(async () => {
    const root = document.getElementById(ROOT_ID);
    if (!root) return;

    if (window[KEY]) {
      root.dataset.hrvDuplicateLoader = 'ignored';
      console.warn('[HRV HUB] Duplicate page-local loader ignored.');
      return;
    }
    window[KEY] = { version: VERSION, startedAt: Date.now() };

    const nativeSnapshot = root.innerHTML;
    const nativeClassName = root.className;
    let manifestBlobUrl = null;

    function restoreNative(error, message) {
      if (manifestBlobUrl) {
        URL.revokeObjectURL(manifestBlobUrl);
        manifestBlobUrl = null;
      }
      removeInjectedStyles();
      document.documentElement.classList.remove('hrv-route-classroom-explorations-ready');
      root.className = nativeClassName;
      root.innerHTML = nativeSnapshot;
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'failed';
      root.dataset.hrvFailure = error?.message || 'enhancement-failed';
      status(root, message, 'failed');
      console.error('[HRV HUB] Enhancement failed; native fallback restored.', error);
    }

    const currentPath = new URL(window.location.href).pathname;
    if (currentPath !== EXPECTED_PATH) {
      root.dataset.hrvState = 'route-mismatch';
      status(root, 'The enhanced museum was not started because this is not its approved route.', 'failed');
      console.error('[HRV HUB] Route mismatch.', { currentPath, expectedPath: EXPECTED_PATH });
      return;
    }

    if (
      root.dataset.hrvPage !== PAGE_ID ||
      root.dataset.hrvPageSystem !== PAGE_SYSTEM ||
      root.dataset.hrvSchema !== '1.0' ||
      !root.querySelector('[data-hrv-fallback]')
    ) {
      root.dataset.hrvState = 'contract-mismatch';
      status(root, 'The Hub enhancement was refused because the semantic page contract is incomplete.', 'failed');
      console.error('[HRV HUB] Semantic mount contract mismatch.');
      return;
    }

    root.setAttribute('aria-busy', 'true');
    root.dataset.hrvState = 'checking';
    status(root, 'Checking the pinned Classroom Explorations release…');

    try {
      const release = await fetchJson(RELEASE_MANIFEST, 'Hub release manifest');
      if (
        release.schemaVersion !== '1.0' ||
        release.release !== EXPECTED_RELEASE ||
        release.pageSystem !== PAGE_SYSTEM ||
        !release.deploymentReady
      ) {
        throw new Error('Unexpected or undeployable Hub release manifest.');
      }

      if (
        !release.route ||
        release.route.id !== PAGE_ID ||
        release.route.path !== EXPECTED_PATH ||
        release.route.mount !== ROOT_ID ||
        release.route.pageSystem !== PAGE_SYSTEM ||
        release.route.schemaVersion !== '1.0'
      ) {
        throw new Error('Hub release route contract does not match the Edublogs shell.');
      }

      if (!release.assets?.script?.path || !release.assets?.style?.path || !release.assets?.compatStyle?.path || !release.assets?.content?.path) {
        throw new Error('Hub release manifest is missing required repository resources.');
      }

      const releaseBase = new URL('./', RELEASE_MANIFEST).href;
      const runtimeUrl = resolveReleaseAsset(releaseBase, release.assets.script, 'runtime');
      const styleUrl = resolveReleaseAsset(releaseBase, release.assets.style, 'presentation stylesheet');
      const compatStyleUrl = resolveReleaseAsset(releaseBase, release.assets.compatStyle, 'compatibility stylesheet');
      const contentUrl = resolveReleaseAsset(releaseBase, release.assets.content, 'content manifest');

      root.dataset.hrvRelease = release.release;
      root.dataset.hrvSourceCommit = release.sourceCommit || '';
      root.dataset.hrvState = 'validating';
      status(root, 'Validating the Classroom Explorations museum…');

      /* Validate data and the module before introducing enhanced CSS.
         If anything is wrong, the native Edublogs fallback remains visually untouched. */
      const [manifest, module] = await Promise.all([
        fetchJson(contentUrl, 'Hub content manifest'),
        import(runtimeUrl)
      ]);
      validateContentManifest(manifest);
      if (typeof module?.mountClassroomExplorationsHub !== 'function') {
        throw new Error('Hub renderer entry point is unavailable.');
      }

      root.dataset.hrvState = 'styling';
      status(root, 'Opening the museum doors…');
      await loadStyle(styleUrl, 'presentation');
      await loadStyle(compatStyleUrl, 'compatibility');

      manifestBlobUrl = URL.createObjectURL(new Blob([JSON.stringify(manifest)], { type: 'application/json' }));
      root.classList.remove('hrv-native-fallback');
      root.dataset.hrvState = 'mounting';

      const controller = module.mountClassroomExplorationsHub(root, {
        manifestUrl: manifestBlobUrl,
        layout: 'viewport'
      });
      await controller.ready;

      URL.revokeObjectURL(manifestBlobUrl);
      manifestBlobUrl = null;
      document.documentElement.classList.add('hrv-route-classroom-explorations-ready');
      root.removeAttribute('aria-busy');
      root.dataset.hrvState = 'ready';
      console.info('[HRV HUB] Classroom Explorations museum ready.', {
        release: release.release,
        sourceCommit: release.sourceCommit,
        loaderVersion: VERSION
      });
      scheduleAutoScroll(root);
      scheduleIntegrationDiagnostics(root, release);
    } catch (error) {
      restoreNative(error, 'The enhanced museum is unavailable. The complete readable Classroom Explorations guide remains available.');
    }
  });
})();
