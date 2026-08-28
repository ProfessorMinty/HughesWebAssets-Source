import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

import { validateSchema } from "./lib/json-schema-lite.mjs";
import {
  HubContractError,
  projectHubRuntime,
  validateHubSemantics,
  validateRuntimeManifestCompatibility,
  validateRouteRegistry
} from "./lib/classroom-explorations-hub-contract.mjs";
import {
  setCurrentExploration,
  setCurrentTwwl,
  setCurrentTwwlComingSoon,
  reorderPastExplorations,
  updateExploration,
  updateRoute
} from "./lib/classroom-explorations-hub-operations.mjs";
import {
  HubTransactionError,
  applyHubCommand,
  documentRevisions
} from "./lib/classroom-explorations-hub-transactions.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));

const source = readJson("apps/classroom-explorations-hub/source/hub.source.json");
const routes = readJson("registry/hrv-routes.source.json");
const control = readJson("apps/classroom-explorations-hub/source/hub.control.json");
const sourceSchema = readJson("schemas/classroom-explorations-hub.source.schema.json");
const runtimeSchema = readJson("schemas/classroom-explorations-hub.runtime.schema.json");
const routeSchema = readJson("schemas/hrv-route-registry.schema.json");
const controlSchema = readJson("schemas/classroom-explorations-hub.control.schema.json");

validateSchema(source.data, sourceSchema);
validateSchema(routes, routeSchema);
validateSchema(control, controlSchema);
validateRouteRegistry(routes);
validateHubSemantics(source, routes);

const runtime = projectHubRuntime(source, routes);
validateSchema(runtime, runtimeSchema);
validateRuntimeManifestCompatibility(runtime);

assert.equal(source.page.id, "hrv-page:classroom-explorations");
assert.equal(source.page.type, "classroom-explorations-hub");
assert.equal(control.target.pageId, source.page.id);
assert.equal(control.target.pageType, source.page.type);
assert.equal(control.hosts.canonical.wordpressPageId, 17);
assert.equal(control.hosts.canonical.mayPublish, false);
assert.equal(control.hosts.review.wordpressPageId, 2589);
assert.equal(control.hosts.review.path, "/hub-test/");
assert.equal(control.hosts.review.mayPublish, true);

const hubRoute = routes.routes.find((item) => item.ref === "hrv-route:classroom-explorations");
assert.ok(hubRoute);
assert.equal(hubRoute.wordpressPageId, 17);
assert.equal(hubRoute.slug, "hub");
assert.equal(hubRoute.path, "/hub/");

const expectedManagedChildren = [
  ["hrv-route:spiders", 0, 886, "twwl-spiders", "/hub/twwl-spiders/", "twwl"],
  ["hrv-route:bats", 1, 906, "twwl-bats", "/hub/twwl-bats/", "twwl"],
  ["hrv-route:butterflies", 2, 674, "exploration-butterflies", "/hub/exploration-butterflies/", "exploration"],
  ["hrv-route:great-barrier-reef", 3, 1518, "exploration-great-barrier-reef", "/hub/exploration-great-barrier-reef/", "exploration"],
  ["hrv-route:mushrooms", 4, 413, "exploration-mushrooms", "/hub/exploration-mushrooms/", "exploration"],
  ["hrv-route:owls", 5, 954, "twwl-owls", "/hub/twwl-owls/", "twwl"],
  ["hrv-route:russian-winter", 6, 1043, "twwl-traditions-of-russian-winter", "/hub/twwl-traditions-of-russian-winter/", "twwl"],
  ["hrv-route:tubers", 7, 2392, "twwl-botany-tubers", "/hub/twwl-botany-tubers/", "twwl"],
  ["hrv-route:zinnia", 8, 2463, "exploration-zinnia-page", "/hub/exploration-zinnia-page/", "exploration"],
  ["hrv-route:archive-2025-2026", 9, 2627, "archive-2025-2026", "/hub/archive-2025-2026/", "archive"]
];

for (const [ref, order, pageId, slug, routePath, kind] of expectedManagedChildren) {
  const route = routes.routes.find((item) => item.ref === ref);
  assert.ok(route, `Missing managed route ${ref}`);
  assert.equal(route.wordpressParentPageId, 17);
  assert.equal(route.wordpressMenuOrder, order);
  assert.equal(route.wordpressPageId, pageId);
  assert.equal(route.slug, slug);
  assert.equal(route.path, routePath);
  assert.equal(route.kind, kind);
}

assert.deepEqual(
  new Set(routes.routes.filter((item) => item.wordpressParentPageId === 17).map((item) => item.ref)),
  new Set(expectedManagedChildren.map(([ref]) => ref))
);

assert.equal(runtime.page.href, "https://rmhughes.edublogs.org/hub/");
assert.equal(runtime.page.currentSchoolYear, "2026-2027");
assert.equal(runtime.current.exploration.id, "summer-bloom-adoption-project");
assert.equal(runtime.current.exploration.href, "https://rmhughes.edublogs.org/hub/exploration-zinnia-page/");
assert.equal(runtime.current.twwl.state, "coming-soon");
assert.equal(runtime.current.featuredMedia.embedUrl, "https://www.youtube-nocookie.com/embed/kRTJp4pqbtg");
assert.deepEqual(
  runtime.galleries.pastExplorations.map((item) => item.id),
  ["mushrooms", "butterflies-in-the-classroom", "great-barrier-reef"]
);
assert.ok(!runtime.galleries.pastExplorations.some((item) => item.id.includes("caterpillars-in-the-classroom-historical")));
assert.equal(runtime.archives.length, 1);
assert.equal(runtime.archives[0].state, "published");
assert.equal(runtime.archives[0].href, "https://rmhughes.edublogs.org/hub/archive-2025-2026/");

const copyNodeIds = Object.values(source.data.copy).map((block) => block.nodeId);
assert.equal(new Set(copyNodeIds).size, copyNodeIds.length);
assert.deepEqual(new Set(control.editor.nodes.map((node) => node.nodeId)), new Set(copyNodeIds));

const expected = documentRevisions(source, routes);
const editResult = applyHubCommand({
  source,
  routes,
  control,
  command: {
    schemaVersion: "1.0",
    commandId: "hub-command:test-edit-hero",
    idempotencyKey: "hub-idempotency:test-edit-hero",
    operation: "hub.edit-node",
    targetPageId: source.page.id,
    expected,
    payload: {
      nodeId: "hub-node:hero",
      patch: { invitation: "A deterministic Lanternworks edit test." }
    }
  }
});
assert.deepEqual(editResult.changedDocuments, ["authoring"]);
assert.equal(editResult.documents.source.data.copy.hero.invitation, "A deterministic Lanternworks edit test.");
assert.deepEqual(editResult.documents.routes, routes);

assert.throws(
  () => applyHubCommand({
    source,
    routes,
    control,
    command: {
      schemaVersion: "1.0",
      commandId: "hub-command:test-edit-stable-id",
      idempotencyKey: "hub-idempotency:test-edit-stable-id",
      operation: "hub.edit-node",
      targetPageId: source.page.id,
      expected,
      payload: {
        nodeId: "hub-node:hero",
        patch: { nodeId: "hub-node:renamed" }
      }
    }
  }),
  (error) => error instanceof HubTransactionError && error.code === "HUB_STABLE_ID_IMMUTABLE"
);

assert.throws(
  () => applyHubCommand({
    source,
    routes,
    control,
    command: {
      schemaVersion: "1.0",
      commandId: "hub-command:test-stale",
      idempotencyKey: "hub-idempotency:test-stale",
      operation: "hub.edit-node",
      targetPageId: source.page.id,
      expected: {
        authoringSha256: "0".repeat(64),
        routesSha256: expected.routesSha256
      },
      payload: {
        nodeId: "hub-node:footer",
        patch: { text: "This stale command must never apply." }
      }
    }
  }),
  (error) => error instanceof HubTransactionError && error.code === "HUB_TRANSACTION_STALE"
);

const swapRoute = {
  ref: "hrv-route:test-weather-station",
  wordpressPageId: 99001,
  wordpressParentPageId: 17,
  wordpressMenuOrder: 10,
  slug: "exploration-weather-station",
  path: "/hub/exploration-weather-station/",
  kind: "exploration",
  state: "published"
};
const swapExploration = {
  id: "classroom-weather-station",
  schoolYear: "2026-2027",
  title: "Classroom Weather Station",
  summary: "A transaction fixture for testing an atomic Hub swap.",
  routeRef: swapRoute.ref,
  image: {
    kind: "external-url",
    url: "https://example.com/weather-station.jpg",
    alt: "A classroom weather station test image."
  },
  learningPoints: ["Measure", "Compare", "Predict"],
  tags: ["Weather", "Data"]
};
const swapResult = applyHubCommand({
  source,
  routes,
  control,
  command: {
    schemaVersion: "1.0",
    commandId: "hub-command:test-atomic-swap",
    idempotencyKey: "hub-idempotency:test-atomic-swap",
    operation: "hub.swap-current-exploration",
    targetPageId: source.page.id,
    expected,
    payload: {
      nextExplorationId: swapExploration.id,
      archiveOutgoing: true,
      exploration: swapExploration,
      route: swapRoute
    }
  }
});
assert.deepEqual(swapResult.changedDocuments, ["authoring", "routes"]);
assert.equal(swapResult.documents.source.data.composition.currentExplorationId, swapExploration.id);
assert.ok(swapResult.documents.source.data.composition.pastExplorationIds.includes("summer-bloom-adoption-project"));
assert.ok(!swapResult.documents.source.data.composition.pastExplorationIds.includes(swapExploration.id));
assert.ok(swapResult.documents.routes.routes.some((route) => route.ref === swapRoute.ref));
validateHubSemantics(swapResult.documents.source, swapResult.documents.routes);

const promoted = setCurrentExploration(source, routes, "mushrooms");
assert.equal(promoted.data.composition.currentExplorationId, "mushrooms");
assert.ok(promoted.data.composition.pastExplorationIds.includes("summer-bloom-adoption-project"));
assert.ok(!promoted.data.composition.pastExplorationIds.includes("mushrooms"));

const reordered = reorderPastExplorations(
  source,
  routes,
  ["great-barrier-reef", "butterflies-in-the-classroom", "mushrooms"]
);
assert.deepEqual(reordered.data.composition.pastExplorationIds, ["great-barrier-reef", "butterflies-in-the-classroom", "mushrooms"]);

const comingSoon = setCurrentTwwlComingSoon(source, routes);
assert.deepEqual(comingSoon.data.composition.currentTwwl, {
  id: "hub-slot:current-twwl",
  state: "coming-soon"
});

const fixtureCurrentTwwlSource = structuredClone(source);
fixtureCurrentTwwlSource.data.twwl.push({
  id: "test-current-learning-story",
  schoolYear: "2026-2027",
  title: "Test Learning Story",
  summary: "A current-year contract fixture.",
  routeRef: "hrv-route:spiders",
  tags: ["Test"]
});
const publishedTwwl = setCurrentTwwl(fixtureCurrentTwwlSource, routes, "test-current-learning-story");
assert.equal(publishedTwwl.data.composition.currentTwwl.state, "published");
assert.equal(publishedTwwl.data.composition.currentTwwl.contentId, "test-current-learning-story");

assert.throws(
  () => updateExploration(source, routes, "mushrooms", { id: "renamed" }),
  /Stable Exploration IDs cannot be changed/
);
assert.throws(
  () => updateRoute(routes, "hrv-route:mushrooms", { wordpressPageId: 999 }),
  /WordPress page identity cannot be changed/
);
assert.throws(
  () => {
    const invalid = structuredClone(source);
    invalid.data.composition.pastExplorationIds.push(invalid.data.composition.currentExplorationId);
    validateHubSemantics(invalid, routes);
  },
  (error) => error instanceof HubContractError && error.code === "HUB_CONTENT_PLACED_MULTIPLE_TIMES"
);

console.log("[hub v2] authoring, routes, runtime projection, archive, and corrected gallery passed");
console.log("[hub v2] stale rejection, stable IDs, node edit, and atomic Hub swap passed");
