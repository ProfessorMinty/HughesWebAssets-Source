import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { projectHubRuntime } from "./lib/classroom-explorations-hub-contract.mjs";
import { applyHubCommand, documentRevisions } from "./lib/classroom-explorations-hub-transactions.mjs";

const read = path => JSON.parse(readFileSync(new URL(`../${path}`, import.meta.url)));
const control = read("apps/classroom-explorations-hub/source/hub.control.json");
const baseline = {
  source: read("apps/classroom-explorations-hub/source/hub.source.json"),
  routes: read("registry/hrv-routes.source.json")
};
let sequence = 0;
function command(docs, operation, payload) {
  sequence++;
  return applyHubCommand({ ...docs, control, command: {
    schemaVersion: "1.0", operation, payload, targetPageId: baseline.source.page.id,
    commandId: `hub-command:twwl-test-${sequence}`, idempotencyKey: `hub-idempotency:twwl-test-${sequence}`,
    expected: documentRevisions(docs.source, docs.routes)
  }});
}

function story(slug, pageId) {
  const id = `fixture-twwl-${slug}`, ref = `hrv-route:${id}`;
  return {
    contentId: id,
    twwl: { id, schoolYear: baseline.source.data.composition.currentSchoolYear, title: slug, summary: "Classroom recap.", routeRef: ref, tags: ["Classroom"] },
    route: { ref, wordpressPageId: pageId, wordpressParentPageId: 17, kind: "twwl", state: "published", slug: id, path: `/hub/${id}/` }
  };
}
const select = "hub.set-current-twwl", first = story("seedlings", 99701), second = story("spore-prints", 99702);
const created = command(baseline, select, first);
assert.deepEqual(created.changedDocuments, ["authoring", "routes"]);
assert.equal(projectHubRuntime(created.documents.source, created.documents.routes).current.twwl.content.href,
  new URL(first.route.path, baseline.routes.site.origin).href);
assert.throws(() => command(created.documents, select, { contentId: first.contentId, twwl: { ...first.twwl, title: "Different recap" } }),
  { code: "HUB_CONTENT_ID_DUPLICATE" });
assert.throws(() => command(created.documents, select, { contentId: first.contentId, twwl: second.twwl }),
  { code: "HUB_COMMAND_PAYLOAD_INVALID" });
assert.throws(() => command(created.documents, select, { contentId: first.contentId, route: second.route }),
  { code: "HUB_COMMAND_PAYLOAD_INVALID" });
assert.deepEqual(command(created.documents, select, { contentId: first.contentId, twwl: first.twwl }).changedDocuments, []);

const photo = { kind: "external-url", url: "https://example.org/seedlings.jpg", alt: "A tray of classroom seedlings" };
const edited = command(created.documents, "hub.update-content", { kind: "twwl", contentId: first.contentId, patch: { title: "Seedling journals", tags: ["Botany"], image: photo } }).documents;
assert.equal(projectHubRuntime(edited.source, edited.routes).current.twwl.content.image.src, photo.url);
const withoutPhoto = command(edited, "hub.update-content", { kind: "twwl", contentId: first.contentId, patch: { image: null } }).documents;
assert.ok(!("image" in withoutPhoto.source.data.twwl.find(item => item.id === first.contentId)));
const switched = command(withoutPhoto, select, second).documents;
const paused = command(switched, "hub.set-current-twwl-coming-soon", {}).documents;
const past = paused.source.data.composition.pastTwwlIds;
assert.deepEqual(past.slice(-2), [first.contentId, second.contentId]);
assert.equal(paused.source.data.composition.currentTwwl.state, "coming-soon");
const reordered = command(paused, "hub.reorder-gallery", { gallery: "pastTwwl", orderedIds: [...past].reverse() }).documents;
assert.deepEqual(projectHubRuntime(reordered.source, reordered.routes).galleries.pastTwwl.map(item => item.id), [...past].reverse());
const reselected = command(reordered, select, { contentId: first.contentId }).documents;
const manifest = projectHubRuntime(reselected.source, reselected.routes);
assert.equal(manifest.current.twwl.content.title, "Seedling journals");
assert.ok(!manifest.galleries.pastTwwl.some(item => item.id === first.contentId));

// A content restore retains later registered routes while reproducing the saved snapshot.
assert.equal(projectHubRuntime(baseline.source, reselected.routes).snapshotId, projectHubRuntime(baseline.source, baseline.routes).snapshotId);
assert.ok(reselected.routes.routes.some(r => r.ref === second.route.ref));
for (const route of [
  { ...first.route, kind: "page" },
  { ...first.route, state: "unpublished" },
  { ...first.route, wordpressParentPageId: undefined, path: `/${first.route.slug}/` }
]) {
  assert.throws(() => command(baseline, select, { ...first, route }), { code: "HUB_TWWL_ROUTE_INVALID" });
}
assert.throws(() => command(created.documents, select, {
  ...second, route: { ...second.route, slug: first.route.slug, path: first.route.path }
}), { code: "HUB_TWWL_ROUTE_AMBIGUOUS" });

console.log("[hub TWWL] register, edit, switch, archive, reorder, reselect and restore passed");
