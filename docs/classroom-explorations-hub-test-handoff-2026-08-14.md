# Classroom Explorations Hub test-page handoff

Date: 2026-08-14
Status: candidate preview package only; **not authorized for live page 17**

## Immutable candidate

- Artifact commit: `2e88d949e694f822d4253027e0bda8c77ecd5ee5`
- Runtime: `2026.08.14.1`
- Publication: `pub-2026-08-14-001`
- Content snapshot: `sha256:94fd2b8a66f5ce35ac5a761add569554f5f5dc7d1e63ac4354b8aa3e72070cd0`
- Source revision recorded by the publication: `457f0113ef936ba8b822e51313b7ff1979ddf41f`
- Previous known good: `null` because this is the new clean baseline; the rejected modernization is not promoted into the new rollback lineage.

The public candidate uses the repository's existing commit-pinned jsDelivr delivery convention. The Edublogs handoff pins both the bootstrap and publication beneath the exact artifact commit. The bootstrap script also carries browser SRI (`sha256-O/ja6JE/B+NASAsvMpT1SAf3EI1+G5LS0o3Pp2frX3o=`).

## Edublogs HTML box

Use exactly `docs/edublogs-integration/classroom-explorations-hub/HTML-BOX.html` on an approved safe test page. It contains only the semantic mount, one truthful unavailable state, and a `noscript` message.

## Edublogs CSS box

Use exactly `docs/edublogs-integration/classroom-explorations-hub/CSS-BOX.css`. It styles only the unavailable state and knows nothing about repository museum internals.

## Edublogs JavaScript box

Use exactly `docs/edublogs-integration/classroom-explorations-hub/JAVASCRIPT-BOX.js`. Its only application responsibility is to locate the mount and inject the exact immutable repository bootstrap.

The pinned URLs resolve conceptually to:

```text
https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@2e88d949e694f822d4253027e0bda8c77ecd5ee5/releases/classroom-explorations-hub/runtime/2026.08.14.1/bootstrap.js

https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@2e88d949e694f822d4253027e0bda8c77ecd5ee5/releases/classroom-explorations-hub/publications/pub-2026-08-14-001/publication.json
```

Publication-relative runtime/content paths remain under that same immutable commit.

## Real-host preview gate

Before page 17 is touched, the candidate must be pasted onto the already approved safe Edublogs test surface and checked:

1. signed out in a normal browser;
2. signed in as an editor;
3. desktop, tablet, and phone widths;
4. keyboard navigation and visible focus;
5. Reduced Effects toggle and system Reduced Motion;
6. Current Exploration link to Zinnia;
7. TWWL Coming Soon truthfulness;
8. empty current-year Past galleries;
9. 2025–2026 archive Coming Soon state;
10. real YouTube privacy-enhanced embed;
11. real Zinnia image delivery;
12. host full-width behavior under Amadeus;
13. deliberate bootstrap/publication failure leaves the friendly fallback instead of partial museum DOM;
14. no horizontal overflow or host-selector leakage.

If the existing safe Edublogs test page cannot be identified with certainty, stop and identify it before installation. Do not create a second permanent Hub and do not use page 17 as the first real-host preview surface.

## Live cutover after approval

Only after Arctic/Poppet approval:

1. preserve the current page-17 three-box values for immediate host-level restoration;
2. replace page 17's HTML/CSS/JavaScript boxes with the exact approved three-block package;
3. verify signed-out render and all critical destinations;
4. record `pub-2026-08-14-001` as the first accepted publication of the new lineage;
5. for subsequent accepted publications, set `previousKnownGoodPublication` to the immediately prior accepted new-system publication.

The old `.2-.6` experiment remains recoverable from Git history, not as the new Hub's previous-known-good publication.
