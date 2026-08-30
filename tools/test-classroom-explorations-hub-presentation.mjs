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

assert.equal(sha256(sourcePath), "3c85a2ce02f4ff11c337c8d28444604907971d4c2ca59d74d65e20b3ee009977");
assert.equal(sha256(routesPath), "29ab9bc8262b128b2222d4a115b3906701f0d5747f6d3ebcab059680204c1a73");
assert.equal(sha256(controlPath), "7784b2d569ba13bf45ef512ca48c431166d6e249a75ad13058f848dca55110be");

const source = readJson(sourcePath);
const routes = readJson(routesPath);
const manifest = projectHubRuntime(source, routes);
const runtimeText = readText(runtimePath);
const css = readText(cssPath);
const bootstrap = readText(bootstrapPath);
const staticInvariantNote = "Static source invariant only; real-browser visual acceptance remains a separate gate.";
const cssRules = [...css.matchAll(/([^{}]+)\{([^{}]*)\}/g)].map((match) => ({
  selectors: match[1].split(",").map((selector) => selector.trim()),
  body: match[2]
}));
const assertCssRule = (selector, expected, description) => {
  const bodies = cssRules
    .filter((rule) => rule.selectors.includes(selector))
    .map((rule) => rule.body);

  assert.ok(bodies.length, `Missing CSS rule for ${selector}. ${staticInvariantNote}`);
  assert.ok(
    bodies.some((body) => expected.test(body)),
    `${description}. ${staticInvariantNote}`
  );
};
const doorway = readText("docs/edublogs-integration/classroom-explorations-hub-test/JAVASCRIPT-BOX.js");
const doorwayReadme = readText("docs/edublogs-integration/classroom-explorations-hub-test/README.md");
const doorwayChannel = readText("docs/edublogs-integration/classroom-explorations-hub-test/BRANCH-CHANNEL.txt");
const activeDoorwayDocs = [doorway, doorwayReadme, doorwayChannel].join("\n");
const publication = readJson("releases/classroom-explorations-hub/publications/pub-2026-08-30-002/publication.json");
const releaseBootstrap = readFileSync(
  path.join(root, "releases/classroom-explorations-hub/runtime/2026.08.30.2/bootstrap.js")
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
  "The Hub must retain the readable Phase 1.2 base type scale"
);
assertCssRule(
  ".hrv-classroom-hub .welcome-section .museum-shell",
  /width:\s*var\(--hub-shell-theater\);[\s\S]*margin-right:\s*clamp\(48px,\s*4vw,\s*80px\);[\s\S]*margin-left:\s*auto/,
  "Welcome Theater must occupy the right-side theater stage"
);
assertCssRule(
  ".hrv-classroom-hub .current-exploration-section .museum-shell",
  /width:\s*var\(--hub-shell-reading\);[\s\S]*margin-right:\s*auto;[\s\S]*margin-left:\s*clamp\(48px,\s*4vw,\s*80px\)/,
  "Current Exploration must counterbalance Welcome on the left-side reading stage"
);
assertCssRule(
  ".hrv-classroom-hub .current-twwl-section .museum-shell",
  /width:\s*min\(1360px,\s*calc\(100dvw\s*-\s*clamp\(64px,\s*10vw,\s*192px\)\)\);[\s\S]*margin-inline:\s*auto/,
  "The current TWWL room must remain a compact centered focal room"
);
assertCssRule(
  ".hrv-classroom-hub .hub-hero-card",
  /grid-template-columns:\s*minmax\(0,\s*1\.18fr\)\s*minmax\(540px,\s*0\.82fr\);[\s\S]*min-height:\s*clamp\(450px,\s*52svh,\s*500px\)/,
  "The hero must retain its balanced Phase 1.2 composition"
);
assertCssRule(
  ".hrv-classroom-hub .hub-title",
  /font-size:\s*clamp\(4\.6rem,\s*5vw,\s*5\.4rem\)/,
  "The hero title must retain its primary visual hierarchy"
);
assertCssRule(
  ".hrv-classroom-hub .hub-compass",
  /width:\s*clamp\(176px,\s*11vw,\s*220px\)/,
  "The compass must remain a visible focal object"
);
assertCssRule(
  ".hrv-classroom-hub .museum-map-shell",
  /width:\s*var\(--hub-shell-reading\);[\s\S]*min-height:\s*54px/,
  "The compact Museum Map must retain the reading-stage width"
);
assertCssRule(
  ".hrv-classroom-hub .museum-map-link",
  /font-size:\s*0\.88rem/,
  "Museum Map navigation must not regress to microtype"
);
assertCssRule(
  ".hrv-classroom-hub .welcome-theater-card",
  /grid-template-columns:\s*minmax\(430px,\s*0\.38fr\)\s*minmax\(720px,\s*0\.62fr\);[\s\S]*min-height:\s*0;[\s\S]*border:\s*0;[\s\S]*background:\s*transparent;[\s\S]*box-shadow:\s*none/,
  "Welcome must use an unboxed editorial composition instead of a giant repeated room"
);
assertCssRule(
  ".hrv-classroom-hub .welcome-screen",
  /width:\s*min\(100%,\s*840px\);[\s\S]*aspect-ratio:\s*16\s*\/\s*9/,
  "The real Welcome media must retain its deliberate theater scale"
);
assertCssRule(
  ".hrv-classroom-hub .current-exploration-card",
  /grid-template-columns:\s*minmax\(520px,\s*0\.96fr\)\s*minmax\(0,\s*1\.04fr\);[\s\S]*min-height:\s*clamp\(450px,\s*51svh,\s*500px\)/,
  "Current Exploration must retain its copy-and-photography hierarchy"
);
assertCssRule(
  ".hrv-classroom-hub .current-visual",
  /height:\s*clamp\(420px,\s*49svh,\s*470px\)/,
  "Current Exploration photography must remain bounded at desktop density"
);
assertCssRule(
  ".hrv-classroom-hub .current-twwl-card",
  /grid-template-columns:\s*minmax\(0,\s*1fr\)\s*minmax\(320px,\s*380px\);[\s\S]*min-height:\s*300px/,
  "The current TWWL room must retain compact copy-and-lantern geometry"
);
assertCssRule(
  ".hrv-classroom-hub .gallery-frame",
  /overflow:\s*visible;[\s\S]*border:\s*0;[\s\S]*background:\s*transparent;[\s\S]*box-shadow:\s*none/,
  "Gallery sections must not reintroduce giant nested panel rectangles"
);
assertCssRule(
  ".hrv-classroom-hub .exploration-grid",
  /grid-template-columns:\s*minmax\(0,\s*1\.12fr\)\s*repeat\(2,\s*minmax\(0,\s*0\.94fr\)\)/,
  "Past Explorations must retain an intentional asymmetric card rhythm"
);
assertCssRule(
  ".hrv-classroom-hub .learning-grid",
  /display:\s*flex;[\s\S]*flex-wrap:\s*wrap;[\s\S]*justify-content:\s*center/,
  "Past TWWL cards must wrap into centered rows without an orphaned left-aligned pair"
);
assertCssRule(
  ".hrv-classroom-hub .learning-grid .learning-card",
  /width:\s*calc\(\(100%\s*-\s*3rem\)\s*\/\s*3\);[\s\S]*flex:\s*0\s+1\s+calc\(\(100%\s*-\s*3rem\)\s*\/\s*3\)/,
  "Past TWWL cards must retain three-card desktop sizing while allowing centered wrapping"
);
assertCssRule(
  ".hrv-classroom-hub .collection-title",
  /font-size:\s*clamp\(1\.25rem,\s*1\.35vw,\s*1\.48rem\)/,
  "Collection titles must retain the readable Phase 1.2 hierarchy"
);
assertCssRule(
  ".hrv-classroom-hub .collection-summary",
  /font-size:\s*1\.05rem;[\s\S]*line-height:\s*1\.55/,
  "Collection summaries must retain the readable Phase 1.2 scale"
);
assertCssRule(
  ".hrv-classroom-hub .collection-label",
  /font-size:\s*0\.82rem/,
  "Collection labels and years must remain readable at the target viewport"
);
assertCssRule(
  ".hrv-classroom-hub .collection-tags li",
  /font-size:\s*0\.86rem/,
  "Tags must not regress to microtype"
);
assertCssRule(
  ".hrv-classroom-hub .archive-door",
  /min-width:\s*250px;[\s\S]*min-height:\s*84px/,
  "The previous-years doorway must retain sufficient visual weight"
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
assert.match(doorway, /6f4da0f5481fcc2d6af88c505a67d547ecadf8f8/);
assert.match(doorway, /runtime\/2026\.08\.30\.2\/bootstrap\.js/);
assert.match(doorway, /publications\/pub-2026-08-30-002\/publication\.json/);
assert.ok(doorway.includes(releaseBootstrapSri));
Object.entries({ doorway, doorwayReadme, doorwayChannel }).forEach(([name, document]) => {
  assert.match(document, /6f4da0f5481fcc2d6af88c505a67d547ecadf8f8/, `${name} must pin the immutable asset commit.`);
  assert.match(document, /2026\.08\.30\.2/, `${name} must identify the active runtime version.`);
  assert.match(document, /pub-2026-08-30-002/, `${name} must identify the active publication.`);
});
[doorwayReadme, doorwayChannel].forEach((document) => {
  assert.match(document, /96ae80965af17172631d208f8aafd2c568b43391/);
  assert.match(document, /sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b/);
});
assert.doesNotMatch(
  activeDoorwayDocs,
  /review-bootstrap\.js|runtime-v3\.js|hub-v3\.css|hub-foundation\.css|hub-hero-and-map\.css|hub-feature-rooms\.css|hub-galleries-and-motion\.css|hub-responsive\.css|HughesWebAssets-Source@hub-authoring-v2-2026-08-28/
);
assert.equal(publication.sourceRevision, "96ae80965af17172631d208f8aafd2c568b43391");
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
assert.ok(hero && museumMap && welcome && current);
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

runtime.unmountClassroomExplorationsHub(mount);
assert.equal(mount.children.length, 0);
runtime.mountClassroomExplorationsHub(mount, manifest);
assert.equal(mount.querySelectorAll(".hub-museum").length, 1);
runtime.unmountClassroomExplorationsHub(mount);

console.log("[hub presentation] preserved source/routes/control hashes passed");
console.log("[hub presentation] one canonical runtime + import-free stylesheet passed");
console.log("[hub presentation] static Phase 1.2 density, hierarchy, and composition invariants passed");
console.log("[hub presentation] compact Museum Map landmarks and Welcome-before-Current DOM order passed");
console.log("[hub presentation] real Zinnia + five real Past TWWL image renderers passed");
console.log("[hub presentation] scoped motion, OS reduction, and no Hub-local effects control passed");
console.log("[hub presentation] static invariants passed; this test does not claim real-browser visual acceptance");
