# Classroom Explorations Hub page-17 review handoff

Date: 2026-08-14
Status: permanent Hub implementation ready for human review on real page 17

## Immutable implementation

- Artifact commit: `1dc599dea9ae5caf01600292f153681009962ee7`
- Runtime: `2026.08.14.3`
- Publication: `pub-2026-08-14-003`
- Content snapshot: `sha256:ba5664964d1f228a203ac177f92c160d73e70ee56342c9a505a6805a01cc8102`
- Source revision: `c399dd3bbc58017184e43303bad47bbff5fe386c`
- Previous known good: `null`

Publications 001 and 002 remain immutable unaccepted preview evidence. Neither is promoted into production rollback ancestry.

## Review surface

This first Hub standardization is reviewed directly on the permanent WordPress page:

- WordPress page ID: `17`
- Route: `/classroom-explorations/`
- Template evidence: `page_fullwidth.php`

The earlier `/asdf-test/` workflow is superseded. Do not recreate a parallel Hub or candidate implementation.

Before this rebuild, the installed page-17 doorway was preserved in `docs/edublogs-integration/classroom-explorations-hub/page17-preservation-2026-08-14.json`. If emergency restoration is required before the new publication is accepted, restore the exact three preserved boxes as one matched set.

## Edublogs doorway

Use the checked-in three-box files exactly:

- `docs/edublogs-integration/classroom-explorations-hub/HTML-BOX.html`
- `docs/edublogs-integration/classroom-explorations-hub/CSS-BOX.css`
- `docs/edublogs-integration/classroom-explorations-hub/JAVASCRIPT-BOX.js`

The HTML and CSS remain intentionally tiny. Application markup, museum styling, viewport breakout, animations, and host compatibility stay repository-owned.

The JavaScript box points to the exact immutable artifact commit and loads:

```text
runtime/2026.08.14.3/bootstrap.js
publications/pub-2026-08-14-003/publication.json
```

Bootstrap SRI remains:

```text
sha256-O/ja6JE/B+NASAsvMpT1SAf3EI1+G5LS0o3Pp2frX3o=
```

## What this build preserves and modernizes

The selected historical Hub is the visual/compositional baseline. The permanent renderer preserves the recognizable sequence:

Hero → Welcome Theater → Current Exploration → Current TWWL → decorative divider → Past Explorations → Past TWWL → compact Previous School Years → footer.

The implementation preserves the compass/discovery identity, card-based furniture, green Exploration family, purple TWWL family, strong Current/Learning/Past hierarchy, gallery filters, subject-specific card identities, separate Welcome Theater, and warm populated character while replacing the historical inline/hybrid architecture with the accepted repository-owned system.

The museum building around those sections is now full-viewport and code-native: atmospheric indigo lobby, aurora/stars, warm exhibit lighting, luminous glass, greenhouse Current treatment, Learning Lantern treatment, subject effects, responsive grids, explicit Reduced Effects, and repository-owned Amadeus surface neutralization.

## Intentional populated review state

Current truth remains:

- Current Exploration: Summer Bloom Adoption Project / Zinnia, `2026-2027`
- Current TWWL: truthful `coming-soon`

For this human visual-review phase, the actual Hub also keeps recovered historical content visibly populated while preserving true `2025-2026` metadata:

Past Explorations:
- Great Barrier Reef
- Mushrooms
- historical Caterpillars-labelled destination associated with WordPress page 691

Past learning:
- Botany: Let’s Talk About Tubers
- The Traditions of Russian Winter
- Silent Wings, Wise Eyes: Learning About Owls
- Bats Don’t Go Bump in the Night
- Autumn Spiders: Gentle Web Artists

After Arctic and Poppet approve the permanent visual model, appropriate older material can move behind Previous School Years through composition without mutating content identity or school-year facts.

## Real page-17 acceptance pass

Inspect the actual page, not a standalone/local substitute. Verify:

1. normal Edublogs header/navigation remains intact above the Hub;
2. repository museum begins edge-to-edge beneath it, with no beige/white Amadeus frame;
3. no horizontal scrollbar at desktop, laptop, tablet, or phone widths;
4. Hero is recognizable, readable, and not oversized;
5. Welcome Theater is a distinct section;
6. Current Zinnia is visually dominant and its real image/link work;
7. Current TWWL reads as intentional anticipation, not a broken empty card;
8. decorative divider is visible and coherent;
9. both populated galleries are easy to scan and filter;
10. each recovered subject retains distinct visual identity;
11. every historical visible card shows truthful `2025–2026` context;
12. Previous School Years remains compact/subordinate;
13. keyboard navigation and focus are clear;
14. Reduced Effects control works and persists;
15. OS reduced-motion preference suppresses motion without silently changing the explicit HRV Reduced Effects state;
16. signed-in admin bar does not break breakout geometry;
17. signed-out rendering is correct;
18. video is responsive;
19. duplicate init, teardown/remount, and friendly fallback remain intact.

## Approval semantics

CI and contract tests establish engineering readiness only. They do not constitute art-direction approval.

Arctic and Poppet remain the human visual/product approval authority. Publication 003 becomes the first accepted production publication only after the real page-17 result is approved. Until then, `previousKnownGoodPublication` remains `null` and the preserved pre-rebuild page-17 doorway remains the immediate restoration anchor.
