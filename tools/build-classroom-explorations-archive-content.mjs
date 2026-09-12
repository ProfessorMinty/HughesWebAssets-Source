import { mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

import { validateSchema } from "./lib/json-schema-lite.mjs";
import {
  projectArchiveRuntime,
  validateArchiveAuthoringCompatibility,
  validateArchiveRuntimeCompatibility
} from "./lib/classroom-explorations-archive-contract.mjs";
import {
  validateAuthoringCompatibility,
  validateRouteRegistryCompatibility
} from "./lib/classroom-explorations-hub-contract.mjs";

const root = fileURLToPath(new URL("..", import.meta.url));
const readJson = async (path) => JSON.parse(await readFile(resolve(root, path), "utf8"));

const archiveSource = await readJson(
  "apps/classroom-explorations-archive/source/archive-2025-2026.source.json"
);
const hubSource = await readJson("apps/classroom-explorations-hub/source/hub.source.json");
const routes = await readJson("registry/hrv-routes.source.json");

validateArchiveAuthoringCompatibility(archiveSource);
validateAuthoringCompatibility(hubSource);
validateRouteRegistryCompatibility(routes);
validateSchema(archiveSource, await readJson("schemas/hrv-page-envelope.schema.json"));
validateSchema(
  archiveSource.data,
  await readJson("schemas/classroom-explorations-archive.source.schema.json"),
  "$.data"
);
validateSchema(hubSource, await readJson("schemas/hrv-page-envelope.schema.json"));
validateSchema(
  hubSource.data,
  await readJson("schemas/classroom-explorations-hub.source.schema.json"),
  "$.data"
);
validateSchema(routes, await readJson("schemas/hrv-route-registry.schema.json"));

const runtime = projectArchiveRuntime(archiveSource, hubSource, routes);
validateSchema(runtime, await readJson("schemas/classroom-explorations-archive.runtime.schema.json"));
validateArchiveRuntimeCompatibility(runtime);

const hash = runtime.snapshotId.slice("sha256:".length);
const contentRoot = resolve(root, "dist/classroom-explorations-archive/content");
const manifestPath = `content/${hash}/manifest.json`;
const manifestOut = resolve(root, "dist/classroom-explorations-archive", manifestPath);

await rm(contentRoot, { recursive: true, force: true });
await mkdir(dirname(manifestOut), { recursive: true });
await writeFile(manifestOut, `${JSON.stringify(runtime, null, 2)}\n`, "utf8");
await writeFile(
  resolve(root, "dist/classroom-explorations-archive/content-snapshot.json"),
  `${JSON.stringify({
    schemaVersion: "1.0",
    snapshotId: runtime.snapshotId,
    manifestPath,
    canonicalSha256: hash
  }, null, 2)}\n`,
  "utf8"
);

console.log(`[archive] content snapshot ${runtime.snapshotId}`);
console.log(`[archive] ${runtime.stats.explorations} Explorations + ${runtime.stats.twwl} TWWL stories`);
