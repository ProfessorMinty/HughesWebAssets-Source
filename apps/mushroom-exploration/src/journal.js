export const MUSHROOM_JOURNAL_REPOSITORY = 'https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/feature/mushroom-exhibit-scaffold/';
export const MUSHROOM_JOURNAL_FEED = MUSHROOM_JOURNAL_REPOSITORY + 'apps/mushroom-exploration/source/journal/index.json';
const labels = { observation:'Our observations', fact:'Did you know?', 'teacher-note':'Teacher note', 'student-note':'Student note' };
function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}
function mediaURL(url) {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://cdn.nlightlabs.com' || !parsed.pathname.startsWith('/hrv/mushrooms/') || parsed.username || parsed.password) throw new Error('Unapproved journal media');
  return parsed.href;
}
function dateLabel(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid journal date');
  const parsed = new Date(date + 'T12:00:00Z');
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Invalid journal date');
  return new Intl.DateTimeFormat('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone:'UTC' }).format(parsed);
}
async function json(fetcher, url, parentSignal, bound, timeoutMs) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  parentSignal.addEventListener('abort', cancel, { once:true });
  if (parentSignal.aborted) controller.abort();
  const deadline = setTimeout(cancel, timeoutMs);
  let reader;
  try {
    const response = await fetcher(url, { credentials:'omit', redirect:'error', signal:controller.signal, cache:'no-cache' });
    if (!response.ok || !response.body) throw new Error('Journal unavailable');
    reader = response.body.getReader();
    let bytes = 0, text = '';
    const decoder = new TextDecoder('utf-8', { fatal:true });
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.length;
      if (bytes > bound) { await reader.cancel(); throw new Error('Journal record too large'); }
      text += decoder.decode(chunk.value, { stream:true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    clearTimeout(deadline);
    parentSignal.removeEventListener('abort', cancel);
    reader?.releaseLock();
  }
}
export function createGrowingJournal(fallback, options = {}) {
  const fetcher = options.fetcher || (typeof window.fetch === 'function' ? window.fetch.bind(window) : null);
  const abort = new AbortController(), cleanups = [];
  const timeoutMs = Number.isSafeInteger(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 12000;
  let destroyed = false, loadingIndex = false, loadedIndex = false;
  const grid = node('div', 'mushroom-journal-days');
  let indexError;
  function pause() { grid.querySelectorAll('video').forEach(video => video.pause()); }
  function listen(target, event, handler) {
    target.addEventListener(event, handler);
    cleanups.push(() => target.removeEventListener(event, handler));
  }
  function pauseOther(active) { grid.querySelectorAll('video').forEach(video => { if (video !== active) video.pause(); }); }
  async function loadDay(entry, details, content) {
    if (!/^apps\/mushroom-exploration\/source\/journal\/days\/[a-f0-9-]+-\d+-[a-f0-9]{12}\.json$/.test(entry.recordPath)) throw new Error('Invalid journal path');
    const record = await json(fetcher, MUSHROOM_JOURNAL_REPOSITORY + entry.recordPath, abort.signal, 1000000, timeoutMs);
    if (destroyed) return;
    if (record.schemaVersion !== '1.0.0' || record.id !== entry.id || record.date !== entry.date || record.revision !== entry.revision || !Array.isArray(record.media) || !Array.isArray(record.cards)) throw new Error('Journal record mismatch');
    const gallery = node('div', 'mushroom-journal-gallery');
    for (const media of record.media) {
      const figure = node('figure');
      if (media.kind === 'video') {
        const video = node('video');
        video.controls = true; video.preload = 'none'; video.playsInline = true;
        video.poster = mediaURL(media.thumbnailUrl); video.src = mediaURL(media.url);
        listen(video, 'play', () => { pauseOther(video); options.onPlay?.(); });
        figure.append(video);
      } else if (media.kind === 'image') {
        const image = node('img'); image.src = mediaURL(media.url);
        image.alt = typeof media.alt === 'string' && media.alt.trim() ? media.alt : typeof media.caption === 'string' && media.caption.trim() ? media.caption : 'Our classroom mushroom growing block';
        image.loading = 'lazy'; image.decoding = 'async'; figure.append(image);
      } else throw new Error('Invalid media kind');
      if (typeof media.caption === 'string' && media.caption) figure.append(node('figcaption', '', media.caption));
      gallery.append(figure);
    }
    const notes = node('div', 'mushroom-journal-notes');
    for (const card of record.cards) {
      if (!Object.hasOwn(labels, card.type) || typeof card.text !== 'string' || !card.text.trim()) continue;
      const note = node('article', 'mushroom-journal-note ' + card.type);
      note.append(node('span', 'mushroom-journal-kind', labels[card.type]));
      if (typeof card.heading === 'string' && card.heading) note.append(node('h4', '', card.heading));
      note.append(node('p', '', card.text));
      if (typeof card.author === 'string' && card.author.trim()) note.append(node('p', 'mushroom-journal-author', '— ' + card.author));
      if (card.type === 'fact' && card.sourceUrl) {
        const url = new URL(card.sourceUrl);
        if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid fact source');
        const link = node('a', '', 'Learn more'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; note.append(link);
      }
      notes.append(note);
    }
    content.replaceChildren(gallery, notes); details.dataset.loaded = 'true';
  }
  function dayFrame(entry) {
    const details = node('details', 'mushroom-journal-day'), summary = node('summary'), copy = node('div', 'mushroom-journal-summary-copy');
    if (entry.cover) {
      const image = node('img', 'mushroom-journal-cover'); image.src = mediaURL(entry.cover.url);
      image.alt = typeof entry.cover.alt === 'string' ? entry.cover.alt : ''; image.loading = 'lazy'; summary.append(image);
    }
    copy.append(node('span', 'mushroom-journal-date', dateLabel(entry.date)), node('h3', '', entry.title || 'Our growing story'));
    if (entry.stage) copy.append(node('p', '', entry.stage));
    const toggle = node('span', 'mushroom-journal-toggle', 'Open this day');
    summary.append(copy, toggle);
    const content = node('div', 'mushroom-journal-day-body'); details.append(summary, content);
    let loading = false, wasOpen = false;
    async function openDay() {
      if (destroyed || details.dataset.loaded || loading) return;
      loading = true; content.setAttribute('aria-busy', 'true');
      content.replaceChildren(node('p', 'mushroom-journal-status', 'Opening this day…'));
      try { await loadDay(entry, details, content); }
      catch {
        if (!destroyed) {
          const retry = node('button', 'mushroom-button', 'Try this day again'); retry.type = 'button';
          listen(retry, 'click', () => { void openDay(); });
          content.replaceChildren(node('p', '', 'This day could not open just now.'), retry);
        }
      } finally { loading = false; content.removeAttribute('aria-busy'); }
    }
    listen(details, 'toggle', () => {
      if (details.open === wasOpen) return;
      wasOpen = details.open;
      toggle.textContent = details.open ? 'Close this day' : 'Open this day';
      if (!details.open) { details.querySelectorAll('video').forEach(video => video.pause()); return; }
      void openDay();
    });
    return details;
  }
  async function load() {
    if (loadingIndex || loadedIndex || destroyed || !fetcher) return;
    loadingIndex = true; fallback.setAttribute('aria-busy', 'true');
    try {
      const index = await json(fetcher, MUSHROOM_JOURNAL_FEED, abort.signal, 1000000, timeoutMs);
      if (destroyed) return;
      if (index.schemaVersion !== '1.0.0' || !Array.isArray(index.entries)) throw new Error('Invalid journal index');
      const seen = new Set(), frames = [];
      for (const entry of index.entries) {
        if (typeof entry.id !== 'string' || !/^[a-f0-9-]{36}$/.test(entry.id) || seen.has(entry.id) || !Number.isInteger(entry.revision) || entry.revision < 1 || typeof entry.title !== 'string' || typeof entry.stage !== 'string') throw new Error('Invalid journal identity');
        seen.add(entry.id); frames.push(dayFrame(entry));
      }
      indexError?.remove(); indexError = null; loadedIndex = true;
      if (frames.length) { grid.replaceChildren(...frames); fallback.replaceWith(grid); options.onReady?.(frames.length); }
    } catch {
      if (!destroyed) {
        indexError?.remove(); indexError = node('div', 'mushroom-journal-status'); indexError.setAttribute('role', 'status');
        const retry = node('button', 'mushroom-button', 'Try the journal again'); retry.type = 'button';
        listen(retry, 'click', () => { void load(); });
        indexError.append(node('p', '', 'Our journal could not open just now. Please try again.'), retry); fallback.append(indexError);
      }
    } finally { loadingIndex = false; fallback.removeAttribute('aria-busy'); }
  }
  function navigation(event) { const anchor = event.target.closest?.('a[href]'); if (anchor && anchor.hash && anchor.hash !== '#mushrooms-journal') pause(); }
  listen(document, 'click', navigation); listen(document, 'visibilitychange', () => { if (document.hidden) pause(); });
  let observer;
  if (typeof window.IntersectionObserver === 'function') {
    observer = new window.IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { void load(); observer.disconnect(); } }, { rootMargin:'500px' }); observer.observe(fallback);
  } else if (fetcher) Promise.resolve().then(() => load());
  return { node:grid, load, suspend:pause, destroy() {
    destroyed = true; abort.abort(); observer?.disconnect(); pause(); cleanups.forEach(cleanup => cleanup());
    grid.querySelectorAll('video').forEach(video => { video.removeAttribute('src'); video.load(); });
  } };
}
