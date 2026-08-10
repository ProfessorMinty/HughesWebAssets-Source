import { cp, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { constants } from "node:fs";
import { access } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";

const version = process.argv[2];
const rollbackRelease = process.argv[3] || null;
if (!version || !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(version)) {
  throw new Error("Usage: node tools/stage-classroom-explorations-hub-release.mjs YYYY.MM.DD.N [rollback-version]");
}

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const target = resolve(root, `releases/classroom-explorations-hub/${version}`);

const required = {
  bootstrap: resolve(dist, "bootstrap.js"),
  script: resolve(dist, "assets/classroom-explorations-hub.js"),
  style: resolve(dist, "assets/classroom-explorations-hub.css"),
  content: resolve(dist, "hub.manifest.json"),
};

await Promise.all(Object.values(required).map((file) => stat(file)));

try {
  await access(target, constants.F_OK);
  throw new Error(`Release directory already exists and is immutable: ${target}`);
} catch (error) {
  if (error?.code !== "ENOENT") throw error;
}

await mkdir(target, { recursive: true });
await cp(dist, target, { recursive: true, force: false });

async function sha256(file) {
  return createHash("sha256").update(await readFile(file)).digest("hex");
}

const manifest = JSON.parse(await readFile(resolve(target, "hub.manifest.json"), "utf8"));
const release = {
  schemaVersion: "1.0",
  release: version,
  pageSystem: "classroom-explorations-hub",
  contentVersion: manifest.contentVersion,
  sourceCommit: process.env.HRV_SOURCE_COMMIT || "SET_AT_RELEASE_COMMIT",
  minimumBootstrapVersion: "0.2.0",
  deploymentReady: true,
  route: {
    id: "classroom-explorations",
    path: "/classroom-explorations/",
    mount: "hrv-classroom-explorations-root",
    pageSystem: "classroom-explorations-hub",
    schemaVersion: "1.0"
  },
  assets: {
    bootstrap: {
      path: "bootstrap.js",
      type: "classic",
      sha256: await sha256(resolve(target, "bootstrap.js"))
    },
    script: {
      path: "assets/classroom-explorations-hub.js",
      type: "module",
      sha256: await sha256(resolve(target, "assets/classroom-explorations-hub.js"))
    },
    style: {
      path: "assets/classroom-explorations-hub.css",
      sha256: await sha256(resolve(target, "assets/classroom-explorations-hub.css"))
    },
    content: {
      path: "hub.manifest.json",
      schemaVersion: manifest.schemaVersion,
      sha256: await sha256(resolve(target, "hub.manifest.json"))
    }
  },
  rollbackRelease
};

await writeFile(resolve(target, "release.json"), `${JSON.stringify(release, null, 2)}\n`, "utf8");
console.log(`[classroom-explorations-hub] staged immutable release ${version} with route-aware release manifest.`);
