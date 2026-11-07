import { MUSHROOM_PHOTOS } from "./photo-catalog.js";
import { MUSHROOM_VIDEOS } from "./video-assets.js";
export const MUSHROOM_CONTRACT_VERSION = "mushroom-exploration/1.10.0";

const fields = {
  hero: ["eyebrow", "title", "intro", "sourceRefs", "media", "entry"],
  family: ["eyebrow", "title", "intro", "sourceRefs", "cards", "station"],
  anatomy: ["eyebrow", "title", "intro", "sourceRefs", "media", "detailMedia", "hotspots"],
  cutaway: ["eyebrow", "title", "intro", "sourceRefs", "media", "views", "growth"],
  lifecycle: ["eyebrow", "title", "intro", "sourceRefs", "steps", "video", "plumeVideo", "activities", "station", "launch", "wind", "cycle", "recording"],
  roles: ["eyebrow", "title", "intro", "sourceRefs", "cards"],
  lab: ["eyebrow", "title", "intro", "sourceRefs", "experiments", "music"],
  facts: ["eyebrow", "title", "intro", "sourceRefs", "cards", "questions"],
  journal: ["eyebrow", "title", "intro", "sourceRefs", "currentStage", "entries"]
};
Object.values(fields).forEach(list => list.push("learning","label"));
export const MUSHROOM_UI_FIELDS = ['brand','navLabel','skipLabel','noticePrefix','wordsTitle','sourcesTitle','photoClose','photoFallbackTitle','photoEnlargeTemplate','photographLabel','photoZoom','photoChangeSuffix','heroArtworkLabel','partGroup','partCountTemplate','partNameTemplate','anatomyModelNote','chooseActivity','chooseActivityTemplate','nextTemplate','exhibitPrefix','jobPrefix','roleGroup','cutawayGroup','realFootage','captionTrack','bridgeCap','bridgeGill','bridgeSpore','quizEyebrow','footerLabel','footerLink','journalHeading','journalBody'];
const narrationFields=['read','stop','options','voiceLabel','ready','reading','complete','stopped','unavailable','error','starting','none','voiceHelp'];
const uiTemplates={photoEnlargeTemplate:['name'],partCountTemplate:['index','total'],partNameTemplate:['index','name'],chooseActivityTemplate:['title'],nextTemplate:['title']};
export function mushroomCopy(template,values){return template.replace(/\{([a-z]+)\}/g,(match,key)=>Object.hasOwn(values,key)?String(values[key]):match);}
export const MUSHROOM_ACTIVITY_VIEWS = ["launch", "wind", "puffball", "cycle"];
const processLabels={growth:[],recycle:['material','threads','food','nutrients','evidence'],trade:['sunlight','root','threads','sugar','water','both'],dough:['outline','gas','bowl'],launch:['spore','drop','film','stalk'],wind:['breeze','left','still','right','left-state','right-state']};
const processStepCounts={growth:4,recycle:3,trade:2,dough:3,launch:3,wind:3};
const recordingFields=['play','pause','replay','fullscreen','paused','playing','finished','error','retry','fullscreenError','silentMicroscope','silentPuffball'];
const musicControls=['play','pause','resume','replay','stop','volume','previous','next','pattern','motion'];
const musicMessages=['ready','playing','starting','paused','complete','error','silent','pattern','lessMotion'];
const musicTexts=['demoRetry','demoLoading','demoReady','demoPlaying','demoPaused','demoEnded','demoBuffering','demoBlocked','demoError','demoTimeout','demoUnavailable','instrumentTitle','detailsTitle','noteStripLabel','loadDemo','closeDemo','demoPlayerTitle','demoFallback','chainLabel','limits','exampleLabel','mapping','graphLabel','high','low','time','noteTemplate','observationTitle','demoTitle','demoBody','demoLinkLabel','demoNote'];

export const MUSHROOM_EDITOR_CONTRACT = {
  schemaVersion: MUSHROOM_CONTRACT_VERSION,
  sourceDocument: "apps/mushroom-exploration/source/mushrooms.source.json",
  photoCatalog: "apps/mushroom-exploration/source/mushrooms.assets.json",
  videoCatalog: "apps/mushroom-exploration/source/mushrooms.assets.json",
  editorRoute: "/mushrooms",
  editorLabel: "Mushinator",
  editorImplementation: "journal-editor-built; deployment verification pending",
  protectedFields: ["schemaVersion", "page", "data.meta", "data.sources", "block.id", "block.type", "nested record IDs", "process mode and phase/label IDs"],
  layout: { mode: "viewport-breakout", referenceViewport: { width: 1920, height: 911 } },
  blocks: Object.entries(fields).map(function (entry) {
    return { type: entry[0], editableFields: entry[1], identityField: "id" };
  }),
  journalImplementation: "separate versioned journal index and day records; private Mushinator drafts; credential-gated repo publisher",
  journalContract: { schemaVersion:"1.0.0", indexDocument:"apps/mushroom-exploration/source/journal/index.json", recordsDirectory:"apps/mushroom-exploration/source/journal/days/", cardTypes:["observation","fact","teacher-note","student-note"], authorRequired:false, mushroomTypeRequired:false },
  publicationAvailable: false
};
MUSHROOM_EDITOR_CONTRACT.interface={sourcePath:'data.ui',editableFields:[...MUSHROOM_UI_FIELDS,'narration'],narrationFields};

export function mushroomSourceJsonSchema() {
  const short = { type: "string", maxLength: 140, minLength: 1 };
  const body = { type: "string", maxLength: 6000 };
  const recordId = { type: "string", pattern: "^mushroom-[a-z]+:[a-z0-9]+(?:-[a-z0-9]+)*$" };
  const sourceRefs = { type: "array", maxItems: 12, items: { type: "string" } };
  const obj = function (properties) { return { type: "object", additionalProperties: false, required: Object.keys(properties), properties: properties }; };
  const list = function (items, maxItems) { return { type: "array", maxItems: maxItems, items: items }; };
  const imageUrl = { anyOf: [{ type: "string", format: "uri", pattern: "^https://" }, { enum: MUSHROOM_PHOTOS.map(photo => 'asset:' + photo.id) }] };
  const image = { anyOf: [{ type: "null" }, obj({ kind: { const: "image" }, url: imageUrl, alt: { type: "string", minLength: 1, maxLength: 500 }, caption: { type: "string", maxLength: 600 } })] };
  const research = { id: recordId, body: body, sourceRefs: sourceRefs };
  const learning = obj({ action: shortText(), observe: shortText(), safety: shortText(), teacher: body,
    words: list(obj({ id: recordId, term: short, pronunciation: {type:"string",maxLength:120}, body, sourceRefs }), 12) });
  function shortText(){ return { type:"string", maxLength:600 }; }
  const station = obj({ title: short, intro: {type:"string",maxLength:600} });
  const process = mode => obj({id:{const:'mushroom-process:'+mode},mode:{const:mode},label:shortText(),initial:shortText(),playing:shortText(),finished:shortText(),lessMotion:shortText(),controls:obj(Object.fromEntries(['play','replay','pause','resume','step','reset','motion'].map(key=>[key,short]))),steps:{...list(obj({id:recordId,label:short,body:shortText()}),processStepCounts[mode]),minItems:processStepCounts[mode]},labels:{...list(obj({id:recordId,text:short}),processLabels[mode].length),minItems:processLabels[mode].length}});
  const video = {anyOf:[{type:'null'},obj({kind:{const:'video'},url:{enum:MUSHROOM_VIDEOS.map(item=>'asset:'+item.id)},title:short,caption:{type:'string',minLength:1,maxLength:600},sourceRefs})]};
  const shapes = {
    hero: { media: image, entry: obj({exploreLabel:short,journalLabel:short,journalReadyLabel:short,note:{type:"string",maxLength:600}}) },
    family: { station, cards: list(obj({ ...research, title: short, visual: { enum: ["mushroom", "mould", "yeast", "leaf", "tree", "bread"] }, media: image }), 6) },
    anatomy: { media: image, detailMedia: image, hotspots: list(obj({ ...research, label: short, x: { type: "number", minimum: 0, maximum: 100 }, y: { type: "number", minimum: 0, maximum: 100 } }), 12) },
    cutaway: { growth:process('growth'),media: image, views: { ...list(obj({ ...research, label: short }), 2), minItems: 2 } },
    lifecycle: { station, launch:process('launch'),wind:process('wind'),cycle:obj({label:shortText(),returnLabel:shortText(),scopeNote:shortText()}),recording:obj(Object.fromEntries(recordingFields.map(key=>[key,shortText()]))), activities: {...list(obj({id:recordId,view:{enum:MUSHROOM_ACTIVITY_VIEWS},label:short,title:short,intro:{type:"string",maxLength:1600},learning,sourceRefs}),4),minItems:4}, steps: {...list(obj({ ...research, title: short, media: image }), 4),minItems:4}, video, plumeVideo: video },
    roles: { cards: list(obj({ ...research, title: short, visual: { enum: ["leaf", "tree", "bread"] }, media: image, learning,process:{oneOf:['recycle','trade','dough'].map(process)} }), 3) },
    lab: { experiments: list(obj({ ...research, title: short, label: short, mode: { enum: ["glow", "sound"] }, media: image, learning }), 2),music:obj({
      ...Object.fromEntries(musicTexts.map(key=>[key,shortText()])),
      chain:{...list(obj({id:recordId,stage:{enum:['fungus','sensor','computer','instrument']},title:short,body:shortText()}),4),minItems:4},
      instruments:{...list(obj({id:recordId,mode:{enum:['flute','bell']},label:short,description:shortText()}),2),minItems:2},
      controls:obj(Object.fromEntries(musicControls.map(key=>[key,short]))),messages:obj(Object.fromEntries(musicMessages.map(key=>[key,shortText()]))),
      answers:{...list(obj({id:recordId,label:short,correct:{type:'boolean'},feedback:shortText()}),2),minItems:2},demoSourceRef:{const:'mushroom-source:plantwave-demo'}
    }) },
    facts: { cards: list(obj({ ...research, title: short }), 12), questions: list(obj({ id: recordId, prompt: short, sourceRefs: sourceRefs, choices: list(obj({ id: recordId, label: short, correct: { type: "boolean" }, feedback: { type: "string", minLength: 1, maxLength: 600 } }), 4) }), 6) },
    journal: { currentStage: { type: "null" }, entries: { type: "array", maxItems: 0 } }
  };
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Mushroom exhibit source scaffold",
    description: "Generated from the owning runtime contract. Semantic/publication guards also run in validateMushroomSource.",
    ...obj({
      schemaVersion: { const: "1.0" },
      page: obj({ id: { const: "hrv-page:mushrooms-2026-2027" }, type: { const: "mushroom-exploration" }, routeRef: { const: "hrv-route:mushrooms-2026-2027" } }),
      data: obj({
        ui:obj({...Object.fromEntries(MUSHROOM_UI_FIELDS.map(key=>[key,shortText()])),narration:obj(Object.fromEntries(narrationFields.map(key=>[key,shortText()])))}),
        meta: obj({ schoolYear: { const: "2026-2027" }, state: { enum: ["scaffold", "review-ready"] }, researchStatus: { enum: ["pending", "reviewed"] }, layout: { const: "viewport-breakout" }, designViewport: obj({ width: { const: 1920 }, height: { const: 911 } }) }),
        sources: list(obj({ id: { type: "string", pattern: "^mushroom-source:" }, title: { type: "string", minLength: 1, maxLength: 300 }, url: { type: "string", format: "uri", pattern: "^https://" } }), 80),
        blocks: { type: "array", minItems: 9, maxItems: 12, items: { oneOf: Object.keys(fields).map(function (type) {
          return obj({ id: recordId, type: { const: type }, label:short, eyebrow: { type: "string", minLength: 1, maxLength: 100 }, title: short, intro: { type: "string", maxLength: 1600 }, sourceRefs: sourceRefs, learning, ...shapes[type] });
        }) } }
      })
    })
  };
}

function requireThat(condition, message) {
  if (!condition) throw new Error("MUSHROOM_CONTRACT: " + message);
}
function object(value, keys, label) {
  requireThat(value !== null && typeof value === "object" && !Array.isArray(value), label + " must be an object");
  requireThat(Object.keys(value).every(function (key) { return keys.includes(key); }), label + " contains an unsupported field");
  requireThat(keys.every(function (key) { return Object.hasOwn(value, key); }), label + " is missing a field");
}
function text(value, label, maximum, required) {
  requireThat(typeof value === "string" && Array.from(value).length <= maximum, label + " is invalid or too long");
  if (required) requireThat(value.trim().length > 0, label + " is required");
}
function array(value, label, maximum) {
  requireThat(Array.isArray(value) && value.length <= maximum, label + " must be a bounded array");
}
function https(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error("MUSHROOM_CONTRACT: " + label + " is not a URL"); }
  requireThat(url.protocol === "https:" && !url.username && !url.password, label + " must be credential-free HTTPS");
}
function media(value, label) {
  if (value === null) return;
  object(value, ["kind", "url", "alt", "caption"], label);
  requireThat(value.kind === "image", label + " supports image references only in this scaffold");
  if (typeof value.url === 'string' && value.url.startsWith('asset:')) {
    requireThat(MUSHROOM_PHOTOS.some(photo => 'asset:' + photo.id === value.url), 'unknown bundled photo reference');
  } else https(value.url, label + ".url");
  text(value.alt, label + ".alt", 500, true);
  text(value.caption, label + ".caption", 600, false);
}

export function validateMushroomSource(source, options) {
  const allowDraft = options && options.allowDraft === true;
  object(source, ["schemaVersion", "page", "data"], "source");
  requireThat(source.schemaVersion === "1.0", "unsupported source version");
  object(source.page, ["id", "type", "routeRef"], "page");
  requireThat(source.page.id === "hrv-page:mushrooms-2026-2027" &&
    source.page.type === "mushroom-exploration" &&
    source.page.routeRef === "hrv-route:mushrooms-2026-2027", "protected page identity changed");
  object(source.data, ["meta", "sources", "blocks", "ui"], "data");
  object(source.data.ui,[...MUSHROOM_UI_FIELDS,'narration'],'interface copy');
  MUSHROOM_UI_FIELDS.forEach(key=>text(source.data.ui[key],'interface '+key,600,true));
  object(source.data.ui.narration,narrationFields,'narration copy');narrationFields.forEach(key=>text(source.data.ui.narration[key],'narration '+key,600,key!=='ready'));
  Object.entries(uiTemplates).forEach(([key,tokens])=>requireThat(tokens.every(token=>source.data.ui[key].includes('{'+token+'}'))&&[...source.data.ui[key].matchAll(/\{([^}]+)\}/g)].every(match=>tokens.includes(match[1])),'interface template tokens changed'));
  const meta = source.data.meta;
  object(meta, ["schoolYear", "state", "researchStatus", "layout", "designViewport"], "meta");
  object(meta.designViewport, ["width", "height"], "designViewport");
  requireThat(meta.layout === "viewport-breakout" && meta.designViewport.width === 1920 &&
    meta.designViewport.height === 911 && meta.schoolYear === "2026-2027", "protected layout or year changed");
  requireThat(["scaffold", "review-ready"].includes(meta.state), "unknown publication state");
  requireThat(["pending", "reviewed"].includes(meta.researchStatus), "unknown research state");
  if (!allowDraft) requireThat(meta.state === "review-ready" && meta.researchStatus === "reviewed",
    "draft content cannot be published; content and publication review are required");

  const ids = new Set();
  function id(value, prefix) {
    text(value, "stable ID", 120, true);
    requireThat(new RegExp("^" + prefix + ":[a-z0-9]+(?:-[a-z0-9]+)*$").test(value), "invalid stable ID");
    requireThat(!ids.has(value), "duplicate stable ID " + value);
    ids.add(value);
  }
  array(source.data.sources, "sources", 80);
  const sourceIds = new Set();
  source.data.sources.forEach(function (item) {
    object(item, ["id", "title", "url"], "citation");
    id(item.id, "mushroom-source"); sourceIds.add(item.id);
    text(item.title, "source title", 300, true); https(item.url, "source URL");
  });
  function research(item, label) {
    text(item.body, label + " body", 6000, !allowDraft);
    array(item.sourceRefs, label + " sources", 12);
    requireThat(item.sourceRefs.every(function (ref) { return sourceIds.has(ref); }), "unresolved research citation");
    if (!allowDraft) requireThat(item.sourceRefs.length > 0, label + " requires reviewed citations");
  }
  function lesson(value) {
    object(value,["action","observe","safety","teacher","words"],"learning context");
    ["action","observe","safety"].forEach(key=>text(value[key],"learning "+key,600,false));
    text(value.teacher,"teacher detail",6000,false);array(value.words,"science words",12);
    value.words.forEach(word=>{object(word,["id","term","pronunciation","body","sourceRefs"],"science word");id(word.id,"mushroom-word");text(word.term,"science term",140,true);text(word.pronunciation,"pronunciation",120,false);research(word,"science word");});
  }
  function process(value,mode){
    object(value,['id','mode','label','initial','playing','finished','lessMotion','controls','steps','labels'],'process');id(value.id,'mushroom-process');
    requireThat(value.mode===mode&&value.id==='mushroom-process:'+mode,'protected process mode changed');
    ['label','initial','playing','finished','lessMotion'].forEach(key=>text(value[key],'process '+key,600,key!=='playing'));
    object(value.controls,['play','replay','pause','resume','step','reset','motion'],'process controls');Object.values(value.controls).forEach(label=>text(label,'process control',140,true));
    array(value.steps,'process steps',processStepCounts[mode]);requireThat(value.steps.length===processStepCounts[mode],'process stage count changed');
    value.steps.forEach((step,i)=>{object(step,['id','label','body'],'process step');id(step.id,'mushroom-phase');requireThat(step.id==='mushroom-phase:'+mode+'-'+(i+1),'protected process step order changed');text(step.label,'process step label',140,true);text(step.body,'process step explanation',600,true);});
    array(value.labels,'process labels',processLabels[mode].length);requireThat(value.labels.length===processLabels[mode].length,'process label count changed');
    value.labels.forEach(label=>{object(label,['id','text'],'process label');id(label.id,'mushroom-label');requireThat(processLabels[mode].some(key=>label.id==='mushroom-label:'+mode+'-'+key),'unknown process label');text(label.text,'diagram label',140,true);});
  }
  const kinds = new Set();
  array(source.data.blocks, "blocks", 12);
  requireThat(source.data.blocks.length >= 9, "core exhibit sections must be present");
  source.data.blocks.forEach(function (block) {
    requireThat(block && Object.hasOwn(fields, block.type), "unsupported block type");
    object(block, ["id", "type"].concat(fields[block.type]), "block");
    id(block.id, "mushroom-block");
    requireThat(!kinds.has(block.type), "duplicate block kind"); kinds.add(block.type);
    text(block.eyebrow, "eyebrow", 100, true);
    text(block.title, "title", 140, true);
    text(block.intro, "introduction", 1600, !allowDraft && block.type !== "journal");
    lesson(block.learning);text(block.label,'activity label',140,true);
    if(block.type==='hero'){
      object(block.entry,["exploreLabel","journalLabel","journalReadyLabel","note"],"entrance copy");
      ["exploreLabel","journalLabel","journalReadyLabel"].forEach(key=>text(block.entry[key],key,140,true));text(block.entry.note,"entrance note",600,false);
    }
    if(block.type==='family'||block.type==='lifecycle'){
      object(block.station,["title","intro"],"station copy");text(block.station.title,"station title",140,true);text(block.station.intro,"station intro",600,true);
    }
    array(block.sourceRefs, "block source references", 12);
    requireThat(block.sourceRefs.every(function (ref) { return sourceIds.has(ref); }), "unresolved block research citation");
    if (!allowDraft && block.type !== "journal") requireThat(block.sourceRefs.length > 0, "section requires reviewed citations");
    if (Object.hasOwn(block, "media")) media(block.media, "block media");
    if (Object.hasOwn(block, "detailMedia")) media(block.detailMedia, "specimen detail media");
    if (block.type === "anatomy") {
      array(block.hotspots, "hotspots", 12);
      requireThat(block.hotspots.length > 0, "anatomy needs observation points");
      block.hotspots.forEach(function (point) {
        object(point, ["id", "x", "y", "label", "body", "sourceRefs"], "hotspot");
        id(point.id, "mushroom-point");
        requireThat([point.x, point.y].every(function (n) { return Number.isFinite(n) && n >= 0 && n <= 100; }), "hotspot outside the diagram");
        text(point.label, "hotspot label", 100, true); research(point, "hotspot");
      });
    }
    if (block.type === "cutaway") {
      process(block.growth,'growth');
      array(block.views, "cutaway views", 2);
      requireThat(block.views.length === 2, "cutaway needs two views");
      block.views.forEach(function (view) {
        object(view, ["id", "label", "body", "sourceRefs"], "cutaway view");
        id(view.id, "mushroom-view"); text(view.label, "view label", 100, true); research(view, "cutaway view");
      });
    }
    if (block.type === "lifecycle") {
      process(block.launch,'launch');process(block.wind,'wind');
      object(block.cycle,['label','returnLabel','scopeNote'],'cycle context');Object.values(block.cycle).forEach(value=>text(value,'cycle copy',600,true));
      object(block.recording,recordingFields,'recording copy');Object.values(block.recording).forEach(value=>text(value,'recording copy',600,true));
      array(block.activities,"spore activities",4);
      requireThat(block.activities.length===4&&new Set(block.activities.map(a=>a.view)).size===4,"four distinct spore activities are required");
      block.activities.forEach(activity=>{object(activity,["id","view","label","title","intro","learning","sourceRefs"],"spore activity");id(activity.id,"mushroom-activity");requireThat(MUSHROOM_ACTIVITY_VIEWS.includes(activity.view)&&activity.id==='mushroom-activity:'+activity.view,"protected activity view changed");["label","title"].forEach(key=>text(activity[key],"activity "+key,140,true));text(activity.intro,"activity intro",1600,true);research({body:activity.intro,sourceRefs:activity.sourceRefs},"activity");lesson(activity.learning);});
      for(const key of ['video','plumeVideo']){
        const recording=block[key];
        if(recording!==null){
          object(recording,['kind','url','title','caption','sourceRefs'],'research video');
          requireThat(recording.kind==='video'&&MUSHROOM_VIDEOS.some(item=>'asset:'+item.id===recording.url),'unknown research video reference');
          text(recording.title,'video title',140,true);text(recording.caption,'video caption',600,true);
          research({body:recording.caption,sourceRefs:recording.sourceRefs},'research video');
        }else if(!allowDraft&&key==='video')requireThat(false,'reviewed spore recording is missing');
      }
      array(block.steps, "lifecycle steps", 12);
      requireThat(block.steps.length===4&&block.steps.every((step,i)=>step.id==='mushroom-step:'+['spore','threads','fruit','release'][i]),'protected life-cycle stage order changed');
      if (!allowDraft) requireThat(block.steps.length > 0, "reviewed lifecycle is missing");
      block.steps.forEach(function (step) {
        object(step, ["id", "title", "body", "sourceRefs", "media"], "lifecycle step");
        id(step.id, "mushroom-step"); text(step.title, "step title", 140, true);
        research(step, "lifecycle step"); media(step.media, "step media");
      });
    }
    if (block.type === "facts") {
      array(block.cards, "fact cards", 12);
      if (!allowDraft) requireThat(block.cards.length > 0, "reviewed discovery cards are missing");
      block.cards.forEach(function (card) {
        object(card, ["id", "title", "body", "sourceRefs"], "fact card");
        id(card.id, "mushroom-fact"); text(card.title, "fact title", 140, true); research(card, "fact card");
      });
      array(block.questions, "discovery questions", 6);
      block.questions.forEach(function (question) {
        object(question, ["id", "prompt", "sourceRefs", "choices"], "question");
        id(question.id, "mushroom-question"); text(question.prompt, "question prompt", 140, true);
        research({ body: question.prompt, sourceRefs: question.sourceRefs }, "question");
        array(question.choices, "answer choices", 4);
        requireThat(question.choices.length >= 2 && question.choices.filter(function (choice) { return choice.correct === true; }).length === 1, "questions need exactly one correct answer");
        question.choices.forEach(function (choice) {
          object(choice, ["id", "label", "correct", "feedback"], "answer");
          id(choice.id, "mushroom-answer"); text(choice.label, "answer label", 140, true);
          text(choice.feedback, "answer feedback", 600, true);
          requireThat(typeof choice.correct === "boolean", "invalid answer marker");
        });
      });
    }
    if (block.type === "family" || block.type === "roles") {
      array(block.cards, "specimen cards", 6);
      if (!allowDraft) requireThat(block.cards.length > 0, "reviewed specimen cards are missing");
      block.cards.forEach(function (card) {
        object(card, ["id", "title", "body", "sourceRefs", "visual", "media"].concat(block.type==='roles'?["learning","process"]:[]), "specimen card");
        if(block.type==='roles'){lesson(card.learning);const mode={leaf:'recycle',tree:'trade',bread:'dough'}[card.visual];requireThat(!!mode,'unknown fungal job visual');process(card.process,mode);}
        id(card.id, block.type === "family" ? "mushroom-family" : "mushroom-role");
        text(card.title, "card title", 140, true); research(card, "specimen card");
        requireThat(["mushroom", "mould", "yeast", "leaf", "tree", "bread"].includes(card.visual), "unknown specimen illustration");
        media(card.media, "specimen photo");
      });
    }
    if (block.type === "lab") {
      const music=block.music;object(music,[...musicTexts,'chain','instruments','controls','messages','answers','demoSourceRef'],'music lesson');
      musicTexts.forEach(key=>text(music[key],'music '+key,600,true));
      object(music.controls,musicControls,'music controls');Object.values(music.controls).forEach(value=>text(value,'music control',140,true));
      object(music.messages,musicMessages,'music messages');Object.values(music.messages).forEach(value=>text(value,'music message',600,true));
      for(const [key,kinds,prefix] of [['chain',['fungus','sensor','computer','instrument'],'mushroom-chain'],['instruments',['flute','bell'],'mushroom-instrument']]){
        array(music[key],'music '+key,kinds.length);requireThat(music[key].length===kinds.length,'music records missing');music[key].forEach((item,index)=>{
          object(item,key==='chain'?['id','stage','title','body']:['id','mode','label','description'],'music record');id(item.id,prefix);
          requireThat(item.id===prefix+':'+kinds[index]&&item[key==='chain'?'stage':'mode']===kinds[index],'protected music record changed');
          text(item[key==='chain'?'title':'label'],'music label',140,true);text(item[key==='chain'?'body':'description'],'music explanation',600,true);
        });
      }
      array(music.answers,'music observations',2);requireThat(music.answers.length===2,'music observation missing');music.answers.forEach((answer,index)=>{object(answer,['id','label','correct','feedback'],'music answer');id(answer.id,'mushroom-answer');requireThat(answer.id===['mushroom-answer:instrument','mushroom-answer:music-pattern'][index]&&answer.correct===(index===0),'protected music answer changed');text(answer.label,'music answer',140,true);text(answer.feedback,'music feedback',600,true);});
      requireThat(music.demoSourceRef==='mushroom-source:plantwave-demo'&&sourceIds.has(music.demoSourceRef),'unknown demonstration source');
      requireThat(['{index}','{value}','{note}'].every(token=>music.noteTemplate.includes(token)),'music note template needs sample, value and note');
      array(block.experiments, "lab exhibits", 2);
      requireThat(block.experiments.length === 2 && new Set(block.experiments.map(function (item) { return item.mode; })).size === 2, "lab needs distinct light and sound exhibits");
      block.experiments.forEach(function (item) {
        object(item, ["id", "title", "body", "sourceRefs", "mode", "media", "label", "learning"], "lab exhibit");
        text(item.label,"activity label",140,true);lesson(item.learning);
        id(item.id, "mushroom-lab"); text(item.title, "lab title", 140, true); research(item, "lab exhibit");
        requireThat(["glow", "sound"].includes(item.mode), "unknown lab activity");
        media(item.media, "lab photograph");
      });
    }
    if (block.type === "journal") {
      requireThat(block.currentStage === null, "growth-stage authoring is reserved for the journal implementation");
      array(block.entries, "journal entries", 0);
    }
  });
  Object.keys(fields).forEach(function (type) { requireThat(kinds.has(type), "missing core exhibit " + type); });
  requireThat(source.data.blocks[0].type === "hero" && source.data.blocks.at(-1).type === "journal", "welcome and journal positions are protected");
  return source;
}

export function editMushroomBlock(source, blockId, patch) {
  validateMushroomSource(source, { allowDraft: true });
  const next = structuredClone(source);
  const block = next.data.blocks.find(function (item) { return item.id === blockId; });
  requireThat(!!block, "unknown block");
  requireThat(patch && typeof patch === "object" && !Array.isArray(patch), "patch must be an object");
  requireThat(Object.keys(patch).every(function (key) { return fields[block.type].includes(key); }), "patch changes a protected or unsupported field");
  ["hotspots", "views", "cards", "steps", "experiments", "questions", "activities"].forEach(function (key) {
    if (!Object.hasOwn(patch, key)) return;
    requireThat(Array.isArray(patch[key]), "nested records must be an array");
    const before = block[key].map(function (item) { return item.id; }).sort();
    const after = patch[key].map(function (item) { return item.id; }).sort();
    requireThat(JSON.stringify(before) === JSON.stringify(after), "nested IDs require a separate add/remove operation");
    if (key === "questions") block.questions.forEach(function (question) {
      const updated = patch.questions.find(function (item) { return item.id === question.id; });
      requireThat(Array.isArray(updated.choices), "answer choices must be an array");
      requireThat(JSON.stringify(question.choices.map(function (item) { return item.id; }).sort()) ===
        JSON.stringify(updated.choices.map(function (item) { return item.id; }).sort()), "nested answer IDs require a separate add/remove operation");
    });
  });
  // Lesson text is editable; word identities are stable across those edits too.
  function wordIds(value,result=[]) { if(!value||typeof value!=="object")return result;if(Array.isArray(value.words))result.push(...value.words.map(w=>w.id));Object.entries(value).filter(([key])=>key!=="words").forEach(([,item])=>{if(Array.isArray(item))item.forEach(v=>wordIds(v,result));else if(item&&typeof item==="object")wordIds(item,result);});return result.sort(); }
  requireThat(JSON.stringify(wordIds(block))===JSON.stringify(wordIds({...block,...patch})),"science word IDs require a separate add/remove operation");
  function processIds(value,result=[]){if(!value||typeof value!=='object')return result;if(typeof value.id==='string'&&/^mushroom-(process|phase|label):/.test(value.id))result.push(value.id+(value.mode?':'+value.mode:''));Object.values(value).forEach(item=>{if(Array.isArray(item))item.forEach(v=>processIds(v,result));else if(item&&typeof item==='object')processIds(item,result);});return result.sort();}
  requireThat(JSON.stringify(processIds(block))===JSON.stringify(processIds({...block,...patch})),"process identities require a separate add/remove operation");
  Object.assign(block, structuredClone(patch));
  next.data.meta.state = "scaffold";
  next.data.meta.researchStatus = "pending";
  validateMushroomSource(next, { allowDraft: true });
  return next;
}

export function editMushroomInterface(source,patch){
  validateMushroomSource(source,{allowDraft:true});
  requireThat(patch&&typeof patch==='object'&&!Array.isArray(patch),'interface patch must be an object');
  requireThat(Object.keys(patch).every(key=>[...MUSHROOM_UI_FIELDS,'narration'].includes(key)),'protected or unsupported interface field');
  const next=structuredClone(source);Object.assign(next.data.ui,structuredClone(patch));next.data.meta.state='scaffold';next.data.meta.researchStatus='pending';validateMushroomSource(next,{allowDraft:true});return next;
}
