import "./styles/hub.css";
import "./styles/museum-magic.css";
import type { HubManifest, HubMountOptions, HubRecord } from "./types";

const DEFAULT_MANIFEST_URL = "./hub.manifest.json";
const ROOT_CLASS = "hrv-explorations-hub";
const mounted = new WeakMap<HTMLElement, HubController>();

function el<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeHttps(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function applyRecordState(node: HTMLElement, record: HubRecord): void {
  node.dataset.recordId = record.id;
  node.dataset.theme = record.theme;
  node.dataset.animation = record.animation;
  node.dataset.status = record.status;
}

function assertManifest(value: unknown): asserts value is HubManifest {
  if (!value || typeof value !== "object") throw new Error("Hub manifest is not an object.");
  const manifest = value as Partial<HubManifest>;
  if (manifest.schemaVersion !== "1.0") throw new Error("Unsupported Hub manifest schema.");
  if (manifest.page?.id !== "classroom-explorations-hub") throw new Error("Unexpected Hub manifest page id.");
  if (!manifest.page.museum) throw new Error("Hub museum identity contract is missing.");
  if (!Array.isArray(manifest.records) || !Array.isArray(manifest.schoolYears)) throw new Error("Hub manifest collections are missing.");
  const ids = new Set<string>();
  for (const record of manifest.records) {
    if (!record || typeof record.id !== "string" || ids.has(record.id)) throw new Error("Hub manifest has an invalid or duplicate record id.");
    ids.add(record.id);
  }
}

async function loadManifest(url: string): Promise<HubManifest> {
  const response = await fetch(url, { credentials: "omit", cache: "no-cache" });
  if (!response.ok) throw new Error(`Hub manifest request failed (${response.status}).`);
  const json: unknown = await response.json();
  assertManifest(json);
  return json;
}

function action(label: string, href: string, className = "cta primary"): HTMLAnchorElement {
  const link = el("a", className, label);
  link.href = href;
  return link;
}

function setCssImage(node: HTMLElement, name: string, url: string | null): void {
  const safe = safeHttps(url);
  if (safe) node.style.setProperty(name, `url("${safe.replace(/"/g, "%22")}")`);
}

function schoolYearDisplay(manifest: HubManifest, id: string): string {
  return manifest.schoolYears.find((year) => year.id === id)?.display ?? id.replace("-", "–");
}

class HubController {
  private manifest: HubManifest | null = null;
  private destroyed = false;

  constructor(private readonly root: HTMLElement, private readonly options: HubMountOptions) {}

  async start(): Promise<void> {
    this.prepareRoot();
    this.manifest = await loadManifest(this.options.manifestUrl ?? DEFAULT_MANIFEST_URL);
    if (!this.destroyed) this.renderMuseum();
  }

  destroy(): void {
    this.destroyed = true;
    this.root.replaceChildren();
    this.root.classList.remove(ROOT_CLASS);
    delete this.root.dataset.layout;
    mounted.delete(this.root);
  }

  private prepareRoot(): void {
    this.root.classList.add(ROOT_CLASS);
    this.root.dataset.layout = this.options.layout === "contained" ? "contained" : "viewport";
    this.root.setAttribute("aria-busy", "true");
  }

  private renderMuseum(): void {
    const manifest = this.manifest!;
    const year = manifest.page.currentSchoolYear;
    const currentExploration = manifest.records.find((record) => record.schoolYear === year && record.type === "exploration" && record.status === "current");
    const currentTwwl = manifest.records.find((record) => record.schoolYear === year && record.type === "twwl" && ["current", "coming-soon"].includes(record.status));
    const video = manifest.records.find((record) => record.schoolYear === year && record.type === "video" && record.status === "current");
    const pastExplorations = manifest.records.filter((record) => record.schoolYear === year && record.type === "exploration" && record.status === "past");
    const pastTwwl = manifest.records.filter((record) => record.schoolYear === year && record.type === "twwl" && record.status === "past");
    const doorways = manifest.records.filter((record) => record.type === "archive-doorway").sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));

    const skip = action("Skip to Hub content", "#hrv-explorations-main", "hrv-hub-skip-link");
    const museum = el("main", "hub-wrap museum-campus");
    museum.id = "hrv-explorations-main";
    museum.dataset.theme = manifest.page.theme;
    museum.setAttribute("role", "region");
    museum.setAttribute("aria-label", "Classroom Explorations Hub");

    museum.append(this.createSky(), this.createParade(), this.createHero(manifest, pastExplorations.length, pastTwwl.length, doorways.length));

    const nowFloor = el("section", "museum-now-floor museum-floor");
    nowFloor.setAttribute("aria-label", "Current museum exhibits");
    if (video) nowFloor.append(this.createVideo(video));
    if (currentExploration) nowFloor.append(this.createCurrentExploration(currentExploration));
    if (nowFloor.childElementCount) museum.append(nowFloor);

    if (currentTwwl) {
      const lanternZone = el("section", "museum-lantern-zone museum-floor");
      lanternZone.setAttribute("aria-label", "Learning Lantern");
      lanternZone.append(this.createCurrentTwwl(currentTwwl));
      museum.append(lanternZone);
    }

    museum.append(this.createDivider(manifest));

    const archiveFloor = el("section", "museum-archive-floor museum-floor");
    archiveFloor.setAttribute("aria-label", "Current school year archive galleries");
    archiveFloor.append(this.createArchiveWing("exploration", pastExplorations), this.createArchiveWing("twwl", pastTwwl));
    museum.append(archiveFloor);

    museum.append(this.createYearDoorways(doorways));
    museum.append(this.createFooter(manifest), el("div", "confetti"));

    const confetti = museum.querySelector<HTMLElement>(".confetti");
    if (confetti) {
      confetti.id = "hrv-hub-confetti";
      confetti.setAttribute("aria-hidden", "true");
    }

    this.root.replaceChildren(skip, museum);
    this.root.removeAttribute("aria-busy");
    this.root.setAttribute("data-hrv-museum", "restored");
    this.root.setAttribute("data-hrv-experience", "museum-magic-06");
  }

  private createSky(): HTMLElement {
    const sky = el("div", "sky");
    sky.setAttribute("aria-hidden", "true");
    sky.append(
      el("div", "layer stars"),
      el("div", "layer clouds"),
      el("div", "layer aurora"),
      el("div", "layer glimmer"),
      el("div", "layer comets"),
    );
    return sky;
  }

  private createParade(): HTMLElement {
    const parade = el("div", "parade");
    parade.setAttribute("aria-hidden", "true");
    ["🚀", "🧭", "🔬", "🧪", "🌍", "🦋", "🌱", "💡"].forEach((icon, index) => {
      const item = el("span", "pi", icon);
      item.style.setProperty("--float-index", String(index));
      parade.append(item);
    });
    return parade;
  }

  private createHero(manifest: HubManifest, pastExplorations: number, pastTwwl: number, doorways: number): HTMLElement {
    const hero = el("header", "hub-hero museum-entrance");
    hero.append(el("div", "beam"));

    const magic = el("div", "hero-magic");
    magic.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 12; index += 1) magic.append(el("span", `magic-speck speck-${index + 1}`));
    hero.append(magic);

    const left = el("div", "hero-left");
    const badge = el("div", "hero-badge");
    badge.setAttribute("aria-hidden", "true");
    badge.innerHTML = `<svg class="badge-svg" viewBox="0 0 80 80" aria-hidden="true"><defs><linearGradient id="hrv-hub-ring" x1="0" x2="1" y1="0" y2="1"><stop offset="0" stop-color="var(--accent)"/><stop offset="1" stop-color="var(--accent-2)"/></linearGradient></defs><circle cx="40" cy="40" r="30" fill="none" stroke="url(#hrv-hub-ring)" stroke-width="6" class="spin"/><circle cx="40" cy="40" r="22" fill="none" stroke="rgba(255,255,255,.34)" stroke-width="1.5" class="orbit"/><polygon points="40,16 46,40 40,64 34,40" fill="white" opacity="0.95" class="needle"/></svg>`;

    const copy = el("div", "hero-copy");
    copy.append(el("div", "hero-kicker", manifest.page.museum.kicker), el("h1", "hub-title", manifest.page.title), el("p", "hub-subtitle", manifest.page.summary));
    const chips = el("ul", "hero-chips");
    chips.setAttribute("aria-label", "Learning pillars");
    manifest.page.museum.pillars.forEach((pillar) => chips.append(el("li", "", pillar)));
    copy.append(chips);
    left.append(badge, copy);

    const right = el("div", "hero-right");
    const oath = el("div", "oath museum-plaque");
    oath.setAttribute("role", "note");
    oath.setAttribute("aria-label", manifest.page.museum.oathTitle);
    oath.append(el("div", "oath-title", manifest.page.museum.oathTitle), el("p", "", manifest.page.museum.oath));

    const glance = el("div", "hero-mini museum-plaque");
    glance.append(el("div", "hero-mini-title", "Museum at a Glance"));
    const stats = el("div", "hero-mini-grid");
    const statData: Array<[string, string]> = [
      ["1", "Current Exhibit"],
      [String(pastExplorations + pastTwwl), "Past This Year"],
      [String(doorways), "Archive Doorway"],
    ];
    statData.forEach(([value, label]) => {
      const stat = el("div", "hero-mini-stat");
      stat.append(el("strong", "", value), el("span", "", label));
      stats.append(stat);
    });
    glance.append(stats);
    right.append(oath, glance);
    hero.append(left, right);
    return hero;
  }

  private createVideo(record: HubRecord): HTMLElement {
    const section = el("section", "intro-video card theater-room");
    applyRecordState(section, record);
    section.setAttribute("aria-labelledby", "intro-video-heading");

    const lights = el("div", "theater-lights");
    lights.setAttribute("aria-hidden", "true");
    for (let index = 0; index < 9; index += 1) lights.append(el("span"));
    section.append(lights);

    const head = el("div", "intro-head");
    head.append(el("div", "section-kicker blue", record.presentation?.sectionKicker ?? "Welcome Theater"));
    const title = el("h2", "", record.title);
    title.id = "intro-video-heading";
    head.append(title, el("p", "intro-sub", record.summary));
    section.append(head);

    const embed = record.media?.embedUrl;
    if (embed?.startsWith("https://www.youtube-nocookie.com/embed/")) {
      const wrap = el("div", "intro-embed");
      const iframe = el("iframe");
      iframe.src = embed;
      iframe.title = "Explorations Hub Intro Video";
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      wrap.append(iframe);
      section.append(wrap);
    }
    return section;
  }

  private createCurrentExploration(record: HubRecord): HTMLElement {
    const section = el("section", "current card reef-feature zinnia-feature greenhouse-room");
    applyRecordState(section, record);
    section.setAttribute("aria-labelledby", "current-heading");
    const left = el("div", "current-left");
    left.append(el("div", "section-kicker green", record.presentation?.sectionKicker ?? "Featured Exhibit Hall"));
    const tag = el("h2", "current-tag", record.presentation?.slotLabel ?? "Current Exploration");
    tag.id = "current-heading";
    left.append(tag, el("h3", "current-title", record.title), el("p", "current-desc", record.summary));

    const ctas = el("div", "current-ctas");
    const href = safeHttps(record.pageUrl);
    if (href) {
      const open = action(record.presentation?.actionLabel ?? "Explore Now", href, "cta primary");
      open.setAttribute("aria-label", "Open current exploration");
      ctas.append(open);
    }
    const celebrate = el("button", "cta spark", "Celebrate 🎉");
    celebrate.type = "button";
    celebrate.setAttribute("aria-label", "Celebrate the current exploration with a local confetti animation");
    celebrate.addEventListener("click", () => this.celebrate());
    ctas.append(celebrate);
    left.append(ctas);

    if (record.learningPoints?.length) {
      const points = el("ul", "current-points");
      record.learningPoints.forEach((point) => points.append(el("li", "", point)));
      left.append(points);
    }

    const right = el("div", "current-right");
    const visual = el("div", "current-visual reef-visual zinnia-visual");
    setCssImage(visual, "--current-thumb", record.imageUrl);
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", record.imageAlt ?? "Theme image for current exploration");
    visual.append(
      el("div", "visual-badge", record.presentation?.visualBadge ?? "Zinnia Greenhouse"),
      el("div", "ring one"),
      el("div", "ring two"),
      el("div", "spore sp1"),
      el("div", "spore sp2"),
      el("div", "spore sp3"),
      el("div", "petal petal-1"),
      el("div", "petal petal-2"),
      el("div", "petal petal-3"),
    );
    Array.from(visual.children).forEach((child) => child.setAttribute("aria-hidden", "true"));
    right.append(visual);
    section.append(left, right);
    return section;
  }

  private createCurrentTwwl(record: HubRecord): HTMLElement {
    const section = el("section", "learn-now card lantern-feature lantern-room");
    applyRecordState(section, record);
    section.setAttribute("aria-labelledby", "learn-now-heading");
    const left = el("div", "learn-left");
    left.append(el("div", "section-kicker purple", record.presentation?.sectionKicker ?? "Learning Lantern"));
    const tag = el("h2", "learn-tag", record.presentation?.slotLabel ?? "This Week We Learned");
    tag.id = "learn-now-heading";
    left.append(tag, el("h3", "learn-title", record.title), el("p", "learn-desc", record.summary));
    const ctas = el("div", "learn-ctas");
    if (record.status === "coming-soon") {
      const badge = el("span", "learn-badge", record.presentation?.statusLabel ?? "Coming Soon");
      badge.setAttribute("role", "status");
      ctas.append(badge);
    } else {
      const href = safeHttps(record.pageUrl);
      if (href) ctas.append(action(record.presentation?.actionLabel ?? "Read this recap", href, "cta learn-primary"));
    }
    left.append(ctas);

    const right = el("div", "learn-right");
    const visual = el("div", "learn-visual lantern-visual");
    visual.setAttribute("role", "img");
    visual.setAttribute("aria-label", "Purple Learning Lantern visual for This Week We Learned");
    visual.append(
      el("div", "visual-badge learn-badge-visual", record.presentation?.visualBadge ?? "Learning Lantern"),
      el("div", "lantern-orb", record.emoji),
      el("div", "ring one"),
      el("div", "ring two"),
      el("div", "sparkle sp1"),
      el("div", "sparkle sp2"),
      el("div", "sparkle sp3"),
      el("div", "sparkle lantern-star-1"),
      el("div", "sparkle lantern-star-2"),
    );
    Array.from(visual.children).forEach((child) => child.setAttribute("aria-hidden", "true"));
    right.append(visual);
    section.append(left, right);
    return section;
  }

  private createDivider(manifest: HubManifest): HTMLElement {
    const divider = el("div", "museum-divider museum-threshold");
    divider.setAttribute("aria-hidden", "true");
    const img = el("img");
    img.src = manifest.page.museum.dividerImageUrl;
    img.alt = "";
    img.decoding = "async";
    divider.append(el("span", "threshold-glow left"), img, el("span", "threshold-glow right"));
    return divider;
  }

  private createArchiveWing(type: "exploration" | "twwl", records: HubRecord[]): HTMLElement {
    const isExploration = type === "exploration";
    const section = el("section", isExploration ? "past card exhibit-gallery archive-wing" : "learn-archive card learning-gallery archive-wing");
    const headingId = isExploration ? "past-heading" : "learn-archive-heading";
    section.setAttribute("aria-labelledby", headingId);
    const top = el("div", isExploration ? "past-top" : "learn-arch-top");
    const copy = el("div");
    copy.append(el("div", `section-kicker ${isExploration ? "green" : "purple"}`, isExploration ? "Archive Gallery" : "Learning Archive"));
    const heading = el("h2", "", isExploration ? "Past Explorations" : "Past This Week We Learned");
    heading.id = headingId;
    copy.append(heading);
    top.append(copy);
    section.append(top);

    if (records.length === 0) {
      const empty = el("div", `archive-empty-scene ${isExploration ? "exploration-empty" : "learning-empty"}`);
      empty.setAttribute("role", "status");
      const icon = el("div", "archive-empty-icon", isExploration ? "🖼️" : "📚");
      icon.setAttribute("aria-hidden", "true");
      const text = el("div", "archive-empty-copy");
      text.append(
        el("strong", "", isExploration ? "This gallery is waiting for its first adventure." : "The learning shelves are ready for this year’s discoveries."),
        el("p", "archive-empty", isExploration ? "Completed 2026–2027 explorations will gather here as the class discovers them." : "Approved 2026–2027 learning recaps will gather here throughout the year."),
      );
      const shelves = el("div", "empty-shelves");
      shelves.setAttribute("aria-hidden", "true");
      shelves.append(el("span"), el("span"), el("span"));
      empty.append(icon, text, shelves);
      section.append(empty);
      return section;
    }

    const filter = el("div", "filters");
    const input = el("input") as HTMLInputElement;
    input.type = "search";
    input.placeholder = "Filter by title or tag…";
    input.setAttribute("aria-label", isExploration ? "Filter explorations" : "Filter past learning recaps");
    filter.append(input);
    top.append(filter);

    const grid = el("div", "grid");
    grid.setAttribute("role", "list");
    if (!isExploration) grid.setAttribute("aria-live", "polite");
    records.forEach((record) => grid.append(this.createArchiveCard(record, type)));
    input.addEventListener("input", () => this.filterCards(grid, input.value));
    section.append(grid);
    return section;
  }

  private createArchiveCard(record: HubRecord, type: "exploration" | "twwl"): HTMLElement {
    const article = el("article", `card-item ${type === "twwl" ? "learn-card" : "exploration-card"}`);
    article.setAttribute("role", "listitem");
    applyRecordState(article, record);
    article.dataset.search = [record.title, record.summary, ...(record.tags ?? [])].join(" ").toLowerCase();
    const href = safeHttps(record.pageUrl);
    const wrapper = href ? action("", href, "up-link") : el("div", "up-link");
    if (href) wrapper.removeAttribute("aria-label");
    const thumb = el("div", "thumb");
    setCssImage(thumb, "--thumb", record.imageUrl);
    thumb.append(el("span", "label", type === "exploration" ? "Past Exhibit" : "Past Recap"), el("div", "emoji", record.emoji));
    const meta = el("div", "meta");
    meta.append(el("div", "title", record.title), el("p", "intro-sub", record.summary));
    if (record.tags?.length) {
      const tags = el("div", "tags");
      record.tags.forEach((tag) => tags.append(el("span", "tag", tag)));
      meta.append(tags);
    }
    wrapper.append(thumb, meta);
    article.append(wrapper);
    return article;
  }

  private createYearDoorways(records: HubRecord[]): HTMLElement {
    const section = el("section", "past card year-archive-gallery archive-portal-room");
    section.setAttribute("aria-labelledby", "year-archive-heading");
    const top = el("div", "past-top archive-portal-heading");
    const copy = el("div");
    copy.append(el("div", "section-kicker gold", "Museum Archives"));
    const heading = el("h2", "", "Previous School Years");
    heading.id = "year-archive-heading";
    copy.append(heading, el("p", "intro-sub", "Step through a museum doorway to revisit classroom work from earlier school years."));
    top.append(copy);
    section.append(top);

    const grid = el("div", "grid year-door-grid");
    grid.setAttribute("role", "list");
    for (const record of records) {
      const card = el("article", "card-item archive-door-card");
      card.setAttribute("role", "listitem");
      applyRecordState(card, record);
      const glow = el("div", "archive-door-glow");
      glow.setAttribute("aria-hidden", "true");
      const stars = el("div", "archive-door-stars");
      stars.setAttribute("aria-hidden", "true");
      stars.append(el("span"), el("span"), el("span"), el("span"));
      const body = el("div", "archive-door-body");
      body.append(el("div", "archive-door-icon", record.emoji), el("div", "section-kicker gold", record.presentation?.sectionKicker ?? "Last Year"), el("h3", "archive-door-title", record.title), el("p", "intro-sub", record.summary));
      const href = safeHttps(record.pageUrl);
      if (href) {
        body.append(action(`${record.presentation?.actionLabel ?? "Enter Archive"} • ${schoolYearDisplay(this.manifest!, record.archiveSchoolYear ?? record.schoolYear)}`, href, "cta archive-primary"));
      } else {
        const status = el("span", "archive-status", record.presentation?.statusLabel ?? "Archive conversion coming soon");
        status.setAttribute("role", "status");
        body.append(status);
      }
      card.append(glow, stars, body);
      grid.append(card);
    }
    section.append(grid);
    return section;
  }

  private createFooter(manifest: HubManifest): HTMLElement {
    const footer = el("footer", "hub-foot");
    footer.setAttribute("role", "contentinfo");
    footer.append(el("span", "spark", "✦"), el("span", "", manifest.page.museum.footer), el("span", "spark", "✦"));
    return footer;
  }

  private filterCards(grid: HTMLElement, query: string): void {
    const needle = query.trim().toLowerCase();
    grid.querySelectorAll<HTMLElement>(".card-item").forEach((card) => {
      card.hidden = Boolean(needle) && !(card.dataset.search ?? "").includes(needle);
    });
  }

  private celebrate(): void {
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const field = this.root.querySelector<HTMLElement>("#hrv-hub-confetti");
    if (!field) return;
    field.replaceChildren();
    field.style.display = "block";
    const palette = ["#ec4899", "#16a34a", "#facc15", "#38bdf8", "#8b5cf6"];
    for (let index = 0; index < 34; index += 1) {
      const piece = el("span", "piece");
      piece.style.left = `${Math.random() * 100}%`;
      piece.style.background = palette[index % palette.length] ?? "#ec4899";
      piece.style.animationDuration = `${2.4 + Math.random() * 1.5}s`;
      piece.style.animationDelay = `${Math.random() * 0.35}s`;
      field.append(piece);
    }
    window.setTimeout(() => {
      field.style.display = "none";
      field.replaceChildren();
    }, 4500);
  }
}

export function mountClassroomExplorationsHub(root: HTMLElement | null, options: HubMountOptions = {}): { ready: Promise<void>; destroy: () => void } {
  if (!root) throw new Error("Classroom Explorations Hub mount root was not found.");
  const existing = mounted.get(root);
  if (existing) return { ready: Promise.resolve(), destroy: () => existing.destroy() };
  const controller = new HubController(root, options);
  mounted.set(root, controller);
  return { ready: controller.start(), destroy: () => controller.destroy() };
}
