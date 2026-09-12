import { copyFile, mkdir, mkdtemp, readFile, readdir, rename, rm, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const [runtimeVersion, publicationId, sourceRevision, previousPublicationId = "none"] = process.argv.slice(2);
if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(runtimeVersion || "")) throw new Error("runtimeVersion must be YYYY.MM.DD.N");
if (!/^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(publicationId || "")) throw new Error("publicationId must be pub-YYYY-MM-DD-NNN");
if (!/^[a-f0-9]{40}$/.test(sourceRevision || "")) throw new Error("sourceRevision must be a 40-character Git commit SHA");
if (previousPublicationId !== "none" && !/^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(previousPublicationId)) throw new Error("previousPublicationId must be none or pub-YYYY-MM-DD-NNN");

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(process.env.HRV_HUB_DIST_ROOT || resolve(root, "dist/classroom-explorations-hub"));
const releaseRoot = resolve(process.env.HRV_HUB_RELEASE_ROOT || resolve(root, "releases/classroom-explorations-hub"));
const runtimeParent = resolve(releaseRoot, "runtime");
const contentParent = resolve(releaseRoot, "content");
const publicationParent = resolve(releaseRoot, "publications");
const runtimeTarget = resolve(runtimeParent, runtimeVersion);
const pubTarget = resolve(publicationParent, publicationId);
const runtimeSource = resolve(dist, "runtime");

const exists = async (path) => {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
};
const digest = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
const listFiles = async (directory, prefix = "") => {
  const files = [];
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolutePath, relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new Error(`Unsupported immutable runtime entry: ${relativePath}`);
  }

  return files;
};
const copyFiles = async (source, target, files) => {
  for (const name of files) {
    const destination = resolve(target, name);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(source, name), destination);
  }
};

const snapshot = JSON.parse(await readFile(resolve(dist, "content-snapshot.json"), "utf8"));
if (
  snapshot.schemaVersion !== "1.0" ||
  !/^sha256:[a-f0-9]{64}$/.test(snapshot.snapshotId || "") ||
  snapshot.canonicalSha256 !== snapshot.snapshotId.slice("sha256:".length) ||
  snapshot.manifestPath !== `content/${snapshot.canonicalSha256}/manifest.json`
) {
  throw new Error("Content snapshot contract is invalid.");
}
const hash = snapshot.canonicalSha256;
const contentTarget = resolve(contentParent, hash);
const incomingManifest = resolve(dist, snapshot.manifestPath);
const incomingContent = JSON.parse(await readFile(incomingManifest, "utf8"));
if (
  incomingContent.runtimeSchemaVersion !== "1.0" ||
  incomingContent.snapshotId !== snapshot.snapshotId ||
  incomingContent.page?.id !== "hrv-page:classroom-explorations"
) {
  throw new Error("Content manifest contract is invalid.");
}

const runtimeRelease = JSON.parse(await readFile(resolve(runtimeSource, "runtime-release.json"), "utf8"));
if (
  runtimeRelease.schemaVersion !== "1.0" ||
  runtimeRelease.pageId !== "hrv-page:classroom-explorations" ||
  runtimeRelease.pageType !== "classroom-explorations-hub" ||
  runtimeRelease.runtimeSchemaVersion !== "1.0"
) {
  throw new Error("Runtime release contract is invalid.");
}
const expectedAssets = {
  bootstrap: "bootstrap.js",
  script: "runtime.js",
  style: "hub.css",
  hostCompat: "host-compat.css"
};
const expectedArtwork = {
  pastExplorations: "assets/history/past-explorations.webp",
  pastTwwl: "assets/history/past-twwl.webp",
  pastYears: "assets/history/past-years.webp",
  frameTopLeft: "assets/frame/top-left.webp",
  frameTopRight: "assets/frame/top-right.webp",
  frameMiddleLeft: "assets/frame/middle-left.webp",
  frameMiddleRight: "assets/frame/middle-right.webp",
  frameBottomLeft: "assets/frame/bottom-left.webp",
  frameBottomRight: "assets/frame/bottom-right.webp"
};
if (Object.keys(runtimeRelease.assets || {}).join("|") !== Object.keys(expectedAssets).join("|")) {
  throw new Error("Runtime release asset map is missing or unstable.");
}
if (Object.keys(runtimeRelease.artwork || {}).join("|") !== Object.keys(expectedArtwork).join("|")) {
  throw new Error("Runtime release artwork map is missing or unstable.");
}
for (const [name, expectedPath] of Object.entries(expectedAssets)) {
  const entry = runtimeRelease.assets[name];
  if (entry.path !== expectedPath || !/^[a-f0-9]{64}$/.test(entry.sha256 || "")) {
    throw new Error(`Runtime release asset contract is invalid: ${name}`);
  }
}
for (const [name, expectedPath] of Object.entries(expectedArtwork)) {
  const entry = runtimeRelease.artwork[name];
  if (
    entry.path !== expectedPath ||
    !/^[a-f0-9]{64}$/.test(entry.sha256 || "") ||
    entry.mediaType !== "image/webp"
  ) {
    throw new Error(`Runtime release artwork contract is invalid: ${name}`);
  }
}

const runtimeFiles = await listFiles(runtimeSource);
const expectedRuntimeFiles = [
  "runtime-release.json",
  ...Object.values(expectedAssets),
  ...Object.values(expectedArtwork)
].sort();
if (runtimeFiles.join("|") !== expectedRuntimeFiles.join("|")) {
  throw new Error("Deterministic runtime file set does not match the release contract.");
}

const validateRuntimeDirectory = async (directory) => {
  const candidateFiles = await listFiles(directory);
  if (candidateFiles.join("|") !== runtimeFiles.join("|")) {
    throw new Error(`Immutable runtime ${runtimeVersion} file set does not match deterministic build output.`);
  }
  for (const name of runtimeFiles) {
    if (await digest(resolve(runtimeSource, name)) !== await digest(resolve(directory, name))) {
      throw new Error(`Immutable runtime ${runtimeVersion} does not match deterministic build output: ${name}`);
    }
  }
  for (const [name, expectedPath] of Object.entries(expectedAssets)) {
    if (await digest(resolve(directory, expectedPath)) !== runtimeRelease.assets[name].sha256) {
      throw new Error(`Runtime release asset digest is invalid: ${expectedPath}`);
    }
  }
  for (const [name, expectedPath] of Object.entries(expectedArtwork)) {
    if (await digest(resolve(directory, expectedPath)) !== runtimeRelease.artwork[name].sha256) {
      throw new Error(`Runtime release artwork digest is invalid: ${expectedPath}`);
    }
  }
};
const validateContentDirectory = async (directory) => {
  const files = await listFiles(directory);
  if (files.join("|") !== "manifest.json") {
    throw new Error("Immutable content snapshot file set does not match deterministic build output.");
  }
  if (await digest(incomingManifest) !== await digest(resolve(directory, "manifest.json"))) {
    throw new Error("Immutable content snapshot does not match deterministic build output.");
  }
};
const removePath = async (path) => {
  if (path) await rm(path, { recursive: true, force: true });
};

if (await exists(pubTarget)) throw new Error(`Immutable publication already exists: ${pubTarget}`);
await Promise.all([
  mkdir(runtimeParent, { recursive: true }),
  mkdir(contentParent, { recursive: true }),
  mkdir(publicationParent, { recursive: true })
]);

const runtimeExists = await exists(runtimeTarget);
const contentExists = await exists(contentTarget);
let runtimeTemp = null;
let contentTemp = null;
let publicationTemp = null;
let promotedRuntime = false;
let promotedContent = false;
let promotedPublication = false;

try {
  if (runtimeExists) {
    await validateRuntimeDirectory(runtimeTarget);
  } else {
    runtimeTemp = await mkdtemp(resolve(runtimeParent, `.${runtimeVersion}.tmp-`));
    await copyFiles(runtimeSource, runtimeTemp, runtimeFiles);
    await validateRuntimeDirectory(runtimeTemp);
  }

  if (contentExists) {
    await validateContentDirectory(contentTarget);
  } else {
    contentTemp = await mkdtemp(resolve(contentParent, `.${hash}.tmp-`));
    await copyFile(incomingManifest, resolve(contentTemp, "manifest.json"));
    await validateContentDirectory(contentTemp);
  }

  const runtimeCandidate = runtimeExists ? runtimeTarget : runtimeTemp;
  const contentCandidate = contentExists ? contentTarget : contentTemp;
  const publicationArtwork = {};
  for (const [name, expectedPath] of Object.entries(expectedArtwork)) {
    publicationArtwork[name] = {
      path: `../../runtime/${runtimeVersion}/${expectedPath}`,
      sha256: await digest(resolve(runtimeCandidate, expectedPath)),
      mediaType: runtimeRelease.artwork[name].mediaType
    };
  }

  const publication = {
    schemaVersion: "1.0",
    publicationId,
    pageId: "hrv-page:classroom-explorations",
    pageType: "classroom-explorations-hub",
    sourceRevision,
    previousKnownGoodPublication: previousPublicationId === "none" ? null : previousPublicationId,
    runtime: {
      version: runtimeVersion,
      runtimeSchemaVersion: "1.0",
      bootstrap: { path: `../../runtime/${runtimeVersion}/bootstrap.js`, sha256: await digest(resolve(runtimeCandidate, "bootstrap.js")) },
      script: { path: `../../runtime/${runtimeVersion}/runtime.js`, sha256: await digest(resolve(runtimeCandidate, "runtime.js")) },
      style: { path: `../../runtime/${runtimeVersion}/hub.css`, sha256: await digest(resolve(runtimeCandidate, "hub.css")) },
      hostCompat: { path: `../../runtime/${runtimeVersion}/host-compat.css`, sha256: await digest(resolve(runtimeCandidate, "host-compat.css")) },
      artwork: publicationArtwork
    },
    content: {
      snapshotId: snapshot.snapshotId,
      runtimeSchemaVersion: "1.0",
      manifest: {
        path: `../../content/${hash}/manifest.json`,
        sha256: await digest(resolve(contentCandidate, "manifest.json"))
      }
    }
  };

  publicationTemp = await mkdtemp(resolve(publicationParent, `.${publicationId}.tmp-`));
  const publicationFile = resolve(publicationTemp, "publication.json");
  await writeFile(publicationFile, `${JSON.stringify(publication, null, 2)}\n`, "utf8");
  const writtenPublication = JSON.parse(await readFile(publicationFile, "utf8"));
  if (JSON.stringify(writtenPublication) !== JSON.stringify(publication)) {
    throw new Error("Temporary publication validation failed.");
  }
  if ((await listFiles(publicationTemp)).join("|") !== "publication.json") {
    throw new Error("Temporary publication file set is invalid.");
  }

  if (runtimeTemp) {
    await rename(runtimeTemp, runtimeTarget);
    runtimeTemp = null;
    promotedRuntime = true;
  }
  if (contentTemp) {
    await rename(contentTemp, contentTarget);
    contentTemp = null;
    promotedContent = true;
  }
  if (
    process.env.NODE_ENV === "test" &&
    process.env.HRV_HUB_TEST_FAIL_BEFORE_PUBLICATION_PROMOTION === "true"
  ) {
    throw new Error("Injected failure before publication promotion.");
  }
  await rename(publicationTemp, pubTarget);
  publicationTemp = null;
  promotedPublication = true;

  console.log(`[hub] staged immutable publication ${publicationId}; previous known good = ${publication.previousKnownGoodPublication ?? "none (new baseline)"}`);
} catch (error) {
  const cleanupErrors = [];
  for (const path of [publicationTemp, contentTemp, runtimeTemp]) {
    try {
      await removePath(path);
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
  }
  for (const [path, promoted] of [
    [pubTarget, promotedPublication],
    [contentTarget, promotedContent],
    [runtimeTarget, promotedRuntime]
  ]) {
    if (!promoted) continue;
    try {
      await removePath(path);
    } catch (cleanupError) {
      cleanupErrors.push(cleanupError);
    }
  }
  if (cleanupErrors.length) {
    throw new AggregateError([error, ...cleanupErrors], "Immutable staging failed and cleanup was incomplete.");
  }
  throw error;
}
