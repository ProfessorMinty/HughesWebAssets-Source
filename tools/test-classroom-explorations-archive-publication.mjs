import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { access, copyFile, cp, mkdtemp, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const distRoot = resolve(root, "dist/classroom-explorations-archive");
const releaseRoot = await mkdtemp(resolve(tmpdir(), "hrv-archive-publication-test-"));
const malformedDistContainer = await mkdtemp(resolve(tmpdir(), "hrv-archive-malformed-dist-"));
const env = {
  ...process.env,
  HRV_ARCHIVE_DIST_ROOT: distRoot,
  HRV_ARCHIVE_RELEASE_ROOT: releaseRoot
};
const runStage = (
  publicationId,
  sourceRevision,
  previous = "none",
  envOverrides = {}
) => spawnSync(process.execPath, [
  resolve(root, "tools/stage-classroom-explorations-archive-publication.mjs"),
  "2099.01.01.1",
  publicationId,
  sourceRevision,
  previous
], {
  cwd: root,
  env: { ...env, ...envOverrides },
  encoding: "utf8"
});
const digest = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
const artwork = {
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
const assertMissing = async (path, message) => {
  await assert.rejects(access(path), (error) => error.code === "ENOENT", message);
};
const assertNoStagingResidue = async (publicationId) => {
  const snapshot = JSON.parse(await readFile(resolve(distRoot, "content-snapshot.json"), "utf8"));
  const contentHash = snapshot.snapshotId.slice("sha256:".length);
  for (const target of [
    resolve(releaseRoot, "runtime/2099.01.01.1"),
    resolve(releaseRoot, `content/${contentHash}`),
    resolve(releaseRoot, `publications/${publicationId}`)
  ]) {
    await assertMissing(target, `Failed staging must not leave a final target: ${target}`);
  }
  for (const parent of ["runtime", "content", "publications"]) {
    assert.deepEqual(
      await readdir(resolve(releaseRoot, parent)),
      [],
      `Failed staging must remove every temporary ${parent} entry.`
    );
  }
};

try {
  const malformedDistRoot = resolve(malformedDistContainer, "classroom-explorations-archive");
  await cp(distRoot, malformedDistRoot, { recursive: true });
  await writeFile(
    resolve(malformedDistRoot, "runtime", artwork.frameTopLeft.path),
    "tampered first-stage archive frame artwork",
    "utf8"
  );
  const malformedFirst = runStage(
    "pub-2099-01-01-001",
    "a".repeat(40),
    "none",
    { HRV_ARCHIVE_DIST_ROOT: malformedDistRoot }
  );
  assert.notEqual(malformedFirst.status, 0, "Malformed first-time runtime bytes must reject staging.");
  assert.match(
    malformedFirst.stderr + malformedFirst.stdout,
    /Runtime release artwork digest is invalid: assets\/frame\/top-left\.webp/
  );
  await assertNoStagingResidue("pub-2099-01-01-001");

  const interruptedPromotion = runStage(
    "pub-2099-01-01-001",
    "a".repeat(40),
    "none",
    {
      NODE_ENV: "test",
      HRV_ARCHIVE_TEST_FAIL_BEFORE_PUBLICATION_PROMOTION: "true"
    }
  );
  assert.notEqual(interruptedPromotion.status, 0, "Interrupted publication promotion must reject staging.");
  assert.match(
    interruptedPromotion.stderr + interruptedPromotion.stdout,
    /Injected failure before archive publication promotion/
  );
  await assertNoStagingResidue("pub-2099-01-01-001");

  const first = runStage("pub-2099-01-01-001", "a".repeat(40));
  assert.equal(first.status, 0, first.stderr || first.stdout);
  const runtimeDir = resolve(releaseRoot, "runtime/2099.01.01.1");
  const files = [
    "bootstrap.js",
    "runtime.js",
    "archive.css",
    "host-compat.css",
    "runtime-release.json",
    ...Object.values(artwork).map((entry) => entry.path)
  ].sort();
  assert.deepEqual(
    await listFiles(runtimeDir),
    files,
    "The immutable archive runtime must package exactly the declared nested file set."
  );
  const before = Object.fromEntries(
    await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))]))
  );

  const runtimeRelease = JSON.parse(await readFile(resolve(runtimeDir, "runtime-release.json"), "utf8"));
  assert.equal(runtimeRelease.pageId, "hrv-page:classroom-explorations-archive-2025-2026");
  assert.equal(runtimeRelease.pageType, "classroom-explorations-archive");
  for (const [name, expected] of Object.entries(artwork)) {
    assert.deepEqual(runtimeRelease.artwork[name], {
      path: expected.path,
      sha256: before[expected.path],
      mediaType: expected.mediaType
    });
    assert.equal(
      before[expected.path],
      await digest(resolve(distRoot, "runtime", expected.path)),
      `Nested artwork bytes must match the deterministic archive build: ${expected.path}`
    );
  }

  const publication1 = JSON.parse(await readFile(
    resolve(releaseRoot, "publications/pub-2099-01-01-001/publication.json"),
    "utf8"
  ));
  assert.equal(publication1.pageId, "hrv-page:classroom-explorations-archive-2025-2026");
  assert.equal(publication1.pageType, "classroom-explorations-archive");
  assert.equal(publication1.runtime.style.path, "../../runtime/2099.01.01.1/archive.css");
  assert.equal(publication1.previousKnownGoodPublication, null);

  const duplicate = runStage("pub-2099-01-01-001", "a".repeat(40));
  assert.notEqual(duplicate.status, 0, "Restaging an immutable archive publication ID must fail.");
  const afterDuplicate = Object.fromEntries(
    await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))]))
  );
  assert.deepEqual(afterDuplicate, before, "Rejected restage must not mutate immutable runtime bytes.");

  const second = runStage("pub-2099-01-01-002", "b".repeat(40), "pub-2099-01-01-001");
  assert.equal(second.status, 0, second.stderr || second.stdout);
  const afterReuse = Object.fromEntries(
    await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))]))
  );
  assert.deepEqual(afterReuse, before, "A later publication may reuse, but must not rewrite, an identical runtime release.");
  assert.deepEqual(await readdir(resolve(releaseRoot, "runtime")), ["2099.01.01.1"]);
  const publication2 = JSON.parse(await readFile(
    resolve(releaseRoot, "publications/pub-2099-01-01-002/publication.json"),
    "utf8"
  ));
  assert.equal(publication2.previousKnownGoodPublication, "pub-2099-01-01-001");
  for (const [name, expected] of Object.entries(artwork)) {
    assert.deepEqual(publication2.runtime.artwork[name], {
      path: `../../runtime/2099.01.01.1/${expected.path}`,
      sha256: before[expected.path],
      mediaType: expected.mediaType
    });
  }

  const tamperedArtwork = resolve(runtimeDir, artwork.pastYears.path);
  await writeFile(tamperedArtwork, "tampered immutable archive artwork", "utf8");
  const tamperedRuntimeReuse = runStage(
    "pub-2099-01-01-003",
    "c".repeat(40),
    "pub-2099-01-01-002"
  );
  assert.notEqual(tamperedRuntimeReuse.status, 0, "Changed immutable runtime bytes must reject reuse.");
  assert.match(
    tamperedRuntimeReuse.stderr + tamperedRuntimeReuse.stdout,
    /does not match deterministic build output: assets\/history\/past-years\.webp/
  );
  await assertMissing(
    resolve(releaseRoot, "publications/pub-2099-01-01-003"),
    "Rejected runtime reuse must not leave a partial publication."
  );

  await copyFile(resolve(distRoot, "runtime", artwork.pastYears.path), tamperedArtwork);
  const snapshot = JSON.parse(await readFile(resolve(distRoot, "content-snapshot.json"), "utf8"));
  const contentHash = snapshot.snapshotId.slice("sha256:".length);
  const immutableManifest = resolve(releaseRoot, `content/${contentHash}/manifest.json`);
  await writeFile(immutableManifest, "tampered immutable archive content", "utf8");
  const tamperedContentReuse = runStage(
    "pub-2099-01-01-003",
    "c".repeat(40),
    "pub-2099-01-01-002"
  );
  assert.notEqual(tamperedContentReuse.status, 0, "Changed immutable content bytes must reject reuse.");
  assert.match(
    tamperedContentReuse.stderr + tamperedContentReuse.stdout,
    /Immutable content snapshot does not match deterministic build output/
  );
  await assertMissing(
    resolve(releaseRoot, "publications/pub-2099-01-01-003"),
    "Rejected content reuse must not leave a partial publication."
  );

  console.log("[archive test publication] fail-closed staging + immutable reuse/tamper rejection passed");
} finally {
  await Promise.all([
    rm(releaseRoot, { recursive: true, force: true }),
    rm(malformedDistContainer, { recursive: true, force: true })
  ]);
}
