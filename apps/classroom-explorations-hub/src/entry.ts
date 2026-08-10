import "./styles/hub.css";
import type { HubManifest, HubMountOptions, HubRecord } from "./types";

const DEFAULT_MANIFEST_URL = "./hub.manifest.json";
const ROOT_CLASS = "hrv-explorations-hub";
const ARCHIVE_HASH_PREFIX = "#hrv-explorations/archive/";
const HOME_HASH = "#hrv-explorations";
const mounted = new WeakMap<HTMLElement, HubController>();

function element<K extends keyof HTMLElementTagNameMap>(tag: K, className?: string, text?: string): HTMLElementTagNameMap[K] {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function safeExternalLink(url: string | null): string | null {
  if (!url) return null;
  try {
    const parsed = new URL(url, window.location.href);
    return parsed.protocol === "https:" ? parsed.href : null;
  } catch {
    return null;
  }
}

function schoolYearDisplay(manifest: HubManifest, id: string): string {
  return manifest.schoolYears.find((year) => year.id === id)?.display ?? id.replace("-", "–");
}

function assertManifest(value: unknown): asserts value is HubManifest {
  if (!value || typeof value !== "object") throw new Error("Hub manifest is not an object.");
  const manifest = value as Partial<HubManifest>;
  if (manifest.schemaVersion !== "1.0") throw new Error("Unsupported Hub manifest schema.");
  if (manifest.page?.id !== "classroom-explorations-hub") throw new Error("Unexpected Hub manifest page id.");
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

function createAction(label: string, href: string, className = "hrv-hub-button"): HTMLAnchorElement {
  const link = element("a", className, label);
  link.href = href;
  return link;
}

function createMedia(record: HubRecord, modifier = ""): HTMLElement {
  const media = element("div", `hrv-hub-media ${modifier}`.trim());
  media.dataset.theme = record.theme;
  media.dataset.animation = record.animation;
  if (record.imageUrl) {
    const image = element("img");
    image.src = record.imageUrl;
    image.alt = record.imageAlt ?? "";
    image.loading = "lazy";
    image.decoding = "async";
    media.append(image);
  } else {
    const emoji = element("span", "hrv-hub-media__emoji", record.emoji);
    emoji.setAttribute("aria-hidden", "true");
    media.append(emoji);
  }
  return media;
}

function createArchiveCard(record: HubRecord): HTMLElement {
  const article = element("article", "hrv-hub-archive-card");
  article.dataset.type = record.type;
  article.dataset.recordId = record.id;
  article.append(createMedia(record, "hrv-hub-archive-card__media"));

  const body = element("div", "hrv-hub-archive-card__body");
  const eyebrow = element("p", "hrv-hub-eyebrow", record.type === "exploration" ? "Exploration" : "This Week We Learned");
  const title = element("h3", "hrv-hub-archive-card__title", record.title);
  const summary = element("p", "hrv-hub-archive-card__summary", record.summary);
  body.append(eyebrow, title, summary);

  if (record.notice) {
    const notice = element("p", "hrv-hub-notice", record.notice);
    notice.setAttribute("role", "note");
    body.append(notice);
  }

  const href = safeExternalLink(record.pageUrl);
  if (href) body.append(createAction("Open exhibit", href, "hrv-hub-text-link"));
  article.append(body);
  return article;
}

class HubController {
  private manifest: HubManifest | null = null;
  private destroyed = false;
  private readonly onHashChange = () => this.renderRoute();

  constructor(private readonly root: HTMLElement, private readonly options: HubMountOptions) {}

  async start(): Promise<void> {
    this.prepareRoot();
    this.renderLoading();
    try {
      this.manifest = await loadManifest(this.options.manifestUrl ?? DEFAULT_MANIFEST_URL);
      if (this.destroyed) return;
      window.addEventListener("hashchange", this.onHashChange);
      this.renderRoute();
    } catch (error) {
      if (!this.destroyed) this.renderFailure(error instanceof Error ? error.message : "The Hub could not be loaded.");
    }
  }

  destroy(): void {
    this.destroyed = true;
    window.removeEventListener("hashchange", this.onHashChange);
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

  private renderLoading(): void {
    const state = element("div", "hrv-hub-state");
    state.setAttribute("role", "status");
    state.append(element("span", "hrv-hub-state__icon", "🧭"), element("p", "hrv-hub-state__title", "Opening the discovery museum…"));
    this.root.replaceChildren(state);
  }

  private renderFailure(message: string): void {
    this.root.removeAttribute("aria-busy");
    const state = element("div", "hrv-hub-state hrv-hub-state--error");
    state.setAttribute("role", "alert");
    state.append(
      element("p", "hrv-hub-eyebrow", "Museum doors temporarily closed"),
      element("h2", "hrv-hub-state__title", "Classroom Explorations could not open."),
      element("p", "hrv-hub-state__copy", message),
      createAction("Open the Zinnia project", "https://rmhughes.edublogs.org/zinnia-page/"),
    );
    this.root.replaceChildren(state);
  }

  private renderRoute(): void {
    if (!this.manifest) return;
    this.root.removeAttribute("aria-busy");
    const hash = window.location.hash;
    if (hash.startsWith(ARCHIVE_HASH_PREFIX)) {
      this.renderArchive(hash.slice(ARCHIVE_HASH_PREFIX.length));
    } else {
      this.renderHome();
    }
  }

  private renderShell(main: HTMLElement): void {
    const skip = createAction("Skip to Hub content", "#hrv-explorations-main", "hrv-hub-skip-link");
    const shell = element("div", "hrv-hub-shell");
    shell.append(main);
    this.root.replaceChildren(skip, shell);
  }

  private renderHome(): void {
    const manifest = this.manifest!;
    const year = manifest.page.currentSchoolYear;
    const currentExploration = manifest.records.find((record) => record.schoolYear === year && record.type === "exploration" && record.status === "current");
    const currentTwwl = manifest.records.find((record) => record.schoolYear === year && record.type === "twwl" && ["current", "coming-soon"].includes(record.status));
    const video = manifest.records.find((record) => record.schoolYear === year && record.type === "video" && record.status === "current");
    const pastExplorations = manifest.records.filter((record) => record.schoolYear === year && record.type === "exploration" && ["past", "archived"].includes(record.status));
    const pastTwwl = manifest.records.filter((record) => record.schoolYear === year && record.type === "twwl" && ["past", "archived"].includes(record.status));
    const doorways = manifest.records.filter((record) => record.type === "archive-doorway").sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));

    const main = element("main", "hrv-hub-main");
    main.id = "hrv-explorations-main";
    main.append(this.createHero(manifest));
    if (video) main.append(this.createVideo(video));
    if (currentExploration) main.append(this.createCurrentExploration(currentExploration));
    if (currentTwwl) main.append(this.createCurrentTwwl(currentTwwl, doorways[0]));
    main.append(this.createCurrentArchiveSection("Past Explorations", "Completed explorations from this school year will gather here.", pastExplorations, "exploration"));
    main.append(this.createCurrentArchiveSection("Past This Week We Learned", "Approved learning recaps from this school year will gather here.", pastTwwl, "twwl"));
    main.append(this.createArchiveDoorways(doorways));
    main.append(this.createFooter());
    this.renderShell(main);
  }

  private createHero(manifest: HubManifest): HTMLElement {
    const hero = element("header", "hrv-hub-hero");
    const compass = element("div", "hrv-hub-compass");
    compass.setAttribute("aria-hidden", "true");
    compass.innerHTML = '<span class="hrv-hub-compass__ring"></span><span class="hrv-hub-compass__needle">◆</span>';
    const copy = element("div", "hrv-hub-hero__copy");
    copy.append(
      element("p", "hrv-hub-eyebrow", "Museum Entrance • Discovery Hub"),
      element("h1", "hrv-hub-hero__title", manifest.page.title),
      element("p", "hrv-hub-hero__summary", manifest.page.summary),
    );
    const oath = element("aside", "hrv-hub-oath");
    oath.append(element("strong", "hrv-hub-oath__title", "Exploration Oath"), element("p", "", "We observe closely, ask brave questions, test ideas safely, and share what we learn."));
    hero.append(compass, copy, oath);
    return hero;
  }

  private createVideo(record: HubRecord): HTMLElement {
    const section = element("section", "hrv-hub-section hrv-hub-video");
    section.append(element("p", "hrv-hub-eyebrow", "Welcome Theater"), element("h2", "hrv-hub-section__title", record.title), element("p", "hrv-hub-section__lead", record.summary));
    const embedUrl = record.media?.embedUrl;
    if (embedUrl?.startsWith("https://www.youtube-nocookie.com/embed/")) {
      const frameWrap = element("div", "hrv-hub-video__frame");
      const iframe = element("iframe");
      iframe.src = embedUrl;
      iframe.title = record.title;
      iframe.loading = "lazy";
      iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
      iframe.allowFullscreen = true;
      frameWrap.append(iframe);
      section.append(frameWrap);
    }
    return section;
  }

  private createCurrentExploration(record: HubRecord): HTMLElement {
    const section = element("section", "hrv-hub-feature hrv-hub-feature--exploration");
    const copy = element("div", "hrv-hub-feature__copy");
    copy.append(element("p", "hrv-hub-eyebrow", "Current Exploration"), element("h2", "hrv-hub-feature__title", record.title), element("p", "hrv-hub-feature__summary", record.summary));
    if (record.learningPoints?.length) {
      const list = element("ul", "hrv-hub-points");
      record.learningPoints.forEach((point) => list.append(element("li", "", point)));
      copy.append(list);
    }
    const href = safeExternalLink(record.pageUrl);
    if (href) copy.append(createAction("Explore now", href));
    section.append(copy, createMedia(record, "hrv-hub-feature__media"));
    return section;
  }

  private createCurrentTwwl(record: HubRecord, archiveDoorway?: HubRecord): HTMLElement {
    const section = element("section", "hrv-hub-feature hrv-hub-feature--twwl");
    const copy = element("div", "hrv-hub-feature__copy");
    copy.append(element("p", "hrv-hub-eyebrow", "This Week We Learned"), element("h2", "hrv-hub-feature__title", record.title), element("p", "hrv-hub-feature__summary", record.summary));
    const actions = element("div", "hrv-hub-actions");
    if (record.status === "coming-soon") {
      const badge = element("span", "hrv-hub-coming-soon", "Coming Soon");
      badge.setAttribute("role", "status");
      actions.append(badge);
    } else {
      const href = safeExternalLink(record.pageUrl);
      if (href) actions.append(createAction("Read this recap", href));
    }
    if (archiveDoorway?.archiveSchoolYear) actions.append(createAction("Open previous learning", `${ARCHIVE_HASH_PREFIX}${archiveDoorway.archiveSchoolYear}`, "hrv-hub-button hrv-hub-button--secondary"));
    copy.append(actions);
    section.append(copy, createMedia(record, "hrv-hub-feature__media"));
    return section;
  }

  private createCurrentArchiveSection(title: string, emptyCopy: string, records: HubRecord[], type: "exploration" | "twwl"): HTMLElement {
    const section = element("section", `hrv-hub-section hrv-hub-current-past hrv-hub-current-past--${type}`);
    section.append(element("p", "hrv-hub-eyebrow", "Current-year archive"), element("h2", "hrv-hub-section__title", title));
    if (records.length === 0) {
      section.append(element("p", "hrv-hub-empty", emptyCopy));
    } else {
      const grid = element("div", "hrv-hub-card-grid");
      records.forEach((record) => grid.append(createArchiveCard(record)));
      section.append(grid);
    }
    return section;
  }

  private createArchiveDoorways(records: HubRecord[]): HTMLElement {
    const section = element("section", "hrv-hub-section hrv-hub-archive-doorways");
    section.append(element("p", "hrv-hub-eyebrow", "Archive Gallery"), element("h2", "hrv-hub-section__title", "Previous school years"), element("p", "hrv-hub-section__lead", "Completed classroom work stays easy to revisit without competing with what is happening now."));
    const grid = element("div", "hrv-hub-door-grid");
    for (const record of records) {
      const card = element("article", "hrv-hub-door");
      card.append(element("span", "hrv-hub-door__emoji", record.emoji), element("h3", "hrv-hub-door__title", record.title), element("p", "hrv-hub-door__summary", record.summary));
      if (record.archiveSchoolYear) card.append(createAction(`Enter ${schoolYearDisplay(this.manifest!, record.archiveSchoolYear)} archive`, `${ARCHIVE_HASH_PREFIX}${record.archiveSchoolYear}`));
      grid.append(card);
    }
    section.append(grid);
    return section;
  }

  private renderArchive(year: string): void {
    const manifest = this.manifest!;
    const knownYear = manifest.schoolYears.find((item) => item.id === year && item.status === "archived");
    if (!knownYear) {
      window.location.hash = HOME_HASH;
      return;
    }
    const explorationRecords = manifest.records.filter((record) => record.schoolYear === year && record.type === "exploration" && ["past", "archived"].includes(record.status)).sort((a, b) => a.order - b.order);
    const twwlRecords = manifest.records.filter((record) => record.schoolYear === year && record.type === "twwl" && ["past", "archived"].includes(record.status)).sort((a, b) => a.order - b.order);

    const main = element("main", "hrv-hub-main hrv-hub-archive-view");
    main.id = "hrv-explorations-main";
    const header = element("header", "hrv-hub-archive-hero");
    header.append(createAction("← Back to current year", HOME_HASH, "hrv-hub-text-link"), element("p", "hrv-hub-eyebrow", "School-year archive"), element("h1", "hrv-hub-archive-hero__title", `${knownYear.display} Explorations Archive`), element("p", "hrv-hub-archive-hero__summary", "A preserved gallery of completed Explorations and weekly learning from this school year."));
    main.append(header);

    const searchWrap = element("div", "hrv-hub-search");
    const label = element("label", "hrv-hub-search__label", "Search this archive");
    label.htmlFor = "hrv-hub-archive-search";
    const input = element("input", "hrv-hub-search__input");
    input.id = "hrv-hub-archive-search";
    input.type = "search";
    input.placeholder = "Try owls, spiders, mushrooms…";
    searchWrap.append(label, input);
    main.append(searchWrap);

    const explorationSection = this.createArchiveGroup("Past Explorations", "Exploration Hall", explorationRecords);
    const twwlSection = this.createArchiveGroup("Past This Week We Learned", "Learning Gallery", twwlRecords);
    main.append(explorationSection, twwlSection, this.createFooter());
    this.renderShell(main);

    const cards = [...main.querySelectorAll<HTMLElement>(".hrv-hub-archive-card")];
    input.addEventListener("input", () => {
      const query = input.value.trim().toLocaleLowerCase();
      cards.forEach((card) => {
        const haystack = card.textContent?.toLocaleLowerCase() ?? "";
        card.hidden = query !== "" && !haystack.includes(query);
      });
    });
  }

  private createArchiveGroup(title: string, eyebrow: string, records: HubRecord[]): HTMLElement {
    const section = element("section", "hrv-hub-section hrv-hub-archive-group");
    section.append(element("p", "hrv-hub-eyebrow", eyebrow), element("h2", "hrv-hub-section__title", title));
    if (records.length === 0) {
      section.append(element("p", "hrv-hub-empty", "No verified records are available for this section."));
      return section;
    }
    const grid = element("div", "hrv-hub-card-grid");
    grid.setAttribute("role", "list");
    records.forEach((record) => {
      const card = createArchiveCard(record);
      card.setAttribute("role", "listitem");
      grid.append(card);
    });
    section.append(grid);
    return section;
  }

  private createFooter(): HTMLElement {
    const footer = element("footer", "hrv-hub-footer");
    footer.append(element("span", "", "🧭 Classroom Explorations"), createAction("Return to Hughes Room Views", "https://rmhughes.edublogs.org/", "hrv-hub-text-link"));
    return footer;
  }
}

export function mountClassroomExplorationsHub(root: HTMLElement | null, options: HubMountOptions = {}): { ready: Promise<void>; destroy: () => void } {
  if (!root) throw new Error("Classroom Explorations Hub mount root was not found.");
  const existing = mounted.get(root);
  if (existing) return { ready: Promise.resolve(), destroy: () => existing.destroy() };
  const controller = new HubController(root, options);
  mounted.set(root, controller);
  const ready = controller.start();
  return { ready, destroy: () => controller.destroy() };
}
