import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { pathToFileURL, fileURLToPath } from "node:url";
import { JSDOM } from "jsdom";

import { projectArchiveRuntime } from "./lib/classroom-explorations-archive-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const readText = (relativePath) => readFileSync(path.join(root, relativePath), "utf8");
const readJson = (relativePath) => JSON.parse(readText(relativePath));

const archiveSource = readJson("apps/classroom-explorations-archive/source/archive-2025-2026.source.json");
const hubSource = readJson("apps/classroom-explorations-hub/source/hub.source.json");
const routes = readJson("registry/hrv-routes.source.json");
const manifest = projectArchiveRuntime(archiveSource, hubSource, routes);
const runtimePath = "apps/classroom-explorations-archive/src/runtime.js";
const runtimeText = readText(runtimePath);
const archiveCss = readText("apps/classroom-explorations-archive/src/archive.css");
const hubCss = readText("apps/classroom-explorations-hub/src/hub.css");
const bootstrap = readText("apps/classroom-explorations-archive/src/bootstrap.js");
const staticInvariantNote = "Static source invariant only; real-browser visual acceptance remains a separate gate.";

assert.match(runtimeText, /export function mountClassroomExplorationsArchive/);
assert.match(runtimeText, /export function unmountClassroomExplorationsArchive/);
assert.doesNotMatch(runtimeText, /aria-current/,
  "The archive must not claim the parent Hub route is the current page.");
assert.match(
  bootstrap,
  /const artworkKeys = \[\s*"pastYears",\s*"frameTopLeft",\s*"frameTopRight",\s*"frameMiddleLeft",\s*"frameMiddleRight",\s*"frameBottomLeft",\s*"frameBottomRight"\s*\]/,
  "The archive bootstrap must verify its identity artwork and all six approved banner-frame pieces."
);

assert.match(
  archiveCss,
  /\.hrv-classroom-hub\.hrv-classroom-explorations-archive\s*\{[\s\S]*?--archive-shell:\s*min\(1760px,\s*calc\(100dvw\s*-\s*clamp\(32px,\s*4vw,\s*72px\)\)\)/,
  `The archive shell must remain viewport-bounded. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /@media \(min-width: 1440px\)[\s\S]*?\.archive-museum\s*\{[\s\S]*?grid-template-columns:\s*repeat\(12,\s*minmax\(0,\s*1fr\)\)[\s\S]*?grid-template-rows:\s*82px\s+minmax\(196px,\s*auto\)\s+minmax\(400px,\s*auto\)\s+auto/,
  `Desktop must use a twelve-column panoramic archive composition with non-clipping rows. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /\.archive-collections-grid\s*\{[\s\S]*?grid-template-columns:\s*minmax\(0,\s*4\.6fr\)\s+minmax\(0,\s*7\.4fr\)/,
  `The 3-card and 5-card galleries must share the desktop canvas in a 4.6/7.4 composition. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /\.archive-gallery\s*\{[\s\S]*?min-width:\s*0;[\s\S]*?overflow:\s*hidden/,
  `Gallery cards must remain contained by their panels. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /@media \(max-width: 1179px\)[\s\S]*?\.archive-collections-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  `Tablet-width galleries must stack before they can overflow. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /@media \(max-width: 820px\)[\s\S]*?\.archive-exploration-grid,[\s\S]*?\.archive-learning-grid\s*\{[\s\S]*?grid-template-columns:\s*repeat\(2,\s*minmax\(0,\s*1fr\)\)/,
  `Narrow tablet cards must reduce to two columns. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /@media \(max-width: 560px\)[\s\S]*?\.archive-shell\s*\{[\s\S]*?width:\s*calc\(100dvw\s*-\s*24px\)[\s\S]*?\.archive-exploration-grid,[\s\S]*?\.archive-learning-grid\s*\{[\s\S]*?grid-template-columns:\s*1fr/,
  `Mobile must use a viewport-bounded shell and one-column cards. ${staticInvariantNote}`
);
assert.match(
  archiveCss,
  /@media \(prefers-reduced-motion: reduce\)[\s\S]*?\.archive-overview-copy,[\s\S]*?\.archive-identity-card\s*\{[\s\S]*?opacity:\s*1\s*!important;[\s\S]*?transform:\s*none\s*!important/,
  "Archive entrance states must resolve to visible, static content for reduced motion."
);
assert.match(hubCss, /@media \(prefers-reduced-motion: reduce\)/,
  "The inherited Hub atmosphere must retain its system reduced-motion policy.");
assert.doesNotMatch(
  archiveCss,
  /(?:^|,)\s*(?:html|body|#page|#masthead|#colophon)\b/m,
  "Archive presentation CSS must not repaint the native Amadeus shell."
);

assert.deepEqual(manifest.stats, { explorations: 3, twwl: 5, total: 8 });

const dom = new JSDOM("<!doctype html><html><body><div id=\"archive\" aria-busy=\"true\"></div></body></html>", {
  url: manifest.page.href
});

globalThis.window = dom.window;
globalThis.document = dom.window.document;
globalThis.HTMLElement = dom.window.HTMLElement;
globalThis.CustomEvent = dom.window.CustomEvent;
globalThis.requestAnimationFrame = (callback) => {
  callback(0);
  return 1;
};
globalThis.cancelAnimationFrame = () => {};

const motionQuery = {
  matches: false,
  addEventListener() {},
  removeEventListener() {}
};
dom.window.matchMedia = () => motionQuery;

globalThis.IntersectionObserver = class {
  observe(element) {
    element.classList.add("is-awake", "is-in-view");
  }
  unobserve() {}
  disconnect() {}
};

const runtimeUrl = `${pathToFileURL(path.join(root, runtimePath)).href}?archive-presentation-test=${Date.now()}`;
const runtime = await import(runtimeUrl);
const mount = dom.window.document.getElementById("archive");
const runtimeAssets = {
  artwork: {
    pastYears: "https://assets.example/history/past-years.webp",
    frameTopLeft: "https://assets.example/frame/top-left.webp",
    frameTopRight: "https://assets.example/frame/top-right.webp",
    frameMiddleLeft: "https://assets.example/frame/middle-left.webp",
    frameMiddleRight: "https://assets.example/frame/middle-right.webp",
    frameBottomLeft: "https://assets.example/frame/bottom-left.webp",
    frameBottomRight: "https://assets.example/frame/bottom-right.webp"
  }
};

const firstController = runtime.mountClassroomExplorationsArchive(mount, manifest, runtimeAssets);
assert.equal(mount.dataset.hrvState, "ready");
assert.equal(mount.classList.contains("hrv-classroom-hub"), true);
assert.equal(mount.classList.contains("hrv-classroom-explorations-archive"), true);
assert.equal(dom.window.document.documentElement.classList.contains("hrv-page-classroom-explorations-archive-ready"), true);
assert.equal(mount.querySelectorAll(".archive-museum").length, 1);
assert.equal(mount.querySelectorAll("h1").length, 1, "The archive must expose exactly one page-level H1.");
assert.equal(mount.querySelector("h1")?.className, "archive-page-title");
assert.equal(mount.querySelector(".archive-identity-title")?.tagName, "P",
  "The shared Hub identity is context, not a competing page heading.");
assert.equal(mount.querySelectorAll(".archive-gallery-title").length, 2);
assert.ok([...mount.querySelectorAll(".archive-gallery-title")].every((heading) => heading.tagName === "H2"));

const navigation = mount.querySelector('nav.site-navigation[aria-label="Hughes Room Views site navigation"]');
assert.ok(navigation);
assert.deepEqual(
  [...navigation.querySelectorAll(".site-navigation-link")].map((item) => [
    item.tagName,
    item.textContent,
    item.href,
    item.getAttribute("aria-current")
  ]),
  [
    ["A", "Home", "https://rmhughes.edublogs.org/", null],
    ["A", "Hughes Monthly Calendar", "https://rmhughes.edublogs.org/hughes-monthly-calendar/", null],
    ["A", "Posts", "https://rmhughes.edublogs.org/posts/", null],
    ["A", "Hughes Class Library", "https://rmhughes.edublogs.org/class-library/", null],
    ["A", "Photo Album", "https://rmhughes.edublogs.org/photo-album/", null],
    ["A", "Classroom Explorations", manifest.page.hubHref, null],
    ["A", "Contact Information", "https://rmhughes.edublogs.org/contact-information/", null]
  ],
  "Archive navigation must expose the exact global menu while linking, not claiming, the parent Hub context."
);
assert.equal(navigation.querySelector(".site-navigation-link.is-parent-context")?.href, manifest.page.hubHref);

const returnLinks = [...mount.querySelectorAll("[data-archive-return]")];
assert.equal(returnLinks.length, 2, "The archive needs an obvious Hub return in both the overview and footer.");
assert.ok(returnLinks.every((anchor) => anchor.href === manifest.page.hubHref));
assert.deepEqual(returnLinks.map((anchor) => anchor.textContent), [
  manifest.page.copy.navigation.backLabel,
  manifest.page.copy.navigation.returnLabel
]);

const explorationCards = [...mount.querySelectorAll(".archive-exploration-grid > .exploration-card")];
const learningCards = [...mount.querySelectorAll(".archive-learning-grid > .learning-card")];
assert.equal(explorationCards.length, 3);
assert.equal(learningCards.length, 5);
const butterflies = mount.querySelector('[data-hrv-content-id="butterflies-in-the-classroom"]');
assert.ok(butterflies?.classList.contains("subject-caterpillars"));
assert.equal(
  butterflies.querySelector(".collection-link")?.href,
  "https://rmhughes.edublogs.org/hub/exploration-butterflies/"
);
assert.ok([...mount.querySelectorAll(".archive-collection-card")].every((card) => card.querySelector(".collection-image")?.alt));

const frameLayer = mount.querySelector(".hub-banner-frame-layer");
assert.equal(frameLayer?.getAttribute("aria-hidden"), "true");
assert.deepEqual(
  [...frameLayer.querySelectorAll(":scope > .hub-banner-frame-piece")].map((frame) => [
    frame.dataset.frameKey,
    frame.getAttribute("src"),
    frame.getAttribute("alt"),
    frame.draggable
  ]),
  [
    ["frameTopLeft", runtimeAssets.artwork.frameTopLeft, "", false],
    ["frameTopRight", runtimeAssets.artwork.frameTopRight, "", false],
    ["frameMiddleLeft", runtimeAssets.artwork.frameMiddleLeft, "", false],
    ["frameMiddleRight", runtimeAssets.artwork.frameMiddleRight, "", false],
    ["frameBottomLeft", runtimeAssets.artwork.frameBottomLeft, "", false],
    ["frameBottomRight", runtimeAssets.artwork.frameBottomRight, "", false]
  ]
);
assert.equal(mount.querySelector(".archive-identity-artwork")?.getAttribute("src"), runtimeAssets.artwork.pastYears);

const [explorationSearch, learningSearch] = mount.querySelectorAll(".gallery-search");
const [explorationCount, learningCount] = mount.querySelectorAll(".gallery-count");
const [explorationNoResults, learningNoResults] = mount.querySelectorAll(".archive-no-results");
assert.equal(explorationCount.textContent, "3 exhibits on display");
assert.equal(learningCount.textContent, "5 learning displays on display");

explorationSearch.value = "butterflies";
explorationSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(explorationCards.filter((card) => !card.hidden).length, 1);
assert.equal(explorationCount.textContent, "1 exhibit on display");
assert.equal(explorationNoResults.hidden, true);
explorationSearch.value = "no such exhibit";
explorationSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(explorationCards.filter((card) => !card.hidden).length, 0);
assert.equal(explorationCount.textContent, "0 exhibits on display");
assert.equal(explorationNoResults.hidden, false);
explorationSearch.value = "";
explorationSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(explorationCards.filter((card) => !card.hidden).length, 3);

learningSearch.value = "nocturnal";
learningSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(learningCards.filter((card) => !card.hidden).length, 2);
assert.equal(learningCount.textContent, "2 learning displays on display");
learningSearch.value = "no such learning display";
learningSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(learningCards.filter((card) => !card.hidden).length, 0);
assert.equal(learningCount.textContent, "0 learning displays on display");
assert.equal(learningNoResults.hidden, false);
learningSearch.value = "";
learningSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(learningCards.filter((card) => !card.hidden).length, 5);

const duplicateController = runtime.mountClassroomExplorationsArchive(mount, manifest, runtimeAssets);
assert.equal(duplicateController, firstController, "Duplicate mounting must be idempotent.");
assert.equal(mount.querySelectorAll(".archive-museum").length, 1);

runtime.unmountClassroomExplorationsArchive(mount);
assert.equal(mount.children.length, 0);
assert.equal(mount.classList.contains("hrv-classroom-hub"), false);
assert.equal(mount.classList.contains("hrv-classroom-explorations-archive"), false);
assert.equal(dom.window.document.documentElement.classList.contains("hrv-page-classroom-explorations-archive-ready"), false);
assert.equal(mount.dataset.hrvState, undefined);

runtime.mountClassroomExplorationsArchive(mount, manifest, runtimeAssets);
assert.equal(mount.querySelectorAll(".archive-museum").length, 1);
runtime.unmountClassroomExplorationsArchive(mount);

console.log("[archive presentation] exact global menu, Hub returns, heading hierarchy, and approved frame art passed");
console.log("[archive presentation] 3 explorations + 5 learning cards, canonical Butterflies route, and filtering passed");
console.log("[archive presentation] mount, duplicate mount, unmount, reduced-motion, and responsive static invariants passed");
console.log("[archive presentation] static invariants passed; this test does not claim real-browser visual acceptance");
