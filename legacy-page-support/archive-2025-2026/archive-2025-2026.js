(() => {
  "use strict";

  const SCHOOL_YEAR = "2025-2026";
  const ROOT_SELECTOR = "#hrv-archive-2025-2026";
  const SOURCE_PATH = "apps/classroom-explorations-hub/source/hub.source.json";
  const ROUTES_PATH = "registry/hrv-routes.source.json";

  const root = document.querySelector(ROOT_SELECTOR);
  if (!root || root.dataset.hrvArchiveStarted === "true") return;
  root.dataset.hrvArchiveStarted = "true";

  const subjectClass = new Map([
    ["great-barrier-reef", "subject-reef"],
    ["mushrooms", "subject-mushrooms"],
    ["caterpillars-in-the-classroom-historical", "subject-caterpillars"],
    ["botany-lets-talk-about-tubers", "subject-tubers"],
    ["traditions-of-russian-winter", "subject-winter"],
    ["silent-wings-wise-eyes-learning-about-owls", "subject-owls"],
    ["bats-dont-go-bump-in-the-night", "subject-bats"],
    ["autumn-spiders-gentle-web-artists", "subject-spiders"]
  ]);

  const node = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  const currentScript = document.currentScript;
  const scriptUrl = currentScript?.src || "";
  const marker = "/legacy-page-support/archive-2025-2026/archive-2025-2026.js";
  const markerIndex = scriptUrl.indexOf(marker);
  const immutableBase = markerIndex >= 0 ? scriptUrl.slice(0, markerIndex + 1) : "";

  const showStatus = (message, state = "error") => {
    root.dataset.hrvArchiveState = state;
    const status = root.querySelector("[data-archive-status]");
    if (status) {
      status.hidden = false;
      status.textContent = message;
    }
  };

  const routeHref = (routeRef, routeMap, origin) => {
    const route = routeMap.get(routeRef);
    if (!route) return "#";
    return new URL(route.path, origin).href;
  };

  const createTags = (tags = []) => {
    const list = node("ul", "hrv-archive-tags");
    for (const tag of tags) list.append(node("li", "", tag));
    return list;
  };

  const createCard = (item, kind, routeMap, origin) => {
    const article = node(
      "article",
      `hrv-archive-card ${kind === "exploration" ? "archive-exploration-card" : "archive-learning-card"} ${subjectClass.get(item.id) || "subject-generic"}`
    );
    article.dataset.searchText = [item.title, item.summary, ...(item.tags || [])]
      .join(" ")
      .toLocaleLowerCase();

    const anchor = node("a", "hrv-archive-card-link");
    anchor.href = routeHref(item.routeRef, routeMap, origin);
    anchor.setAttribute("aria-label", `Open ${item.title}`);

    const visual = node("div", "hrv-archive-card-visual");
    if (item.image?.url) {
      const image = node("img", "hrv-archive-card-image");
      image.src = item.image.url;
      image.alt = item.image.alt || "";
      image.loading = "lazy";
      image.decoding = "async";
      visual.append(image);
    }

    visual.append(
      node("span", "hrv-archive-card-shade"),
      node("span", "hrv-archive-card-label", kind === "exploration" ? "PAST EXHIBIT" : "PAST LEARNING"),
      node("span", "hrv-archive-card-year", "2025–2026")
    );

    const meta = node("div", "hrv-archive-card-meta");
    meta.append(
      node("h3", "hrv-archive-card-title", item.title),
      node("p", "hrv-archive-card-summary", item.summary),
      createTags(item.tags),
      node("span", "hrv-archive-card-enter", kind === "exploration" ? "Revisit exhibit →" : "Open learning display →")
    );

    anchor.append(visual, meta);
    article.append(anchor);
    return article;
  };

  const wireSearch = (section, cards, noun) => {
    const input = section.querySelector("[data-archive-search]");
    const count = section.querySelector("[data-archive-count]");
    if (!input || !count) return;

    const update = () => {
      const query = input.value.trim().toLocaleLowerCase();
      let visible = 0;
      for (const card of cards) {
        const match = !query || card.dataset.searchText.includes(query);
        card.hidden = !match;
        if (match) visible += 1;
      }
      count.textContent = `${visible} ${noun}${visible === 1 ? "" : "s"} on display`;
    };

    input.addEventListener("input", update);
    update();
  };

  const renderGallery = (kind, items, routeMap, origin) => {
    const section = root.querySelector(`[data-archive-section="${kind}"]`);
    const grid = section?.querySelector("[data-archive-grid]");
    if (!section || !grid) return;

    const cards = items.map((item) => createCard(item, kind === "explorations" ? "exploration" : "learning", routeMap, origin));
    grid.replaceChildren(...cards);
    wireSearch(section, cards, kind === "explorations" ? "exhibit" : "learning display");
  };

  const updateStats = (explorations, twwl) => {
    const explorationCount = root.querySelector("[data-archive-stat=explorations]");
    const learningCount = root.querySelector("[data-archive-stat=learning]");
    const totalCount = root.querySelector("[data-archive-stat=total]");
    if (explorationCount) explorationCount.textContent = String(explorations.length);
    if (learningCount) learningCount.textContent = String(twwl.length);
    if (totalCount) totalCount.textContent = String(explorations.length + twwl.length);
  };

  const run = async () => {
    if (!immutableBase) {
      showStatus("The archive could not verify its publication source. The preserved fallback links below are still available.");
      return;
    }

    try {
      root.dataset.hrvArchiveState = "loading";

      const [sourceResponse, routeResponse] = await Promise.all([
        fetch(`${immutableBase}${SOURCE_PATH}`, { credentials: "omit", cache: "force-cache" }),
        fetch(`${immutableBase}${ROUTES_PATH}`, { credentials: "omit", cache: "force-cache" })
      ]);

      if (!sourceResponse.ok || !routeResponse.ok) {
        throw new Error(`Archive data request failed (${sourceResponse.status}/${routeResponse.status}).`);
      }

      const [source, registry] = await Promise.all([sourceResponse.json(), routeResponse.json()]);
      if (source?.schemaVersion !== "1.0" || registry?.schemaVersion !== "1.0") {
        throw new Error("Unsupported archive data contract.");
      }

      const origin = registry.site?.origin || window.location.origin;
      const routeMap = new Map((registry.routes || []).map((route) => [route.ref, route]));
      const explorations = (source.data?.explorations || []).filter((item) => item.schoolYear === SCHOOL_YEAR);
      const twwl = (source.data?.twwl || []).filter((item) => item.schoolYear === SCHOOL_YEAR);

      renderGallery("explorations", explorations, routeMap, origin);
      renderGallery("learning", twwl, routeMap, origin);
      updateStats(explorations, twwl);

      const fallback = root.querySelector("[data-archive-fallback]");
      if (fallback) fallback.hidden = true;

      const status = root.querySelector("[data-archive-status]");
      if (status) status.hidden = true;

      root.dataset.hrvArchiveState = "ready";
    } catch (error) {
      console.error("[HRV 2025-2026 Archive]", error);
      showStatus("The interactive archive could not load, but the preserved fallback links below are still available.");
    }
  };

  run();
})();
