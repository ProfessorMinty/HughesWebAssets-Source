import { createHash } from "node:crypto";

export class HubContractError extends Error {
  constructor(code, message, detail = {}) {
    super(message);
    this.name = "HubContractError";
    this.code = code;
    this.detail = detail;
  }
}

export function canonicalJson(value) {
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map(normalize);
    if (input && typeof input === "object") return Object.fromEntries(Object.keys(input).sort().map((key) => [key, normalize(input[key])]));
    return input;
  };
  return JSON.stringify(normalize(value));
}

export function sha256Text(text) {
  return createHash("sha256").update(text).digest("hex");
}

function indexById(items, code) {
  const map = new Map();
  for (const item of items) {
    if (map.has(item.id)) throw new HubContractError(code, `Duplicate stable id: ${item.id}`, { id: item.id });
    map.set(item.id, item);
  }
  return map;
}

export function validateRouteRegistry(registry) {
  if (registry.schemaVersion !== "1.0") throw new HubContractError("HUB_SCHEMA_UNSUPPORTED", "Unsupported route registry schema.");
  const refs = new Set();
  const pageIds = new Set();
  for (const route of registry.routes) {
    if (refs.has(route.ref)) throw new HubContractError("HUB_ROUTE_REF_DUPLICATE", `Duplicate route ref ${route.ref}.`);
    refs.add(route.ref);
    if (pageIds.has(route.wordpressPageId)) throw new HubContractError("HUB_ROUTE_PAGE_ID_MISMATCH", `WordPress page ID ${route.wordpressPageId} is assigned more than once.`);
    pageIds.add(route.wordpressPageId);
    const expectedPath = `/${route.slug}/`;
    if (route.path !== expectedPath) throw new HubContractError("HUB_ROUTE_PAGE_ID_MISMATCH", `Route ${route.ref} path does not agree with its slug.`, { expectedPath, actualPath: route.path });
  }
}

export function normalizeYouTube(sourceUrl) {
  const url = new URL(sourceUrl);
  let id = "";
  if (url.hostname === "youtu.be") id = url.pathname.replace(/^\//, "").split("/")[0] || "";
  if (url.hostname.endsWith("youtube.com")) {
    if (url.pathname === "/watch") id = url.searchParams.get("v") || "";
    else if (url.pathname.startsWith("/shorts/") || url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] || "";
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) throw new HubContractError("HUB_EXTERNAL_MEDIA_UNSUPPORTED", `Unsupported YouTube URL: ${sourceUrl}`);
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

export function validateHubSemantics(source, registry) {
  if (source.schemaVersion !== "1.0" || source.page.type !== "classroom-explorations-hub") throw new HubContractError("HUB_SCHEMA_UNSUPPORTED", "Unsupported Hub source schema or page type.");
  validateRouteRegistry(registry);
  const routes = new Map(registry.routes.map((route) => [route.ref, route]));
  const years = indexById(source.data.schoolYears, "HUB_SCHOOL_YEAR_DUPLICATE");
  const explorations = indexById(source.data.explorations, "HUB_CONTENT_ID_DUPLICATE");
  const twwl = indexById(source.data.twwl, "HUB_CONTENT_ID_DUPLICATE");
  const media = indexById(source.data.media, "HUB_MEDIA_ID_DUPLICATE");
  const allIds = [...explorations.keys(), ...twwl.keys(), ...media.keys()];
  if (new Set(allIds).size !== allIds.length) throw new HubContractError("HUB_CONTENT_ID_DUPLICATE", "Stable IDs must be unique across Hub content species.");
  if (!routes.has(source.page.routeRef)) throw new HubContractError("HUB_ROUTE_REF_UNKNOWN", `Unknown Hub route ref ${source.page.routeRef}.`);
  const comp = source.data.composition;
  if (!years.has(comp.currentSchoolYear)) throw new HubContractError("HUB_ARCHIVE_YEAR_INVALID", `Unknown current school year ${comp.currentSchoolYear}.`);
  const current = explorations.get(comp.currentExplorationId);
  if (!current) throw new HubContractError("HUB_CURRENT_EXPLORATION_UNKNOWN", `Unknown current Exploration ${comp.currentExplorationId}.`);
  if (current.schoolYear !== comp.currentSchoolYear) throw new HubContractError("HUB_CURRENT_EXPLORATION_YEAR_MISMATCH", "Current Exploration does not belong to currentSchoolYear.");
  for (const item of [...source.data.explorations, ...source.data.twwl]) {
    if (!years.has(item.schoolYear)) throw new HubContractError("HUB_ARCHIVE_YEAR_INVALID", `${item.id} uses unknown school year ${item.schoolYear}.`);
    if (!routes.has(item.routeRef)) throw new HubContractError("HUB_ROUTE_REF_UNKNOWN", `${item.id} uses unknown route ref ${item.routeRef}.`);
  }
  if (comp.currentTwwl.state === "coming-soon" && comp.currentTwwl.contentId !== undefined) throw new HubContractError("HUB_CURRENT_TWWL_INVALID_STATE", "Coming-soon TWWL slot must not contain a contentId.");
  if (comp.currentTwwl.state === "published") {
    if (!comp.currentTwwl.contentId) throw new HubContractError("HUB_CURRENT_TWWL_INVALID_STATE", "Published TWWL slot requires contentId.");
    const item = twwl.get(comp.currentTwwl.contentId);
    if (!item) throw new HubContractError("HUB_CURRENT_TWWL_UNKNOWN", `Unknown current TWWL ${comp.currentTwwl.contentId}.`);
    if (item.schoolYear !== comp.currentSchoolYear) throw new HubContractError("HUB_CURRENT_TWWL_INVALID_STATE", "Current TWWL does not belong to currentSchoolYear.");
  }
  const featured = media.get(comp.featuredMediaId);
  if (!featured) throw new HubContractError("HUB_FEATURED_VIDEO_UNKNOWN", `Unknown featured media ${comp.featuredMediaId}.`);
  if (featured.association.kind === "exploration" && featured.association.contentId !== comp.currentExplorationId) throw new HubContractError("HUB_FEATURED_VIDEO_RELATION_MISMATCH", "Featured exploration media must point to the Current Exploration.");
  const seenPlacement = new Set([comp.currentExplorationId]);
  const validateGallery = (ids, map, kind) => {
    const local = new Set();
    for (const id of ids) {
      if (local.has(id)) throw new HubContractError("HUB_GALLERY_DUPLICATE_ID", `Duplicate ${kind} gallery id ${id}.`);
      local.add(id);
      const item = map.get(id);
      if (!item) throw new HubContractError("HUB_GALLERY_UNKNOWN_CONTENT", `Unknown ${kind} gallery id ${id}.`);
      if (item.schoolYear !== comp.currentSchoolYear) throw new HubContractError("HUB_GALLERY_YEAR_MISMATCH", `${id} is not part of the current school year.`);
      if (seenPlacement.has(id)) throw new HubContractError("HUB_CONTENT_PLACED_MULTIPLE_TIMES", `${id} is placed in contradictory Hub locations.`);
      seenPlacement.add(id);
    }
  };
  validateGallery(comp.pastExplorationIds, explorations, "exploration");
  if (comp.currentTwwl.state === "published") seenPlacement.add(comp.currentTwwl.contentId);
  validateGallery(comp.pastTwwlIds, twwl, "twwl");
  const archiveYears = new Set();
  for (const archive of comp.previousYears) {
    if (archive.schoolYear === comp.currentSchoolYear || !years.has(archive.schoolYear)) throw new HubContractError("HUB_ARCHIVE_YEAR_INVALID", `Invalid archive school year ${archive.schoolYear}.`);
    if (archiveYears.has(archive.schoolYear)) throw new HubContractError("HUB_ARCHIVE_YEAR_DUPLICATE", `Duplicate archive school year ${archive.schoolYear}.`);
    archiveYears.add(archive.schoolYear);
    if (archive.state === "published" && !archive.routeRef) throw new HubContractError("HUB_ARCHIVE_ROUTE_MISSING", `Published archive ${archive.schoolYear} requires a routeRef.`);
    if (archive.routeRef && !routes.has(archive.routeRef)) throw new HubContractError("HUB_ROUTE_REF_UNKNOWN", `Unknown archive route ref ${archive.routeRef}.`);
  }
  for (const exploration of source.data.explorations) {
    const image = exploration.image;
    if (image.kind === "external-url") {
      if (!image.url || !image.url.startsWith("https://")) throw new HubContractError("HUB_MEDIA_REF_INVALID", `${exploration.id} external image must be HTTPS.`);
      const host = new URL(image.url).hostname;
      if (/^(drive|docs)\.google\.com$/i.test(host)) throw new HubContractError("HUB_MEDIA_REF_INVALID", `${exploration.id} must not expose a Google Drive/Docs URL.`);
    } else {
      if (!image.assetRef) throw new HubContractError("HUB_MEDIA_REF_INVALID", `${exploration.id} managed asset requires assetRef.`);
      throw new HubContractError("HUB_MEDIA_REF_UNRESOLVED", "Managed HRV assets are reserved by the contract but no permanent asset resolver is authorized yet.", { assetRef: image.assetRef });
    }
  }
  return { routes, years, explorations, twwl, media };
}

export function projectHubRuntime(source, registry) {
  const indexes = validateHubSemantics(source, registry);
  const routeHref = (ref) => {
    const route = indexes.routes.get(ref);
    return new URL(route.path, registry.site.origin).href;
  };
  const comp = source.data.composition;
  const exp = indexes.explorations.get(comp.currentExplorationId);
  const resolveExploration = (item) => ({
    id: item.id,
    title: item.title,
    summary: item.summary,
    href: routeHref(item.routeRef),
    image: { src: item.image.url, alt: item.image.alt },
    learningPoints: [...item.learningPoints],
    tags: [...item.tags]
  });
  const resolveTwwl = (item) => ({ id: item.id, title: item.title, summary: item.summary, href: routeHref(item.routeRef), tags: [...item.tags] });
  const featured = indexes.media.get(comp.featuredMediaId);
  const payload = {
    runtimeSchemaVersion: "1.0",
    page: {
      id: source.page.id,
      type: source.page.type,
      href: routeHref(source.page.routeRef),
      currentSchoolYear: comp.currentSchoolYear,
      schoolYearLabel: indexes.years.get(comp.currentSchoolYear).label,
      copy: source.data.copy
    },
    current: {
      exploration: resolveExploration(exp),
      twwl: comp.currentTwwl.state === "coming-soon"
        ? { id: comp.currentTwwl.id, state: "coming-soon" }
        : { id: comp.currentTwwl.id, state: "published", content: resolveTwwl(indexes.twwl.get(comp.currentTwwl.contentId)) },
      featuredMedia: { id: featured.id, kind: featured.kind, title: featured.title, embedUrl: normalizeYouTube(featured.sourceUrl) }
    },
    galleries: {
      pastExplorations: comp.pastExplorationIds.map((id) => resolveExploration(indexes.explorations.get(id))),
      pastTwwl: comp.pastTwwlIds.map((id) => resolveTwwl(indexes.twwl.get(id)))
    },
    archives: comp.previousYears.map((archive) => ({
      id: archive.id,
      schoolYear: archive.schoolYear,
      label: indexes.years.get(archive.schoolYear).label,
      state: archive.state,
      href: archive.routeRef ? routeHref(archive.routeRef) : null
    }))
  };
  const snapshotId = `sha256:${sha256Text(canonicalJson(payload))}`;
  return { runtimeSchemaVersion: payload.runtimeSchemaVersion, snapshotId, ...Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "runtimeSchemaVersion")) };
}
