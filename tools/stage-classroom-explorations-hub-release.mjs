import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { resolve } from "node:path";

const version = process.argv[2];
const rollbackRelease = process.argv[3] || null;
if (!version || !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(version)) {
  throw new Error("Usage: node tools/stage-classroom-explorations-hub-release.mjs YYYY.MM.DD.N [rollback-version]");
}

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const target = resolve(root, `releases/classroom-explorations-hub/${version}`);

await stat(resolve(dist, "bootstrap.js"));
await stat(resolve(dist, "assets/classroom-explorations-hub.js"));
await stat(resolve(dist, "assets/classroom-explorations-hub.css"));
await stat(resolve(dist, "hub.manifest.json"));

try {
  await access(target, constants.F_OK);
  throw new Error(`Release directory already exists and is immutable: ${target}`);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

await mkdir(target, { recursive: true });
await cp(dist, target, { recursive: true, force: false });

const manifest = JSON.parse(await readFile(resolve(target, "hub.manifest.json"), "utf8"));
const release = {
  schemaVersion: "1.0",
  release: version,
  pageSystem: "classroom-explorations-hub",
  contentVersion: manifest.contentVersion,
  sourceCommit: process.env.HRV_SOURCE_COMMIT || "SET_AT_RELEASE_COMMIT",
  assets: {
    bootstrap: "bootstrap.js",
    script: "assets/classroom-explorations-hub.js",
    style: "assets/classroom-explorations-hub.css",
    manifest: "hub.manifest.json"
  },
  rollbackRelease
};
await writeFile(resolve(target, "release.json"), `${JSON.stringify(release, null, 2)}\n`, "utf8");
console.log(`[classroom-explorations-hub] staged immutable release ${version}.`);
