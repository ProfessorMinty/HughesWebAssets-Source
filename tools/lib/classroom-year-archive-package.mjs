import { createHash } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve, join } from "node:path";
import { canonicalJson, sha256Text } from "./classroom-explorations-hub-contract.mjs";
import { YEAR_ARCHIVE_COMPILER, YearArchiveError, freezeYearArchive, validateFrozenYearArchive, projectYearArchiveRuntime, validateYearArchiveRuntime } from "./classroom-year-archive-v2.mjs";

const text = value => JSON.stringify(value, null, 2) + "\n";
const escape = value => String(value).replace(/[&<>"']/g, char => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char]);
const bytesHash = value => createHash("sha256").update(value).digest("hex");
const mediaTypes = { html: "text/html", css: "text/css", js: "text/javascript", json: "application/json", md: "text/markdown" };

export function archiveCandidateHtml(manifest, runtimeScript, stylesheet) {
  validateYearArchiveRuntime(manifest);
  const fallback = [...manifest.collections.explorations, ...manifest.collections.stories].map(item => `<article class="year-archive-card" data-content-id="${escape(item.id)}">${item.image ? `<img class="year-archive-image" src="${escape(item.image.src)}" alt="${escape(item.image.alt)}" loading="lazy" referrerpolicy="no-referrer">` : ""}<div class="year-archive-card-body"><h2>${escape(item.title)}</h2><p class="year-archive-summary">${escape(item.summary)}</p>${item.learningPoints?.length ? `<ul>${item.learningPoints.map(point => `<li>${escape(point)}</li>`).join("")}</ul>` : ""}<a href="${escape(item.href)}" target="_blank" rel="noopener noreferrer">Revisit this memory ↗</a></div></article>`).join("\n");
  const script = runtimeScript + `\nconst root = document.getElementById("year-archive-root");
mountYearArchive(root, JSON.parse(document.getElementById("archive-manifest").textContent)).catch(() => {
  const notice = document.createElement("p"); notice.setAttribute("role", "alert"); notice.textContent = "Interactive preview could not be verified. The saved static content remains below."; root.prepend(notice);
});\n`;
  const scriptHash = createHash("sha256").update(script).digest("base64");
  const payload = JSON.stringify(manifest).replace(/</g, "\\u003c");
  return `<!doctype html>
<html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="referrer" content="no-referrer"><meta http-equiv="Content-Security-Policy" content="default-src 'none'; img-src https: data:; style-src 'unsafe-inline'; script-src 'sha256-${scriptHash}'; base-uri 'none'; form-action 'none'">
<title>${escape(manifest.page.title)} · Private preview</title><style>${stylesheet}</style></head>
<body><main id="year-archive-root" class="year-archive"><aside class="year-archive-review">Private archive preview · Public installation is still pending</aside><header class="year-archive-hero"><p class="year-archive-eyebrow">Hughes Room Views · Our year of discovery</p><h1>${escape(manifest.page.schoolYearLabel)}</h1><p class="year-archive-intro">${escape(manifest.page.intro)}</p><p>${manifest.stats.explorations} Explorations · ${manifest.stats.stories} learning stories</p></header><div class="year-archive-grid">${fallback}</div><footer class="year-archive-footer"><a href="${escape(manifest.page.hubHref)}" target="_blank" rel="noopener noreferrer">Return to the Classroom Explorations Hub ↗</a></footer></main>
<script type="application/json" id="archive-manifest">${payload}</script><script type="module">${script}</script></body></html>\n`;
}

/** Deterministic, reviewable files. No credentials, source mutation, WordPress writes, or publication commands. */
export async function buildYearArchivePackage(inputs) {
  const frozen = freezeYearArchive(inputs);
  validateFrozenYearArchive(frozen, { hubSource: inputs.hubSource, registry: inputs.registry });
  const runtime = validateYearArchiveRuntime(projectYearArchiveRuntime(frozen));
  const [script, stylesheet] = await Promise.all([
    readFile(new URL("../../apps/classroom-explorations-archive-v2/src/runtime.js", import.meta.url), "utf8"),
    readFile(new URL("../../apps/classroom-explorations-archive-v2/src/archive.css", import.meta.url), "utf8"),
  ]);
  const installation = {
    schemaVersion: "hrv-year-archive-installation-candidate/2.0", compiler: YEAR_ARCHIVE_COMPILER,
    status: "pending-source-review-and-native-acceptance", publicationAvailable: false,
    sourceSnapshotId: frozen.snapshotId, runtimeSnapshotId: runtime.snapshotId,
    target: { stablePageId: frozen.page.id, schoolYear: frozen.page.schoolYear, relationshipId: frozen.page.relationshipId,
      routeRef: frozen.page.routeRef, proposedPath: frozen.page.proposedPath, wordpressPageId: null, wordpressParentPageId: 17,
      pageType: "page", template: "full-width", publicStatus: "not-provisioned" },
    protectedIdentities: { canonicalHubPageId: 17, reviewHubPageId: 2589, legacyArchivePageId: 2627,
      legacyArchivePath: "/hub/archive-2025-2026/", legacyContract: "classroom-explorations-archive/1.0" },
    requiredAcceptance: [
      "Review the additive v2 Source contract, compiler, renderer, and exact input source revision.",
      "Recompute the input, frozen-content, runtime, and artifact hashes; retain the prior known-good Hub publication.",
      "Create or select a distinct authenticated Edublogs Page under canonical Hub Page 17; bind its exact numeric identity and path.",
      "Stage the exact reviewed immutable artifacts and generate a doorway for that verified Page; no legacy 2025–2026 pin may change.",
      "Read back the saved native Page type, status, parent, slug, full-width template, and exact content; verify all artifact URLs and hashes.",
      "Verify signed-in preview and signed-out public rendering, membership counts, keyboard navigation, the Source-owned shared Reduced Effects preference, and every visitor destination. Full effects remain the default independently of OS preferences.",
      "Only then allow a source-revision-locked Hub archive relationship and school-year activation through review, approval, publication, and restore.",
    ],
    // A proposed path is planning data. It must never be treated as an existing route or publish-archive command.
    hubPublicationCommands: [], nativeDoorway: null,
  };
  const files = new Map([
    ["hub-source.input.json", text(inputs.hubSource)], ["routes.input.json", text(inputs.registry)],
    ["frozen-source.json", text(frozen)], ["manifest.json", text(runtime)],
    ["runtime.js", script], ["archive.css", stylesheet], ["preview.html", archiveCandidateHtml(runtime, script, stylesheet)],
    ["INSTALLATION.json", text(installation)],
    ["README.md", `# ${frozen.page.schoolYearLabel} archive candidate\n\nThis is a complete private review artifact, not a public installation. Open preview.html to inspect every recorded Exploration and learning story; the static version remains readable without JavaScript. The interactive renderer verifies the content hash before mounting.\n\nThe input source revision is supplied by the caller. The included input files, frozen content, runtime, and output bytes are hashed. GitHub commit identity and native Edublogs installation must be independently verified before release.\n\nARTIFACTS.json lists the exact package bytes and content address. INSTALLATION.json records the unassigned future Page and remaining acceptance. No paid service or AI request is needed to build or review this package. No public archive link, Page identity, or publication command is invented.\n\nThe original 2025–2026 archive, Page 2627, production Hub Page 17, and review Hub Page 2589 are unchanged.\n`],
  ]);
  const payload = { schemaVersion: "hrv-year-archive-artifacts/2.0", compiler: YEAR_ARCHIVE_COMPILER, publicationAvailable: false,
    schoolYear: frozen.page.schoolYear, sourceSnapshotId: frozen.snapshotId, runtimeSnapshotId: runtime.snapshotId,
    artifacts: [...files].map(([path, contents]) => ({ path, sha256: bytesHash(contents), bytes: Buffer.byteLength(contents), mediaType: mediaTypes[path.split(".").at(-1)] })) };
  const sha256 = sha256Text(canonicalJson(payload));
  const index = { ...payload, candidateId: `sha256:${sha256}` };
  files.set("ARTIFACTS.json", text(index));
  return { frozen, runtime, installation, index, sha256, files };
}

export async function writeYearArchivePackage(candidate, outputDirectory) {
  const directory = join(resolve(outputDirectory), candidate.frozen.page.schoolYear, candidate.sha256);
  await mkdir(directory, { recursive: true });
  for (const [name, contents] of candidate.files) {
    const path = join(directory, name);
    try { await writeFile(path, contents, { flag: "wx" }); }
    catch (error) {
      if (error.code !== "EEXIST") throw error;
      if (await readFile(path, "utf8") !== contents) throw new YearArchiveError("YEAR_ARCHIVE_IMMUTABLE_CONFLICT", `Existing candidate bytes differ: ${name}. No file was replaced.`);
    }
  }
  return directory;
}

export async function verifyYearArchivePackage(directory) {
  const root = resolve(directory), index = JSON.parse(await readFile(join(root, "ARTIFACTS.json"), "utf8"));
  const { candidateId, ...payload } = index;
  if (candidateId !== `sha256:${sha256Text(canonicalJson(payload))}` || index.schemaVersion !== "hrv-year-archive-artifacts/2.0" || index.publicationAvailable !== false)
    throw new YearArchiveError("YEAR_ARCHIVE_PACKAGE_CHANGED", "The archive package identity is invalid.");
  const seen = new Set();
  for (const entry of index.artifacts) {
    if (!/^[a-zA-Z][a-zA-Z0-9.-]+$/.test(entry.path) || seen.has(entry.path)) throw new YearArchiveError("YEAR_ARCHIVE_PACKAGE_PATH", "The archive package contains an invalid artifact path.");
    seen.add(entry.path);
    const bytes = await readFile(join(root, entry.path));
    if (bytes.length !== entry.bytes || bytesHash(bytes) !== entry.sha256) throw new YearArchiveError("YEAR_ARCHIVE_ARTIFACT_CHANGED", `Archive artifact changed: ${entry.path}.`);
  }
  const json = async name => JSON.parse(await readFile(join(root, name), "utf8"));
  const frozen = validateFrozenYearArchive(await json("frozen-source.json"), { hubSource: await json("hub-source.input.json"), registry: await json("routes.input.json") });
  const runtime = validateYearArchiveRuntime(await json("manifest.json"));
  if (canonicalJson(runtime) !== canonicalJson(projectYearArchiveRuntime(frozen)) || runtime.snapshotId !== index.runtimeSnapshotId || frozen.snapshotId !== index.sourceSnapshotId)
    throw new YearArchiveError("YEAR_ARCHIVE_PROJECTION_CHANGED", "The runtime no longer matches the complete frozen archive.");
  const rebuilt = await buildYearArchivePackage({ hubSource: await json("hub-source.input.json"), registry: await json("routes.input.json"), schoolYear: frozen.page.schoolYear, sourceRevision: frozen.provenance.sourceRevision });
  if (canonicalJson(index) !== canonicalJson(rebuilt.index))
    throw new YearArchiveError("YEAR_ARCHIVE_COMPILER_MISMATCH", "The artifacts do not match this exact reviewed candidate compiler. Rebuild or use the matching compiler version.");
  return { candidateId, schoolYear: frozen.page.schoolYear, stats: runtime.stats, publicationAvailable: false };
}
