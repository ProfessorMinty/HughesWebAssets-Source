const mounted = new WeakMap();

const APP_CLASS = "hrv-classroom-hub";
const EFFECTS_KEY = "hrv:classroom-explorations:reduced-effects";

const SUBJECT_CLASS = new Map([
  ["summer-bloom-adoption-project", "subject-zinnia"],
  ["great-barrier-reef", "subject-reef"],
  ["mushrooms", "subject-mushrooms"],
  ["caterpillars-in-the-classroom-historical", "subject-caterpillars"],
  ["botany-lets-talk-about-tubers", "subject-tubers"],
  ["traditions-of-russian-winter", "subject-winter"],
  ["silent-wings-wise-eyes-learning-about-owls", "subject-owls"],
  ["bats-dont-go-bump-in-the-night", "subject-bats"],
  ["autumn-spiders-gentle-web-artists", "subject-spiders"]
]);

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function setEditable(element, nodeId) {
  if (nodeId) element.dataset.hrvNodeId = nodeId;
  return element;
}

function subjectClass(item) {
  return SUBJECT_CLASS.get(item?.id) || "subject-generic";
}

function link(label, href, className = "hub-action") {
  const anchor = node("a", className, label);
  anchor.href = href;
  return anchor;
}

function readReducedPreference() {
  try {
    return localStorage.getItem(EFFECTS_KEY) === "true";
  } catch {
    return false;
  }
}

function writeReducedPreference(value) {
  try {
    localStorage.setItem(EFFECTS_KEY, String(value));
  } catch {}
}

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function imageNode(image, className, loading = "lazy") {
  const img = node("img", className);
  if (!image) return img;
  img.src = image.src;
  img.alt = image.alt;
  img.loading = loading;
  img.decoding = "async";
  return img;
}

function tagList(tags, className = "hub-tags") {
  const list = node("ul", className);
  for (const tag of tags || []) {
    list.append(node("li", "", tag));
  }
  return list;
}

function compassGraphic(className = "hub-compass") {
  const wrap = node("div", className);
  wrap.setAttribute("aria-hidden", "true");
  wrap.innerHTML = `
    <svg viewBox="0 0 140 140" focusable="false">
      <defs>
        <radialGradient id="hubCompassGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0" stop-color="#fff5be" stop-opacity=".95"></stop>
          <stop offset=".44" stop-color="#f4cf72" stop-opacity=".52"></stop>
          <stop offset="1" stop-color="#7fdac3" stop-opacity="0"></stop>
        </radialGradient>
        <linearGradient id="hubCompassRing" x1="0" x2="1">
          <stop offset="0" stop-color="#7fdac3"></stop>
          <stop offset=".5" stop-color="#fff1ac"></stop>
          <stop offset="1" stop-color="#9ab5ff"></stop>
        </linearGradient>
      </defs>
      <circle cx="70" cy="70" r="66" fill="url(#hubCompassGlow)"></circle>
      <circle class="compass-orbit" cx="70" cy="70" r="49" fill="none" stroke="url(#hubCompassRing)" stroke-width="3"></circle>
      <circle cx="70" cy="70" r="37" fill="rgba(8,17,40,.84)" stroke="rgba(255,255,255,.3)" stroke-width="1"></circle>
      <path class="compass-needle" d="M70 28 L80 71 L70 112 L60 71 Z" fill="#fff2b4"></path>
      <path d="M70 28 L70 112" stroke="#76dec4" stroke-width="2" opacity=".85"></path>
      <circle cx="70" cy="70" r="5" fill="#fff"></circle>
      <circle cx="70" cy="70" r="2" fill="#203a6b"></circle>
    </svg>`;
  return wrap;
}

function lanternGraphic() {
  const lantern = node("div", "learning-lantern");
  lantern.setAttribute("aria-hidden", "true");
  lantern.innerHTML = `
    <span class="lantern-handle"></span>
    <span class="lantern-cap"></span>
    <span class="lantern-glass"><span class="lantern-flame"></span></span>
    <span class="lantern-base"></span>`;
  return lantern;
}

class HubController {
  constructor(root, manifest) {
    this.root = root;
    this.manifest = manifest;
    this.listeners = [];
    this.observers = [];
    this.destroyed = false;
    this.manualReduced = readReducedPreference();
  }

  on(target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(() => target.removeEventListener(type, handler, options));
  }

  start() {
    this.root.classList.add(APP_CLASS);
    this.root.dataset.hrvPageId = this.manifest.page.id;
    this.root.dataset.hrvRuntimeSchema = this.manifest.runtimeSchemaVersion;
    this.root.dataset.hrvSnapshot = this.manifest.snapshotId;
    this.root.dataset.hrvState = "mounting";
    this.root.dataset.systemMotion = prefersReducedMotion() ? "reduced" : "standard";

    this.render();
    this.applyEffects();
    this.wireSystemMotionPreference();
    this.wireWakeUp();
    this.wirePointerLight();

    requestAnimationFrame(() => {
      if (!this.destroyed) this.root.classList.add("museum-awake");
    });

    this.root.dataset.hrvState = "ready";
    this.root.removeAttribute("aria-busy");
    document.documentElement.classList.add("hrv-page-classroom-explorations-ready");

    window.dispatchEvent(new CustomEvent("hrv:page-ready", {
      detail: {
        pageId: this.manifest.page.id,
        snapshotId: this.manifest.snapshotId
      }
    }));
  }

  destroy() {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listeners.splice(0).forEach((off) => off());
    this.observers.splice(0).forEach((observer) => observer.disconnect());
    document.documentElement.classList.remove("hrv-page-classroom-explorations-ready");
    this.root.classList.remove(APP_CLASS, "museum-awake");
    this.root.replaceChildren();
    this.root.removeAttribute("data-effects");
    this.root.removeAttribute("data-system-motion");
    mounted.delete(this.root);
  }

  applyEffects() {
    this.root.dataset.effects = this.manualReduced ? "reduced" : "full";
    const button = this.root.querySelector("[data-effects-toggle]");
    if (button) {
      button.textContent = this.manualReduced ? "Reduced Effects: On" : "Reduced Effects: Off";
      button.setAttribute("aria-pressed", String(this.manualReduced));
    }

    if (this.manualReduced) {
      this.root.querySelectorAll("[data-wake]").forEach((element) => element.classList.add("is-awake"));
      this.root.querySelectorAll("[data-tilt]").forEach((element) => {
        element.style.removeProperty("--tilt-x");
        element.style.removeProperty("--tilt-y");
      });
    }
  }

  wireSystemMotionPreference() {
    const mediaQuery = window.matchMedia?.("(prefers-reduced-motion: reduce)");
    if (!mediaQuery) return;
    const handler = () => {
      this.root.dataset.systemMotion = mediaQuery.matches ? "reduced" : "standard";
    };
    this.on(mediaQuery, "change", handler);
  }

  wireWakeUp() {
    const targets = [...this.root.querySelectorAll("[data-wake]")];

    if (this.manualReduced || !("IntersectionObserver" in window)) {
      targets.forEach((element) => element.classList.add("is-awake"));
      return;
    }

    const observer = new IntersectionObserver((entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-awake");
        observer.unobserve(entry.target);
      }
    }, {
      rootMargin: "0px 0px -8% 0px",
      threshold: 0.12
    });

    targets.forEach((element) => observer.observe(element));
    this.observers.push(observer);
  }

  wirePointerLight() {
    const targets = [...this.root.querySelectorAll("[data-tilt]")];

    for (const target of targets) {
      const move = (event) => {
        if (this.manualReduced || this.root.dataset.systemMotion === "reduced") return;
        const rect = target.getBoundingClientRect();
        const x = (event.clientX - rect.left) / Math.max(rect.width, 1);
        const y = (event.clientY - rect.top) / Math.max(rect.height, 1);
        target.style.setProperty("--pointer-x", `${Math.round(x * 100)}%`);
        target.style.setProperty("--pointer-y", `${Math.round(y * 100)}%`);
        target.style.setProperty("--tilt-x", `${((.5 - y) * 2.2).toFixed(2)}deg`);
        target.style.setProperty("--tilt-y", `${((x - .5) * 2.8).toFixed(2)}deg`);
      };

      const leave = () => {
        target.style.removeProperty("--tilt-x");
        target.style.removeProperty("--tilt-y");
      };

      this.on(target, "pointermove", move, { passive: true });
      this.on(target, "pointerleave", leave, { passive: true });
    }
  }

  render() {
    const manifest = this.manifest;
    const copy = manifest.page.copy;

    const skip = link("Skip to Current Exploration", "#hrv-current-exploration", "hub-skip");
    const museum = node("main", "hub-museum");
    museum.id = "hrv-hub-exhibits";

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
      this.hero(copy.hero),
      this.welcome(copy.welcome, manifest.current.featuredMedia),
      this.currentExploration(copy.currentExploration, manifest.current.exploration),
      this.currentTwwl(copy.currentTwwl, manifest.current.twwl),
      this.divider(),
      this.pastExplorations(copy.pastExplorations, manifest.galleries.pastExplorations),
      this.pastTwwl(copy.pastTwwl, manifest.galleries.pastTwwl),
      this.archives(copy.archives, manifest.archives),
      this.footer(copy.footer)
    );

    this.root.replaceChildren(skip, museum);
  }

  hero(copy) {
    const section = setEditable(node("section", "hub-section hero-section"), copy.nodeId);
    section.dataset.wake = "";

    const shell = node("div", "museum-shell");
    const card = node("div", "hub-card hub-hero-card");
    card.dataset.tilt = "";

    const left = node("div", "hero-left");
    const identityRow = node("div", "hero-identity-row");
    identityRow.append(compassGraphic(), node("span", "hero-museum-mark", "Classroom Museum"));
    left.append(
      identityRow,
      node("p", "section-kicker hero-kicker", copy.eyebrow),
      node("h1", "hub-title", copy.title),
      node("p", "hub-subtitle", copy.intro),
      node("p", "hub-invitation", copy.invitation)
    );

    const pillars = node("ul", "hero-pillars");
    pillars.setAttribute("aria-label", "Exploration pillars");
    for (const pillar of copy.pillars) pillars.append(node("li", "", pillar));
    left.append(pillars);

    const right = node("div", "hero-right");
    const oath = node("aside", "hero-oath");
    oath.setAttribute("role", "note");
    oath.setAttribute("aria-label", copy.oathTitle);
    oath.append(node("p", "hero-oath-title", copy.oathTitle), node("p", "hero-oath-body", copy.oathBody));

    const glance = node("div", "hero-glance");
    glance.append(node("p", "hero-glance-title", "Museum at a Glance"));
    const stats = node("div", "hero-glance-grid");

    const statData = [
      ["1", "Current Exhibit"],
      [String(this.manifest.galleries.pastExplorations.length), "Past Exhibits"],
      [String(this.manifest.galleries.pastTwwl.length), "Learning Memories"]
    ];

    for (const [value, label] of statData) {
      const stat = node("div", "hero-stat");
      stat.append(node("strong", "", value), node("span", "", label));
      stats.append(stat);
    }

    glance.append(stats);
    right.append(oath, glance);

    card.append(left, right);
    shell.append(card);

    const controls = node("div", "hero-controls");
    const effects = node("button", "effects-control", "Reduced Effects: Off");
    effects.type = "button";
    effects.dataset.effectsToggle = "";
    this.on(effects, "click", () => {
      this.manualReduced = !this.manualReduced;
      writeReducedPreference(this.manualReduced);
      this.applyEffects();
    });

    controls.append(
      effects,
      node("span", "school-year-control", `${this.manifest.page.schoolYearLabel} Museum`)
    );
    shell.append(controls);

    section.append(shell);
    return section;
  }

  welcome(copy, media) {
    const section = setEditable(node("section", "hub-section welcome-section"), copy.nodeId);
    section.dataset.wake = "";

    const shell = node("div", "museum-shell");
    const card = node("div", "hub-card welcome-theater-card");

    const header = node("header", "card-heading welcome-heading");
    const headingCopy = node("div", "card-heading-copy");
    headingCopy.append(
      node("p", "section-kicker welcome-kicker", copy.eyebrow),
      node("h2", "section-title", copy.title),
      node("p", "section-summary", copy.summary)
    );
    const theaterBadge = node("span", "theater-badge", "Orientation Theater");
    header.append(headingCopy, theaterBadge);

    const screen = node("div", "welcome-screen");
    const iframe = node("iframe");
    iframe.src = media.embedUrl;
    iframe.title = media.title;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;
    screen.append(iframe, node("span", "screen-glint"), node("span", "screen-footlight"));

    card.append(header, screen);
    shell.append(card);
    section.append(shell);
    return section;
  }

  currentExploration(copy, item) {
    const section = setEditable(
      node("section", `hub-section current-exploration-section ${subjectClass(item)}`),
      copy.nodeId
    );
    section.id = "hrv-current-exploration";
    section.dataset.hrvContentId = item.id;
    section.dataset.wake = "";

    const atmosphere = node("div", "current-atmosphere");
    atmosphere.setAttribute("aria-hidden", "true");
    atmosphere.innerHTML = `
      <span class="greenhouse-light"></span>
      <span class="leaf-shadow leaf-shadow-one"></span>
      <span class="leaf-shadow leaf-shadow-two"></span>
      <span class="seed-drift seed-one"></span>
      <span class="seed-drift seed-two"></span>
      <span class="seed-drift seed-three"></span>`;

    const shell = node("div", "museum-shell");
    const card = node("article", "hub-card current-exploration-card");
    card.dataset.tilt = "";

    const copyColumn = node("div", "current-copy");
    const topLine = node("div", "current-topline");
    topLine.append(
      node("p", "section-kicker exploration-kicker", copy.eyebrow),
      node("span", "open-now-badge", "OPEN NOW")
    );

    copyColumn.append(
      topLine,
      node("h2", "section-title current-section-title", copy.title),
      node("span", "content-year-badge", item.schoolYearLabel || this.manifest.page.schoolYearLabel),
      node("h3", "current-title", item.title),
      node("p", "current-summary", item.summary)
    );

    const points = node("ul", "current-points");
    for (const point of item.learningPoints || []) points.append(node("li", "", point));
    if (points.children.length) copyColumn.append(points);

    copyColumn.append(
      tagList(item.tags, "current-tags"),
      link("Explore Now", item.href, "hub-action exploration-action")
    );

    const visual = node("figure", "current-visual");
    visual.append(
      imageNode(item.image, "current-image", "eager"),
      node("span", "greenhouse-grid"),
      node("span", "current-glass"),
      node("figcaption", "current-caption", "Zinnia Greenhouse • Current Exhibit")
    );

    card.append(copyColumn, visual);
    shell.append(card);
    section.append(atmosphere, shell);
    return section;
  }

  currentTwwl(copy, slot) {
    const section = setEditable(node("section", "hub-section current-twwl-section"), copy.nodeId);
    section.dataset.hrvSlotId = slot.id;
    section.dataset.wake = "";

    const atmosphere = node("div", "twwl-atmosphere");
    atmosphere.setAttribute("aria-hidden", "true");
    atmosphere.innerHTML = `
      <span class="twwl-halo"></span>
      <span class="twwl-ray twwl-ray-one"></span>
      <span class="twwl-ray twwl-ray-two"></span>`;

    const shell = node("div", "museum-shell");
    const card = node("article", "hub-card current-twwl-card");
    card.dataset.tilt = "";

    const copyColumn = node("div", "current-twwl-copy");
    copyColumn.append(
      node("p", "section-kicker learning-kicker", copy.eyebrow),
      node("h2", "section-title twwl-section-title", copy.title),
      node("span", "content-year-badge learning-year-badge", this.manifest.page.schoolYearLabel)
    );

    const visual = node("div", "current-twwl-visual");

    if (slot.state === "coming-soon") {
      copyColumn.append(
        node("span", "preparing-label", "COMING SOON"),
        node("h3", "twwl-title", copy.comingSoonTitle),
        node("p", "twwl-summary", copy.comingSoonBody)
      );

      const preparing = node("div", "preparing-display");
      preparing.append(
        lanternGraphic(),
        node("p", "preparing-display-title", "The next learning display is being prepared"),
        node("span", "preparing-display-line")
      );
      visual.append(preparing);
    } else {
      const item = slot.content;
      section.dataset.hrvContentId = item.id;
      copyColumn.append(
        node("h3", "twwl-title", item.title),
        node("p", "twwl-summary", item.summary),
        tagList(item.tags, "twwl-tags"),
        link("Learn with Us", item.href, "hub-action learning-action")
      );

      if (item.image) {
        visual.classList.add(subjectClass(item));
        visual.append(
          imageNode(item.image, "current-twwl-image"),
          node("span", "twwl-glass"),
          node("span", "twwl-visual-label", "CURRENT LEARNING")
        );
      }
    }

    card.append(copyColumn, visual);
    shell.append(card);
    section.append(atmosphere, shell);
    return section;
  }

  divider() {
    const divider = node("div", "museum-divider");
    divider.setAttribute("aria-hidden", "true");

    const left = node("span", "divider-line divider-line-left");
    const center = node("span", "divider-medallion");
    const right = node("span", "divider-line divider-line-right");
    center.innerHTML = `
      <svg viewBox="0 0 90 90" focusable="false">
        <circle cx="45" cy="45" r="34"></circle>
        <path d="M45 18 L51 45 L45 72 L39 45 Z"></path>
        <path d="M18 45 H72"></path>
      </svg>`;

    divider.append(left, center, right);
    return divider;
  }

  pastExplorations(copy, items) {
    const section = setEditable(node("section", "hub-section past-explorations-section"), copy.nodeId);
    section.dataset.wake = "";

    const shell = node("div", "museum-shell");
    const frame = node("section", "hub-card gallery-frame exploration-gallery-frame");
    frame.setAttribute("aria-label", copy.title);

    const { header, input, count } = this.galleryHeader(
      copy,
      "Filter by title or tag…",
      "Filter explorations"
    );
    frame.append(header);

    if (!items.length) {
      frame.append(this.emptyGallery(copy.emptyText));
    } else {
      const grid = node("div", "gallery-grid exploration-grid");
      const cards = items.map((item, index) => this.explorationCard(item, index));
      cards.forEach((card) => grid.append(card));
      frame.append(grid);
      this.wireGallerySearch(input, cards, count, "exhibit");
    }

    shell.append(frame);
    section.append(shell);
    return section;
  }

  pastTwwl(copy, items) {
    const section = setEditable(node("section", "hub-section past-twwl-section"), copy.nodeId);
    section.dataset.wake = "";

    const shell = node("div", "museum-shell");
    const frame = node("section", "hub-card gallery-frame learning-gallery-frame");
    frame.setAttribute("aria-label", copy.title);

    const { header, input, count } = this.galleryHeader(
      copy,
      "Filter by title or tag…",
      "Filter past learning"
    );
    frame.append(header);

    if (!items.length) {
      frame.append(this.emptyGallery(copy.emptyText));
    } else {
      const grid = node("div", "gallery-grid learning-grid");
      const cards = items.map((item, index) => this.twwlCard(item, index));
      cards.forEach((card) => grid.append(card));
      frame.append(grid);
      this.wireGallerySearch(input, cards, count, "learning display");
    }

    shell.append(frame);
    section.append(shell);
    return section;
  }

  galleryHeader(copy, placeholder, ariaLabel) {
    const header = node("header", "gallery-header");
    const heading = node("div", "gallery-heading");
    heading.append(
      node("p", `section-kicker ${copy.nodeId.includes("twwl") ? "learning-kicker" : "exploration-kicker"}`, copy.eyebrow),
      node("h2", "section-title gallery-title", copy.title)
    );

    const tools = node("div", "gallery-tools");
    const input = node("input", "gallery-search");
    input.type = "search";
    input.placeholder = placeholder;
    input.setAttribute("aria-label", ariaLabel);
    input.autocomplete = "off";

    const count = node("p", "gallery-count", "");
    count.setAttribute("aria-live", "polite");

    tools.append(input, count);
    header.append(heading, tools);
    return { header, input, count };
  }

  wireGallerySearch(input, cards, countNode, noun) {
    const total = cards.length;
    const updateCount = (visible) => {
      countNode.textContent = `${visible} ${noun}${visible === 1 ? "" : "s"} on display`;
    };

    updateCount(total);

    this.on(input, "input", () => {
      const query = input.value.trim().toLocaleLowerCase();
      let visible = 0;

      for (const card of cards) {
        const match = !query || card.dataset.searchText.includes(query);
        card.hidden = !match;
        if (match) visible += 1;
      }

      updateCount(visible);
    });
  }

  emptyGallery(text) {
    const empty = node("div", "empty-gallery");
    empty.append(node("span", "empty-gallery-light"), node("p", "", text));
    return empty;
  }

  explorationCard(item, index) {
    const article = node("article", `collection-card exploration-card ${subjectClass(item)}`);
    article.dataset.hrvContentId = item.id;
    article.dataset.wake = "";
    article.dataset.tilt = "";
    article.dataset.searchText = [item.title, item.summary, ...(item.tags || [])].join(" ").toLocaleLowerCase();
    article.style.setProperty("--wake-delay", `${Math.min(index * 80, 240)}ms`);

    const anchor = link("", item.href, "collection-link");
    anchor.setAttribute("aria-label", `Open ${item.title}`);

    const visual = node("div", "collection-visual");
    visual.append(
      imageNode(item.image, "collection-image"),
      node("span", "collection-effect"),
      node("span", "collection-label", "PAST EXHIBIT"),
      node("span", "collection-year", item.schoolYearLabel || item.schoolYear)
    );

    const meta = node("div", "collection-meta");
    meta.append(
      node("h3", "collection-title", item.title),
      node("p", "collection-summary", item.summary),
      tagList(item.tags, "collection-tags"),
      node("span", "collection-enter", "Revisit exhibit")
    );

    anchor.append(visual, meta);
    article.append(anchor);
    return article;
  }

  twwlCard(item, index) {
    const article = node("article", `collection-card learning-card ${subjectClass(item)}`);
    article.dataset.hrvContentId = item.id;
    article.dataset.wake = "";
    article.dataset.tilt = "";
    article.dataset.searchText = [item.title, item.summary, ...(item.tags || [])].join(" ").toLocaleLowerCase();
    article.style.setProperty("--wake-delay", `${Math.min(index * 70, 280)}ms`);

    const anchor = link("", item.href, "collection-link");
    anchor.setAttribute("aria-label", `Open ${item.title}`);

    const visual = node("div", "collection-visual");
    if (item.image) visual.append(imageNode(item.image, "collection-image"));
    visual.append(
      node("span", "collection-effect"),
      node("span", "collection-label", "PAST LEARNING"),
      node("span", "collection-year", item.schoolYearLabel || item.schoolYear)
    );

    const meta = node("div", "collection-meta");
    meta.append(
      node("h3", "collection-title", item.title),
      node("p", "collection-summary", item.summary),
      tagList(item.tags, "collection-tags"),
      node("span", "collection-enter", "Open learning display")
    );

    anchor.append(visual, meta);
    article.append(anchor);
    return article;
  }

  archives(copy, archives) {
    const section = setEditable(node("section", "hub-section archive-control-section"), copy.nodeId);
    section.dataset.wake = "";

    const shell = node("div", "museum-shell compact-archive-shell");
    const card = node("div", "archive-control-card");

    const copyWrap = node("div", "archive-control-copy");
    copyWrap.append(
      node("p", "section-kicker archive-kicker", copy.eyebrow),
      node("h2", "archive-title", copy.title),
      node("p", "archive-summary", copy.intro)
    );

    const controlWrap = node("div", "archive-door-wrap");
    for (const archive of archives) {
      if (archive.state === "published" && archive.href) {
        const door = link(archive.label, archive.href, "archive-door");
        door.append(node("span", "archive-door-caption", "Open school-year gallery"));
        controlWrap.append(door);
      } else {
        const door = node("div", "archive-door archive-door-preparing");
        door.setAttribute("role", "status");
        door.append(
          node("strong", "", archive.label),
          node("span", "archive-door-caption", "Archive doorway preparing")
        );
        controlWrap.append(door);
      }
    }

    card.append(copyWrap, controlWrap);
    shell.append(card);
    section.append(shell);
    return section;
  }

  footer(copy) {
    const footer = setEditable(node("footer", "hub-footer"), copy.nodeId);
    footer.dataset.wake = "";

    const shell = node("div", "museum-shell footer-shell");
    const message = node("p", "footer-message", copy.text);
    footer.append(shell);
    shell.append(node("span", "footer-spark footer-spark-left"), message, node("span", "footer-spark footer-spark-right"));
    return footer;
  }
}

export function mountClassroomExplorationsHub(root, manifest) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError("Hub mount requires an HTMLElement.");
  }

  const existing = mounted.get(root);
  if (existing) return existing;

  if (
    !manifest ||
    manifest.runtimeSchemaVersion !== "1.0" ||
    manifest.page?.id !== "hrv-page:classroom-explorations"
  ) {
    throw new Error("Unsupported Classroom Explorations runtime manifest.");
  }

  const controller = new HubController(root, manifest);
  mounted.set(root, controller);
  controller.start();
  return controller;
}

export function unmountClassroomExplorationsHub(root) {
  mounted.get(root)?.destroy();
}
