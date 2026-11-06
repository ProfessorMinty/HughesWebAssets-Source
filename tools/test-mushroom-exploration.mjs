import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import assert from "node:assert/strict";
import { validateMushroomSource, editMushroomBlock, MUSHROOM_EDITOR_CONTRACT, mushroomSourceJsonSchema } from "../apps/mushroom-exploration/src/contract.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const source = JSON.parse(await readFile(root + "/apps/mushroom-exploration/source/mushrooms.source.json", "utf8"));
const fresh = function () { return structuredClone(source); };
test("the scaffold stays a draft and has distinct new-year identity and no invented journal entries", function () {
  validateMushroomSource(source, { allowDraft: true });
  assert.throws(function () { validateMushroomSource(source); }, /cannot be published/);
  assert.equal(source.data.blocks.at(-1).entries.length, 0);
  assert.equal(source.data.blocks.at(-1).currentStage, null);
  assert.notEqual(source.page.routeRef, "hrv-route:mushrooms");
});
test("editable source preserves identities, immutable layout and the untouched before document", function () {
  const before = JSON.stringify(source);
  const next = editMushroomBlock(source, "mushroom-block:welcome", { title: "A reviewed heading" });
  assert.equal(next.data.blocks[0].title, "A reviewed heading");
  assert.equal(JSON.stringify(source), before);
  for (const patch of [{ id: "mushroom-block:renamed" }, { type: "journal" }, { html: "<script></script>" }]) {
    assert.throws(function () { editMushroomBlock(source, "mushroom-block:welcome", patch); }, /protected or unsupported/);
  }
  const wrongLayout = fresh(); wrongLayout.data.meta.layout = "safe-wide";
  assert.throws(function () { validateMushroomSource(wrongLayout, { allowDraft: true }); }, /protected layout/);
});
test("future editor changes cannot silently rename nested observation points or escape diagram bounds", function () {
  const changed = structuredClone(source.data.blocks.find(b=>b.type==="anatomy").hotspots);
  changed[0].id = "mushroom-point:renamed";
  assert.throws(function () { editMushroomBlock(source, "mushroom-block:anatomy", { hotspots: changed }); }, /nested IDs/);
  changed[0].id = source.data.blocks.find(b=>b.type==="anatomy").hotspots[0].id; changed[0].x = 101;
  assert.throws(function () { editMushroomBlock(source, "mushroom-block:anatomy", { hotspots: changed }); }, /outside the diagram/);
});
test("merely changing the research flag cannot publish incomplete diagrams and facts", function () {
  const changed = fresh(); changed.data.meta.state = "review-ready"; changed.data.meta.researchStatus = "reviewed";
  changed.data.blocks.find(b=>b.type==="anatomy").hotspots[0].body="";
  assert.throws(function () { validateMushroomSource(changed); }, /required|missing/);
});
test("editing reviewed content invalidates its earlier research/publication state", function () {
  const reviewed = fresh();
  reviewed.data.meta.state = "review-ready"; reviewed.data.meta.researchStatus = "reviewed";
  validateMushroomSource(reviewed);
  const edited = editMushroomBlock(reviewed, "mushroom-block:anatomy", { title: "A changed heading" });
  assert.equal(edited.data.meta.researchStatus, "pending");
  assert.throws(function () { validateMushroomSource(edited); }, /cannot be published/);
});
test("unknown schemas, block kinds, duplicate IDs, unresolved citations and executable URLs fail closed", function () {
  const mutations = [
    function (s) { s.schemaVersion = "2.0"; },
    function (s) { s.data.blocks[1].type = "arbitrary-html"; },
    function (s) { s.data.blocks[1].id = s.data.blocks[0].id; },
    function (s) { s.data.blocks.find(b=>b.type==="anatomy").hotspots[0].sourceRefs = ["mushroom-source:missing"]; },
    function (s) { s.data.blocks[0].media = { kind: "image", url: "javascript:alert(1)", alt: "test", caption: "" }; }
  ];
  mutations.forEach(function (mutate) { const s = fresh(); mutate(s); assert.throws(function () { validateMushroomSource(s, { allowDraft: true }); }); });
});
test("the editor-readable JSON and schema match their owning contract exactly", async function () {
  const control = JSON.parse(await readFile(root + "/apps/mushroom-exploration/source/mushrooms.control.json", "utf8"));
  const schema = JSON.parse(await readFile(root + "/schemas/mushroom-exploration.source.schema.json", "utf8"));
  assert.deepEqual(control, MUSHROOM_EDITOR_CONTRACT);
  assert.deepEqual(schema, mushroomSourceJsonSchema());
});

test("answer identities remain stable when a future editor changes a question", function () {
  const questions=structuredClone(source.data.blocks.find(b=>b.type==="facts").questions);
  questions[0].choices[0].id="mushroom-answer:renamed";
  assert.throws(()=>editMushroomBlock(source,"mushroom-block:discoveries",{questions}),/nested answer IDs/);
});
