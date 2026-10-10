# Classroom Explorations Hub approved responsive doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Current release package — 2026-10-10

Installed on HUB TEST (Page 2589) on 2026-10-10. Reloaded editor fields, public HTTP pin/SRI, live responsive states, and restoration evidence are verified in [the installation record](../../classroom-explorations-live-installation-2026-10-10.md). Page 17 is not installed with this release. Current-year history still contains the temporary 2025–2026 placements pending the next content-migration gate.

Asset commit `f2381f5b9e284e87e17c3b45b25f381a55663c1c`; source `4e1631c45aefcd3b9d637e7760cc89ea8a05bb08`; runtime `2026.10.10.2`; publication `pub-2026-10-10-002`; previous known good `pub-2026-08-31-002`. The content snapshot and all approved artwork are unchanged.

Push Hub CI `38081902272` and pull-request Hub CI `38081905400` passed, including Linux geometry and Windows native zoom. Archive CI `38081905343` passed. Exact GET-and-byte proof for all 16 dependency files is `evidence/classroom-explorations-hub/release-2026-10-10/cdn-byte-verification.json`. The September repair and October portability notes describe the changes; the historical measurements below are not measurements of this release.

Regenerate the current JavaScript and release pin with:

```text
node tools/generate-classroom-explorations-hub-doorway.mjs f2381f5b9e284e87e17c3b45b25f381a55663c1c 2026.10.10.2 pub-2026-10-10-002 evidence/classroom-explorations-hub/release-2026-10-10/cdn-byte-verification.json
```

This release requires the current HTML, CSS, and generated JavaScript fields together on Page 2589: its host fallback CSS now uses pixel sizing so it cannot be distorted by Amadeus's 10px root. Preserve/restore the exact prior editor capture in `evidence/classroom-explorations-hub/pre-install-2026-10-10/`. WordPress may reorder HTML attributes, serialize empty attributes, and strip the trailing field newline; compare normalized HTML structure and exact CSS/JavaScript after that known trailing-newline normalization. Installation and live acceptance are recorded separately from repository/CI/CDN proof.

Page 17 remains untouched. Do not paste the `.template.js` file.

## Historical August responsive publication

```text
Asset commit:       b372871d9ff882eed37260da8a98c8c85a861363
Source revision:    1379f289911c804b105d3761d44f56a02a607a3f
Runtime version:    2026.08.31.2
Publication:        pub-2026-08-31-002
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-30-008
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, the projected content manifest, three archive-button images, and all six banner-frame images before mounting the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.31.2/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-31-002/publication.json
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

The exact asset commit passed push run `33465446656` and pull-request run `33465450144`. All sixteen immutable jsDelivr GETs returned HTTP `200`, and the remote bytes and SHA-256 digests matched the local bootstrap, runtime, application stylesheet, host stylesheet, runtime release record, three archive-button images, six banner-frame images, publication, and content manifest.

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
- below `1440px`, all six frame pieces remained absolutely positioned page chrome at the left and right edges instead of entering document flow;
- the three archive doors remained equal at every responsive checkpoint in the immutable CDN harness: approximately `370×185px` in the `390px` one-column phone layout, `233.3×116.7px` at `768px`, `304×152px` at the `980px` wide-layout phone/narrow-browser case, and `418.7×209.3px` at `1366px`;
- phone, tablet, wide-layout mobile, and narrowed desktop geometry passed at `390`, `719`, `720`, `721`, `768`, `980`, `1024`, `1179`, `1180`, `1181`, `1330`, `1331`, `1366`, `1439`, `1440`, and `1920px`;
- a live `1920→1366→980→768→390→1920` resize round trip retained absolute frame positioning, equal archive-door heights, and zero horizontal overflow at every step;
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
- the star fields reversed continuously at their exact endpoints, preserving the existing motion architecture without a visible loop reset;
- the palette and any broader mobile visual redesign remained outside this targeted responsive repair.

At `1440×911`, the same hierarchy remains contained and readable: both primary cards are approximately `681.5×516.4px`, Current copy has equal `478px` client and scroll heights, and the page intentionally uses about `90px` of vertical continuation instead of shrinking or clipping the exhibits.

Runtime `2026.08.30.7` and publication `pub-2026-08-30-007` remain immutable rejected visual evidence. They are not the rollback target and were not modified or reused by this release.

Runtime `2026.08.31.1` and publication `pub-2026-08-31-001` remain immutable intermediate evidence for the star-loop repair. The responsive `.2` publication supersedes them for the review doorway; neither intermediate artifact is the rollback target.

## Editor update boundary

The August JS-only update boundary below has been superseded by the explicitly authorized October all-three-field Page 2589 installation. Page 17 is still excluded.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
