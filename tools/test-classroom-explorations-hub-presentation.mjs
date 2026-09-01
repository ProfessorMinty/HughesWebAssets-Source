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
  pastYears: "apps/classroom-explorations-hub/src/assets/history/past-years.webp",
  frameTopLeft: "apps/classroom-explorations-hub/src/assets/frame/top-left.webp",
  frameTopRight: "apps/classroom-explorations-hub/src/assets/frame/top-right.webp",
  frameMiddleLeft: "apps/classroom-explorations-hub/src/assets/frame/middle-left.webp",
  frameMiddleRight: "apps/classroom-explorations-hub/src/assets/frame/middle-right.webp",
  frameBottomLeft: "apps/classroom-explorations-hub/src/assets/frame/bottom-left.webp",
  frameBottomRight: "apps/classroom-explorations-hub/src/assets/frame/bottom-right.webp"
};
const originalFramePaths = {
  frameTopLeft: "apps/classroom-explorations-hub/source-assets/banner-frame-originals/TopLeftHubBannerFrame.png",
  frameTopRight: "apps/classroom-explorations-hub/source-assets/banner-frame-originals/TopRightHubBannerFrame.png",
  frameMiddleLeft: "apps/classroom-explorations-hub/source-assets/banner-frame-originals/MiddleLeftHubBannerFrame.png",
  frameMiddleRight: "apps/classroom-explorations-hub/source-assets/banner-frame-originals/MiddleRightHubBannerFrame.png",
  frameBottomLeft: "apps/classroom-explorations-hub/source-assets/banner-frame-originals/BottomLeftHubBannerFrame.png",
  frameBottomRight: "apps/classroom-explorations-hub/source-assets/banner-frame-originals/BottomRightHubBannerFrame.png"
};

assert.equal(sha256(sourcePath), "3c85a2ce02f4ff11c337c8d28444604907971d4c2ca59d74d65e20b3ee009977");
assert.equal(sha256(routesPath), "29ab9bc8262b128b2222d4a115b3906701f0d5747f6d3ebcab059680204c1a73");
assert.equal(sha256(controlPath), "7784b2d569ba13bf45ef512ca48c431166d6e249a75ad13058f848dca55110be");
assert.equal(sha256(bootstrapPath), "fe7015cabad35b3a3442ac9787185a2b63fee9890a4e2fde431a1ce06e817496");
assert.equal(sha256(runtimePath), "2b7bde132b7afd2646d9952e199452826fc5c8029b0eec617d65e75361be59f8");
assert.equal(sha256(cssPath), "23df5b47f8469011818d0c01856d1bf7ec4775050c3b77617745f96eb3a355ba");
assert.equal(sha256(hostCompatPath), "cd3bdebe94f39533e895764e126de568fb8221f7030157c79713df09c3d8d300");
assert.deepEqual(
  Object.fromEntries(Object.entries(artworkPaths).map(([key, relativePath]) => [key, sha256(relativePath)])),
  {
    pastExplorations: "b524f0839bc50a38fde72ed418cb288753ca238eadb7e9cea3bf33d93625e983",
    pastTwwl: "dcece4282c73dce3026c8233d333bdde78082249392b45d159eb090fef76d425",
    pastYears: "5c221b1f900d49cdc01c6c6fe45ea8340fabbb5ae299094e5708df05770941a4",
    frameTopLeft: "7a7a9cebcad631d3287211f8e7529e301cdaf9d70de55cd21a64fc505ead7c54",
    frameTopRight: "c74cee00ba8504186647f8641126accabd0a2fcc8a832d9e0ffd6e017c79ba11",
    frameMiddleLeft: "81b0ee9ee9e93687ee1aaffb214feca1d31de986751318405b29f258eff565b7",
    frameMiddleRight: "ec015b8e4f98f0eca9d48254b6b719e3826ea8927a78891151627378ce13c889",
    frameBottomLeft: "4c41de2d714d324e565ab779fcd8e9c80e9ae181d654a95380ecfa3deed248b6",
    frameBottomRight: "ad4450dba040a20a393fd026d00df644faed9be86e8e265ce730ee481ae91074"
  },
  "The three approved history doors and six approved frame derivatives must retain their verified bytes."
);
assert.deepEqual(
  Object.fromEntries(Object.entries(originalFramePaths).map(([key, relativePath]) => [key, sha256(relativePath)])),
  {
    frameTopLeft: "5f44d39eedaa59c48a486fba2ef3cc9342681871de24c47f1dd99129734df15c",
    frameTopRight: "d8a2fca272fb1d470d5c459e8e9a036e80143a0058e27ade27f392b8a5a3b004",
    frameMiddleLeft: "20583a73fab1acc3bb662c913f827615e6f36b5750e40b08f7aca4a5629a1b75",
    frameMiddleRight: "50c2d5ae54a00b08c6d8bbd5c0c6930ab83c17b8284368dbf5d885158d404a9f",
    frameBottomLeft: "f710e726d7c5adeff6e696525e8b7c280ec0de7764a5bfb467efa217d7e08315",
    frameBottomRight: "022d538873ba6e787bb5a8496b4b0e595c4456d933fa6bff78a1f13853fdd5d9"
  },
  "The six retained frame PNGs must remain byte-exact copies of the supplied originals."
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
const extractCssBlockAt = (cssText, headerIndex, label) => {
  assert.notEqual(headerIndex, -1, `Missing CSS block: ${label}. ${staticInvariantNote}`);
  const openIndex = cssText.indexOf("{", headerIndex);
  assert.notEqual(openIndex, -1, `Missing opening brace for ${label}. ${staticInvariantNote}`);

  let depth = 0;
  for (let index = openIndex; index < cssText.length; index += 1) {
    if (cssText[index] === "{") depth += 1;
    if (cssText[index] === "}") depth -= 1;
    if (depth === 0) return cssText.slice(openIndex + 1, index);
  }

  assert.fail(`Missing closing brace for ${label}. ${staticInvariantNote}`);
};
const authoritativeDesktopMarker = "Authoritative panoramic desktop composition.";
const authoritativeDesktopMarkerIndex = css.indexOf(authoritativeDesktopMarker);
assert.notEqual(
  authoritativeDesktopMarkerIndex,
  -1,
  `The active desktop composition must retain its explicit authority marker. ${staticInvariantNote}`
);
const authoritativeDesktopHeader = "@media (min-width: 1440px)";
const authoritativeDesktopHeaderIndex = css.indexOf(authoritativeDesktopHeader, authoritativeDesktopMarkerIndex);
const authoritativeDesktopCss = extractCssBlockAt(
  css,
  authoritativeDesktopHeaderIndex,
  "authoritative panoramic desktop composition"
);
const authoritativeDesktopRules = parseCssRules(authoritativeDesktopCss);

const compactDesktopHeader = "@media (min-width: 1440px) and (max-width: 1679px)";
const compactDesktopHeaderIndex = css.indexOf(
  compactDesktopHeader,
  authoritativeDesktopHeaderIndex + authoritativeDesktopHeader.length
);
const compactDesktopCss = extractCssBlockAt(css, compactDesktopHeaderIndex, "1440-1679 desktop adjustment");
const compactDesktopRules = parseCssRules(compactDesktopCss);

const desktopNormalizationMarker = "Desktop normalization for navigation and archive components declared above.";
const desktopNormalizationMarkerIndex = css.indexOf(desktopNormalizationMarker);
assert.ok(
  desktopNormalizationMarkerIndex > authoritativeDesktopHeaderIndex,
  `Late desktop normalization must remain explicitly separated from the authoritative composition. ${staticInvariantNote}`
);
const desktopNormalizationHeaderIndex = css.indexOf(authoritativeDesktopHeader, desktopNormalizationMarkerIndex);
const desktopNormalizationCss = extractCssBlockAt(
  css,
  desktopNormalizationHeaderIndex,
  "late desktop navigation and archive normalization"
);
const desktopNormalizationRules = parseCssRules(desktopNormalizationCss);

const inactiveLegacyHeader = "@media (min-width: 1440px) and (max-width: 1439px)";
assert.ok(
  css.indexOf(inactiveLegacyHeader, desktopNormalizationHeaderIndex) > desktopNormalizationHeaderIndex,
  `Superseded desktop blocks must remain mathematically inactive and must not be mistaken for the active composition. ${staticInvariantNote}`
);
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
const assertAuthoritativeDesktopRule = (selector, expected, description) => {
  assertCssRuleIn(authoritativeDesktopRules, selector, expected, description);
};
const assertCompactDesktopRule = (selector, expected, description) => {
  assertCssRuleIn(compactDesktopRules, selector, expected, description);
};
const assertDesktopNormalizationRule = (selector, expected, description) => {
  assertCssRuleIn(desktopNormalizationRules, selector, expected, description);
};
assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src")).sort(),
  ["assets", "bootstrap.js", "host-compat.css", "hub.css", "runtime.js"],
  "The Hub source directory must contain one verified artwork tree, one bootstrap, one runtime, one app stylesheet, and one host stylesheet."
);
assert.deepEqual(readdirSync(path.join(root, "apps/classroom-explorations-hub/src/assets")).sort(), ["frame", "history"]);
assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src/assets/frame")).sort(),
  ["bottom-left.webp", "bottom-right.webp", "middle-left.webp", "middle-right.webp", "top-left.webp", "top-right.webp"]
);
assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src/assets/history")).sort(),
  ["past-explorations.webp", "past-twwl.webp", "past-years.webp"]
);
assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/source-assets/banner-frame-originals")).sort(),
  [
    "BottomLeftHubBannerFrame.png",
    "BottomRightHubBannerFrame.png",
    "MiddleLeftHubBannerFrame.png",
    "MiddleRightHubBannerFrame.png",
    "TopLeftHubBannerFrame.png",
    "TopRightHubBannerFrame.png"
  ]
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
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\);[\s\S]*grid-template-rows:\s*minmax\(88px,\s*auto\)\s+minmax\(480px,\s*auto\)\s+minmax\(300px,\s*auto\)\s+auto;[\s\S]*gap:\s*14px;[\s\S]*padding:\s*14px\s+24px\s+20px;[\s\S]*overflow:\s*clip/,
  "The 1920 desktop must use the expandable 88/480/300/auto twelve-column composition"
);
assertCompactDesktopRule(
  ".hrv-classroom-hub .hub-museum",
  /grid-template-rows:\s*minmax\(88px,\s*auto\)\s+minmax\(510px,\s*auto\)\s+minmax\(300px,\s*auto\)\s+auto/,
  "The 1440-1679 adjustment must give the primary cards additional expandable height"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .hero-section",
  /grid-row:\s*1;[\s\S]*grid-column:\s*1\s*\/\s*span\s+4/,
  "The identity mast must occupy the compact upper-left region"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .site-navigation",
  /grid-row:\s*1;[\s\S]*grid-column:\s*5\s*\/\s*-1/,
  "The global Hughes Room Views menu must complete the identity rail"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .welcome-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*1\s*\/\s*span\s+6/,
  "Welcome Theater must own exactly half of the primary feature row"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .current-exploration-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*7\s*\/\s*-1/,
  "Current Exploration must own the other half of the primary feature row"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .current-twwl-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*1\s*\/\s*span\s+10;[\s\S]*margin-top:\s*0/,
  "Current TWWL must own the broad lower learning region"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .history-door-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*11\s*\/\s*-1/,
  "The three history doors must fit beside Current TWWL in one narrow lower rail"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .hub-footer",
  /grid-row:\s*4;[\s\S]*grid-column:\s*1\s*\/\s*-1/,
  "Supporting footer content may continue below the opening panoramic canvas"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-museum > .hub-section > .museum-shell",
  /width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*margin-inline:\s*0/,
  "Nested room shells must fill their grid cells without legacy offsets"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-banner-frame-layer",
  /position:\s*absolute;[\s\S]*z-index:\s*1;[\s\S]*inset:\s*0;[\s\S]*overflow:\s*hidden;[\s\S]*pointer-events:\s*none/,
  "The supplied banner pieces must form pointer-free page chrome behind every card"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .hub-banner-frame-piece",
  /position:\s*absolute;[\s\S]*height:\s*34\.5%;[\s\S]*opacity:\s*0\.88;[\s\S]*user-select:\s*none/,
  "All six banner pieces must retain their transparent page-frame treatment"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .site-navigation-links",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*0\.72fr\s+1\.35fr\s+0\.68fr\s+1\.18fr\s+0\.94fr\s+1\.25fr\s+1\.08fr/,
  "The orientation rail must expose all six global links plus the active Hub item"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .welcome-theater-card",
  /grid-template-columns:\s*clamp\(220px,\s*26%,\s*250px\)\s+minmax\(0,\s*1fr\);[\s\S]*gap:\s*18px;[\s\S]*overflow:\s*hidden;[\s\S]*border:\s*1px\s+solid/,
  "Welcome copy and full-width video must remain contained in a balanced two-pane card"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .welcome-screen",
  /width:\s*100%;[\s\S]*max-height:\s*none;[\s\S]*justify-self:\s*stretch/,
  "Welcome media must use the full available theater width"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .current-exploration-card",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*clamp\(310px,\s*43%,\s*390px\)\s+minmax\(0,\s*1fr\);[\s\S]*grid-template-rows:\s*minmax\(0,\s*1fr\);[\s\S]*gap:\s*18px;[\s\S]*overflow:\s*hidden;[\s\S]*padding:\s*18px/,
  "Current Exploration must be a clipped two-pane card with copy and subject media in normal flow"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .current-copy",
  /display:\s*flex;[\s\S]*width:\s*auto;[\s\S]*height:\s*auto;[\s\S]*flex-direction:\s*column;[\s\S]*background:\s*none/,
  "Current copy must remain inside its own normal-flow pane rather than overlaying photography"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .current-visual",
  /width:\s*100%;[\s\S]*height:\s*100%;[\s\S]*overflow:\s*hidden;[\s\S]*border-radius:\s*18px/,
  "Current subject media must be visibly clipped by the owning figure"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .current-media-stage",
  /position:\s*absolute;[\s\S]*inset:\s*0;[\s\S]*overflow:\s*hidden;[\s\S]*border-radius:\s*inherit/,
  "Current motion must occur on an inner clipped media stage"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .current-twwl-card",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*clamp\(360px,\s*27%,\s*420px\)\s+minmax\(0,\s*1fr\);[\s\S]*grid-template-rows:\s*minmax\(0,\s*1fr\);[\s\S]*gap:\s*18px;[\s\S]*overflow:\s*hidden;[\s\S]*padding:\s*18px/,
  "Current TWWL must use one expandable row with a concise copy pane and broad contained visual"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .current-twwl-visual",
  /height:\s*100%;[\s\S]*overflow:\s*hidden;[\s\S]*border-radius:\s*18px/,
  "The TWWL subject display must be clipped by its owning visual card"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .twwl-media-stage",
  /display:\s*grid;[\s\S]*place-items:\s*center/,
  "The TWWL media stage must own the subject display and lantern centering"
);
assertAuthoritativeDesktopRule(
  ".hrv-classroom-hub .history-door-grid",
  /grid-template-columns:\s*1fr;[\s\S]*grid-template-rows:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);[\s\S]*gap:\s*10px/,
  "The approved archive rail must preserve its three equal doors and 10px gaps"
);
assertDesktopNormalizationRule(
  ".hrv-classroom-hub .hub-museum .history-door-grid",
  /grid-template-columns:\s*1fr;[\s\S]*grid-template-rows:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\);[\s\S]*gap:\s*10px/,
  "Late normalization must preserve the approved archive geometry rather than redefine it"
);
assertDesktopNormalizationRule(
  ".hrv-classroom-hub .hub-museum .history-door-copy",
  /inset:\s*0\s+4%\s+0\s+44%;[\s\S]*gap:\s*2px/,
  "Late normalization must preserve the approved archive copy crop"
);
assertDesktopNormalizationRule(
  ".hrv-classroom-hub .hub-museum .history-door-pastYears .history-door-copy",
  /inset:\s*0\s+44%\s+0\s+4%/,
  "The Past Years doorway must retain its approved mirrored crop"
);

const authoritativeFontWeights = [...authoritativeDesktopCss.matchAll(/font-weight:\s*(\d+)\s*;/g)]
  .map((match) => match[1]);
assert.deepEqual(
  [...new Set(authoritativeFontWeights)].sort(),
  ["400", "600", "700"],
  `The authoritative desktop type system must use only real 400, 600, and 700 weights. ${staticInvariantNote}`
);
const authoritativeFontFamilies = [...authoritativeDesktopCss.matchAll(/font-family:\s*([^;]+)\s*;/g)]
  .map((match) => match[1].trim());
assert.deepEqual(
  [...new Set(authoritativeFontFamilies)].sort(),
  ["var(--hub-font-display)", "var(--hub-font-ui)"],
  `The authoritative desktop type system must use only the declared display and UI tokens. ${staticInvariantNote}`
);

[
  [".hrv-classroom-hub .hub-title", /font-family:\s*var\(--hub-font-display\);[\s\S]*font-size:\s*32px;[\s\S]*font-weight:\s*700;[\s\S]*line-height:\s*0\.98;/, "The Hub identity must remain a compact personality heading"],
  [".hrv-classroom-hub .site-navigation-link", /font-family:\s*var\(--hub-font-ui\);[\s\S]*font-size:\s*clamp\(14px,\s*0\.78vw,\s*15px\);[\s\S]*font-weight:\s*600;/, "Global navigation must retain a readable UI role"],
  [".hrv-classroom-hub .section-kicker", /min-height:\s*28px;[\s\S]*font-family:\s*var\(--hub-font-ui\);[\s\S]*font-size:\s*13px;[\s\S]*font-weight:\s*700;/, "Section pills must share a 13px minimum type floor and 28px height"],
  [".hrv-classroom-hub .welcome-heading .section-title", /font-size:\s*clamp\(29px,\s*1\.62vw,\s*32px\);[\s\S]*line-height:\s*1\.08;/, "Welcome must retain a clear structural heading"],
  [".hrv-classroom-hub .current-section-title", /font-size:\s*21px;[\s\S]*line-height:\s*1\.16;/, "Current Exploration must retain its structural heading"],
  [".hrv-classroom-hub .current-title", /font-family:\s*var\(--hub-font-display\);[\s\S]*font-size:\s*clamp\(35px,\s*1\.9vw,\s*36px\);[\s\S]*line-height:\s*1\.01;/, "The Current subject must remain the dominant exhibit title"],
  [".hrv-classroom-hub .current-topline > *", /min-height:\s*28px;[\s\S]*font-size:\s*13px;[\s\S]*font-weight:\s*700;/, "Current pills must align to one 13px by 28px status row"],
  [".hrv-classroom-hub .current-tags li", /font-size:\s*13px;[\s\S]*font-weight:\s*600;/, "Current tag pills must retain the 13px metadata floor"],
  [".hrv-classroom-hub .current-caption", /font-size:\s*13px;[\s\S]*font-weight:\s*600;/, "Current media captions must remain inside the card at 13px"],
  [".hrv-classroom-hub .hub-action", /min-height:\s*44px;[\s\S]*font-size:\s*15px;[\s\S]*font-weight:\s*700;/, "The primary action must retain a strong readable control label"],
  [".hrv-classroom-hub .twwl-section-title", /font-size:\s*30px;[\s\S]*line-height:\s*1\.08;/, "Current TWWL must retain a clear structural heading"],
  [".hrv-classroom-hub .twwl-statusline", /display:\s*flex;[\s\S]*min-height:\s*28px;[\s\S]*align-items:\s*center;[\s\S]*gap:\s*8px/, "TWWL status pills must share one explicit aligned row"],
  [".hrv-classroom-hub .preparing-label", /font-size:\s*13px;[\s\S]*font-weight:\s*700;/, "The TWWL state pill must retain the 13px floor"],
  [".hrv-classroom-hub .twwl-title", /font-family:\s*var\(--hub-font-display\);[\s\S]*font-size:\s*26px;[\s\S]*line-height:\s*1\.08;/, "The TWWL story title must remain subordinate to its section heading"],
  [".hrv-classroom-hub .preparing-display-title", /font-size:\s*16px;[\s\S]*font-weight:\s*600;/, "The lantern status must remain readable inside the expanded visual"],
  [".hrv-classroom-hub .footer-message", /font-size:\s*14px;[\s\S]*font-weight:\s*600;[\s\S]*line-height:\s*1\.4;/, "The supporting footer must remain readable below the opening canvas"]
].forEach(([selector, expected, description]) => {
  assertAuthoritativeDesktopRule(selector, expected, description);
});

[
  [".hrv-classroom-hub .welcome-heading .section-summary", "Welcome summary", "1.5"],
  [".hrv-classroom-hub .current-summary", "Current summary", "1.4"],
  [".hrv-classroom-hub .twwl-summary", "Current TWWL summary", "1.48"]
].forEach(([selector, label, lineHeight]) => {
  assertAuthoritativeDesktopRule(
    selector,
    new RegExp(`display:\\s*block;[\\s\\S]*overflow:\\s*visible;[\\s\\S]*font-size:\\s*16px;[\\s\\S]*font-weight:\\s*400;[\\s\\S]*line-height:\\s*${lineHeight.replace(".", "\\.")};[\\s\\S]*-webkit-line-clamp:\\s*initial;`),
    `${label} must remain fully visible at the 16px body floor rather than line-clamped`
  );
});
assert.doesNotMatch(
  authoritativeDesktopCss,
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
assert.match(
  css,
  /\.starfield-one\s*\{[\s\S]*?animation:\s*hub-stars-drift-a\s+34s\s+ease-in-out\s+infinite\s+alternate;/,
  "The primary star field must reverse from its exact endpoint instead of snapping to its origin"
);
assert.match(
  css,
  /\.starfield-two\s*\{[\s\S]*?animation:\s*hub-stars-drift-b\s+42s\s+ease-in-out\s+infinite\s+alternate-reverse;/,
  "The reversed secondary star field must preserve endpoint continuity across iterations"
);
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
assert.match(
  bootstrap,
  /const artworkKeys = \[\s*"pastExplorations",\s*"pastTwwl",\s*"pastYears",\s*"frameTopLeft",\s*"frameTopRight",\s*"frameMiddleLeft",\s*"frameMiddleRight",\s*"frameBottomLeft",\s*"frameBottomRight"\s*\]/
);
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
    pastYears: "https://assets.example/history/past-years.webp",
    frameTopLeft: "https://assets.example/frame/top-left.webp",
    frameTopRight: "https://assets.example/frame/top-right.webp",
    frameMiddleLeft: "https://assets.example/frame/middle-left.webp",
    frameMiddleRight: "https://assets.example/frame/middle-right.webp",
    frameBottomLeft: "https://assets.example/frame/bottom-left.webp",
    frameBottomRight: "https://assets.example/frame/bottom-right.webp"
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
const currentMediaStage = currentVisual?.querySelector(":scope > .current-media-stage");
const currentTwwlCard = mount.querySelector(".current-twwl-card");
const currentTwwlVisual = mount.querySelector(".current-twwl-visual");
const twwlMediaStage = currentTwwlVisual?.querySelector(":scope > .twwl-media-stage");
assert.ok(heroCard?.hasAttribute("data-pointer-light"));
assert.ok(currentCard?.hasAttribute("data-pointer-light"));
assert.ok(currentTwwlCard?.hasAttribute("data-pointer-light"));
assert.equal(heroCard?.hasAttribute("data-tilt"), false);
assert.equal(currentCard?.hasAttribute("data-tilt"), false);
assert.equal(currentTwwlCard?.hasAttribute("data-tilt"), false);
assert.equal(currentVisual?.hasAttribute("data-tilt"), false);
assert.equal(currentTwwlVisual?.hasAttribute("data-tilt"), false);
assert.ok(currentMediaStage?.hasAttribute("data-tilt"));
assert.ok(twwlMediaStage?.hasAttribute("data-tilt"));
assert.ok(currentMediaStage?.querySelector(":scope > .current-atmosphere"));
assert.ok(twwlMediaStage?.querySelector(":scope > .twwl-atmosphere"));
assert.equal(current.querySelector(":scope > .current-atmosphere"), null);
assert.equal(currentTwwl.querySelector(":scope > .twwl-atmosphere"), null);
assert.deepEqual(
  [...currentTwwl.querySelectorAll(".twwl-statusline > *")].map((item) => item.className),
  ["content-year-badge learning-year-badge", "preparing-label"]
);
assert.equal(mount.querySelectorAll(".collection-card[data-tilt]").length, 0);
assert.ok(mount.querySelector(".hero-right > .hub-compass"));
assert.equal(mount.querySelector(".hero-identity-row .hub-compass"), null);

const bannerFrameLayer = mount.querySelector(".hub-banner-frame-layer");
assert.equal(bannerFrameLayer?.getAttribute("aria-hidden"), "true");
assert.equal(bannerFrameLayer?.style.pointerEvents, "none");
assert.deepEqual(
  [...bannerFrameLayer.querySelectorAll(":scope > .hub-banner-frame-piece")].map((frame) => [
    frame.className,
    frame.dataset.frameKey,
    frame.getAttribute("src"),
    frame.getAttribute("alt"),
    frame.draggable
  ]),
  [
    ["hub-banner-frame-piece hub-banner-frame-top-left", "frameTopLeft", runtimeAssets.artwork.frameTopLeft, "", false],
    ["hub-banner-frame-piece hub-banner-frame-top-right", "frameTopRight", runtimeAssets.artwork.frameTopRight, "", false],
    ["hub-banner-frame-piece hub-banner-frame-middle-left", "frameMiddleLeft", runtimeAssets.artwork.frameMiddleLeft, "", false],
    ["hub-banner-frame-piece hub-banner-frame-middle-right", "frameMiddleRight", runtimeAssets.artwork.frameMiddleRight, "", false],
    ["hub-banner-frame-piece hub-banner-frame-bottom-left", "frameBottomLeft", runtimeAssets.artwork.frameBottomLeft, "", false],
    ["hub-banner-frame-piece hub-banner-frame-bottom-right", "frameBottomRight", runtimeAssets.artwork.frameBottomRight, "", false]
  ]
);

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
