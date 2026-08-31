import { copyFile, mkdir, readFile, readdir, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const [runtimeVersion, publicationId, sourceRevision, previousPublicationId = "none"] = process.argv.slice(2);
if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(runtimeVersion || "")) throw new Error("runtimeVersion must be YYYY.MM.DD.N");
if (!/^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(publicationId || "")) throw new Error("publicationId must be pub-YYYY-MM-DD-NNN");
if (!/^[a-f0-9]{40}$/.test(sourceRevision || "")) throw new Error("sourceRevision must be a 40-character Git commit SHA");
if (previousPublicationId !== "none" && !/^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(previousPublicationId)) throw new Error("previousPublicationId must be none or pub-YYYY-MM-DD-NNN");
const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist/classroom-explorations-hub");
const releaseRoot = resolve(process.env.HRV_HUB_RELEASE_ROOT || resolve(root, "releases/classroom-explorations-hub"));
const runtimeTarget = resolve(releaseRoot, `runtime/${runtimeVersion}`);
const snapshot = JSON.parse(await readFile(resolve(dist, "content-snapshot.json"), "utf8"));
const hash = snapshot.snapshotId.slice("sha256:".length);
const contentTarget = resolve(releaseRoot, `content/${hash}`);
const pubTarget = resolve(releaseRoot, `publications/${publicationId}`);
const exists = async (path) => { try { await stat(path); return true; } catch (e) { if (e.code === "ENOENT") return false; throw e; } };
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
const runtimeSource = resolve(dist, "runtime");
const runtimeRelease = JSON.parse(await readFile(resolve(runtimeSource, "runtime-release.json"), "utf8"));
const runtimeFiles = await listFiles(runtimeSource);
if (await exists(pubTarget)) throw new Error(`Immutable publication already exists: ${pubTarget}`);
if (!(await exists(runtimeTarget))) {
  await mkdir(runtimeTarget, { recursive: true });
  for (const name of runtimeFiles) {
    const destination = resolve(runtimeTarget, name);
    await mkdir(dirname(destination), { recursive: true });
    await copyFile(resolve(runtimeSource, name), destination);
  }
}
const incomingManifest = resolve(dist, snapshot.manifestPath);
if (!(await exists(contentTarget))) { await mkdir(contentTarget, { recursive: true }); await copyFile(incomingManifest, resolve(contentTarget, "manifest.json")); }
const digest = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");

const stagedRuntimeFiles = await listFiles(runtimeTarget);
if (runtimeFiles.join("|") !== stagedRuntimeFiles.join("|")) {
  throw new Error(`Existing immutable runtime ${runtimeVersion} file set does not match deterministic build output.`);
}
for (const name of runtimeFiles) {
  if (await digest(resolve(runtimeSource, name)) !== await digest(resolve(runtimeTarget, name))) throw new Error(`Existing immutable runtime ${runtimeVersion} does not match deterministic build output: ${name}`);
}
if (await digest(incomingManifest) !== await digest(resolve(contentTarget, "manifest.json"))) throw new Error("Existing immutable content snapshot does not match deterministic build output.");

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
if (Object.keys(runtimeRelease.artwork || {}).join("|") !== Object.keys(expectedArtwork).join("|")) {
  throw new Error("Runtime release artwork map is missing or unstable.");
}
const publicationArtwork = {};
for (const [name, expectedPath] of Object.entries(expectedArtwork)) {
  const entry = runtimeRelease.artwork[name];
  if (entry.path !== expectedPath || entry.mediaType !== "image/webp") {
    throw new Error(`Runtime release artwork contract is invalid: ${name}`);
  }
  const actual = await digest(resolve(runtimeTarget, entry.path));
  if (actual !== entry.sha256) throw new Error(`Runtime release artwork digest is invalid: ${entry.path}`);
  publicationArtwork[name] = {
    path: `../../runtime/${runtimeVersion}/${entry.path}`,
    sha256: actual,
    mediaType: entry.mediaType
  };
}

await mkdir(pubTarget, { recursive: true });
const publication = {
  schemaVersion: "1.0", publicationId, pageId: "hrv-page:classroom-explorations", pageType: "classroom-explorations-hub", sourceRevision,
  previousKnownGoodPublication: previousPublicationId === "none" ? null : previousPublicationId,
  runtime: {
    version: runtimeVersion, runtimeSchemaVersion: "1.0",
    bootstrap: { path: `../../runtime/${runtimeVersion}/bootstrap.js`, sha256: await digest(resolve(runtimeTarget, "bootstrap.js")) },
    script: { path: `../../runtime/${runtimeVersion}/runtime.js`, sha256: await digest(resolve(runtimeTarget, "runtime.js")) },
    style: { path: `../../runtime/${runtimeVersion}/hub.css`, sha256: await digest(resolve(runtimeTarget, "hub.css")) },
    hostCompat: { path: `../../runtime/${runtimeVersion}/host-compat.css`, sha256: await digest(resolve(runtimeTarget, "host-compat.css")) },
    artwork: publicationArtwork
  },
  content: { snapshotId: snapshot.snapshotId, runtimeSchemaVersion: "1.0", manifest: { path: `../../content/${hash}/manifest.json`, sha256: await digest(resolve(contentTarget, "manifest.json")) } }
};
await writeFile(resolve(pubTarget, "publication.json"), `${JSON.stringify(publication, null, 2)}\n`, "utf8");
console.log(`[hub] staged immutable publication ${publicationId}; previous known good = ${publication.previousKnownGoodPublication ?? "none (new baseline)"}`);
