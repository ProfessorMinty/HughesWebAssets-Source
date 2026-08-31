import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, mkdtemp, readFile, readdir, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const releaseRoot = await mkdtemp(resolve(tmpdir(), "hrv-hub-publication-test-"));
const env = { ...process.env, HRV_HUB_RELEASE_ROOT: releaseRoot };
const runStage = (publicationId, sourceRevision, previous = "none") => spawnSync(process.execPath, [
  resolve(root, "tools/stage-classroom-explorations-hub-publication.mjs"),
  "2099.01.01.1",
  publicationId,
  sourceRevision,
  previous
], { cwd: root, env, encoding: "utf8" });
const digest = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
const artwork = {
  pastExplorations: { path: "assets/history/past-explorations.webp", mediaType: "image/webp" },
  pastTwwl: { path: "assets/history/past-twwl.webp", mediaType: "image/webp" },
  pastYears: { path: "assets/history/past-years.webp", mediaType: "image/webp" },
  frameTopLeft: { path: "assets/frame/top-left.webp", mediaType: "image/webp" },
  frameTopRight: { path: "assets/frame/top-right.webp", mediaType: "image/webp" },
  frameMiddleLeft: { path: "assets/frame/middle-left.webp", mediaType: "image/webp" },
  frameMiddleRight: { path: "assets/frame/middle-right.webp", mediaType: "image/webp" },
  frameBottomLeft: { path: "assets/frame/bottom-left.webp", mediaType: "image/webp" },
  frameBottomRight: { path: "assets/frame/bottom-right.webp", mediaType: "image/webp" }
};
const listFiles = async (directory, prefix = "") => {
  const files = [];
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolutePath, relativePath));
    else if (entry.isFile()) files.push(relativePath);
  }
  return files;
};

const first = runStage("pub-2099-01-01-001", "a".repeat(40));
assert.equal(first.status, 0, first.stderr || first.stdout);
const runtimeDir = resolve(releaseRoot, "runtime/2099.01.01.1");
const files = [
  "bootstrap.js",
  "runtime.js",
  "hub.css",
  "host-compat.css",
  "runtime-release.json",
  ...Object.values(artwork).map((entry) => entry.path)
].sort();
assert.deepEqual(await listFiles(runtimeDir), files, "The immutable runtime must recursively package every declared artwork file.");
const before = Object.fromEntries(await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))])));

const runtimeRelease = JSON.parse(await readFile(resolve(runtimeDir, "runtime-release.json"), "utf8"));
for (const [name, expected] of Object.entries(artwork)) {
  assert.deepEqual(runtimeRelease.artwork[name], {
    path: expected.path,
    sha256: before[expected.path],
    mediaType: expected.mediaType
  });
  assert.equal(
    before[expected.path],
    await digest(resolve(root, "dist/classroom-explorations-hub/runtime", expected.path)),
    `Nested artwork bytes must match the deterministic build: ${expected.path}`
  );
}

const duplicate = runStage("pub-2099-01-01-001", "a".repeat(40));
assert.notEqual(duplicate.status, 0, "Restaging an immutable publication ID must fail.");
const afterDuplicate = Object.fromEntries(await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))])));
assert.deepEqual(afterDuplicate, before, "Rejected restage must not mutate immutable runtime bytes.");

const second = runStage("pub-2099-01-01-002", "b".repeat(40), "pub-2099-01-01-001");
assert.equal(second.status, 0, second.stderr || second.stdout);
const afterReuse = Object.fromEntries(await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))])));
assert.deepEqual(afterReuse, before, "A later publication may reuse, but must not rewrite, an identical runtime release.");
const runtimeVersions = await readdir(resolve(releaseRoot, "runtime"));
assert.deepEqual(runtimeVersions, ["2099.01.01.1"]);
const publication2 = JSON.parse(await readFile(resolve(releaseRoot, "publications/pub-2099-01-01-002/publication.json"), "utf8"));
assert.equal(publication2.previousKnownGoodPublication, "pub-2099-01-01-001");
for (const [name, expected] of Object.entries(artwork)) {
  assert.deepEqual(publication2.runtime.artwork[name], {
    path: `../../runtime/2099.01.01.1/${expected.path}`,
    sha256: before[expected.path],
    mediaType: expected.mediaType
  });
}

const tamperedArtwork = resolve(runtimeDir, artwork.pastExplorations.path);
await writeFile(tamperedArtwork, "tampered nested artwork", "utf8");
const tamperedReuse = runStage("pub-2099-01-01-003", "c".repeat(40), "pub-2099-01-01-002");
assert.notEqual(tamperedReuse.status, 0, "A changed nested artwork file must reject immutable runtime reuse.");
assert.match(tamperedReuse.stderr + tamperedReuse.stdout, /does not match deterministic build output: assets\/history\/past-explorations\.webp/);
await assert.rejects(
  access(resolve(releaseRoot, "publications/pub-2099-01-01-003")),
  (error) => error.code === "ENOENT",
  "Rejected nested artwork reuse must not leave a partial publication."
);
console.log("[hub test W] immutable runtime/publication preservation + later publication reuse passed");
