import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const runtimePath = resolve(dist, "assets/classroom-explorations-hub.js");
const cssPath = resolve(dist, "assets/classroom-explorations-hub.css");
const manifestPath = resolve(dist, "hub.manifest.json");
const [runtime, css, manifestText] = await Promise.all([
  readFile(runtimePath, "utf8"),
  readFile(cssPath, "utf8"),
  readFile(manifestPath, "utf8"),
]);
const manifest = JSON.parse(manifestText);

const failures = [];

if (runtime.includes('manifestUrl:`/hub.manifest.json`') || runtime.includes('manifestUrl:"/hub.manifest.json"')) {
  failures.push("runtime contains an Edublogs-root /hub.manifest.json auto-mount");
}
if (/mountClassroomExplorationsHub\([^)]*querySelector\([^)]*hrv-classroom-explorations-root/.test(runtime)) {
  failures.push("runtime appears to auto-mount itself instead of waiting for bootstrap ownership");
}
if (!runtime.includes("mountClassroomExplorationsHub")) {
  failures.push("runtime export name is missing from the production bundle");
}

const runtimeMuseumSignatures = [
  "hub-wrap",
  "Museum at a Glance",
  "Featured Exhibit Hall",
  "Learning Lantern",
  "Archive Gallery",
  "Learning Archive",
  "Previous School Years",
  "Pack your curiosity",
  "Zinnia Greenhouse",
];
for (const signature of runtimeMuseumSignatures) {
  if (!runtime.includes(signature)) failures.push(`runtime is missing museum signature: ${signature}`);
}

const cssMuseumSignatures = [
  ".sky",
  ".parade",
  ".hub-hero",
  ".hero-badge",
  ".beam",
  ".zinnia-feature",
  ".lantern-feature",
  ".museum-divider",
  ".exhibit-gallery",
  ".learning-gallery",
  ".hub-foot",
  "prefers-reduced-motion",
  "hrvHubConfetti",
];
for (const signature of cssMuseumSignatures) {
  if (!css.includes(signature)) failures.push(`production CSS is missing museum signature: ${signature}`);
}

if (runtime.includes("hrv-hub-feature--exploration") || runtime.includes("hrv-hub-feature--twwl")) {
  failures.push("generic replacement-card renderer signatures returned; backed-up museum renderer must remain authoritative");
}

if (manifest.contentVersion !== "2026.08.10.4") failures.push("generated manifest contentVersion is not the museum rebuild version");
if (manifest.page?.museum?.kicker !== "Museum Entrance • Greenhouse Glow • Discovery Hub") failures.push("generated manifest lost the museum entrance identity");
if (manifest.records?.length !== 4) failures.push("launch museum manifest must contain exactly four records");
if (manifest.records?.some((record) => record.schoolYear === "2025-2026" && ["exploration", "twwl"].includes(record.type))) failures.push("legacy 2025-2026 cards leaked back into the current Hub manifest");

if (failures.length) {
  throw new Error(`[classroom-explorations-hub] dist verification failed:\n- ${failures.join("\n- ")}`);
}

console.log("[classroom-explorations-hub] dist verification passed: single-owner runtime and backed-up museum identity are both locked.");
