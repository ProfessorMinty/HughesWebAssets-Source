import assert from "node:assert/strict";
import { cp, mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const auditContainer = await mkdtemp(resolve(tmpdir(), "hrv-archive-release-verifier-test-"));
const releaseRoot = resolve(auditContainer, "release");
const cleanRoot = resolve(auditContainer, "clean-release");
const distRoot = resolve(root, "dist/classroom-explorations-archive");
const head = spawnSync("git", ["-C", root, "rev-parse", "HEAD"], { encoding: "utf8" }).stdout.trim();

const runVerifier = (target, args = []) => spawnSync(
  process.execPath,
  [resolve(root, "tools/verify-classroom-explorations-archive-release.mjs"), ...args],
  {
    cwd: root,
    env: { ...process.env, HRV_ARCHIVE_RELEASE_ROOT: target },
    encoding: "utf8"
  }
);
const runStage = (target, publicationId, sourceRevision, previous = "none") => spawnSync(
  process.execPath,
  [
    resolve(root, "tools/stage-classroom-explorations-archive-publication.mjs"),
    "2099.01.02.1",
    publicationId,
    sourceRevision,
    previous
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      HRV_ARCHIVE_DIST_ROOT: distRoot,
      HRV_ARCHIVE_RELEASE_ROOT: target
    },
    encoding: "utf8"
  }
);
const output = (result) => result.stderr + result.stdout;

try {
  const absentStrict = runVerifier(releaseRoot);
  assert.notEqual(absentStrict.status, 0, "An absent release tree must fail strict verification.");
  assert.match(output(absentStrict), /No checked-in Classroom Explorations archive release exists/);

  const absentAllowed = runVerifier(releaseRoot, ["--allow-empty"]);
  assert.equal(absentAllowed.status, 0, output(absentAllowed));
  assert.match(output(absentAllowed), /explicitly allowed for pre-release source CI/);

  const first = runStage(releaseRoot, "pub-2099-01-02-001", head);
  assert.equal(first.status, 0, output(first));
  const firstVerified = runVerifier(releaseRoot, ["--allow-empty"]);
  assert.equal(firstVerified.status, 0, output(firstVerified));

  await cp(releaseRoot, cleanRoot, { recursive: true });

  const runtimePath = resolve(releaseRoot, "runtime/2099.01.02.1/runtime.js");
  const runtimeBytes = await readFile(runtimePath);
  await writeFile(runtimePath, "tampered checked-in runtime", "utf8");
  const tamperedRuntime = runVerifier(releaseRoot);
  assert.notEqual(tamperedRuntime.status, 0, "Tampered checked-in runtime bytes must fail.");
  assert.match(output(tamperedRuntime), /runtime\.js digest mismatch/);
  await writeFile(runtimePath, runtimeBytes);

  await writeFile(resolve(releaseRoot, "runtime/2099.01.02.1/unexpected.txt"), "unexpected", "utf8");
  const unexpectedFile = runVerifier(releaseRoot);
  assert.notEqual(unexpectedFile.status, 0, "An unexpected immutable runtime file must fail.");
  assert.match(output(unexpectedFile), /unexpected immutable file set/);

  await rm(releaseRoot, { recursive: true, force: true });
  await cp(cleanRoot, releaseRoot, { recursive: true });
  await cp(
    resolve(releaseRoot, "runtime/2099.01.02.1"),
    resolve(releaseRoot, "runtime/2099.01.02.2"),
    { recursive: true }
  );
  const orphanRuntime = runVerifier(releaseRoot);
  assert.notEqual(orphanRuntime.status, 0, "An unreferenced immutable runtime must fail.");
  assert.match(output(orphanRuntime), /unreferenced immutable runtime directory/);

  await rm(releaseRoot, { recursive: true, force: true });
  await cp(cleanRoot, releaseRoot, { recursive: true });
  const second = runStage(
    releaseRoot,
    "pub-2099-01-02-002",
    head,
    "pub-2099-01-02-001"
  );
  assert.equal(second.status, 0, output(second));
  const chainVerified = runVerifier(releaseRoot);
  assert.equal(chainVerified.status, 0, output(chainVerified));

  const publication2Path = resolve(
    releaseRoot,
    "publications/pub-2099-01-02-002/publication.json"
  );
  const publication2 = JSON.parse(await readFile(publication2Path, "utf8"));
  publication2.previousKnownGoodPublication = "pub-2099-01-02-999";
  await writeFile(publication2Path, `${JSON.stringify(publication2, null, 2)}\n`, "utf8");
  const danglingPrevious = runVerifier(releaseRoot);
  assert.notEqual(danglingPrevious.status, 0, "A dangling previous-known-good pointer must fail.");
  assert.match(output(danglingPrevious), /must name an earlier checked-in publication/);

  await rm(releaseRoot, { recursive: true, force: true });
  await mkdir(releaseRoot, { recursive: true });
  const unavailableSource = runStage(
    releaseRoot,
    "pub-2099-01-02-001",
    "0".repeat(40)
  );
  assert.equal(unavailableSource.status, 0, output(unavailableSource));
  const unavailableSourceVerified = runVerifier(releaseRoot);
  assert.notEqual(unavailableSourceVerified.status, 0, "An unavailable source Git commit must fail.");
  assert.match(output(unavailableSourceVerified), /is not an available Git commit/);

  console.log("[archive release verifier test] empty gate, exact tree, hashes, rollback chain, and Git provenance passed");
} finally {
  await rm(auditContainer, { recursive: true, force: true });
}
