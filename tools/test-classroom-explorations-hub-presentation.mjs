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

assert.equal(sha256(sourcePath), "3c85a2ce02f4ff11c337c8d28444604907971d4c2ca59d74d65e20b3ee009977");
assert.equal(sha256(routesPath), "29ab9bc8262b128b2222d4a115b3906701f0d5747f6d3ebcab059680204c1a73");
assert.equal(sha256(controlPath), "7784b2d569ba13bf45ef512ca48c431166d6e249a75ad13058f848dca55110be");
assert.equal(sha256(bootstrapPath), "ac701c36906f6434fed4e42490573d9172ba58a826b38e3f6d4633d05eec5f2d");
assert.equal(sha256(runtimePath), "e6303cc890cd38909b17ae32f63481553958c8af4ef004e8c2e87788c49e406a");
assert.equal(sha256(hostCompatPath), "e796c262eccae516ea21844c9d4c16f8a73e77778a1574239d0964c5ffe628db");

const source = readJson(sourcePath);
const routes = readJson(routesPath);
const manifest = projectHubRuntime(source, routes);
const runtimeText = readText(runtimePath);
const css = readText(cssPath);
const bootstrap = readText(bootstrapPath);
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
const extractCssBlock = (cssText, header) => {
  const headerIndex = cssText.indexOf(header);
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
const panoramicCss = extractCssBlock(css, "@media (min-width: 1440px)");
const panoramicRules = parseCssRules(panoramicCss);
const assertPanoramicRule = (selector, expected, description) => {
  assertCssRuleIn(panoramicRules, selector, expected, description);
};
const doorway = readText("docs/edublogs-integration/classroom-explorations-hub-test/JAVASCRIPT-BOX.js");
const doorwayReadme = readText("docs/edublogs-integration/classroom-explorations-hub-test/README.md");
const doorwayChannel = readText("docs/edublogs-integration/classroom-explorations-hub-test/BRANCH-CHANNEL.txt");
const activeDoorwayDocs = [doorway, doorwayReadme, doorwayChannel].join("\n");
const publication = readJson("releases/classroom-explorations-hub/publications/pub-2026-08-30-003/publication.json");
const releaseBootstrap = readFileSync(
  path.join(root, "releases/classroom-explorations-hub/runtime/2026.08.30.3/bootstrap.js")
);
const releaseBootstrapSri = `sha256-${createHash("sha256").update(releaseBootstrap).digest("base64")}`;

assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src")).sort(),
  ["bootstrap.js", "host-compat.css", "hub.css", "runtime.js"],
  "The Hub source directory must contain one bootstrap, one runtime, one app stylesheet, and one host stylesheet."
);

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
  /display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\);[\s\S]*grid-template-rows:\s*94px\s+428px\s+272px\s+39px;[\s\S]*padding:\s*20px\s+32px\s+12px/,
  "Wide desktop must use a bounded twelve-column, four-row exploration board"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .hero-section",
  /grid-row:\s*1;[\s\S]*grid-column:\s*1\s*\/\s*span\s+4/,
  "The identity mast must occupy the compact upper-left region"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .museum-map",
  /grid-row:\s*1;[\s\S]*grid-column:\s*5\s*\/\s*-1/,
  "The Museum Map must share the compact mast row"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .welcome-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*1\s*\/\s*span\s+3;[\s\S]*align-self:\s*center/,
  "Welcome must be the vertically inset left support room"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .current-exploration-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*4\s*\/\s*span\s+6/,
  "Current Exploration must own the dominant six-column center region"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .current-twwl-section",
  /grid-row:\s*2;[\s\S]*grid-column:\s*10\s*\/\s*span\s+3;[\s\S]*margin-top:\s*16px/,
  "Current TWWL must be the staggered right support room"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .museum-divider",
  /display:\s*none/,
  "The desktop board must not spend a row on the legacy section divider"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .past-explorations-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*1\s*\/\s*span\s+4/,
  "Past Explorations must occupy the four-column lower image ribbon"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .past-twwl-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*5\s*\/\s*span\s+6/,
  "Past TWWL must occupy the six-column lower image ribbon"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .archive-control-section",
  /grid-row:\s*3;[\s\S]*grid-column:\s*11\s*\/\s*-1/,
  "Previous School Years must remain a compact right-edge rail"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .hub-footer",
  /grid-row:\s*4;[\s\S]*grid-column:\s*1\s*\/\s*-1/,
  "The footer must close the single desktop canvas"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-museum > .hub-section > .museum-shell",
  /width:\s*100%;[\s\S]*margin-inline:\s*0/,
  "Nested room shells must fill their grid cells without legacy offsets"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-hero-card",
  /grid-template-columns:\s*minmax\(0,\s*1fr\)\s+72px;[\s\S]*min-height:\s*0/,
  "The hero must reduce to identity copy and the existing compass"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hero-museum-mark",
  /display:\s*none/,
  "Redundant hero detail must be visually suppressed only on the dense desktop board"
);
assertPanoramicRule(
  ".hrv-classroom-hub .museum-map-shell",
  /min-height:\s*52px/,
  "The Museum Map must remain a compact horizontal control band"
);
assertPanoramicRule(
  ".hrv-classroom-hub .welcome-theater-card",
  /grid-template-columns:\s*minmax\(0,\s*1fr\)/,
  "Welcome must stack compactly inside its support region"
);
assertPanoramicRule(
  ".hrv-classroom-hub .welcome-screen",
  /width:\s*min\(94%,\s*455px\);[\s\S]*justify-self:\s*center/,
  "Welcome media must read as an inset supporting theater"
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
  /width:\s*clamp\(410px,\s*56%,\s*530px\);[\s\S]*background:\s*linear-gradient/,
  "Current copy must remain readable while leaving the photography dominant"
);
assertPanoramicRule(
  ".hrv-classroom-hub .current-twwl-card",
  /grid-template-columns:\s*minmax\(0,\s*1fr\);[\s\S]*min-height:\s*0/,
  "Current TWWL must stack compactly inside its support region"
);
assertCssRule(
  ".hrv-classroom-hub .gallery-frame",
  /overflow:\s*visible;[\s\S]*border:\s*0;[\s\S]*background:\s*transparent;[\s\S]*box-shadow:\s*none/,
  "Gallery sections must not reintroduce giant nested panel rectangles"
);
assertPanoramicRule(
  ".hrv-classroom-hub .gallery-frame",
  /grid-template-rows:\s*auto\s+minmax\(0,\s*1fr\)/,
  "Each gallery must compress its controls and images into one bounded ribbon"
);
assertPanoramicRule(
  ".hrv-classroom-hub .exploration-grid",
  /grid-template-columns:\s*repeat\(3,\s*minmax\(0,\s*1fr\)\)/,
  "All three Past Explorations must share one dense image row"
);
assertPanoramicRule(
  ".hrv-classroom-hub .learning-grid",
  /display:\s*grid;[\s\S]*grid-template-columns:\s*repeat\(5,\s*minmax\(0,\s*1fr\)\)/,
  "All five Past TWWL memories must share one glanceable image row"
);
assertPanoramicRule(
  ".hrv-classroom-hub .learning-grid .learning-card",
  /width:\s*auto;[\s\S]*min-width:\s*0;[\s\S]*flex:\s*none/,
  "Past TWWL cards must release their legacy three-column flex sizing"
);
assertPanoramicRule(
  ".hrv-classroom-hub .collection-link",
  /grid-template:\s*1fr\s*\/\s*1fr/,
  "Collection links must become image-first overlay cards"
);
assertPanoramicRule(
  ".hrv-classroom-hub .collection-visual",
  /grid-area:\s*1\s*\/\s*1;[\s\S]*height:\s*100%/,
  "Collection images must fill the complete ribbon card"
);
assertPanoramicRule(
  ".hrv-classroom-hub .collection-summary",
  /-webkit-line-clamp:\s*1/,
  "Dense collection summaries must remain available but limited to one glanceable line"
);
assertPanoramicRule(
  ".hrv-classroom-hub .collection-label",
  /display:\s*none/,
  "Repeated card labels must not compete with image and title hierarchy"
);
assertPanoramicRule(
  ".hrv-classroom-hub .archive-door",
  /width:\s*100%;[\s\S]*min-width:\s*0;[\s\S]*min-height:\s*50px/,
  "The previous-years doorway must fill its compact edge rail"
);
assertPanoramicRule(
  ".hrv-classroom-hub .hub-action",
  /min-height:\s*44px/,
  "Primary actions must retain a practical desktop target size"
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
  /@media \(max-width: 720px\)[\s\S]*?\.museum-map-shell\s*\{[\s\S]*?flex-direction:\s*column;[\s\S]*?\.museum-map-links\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  `The Museum Map must stack without horizontal clipping on narrow screens. ${staticInvariantNote}`
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
assert.match(doorway, /47eab7374968ffd1896dca7c4fd3a19dff1fb96b/);
assert.match(doorway, /runtime\/2026\.08\.30\.3\/bootstrap\.js/);
assert.match(doorway, /publications\/pub-2026-08-30-003\/publication\.json/);
assert.ok(doorway.includes(releaseBootstrapSri));
Object.entries({ doorway, doorwayReadme, doorwayChannel }).forEach(([name, document]) => {
  assert.match(document, /47eab7374968ffd1896dca7c4fd3a19dff1fb96b/, `${name} must pin the immutable asset commit.`);
  assert.match(document, /2026\.08\.30\.3/, `${name} must identify the active runtime version.`);
  assert.match(document, /pub-2026-08-30-003/, `${name} must identify the active publication.`);
});
[doorwayReadme, doorwayChannel].forEach((document) => {
  assert.match(document, /5e2db1aea9d6447e508f7e2e04c74815f25c776c/);
  assert.match(document, /sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b/);
});
assert.doesNotMatch(
  activeDoorwayDocs,
  /review-bootstrap\.js|runtime-v3\.js|hub-v3\.css|hub-foundation\.css|hub-hero-and-map\.css|hub-feature-rooms\.css|hub-galleries-and-motion\.css|hub-responsive\.css|HughesWebAssets-Source@hub-authoring-v2-2026-08-28/
);
assert.equal(publication.sourceRevision, "5e2db1aea9d6447e508f7e2e04c74815f25c776c");
assert.equal(publication.previousKnownGoodPublication, "pub-2026-08-14-005");

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
runtime.mountClassroomExplorationsHub(mount, manifest);

assert.equal(mount.dataset.hrvState, "ready");
assert.equal(mount.classList.contains("hrv-classroom-hub"), true);
assert.equal(mount.querySelectorAll(".hub-museum").length, 1);

const hero = mount.querySelector(".hero-section");
const museumMap = mount.querySelector('nav.museum-map[aria-label="Museum map"]');
const welcome = mount.querySelector(".welcome-section");
const current = mount.querySelector(".current-exploration-section");
const currentTwwl = mount.querySelector(".current-twwl-section");
const pastExplorations = mount.querySelector(".past-explorations-section");
const pastTwwl = mount.querySelector(".past-twwl-section");
const archives = mount.querySelector(".archive-control-section");
assert.ok(hero && museumMap && welcome && current && currentTwwl && pastExplorations && pastTwwl && archives);
assert.equal(
  hero.compareDocumentPosition(museumMap) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "The compact Museum Map must follow the hero. Static DOM-order invariant only; browser layout is verified separately."
);
assert.equal(
  museumMap.compareDocumentPosition(welcome) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "Welcome Theater must follow the compact Museum Map. Static DOM-order invariant only; browser layout is verified separately."
);
assert.equal(
  welcome.compareDocumentPosition(current) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "Welcome Theater must be before Current Exploration."
);
[
  [current, currentTwwl, "Current Exploration must be before Current TWWL."],
  [currentTwwl, pastExplorations, "Current TWWL must be before Past Explorations."],
  [pastExplorations, pastTwwl, "Past Explorations must be before Past TWWL."],
  [pastTwwl, archives, "Past TWWL must be before Archives."]
].forEach(([before, after, message]) => {
  assert.equal(
    before.compareDocumentPosition(after) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
    dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
    message
  );
});

const expectedMuseumMap = [
  ["01", "Welcome", "#hrv-welcome-theater"],
  ["02", "Current", "#hrv-current-exploration"],
  ["03", "Learning Lantern", "#hrv-current-learning"],
  ["04", "Past Exhibits", "#hrv-past-explorations"],
  ["05", "Past Learning", "#hrv-past-learning"],
  ["06", "Archives", "#hrv-school-year-archives"]
];
const museumMapLinks = [...museumMap.querySelectorAll(".museum-map-link")];
assert.deepEqual(
  museumMapLinks.map((mapLink) => [
    mapLink.querySelector(".museum-map-number")?.textContent,
    mapLink.querySelector(".museum-map-label")?.textContent,
    mapLink.getAttribute("href")
  ]),
  expectedMuseumMap,
  "The compact Museum Map must retain stable text landmarks and in-page destinations."
);
expectedMuseumMap.forEach(([, label, href]) => {
  assert.ok(mount.querySelector(href), `Museum Map destination ${label} (${href}) must exist in the rendered Hub.`);
});

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
runtime.mountClassroomExplorationsHub(mount, manifest);
assert.equal(mount.querySelectorAll(".hub-museum").length, 1);
runtime.unmountClassroomExplorationsHub(mount);

console.log("[hub presentation] preserved source/routes/control hashes passed");
console.log("[hub presentation] one canonical runtime + import-free stylesheet passed");
console.log("[hub presentation] static panoramic density, hierarchy, and twelve-column composition invariants passed");
console.log("[hub presentation] compact Museum Map landmarks and complete visual/keyboard DOM order passed");
console.log("[hub presentation] real Zinnia + five real Past TWWL image renderers passed");
console.log("[hub presentation] dense gallery filtering and visible-count behavior passed");
console.log("[hub presentation] scoped motion, OS reduction, and no Hub-local effects control passed");
console.log("[hub presentation] static invariants passed; this test does not claim real-browser visual acceptance");
