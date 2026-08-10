import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const integration = resolve(root, "docs/edublogs-integration/classroom-explorations-hub");
const [runtime, css, bootstrap, compat, manifestText, htmlBox, cssBox, jsBox] = await Promise.all([
  readFile(resolve(dist, "assets/classroom-explorations-hub.js"), "utf8"),
  readFile(resolve(dist, "assets/classroom-explorations-hub.css"), "utf8"),
  readFile(resolve(dist, "bootstrap.js"), "utf8"),
  readFile(resolve(dist, "host-compat.css"), "utf8"),
  readFile(resolve(dist, "hub.manifest.json"), "utf8"),
  readFile(resolve(integration, "HTML-BOX.html"), "utf8"),
  readFile(resolve(integration, "CSS-BOX.css"), "utf8"),
  readFile(resolve(integration, "JAVASCRIPT-BOX.js"), "utf8"),
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

for (const signature of [
  "hub-wrap",
  "Museum at a Glance",
  "Featured Exhibit Hall",
  "Learning Lantern",
  "Archive Gallery",
  "Learning Archive",
  "Previous School Years",
  "Zinnia Greenhouse",
  "museum-now-floor",
  "museum-lantern-zone",
  "museum-archive-floor",
  "theater-room",
  "greenhouse-room",
  "lantern-room",
  "archive-portal-room",
  "archive-empty-scene",
  "museum-magic-06",
]) {
  if (!runtime.includes(signature)) failures.push(`runtime is missing museum signature: ${signature}`);
}

for (const signature of [
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
  ".museum-now-floor",
  ".museum-lantern-zone",
  ".museum-archive-floor",
  ".theater-room",
  ".greenhouse-room",
  ".lantern-room",
  ".archive-portal-room",
  ".archive-empty-scene",
  ".hero-magic",
  ".comets",
  "hrvMagicComets",
  "hrvCompassBreathe",
  "hrvMuseumArrive",
  "prefers-reduced-motion",
  "hrvHubConfetti",
]) {
  if (!css.includes(signature)) failures.push(`production CSS is missing museum signature: ${signature}`);
}

/* Edublogs integration contract: HTML = semantic fallback, CSS = fallback readability,
   JavaScript = tiny page-local loader. The magical page itself stays repository-owned. */
if (!htmlBox.includes('id="hrv-classroom-explorations-root"')) failures.push("HTML box lost Hub mount root");
if (!htmlBox.includes('data-hrv-page="classroom-explorations"') || !htmlBox.includes('data-hrv-page-system="classroom-explorations-hub"')) failures.push("HTML box lost semantic route contract");
if (!htmlBox.includes("data-hrv-fallback")) failures.push("HTML box lost truthful native fallback");
if (/<script\b/i.test(htmlBox)) failures.push("HTML box must not launch repository scripts");
if (/<style\b/i.test(htmlBox)) failures.push("HTML box must not own Hub styling");

if (!cssBox.includes("#hrv-classroom-explorations-root.hrv-native-fallback")) failures.push("CSS box lost fallback-only root styling");
for (const forbidden of ["@keyframes", ".aurora", ".hub-hero", ".zinnia-feature", ".lantern-feature", ".museum-divider"]) {
  if (cssBox.includes(forbidden)) failures.push(`Edublogs CSS box leaked repository presentation: ${forbidden}`);
}

try {
  // Parse the exact Edublogs JavaScript tab as classic script syntax during CI.
  // Dynamic import() is supported by the Node version used in the workflow.
  new Function(jsBox);
} catch (error) {
  failures.push(`Edublogs JavaScript loader has invalid syntax: ${error?.message || error}`);
}

for (const signature of [
  "__HRV_CLASSROOM_EXPLORATIONS_PAGE_LOADER__",
  "page-local-0.3.0",
  "EXPECTED_RELEASE = '2026.08.10.6'",
  "RELEASE_MANIFEST",
  "data-hrv-classroom-explorations-style",
  "validateContentManifest",
  "import(runtimeUrl)",
  "removeInjectedStyles",
  "hrv-route-classroom-explorations-ready",
  "__HRV_CLASSROOM_EXPLORATIONS_DIAGNOSTICS__",
  "prefers-reduced-motion: reduce",
  "scheduleIntegrationDiagnostics",
]) {
  if (!jsBox.includes(signature)) failures.push(`JavaScript box is missing page-loader signature: ${signature}`);
}
if (jsBox.includes("document.currentScript")) failures.push("Edublogs JavaScript loader must not depend on an HTML script tag");
if (!jsBox.includes("Validate data and the module before introducing enhanced CSS")) failures.push("page-local loader lost validate-before-style safety rule");

if (runtime.includes("hrv-hub-feature--exploration") || runtime.includes("hrv-hub-feature--twwl")) failures.push("generic replacement renderer signatures returned");
if (manifest.contentVersion !== "2026.08.10.4") failures.push("generated manifest contentVersion changed unexpectedly");
if (manifest.page?.museum?.kicker !== "Museum Entrance • Greenhouse Glow • Discovery Hub") failures.push("generated manifest lost museum entrance identity");
if (manifest.page?.museum?.footer !== "Pack your curiosity—adventures await.") failures.push("generated manifest lost museum footer identity");
if (JSON.stringify(manifest.page?.museum?.pillars) !== JSON.stringify(["Inquiry", "Teamwork", "Creativity", "Real-World Science"])) failures.push("generated manifest lost learning pillars");
if (manifest.records?.length !== 4) failures.push("launch museum manifest must contain exactly four records");
if (manifest.records?.some((record) => record.schoolYear === "2025-2026" && ["exploration", "twwl"].includes(record.type))) failures.push("legacy prior-year cards leaked into current Hub manifest");

if (failures.length) throw new Error(`[classroom-explorations-hub] dist verification failed:\n- ${failures.join("\n- ")}`);
console.log("[classroom-explorations-hub] dist verification passed: museum runtime, .6 magic composition, and Black-Hole-style three-surface Edublogs seam are locked.");
