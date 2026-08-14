import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { validateSchema, StructuralValidationError } from "./lib/json-schema-lite.mjs";
import { HubContractError, projectHubRuntime, validateHubSemantics } from "./lib/classroom-explorations-hub-contract.mjs";
import { setCurrentExploration, setCurrentTwwlComingSoon } from "./lib/classroom-explorations-hub-operations.mjs";
const root = resolve(new URL("..", import.meta.url).pathname);
const load = async (p) => JSON.parse(await readFile(resolve(root, p), "utf8"));
const source = await load("apps/classroom-explorations-hub/source/hub.source.json");
const routes = await load("registry/hrv-routes.source.json");
validateSchema(source, await load("schemas/hrv-page-envelope.schema.json"));
validateSchema(source.data, await load("schemas/classroom-explorations-hub.source.schema.json"), "$.data");
validateSchema(routes, await load("schemas/hrv-route-registry.schema.json"));
validateHubSemantics(source, routes);
const runtime = projectHubRuntime(source, routes);
validateSchema(runtime, await load("schemas/classroom-explorations-hub.runtime.schema.json"));
assert.equal(source.page.id, "hrv-page:classroom-explorations");
assert.equal(source.page.routeRef, "hrv-route:classroom-explorations");
assert.equal(runtime.page.href, "https://rmhughes.edublogs.org/classroom-explorations/");
assert.equal(runtime.current.exploration.id, "summer-bloom-adoption-project");
assert.equal(runtime.current.exploration.href, "https://rmhughes.edublogs.org/zinnia-page/");
assert.equal(runtime.current.twwl.state, "coming-soon");
assert.deepEqual(runtime.galleries.pastExplorations, []);
assert.deepEqual(runtime.galleries.pastTwwl, []);
assert.equal(runtime.archives[0].state, "coming-soon");
assert.equal(runtime.archives[0].href, null);
assert.equal(runtime.current.featuredMedia.embedUrl, "https://www.youtube-nocookie.com/embed/AR1cSKxxSmU");
const mutate = (fn) => { const c = structuredClone(source); fn(c); return c; };
const expectCode = (candidate, code) => {
  try { validateHubSemantics(candidate, routes); assert.fail(`Expected ${code}`); }
  catch (e) { assert(e instanceof HubContractError); assert.equal(e.code, code); }
};
expectCode(mutate((s) => { s.data.composition.currentExplorationId = "missing"; }), "HUB_CURRENT_EXPLORATION_UNKNOWN");
expectCode(mutate((s) => { s.data.composition.currentTwwl = { id: "hub-slot:current-twwl", state: "published", contentId: "missing" }; }), "HUB_CURRENT_TWWL_UNKNOWN");
expectCode(mutate((s) => { s.data.media[0].association = { kind: "exploration", contentId: "wrong" }; }), "HUB_FEATURED_VIDEO_RELATION_MISMATCH");
expectCode(mutate((s) => { s.data.composition.pastExplorationIds = ["summer-bloom-adoption-project"]; }), "HUB_CONTENT_PLACED_MULTIPLE_TIMES");
expectCode(mutate((s) => { s.data.composition.previousYears.push({ id: "hub-archive:2025-2026", schoolYear: "2025-2026", state: "coming-soon", routeRef: null }); }), "HUB_ARCHIVE_YEAR_DUPLICATE");
expectCode(mutate((s) => { s.data.explorations[0].routeRef = "hrv-route:missing"; }), "HUB_ROUTE_REF_UNKNOWN");
const bad = structuredClone(source);
bad.data.copy.hero.unknown = "nope";
try {
  validateSchema(bad.data, await load("schemas/classroom-explorations-hub.source.schema.json"), "$.data");
  assert.fail("unknown property should fail");
} catch (e) {
  assert(e instanceof StructuralValidationError);
  assert(e.issues.some((i) => i.code === "SCHEMA_UNKNOWN_PROPERTY"));
}
const swapCandidate = structuredClone(source);
swapCandidate.data.explorations.push({ id: "next-exploration", schoolYear: "2026-2027", title: "Next Exploration", summary: "Test content", routeRef: "hrv-route:zinnia", image: { kind: "external-url", url: "https://example.com/test.jpg", alt: "Test" }, learningPoints: [], tags: [] });
const swapped = setCurrentExploration(swapCandidate, routes, "next-exploration");
assert.equal(swapped.data.composition.currentExplorationId, "next-exploration");
assert.deepEqual(swapped.data.composition.pastExplorationIds, ["summer-bloom-adoption-project"]);
const comingSoon = setCurrentTwwlComingSoon(source, routes);
assert.equal(comingSoon.data.composition.currentTwwl.state, "coming-soon");
console.log("[hub test] clean-sheet source, route, semantic, projection, domain-operation, and fail-closed validation checks passed");
