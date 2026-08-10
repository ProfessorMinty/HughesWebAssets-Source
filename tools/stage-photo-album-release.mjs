import { createHash } from "node:crypto";
import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import { join } from "node:path";
import { fileURLToPath } from "node:url";

const releaseId = process.argv[2];
if (!releaseId || !/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(releaseId)) {
  throw new Error("Provide a release identifier such as 2026.08.10.1.");
}

const repositoryRoot = fileURLToPath(new URL("../", import.meta.url));
const buildRoot = join(repositoryRoot, "dist", "photo-album");
const releaseRoot = join(repositoryRoot, "releases", "photo-album", releaseId);

if (!existsSync(buildRoot)) {
  throw new Error("Build output is missing. Run npm run build first.");
}
if (existsSync(releaseRoot)) {
  throw new Error(`Release ${releaseId} already exists and is immutable.`);
}

const artifacts = [
  ["bootstrap.js", "bootstrap.js"],
  ["index.html", "index.html"],
  ["assets/photo-album.css", "assets/photo-album.css"],
  ["assets/photo-album.js", "assets/photo-album.js"],
  ["assets/photo-album.js.map", "assets/photo-album.js.map"],
];

await mkdir(join(releaseRoot, "assets"), { recursive: true });

const releaseManifest = {
  application: "hughes-room-views-photo-album",
  releaseId,
  manifestContract: 1,
  sourceRepository: "ProfessorMinty/HughesWebAssets-Source",
  artifacts: [],
};

for (const [sourcePath, destinationPath] of artifacts) {
  const source = join(buildRoot, ...sourcePath.split("/"));
  const destination = join(releaseRoot, ...destinationPath.split("/"));
  await copyFile(source, destination);
  const bytes = await readFile(destination);
  const metadata = await stat(destination);
  releaseManifest.artifacts.push({
    path: destinationPath,
    bytes: metadata.size,
    sha256: createHash("sha256").update(bytes).digest("hex"),
  });
}

await writeFile(
  join(releaseRoot, "release.json"),
  `${JSON.stringify(releaseManifest, null, 2)}\n`,
  "utf8",
);

console.log(`Staged immutable Photo Album release ${releaseId}.`);
console.log(`Release path: releases/photo-album/${releaseId}`);
