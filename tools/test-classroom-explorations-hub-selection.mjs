import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import vm from "node:vm";
import { sha256Text } from "./lib/classroom-explorations-hub-contract.mjs";
import { webcrypto } from "node:crypto";
import { JSDOM } from "jsdom";
import {
  buildHubPublication,
  createHubSelection,
  validateHubSelection,
  HUB_PUBLIC_BASE,
  HUB_RUNTIME_FINGERPRINT,
  hubDocumentHash,
  hubPreviewHtml,
} from "./lib/classroom-explorations-hub-publication.mjs";
const source = JSON.parse(
    await readFile(
      new URL(
        "../apps/classroom-explorations-hub/source/hub.source.json",
        import.meta.url,
      ),
    ),
  ),
  routes = JSON.parse(
    await readFile(
      new URL("../registry/hrv-routes.source.json", import.meta.url),
    ),
  );
const release = buildHubPublication({
  documents: { source, routes },
  sourceCommit: "a".repeat(40),
  publicationId: "hub-00000000-0000-4000-8000-000000000001",
});
const selection = createHubSelection({
  channel: "review",
  publication: release.reference,
  generation: 1,
  activatedAt: "2026-11-10T12:00:00Z",
});
const code = await readFile(
  new URL(
    "../apps/classroom-explorations-hub/selection/bootstrap.js",
    import.meta.url,
  ),
  "utf8",
);
async function run(
  { selectionValue = selection, publicationText = release.files[2].text } = {},
  verify,
) {
  const dom = new JSDOM(
      '<div id="hrv-classroom-explorations-root"><section data-hrv-outage-notice>Temporarily unavailable.</section></div><script data-channel="review"></script>',
      { url: "https://rmhughes.edublogs.org/hub-test/" },
    ),
    doc = dom.window.document;
  Object.defineProperty(doc, "currentScript", {
    value: doc.querySelector("script"),
  });
  let calls = 0;
  const context = vm.createContext({
    window: dom.window,
    document: doc,
    URL,
    TextEncoder,
    TextDecoder,
    crypto: webcrypto,
    AbortController,
    CustomEvent: dom.window.CustomEvent,
    btoa,
    console: { error() {} },
    setTimeout,
    clearTimeout,
    fetch: async (url) => {
      calls++;
      return new Response(
        url.includes("/channels/")
          ? JSON.stringify(selectionValue)
          : publicationText,
      );
    },
  });
  try {
    vm.runInContext(code, context);
    for (let i = 0; i < 20; i++)
      await new Promise((resolve) => setTimeout(resolve, 2));
    await verify({ doc, dom, context, calls });
  } finally {
    dom.window.dispatchEvent(
      new dom.window.CustomEvent("hrv:page-error", {
        detail: { pageId: "hrv-page:classroom-explorations" },
      }),
    );
    dom.window.close();
  }
}
test("content publication preserves the live Hub and the pinned runtime independently", () => {
  assert.equal(
    release.manifest.current.exploration.id,
    source.data.composition.currentExplorationId,
  );
  assert.equal(release.publication.runtime.version, "2026.11.07.3");
  assert.equal(
    release.reference.stateSha256,
    hubDocumentHash({ source, routes }),
  );
  assert.equal(release.files.length, 3);
  assert.equal(
    release.reference.url,
    HUB_PUBLIC_BASE +
      "publications/" +
      release.reference.id +
      "/publication.json",
  );
  const changed = structuredClone(source);
  changed.data.explorations.find(
    (e) => e.id === changed.data.composition.currentExplorationId,
  ).title = "A revised exhibit title";
  const next = buildHubPublication({
    documents: { source: changed, routes },
    sourceCommit: "b".repeat(40),
    publicationId: "hub-00000000-0000-4000-8000-000000000002",
  });
  assert.notEqual(next.reference.snapshotId, release.reference.snapshotId);
  assert.deepEqual(next.publication.runtime, release.publication.runtime);
});
test("selection enforces channel, publication location and reviewed runtime", () => {
  for (const change of [
    { channel: "production" },
    { generation: 0 },
    { runtimeFingerprint: "0".repeat(64) },
    {
      publication: {
        ...selection.publication,
        url: "https://other.invalid/publication.json",
      },
    },
  ])
    assert.throws(() =>
      validateHubSelection({ ...selection, ...change }, "review"),
    );
  assert.equal(selection.runtimeFingerprint, HUB_RUNTIME_FINGERPRINT);
});
test("fixed loader resolves one verified immutable publication and duplicate startup does not fetch again", async () =>
  run({}, async ({ doc, dom, context, calls }) => {
    const loaded = doc.querySelector("script[data-publication]");
    assert.ok(loaded);
    assert.equal(loaded.dataset.publication, release.reference.url);
    assert.equal(loaded.src, release.publication.runtime.bootstrap.path);
    assert.match(loaded.integrity, /^sha256-/);
    assert.equal(
      doc.querySelector("div").dataset.hrvSelectedPublication,
      release.reference.id,
    );
    vm.runInContext(code, context);
    assert.equal(calls, 2);
    dom.window.dispatchEvent(
      new dom.window.CustomEvent("hrv:page-ready", {
        detail: { pageId: "hrv-page:classroom-explorations" },
      }),
    );
  }));
test("wrong channel and modified publication leave the friendly outage without executing a runtime", async () => {
  for (const args of [
    { selectionValue: { ...selection, channel: "production" } },
    { publicationText: release.files[2].text + " " },
  ])
    await run(args, async ({ doc }) => {
      assert.equal(doc.querySelector("script[data-publication]"), null);
      assert.equal(doc.querySelector("div").dataset.hrvState, "unavailable");
      assert.equal(doc.querySelector("section").hidden, false);
    });
});

test("isolated preview escapes author text and refuses unverified preview code", () => {
  const changed = structuredClone(source);
  changed.data.explorations.find(
    (e) => e.id === changed.data.composition.currentExplorationId,
  ).title = "A </script><script>bad()</script> title";
  const script = 'document.body.dataset.preview="verified";',
    digest = sha256Text(script);
  const html = hubPreviewHtml({ source: changed, routes }, script, digest);
  assert.ok(html.includes("\\u003c/script>"));
  assert.equal(html.includes("<script>bad()"), false);
  assert.throws(() =>
    hubPreviewHtml({ source, routes }, script, "0".repeat(64)),
  );
});
