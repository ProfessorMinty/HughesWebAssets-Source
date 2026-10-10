import { readFile, readdir } from "node:fs/promises";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateSchema } from "./lib/json-schema-lite.mjs";
import {
  calculateArchiveSnapshotId,
  validateArchiveRuntimeCompatibility
} from "./lib/classroom-explorations-archive-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const distRoot = resolve(root, "dist/classroom-explorations-archive");
const readJson = async (path) => JSON.parse(await readFile(resolve(distRoot, path), "utf8"));

async function listFiles(directory, prefix = "") {
  const entries = await readdir(directory, { withFileTypes: true });
  const files = [];
  for (const entry of entries.sort((a, b) => a.name.localeCompare(b.name))) {
    const relative = prefix ? `${prefix}/${entry.name}` : entry.name;
    if (entry.isDirectory()) files.push(...await listFiles(resolve(directory, entry.name), relative));
    else files.push(relative);
  }
  return files;
}

const snapshot = await readJson("content-snapshot.json");
if (
  snapshot.schemaVersion !== "1.0" ||
  !/^sha256:[a-f0-9]{64}$/.test(snapshot.snapshotId || "") ||
  !/^[a-f0-9]{64}$/.test(snapshot.canonicalSha256 || "")
) {
  throw new Error("Archive content-snapshot.json is structurally incompatible.");
}

const expectedHash = snapshot.snapshotId.slice("sha256:".length);
const expectedManifestPath = `content/${expectedHash}/manifest.json`;
if (
  snapshot.canonicalSha256 !== expectedHash ||
  snapshot.manifestPath !== expectedManifestPath
) {
  throw new Error("Archive content snapshot pointers do not agree with the immutable snapshot identity.");
}

const manifest = await readJson(snapshot.manifestPath);
validateSchema(
  manifest,
  JSON.parse(await readFile(resolve(root, "schemas/classroom-explorations-archive.runtime.schema.json"), "utf8"))
);
validateArchiveRuntimeCompatibility(manifest);

if (manifest.snapshotId !== snapshot.snapshotId) {
  throw new Error("Archive manifest and content pointer identify different snapshots.");
}
if (calculateArchiveSnapshotId(manifest) !== snapshot.snapshotId) {
  throw new Error("Archive manifest canonical bytes do not match the declared snapshot identity.");
}

const contentFiles = await listFiles(resolve(distRoot, "content"));
const expectedContentFiles = [`${expectedHash}/manifest.json`];
if (
  contentFiles.length !== expectedContentFiles.length ||
  !expectedContentFiles.every((path) => contentFiles.includes(path))
) {
  throw new Error(`Unexpected immutable archive content artifact set: ${contentFiles.join(", ")}`);
}

const butterflies = manifest.collections.explorations.find(
  (item) => item.id === "butterflies-in-the-classroom"
);
if (butterflies?.href !== "https://rmhughes.edublogs.org/hub/exploration-butterflies/") {
  throw new Error("Archive manifest does not preserve the canonical Butterflies destination.");
}

console.log("[archive verify] clean immutable content artifact set verified");
console.log(`[archive verify] snapshot ${snapshot.snapshotId}`);
console.log(`[archive verify] ${manifest.stats.explorations} Explorations + ${manifest.stats.twwl} TWWL stories`);
