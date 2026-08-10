import { readFile } from "node:fs/promises";
import { resolve } from "node:path";

const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const runtimePath = resolve(dist, "assets/classroom-explorations-hub.js");
const runtime = await readFile(runtimePath, "utf8");

const failures = [];

if (runtime.includes('manifestUrl:`/hub.manifest.json`') || runtime.includes('manifestUrl:"/hub.manifest.json"')) {
  failures.push("runtime contains an Edublogs-root /hub.manifest.json auto-mount");
}

if (/mountClassroomExplorationsHub\([^)]*querySelector\([^)]*hrv-classroom-explorations-root/.test(runtime)) {
  failures.push("runtime appears to auto-mount itself instead of waiting for bootstrap ownership");
}

if (!runtime.includes("mountClassroomExplorationsHub")) {
  failures.push("runtime export name is missing from the production bundle");
}

if (failures.length) {
  throw new Error(`[classroom-explorations-hub] dist verification failed:\n- ${failures.join("\n- ")}`);
}

console.log("[classroom-explorations-hub] dist verification passed: bootstrap is the sole mount owner.");
