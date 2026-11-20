import test from "node:test";
import assert from "node:assert/strict";
import { readFile, writeFile, mkdtemp, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { webcrypto } from "node:crypto";
import { JSDOM } from "jsdom";
import { canonicalJson, sha256Text } from "./lib/classroom-explorations-hub-contract.mjs";
import { projectArchiveRuntime } from "./lib/classroom-explorations-archive-contract.mjs";
import { freezeYearArchive, validateFrozenYearArchive, projectYearArchiveRuntime, validateYearArchiveRuntime } from "./lib/classroom-year-archive-v2.mjs";
import { buildYearArchivePackage, writeYearArchivePackage, verifyYearArchivePackage } from "./lib/classroom-year-archive-package.mjs";
import { mountYearArchive, validateYearArchivePreview } from "../apps/classroom-explorations-archive-v2/src/runtime.js";

const read = async path => readFile(new URL("../" + path, import.meta.url), "utf8");
const json = async path => JSON.parse(await read(path));
const hub = await json("apps/classroom-explorations-hub/source/hub.source.json");
const registry = await json("registry/hrv-routes.source.json");
const legacyArchive = await json("apps/classroom-explorations-archive/source/archive-2025-2026.source.json");
const revision = "692f4fa0ba477624c298e0e01aff0321fdb189c4";
const input = () => ({ hubSource: structuredClone(hub), registry: structuredClone(registry), schoolYear: "2026-2027", sourceRevision: revision });
const digest = bytes => webcrypto.subtle.digest("SHA-256", bytes);
function resign(value) { const { snapshotId, ...payload } = value; return { ...payload, snapshotId: "sha256:" + sha256Text(canonicalJson(payload)) }; }

test("freezes the complete current-year catalog, including the Current Exploration, without modifying the 2025–2026 archive", async () => {
  const inputs = input(), original = structuredClone(inputs);
  const frozen = freezeYearArchive(inputs), runtime = validateYearArchiveRuntime(projectYearArchiveRuntime(frozen));
  assert.deepEqual(inputs, original);
  assert.deepEqual(frozen.membership.explorationIds, hub.data.explorations.filter(item => item.schoolYear === "2026-2027").map(item => item.id));
  assert.ok(frozen.membership.explorationIds.includes(hub.data.composition.currentExplorationId));
  assert.deepEqual(runtime.stats, { explorations: 2, stories: 0, total: 2 });
  assert.equal(runtime.publicationAvailable, false);
  assert.equal(runtime.page.archiveHref, null);
  assert.equal(frozen.host.wordpressPageId, null);
  const old = projectArchiveRuntime(legacyArchive, hub, registry);
  assert.equal(old.page.id, "hrv-page:classroom-explorations-archive-2025-2026");
  assert.deepEqual(old.stats, { explorations: 3, twwl: 5, total: 8 });
  assert.throws(() => freezeYearArchive({ ...input(), schoolYear: "2025-2026" }), { code: "YEAR_ARCHIVE_LEGACY_PROTECTED" });
});

test("supports future year counts and optional story images without borrowing legacy page identity", () => {
  const inputs = input();
  inputs.hubSource.data.schoolYears.unshift({ id: "2027-2028", label: "2027–2028" });
  const first = { ...structuredClone(inputs.hubSource.data.explorations[0]), id: "future-garden", schoolYear: "2027-2028", routeRef: "hrv-route:future-garden" };
  inputs.hubSource.data.explorations.push(first);
  inputs.registry.routes.push({ ref: first.routeRef, wordpressPageId: 9301, wordpressParentPageId: 17, slug: "future-garden", path: "/hub/future-garden/", kind: "exploration", state: "published" });
  for (let index = 0; index < 4; index++) {
    const id = "future-story-" + index;
    inputs.hubSource.data.twwl.push({ id, schoolYear: "2027-2028", title: "Learning " + index, summary: "A classroom observation.", routeRef: "hrv-route:" + id, tags: ["Observation"] });
    inputs.registry.routes.push({ ref: "hrv-route:" + id, wordpressPageId: 9400 + index, wordpressParentPageId: 17, slug: id, path: "/hub/" + id + "/", kind: "twwl", state: "published" });
  }
  Object.assign(inputs.hubSource.data.composition, { currentSchoolYear: "2027-2028", currentExplorationId: first.id, featuredMediaId: inputs.hubSource.data.media.find(item => item.association.kind === "hub").id, pastExplorationIds: [], pastTwwlIds: [] });
  inputs.schoolYear = "2027-2028";
  const runtime = projectYearArchiveRuntime(freezeYearArchive(inputs));
  assert.deepEqual(validateYearArchiveRuntime(runtime).stats, { explorations: 1, stories: 4, total: 5 });
  assert.equal(runtime.page.id, "hrv-page:classroom-explorations-archive-2027-2028");
  assert.ok(runtime.collections.stories.every(item => item.image === null));
});

test("rejects retired, ambiguous, wrong-parent, cross-site, and unbound source inputs instead of dropping records", () => {
  const retired = input(), id = retired.hubSource.data.explorations.find(item => item.schoolYear === "2026-2027").routeRef;
  retired.registry.routes.find(item => item.ref === id).state = "retired";
  assert.throws(() => freezeYearArchive(retired));
  const parent = input(); parent.registry.routes.find(item => item.ref === id).wordpressParentPageId = 2627;
  assert.throws(() => freezeYearArchive(parent), { code: "HUB_ROUTE_PAGE_ID_MISMATCH" });
  const ambiguous = input(); ambiguous.registry.routes.push({ ...structuredClone(ambiguous.registry.routes.find(item => item.ref === id)), ref: "hrv-route:duplicate" });
  assert.throws(() => freezeYearArchive(ambiguous));
  const site = input(); site.registry.site.origin = "https://other.example";
  assert.throws(() => freezeYearArchive(site), { code: "YEAR_ARCHIVE_SITE_MISMATCH" });
  assert.throws(() => freezeYearArchive({ ...input(), sourceRevision: "main" }), { code: "YEAR_ARCHIVE_SOURCE_REVISION" });
  assert.throws(() => freezeYearArchive({ ...input(), schoolYear: "2028-2029" }), { code: "YEAR_ARCHIVE_YEAR_UNKNOWN" });
});

test("detects changed content, membership, or source bytes even when a tampered record is rehashed", () => {
  const inputs = input(), frozen = freezeYearArchive(inputs);
  const changed = structuredClone(frozen); changed.collections.explorations[0].title = "Changed later";
  assert.throws(() => validateFrozenYearArchive(changed), { code: "YEAR_ARCHIVE_SOURCE_CHANGED" });
  assert.throws(() => validateFrozenYearArchive(resign(changed), inputs), { code: "YEAR_ARCHIVE_INPUTS_CHANGED" });
  const dropped = structuredClone(frozen); dropped.collections.explorations.pop();
  assert.throws(() => validateFrozenYearArchive(resign(dropped)), { code: "YEAR_ARCHIVE_MEMBERSHIP_CHANGED" });
  const runtime = projectYearArchiveRuntime(frozen); runtime.stats.total = 999;
  assert.throws(() => validateYearArchiveRuntime(resign(runtime)), { code: "YEAR_ARCHIVE_RUNTIME_COUNTS" });
});

test("builds reproducible, independently verifiable, immutable artifacts with no false native doorway", async () => {
  const directory = await mkdtemp(join(tmpdir(), "hrv-year-archive-test-"));
  try {
    const first = await buildYearArchivePackage(input()), second = await buildYearArchivePackage(input());
    assert.deepEqual(first.index, second.index); assert.deepEqual([...first.files], [...second.files]);
    assert.equal(first.installation.target.wordpressPageId, null);
    assert.equal(first.installation.nativeDoorway, null);
    assert.deepEqual(first.installation.hubPublicationCommands, []);
    const path = await writeYearArchivePackage(first, directory);
    assert.equal(await writeYearArchivePackage(second, directory), path);
    assert.equal((await verifyYearArchivePackage(path)).candidateId, first.index.candidateId);
    const altered = first.files.get("preview.html") + "tampered";
    await writeFile(join(path, "preview.html"), altered);
    await assert.rejects(verifyYearArchivePackage(path), { code: "YEAR_ARCHIVE_ARTIFACT_CHANGED" });
    await assert.rejects(writeYearArchivePackage(first, directory), { code: "YEAR_ARCHIVE_IMMUTABLE_CONFLICT" });
    assert.equal(await readFile(join(path, "preview.html"), "utf8"), altered);
  } finally { await rm(directory, { recursive: true, force: true }); }
});

test("renders content as text, verifies the digest, and supports searching and accessible type filtering", async () => {
  const inputs = input(); inputs.hubSource.data.explorations[0].title = '<img src=x onerror="attack()"> Garden';
  const candidate = await buildYearArchivePackage(inputs);
  assert.ok(candidate.files.get("preview.html").includes("&lt;img src=x onerror=&quot;attack()&quot;&gt; Garden"));
  assert.ok(!candidate.files.get("preview.html").includes('<img src=x onerror="attack()">'));
  const dom = new JSDOM('<main id="root"></main>', { url: "https://preview.example" });
  try {
    const root = dom.window.document.getElementById("root");
    const controller = await mountYearArchive(root, candidate.runtime, { digest });
    assert.equal(root.dataset.hrvPage, candidate.runtime.page.id);
    assert.equal(root.querySelectorAll("article").length, 2);
    assert.equal(root.querySelector('[src="x"]'), null);
    const search = root.querySelector('input[type="search"]'); search.value = "<img"; search.dispatchEvent(new dom.window.Event("input"));
    assert.equal(root.querySelector('[role="status"]').textContent, "1 of 2 memories");
    search.value = ""; search.dispatchEvent(new dom.window.Event("input"));
    const stories = [...root.querySelectorAll("button")].find(button => button.textContent === "Learning stories"); stories.click();
    assert.equal(stories.getAttribute("aria-pressed"), "true");
    assert.equal(root.querySelector('[role="status"]').textContent, "0 of 2 memories");
    assert.equal(root.querySelector(".year-archive-empty").hidden, false);
    const invalid = structuredClone(candidate.runtime); invalid.page.title = "changed";
    await assert.rejects(validateYearArchivePreview(invalid, digest));
    controller.destroy(); assert.equal(root.children.length, 0);
  } finally { dom.window.close(); }
});

test("defaults to full effects and consumes only the Source-owned shared Reduced Effects state", async () => {
  const css = await read("apps/classroom-explorations-archive-v2/src/archive.css"), script = await read("apps/classroom-explorations-archive-v2/src/runtime.js");
  assert.ok(!css.includes("prefers-reduced-motion"));
  assert.ok(!script.includes("matchMedia") && !script.includes("localStorage") && !script.includes("sessionStorage"));
  const dom = new JSDOM(`<html><head><style>${css}</style></head><body><main id="root"></main></body></html>`);
  try {
    const runtime = projectYearArchiveRuntime(freezeYearArchive(input()));
    await mountYearArchive(dom.window.document.getElementById("root"), runtime, { digest });
    const card = dom.window.document.querySelector("article");
    assert.notEqual(dom.window.getComputedStyle(card).animation, "none");
    dom.window.document.documentElement.dataset.hrvEffects = "reduced";
    dom.window.dispatchEvent(new dom.window.CustomEvent("hrv:effectschange", { detail: { version: 1, mode: "reduced" } }));
    assert.equal(dom.window.getComputedStyle(card).animation, "none");
    dom.window.document.documentElement.dataset.hrvEffects = "full";
    assert.notEqual(dom.window.getComputedStyle(card).animation, "none");
    assert.equal(dom.window.document.querySelector('[aria-label="Effects"]'), null);
  } finally { dom.window.close(); }
});
