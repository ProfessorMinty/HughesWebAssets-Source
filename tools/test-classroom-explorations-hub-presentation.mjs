import assert from "node:assert/strict";
import { createHash } from "node:crypto";
import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";
import { projectHubRuntime } from "./lib/classroom-explorations-hub-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const readText = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));
const sha256 = (relativePath) => createHash("sha256")
  .update(readFileSync(path.join(root, relativePath)))
  .digest("hex");

const sourcePath = "apps/classroom-explorations-hub/source/hub.source.json";
const routesPath = "registry/hrv-routes.source.json";
const controlPath = "apps/classroom-explorations-hub/source/hub.control.json";
const runtimePath = "apps/classroom-explorations-hub/src/runtime.js";
const cssPath = "apps/classroom-explorations-hub/src/hub.css";
const bootstrapPath = "apps/classroom-explorations-hub/src/bootstrap.js";
const hostCompatPath = "apps/classroom-explorations-hub/src/host-compat.css";
const artworkPaths = {
  pastExplorations: "apps/classroom-explorations-hub/src/assets/history/past-explorations.webp",
  pastTwwl: "apps/classroom-explorations-hub/src/assets/history/past-twwl.webp",
  pastYears: "apps/classroom-explorations-hub/src/assets/history/past-years.webp"
};

assert.equal(sha256(sourcePath), "3c85a2ce02f4ff11c337c8d28444604907971d4c2ca59d74d65e20b3ee009977");
assert.equal(sha256(routesPath), "29ab9bc8262b128b2222d4a115b3906701f0d5747f6d3ebcab059680204c1a73");
assert.equal(sha256(controlPath), "7784b2d569ba13bf45ef512ca48c431166d6e249a75ad13058f848dca55110be");
assert.equal(sha256(bootstrapPath), "23d850ddad85cd17a25a32c2545565cfad84073ad290845448db2486ed1d7e2c");
assert.equal(sha256(runtimePath), "d650bebb20bdc32fd9270c5e9b93ad805d8e687ff31073214dff35fea93061b7");
assert.equal(sha256(cssPath), "d55e773aebb5832d46b9bde7b91c938f3222061b6a82591c2f77d57764bdee99");
assert.equal(sha256(hostCompatPath), "cd3bdebe94f39533e895764e126de568fb8221f7030157c79713df09c3d8d300");
assert.deepEqual(
  Object.fromEntries(Object.entries(artworkPaths).map(([key, relativePath]) => [key, sha256(relativePath)])),
  {
    pastExplorations: "b524f0839bc50a38fde72ed418cb288753ca238eadb7e9cea3bf33d93625e983",
    pastTwwl: "dcece4282c73dce3026c8233d333bdde78082249392b45d159eb090fef76d425",
    pastYears: "5c221b1f900d49cdc01c6c6fe45ea8340fabbb5ae299094e5708df05770941a4"
  },
  "The three approved history-door WebP files must retain their verified source bytes."
);

const source = readJson(sourcePath);
const routes = readJson(routesPath);
const manifest = projectHubRuntime(source, routes);
const runtimeText = readText(runtimePath);
const css = readText(cssPath);
const bootstrap = readText(bootstrapPath);
const hostCompat = readText(hostCompatPath);
const staticInvariantNote = "Static source invariant only; real-browser visual acceptance remains a separate gate.";
const parseCssRules = (cssText) => [...cssText.replace(/\/\*[\s\S]*?\*\//g, "").matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selectors: match[1].split(",").map((selector) => selector.trim()),
  body: match[2]
}));
const cssRules = parseCssRules(css);
const assertCssRuleIn = (rules, selector, expected, description) => {
  const bodies = rules
    .filter((rule) => rule.selectors.includes(selector))
    .map((rule) => rule.body);

  assert.ok(bodies.length, `Missing CSS rule for ${selector}. ${staticInvariantNote}`);
  assert.ok(
    bodies.some((body) => expected.test(body)),
    `${description}. ${staticInvariantNote}`
  );
};
const assertCssRule = (selector, expected, description) => {
  assertCssRuleIn(cssRules, selector, expected, description);
};
const extractLastCssBlock = (cssText, header) => {
  const headerIndex = cssText.lastIndexOf(header);
  assert.notEqual(headerIndex, -1, `Missing CSS block: ${header}. ${staticInvariantNote}`);
  const openIndex = cssText.indexOf("{", headerIndex + header.length);
  assert.notEqual(openIndex, -1, `Missing opening brace for ${header}. ${staticInvariantNote}`);

  let depth = 0;
  for (let index = openIndex; index < cssText.length; index += 1) {
    if (cssText[index] === "{") depth += 1;
    if (cssText[index] === "}") depth -= 1;
    if (depth === 0) return cssText.slice(openIndex + 1, index);
  }

  assert.fail(`Missing closing brace for ${header}. ${staticInvariantNote}`);
};
const panoramicCss = extractLastCssBlock(css, "@media (min-width: 1440px)");
const panoramicRules = parseCssRules(panoramicCss);
const definitiveTypographyMarker = "Definitive desktop typography system.";
const definitiveTypographyIndex = panoramicCss.indexOf(definitiveTypographyMarker);
assert.notEqual(
  definitiveTypographyIndex,
  -1,
  `Wide desktop must end with one definitive role-based typography system. ${staticInvariantNote}`
);
const definitiveTypographyCss = panoramicCss.slice(definitiveTypographyIndex);
const definitiveTypographyRules = parseCssRules(definitiveTypographyCss);
assert.doesNotMatch(
  css,
  /-?(?:\d+(?:\.\d+)?|\.\d+)rem\b/,
  `Hub dimensions must not depend on the Amadeus document root font size. ${staticInvariantNote}`
);
assert.doesNotMatch(
  hostCompat,
  /-?(?:\d+(?:\.\d+)?|\.\d+)rem\b/,
  `Host compatibility dimensions must not depend on the Amadeus document root font size. ${staticInvariantNote}`
);
const assertPanoramicRule = (selector, expected, description) => {
  assertCssRuleIn(panoramicRules, selector, expected, description);
};
const assertDefinitiveTypographyRule = (selector, expected, description) => {
  assertCssRuleIn(definitiveTypographyRules, selector, expected, description);
};
assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src")).sort(),
  ["assets", "bootstrap.js", "host-compat.css", "hub.css", "runtime.js"],
  "The Hub source directory must contain one verified artwork tree, one bootstrap, one runtime, one app stylesheet, and one host stylesheet."
);
assert.deepEqual(readdirSync(path.join(root, "apps/classroom-explorations-hub/src/assets")), ["history"]);
assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src/assets/history")).sort(),
  ["past-explorations.webp", "past-twwl.webp", "past-years.webp"]
);
Object.values(artworkPaths).forEach((relativePath) => {
  const bytes = readFileSync(path.join(root, relativePath));
  assert.equal(bytes.subarray(0, 4).toString("ascii"), "RIFF", `${relativePath} must retain its WebP RIFF signature.`);
  assert.equal(bytes.subarray(8, 12).toString("ascii"), "WEBP", `${relativePath} must remain a WebP file.`);
});

assert.match(runtimeText, /export function mountClassroomExplorationsHub/);
assert.doesNotMatch(runtimeText, /Reduced Effects|localStorage|EFFECTS_KEY|data-effects-toggle|manualReduced|applyEffects/);
assert.doesNotMatch(runtimeText, /window\.HRVClassroomExplorationsV2|runtime-v3|hrv-hub-v3/);
assert.doesNotMatch(css, /@import\b|\[data-effects|hub-v[123]/i);
assertCssRule(
  ".hrv-classroom-hub",
  /--hub-shell-wide:\s*min\(1760px,\s*calc\(100dvw\s*-\s*clamp\(32px,\s*4vw,\s*72px\)\)\)/,
  "The wide stage must retain Phase 1.2 full-width environmental ownership"
);
assertCssRule(
  ".hrv-classroom-hub",
  /--hub-shell-reading:\s*min\(1660px,\s*calc\(100dvw\s*-\s*clamp\(44px,\s*6vw,\s*112px\)\)\)/,
  "The reading stage must remain narrower than the wide stage"
);
assertCssRule(
  ".hrv-classroom-hub",
  /--hub-shell-theater:\s*min\(1480px,\s*calc\(100dvw\s*-\s*clamp\(64px,\s*10vw,\s*192px\)\)\)/,
  "The theater stage must retain its focused Phase 1.2 width"
);
assertCssRule(
  ".hrv-classroom-hub",
  /font-size:\s*18px/,
  "The Hub must retain its readable base type scale"
);
assertCssRule(
  ".hrv-classroom-hub",
  /--hub-font-display:\s*Georgia,\s*Cambria,\s*"Times New Roman",\s*serif;[\s\S]*--hub-font-ui:\s*system-ui,\s*-apple-system,\s*BlinkMacSystemFont,\s*"Segoe UI",\s*sans-serif;[\s\S]*font-family:\s*var\(--hub-font-ui\)/,
  "The Hub root must define and consume dependable display and system-UI typography tokens"
);
const hubRootRule = cssRules.find((rule) => (
  rule.selectors.length === 1
  && rule.selectors[0] === ".hrv-classroom-hub"
  && rule.body.includes("--hub-font-display")
));
assert.ok(hubRootRule, `The Hub root typography contract must be discoverable. ${staticInvariantNote}`);
assert.doesNotMatch(
  hubRootRule.body,
  /Atkinson Hyperlegible/i,
  `The Hub root must not depend on an unbundled Atkinson installation. ${staticInvariantNote}`
);
assert.match(
  css,
  /--hub-night:\s*#061128;[\s\S]*--hub-teal:\s*#72e3c8;[\s\S]*--hub-gold:\s*#ffe69a;[\s\S]*--hub-blue:\s*#91b7ff;[\s\S]*--hub-lilac:\s*#c8b7ff;/,
  `The panoramic geometry pass must preserve the established Hub palette. ${staticInvariantNote}`
);
assert.doesNotMatch(
  css,
  /(?:^|,)\s*(?:html|body|#page|#masthead|#colophon)\b/m,
  `Hub presentation rules must remain scoped and must not repaint the native Amadeus shell. ${staticInvariantNote}`
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\);[\s\S]*grid-template-rows:\s*78px\s+420px\s+304px\s+39px;[\s\S]*padding:\s*16px\s+24px\s+12px/,
  "Wide desktop must use the approved twelve-column, four-row panoramic composition"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .hero-section",
  /grid-row:\s*1;[\s\S]*grid-column:\s*1\s*\/\s*span\s+4/,
  "The identity mast must occupy the compact upper-left region"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .site-navigation",
  /grid-row:\s*1;[\s\S]*grid-column:\s*5\s*\/\s*-1/,
  "The global Hughes Room Views menu must complete the identity rail"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .welcome-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*1\s*\/\s*span\s+6/,
  "Welcome Theater must own exactly half of the primary feature row"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .current-exploration-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*7\s*\/\s*-1/,
  "Current Exploration must own the other half of the primary feature row"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .current-twwl-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*1\s*\/\s*span\s+10;[\s\S]*margin-top:\s*0/,
  "Current TWWL must own the broad lower learning region"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .history-door-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*11\s*\/\s*-1/,
  "The three history doors must fit beside Current TWWL in one narrow lower rail"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .hub-footer",
  /grid-row:\s*4;[\s\S]*grid-column:\s*1\s*\/\s*-1/,
  "The footer must close the compact panoramic board"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .hub-section > .museum-shell",
  /width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*margin-inline:\s*0/,
  "Nested room shells must fill their grid cells without legacy offsets"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-hero-card",
  /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+56px;[\s\S]*min-height:\s*0;[\s\S]*border-radius:\s*18px\s+0\s+0\s+18px/,
  "The hero must become the leading edge of one continuous orientation rail"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hero-museum-mark",
  /display:\s*none/,
  "Redundant hero detail must be visually suppressed only on the dense desktop board"
);
assertPanoramicRule(
  ".hrv-classroom-hub .site-navigation-links",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*0\.7fr\s+1\.38fr\s+0\.68fr\s+1\.18fr\s+0\.92fr\s+1\.28fr\s+1\.08fr/,
  "The orientation rail must expose all six global links plus the active Hub item"
);
assertPanoramicRule(
  ".hrv-classroom-hub .welcome-theater-card",
  /grid-template-columns:\s*minmax\(210px,\s*0\.34fr\)\s+minmax\(0,\s*1fr\);[\s\S]*border:\s*1px\s+solid[\s\S]*background:\s*linear-gradient/,
  "Welcome copy and video must share the six-column feature region"
);
assertPanoramicRule(
  ".hrv-classroom-hub .welcome-screen",
  /width:\s*100%;[\s\S]*justify-self:\s*stretch/,
  "Welcome media must use the full available theater width"
);
assertPanoramicRule(
  ".hrv-classroom-hub .current-exploration-card",
  /grid-template:\s*1fr\s*\/\s*1fr;[\s\S]*overflow:\s*hidden;[\s\S]*padding:\s*0/,
  "Current Exploration must become one image-led composition rather than split dashboard cells"
);
assertPanoramicRule(
  ".hrv-classroom-hub .current-visual",
  /grid-area:\s*1\s*\/\s*1/,
  "Current photography must own the full Current composition cell"
);
assertPanoramicRule(
  ".hrv-classroom-hub .current-copy",
  /grid-area:\s*1\s*\/\s*1/,
  "Current copy must overlay the image without changing DOM order"
);
assertPanoramicRule(
  ".hrv-classroom-hub .current-copy",
  /width:\s*clamp\(400px,\s*49%,\s*450px\);[\s\S]*background:\s*linear-gradient/,
  "Current copy must remain readable while leaving the photography dominant"
);
assertPanoramicRule(
  ".hrv-classroom-hub .current-twwl-card",
  /grid-template-columns:\s*clamp\(292px,\s*16vw,\s*320px\)\s+minmax\(0,\s*1fr\);[\s\S]*min-height:\s*0/,
  "Current TWWL must reserve a concise copy column and extend the lantern visual"
);
assertPanoramicRule(
  ".hrv-classroom-hub .history-door-grid",
  /grid-template-columns:\s*1fr;[\s\S]*grid-template-rows:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);[\s\S]*gap:\s*10px/,
  "The history rail must contain three equal doors inside the Current TWWL row"
);

const definitiveFontWeights = [...definitiveTypographyCss.matchAll(/font-weight:\s*(\d+)\s*;/g)]
  .map((match) => match[1]);
assert.deepEqual(
  [...new Set(definitiveFontWeights)].sort(),
  ["400", "600", "700"],
  `The definitive desktop type system must use only real 400, 600, and 700 weights. ${staticInvariantNote}`
);
const definitiveFontFamilies = [...definitiveTypographyCss.matchAll(/font-family:\s*([^;]+)\s*;/g)]
  .map((match) => match[1].trim());
assert.deepEqual(
  [...new Set(definitiveFontFamilies)].sort(),
  ["var(--hub-font-display)", "var(--hub-font-ui)"],
  `The definitive desktop type system must use only the declared display and UI tokens. ${staticInvariantNote}`
);

[
  [".hrv-classroom-hub .hub-title", /font-size:\s*clamp\(29px,\s*1\.83vw,\s*35px\);[\s\S]*font-weight:\s*700;[\s\S]*line-height:\s*1;/, "The Hub identity must remain a compact display heading"],
  [".hrv-classroom-hub .hub-subtitle", /font-size:\s*12\.5px;[\s\S]*font-weight:\s*400;[\s\S]*-webkit-line-clamp:\s*initial;/, "The Hub subtitle must remain readable and unclamped"],
  [".hrv-classroom-hub .site-navigation-link", /font-size:\s*13px;[\s\S]*font-weight:\s*600;[\s\S]*line-height:\s*1\.2;/, "Global navigation must retain its readable wayfinding role"],
  [".hrv-classroom-hub .section-kicker", /font-size:\s*10\.5px;[\s\S]*font-weight:\s*700;/, "Eyebrows must retain a consistent micro-label floor"],
  [".hrv-classroom-hub .welcome-heading .section-title", /font-size:\s*clamp\(27px,\s*1\.67vw,\s*32px\);[\s\S]*line-height:\s*1\.02;/, "Welcome must retain a clear supporting-room heading"],
  [".hrv-classroom-hub .current-section-title", /font-size:\s*18px;[\s\S]*line-height:\s*1\.1;/, "Current Exploration must retain its structural heading floor"],
  [".hrv-classroom-hub .current-title", /font-size:\s*clamp\(35px,\s*2\.08vw,\s*40px\);[\s\S]*line-height:\s*0\.98;/, "The Current subject must remain the dominant exhibit title"],
  [".hrv-classroom-hub .current-points li", /font-size:\s*12\.5px;[\s\S]*font-weight:\s*400;[\s\S]*line-height:\s*1\.3;/, "Current learning points must retain their reading floor"],
  [".hrv-classroom-hub .current-tags li", /font-size:\s*11px;[\s\S]*font-weight:\s*600;/, "Current tags must remain legible metadata"],
  [".hrv-classroom-hub .hub-action", /font-size:\s*14px;[\s\S]*font-weight:\s*700;/, "The primary action must retain a strong control label"],
  [".hrv-classroom-hub .twwl-section-title", /font-size:\s*30px;[\s\S]*line-height:\s*1\.02;/, "Current TWWL must retain a clear section heading"],
  [".hrv-classroom-hub .twwl-title", /font-size:\s*22px;[\s\S]*line-height:\s*1\.08;/, "The TWWL story title must remain subordinate to its section heading"],
  [".hrv-classroom-hub .preparing-display-title", /font-size:\s*12\.5px;[\s\S]*font-weight:\s*600;/, "The lantern status must remain readable inside the expanded visual"],
  [".hrv-classroom-hub .history-door-title", /font-size:\s*clamp\(18px,\s*1\.05vw,\s*20px\);[\s\S]*line-height:\s*1\.04;/, "History doors must retain compact but readable titles"],
  [".hrv-classroom-hub .history-door-eyebrow", /font-size:\s*10\.5px;[\s\S]*font-weight:\s*700;/, "History-door labels must retain their micro-label floor"],
  [".hrv-classroom-hub .footer-message", /font-size:\s*12\.5px;[\s\S]*font-weight:\s*600;[\s\S]*line-height:\s*1\.35;/, "The footer must close the board with readable supporting type"]
].forEach(([selector, expected, description]) => {
  assertDefinitiveTypographyRule(selector, expected, description);
});

[
  [".hrv-classroom-hub .welcome-heading .section-summary", "Welcome summary", "14.5px", "1.45"],
  [".hrv-classroom-hub .current-summary", "Current summary", "14px", "1.38"],
  [".hrv-classroom-hub .twwl-summary", "Current TWWL summary", "14px", "1.42"]
].forEach(([selector, label, fontSize, lineHeight]) => {
  assertDefinitiveTypographyRule(
    selector,
    new RegExp(`display:\\s*block;[\\s\\S]*overflow:\\s*visible;[\\s\\S]*font-size:\\s*${fontSize.replace(".", "\\.")};[\\s\\S]*font-weight:\\s*400;[\\s\\S]*line-height:\\s*${lineHeight.replace(".", "\\.")};[\\s\\S]*-webkit-line-clamp:\\s*initial;`),
    `${label} must remain readable and fully visible rather than line-clamped`
  );
});

[
  [".hrv-classroom-hub .history-dialog-close", /font-size:\s*13px;[\s\S]*font-weight:\s*700;/, "Dialog close control"],
  [".hrv-classroom-hub .history-dialog .gallery-header .section-kicker", /font-size:\s*11px;[\s\S]*font-weight:\s*700;/, "Dialog eyebrow"],
  [".hrv-classroom-hub .history-dialog .gallery-title", /font-size:\s*28px;[\s\S]*line-height:\s*1\.06;/, "Dialog title"],
  [".hrv-classroom-hub .history-dialog .gallery-search", /font-size:\s*14px;[\s\S]*font-weight:\s*400;/, "Dialog search"],
  [".hrv-classroom-hub .history-dialog .gallery-count", /font-size:\s*11\.5px;[\s\S]*font-weight:\s*600;/, "Dialog result count"],
  [".hrv-classroom-hub .history-dialog .collection-title", /font-size:\s*18px;[\s\S]*line-height:\s*1\.15;/, "Dialog card title"],
  [".hrv-classroom-hub .history-dialog .collection-summary", /font-size:\s*13px;[\s\S]*font-weight:\s*400;[\s\S]*line-height:\s*1\.4;/, "Dialog card summary"],
  [".hrv-classroom-hub .history-dialog .collection-label", /font-size:\s*10\.5px;[\s\S]*font-weight:\s*600;/, "Dialog card metadata"],
  [".hrv-classroom-hub .history-dialog .collection-enter", /font-size:\s*12\.5px;[\s\S]*font-weight:\s*600;/, "Dialog card action"],
  [".hrv-classroom-hub .history-dialog .archive-summary", /font-size:\s*14px;[\s\S]*font-weight:\s*400;/, "Archive summary"],
  [".hrv-classroom-hub .history-dialog .archive-door", /font-size:\s*16px;[\s\S]*font-weight:\s*700;/, "Archive doorway"]
].forEach(([selector, expected, role]) => {
  assertDefinitiveTypographyRule(selector, expected, `${role} must retain its verified desktop typography floor`);
});
assert.doesNotMatch(
  panoramicCss,
  /\.hub-museum\s*>\s*\.(?:past-explorations-section|past-twwl-section|archive-control-section)/,
  `Historical tile walls must not be placed in the panoramic landing grid. ${staticInvariantNote}`
);
assert.match(
  css,
  /@media \(max-width: 1330px\)[\s\S]*?\.current-exploration-card,[\s\S]*?\.current-twwl-card\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  `The established stacked layout must remain active below the panoramic breakpoint. ${staticInvariantNote}`
);
assert.match(runtimeText, /wireAmbientVisibility\(\)/);
assert.match(runtimeText, /classList\.toggle\("is-in-view", entry\.isIntersecting\)/);
assert.match(runtimeText, /querySelectorAll\("\[data-pointer-light\], \[data-tilt\]"\)/);
assert.match(runtimeText, /animationFrame = requestAnimationFrame\(\(\) =>/);
assert.match(runtimeText, /if \(animationFrame\) cancelAnimationFrame\(animationFrame\)/);
assert.match(css, /\.hub-section:not\(\.is-in-view\)[\s\S]*animation-play-state:\s*paused/);
assert.match(css, /@keyframes hub-stars-drift-a/);
assert.match(css, /@keyframes hub-stars-drift-b/);
assert.match(css, /@keyframes hub-compass-orbit/);
assert.match(css, /@keyframes hub-screen-glint/);
assert.match(css, /@keyframes hub-glass-glint/);
assert.match(css, /@keyframes hub-lantern-flame/);
assert.match(css, /@keyframes hub-leaf-breathe/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(
  css,
  /@media \(max-width: 720px\)[\s\S]*?\.site-navigation-links,[\s\S]*?\.history-door-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  `The global menu and history doors must stack without horizontal clipping on narrow screens. ${staticInvariantNote}`
);
assert.doesNotMatch(
  css,
  /@media \(min-width: 1600px\) and \(max-height: 820px\)[\s\S]*?\.current-exploration-card\s*,\s*\.hrv-classroom-hub \.current-visual/,
  `Short desktop viewports must not clip Current Exploration copy with a fixed card height. ${staticInvariantNote}`
);
assert.match(bootstrap, /style\.dataset\.hrvClassroomHubStyle = "app"/);
assert.match(bootstrap, /compat\.dataset\.hrvClassroomHubStyle = "host"/);
assert.match(bootstrap, /link\[data-hrv-review-style\]/);
assert.match(bootstrap, /script\[data-hrv-review-runtime\]/);
assert.match(bootstrap, /const artworkKeys = \["pastExplorations", "pastTwwl", "pastYears"\]/);
assert.match(bootstrap, /artwork\[key\]\?\.mediaType !== "image\/webp"/);
assert.match(bootstrap, /fetchBytesVerified\(resolve\(artwork\[key\]\.path\), artwork\[key\]\.sha256\)/);
assert.match(bootstrap, /URL\.createObjectURL\(new Blob\(\[bytes\], \{ type: mediaType \}\)\)/);
assert.match(runtimeText, /this\.runtimeAssets\.artwork\?\.\[entry\.key\]/);
assert.match(runtimeText, /Object\.values\(this\.runtimeAssets\.artwork \|\| \{\}\)/);

assert.match(manifest.current.exploration.image.src, /IMG_2850\.jpg\?format=750w/);
assert.equal(manifest.galleries.pastTwwl.length, 5);
assert.ok(manifest.galleries.pastTwwl.every((item) => item.image?.src && item.image?.alt));

const dom = new JSDOM("<!doctype html><html><body><div id=\"hub\"></div></body></html>", {
  url: "https://rmhughes.edublogs.org/hub-test/"
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.requestAnimationFrame = (callback) => {
  callback(0);
  return 1;
};

dom.window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {}
});

globalThis.IntersectionObserver = class {
  observe(element) {
    element.classList.add("is-awake");
  }
  unobserve() {}
  disconnect() {}
};

const runtimeUrl = `${pathToFileURL(path.join(root, runtimePath)).href}?presentation-test=${Date.now()}`;
const runtime = await import(runtimeUrl);
const mount = dom.window.document.getElementById("hub");
const runtimeAssets = {
  artwork: {
    pastExplorations: "https://assets.example/history/past-explorations.webp",
    pastTwwl: "https://assets.example/history/past-twwl.webp",
    pastYears: "https://assets.example/history/past-years.webp"
  }
};
runtime.mountClassroomExplorationsHub(mount, manifest, runtimeAssets);

assert.equal(mount.dataset.hrvState, "ready");
assert.equal(mount.classList.contains("hrv-classroom-hub"), true);
assert.equal(mount.querySelectorAll(".hub-museum").length, 1);

const hero = mount.querySelector(".hero-section");
const siteNavigation = mount.querySelector('nav.site-navigation[aria-label="Hughes Room Views site navigation"]');
const welcome = mount.querySelector(".welcome-section");
const current = mount.querySelector(".current-exploration-section");
const currentTwwl = mount.querySelector(".current-twwl-section");
const historyDoors = mount.querySelector(".history-door-section");
const footer = mount.querySelector(".hub-footer");
const pastExplorations = mount.querySelector(".past-explorations-section");
const pastTwwl = mount.querySelector(".past-twwl-section");
const archives = mount.querySelector(".archive-control-section");
assert.ok(hero && siteNavigation && welcome && current && currentTwwl && historyDoors && footer);
assert.ok(pastExplorations && pastTwwl && archives);
assert.equal(mount.querySelector(".museum-map"), null, "The obsolete internal Museum Map must not remain in the renderer.");
assert.equal(
  hero.compareDocumentPosition(siteNavigation) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "The global site menu must follow the Hub identity. Static DOM-order invariant only; browser layout is verified separately."
);
assert.equal(
  siteNavigation.compareDocumentPosition(welcome) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "Welcome Theater must follow the global site menu. Static DOM-order invariant only; browser layout is verified separately."
);
assert.equal(
  welcome.compareDocumentPosition(current) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "Welcome Theater must be before Current Exploration."
);
[
  [current, currentTwwl, "Current Exploration must be before Current TWWL."],
  [currentTwwl, historyDoors, "Current TWWL must be before the history doors."],
  [historyDoors, footer, "The history doors must be before the footer."]
].forEach(([before, after, message]) => {
  assert.equal(
    before.compareDocumentPosition(after) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
    dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
    message
  );
});

const expectedSiteNavigation = [
  ["A", "Home", "https://rmhughes.edublogs.org/", null],
  ["A", "Hughes Monthly Calendar", "https://rmhughes.edublogs.org/hughes-monthly-calendar/", null],
  ["A", "Posts", "https://rmhughes.edublogs.org/posts/", null],
  ["A", "Hughes Class Library", "https://rmhughes.edublogs.org/class-library/", null],
  ["A", "Photo Album", "https://rmhughes.edublogs.org/photo-album/", null],
  ["SPAN", "Classroom Explorations", null, "page"],
  ["A", "Contact Information", "https://rmhughes.edublogs.org/contact-information/", null]
];
assert.deepEqual(
  [...siteNavigation.querySelectorAll(".site-navigation-link")].map((item) => [
    item.tagName,
    item.textContent,
    item.getAttribute("href"),
    item.getAttribute("aria-current")
  ]),
  expectedSiteNavigation,
  "The Hub must expose the exact Hughes Room Views global menu and mark Classroom Explorations as the current page."
);
const expectedHistoryDoors = [
  ["Past Explorations: Choose an exhibit", "hrv-past-explorations-dialog", runtimeAssets.artwork.pastExplorations, "eager"],
  ["Past TWWL: Choose a learning story", "hrv-past-learning-dialog", runtimeAssets.artwork.pastTwwl, "eager"],
  ["Past Years: Choose a school year", "hrv-school-year-archives-dialog", runtimeAssets.artwork.pastYears, "lazy"]
];
const historyDoorButtons = [...historyDoors.querySelectorAll("button.history-door")];
assert.deepEqual(historyDoorButtons.map((button) => [
  button.getAttribute("aria-label"),
  button.getAttribute("aria-controls"),
  button.querySelector(".history-door-artwork")?.getAttribute("src"),
  button.querySelector(".history-door-artwork")?.loading
]), expectedHistoryDoors);
assert.ok(historyDoorButtons.every((button) => button.type === "button" && button.getAttribute("aria-haspopup") === "dialog"));

const historyDialogs = [...mount.querySelectorAll("dialog.history-dialog")];
assert.deepEqual(historyDialogs.map((dialog) => dialog.id), [
  "hrv-past-explorations-dialog",
  "hrv-past-learning-dialog",
  "hrv-school-year-archives-dialog"
]);
historyDialogs.forEach((dialog) => {
  assert.equal(dialog.hasAttribute("open"), false, `${dialog.id} must be closed in the landing composition.`);
  assert.ok(dialog.querySelector("button.history-dialog-close"));
});
assert.equal(historyDialogs[0].querySelectorAll(".exploration-card").length, 3);
assert.equal(historyDialogs[1].querySelectorAll(".learning-card").length, 5);
assert.equal(historyDialogs[2].querySelectorAll(".archive-door").length, 1);
assert.equal(mount.querySelector(".hub-museum > .past-explorations-section"), null);
assert.equal(mount.querySelector(".hub-museum > .past-twwl-section"), null);
assert.equal(mount.querySelector(".hub-museum > .archive-control-section"), null);
assert.ok(pastExplorations.closest("dialog.history-dialog"));
assert.ok(pastTwwl.closest("dialog.history-dialog"));
assert.ok(archives.closest("dialog.history-dialog"));

const heroCard = mount.querySelector(".hub-hero-card");
const currentCard = mount.querySelector(".current-exploration-card");
const currentVisual = mount.querySelector(".current-visual");
const currentTwwlCard = mount.querySelector(".current-twwl-card");
const currentTwwlVisual = mount.querySelector(".current-twwl-visual");
assert.ok(heroCard?.hasAttribute("data-pointer-light"));
assert.ok(currentCard?.hasAttribute("data-pointer-light"));
assert.ok(currentTwwlCard?.hasAttribute("data-pointer-light"));
assert.equal(heroCard?.hasAttribute("data-tilt"), false);
assert.equal(currentCard?.hasAttribute("data-tilt"), false);
assert.equal(currentTwwlCard?.hasAttribute("data-tilt"), false);
assert.ok(currentVisual?.hasAttribute("data-tilt"));
assert.ok(currentTwwlVisual?.hasAttribute("data-tilt"));
assert.equal(mount.querySelectorAll(".collection-card[data-tilt]").length, 0);
assert.ok(mount.querySelector(".hero-right > .hub-compass"));
assert.equal(mount.querySelector(".hero-identity-row .hub-compass"), null);

const zinnia = mount.querySelector(".current-image");
assert.ok(zinnia);
assert.equal(zinnia.getAttribute("src"), manifest.current.exploration.image.src);
assert.equal(zinnia.getAttribute("alt"), manifest.current.exploration.image.alt);

const learningCards = [...mount.querySelectorAll(".learning-card")];
assert.equal(learningCards.length, 5);
learningCards.forEach((card, index) => {
  const image = card.querySelector(".collection-image");
  assert.ok(image, `Past TWWL card ${index + 1} must contain a real image.`);
  assert.equal(image.getAttribute("src"), manifest.galleries.pastTwwl[index].image.src);
  assert.equal(image.getAttribute("alt"), manifest.galleries.pastTwwl[index].image.alt);
});
assert.ok(mount.querySelector('[data-hrv-content-id="butterflies-in-the-classroom"].subject-caterpillars'));

assert.equal(mount.querySelector("[data-effects-toggle]"), null);
assert.doesNotMatch(mount.textContent, /Reduced Effects/i);
assert.doesNotMatch(
  learningCards.map((card) => card.querySelector(".collection-visual")?.textContent || "").join(""),
  /[🌱🌊🍄🐛🥔❄️🦉🦇🕷️]/u,
  "Documented TWWL media must never be replaced with emoji."
);

const explorationCards = [...mount.querySelectorAll(".exploration-card")];
const [explorationSearch, learningSearch] = mount.querySelectorAll(".gallery-search");
const [explorationCount, learningCount] = mount.querySelectorAll(".gallery-count");
assert.equal(explorationCards.length, 3);
assert.ok(explorationSearch && learningSearch && explorationCount && learningCount);

explorationSearch.value = "mushrooms";
explorationSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(explorationCards.filter((card) => !card.hidden).length, 1);
assert.equal(explorationCount.textContent, "1 exhibit on display");
explorationSearch.value = "";
explorationSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(explorationCards.filter((card) => !card.hidden).length, 3);
assert.equal(explorationCount.textContent, "3 exhibits on display");

learningSearch.value = "owls";
learningSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(learningCards.filter((card) => !card.hidden).length, 1);
assert.equal(learningCount.textContent, "1 learning display on display");
learningSearch.value = "";
learningSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(learningCards.filter((card) => !card.hidden).length, 5);
assert.equal(learningCount.textContent, "5 learning displays on display");

runtime.unmountClassroomExplorationsHub(mount);
assert.equal(mount.children.length, 0);
runtime.mountClassroomExplorationsHub(mount, manifest, runtimeAssets);
assert.equal(mount.querySelectorAll(".hub-museum").length, 1);
runtime.unmountClassroomExplorationsHub(mount);

console.log("[hub presentation] preserved source/routes/control hashes passed");
console.log("[hub presentation] one canonical runtime + import-free stylesheet passed");
console.log("[hub presentation] static panoramic density, hierarchy, and twelve-column composition invariants passed");
console.log("[hub presentation] exact global menu and active Classroom Explorations state passed");
console.log("[hub presentation] three artwork-backed history dialogs and retained historical cards passed");
console.log("[hub presentation] real Zinnia + five real Past TWWL image renderers and gallery filtering passed");
console.log("[hub presentation] scoped motion, OS reduction, and no Hub-local effects control passed");
console.log("[hub presentation] static invariants passed; this test does not claim real-browser visual acceptance");
