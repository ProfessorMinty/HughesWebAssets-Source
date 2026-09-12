import { createHash } from "node:crypto";
import { readFile, readdir, stat } from "node:fs/promises";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateSchema } from "./lib/json-schema-lite.mjs";
import { validateArchiveRuntimeCompatibility } from "./lib/classroom-explorations-archive-contract.mjs";

const PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";
const PAGE_TYPE = "classroom-explorations-archive";
const RUNTIME_VERSION = /^\d{4}\.\d{2}\.\d{2}\.\d+$/;
const PUBLICATION_ID = /^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/;
const SHA256 = /^[a-f0-9]{64}$/;
const COMMIT_SHA = /^[a-f0-9]{40}$/;

const root = fileURLToPath(new URL("..", import.meta.url));
const releaseRoot = resolve(
  process.env.HRV_ARCHIVE_RELEASE_ROOT || resolve(root, "releases/classroom-explorations-archive")
);
const allowEmpty = process.argv.slice(2).includes("--allow-empty");
const unknownArguments = process.argv.slice(2).filter((argument) => argument !== "--allow-empty");
if (unknownArguments.length) {
  throw new Error(`Unknown archive release verification argument: ${unknownArguments.join(", ")}`);
}

const expectedAssets = {
  bootstrap: "bootstrap.js",
  script: "runtime.js",
  style: "archive.css",
  hostCompat: "host-compat.css"
};
const expectedArtwork = {
  pastYears: "assets/history/past-years.webp",
  frameTopLeft: "assets/frame/top-left.webp",
  frameTopRight: "assets/frame/top-right.webp",
  frameMiddleLeft: "assets/frame/middle-left.webp",
  frameMiddleRight: "assets/frame/middle-right.webp",
  frameBottomLeft: "assets/frame/bottom-left.webp",
  frameBottomRight: "assets/frame/bottom-right.webp"
};

const digest = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};
const sorted = (values) => [...values].sort((left, right) => left.localeCompare(right));
const assertExactKeys = (value, keys, label) => {
  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error(`${label} must be an object.`);
  }
  const actual = sorted(Object.keys(value));
  const expected = sorted(keys);
  if (actual.join("|") !== expected.join("|")) {
    throw new Error(`${label} has an unexpected key set: ${actual.join(", ")}`);
  }
};
const readCanonicalJson = async (path, label) => {
  const text = await readFile(path, "utf8");
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
  if (text !== `${JSON.stringify(value, null, 2)}\n`) {
    throw new Error(`${label} is not in the deterministic repository JSON format.`);
  }
  return value;
};
const listEntries = async (directory, label) => {
  const entries = await readdir(directory, { withFileTypes: true });
  for (const entry of entries) {
    if (entry.isSymbolicLink() || (!entry.isFile() && !entry.isDirectory())) {
      throw new Error(`${label} contains an unsupported entry: ${entry.name}`);
    }
  }
  return entries.sort((left, right) => left.name.localeCompare(right.name));
};
const listFiles = async (directory, prefix = "") => {
  const files = [];
  for (const entry of await listEntries(directory, directory)) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(resolve(directory, entry.name), relative));
    else files.push(relative);
  }
  return files;
};
const assertDigest = async (path, expectedHash, label) => {
  if (!SHA256.test(expectedHash || "")) throw new Error(`${label} has an invalid SHA-256 value.`);
  const actualHash = await digest(path);
  if (actualHash !== expectedHash) {
    throw new Error(`${label} digest mismatch: expected ${expectedHash}, got ${actualHash}.`);
  }
};

if (!await exists(releaseRoot)) {
  if (allowEmpty) {
    console.log("[archive release verify] no release tree exists; explicitly allowed for pre-release source CI");
    process.exit(0);
  }
  throw new Error("No checked-in Classroom Explorations archive release exists. Use --allow-empty only before the first release is staged.");
}

const topEntries = await listEntries(releaseRoot, "Archive release root");
if (topEntries.length === 0 && allowEmpty) {
  console.log("[archive release verify] empty release tree explicitly allowed for pre-release source CI");
  process.exit(0);
}
if (
  topEntries.some((entry) => !entry.isDirectory()) ||
  topEntries.map((entry) => entry.name).join("|") !== "content|publications|runtime"
) {
  throw new Error("Archive release root must contain exactly content, publications, and runtime directories.");
}

const runtimeParent = resolve(releaseRoot, "runtime");
const contentParent = resolve(releaseRoot, "content");
const publicationParent = resolve(releaseRoot, "publications");
const runtimeEntries = await listEntries(runtimeParent, "Archive runtime root");
const contentEntries = await listEntries(contentParent, "Archive content root");
const publicationEntries = await listEntries(publicationParent, "Archive publication root");
for (const [entries, pattern, label] of [
  [runtimeEntries, RUNTIME_VERSION, "runtime"],
  [contentEntries, SHA256, "content"],
  [publicationEntries, PUBLICATION_ID, "publication"]
]) {
  if (!entries.length || entries.some((entry) => !entry.isDirectory() || !pattern.test(entry.name))) {
    throw new Error(`Archive ${label} root must contain only correctly named immutable directories.`);
  }
}

const runtimeSchema = JSON.parse(await readFile(
  resolve(root, "schemas/classroom-explorations-archive.runtime.schema.json"),
  "utf8"
));
const runtimeByVersion = new Map();
for (const entry of runtimeEntries) {
  const version = entry.name;
  const directory = resolve(runtimeParent, version);
  const expectedFiles = sorted([
    "runtime-release.json",
    ...Object.values(expectedAssets),
    ...Object.values(expectedArtwork)
  ]);
  const files = await listFiles(directory);
  if (files.join("|") !== expectedFiles.join("|")) {
    throw new Error(`Archive runtime ${version} has an unexpected immutable file set: ${files.join(", ")}`);
  }

  const manifest = await readCanonicalJson(
    resolve(directory, "runtime-release.json"),
    `Archive runtime ${version} release manifest`
  );
  assertExactKeys(
    manifest,
    ["schemaVersion", "pageId", "pageType", "runtimeSchemaVersion", "assets", "artwork"],
    `Archive runtime ${version} release manifest`
  );
  if (
    manifest.schemaVersion !== "1.0" ||
    manifest.pageId !== PAGE_ID ||
    manifest.pageType !== PAGE_TYPE ||
    manifest.runtimeSchemaVersion !== "1.0"
  ) {
    throw new Error(`Archive runtime ${version} has an incompatible release identity.`);
  }
  assertExactKeys(manifest.assets, Object.keys(expectedAssets), `Archive runtime ${version} assets`);
  assertExactKeys(manifest.artwork, Object.keys(expectedArtwork), `Archive runtime ${version} artwork`);

  for (const [name, path] of Object.entries(expectedAssets)) {
    const asset = manifest.assets[name];
    assertExactKeys(asset, ["path", "sha256"], `Archive runtime ${version} asset ${name}`);
    if (asset.path !== path) throw new Error(`Archive runtime ${version} asset ${name} has the wrong path.`);
    await assertDigest(resolve(directory, path), asset.sha256, `Archive runtime ${version}/${path}`);
  }
  for (const [name, path] of Object.entries(expectedArtwork)) {
    const artwork = manifest.artwork[name];
    assertExactKeys(artwork, ["path", "sha256", "mediaType"], `Archive runtime ${version} artwork ${name}`);
    if (artwork.path !== path || artwork.mediaType !== "image/webp") {
      throw new Error(`Archive runtime ${version} artwork ${name} has the wrong path or media type.`);
    }
    await assertDigest(resolve(directory, path), artwork.sha256, `Archive runtime ${version}/${path}`);
  }
  runtimeByVersion.set(version, { directory, manifest });
}

const contentByHash = new Map();
for (const entry of contentEntries) {
  const hash = entry.name;
  const directory = resolve(contentParent, hash);
  const files = await listFiles(directory);
  if (files.join("|") !== "manifest.json") {
    throw new Error(`Archive content ${hash} must contain exactly manifest.json.`);
  }
  const manifestPath = resolve(directory, "manifest.json");
  const manifest = await readCanonicalJson(manifestPath, `Archive content ${hash} manifest`);
  validateSchema(manifest, runtimeSchema);
  validateArchiveRuntimeCompatibility(manifest);
  if (manifest.snapshotId !== `sha256:${hash}`) {
    throw new Error(`Archive content ${hash} snapshot identity does not match its directory.`);
  }
  contentByHash.set(hash, { manifestPath, manifest, fileSha256: await digest(manifestPath) });
}

const publicationIds = publicationEntries.map((entry) => entry.name);
const publicationIdSet = new Set(publicationIds);
const referencedRuntimes = new Set();
const referencedContent = new Set();
const checkedSourceRevisions = new Set();

const requireSourceRevision = (sourceRevision, publicationId) => {
  if (!COMMIT_SHA.test(sourceRevision || "")) {
    throw new Error(`Archive publication ${publicationId} has an invalid sourceRevision.`);
  }
  if (checkedSourceRevisions.has(sourceRevision)) return;

  const objectCheck = spawnSync(
    "git",
    ["-C", root, "cat-file", "-e", `${sourceRevision}^{commit}`],
    { encoding: "utf8" }
  );
  if (objectCheck.status !== 0) {
    throw new Error(
      `Archive sourceRevision ${sourceRevision} is not an available Git commit. CI must use actions/checkout with fetch-depth: 0.`
    );
  }
  const ancestorCheck = spawnSync(
    "git",
    ["-C", root, "merge-base", "--is-ancestor", sourceRevision, "HEAD"],
    { encoding: "utf8" }
  );
  if (ancestorCheck.status !== 0) {
    throw new Error(`Archive sourceRevision ${sourceRevision} is not an ancestor of the verified HEAD.`);
  }
  checkedSourceRevisions.add(sourceRevision);
};

for (let index = 0; index < publicationIds.length; index += 1) {
  const publicationId = publicationIds[index];
  const publicationDirectory = resolve(publicationParent, publicationId);
  const files = await listFiles(publicationDirectory);
  if (files.join("|") !== "publication.json") {
    throw new Error(`Archive publication ${publicationId} must contain exactly publication.json.`);
  }
  const publication = await readCanonicalJson(
    resolve(publicationDirectory, "publication.json"),
    `Archive publication ${publicationId}`
  );
  assertExactKeys(
    publication,
    [
      "schemaVersion",
      "publicationId",
      "pageId",
      "pageType",
      "sourceRevision",
      "previousKnownGoodPublication",
      "runtime",
      "content"
    ],
    `Archive publication ${publicationId}`
  );
  if (
    publication.schemaVersion !== "1.0" ||
    publication.publicationId !== publicationId ||
    publication.pageId !== PAGE_ID ||
    publication.pageType !== PAGE_TYPE
  ) {
    throw new Error(`Archive publication ${publicationId} has an incompatible identity.`);
  }
  requireSourceRevision(publication.sourceRevision, publicationId);

  const previous = publication.previousKnownGoodPublication;
  if (index === 0) {
    if (previous !== null) {
      throw new Error(`First archive publication ${publicationId} must establish a null previous-known-good baseline.`);
    }
  } else if (
    typeof previous !== "string" ||
    !publicationIdSet.has(previous) ||
    previous.localeCompare(publicationId) >= 0
  ) {
    throw new Error(`Archive publication ${publicationId} must name an earlier checked-in publication as previous known good.`);
  }

  assertExactKeys(
    publication.runtime,
    ["version", "runtimeSchemaVersion", "bootstrap", "script", "style", "hostCompat", "artwork"],
    `Archive publication ${publicationId} runtime`
  );
  const version = publication.runtime.version;
  const runtime = runtimeByVersion.get(version);
  if (!runtime || publication.runtime.runtimeSchemaVersion !== "1.0") {
    throw new Error(`Archive publication ${publicationId} references an unavailable or incompatible runtime.`);
  }
  referencedRuntimes.add(version);
  for (const [name, path] of Object.entries(expectedAssets)) {
    const asset = publication.runtime[name];
    assertExactKeys(asset, ["path", "sha256"], `Archive publication ${publicationId} runtime ${name}`);
    const expectedPath = `../../runtime/${version}/${path}`;
    if (asset.path !== expectedPath || asset.sha256 !== runtime.manifest.assets[name].sha256) {
      throw new Error(`Archive publication ${publicationId} runtime ${name} does not match runtime ${version}.`);
    }
  }
  assertExactKeys(
    publication.runtime.artwork,
    Object.keys(expectedArtwork),
    `Archive publication ${publicationId} artwork`
  );
  for (const [name, path] of Object.entries(expectedArtwork)) {
    const artwork = publication.runtime.artwork[name];
    assertExactKeys(
      artwork,
      ["path", "sha256", "mediaType"],
      `Archive publication ${publicationId} artwork ${name}`
    );
    const expectedPath = `../../runtime/${version}/${path}`;
    const expected = runtime.manifest.artwork[name];
    if (
      artwork.path !== expectedPath ||
      artwork.sha256 !== expected.sha256 ||
      artwork.mediaType !== expected.mediaType
    ) {
      throw new Error(`Archive publication ${publicationId} artwork ${name} does not match runtime ${version}.`);
    }
  }

  assertExactKeys(
    publication.content,
    ["snapshotId", "runtimeSchemaVersion", "manifest"],
    `Archive publication ${publicationId} content`
  );
  assertExactKeys(
    publication.content.manifest,
    ["path", "sha256"],
    `Archive publication ${publicationId} content manifest`
  );
  const snapshotId = publication.content.snapshotId;
  const contentHash = typeof snapshotId === "string" && snapshotId.startsWith("sha256:")
    ? snapshotId.slice("sha256:".length)
    : "";
  const content = contentByHash.get(contentHash);
  if (!content || publication.content.runtimeSchemaVersion !== "1.0") {
    throw new Error(`Archive publication ${publicationId} references unavailable or incompatible content.`);
  }
  referencedContent.add(contentHash);
  if (
    publication.content.manifest.path !== `../../content/${contentHash}/manifest.json` ||
    publication.content.manifest.sha256 !== content.fileSha256 ||
    content.manifest.snapshotId !== snapshotId
  ) {
    throw new Error(`Archive publication ${publicationId} content reference does not match snapshot ${snapshotId}.`);
  }
}

if (sorted(referencedRuntimes).join("|") !== sorted(runtimeByVersion.keys()).join("|")) {
  throw new Error("Archive release tree contains an unreferenced immutable runtime directory.");
}
if (sorted(referencedContent).join("|") !== sorted(contentByHash.keys()).join("|")) {
  throw new Error("Archive release tree contains an unreferenced immutable content directory.");
}

console.log(
  `[archive release verify] ${publicationIds.length} publication(s), ${runtimeByVersion.size} runtime(s), and ${contentByHash.size} content snapshot(s) verified`
);
