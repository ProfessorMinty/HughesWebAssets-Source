const mounted = new WeakMap();

const APP_CLASS = "hrv-classroom-hub";

const DIALOG_FOCUSABLE = [
  "a[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "[tabindex]:not([tabindex='-1'])"
].join(",");

const SITE_NAVIGATION = [
  ["Home", "https://rmhughes.edublogs.org/"],
  ["Hughes Monthly Calendar", "https://rmhughes.edublogs.org/hughes-monthly-calendar/"],
  ["Posts", "https://rmhughes.edublogs.org/posts/"],
  ["Hughes Class Library", "https://rmhughes.edublogs.org/class-library/"],
  ["Photo Album", "https://rmhughes.edublogs.org/photo-album/"],
  ["Contact Information", "https://rmhughes.edublogs.org/contact-information/"]
];

const SUBJECT_CLASS = new Map([
  ["summer-bloom-adoption-project", "subject-zinnia"],
  ["great-barrier-reef", "subject-reef"],
  ["mushrooms", "subject-mushrooms"],
  ["butterflies-in-the-classroom", "subject-caterpillars"],
  ["botany-lets-talk-about-tubers", "subject-tubers"],
  ["traditions-of-russian-winter", "subject-winter"],
  ["silent-wings-wise-eyes-learning-about-owls", "subject-owls"],
  ["bats-dont-go-bump-in-the-night", "subject-bats"],
  ["autumn-spiders-gentle-web-artists", "subject-spiders"]
]);

const RUNTIME_COPY_REQUIREMENTS = {
  hero: ["nodeId", "eyebrow", "title", "intro", "invitation"],
  welcome: ["nodeId", "eyebrow", "title", "summary"],
  currentExploration: ["nodeId", "eyebrow", "title"],
  currentTwwl: ["nodeId", "eyebrow", "title", "comingSoonTitle", "comingSoonBody"],
  pastExplorations: ["nodeId", "eyebrow", "title", "emptyText"],
  pastTwwl: ["nodeId", "eyebrow", "title", "emptyText"],
  archives: ["nodeId", "eyebrow", "title", "intro"],
  footer: ["nodeId", "text"]
};

function runtimeCopyIsUsable(copy) {
  return Boolean(
    copy &&
    Object.entries(RUNTIME_COPY_REQUIREMENTS).every(([section, fields]) => (
      copy[section] &&
      fields.every((field) => typeof copy[section][field] === "string" && copy[section][field].trim())
    )) &&
    (copy.hero.pillars === undefined || (
      Array.isArray(copy.hero.pillars) &&
      copy.hero.pillars.length > 0 &&
      copy.hero.pillars.every((pillar) => typeof pillar === "string" && pillar.trim())
    ))
  );
}

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

function prefersReducedMotion() {
  return Boolean(window.matchMedia?.("(prefers-reduced-motion: reduce)").matches);
}

function imageNode(image, className, loading = "lazy", handlers = {}) {
  const img = node("img", className);
  img.alt = image?.alt || "";
  img.loading = loading;
  img.decoding = "async";

  if (typeof handlers.onLoad === "function") img.addEventListener("load", handlers.onLoad);
  if (typeof handlers.onError === "function") img.addEventListener("error", handlers.onError);
  if (typeof image?.src === "string" && image.src.trim()) img.src = image.src;
  return img;
}

function mediaFallback(title, body, modifier = "") {
  const fallback = node(
    "div",
    ["hub-media-fallback", modifier].filter(Boolean).join(" ")
  );
  fallback.hidden = true;
  fallback.setAttribute("role", "status");
  fallback.setAttribute("aria-live", "polite");
  fallback.append(
    node("strong", "hub-media-fallback-title", title),
    node("span", "hub-media-fallback-copy", body)
  );
  return fallback;
}

function appendImageWithFallback(container, image, className, {
  loading = "lazy",
  timeoutMs = 8_000,
  fallbackTitle = "Preview unavailable",
  fallbackBody = "The image could not load, but the exhibit details are still available.",
  fallbackClass = ""
  } = {}) {
  const fallback = mediaFallback(fallbackTitle, fallbackBody, fallbackClass);
  const usableImage = Boolean(
    image &&
    typeof image.src === "string" &&
    image.src.trim() &&
    typeof image.alt === "string" &&
    image.alt.trim()
  );
  let img;
  let settlementTimer = 0;
  let eligibilityObserver = null;

  const cancelPendingSettlement = () => {
    if (settlementTimer) window.clearTimeout(settlementTimer);
    settlementTimer = 0;
    eligibilityObserver?.disconnect();
    eligibilityObserver = null;
  };

  const showFallback = () => {
    cancelPendingSettlement();
    img.hidden = true;
    fallback.hidden = false;
    container.classList.add("has-media-fallback");
    container.dataset.mediaState = "unavailable";
  };
  const showImage = () => {
    cancelPendingSettlement();
    img.hidden = false;
    fallback.hidden = true;
    container.classList.remove("has-media-fallback");
    container.dataset.mediaState = "ready";
  };

  img = imageNode(usableImage ? image : null, className, loading, {
    onLoad: showImage,
    onError: showFallback
  });
  container.append(img, fallback);
  if (!usableImage) showFallback();
  else if (timeoutMs > 0 && loading === "lazy" && "IntersectionObserver" in window) {
    eligibilityObserver = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      eligibilityObserver?.disconnect();
      eligibilityObserver = null;
      settlementTimer = window.setTimeout(showFallback, timeoutMs);
    }, { threshold: 0 });
    eligibilityObserver.observe(container);
  } else if (timeoutMs > 0) {
    settlementTimer = window.setTimeout(showFallback, timeoutMs);
  }
  return { img, fallback, cancel: cancelPendingSettlement };
}

function youtubeWatchUrl(embedUrl) {
  if (typeof embedUrl !== "string" || !embedUrl) return "";
  try {
    const url = new URL(embedUrl);
    const parts = url.pathname.split("/").filter(Boolean);
    const id = parts[parts.length - 1] || "";
    if (url.hostname === "www.youtube-nocookie.com" && /^[A-Za-z0-9_-]{11}$/.test(id)) {
      return `https://www.youtube.com/watch?v=${id}`;
    }
  } catch {
    return "";
  }
  return "";
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
  constructor(root, manifest, runtimeAssets = {}) {
    this.root = root;
    this.manifest = manifest;
    this.runtimeAssets = runtimeAssets;
    this.listeners = [];
    this.observers = [];
    this.dialogReturnFocus = new WeakMap();
    this.dialogBackgroundState = new WeakMap();
    this.dialogPortalState = new WeakMap();
    this.openFallbackDialogs = new Set();
    this.destroyed = false;
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
    this.wireSystemMotionPreference();
    this.wireWakeUp();
    this.wireAmbientVisibility();
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
    [...this.openFallbackDialogs].forEach((dialog) => this.closeHistoryDialog(dialog));
    this.listeners.splice(0).forEach((off) => off());
    this.observers.splice(0).forEach((observer) => observer.disconnect());
    document.documentElement.classList.remove("hrv-page-classroom-explorations-ready");
    this.root.classList.remove(APP_CLASS, "museum-awake", "has-fallback-dialog");
    this.root.replaceChildren();
    this.root.removeAttribute("data-system-motion");
    for (const url of Object.values(this.runtimeAssets.artwork || {})) {
      if (typeof url === "string" && url.startsWith("blob:")) URL.revokeObjectURL(url);
    }
    this.runtimeAssets = {};
    mounted.delete(this.root);
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
    }, {
      rootMargin: "0px 0px 10% 0px",
      threshold: 0.05
    });

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
      for (const entry of entries) {
        entry.target.classList.toggle("is-in-view", entry.isIntersecting);
      }
    }, {
      rootMargin: "220px 0px",
      threshold: 0
    });

    targets.forEach((element) => observer.observe(element));
    this.observers.push(observer);
  }

  wirePointerLight() {
    const targets = [...this.root.querySelectorAll("[data-pointer-light], [data-tilt]")];

    for (const target of targets) {
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

          if (target.hasAttribute("data-tilt")) {
            target.style.setProperty("--tilt-x", `${((.5 - y) * 1.3).toFixed(2)}deg`);
            target.style.setProperty("--tilt-y", `${((x - .5) * 1.5).toFixed(2)}deg`);
          }
        });
      };

      const leave = () => {
        latestPoint = null;
        if (animationFrame) cancelAnimationFrame(animationFrame);
        animationFrame = 0;
        target.classList.remove("is-pointer-active");
        target.style.removeProperty("--pointer-x");
        target.style.removeProperty("--pointer-y");
        target.style.removeProperty("--tilt-x");
        target.style.removeProperty("--tilt-y");
      };

      this.on(target, "pointermove", move, { passive: true });
      this.on(target, "pointerleave", leave, { passive: true });
      this.listeners.push(() => {
        if (animationFrame) cancelAnimationFrame(animationFrame);
      });
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

    const pastExplorations = this.pastExplorations(copy.pastExplorations, manifest.galleries.pastExplorations);
    const pastTwwl = this.pastTwwl(copy.pastTwwl, manifest.galleries.pastTwwl);
    const archives = this.archives(copy.archives, manifest.archives);
    const pastExplorationsDialog = this.historyDialog(
      "hrv-past-explorations-dialog",
      copy.pastExplorations.title,
      pastExplorations
    );
    const pastTwwlDialog = this.historyDialog(
      "hrv-past-learning-dialog",
      copy.pastTwwl.title,
      pastTwwl
    );
    const archivesDialog = this.historyDialog(
      "hrv-school-year-archives-dialog",
      copy.archives.title,
      archives
    );

    museum.append(
      environment,
      this.bannerFrameLayer(),
      this.hero(copy.hero),
      this.siteNavigation(),
      this.welcome(copy.welcome, manifest.current.featuredMedia),
      this.currentExploration(copy.currentExploration, manifest.current.exploration),
      this.currentTwwl(copy.currentTwwl, manifest.current.twwl),
      this.historyDoors([
        {
          key: "pastExplorations",
          label: "Past Explorations",
          eyebrow: "Exploration archive",
          action: "Choose an exhibit",
          dialog: pastExplorationsDialog
        },
        {
          key: "pastTwwl",
          label: "Past TWWL",
          eyebrow: "Learning archive",
          action: "Choose a learning story",
          dialog: pastTwwlDialog
        },
        {
          key: "pastYears",
          label: "Past Years",
          eyebrow: "School-year archive",
          action: "Choose a school year",
          dialog: archivesDialog
        }
      ]),
      this.footer(copy.footer),
      pastExplorationsDialog,
      pastTwwlDialog,
      archivesDialog
    );

    this.root.replaceChildren(skip, museum);
  }

  bannerFrameLayer() {
    const layer = node("div", "hub-banner-frame-layer");
    layer.setAttribute("aria-hidden", "true");
    layer.style.pointerEvents = "none";

    const frames = [
      ["frameTopLeft", "top", "left"],
      ["frameTopRight", "top", "right"],
      ["frameMiddleLeft", "middle", "left"],
      ["frameMiddleRight", "middle", "right"],
      ["frameBottomLeft", "bottom", "left"],
      ["frameBottomRight", "bottom", "right"]
    ];

    for (const [key, position, side] of frames) {
      const frame = node(
        "img",
        `hub-banner-frame-piece hub-banner-frame-${position}-${side}`
      );
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

  hero(copy) {
    const pillarLabels = copy.pillars || ["Observe", "Wonder", "Investigate", "Share"];
    const oathTitle = copy.oathTitle || "Our Exploration Promise";
    const oathBody = copy.oathBody || "We look closely, ask brave questions, test ideas safely, learn from surprises, and share what we discover.";
    const section = setEditable(node("section", "hub-section hero-section"), copy.nodeId);
    section.dataset.wake = "";

    const shell = node("div", "museum-shell");
    const card = node("div", "hub-card hub-hero-card");
    card.dataset.pointerLight = "";

    const left = node("div", "hero-left");
    const identityRow = node("div", "hero-identity-row");
    identityRow.append(node("span", "hero-museum-mark", "Classroom Museum"));
    left.append(
      identityRow,
      node("p", "section-kicker hero-kicker", copy.eyebrow),
      node("h1", "hub-title", copy.title),
      node("p", "hub-subtitle", copy.intro),
      node("p", "hub-invitation", copy.invitation)
    );

    const pillars = node("ul", "hero-pillars");
    pillars.setAttribute("aria-label", "Exploration pillars");
    pillarLabels.forEach((pillar, index) => {
      const item = node("li");
      item.append(
        node("span", "hero-pillar-number", String(index + 1).padStart(2, "0")),
        node("span", "hero-pillar-label", pillar)
      );
      pillars.append(item);
    });
    left.append(pillars);

    const right = node("div", "hero-right");
    const compass = compassGraphic();
    const oath = node("aside", "hero-oath");
    oath.setAttribute("role", "note");
    oath.setAttribute("aria-label", oathTitle);
    oath.append(node("p", "hero-oath-title", oathTitle), node("p", "hero-oath-body", oathBody));

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
    right.append(compass, oath, glance);

    card.append(left, right);
    shell.append(card);

    shell.append(
      node("p", "hero-school-year", `${this.manifest.page.schoolYearLabel} Museum`)
    );

    section.append(shell);
    return section;
  }

  siteNavigation() {
    const navigation = node("nav", "site-navigation");
    navigation.setAttribute("aria-label", "Hughes Room Views site navigation");

    const shell = node("div", "museum-shell site-navigation-shell");
    const links = node("div", "site-navigation-links");

    SITE_NAVIGATION.forEach(([label, href], index) => {
      if (index === 5) {
        const current = node("span", "site-navigation-link is-current", "Classroom Explorations");
        current.setAttribute("aria-current", "page");
        links.append(current);
      }
      links.append(link(label, href, "site-navigation-link"));
    });

    shell.append(links);
    navigation.append(shell);
    return navigation;
  }

  restoreDialogFocus(dialog) {
    const target = this.dialogReturnFocus.get(dialog);
    this.dialogReturnFocus.delete(dialog);
    if (target?.isConnected && typeof target.focus === "function") {
      target.focus({ preventScroll: true });
    }
  }

  isolateFallbackDialog(dialog) {
    const background = [];
    let foreground = dialog;
    while (foreground?.parentElement) {
      const parent = foreground.parentElement;
      background.push(...[...parent.children].filter((element) => element !== foreground));
      if (parent === document.body) break;
      foreground = parent;
    }
    const states = [...new Set(background)].map((element) => ({
      element,
      inert: element.hasAttribute("inert"),
      ariaHidden: element.getAttribute("aria-hidden")
    }));

    for (const { element } of states) {
      element.setAttribute("inert", "");
      element.setAttribute("aria-hidden", "true");
    }
    this.dialogBackgroundState.set(dialog, states);
    this.root.classList.add("has-fallback-dialog");
  }

  portalFallbackDialog(dialog) {
    const parent = dialog.parentElement;
    if (!parent || !document.body) return;
    const portal = node("div", `${APP_CLASS} hub-dialog-portal`);
    this.dialogPortalState.set(dialog, {
      parent,
      nextSibling: dialog.nextSibling,
      portal
    });
    document.body.append(portal);
    portal.append(dialog);
    this.openFallbackDialogs.add(dialog);
  }

  restoreFallbackDialogPortal(dialog) {
    const state = this.dialogPortalState.get(dialog);
    if (!state) return;
    const reference = state.nextSibling?.parentElement === state.parent
      ? state.nextSibling
      : null;
    state.parent.insertBefore(dialog, reference);
    state.portal.remove();
    this.dialogPortalState.delete(dialog);
    this.openFallbackDialogs.delete(dialog);
  }

  restoreFallbackDialogBackground(dialog) {
    const states = this.dialogBackgroundState.get(dialog) || [];
    for (const { element, inert, ariaHidden } of states) {
      if (inert) element.setAttribute("inert", "");
      else element.removeAttribute("inert");
      if (ariaHidden === null) element.removeAttribute("aria-hidden");
      else element.setAttribute("aria-hidden", ariaHidden);
    }
    this.dialogBackgroundState.delete(dialog);
    this.root.classList.remove("has-fallback-dialog");
  }

  closeHistoryDialog(dialog) {
    const nativeDialog = dialog.dataset.hrvDialogMode === "native";
    if (nativeDialog && typeof dialog.close === "function" && dialog.open) {
      dialog.close();
      return;
    }

    dialog.removeAttribute("open");
    dialog.hidden = true;
    dialog.classList.remove("history-dialog-fallback-open");
    delete dialog.dataset.hrvDialogMode;
    this.restoreFallbackDialogBackground(dialog);
    this.restoreFallbackDialogPortal(dialog);
    this.restoreDialogFocus(dialog);
  }

  focusHistoryDialog(dialog) {
    const target = dialog.querySelector(DIALOG_FOCUSABLE) || dialog;
    target.focus({ preventScroll: true });
  }

  openHistoryDialog(dialog, invoker) {
    this.dialogReturnFocus.set(dialog, invoker);

    let nativeDialog = false;
    if (typeof dialog.showModal === "function") {
      try {
        if (!dialog.open) dialog.showModal();
        nativeDialog = true;
      } catch {
        nativeDialog = false;
      }
    }

    if (nativeDialog) {
      dialog.hidden = false;
      dialog.dataset.hrvDialogMode = "native";
    } else {
      this.portalFallbackDialog(dialog);
      dialog.hidden = false;
      dialog.setAttribute("open", "");
      dialog.dataset.hrvDialogMode = "fallback";
      dialog.classList.add("history-dialog-fallback-open");
      this.isolateFallbackDialog(dialog);
    }

    this.focusHistoryDialog(dialog);
  }

  trapHistoryDialogFocus(dialog, event) {
    const focusable = [...dialog.querySelectorAll(DIALOG_FOCUSABLE)]
      .filter((element) => (
        !element.hidden &&
        !element.closest("[hidden]") &&
        !element.hasAttribute("disabled")
      ));
    if (!focusable.length) {
      event.preventDefault();
      dialog.focus({ preventScroll: true });
      return;
    }

    const first = focusable[0];
    const last = focusable[focusable.length - 1];
    if (event.shiftKey && (document.activeElement === first || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      last.focus({ preventScroll: true });
    } else if (!event.shiftKey && (document.activeElement === last || !dialog.contains(document.activeElement))) {
      event.preventDefault();
      first.focus({ preventScroll: true });
    }
  }

  historyDialog(id, label, content) {
    const dialog = node("dialog", "history-dialog");
    dialog.id = id;
    dialog.setAttribute("aria-label", label);
    dialog.setAttribute("role", "dialog");
    dialog.setAttribute("aria-modal", "true");
    dialog.tabIndex = -1;
    if (typeof dialog.showModal !== "function") dialog.hidden = true;

    const surface = node("div", "history-dialog-surface");
    const close = node("button", "history-dialog-close", "Close");
    close.type = "button";
    close.setAttribute("aria-label", `Close ${label}`);
    surface.append(close, content);
    dialog.append(surface);

    this.on(close, "click", () => this.closeHistoryDialog(dialog));
    this.on(dialog, "click", (event) => {
      if (event.target !== dialog) return;
      this.closeHistoryDialog(dialog);
    });
    this.on(dialog, "close", () => {
      dialog.classList.remove("history-dialog-fallback-open");
      delete dialog.dataset.hrvDialogMode;
      this.restoreDialogFocus(dialog);
    });
    this.on(document, "focusin", (event) => {
      if (
        dialog.dataset.hrvDialogMode === "fallback" &&
        !dialog.contains(event.target)
      ) {
        this.focusHistoryDialog(dialog);
      }
    });
    this.on(dialog, "keydown", (event) => {
      const mode = dialog.dataset.hrvDialogMode;
      if (!mode) return;
      if (event.key === "Escape" && mode === "fallback") {
        event.preventDefault();
        this.closeHistoryDialog(dialog);
      } else if (event.key === "Tab") {
        this.trapHistoryDialogFocus(dialog, event);
      }
    });
    return dialog;
  }

  historyDoors(entries) {
    const section = node("section", "hub-section history-door-section");
    section.id = "hrv-history-navigation";
    section.dataset.wake = "";

    const shell = node("div", "museum-shell history-door-shell");
    const navigation = node("nav", "history-door-grid");
    navigation.setAttribute("aria-label", "Explore classroom history");

    for (const entry of entries) {
      const button = node("button", `history-door history-door-${entry.key}`);
      button.type = "button";
      button.setAttribute("aria-haspopup", "dialog");
      button.setAttribute("aria-controls", entry.dialog.id);
      button.setAttribute("aria-label", `${entry.label}: ${entry.action}`);

      const artwork = node("img", "history-door-artwork");
      const artworkUrl = this.runtimeAssets.artwork?.[entry.key];
      if (artworkUrl) artwork.src = artworkUrl;
      artwork.alt = "";
      artwork.loading = entry.key === "pastYears" ? "lazy" : "eager";
      artwork.decoding = "async";

      const copy = node("span", "history-door-copy");
      copy.append(
        node("span", "history-door-eyebrow", entry.eyebrow),
        node("strong", "history-door-title", entry.label),
        node("span", "history-door-action", entry.action)
      );
      button.append(artwork, node("span", "history-door-shade"), copy);

      this.on(button, "click", () => {
        this.openHistoryDialog(entry.dialog, button);
      });
      navigation.append(button);
    }

    shell.append(navigation);
    section.append(shell);
    return section;
  }

  welcome(copy, media) {
    const section = setEditable(node("section", "hub-section welcome-section"), copy.nodeId);
    section.id = "hrv-welcome-theater";
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
    const embedUrl = typeof media?.embedUrl === "string" ? media.embedUrl : "";
    const alternateUrl = youtubeWatchUrl(embedUrl);
    const alternate = alternateUrl
      ? link("Open video in a new tab", alternateUrl, "welcome-video-alternate")
      : null;
    if (alternate) {
      alternate.target = "_blank";
      alternate.rel = "noopener noreferrer";
      alternate.hidden = true;
    }
    const iframe = node("iframe");
    iframe.title = media?.title || "Classroom Explorations welcome video";
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture";
    iframe.allowFullscreen = true;

    const fallback = mediaFallback(
      "Welcome video unavailable",
      "The video could not play here. Use the alternate link to open it directly.",
      "hub-media-fallback-video"
    );
    const showVideoFallback = () => {
      iframe.hidden = true;
      fallback.hidden = false;
      if (alternate) alternate.hidden = false;
      screen.classList.add("has-media-fallback");
      screen.dataset.mediaState = "unavailable";
    };
    const showVideo = () => {
      iframe.hidden = false;
      fallback.hidden = true;
      if (alternate) alternate.hidden = true;
      screen.classList.remove("has-media-fallback");
      screen.dataset.mediaState = "ready";
    };
    let videoSettlementTimer = 0;
    const clearVideoSettlementTimer = () => {
      if (!videoSettlementTimer) return;
      window.clearTimeout(videoSettlementTimer);
      videoSettlementTimer = 0;
    };
    const settleVideoFallback = () => {
      clearVideoSettlementTimer();
      showVideoFallback();
    };
    const settleVideo = () => {
      if (!embedUrl) return;
      clearVideoSettlementTimer();
      showVideo();
    };
    this.on(iframe, "load", settleVideo);
    this.on(iframe, "error", settleVideoFallback);
    this.listeners.push(clearVideoSettlementTimer);
    if (embedUrl) {
      screen.dataset.mediaState = "loading";
      iframe.src = embedUrl;
      videoSettlementTimer = window.setTimeout(settleVideoFallback, 8_000);
    }
    else showVideoFallback();

    screen.append(iframe, fallback);
    if (alternate) screen.append(alternate);
    screen.append(node("span", "screen-glint"), node("span", "screen-footlight"));

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
    card.dataset.pointerLight = "";

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
    (item.learningPoints || []).forEach((point, index) => {
      const pointItem = node("li");
      pointItem.append(
        node("span", "current-point-number", String(index + 1).padStart(2, "0")),
        node("span", "current-point-copy", point)
      );
      points.append(pointItem);
    });
    if (points.children.length) copyColumn.append(points);

    copyColumn.append(
      tagList(item.tags, "current-tags"),
      link("Explore Now", item.href, "hub-action exploration-action")
    );

    const visual = node("figure", "current-visual");
    const mediaStage = node("div", "current-media-stage");
    mediaStage.dataset.tilt = "";
    mediaStage.append(atmosphere);
    const currentMedia = appendImageWithFallback(mediaStage, item.image, "current-image", {
      loading: "eager",
      fallbackTitle: "Current Exploration image unavailable",
      fallbackBody: "The exhibit details and Explore Now link are still available.",
      fallbackClass: "hub-media-fallback-current"
    });
    this.listeners.push(currentMedia.cancel);
    mediaStage.append(
      node("span", "greenhouse-grid"),
      node("span", "current-glass")
    );
    visual.append(
      mediaStage,
      node("figcaption", "current-caption", "Zinnia Greenhouse • Current Exhibit")
    );

    card.append(copyColumn, visual);
    shell.append(card);
    section.append(shell);
    return section;
  }

  currentTwwl(copy, slot) {
    const section = setEditable(node("section", "hub-section current-twwl-section"), copy.nodeId);
    section.id = "hrv-current-learning";
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
    card.dataset.pointerLight = "";

    const copyColumn = node("div", "current-twwl-copy");
    const statusline = node("div", "twwl-statusline");
    statusline.append(
      node("span", "content-year-badge learning-year-badge", this.manifest.page.schoolYearLabel)
    );
    if (slot.state === "coming-soon") {
      statusline.append(node("span", "preparing-label", "COMING SOON"));
    }

    copyColumn.append(
      node("p", "section-kicker learning-kicker", copy.eyebrow),
      node("h2", "section-title twwl-section-title", copy.title),
      statusline
    );

    const visual = node("div", "current-twwl-visual");
    const mediaStage = node("div", "twwl-media-stage");
    mediaStage.dataset.tilt = "";
    mediaStage.append(atmosphere);

    if (slot.state === "coming-soon") {
      copyColumn.append(
        node("h3", "twwl-title", copy.comingSoonTitle),
        node("p", "twwl-summary", copy.comingSoonBody)
      );

      const preparing = node("div", "preparing-display");
      preparing.append(
        lanternGraphic(),
        node("p", "preparing-display-title", "The next learning display is being prepared"),
        node("span", "preparing-display-line")
      );
      mediaStage.append(preparing);
    } else {
      const item = slot.content;
      section.dataset.hrvContentId = item.id;
      copyColumn.append(
        node("h3", "twwl-title", item.title),
        node("p", "twwl-summary", item.summary),
        tagList(item.tags, "twwl-tags"),
        link("Learn with Us", item.href, "hub-action learning-action")
      );

      visual.classList.add(subjectClass(item));
      mediaStage.classList.add(subjectClass(item));
      const twwlMedia = appendImageWithFallback(mediaStage, item.image, "current-twwl-image", {
        fallbackTitle: item.image ? "Learning story image unavailable" : "Learning story visual coming soon",
        fallbackBody: item.image
          ? "The image could not load, but the learning story is ready to open."
          : "This published learning story does not have an image yet. Use Learn with Us to open it.",
        fallbackClass: "hub-media-fallback-twwl"
      });
      this.listeners.push(twwlMedia.cancel);
      mediaStage.append(
        node("span", "twwl-glass"),
        node("span", "twwl-visual-label", "CURRENT LEARNING")
      );
    }

    visual.append(mediaStage);

    card.append(copyColumn, visual);
    shell.append(card);
    section.append(shell);
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
    section.id = "hrv-past-explorations";

    const shell = node("div", "museum-shell");
    const frame = node("section", "hub-card gallery-frame exploration-gallery-frame");
    frame.setAttribute("aria-label", copy.title);

    const entries = Array.isArray(items) ? items : [];
    const { header, input, count, clear } = this.galleryHeader(
      copy,
      "Filter by title or tag…",
      "Filter explorations",
      entries.length > 0
    );
    frame.append(header);

    if (!entries.length) {
      frame.append(this.emptyGallery(copy.emptyText, "gallery-empty-state"));
    } else {
      const grid = node("div", "gallery-grid exploration-grid");
      const cards = entries.map((item, index) => this.explorationCard(item, index));
      cards.forEach((card) => grid.append(card));
      const noResults = this.emptyGallery("No exhibits match this filter.", "gallery-no-results");
      noResults.hidden = true;
      frame.append(grid, noResults);
      this.wireGallerySearch(input, cards, count, clear, "exhibit", noResults);
    }

    shell.append(frame);
    section.append(shell);
    return section;
  }

  pastTwwl(copy, items) {
    const section = setEditable(node("section", "hub-section past-twwl-section"), copy.nodeId);
    section.id = "hrv-past-learning";

    const shell = node("div", "museum-shell");
    const frame = node("section", "hub-card gallery-frame learning-gallery-frame");
    frame.setAttribute("aria-label", copy.title);

    const entries = Array.isArray(items) ? items : [];
    const { header, input, count, clear } = this.galleryHeader(
      copy,
      "Filter by title or tag…",
      "Filter past learning",
      entries.length > 0
    );
    frame.append(header);

    if (!entries.length) {
      frame.append(this.emptyGallery(copy.emptyText, "gallery-empty-state"));
    } else {
      const grid = node("div", "gallery-grid learning-grid");
      const cards = entries.map((item, index) => this.twwlCard(item, index));
      cards.forEach((card) => grid.append(card));
      const noResults = this.emptyGallery("No learning displays match this filter.", "gallery-no-results");
      noResults.hidden = true;
      frame.append(grid, noResults);
      this.wireGallerySearch(input, cards, count, clear, "learning display", noResults);
    }

    shell.append(frame);
    section.append(shell);
    return section;
  }

  galleryHeader(copy, placeholder, ariaLabel, interactive = true) {
    const header = node("header", "gallery-header");
    const heading = node("div", "gallery-heading");
    heading.append(
      node("p", `section-kicker ${copy.nodeId.includes("twwl") ? "learning-kicker" : "exploration-kicker"}`, copy.eyebrow),
      node("h2", "section-title gallery-title", copy.title)
    );

    if (!interactive) {
      header.classList.add("gallery-header-empty");
      header.append(heading);
      return { header, input: null, count: null, clear: null };
    }

    const tools = node("div", "gallery-tools");
    const input = node("input", "gallery-search");
    input.type = "search";
    input.placeholder = placeholder;
    input.setAttribute("aria-label", ariaLabel);
    input.autocomplete = "off";

    const clear = node("button", "gallery-clear", "Clear filter");
    clear.type = "button";
    clear.hidden = true;

    const count = node("p", "gallery-count", "");
    count.setAttribute("aria-live", "polite");

    tools.append(input, clear, count);
    header.append(heading, tools);
    return { header, input, count, clear };
  }

  wireGallerySearch(input, cards, countNode, clearButton, noun, noResults) {
    const total = cards.length;
    const updateCount = (visible) => {
      countNode.textContent = `${visible} ${noun}${visible === 1 ? "" : "s"} on display`;
    };

    updateCount(total);

    const applyFilter = () => {
      const query = input.value.trim().toLocaleLowerCase();
      let visible = 0;

      for (const card of cards) {
        const match = !query || card.dataset.searchText.includes(query);
        card.hidden = !match;
        if (match) visible += 1;
      }

      updateCount(visible);
      clearButton.hidden = !query;
      noResults.hidden = !query || visible > 0;
    };

    this.on(input, "input", applyFilter);
    this.on(clearButton, "click", () => {
      input.value = "";
      applyFilter();
      input.focus({ preventScroll: true });
    });
  }

  emptyGallery(text, modifier = "") {
    const empty = node("div", ["empty-gallery", modifier].filter(Boolean).join(" "));
    empty.append(node("span", "empty-gallery-light"), node("p", "", text));
    return empty;
  }

  explorationCard(item, index) {
    const article = node("article", `collection-card exploration-card ${subjectClass(item)}`);
    article.dataset.hrvContentId = item.id;
    article.dataset.wake = "";
    article.dataset.searchText = [item.title, item.summary, ...(item.tags || [])].join(" ").toLocaleLowerCase();
    article.style.setProperty("--wake-delay", `${Math.min(index * 80, 160)}ms`);

    const anchor = link("", item.href, "collection-link");
    anchor.setAttribute("aria-label", `Open ${item.title}`);

    const visual = node("div", "collection-visual");
    const cardMedia = appendImageWithFallback(visual, item.image, "collection-image", {
      fallbackTitle: "Exhibit preview unavailable",
      fallbackBody: `${item.title} is still ready to open.`,
      fallbackClass: "hub-media-fallback-card"
    });
    this.listeners.push(cardMedia.cancel);
    visual.append(
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
    article.dataset.searchText = [item.title, item.summary, ...(item.tags || [])].join(" ").toLocaleLowerCase();
    article.style.setProperty("--wake-delay", `${Math.min(index * 70, 280)}ms`);

    const anchor = link("", item.href, "collection-link");
    anchor.setAttribute("aria-label", `Open ${item.title}`);

    const visual = node("div", "collection-visual");
    const cardMedia = appendImageWithFallback(visual, item.image, "collection-image", {
      fallbackTitle: item.image ? "Learning preview unavailable" : "Learning preview coming soon",
      fallbackBody: `${item.title} is still ready to open.`,
      fallbackClass: "hub-media-fallback-card"
    });
    this.listeners.push(cardMedia.cancel);
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
    section.id = "hrv-school-year-archives";
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
    const entries = Array.isArray(archives) ? archives : [];
    if (!entries.length) {
      const empty = this.emptyGallery(
        "No previous school-year archives are available yet.",
        "archive-empty-state"
      );
      empty.setAttribute("role", "status");
      controlWrap.append(empty);
    }

    for (const archive of entries) {
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

export function mountClassroomExplorationsHub(root, manifest, runtimeAssets = {}) {
  if (!(root instanceof HTMLElement)) {
    throw new TypeError("Hub mount requires an HTMLElement.");
  }

  const existing = mounted.get(root);
  if (existing) return existing;

  const currentTwwl = manifest?.current?.twwl;
  const publishedTwwlContentIsUsable = currentTwwl?.state !== "published" || Boolean(
    currentTwwl.content &&
    typeof currentTwwl.content.id === "string" &&
    typeof currentTwwl.content.title === "string" &&
    typeof currentTwwl.content.summary === "string" &&
    typeof currentTwwl.content.href === "string" &&
    Array.isArray(currentTwwl.content.tags)
  );

  if (
    !manifest ||
    manifest.runtimeSchemaVersion !== "1.0" ||
    manifest.page?.id !== "hrv-page:classroom-explorations" ||
    !runtimeCopyIsUsable(manifest.page?.copy) ||
    !["coming-soon", "published"].includes(currentTwwl?.state) ||
    !publishedTwwlContentIsUsable ||
    !Array.isArray(manifest.galleries?.pastExplorations) ||
    !Array.isArray(manifest.galleries?.pastTwwl) ||
    !Array.isArray(manifest.archives)
  ) {
    throw new Error("Unsupported Classroom Explorations runtime manifest.");
  }

  const controller = new HubController(root, manifest, runtimeAssets);
  mounted.set(root, controller);
  controller.start();
  return controller;
}

export function unmountClassroomExplorationsHub(root) {
  mounted.get(root)?.destroy();
}
