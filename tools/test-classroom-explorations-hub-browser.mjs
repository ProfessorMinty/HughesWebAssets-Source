import assert from "node:assert/strict";
import { spawn } from "node:child_process";
import { createHash } from "node:crypto";
import { existsSync } from "node:fs";
import { mkdir, mkdtemp, readFile, rename, rm, writeFile } from "node:fs/promises";
import { createServer } from "node:http";
import { tmpdir } from "node:os";
import { basename, dirname, extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";
import { canonicalJson, projectHubRuntime } from "./lib/classroom-explorations-hub-contract.mjs";
import { historicalGalleryFixture, assertCanonicalCurrentYearCollections } from './lib/classroom-explorations-hub-test-fixtures.mjs';

const root = fileURLToPath(new URL("..", import.meta.url));
const verifierPath = fileURLToPath(import.meta.url);
const dist = resolve(root, "dist/classroom-explorations-hub");
const publicationPath = resolve(dist, "preview-publication.json");
const previewPath = resolve(dist, "preview.html");
const presentationRubric = {
  id: "hrv-presentation-policy:classroom-explorations-hub",
  version: "2026-09-12.1",
  path: "docs/classroom-explorations-hub-manifest-authoring-rubric.md",
  bindingStatus: "documented-local-preview-profile; machine-readable publication binding pending"
};
const renderingTolerances = {
  containmentPixels: 1,
  equalDoorDeltaPixels: 1.5,
  minimumTargetCssPixels: 44,
  targetRenderingTolerancePixels: 1
};
const evidenceFlag = process.argv.indexOf("--evidence-dir");
const evidenceInput = evidenceFlag >= 0
  ? process.argv[evidenceFlag + 1]
  : process.env.HUB_BROWSER_EVIDENCE_DIR;
const evidenceDir = evidenceInput ? resolve(process.cwd(), evidenceInput) : null;
const requireScreenshotMediaLoad = process.argv.includes("--require-screenshot-media-load");

assert.ok(existsSync(previewPath), "Build the Hub preview before running the browser geometry test.");
assert.ok(evidenceFlag < 0 || process.argv[evidenceFlag + 1], "--evidence-dir requires a path.");
assert.ok(
  !requireScreenshotMediaLoad || evidenceDir,
  "--require-screenshot-media-load requires --evidence-dir."
);

const publication = JSON.parse(await readFile(publicationPath, "utf8"));
const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
const sha256File = async (path) => sha256(await readFile(path));
const resolveDeclaredPath = (base, declaredPath, label) => {
  assert.equal(typeof declaredPath, "string", `${label} must declare a path.`);
  const resolved = resolve(base, declaredPath.replace(/^\.\//, ""));
  assert.ok(
    resolved.startsWith(`${base}${sep}`),
    `${label} must resolve inside ${base}.`
  );
  return resolved;
};

async function verifyFreshPreviewBuild() {
  const sourceRoot = resolve(root, "apps/classroom-explorations-hub/src");
  const runtimeRoot = resolve(dist, "runtime");
  const runtimeRelease = JSON.parse(
    await readFile(resolve(runtimeRoot, "runtime-release.json"), "utf8")
  );
  const runtimeSources = {
    bootstrap: "bootstrap.js",
    script: "runtime.js",
    style: "hub.css",
    hostCompat: "host-compat.css"
  };
  const expectedArtwork = {
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
  const verifiedRuntimeSources = {};

  assert.deepEqual(
    Object.keys(runtimeRelease.assets || {}).sort(),
    Object.keys(runtimeSources).sort(),
    "Stale Hub runtime-release runtime asset key set."
  );
  assert.deepEqual(
    Object.keys(runtimeRelease.artwork || {}).sort(),
    Object.keys(expectedArtwork).sort(),
    "Stale Hub runtime-release artwork key set."
  );
  assert.deepEqual(
    Object.keys(publication.runtime?.artwork || {}).sort(),
    Object.keys(expectedArtwork).sort(),
    "Stale Hub preview-publication artwork key set."
  );

  for (const [key, relativePath] of Object.entries(runtimeSources)) {
    const releaseEntry = runtimeRelease.assets?.[key];
    const publicationEntry = publication.runtime?.[key];
    assert.equal(releaseEntry?.path, relativePath, `Unexpected runtime-release path for ${key}.`);
    assert.equal(publicationEntry?.path, `./runtime/${relativePath}`, `Unexpected preview-publication path for ${key}.`);
    const sourceHash = await sha256File(resolve(sourceRoot, relativePath));
    const releasePath = resolveDeclaredPath(runtimeRoot, releaseEntry.path, `runtime-release ${key}`);
    const publicationAssetPath = resolveDeclaredPath(dist, publicationEntry.path, `preview-publication ${key}`);
    const releaseBytesHash = await sha256File(releasePath);
    const publicationBytesHash = await sha256File(publicationAssetPath);
    assert.equal(
      releaseBytesHash,
      sourceHash,
      `Stale Hub preview: dist/runtime/${relativePath} does not match its current source.`
    );
    assert.equal(publicationBytesHash, sourceHash, `Stale Hub preview-publication bytes for ${relativePath}.`);
    assert.equal(releaseEntry.sha256, sourceHash, `Stale Hub runtime-release hash for ${relativePath}.`);
    assert.equal(publicationEntry.sha256, sourceHash, `Stale Hub preview-publication hash for ${relativePath}.`);
    verifiedRuntimeSources[key] = sourceHash;
  }

  const verifiedArtwork = {};
  for (const [key, expectation] of Object.entries(expectedArtwork)) {
    const entry = runtimeRelease.artwork[key];
    const publicationEntry = publication.runtime.artwork[key];
    assert.equal(entry.path, expectation.path, `Unexpected runtime-release artwork path for ${key}.`);
    assert.equal(entry.mediaType, expectation.mediaType, `Unexpected runtime-release artwork media type for ${key}.`);
    assert.equal(publicationEntry.path, `./runtime/${expectation.path}`, `Unexpected preview-publication artwork path for ${key}.`);
    assert.equal(publicationEntry.mediaType, expectation.mediaType, `Unexpected preview-publication artwork media type for ${key}.`);
    const sourceHash = await sha256File(resolve(sourceRoot, expectation.path));
    const releaseBytesHash = await sha256File(
      resolveDeclaredPath(runtimeRoot, entry.path, `runtime-release artwork ${key}`)
    );
    const publicationBytesHash = await sha256File(
      resolveDeclaredPath(dist, publicationEntry.path, `preview-publication artwork ${key}`)
    );
    assert.equal(
      releaseBytesHash,
      sourceHash,
      `Stale Hub preview artwork: dist/runtime/${entry.path} does not match its current source.`
    );
    assert.equal(publicationBytesHash, sourceHash, `Stale Hub preview-publication artwork bytes for ${entry.path}.`);
    assert.equal(entry.sha256, sourceHash, `Stale Hub runtime-release artwork hash for ${entry.path}.`);
    assert.equal(publicationEntry.sha256, sourceHash, `Stale Hub preview-publication artwork hash for ${entry.path}.`);
    verifiedArtwork[key] = sourceHash;
  }

  const sourcePath = resolve(root, "apps/classroom-explorations-hub/source/hub.source.json");
  const routesPath = resolve(root, "registry/hrv-routes.source.json");
  const controlPath = resolve(root, "apps/classroom-explorations-hub/source/hub.control.json");
  const [sourceBytes, routesBytes, controlBytes] = await Promise.all([
    readFile(sourcePath),
    readFile(routesPath),
    readFile(controlPath)
  ]);
  const source = JSON.parse(sourceBytes.toString("utf8"));
  const routes = JSON.parse(routesBytes.toString("utf8"));
  const control = JSON.parse(controlBytes.toString("utf8"));
  const projected = projectHubRuntime(source, routes);
  const projectedBytes = Buffer.from(`${JSON.stringify(projected, null, 2)}\n`, "utf8");
  const projectedHash = projected.snapshotId.slice("sha256:".length);
  assert.equal(
    publication.content.manifest.path,
    `./content/${projectedHash}/manifest.json`,
    "Stale Hub preview-publication content manifest path."
  );
  const manifestPath = resolveDeclaredPath(
    dist,
    publication.content.manifest.path,
    "preview-publication content manifest"
  );
  const builtManifestBytes = await readFile(manifestPath);
  assert.deepEqual(
    builtManifestBytes,
    projectedBytes,
    "Stale Hub preview: built runtime manifest does not match the current source projection."
  );
  assert.equal(
    publication.content.snapshotId,
    projected.snapshotId,
    "Stale Hub preview-publication content snapshot."
  );
  assert.equal(
    publication.content.manifest.sha256,
    sha256(projectedBytes),
    "Stale Hub preview-publication manifest hash."
  );

  const expectedPreviewBytes = Buffer.from(
    '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Classroom Explorations Preview</title><style>html{font-size:10px}body{margin:0;font-size:20px}</style></head><body><section id="hrv-classroom-explorations-root"><div class="hrv-page-unavailable"><h1>Classroom Explorations</h1><p data-hrv-fallback-status>Loading local museum preview…</p></div></section><script src="./runtime/bootstrap.js" data-mount="hrv-classroom-explorations-root" data-publication="./preview-publication.json"></script></body></html>',
    "utf8"
  );
  const previewBytes = await readFile(previewPath);
  assert.deepEqual(previewBytes, expectedPreviewBytes, "Stale or unexpected generated Hub preview wrapper.");

  return {
    projectionSnapshotId: projected.snapshotId,
    projectionManifestSha256: sha256(projectedBytes),
    verifier: {
      path: "tools/test-classroom-explorations-hub-browser.mjs",
      sha256: await sha256File(verifierPath)
    },
    canonicalTransactionRevisions: {
      algorithm: "sha256-canonical-json-v1",
      authoringSha256: sha256(Buffer.from(canonicalJson(source), "utf8")),
      routesSha256: sha256(Buffer.from(canonicalJson(routes), "utf8")),
      controlSha256: sha256(Buffer.from(canonicalJson(control), "utf8"))
    },
    rawDocumentBytes: {
      authoring: { byteLength: sourceBytes.length, sha256: sha256(sourceBytes) },
      routes: { byteLength: routesBytes.length, sha256: sha256(routesBytes) },
      control: { byteLength: controlBytes.length, sha256: sha256(controlBytes) }
    },
    runtimeSources: verifiedRuntimeSources,
    artwork: verifiedArtwork,
    previewHtmlSha256: sha256(previewBytes)
  };
}

const buildFreshness = await verifyFreshPreviewBuild();
const canonicalSource = JSON.parse(await readFile(resolve(root, 'apps/classroom-explorations-hub/source/hub.source.json'), 'utf8'));
const canonicalRoutes = JSON.parse(await readFile(resolve(root, 'registry/hrv-routes.source.json'), 'utf8'));
assertCanonicalCurrentYearCollections(canonicalSource, canonicalRoutes);
const historicalTestGalleries = projectHubRuntime(historicalGalleryFixture(canonicalSource), canonicalRoutes).galleries;
let evidenceStagingDir = null;
if (evidenceDir) {
  await mkdir(dirname(evidenceDir), { recursive: true });
  evidenceStagingDir = await mkdtemp(
    resolve(dirname(evidenceDir), `.${basename(evidenceDir)}-pending-`)
  );
}
const manifestUrlPath = `/${publication.content.manifest.path.replace(/^\.\//, "")}`;
const runtimeArtwork = Object.fromEntries(
  Object.entries(publication.runtime.artwork).map(([key, value]) => [
    key,
    `/${value.path.replace(/^\.\//, "")}`
  ])
);

const mimeTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".webp": "image/webp"
};

function fixtureHtml() {
  return `<!doctype html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width,initial-scale=1">
  <title>Classroom Explorations browser fixture</title>
  <link rel="stylesheet" href="/runtime/hub.css">
  <link rel="stylesheet" href="/runtime/host-compat.css">
  <style>html{font-size:10px}body{margin:0;font-size:20px}</style>
</head>
<body>
  <button id="fixture-host-control" type="button">Fixture host control</button>
  <section id="hrv-classroom-explorations-root" aria-busy="true"></section>
  <script type="module">
    const root = document.getElementById("hrv-classroom-explorations-root");
    try {
      const params = new URLSearchParams(location.search);
      const mode = params.get("mode") || "default";
      if (params.get("dialog") === "fallback") {
        Object.defineProperty(HTMLDialogElement.prototype, "showModal", {
          configurable: true,
          value: undefined
        });
      }
      const manifest = await fetch(${JSON.stringify(manifestUrlPath)}).then((response) => {
        if (!response.ok) throw new Error("Fixture manifest fetch failed");
        return response.json();
      });

      if (mode !== "default") {
        manifest.current.featuredMedia.embedUrl = "";
        if (manifest.current.exploration.image) {
          manifest.current.exploration.image.src = ${JSON.stringify(runtimeArtwork.frameTopLeft)};
        }
      }

      if (mode === "historical-collections" || params.get("dialog") === "fallback") {
        manifest.galleries = structuredClone(${JSON.stringify(historicalTestGalleries)});
      }
      if (mode === "published-twwl" || mode === "published-twwl-no-image") {
        const content = structuredClone(${JSON.stringify(historicalTestGalleries.pastTwwl[0])});
        if (content.image) content.image.src = ${JSON.stringify(runtimeArtwork.pastTwwl)};
        if (mode === "published-twwl-no-image") delete content.image;
        manifest.current.twwl = {
          id: "hub-slot:current-twwl",
          state: "published",
          content
        };
        manifest.galleries.pastTwwl = ${JSON.stringify(historicalTestGalleries.pastTwwl.slice(1))};
      }

      if (mode === "empty-collections") {
        manifest.galleries.pastExplorations = [];
        manifest.galleries.pastTwwl = [];
        manifest.archives = [];
      }

      if (mode === "media-unavailable") {
        delete manifest.current.exploration.image;
      }

      const { mountClassroomExplorationsHub } = await import("/runtime/runtime.js");
      mountClassroomExplorationsHub(root, manifest, {
        artwork: ${JSON.stringify(runtimeArtwork)}
      });
    } catch (error) {
      root.dataset.hrvState = "fixture-error";
      root.textContent = error instanceof Error ? error.message : String(error);
    }
  </script>
</body>
</html>`;
}

function slowPreviewHtml() {
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Slow Hub preview</title><style>html{font-size:10px}body{margin:0;font-size:20px}</style></head><body><section id="hrv-classroom-explorations-root"><div class="hrv-page-unavailable"><h1>Classroom Explorations</h1><p data-hrv-fallback-status>Loading Classroom Explorations…</p></div></section><script src="/runtime/bootstrap.js" data-mount="hrv-classroom-explorations-root" data-publication="/slow-publication.json"></script></body></html>`;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", "http://127.0.0.1");
    if (requestUrl.pathname === "/fixture.html") {
      response.writeHead(200, { "content-type": mimeTypes[".html"] });
      response.end(fixtureHtml());
      return;
    }
    if (requestUrl.pathname === "/slow-preview.html") {
      response.writeHead(200, { "content-type": mimeTypes[".html"] });
      response.end(slowPreviewHtml());
      return;
    }
    if (requestUrl.pathname === "/slow-publication.json") {
      await new Promise((accept) => setTimeout(accept, 650));
      response.writeHead(200, { "content-type": mimeTypes[".json"] });
      response.end(await readFile(publicationPath));
      return;
    }
    if (requestUrl.pathname === "/favicon.ico") {
      response.writeHead(204).end();
      return;
    }

    const relative = decodeURIComponent(requestUrl.pathname === "/" ? "/preview.html" : requestUrl.pathname)
      .replace(/^\/+/, "");
    const filePath = resolve(dist, relative);
    if (filePath !== dist && !filePath.startsWith(`${dist}${sep}`)) {
      response.writeHead(403).end("Forbidden");
      return;
    }
    const bytes = await readFile(filePath);
    response.writeHead(200, {
      "cache-control": "no-store",
      "content-type": mimeTypes[extname(filePath).toLowerCase()] || "application/octet-stream"
    });
    response.end(bytes);
  } catch {
    response.writeHead(404).end("Not found");
  }
});

await new Promise((accept, reject) => {
  server.once("error", reject);
  server.listen(0, "127.0.0.1", accept);
});
const address = server.address();
assert.ok(address && typeof address !== "string");
const baseUrl = `http://127.0.0.1:${address.port}`;

function findChrome() {
  const candidates = [
    process.env.HUB_CHROME_PATH,
    process.platform === "win32" && process.env.PROGRAMFILES
      ? resolve(process.env.PROGRAMFILES, "Google/Chrome/Application/chrome.exe")
      : null,
    process.platform === "win32" && process.env["PROGRAMFILES(X86)"]
      ? resolve(process.env["PROGRAMFILES(X86)"], "Google/Chrome/Application/chrome.exe")
      : null,
    process.platform === "win32" && process.env.LOCALAPPDATA
      ? resolve(process.env.LOCALAPPDATA, "Google/Chrome/Application/chrome.exe")
      : null,
    process.platform === "darwin" ? "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome" : null,
    "/usr/bin/google-chrome",
    "/usr/bin/google-chrome-stable",
    "/usr/bin/chromium",
    "/usr/bin/chromium-browser"
  ].filter(Boolean);
  return candidates.find((candidate) => existsSync(candidate));
}

class CdpClient {
  static async connect(url) {
    const socket = new WebSocket(url);
    await new Promise((accept, reject) => {
      socket.addEventListener("open", accept, { once: true });
      socket.addEventListener("error", reject, { once: true });
    });
    return new CdpClient(socket);
  }

  constructor(socket) {
    this.socket = socket;
    this.nextId = 1;
    this.pending = new Map();
    this.eventListeners = new Map();
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (message.id && this.pending.has(message.id)) {
        const { accept, reject } = this.pending.get(message.id);
        this.pending.delete(message.id);
        if (message.error) reject(new Error(`${message.error.code}: ${message.error.message}`));
        else accept(message.result);
        return;
      }
      if (!message.method) return;
      for (const listener of this.eventListeners.get(message.method) || []) {
        listener(message.params || {});
      }
    });
    socket.addEventListener("close", () => {
      for (const { reject } of this.pending.values()) reject(new Error("Chrome DevTools connection closed."));
      this.pending.clear();
    });
  }

  call(method, params = {}) {
    const id = this.nextId++;
    return new Promise((accept, reject) => {
      this.pending.set(id, { accept, reject });
      this.socket.send(JSON.stringify({ id, method, params }));
    });
  }

  on(method, listener) {
    if (!this.eventListeners.has(method)) this.eventListeners.set(method, new Set());
    this.eventListeners.get(method).add(listener);
    return () => this.eventListeners.get(method)?.delete(listener);
  }

  close() {
    this.eventListeners.clear();
    this.socket.close();
  }
}

async function waitForValue(client, expression, label, timeoutMs = 10_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const result = await client.call("Runtime.evaluate", {
      expression,
      returnByValue: true,
      awaitPromise: true
    });
    if (result.exceptionDetails) {
      throw new Error(`${label}: ${result.exceptionDetails.text || "browser evaluation failed"}`);
    }
    if (result.result.value) return result.result.value;
    await new Promise((accept) => setTimeout(accept, 40));
  }
  throw new Error(`Timed out waiting for ${label}.`);
}

async function evaluate(client, expression) {
  const result = await client.call("Runtime.evaluate", {
    expression,
    returnByValue: true,
    awaitPromise: true
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  }
  return result.result.value;
}

async function navigateReady(client, url) {
  await client.call("Page.navigate", { url });
  await waitForValue(
    client,
    `document.querySelector("#hrv-classroom-explorations-root")?.dataset.hrvState === "ready"`,
    `Hub ready at ${url}`
  );
}

async function dispatchBrowserAccelerator(client, accelerator) {
  const event = {
    modifiers: accelerator.modifiers,
    key: accelerator.key,
    code: accelerator.code,
    windowsVirtualKeyCode: accelerator.virtualKeyCode,
    nativeVirtualKeyCode: accelerator.virtualKeyCode
  };
  await client.call("Input.dispatchKeyEvent", { type: "rawKeyDown", ...event });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", ...event });
}

async function dispatchTab(client, shiftKey = false) {
  const event = {
    key: "Tab",
    code: "Tab",
    windowsVirtualKeyCode: 9,
    nativeVirtualKeyCode: 9,
    modifiers: shiftKey ? 8 : 0
  };
  await client.call("Input.dispatchKeyEvent", { type: "rawKeyDown", ...event });
  await client.call("Input.dispatchKeyEvent", { type: "keyUp", ...event });
}

async function waitForNativeZoom(client, expected, label, timeoutMs = 3_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    const metrics = await client.call("Page.getLayoutMetrics");
    const actual = metrics.cssVisualViewport?.zoom;
    if (typeof actual === "number" && Math.abs(actual - expected) <= 0.011) return actual;
    await new Promise((accept) => setTimeout(accept, 40));
  }
  const metrics = await client.call("Page.getLayoutMetrics");
  throw new Error(`${label}: expected native browser zoom ${expected}, got ${metrics.cssVisualViewport?.zoom}.`);
}

async function setNativeBrowserZoom(client, expected) {
  const reset = { key: "0", code: "Digit0", virtualKeyCode: 48, modifiers: 2 };
  const minus = { key: "-", code: "Minus", virtualKeyCode: 189, modifiers: 2 };
  const plus = { key: "+", code: "Equal", virtualKeyCode: 187, modifiers: 10 };
  const steps = new Map([
    [0.8, [minus, minus]],
    [1, []],
    [1.25, [plus, plus]],
    [1.5, [plus, plus, plus]],
    [2, [plus, plus, plus, plus, plus]]
  ]);
  assert.ok(steps.has(expected), `Unsupported native zoom target ${expected}.`);
  await client.call("Page.bringToFront");
  await dispatchBrowserAccelerator(client, reset);
  await waitForNativeZoom(client, 1, "native zoom reset");
  for (const accelerator of steps.get(expected)) {
    await dispatchBrowserAccelerator(client, accelerator);
  }
  return waitForNativeZoom(client, expected, `native zoom ${expected}`);
}

function pngDimensions(bytes) {
  assert.ok(bytes.length >= 24, "Captured screenshot is too short to be a PNG.");
  assert.deepEqual(
    [...bytes.subarray(0, 8)],
    [137, 80, 78, 71, 13, 10, 26, 10],
    "Captured screenshot is not a PNG."
  );
  return {
    width: bytes.readUInt32BE(16),
    height: bytes.readUInt32BE(20)
  };
}

async function replaceEvidenceDirectory(stagingDir, targetDir) {
  const backupDir = `${targetDir}.previous-${process.pid}-${Date.now()}`;
  assert.ok(!existsSync(backupDir), `Unexpected evidence backup collision at ${backupDir}.`);
  let previousMoved = false;
  try {
    if (existsSync(targetDir)) {
      await rename(targetDir, backupDir);
      previousMoved = true;
    }
    await rename(stagingDir, targetDir);
  } catch (error) {
    if (previousMoved && !existsSync(targetDir) && existsSync(backupDir)) {
      await rename(backupDir, targetDir);
    }
    throw error;
  }
  if (previousMoved) await rm(backupDir, { recursive: true, force: true });
}

const chromePath = findChrome();
assert.ok(
  chromePath,
  "Chrome or Chromium is required. Set HUB_CHROME_PATH to an installed browser executable."
);

const profileDir = await mkdtemp(resolve(tmpdir(), "hrv-hub-browser-"));
const chrome = spawn(chromePath, [
  "--headless=new",
  "--disable-background-networking",
  "--disable-component-update",
  "--disable-default-apps",
  "--disable-dev-shm-usage",
  "--disable-extensions",
  "--disable-gpu",
  "--disable-sync",
  "--metrics-recording-only",
  "--no-first-run",
  "--no-default-browser-check",
  "--no-sandbox",
  "--remote-allow-origins=*",
  "--remote-debugging-port=0",
  `--user-data-dir=${profileDir}`,
  "--window-size=1920,911",
  "about:blank"
], { stdio: ["ignore", "ignore", "pipe"] });

let devtoolsUrl;
let stderr = "";
const devtoolsReady = new Promise((accept, reject) => {
  const timer = setTimeout(() => reject(new Error(`Chrome DevTools did not start. ${stderr}`)), 15_000);
  chrome.once("error", (error) => {
    clearTimeout(timer);
    reject(error);
  });
  chrome.stderr.on("data", (chunk) => {
    stderr += chunk.toString();
    const match = stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
    if (!match) return;
    clearTimeout(timer);
    devtoolsUrl = match[1];
    accept();
  });
});

let client;
let browserVersion;
let nativeZoomCoverage = {
  status: "not-run",
  platform: process.platform,
  reason: "Native browser accelerator coverage is currently implemented for Windows Chrome."
};
const results = [];
const browserObservations = {
  runtimeExceptions: [],
  consoleErrors: [],
  logErrors: [],
  networkFailures: [],
  httpErrors: []
};
const browserObservationDrops = Object.fromEntries(
  Object.keys(browserObservations).map((key) => [key, 0])
);
const recordBrowserObservation = (category, value) => {
  if (browserObservations[category].length < 250) {
    browserObservations[category].push(value);
  } else {
    browserObservationDrops[category] += 1;
  }
};
const requestUrls = new Map();
const concise = (value, limit = 600) => String(value || "").slice(0, limit);
const remoteArgumentText = (argument) => concise(
  argument?.unserializableValue ?? argument?.value ?? argument?.description ?? argument?.type
);
const relevantLocalResourceTypes = new Set(["Document", "Fetch", "Image", "Media", "Script", "Stylesheet", "XHR"]);
let evidenceCompleted = false;
try {
  await devtoolsReady;
  const devtoolsHttp = devtoolsUrl.replace(/^ws:/, "http:").replace(/\/devtools\/browser\/.*$/, "");
  const targets = await fetch(`${devtoolsHttp}/json/list`).then((response) => response.json());
  const page = targets.find((target) => target.type === "page");
  assert.ok(page?.webSocketDebuggerUrl, "Chrome did not expose a page target.");
  client = await CdpClient.connect(page.webSocketDebuggerUrl);
  client.on("Runtime.exceptionThrown", ({ exceptionDetails = {} }) => {
    recordBrowserObservation("runtimeExceptions", {
      url: concise(exceptionDetails.url),
      lineNumber: exceptionDetails.lineNumber,
      columnNumber: exceptionDetails.columnNumber,
      text: concise(exceptionDetails.exception?.description || exceptionDetails.text)
    });
  });
  client.on("Runtime.consoleAPICalled", ({ type, args = [], stackTrace }) => {
    if (type !== "error") return;
    recordBrowserObservation("consoleErrors", {
      type,
      text: concise(args.map(remoteArgumentText).join(" ")),
      url: concise(stackTrace?.callFrames?.[0]?.url),
      lineNumber: stackTrace?.callFrames?.[0]?.lineNumber
    });
  });
  client.on("Log.entryAdded", ({ entry = {} }) => {
    if (entry.level !== "error") return;
    recordBrowserObservation("logErrors", {
      source: entry.source,
      url: concise(entry.url),
      lineNumber: entry.lineNumber,
      text: concise(entry.text)
    });
  });
  client.on("Network.requestWillBeSent", ({ requestId, request, type }) => {
    requestUrls.set(requestId, { url: concise(request?.url, 1_200), type });
  });
  client.on("Network.loadingFailed", ({ requestId, type, errorText, canceled, blockedReason }) => {
    const request = requestUrls.get(requestId) || {};
    recordBrowserObservation("networkFailures", {
      url: request.url || "",
      type: type || request.type || "",
      errorText: concise(errorText),
      canceled: Boolean(canceled),
      blockedReason: blockedReason || null
    });
  });
  client.on("Network.responseReceived", ({ response = {}, type }) => {
    if (Number(response.status) < 400) return;
    recordBrowserObservation("httpErrors", {
      url: concise(response.url, 1_200),
      type: type || "",
      status: response.status,
      statusText: concise(response.statusText)
    });
  });
  await client.call("Page.enable");
  await client.call("Runtime.enable");
  await client.call("Log.enable");
  await client.call("Network.enable");
  browserVersion = await client.call("Browser.getVersion");
  await client.call("Emulation.setEmulatedMedia", {
    features: [{ name: "prefers-reduced-motion", value: "reduce" }]
  });

  const matrix = [
    { label: "zoom-out-large", width: 2560, height: 1139, dpr: 1 },
    { label: "approved-desktop", width: 1920, height: 911, dpr: 1 },
    { label: "short-wide-boundary-pass", width: 1920, height: 821, dpr: 1 },
    { label: "short-wide-former-failure", width: 1920, height: 820, dpr: 1 },
    { label: "short-wide-boundary-low", width: 1920, height: 819, dpr: 1 },
    { label: "wide-seam-high", width: 1680, height: 911, dpr: 1.15 },
    { label: "wide-seam-low", width: 1679, height: 911, dpr: 1.15 },
    { label: "scaled-short-boundary-pass", width: 1600, height: 821, dpr: 1.2 },
    { label: "scaled-short-former-failure", width: 1600, height: 820, dpr: 1.2 },
    { label: "scaled-short-boundary-low", width: 1600, height: 819, dpr: 1.2 },
    { label: "windows-150-zoom-80", width: 1600, height: 759, dpr: 1.2 },
    { label: "desktop-floor", width: 1440, height: 900, dpr: 1.25 },
    { label: "fractional-boundary", width: 1439, height: 900, dpr: 1.25 },
    { label: "narrow-desktop", width: 1366, height: 768, dpr: 1.25 },
    { label: "stack-boundary-high", width: 1331, height: 800, dpr: 1.25 },
    { label: "stack-boundary-low", width: 1330, height: 800, dpr: 1.25 },
    { label: "nav-boundary-high", width: 1181, height: 800, dpr: 1.5 },
    { label: "nav-boundary-low", width: 1180, height: 800, dpr: 1.5 },
    { label: "compact-nav-seam-high", width: 1000, height: 800, dpr: 1.5 },
    { label: "compact-nav-seam-low", width: 999, height: 800, dpr: 1.5 },
    { label: "tablet", width: 980, height: 911, dpr: 1.5 },
    { label: "mobile-boundary-high", width: 721, height: 900, dpr: 2 },
    { label: "mobile-boundary-low", width: 720, height: 900, dpr: 2 },
    { label: "mobile-boundary-below", width: 719, height: 900, dpr: 2 },
    { label: "short-narrow-desktop", width: 1366, height: 667, dpr: 1.25 },
    { label: "phone", width: 390, height: 844, dpr: 3 },
    { label: "wcag-reflow", width: 320, height: 640, dpr: 4 }
  ];

  for (const entry of matrix) {
    await client.call("Emulation.setDeviceMetricsOverride", {
      width: entry.width,
      height: entry.height,
      deviceScaleFactor: entry.dpr,
      mobile: false,
      screenWidth: entry.width,
      screenHeight: entry.height
    });
    await navigateReady(client, `${baseUrl}/preview.html?case=${entry.label}`);
    const metrics = await evaluate(client, `(() => {
      const rect = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const box = element.getBoundingClientRect();
        return { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height };
      };
      const contains = (outerSelector, innerSelectors) => {
        const outer = rect(outerSelector);
        return Boolean(outer) && innerSelectors.every((selector) => {
          const inner = rect(selector);
          return Boolean(inner) && inner.left >= outer.left - 1 && inner.right <= outer.right + 1 && inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
        });
      };
      const overflow = (selector) => {
        const element = document.querySelector(selector);
        return element ? {
          x: element.scrollWidth - element.clientWidth,
          y: element.scrollHeight - element.clientHeight
        } : null;
      };
      const textMetric = (selector) => {
        const element = document.querySelector(selector);
        if (!element) return null;
        const style = getComputedStyle(element);
        return {
          fontFamily: style.fontFamily,
          fontSize: style.fontSize,
          fontWeight: style.fontWeight,
          lineHeight: style.lineHeight,
          lines: Math.max(1, Math.round(element.getBoundingClientRect().height / parseFloat(style.lineHeight || style.fontSize)))
        };
      };
      const navigation = document.querySelector('.site-navigation');
      const navigationShell = document.querySelector('.site-navigation-shell');
      const navLinks = [...document.querySelectorAll('.site-navigation-link')];
      const navBoxes = navLinks.map((item) => {
        const box = item.getBoundingClientRect();
        const style = getComputedStyle(item);
        return {
          left: box.left,
          top: box.top,
          right: box.right,
          bottom: box.bottom,
          width: box.width,
          height: box.height,
          visible: style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0,
          overflowX: item.scrollWidth - item.clientWidth,
          overflowY: item.scrollHeight - item.clientHeight
        };
      });
      const navShellBox = navigationShell?.getBoundingClientRect();
      const navTops = navBoxes.map((item) => Math.round(item.top));
      const navLinksContained = Boolean(navShellBox) && navBoxes.every((box) => (
        box.left >= navShellBox.left - 1 && box.right <= navShellBox.right + 1 &&
        box.top >= navShellBox.top - 1 && box.bottom <= navShellBox.bottom + 1
      ));
      const navLinksNonOverlapping = navBoxes.every((left, leftIndex) => navBoxes.every((right, rightIndex) => (
        rightIndex <= leftIndex ||
        left.right <= right.left + 0.5 || right.right <= left.left + 0.5 ||
        left.bottom <= right.top + 0.5 || right.bottom <= left.top + 0.5
      )));
      const doors = [...document.querySelectorAll('.history-door')].map((item) => {
        const box = item.getBoundingClientRect();
        return { width: box.width, height: box.height };
      });
      const mediaContained = [
        ['.current-visual', '.current-media-stage'],
        ['.current-twwl-visual', '.twwl-media-stage']
      ].every(([outerSelector, innerSelector]) => contains(outerSelector, [innerSelector]));
      return {
        state: document.querySelector('#hrv-classroom-explorations-root')?.dataset.hrvState,
        viewport: { width: innerWidth, height: innerHeight, dpr: devicePixelRatio },
        documentOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
        bodyOverflowX: document.body.scrollWidth - document.body.clientWidth,
        mountOverflowX: overflow('#hrv-classroom-explorations-root')?.x,
        documentHeight: document.documentElement.scrollHeight,
        hero: rect('.hub-hero-card'),
        navigation: navigation ? rect('.site-navigation-shell') : null,
        primaryCards: {
          welcome: rect('.welcome-theater-card'),
          currentExploration: rect('.current-exploration-card'),
          currentTwwl: rect('.current-twwl-card')
        },
        navRows: new Set(navTops).size,
        navLinkCount: navLinks.length,
        visibleNavLinkCount: navBoxes.filter((item) => item.visible).length,
        navLinksContained,
        navLinksNonOverlapping,
        navLabelsUnclipped: navBoxes.every((item) => item.overflowX <= 1 && item.overflowY <= 1),
        doors,
        cardsContained:
          contains('.welcome-theater-card', ['.welcome-heading', '.welcome-screen']) &&
          contains('.current-exploration-card', ['.current-copy', '.current-visual']) &&
          contains('.current-twwl-card', ['.current-twwl-copy', '.current-twwl-visual']),
        mediaContained,
        primaryCardOverflow: {
          welcome: overflow('.welcome-theater-card'),
          currentExploration: overflow('.current-exploration-card'),
          currentTwwl: overflow('.current-twwl-card')
        },
        minimumMainControlHeight: Math.min(...[...document.querySelectorAll(
          '.site-navigation-link, .exploration-action, .history-door'
        )].map((element) => element.getBoundingClientRect().height).filter((height) => height > 0)),
        typography: {
          identity: textMetric('.hub-title'),
          section: textMetric('.current-section-title'),
          subject: textMetric('.current-title'),
          body: textMetric('.current-summary'),
          metadata: textMetric('.section-kicker')
        },
        mainBottom: Math.max(
          rect('.welcome-theater-card')?.bottom || 0,
          rect('.current-exploration-card')?.bottom || 0,
          rect('.current-twwl-card')?.bottom || 0
        )
      };
    })()`);

    assert.equal(metrics.state, "ready", `${entry.label}: Hub must reach ready.`);
    assert.ok(metrics.documentOverflowX <= 1, `${entry.label}: document must not overflow horizontally.`);
    assert.ok(metrics.bodyOverflowX <= 1, `${entry.label}: body must not overflow horizontally.`);
    assert.ok(metrics.mountOverflowX <= 1, `${entry.label}: Hub mount must not overflow horizontally.`);
    assert.ok(metrics.cardsContained, `${entry.label}: primary card content must stay inside its owning card.`);
    assert.ok(metrics.mediaContained, `${entry.label}: media stages must stay inside their visual viewports.`);
    assert.ok(
      Object.values(metrics.primaryCardOverflow).every((value) => value && value.x <= 1 && value.y <= 1),
      `${entry.label}: primary cards must not conceal scroll overflow.`
    );
    assert.ok(metrics.minimumMainControlHeight >= 43, `${entry.label}: main controls must retain a 44px target within rendering tolerance.`);
    assert.equal(metrics.navLinkCount, 7, `${entry.label}: all seven global navigation links must render.`);
    assert.equal(metrics.visibleNavLinkCount, 7, `${entry.label}: all seven global navigation links must remain visible.`);
    assert.ok(metrics.navLinksContained, `${entry.label}: navigation links must remain inside the navigation shell.`);
    assert.ok(metrics.navLinksNonOverlapping, `${entry.label}: navigation links must not overlap.`);
    assert.ok(metrics.navLabelsUnclipped, `${entry.label}: navigation labels must not be clipped.`);
    assert.ok(metrics.doors.length === 3, `${entry.label}: all three history doors must render.`);
    assert.ok(
      Math.max(...metrics.doors.map((door) => door.width)) - Math.min(...metrics.doors.map((door) => door.width)) <= 1.5,
      `${entry.label}: history doors must have equal widths.`
    );
    assert.ok(
      Math.max(...metrics.doors.map((door) => door.height)) - Math.min(...metrics.doors.map((door) => door.height)) <= 1.5,
      `${entry.label}: history doors must have equal heights.`
    );
    const typePx = (role, property) => Number.parseFloat(metrics.typography[role]?.[property] || "0");
    assert.ok(metrics.typography.identity, `${entry.label}: page identity typography must be measurable.`);
    assert.ok(typePx("body", "fontSize") >= (entry.width <= 720 ? 17 : 18), `${entry.label}: body copy must meet its semantic size floor.`);
    assert.ok(typePx("metadata", "fontSize") >= 15, `${entry.label}: metadata must meet its semantic size floor.`);
    assert.ok(typePx("section", "fontSize") > typePx("body", "fontSize"), `${entry.label}: section heading must outrank body copy.`);
    assert.ok(typePx("subject", "fontSize") > typePx("section", "fontSize"), `${entry.label}: subject title must outrank its section heading.`);
    assert.ok(typePx("identity", "fontSize") > typePx("body", "fontSize"), `${entry.label}: page identity must outrank body copy.`);
    assert.ok(typePx("body", "lineHeight") >= typePx("body", "fontSize") * 1.3, `${entry.label}: body copy needs readable line spacing.`);
    assert.ok(metrics.typography.subject.lines <= 4, `${entry.label}: subject title must remain within four lines.`);
    assert.ok(metrics.typography.body.lines <= 6, `${entry.label}: current summary must remain within six lines.`);
    assert.match(metrics.typography.subject.fontFamily, /Georgia/i, `${entry.label}: subject title must retain the Hub display family.`);
    assert.match(metrics.typography.body.fontFamily, /system-ui/i, `${entry.label}: body copy must retain the readable UI family.`);

    if (entry.width >= 1440) {
      assert.ok(metrics.hero.height <= 110, `${entry.label}: desktop identity rail must remain compact.`);
      assert.ok(metrics.navigation.height <= 110, `${entry.label}: desktop navigation rail must remain compact.`);
      assert.equal(metrics.navRows, 1, `${entry.label}: desktop navigation must remain one row.`);
    } else if (entry.width >= 721) {
      assert.ok(metrics.hero.height <= 180, `${entry.label}: compact desktop/tablet identity must not revert to the legacy hero.`);
      assert.ok(metrics.navigation.height <= 190, `${entry.label}: compact desktop/tablet navigation must remain glanceable.`);
      assert.ok(metrics.navRows <= 2, `${entry.label}: compact desktop/tablet navigation must use at most two rows.`);
    } else {
      assert.ok(metrics.navigation.height <= 320, `${entry.label}: narrow navigation must not become a seven-row wall.`);
      assert.ok(metrics.navRows <= 4, `${entry.label}: narrow navigation must use at most four rows.`);
    }

    if (entry.label === "approved-desktop") {
      if (metrics.mainBottom > entry.height + 1) {
        const diagnosis = await evaluate(client, `(() => ({
          metrics: ${JSON.stringify(metrics)},
          children: [...document.querySelectorAll('.welcome-heading, .welcome-screen, .current-copy, .current-copy > *')].map(element => ({
            selector: element.className,
            rect: element.getBoundingClientRect().toJSON(),
            fontFamily: getComputedStyle(element).fontFamily,
            fontSize: getComputedStyle(element).fontSize,
            lineHeight: getComputedStyle(element).lineHeight,
            minHeight: getComputedStyle(element).minHeight,
            padding: getComputedStyle(element).padding
          }))
        }))()`);
        console.error('[hub browser] opening-viewport diagnosis', JSON.stringify(diagnosis));
        if (evidenceDir) {
          // Failure artifacts are distinct from the atomic accepted-evidence bundle.
          await mkdir(evidenceDir, { recursive: true });
          await writeFile(resolve(evidenceDir, 'FAILED-opening-viewport.json'), `${JSON.stringify(diagnosis, null, 2)}\n`);
          const failureScreenshot = await client.call('Page.captureScreenshot', { format: 'png', fromSurface: true });
          await writeFile(resolve(evidenceDir, 'FAILED-opening-viewport.png'), Buffer.from(failureScreenshot.data, 'base64'));
        }
      }
      assert.ok(
        metrics.mainBottom <= entry.height + 1,
        `1920x911: Welcome, Current, and TWWL must fit in the opening viewport; got ${JSON.stringify(metrics.primaryCards)}.`
      );
    }
    results.push({ kind: "geometry", label: entry.label, ...metrics });

    if (evidenceDir && ["approved-desktop", "short-wide-former-failure", "narrow-desktop", "tablet", "phone"].includes(entry.label)) {
      await waitForValue(
        client,
        `(() => {
          const current = document.querySelector('.current-media-stage')?.dataset.mediaState;
          const video = document.querySelector('.welcome-screen')?.dataset.mediaState;
          return ['ready', 'unavailable'].includes(current) && ['ready', 'unavailable'].includes(video);
        })()`,
        `${entry.label} media settlement`,
        12_000
      );
      const screenshotMedia = await evaluate(client, `(async () => {
        const stage = document.querySelector('.current-media-stage');
        const image = stage?.querySelector('.current-image');
        if (image?.complete && image.naturalWidth > 0 && typeof image.decode === 'function') {
          try { await image.decode(); } catch {}
        }
        await new Promise((accept) => requestAnimationFrame(() => requestAnimationFrame(accept)));
        await new Promise((accept) => setTimeout(accept, 120));
        const style = image ? getComputedStyle(image) : null;
        const box = image?.getBoundingClientRect();
        return {
          currentImage: stage?.dataset.mediaState || null,
          currentImagePaintEligible: Boolean(
            image &&
            !image.hidden &&
            image.complete &&
            image.naturalWidth > 0 &&
            image.naturalHeight > 0 &&
            box?.width > 0 &&
            box?.height > 0 &&
            style?.display !== 'none' &&
            style?.visibility !== 'hidden' &&
            Number.parseFloat(style?.opacity || '1') > 0
          ),
          currentImageNaturalSize: image ? {
            width: image.naturalWidth,
            height: image.naturalHeight
          } : null,
          welcomeIframeLoad: document.querySelector('.welcome-screen')?.dataset.mediaState === 'ready'
            ? 'load-event'
            : document.querySelector('.welcome-screen')?.dataset.mediaState || null
        };
      })()`);
      if (requireScreenshotMediaLoad) {
        assert.equal(
          screenshotMedia.currentImage,
          "ready",
          `${entry.label}: external Current image must be loaded for release-grade screenshots.`
        );
        assert.equal(
          screenshotMedia.currentImagePaintEligible,
          true,
          `${entry.label}: external Current image must be decoded and paint-eligible for release-grade screenshots.`
        );
        assert.equal(
          screenshotMedia.welcomeIframeLoad,
          "load-event",
          `${entry.label}: Welcome iframe must reach its visual load event for release-grade screenshots; playback is not claimed.`
        );
      }
      const screenshot = await client.call("Page.captureScreenshot", { format: "png", fromSurface: true });
      const screenshotBytes = Buffer.from(screenshot.data, "base64");
      const devicePixels = pngDimensions(screenshotBytes);
      assert.equal(
        devicePixels.width,
        Math.round(entry.width * entry.dpr),
        `${entry.label}: screenshot physical width must equal CSS width times DPR.`
      );
      assert.equal(
        devicePixels.height,
        Math.round(entry.height * entry.dpr),
        `${entry.label}: screenshot physical height must equal CSS height times DPR.`
      );
      const screenshotFile = `${entry.label}-${entry.width}x${entry.height}.png`;
      await writeFile(resolve(evidenceStagingDir, screenshotFile), screenshotBytes);
      results.at(-1).screenshot = {
        file: screenshotFile,
        sha256: sha256(screenshotBytes),
        byteLength: screenshotBytes.length,
        cssViewport: {
          width: results.at(-1).viewport.width,
          height: results.at(-1).viewport.height
        },
        devicePixels,
        deviceScaleFactor: entry.dpr,
        media: screenshotMedia
      };
    }
  }

  let scrollableNativeDialogCases = 0;
  for (const entry of [
    { width: 1920, height: 911 },
    { width: 1600, height: 820 },
    { width: 1180, height: 800 },
    { width: 720, height: 900 },
    { width: 390, height: 844 }
  ]) {
    await client.call("Emulation.setDeviceMetricsOverride", {
      width: entry.width,
      height: entry.height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: entry.width,
      screenHeight: entry.height
    });
    await navigateReady(client, `${baseUrl}/fixture.html?mode=historical-collections&case=dialogs-${entry.width}`);
    for (const id of [
      "hrv-past-explorations-dialog",
      "hrv-past-learning-dialog",
      "hrv-school-year-archives-dialog"
    ]) {
      const dialog = await evaluate(client, `(() => {
        const id = ${JSON.stringify(id)};
        const door = document.querySelector('[aria-controls="' + id + '"]');
        door.focus();
        door.click();
        const element = document.getElementById(id);
        const close = element.querySelector('.history-dialog-close');
        const box = element.getBoundingClientRect();
        const closeBox = close.getBoundingClientRect();
        const maximumScrollTop = Math.max(0, element.scrollHeight - element.clientHeight);
        element.scrollTop = maximumScrollTop;
        const observedScrollTop = element.scrollTop;
        element.scrollTop = 0;
        return {
          mode: element.dataset.hrvDialogMode,
          open: element.open,
          focusInside: element.contains(document.activeElement),
          box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom },
          close: {
            left: closeBox.left,
            top: closeBox.top,
            right: closeBox.right,
            bottom: closeBox.bottom,
            width: closeBox.width,
            height: closeBox.height
          },
          scrolling: {
            overflowY: getComputedStyle(element).overflowY,
            maximumScrollTop,
            observedScrollTop,
            reachedEnd: Math.abs(maximumScrollTop - observedScrollTop) <= 1
          },
          overflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth
        };
      })()`);
      assert.equal(dialog.mode, "native", `${entry.width}x${entry.height} ${id}: dialog must use native modality.`);
      assert.ok(dialog.open, `${entry.width}x${entry.height} ${id}: dialog must open.`);
      assert.ok(dialog.focusInside, `${entry.width}x${entry.height} ${id}: opening must move focus inside the dialog.`);
      assert.ok(dialog.box.left >= -1 && dialog.box.top >= -1, `${entry.width}x${entry.height} ${id}: dialog must begin in the viewport.`);
      assert.ok(dialog.box.right <= entry.width + 1 && dialog.box.bottom <= entry.height + 1, `${entry.width}x${entry.height} ${id}: dialog must fit the viewport.`);
      assert.ok(dialog.close.left >= dialog.box.left && dialog.close.right <= dialog.box.right, `${entry.width}x${entry.height} ${id}: Close control must remain inside the dialog.`);
      assert.ok(dialog.close.top >= dialog.box.top && dialog.close.bottom <= dialog.box.bottom, `${entry.width}x${entry.height} ${id}: Close control must remain visible.`);
      assert.ok(dialog.close.width >= 43 && dialog.close.height >= 43, `${entry.width}x${entry.height} ${id}: Close control must retain a 44px target within rendering tolerance.`);
      assert.ok(dialog.scrolling.reachedEnd, `${entry.width}x${entry.height} ${id}: overflowing dialog content must reach its scroll end.`);
      if (dialog.scrolling.maximumScrollTop > 1) {
        scrollableNativeDialogCases += 1;
        assert.match(dialog.scrolling.overflowY, /^(auto|scroll)$/i, `${entry.width}x${entry.height} ${id}: overflowing dialog needs an explicit scrolling overflow mode.`);
      }
      assert.ok(dialog.overflowX <= 1, `${entry.width}x${entry.height} ${id}: dialog must not cause page overflow.`);
      const focusableCount = await evaluate(client, `(() => {
        const dialog = document.getElementById(${JSON.stringify(id)});
        const focusable = [...dialog.querySelectorAll(${JSON.stringify(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )})].filter((element) => !element.hidden && !element.closest('[hidden]'));
        focusable.at(-1)?.focus();
        return focusable.length;
      })()`);
      assert.ok(focusableCount > 1, `${entry.width}x${entry.height} ${id}: focus-loop fixture needs multiple controls.`);
      await dispatchTab(client);
      const forwardWrapped = await evaluate(client, `(() => {
        const dialog = document.getElementById(${JSON.stringify(id)});
        const focusable = [...dialog.querySelectorAll(${JSON.stringify(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )})].filter((element) => !element.hidden && !element.closest('[hidden]'));
        return document.activeElement === focusable[0];
      })()`);
      assert.ok(forwardWrapped, `${entry.width}x${entry.height} ${id}: Tab must wrap from the last to first native-dialog control.`);
      await evaluate(client, `(() => {
        document.getElementById(${JSON.stringify(id)}).querySelector('.history-dialog-close').focus();
        return true;
      })()`);
      await dispatchTab(client, true);
      const backwardWrapped = await evaluate(client, `(() => {
        const dialog = document.getElementById(${JSON.stringify(id)});
        const focusable = [...dialog.querySelectorAll(${JSON.stringify(
          'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
        )})].filter((element) => !element.hidden && !element.closest('[hidden]'));
        return document.activeElement === focusable.at(-1);
      })()`);
      assert.ok(backwardWrapped, `${entry.width}x${entry.height} ${id}: Shift+Tab must wrap from the first to last native-dialog control.`);
      await client.call("Input.dispatchKeyEvent", {
        type: "rawKeyDown",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
        nativeVirtualKeyCode: 27
      });
      await client.call("Input.dispatchKeyEvent", {
        type: "keyUp",
        key: "Escape",
        code: "Escape",
        windowsVirtualKeyCode: 27,
        nativeVirtualKeyCode: 27
      });
      await waitForValue(
        client,
        `!document.getElementById(${JSON.stringify(id)}).open`,
        `${entry.width}x${entry.height} ${id} Escape close`
      );
      const closeState = await evaluate(client, `(() => ({
        closed: !document.getElementById(${JSON.stringify(id)}).open,
        focusReturned: document.activeElement === document.querySelector('[aria-controls=${JSON.stringify(id)}]')
      }))()`);
      assert.ok(closeState.closed, `${entry.width}x${entry.height} ${id}: Escape must close the native dialog.`);
      assert.ok(closeState.focusReturned, `${entry.width}x${entry.height} ${id}: native close must return focus to the invoking door.`);
      results.push({
        kind: "dialog",
        size: `${entry.width}x${entry.height}`,
        id,
        ...dialog,
        focusLoop: { forwardWrapped, backwardWrapped },
        ...closeState
      });
    }
  }
  assert.ok(
    scrollableNativeDialogCases > 0,
    "Native-dialog coverage must exercise at least one genuinely overflowing, scrollable dialog."
  );

  let scrollableFallbackDialogCases = 0;
  for (const entry of [
    { width: 1920, height: 911 },
    { width: 720, height: 900 },
    { width: 390, height: 844 }
  ]) {
    await client.call("Emulation.setDeviceMetricsOverride", {
      width: entry.width,
      height: entry.height,
      deviceScaleFactor: 1,
      mobile: false,
      screenWidth: entry.width,
      screenHeight: entry.height
    });
    await navigateReady(client, `${baseUrl}/fixture.html?dialog=fallback`);
    const fallbackDialog = await evaluate(client, `(() => {
      const door = document.querySelector('button.history-door');
      const dialog = document.querySelector('dialog.history-dialog');
      const surface = dialog.querySelector('.history-dialog-surface');
      const close = dialog.querySelector('.history-dialog-close');
      const root = document.querySelector('#hrv-classroom-explorations-root');
      const hostControl = document.querySelector('#fixture-host-control');
      door.focus();
      door.click();
      const box = dialog.getBoundingClientRect();
      const surfaceBox = surface.getBoundingClientRect();
      const closeBox = close.getBoundingClientRect();
      const maximumScrollTop = Math.max(0, surface.scrollHeight - surface.clientHeight);
      surface.scrollTop = maximumScrollTop;
      const observedScrollTop = surface.scrollTop;
      surface.scrollTop = 0;
      const focusable = [...dialog.querySelectorAll(${JSON.stringify(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])'
      )})].filter((element) => !element.hidden && !element.closest('[hidden]'));
      focusable.at(-1)?.focus();
      dialog.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Tab',
        bubbles: true,
        cancelable: true
      }));
      const forwardWrapped = document.activeElement === focusable[0];
      focusable[0]?.focus();
      dialog.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Tab',
        shiftKey: true,
        bubbles: true,
        cancelable: true
      }));
      const backwardWrapped = document.activeElement === focusable.at(-1);
      const opened = {
        mode: dialog.dataset.hrvDialogMode,
        open: dialog.hasAttribute('open') && !dialog.hidden,
        rootLocked: root.classList.contains('has-fallback-dialog'),
        backgroundInert:
          root.hasAttribute('inert') && root.getAttribute('aria-hidden') === 'true' &&
          hostControl.hasAttribute('inert') && hostControl.getAttribute('aria-hidden') === 'true',
        focusInside: dialog.contains(document.activeElement),
        viewport: {
          width: document.documentElement.clientWidth,
          height: document.documentElement.clientHeight
        },
        box: { left: box.left, top: box.top, right: box.right, bottom: box.bottom },
        surface: { left: surfaceBox.left, top: surfaceBox.top, right: surfaceBox.right, bottom: surfaceBox.bottom },
        close: { width: closeBox.width, height: closeBox.height },
        focusLoop: { forwardWrapped, backwardWrapped },
        scrolling: {
          overflowY: getComputedStyle(surface).overflowY,
          maximumScrollTop,
          observedScrollTop,
          reachedEnd: Math.abs(maximumScrollTop - observedScrollTop) <= 1
        }
      };
      dialog.dispatchEvent(new KeyboardEvent('keydown', {
        key: 'Escape',
        bubbles: true,
        cancelable: true
      }));
      return {
        ...opened,
        closed: dialog.hidden && !dialog.hasAttribute('open'),
        backgroundRestored:
          !root.hasAttribute('inert') && !root.hasAttribute('aria-hidden') &&
          !hostControl.hasAttribute('inert') && !hostControl.hasAttribute('aria-hidden'),
        focusReturned: document.activeElement === door
      };
    })()`);
    assert.equal(fallbackDialog.mode, "fallback", `${entry.width}x${entry.height}: forced dialog must use fallback mode.`);
    assert.ok(fallbackDialog.open, `${entry.width}x${entry.height}: fallback dialog must open.`);
    assert.ok(fallbackDialog.rootLocked, `${entry.width}x${entry.height}: fallback dialog must mark the root as modal.`);
    assert.ok(fallbackDialog.backgroundInert, `${entry.width}x${entry.height}: fallback dialog must isolate background content.`);
    assert.ok(fallbackDialog.focusInside, `${entry.width}x${entry.height}: fallback dialog must contain focus.`);
    assert.ok(fallbackDialog.focusLoop.forwardWrapped, `${entry.width}x${entry.height}: Tab must wrap inside the fallback dialog.`);
    assert.ok(fallbackDialog.focusLoop.backwardWrapped, `${entry.width}x${entry.height}: Shift+Tab must wrap inside the fallback dialog.`);
    assert.ok(fallbackDialog.close.width >= 43 && fallbackDialog.close.height >= 43, `${entry.width}x${entry.height}: fallback Close control must retain a 44px target within rendering tolerance.`);
    assert.ok(
      Math.abs(fallbackDialog.box.left) <= 1 &&
      Math.abs(fallbackDialog.box.top) <= 1 &&
      Math.abs(fallbackDialog.box.right - fallbackDialog.viewport.width) <= 1 &&
      Math.abs(fallbackDialog.box.bottom - fallbackDialog.viewport.height) <= 1,
      `${entry.width}x${entry.height}: fallback overlay must cover the viewport; got ${JSON.stringify(fallbackDialog.box)}.`
    );
    assert.ok(
      fallbackDialog.surface.left >= -1 &&
      fallbackDialog.surface.top >= -1 &&
      fallbackDialog.surface.right <= entry.width + 1 &&
      fallbackDialog.surface.bottom <= entry.height + 1,
      `${entry.width}x${entry.height}: fallback dialog surface must fit the viewport.`
    );
    assert.ok(fallbackDialog.scrolling.reachedEnd, `${entry.width}x${entry.height}: overflowing fallback-dialog content must reach its scroll end.`);
    if (fallbackDialog.scrolling.maximumScrollTop > 1) {
      scrollableFallbackDialogCases += 1;
      assert.match(fallbackDialog.scrolling.overflowY, /^(auto|scroll)$/i, `${entry.width}x${entry.height}: overflowing fallback-dialog surface needs an explicit scrolling overflow mode.`);
    }
    assert.ok(fallbackDialog.closed, `${entry.width}x${entry.height}: Escape must close fallback dialog.`);
    assert.ok(fallbackDialog.backgroundRestored, `${entry.width}x${entry.height}: closing must restore background semantics.`);
    assert.ok(fallbackDialog.focusReturned, `${entry.width}x${entry.height}: closing must return focus to the invoking door.`);
    results.push({ kind: "fallback-dialog", size: `${entry.width}x${entry.height}`, ...fallbackDialog });
  }
  assert.ok(
    scrollableFallbackDialogCases > 0,
    "Fallback-dialog coverage must exercise at least one genuinely overflowing, scrollable surface."
  );

  const lifecycleCases = [
    { mode: "published-twwl", sizes: [[1920, 911], [980, 911], [390, 844]] },
    { mode: "published-twwl-no-image", sizes: [[1920, 911], [390, 844]] },
    { mode: "empty-collections", sizes: [[1920, 911], [980, 911], [390, 844]] },
    { mode: "media-unavailable", sizes: [[1920, 911], [980, 911], [390, 844]] }
  ];
  for (const lifecycleCase of lifecycleCases) {
    for (const [width, height] of lifecycleCase.sizes) {
      const { mode } = lifecycleCase;
      await client.call("Emulation.setDeviceMetricsOverride", {
        width,
        height,
        deviceScaleFactor: 1,
        mobile: false,
        screenWidth: width,
        screenHeight: height
      });
      await navigateReady(client, `${baseUrl}/fixture.html?mode=${mode}&size=${width}x${height}`);
      if (mode.startsWith("published-twwl")) {
        await evaluate(client, `(() => {
          document.querySelector('.current-twwl-card')?.scrollIntoView({ block: 'center' });
          return true;
        })()`);
      }
      await waitForValue(
        client,
        `(() => {
          const current = document.querySelector('.current-media-stage')?.dataset.mediaState;
          const welcome = document.querySelector('.welcome-screen')?.dataset.mediaState;
          const twwl = document.querySelector('.twwl-media-stage')?.dataset.mediaState;
          return ['ready', 'unavailable'].includes(current) &&
            ['ready', 'unavailable'].includes(welcome) &&
            (${JSON.stringify(mode.startsWith("published-twwl"))} ? ['ready', 'unavailable'].includes(twwl) : true);
        })()`,
        `${mode} ${width}x${height} media settlement`,
        12_000
      );
      if (mode.startsWith("published-twwl")) {
        await evaluate(client, `(() => {
          window.scrollTo(0, 0);
          return true;
        })()`);
      }
      const state = await evaluate(client, `(() => {
        const rect = (element) => {
          const box = element?.getBoundingClientRect();
          return box ? { left: box.left, top: box.top, right: box.right, bottom: box.bottom, width: box.width, height: box.height } : null;
        };
        const containsElements = (outer, inners) => {
          const outerBox = rect(outer);
          return Boolean(outerBox) && inners.every((inner) => {
            const innerBox = rect(inner);
            return Boolean(innerBox) &&
              innerBox.left >= outerBox.left - 1 && innerBox.right <= outerBox.right + 1 &&
              innerBox.top >= outerBox.top - 1 && innerBox.bottom <= outerBox.bottom + 1;
          });
        };
        const overflow = (selector) => {
          const element = document.querySelector(selector);
          return element ? { x: element.scrollWidth - element.clientWidth, y: element.scrollHeight - element.clientHeight } : null;
        };
        const visible = (element) => {
          if (!element || element.hidden) return false;
          const style = getComputedStyle(element);
          const box = element.getBoundingClientRect();
          return style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0;
        };
        const twwlVisual = document.querySelector('.current-twwl-visual');
        const twwlStage = document.querySelector('.twwl-media-stage');
        const twwlImage = twwlVisual?.querySelector('img.current-twwl-image');
        const twwlFallback = twwlVisual?.querySelector('.hub-media-fallback-twwl');
        const currentStage = document.querySelector('.current-media-stage');
        const currentFallback = currentStage?.querySelector('.hub-media-fallback-current');
        const welcomeScreen = document.querySelector('.welcome-screen');
        const welcomeFallback = welcomeScreen?.querySelector('.hub-media-fallback-video');
        const visibleFallbackContainment = [...document.querySelectorAll('.hub-media-fallback')]
          .filter(visible)
          .map((fallback) => {
            const owner = fallback.closest('.welcome-screen, .current-media-stage, .twwl-media-stage, .card-image-stage');
            return {
              className: fallback.className,
              ownerClassName: owner?.className || null,
              owner: rect(owner),
              fallback: rect(fallback),
              contained: containsElements(owner, [fallback])
            };
          });
        const dialogs = [...document.querySelectorAll('dialog.history-dialog')];
        const doors = [...document.querySelectorAll('.history-door')].map(rect);
        return {
          mode: ${JSON.stringify(mode)},
          size: { width: innerWidth, height: innerHeight },
          ready: document.querySelector('#hrv-classroom-explorations-root')?.dataset.hrvState === 'ready',
          documentOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
          bodyOverflowX: document.body.scrollWidth - document.body.clientWidth,
          mountOverflowX: overflow('#hrv-classroom-explorations-root')?.x,
          cardsContained:
            containsElements(document.querySelector('.welcome-theater-card'), [document.querySelector('.welcome-heading'), welcomeScreen]) &&
            containsElements(document.querySelector('.current-exploration-card'), [document.querySelector('.current-copy'), document.querySelector('.current-visual')]) &&
            containsElements(document.querySelector('.current-twwl-card'), [document.querySelector('.current-twwl-copy'), twwlVisual]),
          mediaContained:
            containsElements(document.querySelector('.current-visual'), [currentStage]) &&
            containsElements(twwlVisual, [twwlStage]) &&
            containsElements(document.querySelector('.welcome-theater-card'), [welcomeScreen]),
          visibleFallbackContainment,
          primaryCardOverflow: {
            welcome: overflow('.welcome-theater-card'),
            currentExploration: overflow('.current-exploration-card'),
            currentTwwl: overflow('.current-twwl-card')
          },
          doorsEqual:
            doors.length === 3 &&
            Math.max(...doors.map((door) => door.width)) - Math.min(...doors.map((door) => door.width)) <= 1.5 &&
            Math.max(...doors.map((door) => door.height)) - Math.min(...doors.map((door) => door.height)) <= 1.5,
          publishedVisual: {
            mediaState: twwlStage?.dataset.mediaState || null,
            loadedImage: Boolean(
              visible(twwlImage) && twwlImage.complete && twwlImage.naturalWidth > 0 && twwlImage.naturalHeight > 0
            ),
            visibleFallback: visible(twwlFallback)
          },
          unavailableMedia: {
            currentState: currentStage?.dataset.mediaState || null,
            currentFallback: visible(currentFallback),
            welcomeState: welcomeScreen?.dataset.mediaState || null,
            welcomeFallback: visible(welcomeFallback)
          },
          emptyDialogs: dialogs.map((dialog) => ({
            id: dialog.id,
            hasStatus: Boolean(dialog.querySelector('[role="status"], .empty-gallery')),
            hasSearch: Boolean(dialog.querySelector('.gallery-search'))
          }))
        };
      })()`);
      const label = `${mode} ${width}x${height}`;
      assert.ok(state.ready, `${label}: Hub must remain ready.`);
      assert.ok(
        state.documentOverflowX <= 1 && state.bodyOverflowX <= 1 && state.mountOverflowX <= 1,
        `${label}: lifecycle fixture must not overflow horizontally.`
      );
      assert.ok(state.cardsContained, `${label}: required copy and visuals must stay inside their cards.`);
      assert.ok(state.mediaContained, `${label}: media stages must stay inside their visual viewports.`);
      assert.ok(
        state.visibleFallbackContainment.every((fallback) => fallback.contained),
        `${label}: every visible media fallback must stay inside its owning viewport; got ${JSON.stringify(state.visibleFallbackContainment)}.`
      );
      assert.ok(
        Object.values(state.primaryCardOverflow).every((value) => value && value.x <= 1 && value.y <= 1),
        `${label}: primary cards must not conceal scroll overflow.`
      );
      assert.ok(state.doorsEqual, `${label}: all three history doors must remain equal.`);
      if (mode.startsWith("published-twwl")) {
        assert.ok(
          state.publishedVisual.loadedImage || state.publishedVisual.visibleFallback,
          `${label}: published TWWL needs a visibly loaded image or visible deliberate fallback.`
        );
        assert.equal(
          state.publishedVisual.mediaState,
          state.publishedVisual.loadedImage ? "ready" : "unavailable",
          `${label}: Current TWWL visual and media-state evidence must agree.`
        );
      } else if (mode === "empty-collections") {
        assert.ok(state.emptyDialogs.every((dialog) => dialog.hasStatus), `${label}: empty collection dialogs need deliberate status content.`);
        assert.ok(state.emptyDialogs.slice(0, 2).every((dialog) => !dialog.hasSearch), `${label}: empty galleries must not expose inert search fields.`);
      } else {
        assert.equal(state.unavailableMedia.currentState, "unavailable", `${label}: Current image state must be unavailable.`);
        assert.ok(state.unavailableMedia.currentFallback, `${label}: Current image fallback must be visible.`);
        assert.equal(state.unavailableMedia.welcomeState, "unavailable", `${label}: Welcome video state must be unavailable.`);
        assert.ok(state.unavailableMedia.welcomeFallback, `${label}: Welcome video fallback must be visible.`);
      }
      results.push({ kind: "lifecycle", ...state });
    }
  }

  await client.call("Emulation.setDeviceMetricsOverride", {
    width: 1920,
    height: 911,
    deviceScaleFactor: 1,
    mobile: false,
    screenWidth: 1920,
    screenHeight: 911
  });
  await client.call("Page.navigate", { url: `${baseUrl}/slow-preview.html` });
  const loadingState = await waitForValue(
    client,
    `(() => {
      const root = document.querySelector('#hrv-classroom-explorations-root');
      if (root?.dataset.hrvState !== 'loading') return false;
      const status = root.querySelector('[data-hrv-loading-notice]');
      if (!status) return false;
      const style = getComputedStyle(status);
      if (style.display === 'none' || style.visibility === 'hidden' || !status.textContent.trim()) return false;
      return {
        visible: true,
        rootBusy: root.getAttribute('aria-busy') === 'true',
        role: status.getAttribute('role'),
        live: status.getAttribute('aria-live')
      };
    })()`,
    "visible Hub loading state",
    500
  );
  assert.ok(loadingState.visible, "Bootstrap loading state must be visible.");
  assert.ok(loadingState.rootBusy, "Bootstrap loading state must mark the Hub busy.");
  assert.equal(loadingState.role, "status", "Bootstrap loading state must expose status semantics.");
  assert.equal(loadingState.live, "polite", "Bootstrap loading state must be politely announced.");
  await waitForValue(
    client,
    `document.querySelector("#hrv-classroom-explorations-root")?.dataset.hrvState === "ready"`,
    "slow Hub preview completion"
  );
  results.push({ kind: "loading", ...loadingState });

  if (process.platform === "win32") {
    const nativeZoomScenarios = [
      {
        label: "desktop-window-metrics-proxy",
        width: 1920,
        height: 911,
        dpr: 1,
        targets: [0.8, 1, 1.25, 1.5, 2]
      },
      {
        label: "windows-150-percent-display-proxy",
        width: 1280,
        height: 607,
        dpr: 1.5,
        targets: [0.8, 1, 1.25, 1.5, 2]
      }
    ];

    for (const scenario of nativeZoomScenarios) {
      await client.call("Emulation.setDeviceMetricsOverride", {
        width: scenario.width,
        height: scenario.height,
        deviceScaleFactor: scenario.dpr,
        mobile: false,
        screenWidth: scenario.width,
        screenHeight: scenario.height
      });
      await navigateReady(client, `${baseUrl}/preview.html?case=native-zoom-${scenario.label}`);

      for (const target of scenario.targets) {
        const actualZoom = await setNativeBrowserZoom(client, target);
        const state = await evaluate(client, `(() => {
          const rect = (selector) => document.querySelector(selector)?.getBoundingClientRect();
          const contains = (outerSelector, innerSelectors) => {
            const outer = rect(outerSelector);
            return Boolean(outer) && innerSelectors.every((selector) => {
              const inner = rect(selector);
              return Boolean(inner) &&
                inner.left >= outer.left - 1 && inner.right <= outer.right + 1 &&
                inner.top >= outer.top - 1 && inner.bottom <= outer.bottom + 1;
            });
          };
          const overflow = (selector) => {
            const element = document.querySelector(selector);
            return element ? {
              x: element.scrollWidth - element.clientWidth,
              y: element.scrollHeight - element.clientHeight
            } : null;
          };
          const navShell = rect('.site-navigation-shell');
          const navLinks = [...document.querySelectorAll('.site-navigation-link')];
          const navBoxes = navLinks.map((item) => {
            const box = item.getBoundingClientRect();
            const style = getComputedStyle(item);
            return {
              left: box.left,
              top: box.top,
              right: box.right,
              bottom: box.bottom,
              width: box.width,
              height: box.height,
              visible: style.display !== 'none' && style.visibility !== 'hidden' && box.width > 0 && box.height > 0,
              overflowX: item.scrollWidth - item.clientWidth,
              overflowY: item.scrollHeight - item.clientHeight
            };
          });
          const navTops = navBoxes.map((item) => Math.round(item.top));
          const navLinksContained = Boolean(navShell) && navBoxes.every((box) => (
            box.left >= navShell.left - 1 && box.right <= navShell.right + 1 &&
            box.top >= navShell.top - 1 && box.bottom <= navShell.bottom + 1
          ));
          const navLinksNonOverlapping = navBoxes.every((left, leftIndex) => navBoxes.every((right, rightIndex) => (
            rightIndex <= leftIndex ||
            left.right <= right.left + 0.5 || right.right <= left.left + 0.5 ||
            left.bottom <= right.top + 0.5 || right.bottom <= left.top + 0.5
          )));
          const doors = [...document.querySelectorAll('.history-door')]
            .map((item) => ({ width: item.offsetWidth, height: item.offsetHeight }));
          return {
            ready: document.querySelector('#hrv-classroom-explorations-root')?.dataset.hrvState === 'ready',
            viewport: {
              width: innerWidth,
              height: innerHeight,
              dpr: devicePixelRatio,
              visualScale: visualViewport?.scale
            },
            documentOverflowX: document.documentElement.scrollWidth - document.documentElement.clientWidth,
            bodyOverflowX: document.body.scrollWidth - document.body.clientWidth,
            mountOverflowX:
              document.querySelector('#hrv-classroom-explorations-root').scrollWidth -
              document.querySelector('#hrv-classroom-explorations-root').clientWidth,
            cardsContained:
              contains('.welcome-theater-card', ['.welcome-heading', '.welcome-screen']) &&
              contains('.current-exploration-card', ['.current-copy', '.current-visual']) &&
              contains('.current-twwl-card', ['.current-twwl-copy', '.current-twwl-visual']),
            mediaContained:
              contains('.current-visual', ['.current-media-stage']) &&
              contains('.current-twwl-visual', ['.twwl-media-stage']),
            primaryCardOverflow: {
              welcome: overflow('.welcome-theater-card'),
              currentExploration: overflow('.current-exploration-card'),
              currentTwwl: overflow('.current-twwl-card')
            },
            doorsEqual:
              doors.length === 3 &&
              Math.max(...doors.map((door) => door.width)) - Math.min(...doors.map((door) => door.width)) <= 1.5 &&
              Math.max(...doors.map((door) => door.height)) - Math.min(...doors.map((door) => door.height)) <= 1.5,
            navRows: new Set(navTops).size,
            navLinkCount: navLinks.length,
            visibleNavLinkCount: navBoxes.filter((item) => item.visible).length,
            navLinksContained,
            navLinksNonOverlapping,
            navLabelsUnclipped: navBoxes.every((item) => item.overflowX <= 1 && item.overflowY <= 1),
            heroHeight: rect('.hub-hero-card')?.height,
            navigationHeight: rect('.site-navigation-shell')?.height
          };
        })()`);
        assert.ok(state.ready, `${scenario.label} at ${target * 100}%: Hub must remain ready.`);
        assert.ok(
          state.documentOverflowX <= 1 && state.bodyOverflowX <= 1 && state.mountOverflowX <= 1,
          `${scenario.label} at ${target * 100}%: native zoom must not cause horizontal overflow.`
        );
        assert.ok(state.cardsContained, `${scenario.label} at ${target * 100}%: cards must retain their contents.`);
        assert.ok(state.mediaContained, `${scenario.label} at ${target * 100}%: media stages must remain inside their visual viewports.`);
        assert.ok(
          Object.values(state.primaryCardOverflow).every((value) => value && value.x <= 1 && value.y <= 1),
          `${scenario.label} at ${target * 100}%: primary cards must not conceal scroll overflow.`
        );
        assert.ok(state.doorsEqual, `${scenario.label} at ${target * 100}%: history doors must remain equal.`);
        assert.equal(state.navLinkCount, 7, `${scenario.label} at ${target * 100}%: all global navigation links must render.`);
        assert.equal(state.visibleNavLinkCount, 7, `${scenario.label} at ${target * 100}%: all global navigation links must remain visible.`);
        assert.ok(state.navLinksContained, `${scenario.label} at ${target * 100}%: navigation links must remain inside their shell.`);
        assert.ok(state.navLinksNonOverlapping, `${scenario.label} at ${target * 100}%: navigation links must not overlap.`);
        assert.ok(state.navLabelsUnclipped, `${scenario.label} at ${target * 100}%: navigation labels must not clip.`);
        if (state.viewport.width >= 1440) {
          assert.equal(state.navRows, 1, `${scenario.label} at ${target * 100}%: desktop navigation must remain one row.`);
          assert.ok(state.heroHeight <= 110, `${scenario.label} at ${target * 100}%: desktop identity rail must remain compact.`);
          assert.ok(state.navigationHeight <= 110, `${scenario.label} at ${target * 100}%: desktop navigation rail must remain compact.`);
        } else if (state.viewport.width >= 721) {
          assert.ok(state.navRows <= 2, `${scenario.label} at ${target * 100}%: compact navigation must use at most two rows.`);
          assert.ok(state.heroHeight <= 180, `${scenario.label} at ${target * 100}%: compact identity must not revert to the legacy hero.`);
          assert.ok(state.navigationHeight <= 190, `${scenario.label} at ${target * 100}%: compact navigation must remain glanceable.`);
        } else {
          assert.ok(state.navRows <= 4, `${scenario.label} at ${target * 100}%: narrow navigation must use at most four rows.`);
          assert.ok(state.navigationHeight <= 320, `${scenario.label} at ${target * 100}%: narrow navigation must not become a seven-row wall.`);
        }
        const representativeDialog = await evaluate(client, `(() => {
          const door = document.querySelector('button.history-door');
          door.focus();
          door.click();
          const dialog = document.querySelector('dialog.history-dialog[open]');
          const close = dialog?.querySelector('.history-dialog-close');
          const box = dialog?.getBoundingClientRect();
          const closeBox = close?.getBoundingClientRect();
          const maximumScrollTop = dialog ? Math.max(0, dialog.scrollHeight - dialog.clientHeight) : 0;
          if (dialog) dialog.scrollTop = maximumScrollTop;
          return {
            open: Boolean(dialog?.open),
            focusInside: Boolean(dialog?.contains(document.activeElement)),
            box: box ? { left: box.left, top: box.top, right: box.right, bottom: box.bottom } : null,
            close: closeBox ? { width: closeBox.width, height: closeBox.height } : null,
            maximumScrollTop,
            reachedEnd: Boolean(dialog) && Math.abs(dialog.scrollTop - maximumScrollTop) <= 1
          };
        })()`);
        assert.ok(representativeDialog.open, `${scenario.label} at ${target * 100}%: representative native dialog must open.`);
        assert.ok(representativeDialog.focusInside, `${scenario.label} at ${target * 100}%: representative native dialog must receive focus.`);
        assert.ok(
          representativeDialog.box.left >= -1 && representativeDialog.box.top >= -1 &&
          representativeDialog.box.right <= state.viewport.width + 1 && representativeDialog.box.bottom <= state.viewport.height + 1,
          `${scenario.label} at ${target * 100}%: representative native dialog must fit the zoomed viewport.`
        );
        assert.ok(
          representativeDialog.close.width >= 43 && representativeDialog.close.height >= 43,
          `${scenario.label} at ${target * 100}%: representative dialog Close control must retain a 44px target within rendering tolerance.`
        );
        assert.ok(representativeDialog.reachedEnd, `${scenario.label} at ${target * 100}%: representative dialog must reach its scroll end.`);
        await client.call("Input.dispatchKeyEvent", {
          type: "rawKeyDown", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27
        });
        await client.call("Input.dispatchKeyEvent", {
          type: "keyUp", key: "Escape", code: "Escape", windowsVirtualKeyCode: 27, nativeVirtualKeyCode: 27
        });
        await waitForValue(client, `!document.querySelector('dialog.history-dialog[open]')`, `${scenario.label} ${target} zoom dialog close`);
        const representativeDialogClose = await evaluate(client, `(() => ({
          closed: !document.querySelector('dialog.history-dialog[open]'),
          focusReturned: document.activeElement === document.querySelector('button.history-door')
        }))()`);
        assert.ok(representativeDialogClose.closed, `${scenario.label} at ${target * 100}%: Escape must close the representative dialog.`);
        assert.ok(representativeDialogClose.focusReturned, `${scenario.label} at ${target * 100}%: representative dialog must return focus.`);
        if (scenario.label === "windows-150-percent-display-proxy" && target === 0.8) {
          assert.ok(Math.abs(state.viewport.width - 1600) <= 2, "The 150% Windows-display proxy plus real 80% Chrome zoom must exercise the expected ~1600 CSS-pixel width.");
          assert.ok(Math.abs(state.viewport.height - 759) <= 2, "The 150% Windows-display proxy plus real 80% Chrome zoom must exercise the expected ~759 CSS-pixel height.");
          assert.equal(state.navRows, 1, "The original scaled/zoomed failure case must retain one compact navigation row.");
          assert.ok(state.heroHeight <= 110, "The original scaled/zoomed failure case must retain a compact identity rail.");
        }
        results.push({
          kind: "native-zoom",
          scenario: scenario.label,
          baseMetrics: { width: scenario.width, height: scenario.height, dpr: scenario.dpr },
          requestedZoom: target,
          actualZoom,
          representativeDialog: { ...representativeDialog, ...representativeDialogClose },
          ...state
        });
      }
    }
    await setNativeBrowserZoom(client, 1);
    nativeZoomCoverage = {
      status: "passed",
      platform: process.platform,
      scenarios: nativeZoomScenarios.map(({ label, width, height, dpr, targets }) => ({
        label,
        width,
        height,
        dpr,
        targets
      }))
    };
  }

  const isLocalObservationUrl = (url) => typeof url === "string" && url.startsWith(baseUrl);
  const unexpectedBrowserObservations = {
    runtimeExceptions: browserObservations.runtimeExceptions,
    consoleErrors: browserObservations.consoleErrors.filter(
      (entry) => !entry.url || isLocalObservationUrl(entry.url)
    ),
    logErrors: browserObservations.logErrors.filter(
      (entry) => isLocalObservationUrl(entry.url) || (!entry.url && entry.source === "javascript")
    ),
    networkFailures: browserObservations.networkFailures.filter(
      (entry) =>
        isLocalObservationUrl(entry.url) &&
        relevantLocalResourceTypes.has(entry.type) &&
        !entry.canceled
    ),
    httpErrors: browserObservations.httpErrors.filter(
      (entry) => isLocalObservationUrl(entry.url) && relevantLocalResourceTypes.has(entry.type)
    )
  };
  const unexpectedBrowserObservationCount = Object.values(unexpectedBrowserObservations)
    .reduce((total, entries) => total + entries.length, 0);
  assert.ok(
    Object.values(browserObservationDrops).every((count) => count === 0),
    `Browser diagnostics exceeded the retained observation cap: ${JSON.stringify(browserObservationDrops)}.`
  );
  assert.equal(
    unexpectedBrowserObservationCount,
    0,
    `Unexpected local browser errors during Hub evidence run: ${JSON.stringify(unexpectedBrowserObservations, null, 2)}`
  );

  if (evidenceDir) {
    const evidence = {
      schemaVersion: "1.0",
      generatedAt: new Date().toISOString(),
      presentationRubric,
      tolerances: renderingTolerances,
      coverage: {
        geometry: "CSS viewport and device-pixel-ratio matrix through Chrome DevTools Protocol",
        nativeBrowserZoom: nativeZoomCoverage,
        platformModel: {
          chromeZoom: "native browser accelerator and Page.getLayoutMetrics verification on Windows",
          windowAndDisplayMetrics: "headless CDP device-metric emulation proxy; not proof of a physical monitor or Windows OS display setting"
        },
        screenshotMedia: {
          requirement: requireScreenshotMediaLoad
            ? "current-image-ready-and-welcome-iframe-load-event"
            : "settled-ready-or-unavailable",
          capturedStates: "recorded per geometry screenshot",
          welcomeIframeEvidence: "iframe-load-event-only",
          playbackProof: "not-claimed"
        }
      },
      buildFreshness,
      source: {
        publicationId: publication.publicationId,
        publicationSourceRevision: publication.sourceRevision,
        runtimeVersion: publication.runtime.version,
        snapshotId: publication.content.snapshotId,
        canonicalTransactionRevisions: buildFreshness.canonicalTransactionRevisions,
        rawDocumentBytes: buildFreshness.rawDocumentBytes,
        bootstrapSha256: publication.runtime.bootstrap.sha256,
        runtimeSha256: publication.runtime.script.sha256,
        styleSha256: publication.runtime.style.sha256,
        hostCompatSha256: publication.runtime.hostCompat.sha256
      },
      browser: browserVersion,
      browserObservations: {
        policy: {
          failing: "top-page runtime exceptions and console errors, local JavaScript log errors, and uncancelled local Document/Fetch/Image/Media/Script/Stylesheet/XHR loading or HTTP errors",
          nonFailing: "observed external-media loading/status failures and canceled local requests; media fallbacks are asserted in page state",
          retainedPerCategory: 250
        },
        droppedAfterLimit: browserObservationDrops,
        unexpected: unexpectedBrowserObservations,
        observed: browserObservations
      },
      results
    };
    await writeFile(
      resolve(evidenceStagingDir, "browser-matrix.json"),
      `${JSON.stringify(evidence, null, 2)}\n`,
      "utf8"
    );
  }
  evidenceCompleted = true;
} finally {
  try {
    await client?.call("Browser.close");
  } catch {
    chrome.kill();
  }
  client?.close();
  await new Promise((accept) => {
    if (chrome.exitCode !== null) accept();
    else {
      const timer = setTimeout(() => {
        chrome.kill();
        accept();
      }, 3_000);
      chrome.once("exit", () => {
        clearTimeout(timer);
        accept();
      });
    }
  });
  await new Promise((accept) => server.close(accept));
  await rm(profileDir, {
    recursive: true,
    force: true,
    maxRetries: process.platform === "win32" ? 12 : 3,
    retryDelay: 100
  });
  if (!evidenceCompleted && evidenceStagingDir) {
    await rm(evidenceStagingDir, { recursive: true, force: true });
    evidenceStagingDir = null;
  }
}

if (evidenceDir) {
  await replaceEvidenceDirectory(evidenceStagingDir, evidenceDir);
  evidenceStagingDir = null;
}

console.log(`[hub browser] ${results.filter((entry) => entry.kind === "geometry").length} zoom/responsive geometry states passed`);
console.log("[hub browser] native dialogs passed at desktop, short-wide, tablet, boundary, and phone sizes");
console.log("[hub browser] fallback dialog modality passed at desktop, boundary, and phone sizes");
console.log("[hub browser] published TWWL, intentional media-unavailable, empty, and loading lifecycle states passed across desktop, tablet, and phone fixtures");
console.log(`[hub browser] native browser zoom ${nativeZoomCoverage.status} on ${process.platform}`);
