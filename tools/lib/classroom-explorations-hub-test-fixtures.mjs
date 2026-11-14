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
  const composition = source.data.composition;
  const selected = source.data.explorations.find(item => item.id === composition.currentExplorationId);
  const route = routes.routes.find(item => item.ref === selected.routeRef);
  assert.equal(manifest.page.currentSchoolYear, composition.currentSchoolYear);
  assert.equal(selected.schoolYear, composition.currentSchoolYear);
  assert.equal(manifest.current.exploration.id, selected.id);
  assert.equal(manifest.current.exploration.href, new URL(route.path, routes.site.origin).href);
  assert.equal(manifest.current.featuredMedia.id, composition.featuredMediaId);
  assert.deepEqual(manifest.galleries.pastExplorations.map(item => item.id), composition.pastExplorationIds);
  assert.ok(!composition.pastExplorationIds.includes(selected.id));
  assert.deepEqual(manifest.galleries.pastTwwl.map(item => item.id), composition.pastTwwlIds);
  assert.equal(routes.routes.find(item=>item.ref==='hrv-route:mushrooms').wordpressPageId, 413);
  assert.equal(manifest.archives.length, 1);
  assert.equal(source.data.explorations.filter(item => item.schoolYear === '2025-2026').length, 3);
  assert.equal(source.data.twwl.filter(item => item.schoolYear === '2025-2026').length, 5);
  return manifest;
}
