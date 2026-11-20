import { readFileSync } from "node:fs";
import { canonicalJson, sha256Text, validateHubSemantics } from "./classroom-explorations-hub-contract.mjs";
import { validateSchema } from "./json-schema-lite.mjs";

export const YEAR_ARCHIVE_COMPILER = "classroom-year-archive/2.0.0-candidate.1";
const SITE = "https://rmhughes.edublogs.org";
const REPOSITORY = "ProfessorMinty/HughesWebAssets-Source";
const schemas = Object.fromEntries(["hrv-page-envelope", "classroom-explorations-hub.source", "hrv-route-registry"]
  .map(name => [name, JSON.parse(readFileSync(new URL(`../../schemas/${name}.schema.json`, import.meta.url), "utf8"))]));

export class YearArchiveError extends Error {
  constructor(code, message) { super(message); this.name = "YearArchiveError"; this.code = code; }
}
function requireThat(condition, code, message) { if (!condition) throw new YearArchiveError(code, message); }
function yearIdentity(year) {
  requireThat(/^\d{4}-\d{4}$/.test(year) && Number(year.slice(5)) === Number(year.slice(0, 4)) + 1,
    "YEAR_ARCHIVE_YEAR_INVALID", "Use a consecutive school-year identity.");
  requireThat(Number(year.slice(0, 4)) >= 2026, "YEAR_ARCHIVE_LEGACY_PROTECTED",
    "The immutable 2025–2026 archive remains on its reviewed v1 contract and Page 2627.");
  return { id: `hrv-page:classroom-explorations-archive-${year}`, type: "classroom-explorations-archive", schoolYear: year,
    relationshipId: `hub-archive:${year}`, routeRef: `hrv-route:archive-${year}`, proposedPath: `/hub/archive-${year}/` };
}
function snapshot(payload) { return { ...payload, snapshotId: `sha256:${sha256Text(canonicalJson(payload))}` }; }
function checkSnapshot(value, code) {
  const { snapshotId, ...payload } = value || {};
  requireThat(snapshotId === `sha256:${sha256Text(canonicalJson(payload))}`, code, "Archive bytes do not match their immutable snapshot identity.");
}
function publishedRoute(registry, ref, kind) {
  const matches = registry.routes.filter(route => route.ref === ref);
  requireThat(matches.length === 1, "YEAR_ARCHIVE_ROUTE_UNKNOWN", `Exactly one route is required for ${ref}.`);
  const route = matches[0];
  requireThat(route.state === "published" && route.kind === kind, "YEAR_ARCHIVE_ROUTE_NOT_READY", `${ref} needs a published ${kind} destination.`);
  requireThat(Number.isSafeInteger(route.wordpressPageId) && route.wordpressPageId > 0 && (kind === "hub" ? route.wordpressPageId === 17 : route.wordpressParentPageId === 17),
    "YEAR_ARCHIVE_ROUTE_IDENTITY", `${ref} must retain its numeric page identity and the canonical Hub relationship.`);
  requireThat(/^\/(?:[a-z0-9-]+\/)+$/.test(route.path) && registry.routes.filter(item => item.path === route.path || item.wordpressPageId === route.wordpressPageId).length === 1,
    "YEAR_ARCHIVE_ROUTE_AMBIGUOUS", `${ref} has an unsafe or ambiguous destination.`);
  return structuredClone(route);
}

/** Capture all year members and their resolved route records; never reinterpret the old v1 archive. */
export function freezeYearArchive({ hubSource, registry, schoolYear, sourceRevision }) {
  const identity = yearIdentity(schoolYear);
  requireThat(/^[a-f0-9]{40}$/.test(sourceRevision), "YEAR_ARCHIVE_SOURCE_REVISION", "An exact input Source revision is required.");
  validateSchema(hubSource, schemas["hrv-page-envelope"]);
  validateSchema(hubSource.data, schemas["classroom-explorations-hub.source"]);
  validateSchema(registry, schemas["hrv-route-registry"]);
  validateHubSemantics(hubSource, registry);
  requireThat(registry.site.origin === SITE, "YEAR_ARCHIVE_SITE_MISMATCH", "Archive destinations must belong to Hughes Room Views.");
  const year = hubSource.data.schoolYears.find(item => item.id === schoolYear);
  requireThat(year && Number(schoolYear.slice(0, 4)) <= Number(hubSource.data.composition.currentSchoolYear.slice(0, 4)),
    "YEAR_ARCHIVE_YEAR_UNKNOWN", "Choose the current or an earlier declared school year.");
  const hubRoute = publishedRoute(registry, hubSource.page.routeRef, "hub");
  const freeze = (item, kind) => ({ ...structuredClone(item), destination: publishedRoute(registry, item.routeRef, kind) });
  const explorations = hubSource.data.explorations.filter(item => item.schoolYear === schoolYear).map(item => freeze(item, "exploration"));
  const stories = hubSource.data.twwl.filter(item => item.schoolYear === schoolYear).map(item => freeze(item, "twwl"));
  requireThat(explorations.length + stories.length > 0, "YEAR_ARCHIVE_EMPTY", "There is no recorded content to archive for this school year.");
  return snapshot({
    schemaVersion: "hrv-year-archive-source/2.0", compiler: YEAR_ARCHIVE_COMPILER, publicationAvailable: false,
    page: { ...identity, schoolYearLabel: year.label },
    provenance: { repository: REPOSITORY, sourceRevision, revisionVerification: "caller-supplied; input-bytes-verified",
      hubSourceSha256: sha256Text(canonicalJson(hubSource)), routesSha256: sha256Text(canonicalJson(registry)) },
    hub: { pageId: hubSource.page.id, route: hubRoute },
    collections: { explorations, stories },
    membership: { explorationIds: explorations.map(item => item.id), storyIds: stories.map(item => item.id) },
    host: { status: "pending", wordpressPageId: null, wordpressParentPageId: 17, template: "full-width", canonicalHubPageId: 17, reviewHubPageId: 2589 },
  });
}

export function validateFrozenYearArchive(value, inputs) {
  requireThat(value?.schemaVersion === "hrv-year-archive-source/2.0" && value.compiler === YEAR_ARCHIVE_COMPILER,
    "YEAR_ARCHIVE_SCHEMA_UNSUPPORTED", "Unsupported year-archive source contract.");
  checkSnapshot(value, "YEAR_ARCHIVE_SOURCE_CHANGED");
  const identity = yearIdentity(value.page.schoolYear);
  requireThat(Object.entries(identity).every(([key, item]) => value.page[key] === item) && value.publicationAvailable === false && value.host.wordpressPageId === null && value.host.status === "pending",
    "YEAR_ARCHIVE_IDENTITY_CHANGED", "A candidate cannot claim an installed archive page or change its stable year identity.");
  const { explorations, stories } = value.collections;
  requireThat(Array.isArray(explorations) && Array.isArray(stories) && canonicalJson(value.membership) === canonicalJson({ explorationIds: explorations.map(item => item.id), storyIds: stories.map(item => item.id) }),
    "YEAR_ARCHIVE_MEMBERSHIP_CHANGED", "Frozen archive membership does not match its complete content collections.");
  const all = [...explorations, ...stories];
  requireThat(all.length > 0 && new Set(all.map(item => item.id)).size === all.length && all.every(item => item.schoolYear === value.page.schoolYear),
    "YEAR_ARCHIVE_MEMBERSHIP_CHANGED", "Archive members must be unique and belong to the selected year.");
  if (inputs) {
    const expected = freezeYearArchive({ ...inputs, schoolYear: value.page.schoolYear, sourceRevision: value.provenance.sourceRevision });
    requireThat(canonicalJson(value) === canonicalJson(expected), "YEAR_ARCHIVE_INPUTS_CHANGED", "The frozen archive no longer matches the exact input source and routes.");
  }
  return value;
}

export function projectYearArchiveRuntime(frozen) {
  validateFrozenYearArchive(frozen);
  const card = item => ({ id: item.id, schoolYear: item.schoolYear, title: item.title, summary: item.summary,
    href: new URL(item.destination.path, SITE).href, routeRef: item.routeRef, wordpressPageId: item.destination.wordpressPageId,
    image: item.image ? { src: item.image.url, alt: item.image.alt } : null, tags: [...item.tags],
    ...(item.learningPoints ? { learningPoints: [...item.learningPoints] } : {}) });
  const explorations = frozen.collections.explorations.map(card), stories = frozen.collections.stories.map(card);
  return snapshot({
    runtimeSchemaVersion: "2.0", compiler: YEAR_ARCHIVE_COMPILER, mode: "private-candidate", publicationAvailable: false,
    sourceSnapshotId: frozen.snapshotId, provenance: { ...frozen.provenance },
    page: { ...frozen.page, hubHref: new URL(frozen.hub.route.path, SITE).href,
      title: `Classroom Explorations · ${frozen.page.schoolYearLabel}`,
      intro: "A year of questions, discoveries, and moments worth remembering.",
      archiveHref: null, wordpressPageId: null },
    collections: { explorations, stories },
    stats: { explorations: explorations.length, stories: stories.length, total: explorations.length + stories.length },
  });
}

export function validateYearArchiveRuntime(value) {
  requireThat(value?.runtimeSchemaVersion === "2.0" && value.compiler === YEAR_ARCHIVE_COMPILER && value.mode === "private-candidate" && value.publicationAvailable === false,
    "YEAR_ARCHIVE_RUNTIME_UNSUPPORTED", "This renderer accepts only the reviewed v2 candidate schema.");
  checkSnapshot(value, "YEAR_ARCHIVE_RUNTIME_CHANGED");
  const identity = yearIdentity(value.page.schoolYear);
  requireThat(Object.entries(identity).every(([key, item]) => value.page[key] === item) && value.page.archiveHref === null && value.page.wordpressPageId === null,
    "YEAR_ARCHIVE_IDENTITY_CHANGED", "Candidate rendering cannot claim a public archive identity.");
  const { explorations, stories } = value.collections;
  const all = [...explorations, ...stories];
  requireThat(value.stats.explorations === explorations.length && value.stats.stories === stories.length && value.stats.total === all.length && all.length > 0 && new Set(all.map(item => item.id)).size === all.length,
    "YEAR_ARCHIVE_RUNTIME_COUNTS", "Archive counts and unique content membership must agree.");
  requireThat(all.every(item => item.schoolYear === value.page.schoolYear && typeof item.title === "string" && typeof item.summary === "string"
    && new URL(item.href).origin === SITE && Number.isSafeInteger(item.wordpressPageId) && item.wordpressPageId > 0
    && (!item.image || (item.image.src.startsWith("https://") && typeof item.image.alt === "string"))),
    "YEAR_ARCHIVE_RUNTIME_CONTENT", "Archive cards need complete, safe year-specific content and destinations.");
  return value;
}
