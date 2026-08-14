import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { mkdtemp, readFile, readdir } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";

const root = resolve(new URL("..", import.meta.url).pathname);
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

const first = runStage("pub-2099-01-01-001", "a".repeat(40));
assert.equal(first.status, 0, first.stderr || first.stdout);
const runtimeDir = resolve(releaseRoot, "runtime/2099.01.01.1");
const files = ["bootstrap.js", "runtime.js", "hub.css", "host-compat.css", "runtime-release.json"];
const before = Object.fromEntries(await Promise.all(files.map(async (name) => [name, await digest(resolve(runtimeDir, name))])));

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
console.log("[hub test W] immutable runtime/publication preservation + later publication reuse passed");
