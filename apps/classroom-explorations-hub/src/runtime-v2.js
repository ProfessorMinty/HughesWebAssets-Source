(function () {
  "use strict";

  var controllers = new WeakMap();
  var EFFECTS_KEY = "hrv:classroom-explorations:v2:reduced-effects";

  function HubRuntimeError(code, message, detail) {
    this.name = "HubRuntimeError";
    this.code = code;
    this.message = message;
    this.detail = detail || {};
  }
  HubRuntimeError.prototype = Object.create(Error.prototype);

  function create(tag, className, text) {
    var element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined && text !== null) element.textContent = text;
    return element;
  }

  function anchor(label, href, className) {
    var link = create("a", className || "hub-v2-action", label);
    link.href = href;
    return link;
  }

  function setIdentity(element, attribute, value) {
    if (value) element.setAttribute(attribute, value);
    return element;
  }

  function readReducedPreference() {
    try {
      return localStorage.getItem(EFFECTS_KEY) === "true";
    } catch (_error) {
      return false;
    }
  }

  function writeReducedPreference(value) {
    try {
      localStorage.setItem(EFFECTS_KEY, String(value));
    } catch (_error) {}
  }

  function systemPrefersReducedMotion() {
    return Boolean(window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches);
  }

  function normalizeYouTube(sourceUrl) {
    var url = new URL(sourceUrl);
    var id = "";
    if (url.hostname === "youtu.be") id = url.pathname.replace(/^\//, "").split("/")[0] || "";
    if (url.hostname.endsWith("youtube.com")) {
      if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
      if (url.pathname.indexOf("/shorts/") === 0 || url.pathname.indexOf("/embed/") === 0) {
        id = url.pathname.split("/")[2] || "";
      }
    }
    if (!/^[A-Za-z0-9_-]{11}$/.test(id)) {
      throw new HubRuntimeError("HUB_EXTERNAL_MEDIA_UNSUPPORTED", "Unsupported YouTube URL.", { sourceUrl: sourceUrl });
    }
    return "https://www.youtube-nocookie.com/embed/" + id;
  }

  function project(source, registry) {
    if (!source || source.schemaVersion !== "1.0" || source.page && source.page.type !== "classroom-explorations-hub") {
      throw new HubRuntimeError("HUB_SCHEMA_UNSUPPORTED", "Unsupported Hub authoring source.");
    }
    if (!registry || registry.schemaVersion !== "1.0" || !registry.site || !Array.isArray(registry.routes)) {
      throw new HubRuntimeError("HUB_ROUTE_SCHEMA_UNSUPPORTED", "Unsupported Hub route registry.");
    }

    var routes = new Map(registry.routes.map(function (route) { return [route.ref, route]; }));
    var years = new Map(source.data.schoolYears.map(function (year) { return [year.id, year]; }));
    var explorations = new Map(source.data.explorations.map(function (item) { return [item.id, item]; }));
    var twwl = new Map(source.data.twwl.map(function (item) { return [item.id, item]; }));
    var media = new Map(source.data.media.map(function (item) { return [item.id, item]; }));
    var composition = source.data.composition;

    function routeHref(ref) {
      var route = routes.get(ref);
      if (!route) throw new HubRuntimeError("HUB_ROUTE_REF_UNKNOWN", "Unknown Hub route reference.", { routeRef: ref });
      return new URL(route.path, registry.site.origin).href;
    }

    function resolveImage(image) {
      if (!image) return null;
      if (image.kind !== "external-url" || !image.url) {
        throw new HubRuntimeError("HUB_MEDIA_REF_UNRESOLVED", "The review runtime requires a resolved image URL.");
      }
      return { src: image.url, alt: image.alt || "" };
    }

    function resolveExploration(item, includeYear) {
      if (!item) throw new HubRuntimeError("HUB_CONTENT_UNKNOWN", "Unknown Exploration record.");
      var resolved = {
        id: item.id,
        title: item.title,
        summary: item.summary,
        href: routeHref(item.routeRef),
        image: resolveImage(item.image),
        learningPoints: Array.isArray(item.learningPoints) ? item.learningPoints.slice() : [],
        tags: Array.isArray(item.tags) ? item.tags.slice() : []
      };
      if (includeYear) {
        resolved.schoolYear = item.schoolYear;
        resolved.schoolYearLabel = years.has(item.schoolYear) ? years.get(item.schoolYear).label : item.schoolYear;
      }
      return resolved;
    }

    function resolveTwwl(item) {
      if (!item) throw new HubRuntimeError("HUB_CONTENT_UNKNOWN", "Unknown TWWL record.");
      return {
        id: item.id,
        schoolYear: item.schoolYear,
        schoolYearLabel: years.has(item.schoolYear) ? years.get(item.schoolYear).label : item.schoolYear,
        title: item.title,
        summary: item.summary,
        href: routeHref(item.routeRef),
        image: resolveImage(item.image),
        tags: Array.isArray(item.tags) ? item.tags.slice() : []
      };
    }

    var currentExploration = explorations.get(composition.currentExplorationId);
    if (!currentExploration) {
      throw new HubRuntimeError("HUB_CURRENT_EXPLORATION_UNKNOWN", "Current Exploration does not exist.");
    }

    var featured = media.get(composition.featuredMediaId);
    if (!featured) throw new HubRuntimeError("HUB_FEATURED_VIDEO_UNKNOWN", "Featured media does not exist.");

    var currentTwwl = composition.currentTwwl.state === "published"
      ? {
          id: composition.currentTwwl.id,
          state: "published",
          content: resolveTwwl(twwl.get(composition.currentTwwl.contentId))
        }
      : {
          id: composition.currentTwwl.id,
          state: "coming-soon"
        };

    return {
      page: {
        id: source.page.id,
        type: source.page.type,
        href: routeHref(source.page.routeRef),
        currentSchoolYear: composition.currentSchoolYear,
        schoolYearLabel: years.has(composition.currentSchoolYear)
          ? years.get(composition.currentSchoolYear).label
          : composition.currentSchoolYear,
        copy: source.data.copy
      },
      current: {
        exploration: resolveExploration(currentExploration, false),
        twwl: currentTwwl,
        featuredMedia: {
          id: featured.id,
          title: featured.title,
          embedUrl: normalizeYouTube(featured.sourceUrl)
        }
      },
      galleries: {
        pastExplorations: composition.pastExplorationIds.map(function (id) {
          return resolveExploration(explorations.get(id), true);
        }),
        pastTwwl: composition.pastTwwlIds.map(function (id) {
          return resolveTwwl(twwl.get(id));
        })
      },
      archives: composition.previousYears.map(function (archive) {
        return {
          id: archive.id,
          schoolYear: archive.schoolYear,
          label: years.has(archive.schoolYear) ? years.get(archive.schoolYear).label : archive.schoolYear,
          state: archive.state,
          href: archive.routeRef ? routeHref(archive.routeRef) : null
        };
      })
    };
  }

  function subjectEmoji(id) {
    if (/zinnia|bloom|garden/.test(id)) return "🌺";
    if (/mushroom/.test(id)) return "🍄";
    if (/butterfl|caterpillar/.test(id)) return "🦋";
    if (/reef|ocean/.test(id)) return "🐢";
    if (/tuber|botany/.test(id)) return "🥔";
    if (/winter|russian/.test(id)) return "❄️";
    if (/owl/.test(id)) return "🦉";
    if (/bat/.test(id)) return "🦇";
    if (/spider/.test(id)) return "🕸️";
    return "🔎";
  }

  function imageFigure(item, className) {
    var figure = create("figure", className || "hub-v2-image");
    var fallback = create("div", "hub-v2-image-fallback", subjectEmoji(item.id));
    fallback.setAttribute("aria-hidden", "true");

    if (!item.image || !item.image.src) {
      figure.appendChild(fallback);
      return figure;
    }

    var image = create("img");
    image.src = item.image.src;
    image.alt = item.image.alt || "";
    image.loading = "lazy";
    image.decoding = "async";
    image.addEventListener("error", function () {
      image.remove();
      if (!fallback.isConnected) figure.appendChild(fallback);
    }, { once: true });
    figure.appendChild(image);
    return figure;
  }

  function tagList(tags) {
    var list = create("ul", "hub-v2-tags");
    (tags || []).forEach(function (tag) {
      list.appendChild(create("li", "", tag));
    });
    return list;
  }

  function compass() {
    var wrap = create("div", "hub-v2-compass");
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = [
      '<svg viewBox="0 0 180 180" focusable="false">',
      '<defs>',
      '<radialGradient id="hrvV2CompassGlow" cx="50%" cy="50%" r="50%"><stop offset="0" stop-color="#fff3b2" stop-opacity=".98"/><stop offset=".38" stop-color="#68e1c2" stop-opacity=".38"/><stop offset="1" stop-color="#68e1c2" stop-opacity="0"/></radialGradient>',
      '<linearGradient id="hrvV2CompassRing" x1="0" x2="1"><stop offset="0" stop-color="#6ee7ce"/><stop offset=".48" stop-color="#ffe69a"/><stop offset="1" stop-color="#9cb8ff"/></linearGradient>',
      '</defs>',
      '<circle cx="90" cy="90" r="87" fill="url(#hrvV2CompassGlow)"/>',
      '<circle class="hub-v2-compass-orbit" cx="90" cy="90" r="66" fill="rgba(5,14,35,.78)" stroke="url(#hrvV2CompassRing)" stroke-width="4"/>',
      '<circle cx="90" cy="90" r="48" fill="rgba(9,22,50,.92)" stroke="rgba(255,255,255,.28)"/>',
      '<path class="hub-v2-compass-needle" d="M90 34 L104 91 L90 146 L76 91 Z" fill="#ffeaa4"/>',
      '<path d="M90 34 L90 146" stroke="#63ddc2" stroke-width="3"/>',
      '<circle cx="90" cy="90" r="7" fill="#fff"/><circle cx="90" cy="90" r="3" fill="#25457d"/>',
      '</svg>'
    ].join("");
    return wrap;
  }

  function lantern() {
    var wrap = create("div", "hub-v2-lantern");
    wrap.setAttribute("aria-hidden", "true");
    wrap.innerHTML = [
      '<span class="hub-v2-lantern-handle"></span>',
      '<span class="hub-v2-lantern-top"></span>',
      '<span class="hub-v2-lantern-glass"><span class="hub-v2-lantern-flame"></span></span>',
      '<span class="hub-v2-lantern-base"></span>',
      '<span class="hub-v2-lantern-glow"></span>'
    ].join("");
    return wrap;
  }

  function sectionHeading(copy, titleId) {
    var header = create("header", "hub-v2-section-heading");
    var eyebrow = create("p", "hub-v2-eyebrow", copy.eyebrow);
    var title = create("h2", "hub-v2-section-title", copy.title);
    if (titleId) title.id = titleId;
    header.append(eyebrow, title);
    return header;
  }

  function environment() {
    var decoration = create("div", "hub-v2-environment");
    decoration.setAttribute("aria-hidden", "true");
    decoration.innerHTML = [
      '<span class="hub-v2-aurora hub-v2-aurora-one"></span>',
      '<span class="hub-v2-aurora hub-v2-aurora-two"></span>',
      '<span class="hub-v2-stars hub-v2-stars-one"></span>',
      '<span class="hub-v2-stars hub-v2-stars-two"></span>',
      '<span class="hub-v2-orb hub-v2-orb-one"></span>',
      '<span class="hub-v2-orb hub-v2-orb-two"></span>'
    ].join("");
    return decoration;
  }

  function Controller(root, options) {
    this.root = root;
    this.options = options;
    this.manifest = project(options.source, options.routes);
    this.listeners = [];
    this.observers = [];
    this.manualReduced = readReducedPreference();
    this.destroyed = false;
  }

  Controller.prototype.on = function (target, type, handler, options) {
    target.addEventListener(type, handler, options);
    this.listeners.push(function () { target.removeEventListener(type, handler, options); });
  };

  Controller.prototype.start = function () {
    this.root.classList.add("hrv-hub-v2");
    this.root.setAttribute("data-hrv-page-id", this.manifest.page.id);
    this.root.setAttribute("data-hrv-source-ref", this.options.sourceRef || "review");
    this.root.setAttribute("data-hrv-state", "mounting");
    this.root.setAttribute("data-system-motion", systemPrefersReducedMotion() ? "reduced" : "standard");
    this.render();
    this.applyEffects();
    this.wireEffects();
    this.wireReveal();
    this.wirePointerLight();
    this.wireMotionPreference();
    this.root.setAttribute("data-hrv-state", "ready");
    document.documentElement.classList.add("hrv-page-classroom-explorations-ready");
    window.dispatchEvent(new CustomEvent("hrv:page-ready", {
      detail: {
        pageId: this.manifest.page.id,
        sourceRef: this.options.sourceRef || "review",
        hostPath: this.options.hostPath || window.location.pathname
      }
    }));
  };

  Controller.prototype.destroy = function () {
    if (this.destroyed) return;
    this.destroyed = true;
    this.listeners.splice(0).forEach(function (off) { off(); });
    this.observers.splice(0).forEach(function (observer) { observer.disconnect(); });
    this.root.replaceChildren();
    this.root.classList.remove("hrv-hub-v2");
    document.documentElement.classList.remove("hrv-page-classroom-explorations-ready");
    controllers.delete(this.root);
  };

  Controller.prototype.render = function () {
    var manifest = this.manifest;
    var skip = anchor("Skip to the Current Exploration", "#hrv-v2-current", "hub-v2-skip");
    var main = create("main", "hub-v2-museum");
    main.id = "hrv-v2-museum";
    main.append(
      environment(),
      this.hero(),
      this.map(),
      this.welcome(),
      this.currentExploration(),
      this.currentTwwl(),
      this.pastExplorations(),
      this.pastTwwl(),
      this.archives(),
      this.footer()
    );
    this.root.replaceChildren(skip, main);
  };

  Controller.prototype.hero = function () {
    var copy = this.manifest.page.copy.hero;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-hero"), "data-hrv-node-id", copy.nodeId);
    section.setAttribute("data-reveal", "");
    var shell = create("div", "hub-v2-shell");
    var card = create("div", "hub-v2-hero-card");
    card.setAttribute("data-pointer-light", "");

    var left = create("div", "hub-v2-hero-copy");
    var museumLabel = create("div", "hub-v2-museum-label");
    museumLabel.append(create("span", "hub-v2-museum-label-icon", "✦"), create("span", "", "Ms Hughes’ Classroom Museum"));
    left.append(
      museumLabel,
      create("p", "hub-v2-eyebrow", copy.eyebrow),
      create("h1", "hub-v2-title", copy.title),
      create("p", "hub-v2-lead", copy.intro),
      create("p", "hub-v2-invitation", copy.invitation)
    );

    var pillars = create("ul", "hub-v2-pillars");
    pillars.setAttribute("aria-label", "Exploration habits");
    copy.pillars.forEach(function (pillar, index) {
      var item = create("li");
      item.append(create("span", "hub-v2-pillar-number", String(index + 1)), create("span", "", pillar));
      pillars.appendChild(item);
    });
    left.appendChild(pillars);

    var right = create("div", "hub-v2-hero-side");
    right.appendChild(compass());
    var oath = create("aside", "hub-v2-oath");
    oath.setAttribute("role", "note");
    oath.append(create("strong", "", copy.oathTitle), create("p", "", copy.oathBody));
    right.appendChild(oath);

    card.append(left, right);
    shell.appendChild(card);

    var controls = create("div", "hub-v2-controls");
    var effects = create("button", "hub-v2-effects", "Reduced Effects: Off");
    effects.type = "button";
    effects.setAttribute("data-effects-toggle", "");
    effects.setAttribute("aria-pressed", "false");
    controls.append(effects, create("span", "hub-v2-year-chip", this.manifest.page.schoolYearLabel + " Museum"));
    shell.appendChild(controls);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.map = function () {
    var section = create("nav", "hub-v2-map");
    section.setAttribute("aria-label", "Museum exhibit map");
    section.setAttribute("data-reveal", "");
    var shell = create("div", "hub-v2-shell hub-v2-map-shell");
    shell.appendChild(create("p", "hub-v2-map-title", "Museum Map"));
    var links = create("div", "hub-v2-map-links");
    [
      ["Welcome Theater", "#hrv-v2-welcome", "🎬"],
      ["Current Exploration", "#hrv-v2-current", "🧭"],
      ["Learning Lantern", "#hrv-v2-twwl", "🏮"],
      ["Past Explorations", "#hrv-v2-past", "🗂️"],
      ["School-Year Archives", "#hrv-v2-archives", "🗝️"]
    ].forEach(function (item) {
      var link = anchor(item[0], item[1], "hub-v2-map-link");
      link.prepend(create("span", "", item[2]));
      links.appendChild(link);
    });
    shell.appendChild(links);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.welcome = function () {
    var copy = this.manifest.page.copy.welcome;
    var media = this.manifest.current.featuredMedia;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-welcome"), "data-hrv-node-id", copy.nodeId);
    section.id = "hrv-v2-welcome";
    section.setAttribute("data-reveal", "");
    var shell = create("div", "hub-v2-shell");
    var card = create("div", "hub-v2-panel hub-v2-theater");
    var header = sectionHeading(copy, "hrv-v2-welcome-title");
    header.appendChild(create("span", "hub-v2-room-badge", "Orientation Theater"));
    card.setAttribute("aria-labelledby", "hrv-v2-welcome-title");
    card.appendChild(header);
    card.appendChild(create("p", "hub-v2-section-summary", copy.summary));

    var screen = create("div", "hub-v2-screen");
    var iframe = create("iframe");
    iframe.src = media.embedUrl;
    iframe.title = media.title;
    iframe.loading = "lazy";
    iframe.allow = "accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share";
    iframe.referrerPolicy = "strict-origin-when-cross-origin";
    iframe.allowFullscreen = true;
    screen.appendChild(iframe);
    card.appendChild(screen);
    shell.appendChild(card);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.currentExploration = function () {
    var copy = this.manifest.page.copy.currentExploration;
    var item = this.manifest.current.exploration;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-current"), "data-hrv-node-id", copy.nodeId);
    section.id = "hrv-v2-current";
    section.setAttribute("data-reveal", "");
    section.setAttribute("data-hrv-slot-id", "hub-slot:current-exploration");
    var shell = create("div", "hub-v2-shell");
    shell.appendChild(sectionHeading(copy, "hrv-v2-current-title"));

    var card = setIdentity(create("article", "hub-v2-current-card"), "data-hrv-content-id", item.id);
    card.setAttribute("aria-labelledby", "hrv-v2-current-item-title");
    card.setAttribute("data-pointer-light", "");
    var art = imageFigure(item, "hub-v2-current-art");
    var ribbon = create("span", "hub-v2-featured-ribbon", "Now Exploring");
    art.appendChild(ribbon);

    var body = create("div", "hub-v2-current-body");
    body.append(
      create("p", "hub-v2-specimen-label", "Featured Exhibit • " + this.manifest.page.schoolYearLabel),
      create("h3", "hub-v2-current-name", item.title),
      create("p", "hub-v2-current-summary", item.summary)
    );
    body.querySelector("h3").id = "hrv-v2-current-item-title";

    var points = create("ul", "hub-v2-learning-points");
    item.learningPoints.forEach(function (point) {
      var row = create("li");
      row.append(create("span", "hub-v2-point-mark", "✦"), create("span", "", point));
      points.appendChild(row);
    });
    body.append(points, tagList(item.tags));
    var actions = create("div", "hub-v2-actions");
    var open = anchor("Enter the Exploration", item.href, "hub-v2-action hub-v2-action-primary");
    open.appendChild(create("span", "hub-v2-action-arrow", "→"));
    actions.appendChild(open);
    body.appendChild(actions);

    card.append(art, body);
    shell.appendChild(card);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.currentTwwl = function () {
    var copy = this.manifest.page.copy.currentTwwl;
    var slot = this.manifest.current.twwl;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-twwl"), "data-hrv-node-id", copy.nodeId);
    section.id = "hrv-v2-twwl";
    section.setAttribute("data-reveal", "");
    section.setAttribute("data-hrv-slot-id", slot.id);
    var shell = create("div", "hub-v2-shell");
    var card = create("div", "hub-v2-lantern-card");
    card.appendChild(lantern());
    var body = create("div", "hub-v2-lantern-copy");
    body.append(create("p", "hub-v2-eyebrow", copy.eyebrow), create("h2", "hub-v2-section-title", copy.title));

    if (slot.state === "published" && slot.content) {
      var item = slot.content;
      card.setAttribute("data-hrv-content-id", item.id);
      body.append(create("h3", "hub-v2-lantern-title", item.title), create("p", "hub-v2-section-summary", item.summary));
      body.append(tagList(item.tags), anchor("Read This Week’s Learning Story", item.href, "hub-v2-action hub-v2-action-primary"));
    } else {
      body.append(
        create("span", "hub-v2-coming-soon", "Coming Soon"),
        create("h3", "hub-v2-lantern-title", copy.comingSoonTitle),
        create("p", "hub-v2-section-summary", copy.comingSoonBody),
        create("p", "hub-v2-lantern-note", "The empty slot is intentional. Lanternworks can publish the first approved learning story here without inventing placeholder content.")
      );
    }

    card.appendChild(body);
    shell.appendChild(card);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.pastExplorations = function () {
    var copy = this.manifest.page.copy.pastExplorations;
    var items = this.manifest.galleries.pastExplorations;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-past"), "data-hrv-node-id", copy.nodeId);
    section.id = "hrv-v2-past";
    section.setAttribute("data-reveal", "");
    var shell = create("div", "hub-v2-shell");
    shell.appendChild(sectionHeading(copy, "hrv-v2-past-title"));

    if (!items.length) {
      shell.appendChild(create("p", "hub-v2-empty", copy.emptyText));
      section.appendChild(shell);
      return section;
    }

    var grid = create("div", "hub-v2-exploration-grid");
    items.forEach(function (item, index) {
      var card = setIdentity(create("article", "hub-v2-exploration-card"), "data-hrv-content-id", item.id);
      card.setAttribute("data-pointer-light", "");
      card.style.setProperty("--card-order", String(index));
      card.appendChild(imageFigure(item, "hub-v2-card-art"));
      var body = create("div", "hub-v2-card-body");
      body.append(
        create("p", "hub-v2-card-year", item.schoolYearLabel),
        create("h3", "hub-v2-card-title", item.title),
        create("p", "hub-v2-card-summary", item.summary),
        tagList(item.tags),
        anchor("Revisit This Exhibit", item.href, "hub-v2-card-link")
      );
      card.appendChild(body);
      grid.appendChild(card);
    });
    shell.appendChild(grid);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.pastTwwl = function () {
    var copy = this.manifest.page.copy.pastTwwl;
    var items = this.manifest.galleries.pastTwwl;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-memory-hall"), "data-hrv-node-id", copy.nodeId);
    section.setAttribute("data-reveal", "");
    var shell = create("div", "hub-v2-shell");
    shell.appendChild(sectionHeading(copy, "hrv-v2-memory-title"));

    if (!items.length) {
      shell.appendChild(create("p", "hub-v2-empty", copy.emptyText));
      section.appendChild(shell);
      return section;
    }

    var list = create("div", "hub-v2-memory-list");
    items.forEach(function (item, index) {
      var card = setIdentity(create("article", "hub-v2-memory-card"), "data-hrv-content-id", item.id);
      card.style.setProperty("--memory-order", String(index));
      var icon = create("div", "hub-v2-memory-icon", subjectEmoji(item.id));
      icon.setAttribute("aria-hidden", "true");
      var body = create("div", "hub-v2-memory-copy");
      body.append(
        create("p", "hub-v2-memory-meta", item.schoolYearLabel + " • Learning Story"),
        create("h3", "hub-v2-memory-title", item.title),
        create("p", "hub-v2-memory-summary", item.summary),
        tagList(item.tags)
      );
      var open = anchor("Open Story", item.href, "hub-v2-memory-link");
      card.append(icon, body, open);
      list.appendChild(card);
    });
    shell.appendChild(list);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.archives = function () {
    var copy = this.manifest.page.copy.archives;
    var archives = this.manifest.archives;
    var section = setIdentity(create("section", "hub-v2-section hub-v2-archives"), "data-hrv-node-id", copy.nodeId);
    section.id = "hrv-v2-archives";
    section.setAttribute("data-reveal", "");
    var shell = create("div", "hub-v2-shell");
    var card = create("div", "hub-v2-archive-card");
    var key = create("div", "hub-v2-archive-key", "🗝️");
    key.setAttribute("aria-hidden", "true");
    var body = create("div", "hub-v2-archive-copy");
    body.append(create("p", "hub-v2-eyebrow", copy.eyebrow), create("h2", "hub-v2-section-title", copy.title), create("p", "hub-v2-section-summary", copy.intro));

    var links = create("div", "hub-v2-archive-links");
    if (!archives.length) {
      links.appendChild(create("p", "hub-v2-empty", "The archive wing is being cataloged."));
    } else {
      archives.forEach(function (archive) {
        if (archive.state === "published" && archive.href) {
          var open = anchor("Open the " + archive.label + " Museum Wing", archive.href, "hub-v2-action hub-v2-action-primary");
          open.setAttribute("data-hrv-slot-id", archive.id);
          links.appendChild(open);
        } else {
          var pending = create("div", "hub-v2-archive-pending", archive.label + " archive coming soon");
          pending.setAttribute("data-hrv-slot-id", archive.id);
          links.appendChild(pending);
        }
      });
    }
    body.appendChild(links);
    card.append(key, body);
    shell.appendChild(card);
    section.appendChild(shell);
    return section;
  };

  Controller.prototype.footer = function () {
    var copy = this.manifest.page.copy.footer;
    var footer = setIdentity(create("footer", "hub-v2-footer"), "data-hrv-node-id", copy.nodeId);
    var shell = create("div", "hub-v2-shell hub-v2-footer-shell");
    shell.append(create("span", "hub-v2-footer-star", "✦"), create("p", "", copy.text), create("span", "hub-v2-footer-star", "✦"));
    footer.appendChild(shell);
    return footer;
  };

  Controller.prototype.applyEffects = function () {
    var reduced = this.manualReduced || this.root.getAttribute("data-system-motion") === "reduced";
    this.root.setAttribute("data-effects", reduced ? "reduced" : "full");
    var button = this.root.querySelector("[data-effects-toggle]");
    if (button) {
      button.textContent = this.manualReduced ? "Reduced Effects: On" : "Reduced Effects: Off";
      button.setAttribute("aria-pressed", String(this.manualReduced));
    }
    if (reduced) {
      this.root.querySelectorAll("[data-reveal]").forEach(function (element) {
        element.classList.add("is-visible");
      });
    }
  };

  Controller.prototype.wireEffects = function () {
    var self = this;
    var button = this.root.querySelector("[data-effects-toggle]");
    if (!button) return;
    this.on(button, "click", function () {
      self.manualReduced = !self.manualReduced;
      writeReducedPreference(self.manualReduced);
      self.applyEffects();
    });
  };

  Controller.prototype.wireReveal = function () {
    var targets = Array.from(this.root.querySelectorAll("[data-reveal]"));
    if (this.root.getAttribute("data-effects") === "reduced" || !("IntersectionObserver" in window)) {
      targets.forEach(function (element) { element.classList.add("is-visible"); });
      return;
    }
    var observer = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    }, { rootMargin: "0px 0px -8% 0px", threshold: 0.1 });
    targets.forEach(function (element) { observer.observe(element); });
    this.observers.push(observer);
  };

  Controller.prototype.wirePointerLight = function () {
    var self = this;
    this.root.querySelectorAll("[data-pointer-light]").forEach(function (card) {
      self.on(card, "pointermove", function (event) {
        if (self.root.getAttribute("data-effects") === "reduced") return;
        var rect = card.getBoundingClientRect();
        var x = ((event.clientX - rect.left) / Math.max(rect.width, 1)) * 100;
        var y = ((event.clientY - rect.top) / Math.max(rect.height, 1)) * 100;
        card.style.setProperty("--pointer-x", x.toFixed(1) + "%");
        card.style.setProperty("--pointer-y", y.toFixed(1) + "%");
      }, { passive: true });
    });
  };

  Controller.prototype.wireMotionPreference = function () {
    var self = this;
    if (!window.matchMedia) return;
    var query = window.matchMedia("(prefers-reduced-motion: reduce)");
    var handler = function () {
      self.root.setAttribute("data-system-motion", query.matches ? "reduced" : "standard");
      self.applyEffects();
    };
    if (query.addEventListener) this.on(query, "change", handler);
  };

  function mount(root, options) {
    if (!(root instanceof Element)) throw new HubRuntimeError("HUB_MOUNT_INVALID", "A valid Hub mount element is required.");
    if (controllers.has(root)) controllers.get(root).destroy();
    try {
      var controller = new Controller(root, options || {});
      controllers.set(root, controller);
      controller.start();
      return controller;
    } catch (error) {
      window.dispatchEvent(new CustomEvent("hrv:page-error", {
        detail: {
          pageId: options && options.source && options.source.page ? options.source.page.id : "hrv-page:classroom-explorations",
          code: error && error.code ? error.code : "HUB_RUNTIME_FAILED",
          message: error && error.message ? error.message : "Hub runtime failed."
        }
      }));
      throw error;
    }
  }

  function destroy(root) {
    if (controllers.has(root)) controllers.get(root).destroy();
  }

  window.HRVClassroomExplorationsV2 = {
    version: "2026.08.28.1-review",
    mount: mount,
    destroy: destroy,
    project: project
  };
})();
