import assert from 'node:assert/strict';
import { readFile, writeFile, mkdir, mkdtemp, cp, rm, lstat, readdir } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { createHash } from 'node:crypto';
import { validateHubReleaseHandoff } from './lib/classroom-explorations-hub-release-handoff.mjs';
import { validateSchema } from './lib/json-schema-lite.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const [input, output, ...extra] = process.argv.slice(2);
assert.ok(input && output && extra.length === 0, 'Usage: node tools/prepare-classroom-explorations-hub-release.mjs <handoff.json> <new-output-directory>');
const inputBytes = await readFile(resolve(input));
assert.ok(inputBytes.length <= 1_000_000, 'Handoff exceeds the build input limit.');
const bundle = JSON.parse(inputBytes);
const paths = { source: 'apps/classroom-explorations-hub/source/hub.source.json', routes: 'registry/hrv-routes.source.json', control: 'apps/classroom-explorations-hub/source/hub.control.json' };
const current = Object.fromEntries(await Promise.all(Object.entries(paths).map(async ([name, path]) => [name, JSON.parse(await readFile(resolve(root, path), 'utf8'))])));
const result = validateHubReleaseHandoff(bundle, current);
const ancestry = spawnSync('git', ['-C', root, 'merge-base', '--is-ancestor', bundle.source.baseCommitSha, 'HEAD']);
assert.equal(ancestry.status, 0, 'The proposal base must belong to this checkout history.');
// Bind the downloaded before documents to actual Git objects, not just worktree bytes.
for (const name of ['source', 'routes', 'control']) {
  const blob = spawnSync('git', ['-C', root, 'show', `${bundle.source.baseCommitSha}:${paths[name]}`], { maxBuffer: 2_000_000 });
  assert.equal(blob.status, 0);
  assert.deepEqual(JSON.parse(blob.stdout), current[name], `Committed ${name} changed.`);
}
const schema = async name => JSON.parse(await readFile(resolve(root, 'schemas', name), 'utf8'));
validateSchema(result.documents.source, await schema('hrv-page-envelope.schema.json'));
validateSchema(result.documents.source.data, await schema('classroom-explorations-hub.source.schema.json'));
validateSchema(result.documents.routes, await schema('hrv-route-registry.schema.json'));
validateSchema(result.manifest, await schema('classroom-explorations-hub.runtime.schema.json'));

const target = resolve(output);
try { await lstat(target); throw new Error('Output directory already exists; choose a new path.'); }
catch (error) { if (error.code !== 'ENOENT') throw error; }
await mkdir(dirname(target), { recursive: true });
const temporary = await mkdtemp(resolve(dirname(target), '.hub-release-'));
const files = [];
const write = async (path, bytes) => {
  await mkdir(dirname(resolve(temporary, path)), { recursive: true });
  await writeFile(resolve(temporary, path), bytes);
  files.push({ path, bytes: Buffer.byteLength(bytes), sha256: createHash('sha256').update(bytes).digest('hex') });
};
const json = value => JSON.stringify(value, null, 2) + '\n';
let ownedTarget = false;
let completed = false;
try {
  for (const name of ['source', 'routes']) {
    await write(`proposed/${paths[name]}`, json(result.documents[name]));
    await write(`rollback/source/${paths[name]}`, json(bundle.documents.before[name]));
  }
  const contentHash = result.manifest.snapshotId.slice('sha256:'.length);
  await write(`content/${contentHash}/manifest.json`, json(result.manifest));
  const pinRoot = 'docs/edublogs-integration/classroom-explorations-hub';
  const pin = JSON.parse(await readFile(resolve(root, pinRoot, 'RELEASE-PIN.json'), 'utf8'));
  assert.equal(pin.wordpressPageId, 17);
  assert.equal(pin.targetUrl, 'https://rmhughes.edublogs.org/hub/');
  for (const name of ['HTML-BOX.html', 'CSS-BOX.css', 'JAVASCRIPT-BOX.js']) {
    const bytes = await readFile(resolve(root, pinRoot, name));
    assert.equal(bytes.length, pin.fields[name].bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), pin.fields[name].sha256);
    await write(`rollback/doorway/${name}`, bytes);
  }
  await write('rollback/doorway/RELEASE-PIN.json', json(pin));
  const plan = {
    schemaVersion: 'hrv-hub-release-plan/1.0', proposalId: bundle.proposal.id,
    baseCommitSha: bundle.source.baseCommitSha, beforeHash: bundle.beforeHash, afterHash: bundle.afterHash,
    snapshotId: result.manifest.snapshotId, runtimeVersion: pin.runtimeVersion,
    previousPublicationId: pin.publicationId, files,
    state: 'prepared-for-source-review', productionMutationPerformed: false,
    rollback: { state: 'repository-baseline-only', publicationId: pin.publicationId, requiresAuthenticatedInstalledReadback: true },
    remaining: [
      'Independently verify the current authenticated Lanternworks approval; downloaded JSON is not publication authority.',
      'Review and commit both proposed Source documents together; recheck the Source branch before advancing it.',
      'Run the existing Hub content/runtime builders and stage an immutable publication using the new Source commit and previousPublicationId.',
      'Commit immutable release files, verify all 16 CDN bytes at their exact asset commit, and generate the review doorway.',
      'Capture the installed Edublogs fields and page identity before replacement; repository rollback bytes are not current installation evidence.',
      'Install and verify the review page, then separately authorize production activation and verify save/readback/rendering/rollback.',
    ],
  };
  await writeFile(resolve(temporary, 'release-plan.json'), json(plan));
  // Exclusive reservation also rejects an output created by another invocation
  // after the early check. Never let rename replace an existing empty directory.
  await mkdir(target);
  ownedTarget = true;
  for (const name of await readdir(temporary)) {
    await cp(resolve(temporary, name), resolve(target, name), { recursive: true, force: false, errorOnExist: true });
  }
  completed = true;
  console.log(`Prepared Hub release review at ${target}. Source checkout and Edublogs were not modified.`);
} finally {
  await rm(temporary, { recursive: true, force: true });
  if (ownedTarget && !completed) await rm(target, { recursive: true, force: true });
}
