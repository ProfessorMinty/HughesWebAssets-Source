import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const required = [
  "dist/classroom-explorations-hub/runtime/bootstrap.js",
  "dist/classroom-explorations-hub/runtime/runtime.js",
  "dist/classroom-explorations-hub/runtime/hub.css",
  "dist/classroom-explorations-hub/runtime/host-compat.css",
  "dist/classroom-explorations-hub/runtime/runtime-release.json",
  "dist/classroom-explorations-hub/content-snapshot.json"
];

for (const path of required) await access(resolve(root, path));

const bootstrap = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/bootstrap.js"), "utf8");
const runtime = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/runtime.js"), "utf8");
const css = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/hub.css"), "utf8");
const release = JSON.parse(await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/runtime-release.json"), "utf8"));
const content = JSON.parse(await readFile(resolve(root, "dist/classroom-explorations-hub/content-snapshot.json"), "utf8"));

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

console.log("[hub verify] clean runtime artifact set verified");
console.log(`[hub verify] snapshot ${content.snapshotId}`);
for (const [name, asset] of Object.entries(release.assets)) {
  console.log(`[hub verify] ${name} sha256:${asset.sha256}`);
}
