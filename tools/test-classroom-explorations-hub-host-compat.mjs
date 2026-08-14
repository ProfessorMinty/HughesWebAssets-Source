import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const css = await readFile(resolve(root, "apps/classroom-explorations-hub/src/host-compat.css"), "utf8");
const scope = "html.hrv-page-classroom-explorations-ready body:is(.page-id-17, .page-id-2589) ";

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

for (const match of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
  const selectorBlock = match[1].trim();
  if (!selectorBlock || selectorBlock.startsWith("@")) continue;
  for (const selector of selectorBlock.split(/,\s*\n/).map((value) => value.trim()).filter(Boolean)) {
    assert(selector.startsWith(scope), `Host compatibility selector escaped approved Hub host scope: ${selector}`);
  }
}

console.log("[hub host compat] page 17 + page 2589 ready-state scoping + Amadeus reset + viewport breakout contract passed");
