# Classroom Explorations Hub approved desktop doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Current desktop immutable publication

```text
Asset commit:       ea8981f4792130d5e1666e80f64cd36db184f7fd
Source revision:    7f595de4c2a1c752b83d43004999ce518987f1b2
Runtime version:    2026.08.30.7
Publication:        pub-2026-08-30-007
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-14-005
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, the projected content manifest, and all three presentation-artwork files, then mounts the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.30.7/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-30-007/publication.json
  -> verified runtime.js
  -> verified hub.css
  -> verified host-compat.css
  -> verified past-explorations.webp
  -> verified past-twwl.webp
  -> verified past-years.webp
  -> verified content/.../manifest.json
```

There is no mutable branch URL, review bootstrap, alternate runtime, split application stylesheet set, or nested `@import` in this doorway.

## Composition and typography acceptance evidence

The exact asset commit passed push run `33344265585` and pull-request run `33344267557`. All ten immutable jsDelivr GETs returned HTTP `200`, and the remote bytes and SHA-256 digests matched the local bootstrap, runtime, application stylesheet, host stylesheet, runtime release record, three artwork files, publication, and content manifest.

The immutable CDN publication was exercised in a real browser at an exact `1920×911` viewport with real external media. The supplied stitched annotation was used as a relationship map rather than a scale drawing. Acceptance included:

- a coherent `78px` identity/global-menu rail with the six requested site destinations and an active Classroom Explorations state;
- equal `929×420px` Welcome/video and Current Exploration primary cards separated by a `14px` gutter;
- a substantial `653×367px` Welcome video with its native `16:9` aspect ratio, integrated into the Welcome card rather than presented as a thumbnail;
- a broad `1558×304px` Current TWWL room below the primary row, including a `1196×219px` lantern visual extended leftward across the available canvas;
- exactly three equal `300×95px` artwork-backed doors for Past Explorations, Past TWWL, and Past Years in the right rail;
- a four-row desktop board with a `39px` footer and a document height of exactly `911px`, keeping the entire primary Hub visible without vertical or horizontal overflow;
- a full-page desktop typography system using a deterministic Georgia/Cambria display stack and a system-UI reading stack, with only real `400`, `600`, and `700` weights;
- readable role floors across the identity rail, navigation, Welcome, Current Exploration, Current TWWL, history doors, dialogs, metadata, controls, and footer, with no visible text below `10.5px` at the verified viewport;
- fully visible Welcome, Current Exploration, and Current TWWL summaries rather than accidental line clamps;
- real Zinnia photography and all three teacher-approved history-button images with nonzero natural dimensions;
- no emoji media substitutions;
- one application style and one host style;
- no alternate review assets;
- the existing star, aurora, compass, screen, greenhouse, lantern, botanical, hover, pointer, visibility-pausing, and cleanup architecture preserved and covered by tests;
- the browser's OS-level reduced-motion preference honored without a Hub-local override;
- no Hub-local Reduced Effects control;
- zero horizontal overflow;
- all six global URLs verified exactly;
- all three archive dialogs opened and closed successfully, restored focus to their launch button, and retained the canonical `3/5/1` child-link sets;
- gallery filtering exercised successfully inside the archive dialogs;
- the palette and mobile visual system left outside this release's redesign scope.

## Editor update boundary

Do not change page `17`. Do not change page `2589` HTML or CSS for this release.

When Arctic is authorized to update Edublogs, replace only the page-2589 JavaScript field with `JAVASCRIPT-BOX.js`.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
