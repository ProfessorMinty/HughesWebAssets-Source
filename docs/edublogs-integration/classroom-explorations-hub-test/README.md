# Classroom Explorations Hub panoramic desktop doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Panoramic desktop immutable publication

```text
Asset commit:       47eab7374968ffd1896dca7c4fd3a19dff1fb96b
Source revision:    5e2db1aea9d6447e508f7e2e04c74815f25c776c
Runtime version:    2026.08.30.3
Publication:        pub-2026-08-30-003
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-14-005
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, and the projected content manifest, then mounts the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.30.3/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-30-003/publication.json
  -> verified runtime.js
  -> verified hub.css
  -> verified host-compat.css
  -> verified content/.../manifest.json
```

There is no mutable branch URL, review bootstrap, alternate runtime, split application stylesheet set, or nested `@import` in this doorway.

## Panoramic desktop acceptance evidence

The exact asset commit passed push run `33306230579` and pull-request run `33306232487`. Local and remote jsDelivr bytes matched for the bootstrap, runtime, application stylesheet, host stylesheet, runtime release record, publication, and content manifest.

The real projected application was exercised in a browser at `1920×911` with real external media. Acceptance included:

- a twelve-column panoramic desktop stage with Welcome, Current Exploration, and Current TWWL visible together;
- Current Exploration at `906.9px` wide, twice the `446.3px` width of each supporting region;
- all three current regions ending at `y=895.7` inside the `911px` acceptance viewport;
- total document height reduced from the `.2` baseline of `4721px` to `1607px`;
- three Past Exploration images and five Past TWWL images in two dense, simultaneous gallery rows;
- real Zinnia photography plus all eight gallery images with nonzero natural dimensions;
- no emoji media substitutions;
- one application style and one host style;
- no alternate review assets;
- the existing star, aurora, compass, screen, greenhouse, lantern, botanical, hover, pointer, visibility-pausing, and cleanup architecture preserved byte-for-byte in `runtime.js`;
- the browser's OS-level reduced-motion preference honored without a Hub-local override;
- no Hub-local Reduced Effects control;
- zero horizontal overflow;
- Museum Map anchors and both gallery filters exercised successfully;
- responsive no-overflow checks at `1920×768`, `1440×800`, `1439×800`, `1330×800`, `1024×768`, `720×900`, `390×844`, and `320×568`;
- no browser console warnings or errors.

## Editor update boundary

Do not change page `17`. Do not change page `2589` HTML or CSS for this release.

When Arctic is authorized to update Edublogs, replace only the page-2589 JavaScript field with `JAVASCRIPT-BOX.js`.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
