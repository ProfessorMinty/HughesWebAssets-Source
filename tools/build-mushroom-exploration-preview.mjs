import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { validateMushroomSource, MUSHROOM_EDITOR_CONTRACT, mushroomSourceJsonSchema } from "../apps/mushroom-exploration/src/contract.js";
import { MUSHROOM_PHOTOS } from "../apps/mushroom-exploration/src/photo-catalog.js";
import { MUSHROOM_VIDEOS } from "../apps/mushroom-exploration/src/video-assets.js";

import { MUSHROOM_MUSIC_DEMO } from "../apps/mushroom-exploration/src/sound.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = resolve(root, "apps/mushroom-exploration");
const args = process.argv.slice(2);
if (args.some(function (arg) { return arg !== "--write-contracts"; })) throw new Error("Unsupported preview argument");
const json = function (value) { return JSON.stringify(value, null, 2) + "\n"; };
const controlPath = resolve(app, "source/mushrooms.control.json");
const schemaPath = resolve(root, "schemas/mushroom-exploration.source.schema.json");
const assetsPath = resolve(app, "source/mushrooms.assets.json");
const control = json(MUSHROOM_EDITOR_CONTRACT), schema = json(mushroomSourceJsonSchema());
const assets = json({ schemaVersion: '1.2', photos: MUSHROOM_PHOTOS, videos: MUSHROOM_VIDEOS, soundDemonstrations:[MUSHROOM_MUSIC_DEMO] });
if (args.includes("--write-contracts")) {
  await writeFile(controlPath, control);
  await writeFile(schemaPath, schema);
  await writeFile(assetsPath, assets);
}
if(await readFile(assetsPath,'utf8')!==assets)throw new Error('Photographic asset catalog drift. Review source provenance before regenerating.');
if (await readFile(controlPath, "utf8") !== control || await readFile(schemaPath, "utf8") !== schema) {
  throw new Error("Mushroom editor/schema contract drift. Review the authority module before regenerating contracts.");
}
const source = JSON.parse(await readFile(resolve(app, "source/mushrooms.source.json"), "utf8"));
validateMushroomSource(source, { allowDraft: true });
const read = function (name) { return readFile(resolve(app, "src", name), "utf8"); };
const [contractJS, artJS, processJS, soundJS, narrationJS, demoJS, labsJS, runtimeJS, exhibitCSS, hostCSS, entrance, catalogJS, photosJS,videoJS] = await Promise.all([
  read("contract.js"), read("art.js"), read("process.js"), read("sound.js"), read("narration.js"), read("demo.js"), read("labs.js"), read("runtime.js"), read("exhibit.css"), read("host-compat.css"), readFile(resolve(app,"src/assets/entrance-v1.webp")),read('photo-catalog.js'),read('photos.js'),read('video-assets.js')
]);
let inlineCatalog=catalogJS;
for(const photo of MUSHROOM_PHOTOS){
  if(!/^\.\/assets\/[a-z0-9-]+\.webp$/.test(photo.file))throw new Error('Unsafe bundled photo path');
  const bytes=await readFile(resolve(app,'src',photo.file));
  if(createHash('sha256').update(bytes).digest('hex')!==photo.sha256 || bytes.byteLength!==photo.bytes)throw new Error('Photograph integrity mismatch: '+photo.id);
  inlineCatalog=inlineCatalog.replace(JSON.stringify(photo.file),JSON.stringify('data:image/webp;base64,'+bytes.toString('base64')));
}
let inlineVideo=videoJS;
for(const video of MUSHROOM_VIDEOS)for(const file of video.files){
  if(!/^\.\/assets\/[a-z0-9-]+\.(mp4|webp|vtt)$/.test(file.path))throw new Error('Unsafe research video path');
  const bytes=await readFile(resolve(app,'src',file.path));
  if(createHash('sha256').update(bytes).digest('hex')!==file.sha256||bytes.byteLength!==file.bytes)throw new Error('Research video integrity mismatch');
  inlineVideo=inlineVideo.replaceAll(JSON.stringify(file.path),JSON.stringify('data:'+file.mime+';base64,'+bytes.toString('base64')));
}
const runtime = [inlineCatalog, photosJS,inlineVideo, contractJS, artJS, processJS, soundJS, narrationJS, demoJS, labsJS, runtimeJS].map(js=>js.replace(/^import .+;$/gm, "")).join("\n");
const safeSource = JSON.stringify(source).replaceAll("<", "\\u003c");
const template = await readFile(resolve(app, "preview.template.html"), "utf8");
const substitutions = {
  "__EXHIBIT_CSS__": exhibitCSS.replaceAll('./assets/entrance-v1.webp', 'data:image/webp;base64,'+entrance.toString('base64')),
  "__HOST_CSS__": hostCSS,
  "__SOURCE_JSON__": safeSource,
  "__RUNTIME_MODULE__": runtime
};
let html = template;
for (const [token, value] of Object.entries(substitutions)) {
  if (html.split(token).length !== 2) throw new Error("Preview token must occur exactly once: " + token);
  html = html.replace(token, function () { return value; });
}
const out = resolve(root, "dist/mushroom-exploration");
await mkdir(out, { recursive: true });
await writeFile(resolve(out, "index.html"), html);
await writeFile(resolve(out, "qa.html"), await readFile(resolve(app, "qa.template.html"), "utf8"));
await writeFile(resolve(out, "mushrooms.control.json"), control);
await writeFile(resolve(out, "mushrooms.assets.json"), assets);
await writeFile(resolve(out, "preview-record.json"), json({
  application: source.page.id, mode: "exhibit-draft-preview", researchStatus: source.data.meta.researchStatus,
  publicationAvailable: false, sourceSha256: createHash("sha256").update(json(source)).digest("hex"),
  referenceViewport: source.data.meta.designViewport,
  photographs: MUSHROOM_PHOTOS.map(photo=>({id:photo.id,sha256:photo.sha256})),
  researchVideos:MUSHROOM_VIDEOS.map(video=>({id:video.id,files:video.files})),
  immutableReleaseCreated: false, edublogsChanged: false
}));
console.log("Mushroom scaffold built: " + resolve(out, "index.html"));
