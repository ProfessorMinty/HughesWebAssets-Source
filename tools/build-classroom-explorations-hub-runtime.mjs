import { copyFile, mkdir, readFile, readdir, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
const root = fileURLToPath(new URL("..", import.meta.url));
const src = resolve(root, "apps/classroom-explorations-hub/src");
const out = resolve(root, "dist/classroom-explorations-hub/runtime");
const artwork = {
  pastExplorations: { path: "assets/history/past-explorations.webp", mediaType: "image/webp" },
  pastTwwl: { path: "assets/history/past-twwl.webp", mediaType: "image/webp" },
  pastYears: { path: "assets/history/past-years.webp", mediaType: "image/webp" },
  frameTopLeft: { path: "assets/frame/top-left.webp", mediaType: "image/webp" },
  frameTopRight: { path: "assets/frame/top-right.webp", mediaType: "image/webp" },
  frameMiddleLeft: { path: "assets/frame/middle-left.webp", mediaType: "image/webp" },
  frameMiddleRight: { path: "assets/frame/middle-right.webp", mediaType: "image/webp" },
  frameBottomLeft: { path: "assets/frame/bottom-left.webp", mediaType: "image/webp" },
  frameBottomRight: { path: "assets/frame/bottom-right.webp", mediaType: "image/webp" }
};

const listFiles = async (directory, prefix = "") => {
  const files = [];
  const entries = (await readdir(directory, { withFileTypes: true }))
    .sort((left, right) => left.name < right.name ? -1 : left.name > right.name ? 1 : 0);

  for (const entry of entries) {
    const relativePath = prefix ? `${prefix}/${entry.name}` : entry.name;
    const absolutePath = resolve(directory, entry.name);
    if (entry.isDirectory()) files.push(...await listFiles(absolutePath, relativePath));
    else if (entry.isFile()) files.push(relativePath);
    else throw new Error(`Unsupported Hub runtime asset entry: ${relativePath}`);
  }

  return files;
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });
for (const name of ["bootstrap.js", "runtime.js", "hub.css", "host-compat.css"]) await copyFile(resolve(src, name), resolve(out, name));

const artworkFiles = await listFiles(resolve(src, "assets"), "assets");
const declaredArtworkFiles = Object.values(artwork).map((entry) => entry.path).sort();
if (artworkFiles.join("|") !== declaredArtworkFiles.join("|")) {
  throw new Error("Hub runtime artwork files must exactly match the declared artwork map.");
}
for (const name of artworkFiles) {
  const destination = resolve(out, name);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(src, name), destination);
}

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
  },
  artwork: Object.fromEntries(await Promise.all(Object.entries(artwork).map(async ([name, entry]) => [
    name,
    { path: entry.path, sha256: await digest(entry.path), mediaType: entry.mediaType }
  ])))
};
await writeFile(resolve(out, "runtime-release.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log("[hub] runtime build ready");
