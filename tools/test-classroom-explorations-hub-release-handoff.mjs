import assert from 'node:assert/strict';
import { test } from 'node:test';
import { readFile, writeFile, cp, mkdtemp, rm, readdir } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { canonicalJson, sha256Text, projectHubRuntime } from './lib/classroom-explorations-hub-contract.mjs';
import { applyHubCommand, documentRevisions } from './lib/classroom-explorations-hub-transactions.mjs';
import { validateHubReleaseHandoff, validateHubReleaseManifest } from './lib/classroom-explorations-hub-release-handoff.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const source = JSON.parse(await readFile(resolve(root, 'apps/classroom-explorations-hub/source/hub.source.json'), 'utf8'));
const routes = JSON.parse(await readFile(resolve(root, 'registry/hrv-routes.source.json'), 'utf8'));
const control = JSON.parse(await readFile(resolve(root, 'apps/classroom-explorations-hub/source/hub.control.json'), 'utf8'));
// A new current-year candidate is test data only. Historical lessons stay historical.
source.data.explorations.push({ ...structuredClone(source.data.explorations.find(item => item.id === source.data.composition.currentExplorationId)), id: 'synthetic-next', title: 'Synthetic Next Exploration' });
const current = { source, routes, control };
const operation = { type: 'set-current-exploration', explorationId: 'synthetic-next', archiveOutgoing: true };
const projected = applyHubCommand({ ...current, command: {
  schemaVersion: '1.0', commandId: 'test-release', idempotencyKey: 'test-release', targetPageId: control.target.pageId,
  expected: documentRevisions(source, routes), operation: 'hub.swap-current-exploration', payload: { nextExplorationId: operation.explorationId, archiveOutgoing: true },
} });
const before = { source, routes }, after = projected.documents;
const bundle = {
  schemaVersion: 'lanternworks-hub-release/1.0.0',
  proposal: { id: '12345678-1234-4234-8234-123456789abc', revision: 2, status: 'approved', reviewedAt: new Date().toISOString(), expiresAt: new Date(Date.now() + 3600_000).toISOString() },
  source: { repository: 'ProfessorMinty/HughesWebAssets-Source', ref: 'hub-authoring-v2-2026-08-28', baseCommitSha: 'a'.repeat(40), controlSha256: sha256Text(canonicalJson(control)) },
  operation, beforeHash: sha256Text(canonicalJson(before)), afterHash: sha256Text(canonicalJson(after)), documents: { before, after },
  productionMutationPerformed: false, publicationAvailable: false,
};

test('replays the owning swap, archives Zinnia and retains immutable historical catalog', () => {
  const original = structuredClone(current);
  const result = validateHubReleaseHandoff(bundle, current);
  assert.deepEqual(current, original);
  assert.equal(result.manifest.current.exploration.id, 'synthetic-next');
  assert.ok(result.manifest.galleries.pastExplorations.some(item => item.id === source.data.composition.currentExplorationId));
  assert.equal(result.documents.source.data.explorations.find(item => item.id === 'mushrooms').schoolYear, '2025-2026');
  validateHubReleaseManifest(result.manifest, result.documents.source, result.documents.routes);
});

test('normal populated galleries can generate a production doorway; unrelated content cannot', () => {
  const manifest = projectHubRuntime(after.source, after.routes);
  validateHubReleaseManifest(manifest, after.source, after.routes);
  assert.throws(() => validateHubReleaseManifest(manifest, before.source, before.routes), /committed Source/);
});

test('rejects pending decisions, expired approvals, wrong repository and unsupported operations', () => {
  for (const change of [
    next => { next.proposal.status = 'prepared'; },
    next => { next.proposal.expiresAt = '2000-01-01'; },
    next => { next.source.repository = 'other/repo'; },
    next => { next.operation.type = 'hub.delete'; },
    next => { next.operation.archiveOutgoing = false; },
    next => { next.publicationAvailable = true; },
  ]) {
    const next = structuredClone(bundle); change(next);
    assert.throws(() => validateHubReleaseHandoff(next, current));
  }
});

test('rejects changed rules, stale documents and forged after documents even with a matching hash', () => {
  const changed = structuredClone(current); changed.control.hosts.canonical.mayPublish = true;
  assert.throws(() => validateHubReleaseHandoff(bundle, changed), /control changed/);
  const stale = structuredClone(current); stale.source.data.copy.hero.title = 'Changed';
  assert.throws(() => validateHubReleaseHandoff(bundle, stale), /Source changed/);
  const forged = structuredClone(bundle); forged.documents.after.source.data.copy.hero.title = 'Unreviewed';
  forged.afterHash = sha256Text(canonicalJson(forged.documents.after));
  assert.throws(() => validateHubReleaseHandoff(forged, current), /owning transaction/);
});

test('CLI prepares exact proposed documents and hash-checked rollback without modifying the checkout', async () => {
  const temporary = await mkdtemp(resolve(tmpdir(), 'hub-release-handoff-'));
  const checkout = resolve(temporary, 'checkout');
  try {
    for (const path of ['tools', 'schemas', 'apps/classroom-explorations-hub/source', 'registry', 'docs/edublogs-integration/classroom-explorations-hub']) {
      await cp(resolve(root, path), resolve(checkout, path), { recursive: true });
    }
    await writeFile(resolve(checkout, 'package.json'), '{"type":"module"}\n');
    await writeFile(resolve(checkout, 'apps/classroom-explorations-hub/source/hub.source.json'), JSON.stringify(source));
    const git = (...args) => {
      const result = spawnSync('git', ['-C', checkout, ...args], { encoding: 'utf8' });
      assert.equal(result.status, 0, result.stderr); return result.stdout.trim();
    };
    git('init'); git('add', '.'); git('-c', 'user.name=Hub Test', '-c', 'user.email=hub-test@example.invalid', 'commit', '-m', 'Synthetic release fixture');
    const next = structuredClone(bundle); next.source.baseCommitSha = git('rev-parse', 'HEAD');
    const input = resolve(temporary, 'handoff.json'), output = resolve(temporary, 'prepared');
    await writeFile(input, JSON.stringify(next));
    const run = () => spawnSync(process.execPath, [resolve(checkout, 'tools/prepare-classroom-explorations-hub-release.mjs'), input, output], { encoding: 'utf8' });
    const result = run(); assert.equal(result.status, 0, result.stderr);
    const plan = JSON.parse(await readFile(resolve(output, 'release-plan.json'), 'utf8'));
    assert.equal(plan.state, 'prepared-for-source-review');
    assert.equal(plan.rollback.requiresAuthenticatedInstalledReadback, true);
    for (const entry of plan.files) {
      const bytes = await readFile(resolve(output, entry.path));
      assert.equal(bytes.length, entry.bytes); assert.equal(sha256Text(bytes), entry.sha256);
    }
    assert.deepEqual(JSON.parse(await readFile(resolve(output, 'proposed/apps/classroom-explorations-hub/source/hub.source.json'), 'utf8')), after.source);
    assert.equal(git('status', '--porcelain'), '');
    assert.notEqual(run().status, 0, 'Existing output must never be replaced.');
    assert.ok(!(await readdir(temporary)).some(name => name.startsWith('.hub-release-')));
  } finally { await rm(temporary, { recursive: true, force: true }); }
});
