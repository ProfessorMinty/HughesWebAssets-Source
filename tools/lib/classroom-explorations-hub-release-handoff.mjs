import assert from 'node:assert/strict';
import { canonicalJson, sha256Text, projectHubRuntime, validateRuntimeManifestCompatibility } from './classroom-explorations-hub-contract.mjs';
import { applyHubCommand, documentRevisions } from './classroom-explorations-hub-transactions.mjs';

export function validateHubReleaseManifest(manifest, source, routes) {
  validateRuntimeManifestCompatibility(manifest);
  assert.equal(canonicalJson(manifest), canonicalJson(projectHubRuntime(source, routes)), 'Release content must match its committed Source documents.');
}

// Downloaded JSON is untrusted build input. It cannot authorize publication.
export function validateHubReleaseHandoff(bundle, current, now = Date.now()) {
  assert.equal(bundle?.schemaVersion, 'lanternworks-hub-release/1.0.0');
  assert.equal(bundle.proposal?.status, 'approved');
  assert.match(bundle.proposal.id, /^[a-f0-9-]{36}$/);
  assert.ok(Number.isSafeInteger(bundle.proposal.revision) && bundle.proposal.revision >= 2);
  assert.ok(Number.isFinite(Date.parse(bundle.proposal.reviewedAt)));
  assert.ok(Date.parse(bundle.proposal.expiresAt) > now, 'Release approval has expired.');
  assert.equal(bundle.productionMutationPerformed, false);
  assert.equal(bundle.publicationAvailable, false);
  assert.equal(bundle.source.repository, 'ProfessorMinty/HughesWebAssets-Source');
  assert.equal(bundle.source.ref, 'hub-authoring-v2-2026-08-28');
  assert.match(bundle.source.baseCommitSha, /^[a-f0-9]{40}$/);
  assert.equal(bundle.source.controlSha256, sha256Text(canonicalJson(current.control)), 'Hub control changed.');
  assert.equal(bundle.beforeHash, sha256Text(canonicalJson(bundle.documents.before)));
  assert.equal(bundle.afterHash, sha256Text(canonicalJson(bundle.documents.after)));
  assert.equal(bundle.beforeHash, sha256Text(canonicalJson({ source: current.source, routes: current.routes })), 'Source changed after the proposal.');

  const operation = bundle.operation;
  let commandOperation, payload;
  if (operation?.type === 'set-current-exploration') {
    assert.deepEqual(Object.keys(operation).sort(), ['archiveOutgoing', 'explorationId', 'type']);
    assert.equal(operation.archiveOutgoing, true);
    assert.equal(typeof operation.explorationId, 'string');
    commandOperation = 'hub.swap-current-exploration';
    payload = { nextExplorationId: operation.explorationId, archiveOutgoing: true };
  } else {
    assert.equal(operation?.type, 'reorder-past-explorations', 'Unsupported release operation.');
    assert.deepEqual(Object.keys(operation).sort(), ['orderedIds', 'type']);
    assert.ok(Array.isArray(operation.orderedIds));
    commandOperation = 'hub.reorder-gallery';
    payload = { gallery: 'pastExplorations', orderedIds: operation.orderedIds };
  }
  const projected = applyHubCommand({
    ...current,
    command: {
      schemaVersion: '1.0', commandId: `hub-command:${bundle.proposal.id}`,
      idempotencyKey: `hub-idempotency:${bundle.proposal.id}`,
      targetPageId: current.control.target.pageId,
      expected: documentRevisions(current.source, current.routes),
      operation: commandOperation, payload,
    },
  });
  assert.equal(bundle.afterHash, sha256Text(canonicalJson(projected.documents)), 'Saved change differs from the owning transaction.');
  assert.notEqual(bundle.beforeHash, bundle.afterHash, 'The release must change the Hub.');
  const manifest = projectHubRuntime(projected.documents.source, projected.documents.routes);
  validateRuntimeManifestCompatibility(manifest);
  return { documents: projected.documents, manifest };
}
