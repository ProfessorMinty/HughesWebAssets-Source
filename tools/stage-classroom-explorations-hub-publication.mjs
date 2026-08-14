import { copyFile, mkdir, readFile, stat, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { resolve } from "node:path";
const [runtimeVersion, publicationId, sourceRevision, previousPublicationId = "none"] = process.argv.slice(2);
if (!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(runtimeVersion || "")) throw new Error("runtimeVersion must be YYYY.MM.DD.N");
if (!/^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(publicationId || "")) throw new Error("publicationId must be pub-YYYY-MM-DD-NNN");
if (!/^[a-f0-9]{40}$/.test(sourceRevision || "")) throw new Error("sourceRevision must be a 40-character Git commit SHA");
if (previousPublicationId !== "none" && !/^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(previousPublicationId)) throw new Error("previousPublicationId must be none or pub-YYYY-MM-DD-NNN");
const root = resolve(new URL("..", import.meta.url).pathname);
const dist = resolve(root, "dist/classroom-explorations-hub");
const runtimeTarget = resolve(root, `releases/classroom-explorations-hub/runtime/${runtimeVersion}`);
const snapshot = JSON.parse(await readFile(resolve(dist, "content-snapshot.json"), "utf8"));
const hash = snapshot.snapshotId.slice("sha256:".length);
const contentTarget = resolve(root, `releases/classroom-explorations-hub/content/${hash}`);
const pubTarget = resolve(root, `releases/classroom-explorations-hub/publications/${publicationId}`);
const exists = async (path) => { try { await stat(path); return true; } catch (e) { if (e.code === "ENOENT") return false; throw e; } };
if (await exists(runtimeTarget)) throw new Error(`Immutable runtime already exists: ${runtimeTarget}`);
if (await exists(pubTarget)) throw new Error(`Immutable publication already exists: ${pubTarget}`);
await mkdir(runtimeTarget, { recursive: true });
await mkdir(pubTarget, { recursive: true });
for (const name of ["bootstrap.js", "runtime.js", "hub.css", "host-compat.css", "runtime-release.json"]) await copyFile(resolve(dist, "runtime", name), resolve(runtimeTarget, name));
const incomingManifest = resolve(dist, snapshot.manifestPath);
if (!(await exists(contentTarget))) {
  await mkdir(contentTarget, { recursive: true });
  await copyFile(incomingManifest, resolve(contentTarget, "manifest.json"));
}
const digest = async (path) => createHash("sha256").update(await readFile(path)).digest("hex");
if (await digest(incomingManifest) !== await digest(resolve(contentTarget, "manifest.json"))) throw new Error("Existing immutable content snapshot does not match deterministic build output.");
const publication = {
  schemaVersion: "1.0",
  publicationId,
  pageId: "hrv-page:classroom-explorations",
  pageType: "classroom-explorations-hub",
  sourceRevision,
  previousKnownGoodPublication: previousPublicationId === "none" ? null : previousPublicationId,
  runtime: {
    version: runtimeVersion,
    runtimeSchemaVersion: "1.0",
    bootstrap: { path: `../../runtime/${runtimeVersion}/bootstrap.js`, sha256: await digest(resolve(runtimeTarget, "bootstrap.js")) },
    script: { path: `../../runtime/${runtimeVersion}/runtime.js`, sha256: await digest(resolve(runtimeTarget, "runtime.js")) },
    style: { path: `../../runtime/${runtimeVersion}/hub.css`, sha256: await digest(resolve(runtimeTarget, "hub.css")) },
    hostCompat: { path: `../../runtime/${runtimeVersion}/host-compat.css`, sha256: await digest(resolve(runtimeTarget, "host-compat.css")) }
  },
  content: {
    snapshotId: snapshot.snapshotId,
    runtimeSchemaVersion: "1.0",
    manifest: { path: `../../content/${hash}/manifest.json`, sha256: await digest(resolve(contentTarget, "manifest.json")) }
  }
};
await writeFile(resolve(pubTarget, "publication.json"), `${JSON.stringify(publication, null, 2)}\n`, "utf8");
console.log(`[hub] staged immutable publication ${publicationId}; previous known good = ${publication.previousKnownGoodPublication ?? "none (new baseline)"}`);
