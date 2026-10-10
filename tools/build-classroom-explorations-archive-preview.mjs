import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist/classroom-explorations-archive");
const snapshot = JSON.parse(await readFile(resolve(dist, "content-snapshot.json"), "utf8"));
const runtimeRelease = JSON.parse(await readFile(resolve(dist, "runtime/runtime-release.json"), "utf8"));
const hash = snapshot.snapshotId.slice("sha256:".length);
const digest = async (name) => createHash("sha256")
  .update(await readFile(resolve(dist, name)))
  .digest("hex");

const artwork = Object.fromEntries(Object.entries(runtimeRelease.artwork).map(([name, entry]) => [
  name,
  { path: `./runtime/${entry.path}`, sha256: entry.sha256, mediaType: entry.mediaType }
]));

const publication = {
  schemaVersion: "1.0",
  publicationId: "local-preview",
  pageId: "hrv-page:classroom-explorations-archive-2025-2026",
  pageType: "classroom-explorations-archive",
  sourceRevision: "working-tree",
  previousKnownGoodPublication: null,
  runtime: {
    version: "local-preview",
    runtimeSchemaVersion: "1.0",
    bootstrap: { path: "./runtime/bootstrap.js", sha256: await digest("runtime/bootstrap.js") },
    script: { path: "./runtime/runtime.js", sha256: await digest("runtime/runtime.js") },
    style: { path: "./runtime/archive.css", sha256: await digest("runtime/archive.css") },
    hostCompat: { path: "./runtime/host-compat.css", sha256: await digest("runtime/host-compat.css") },
    artwork
  },
  content: {
    snapshotId: snapshot.snapshotId,
    runtimeSchemaVersion: "1.0",
    manifest: {
      path: `./content/${hash}/manifest.json`,
      sha256: await digest(`content/${hash}/manifest.json`)
    }
  }
};

await writeFile(resolve(dist, "preview-publication.json"), `${JSON.stringify(publication, null, 2)}\n`, "utf8");
await writeFile(resolve(dist, "preview.html"), `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">
<title>Classroom Explorations: 2025–2026 Archive Preview</title>
<style>html{font-size:10px}body{margin:0;font:16px/1.5 system-ui,sans-serif;background:#061128;color:#fff}</style></head>
<body><section id="hrv-classroom-explorations-archive-root" data-hrv-page="hrv-page:classroom-explorations-archive-2025-2026" aria-live="polite">
<div data-hrv-outage-notice><h1>Classroom Explorations: 2025–2026 Archive</h1><p>Loading the local museum archive preview…</p></div>
</section><script src="./runtime/bootstrap.js" data-mount="hrv-classroom-explorations-archive-root" data-publication="./preview-publication.json"></script></body></html>`, "utf8");
console.log("[archive] exact local preview generated");
