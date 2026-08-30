import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readText = (relativePath) =>
  readFileSync(path.join(root, relativePath), "utf8");

const runtime = readText(
  "apps/classroom-explorations-hub/src/runtime-v3.js"
);
const stylesheetEntry = readText(
  "apps/classroom-explorations-hub/src/hub-v3.css"
);
const moduleNames = [
  "hub-foundation.css",
  "hub-hero-and-map.css",
  "hub-feature-rooms.css",
  "hub-galleries-and-motion.css",
  "hub-responsive.css"
];
const stylesheetModules = moduleNames.map((name) =>
  readText("apps/classroom-explorations-hub/src/" + name)
).join("\n");
const responsive = readText(
  "apps/classroom-explorations-hub/src/hub-responsive.css"
);
const hostCompatibility = readText(
  "apps/classroom-explorations-hub/src/host-compat.css"
);
const reviewBootstrap = readText(
  "apps/classroom-explorations-hub/src/review-bootstrap.js"
);
const source = readText(
  "apps/classroom-explorations-hub/source/hub.source.json"
);
const handoffHtml = readText(
  "docs/edublogs-integration/classroom-explorations-hub-test/HTML-BOX.html"
);
const handoffCss = readText(
  "docs/edublogs-integration/classroom-explorations-hub-test/CSS-BOX.css"
);
const handoffJs = readText(
  "docs/edublogs-integration/classroom-explorations-hub-test/JAVASCRIPT-BOX.js"
);

const reviewCommit = "0d112e3bcdbb2b5554c662aa1615aaba07b2876f";

assert.doesNotMatch(
  runtime,
  /Reduced Effects/i,
  "Hub runtime must not render a page-local Reduced Effects control."
);
assert.doesNotMatch(
  runtime,
  /localStorage|EFFECTS_KEY|data-effects-toggle|manualReduced|wireEffects|applyEffects/,
  "Hub runtime must not own a competing effects preference or product mode."
);
assert.match(runtime, /classList\.add\("hrv-hub-v2", "hrv-hub-v3"\)/);
assert.match(runtime, /data-hrv-auto-scroll-target/);

const welcomeAppend = runtime.indexOf("this.welcome()");
const currentAppend = runtime.indexOf("this.currentExploration()");
assert.ok(welcomeAppend >= 0 && currentAppend >= 0);
assert.ok(
  welcomeAppend < currentAppend,
  "Welcome Theater must remain before Current Exploration in DOM order."
);

assert.doesNotMatch(
  stylesheetEntry,
  /@import\s+url\([^)]*hub-v[12]\.css/i,
  "The active review stylesheet must not import a retired visual layer."
);
assert.doesNotMatch(
  stylesheetEntry,
  /hub-current-and-theater\.css|hub-galleries\.css/,
  "The active entry must not reference stylesheet modules that do not exist."
);
for (const name of moduleNames) {
  assert.match(
    stylesheetEntry,
    new RegExp(name.replace(".", "\\.")),
    `Missing active stylesheet module ${name}.`
  );
  assert.match(
    handoffJs,
    new RegExp(name.replace(".", "\\.")),
    `The Edublogs handoff must request ${name} directly.`
  );
}
assert.match(stylesheetEntry, /2026\.08\.29\.5-review/);
assert.match(handoffJs, /2026\.08\.29\.5-review/);
assert.match(handoffJs, new RegExp(reviewCommit));
assert.match(
  handoffJs,
  new RegExp("HughesWebAssets-Source@" + reviewCommit),
  "The page-2589 review doorway must load the exact green commit."
);
assert.doesNotMatch(
  handoffJs,
  /HughesWebAssets-Source@hub-authoring-v2-2026-08-28/,
  "The browser doorway must not load a mutable branch."
);
assert.match(handoffJs, /dataset\.stylesheets/);
assert.doesNotMatch(
  handoffJs,
  /dataset\.stylesheet\s*=/,
  "The review doorway must not rely on one top-level stylesheet with unchecked nested imports."
);

assert.match(reviewBootstrap, /data-stylesheets/);
assert.match(reviewBootstrap, /loadStylesheets\(stylesheetUrls\)/);
assert.match(reviewBootstrap, /Promise\.all/);
assert.match(reviewBootstrap, /restoreFallback/);
assert.match(reviewBootstrap, /data-hrv-review-release/);
assert.match(reviewBootstrap, /Stylesheet failed to load/);

assert.doesNotMatch(stylesheetModules, /--nll-dog|dog-3ebe6102df/i);
assert.match(stylesheetModules, /"Atkinson Hyperlegible"/);
assert.match(stylesheetModules, /"Nunito Sans"/);
assert.match(stylesheetModules, /--hub-shell-wide:\s*min\(1500px/);
assert.match(stylesheetModules, /--hub-shell-theater:\s*min\(1380px/);
assert.match(stylesheetModules, /\.hub-v2-welcome \{ order: 3; \}/);
assert.match(stylesheetModules, /\.hub-v2-current \{ order: 4; \}/);
assert.match(stylesheetModules, /hub-stars-drift-a/);
assert.match(stylesheetModules, /hub-stars-drift-b/);
assert.match(stylesheetModules, /hub-stars-breathe/);
assert.match(stylesheetModules, /@keyframes hub-stars-drift-a/);
assert.match(stylesheetModules, /@keyframes hub-stars-drift-b/);
assert.match(stylesheetModules, /@keyframes hub-stars-breathe/);
assert.match(stylesheetModules, /moon-stars-a1f5255f57/);
assert.match(stylesheetModules, /star-01-a3468124d1/);
assert.match(stylesheetModules, /aster-flower-30a7d2a32b/);
assert.match(stylesheetModules, /basil-stem-14f1cf0611/);
assert.match(stylesheetModules, /museum-e141ca5eb8/);
assert.match(stylesheetModules, /lantern-a4339a46aa/);
assert.match(stylesheetModules, /min-height:\s*clamp\(430px, 54svh, 510px\)/);
assert.match(stylesheetModules, /min-height:\s*clamp\(430px, 52svh, 500px\)/);
assert.match(stylesheetModules, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(stylesheetModules, /grid-template-columns:\s*repeat\(2, minmax\(0, 1fr\)\)/);
assert.match(stylesheetModules, /\.hub-v2-action-primary\s*\{[\s\S]*?color:\s*#061128/);
assert.match(stylesheetModules, /@media \(prefers-reduced-motion: reduce\)/);

assert.doesNotMatch(
  responsive,
  /#hrv-classroomexplorations-root/,
  "Responsive selectors must use the exact Hub root ID."
);
assert.match(hostCompatibility, /#colophon\.site-footer/);
assert.match(hostCompatibility, /\.scroll-container a/);
assert.match(hostCompatibility, /width:\s*100dvw !important/);
assert.match(hostCompatibility, /margin-left:\s*-50dvw !important/);

assert.match(
  source,
  /IMG_2850\.jpg\?format=750w/,
  "Current must retain the real Zinnia photograph."
);
assert.match(source, /kRTJp4pqbtg/);

assert.doesNotMatch(handoffHtml, /<svg[^>]*hrv-hub-outage__puppy/i);
assert.doesNotMatch(handoffHtml, /puppy/i);
assert.match(handoffHtml, /museum-e141ca5eb8/);
assert.doesNotMatch(handoffCss, /hrv-hub-outage__puppy/i);
assert.match(handoffCss, /"Atkinson Hyperlegible"/);
assert.match(handoffJs, /runtime-v3\.js/);
assert.match(handoffJs, /review-bootstrap\.js/);
assert.match(handoffJs, /hrv-hub-outage__puppy/);
assert.match(handoffJs, /museum-e141ca5eb8/);

console.log(
  "[hub visual v5] every intended stylesheet module is named correctly and requested directly"
);
console.log(
  "[hub visual v5] missing CSS modules fail closed before the application mounts"
);
console.log(
  "[hub visual v5] Welcome-before-Current hierarchy and real Zinnia media passed"
);
console.log(
  "[hub visual v5] moving atmosphere, dark action text, responsive selectors, and footer continuity passed"
);
console.log(
  "[hub visual v5] page 2589 is pinned to the exact green review commit"
);
console.log(
  "[hub visual v5] editor fallback contains no inline bear/puppy SVG"
);
