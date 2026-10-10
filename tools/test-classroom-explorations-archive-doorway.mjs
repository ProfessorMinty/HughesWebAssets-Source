import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { mkdtemp, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve } from "node:path";
import { promisify } from "node:util";
import { fileURLToPath } from "node:url";
import {
  DEFAULT_DOORWAY_ROOT,
  PAGE_ID,
  PAGE_TYPE,
  validatePreservationRecord
} from "./lib/classroom-explorations-archive-doorway.mjs";

const execFileAsync = promisify(execFile);
const repositoryRoot = fileURLToPath(new URL("..", import.meta.url));
const generator = resolve(repositoryRoot, "tools/generate-classroom-explorations-archive-doorway.mjs");
const verifier = resolve(repositoryRoot, "tools/verify-classroom-explorations-archive-doorway.mjs");
const runtimeVersion = "2026.09.12.1";
const publicationId = "pub-2026-09-12-001";
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

const run = async (file, args, options = {}) => execFileAsync(
  file,
  args,
  { cwd: options.cwd || repositoryRoot, env: options.env || process.env, encoding: "utf8", maxBuffer: 16 * 1024 * 1024 }
);
const expectFailure = async (promise, pattern) => {
  let error;
  try {
    await promise;
  } catch (caught) {
    error = caught;
  }
  assert(error, "Expected command to fail.");
  assert.match(`${error.stderr || ""}\n${error.message || ""}`, pattern);
};
const write = async (path, contents) => {
  await mkdir(resolve(path, ".."), { recursive: true });
  await writeFile(path, contents);
};

await validatePreservationRecord(
  resolve(DEFAULT_DOORWAY_ROOT, "PRE-INSTALL-PRESERVATION.json"),
  repositoryRoot,
  false
);

const sourceStateRoot = await mkdtemp(resolve(tmpdir(), "hrv-archive-doorway-source-test-"));
try {
  for (const name of [
    "HTML-BOX.html",
    "CSS-BOX.css",
    "JAVASCRIPT-BOX.template.js"
  ]) {
    await write(
      resolve(sourceStateRoot, name),
      await readFile(resolve(DEFAULT_DOORWAY_ROOT, name))
    );
  }
  const pendingPreservation = JSON.parse(await readFile(
    resolve(DEFAULT_DOORWAY_ROOT, "PRE-INSTALL-PRESERVATION.json"),
    "utf8"
  ));
  pendingPreservation.authenticatedEditorFields.status = "pending-authenticated-export";
  for (const field of Object.values(pendingPreservation.authenticatedEditorFields.fields)) {
    field.bytes = null;
    field.sha256 = null;
  }
  pendingPreservation.installationGate =
    "blocked-until-authenticated-editor-fields-are-exported-and-hashed";
  await write(
    resolve(sourceStateRoot, "PRE-INSTALL-PRESERVATION.json"),
    `${JSON.stringify(pendingPreservation, null, 2)}\n`
  );
  const sourceStateEnvironment = {
    ...process.env,
    HRV_ARCHIVE_DOORWAY_TEMPLATE_ROOT: sourceStateRoot,
    HRV_ARCHIVE_DOORWAY_OUTPUT_ROOT: sourceStateRoot
  };
  await run(process.execPath, [verifier], { env: sourceStateEnvironment });
  await expectFailure(
    run(process.execPath, [verifier, "--require-final"], { env: sourceStateEnvironment }),
    /has not been generated from an immutable asset commit/
  );
  await expectFailure(
    run(process.execPath, [verifier, "--require-editor-preservation"], { env: sourceStateEnvironment }),
    /authenticated editor-field preservation is not complete/
  );
} finally {
  await rm(sourceStateRoot, { recursive: true, force: true });
}

const temporaryRoot = await mkdtemp(resolve(tmpdir(), "hrv-archive-doorway-test-"));
try {
  const gitRoot = resolve(temporaryRoot, "repository");
  const releaseRoot = resolve(gitRoot, "releases/classroom-explorations-archive");
  const runtimeRoot = resolve(releaseRoot, "runtime", runtimeVersion);
  const contentHash = "c".repeat(64);
  const contentPath = resolve(releaseRoot, "content", contentHash, "manifest.json");
  const publicationPath = resolve(releaseRoot, "publications", publicationId, "publication.json");
  const outputRoot = resolve(temporaryRoot, "doorway");
  await mkdir(runtimeRoot, { recursive: true });

  const runtimeFiles = new Map([
    ["bootstrap.js", Buffer.from("(() => { window.__archiveBootstrapTest = true; })();\n")],
    ["runtime.js", Buffer.from("export function mountClassroomExplorationsArchive() {}\n")],
    ["archive.css", Buffer.from(".archive-test { display: block; }\n")],
    ["host-compat.css", Buffer.from("body.page-id-2627 .archive-test { width: 100%; }\n")],
    ["assets/history/past-years.webp", Buffer.from([1, 2, 3, 4])],
    ["assets/frame/top-left.webp", Buffer.from([5, 6, 7])],
    ["assets/frame/top-right.webp", Buffer.from([8, 9, 10])],
    ["assets/frame/middle-left.webp", Buffer.from([11, 12, 13])],
    ["assets/frame/middle-right.webp", Buffer.from([14, 15, 16])],
    ["assets/frame/bottom-left.webp", Buffer.from([17, 18, 19])],
    ["assets/frame/bottom-right.webp", Buffer.from([20, 21, 22])]
  ]);
  for (const [path, bytes] of runtimeFiles) await write(resolve(runtimeRoot, path), bytes);
  const contentBytes = Buffer.from(`${JSON.stringify({ runtimeSchemaVersion: "1.0", snapshotId: `sha256:${contentHash}`, page: { id: PAGE_ID, type: PAGE_TYPE } }, null, 2)}\n`);
  await write(contentPath, contentBytes);

  const entry = (path, bytes) => ({ path, sha256: digest(bytes) });
  const artwork = {};
  const artworkPaths = {
    pastYears: "assets/history/past-years.webp",
    frameTopLeft: "assets/frame/top-left.webp",
    frameTopRight: "assets/frame/top-right.webp",
    frameMiddleLeft: "assets/frame/middle-left.webp",
    frameMiddleRight: "assets/frame/middle-right.webp",
    frameBottomLeft: "assets/frame/bottom-left.webp",
    frameBottomRight: "assets/frame/bottom-right.webp"
  };
  for (const [name, path] of Object.entries(artworkPaths)) {
    artwork[name] = { ...entry(`../../runtime/${runtimeVersion}/${path}`, runtimeFiles.get(path)), mediaType: "image/webp" };
  }
  const publication = {
    schemaVersion: "1.0",
    publicationId,
    pageId: PAGE_ID,
    pageType: PAGE_TYPE,
    sourceRevision: "a".repeat(40),
    previousKnownGoodPublication: null,
    runtime: {
      version: runtimeVersion,
      runtimeSchemaVersion: "1.0",
      bootstrap: entry(`../../runtime/${runtimeVersion}/bootstrap.js`, runtimeFiles.get("bootstrap.js")),
      script: entry(`../../runtime/${runtimeVersion}/runtime.js`, runtimeFiles.get("runtime.js")),
      style: entry(`../../runtime/${runtimeVersion}/archive.css`, runtimeFiles.get("archive.css")),
      hostCompat: entry(`../../runtime/${runtimeVersion}/host-compat.css`, runtimeFiles.get("host-compat.css")),
      artwork
    },
    content: {
      snapshotId: `sha256:${contentHash}`,
      runtimeSchemaVersion: "1.0",
      manifest: entry(`../../content/${contentHash}/manifest.json`, contentBytes)
    }
  };
  await write(publicationPath, `${JSON.stringify(publication, null, 2)}\n`);

  await run("git", ["init", "--quiet"], { cwd: gitRoot });
  await run("git", ["add", "releases"], { cwd: gitRoot });
  await run("git", ["-c", "user.name=Archive Doorway Test", "-c", "user.email=archive-doorway@example.invalid", "commit", "--quiet", "-m", "test fixture"], { cwd: gitRoot });
  const { stdout: revisionOutput } = await run("git", ["rev-parse", "HEAD"], { cwd: gitRoot });
  const assetCommit = revisionOutput.trim();
  const environment = {
    ...process.env,
    HRV_ARCHIVE_GIT_ROOT: gitRoot,
    HRV_ARCHIVE_RELEASE_ROOT: releaseRoot,
    HRV_ARCHIVE_DOORWAY_TEMPLATE_ROOT: DEFAULT_DOORWAY_ROOT,
    HRV_ARCHIVE_DOORWAY_OUTPUT_ROOT: outputRoot
  };

  await run(process.execPath, [generator, runtimeVersion, publicationId, assetCommit], { env: environment });
  await run(process.execPath, [verifier, "--require-final"], { env: environment });
  const first = await Promise.all([
    readFile(resolve(outputRoot, "HTML-BOX.html")),
    readFile(resolve(outputRoot, "CSS-BOX.css")),
    readFile(resolve(outputRoot, "JAVASCRIPT-BOX.js")),
    readFile(resolve(outputRoot, "RELEASE-PIN.json"))
  ]);
  await run(process.execPath, [generator, runtimeVersion, publicationId, assetCommit], { env: environment });
  const second = await Promise.all([
    readFile(resolve(outputRoot, "HTML-BOX.html")),
    readFile(resolve(outputRoot, "CSS-BOX.css")),
    readFile(resolve(outputRoot, "JAVASCRIPT-BOX.js")),
    readFile(resolve(outputRoot, "RELEASE-PIN.json"))
  ]);
  assert.deepEqual(second, first, "Doorway generation must be byte-deterministic.");

  const javascript = first[2].toString("utf8");
  const pin = JSON.parse(first[3].toString("utf8"));
  assert(javascript.includes(assetCommit));
  assert(javascript.includes(runtimeVersion));
  assert(javascript.includes(publicationId));
  assert(!javascript.includes("__ASSET_COMMIT__"));
  assert.match(pin.release.bootstrap.sri, /^sha256-[A-Za-z0-9+/]{43}=$/);
  assert.equal(pin.verifiedReleaseFiles.length, 13);
  assert(pin.verifiedReleaseFiles.every((file) => file.cdnUrl.includes(`@${assetCommit}/`)));

  await write(resolve(outputRoot, "JAVASCRIPT-BOX.js"), `${javascript}\n// drift\n`);
  await expectFailure(
    run(process.execPath, [verifier, "--require-final"], { env: environment }),
    /JavaScript drifted/
  );
  await expectFailure(
    run(process.execPath, [generator, runtimeVersion, publicationId, assetCommit], { env: environment }),
    /without --replace/
  );
  await run(process.execPath, [generator, runtimeVersion, publicationId, assetCommit, "--replace"], { env: environment });
  await run(process.execPath, [verifier, "--require-final"], { env: environment });

  const { stdout: fixtureTreeOutput } = await run("git", ["rev-parse", "HEAD^{tree}"], { cwd: gitRoot });
  const { stdout: unrelatedCommitOutput } = await run(
    "git",
    [
      "-c",
      "user.name=Archive Doorway Test",
      "-c",
      "user.email=archive-doorway@example.invalid",
      "commit-tree",
      fixtureTreeOutput.trim(),
      "-m",
      "unrelated doorway fixture"
    ],
    { cwd: gitRoot }
  );
  await expectFailure(
    run(
      process.execPath,
      [generator, runtimeVersion, publicationId, unrelatedCommitOutput.trim(), "--replace"],
      { env: environment }
    ),
    /assetCommit must be an ancestor/
  );

  await write(resolve(runtimeRoot, "bootstrap.js"), Buffer.from("// local tamper\n"));
  await expectFailure(
    run(process.execPath, [generator, runtimeVersion, publicationId, assetCommit, "--replace"], { env: environment }),
    /Local runtime\.bootstrap differs from the exact bytes in assetCommit/
  );
  await expectFailure(
    run(process.execPath, [generator, runtimeVersion, publicationId, "main"], { env: environment }),
    /full lowercase 40-character Git commit SHA/
  );
} finally {
  await rm(temporaryRoot, { recursive: true, force: true });
}

console.log("[archive-doorway] template, preservation, deterministic generation, ancestry, commit binding, tamper, and replacement tests passed.");
