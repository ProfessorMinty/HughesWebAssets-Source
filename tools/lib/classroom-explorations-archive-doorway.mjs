import { createHash } from "node:crypto";
import { execFile } from "node:child_process";
import { readFile, stat } from "node:fs/promises";
import { dirname, isAbsolute, relative, resolve, sep } from "node:path";
import { posix } from "node:path";
import { promisify } from "node:util";
import vm from "node:vm";
import { fileURLToPath } from "node:url";

const execFileAsync = promisify(execFile);

export const REPOSITORY_ROOT = fileURLToPath(new URL("../..", import.meta.url));
export const PAGE_ID = "hrv-page:classroom-explorations-archive-2025-2026";
export const PAGE_TYPE = "classroom-explorations-archive";
export const MOUNT_ID = "hrv-classroom-explorations-archive-root";
export const WORDPRESS_PAGE_ID = 2627;
export const RELEASE_REPOSITORY = "ProfessorMinty/HughesWebAssets-Source";
export const RELEASE_DIRECTORY = "releases/classroom-explorations-archive";
export const DEFAULT_RELEASE_ROOT = resolve(REPOSITORY_ROOT, RELEASE_DIRECTORY);
export const DEFAULT_DOORWAY_ROOT = resolve(
  REPOSITORY_ROOT,
  "docs/edublogs-integration/classroom-explorations-archive/2025-2026"
);

const TEMPLATE_TOKENS = [
  "__ASSET_COMMIT__",
  "__RUNTIME_VERSION__",
  "__PUBLICATION_ID__",
  "__BOOTSTRAP_SRI__"
];
const ARTWORK_PATHS = {
  pastYears: "assets/history/past-years.webp",
  frameTopLeft: "assets/frame/top-left.webp",
  frameTopRight: "assets/frame/top-right.webp",
  frameMiddleLeft: "assets/frame/middle-left.webp",
  frameMiddleRight: "assets/frame/middle-right.webp",
  frameBottomLeft: "assets/frame/bottom-left.webp",
  frameBottomRight: "assets/frame/bottom-right.webp"
};

const assert = (condition, message) => {
  if (!condition) throw new Error(message);
};
const sortedKeys = (value) => Object.keys(value || {}).sort().join("|");
const expectedKeys = (value) => Object.keys(value).sort().join("|");
const countText = (text, needle) => text.split(needle).length - 1;
export const sha256 = (bytes) => createHash("sha256").update(bytes).digest("hex");
export const sha256Sri = (bytes) => `sha256-${createHash("sha256").update(bytes).digest("base64")}`;

export function validateCoordinates(runtimeVersion, publicationId, assetCommit) {
  assert(/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(runtimeVersion || ""), "runtimeVersion must be YYYY.MM.DD.N");
  assert(
    /^pub-[0-9]{4}-[0-9]{2}-[0-9]{2}-[0-9]{3}$/.test(publicationId || ""),
    "publicationId must be pub-YYYY-MM-DD-NNN"
  );
  assert(/^[a-f0-9]{40}$/.test(assetCommit || ""), "assetCommit must be a full lowercase 40-character Git commit SHA");
}

export async function loadDoorwayTemplates(templateRoot = DEFAULT_DOORWAY_ROOT) {
  const [html, css, javascriptTemplate] = await Promise.all([
    readFile(resolve(templateRoot, "HTML-BOX.html"), "utf8"),
    readFile(resolve(templateRoot, "CSS-BOX.css"), "utf8"),
    readFile(resolve(templateRoot, "JAVASCRIPT-BOX.template.js"), "utf8")
  ]);
  validateDoorwayTemplates({ html, css, javascriptTemplate });
  return { html, css, javascriptTemplate };
}

export function validateDoorwayTemplates({ html, css, javascriptTemplate }) {
  assert(countText(html, `id="${MOUNT_ID}"`) === 1, "Archive doorway HTML must contain exactly one mount ID.");
  assert(countText(html.toLowerCase(), "<h1") === 1, "Archive doorway fallback must contain exactly one H1.");
  assert(!/<(?:script|style)\b/i.test(html), "Archive doorway HTML must not contain inline script or style elements.");
  assert(html.includes(`data-hrv-page="${PAGE_ID}"`), "Archive doorway HTML has the wrong page identity.");
  assert(html.includes("data-hrv-outage-notice"), "Archive doorway HTML is missing its truthful fallback notice.");
  assert(
    html.includes('href="https://rmhughes.edublogs.org/hub/"'),
    "Archive doorway fallback must retain the canonical return-to-Hub link."
  );
  assert(!/Caterpillars in the Classroom/i.test(html), "Archive doorway fallback must not preserve the known-wrong Caterpillars destination.");

  const cssWithoutComments = css.replace(/\/\*[\s\S]*?\*\//g, "");
  assert(!/@import\b/i.test(cssWithoutComments), "Archive doorway CSS must not import application styles.");
  assert(!/url\s*\(/i.test(cssWithoutComments), "Archive doorway CSS must not load external assets.");
  const ruleHeaders = [...cssWithoutComments.matchAll(/([^{}]+)\{/g)].map((match) => match[1].trim());
  for (const header of ruleHeaders) {
    if (header.startsWith("@media")) continue;
    assert(!header.startsWith("@"), `Unsupported global CSS rule in archive doorway: ${header}`);
    for (const selector of header.split(",").map((value) => value.trim())) {
      assert(
        selector.startsWith(`body.page-id-${WORDPRESS_PAGE_ID} #${MOUNT_ID}`),
        `Archive doorway CSS selector escapes Page 2627 fallback scope: ${selector}`
      );
    }
  }
  for (const forbidden of ["#content", ".site-content", "#primary", "#secondary", "#masthead", "#colophon", ".widget-area"]) {
    assert(!css.includes(forbidden), `Archive doorway CSS must leave host compatibility to the repository runtime: ${forbidden}`);
  }

  for (const token of TEMPLATE_TOKENS) {
    assert(countText(javascriptTemplate, token) === 1, `Archive doorway JavaScript template must contain ${token} exactly once.`);
  }
  assert(javascriptTemplate.includes(`var MOUNT_ID = "${MOUNT_ID}";`), "Archive doorway JavaScript has the wrong mount ID.");
  assert(javascriptTemplate.includes(`var PAGE_ID = "${PAGE_ID}";`), "Archive doorway JavaScript has the wrong page ID.");
  assert(javascriptTemplate.includes("bootstrap.integrity = BOOTSTRAP_INTEGRITY;"), "Archive doorway JavaScript must apply bootstrap SRI.");
  assert(javascriptTemplate.includes('bootstrap.crossOrigin = "anonymous";'), "Archive doorway JavaScript must set anonymous CORS for SRI.");
  assert(javascriptTemplate.includes('"data-publication"'), "Archive doorway JavaScript must pass an exact publication URL.");
  new vm.Script(javascriptTemplate.replaceAll("__ASSET_COMMIT__", "a".repeat(40))
    .replaceAll("__RUNTIME_VERSION__", "2026.09.12.1")
    .replaceAll("__PUBLICATION_ID__", "pub-2026-09-12-001")
    .replaceAll("__BOOTSTRAP_SRI__", `sha256-${"A".repeat(43)}=`));
}

const runGit = async (gitRoot, args, encoding = "utf8") => {
  const { stdout } = await execFileAsync(
    "git",
    ["-c", `safe.directory=${gitRoot}`, ...args],
    { cwd: gitRoot, encoding, maxBuffer: 32 * 1024 * 1024 }
  );
  return stdout;
};

const gitPathFor = (gitRoot, absolutePath) => {
  const path = relative(gitRoot, absolutePath);
  assert(path && !path.startsWith(`..${sep}`) && path !== ".." && !isAbsolute(path), `Release path is outside Git root: ${absolutePath}`);
  return path.split(sep).join("/");
};

const committedFile = async (gitRoot, commit, gitPath) => {
  const treeBytes = await runGit(
    gitRoot,
    ["ls-tree", "-z", "--full-tree", commit, "--", gitPath],
    null
  );
  const records = Buffer.from(treeBytes).toString("utf8").split("\0").filter(Boolean);
  assert(records.length === 1, `Committed archive file is missing or ambiguous: ${gitPath}`);
  const separator = records[0].indexOf("\t");
  assert(separator >= 0, `Git returned a malformed tree record for ${gitPath}.`);
  const [mode, type, objectId] = records[0].slice(0, separator).split(" ");
  const returnedPath = records[0].slice(separator + 1);
  assert(returnedPath === gitPath, `Git returned the wrong committed archive path for ${gitPath}.`);
  assert(
    mode === "100644" && type === "blob" && /^[a-f0-9]{40,64}$/.test(objectId || ""),
    `Committed archive path is not a regular file: ${gitPath}`
  );
  const bytes = await runGit(gitRoot, ["cat-file", "blob", objectId], null);
  return Buffer.isBuffer(bytes) ? bytes : Buffer.from(bytes);
};

const validateReleaseEntry = (entry, expectedPath, label) => {
  assert(entry && typeof entry === "object", `Archive publication is missing ${label}.`);
  assert(entry.path === expectedPath, `Archive publication ${label} path is not deterministic.`);
  assert(/^[a-f0-9]{64}$/.test(entry.sha256 || ""), `Archive publication ${label} SHA-256 is invalid.`);
};

export async function verifyReleaseAtCommit({
  runtimeVersion,
  publicationId,
  assetCommit,
  releaseRoot = DEFAULT_RELEASE_ROOT,
  gitRoot = REPOSITORY_ROOT
}) {
  validateCoordinates(runtimeVersion, publicationId, assetCommit);
  const resolvedCommit = String(await runGit(gitRoot, ["rev-parse", "--verify", `${assetCommit}^{commit}`])).trim();
  assert(resolvedCommit === assetCommit, "assetCommit did not resolve to the exact supplied commit.");
  try {
    await runGit(gitRoot, ["merge-base", "--is-ancestor", assetCommit, "HEAD"]);
  } catch {
    throw new Error("assetCommit must be an ancestor of the current repository HEAD.");
  }

  const publicationPath = resolve(releaseRoot, "publications", publicationId, "publication.json");
  const publicationGitPath = gitPathFor(gitRoot, publicationPath);
  const [localPublicationBytes, commitPublicationBytes] = await Promise.all([
    readFile(publicationPath),
    committedFile(gitRoot, assetCommit, publicationGitPath)
  ]);
  assert(
    localPublicationBytes.equals(commitPublicationBytes),
    "Local archive publication differs from the exact bytes in assetCommit."
  );

  const publication = JSON.parse(commitPublicationBytes.toString("utf8"));
  assert(publication.schemaVersion === "1.0", "Unsupported archive publication schema.");
  assert(publication.publicationId === publicationId, "Archive publication ID does not match the requested doorway pin.");
  assert(publication.pageId === PAGE_ID, "Archive publication page ID is incorrect.");
  assert(publication.pageType === PAGE_TYPE, "Archive publication page type is incorrect.");
  assert(/^[a-f0-9]{40}$/.test(publication.sourceRevision || ""), "Archive publication sourceRevision is invalid.");
  assert(publication.runtime?.version === runtimeVersion, "Archive runtime version does not match the requested doorway pin.");
  assert(publication.runtime?.runtimeSchemaVersion === "1.0", "Unsupported archive runtime schema.");
  assert(publication.content?.runtimeSchemaVersion === "1.0", "Unsupported archive content schema.");

  validateReleaseEntry(publication.runtime.bootstrap, `../../runtime/${runtimeVersion}/bootstrap.js`, "runtime bootstrap");
  validateReleaseEntry(publication.runtime.script, `../../runtime/${runtimeVersion}/runtime.js`, "runtime script");
  validateReleaseEntry(publication.runtime.style, `../../runtime/${runtimeVersion}/archive.css`, "runtime style");
  validateReleaseEntry(publication.runtime.hostCompat, `../../runtime/${runtimeVersion}/host-compat.css`, "host compatibility style");
  assert(sortedKeys(publication.runtime.artwork) === expectedKeys(ARTWORK_PATHS), "Archive publication artwork set is incomplete or unstable.");
  for (const [name, path] of Object.entries(ARTWORK_PATHS)) {
    validateReleaseEntry(publication.runtime.artwork[name], `../../runtime/${runtimeVersion}/${path}`, `artwork ${name}`);
    assert(publication.runtime.artwork[name].mediaType === "image/webp", `Archive publication artwork ${name} media type is invalid.`);
  }
  assert(/^sha256:[a-f0-9]{64}$/.test(publication.content?.snapshotId || ""), "Archive content snapshot ID is invalid.");
  validateReleaseEntry(
    publication.content.manifest,
    `../../content/${publication.content.snapshotId.slice("sha256:".length)}/manifest.json`,
    "content manifest"
  );

  const releaseGitRoot = gitPathFor(gitRoot, releaseRoot);
  const entries = [
    ["runtime.bootstrap", publication.runtime.bootstrap],
    ["runtime.script", publication.runtime.script],
    ["runtime.style", publication.runtime.style],
    ["runtime.hostCompat", publication.runtime.hostCompat],
    ...Object.entries(publication.runtime.artwork).map(([name, entry]) => [`runtime.artwork.${name}`, entry]),
    ["content.manifest", publication.content.manifest]
  ];
  const files = [];
  let bootstrapBytes = null;
  for (const [label, entry] of entries) {
    const repositoryPath = posix.normalize(posix.join(posix.dirname(publicationGitPath), entry.path));
    assert(
      repositoryPath.startsWith(`${releaseGitRoot}/`),
      `Archive publication ${label} escapes its immutable release root.`
    );
    const localPath = resolve(gitRoot, ...repositoryPath.split("/"));
    const [localBytes, commitBytes] = await Promise.all([
      readFile(localPath),
      committedFile(gitRoot, assetCommit, repositoryPath)
    ]);
    assert(localBytes.equals(commitBytes), `Local ${label} differs from the exact bytes in assetCommit.`);
    assert(sha256(commitBytes) === entry.sha256, `Committed ${label} fails publication SHA-256 verification.`);
    if (label === "runtime.bootstrap") bootstrapBytes = commitBytes;
    files.push({ label, repositoryPath, bytes: commitBytes.length, sha256: entry.sha256 });
  }
  assert(bootstrapBytes, "Committed archive publication did not resolve a bootstrap.");

  return {
    publication,
    publicationPath,
    publicationGitPath,
    publicationBytes: commitPublicationBytes,
    publicationSha256: sha256(commitPublicationBytes),
    bootstrapBytes,
    files: files.sort((left, right) => left.repositoryPath.localeCompare(right.repositoryPath))
  };
}

export async function buildDoorwayArtifacts(options) {
  const {
    runtimeVersion,
    publicationId,
    assetCommit,
    templateRoot = DEFAULT_DOORWAY_ROOT,
    releaseRoot = DEFAULT_RELEASE_ROOT,
    gitRoot = REPOSITORY_ROOT
  } = options;
  const templates = await loadDoorwayTemplates(templateRoot);
  const release = await verifyReleaseAtCommit({ runtimeVersion, publicationId, assetCommit, releaseRoot, gitRoot });
  const bootstrap = release.files.find((file) => file.label === "runtime.bootstrap");
  assert(bootstrap, "Verified archive release did not contain a bootstrap.");
  const bootstrapSri = sha256Sri(release.bootstrapBytes);
  const javascript = templates.javascriptTemplate
    .replace("__ASSET_COMMIT__", assetCommit)
    .replace("__RUNTIME_VERSION__", runtimeVersion)
    .replace("__PUBLICATION_ID__", publicationId)
    .replace("__BOOTSTRAP_SRI__", bootstrapSri);
  assert(!TEMPLATE_TOKENS.some((token) => javascript.includes(token)), "Generated archive doorway JavaScript retains template tokens.");
  new vm.Script(javascript);

  const cdnBase = `https://cdn.jsdelivr.net/gh/${RELEASE_REPOSITORY}@${assetCommit}/`;
  const publicationUrl = `${cdnBase}${release.publicationGitPath}`;
  const bootstrapUrl = `${cdnBase}${bootstrap.repositoryPath}`;
  assert(javascript.includes(assetCommit), "Generated archive doorway JavaScript is missing its exact asset commit.");
  assert(javascript.includes(runtimeVersion), "Generated archive doorway JavaScript is missing its runtime version.");
  assert(javascript.includes(publicationId), "Generated archive doorway JavaScript is missing its publication ID.");
  assert(javascript.includes(bootstrapSri), "Generated archive doorway JavaScript is missing its bootstrap SRI.");

  const releaseFiles = [
    {
      label: "publication",
      repositoryPath: release.publicationGitPath,
      bytes: release.publicationBytes.length,
      sha256: release.publicationSha256,
      cdnUrl: publicationUrl
    },
    ...release.files.map((file) => ({ ...file, cdnUrl: `${cdnBase}${file.repositoryPath}` }))
  ].sort((left, right) => left.repositoryPath.localeCompare(right.repositoryPath));
  const pin = {
    schemaVersion: "1.0",
    pageId: PAGE_ID,
    pageType: PAGE_TYPE,
    wordpress: {
      pageId: WORDPRESS_PAGE_ID,
      path: "/hub/archive-2025-2026/",
      url: "https://rmhughes.edublogs.org/hub/archive-2025-2026/",
      template: "page_fullwidth.php"
    },
    release: {
      repository: RELEASE_REPOSITORY,
      assetCommit,
      sourceRevision: release.publication.sourceRevision,
      runtimeVersion,
      publicationId,
      previousKnownGoodPublication: release.publication.previousKnownGoodPublication ?? null,
      bootstrap: { url: bootstrapUrl, sha256: bootstrap.sha256, sri: bootstrapSri },
      publication: { url: publicationUrl, sha256: release.publicationSha256 }
    },
    doorway: {
      html: { path: "HTML-BOX.html", bytes: Buffer.byteLength(templates.html), sha256: sha256(templates.html) },
      css: { path: "CSS-BOX.css", bytes: Buffer.byteLength(templates.css), sha256: sha256(templates.css) },
      javascript: { path: "JAVASCRIPT-BOX.js", bytes: Buffer.byteLength(javascript), sha256: sha256(javascript) }
    },
    verifiedReleaseFiles: releaseFiles,
    preservationRecord: "PRE-INSTALL-PRESERVATION.json",
    installationState: "repository-package-only-not-proof-of-edublogs-installation"
  };

  return {
    html: templates.html,
    css: templates.css,
    javascript,
    pin,
    pinText: `${JSON.stringify(pin, null, 2)}\n`
  };
}

export async function validatePreservationRecord(recordPath, repositoryRoot = REPOSITORY_ROOT, requireComplete = false) {
  const record = JSON.parse(await readFile(recordPath, "utf8"));
  assert(record.schemaVersion === "1.0", "Unsupported Page 2627 preservation record schema.");
  assert(record.wordpress?.pageId === WORDPRESS_PAGE_ID, "Preservation record targets the wrong WordPress page.");
  assert(record.wordpress?.path === "/hub/archive-2025-2026/", "Preservation record targets the wrong route.");
  assert(record.wordpress?.template === "page_fullwidth.php", "Preservation record must retain page_fullwidth.php.");
  assert(record.observedInstalledState?.legacyAssetCommit === "8331606ba430e039a78174da3825c275fefa9c46", "Preservation record lost the observed legacy asset pin.");

  const verifyEvidenceEntry = async (entry, label) => {
    assert(entry && typeof entry.path === "string", `Preservation record is missing ${label}.`);
    assert(Number.isInteger(entry.bytes) && entry.bytes >= 0, `Preservation record ${label} byte length is invalid.`);
    assert(/^[a-f0-9]{64}$/.test(entry.sha256 || ""), `Preservation record ${label} digest is invalid.`);
    const absolute = resolve(repositoryRoot, entry.path);
    const rel = relative(repositoryRoot, absolute);
    assert(!rel.startsWith(`..${sep}`) && rel !== ".." && !isAbsolute(rel), `Preservation evidence escapes the repository: ${label}`);
    const bytes = await readFile(absolute);
    assert(bytes.length === entry.bytes, `Preservation evidence byte length drifted: ${label}`);
    assert(sha256(bytes) === entry.sha256, `Preservation evidence SHA-256 drifted: ${label}`);
  };
  await verifyEvidenceEntry(record.readOnlyEvidence?.publicHtml, "public HTML");
  await verifyEvidenceEntry(record.readOnlyEvidence?.restView, "REST view");

  const editor = record.authenticatedEditorFields;
  const complete = editor?.status === "complete" && record.installationGate === "satisfied";
  if (requireComplete) assert(complete, "Page 2627 authenticated editor-field preservation is not complete.");
  if (complete) {
    for (const [name, entry] of Object.entries(editor.fields || {})) {
      await verifyEvidenceEntry(entry, `authenticated editor ${name}`);
    }
    assert(sortedKeys(editor.fields) === "css|html|javascript", "Preservation record editor field set is incomplete.");
  } else {
    assert(editor?.status === "pending-authenticated-export", "Incomplete preservation record has an unexpected status.");
    assert(record.installationGate === "blocked-until-authenticated-editor-fields-are-exported-and-hashed", "Incomplete preservation record must keep installation blocked.");
  }
  return { record, complete };
}

export async function fileExists(path) {
  try {
    await stat(path);
    return true;
  } catch (error) {
    if (error.code === "ENOENT") return false;
    throw error;
  }
}
