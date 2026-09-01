import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const css = await readFile(resolve(root, "apps/classroom-explorations-hub/src/host-compat.css"), "utf8");
const scope = "html.hrv-page-classroom-explorations-ready body:is(.page-id-17, .page-id-2589) ";
const reviewScope = "html.hrv-page-classroom-explorations-ready body.page-id-2589 ";

assert(css.includes(".page-id-17"), "Host compatibility must retain production page 17 support.");
assert(css.includes(".page-id-2589"), "Host compatibility must support the active Hub review page 2589.");
assert(!css.includes("body.page-id-17"), "Host compatibility must not regress to page-17-only scoping.");

for (const required of [
  "#content.site-content.container",
  "#primary.content-area",
  "#main.site-main",
  ".entry-content",
  ".widget-area",
  ".entry-header",
  ".hentry",
  "#hrv-classroom-explorations-root",
  "width: 100vw !important",
  "left: 50% !important",
  "margin-left: -50vw !important",
  "margin-right: -50vw !important",
  "background: transparent !important",
  "overflow-x: clip !important"
]) {
  assert(css.includes(required), `Host compatibility is missing required breakout/reset contract: ${required}`);
}

assert.match(
  css,
  /html\.hrv-page-classroom-explorations-ready body\.page-id-2589 #masthead\.site-header,\s*html\.hrv-page-classroom-explorations-ready body\.page-id-2589 #sidebar-footer\.footer-widget-area\s*\{\s*display:\s*none\s*!important;\s*\}/,
  "Review page 2589 must remove the native masthead seam and empty footer-widget band only after the Hub is ready."
);
assert.doesNotMatch(
  css,
  /body(?:\.page-id-17|:is\([^)]*\.page-id-17[^)]*\))\s+#(?:masthead\.site-header|sidebar-footer\.footer-widget-area)/,
  "Phase 1 must not suppress page 17's native masthead or footer widget area."
);
assert.doesNotMatch(
  css,
  /#wpadminbar|body\.(?:logged-in|admin-bar)/,
  "Hub host compatibility must not depend on authentication state or suppress the Edublogs toolbar."
);

for (const match of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
  const selectorBlock = match[1].trim();
  if (!selectorBlock || selectorBlock.startsWith("@")) continue;
  for (const selector of selectorBlock.split(/,\s*\n/).map((value) => value.trim()).filter(Boolean)) {
    assert(
      selector.startsWith(scope) || selector.startsWith(reviewScope),
      `Host compatibility selector escaped approved Hub host scope: ${selector}`
    );
  }
}

console.log("[hub host compat] shared reset + page-2589-only seam removal + viewport breakout contract passed");
