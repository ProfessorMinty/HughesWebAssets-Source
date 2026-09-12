import { copyFile, mkdir, readFile, rm, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = fileURLToPath(new URL("..", import.meta.url));
const archiveSource = resolve(root, "apps/classroom-explorations-archive/src");
const hubSource = resolve(root, "apps/classroom-explorations-hub/src");
const out = resolve(root, "dist/classroom-explorations-archive/runtime");

const artwork = {
  pastYears: {
    path: "assets/history/past-years.webp",
    source: "assets/history/past-years.webp",
    mediaType: "image/webp"
  },
  frameTopLeft: { path: "assets/frame/top-left.webp", source: "assets/frame/top-left.webp", mediaType: "image/webp" },
  frameTopRight: { path: "assets/frame/top-right.webp", source: "assets/frame/top-right.webp", mediaType: "image/webp" },
  frameMiddleLeft: { path: "assets/frame/middle-left.webp", source: "assets/frame/middle-left.webp", mediaType: "image/webp" },
  frameMiddleRight: { path: "assets/frame/middle-right.webp", source: "assets/frame/middle-right.webp", mediaType: "image/webp" },
  frameBottomLeft: { path: "assets/frame/bottom-left.webp", source: "assets/frame/bottom-left.webp", mediaType: "image/webp" },
  frameBottomRight: { path: "assets/frame/bottom-right.webp", source: "assets/frame/bottom-right.webp", mediaType: "image/webp" }
};

await rm(out, { recursive: true, force: true });
await mkdir(out, { recursive: true });

for (const name of ["bootstrap.js", "runtime.js", "host-compat.css"]) {
  await copyFile(resolve(archiveSource, name), resolve(out, name));
}

const sharedCss = await readFile(resolve(hubSource, "hub.css"), "utf8");
const archiveCss = await readFile(resolve(archiveSource, "archive.css"), "utf8");
if (/@import\b/i.test(sharedCss + archiveCss)) {
  throw new Error("Archive runtime styles must remain import-free.");
}
await writeFile(
  resolve(out, "archive.css"),
  `/* Approved Classroom Explorations shared visual foundation. */\n${sharedCss.trimEnd()}\n\n/* 2025-2026 archive composition. */\n${archiveCss.trimEnd()}\n`,
  "utf8"
);

for (const entry of Object.values(artwork)) {
  const destination = resolve(out, entry.path);
  await mkdir(dirname(destination), { recursive: true });
  await copyFile(resolve(hubSource, entry.source), destination);
}

const digest = async (name) => createHash("sha256")
  .update(await readFile(resolve(out, name)))
  .digest("hex");

const manifest = {
  schemaVersion: "1.0",
  pageId: "hrv-page:classroom-explorations-archive-2025-2026",
  pageType: "classroom-explorations-archive",
  runtimeSchemaVersion: "1.0",
  assets: {
    bootstrap: { path: "bootstrap.js", sha256: await digest("bootstrap.js") },
    script: { path: "runtime.js", sha256: await digest("runtime.js") },
    style: { path: "archive.css", sha256: await digest("archive.css") },
    hostCompat: { path: "host-compat.css", sha256: await digest("host-compat.css") }
  },
  artwork: Object.fromEntries(await Promise.all(Object.entries(artwork).map(async ([name, entry]) => [
    name,
    { path: entry.path, sha256: await digest(entry.path), mediaType: entry.mediaType }
  ])))
};

await writeFile(resolve(out, "runtime-release.json"), `${JSON.stringify(manifest, null, 2)}\n`, "utf8");
console.log("[archive] runtime build ready");
