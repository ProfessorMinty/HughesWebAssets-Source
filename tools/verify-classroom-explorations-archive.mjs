import { createHash } from "node:crypto";
import { access, readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const dist = resolve(root, "dist/classroom-explorations-archive");
const required = [
  "runtime/bootstrap.js",
  "runtime/runtime.js",
  "runtime/archive.css",
  "runtime/host-compat.css",
  "runtime/runtime-release.json",
  "runtime/assets/history/past-years.webp",
  "runtime/assets/frame/top-left.webp",
  "runtime/assets/frame/top-right.webp",
  "runtime/assets/frame/middle-left.webp",
  "runtime/assets/frame/middle-right.webp",
  "runtime/assets/frame/bottom-left.webp",
  "runtime/assets/frame/bottom-right.webp",
  "content-snapshot.json",
  "preview-publication.json",
  "preview.html"
];
for (const name of required) await access(resolve(dist, name));

const release = JSON.parse(await readFile(resolve(dist, "runtime/runtime-release.json"), "utf8"));
const snapshot = JSON.parse(await readFile(resolve(dist, "content-snapshot.json"), "utf8"));
const contentHash = snapshot.snapshotId.slice("sha256:".length);
const manifest = JSON.parse(await readFile(resolve(dist, `content/${contentHash}/manifest.json`), "utf8"));
const runtimeText = await readFile(resolve(dist, "runtime/runtime.js"), "utf8");
const bootstrapText = await readFile(resolve(dist, "runtime/bootstrap.js"), "utf8");
const cssText = await readFile(resolve(dist, "runtime/archive.css"), "utf8");
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");

if (
  release.schemaVersion !== "1.0" ||
  release.pageId !== "hrv-page:classroom-explorations-archive-2025-2026" ||
  release.pageType !== "classroom-explorations-archive" ||
  release.runtimeSchemaVersion !== "1.0"
) throw new Error("Archive runtime release identity is invalid.");

const expectedAssets = {
  bootstrap: "bootstrap.js",
  script: "runtime.js",
  style: "archive.css",
  hostCompat: "host-compat.css"
};
const expectedArtwork = {
  pastYears: "assets/history/past-years.webp",
  frameTopLeft: "assets/frame/top-left.webp",
  frameTopRight: "assets/frame/top-right.webp",
  frameMiddleLeft: "assets/frame/middle-left.webp",
  frameMiddleRight: "assets/frame/middle-right.webp",
  frameBottomLeft: "assets/frame/bottom-left.webp",
  frameBottomRight: "assets/frame/bottom-right.webp"
};
if (Object.keys(release.assets || {}).join("|") !== Object.keys(expectedAssets).join("|")) {
  throw new Error("Archive runtime asset map is missing or unstable.");
}
if (Object.keys(release.artwork || {}).join("|") !== Object.keys(expectedArtwork).join("|")) {
  throw new Error("Archive artwork map is missing or unstable.");
}
for (const [name, path] of Object.entries(expectedAssets)) {
  const entry = release.assets[name];
  const bytes = await readFile(resolve(dist, "runtime", path));
  if (entry.path !== path || digest(bytes) !== entry.sha256) {
    throw new Error(`Archive runtime asset digest mismatch: ${path}`);
  }
}
for (const [name, path] of Object.entries(expectedArtwork)) {
  const entry = release.artwork[name];
  const bytes = await readFile(resolve(dist, "runtime", path));
  if (entry.path !== path || entry.mediaType !== "image/webp" || digest(bytes) !== entry.sha256) {
    throw new Error(`Archive artwork digest mismatch: ${path}`);
  }
  if (bytes.subarray(0, 4).toString("ascii") !== "RIFF" || bytes.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error(`Archive artwork is not a WebP file: ${path}`);
  }
}

const listFiles = async (directory, prefix = "") => {
  const files = [];
  for (const entry of (await readdir(directory, { withFileTypes: true })).sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(resolve(directory, entry.name), relative));
    else if (entry.isFile()) files.push(relative);
    else throw new Error(`Unsupported archive runtime entry: ${relative}`);
  }
  return files;
};
const expectedRuntimeFiles = [
  ...Object.values(expectedAssets),
  ...Object.values(expectedArtwork),
  "runtime-release.json"
].sort();
if ((await listFiles(resolve(dist, "runtime"))).join("|") !== expectedRuntimeFiles.join("|")) {
  throw new Error("Archive runtime file set does not match its release contract.");
}

if (!runtimeText.includes("export function mountClassroomExplorationsArchive")) {
  throw new Error("Archive runtime mount export missing.");
}
if (!bootstrapText.includes("dataset.publication")) throw new Error("Archive bootstrap publication handoff missing.");
if (/@import\b/i.test(cssText)) throw new Error("Archive stylesheet must remain import-free.");
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(cssText)) {
  throw new Error("Archive OS reduced-motion gate missing.");
}
if (manifest.snapshotId !== snapshot.snapshotId || manifest.page?.id !== release.pageId) {
  throw new Error("Archive runtime/content snapshot compatibility failed.");
}
if (manifest.collections?.explorations?.length !== 3 || manifest.collections?.twwl?.length !== 5) {
  throw new Error("Archive must contain the approved 3 + 5 collection.");
}
if (!manifest.collections.explorations.some((item) => (
  item.id === "butterflies-in-the-classroom" &&
  item.href === "https://rmhughes.edublogs.org/hub/exploration-butterflies/"
))) throw new Error("Canonical Butterflies destination missing from archive.");
if (/exploration-cats-in-the-classroom|caterpillars-in-the-classroom-historical/.test(JSON.stringify(manifest))) {
  throw new Error("Obsolete Caterpillars destination leaked into archive.");
}

console.log("[archive verify] runtime, content, artwork, and exact local preview verified");
console.log(`[archive verify] snapshot ${snapshot.snapshotId}`);
for (const [name, asset] of Object.entries(release.assets)) {
  console.log(`[archive verify] ${name} sha256:${asset.sha256}`);
}
