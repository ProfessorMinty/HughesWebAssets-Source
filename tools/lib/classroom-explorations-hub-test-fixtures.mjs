import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { projectHubRuntime } from './classroom-explorations-hub-contract.mjs';

// Historical placements are test-only. Production builders must use canonical
// authoring unchanged; the retained catalog is consumed by the separate archive.
export function historicalGalleryFixture(source) {
  const archive = JSON.parse(readFileSync(new URL('../../apps/classroom-explorations-archive/source/archive-2025-2026.source.json', import.meta.url), 'utf8'));
  const fixture = structuredClone(source);
  fixture.data.composition.currentExplorationId = 'summer-bloom-adoption-project';
  fixture.data.composition.featuredMediaId = 'welcome-classroom-explorations';
  fixture.data.composition.pastExplorationIds = [...archive.data.composition.explorationIds];
  fixture.data.composition.pastTwwlIds = [...archive.data.composition.twwlIds];
  return fixture;
}

export function assertCanonicalCurrentYearCollections(source, routes) {
  const manifest = projectHubRuntime(source, routes);
  assert.equal(manifest.page.currentSchoolYear, '2026-2027');
  assert.equal(manifest.current.exploration.id, 'mushrooms-2026-2027');
  assert.equal(manifest.current.exploration.href, 'https://rmhughes.edublogs.org/hub/mushrooms/');
  assert.equal(manifest.current.featuredMedia.embedUrl, 'https://www.youtube-nocookie.com/embed/7IZ-Fek2kzE');
  assert.deepEqual(manifest.galleries.pastExplorations.map(item=>item.id), ['summer-bloom-adoption-project']);
  assert.equal(manifest.galleries.pastExplorations[0].schoolYear, '2026-2027');
  assert.equal(routes.routes.find(item=>item.ref==='hrv-route:mushrooms').wordpressPageId, 413);
  assert.deepEqual(manifest.galleries.pastTwwl, []);
  assert.equal(manifest.archives.length, 1);
  assert.equal(source.data.explorations.filter(item => item.schoolYear === '2025-2026').length, 3);
  assert.equal(source.data.twwl.filter(item => item.schoolYear === '2025-2026').length, 5);
  return manifest;
}
