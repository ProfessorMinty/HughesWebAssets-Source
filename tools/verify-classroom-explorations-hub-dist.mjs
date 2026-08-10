import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const [runtime, css, bootstrap, compat, manifestText] = await Promise.all([
  readFile(resolve(dist, "assets/classroom-explorations-hub.js"), "utf8"),
  readFile(resolve(dist, "assets/classroom-explorations-hub.css"), "utf8"),
  readFile(resolve(dist, "bootstrap.js"), "utf8"),
  readFile(resolve(dist, "host-compat.css"), "utf8"),
  readFile(resolve(dist, "hub.manifest.json"), "utf8"),
]);
const manifest = JSON.parse(manifestText);
const failures = [];

if (runtime.includes('manifestUrl:`/hub.manifest.json`') || runtime.includes('manifestUrl:"/hub.manifest.json"')) failures.push("runtime contains a root-relative manifest auto-mount");
if (/mountClassroomExplorationsHub\([^)]*querySelector\([^)]*hrv-classroom-explorations-root/.test(runtime)) failures.push("runtime appears to auto-mount itself");
if (!runtime.includes("mountClassroomExplorationsHub")) failures.push("runtime export name is missing");

for (const signature of ["data-release-manifest", "data-route", "data-path", "data-hrv-page-system", "fallback-missing", "release-url-missing", "loading-assets", "hrv-route-classroom-explorations-ready", "release.assets.compatStyle", "release.assets.content", "__HRV_CLASSROOM_EXPLORATIONS_BOOTSTRAP__"]) {
  if (!bootstrap.includes(signature)) failures.push(`bootstrap is missing contract signature: ${signature}`);
}

if (!compat.includes("html.hrv-route-classroom-explorations-ready body.page-id-17")) failures.push("host compatibility is not ready-gated");
if (!compat.includes("h1.entry-title") || !compat.includes("#secondary") || !compat.includes(".entry-content")) failures.push("host compatibility lost required shell rules");

for (const signature of ["hub-wrap", "Museum at a Glance", "Featured Exhibit Hall", "Learning Lantern", "Archive Gallery", "Learning Archive", "Previous School Years", "Zinnia Greenhouse"]) {
  if (!runtime.includes(signature)) failures.push(`runtime is missing museum signature: ${signature}`);
}

for (const signature of [".sky", ".parade", ".hub-hero", ".hero-badge", ".beam", ".zinnia-feature", ".lantern-feature", ".museum-divider", ".exhibit-gallery", ".learning-gallery", ".hub-foot", "prefers-reduced-motion", "hrvHubConfetti"]) {
  if (!css.includes(signature)) failures.push(`production CSS is missing museum signature: ${signature}`);
}

if (runtime.includes("hrv-hub-feature--exploration") || runtime.includes("hrv-hub-feature--twwl")) failures.push("generic replacement renderer signatures returned");
if (manifest.contentVersion !== "2026.08.10.4") failures.push("generated manifest contentVersion changed unexpectedly");
if (manifest.page?.museum?.kicker !== "Museum Entrance • Greenhouse Glow • Discovery Hub") failures.push("generated manifest lost museum entrance identity");
if (manifest.page?.museum?.footer !== "Pack your curiosity—adventures await.") failures.push("generated manifest lost museum footer identity");
if (JSON.stringify(manifest.page?.museum?.pillars) !== JSON.stringify(["Inquiry", "Teamwork", "Creativity", "Real-World Science"])) failures.push("generated manifest lost learning pillars");
if (manifest.records?.length !== 4) failures.push("launch museum manifest must contain exactly four records");
if (manifest.records?.some((record) => record.schoolYear === "2025-2026" && ["exploration", "twwl"].includes(record.type))) failures.push("legacy prior-year cards leaked into current Hub manifest");

if (failures.length) throw new Error(`[classroom-explorations-hub] dist verification failed:\n- ${failures.join("\n- ")}`);
console.log("[classroom-explorations-hub] dist verification passed: museum and repository release contract are locked.");
