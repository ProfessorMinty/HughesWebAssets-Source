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

function teachingHarness(reduced=false){
  let id=0;const pending=new Map(),listeners=new Set();
  const preference={matches:reduced,addEventListener(_type,fn){listeners.add(fn);},removeEventListener(_type,fn){listeners.delete(fn);},setMatches(value){this.matches=value;listeners.forEach(fn=>fn({matches:value}));}};
  return {pending,listeners,preference,request(fn){pending.set(++id,fn);return id;},cancel(id){pending.delete(id);},tick(time){const batch=[...pending.values()];pending.clear();batch.forEach(fn=>fn(time));}};
}
test('finite teaching clocks pause, resume without a time jump, end, and replay without overlapping runs',async function(){
  const {createTeachingTimeline}=await import('../apps/mushroom-exploration/src/process.js'),h=teachingHarness(),rendered=[];
  const clock=createTeachingTimeline({duration:1,checkpoints:[0,.5,1],request:h.request,cancel:h.cancel,preference:h.preference,onRender:t=>rendered.push(t)});
  clock.play();h.tick(0);h.tick(50);h.tick(100);const before=clock.snapshot().time,stale=[...h.pending.values()][0];clock.pause();assert.equal(h.pending.size,0);h.tick(5000);assert.equal(clock.snapshot().time,before);
  clock.play();h.tick(9000);assert.equal(clock.snapshot().time,before);h.tick(9050);assert.ok(clock.snapshot().time>before);
  clock.restart();assert.equal(h.pending.size,1);const reset=clock.snapshot().time;stale(10000);assert.equal(clock.snapshot().time,reset);
  for(let i=0;i<30;i++)h.tick(11000+i*50);assert.equal(clock.snapshot().state,'complete');assert.equal(clock.snapshot().time,1);assert.equal(h.pending.size,0);h.tick(50000);assert.equal(clock.snapshot().time,1);
  clock.restart();assert.equal(clock.snapshot().time,0);assert.equal(h.pending.size,1);clock.destroy();assert.equal(h.pending.size,0);assert.equal(h.listeners.size,0);assert.ok(rendered.length>20);
});
test('less motion and manual stages schedule no animation and changing preference stops a current run',async function(){
  const {createTeachingTimeline}=await import('../apps/mushroom-exploration/src/process.js'),h=teachingHarness(true),clock=createTeachingTimeline({duration:2,checkpoints:[0,1,2],request:h.request,cancel:h.cancel,preference:h.preference});
  clock.play();assert.equal(clock.snapshot().time,1);assert.equal(clock.snapshot().state,'paused');assert.equal(h.pending.size,0);clock.step();assert.equal(clock.snapshot().state,'complete');assert.equal(h.pending.size,0);
  clock.reset();h.preference.setMatches(false);clock.play();h.tick(0);h.tick(50);const time=clock.snapshot().time;h.preference.setMatches(true);assert.equal(clock.snapshot().state,'paused');assert.equal(h.pending.size,0);h.tick(10000);assert.equal(clock.snapshot().time,time);h.preference.setMatches(false);assert.equal(clock.snapshot().state,'paused');clock.destroy();assert.equal(h.listeners.size,0);
});
test('rendered growth samples remain attached and wait for parents at every manual checkpoint',async function(){
  const {hyphalNetwork}=await import('../apps/mushroom-exploration/src/art.js'),{connectedGrowthProgress}=await import('../apps/mushroom-exploration/src/process.js');
  const paths=hyphalNetwork(15,239,970,245,6,[{x:346.48,y:229.98},{x:680.64,y:229.64}]),byId=new Map(paths.map(p=>[p.id,p])),end=Math.max(...paths.map(p=>p.start+p.duration));
  for(const time of [0,end/3,end*2/3,end])for(const path of paths){const visible=connectedGrowthProgress(time,path.start,path.duration);if(visible>0)for(const parent of path.parents){const p=byId.get(parent);assert.equal(connectedGrowthProgress(time,p.start,p.duration),1,'a visible child requires a finished connected parent');}}
  assert.ok(paths.every(p=>connectedGrowthProgress(end,p.start,p.duration)===1));
});
test('wind responds in both directions, settles in still air and stops drifting after settling',async function(){
  const {advanceWindParticle}=await import('../apps/mushroom-exploration/src/process.js');const p={x:300,y:300,speed:5};
  assert.ok(advanceWindParticle(p,1,-70).x<p.x);assert.ok(advanceWindParticle(p,1,70).x>p.x);assert.equal(advanceWindParticle(p,2,0).x,p.x);
  const settled=advanceWindParticle(p,20,0);assert.equal(settled.y,470);assert.deepEqual(advanceWindParticle(settled,10,90),settled);
  const hiddenUnderCap={...p,y:225};assert.equal(advanceWindParticle(hiddenUnderCap,.5,70).x,p.x);assert.ok(advanceWindParticle(hiddenUnderCap,3,70).x>p.x);
});
test('dough expands with visibly larger gas pockets and retains a fixed starting outline',async function(){
  const {doughRiseState}=await import('../apps/mushroom-exploration/src/process.js'),{roleArtwork}=await import('../apps/mushroom-exploration/src/art.js');
  const start=doughRiseState(0),middle=doughRiseState(.5),end=doughRiseState(1);assert.equal(start.scale,.62);assert.ok(middle.scale>start.scale&&middle.scale<end.scale);assert.ok(middle.pocketScale>start.pocketScale);assert.equal(end.scale,1);assert.deepEqual(doughRiseState(5),end);
  assert.match(roleArtwork('bread','dough-test'),/class='dough-start-outline'/);assert.match(roleArtwork('bread','dough-test'),/data-rx=/);
});
test('process explanations can change without changing model, phase, or diagram-label identity',function(){
  const original=source.data.blocks.find(b=>b.type==='cutaway'),growth=structuredClone(original.growth);growth.steps[1].body='New growth branches from existing threads.';
  assert.equal(editMushroomBlock(source,original.id,{growth}).data.blocks.find(b=>b.id===original.id).growth.steps[1].body,growth.steps[1].body);
  growth.mode='launch';assert.throws(()=>editMushroomBlock(source,original.id,{growth}),/process identities/);growth.mode='growth';growth.steps[0].id='mushroom-phase:renamed';assert.throws(()=>editMushroomBlock(source,original.id,{growth}),/process identities/);
  growth.steps[0].id=original.growth.steps[0].id;growth.controls.html='<b>bad</b>';assert.throws(()=>editMushroomBlock(source,original.id,{growth}),/unsupported field/);
});
test('life-cycle stage ordering is protected and early illustrations use closer crops',async function(){
  const block=source.data.blocks.find(b=>b.type==='lifecycle'),steps=structuredClone(block.steps);[steps[0],steps[1]]=[steps[1],steps[0]];assert.throws(()=>editMushroomBlock(source,block.id,{steps}),/life-cycle stage order/);
  const {lifecycleStageArtwork}=await import('../apps/mushroom-exploration/src/art.js');const boxes=new Set([0,1,2,3].map((i)=>lifecycleStageArtwork(i,'preview-'+i).match(/viewBox='([^']+)'/)[1]));assert.equal(boxes.size,3);
});

test('native video states produce consistent play/pause/replay and a recoverable load-error message',async function(){
  const {recordingPlaybackState}=await import('../apps/mushroom-exploration/src/labs.js'),copy=source.data.blocks.find(b=>b.type==='lifecycle').recording;
  assert.equal(recordingPlaybackState({paused:false,ended:false,failed:false},copy).button,copy.pause);
  assert.equal(recordingPlaybackState({paused:true,ended:false,failed:false},copy).button,copy.play);
  assert.equal(recordingPlaybackState({paused:true,ended:true,failed:false},copy).button,copy.replay);
  const error=recordingPlaybackState({paused:true,ended:false,failed:true},copy);assert.equal(error.status,copy.error);assert.equal(error.retry,true);assert.equal(error.disabled,true);
});

test('a user can request less motion even when preference storage cannot be written, and listeners are released',async function(t){
  const previous=globalThis.window,nativeListeners=new Set(),events=new Map();
  t.after(()=>{if(previous===undefined)delete globalThis.window;else globalThis.window=previous;});
  globalThis.window={matchMedia(){return {matches:true,addEventListener(_type,fn){nativeListeners.add(fn);},removeEventListener(_type,fn){nativeListeners.delete(fn);}};},localStorage:{getItem(){return '0';},setItem(){throw new Error('Storage unavailable');}},addEventListener(type,fn){if(!events.has(type))events.set(type,new Set());events.get(type).add(fn);},removeEventListener(type,fn){events.get(type)?.delete(fn);},dispatchEvent(event){events.get(event.type)?.forEach(fn=>fn(event));}};
  const {browserMotionPreference,createTeachingTimeline}=await import('../apps/mushroom-exploration/src/process.js'),pref=browserMotionPreference(),observed=[];const listen=event=>observed.push(event.matches);pref.addEventListener('change',listen);assert.equal(pref.matches,false);pref.setMatches(true);assert.equal(pref.matches,true);assert.deepEqual(observed,[true]);
  const h=teachingHarness(),clock=createTeachingTimeline({duration:1,preference:pref,request:h.request,cancel:h.cancel});clock.play();assert.equal(h.pending.size,0);clock.destroy();pref.removeEventListener('change',listen);assert.equal(nativeListeners.size,0);assert.ok([...events.values()].every(set=>set.size===0));
});

function musicHarness(overrides={}){
  let frameId=0;const frames=new Map(),contexts=[],changes=[],ticks=[];
  const parameter=()=>({value:0,events:[],setValueAtTime(...a){this.events.push(['set',...a]);},linearRampToValueAtTime(...a){this.events.push(['linear',...a]);},exponentialRampToValueAtTime(...a){this.events.push(['exp',...a]);},setTargetAtTime(...a){this.events.push(['target',...a]);}});
  function audioFactory(){const context={currentTime:0,state:'suspended',oscillators:[],gains:[],destination:{},async resume(){this.state='running';},async close(){this.state='closed';},createGain(){const gain={gain:parameter(),connect(){},disconnect(){}};this.gains.push(gain);return gain;},createOscillator(){const o={frequency:parameter(),connect(){},disconnect(){this.disconnected=true;},start(t){this.startTime=t;},stop(t){this.stopTime=t??this.stopTime;this.stopped=true;}};this.oscillators.push(o);return o;}};contexts.push(context);return context;}
  return {contexts,frames,changes,ticks,options:{audioFactory,request(fn){const id=++frameId;frames.set(id,fn);return id;},cancel(id){frames.delete(id);},onChange:s=>changes.push(s),onTick:s=>ticks.push(s),...overrides},advance(t){contexts.at(-1).currentTime=t;const pending=[...frames.values()];frames.clear();pending.forEach(fn=>fn());}};
}
test('music graph samples and both synthesized timbres use the same values, note rule and clock',async()=>{
  const {mushroomExamplePattern,mushroomNoteEvents,createMushroomAudio}=await import('../apps/mushroom-exploration/src/sound.js');
  const values=mushroomExamplePattern(),events=mushroomNoteEvents(values),h=musicHarness(),engine=createMushroomAudio(h.options);
  assert.equal(events.length,16);assert.ok(values.every(v=>v>=0&&v<=1));assert.equal(events[15].time,7.5);
  assert.deepEqual(mushroomNoteEvents([0,1]).map(e=>e.note),['C4','E5']);
  await engine.play();const flute=h.contexts[0];h.advance(1.1);assert.equal(engine.snapshot().index,2);assert.equal(h.ticks.at(-1).events[2].note,events[2].note);
  engine.selectInstrument('bell');assert.equal(engine.snapshot().elapsed,0);assert.deepEqual(engine.snapshot().events,events);assert.equal(flute.state,'closed');
  await engine.play();const bell=h.contexts[1];assert.deepEqual(bell.oscillators.map(o=>[o.frequency.value,o.startTime]),flute.oscillators.map(o=>[o.frequency.value,o.startTime]));
  assert.notDeepEqual(bell.gains[1].gain.events,flute.gains[1].gain.events);engine.destroy();assert.equal(h.frames.size,0);
});
test('music pause/resume keeps elapsed time, stops old voices and finishes without looping',async()=>{
  const {createMushroomAudio}=await import('../apps/mushroom-exploration/src/sound.js'),h=musicHarness(),engine=createMushroomAudio(h.options);
  await engine.play();h.advance(1.3);engine.pause();const paused=engine.snapshot().elapsed;assert.equal(paused,1.25);assert.equal(h.frames.size,0);assert.ok(h.contexts[0].oscillators.every(o=>o.stopped&&o.disconnected));
  await engine.play();h.advance(.55);assert.equal(engine.snapshot().elapsed,paused+.5);h.advance(9);assert.equal(engine.snapshot().state,'complete');assert.equal(engine.snapshot().index,15);assert.equal(h.frames.size,0);
  await engine.replay();assert.equal(engine.snapshot().index,0);engine.stop();assert.equal(engine.snapshot().state,'ready');assert.equal(engine.snapshot().elapsed,0);assert.equal(h.frames.size,0);
});
test('music silent inspection and volume work independently of audio and preserve pattern',async()=>{
  const {createMushroomAudio,mushroomExamplePattern}=await import('../apps/mushroom-exploration/src/sound.js'),h=musicHarness(),engine=createMushroomAudio(h.options);
  engine.inspect(5);assert.equal(engine.snapshot().index,5);assert.equal(h.contexts.length,0);engine.inspect(99);assert.equal(engine.snapshot().index,15);engine.inspect(-1);assert.equal(engine.snapshot().index,0);
  await engine.play();engine.setVolume(0);assert.equal(h.contexts[0].gains[0].gain.events.at(-1)[1],0);engine.setVolume(2);assert.equal(engine.snapshot().volume,1);
  const old=engine.snapshot().events;engine.setPattern(mushroomExamplePattern(1));assert.notDeepEqual(engine.snapshot().events,old);assert.equal(engine.snapshot().elapsed,0);engine.destroy();
});
test('music unsupported audio, rejected startup and interrupted startup leave a usable silent lesson',async()=>{
  const {createMushroomAudio}=await import('../apps/mushroom-exploration/src/sound.js');
  for(const audioFactory of [()=>{throw new Error('unsupported');},()=>({resume:()=>Promise.reject(new Error('blocked')),close:()=>Promise.resolve()})]){const h=musicHarness({audioFactory}),e=createMushroomAudio(h.options);await e.play();assert.equal(e.snapshot().state,'error');e.inspect(4);assert.equal(e.snapshot().index,4);e.destroy();}
  let resume;const h=musicHarness(),factory=h.options.audioFactory;h.options.audioFactory=()=>{const c=factory();c.resume=()=>new Promise(resolve=>{resume=resolve;});return c;};const e=createMushroomAudio(h.options),pending=e.play();e.stop();resume();await pending;assert.equal(e.snapshot().state,'ready');assert.equal(h.frames.size,0);assert.equal(h.contexts[0].oscillators.length,0);e.destroy();
});
test('music context interruption and stale callbacks cannot restart suspended or destroyed audio',async()=>{
  const {createMushroomAudio}=await import('../apps/mushroom-exploration/src/sound.js'),h=musicHarness(),e=createMushroomAudio(h.options);await e.play();const stale=[...h.frames.values()][0],c=h.contexts[0];c.currentTime=.8;c.state='suspended';c.onstatechange();assert.equal(e.snapshot().state,'paused');assert.equal(h.frames.size,0);stale();assert.equal(h.frames.size,0);await e.play();e.destroy();stale();assert.equal(h.frames.size,0);assert.equal(h.contexts.at(-1).state,'closed');
});
test('music lesson text is editable while illustrated chain, instruments and observation identities stay protected',()=>{
  const block=source.data.blocks.find(b=>b.type==='lab'),music=structuredClone(block.music);music.mapping='Follow the value to its note.';
  assert.equal(editMushroomBlock(source,block.id,{music}).data.blocks.find(b=>b.type==='lab').music.mapping,music.mapping);
  for(const mutate of [m=>m.chain[0].id='mushroom-chain:new',m=>m.instruments.reverse(),m=>m.answers[0].correct=false,m=>m.demoSourceRef='mushroom-source:missing',m=>m.noteTemplate='No samples']){const invalid=structuredClone(music);mutate(invalid);assert.throws(()=>editMushroomBlock(source,block.id,{music:invalid}));}
});
test('the real music demonstration is a registered creator embed, separate from invented pattern data',async()=>{
  const {MUSHROOM_MUSIC_DEMO}=await import('../apps/mushroom-exploration/src/sound.js'),catalog=JSON.parse(await readFile(root+'/apps/mushroom-exploration/source/mushrooms.assets.json','utf8'));
  assert.deepEqual(catalog.soundDemonstrations,[MUSHROOM_MUSIC_DEMO]);assert.equal(new URL(MUSHROOM_MUSIC_DEMO.embed).hostname,'www.youtube-nocookie.com');assert.match(MUSHROOM_MUSIC_DEMO.permission,/embed only/);assert.match(MUSHROOM_MUSIC_DEMO.processing,/not supplied/);assert.equal(MUSHROOM_MUSIC_DEMO.external,true);
  const lesson=source.data.blocks.find(b=>b.type==='lab');assert.equal(source.data.sources.find(s=>s.id===lesson.music.demoSourceRef).url,MUSHROOM_MUSIC_DEMO.source);
});
