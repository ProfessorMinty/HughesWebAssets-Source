import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { spawnSync } from 'node:child_process';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import vm from 'node:vm';

const root = fileURLToPath(new URL('..', import.meta.url));
const [commit, runtime, publicationId, evidencePath, target = 'review', ...extra] = process.argv.slice(2);
assert.equal(extra.length, 0);
assert.ok(['review', 'production'].includes(target), 'Only the approved review and production Hub hosts are supported.');
assert.match(commit || '', /^[a-f0-9]{40}$/, 'Supply a full immutable asset commit.');
assert.match(runtime || '', /^\d{4}\.\d{2}\.\d{2}\.\d+$/);
assert.match(publicationId || '', /^pub-\d{4}-\d{2}-\d{2}-\d{3}$/);
assert.ok(evidencePath, 'Supply successful Hub CDN verification evidence.');
const git = (...args) => {
  const result = spawnSync('git', ['-C', root, ...args], { maxBuffer: 32 * 1024 * 1024 });
  assert.equal(result.status, 0, result.stderr.toString());
  return result.stdout;
};
git('merge-base', '--is-ancestor', commit, 'HEAD');
const prefix = 'releases/classroom-explorations-hub/';
const committedFile = path => {
  // Resolve the tree first: Windows git show commit:path can stat a synthetic
  // overlong pathname before object lookup when content hashes are in the path.
  const records = git('ls-tree', '-z', '--full-tree', commit, '--', path).toString('utf8').split('\0').filter(Boolean);
  assert.equal(records.length, 1);
  const [header, returnedPath] = records[0].split('\t');
  const [mode, type, objectId] = header.split(' ');
  assert.equal(returnedPath, path);
  assert.equal(mode, '100644');
  assert.equal(type, 'blob');
  return git('cat-file', 'blob', objectId);
};
const evidence = JSON.parse(await readFile(resolve(root, evidencePath), 'utf8'));
assert.equal(evidence.verifier, 'classroom-explorations-hub-cdn');
assert.equal(evidence.repository, 'ProfessorMinty/HughesWebAssets-Source');
assert.equal(evidence.releaseCommit, commit);
assert.equal(evidence.runtimeVersion, runtime);
assert.equal(evidence.publicationId, publicationId);
assert.equal(evidence.fileCount, 16);
assert.equal(evidence.files.length, 16);
assert.equal(new Set(evidence.files.map(file => file.path)).size, 16);
const base = `https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@${commit}/${prefix}`;
for (const file of evidence.files) {
  assert.equal(file.httpStatus, 200);
  assert.ok(!file.path.includes('..') && !file.path.startsWith('/'));
  assert.equal(file.url, new URL(file.path, base).href);
  const bytes = committedFile(`${prefix}${file.path}`);
  assert.equal(bytes.length, file.bytes);
  assert.equal(createHash('sha256').update(bytes).digest('hex'), file.sha256);
}
const publicationPath = `${prefix}publications/${publicationId}/publication.json`;
const publication = JSON.parse(committedFile(publicationPath));
assert.equal(publication.pageId, 'hrv-page:classroom-explorations');
assert.equal(publication.runtime.version, runtime);
assert.equal(publication.publicationId, publicationId);
assert.equal(publication.sourceRevision, evidence.sourceRevision);
const bootstrap = committedFile(`${prefix}runtime/${runtime}/bootstrap.js`);
assert.equal(createHash('sha256').update(bootstrap).digest('hex'), publication.runtime.bootstrap.sha256);
const sri = `sha256-${createHash('sha256').update(bootstrap).digest('base64')}`;
const reviewRoot = resolve(root, 'docs/edublogs-integration/classroom-explorations-hub-test');
const outputRoot = target === 'review' ? reviewRoot : resolve(root, 'docs/edublogs-integration/classroom-explorations-hub');
if (target === 'production') {
  const manifestUrl = new URL(publication.content.manifest.path, `${base}publications/${publicationId}/publication.json`).href;
  assert.ok(manifestUrl.startsWith(base));
  const manifest = JSON.parse(committedFile(`${prefix}${manifestUrl.slice(base.length)}`));
  assert.equal(manifest.page.currentSchoolYear, '2026-2027');
  assert.deepEqual(manifest.galleries.pastExplorations, []);
  assert.deepEqual(manifest.galleries.pastTwwl, []);
  assert.equal(manifest.archives.length, 1);
  const beforeRoot = resolve(root, 'evidence/classroom-explorations-hub/page17-migration-2026-10-10');
  const preservation = JSON.parse(await readFile(resolve(beforeRoot, 'page17-preservation.json'), 'utf8'));
  assert.equal(preservation.wordpressPageId, 17);
  assert.equal(preservation.targetUrl, 'https://rmhughes.edublogs.org/hub/');
  for (const [name, expected] of Object.entries(preservation.fields)) {
    assert.match(name, /^page17-before-(?:HTML\.html|CSS\.css|JavaScript\.js)$/);
    const bytes = await readFile(resolve(beforeRoot, name));
    assert.equal(bytes.length, expected.bytes);
    assert.equal(createHash('sha256').update(bytes).digest('hex'), expected.sha256);
  }
  assert.equal(Object.keys(preservation.fields).length, 3);
  for (const name of ['HTML-BOX.html', 'CSS-BOX.css']) {
    await writeFile(resolve(outputRoot, name), await readFile(resolve(reviewRoot, name)));
  }
  await writeFile(resolve(outputRoot, 'HOST-COMPATIBILITY.css'), committedFile(`${prefix}runtime/${runtime}/host-compat.css`));
}
let javascript = await readFile(resolve(reviewRoot, 'JAVASCRIPT-BOX.template.js'), 'utf8');
for (const [token, value] of Object.entries({
  __ASSET_COMMIT__: commit, __RUNTIME_VERSION__: runtime,
  __PUBLICATION_ID__: publicationId, __BOOTSTRAP_SRI__: sri
})) {
  assert.equal(javascript.split(token).length, 2, `Template token ${token} must occur exactly once.`);
  javascript = javascript.replace(token, value);
}
new vm.Script(javascript);
const pin = {
  wordpressPageId: target === 'production' ? 17 : 2589,
  targetUrl: `https://rmhughes.edublogs.org/${target === 'production' ? 'hub' : 'hub-test'}/`,
  assetCommit: commit, runtimeVersion: runtime, publicationId,
  sourceRevision: publication.sourceRevision,
  previousKnownGoodPublication: publication.previousKnownGoodPublication,
  bootstrapSri: sri, bootstrapUrl: `${base}runtime/${runtime}/bootstrap.js`,
  publicationUrl: `${base}publications/${publicationId}/publication.json`,
  cdnEvidencePath: evidencePath,
  fields: Object.fromEntries(await Promise.all(['HTML-BOX.html', 'CSS-BOX.css', 'JAVASCRIPT-BOX.js'].map(async name => {
    const bytes = name === 'JAVASCRIPT-BOX.js' ? Buffer.from(javascript) : await readFile(resolve(outputRoot, name));
    return [name, { bytes: bytes.length, sha256: createHash('sha256').update(bytes).digest('hex') }];
  })))
};
await writeFile(resolve(outputRoot, 'JAVASCRIPT-BOX.js'), javascript);
await writeFile(resolve(outputRoot, 'RELEASE-PIN.json'), `${JSON.stringify(pin, null, 2)}\n`);
console.log(`[hub-doorway] generated Page ${pin.wordpressPageId} package at ${commit}; Edublogs not modified.`);
