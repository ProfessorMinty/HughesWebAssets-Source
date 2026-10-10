import assert from "node:assert/strict";
import { createServer } from "node:http";
import { mkdir, mkdtemp, readFile, rm, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { resolve, sep } from "node:path";
import { spawn, spawnSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const testRoot = await mkdtemp(resolve(tmpdir(), "hrv-archive-cdn-verifier-test-"));
const repositoryRoot = resolve(testRoot, "repository");
const releaseRoot = resolve(repositoryRoot, "releases/classroom-explorations-archive");
const runtimeVersion = "2099.01.03.1";
const publicationId = "pub-2099-01-03-001";
const distRoot = resolve(root, "dist/classroom-explorations-archive");
const requests = [];
let responseTamperPath = null;
let responseMissingPath = null;

const runGit = (args) => {
  const result = spawnSync("git", ["-C", repositoryRoot, ...args], { encoding: "utf8" });
  assert.equal(result.status, 0, result.stderr || result.stdout);
  return result.stdout.trim();
};
const runVerifier = (releaseCommit, extraArgs = []) => new Promise((resolveResult) => {
  const child = spawn(
    process.execPath,
    [
      resolve(root, "tools/verify-classroom-explorations-archive-cdn.mjs"),
      releaseCommit,
      runtimeVersion,
      publicationId,
      ...extraArgs
    ],
    {
      cwd: root,
      env: {
        ...process.env,
        NODE_ENV: "test",
        HRV_ARCHIVE_REPOSITORY_ROOT: repositoryRoot,
        HRV_ARCHIVE_CDN_ORIGIN: serverOrigin
      }
    }
  );
  let stdout = "";
  let stderr = "";
  child.stdout.on("data", (chunk) => { stdout += chunk; });
  child.stderr.on("data", (chunk) => { stderr += chunk; });
  child.on("close", (status) => resolveResult({ status, stdout, stderr }));
});

await mkdir(repositoryRoot, { recursive: true });
await writeFile(resolve(repositoryRoot, "source.txt"), "archive source checkpoint\n", "utf8");
runGit(["init"]);
runGit(["config", "user.name", "Archive CDN Test"]);
runGit(["config", "user.email", "archive-cdn-test@example.invalid"]);
runGit(["add", "source.txt"]);
runGit(["commit", "-m", "test: source checkpoint"]);
const sourceRevision = runGit(["rev-parse", "HEAD"]);

const staged = spawnSync(
  process.execPath,
  [
    resolve(root, "tools/stage-classroom-explorations-archive-publication.mjs"),
    runtimeVersion,
    publicationId,
    sourceRevision,
    "none"
  ],
  {
    cwd: root,
    env: {
      ...process.env,
      HRV_ARCHIVE_DIST_ROOT: distRoot,
      HRV_ARCHIVE_RELEASE_ROOT: releaseRoot
    },
    encoding: "utf8"
  }
);
assert.equal(staged.status, 0, staged.stderr || staged.stdout);
runGit(["add", "releases/classroom-explorations-archive"]);
runGit(["commit", "-m", "test: immutable archive release"]);
const releaseCommit = runGit(["rev-parse", "HEAD"]);

const expectedRequestPrefix =
  `/gh/ProfessorMinty/HughesWebAssets-Source@${releaseCommit}/releases/classroom-explorations-archive/`;
const server = createServer(async (request, response) => {
  requests.push({ method: request.method, url: request.url });
  if (request.method !== "GET") {
    response.writeHead(405);
    response.end("GET required");
    return;
  }
  const pathname = new URL(request.url, "http://127.0.0.1").pathname;
  if (!pathname.startsWith(expectedRequestPrefix)) {
    response.writeHead(404);
    response.end("wrong immutable path");
    return;
  }
  const relativePath = pathname.slice(expectedRequestPrefix.length);
  if (relativePath === responseMissingPath) {
    response.writeHead(404);
    response.end("missing");
    return;
  }
  const absolutePath = resolve(releaseRoot, relativePath.replaceAll("/", sep));
  if (!absolutePath.startsWith(`${releaseRoot}${sep}`)) {
    response.writeHead(400);
    response.end("invalid path");
    return;
  }
  try {
    let bytes = await readFile(absolutePath);
    if (relativePath === responseTamperPath) bytes = Buffer.from("tampered CDN response", "utf8");
    response.writeHead(200, { "content-length": bytes.length });
    response.end(bytes);
  } catch (error) {
    response.writeHead(error.code === "ENOENT" ? 404 : 500);
    response.end(error.message);
  }
});
await new Promise((resolveListening) => server.listen(0, "127.0.0.1", resolveListening));
const address = server.address();
const serverOrigin = `http://127.0.0.1:${address.port}`;

try {
  const evidencePath = resolve(testRoot, "evidence", "archive-cdn.json");
  requests.length = 0;
  const success = await runVerifier(releaseCommit, ["--output", evidencePath]);
  assert.equal(success.status, 0, success.stderr || success.stdout);
  const evidenceText = await readFile(evidencePath, "utf8");
  assert.equal(evidenceText, success.stdout, "File and stdout evidence must be byte-identical.");
  const evidence = JSON.parse(evidenceText);
  assert.equal(evidence.releaseCommit, releaseCommit);
  assert.equal(evidence.fileCount, 14);
  assert.equal(evidence.files.length, 14);
  assert.equal(evidence.requestMethod, "GET");
  assert.equal(requests.length, 14, "Successful verification must GET all 14 immutable files.");
  assert.deepEqual(new Set(requests.map((request) => request.method)), new Set(["GET"]));

  responseTamperPath = `runtime/${runtimeVersion}/archive.css`;
  const tampered = await runVerifier(releaseCommit);
  assert.notEqual(tampered.status, 0, "Tampered CDN bytes must fail verification.");
  assert.match(tampered.stderr + tampered.stdout, /CDN byte mismatch.*archive\.css/);
  responseTamperPath = null;

  responseMissingPath = `runtime/${runtimeVersion}/archive.css`;
  const missing = await runVerifier(releaseCommit);
  assert.notEqual(missing.status, 0, "A missing CDN file must fail verification.");
  assert.match(missing.stderr + missing.stdout, /returned HTTP 404; expected 200/);
  responseMissingPath = null;

  const abbreviated = await runVerifier(releaseCommit.slice(0, 12));
  assert.notEqual(abbreviated.status, 0, "An abbreviated release ref must fail before network access.");
  assert.match(abbreviated.stderr + abbreviated.stdout, /exact lowercase 40-character Git commit SHA/);

  console.log("[archive CDN verifier test] 14 GETs, exact bytes, evidence, tamper, missing file, and immutable-ref rejection passed");
} finally {
  await new Promise((resolveClose, rejectClose) => server.close((error) => (
    error ? rejectClose(error) : resolveClose()
  )));
  await rm(testRoot, { recursive: true, force: true });
}
