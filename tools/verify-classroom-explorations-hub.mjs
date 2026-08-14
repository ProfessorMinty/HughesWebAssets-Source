import { access, readFile } from "node:fs/promises";
import { resolve } from "node:path";
const root = resolve(new URL("..", import.meta.url).pathname);
for (const p of [
  "dist/classroom-explorations-hub/runtime/bootstrap.js",
  "dist/classroom-explorations-hub/runtime/runtime.js",
  "dist/classroom-explorations-hub/runtime/hub.css",
  "dist/classroom-explorations-hub/runtime/host-compat.css",
  "dist/classroom-explorations-hub/runtime/runtime-release.json",
  "dist/classroom-explorations-hub/content-snapshot.json"
]) await access(resolve(root, p));
const bootstrap = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/bootstrap.js"), "utf8");
const runtime = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/runtime.js"), "utf8");
const css = await readFile(resolve(root, "dist/classroom-explorations-hub/runtime/hub.css"), "utf8");
if (/museum-lantern-zone|reef-feature|zinnia-feature|archive-portal-room|classroom-explorations-hub\.schema\.json/.test(bootstrap + runtime + css)) throw new Error("Rejected modernization implementation token leaked into clean runtime.");
if (!bootstrap.includes("dataset.publication")) throw new Error("Bootstrap publication handoff missing.");
if (!runtime.includes("data-effects") && !css.includes("data-effects")) throw new Error("Reduced Effects contract missing.");
console.log("[hub verify] clean runtime artifact set verified");
