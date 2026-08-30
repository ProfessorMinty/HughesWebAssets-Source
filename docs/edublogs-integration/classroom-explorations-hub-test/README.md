# Classroom Explorations Hub panoramic desktop doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Panoramic desktop immutable publication

```text
Asset commit:       eb335004b637433315a0de2fb69677e7e272a07d
Source revision:    913ab1e5f76942b5a022710fed4c3565ad5b1441
Runtime version:    2026.08.30.5
Publication:        pub-2026-08-30-005
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-14-005
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, and the projected content manifest, then mounts the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.30.5/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-30-005/publication.json
  -> verified runtime.js
  -> verified hub.css
  -> verified host-compat.css
  -> verified content/.../manifest.json
```

There is no mutable branch URL, review bootstrap, alternate runtime, split application stylesheet set, or nested `@import` in this doorway.

## Panoramic primary-canvas acceptance evidence

The exact asset commit passed push run `33333485668` and pull-request run `33333486937`. All seven immutable jsDelivr GETs returned HTTP `200`, and the remote bytes and SHA-256 digests matched the local bootstrap, runtime, application stylesheet, host stylesheet, runtime release record, publication, and content manifest.

The real projected application was exercised in a browser at an exact `1920×911` viewport with the Amadeus-equivalent `10px` root font and real external media. Acceptance included:

- a coherent `86px` orientation rail combining the Hub identity with six equal Museum Map landmarks;
- a complete primary row containing Welcome/video, Current Exploration, and Learning Lantern within the first viewport;
- a dominant image-led Current Exploration measuring `914.5px` wide, supported by a `605.66px` Welcome region and a `296.84px` Learning Lantern;
- a full-width `579.66px` Welcome video with a reserved `1.778` aspect ratio rather than a detached thumbnail;
- Past Explorations and Past TWWL beginning at `y=728`, visibly signaling the intentional historical continuation below the primary canvas;
- a document height of `1243px` against the `911px` viewport, limiting the secondary gallery/archive continuation to about `332px` of vertical scrolling;
- exact layout parity between `10px` and `16px` root-font fixtures, with a maximum measured box delta of `0`;
- real Zinnia photography plus all eight gallery images with nonzero natural dimensions;
- no emoji media substitutions;
- one application style and one host style;
- no alternate review assets;
- the existing star, aurora, compass, screen, greenhouse, lantern, botanical, hover, pointer, visibility-pausing, and cleanup architecture preserved byte-for-byte in `runtime.js`;
- the browser's OS-level reduced-motion preference honored without a Hub-local override;
- no Hub-local Reduced Effects control;
- zero horizontal overflow;
- Museum Map focus order and gallery filtering exercised successfully.

## Editor update boundary

Do not change page `17`. Do not change page `2589` HTML or CSS for this release.

When Arctic is authorized to update Edublogs, replace only the page-2589 JavaScript field with `JAVASCRIPT-BOX.js`.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
