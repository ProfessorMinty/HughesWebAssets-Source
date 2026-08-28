import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readText = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");

const runtime = readText("apps/classroom-explorations-hub/src/runtime-v3.js");
const stylesheet = readText("apps/classroom-explorations-hub/src/hub-v3.css");
const handoff = readText("docs/edublogs-integration/classroom-explorations-hub-test/JAVASCRIPT-BOX.js");

assert.doesNotMatch(runtime, /Reduced Effects/i, "Hub runtime must not render a page-local Reduced Effects control.");
assert.doesNotMatch(runtime, /localStorage/, "Hub runtime must not own a private effects preference.");
assert.doesNotMatch(runtime, /EFFECTS_KEY|data-effects-toggle|manualReduced|wireEffects/, "Legacy page-local effects machinery must remain absent.");
assert.match(runtime, /classList\.add\("hrv-hub-v2", "hrv-hub-v3"\)/);
assert.match(runtime, /version: "2026\.08\.28\.2-review"/);
assert.match(runtime, /data-hrv-auto-scroll-target/);

assert.match(stylesheet, /"Atkinson Hyperlegible"/);
assert.match(stylesheet, /"Nunito Sans"/);
assert.match(stylesheet, /--hub-type-body: 20px/);
assert.match(stylesheet, /--hub-type-body-secondary: 18px/);
assert.match(stylesheet, /--hub-type-label: 14px/);
assert.match(stylesheet, /--hub-type-action: 16px/);
assert.match(stylesheet, /--hub-type-card-title: 25px/);
assert.match(stylesheet, /--hub-v2-shell: min\(1520px/);
assert.match(stylesheet, /--hub-v3-shell-wide: min\(1720px/);
assert.match(stylesheet, /\.hub-v2-controls,[\s\S]*?\.hub-v2-effects[\s\S]*?display: none !important/);
assert.match(stylesheet, /var\(--hrv-native-structure\)/);
assert.match(stylesheet, /@media \(prefers-reduced-motion: reduce\)/);
assert.doesNotMatch(stylesheet, /\[data-effects="reduced"\]/);

assert.match(handoff, /2026\.08\.28\.2-review/);
assert.match(handoff, /runtime-v3\.js/);
assert.match(handoff, /hub-v3\.css/);
assert.doesNotMatch(handoff, /runtime-v2\.js/);

console.log("[hub visual v3] global-shell effects ownership and page-local removal passed");
console.log("[hub visual v3] 1920px full-width shells and Amadeus typography baseline passed");
console.log("[hub visual v3] review doorway points at the corrected runtime and stylesheet");
