# Classroom Explorations Hub approved desktop doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Current desktop immutable publication

```text
Asset commit:       b353fb98fcf76ef2f6e2ad5771b52012c8068ba3
Source revision:    a36627dc20d9408b825ae80efbe2b289df550e6c
Runtime version:    2026.08.30.8
Publication:        pub-2026-08-30-008
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-14-005
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, the projected content manifest, three archive-button images, and all six banner-frame images before mounting the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.30.8/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-30-008/publication.json
  -> verified runtime.js
  -> verified hub.css
  -> verified host-compat.css
  -> verified past-explorations.webp
  -> verified past-twwl.webp
  -> verified past-years.webp
  -> verified top-left.webp / top-right.webp
  -> verified middle-left.webp / middle-right.webp
  -> verified bottom-left.webp / bottom-right.webp
  -> verified content/.../manifest.json
```

There is no mutable branch URL, review bootstrap, alternate runtime, split application stylesheet set, or nested `@import` in this doorway.

## Composition and typography acceptance evidence

The exact asset commit passed push run `33355650550` and pull-request run `33355654612`. All sixteen immutable jsDelivr GETs returned HTTP `200`, and the remote bytes and SHA-256 digests matched the local bootstrap, runtime, application stylesheet, host stylesheet, runtime release record, three archive-button images, six banner-frame images, publication, and content manifest.

The immutable CDN publication was exercised in a real browser at an exact `1920×911` viewport with real external media. The supplied stitched annotation was used as a relationship map rather than a scale drawing. Acceptance included:

- a coherent `88px` identity/global-menu rail with the six requested site destinations and an active Classroom Explorations state;
- equal `921.5×480px` Welcome/video and Current Exploration primary cards separated by a `14px` gutter;
- a substantial `638.8×359.3px` Welcome video with its native `16:9` aspect ratio, integrated into the Welcome card rather than presented as a thumbnail;
- a broad `1545.2×300px` Current TWWL room below the primary row, including a `1082.2×262px` lantern visual extended across the available canvas;
- exactly three equal, unchanged `297.8×93.3px` artwork-backed doors for Past Explorations, Past TWWL, and Past Years in the right rail;
- an opening desktop composition ending at `y=910` in the exact `1920×911` viewport, with only the supporting footer below the fold and zero horizontal overflow;
- a full-page desktop typography system using a deterministic Georgia/Cambria display stack and a system-UI reading stack, with only real `400`, `600`, and `700` weights;
- a `32px` Hub identity, `15px` identity subtitle, `14–15px` global navigation, `16px` body copy and learning points, and aligned `13px` pills/captions at the verified viewport;
- fully visible Welcome, Current Exploration, and Current TWWL summaries rather than accidental line clamps;
- a Current copy pane with equal `442px` client and scroll heights, keeping the title, points, tags, and call to action inside the card;
- real Zinnia photography and all three teacher-approved history-button images with nonzero natural dimensions;
- all six supplied frame pieces loaded at `362×1086` natural dimensions and stitched as contained page chrome;
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

At `1440×911`, the same hierarchy remains contained and readable: both primary cards are approximately `681.5×516.4px`, Current copy has equal `478px` client and scroll heights, and the page intentionally uses about `90px` of vertical continuation instead of shrinking or clipping the exhibits.

Runtime `2026.08.30.7` and publication `pub-2026-08-30-007` remain immutable rejected visual evidence. They are not the rollback target and were not modified or reused by this release.

## Editor update boundary

Do not change page `17`. Do not change page `2589` HTML or CSS for this release.

When Arctic is authorized to update Edublogs, replace only the page-2589 JavaScript field with `JAVASCRIPT-BOX.js`.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
