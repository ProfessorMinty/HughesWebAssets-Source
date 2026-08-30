# Classroom Explorations Hub single-canvas desktop doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Single-canvas desktop immutable publication

```text
Asset commit:       028b01cf00b6bbe124640f61e0841f3dd490e0ab
Source revision:    3af2d1b9b2b4c1c52c5aee9394d334821397f91b
Runtime version:    2026.08.30.4
Publication:        pub-2026-08-30-004
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-14-005
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, and the projected content manifest, then mounts the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.30.4/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-30-004/publication.json
  -> verified runtime.js
  -> verified hub.css
  -> verified host-compat.css
  -> verified content/.../manifest.json
```

There is no mutable branch URL, review bootstrap, alternate runtime, split application stylesheet set, or nested `@import` in this doorway.

## Single-canvas desktop acceptance evidence

The exact asset commit passed push run `33310751813` and pull-request run `33310754121`. Local and remote jsDelivr bytes matched for the bootstrap, runtime, application stylesheet, host stylesheet, runtime release record, publication, and content manifest.

The real projected application was exercised in a browser at `1920×911` with real external media. Acceptance included:

- a bounded twelve-column, four-row exploration board with every major experience visible together;
- a dominant image-led Current Exploration at `922px × 428px`, with its complete copy and action over the left side of the repository-owned Zinnia image;
- compact, staggered `455px`-wide Welcome and Learning Lantern support rails ending at `y=518.3` and `y=502.6` respectively;
- three Past Exploration images, five Past TWWL images, and Previous School Years sharing the `y=566–838` lower gallery row;
- the compact footer ending at `y=889`, with exact document and viewport dimensions of `1920×911` and no vertical museum tour at the acceptance canvas;
- real Zinnia photography plus all eight gallery images with nonzero natural dimensions;
- no emoji media substitutions;
- one application style and one host style;
- no alternate review assets;
- the existing star, aurora, compass, screen, greenhouse, lantern, botanical, hover, pointer, visibility-pausing, and cleanup architecture preserved byte-for-byte in `runtime.js`;
- the browser's OS-level reduced-motion preference honored without a Hub-local override;
- no Hub-local Reduced Effects control;
- zero horizontal overflow;
- Museum Map focus order and gallery filtering exercised successfully;
- responsive no-overflow checks at `2560×1440`, `1920×911`, `1728×900`, `1536×864`, `1440×900`, `1330×900`, `1024×768`, and `390×844`.

## Editor update boundary

Do not change page `17`. Do not change page `2589` HTML or CSS for this release.

When Arctic is authorized to update Edublogs, replace only the page-2589 JavaScript field with `JAVASCRIPT-BOX.js`.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
