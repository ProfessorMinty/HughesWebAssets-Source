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
const stylesheet = readText(
  "apps/classroom-explorations-hub/src/hub-v3.css"
);
const handoff = readText(
  "docs/edublogs-integration/classroom-explorations-hub-test/JAVASCRIPT-BOX.js"
);

assert.doesNotMatch(
  runtime,
  /Reduced Effects/i,
  "Hub runtime must not render a page-local Reduced Effects control."
);
assert.doesNotMatch(
  runtime,
  /localStorage/,
  "Hub runtime must not own a private effects preference."
);
assert.doesNotMatch(
  runtime,
  /EFFECTS_KEY|data-effects-toggle|manualReduced|wireEffects/,
  "Legacy page-local effects machinery must remain absent."
);
assert.match(runtime, /classList\.add\("hrv-hub-v2", "hrv-hub-v3"\)/);
assert.match(runtime, /data-hrv-auto-scroll-target/);

assert.match(stylesheet, /2026\.08\.28\.3-review/);
assert.match(stylesheet, /"Atkinson Hyperlegible"/);
assert.match(stylesheet, /"Nunito Sans"/);
assert.match(stylesheet, /--hub-type-body:\s*18px/);
assert.match(stylesheet, /--hub-type-body-secondary:\s*16px/);
assert.match(stylesheet, /--hub-type-label:\s*13px/);
assert.match(stylesheet, /--hub-type-action:\s*15px/);
assert.match(stylesheet, /--hub-type-card-title:\s*22px/);
assert.match(stylesheet, /--hub-type-memory-title:\s*20px/);
assert.match(stylesheet, /--hub-v2-shell:\s*min\([\s\S]*?1360px/);
assert.match(stylesheet, /--hub-v3-shell-wide:\s*min\([\s\S]*?1500px/);
assert.match(stylesheet, /--hub-v3-shell-theater:\s*min\([\s\S]*?1180px/);

assert.match(
  stylesheet,
  /\.hub-v2-controls,[\s\S]*?\.hub-v2-effects[\s\S]*?display:\s*none !important/
);
assert.doesNotMatch(stylesheet, /\[data-effects="reduced"\]/);

assert.match(
  stylesheet,
  /\.hub-v2-theater\s*\{[\s\S]*?grid-template-columns:[\s\S]*?0\.42fr[\s\S]*?0\.58fr/
);
assert.match(
  stylesheet,
  /\.hub-v2-screen\s*\{[\s\S]*?max-width:\s*720px/
);
assert.match(
  stylesheet,
  /\.hub-v2-screen::before\s*\{[\s\S]*?display:\s*none/
);

assert.match(
  stylesheet,
  /\.hub-v2-current-art\s*\{[\s\S]*?height:\s*clamp\(430px,\s*55svh,\s*510px\)/
);
assert.match(
  stylesheet,
  /\.hub-v2-current-name\s*\{[\s\S]*?3\.65rem/
);
assert.doesNotMatch(
  stylesheet,
  /\.hub-v2-current-art\s*\{[\s\S]*?min-height:\s*590px/
);

assert.match(
  stylesheet,
  /\.hub-v2-memory-list\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/
);
assert.match(
  stylesheet,
  /@media \(min-width:\s*921px\) and \(max-height:\s*820px\)/
);
assert.match(stylesheet, /@media \(prefers-reduced-motion:\s*reduce\)/);

assert.match(handoff, /2026\.08\.28\.3-review/);
assert.match(handoff, /runtime-v3\.js/);
assert.match(handoff, /hub-v3\.css/);
assert.doesNotMatch(handoff, /runtime-v2\.js/);

console.log(
  "[hub visual v3] global-shell effects ownership and page-local removal passed"
);
console.log(
  "[hub visual v3] 1920x911 density, theater framing, and Current-fit checks passed"
);
console.log(
  "[hub visual v3] Amadeus typography and readable compact text hierarchy passed"
);
console.log(
  "[hub visual v3] review doorway points at the 2026.08.28.3 review channel"
);
