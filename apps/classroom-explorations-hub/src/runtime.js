const mounted = new WeakMap();
const APP = "hrv-classroom-hub";
const EFFECTS_KEY = "hrv:classroom-explorations:reduced-effects";

function node(tag, className, text) {
  const el = document.createElement(tag);
  if (className) el.className = className;
  if (text !== undefined) el.textContent = text;
  return el;
}
function setEditable(el, id) { if (id) el.dataset.hrvNodeId = id; return el; }
function link(label, href, className = "hub-button") { const a = node("a", className, label); a.href = href; return a; }
function mediaPrefersReduced() { return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches); }
function storedReduced() { try { return localStorage.getItem(EFFECTS_KEY) === "true"; } catch { return false; } }
function setStoredReduced(value) { try { localStorage.setItem(EFFECTS_KEY, String(value)); } catch {} }

class HubController {
  constructor(root, manifest) { this.root = root; this.manifest = manifest; this.listeners = []; this.destroyed = false; this.manualReduced = storedReduced(); }
  on(target, type, handler, options) { target.addEventListener(type, handler, options); this.listeners.push(() => target.removeEventListener(type, handler, options)); }
  start() {
    this.root.classList.add(APP);
    this.root.dataset.hrvPageId = this.manifest.page.id;
    this.root.dataset.hrvRuntimeSchema = this.manifest.runtimeSchemaVersion;
    this.root.dataset.hrvSnapshot = this.manifest.snapshotId;
    this.root.dataset.hrvState = "mounting";
    this.render();
    this.applyEffects();
    this.root.dataset.hrvState = "ready";
    this.root.removeAttribute("aria-busy");
    document.documentElement.classList.add("hrv-page-classroom-explorations-ready");
    window.dispatchEvent(new CustomEvent("hrv:page-ready", { detail: { pageId: this.manifest.page.id, snapshotId: this.manifest.snapshotId } }));
  }
  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listeners.splice(0).forEach((off) => off());
    document.documentElement.classList.remove("hrv-page-classroom-explorations-ready");
    this.root.classList.remove(APP);
    this.root.replaceChildren();
    mounted.delete(this.root);
  }
  applyEffects() {
    const reduced = this.manualReduced || mediaPrefersReduced();
    this.root.dataset.effects = reduced ? "reduced" : "full";
    const button = this.root.querySelector("[data-effects-toggle]");
    if (button) { button.textContent = reduced ? "Reduced Effects: On" : "Reduced Effects: Off"; button.setAttribute("aria-pressed", String(this.manualReduced)); }
  }
  render() {
    const m = this.manifest;
    const copy = m.page.copy;
    const skip = link("Skip to museum exhibits", "#hrv-hub-exhibits", "hub-skip");
    const main = node("main", "hub-museum");
    main.id = "hrv-hub-exhibits";
    main.append(this.hero(copy.hero), this.welcome(copy.welcome, m.current.featuredMedia), this.currentExploration(copy.currentExploration, m.current.exploration), this.currentTwwl(copy.currentTwwl, m.current.twwl), this.currentYearGalleries(copy, m.galleries), this.archives(copy.archives, m.archives), this.footer(copy.footer));
    this.root.replaceChildren(skip, main);
  }
  hero(copy) {
    const section = setEditable(node("header", "museum-foyer"), copy.nodeId);
    const atmosphere = node("div", "foyer-atmosphere"); atmosphere.setAttribute("aria-hidden", "true");
    for (let i = 0; i < 18; i += 1) { const spark = node("span", "foyer-spark"); spark.style.setProperty("--i", String(i)); atmosphere.append(spark); }
    const arch = node("div", "foyer-arch");
    const plaque = node("div", "foyer-copy");
    plaque.append(node("p", "museum-eyebrow", copy.eyebrow), node("h1", "foyer-title", copy.title), node("p", "foyer-intro", copy.intro), node("p", "foyer-invitation", copy.invitation));
    const doors = node("div", "museum-doors"); doors.setAttribute("aria-hidden", "true");
    doors.innerHTML = `<span class="door door-left"></span><span class="door-light"></span><span class="door door-right"></span>`;
    const controls = node("div", "foyer-controls");
    const effects = node("button", "effects-toggle", "Reduced Effects: Off"); effects.type = "button"; effects.dataset.effectsToggle = "";
    this.on(effects, "click", () => { this.manualReduced = !this.manualReduced; setStoredReduced(this.manualReduced); this.applyEffects(); });
    controls.append(effects, node("span", "school-year-badge", `${this.manifest.page.schoolYearLabel} Museum`));
    arch.append(plaque, doors); section.append(atmosphere, arch, controls); return section;
  }
  welcome(copy, media) {
    const section = setEditable(node("section", "museum-room orientation-room"), copy.nodeId);
    const head = node("div", "room-heading"); head.append(node("p", "museum-eyebrow", copy.eyebrow), node("h2", "room-title", copy.title), node("p", "room-summary", copy.summary));
    const theater = node("div", "orientation-screen");
    const iframe = node("iframe"); iframe.src = media.embedUrl; iframe.title = media.title; iframe.loading = "lazy"; iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"; iframe.allowFullscreen = true;
    theater.append(iframe); section.append(head, theater); return section;
  }
  currentExploration(copy, exp) {
    const section = setEditable(node("section", "museum-room spotlight-room"), copy.nodeId); section.dataset.hrvContentId = exp.id;
    const copyCol = node("div", "spotlight-copy"); copyCol.append(node("p", "museum-eyebrow", copy.eyebrow), node("h2", "room-title", copy.title), node("h3", "spotlight-title", exp.title), node("p", "room-summary", exp.summary));
    const points = node("ul", "discovery-list"); exp.learningPoints.forEach((point) => points.append(node("li", "", point))); copyCol.append(points, link("Enter Current Exploration", exp.href));
    const imageWrap = node("figure", "spotlight-window"); const img = node("img"); img.src = exp.image.src; img.alt = exp.image.alt; img.loading = "eager"; img.decoding = "async"; imageWrap.append(img, node("figcaption", "window-caption", "Current museum exhibit"));
    section.append(copyCol, imageWrap); return section;
  }
  currentTwwl(copy, slot) {
    const section = setEditable(node("section", "museum-room learning-room"), copy.nodeId); section.dataset.hrvSlotId = slot.id;
    section.append(node("p", "museum-eyebrow", copy.eyebrow), node("h2", "room-title", copy.title));
    if (slot.state === "coming-soon") {
      const caseNode = node("div", "coming-soon-case"); caseNode.append(node("span", "case-glow", "✦"), node("h3", "", copy.comingSoonTitle), node("p", "", copy.comingSoonBody), node("span", "case-label", "Coming Soon")); section.append(caseNode);
    } else {
      const item = slot.content; section.dataset.hrvContentId = item.id; section.append(node("h3", "spotlight-title", item.title), node("p", "room-summary", item.summary), link("Visit this learning exhibit", item.href));
    }
    return section;
  }
  gallery(copy, items) {
    const section = setEditable(node("section", "museum-gallery"), copy.nodeId); section.append(node("p", "museum-eyebrow", copy.eyebrow), node("h2", "room-title", copy.title));
    if (!items.length) { const empty = node("div", "empty-gallery"); empty.append(node("div", "empty-cases", "◇  ◇  ◇"), node("p", "", copy.emptyText)); section.append(empty); return section; }
    const grid = node("div", "gallery-grid");
    items.forEach((item) => { const card = node("article", "gallery-card"); card.dataset.hrvContentId = item.id; const a = link(item.title, item.href, "gallery-card-link"); a.replaceChildren(node("h3", "", item.title), node("p", "", item.summary)); card.append(a); grid.append(card); });
    section.append(grid); return section;
  }
  currentYearGalleries(copy, galleries) {
    const floor = node("section", "museum-floor current-year-floor"); floor.setAttribute("aria-label", `Past exhibits from ${this.manifest.page.schoolYearLabel}`); floor.append(this.gallery(copy.pastExplorations, galleries.pastExplorations), this.gallery(copy.pastTwwl, galleries.pastTwwl)); return floor;
  }
  archives(copy, archives) {
    const section = setEditable(node("section", "museum-room time-gallery"), copy.nodeId); section.append(node("p", "museum-eyebrow", copy.eyebrow), node("h2", "room-title", copy.title), node("p", "room-summary", copy.intro));
    const track = node("div", "time-track"); archives.forEach((archive) => { const card = node("article", "year-door"); card.dataset.hrvArchiveId = archive.id; card.append(node("span", "year-door-label", archive.label)); if (archive.state === "published" && archive.href) card.append(link("Open school-year gallery", archive.href)); else card.append(node("span", "year-door-state", "Archive conversion coming soon")); track.append(card); }); section.append(track); return section;
  }
  footer(copy) { const footer = setEditable(node("footer", "museum-footer"), copy.nodeId); footer.append(node("span", "footer-star", "✦"), node("p", "", copy.text), node("span", "footer-star", "✦")); return footer; }
}

export function mountClassroomExplorationsHub(root, manifest) {
  if (!(root instanceof HTMLElement)) throw new TypeError("Hub mount requires an HTMLElement.");
  const existing = mounted.get(root); if (existing) return existing;
  if (!manifest || manifest.runtimeSchemaVersion !== "1.0" || manifest.page?.id !== "hrv-page:classroom-explorations") throw new Error("Unsupported Classroom Explorations runtime manifest.");
  const controller = new HubController(root, manifest); mounted.set(root, controller); controller.start(); return controller;
}
export function unmountClassroomExplorationsHub(root) { mounted.get(root)?.destroy(); }
