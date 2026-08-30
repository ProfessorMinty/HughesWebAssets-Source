import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const src = resolve(root, "apps/classroom-explorations-hub/src");
const out = resolve(root, "dist/classroom-explorations-hub/runtime");
await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ["bootstrap.js", "runtime.js", "hub.css", "host-compat.css"]) await copyFile(resolve(src, name), resolve(out, name));
const digest = async (name) => createHash("sha256").update(await readFile(resolve(out, name))).digest("hex");
const manifest = {
  schemaVersion: "1.0",
  pageId: "hrv-page:classroom-explorations",
  pageType: "classroom-explorations-hub",
  runtimeSchemaVersion: "1.0",
  assets: {
    bootstrap: { path: "bootstrap.js", sha256: await digest("bootstrap.js") },
    script: { path: "runtime.js", sha256: await digest("runtime.js") },
    style: { path: "hub.css", sha256: await digest("hub.css") },
    hostCompat: { path: "host-compat.css", sha256: await digest("host-compat.css") }
  }
};
await writeFile(resolve(out, "runtime-release.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log("[hub] runtime build ready");
