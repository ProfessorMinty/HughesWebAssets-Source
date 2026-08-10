# Classroom Explorations Hub construction-hold implementation

Date: 2026-08-10

## Purpose

Temporarily preserve the strongest approved public portion of Hub release `2026.08.10.6` while preventing unfinished lower museum sections from appearing public.

## Approved public cutoff

Keep visible:

1. Museum entrance / hero.
2. Welcome Theater.
3. Summer Bloom Adoption Project / Zinnia Featured Exhibit.
4. Large construction notice immediately after the current-exhibit floor.

Temporarily hide:

- Learning Lantern / current TWWL chamber;
- crystalline threshold;
- current-year Past Explorations gallery;
- current-year Past This Week We Learned gallery;
- Previous School Years archive portal;
- lower museum footer/confetti area.

## Implementation strategy

This hold intentionally does **not** alter immutable museum release `2026.08.10.6`.

The page-local Edublogs CSS integration file contains a temporary construction curtain that activates only after the repository mount reaches the route-ready state. It hides the unfinished lower `.6` sections and inserts a large visual Under Construction notice after `.museum-now-floor`.

The native HTML fallback also contains a large construction notice, so a repository load failure remains intentional and useful rather than appearing broken.

The page-local JavaScript loader remains the Black-Hole-style repository loader and continues to point to immutable `.6`.

This is a deliberate emergency/hold exception to the normal rule that the CSS tab contains fallback styling only. It must not become permanent presentation architecture. When lower museum work resumes, remove the construction-curtain selectors from `CSS-BOX.css` rather than layering new museum presentation into Edublogs.

## Why the renderer is not deleted

The lower `.6` renderer methods and repository CSS remain source-preserved. They represent unfinished work to be repaired later, not discarded content. The construction hold is reversible and should not destroy the existing museum implementation.

## Removal gate

Do not remove the hold until all of the following are true:

- ambient motion is understood and works in normal-motion mode;
- reduced-motion behavior is independently validated;
- below-Zinnia hierarchy is rebuilt as intentional museum rooms;
- scroll-triggered reveals work when sections enter the viewport;
- desktop, tablet, phone, keyboard, and signed-out checks pass;
- public CDN delivery is verified;
- fallback behavior is verified;
- the lower museum no longer reads as unfinished or broken.

## Live Edublogs fields during hold

- HTML tab: `docs/edublogs-integration/classroom-explorations-hub/HTML-BOX.html`
- CSS tab: `docs/edublogs-integration/classroom-explorations-hub/CSS-BOX.css`
- JavaScript tab: `docs/edublogs-integration/classroom-explorations-hub/JAVASCRIPT-BOX.js`

The JavaScript tab remains a tiny repository loader. The actual museum remains repository-owned.
