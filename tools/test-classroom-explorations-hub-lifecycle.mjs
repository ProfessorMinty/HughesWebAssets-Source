import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

import { JSDOM } from "jsdom";

import {
  HubContractError,
  projectHubRuntime,
  validateRuntimeManifestCompatibility
} from "./lib/classroom-explorations-hub-contract.mjs";
import { validateSchema } from "./lib/json-schema-lite.mjs";

const here = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(here, "..");
const readJson = (relativePath) =>
  JSON.parse(readFileSync(path.join(root, relativePath), "utf8"));

const source = readJson("apps/classroom-explorations-hub/source/hub.source.json");
const routes = readJson("registry/hrv-routes.source.json");
const manifest = projectHubRuntime(source, routes);
const runtimeSchema = readJson("schemas/classroom-explorations-hub.runtime.schema.json");

const dom = new JSDOM("<!doctype html><html><body></body></html>", {
  url: "https://rmhughes.edublogs.org/hub-test/",
  pretendToBeVisual: true
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
globalThis.IntersectionObserver = class {
  observe(element) {
    element.classList.add("is-awake");
  }
  unobserve() {}
  disconnect() {}
};
dom.window.matchMedia = () => ({
  matches: false,
  addEventListener() {},
  removeEventListener() {}
});

const runtimeUrl = `${pathToFileURL(path.join(
  root,
  "apps/classroom-explorations-hub/src/runtime.js"
)).href}?lifecycle-test=${Date.now()}`;
const runtime = await import(runtimeUrl);

const addMount = () => {
  const mount = dom.window.document.createElement("div");
  dom.window.document.body.append(mount);
  return mount;
};

const emptyManifest = structuredClone(manifest);
emptyManifest.galleries.pastExplorations = [];
emptyManifest.galleries.pastTwwl = [];
emptyManifest.archives = [];
validateSchema(emptyManifest, runtimeSchema);
const emptyMount = addMount();
runtime.mountClassroomExplorationsHub(emptyMount, emptyManifest);

assert.equal(
  emptyMount.querySelectorAll(".gallery-search").length,
  0,
  "Empty galleries must not expose filters that cannot produce a result."
);
assert.equal(
  emptyMount.querySelectorAll(".gallery-count").length,
  0,
  "Empty galleries must not announce a meaningless zero count."
);
assert.equal(emptyMount.querySelectorAll(".gallery-empty-state").length, 2);
assert.match(
  emptyMount.querySelector(".archive-empty-state")?.textContent || "",
  /No previous school-year archives are available yet\./
);
runtime.unmountClassroomExplorationsHub(emptyMount);
emptyMount.remove();

const publishedManifest = structuredClone(manifest);
const publishedItem = structuredClone(manifest.galleries.pastTwwl[0]);
delete publishedItem.image;
publishedManifest.current.twwl = {
  id: "hub-slot:current-twwl",
  state: "published",
  content: publishedItem
};
validateSchema(publishedManifest, runtimeSchema);
assert.equal(validateRuntimeManifestCompatibility(publishedManifest), publishedManifest);
const publishedMount = addMount();
runtime.mountClassroomExplorationsHub(publishedMount, publishedManifest);

const currentTwwlFallback = publishedMount.querySelector(".hub-media-fallback-twwl");
assert.ok(currentTwwlFallback, "Published Current TWWL without an image must render a fallback.");
assert.equal(currentTwwlFallback.hidden, false);
assert.match(currentTwwlFallback.textContent, /visual coming soon/i);
assert.equal(
  publishedMount.querySelector(".current-twwl-visual .twwl-media-stage")?.dataset.mediaState,
  "unavailable"
);

const currentImage = publishedMount.querySelector(".current-image");
const currentStage = publishedMount.querySelector(".current-media-stage");
currentImage.dispatchEvent(new dom.window.Event("error"));
assert.equal(currentImage.hidden, true);
assert.equal(currentStage.dataset.mediaState, "unavailable");
assert.equal(currentStage.querySelector(".hub-media-fallback-current")?.hidden, false);

const collectionImage = publishedMount.querySelector(".exploration-card .collection-image");
const collectionVisual = collectionImage.closest(".collection-visual");
collectionImage.dispatchEvent(new dom.window.Event("error"));
assert.equal(collectionImage.hidden, true);
assert.equal(collectionVisual.dataset.mediaState, "unavailable");
assert.equal(collectionVisual.querySelector(".hub-media-fallback-card")?.hidden, false);

const videoAlternate = publishedMount.querySelector(".welcome-video-alternate");
assert.equal(videoAlternate?.href, "https://www.youtube.com/watch?v=kRTJp4pqbtg");
assert.equal(videoAlternate?.target, "_blank");
assert.match(videoAlternate?.rel || "", /noopener/);
assert.equal(videoAlternate?.hidden, true);
const welcomeFrame = publishedMount.querySelector(".welcome-screen iframe");
welcomeFrame.dispatchEvent(new dom.window.Event("error"));
assert.equal(welcomeFrame.hidden, true);
assert.equal(publishedMount.querySelector(".welcome-screen")?.dataset.mediaState, "unavailable");
assert.equal(publishedMount.querySelector(".hub-media-fallback-video")?.hidden, false);
assert.equal(videoAlternate?.hidden, false);

const explorationSearch = publishedMount.querySelector('[aria-label="Filter explorations"]');
const explorationCards = [...publishedMount.querySelectorAll(".exploration-card")];
const explorationNoResults = publishedMount.querySelector(
  ".exploration-gallery-frame .gallery-no-results"
);
const explorationClear = publishedMount.querySelector(
  ".exploration-gallery-frame .gallery-clear"
);
assert.equal(explorationClear.hidden, true);
explorationSearch.value = "no matching classroom exhibit";
explorationSearch.dispatchEvent(new dom.window.Event("input", { bubbles: true }));
assert.equal(explorationCards.filter((card) => !card.hidden).length, 0);
assert.equal(explorationNoResults.hidden, false);
assert.equal(explorationClear.hidden, false);
assert.equal(
  publishedMount.querySelector(".exploration-gallery-frame .gallery-count")?.textContent,
  "0 exhibits on display"
);
explorationClear.click();
assert.equal(explorationCards.filter((card) => !card.hidden).length, explorationCards.length);
assert.equal(explorationNoResults.hidden, true);
assert.equal(explorationClear.hidden, true);
assert.equal(explorationSearch.value, "");
assert.equal(dom.window.document.activeElement, explorationSearch);

const firstHistoryDoor = publishedMount.querySelector("button.history-door");
const firstDialog = publishedMount.querySelector("dialog.history-dialog");
const hostSibling = dom.window.document.createElement("button");
hostSibling.textContent = "Native shell control";
dom.window.document.body.append(hostSibling);
firstHistoryDoor.focus();
firstHistoryDoor.click();
assert.equal(firstDialog.dataset.hrvDialogMode, "fallback");
assert.equal(firstDialog.hidden, false);
assert.equal(firstDialog.hasAttribute("open"), true);
assert.equal(firstDialog.getAttribute("role"), "dialog");
assert.equal(firstDialog.getAttribute("aria-modal"), "true");
assert.equal(publishedMount.classList.contains("has-fallback-dialog"), true);
assert.equal(publishedMount.hasAttribute("inert"), true);
assert.equal(publishedMount.getAttribute("aria-hidden"), "true");
assert.equal(hostSibling.hasAttribute("inert"), true);
assert.equal(hostSibling.getAttribute("aria-hidden"), "true");
assert.equal(firstDialog.closest(".hub-dialog-portal")?.parentElement, dom.window.document.body);
assert.equal(dom.window.document.activeElement, firstDialog.querySelector(".history-dialog-close"));

firstDialog.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
  key: "Tab",
  shiftKey: true,
  bubbles: true,
  cancelable: true
}));
assert.equal(firstDialog.contains(dom.window.document.activeElement), true);

firstDialog.dispatchEvent(new dom.window.KeyboardEvent("keydown", {
  key: "Escape",
  bubbles: true,
  cancelable: true
}));
assert.equal(firstDialog.hidden, true);
assert.equal(firstDialog.hasAttribute("open"), false);
assert.equal(publishedMount.classList.contains("has-fallback-dialog"), false);
assert.equal(publishedMount.hasAttribute("inert"), false);
assert.equal(publishedMount.hasAttribute("aria-hidden"), false);
assert.equal(hostSibling.hasAttribute("inert"), false);
assert.equal(hostSibling.hasAttribute("aria-hidden"), false);
assert.equal(firstDialog.parentElement?.classList.contains("hub-museum"), true);
assert.equal(dom.window.document.activeElement, firstHistoryDoor);
hostSibling.remove();

runtime.unmountClassroomExplorationsHub(publishedMount);
publishedMount.remove();

const invalidPublishedManifest = structuredClone(manifest);
invalidPublishedManifest.current.twwl = {
  id: "hub-slot:current-twwl",
  state: "published"
};
assert.throws(
  () => runtime.mountClassroomExplorationsHub(addMount(), invalidPublishedManifest),
  /Unsupported Classroom Explorations runtime manifest/
);
assert.throws(
  () => validateRuntimeManifestCompatibility(invalidPublishedManifest),
  (error) =>
    error instanceof HubContractError &&
    error.code === "HUB_RUNTIME_CONTENT_INCOMPATIBLE"
);

const emptyCompatibleManifest = structuredClone(manifest);
emptyCompatibleManifest.galleries.pastExplorations = [];
emptyCompatibleManifest.galleries.pastTwwl = [];
emptyCompatibleManifest.archives = [];
assert.equal(validateRuntimeManifestCompatibility(emptyCompatibleManifest), emptyCompatibleManifest);

const invalidCopyManifest = structuredClone(manifest);
invalidCopyManifest.page.copy = {};
assert.throws(
  () => validateSchema(invalidCopyManifest, runtimeSchema),
  (error) => error?.issues?.some((issue) => issue.code === "SCHEMA_REQUIRED")
);
assert.throws(
  () => validateRuntimeManifestCompatibility(invalidCopyManifest),
  (error) =>
    error instanceof HubContractError &&
    error.code === "HUB_RUNTIME_CONTENT_INCOMPATIBLE"
);
const invalidCopyMount = addMount();
assert.throws(
  () => runtime.mountClassroomExplorationsHub(invalidCopyMount, invalidCopyManifest),
  /Unsupported Classroom Explorations runtime manifest/
);
invalidCopyMount.remove();

const whitespaceCopyManifest = structuredClone(manifest);
whitespaceCopyManifest.page.copy.welcome.title = " \t\n ";
validateSchema(whitespaceCopyManifest, runtimeSchema);
assert.throws(
  () => validateRuntimeManifestCompatibility(whitespaceCopyManifest),
  (error) =>
    error instanceof HubContractError &&
    error.code === "HUB_RUNTIME_CONTENT_INCOMPATIBLE"
);
const whitespaceCopyMount = addMount();
assert.throws(
  () => runtime.mountClassroomExplorationsHub(whitespaceCopyMount, whitespaceCopyManifest),
  /Unsupported Classroom Explorations runtime manifest/
);
whitespaceCopyMount.remove();

const legacyV1Manifest = readJson(
  "releases/classroom-explorations-hub/content/94fd2b8a66f5ce35ac5a761add569554f5f5dc7d1e63ac4354b8aa3e72070cd0/manifest.json"
);
validateSchema(legacyV1Manifest, runtimeSchema);
assert.equal(validateRuntimeManifestCompatibility(legacyV1Manifest), legacyV1Manifest);
const legacyMount = addMount();
runtime.mountClassroomExplorationsHub(legacyMount, legacyV1Manifest);
assert.equal(legacyMount.querySelectorAll(".hero-pillars li").length, 4);
assert.match(legacyMount.querySelector(".hero-oath-title")?.textContent || "", /Exploration Promise/);
runtime.unmountClassroomExplorationsHub(legacyMount);
legacyMount.remove();

const bootstrapText = readFileSync(
  path.join(root, "apps/classroom-explorations-hub/src/bootstrap.js"),
  "utf8"
);
const bootstrapDom = new JSDOM(`<!doctype html><html><body>
  <div id="hrv-classroom-explorations-root" class="hrv-hub-doorway">
    <section class="hrv-hub-outage" data-hrv-outage-notice hidden>
      <p class="hrv-hub-outage__eyebrow">Outage eyebrow</p>
      <h2 class="hrv-hub-outage__title">Outage title</h2>
      <p class="hrv-hub-outage__copy">Outage copy</p>
    </section>
  </div>
  <script id="bootstrap" data-publication="https://assets.example/publication.json"></script>
</body></html>`, {
  url: "https://rmhughes.edublogs.org/hub-test/",
  runScripts: "outside-only"
});
const bootstrapScript = bootstrapDom.window.document.getElementById("bootstrap");
Object.defineProperty(bootstrapDom.window.document, "currentScript", {
  configurable: true,
  value: bootstrapScript
});
bootstrapDom.window.fetch = () => new Promise(() => {});
bootstrapDom.window.eval(bootstrapText);

const loadingRoot = bootstrapDom.window.document.getElementById(
  "hrv-classroom-explorations-root"
);
const loadingNotice = loadingRoot.querySelector("[data-hrv-loading-notice]");
assert.equal(loadingRoot.dataset.hrvState, "loading");
assert.equal(loadingRoot.getAttribute("aria-busy"), "true");
assert.ok(loadingNotice);
assert.equal(loadingNotice.hidden, false);
assert.equal(loadingNotice.getAttribute("role"), "status");
assert.equal(loadingNotice.getAttribute("aria-live"), "polite");
assert.match(loadingNotice.textContent, /Opening Classroom Explorations/);

const productionBootstrapDom = new JSDOM(`<!doctype html><html><body>
  <section id="hrv-classroom-explorations-root">
    <div class="hrv-hub-outage" role="status" data-hrv-outage-notice>
      <div class="hrv-outage-copy">
        <h1>Oops! Something went wrong.</h1>
        <p>Classroom Explorations is temporarily unavailable.</p>
        <p>Please come back and check again later.</p>
      </div>
    </div>
  </section>
  <script id="bootstrap" data-publication="https://assets.example/publication.json"></script>
</body></html>`, {
  url: "https://rmhughes.edublogs.org/hub/",
  runScripts: "outside-only"
});
const productionBootstrapScript = productionBootstrapDom.window.document.getElementById("bootstrap");
Object.defineProperty(productionBootstrapDom.window.document, "currentScript", {
  configurable: true,
  value: productionBootstrapScript
});
productionBootstrapDom.window.fetch = () => new Promise(() => {});
productionBootstrapDom.window.eval(bootstrapText);

const productionLoadingCopy = productionBootstrapDom.window.document.querySelector(
  "[data-hrv-loading-notice] .hrv-outage-copy"
);
assert.ok(productionLoadingCopy);
assert.match(productionLoadingCopy.querySelector("h1")?.textContent || "", /Opening Classroom Explorations/);
assert.doesNotMatch(productionLoadingCopy.textContent, /Oops|temporarily unavailable|come back/i);

console.log("[hub lifecycle] loading, empty, no-results, media fallback, and dialog fallback states passed");
