import {
  canonicalJson,
  sha256Text,
  validateAuthoringCompatibility,
  validateHubSemantics,
  validateRouteRegistry
} from "./classroom-explorations-hub-contract.mjs";

export const ARCHIVE_PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";
export const ARCHIVE_PAGE_TYPE = "classroom-explorations-archive";
export const ARCHIVE_RELATIONSHIP_ID = "hub-archive:2025-2026";
export const ARCHIVE_SCHOOL_YEAR = "2025-2026";
export const ARCHIVE_WORDPRESS_PAGE_ID = 2627;
export const HUB_WORDPRESS_PAGE_ID = 17;
export const BUTTERFLIES_ID = "butterflies-in-the-classroom";
export const BUTTERFLIES_ROUTE_REF = "hrv-route:butterflies";

const EXPECTED_EXPLORATION_COUNT = 3;
const EXPECTED_TWWL_COUNT = 5;

export class ArchiveContractError extends Error {
  constructor(code, message, detail = {}) {
    super(message);
    this.name = "ArchiveContractError";
    this.code = code;
    this.detail = detail;
  }
}

function fail(code, message, detail = {}) {
  throw new ArchiveContractError(code, message, detail);
}

function requirePublishedRoute(routes, ref, { codePrefix, kind, wordpressPageId, parentPageId } = {}) {
  const route = routes.get(ref);
  const prefix = codePrefix || "ARCHIVE_CONTENT";

  if (!route) {
    fail(`${prefix}_ROUTE_UNKNOWN`, `Unknown route ref ${ref}.`, { ref });
  }
  if (route.state !== "published") {
    fail(`${prefix}_ROUTE_NOT_PUBLISHED`, `Route ${ref} must be published.`, {
      ref,
      state: route.state
    });
  }
  if (kind && route.kind !== kind) {
    fail(`${prefix}_ROUTE_KIND_MISMATCH`, `Route ${ref} must have kind ${kind}.`, {
      ref,
      expectedKind: kind,
      actualKind: route.kind
    });
  }
  if (wordpressPageId && route.wordpressPageId !== wordpressPageId) {
    fail(`${prefix}_ROUTE_PAGE_ID_MISMATCH`, `Route ${ref} has the wrong WordPress page identity.`, {
      ref,
      expectedWordpressPageId: wordpressPageId,
      actualWordpressPageId: route.wordpressPageId
    });
  }
  if (parentPageId && route.wordpressParentPageId !== parentPageId) {
    fail(`${prefix}_ROUTE_PARENT_MISMATCH`, `Route ${ref} must remain beneath WordPress page ${parentPageId}.`, {
      ref,
      expectedParentPageId: parentPageId,
      actualParentPageId: route.wordpressParentPageId
    });
  }

  return route;
}

function sameMembers(actual, expected) {
  if (actual.length !== expected.length) return false;
  const actualSet = new Set(actual);
  return actualSet.size === actual.length && expected.every((id) => actualSet.has(id));
}

export function validateArchiveAuthoringCompatibility(source) {
  if (
    !source ||
    source.schemaVersion !== "1.0" ||
    source.page?.id !== ARCHIVE_PAGE_ID ||
    source.page?.type !== ARCHIVE_PAGE_TYPE
  ) {
    fail(
      "ARCHIVE_SCHEMA_UNSUPPORTED",
      "Unsupported Classroom Explorations archive authoring schema or page identity."
    );
  }
  return true;
}

export function validateArchiveSemantics(archiveSource, hubSource, registry) {
  validateArchiveAuthoringCompatibility(archiveSource);
  validateAuthoringCompatibility(hubSource);
  validateRouteRegistry(registry);
  const composition = archiveSource.data.composition;

  const relationships = hubSource.data.composition.previousYears.filter(
    (relationship) => relationship.id === composition.relationshipId
  );
  if (relationships.length !== 1) {
    fail(
      "ARCHIVE_RELATIONSHIP_MISSING",
      `The Hub must declare exactly one ${composition.relationshipId} relationship.`
    );
  }
  const relationship = relationships[0];

  const hubIndexes = validateHubSemantics(hubSource, registry);

  if (
    composition.relationshipId !== ARCHIVE_RELATIONSHIP_ID ||
    composition.schoolYear !== ARCHIVE_SCHOOL_YEAR
  ) {
    fail(
      "ARCHIVE_IDENTITY_MISMATCH",
      "The 2025–2026 archive composition identity has drifted.",
      {
        relationshipId: composition.relationshipId,
        schoolYear: composition.schoolYear
      }
    );
  }

  const archiveRoute = requirePublishedRoute(hubIndexes.routes, archiveSource.page.routeRef, {
    codePrefix: "ARCHIVE",
    kind: "archive",
    wordpressPageId: ARCHIVE_WORDPRESS_PAGE_ID,
    parentPageId: HUB_WORDPRESS_PAGE_ID
  });
  const hubRoute = requirePublishedRoute(hubIndexes.routes, composition.hubRouteRef, {
    codePrefix: "ARCHIVE_HUB",
    kind: "hub",
    wordpressPageId: HUB_WORDPRESS_PAGE_ID
  });

  if (hubSource.page.routeRef !== composition.hubRouteRef) {
    fail(
      "ARCHIVE_HUB_RELATION_MISMATCH",
      "The archive back route must be the canonical Hub source route."
    );
  }

  if (archiveRoute.wordpressParentPageId !== hubRoute.wordpressPageId) {
    fail(
      "ARCHIVE_ROUTE_PARENT_MISMATCH",
      "The archive page must remain a direct child of the canonical Hub page."
    );
  }

  const schoolYear = hubIndexes.years.get(composition.schoolYear);
  if (!schoolYear || composition.schoolYear === hubSource.data.composition.currentSchoolYear) {
    fail(
      "ARCHIVE_SCHOOL_YEAR_INVALID",
      "The archive must reference a declared, non-current Hub school year."
    );
  }

  if (
    relationship.schoolYear !== composition.schoolYear ||
    relationship.routeRef !== archiveSource.page.routeRef
  ) {
    fail(
      "ARCHIVE_RELATIONSHIP_MISMATCH",
      "The Hub archive relationship does not match the archive page, route, and school year."
    );
  }
  if (relationship.state !== "published") {
    fail(
      "ARCHIVE_RELATIONSHIP_NOT_PUBLISHED",
      "The Hub archive relationship must be published before an archive snapshot can be built."
    );
  }

  const editableNodeIds = [
    ...Object.values(archiveSource.data.copy).map((block) => block.nodeId),
    composition.nodeId
  ];
  if (new Set(editableNodeIds).size !== editableNodeIds.length) {
    fail("ARCHIVE_EDITABLE_NODE_DUPLICATE", "Archive editable node IDs must be stable and unique.");
  }

  if (composition.explorationIds.length !== EXPECTED_EXPLORATION_COUNT) {
    fail(
      "ARCHIVE_EXPLORATION_COUNT_MISMATCH",
      `The approved 2025–2026 archive must contain ${EXPECTED_EXPLORATION_COUNT} Explorations.`
    );
  }
  if (composition.twwlIds.length !== EXPECTED_TWWL_COUNT) {
    fail(
      "ARCHIVE_TWWL_COUNT_MISMATCH",
      `The approved 2025–2026 archive must contain ${EXPECTED_TWWL_COUNT} TWWL stories.`
    );
  }

  if (
    new Set(composition.explorationIds).size !== composition.explorationIds.length ||
    new Set(composition.twwlIds).size !== composition.twwlIds.length
  ) {
    fail("ARCHIVE_COLLECTION_DUPLICATE_ID", "Archive collection IDs must not be duplicated.");
  }

  const catalogExplorationIds = hubSource.data.explorations
    .filter((item) => item.schoolYear === composition.schoolYear)
    .map((item) => item.id);
  const catalogTwwlIds = hubSource.data.twwl
    .filter((item) => item.schoolYear === composition.schoolYear)
    .map((item) => item.id);

  if (!sameMembers(composition.explorationIds, catalogExplorationIds)) {
    fail(
      "ARCHIVE_EXPLORATION_COVERAGE_MISMATCH",
      "Archive Explorations must cover every canonical Hub Exploration for the archived school year exactly once.",
      { selected: composition.explorationIds, catalog: catalogExplorationIds }
    );
  }
  if (!sameMembers(composition.twwlIds, catalogTwwlIds)) {
    fail(
      "ARCHIVE_TWWL_COVERAGE_MISMATCH",
      "Archive TWWL stories must cover every canonical Hub TWWL record for the archived school year exactly once.",
      { selected: composition.twwlIds, catalog: catalogTwwlIds }
    );
  }

  const validateCollection = (ids, records, kind) => ids.map((id) => {
    const item = records.get(id);
    if (!item) {
      fail("ARCHIVE_CONTENT_UNKNOWN", `Unknown archive ${kind} id ${id}.`, { id, kind });
    }
    if (item.schoolYear !== composition.schoolYear) {
      fail("ARCHIVE_CONTENT_YEAR_MISMATCH", `${id} does not belong to ${composition.schoolYear}.`, {
        id,
        expectedSchoolYear: composition.schoolYear,
        actualSchoolYear: item.schoolYear
      });
    }
    if (!item.image) {
      fail("ARCHIVE_CONTENT_IMAGE_REQUIRED", `${id} requires an image for the archive gallery.`, { id });
    }
    requirePublishedRoute(hubIndexes.routes, item.routeRef, {
      codePrefix: "ARCHIVE_CONTENT",
      kind,
      parentPageId: HUB_WORDPRESS_PAGE_ID
    });
    return item;
  });

  const explorations = validateCollection(
    composition.explorationIds,
    hubIndexes.explorations,
    "exploration"
  );
  const twwl = validateCollection(composition.twwlIds, hubIndexes.twwl, "twwl");

  const butterflies = hubIndexes.explorations.get(BUTTERFLIES_ID);
  if (
    !composition.explorationIds.includes(BUTTERFLIES_ID) ||
    butterflies?.routeRef !== BUTTERFLIES_ROUTE_REF
  ) {
    fail(
      "ARCHIVE_BUTTERFLIES_DESTINATION_MISMATCH",
      "The approved archive must use Butterflies in the Classroom and its canonical route."
    );
  }
  const butterfliesRoute = requirePublishedRoute(hubIndexes.routes, BUTTERFLIES_ROUTE_REF, {
    codePrefix: "ARCHIVE_BUTTERFLIES",
    kind: "exploration",
    wordpressPageId: 674,
    parentPageId: HUB_WORDPRESS_PAGE_ID
  });
  if (butterfliesRoute.path !== "/hub/exploration-butterflies/") {
    fail(
      "ARCHIVE_BUTTERFLIES_DESTINATION_MISMATCH",
      "Butterflies in the Classroom must resolve to /hub/exploration-butterflies/."
    );
  }

  return {
    routes: hubIndexes.routes,
    schoolYear,
    archiveRoute,
    hubRoute,
    relationship,
    explorations,
    twwl
  };
}

function resolveImage(image) {
  return { src: image.url, alt: image.alt };
}

export function calculateArchiveSnapshotId(runtimeOrPayload) {
  const { snapshotId: _snapshotId, ...payload } = runtimeOrPayload;
  return `sha256:${sha256Text(canonicalJson(payload))}`;
}

export function projectArchiveRuntime(archiveSource, hubSource, registry) {
  const indexes = validateArchiveSemantics(archiveSource, hubSource, registry);
  const composition = archiveSource.data.composition;
  const routeHref = (ref) => new URL(indexes.routes.get(ref).path, registry.site.origin).href;

  const commonFields = (item) => ({
    id: item.id,
    schoolYear: item.schoolYear,
    schoolYearLabel: indexes.schoolYear.label,
    title: item.title,
    summary: item.summary,
    href: routeHref(item.routeRef),
    image: resolveImage(item.image),
    tags: [...item.tags]
  });

  const payload = {
    runtimeSchemaVersion: "1.0",
    page: {
      id: archiveSource.page.id,
      type: archiveSource.page.type,
      href: routeHref(archiveSource.page.routeRef),
      hubHref: routeHref(composition.hubRouteRef),
      archiveId: composition.relationshipId,
      schoolYear: composition.schoolYear,
      schoolYearLabel: indexes.schoolYear.label,
      copy: structuredClone(archiveSource.data.copy)
    },
    collections: {
      explorations: indexes.explorations.map((item) => ({
        ...commonFields(item),
        learningPoints: [...item.learningPoints]
      })),
      twwl: indexes.twwl.map((item) => commonFields(item))
    },
    stats: {
      explorations: indexes.explorations.length,
      twwl: indexes.twwl.length,
      total: indexes.explorations.length + indexes.twwl.length
    }
  };

  return {
    runtimeSchemaVersion: payload.runtimeSchemaVersion,
    snapshotId: calculateArchiveSnapshotId(payload),
    ...Object.fromEntries(Object.entries(payload).filter(([key]) => key !== "runtimeSchemaVersion"))
  };
}

export function validateArchiveRuntimeCompatibility(manifest) {
  if (!manifest || manifest.runtimeSchemaVersion !== "1.0") {
    fail("ARCHIVE_RUNTIME_SCHEMA_UNSUPPORTED", "Unsupported archive runtime schema.");
  }
  if (manifest.page?.id !== ARCHIVE_PAGE_ID || manifest.page?.type !== ARCHIVE_PAGE_TYPE) {
    fail("ARCHIVE_RUNTIME_CONTENT_INCOMPATIBLE", "Runtime manifest belongs to another page.");
  }
  if (!/^sha256:[a-f0-9]{64}$/.test(manifest.snapshotId || "")) {
    fail("ARCHIVE_RUNTIME_CONTENT_INCOMPATIBLE", "Runtime manifest has an invalid snapshot identity.");
  }
  if (calculateArchiveSnapshotId(manifest) !== manifest.snapshotId) {
    fail("ARCHIVE_RUNTIME_CONTENT_INCOMPATIBLE", "Runtime manifest snapshot bytes do not match its identity.");
  }
  if (
    manifest.collections?.explorations?.length !== EXPECTED_EXPLORATION_COUNT ||
    manifest.collections?.twwl?.length !== EXPECTED_TWWL_COUNT ||
    manifest.stats?.explorations !== EXPECTED_EXPLORATION_COUNT ||
    manifest.stats?.twwl !== EXPECTED_TWWL_COUNT ||
    manifest.stats?.total !== EXPECTED_EXPLORATION_COUNT + EXPECTED_TWWL_COUNT
  ) {
    fail("ARCHIVE_RUNTIME_CONTENT_INCOMPATIBLE", "Runtime manifest archive counts are incompatible.");
  }
  return manifest;
}
