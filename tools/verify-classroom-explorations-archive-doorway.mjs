import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  DEFAULT_DOORWAY_ROOT,
  DEFAULT_RELEASE_ROOT,
  REPOSITORY_ROOT,
  buildDoorwayArtifacts,
  fileExists,
  loadDoorwayTemplates,
  validatePreservationRecord
} from "./lib/classroom-explorations-archive-doorway.mjs";

const flags = new Set(process.argv.slice(2));
for (const flag of flags) {
  if (!["--require-final", "--require-editor-preservation"].includes(flag)) {
    throw new Error(`Unknown archive doorway verification option: ${flag}`);
  }
}

const requireFinal = flags.has("--require-final");
const requireEditorPreservation = flags.has("--require-editor-preservation");
const templateRoot = resolve(process.env.HRV_ARCHIVE_DOORWAY_TEMPLATE_ROOT || DEFAULT_DOORWAY_ROOT);
const outputRoot = resolve(process.env.HRV_ARCHIVE_DOORWAY_OUTPUT_ROOT || DEFAULT_DOORWAY_ROOT);
const releaseRoot = resolve(process.env.HRV_ARCHIVE_RELEASE_ROOT || DEFAULT_RELEASE_ROOT);
const gitRoot = resolve(process.env.HRV_ARCHIVE_GIT_ROOT || REPOSITORY_ROOT);

await loadDoorwayTemplates(templateRoot);

const preservationPath = resolve(outputRoot, "PRE-INSTALL-PRESERVATION.json");
if (await fileExists(preservationPath)) {
  const preservation = await validatePreservationRecord(
    preservationPath,
    REPOSITORY_ROOT,
    requireEditorPreservation
  );
  console.log(
    `[archive-doorway] Page 2627 preservation: ${preservation.complete ? "complete" : "authenticated editor fields still pending"}.`
  );
} else if (requireEditorPreservation) {
  throw new Error("Page 2627 pre-install preservation record is missing.");
}

const javascriptPath = resolve(outputRoot, "JAVASCRIPT-BOX.js");
const pinPath = resolve(outputRoot, "RELEASE-PIN.json");
const finalStates = await Promise.all([fileExists(javascriptPath), fileExists(pinPath)]);
if (finalStates[0] !== finalStates[1]) {
  throw new Error("Archive doorway final JavaScript and release pin must exist together.");
}
if (!finalStates[0]) {
  if (requireFinal) throw new Error("Final Page 2627 doorway has not been generated from an immutable asset commit.");
  console.log("[archive-doorway] source templates verified; final immutable release pin is intentionally pending.");
  process.exit(0);
}

const pinText = await readFile(pinPath, "utf8");
const pin = JSON.parse(pinText);
const artifacts = await buildDoorwayArtifacts({
  runtimeVersion: pin.release?.runtimeVersion,
  publicationId: pin.release?.publicationId,
  assetCommit: pin.release?.assetCommit,
  templateRoot,
  releaseRoot,
  gitRoot
});
const [html, css, javascript] = await Promise.all([
  readFile(resolve(outputRoot, "HTML-BOX.html"), "utf8"),
  readFile(resolve(outputRoot, "CSS-BOX.css"), "utf8"),
  readFile(javascriptPath, "utf8")
]);
if (html !== artifacts.html) throw new Error("Generated Page 2627 HTML drifted from its validated source template.");
if (css !== artifacts.css) throw new Error("Generated Page 2627 CSS drifted from its validated source template.");
if (javascript !== artifacts.javascript) throw new Error("Generated Page 2627 JavaScript drifted from its immutable release pin.");
if (pinText !== artifacts.pinText) throw new Error("Generated Page 2627 release pin is not deterministic or has been edited.");

console.log(
  `[archive-doorway] final Page 2627 package verified at ${pin.release.assetCommit}; this verifies repository artifacts, not Edublogs installation.`
);
