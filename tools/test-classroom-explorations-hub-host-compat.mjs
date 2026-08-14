import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const css = await readFile(resolve(root, "apps/classroom-explorations-hub/src/host-compat.css"), "utf8");
const scope = "html.hrv-page-classroom-explorations-ready body ";

assert(!css.includes("page-id-17"), "Host compatibility must not depend on live WordPress page 17 so the approved test page can prove the same runtime.");

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
  "margin-right: -50vw !important"
]) {
  assert(css.includes(required), `Host compatibility is missing required breakout/reset contract: ${required}`);
}

for (const match of css.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
  const selectorBlock = match[1].trim();
  if (!selectorBlock || selectorBlock.startsWith("@")) continue;
  for (const selector of selectorBlock.split(",").map((value) => value.trim()).filter(Boolean)) {
    assert(selector.startsWith(scope), `Host compatibility selector escaped application-ready scope: ${selector}`);
  }
}

console.log("[hub host compat] ready-state scoping + Amadeus ancestor reset + viewport breakout contract passed");
