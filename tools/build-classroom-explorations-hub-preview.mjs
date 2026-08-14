import { createHash } from "node:crypto";
import { readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const snapshot = JSON.parse(await readFile(resolve(dist, "content-snapshot.json"), "utf8"));
const hash = snapshot.snapshotId.slice("sha256:".length);
const digest = async (p) => createHash("sha256").update(await readFile(resolve(dist, p))).digest("hex");
const publication = {
  schemaVersion: "1.0",
  publicationId: "local-preview",
  pageId: "hrv-page:classroom-explorations",
  pageType: "classroom-explorations-hub",
  sourceRevision: "working-tree",
  previousKnownGoodPublication: null,
  runtime: {
    version: "local-preview",
    runtimeSchemaVersion: "1.0",
    bootstrap: { path: "./runtime/bootstrap.js", sha256: await digest("runtime/bootstrap.js") },
    script: { path: "./runtime/runtime.js", sha256: await digest("runtime/runtime.js") },
    style: { path: "./runtime/hub.css", sha256: await digest("runtime/hub.css") },
    hostCompat: { path: "./runtime/host-compat.css", sha256: await digest("runtime/host-compat.css") }
  },
  content: {
    snapshotId: snapshot.snapshotId,
    runtimeSchemaVersion: "1.0",
    manifest: { path: `./content/${hash}/manifest.json`, sha256: await digest(`content/${hash}/manifest.json`) }
  }
};
await writeFile(resolve(dist, "preview-publication.json"), `${JSON.stringify(publication, null, 2)}\n`, "utf8");
await writeFile(resolve(dist, "preview.html"), `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Classroom Explorations Preview</title></head><body style="margin:0"><section id="hrv-classroom-explorations-root"><div class="hrv-page-unavailable"><h1>Classroom Explorations</h1><p data-hrv-fallback-status>Loading local museum preview…</p></div></section><script src="./runtime/bootstrap.js" data-mount="hrv-classroom-explorations-root" data-publication="./preview-publication.json"></script></body></html>`, "utf8");
console.log("[hub] exact local preview generated");
