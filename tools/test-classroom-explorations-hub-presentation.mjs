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

assert.deepEqual(
  readdirSync(path.join(root, "apps/classroom-explorations-hub/src")).sort(),
  ["bootstrap.js", "host-compat.css", "hub.css", "runtime.js"],
  "The Hub source directory must contain one bootstrap, one runtime, one app stylesheet, and one host stylesheet."
);

assert.match(runtimeText, /export function mountClassroomExplorationsHub/);
assert.doesNotMatch(runtimeText, /Reduced Effects|localStorage|EFFECTS_KEY|data-effects-toggle|manualReduced|applyEffects/);
assert.doesNotMatch(runtimeText, /window\.HRVClassroomExplorationsV2|runtime-v3|hrv-hub-v3/);
assert.doesNotMatch(css, /@import\b|\[data-effects|hub-v[123]/i);
assert.match(css, /--hub-shell-wide:\s*min\(1680px/);
assert.match(css, /--hub-shell-theater:\s*min\(1320px/);
assert.match(css, /margin-right:\s*max\(32px, 5vw\)/);
assert.match(css, /margin-left:\s*max\(32px, 5vw\)/);
assert.match(css, /grid-template-columns:\s*repeat\(3, minmax\(0, 1fr\)\)/);
assert.match(css, /\.learning-grid \.collection-visual[\s\S]*?aspect-ratio:\s*16 \/ 8/);
assert.match(css, /@keyframes hub-stars-drift-a/);
assert.match(css, /@keyframes hub-stars-drift-b/);
assert.match(css, /@keyframes hub-compass-orbit/);
assert.match(css, /@keyframes hub-screen-glint/);
assert.match(css, /@keyframes hub-glass-glint/);
assert.match(css, /@keyframes hub-lantern-flame/);
assert.match(css, /@keyframes hub-leaf-breathe/);
assert.match(css, /@media \(prefers-reduced-motion: reduce\)/);
assert.match(bootstrap, /style\.dataset\.hrvClassroomHubStyle = "app"/);
assert.match(bootstrap, /compat\.dataset\.hrvClassroomHubStyle = "host"/);
assert.match(bootstrap, /link\[data-hrv-review-style\]/);
assert.match(bootstrap, /script\[data-hrv-review-runtime\]/);

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

const welcome = mount.querySelector(".welcome-section");
const current = mount.querySelector(".current-exploration-section");
assert.ok(welcome && current);
assert.equal(
  welcome.compareDocumentPosition(current) & dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  dom.window.Node.DOCUMENT_POSITION_FOLLOWING,
  "Welcome Theater must be before Current Exploration."
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

runtime.unmountClassroomExplorationsHub(mount);
assert.equal(mount.children.length, 0);
runtime.mountClassroomExplorationsHub(mount, manifest);
assert.equal(mount.querySelectorAll(".hub-museum").length, 1);
runtime.unmountClassroomExplorationsHub(mount);

console.log("[hub presentation] preserved source/routes/control hashes passed");
console.log("[hub presentation] one canonical runtime + import-free stylesheet passed");
console.log("[hub presentation] Welcome-before-Current and full-width asymmetric geometry passed");
console.log("[hub presentation] real Zinnia + five real Past TWWL image renderers passed");
console.log("[hub presentation] motion, OS reduction, and no Hub-local effects control passed");
