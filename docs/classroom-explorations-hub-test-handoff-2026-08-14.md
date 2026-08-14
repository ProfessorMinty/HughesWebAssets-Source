# Classroom Explorations Hub test-page handoff

Date: 2026-08-14
Status: corrected real-host preview candidate only; **not authorized for live page 17**

## Corrected immutable candidate

- Artifact commit: `55e8e0161e8bf8de1ca98390d59fe9742b0cbc03`
- Runtime: `2026.08.14.2`
- Publication: `pub-2026-08-14-002`
- Content snapshot: `sha256:94fd2b8a66f5ce35ac5a761add569554f5f5dc7d1e63ac4354b8aa3e72070cd0`
- Source revision recorded by the publication: `f6e228283be601a63ab3f458f6b5209981c803fa`
- Previous known good: `null`

Publication `pub-2026-08-14-001` and runtime `2026.08.14.1` remain immutable evidence of the first clean preview candidate. They failed the real Edublogs full-width/host-isolation gate and were never accepted or cut over to production. Publication 002 therefore does **not** name publication 001 as a production previous-known-good publication.

The corrected candidate changes repository host-compatibility/runtime behavior only. It reuses the exact same validated content snapshot as publication 001.

The public candidate uses the repository's existing commit-pinned jsDelivr delivery convention. The Edublogs handoff pins both the bootstrap and publication beneath the exact artifact commit. The bootstrap bytes are unchanged from candidate 001, so browser SRI remains `sha256-O/ja6JE/B+NASAsvMpT1SAf3EI1+G5LS0o3Pp2frX3o=`.

## Edublogs HTML box

Use exactly `docs/edublogs-integration/classroom-explorations-hub/HTML-BOX.html` on the existing approved `/asdf-test/` page. It contains only the semantic mount, one truthful unavailable state, and a `noscript` message.

## Edublogs CSS box

Use exactly `docs/edublogs-integration/classroom-explorations-hub/CSS-BOX.css`. It styles only the unavailable state and knows nothing about repository museum internals. **Do not add the viewport breakout or museum layout rules to this box.** Those remain repository-owned in runtime `2026.08.14.2`.

## Edublogs JavaScript box

Use exactly `docs/edublogs-integration/classroom-explorations-hub/JAVASCRIPT-BOX.js`. Its only application responsibility is to locate the mount and inject the exact immutable repository bootstrap.

The pinned URLs resolve conceptually to:

```text
https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@55e8e0161e8bf8de1ca98390d59fe9742b0cbc03/releases/classroom-explorations-hub/runtime/2026.08.14.2/bootstrap.js

https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@55e8e0161e8bf8de1ca98390d59fe9742b0cbc03/releases/classroom-explorations-hub/publications/pub-2026-08-14-002/publication.json
```

Publication-relative runtime/content paths remain under that same immutable artifact commit.

## What changed after the failed real-host preview

The first candidate's `host-compat.css` was gated by `body.page-id-17`, so the approved `/asdf-test/` preview could never activate the Amadeus resets it was meant to prove. In addition, the application canvas itself only used `width:100%`, which could not escape a constrained WordPress ancestor.

Runtime `2026.08.14.2`:

- scopes host compatibility to the repository-owned `html.hrv-page-classroom-explorations-ready` state instead of WordPress page 17;
- resets the actual Amadeus `#content.site-content.container`, content-area, site-main, entry-content, article padding/card, and sidebar constraints only while the Hub is mounted and ready;
- gives the Hub mount the previously proven `100vw / left:50% / -50vw` viewport-breakout geometry;
- leaves site header/navigation outside the affected content subtree;
- leaves internal museum reading widths and exhibit composition under the repository application CSS.

The repository CI also rejects a return to `page-id-17`-only host compatibility and requires the breakout contract.

## Required real-host re-preview on `/asdf-test/`

Before page 17 is touched, replace only the test page's three-box candidate with the exact corrected package and verify on the **real Edublogs host**:

1. genuine viewport-width environmental museum canvas;
2. no narrow Amadeus content-container imprisonment;
3. no horizontal scrollbar;
4. `Classroom Explorations` foyer title receives normal designed geometry rather than the collapsed vertical track;
5. site header/navigation above the application remains intact;
6. signed-in admin bar does not break breakout geometry;
7. signed-out rendering;
8. desktop width;
9. laptop width, especially around the Amadeus 1199 px breakpoint;
10. tablet width;
11. phone width;
12. keyboard navigation and visible focus;
13. explicit Reduced Effects and system Reduced Motion;
14. Current Exploration/Zinnia destination;
15. real YouTube privacy-enhanced embed;
16. real Zinnia image delivery;
17. truthful Current TWWL Coming Soon state;
18. empty current-year Past galleries;
19. 2025–2026 archive Coming Soon state;
20. deliberate bootstrap/publication failure restores the friendly fallback rather than partial museum DOM;
21. teardown/remount and duplicate-init behavior;
22. no unrelated-page or host-selector leakage.

Standalone/local Chromium is supporting evidence only. **The acceptance test for this correction is `/asdf-test/` on the actual Edublogs/Amadeus host.**

## Live cutover after approval

Only after Arctic/Poppet approve the corrected real-host preview:

1. preserve the current page-17 HTML/CSS/JavaScript box values for immediate host-level restoration;
2. replace page 17's three boxes with the exact approved package;
3. verify signed-out production render and critical destinations;
4. record `pub-2026-08-14-002` as the first accepted publication of the new clean lineage;
5. for the next accepted publication, set `previousKnownGoodPublication` to `pub-2026-08-14-002`.

The rejected `.2-.6` modernization and failed preview candidate 001 remain historical evidence, not production rollback ancestry.
