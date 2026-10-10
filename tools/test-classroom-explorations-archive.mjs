import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { validateSchema } from "./lib/json-schema-lite.mjs";
import {
  ArchiveContractError,
  calculateArchiveSnapshotId,
  projectArchiveRuntime,
  validateArchiveRuntimeCompatibility,
  validateArchiveSemantics
} from "./lib/classroom-explorations-archive-contract.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) => JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));
const expectCode = (callback, code) => assert.throws(
  callback,
  (error) => error instanceof ArchiveContractError && error.code === code
);

const archiveSource = readJson(
  "apps/classroom-explorations-archive/source/archive-2025-2026.source.json"
);
const hubSource = readJson("apps/classroom-explorations-hub/source/hub.source.json");
const routes = readJson("registry/hrv-routes.source.json");

validateSchema(archiveSource, readJson("schemas/hrv-page-envelope.schema.json"));
validateSchema(archiveSource.data, readJson("schemas/classroom-explorations-archive.source.schema.json"));
validateSchema(hubSource, readJson("schemas/hrv-page-envelope.schema.json"));
validateSchema(hubSource.data, readJson("schemas/classroom-explorations-hub.source.schema.json"));
validateSchema(routes, readJson("schemas/hrv-route-registry.schema.json"));
validateArchiveSemantics(archiveSource, hubSource, routes);

const runtime = projectArchiveRuntime(archiveSource, hubSource, routes);
validateSchema(runtime, readJson("schemas/classroom-explorations-archive.runtime.schema.json"));
validateArchiveRuntimeCompatibility(runtime);

assert.equal(runtime.page.id, "hrv-page:classroom-explorations-archive-2025-2026");
assert.equal(runtime.page.href, "https://rmhughes.edublogs.org/hub/archive-2025-2026/");
assert.equal(runtime.page.hubHref, "https://rmhughes.edublogs.org/hub/");
assert.equal(runtime.page.schoolYear, "2025-2026");
assert.equal(runtime.page.schoolYearLabel, "2025–2026");
assert.deepEqual(
  runtime.collections.explorations.map((item) => item.id),
  ["mushrooms", "butterflies-in-the-classroom", "great-barrier-reef"]
);
assert.deepEqual(
  runtime.collections.twwl.map((item) => item.id),
  [
    "botany-lets-talk-about-tubers",
    "traditions-of-russian-winter",
    "silent-wings-wise-eyes-learning-about-owls",
    "bats-dont-go-bump-in-the-night",
    "autumn-spiders-gentle-web-artists"
  ]
);
assert.deepEqual(runtime.stats, { explorations: 3, twwl: 5, total: 8 });
assert.equal(
  runtime.collections.explorations.find((item) => item.id === "butterflies-in-the-classroom").href,
  "https://rmhughes.edublogs.org/hub/exploration-butterflies/"
);
assert.ok(
  !JSON.stringify(runtime).includes("exploration-cats-in-the-classroom"),
  "Archive runtime must never point at the obsolete Caterpillars route"
);
assert.deepEqual(projectArchiveRuntime(archiveSource, hubSource, routes), runtime);
assert.equal(calculateArchiveSnapshotId(runtime), runtime.snapshotId);

const hubWithEmptyVisibleGalleries = structuredClone(hubSource);
hubWithEmptyVisibleGalleries.data.composition.pastExplorationIds = [];
hubWithEmptyVisibleGalleries.data.composition.pastTwwlIds = [];
assert.deepEqual(
  projectArchiveRuntime(archiveSource, hubWithEmptyVisibleGalleries, routes),
  runtime,
  "Archive projection must not depend on the current Hub gallery placements"
);

const unpublishedArchiveRoutes = structuredClone(routes);
unpublishedArchiveRoutes.routes.find((route) => route.ref === archiveSource.page.routeRef).state = "unpublished";
expectCode(
  () => validateArchiveSemantics(archiveSource, hubSource, unpublishedArchiveRoutes),
  "ARCHIVE_ROUTE_NOT_PUBLISHED"
);

const unpublishedHubRoutes = structuredClone(routes);
unpublishedHubRoutes.routes.find((route) => route.ref === "hrv-route:classroom-explorations").state = "unpublished";
expectCode(
  () => validateArchiveSemantics(archiveSource, hubSource, unpublishedHubRoutes),
  "ARCHIVE_HUB_ROUTE_NOT_PUBLISHED"
);

const unpublishedChildRoutes = structuredClone(routes);
unpublishedChildRoutes.routes.find((route) => route.ref === "hrv-route:butterflies").state = "unpublished";
expectCode(
  () => validateArchiveSemantics(archiveSource, hubSource, unpublishedChildRoutes),
  "ARCHIVE_CONTENT_ROUTE_NOT_PUBLISHED"
);

const wrongArchivePageRoutes = structuredClone(routes);
wrongArchivePageRoutes.routes.find((route) => route.ref === archiveSource.page.routeRef).wordpressPageId = 99999;
expectCode(
  () => validateArchiveSemantics(archiveSource, hubSource, wrongArchivePageRoutes),
  "ARCHIVE_ROUTE_PAGE_ID_MISMATCH"
);

const comingSoonHub = structuredClone(hubSource);
comingSoonHub.data.composition.previousYears[0].state = "coming-soon";
expectCode(
  () => validateArchiveSemantics(archiveSource, comingSoonHub, routes),
  "ARCHIVE_RELATIONSHIP_NOT_PUBLISHED"
);

const missingRelationshipHub = structuredClone(hubSource);
missingRelationshipHub.data.composition.previousYears = [];
expectCode(
  () => validateArchiveSemantics(archiveSource, missingRelationshipHub, routes),
  "ARCHIVE_RELATIONSHIP_MISSING"
);

const wrongRelationshipHub = structuredClone(hubSource);
wrongRelationshipHub.data.composition.previousYears[0].routeRef = "hrv-route:classroom-explorations";
expectCode(
  () => validateArchiveSemantics(archiveSource, wrongRelationshipHub, routes),
  "ARCHIVE_RELATIONSHIP_MISMATCH"
);

const missingExplorationSource = structuredClone(archiveSource);
missingExplorationSource.data.composition.explorationIds.pop();
expectCode(
  () => validateArchiveSemantics(missingExplorationSource, hubSource, routes),
  "ARCHIVE_EXPLORATION_COUNT_MISMATCH"
);

const duplicateTwwlSource = structuredClone(archiveSource);
duplicateTwwlSource.data.composition.twwlIds[4] = duplicateTwwlSource.data.composition.twwlIds[0];
expectCode(
  () => validateArchiveSemantics(duplicateTwwlSource, hubSource, routes),
  "ARCHIVE_COLLECTION_DUPLICATE_ID"
);

const wrongButterfliesHub = structuredClone(hubSource);
wrongButterfliesHub.data.explorations.find((item) => item.id === "butterflies-in-the-classroom").routeRef =
  "hrv-route:great-barrier-reef";
expectCode(
  () => validateArchiveSemantics(archiveSource, wrongButterfliesHub, routes),
  "ARCHIVE_BUTTERFLIES_DESTINATION_MISMATCH"
);

const incompleteArchiveSource = structuredClone(archiveSource);
const expandedCatalogHub = structuredClone(hubSource);
expandedCatalogHub.data.explorations.push({
  id: "archive-contract-fixture",
  schoolYear: "2025-2026",
  title: "Archive Contract Fixture",
  summary: "A fixture proving that new catalog records cannot be silently stranded.",
  routeRef: "hrv-route:mushrooms",
  image: {
    kind: "external-url",
    url: "https://example.com/archive-fixture.jpg",
    alt: "Archive contract fixture."
  },
  learningPoints: ["Test archive coverage"],
  tags: ["Fixture"]
});
expectCode(
  () => validateArchiveSemantics(incompleteArchiveSource, expandedCatalogHub, routes),
  "ARCHIVE_EXPLORATION_COVERAGE_MISMATCH"
);

const tamperedRuntime = structuredClone(runtime);
tamperedRuntime.page.copy.footer.text = "Tampered after snapshot creation";
expectCode(
  () => validateArchiveRuntimeCompatibility(tamperedRuntime),
  "ARCHIVE_RUNTIME_CONTENT_INCOMPATIBLE"
);

console.log("[archive contract] source, routes, Hub relationship, coverage, and projection passed");
console.log("[archive contract] unpublished routes, stale relationship, Caterpillars drift, and tampering fail closed");
