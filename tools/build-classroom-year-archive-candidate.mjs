import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import { resolve } from "node:path";
import { buildYearArchivePackage, writeYearArchivePackage, verifyYearArchivePackage } from "./lib/classroom-year-archive-package.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const args = process.argv.slice(2), options = {};
for (let index = 0; index < args.length; index += 2) {
  const name = args[index];
  if (!["--year", "--source-revision", "--hub-source", "--routes", "--out"].includes(name) || !args[index + 1] || args[index + 1].startsWith("--") || options[name])
    throw new Error("Use --year YYYY-YYYY --source-revision <40-character SHA> [--hub-source file] [--routes file] [--out directory].");
  options[name] = args[index + 1];
}
if (!options["--year"] || !options["--source-revision"]) throw new Error("An explicit school year and exact input Source revision are required.");
async function json(path) {
  const bytes = await readFile(path);
  if (bytes.length > 2_000_000) throw new Error("Archive input exceeds the bounded review size.");
  return JSON.parse(bytes.toString("utf8"));
}
const [hubSource, registry] = await Promise.all([
  json(resolve(root, options["--hub-source"] ?? "apps/classroom-explorations-hub/source/hub.source.json")),
  json(resolve(root, options["--routes"] ?? "registry/hrv-routes.source.json")),
]);
const candidate = await buildYearArchivePackage({ hubSource, registry, schoolYear: options["--year"], sourceRevision: options["--source-revision"] });
const directory = await writeYearArchivePackage(candidate, resolve(root, options["--out"] ?? "dist/year-archive-candidates"));
console.log(JSON.stringify({ directory, ...await verifyYearArchivePackage(directory) }, null, 2));
