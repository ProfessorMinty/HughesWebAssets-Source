import { createHash } from "node:crypto";
import { mkdir, readFile, rename, writeFile } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

import { validateSchema } from "./lib/json-schema-lite.mjs";
import { validateArchiveRuntimeCompatibility } from "./lib/classroom-explorations-archive-contract.mjs";

const PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";
const PAGE_TYPE = "classroom-explorations-archive";
const REPOSITORY = "ProfessorMinty/HughesWebAssets-Source";
const RELEASE_PREFIX = "releases/classroom-explorations-archive";
const COMMIT_SHA = /^[a-f0-9]{40}$/;
const RUNTIME_VERSION = /^\d{4}\.\d{2}\.\d{2}\.\d+$/;
const PUBLICATION_ID = /^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/;
const SHA256 = /^[a-f0-9]{64}$/;

const codeRoot = fileURLToPath(new URL("..", import.meta.url));
const repositoryOverride = process.env.HRV_ARCHIVE_REPOSITORY_ROOT;
const originOverride = process.env.HRV_ARCHIVE_CDN_ORIGIN;
if ((repositoryOverride || originOverride) && process.env.NODE_ENV !== "test") {
  throw new Error("Archive repository/CDN overrides are available only under NODE_ENV=test.");
}
const repositoryRoot = resolve(repositoryOverride || codeRoot);

const args = process.argv.slice(2);
const positionals = [];
let outputPath = null;
for (let index = 0; index < args.length; index += 1) {
  if (args[index] === "--output") {
    if (outputPath !== null || index + 1 >= args.length) {
      throw new Error("--output must be supplied once with a file path.");
    }
    outputPath = args[index + 1];
    index += 1;
  } else if (args[index].startsWith("--")) {
    throw new Error(`Unknown archive CDN verification argument: ${args[index]}`);
  } else {
    positionals.push(args[index]);
  }
}

if (positionals.length !== 3) {
  throw new Error(
    "Usage: node tools/verify-classroom-explorations-archive-cdn.mjs <40-char-release-commit> <runtime-version> <publication-id> [--output <path>]"
  );
}
const [releaseCommit, runtimeVersion, publicationId] = positionals;
if (!COMMIT_SHA.test(releaseCommit)) {
  throw new Error("releaseCommit must be an exact lowercase 40-character Git commit SHA; mutable or abbreviated refs are forbidden.");
}
if (!RUNTIME_VERSION.test(runtimeVersion)) {
  throw new Error("runtimeVersion must be YYYY.MM.DD.N.");
}
if (!PUBLICATION_ID.test(publicationId)) {
  throw new Error("publicationId must be pub-YYYY-MM-DD-NNN.");
}

const runGit = (gitArgs, { bytes = false, label = "Git command" } = {}) => {
  const result = spawnSync("git", ["-C", repositoryRoot, ...gitArgs], {
    encoding: bytes ? null : "utf8",
    maxBuffer: 16 * 1024 * 1024
  });
  if (result.status !== 0) {
    const errorText = Buffer.isBuffer(result.stderr)
      ? result.stderr.toString("utf8")
      : result.stderr || result.stdout || "unknown Git error";
    throw new Error(`${label} failed: ${errorText.trim()}`);
  }
  return result.stdout;
};
const gitSucceeds = (gitArgs) => spawnSync(
  "git",
  ["-C", repositoryRoot, ...gitArgs],
  { encoding: "utf8" }
).status === 0;

if (!gitSucceeds(["cat-file", "-e", `${releaseCommit}^{commit}`])) {
  throw new Error(`releaseCommit ${releaseCommit} is not an available local Git commit.`);
}
if (!gitSucceeds(["merge-base", "--is-ancestor", releaseCommit, "HEAD"])) {
  throw new Error(`releaseCommit ${releaseCommit} is not an ancestor of the current repository HEAD.`);
}

const gitBlob = (path) => Buffer.from(runGit(
  ["show", `${releaseCommit}:${path}`],
  { bytes: true, label: `Read committed release file ${path}` }
));
const committedPaths = runGit(
  ["ls-tree", "-r", "--name-only", releaseCommit, "--", RELEASE_PREFIX],
  { label: "List committed archive release tree" }
).trim().split(/\r?\n/).filter(Boolean);
const committedPathSet = new Set(committedPaths);
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const canonicalJson = (value) => `${JSON.stringify(value, null, 2)}\n`;
const parseCommittedJson = (path, label) => {
  const bytes = gitBlob(path);
  const text = bytes.toString("utf8");
  let value;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`${label} is not valid JSON: ${error.message}`);
  }
  if (text !== canonicalJson(value)) {
    throw new Error(`${label} is not in deterministic repository JSON format.`);
  }
  return { bytes, value };
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
const assertCommittedSubtree = (prefix, expectedFiles, label) => {
  const actual = committedPaths
    .filter((path) => path.startsWith(`${prefix}/`))
    .map((path) => path.slice(prefix.length + 1));
  const expected = sorted(expectedFiles);
  if (actual.join("|") !== expected.join("|")) {
    throw new Error(`${label} has an unexpected committed file set: ${actual.join(", ")}`);
  }
};

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

const publicationPath = `${RELEASE_PREFIX}/publications/${publicationId}/publication.json`;
if (!committedPathSet.has(publicationPath)) {
  throw new Error(`Selected archive publication is not committed at ${releaseCommit}: ${publicationPath}`);
}
assertCommittedSubtree(
  `${RELEASE_PREFIX}/publications/${publicationId}`,
  ["publication.json"],
  `Archive publication ${publicationId}`
);
const publicationRecord = parseCommittedJson(publicationPath, `Archive publication ${publicationId}`);
const publication = publicationRecord.value;
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
if (!COMMIT_SHA.test(publication.sourceRevision || "")) {
  throw new Error(`Archive publication ${publicationId} has an invalid sourceRevision.`);
}
if (!gitSucceeds(["cat-file", "-e", `${publication.sourceRevision}^{commit}`])) {
  throw new Error(`Archive publication sourceRevision ${publication.sourceRevision} is not an available Git commit.`);
}
if (!gitSucceeds(["merge-base", "--is-ancestor", publication.sourceRevision, releaseCommit])) {
  throw new Error(`Archive publication sourceRevision ${publication.sourceRevision} is not an ancestor of releaseCommit.`);
}

const publicationPrefix = `${RELEASE_PREFIX}/publications/`;
const committedPublicationIds = sorted(new Set(committedPaths
  .filter((path) => path.startsWith(publicationPrefix) && path.endsWith("/publication.json"))
  .map((path) => path.slice(publicationPrefix.length).split("/")[0])
));
const previous = publication.previousKnownGoodPublication;
const earlierPublicationIds = committedPublicationIds.filter((id) => id.localeCompare(publicationId) < 0);
if (previous === null) {
  if (earlierPublicationIds.length !== 0) {
    throw new Error(`Archive publication ${publicationId} cannot declare a null previous-known-good after an earlier publication exists.`);
  }
} else if (
  typeof previous !== "string" ||
  !PUBLICATION_ID.test(previous) ||
  !earlierPublicationIds.includes(previous) ||
  !committedPathSet.has(`${publicationPrefix}${previous}/publication.json`)
) {
  throw new Error(`Archive publication ${publicationId} must reference an earlier committed previous-known-good publication.`);
}

assertExactKeys(
  publication.runtime,
  ["version", "runtimeSchemaVersion", "bootstrap", "script", "style", "hostCompat", "artwork"],
  `Archive publication ${publicationId} runtime`
);
if (publication.runtime.version !== runtimeVersion || publication.runtime.runtimeSchemaVersion !== "1.0") {
  throw new Error(`Archive publication ${publicationId} does not select runtime ${runtimeVersion}.`);
}
const runtimePrefix = `${RELEASE_PREFIX}/runtime/${runtimeVersion}`;
assertCommittedSubtree(
  runtimePrefix,
  ["runtime-release.json", ...Object.values(expectedAssets), ...Object.values(expectedArtwork)],
  `Archive runtime ${runtimeVersion}`
);
const runtimeReleasePath = `${runtimePrefix}/runtime-release.json`;
const runtimeReleaseRecord = parseCommittedJson(
  runtimeReleasePath,
  `Archive runtime ${runtimeVersion} release manifest`
);
const runtimeRelease = runtimeReleaseRecord.value;
assertExactKeys(
  runtimeRelease,
  ["schemaVersion", "pageId", "pageType", "runtimeSchemaVersion", "assets", "artwork"],
  `Archive runtime ${runtimeVersion} release manifest`
);
if (
  runtimeRelease.schemaVersion !== "1.0" ||
  runtimeRelease.pageId !== PAGE_ID ||
  runtimeRelease.pageType !== PAGE_TYPE ||
  runtimeRelease.runtimeSchemaVersion !== "1.0"
) {
  throw new Error(`Archive runtime ${runtimeVersion} has an incompatible release identity.`);
}
assertExactKeys(runtimeRelease.assets, Object.keys(expectedAssets), `Archive runtime ${runtimeVersion} assets`);
assertExactKeys(runtimeRelease.artwork, Object.keys(expectedArtwork), `Archive runtime ${runtimeVersion} artwork`);
assertExactKeys(
  publication.runtime.artwork,
  Object.keys(expectedArtwork),
  `Archive publication ${publicationId} artwork`
);

const fileContracts = [];
const registerFile = (path, expectedHash, contract) => {
  if (!committedPathSet.has(path)) throw new Error(`Required committed archive file is missing: ${path}`);
  if (!SHA256.test(expectedHash || "")) throw new Error(`Invalid expected SHA-256 for ${path}.`);
  const localBytes = gitBlob(path);
  const localHash = digest(localBytes);
  if (localHash !== expectedHash) {
    throw new Error(`Committed archive file ${path} does not match ${contract}: expected ${expectedHash}, got ${localHash}.`);
  }
  fileContracts.push({ path: path.slice(RELEASE_PREFIX.length + 1), localBytes, sha256: localHash, contract });
};

for (const [name, path] of Object.entries(expectedAssets)) {
  const runtimeAsset = runtimeRelease.assets[name];
  const publicationAsset = publication.runtime[name];
  assertExactKeys(runtimeAsset, ["path", "sha256"], `Archive runtime asset ${name}`);
  assertExactKeys(publicationAsset, ["path", "sha256"], `Archive publication runtime asset ${name}`);
  if (
    runtimeAsset.path !== path ||
    publicationAsset.path !== `../../runtime/${runtimeVersion}/${path}` ||
    publicationAsset.sha256 !== runtimeAsset.sha256
  ) {
    throw new Error(`Archive runtime/publication contract mismatch for ${name}.`);
  }
  registerFile(`${runtimePrefix}/${path}`, runtimeAsset.sha256, `runtime-release.assets.${name}`);
}
for (const [name, path] of Object.entries(expectedArtwork)) {
  const runtimeArtwork = runtimeRelease.artwork[name];
  const publicationArtwork = publication.runtime.artwork[name];
  assertExactKeys(runtimeArtwork, ["path", "sha256", "mediaType"], `Archive runtime artwork ${name}`);
  assertExactKeys(publicationArtwork, ["path", "sha256", "mediaType"], `Archive publication artwork ${name}`);
  if (
    runtimeArtwork.path !== path ||
    runtimeArtwork.mediaType !== "image/webp" ||
    publicationArtwork.path !== `../../runtime/${runtimeVersion}/${path}` ||
    publicationArtwork.sha256 !== runtimeArtwork.sha256 ||
    publicationArtwork.mediaType !== runtimeArtwork.mediaType
  ) {
    throw new Error(`Archive runtime/publication artwork contract mismatch for ${name}.`);
  }
  registerFile(`${runtimePrefix}/${path}`, runtimeArtwork.sha256, `runtime-release.artwork.${name}`);
}
registerFile(runtimeReleasePath, digest(runtimeReleaseRecord.bytes), "committed runtime-release.json");

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
const contentHash = typeof snapshotId === "string" && /^sha256:[a-f0-9]{64}$/.test(snapshotId)
  ? snapshotId.slice("sha256:".length)
  : "";
if (!contentHash || publication.content.runtimeSchemaVersion !== "1.0") {
  throw new Error(`Archive publication ${publicationId} has an invalid content snapshot contract.`);
}
const contentPrefix = `${RELEASE_PREFIX}/content/${contentHash}`;
assertCommittedSubtree(contentPrefix, ["manifest.json"], `Archive content ${contentHash}`);
const contentPath = `${contentPrefix}/manifest.json`;
if (publication.content.manifest.path !== `../../content/${contentHash}/manifest.json`) {
  throw new Error(`Archive publication ${publicationId} has the wrong content manifest path.`);
}
const contentRecord = parseCommittedJson(contentPath, `Archive content ${contentHash}`);
const runtimeSchema = JSON.parse(await readFile(
  resolve(codeRoot, "schemas/classroom-explorations-archive.runtime.schema.json"),
  "utf8"
));
validateSchema(contentRecord.value, runtimeSchema);
validateArchiveRuntimeCompatibility(contentRecord.value);
if (contentRecord.value.snapshotId !== snapshotId) {
  throw new Error(`Archive content ${contentHash} does not match publication snapshot ${snapshotId}.`);
}
registerFile(contentPath, publication.content.manifest.sha256, "publication.content.manifest");
registerFile(publicationPath, digest(publicationRecord.bytes), "committed publication.json");

if (fileContracts.length !== 14) {
  throw new Error(`Archive CDN verification contract must contain exactly 14 files, got ${fileContracts.length}.`);
}
fileContracts.sort((left, right) => left.path.localeCompare(right.path));

let cdnOrigin = new URL(originOverride || "https://cdn.jsdelivr.net");
if (originOverride) {
  if (
    !["127.0.0.1", "localhost"].includes(cdnOrigin.hostname) ||
    !["http:", "https:"].includes(cdnOrigin.protocol)
  ) {
    throw new Error("Test CDN origin must be local HTTP(S).");
  }
}
cdnOrigin.pathname = "/";
cdnOrigin.search = "";
cdnOrigin.hash = "";
const cdnBase = new URL(
  `/gh/${REPOSITORY}@${releaseCommit}/${RELEASE_PREFIX}/`,
  cdnOrigin
);

const verifiedFiles = [];
for (const file of fileContracts) {
  const url = new URL(file.path, cdnBase).href;
  let response;
  try {
    response = await fetch(url, {
      method: "GET",
      redirect: "error",
      cache: "no-store",
      signal: AbortSignal.timeout(30_000)
    });
  } catch (error) {
    throw new Error(`GET failed for ${url}: ${error.message}`);
  }
  if (response.status !== 200) {
    throw new Error(`GET ${url} returned HTTP ${response.status}; expected 200.`);
  }
  const remoteBytes = Buffer.from(await response.arrayBuffer());
  const remoteHash = digest(remoteBytes);
  if (!remoteBytes.equals(file.localBytes) || remoteHash !== file.sha256) {
    throw new Error(
      `CDN byte mismatch for ${file.path}: expected ${file.sha256}/${file.localBytes.length} bytes, got ${remoteHash}/${remoteBytes.length} bytes.`
    );
  }
  verifiedFiles.push({
    path: file.path,
    url,
    httpStatus: response.status,
    bytes: remoteBytes.length,
    sha256: remoteHash,
    contract: file.contract
  });
}

const evidence = {
  schemaVersion: "1.0",
  verifier: "classroom-explorations-archive-cdn",
  repository: REPOSITORY,
  releaseCommit,
  runtimeVersion,
  publicationId,
  sourceRevision: publication.sourceRevision,
  previousKnownGoodPublication: previous,
  contentSnapshotId: snapshotId,
  cdnBase: cdnBase.href,
  requestMethod: "GET",
  fileCount: verifiedFiles.length,
  files: verifiedFiles
};
const evidenceText = canonicalJson(evidence);

if (outputPath !== null) {
  const resolvedOutput = resolve(outputPath);
  const releaseDirectory = resolve(repositoryRoot, RELEASE_PREFIX);
  const relativeToRelease = relative(releaseDirectory, resolvedOutput);
  if (
    relativeToRelease === "" ||
    (!relativeToRelease.startsWith(`..${sep}`) && relativeToRelease !== ".." && !isAbsolute(relativeToRelease))
  ) {
    throw new Error("Evidence output must not overwrite or enter the immutable archive release tree.");
  }
  await mkdir(dirname(resolvedOutput), { recursive: true });
  const temporaryOutput = `${resolvedOutput}.${process.pid}.tmp`;
  await writeFile(temporaryOutput, evidenceText, "utf8");
  await rename(temporaryOutput, resolvedOutput);
}

process.stdout.write(evidenceText);
