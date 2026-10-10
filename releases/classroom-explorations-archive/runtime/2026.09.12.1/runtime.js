const mounted = new WeakMap();

const APP_CLASSES = ["hrv-classroom-hub", "hrv-classroom-explorations-archive"];
const PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";

const SITE_NAVIGATION = [
  ["Home", "https://rmhughes.edublogs.org/"],
  ["Hughes Monthly Calendar", "https://rmhughes.edublogs.org/hughes-monthly-calendar/"],
  ["Posts", "https://rmhughes.edublogs.org/posts/"],
  ["Hughes Class Library", "https://rmhughes.edublogs.org/class-library/"],
  ["Photo Album", "https://rmhughes.edublogs.org/photo-album/"],
  ["Classroom Explorations", "https://rmhughes.edublogs.org/hub/"],
  ["Contact Information", "https://rmhughes.edublogs.org/contact-information/"]
];

const SUBJECT_CLASS = new Map([
  ["great-barrier-reef", "subject-reef"],
  ["mushrooms", "subject-mushrooms"],
  ["butterflies-in-the-classroom", "subject-caterpillars"],
  ["botany-lets-talk-about-tubers", "subject-tubers"],
  ["traditions-of-russian-winter", "subject-winter"],
  ["silent-wings-wise-eyes-learning-about-owls", "subject-owls"],
  ["bats-dont-go-bump-in-the-night", "subject-bats"],
  ["autumn-spiders-gentle-web-artists", "subject-spiders"]
]);

const DEFAULT_COPY = Object.freeze({
  identityTitle: "Classroom Explorations",
  identitySummary: "A living museum of questions, experiments, field notes, and student-made discoveries.",
  eyebrow: "School-Year Collection",
  title: "Classroom Explorations: 2025–2026 Archive",
  intro: "Step back into last year’s classroom museum. These exhibits and learning displays are preserved here so families and students can revisit the discoveries anytime.",
  invitation: "Choose a gallery, then open any card to revisit the original classroom page.",
  explorationsEyebrow: "Exploration Gallery",
  explorationsTitle: "Past Explorations",
  explorationsIntro: "Hands-on investigations and classroom projects from the 2025–2026 school year.",
  explorationsEmpty: "No exploration exhibits are preserved in this collection yet.",
  twwlEyebrow: "Learning Memory Hall",
  twwlTitle: "Past “This Week We Learned”",
  twwlIntro: "Weekly learning displays preserved from the 2025–2026 classroom year.",
  twwlEmpty: "No weekly learning displays are preserved in this collection yet.",
  footerText: "The museum doors stay open for old discoveries."
});

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function link(label, href, className) {
  const anchor = node("a", className, label);
  anchor.href = href;
  return anchor;
}

function setEditable(element, nodeId) {
  if (nodeId) element.dataset.hrvNodeId = nodeId;
  return element;
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function subjectClass(item) {
  return SUBJECT_CLASS.get(item?.id) || "subject-generic";
}

function imageNode(image, className, loading = "lazy") {
  const img = node("img", className);
  if (image?.src) img.src = image.src;
  img.alt = image?.alt || "";
  img.loading = loading;
  img.decoding = "async";
  return img;
}

function tagList(tags) {
  const list = node("ul", "collection-tags");
  for (const tag of tags || []) list.append(node("li", "", tag));
  return list;
}

function normalizedCopy(page) {
  const copy = page?.copy || {};
  const hero = copy.hero || {};
  const explorations = copy.explorations || {};
  const twwl = copy.twwl || copy.learning || {};
  const navigation = copy.navigation || {};

  return {
    identityTitle: copy.identityTitle || DEFAULT_COPY.identityTitle,
    identitySummary: copy.identitySummary || DEFAULT_COPY.identitySummary,
    heroNodeId: hero.nodeId,
    eyebrow: hero.eyebrow || copy.eyebrow || DEFAULT_COPY.eyebrow,
    title: hero.title || copy.title || page?.title || DEFAULT_COPY.title,
    intro: hero.intro || copy.intro || DEFAULT_COPY.intro,
    invitation: hero.invitation || copy.invitation || "",
    explorationsNodeId: explorations.nodeId,
    explorationsEyebrow: explorations.eyebrow || copy.explorationsEyebrow || DEFAULT_COPY.explorationsEyebrow,
    explorationsTitle: explorations.title || copy.explorationsTitle || DEFAULT_COPY.explorationsTitle,
    explorationsIntro: explorations.intro || copy.explorationsIntro || DEFAULT_COPY.explorationsIntro,
    explorationsEmpty: explorations.emptyText || copy.explorationsEmpty || DEFAULT_COPY.explorationsEmpty,
    twwlNodeId: twwl.nodeId,
    twwlEyebrow: twwl.eyebrow || copy.twwlEyebrow || DEFAULT_COPY.twwlEyebrow,
    twwlTitle: twwl.title || copy.twwlTitle || DEFAULT_COPY.twwlTitle,
    twwlIntro: twwl.intro || copy.twwlIntro || DEFAULT_COPY.twwlIntro,
    twwlEmpty: twwl.emptyText || copy.twwlEmpty || DEFAULT_COPY.twwlEmpty,
    navigationNodeId: navigation.nodeId,
    backLabel: navigation.backLabel || "← Back to Current Classroom Explorations",
    returnLabel: navigation.returnLabel || "Return to the current school year →",
    footerNodeId: copy.footer?.nodeId,
    footerText: copy.footer?.text || copy.footerText || DEFAULT_COPY.footerText
  };
}

function compassGraphic() {
  const wrap = node("div", "hub-compass archive-compass");
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `
    <svg viewBox="0 0 140 140" focusable="false">
      <defs>
        <radialGradient id="archiveCompassGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff5be" stop-opacity=".95"></stop>
          <stop offset=".44" stop-color="#f4cf72" stop-opacity=".52"></stop>
          <stop offset="1" stop-color="#7fdac3" stop-opacity="0"></stop>
        </radialGradient>
        <linearGradient id="archiveCompassRing" x1="0" x2="1">
          <stop offset="0" stop-color="#7fdac3"></stop>
          <stop offset=".5" stop-color="#fff1ac"></stop>
          <stop offset="1" stop-color="#9ab5ff"></stop>
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill="url(#archiveCompassGlow)"></circle>
      <circle class="compass-orbit" cx="70" cy="70" r="49" fill="none" stroke="url(#archiveCompassRing)" stroke-width="3"></circle>
      <circle cx="70" cy="70" r="37" fill="rgba(8,17,40,.84)" stroke="rgba(255,255,255,.3)" stroke-width="1"></circle>
      <path class="compass-needle" d="M70 28 L80 71 L70 112 L60 71 Z" fill="#fff2b4"></path>
      <path d="M70 28 L70 112" stroke="#76dec4" stroke-width="2" opacity=".85"></path>
      <circle cx="70" cy="70" r="5" fill="#fff"></circle>
      <circle cx="70" cy="70" r="2" fill="#203a6b"></circle>
    </svg>`;
  return wrap;
}

class ArchiveController {
  constructor(root, manifest, runtimeAssets = {}) {
    this.root = root;
    this.manifest = manifest;
    this.runtimeAssets = runtimeAssets;
    this.listeners = [];
    this.observers = [];
    this.destroyed = false;
  }

  on(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  start() {
    this.root.classList.add(...APP_CLASSES);
    this.root.dataset.hrvPageId = this.manifest.page.id;
    this.root.dataset.hrvRuntimeSchema = this.manifest.runtimeSchemaVersion;
    this.root.dataset.hrvSnapshot = this.manifest.snapshotId;
    this.root.dataset.hrvState = "mounting";
    this.root.dataset.systemMotion = prefersReducedMotion() ? "reduced" : "standard";

    this.render();
    this.wireSystemMotionPreference();
    this.wireWakeUp();
    this.wireAmbientVisibility();
    this.wirePointerLight();

    requestAnimationFrame(() => {
      if (!this.destroyed) this.root.classList.add("museum-awake");
    });

    this.root.dataset.hrvState = "ready";
    this.root.removeAttribute("aria-busy");
    document.documentElement.classList.add("hrv-page-classroom-explorations-archive-ready");
    window.dispatchEvent(new CustomEvent("hrv:page-ready", {
      detail: { pageId: this.manifest.page.id, snapshotId: this.manifest.snapshotId }
    }));
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listeners.splice(0).forEach((off) => off());
    this.observers.splice(0).forEach((observer) => observer.disconnect());
    document.documentElement.classList.remove("hrv-page-classroom-explorations-archive-ready");
    this.root.classList.remove(...APP_CLASSES, "museum-awake");
    this.root.replaceChildren();
    ["hrvPageId", "hrvRuntimeSchema", "hrvSnapshot", "hrvState", "systemMotion"]
      .forEach((key) => delete this.root.dataset[key]);
    for (const url of Object.values(this.runtimeAssets.artwork || {})) {
      if (typeof url === "string" && url.startsWith("blob:")) URL.revokeObjectURL(url);
    }
    this.runtimeAssets = {};
    mounted.delete(this.root);
  }

  wireSystemMotionPreference() {
    const query = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!query) return;
    this.on(query, "change", () => {
      this.root.dataset.systemMotion = query.matches ? "reduced" : "standard";
    });
  }

  wireWakeUp() {
    const targets = [...this.root.querySelectorAll("[data-wake]")];
    if (this.root.dataset.systemMotion === "reduced" || !("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("is-awake"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-awake");
        observer.unobserve(entry.target);
      }
    }, { rootMargin: "0px 0px 10% 0px", threshold: 0.05 });

    targets.forEach((element) => observer.observe(element));
    this.observers.push(observer);
  }

  wireAmbientVisibility() {
    const targets = [...this.root.querySelectorAll(".hub-section")];
    if (!("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("is-in-view"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) entry.target.classList.toggle("is-in-view", entry.isIntersecting);
    }, { rootMargin: "220px 0px", threshold: 0 });

    targets.forEach((element) => observer.observe(element));
    this.observers.push(observer);
  }

  wirePointerLight() {
    for (const target of this.root.querySelectorAll("[data-pointer-light]")) {
      let animationFrame = 0;
      let latestPoint = null;

      const move = (event) => {
        if (prefersReducedMotion() || this.root.dataset.systemMotion === "reduced") return;
        latestPoint = { x: event.clientX, y: event.clientY };
        if (animationFrame) return;
        animationFrame = requestAnimationFrame(() => {
          animationFrame = 0;
          if (!latestPoint || this.destroyed) return;
          const rect = target.getBoundingClientRect();
          const x = Math.min(1, Math.max(0, (latestPoint.x - rect.left) / Math.max(rect.width, 1)));
          const y = Math.min(1, Math.max(0, (latestPoint.y - rect.top) / Math.max(rect.height, 1)));
          target.style.setProperty("--pointer-x", `${Math.round(x * 100)}%`);
          target.style.setProperty("--pointer-y", `${Math.round(y * 100)}%`);
          target.classList.add("is-pointer-active");
        });
      };

      const leave = () => {
        latestPoint = null;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        target.classList.remove("is-pointer-active");
        target.style.removeProperty("--pointer-x");
        target.style.removeProperty("--pointer-y");
      };

      this.on(target, "pointermove", move, { passive: true });
      this.on(target, "pointerleave", leave, { passive: true });
      this.listeners.push(() => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      });
    }
  }

  render() {
    const page = this.manifest.page;
    const copy = normalizedCopy(page);
    const collections = this.manifest.collections || this.manifest.galleries || {};
    const explorations = collections.explorations || [];
    const twwl = collections.twwl || [];

    const skip = link("Skip to archive galleries", "#hrv-archive-galleries", "hub-skip");
    const museum = node("main", "hub-museum archive-museum");
    museum.id = "hrv-classroom-explorations-archive";

    const environment = node("div", "museum-environment");
    environment.setAttribute("aria-hidden", "true");
    environment.innerHTML = `
      <span class="environment-aurora aurora-one"></span>
      <span class="environment-aurora aurora-two"></span>
      <span class="environment-starfield starfield-one"></span>
      <span class="environment-starfield starfield-two"></span>
      <span class="environment-light light-one"></span>
      <span class="environment-light light-two"></span>`;

    museum.append(
      environment,
      this.bannerFrameLayer(),
      this.identity(copy, page),
      this.siteNavigation(page.hubHref, copy.navigationNodeId),
      this.overview(copy, page, explorations.length, twwl.length),
      this.collections(copy, explorations, twwl),
      this.footer(copy, page.hubHref)
    );

    this.root.replaceChildren(skip, museum);
  }

  bannerFrameLayer() {
    const layer = node("div", "hub-banner-frame-layer");
    layer.setAttribute("aria-hidden", "true");
    const frames = [
      ["frameTopLeft", "top", "left"],
      ["frameTopRight", "top", "right"],
      ["frameMiddleLeft", "middle", "left"],
      ["frameMiddleRight", "middle", "right"],
      ["frameBottomLeft", "bottom", "left"],
      ["frameBottomRight", "bottom", "right"]
    ];

    for (const [key, position, side] of frames) {
      const frame = node("img", `hub-banner-frame-piece hub-banner-frame-${position}-${side}`);
      const artworkUrl = this.runtimeAssets.artwork?.[key];
      if (artworkUrl) frame.src = artworkUrl;
      frame.alt = "";
      frame.decoding = "async";
      frame.draggable = false;
      frame.dataset.frameKey = key;
      layer.append(frame);
    }
    return layer;
  }

  identity(copy, page) {
    const section = node("header", "hub-section archive-identity-section");
    section.dataset.wake = "";
    const shell = node("div", "museum-shell archive-shell");
    const card = node("div", "hub-card archive-identity-card");
    card.dataset.pointerLight = "";

    const identity = node("div", "archive-identity-copy");
    identity.append(
      node("p", "archive-identity-title", copy.identityTitle),
      node("p", "archive-identity-summary", copy.identitySummary)
    );

    const year = node("div", "archive-identity-year");
    year.append(
      node("span", "archive-year-label", "Museum Archive"),
      node("strong", "", page.schoolYearLabel || page.schoolYear)
    );

    const artwork = imageNode({
      src: this.runtimeAssets.artwork?.pastYears || "",
      alt: ""
    }, "archive-identity-artwork", "eager");
    artwork.setAttribute("aria-hidden", "true");

    card.append(identity, year, artwork);
    shell.append(card);
    section.append(shell);
    return section;
  }

  siteNavigation(hubHref, nodeId) {
    const navigation = setEditable(node("nav", "site-navigation archive-site-navigation"), nodeId);
    navigation.setAttribute("aria-label", "Hughes Room Views site navigation");
    const shell = node("div", "museum-shell site-navigation-shell archive-shell");
    const links = node("div", "site-navigation-links");

    for (const [label, defaultHref] of SITE_NAVIGATION) {
      const href = label === "Classroom Explorations" ? hubHref : defaultHref;
      const anchor = link(label, href, "site-navigation-link");
      if (label === "Classroom Explorations") {
        anchor.classList.add("is-parent-context");
      }
      links.append(anchor);
    }

    shell.append(links);
    navigation.append(shell);
    return navigation;
  }

  overview(copy, page, explorationCount, twwlCount) {
    const section = setEditable(node("section", "hub-section archive-overview-section"), copy.heroNodeId);
    section.dataset.wake = "";
    const shell = node("div", "museum-shell archive-shell");
    const card = node("div", "hub-card archive-overview-card");
    card.dataset.pointerLight = "";

    const main = node("div", "archive-overview-copy");
    main.append(
      node("p", "section-kicker archive-kicker", copy.eyebrow),
      node("h1", "archive-page-title", copy.title),
      node("p", "archive-page-intro", copy.intro)
    );
    if (copy.invitation) main.append(node("p", "archive-page-invitation", copy.invitation));
    main.append(this.returnLink(page.hubHref, copy.backLabel));

    const orientation = node("aside", "archive-orientation");
    orientation.setAttribute("aria-label", "Archive collection summary");
    orientation.append(compassGraphic());
    const summary = node("div", "archive-orientation-copy");
    summary.append(node("p", "archive-orientation-title", `${page.schoolYearLabel || page.schoolYear} at a glance`));

    const stats = node("dl", "archive-stats");
    for (const [value, label] of [
      [explorationCount, "Explorations"],
      [twwlCount, "Learning displays"],
      [explorationCount + twwlCount, "Preserved pages"]
    ]) {
      const stat = node("div", "archive-stat");
      stat.append(node("dt", "", label), node("dd", "", String(value)));
      stats.append(stat);
    }
    summary.append(stats, node("p", "archive-preserved-note", "Preserved together. Ready to revisit."));
    orientation.append(summary);

    card.append(main, orientation);
    shell.append(card);
    section.append(shell);
    return section;
  }

  returnLink(href, label) {
    const anchor = link(label, href, "archive-return-link");
    anchor.setAttribute("data-archive-return", "");
    return anchor;
  }

  collections(copy, explorations, twwl) {
    const section = node("section", "hub-section archive-collections-section");
    section.id = "hrv-archive-galleries";
    section.dataset.wake = "";
    const shell = node("div", "museum-shell archive-shell archive-collections-grid");

    shell.append(
      this.gallery({
        id: "archive-explorations",
        className: "archive-explorations-gallery exploration-gallery-frame",
        eyebrow: copy.explorationsEyebrow,
        title: copy.explorationsTitle,
        intro: copy.explorationsIntro,
        emptyText: copy.explorationsEmpty,
        searchLabel: "Filter archived explorations",
        noun: "exhibit",
        cardLabel: "Past Exhibit",
        action: "Revisit exhibit",
        items: explorations,
        cardType: "exploration",
        nodeId: copy.explorationsNodeId
      }),
      this.gallery({
        id: "archive-twwl",
        className: "archive-twwl-gallery learning-gallery-frame",
        eyebrow: copy.twwlEyebrow,
        title: copy.twwlTitle,
        intro: copy.twwlIntro,
        emptyText: copy.twwlEmpty,
        searchLabel: "Filter archived This Week We Learned displays",
        noun: "learning display",
        cardLabel: "Past Learning",
        action: "Open learning display",
        items: twwl,
        cardType: "learning",
        nodeId: copy.twwlNodeId
      })
    );

    section.append(shell);
    return section;
  }

  gallery(config) {
    const panel = setEditable(node("section", `hub-card archive-gallery ${config.className}`), config.nodeId);
    panel.setAttribute("aria-labelledby", `${config.id}-title`);
    const header = node("header", "archive-gallery-header");
    const heading = node("div", "archive-gallery-heading");
    heading.append(
      node("p", "section-kicker", config.eyebrow),
      node("h2", "archive-gallery-title", config.title),
      node("p", "archive-gallery-intro", config.intro)
    );
    heading.querySelector("h2").id = `${config.id}-title`;

    const tools = node("div", "archive-gallery-tools");
    const input = node("input", "gallery-search");
    input.type = "search";
    input.placeholder = "Filter by title or tag…";
    input.setAttribute("aria-label", config.searchLabel);
    input.setAttribute("aria-controls", `${config.id}-grid`);
    input.autocomplete = "off";
    const count = node("p", "gallery-count");
    count.setAttribute("aria-live", "polite");
    tools.append(input, count);
    header.append(heading, tools);
    panel.append(header);

    if (!config.items.length) {
      input.disabled = true;
      count.textContent = `0 ${config.noun}s on display`;
      panel.append(this.emptyGallery(config.emptyText));
      return panel;
    }

    const grid = node("div", `archive-card-grid archive-${config.cardType}-grid`);
    grid.id = `${config.id}-grid`;
    const cards = config.items.map((item, index) => this.collectionCard(item, index, config));
    cards.forEach((card) => grid.append(card));

    const noResults = node("p", "archive-no-results", config.emptyText);
    noResults.hidden = true;
    noResults.setAttribute("role", "status");
    panel.append(grid, noResults);
    this.wireGallerySearch(input, cards, count, noResults, config.noun);
    return panel;
  }

  collectionCard(item, index, config) {
    const article = node("article", `collection-card archive-collection-card ${config.cardType}-card ${subjectClass(item)}`);
    article.dataset.hrvContentId = item.id;
    article.dataset.searchText = [item.title, item.summary, ...(item.tags || [])]
      .filter(Boolean)
      .join(" ")
      .toLocaleLowerCase();
    article.style.setProperty("--wake-delay", `${Math.min(index * 65, 260)}ms`);

    const anchor = link("", item.href, "collection-link");
    anchor.setAttribute("aria-label", `Open ${item.title}`);
    const visual = node("div", "collection-visual");
    visual.append(
      imageNode(item.image, "collection-image", index < 3 ? "eager" : "lazy"),
      node("span", "collection-effect"),
      node("span", "collection-label", config.cardLabel),
      node("span", "collection-year", item.schoolYearLabel || item.schoolYear || this.manifest.page.schoolYearLabel)
    );

    const meta = node("div", "collection-meta");
    meta.append(
      node("h3", "collection-title", item.title),
      node("p", "collection-summary", item.summary),
      tagList(item.tags),
      node("span", "collection-enter", config.action)
    );
    anchor.append(visual, meta);
    article.append(anchor);
    return article;
  }

  wireGallerySearch(input, cards, countNode, noResults, noun) {
    const update = () => {
      const query = input.value.trim().toLocaleLowerCase();
      let visible = 0;
      for (const card of cards) {
        const matches = !query || card.dataset.searchText.includes(query);
        card.hidden = !matches;
        if (matches) visible += 1;
      }
      countNode.textContent = `${visible} ${noun}${visible === 1 ? "" : "s"} on display`;
      noResults.hidden = visible !== 0;
    };
    update();
    this.on(input, "input", update);
  }

  emptyGallery(text) {
    const empty = node("div", "empty-gallery");
    empty.append(node("span", "empty-gallery-light"), node("p", "", text));
    return empty;
  }

  footer(copy, hubHref) {
    const footer = setEditable(node("footer", "hub-footer archive-footer"), copy.footerNodeId);
    const shell = node("div", "museum-shell archive-shell archive-footer-shell");
    const message = node("div", "archive-footer-message");
    message.append(
      node("span", "footer-spark"),
      node("p", "footer-message", copy.footerText),
      node("span", "footer-spark")
    );
    shell.append(message, this.returnLink(hubHref, copy.returnLabel));
    footer.append(shell);
    return footer;
  }
}

export function mountClassroomExplorationsArchive(root, manifest, runtimeAssets = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError("Classroom Explorations archive mount requires an HTMLElement.");
  }

  const existing = mounted.get(root);
  if (existing) return existing;

  if (
    !manifest ||
    manifest.runtimeSchemaVersion !== "1.0" ||
    manifest.page?.id !== PAGE_ID ||
    !manifest.page?.hubHref ||
    !(manifest.collections || manifest.galleries)
  ) {
    throw new Error("Unsupported Classroom Explorations archive runtime manifest.");
  }

  const controller = new ArchiveController(root, manifest, runtimeAssets);
  mounted.set(root, controller);
  controller.start();
  return controller;
}

export function unmountClassroomExplorationsArchive(root) {
  mounted.get(root)?.destroy();
}
