import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import test from "node:test";
import { sporeLaunchState } from "../apps/mushroom-exploration/src/labs.js";
import { MUSHROOM_VIDEOS } from "../apps/mushroom-exploration/src/video-assets.js";
import { createHash } from "node:crypto";
import { MUSHROOM_PHOTOS } from "../apps/mushroom-exploration/src/photo-catalog.js";
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

test("photographs resolve only registered assets and preserve editable captions", function () {
  const family=source.data.blocks.find(b=>b.type==="family");
  const cards=structuredClone(family.cards);cards[0].media.caption="Look at the blue caps.";
  const changed=editMushroomBlock(source,family.id,{cards});
  assert.equal(changed.data.blocks.find(b=>b.type==="family").cards[0].media.caption,"Look at the blue caps.");
  for(const url of ["asset:mushroom-photo:missing","data:image/svg+xml,<svg/>","file:///private.jpg","../private.jpg"]){
    cards[0].media.url=url;
    assert.throws(()=>editMushroomBlock(source,family.id,{cards}),/unknown bundled|HTTPS|not a URL/);
  }
});
test("photo provenance and image bytes match the generated catalog", async function () {
  const catalog=JSON.parse(await readFile(root+"/apps/mushroom-exploration/source/mushrooms.assets.json","utf8"));
  assert.deepEqual(catalog.photos,MUSHROOM_PHOTOS);
  assert.equal(new Set(MUSHROOM_PHOTOS.map(p=>p.id)).size,MUSHROOM_PHOTOS.length);
  for(const photo of MUSHROOM_PHOTOS){
    assert.match(photo.id,/^mushroom-photo:[a-z0-9-]+$/);assert.match(photo.file,/^\.\/assets\/[a-z0-9-]+\.webp$/);
    assert.ok(photo.creator&&photo.license&&photo.changes);assert.match(photo.page,/^https:\/\//);assert.match(photo.licenseUrl,/^https:\/\//);
    const bytes=await readFile(root+"/apps/mushroom-exploration/src/"+photo.file);
    assert.equal(bytes.toString("ascii",8,12),"WEBP");assert.equal(createHash("sha256").update(bytes).digest("hex"),photo.sha256);
  }
});

test("the launch model joins the droplets before the spore leaves the stalk", function () {
  assert.equal(sporeLaunchState(0).phase,0);
  const grown=sporeLaunchState(1.4);assert.equal(grown.x,0);assert.ok(grown.dropRadius>sporeLaunchState(0).dropRadius);
  const merged=sporeLaunchState(1.7);assert.equal(merged.phase,1);assert.equal(merged.x,0);assert.ok(merged.mergedOpacity>0);
  const launched=sporeLaunchState(3.8);assert.equal(launched.phase,2);assert.ok(launched.x<0);assert.equal(launched.dropOpacity,0);
  assert.deepEqual(sporeLaunchState(-2),sporeLaunchState(0));assert.deepEqual(sporeLaunchState(100),launched);
});
test("only the credited registered research recording can be selected", function () {
  const changed=fresh(),block=changed.data.blocks.find(b=>b.type==="lifecycle");
  assert.equal(block.video.url,"asset:mushroom-video:armillaria-release");
  for(const url of ["https://example.invalid/unreviewed.mp4","asset:mushroom-video:unknown","javascript:alert(1)"]){block.video.url=url;assert.throws(()=>validateMushroomSource(changed,{allowDraft:true}),/unknown research video/);}
});
test("the recording, poster and description match the credited catalog", async function () {
  const catalog=JSON.parse(await readFile(root+"/apps/mushroom-exploration/source/mushrooms.assets.json","utf8"));assert.deepEqual(catalog.videos,MUSHROOM_VIDEOS);
  const microscopic=MUSHROOM_VIDEOS.find(v=>v.id==='mushroom-video:armillaria-release');assert.equal(microscopic.captureFps,50000);assert.equal(microscopic.playbackFps,20);
  const cloud=MUSHROOM_VIDEOS.find(v=>v.id==='mushroom-video:puffball-cloud');assert.equal(cloud.captureFps,null);assert.equal(cloud.slowdownFactor,5);assert.equal(cloud.license,'CC BY 4.0');
  for(const video of MUSHROOM_VIDEOS){assert.equal(video.silent,true);assert.match(video.page,/^https:\/\//);
    for(const file of video.files){const bytes=await readFile(root+"/apps/mushroom-exploration/src/"+file.path);assert.equal(bytes.byteLength,file.bytes);assert.equal(createHash("sha256").update(bytes).digest("hex"),file.sha256);if(file.mime==="video/mp4")assert.equal(bytes.toString("ascii",4,8),"ftyp");}
  }
});


test('hyphal growth stays connected: branches and cross-links wait for their parents', async function () {
  const {hyphalNetwork}=await import('../apps/mushroom-exploration/src/art.js');
  const network=hyphalNetwork(15,239,970,245,6,[{x:346.48,y:229.98},{x:680.64,y:229.64}]),byId=new Map(network.map(p=>[p.id,p]));
  assert.ok(network.length>100);
  for(const segment of network)for(const parentId of segment.parents){
    const parent=byId.get(parentId);assert.ok(parent,'missing connected parent');
    assert.ok(segment.start>=parent.start+parent.duration,'a branch started before its parent reached the junction');
    assert.ok(Math.hypot(segment.from.x-parent.to.x,segment.from.y-parent.to.y)<.001||Math.hypot(segment.to.x-parent.to.x,segment.to.y-parent.to.y)<.001,'a dependency must physically meet its child strand');
  }
  assert.ok(network.some(p=>p.parents.length>1),'network needs cross-connections');
  assert.ok(network.some(p=>p.id==='join-1'),'the two stem networks must meet');
  for(const strand of network.filter(p=>p.parents.length===0)){
    assert.ok([[346.48,229.98],[680.64,229.64]].some(([x,y])=>Math.hypot(strand.from.x-x,strand.from.y-y)<.001),'a strand appeared away from both stems');
  }
});

test('both spore recordings are registered and reject arbitrary video URLs', function () {
  const block=source.data.blocks.find(b=>b.type==='lifecycle');
  assert.equal(block.plumeVideo.url,'asset:mushroom-video:puffball-cloud');
  const changed=fresh();changed.data.blocks.find(b=>b.type==='lifecycle').plumeVideo.url='https://example.invalid/cloud.mp4';
  assert.throws(()=>validateMushroomSource(changed,{allowDraft:true}),/unknown research video/);
});

test('the rendered cutaway starts its threads at both visible stem bases', async function () {
  const {cutawayArtwork,anatomyArtwork,lifecycleArtwork}=await import('../apps/mushroom-exploration/src/art.js');
  function anchorStarts(svg){return [...svg.matchAll(/<path\b[^>]*>/g)].filter(m=>/data-growth-anchor=/.test(m[0])).map(m=>{
    const d=m[0].match(/\bd='([^']+)'/)[1];return d.match(/^M([\d.-]+) ([\d.-]+)/).slice(1).map(Number);
  });}
  const cutaway=anchorStarts(cutawayArtwork('test-cutaway'));
  for(const [x,y] of [[346.48,229.98],[680.64,229.64]])assert.ok(cutaway.some(p=>Math.hypot(p[0]-x,p[1]-y)<.02),'a visible mushroom has no thread attached to its base');
  assert.ok(anchorStarts(anatomyArtwork('test-anatomy')).some(p=>Math.hypot(p[0]-438,p[1]-463)<.02),'anatomy stem is detached');
  const life=lifecycleArtwork('test-life');
  assert.match(life,/class='life-stem-connection'/,'life-cycle fruiting body needs a connection to its existing mycelium');
});

test('wind transport cannot display the launch recording and each spore activity owns one view', async function () {
  const {sporeActivityState}=await import('../apps/mushroom-exploration/src/labs.js');
  for(const view of ['launch','wind','puffball','cycle']){
    const state=sporeActivityState(view);
    assert.equal(['launch','wind','puffball','cycle'].filter(key=>state[key]).length,1);
    assert.equal(state.launchFilm,view==='launch');
  }
  assert.equal(sporeActivityState('wind').comparison,true);
  assert.equal(sporeActivityState('wind').launchFilm,false);
  assert.throws(()=>sporeActivityState('unknown'),/Unknown spore activity/);
});

test('activity context is editable without renaming a view or admitting arbitrary controls', function () {
  const block=source.data.blocks.find(b=>b.type==='lifecycle'),activities=structuredClone(block.activities);
  const wind=activities.find(a=>a.view==='wind');wind.title='Where will the breeze take it?';wind.learning.observe='What changes when air stops moving?';
  const changed=editMushroomBlock(source,block.id,{activities});
  assert.equal(changed.data.blocks.find(b=>b.id===block.id).activities.find(a=>a.view==='wind').title,wind.title);
  assert.equal(changed.data.meta.researchStatus,'pending');
  wind.view='launch';assert.throws(()=>editMushroomBlock(source,block.id,{activities}),/distinct spore activities/);
  wind.view='wind';wind.learning.html='<script>bad()</script>';assert.throws(()=>editMushroomBlock(source,block.id,{activities}),/unsupported field/);
});

test('science word definitions are validated, cited, editable, and keep their identities', function () {
  const block=source.data.blocks.find(b=>b.type==='anatomy'),learning=structuredClone(block.learning);
  learning.words[0].body='A network of branching fungal threads.';
  assert.equal(editMushroomBlock(source,block.id,{learning}).data.blocks.find(b=>b.id===block.id).learning.words[0].body,learning.words[0].body);
  learning.words[0].id='mushroom-word:renamed';assert.throws(()=>editMushroomBlock(source,block.id,{learning}),/science word IDs/);
  learning.words[0].id=block.learning.words[0].id;learning.words[0].sourceRefs=['mushroom-source:missing'];assert.throws(()=>editMushroomBlock(source,block.id,{learning}),/unresolved research citation/);
});

test('new content retains all old nested IDs and leaves classroom publication reserved', function () {
  const family=source.data.blocks.find(b=>b.type==='family'),facts=source.data.blocks.find(b=>b.type==='facts');
  assert.ok(family.cards.some(card=>card.id==='mushroom-family:moulds'&&card.title==='Fuzzy molds'));
  assert.ok(facts.questions.flatMap(q=>q.choices).some(choice=>choice.id==='mushroom-answer:colour'));
  const journal=source.data.blocks.find(b=>b.type==='journal');
  assert.equal(journal.currentStage,null);assert.deepEqual(journal.entries,[]);
  assert.equal(MUSHROOM_EDITOR_CONTRACT.editorImplementation,'not-built');
  assert.equal(MUSHROOM_EDITOR_CONTRACT.publicationAvailable,false);
});

test('a validated source cannot omit a block required by the two-station renderer', function () {
  for(const type of ['family','roles','lab']){
    const changed=fresh();changed.data.blocks=changed.data.blocks.filter(b=>b.type!==type);
    assert.throws(()=>validateMushroomSource(changed,{allowDraft:true}),/core exhibit/);
  }
});
