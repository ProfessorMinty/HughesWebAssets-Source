import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { StructuralValidationError, validateSchema } from "./lib/json-schema-lite.mjs";
import {
  HubContractError,
  canonicalJson,
  projectHubRuntime,
  validateAuthoringCompatibility,
  validateHubSemantics,
  validatePublicationCompatibility,
  validateRuntimeManifestCompatibility
} from "./lib/classroom-explorations-hub-contract.mjs";
import {
  registerExploration,
  registerMedia,
  registerTwwl,
  reorderPastExplorations,
  reorderPastTwwl,
  setCurrentExploration,
  setCurrentTwwl,
  setCurrentTwwlComingSoon,
  setFeaturedMedia,
  updateMedia,
  updateRoute,
  upsertPreviousYearArchive
} from "./lib/classroom-explorations-hub-operations.mjs";

const root = resolve(new URL("..", import.meta.url).pathname);
const load = async (p) => JSON.parse(await readFile(resolve(root, p), "utf8"));
const source = await load("apps/classroom-explorations-hub/source/hub.source.json");
const routes = await load("registry/hrv-routes.source.json");
const envelopeSchema = await load("schemas/hrv-page-envelope.schema.json");
const hubSchema = await load("schemas/classroom-explorations-hub.source.schema.json");
const routeSchema = await load("schemas/hrv-route-registry.schema.json");
const runtimeSchema = await load("schemas/classroom-explorations-hub.runtime.schema.json");

const validateSource = (candidate, registry = routes) => {
  validateAuthoringCompatibility(candidate);
  validateSchema(candidate, envelopeSchema);
  validateSchema(candidate.data, hubSchema, "$.data");
  validateSchema(registry, routeSchema);
  validateHubSemantics(candidate, registry);
  return candidate;
};
const expectHubCode = (fn, code) => {
  try { fn(); assert.fail(`Expected ${code}`); }
  catch (error) { assert(error instanceof HubContractError, `Expected HubContractError for ${code}, got ${error}`); assert.equal(error.code, code); }
};
const clone = (value) => structuredClone(value);
const exploration = (id, title = id) => ({
  id,
  schoolYear: "2026-2027",
  title,
  summary: `${title} summary`,
  routeRef: "hrv-route:zinnia",
  image: { kind: "external-url", url: `https://example.com/${id}.jpg`, alt: `${title} image` },
  learningPoints: [`${title} learning point`],
  tags: ["Test"]
});
const twwl = (id, title = id) => ({ id, schoolYear: "2026-2027", title, summary: `${title} summary`, routeRef: "hrv-route:zinnia", tags: ["Test"] });
const media = (id, url = "https://www.youtube.com/watch?v=dQw4w9WgXcQ", association = { kind: "hub" }) => ({ id, kind: "youtube", sourceUrl: url, title: `${id} title`, association });

validateSource(source);
const runtime = projectHubRuntime(source, routes);
validateSchema(runtime, runtimeSchema);
validateRuntimeManifestCompatibility(runtime);

// A. Current Zinnia + TWWL Coming Soon.
assert.equal(runtime.current.exploration.id, "summer-bloom-adoption-project");
assert.equal(runtime.current.exploration.href, "https://rmhughes.edublogs.org/zinnia-page/");
assert.equal(runtime.current.twwl.state, "coming-soon");
assert.deepEqual(runtime.galleries.pastExplorations, []);
assert.deepEqual(runtime.galleries.pastTwwl, []);
assert.equal(runtime.current.featuredMedia.embedUrl, "https://www.youtube-nocookie.com/embed/AR1cSKxxSmU");
console.log("[hub test A] current Zinnia + truthful TWWL Coming Soon passed");

// B/C. Move Current Exploration into Past, install a new Current, preserve stable outgoing identity.
let swap = registerExploration(source, routes, exploration("next-exploration", "Next Exploration"));
swap = setCurrentExploration(swap, routes, "next-exploration");
assert.equal(swap.data.composition.currentExplorationId, "next-exploration");
assert.deepEqual(swap.data.composition.pastExplorationIds, ["summer-bloom-adoption-project"]);
assert.equal(swap.data.explorations.find((item) => item.id === "summer-bloom-adoption-project")?.id, "summer-bloom-adoption-project");
console.log("[hub test B-C] Current Exploration swap preserves stable identity and archives outgoing Current");

// D/E. Publish a real TWWL, then switch the slot back to Coming Soon and archive the outgoing TWWL.
let twwlFlow = registerTwwl(source, routes, twwl("first-week-learning", "First Week Learning"));
twwlFlow = setCurrentTwwl(twwlFlow, routes, "first-week-learning");
assert.equal(twwlFlow.data.composition.currentTwwl.state, "published");
assert.equal(twwlFlow.data.composition.currentTwwl.contentId, "first-week-learning");
twwlFlow = setCurrentTwwlComingSoon(twwlFlow, routes);
assert.equal(twwlFlow.data.composition.currentTwwl.state, "coming-soon");
assert.deepEqual(twwlFlow.data.composition.pastTwwlIds, ["first-week-learning"]);
console.log("[hub test D-E] real TWWL publication and Coming Soon reset passed");

// F. Reorder Past Exploration gallery explicitly.
let explorationOrder = registerExploration(source, routes, exploration("past-one", "Past One"));
explorationOrder = registerExploration(explorationOrder, routes, exploration("past-two", "Past Two"));
explorationOrder.data.composition.pastExplorationIds = ["past-one", "past-two"];
validateHubSemantics(explorationOrder, routes);
explorationOrder = reorderPastExplorations(explorationOrder, routes, ["past-two", "past-one"]);
assert.deepEqual(explorationOrder.data.composition.pastExplorationIds, ["past-two", "past-one"]);
console.log("[hub test F] Past Exploration order passed");

// G. Reorder Past TWWL gallery explicitly.
let twwlOrder = registerTwwl(source, routes, twwl("week-one", "Week One"));
twwlOrder = registerTwwl(twwlOrder, routes, twwl("week-two", "Week Two"));
twwlOrder.data.composition.pastTwwlIds = ["week-one", "week-two"];
validateHubSemantics(twwlOrder, routes);
twwlOrder = reorderPastTwwl(twwlOrder, routes, ["week-two", "week-one"]);
assert.deepEqual(twwlOrder.data.composition.pastTwwlIds, ["week-two", "week-one"]);
console.log("[hub test G] Past TWWL order passed");

// H. Change featured video through a stable media ID.
let mediaFlow = registerMedia(source, routes, media("alternate-welcome"));
mediaFlow = setFeaturedMedia(mediaFlow, routes, "alternate-welcome");
assert.equal(projectHubRuntime(mediaFlow, routes).current.featuredMedia.id, "alternate-welcome");
mediaFlow = updateMedia(mediaFlow, routes, "alternate-welcome", { title: "Updated Welcome" });
assert.equal(mediaFlow.data.media.find((item) => item.id === "alternate-welcome")?.title, "Updated Welcome");
console.log("[hub test H] featured-media change/update passed");

// I. Exploration-associated featured media must point to the Current Exploration.
expectHubCode(() => validateHubSemantics({ ...clone(source), data: { ...clone(source.data), media: [media("bad-relation", undefined, { kind: "exploration", contentId: "not-current" })], composition: { ...clone(source.data.composition), featuredMediaId: "bad-relation" } } }, routes), "HUB_FEATURED_VIDEO_RELATION_MISMATCH");
console.log("[hub test I] featured-video relation mismatch rejected");

// J. Route/slug may change without changing HRV content identity or WordPress page identity.
const originalPageId = routes.routes.find((item) => item.ref === "hrv-route:zinnia").wordpressPageId;
const rerouted = updateRoute(routes, "hrv-route:zinnia", { slug: "zinnia-garden", path: "/zinnia-garden/" });
assert.equal(rerouted.routes.find((item) => item.ref === "hrv-route:zinnia").wordpressPageId, originalPageId);
assert.equal(source.data.explorations[0].id, "summer-bloom-adoption-project");
assert.equal(projectHubRuntime(source, rerouted).current.exploration.href, "https://rmhughes.edublogs.org/zinnia-garden/");
console.log("[hub test J] route change preserves HRV content + WordPress page identity");

// K. Unknown routeRef rejected.
expectHubCode(() => validateHubSemantics({ ...clone(source), data: { ...clone(source.data), explorations: [{ ...clone(source.data.explorations[0]), routeRef: "hrv-route:missing" }] } }, routes), "HUB_ROUTE_REF_UNKNOWN");
console.log("[hub test K] unknown routeRef rejected");

// L. Duplicate stable ID rejected.
const duplicateId = clone(source); duplicateId.data.explorations.push(clone(duplicateId.data.explorations[0]));
expectHubCode(() => validateHubSemantics(duplicateId, routes), "HUB_CONTENT_ID_DUPLICATE");
console.log("[hub test L] duplicate stable ID rejected");

// M/N. Missing and unknown Current Exploration are distinct coded failures.
const missingCurrent = clone(source); delete missingCurrent.data.composition.currentExplorationId;
expectHubCode(() => validateHubSemantics(missingCurrent, routes), "HUB_CURRENT_EXPLORATION_MISSING");
const unknownCurrent = clone(source); unknownCurrent.data.composition.currentExplorationId = "missing";
expectHubCode(() => validateHubSemantics(unknownCurrent, routes), "HUB_CURRENT_EXPLORATION_UNKNOWN");
console.log("[hub test M-N] missing/unknown Current Exploration rejected with stable codes");

// O. Duplicate/contradictory gallery placement rejected.
const duplicatePlacement = clone(source); duplicatePlacement.data.composition.pastExplorationIds = ["summer-bloom-adoption-project"];
expectHubCode(() => validateHubSemantics(duplicatePlacement, routes), "HUB_CONTENT_PLACED_MULTIPLE_TIMES");
console.log("[hub test O] contradictory gallery placement rejected");

// P. Invalid archive relationships rejected; valid update remains an explicit relationship.
const invalidArchive = clone(source); invalidArchive.data.composition.previousYears[0] = { ...invalidArchive.data.composition.previousYears[0], state: "published", routeRef: null };
expectHubCode(() => validateHubSemantics(invalidArchive, routes), "HUB_ARCHIVE_ROUTE_MISSING");
const updatedArchive = upsertPreviousYearArchive(source, routes, { id: "hub-archive:2025-2026", schoolYear: "2025-2026", state: "coming-soon", routeRef: null });
assert.equal(updatedArchive.data.composition.previousYears.length, 1);
console.log("[hub test P] archive relationship validation/upsert passed");

// Q. Invalid media reference rejected.
const invalidMedia = clone(source); invalidMedia.data.explorations[0].image.url = "https://drive.google.com/file/d/not-public";
expectHubCode(() => validateHubSemantics(invalidMedia, routes), "HUB_MEDIA_REF_INVALID");
console.log("[hub test Q] invalid media reference rejected");

// R. Unknown authoring property fails closed under the canonical structural schema.
const unknownProperty = clone(source); unknownProperty.data.copy.hero.unknown = "nope";
try { validateSchema(unknownProperty.data, hubSchema, "$.data"); assert.fail("unknown property should fail"); }
catch (error) { assert(error instanceof StructuralValidationError); assert(error.issues.some((issue) => issue.code === "SCHEMA_UNKNOWN_PROPERTY")); }
console.log("[hub test R] unknown authoring property rejected");

// S. Unsupported future authoring schema fails explicitly rather than being guessed.
const futureSource = clone(source); futureSource.schemaVersion = "9.0";
expectHubCode(() => validateAuthoringCompatibility(futureSource), "HUB_SCHEMA_UNSUPPORTED");
console.log("[hub test S] unsupported future authoring schema rejected");

// T. Unsupported future browser runtime schema fails explicitly.
const futureRuntime = clone(runtime); futureRuntime.runtimeSchemaVersion = "9.0";
expectHubCode(() => validateRuntimeManifestCompatibility(futureRuntime), "HUB_RUNTIME_SCHEMA_UNSUPPORTED");
console.log("[hub test T] unsupported future runtime schema rejected");

// U. Runtime/content publication compatibility mismatch fails closed.
const publication = { schemaVersion: "1.0", pageId: runtime.page.id, pageType: runtime.page.type, runtime: { runtimeSchemaVersion: "1.0" }, content: { runtimeSchemaVersion: "1.0", snapshotId: "sha256:" + "0".repeat(64) } };
expectHubCode(() => validatePublicationCompatibility(publication, runtime), "HUB_RUNTIME_CONTENT_INCOMPATIBLE");
console.log("[hub test U] runtime/content mismatch rejected");

// V. Deterministic projection is byte-equivalent and has the same snapshot identity.
const runtimeAgain = projectHubRuntime(clone(source), clone(routes));
assert.equal(runtimeAgain.snapshotId, runtime.snapshotId);
assert.equal(canonicalJson(runtimeAgain), canonicalJson(runtime));
console.log("[hub test V] deterministic runtime projection passed");

// Additional Lanternworks operation coverage: stable IDs cannot be rewritten by edit operations.
assert.throws(() => updateRoute(routes, "hrv-route:zinnia", { wordpressPageId: 9999 }), /WordPress page identity/);
console.log("[hub test operations] stable route/page identity protection passed");

console.log("[hub test] A-V contract suite passed; W immutable-publication preservation runs after deterministic build");
