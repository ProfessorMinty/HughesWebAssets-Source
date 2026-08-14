import { validateHubSemantics } from "./classroom-explorations-hub-contract.mjs";

function clone(value) { return structuredClone(value); }
function findById(items, id) { return items.find((item) => item.id === id); }
function uniquePush(items, id) { return items.includes(id) ? items : [...items, id]; }

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
  const next = clone(source); next.data.composition.featuredMediaId = mediaId; validateHubSemantics(next, registry); return next;
}
export function reorderPastExplorations(source, registry, orderedIds) {
  const next = clone(source); next.data.composition.pastExplorationIds = [...orderedIds]; validateHubSemantics(next, registry); return next;
}
export function reorderPastTwwl(source, registry, orderedIds) {
  const next = clone(source); next.data.composition.pastTwwlIds = [...orderedIds]; validateHubSemantics(next, registry); return next;
}
export function updateExploration(source, registry, id, patch) {
  if (Object.prototype.hasOwnProperty.call(patch, "id")) throw new Error("Stable Exploration IDs cannot be changed by edit operations.");
  const next = clone(source); const item = findById(next.data.explorations, id); if (!item) throw new Error(`Unknown Exploration ${id}`); Object.assign(item, patch); validateHubSemantics(next, registry); return next;
}
export function updateTwwl(source, registry, id, patch) {
  if (Object.prototype.hasOwnProperty.call(patch, "id")) throw new Error("Stable TWWL IDs cannot be changed by edit operations.");
  const next = clone(source); const item = findById(next.data.twwl, id); if (!item) throw new Error(`Unknown TWWL ${id}`); Object.assign(item, patch); validateHubSemantics(next, registry); return next;
}
