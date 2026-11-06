import { MUSHROOM_PHOTOS } from "./photo-catalog.js";
import { MUSHROOM_VIDEOS } from "./video-assets.js";
export const MUSHROOM_CONTRACT_VERSION = "mushroom-exploration/1.4.0";

const fields = {
  hero: ["eyebrow", "title", "intro", "sourceRefs", "media"],
  family: ["eyebrow", "title", "intro", "sourceRefs", "cards"],
  anatomy: ["eyebrow", "title", "intro", "sourceRefs", "media", "detailMedia", "hotspots"],
  cutaway: ["eyebrow", "title", "intro", "sourceRefs", "media", "views"],
  lifecycle: ["eyebrow", "title", "intro", "sourceRefs", "steps", "video", "plumeVideo"],
  roles: ["eyebrow", "title", "intro", "sourceRefs", "cards"],
  lab: ["eyebrow", "title", "intro", "sourceRefs", "experiments"],
  facts: ["eyebrow", "title", "intro", "sourceRefs", "cards", "questions"],
  journal: ["eyebrow", "title", "intro", "sourceRefs", "currentStage", "entries"]
};

export const MUSHROOM_EDITOR_CONTRACT = {
  schemaVersion: MUSHROOM_CONTRACT_VERSION,
  sourceDocument: "apps/mushroom-exploration/source/mushrooms.source.json",
  photoCatalog: "apps/mushroom-exploration/source/mushrooms.assets.json",
  videoCatalog: "apps/mushroom-exploration/source/mushrooms.assets.json",
  editorRoute: "/mushrooms",
  editorLabel: "Mushinator",
  editorImplementation: "not-built",
  protectedFields: ["schemaVersion", "page", "data.meta", "data.sources", "block.id", "block.type", "nested record IDs"],
  layout: { mode: "viewport-breakout", referenceViewport: { width: 1920, height: 911 } },
  blocks: Object.entries(fields).map(function (entry) {
    return { type: entry[0], editableFields: entry[1], identityField: "id" };
  }),
  journalImplementation: "reserved; entry authoring and publication are not implemented",
  publicationAvailable: false
};

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
  const video = {anyOf:[{type:'null'},obj({kind:{const:'video'},url:{enum:MUSHROOM_VIDEOS.map(item=>'asset:'+item.id)},title:short,caption:{type:'string',minLength:1,maxLength:600},sourceRefs})]};
  const shapes = {
    hero: { media: image },
    family: { cards: list(obj({ ...research, title: short, visual: { enum: ["mushroom", "mould", "yeast", "leaf", "tree", "bread"] }, media: image }), 6) },
    anatomy: { media: image, detailMedia: image, hotspots: list(obj({ ...research, label: short, x: { type: "number", minimum: 0, maximum: 100 }, y: { type: "number", minimum: 0, maximum: 100 } }), 12) },
    cutaway: { media: image, views: { ...list(obj({ ...research, label: short }), 2), minItems: 2 } },
    lifecycle: { steps: list(obj({ ...research, title: short, media: image }), 12), video, plumeVideo: video },
    roles: { cards: list(obj({ ...research, title: short, visual: { enum: ["mushroom", "mould", "yeast", "leaf", "tree", "bread"] }, media: image }), 6) },
    lab: { experiments: list(obj({ ...research, title: short, mode: { enum: ["glow", "sound"] }, media: image }), 2) },
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
        meta: obj({ schoolYear: { const: "2026-2027" }, state: { enum: ["scaffold", "review-ready"] }, researchStatus: { enum: ["pending", "reviewed"] }, layout: { const: "viewport-breakout" }, designViewport: obj({ width: { const: 1920 }, height: { const: 911 } }) }),
        sources: list(obj({ id: { type: "string", pattern: "^mushroom-source:" }, title: { type: "string", minLength: 1, maxLength: 300 }, url: { type: "string", format: "uri", pattern: "^https://" } }), 80),
        blocks: { type: "array", minItems: 6, maxItems: 12, items: { oneOf: Object.keys(fields).map(function (type) {
          return obj({ id: recordId, type: { const: type }, eyebrow: { type: "string", minLength: 1, maxLength: 100 }, title: short, intro: { type: "string", maxLength: 1600 }, sourceRefs: sourceRefs, ...shapes[type] });
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
  object(source.data, ["meta", "sources", "blocks"], "data");
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
  const kinds = new Set();
  array(source.data.blocks, "blocks", 12);
  requireThat(source.data.blocks.length >= 6, "core exhibit sections must be present");
  source.data.blocks.forEach(function (block) {
    requireThat(block && Object.hasOwn(fields, block.type), "unsupported block type");
    object(block, ["id", "type"].concat(fields[block.type]), "block");
    id(block.id, "mushroom-block");
    requireThat(!kinds.has(block.type), "duplicate block kind"); kinds.add(block.type);
    text(block.eyebrow, "eyebrow", 100, true);
    text(block.title, "title", 140, true);
    text(block.intro, "introduction", 1600, !allowDraft && block.type !== "journal");
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
      array(block.views, "cutaway views", 2);
      requireThat(block.views.length === 2, "cutaway needs two views");
      block.views.forEach(function (view) {
        object(view, ["id", "label", "body", "sourceRefs"], "cutaway view");
        id(view.id, "mushroom-view"); text(view.label, "view label", 100, true); research(view, "cutaway view");
      });
    }
    if (block.type === "lifecycle") {
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
        object(card, ["id", "title", "body", "sourceRefs", "visual", "media"], "specimen card");
        id(card.id, block.type === "family" ? "mushroom-family" : "mushroom-role");
        text(card.title, "card title", 140, true); research(card, "specimen card");
        requireThat(["mushroom", "mould", "yeast", "leaf", "tree", "bread"].includes(card.visual), "unknown specimen illustration");
        media(card.media, "specimen photo");
      });
    }
    if (block.type === "lab") {
      array(block.experiments, "lab exhibits", 2);
      requireThat(block.experiments.length === 2 && new Set(block.experiments.map(function (item) { return item.mode; })).size === 2, "lab needs distinct light and sound exhibits");
      block.experiments.forEach(function (item) {
        object(item, ["id", "title", "body", "sourceRefs", "mode", "media"], "lab exhibit");
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
  ["hero", "anatomy", "cutaway", "lifecycle", "facts", "journal"].forEach(function (type) { requireThat(kinds.has(type), "missing core exhibit " + type); });
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
  ["hotspots", "views", "cards", "steps", "experiments", "questions"].forEach(function (key) {
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
  Object.assign(block, structuredClone(patch));
  next.data.meta.state = "scaffold";
  next.data.meta.researchStatus = "pending";
  validateMushroomSource(next, { allowDraft: true });
  return next;
}
