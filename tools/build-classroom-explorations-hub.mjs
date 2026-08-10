import { mkdir, readFile, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";

const repoRoot = resolve(new URL("..", import.meta.url).pathname);
const sourcePath = resolve(repoRoot, "apps/classroom-explorations-hub/content/hub.source.json");
const publicPath = resolve(repoRoot, "apps/classroom-explorations-hub/public/hub.manifest.json");
const distPath = resolve(repoRoot, "dist/classroom-explorations-hub/hub.manifest.json");

const STABLE_ID = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;
const SCHOOL_YEAR = /^[0-9]{4}-[0-9]{4}$/;
const ALLOWED_TYPES = new Set(["exploration", "twwl", "archive-doorway", "video"]);
const ALLOWED_STATUSES = new Set(["current", "past", "archived", "coming-soon"]);

function fail(message) {
  throw new Error(`[classroom-explorations-hub] ${message}`);
}

function assertNonEmptyString(value, label) {
  if (typeof value !== "string" || value.trim() === "") fail(`${label} must be a non-empty string.`);
}

function assertHttps(value, label, { nullable = false } = {}) {
  if (value === null && nullable) return;
  if (typeof value !== "string" || !value.startsWith("https://")) fail(`${label} must be HTTPS${nullable ? " or null" : ""}.`);
  const url = new URL(value);
  if (/^(drive|docs)\.google\.com$/i.test(url.hostname)) fail(`${label} must not expose a Google Drive/Docs URL.`);
  if (/^(localhost|127\.0\.0\.1)$/i.test(url.hostname)) fail(`${label} must not expose a local URL.`);
}

function normalizeYouTube(sourceUrl) {
  const url = new URL(sourceUrl);
  let id = "";
  if (url.hostname === "youtu.be") id = url.pathname.replace(/^\//, "").split("/")[0] ?? "";
  if (url.hostname.endsWith("youtube.com")) {
    if (url.pathname === "/watch") id = url.searchParams.get("v") ?? "";
    else if (url.pathname.startsWith("/shorts/")) id = url.pathname.split("/")[2] ?? "";
    else if (url.pathname.startsWith("/embed/")) id = url.pathname.split("/")[2] ?? "";
  }
  if (!/^[A-Za-z0-9_-]{11}$/.test(id)) fail(`Unsupported YouTube URL: ${sourceUrl}`);
  return `https://www.youtube-nocookie.com/embed/${id}`;
}

function sortRecords(records) {
  return [...records].sort((a, b) => {
    const year = a.schoolYear.localeCompare(b.schoolYear);
    if (year !== 0) return -year;
    const typeRank = { video: 0, exploration: 1, twwl: 2, "archive-doorway": 3 };
    const type = typeRank[a.type] - typeRank[b.type];
    if (type !== 0) return type;
    const order = a.order - b.order;
    return order !== 0 ? order : a.id.localeCompare(b.id);
  });
}

function validateMuseum(page) {
  const museum = page?.museum;
  if (!museum || typeof museum !== "object") fail("page.museum is required so the renderer cannot drift from the approved museum identity.");
  for (const field of ["kicker", "oathTitle", "oath", "footer"]) assertNonEmptyString(museum[field], `page.museum.${field}`);
  if (!Array.isArray(museum.pillars) || museum.pillars.length < 1) fail("page.museum.pillars must contain at least one learning pillar.");
  museum.pillars.forEach((pillar, index) => assertNonEmptyString(pillar, `page.museum.pillars[${index}]`));
  assertHttps(museum.dividerImageUrl, "page.museum.dividerImageUrl");
}

function validatePresentation(record) {
  if (record.presentation === undefined) return;
  if (!record.presentation || typeof record.presentation !== "object") fail(`${record.id}.presentation must be an object when present.`);
  for (const [key, value] of Object.entries(record.presentation)) assertNonEmptyString(value, `${record.id}.presentation.${key}`);
}

function validateAndNormalize(source) {
  if (source?.schemaVersion !== "1.0") fail("schemaVersion must be 1.0.");
  if (source?.page?.id !== "classroom-explorations-hub") fail("Unexpected page id.");
  assertHttps(source.page.routeUrl, "page.routeUrl");
  if (!SCHOOL_YEAR.test(source.page.currentSchoolYear)) fail("Invalid currentSchoolYear.");
  validateMuseum(source.page);

  const years = new Set();
  let currentYearCount = 0;
  for (const year of source.schoolYears ?? []) {
    if (!SCHOOL_YEAR.test(year.id)) fail(`Invalid school year id: ${year.id}`);
    if (years.has(year.id)) fail(`Duplicate school year id: ${year.id}`);
    years.add(year.id);
    if (year.status === "current") currentYearCount += 1;
  }
  if (currentYearCount !== 1) fail("Exactly one school year must be current.");
  if (!years.has(source.page.currentSchoolYear)) fail("currentSchoolYear must exist in schoolYears.");

  const ids = new Set();
  const currentByTypeAndYear = new Map();
  const normalized = [];

  for (const original of source.records ?? []) {
    const record = structuredClone(original);
    if (!STABLE_ID.test(record.id)) fail(`Invalid stable id: ${record.id}`);
    if (ids.has(record.id)) fail(`Duplicate stable id: ${record.id}`);
    ids.add(record.id);
    if (!ALLOWED_TYPES.has(record.type)) fail(`Unsupported type on ${record.id}.`);
    if (!ALLOWED_STATUSES.has(record.status)) fail(`Unsupported status on ${record.id}.`);
    if (!years.has(record.schoolYear)) fail(`Unknown schoolYear on ${record.id}.`);
    if (!Number.isInteger(record.order) || record.order < 0) fail(`Invalid order on ${record.id}.`);
    assertNonEmptyString(record.title, `${record.id}.title`);
    assertNonEmptyString(record.summary, `${record.id}.summary`);
    validatePresentation(record);

    assertHttps(record.pageUrl, `${record.id}.pageUrl`, { nullable: true });
    assertHttps(record.imageUrl, `${record.id}.imageUrl`, { nullable: true });
    if (record.imageUrl === null && record.imageAlt !== null) fail(`${record.id} has imageAlt without imageUrl.`);
    if (record.imageUrl !== null && (typeof record.imageAlt !== "string" || record.imageAlt.trim() === "")) fail(`${record.id} requires imageAlt.`);
    if (record.status === "coming-soon" && record.pageUrl !== null) fail(`${record.id} coming-soon records must not link to unapproved content.`);
    if (record.completeness === "incomplete" && !record.notice) fail(`${record.id} incomplete records require a truthful notice.`);

    if (record.type === "archive-doorway") {
      if (!SCHOOL_YEAR.test(record.archiveSchoolYear ?? "")) fail(`${record.id} requires archiveSchoolYear.`);
      if (record.archiveSchoolYear !== record.schoolYear) fail(`${record.id} archiveSchoolYear must match schoolYear.`);
    }

    if (record.type === "video") {
      if (record.media?.kind !== "youtube" || typeof record.media?.sourceUrl !== "string") fail(`${record.id} requires an approved YouTube source.`);
      record.media.embedUrl = normalizeYouTube(record.media.sourceUrl);
    }

    if (record.status === "current" && (record.type === "exploration" || record.type === "twwl")) {
      const key = `${record.schoolYear}:${record.type}`;
      currentByTypeAndYear.set(key, (currentByTypeAndYear.get(key) ?? 0) + 1);
    }
    normalized.push(record);
  }

  for (const [key, count] of currentByTypeAndYear) {
    if (count > 1) fail(`More than one current record exists for ${key}.`);
  }

  const currentYear = source.page.currentSchoolYear;
  const currentExplorations = normalized.filter((record) => record.schoolYear === currentYear && record.type === "exploration" && record.status === "current");
  const currentTwwl = normalized.filter((record) => record.schoolYear === currentYear && record.type === "twwl" && ["current", "coming-soon"].includes(record.status));
  if (currentExplorations.length !== 1) fail("The current school year must have exactly one current Exploration.");
  if (currentTwwl.length !== 1) fail("The current school year must have exactly one current or coming-soon TWWL slot.");

  return {
    schemaVersion: source.schemaVersion,
    contentVersion: source.contentVersion,
    page: source.page,
    schoolYears: [...source.schoolYears].sort((a, b) => a.order - b.order || a.id.localeCompare(b.id)),
    records: sortRecords(normalized),
  };
}

async function main() {
  const source = JSON.parse(await readFile(sourcePath, "utf8"));
  const runtime = validateAndNormalize(source);
  const text = `${JSON.stringify(runtime, null, 2)}\n`;
  for (const output of [publicPath, distPath]) {
    await mkdir(dirname(output), { recursive: true });
    await writeFile(output, text, "utf8");
  }
  console.log(`[classroom-explorations-hub] wrote deterministic museum manifest with ${runtime.records.length} records.`);
}

await main();
