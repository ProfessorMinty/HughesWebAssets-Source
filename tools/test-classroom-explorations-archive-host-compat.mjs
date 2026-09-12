import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const css = await readFile(resolve(root, "apps/classroom-explorations-archive/src/host-compat.css"), "utf8");
const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
const scope = "html.hrv-page-classroom-explorations-archive-ready body.page-id-2627 ";

assert.deepEqual(
  [...new Set([...css.matchAll(/\.page-id-(\d+)/g)].map((match) => match[1]))],
  ["2627"],
  "Archive host compatibility must target WordPress Page 2627 only."
);

for (const required of [
  "#page",
  "#masthead.site-header",
  "#sidebar-footer.footer-widget-area",
  "#content.site-content.container",
  "#primary.content-area",
  "#main.site-main",
  ".entry-content",
  ".widget-area",
  ".entry-header",
  ".hentry",
  "#hrv-classroom-explorations-archive-root",
  "#colophon.site-footer",
  "width: 100vw !important",
  "width: 100dvw !important",
  "left: 50% !important",
  "margin-left: -50vw !important",
  "margin-left: -50dvw !important",
  "margin-right: -50vw !important",
  "margin-right: -50dvw !important",
  "background: transparent !important",
  "overflow-x: clip !important"
]) {
  assert(css.includes(required), `Archive host compatibility is missing required Page 2627 boundary behavior: ${required}`);
}

assert.match(
  css,
  /html\.hrv-page-classroom-explorations-archive-ready body\.page-id-2627 #masthead\.site-header,\s*html\.hrv-page-classroom-explorations-archive-ready body\.page-id-2627 #sidebar-footer\.footer-widget-area\s*\{\s*display:\s*none\s*!important;\s*\}/,
  "The native masthead seam and empty footer-widget band may disappear only after the Page 2627 archive is ready."
);
assert.doesNotMatch(
  css,
  /#wpadminbar|body\.(?:logged-in|admin-bar)|\.logged-in\b|\.admin-bar\b|:has\(/,
  "Archive host compatibility must not depend on authentication state, toolbar presence, or relational DOM guesses."
);
assert.doesNotMatch(
  css,
  /(^|[,{]\s*)body\.page-id-2627\b/m,
  "Every Page 2627 override must be gated by the archive-ready document class."
);

for (const match of cssWithoutComments.matchAll(/([^{}]+)\{[^{}]*\}/g)) {
  const selectorBlock = match[1].trim();
  if (!selectorBlock || selectorBlock.startsWith("@")) continue;
  for (const selector of selectorBlock.split(/,\s*\n/).map((value) => value.trim()).filter(Boolean)) {
    assert(
      selector.startsWith(scope),
      `Archive host compatibility selector escaped the ready-gated Page 2627 scope: ${selector}`
    );
  }
}

console.log("[archive host compat] Page 2627-only ready gate, viewport breakout, and native-shell transition passed");
console.log("[archive host compat] no authentication-dependent or cross-page selector passed");
