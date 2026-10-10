import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  DEFAULT_DOORWAY_ROOT,
  DEFAULT_RELEASE_ROOT,
  REPOSITORY_ROOT,
  buildDoorwayArtifacts,
  fileExists
} from "./lib/classroom-explorations-archive-doorway.mjs";

const args = process.argv.slice(2);
const replace = args.at(-1) === "--replace";
if (replace) args.pop();
if (args.length !== 3) {
  throw new Error(
    "Usage: node tools/generate-classroom-explorations-archive-doorway.mjs <runtime-version> <publication-id> <40-character-asset-commit> [--replace]"
  );
}

const [runtimeVersion, publicationId, assetCommit] = args;
const templateRoot = resolve(process.env.HRV_ARCHIVE_DOORWAY_TEMPLATE_ROOT || DEFAULT_DOORWAY_ROOT);
const outputRoot = resolve(process.env.HRV_ARCHIVE_DOORWAY_OUTPUT_ROOT || DEFAULT_DOORWAY_ROOT);
const releaseRoot = resolve(process.env.HRV_ARCHIVE_RELEASE_ROOT || DEFAULT_RELEASE_ROOT);
const gitRoot = resolve(process.env.HRV_ARCHIVE_GIT_ROOT || REPOSITORY_ROOT);
const artifacts = await buildDoorwayArtifacts({
  runtimeVersion,
  publicationId,
  assetCommit,
  templateRoot,
  releaseRoot,
  gitRoot
});

const outputs = new Map([
  ["HTML-BOX.html", artifacts.html],
  ["CSS-BOX.css", artifacts.css],
  ["JAVASCRIPT-BOX.js", artifacts.javascript],
  ["RELEASE-PIN.json", artifacts.pinText]
]);

for (const [name, contents] of outputs) {
  const target = resolve(outputRoot, name);
  if (!await fileExists(target)) continue;
  const existing = await readFile(target, "utf8");
  if (existing === contents) continue;
  if (!replace) {
    throw new Error(`Refusing to replace a different generated doorway file without --replace: ${target}`);
  }
}

await mkdir(outputRoot, { recursive: true });
for (const [name, contents] of outputs) {
  await writeFile(resolve(outputRoot, name), contents, "utf8");
}

console.log(
  `[archive-doorway] generated Page 2627 package for ${publicationId} at asset commit ${assetCommit}; Edublogs was not modified.`
);
