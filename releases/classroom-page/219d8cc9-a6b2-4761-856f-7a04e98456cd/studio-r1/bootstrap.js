(function startClassroomPage() {
  'use strict';
  const script = document.currentScript;
  if (!script) return;
  const mountId = script.dataset.mountId;
  const root = document.getElementById(mountId);
  if (!root || root.dataset.hrvClassroomLoading || root.hasAttribute('data-hrv-classroom-ready')) return;
  const uuid = '[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}';
  const sourceId = new RegExp('^hrv-classroom-(' + uuid + ')$').exec(mountId)?.[1];
  if (!sourceId) return;
  const base = 'https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@';
  const coords = new RegExp('^[0-9a-f]{40}/releases/classroom-page/' + sourceId + '/studio-r[1-9][0-9]*/bootstrap\\.js$');
  const sourceUrl = new URL('source.json', script.src).href;
  const sri = /^sha256-[A-Za-z0-9+/]{43}=$/;
  if (!script.src.startsWith(base) || !coords.test(script.src.slice(base.length)) ||
      sourceUrl !== script.dataset.contentUrl || !sri.test(script.dataset.contentIntegrity) ||
      !sri.test(script.dataset.styleIntegrity)) return;

  function hasKeys(object, keys) {
    return object && typeof object === 'object' && !Array.isArray(object) &&
      Object.keys(object).length === keys.length && keys.every(key => Object.hasOwn(object, key));
  }
  function valid(source) {
    if (!hasKeys(source, ['schemaVersion', 'page', 'data']) || source.schemaVersion !== '1.0') return false;
    const { page, data } = source;
    if (!hasKeys(page, ['id', 'type', 'routeRef']) || page.id !== 'hrv-page:classroom-' + sourceId ||
        page.routeRef !== 'hrv-route:classroom-' + sourceId || page.type !== 'classroom-page') return false;
    if (!hasKeys(data, ['schemaVersion', 'title', 'sections']) || data.schemaVersion !== '1.0' ||
        typeof data.title !== 'string' || !data.title.trim() || data.title.length > 180 ||
        !Array.isArray(data.sections) || data.sections.length > 64) return false;
    const ids = new Set();
    const sectionId = new RegExp('^' + uuid + '$', 'i');
    return data.sections.every(section => {
      if (!hasKeys(section, ['id', 'type', 'text']) || typeof section.id !== 'string' || !sectionId.test(section.id) ||
          ids.has(section.id) || !['heading', 'paragraph'].includes(section.type) ||
          typeof section.text !== 'string' || section.text.length > 8000) return false;
      ids.add(section.id);
      return true;
    });
  }
  async function readSource(signal) {
    const response = await fetch(sourceUrl, {
      credentials: 'omit', mode: 'cors', redirect: 'error', integrity: script.dataset.contentIntegrity, signal
    });
    if (!response.ok) throw new Error('Content could not be loaded');
    const source = await response.json();
    if (!valid(source)) throw new Error('Content failed validation');
    return source.data;
  }
  function makeContent(data) {
    const article = document.createElement('article');
    article.className = 'hrv-classroom-content';
    const title = document.createElement('h1');
    title.textContent = data.title;
    article.append(title);
    for (const section of data.sections) {
      const element = document.createElement(section.type === 'heading' ? 'h2' : 'p');
      element.dataset.sectionId = section.id;
      element.textContent = section.text;
      article.append(element);
    }
    return article;
  }
  async function mount() {
    root.dataset.hrvClassroomLoading = 'true';
    const controller = new AbortController();
    const style = document.createElement('link');
    const loaded = new Promise((resolve, reject) => {
      style.onload = resolve;
      style.onerror = () => reject(new Error('Styles could not be loaded'));
      controller.signal.addEventListener('abort', () => reject(new Error('Page request timed out')), { once: true });
    });
    const deadline = setTimeout(() => controller.abort(), 15000);
    try {
      style.rel = 'stylesheet';
      style.href = new URL('page.css', script.src).href;
      style.integrity = script.dataset.styleIntegrity;
      style.crossOrigin = 'anonymous';
      document.head.append(style);
      const [data] = await Promise.all([readSource(controller.signal), loaded]);
      root.replaceChildren(makeContent(data));
      root.setAttribute('data-hrv-classroom-ready', '');
    } catch {
      controller.abort();
      style.remove();
      // The original Edublogs unavailable message remains usable.
    } finally {
      clearTimeout(deadline);
      delete root.dataset.hrvClassroomLoading;
    }
  }
  void mount();
})();
