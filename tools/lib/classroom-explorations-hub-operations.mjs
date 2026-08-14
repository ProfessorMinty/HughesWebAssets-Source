import { validateHubSemantics, validateRouteRegistry } from "./classroom-explorations-hub-contract.mjs";

function clone(value) { return structuredClone(value); }
function findById(items, id) { return items.find((item) => item.id === id); }
function uniquePush(items, id) { return items.includes(id) ? items : [...items, id]; }
function rejectIdPatch(patch, label) {
  if (Object.prototype.hasOwnProperty.call(patch, "id")) throw new Error(`Stable ${label} IDs cannot be changed by edit operations.`);
}
function rejectRouteIdentityPatch(patch) {
  if (Object.prototype.hasOwnProperty.call(patch, "ref")) throw new Error("Stable route references cannot be changed by route update operations.");
  if (Object.prototype.hasOwnProperty.call(patch, "wordpressPageId")) throw new Error("WordPress page identity cannot be changed by route update operations.");
}

export function registerExploration(source, registry, exploration) {
  const next = clone(source);
  if (findById(next.data.explorations, exploration.id) || findById(next.data.twwl, exploration.id) || findById(next.data.media, exploration.id)) throw new Error(`Stable ID already exists: ${exploration.id}`);
  next.data.explorations.push(clone(exploration));
  validateHubSemantics(next, registry);
  return next;
}

export function registerTwwl(source, registry, item) {
  const next = clone(source);
  if (findById(next.data.explorations, item.id) || findById(next.data.twwl, item.id) || findById(next.data.media, item.id)) throw new Error(`Stable ID already exists: ${item.id}`);
  next.data.twwl.push(clone(item));
  validateHubSemantics(next, registry);
  return next;
}

export function registerMedia(source, registry, item) {
  const next = clone(source);
  if (findById(next.data.explorations, item.id) || findById(next.data.twwl, item.id) || findById(next.data.media, item.id)) throw new Error(`Stable ID already exists: ${item.id}`);
  next.data.media.push(clone(item));
  validateHubSemantics(next, registry);
  return next;
}

export function setCurrentExploration(source, registry, nextId, { archiveOutgoing = true } = {}) {
  const next = clone(source);
  const comp = next.data.composition;
  if (comp.currentExplorationId !== nextId && archiveOutgoing && comp.currentExplorationId) comp.pastExplorationIds = uniquePush(comp.pastExplorationIds, comp.currentExplorationId);
  comp.pastExplorationIds = comp.pastExplorationIds.filter((id) => id !== nextId);
  comp.currentExplorationId = nextId;
  validateHubSemantics(next, registry);
  return next;
}

export function setCurrentTwwlComingSoon(source, registry) {
  const next = clone(source);
  const comp = next.data.composition;
  if (comp.currentTwwl.state === "published" && comp.currentTwwl.contentId) comp.pastTwwlIds = uniquePush(comp.pastTwwlIds, comp.currentTwwl.contentId);
  comp.currentTwwl = { id: comp.currentTwwl.id, state: "coming-soon" };
  validateHubSemantics(next, registry);
  return next;
}

export function setCurrentTwwl(source, registry, contentId, { archiveOutgoing = true } = {}) {
  const next = clone(source);
  const comp = next.data.composition;
  if (archiveOutgoing && comp.currentTwwl.state === "published" && comp.currentTwwl.contentId && comp.currentTwwl.contentId !== contentId) comp.pastTwwlIds = uniquePush(comp.pastTwwlIds, comp.currentTwwl.contentId);
  comp.pastTwwlIds = comp.pastTwwlIds.filter((id) => id !== contentId);
  comp.currentTwwl = { id: comp.currentTwwl.id, state: "published", contentId };
  validateHubSemantics(next, registry);
  return next;
}

export function setFeaturedMedia(source, registry, mediaId) {
  const next = clone(source);
  next.data.composition.featuredMediaId = mediaId;
  validateHubSemantics(next, registry);
  return next;
}

export function reorderPastExplorations(source, registry, orderedIds) {
  const next = clone(source);
  next.data.composition.pastExplorationIds = [...orderedIds];
  validateHubSemantics(next, registry);
  return next;
}

export function reorderPastTwwl(source, registry, orderedIds) {
  const next = clone(source);
  next.data.composition.pastTwwlIds = [...orderedIds];
  validateHubSemantics(next, registry);
  return next;
}

export function updateExploration(source, registry, id, patch) {
  rejectIdPatch(patch, "Exploration");
  const next = clone(source);
  const item = findById(next.data.explorations, id);
  if (!item) throw new Error(`Unknown Exploration ${id}`);
  Object.assign(item, clone(patch));
  validateHubSemantics(next, registry);
  return next;
}

export function updateTwwl(source, registry, id, patch) {
  rejectIdPatch(patch, "TWWL");
  const next = clone(source);
  const item = findById(next.data.twwl, id);
  if (!item) throw new Error(`Unknown TWWL ${id}`);
  Object.assign(item, clone(patch));
  validateHubSemantics(next, registry);
  return next;
}

export function updateMedia(source, registry, id, patch) {
  rejectIdPatch(patch, "media");
  const next = clone(source);
  const item = findById(next.data.media, id);
  if (!item) throw new Error(`Unknown media ${id}`);
  Object.assign(item, clone(patch));
  validateHubSemantics(next, registry);
  return next;
}

export function upsertPreviousYearArchive(source, registry, archive) {
  const next = clone(source);
  const current = next.data.composition.previousYears.findIndex((item) => item.id === archive.id || item.schoolYear === archive.schoolYear);
  if (current >= 0) next.data.composition.previousYears[current] = clone(archive);
  else next.data.composition.previousYears.push(clone(archive));
  validateHubSemantics(next, registry);
  return next;
}

export function updateRoute(registry, routeRef, patch) {
  rejectRouteIdentityPatch(patch);
  const next = clone(registry);
  const route = next.routes.find((item) => item.ref === routeRef);
  if (!route) throw new Error(`Unknown route ${routeRef}`);
  Object.assign(route, clone(patch));
  validateRouteRegistry(next);
  return next;
}
