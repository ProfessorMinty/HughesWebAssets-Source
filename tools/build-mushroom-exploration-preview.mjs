import { readFile, writeFile, mkdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { createHash } from "node:crypto";
import { validateMushroomSource, MUSHROOM_EDITOR_CONTRACT, mushroomSourceJsonSchema } from "../apps/mushroom-exploration/src/contract.js";

const root = fileURLToPath(new URL("..", import.meta.url));
const app = resolve(root, "apps/mushroom-exploration");
const args = process.argv.slice(2);
if (args.some(function (arg) { return arg !== "--write-contracts"; })) throw new Error("Unsupported preview argument");
const json = function (value) { return JSON.stringify(value, null, 2) + "\n"; };
const controlPath = resolve(app, "source/mushrooms.control.json");
const schemaPath = resolve(root, "schemas/mushroom-exploration.source.schema.json");
const control = json(MUSHROOM_EDITOR_CONTRACT), schema = json(mushroomSourceJsonSchema());
if (args.includes("--write-contracts")) {
  await writeFile(controlPath, control);
  await writeFile(schemaPath, schema);
}
if (await readFile(controlPath, "utf8") !== control || await readFile(schemaPath, "utf8") !== schema) {
  throw new Error("Mushroom editor/schema contract drift. Review the authority module before regenerating contracts.");
}
const source = JSON.parse(await readFile(resolve(app, "source/mushrooms.source.json"), "utf8"));
validateMushroomSource(source, { allowDraft: true });
const read = function (name) { return readFile(resolve(app, "src", name), "utf8"); };
const [contractJS, artJS, labsJS, runtimeJS, exhibitCSS, hostCSS, entrance] = await Promise.all([
  read("contract.js"), read("art.js"), read("labs.js"), read("runtime.js"), read("exhibit.css"), read("host-compat.css"), readFile(resolve(app,"src/assets/entrance-v1.webp"))
]);
const runtime = [contractJS, artJS, labsJS, runtimeJS].map(js=>js.replace(/^import .+;$/gm, "")).join("\n");
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
await writeFile(resolve(out, "preview-record.json"), json({
  application: source.page.id, mode: "exhibit-draft-preview", researchStatus: source.data.meta.researchStatus,
  publicationAvailable: false, sourceSha256: createHash("sha256").update(json(source)).digest("hex"),
  referenceViewport: source.data.meta.designViewport,
  immutableReleaseCreated: false, edublogsChanged: false
}));
console.log("Mushroom scaffold built: " + resolve(out, "index.html"));
