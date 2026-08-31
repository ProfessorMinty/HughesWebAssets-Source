import { access, readFile, readdir } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const required = [
  "dist/classroom-explorations-hub/runtime/bootstrap.js",
  "dist/classroom-explorations-hub/runtime/runtime.js",
  "dist/classroom-explorations-hub/runtime/hub.css",
  "dist/classroom-explorations-hub/runtime/host-compat.css",
  "dist/classroom-explorations-hub/runtime/runtime-release.json",
  "dist/classroom-explorations-hub/runtime/assets/history/past-explorations.webp",
  "dist/classroom-explorations-hub/runtime/assets/history/past-twwl.webp",
  "dist/classroom-explorations-hub/runtime/assets/history/past-years.webp",
  "dist/classroom-explorations-hub/runtime/assets/frame/top-left.webp",
  "dist/classroom-explorations-hub/runtime/assets/frame/top-right.webp",
  "dist/classroom-explorations-hub/runtime/assets/frame/middle-left.webp",
  "dist/classroom-explorations-hub/runtime/assets/frame/middle-right.webp",
  "dist/classroom-explorations-hub/runtime/assets/frame/bottom-left.webp",
  "dist/classroom-explorations-hub/runtime/assets/frame/bottom-right.webp",
  "dist/classroom-explorations-hub/content-snapshot.json"
];

for (const path of required) await access(resolve(root, path));

const bootstrap = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/bootstrap.js"), "utf8");
const runtime = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/runtime.js"), "utf8");
const css = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/hub.css"), "utf8");
const release = JSON.parse(await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/runtime-release.json"), "utf8"));
const content = JSON.parse(await readFile(resolve(root, "dist/classroom-explorations-hub/content-snapshot.json"), "utf8"));
const digest = (bytes) => createHash("sha256").update(bytes).digest("hex");
const listFiles = async (directory, prefix = "") => {
  const files = [];
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);
  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolutePath, relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new Error(`Unsupported packaged Hub artwork entry: ${relativePath}`);
  }
  return files;
};

if (/museum-lantern-zone|reef-feature|zinnia-feature|archive-portal-room|classroom-explorations-hub\.schema\.json/.test(bootstrap + runtime + css)) {
  throw new Error("Rejected modernization implementation token leaked into clean runtime.");
}
if (!bootstrap.includes("dataset.publication")) throw new Error("Bootstrap publication handoff missing.");
if (!runtime.includes("export function mountClassroomExplorationsHub")) throw new Error("Canonical runtime mount export missing.");
if (/@import\b/i.test(css)) throw new Error("Canonical Hub stylesheet must be import-free.");
if (!/@media\s*\(prefers-reduced-motion:\s*reduce\)/i.test(css)) throw new Error("OS reduced-motion presentation gate missing.");
if (/Reduced Effects|localStorage|EFFECTS_KEY|data-effects-toggle|manualReduced|data-effects\s*=|\[data-effects/i.test(runtime + css)) {
  throw new Error("Hub-local effects preference leaked into canonical presentation.");
}
if (Object.values(release.assets).map((asset) => asset.path).sort().join("|") !== "bootstrap.js|host-compat.css|hub.css|runtime.js") {
  throw new Error("Runtime release must contain one bootstrap, one runtime, one app stylesheet, and one host stylesheet.");
}
for (const asset of Object.values(release.assets)) {
  const bytes = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime", asset.path));
  if (digest(bytes) !== asset.sha256) throw new Error(`Runtime asset digest mismatch: ${asset.path}`);
}

const expectedArtwork = {
  pastExplorations: "assets/history/past-explorations.webp",
  pastTwwl: "assets/history/past-twwl.webp",
  pastYears: "assets/history/past-years.webp",
  frameTopLeft: "assets/frame/top-left.webp",
  frameTopRight: "assets/frame/top-right.webp",
  frameMiddleLeft: "assets/frame/middle-left.webp",
  frameMiddleRight: "assets/frame/middle-right.webp",
  frameBottomLeft: "assets/frame/bottom-left.webp",
  frameBottomRight: "assets/frame/bottom-right.webp"
};
if (Object.keys(release.artwork || {}).join("|") !== Object.keys(expectedArtwork).join("|")) {
  throw new Error("Runtime release artwork map is missing or unstable.");
}
const packagedArtworkFiles = await listFiles(resolve(root, "dist/classroom-explorations-hub/runtime/assets"), "assets");
if (packagedArtworkFiles.join("|") !== Object.values(expectedArtwork).sort().join("|")) {
  throw new Error("Packaged Hub artwork files do not exactly match the runtime artwork map.");
}
for (const [name, expectedPath] of Object.entries(expectedArtwork)) {
  const artwork = release.artwork[name];
  if (artwork.path !== expectedPath || artwork.mediaType !== "image/webp") {
    throw new Error(`Runtime artwork contract mismatch: ${name}`);
  }
  const sourceBytes = await readFile(resolve(root, "apps/classroom-explorations-hub/src", artwork.path));
  const packagedBytes = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime", artwork.path));
  if (!sourceBytes.equals(packagedBytes) || digest(packagedBytes) !== artwork.sha256) {
    throw new Error(`Runtime artwork bytes or digest mismatch: ${artwork.path}`);
  }
  if (packagedBytes.subarray(0, 4).toString("ascii") !== "RIFF" || packagedBytes.subarray(8, 12).toString("ascii") !== "WEBP") {
    throw new Error(`Runtime artwork is not a WebP file: ${artwork.path}`);
  }
}

console.log("[hub verify] clean runtime artifact set verified");
console.log(`[hub verify] snapshot ${content.snapshotId}`);
for (const [name, asset] of Object.entries(release.assets)) {
  console.log(`[hub verify] ${name} sha256:${asset.sha256}`);
}
for (const [name, artwork] of Object.entries(release.artwork)) {
  console.log(`[hub verify] artwork.${name} sha256:${artwork.sha256}`);
}
