const mounts = new WeakMap();
const SITE = "https://rmhughes.edublogs.org";

function canonical(value) {
  if (Array.isArray(value)) return "[" + value.map(canonical).join(",") + "]";
  if (value && typeof value === "object") return "{" + Object.keys(value).sort().map(key => JSON.stringify(key) + ":" + canonical(value[key])).join(",") + "}";
  return JSON.stringify(value);
}
function invariant(condition) { if (!condition) throw new Error("The archive preview does not match its verified content identity."); }
export async function validateYearArchivePreview(manifest, digest = bytes => globalThis.crypto.subtle.digest("SHA-256", bytes)) {
  invariant(manifest?.runtimeSchemaVersion === "2.0" && manifest.mode === "private-candidate" && manifest.publicationAvailable === false);
  const year = manifest.page?.schoolYear;
  invariant(/^\d{4}-\d{4}$/.test(year) && Number(year.slice(0, 4)) >= 2026 && Number(year.slice(5)) === Number(year.slice(0, 4)) + 1);
  invariant(manifest.page.id === `hrv-page:classroom-explorations-archive-${year}` && manifest.page.wordpressPageId === null && manifest.page.archiveHref === null);
  invariant(Array.isArray(manifest.collections?.explorations) && Array.isArray(manifest.collections?.stories));
  const all = [...manifest.collections.explorations, ...manifest.collections.stories];
  invariant(all.length > 0 && new Set(all.map(item => item.id)).size === all.length);
  invariant(manifest.stats.total === all.length && manifest.stats.explorations === manifest.collections.explorations.length && manifest.stats.stories === manifest.collections.stories.length);
  invariant(new URL(manifest.page.hubHref).origin === SITE);
  for (const item of all) {
    invariant(item.schoolYear === year && typeof item.title === "string" && typeof item.summary === "string" && Array.isArray(item.tags));
    invariant(new URL(item.href).origin === SITE && /^\/(?:[a-z0-9-]+\/)+$/.test(new URL(item.href).pathname));
    invariant(!item.image || (new URL(item.image.src).protocol === "https:" && typeof item.image.alt === "string"));
  }
  const { snapshotId, ...payload } = manifest;
  const hash = [...new Uint8Array(await digest(new TextEncoder().encode(canonical(payload))))].map(byte => byte.toString(16).padStart(2, "0")).join("");
  invariant(snapshotId === "sha256:" + hash);
  return manifest;
}

export async function mountYearArchive(root, input, options = {}) {
  const existing = mounts.get(root);
  if (existing) return existing;
  const manifest = await validateYearArchivePreview(input, options.digest);
  const doc = root.ownerDocument;
  const node = (tag, cls, text) => { const el = doc.createElement(tag); if (cls) el.className = cls; if (text !== undefined) el.textContent = text; return el; };
  const link = (text, href) => { const el = node("a", "", text); el.href = href; el.target = "_blank"; el.rel = "noopener noreferrer"; return el; };
  const fragment = doc.createDocumentFragment();
  const status = node("aside", "year-archive-review", "Private archive preview · Public installation is still pending");
  status.setAttribute("aria-label", "Preview status"); fragment.append(status);
  const header = node("header", "year-archive-hero");
  const eyebrow = node("p", "year-archive-eyebrow", "Hughes Room Views · Our year of discovery");
  header.append(eyebrow, node("h1", "", manifest.page.schoolYearLabel), node("p", "year-archive-subtitle", "Small moments. Big discoveries."), node("p", "year-archive-intro", manifest.page.intro));
  const counts = node("div", "year-archive-counts");
  for (const [count, label] of [[manifest.stats.explorations, "Explorations"], [manifest.stats.stories, "Learning stories"]]) {
    const cell = node("div", ""); cell.append(node("strong", "", String(count)), node("span", "", label)); counts.append(cell);
  }
  header.append(counts); fragment.append(header);
  const controls = node("section", "year-archive-controls"); controls.setAttribute("aria-label", "Explore the year");
  const searchLabel = node("label", "year-archive-search", "Find a memory");
  const search = node("input", ""); search.type = "search"; search.placeholder = "Search titles, stories, and topics"; searchLabel.append(search);
  const filters = node("div", "year-archive-filters"); filters.setAttribute("role", "group"); filters.setAttribute("aria-label", "Filter memories");
  let selected = "all";
  const buttons = [["all", "All memories"], ["exploration", "Explorations"], ["story", "Learning stories"]].map(([value, label]) => {
    const button = node("button", "", label); button.type = "button"; button.setAttribute("aria-pressed", String(value === selected));
    button.addEventListener("click", () => { selected = value; update(); }); filters.append(button); return { value, button };
  });
  controls.append(searchLabel, filters); fragment.append(controls);
  const liveCount = node("p", "year-archive-results"); liveCount.setAttribute("role", "status"); liveCount.setAttribute("aria-live", "polite"); fragment.append(liveCount);
  const grid = node("div", "year-archive-grid"), cards = [];
  const all = [...manifest.collections.explorations.map(item => ({ ...item, kind: "exploration" })), ...manifest.collections.stories.map(item => ({ ...item, kind: "story" }))];
  for (const item of all) {
    const card = node("article", "year-archive-card"); card.dataset.contentId = item.id;
    if (item.image) {
      const image = node("img", "year-archive-image"); image.src = item.image.src; image.alt = item.image.alt; image.loading = "lazy"; image.referrerPolicy = "no-referrer";
      image.addEventListener("error", () => { image.hidden = true; }); card.append(image);
    }
    const content = node("div", "year-archive-card-body");
    content.append(node("p", "year-archive-kind", item.kind === "exploration" ? "Classroom Exploration" : "This week we learned"), node("h2", "", item.title), node("p", "year-archive-summary", item.summary));
    if (item.learningPoints?.length) {
      const details = node("details", "year-archive-learning"), list = node("ul", "");
      details.append(node("summary", "", "What we discovered")); item.learningPoints.forEach(point => list.append(node("li", "", point))); details.append(list); content.append(details);
    }
    if (item.tags.length) content.append(node("p", "year-archive-tags", item.tags.join(" · ")));
    content.append(link(item.kind === "exploration" ? "Revisit this Exploration ↗" : "Remember this story ↗", item.href));
    card.append(content); grid.append(card); cards.push({ card, item, terms: [item.title, item.summary, ...item.tags, ...(item.learningPoints ?? [])].join(" ").toLocaleLowerCase() });
  }
  const empty = node("p", "year-archive-empty", "No memories match this search. Try another word or choose All memories."); empty.hidden = true;
  fragment.append(grid, empty);
  const footer = node("footer", "year-archive-footer"); footer.append(node("p", "", "Every question leaves a little light behind."), link("Return to the Classroom Explorations Hub ↗", manifest.page.hubHref));
  fragment.append(footer);
  function update() {
    const query = search.value.trim().toLocaleLowerCase(); let count = 0;
    for (const { card, item, terms } of cards) { card.hidden = !(selected === "all" || selected === item.kind) || !terms.includes(query); if (!card.hidden) count++; }
    buttons.forEach(({ value, button }) => button.setAttribute("aria-pressed", String(value === selected)));
    liveCount.textContent = `${count} of ${cards.length} memories`; empty.hidden = count !== 0;
  }
  search.addEventListener("input", update);
  root.replaceChildren(fragment); root.classList.add("year-archive"); root.dataset.archiveSnapshot = manifest.snapshotId; root.dataset.hrvPage = manifest.page.id; update();
  const controller = { manifest, destroy() { root.replaceChildren(); root.classList.remove("year-archive"); delete root.dataset.archiveSnapshot; mounts.delete(root); } };
  mounts.set(root, controller); return controller;
}
