# Classroom Explorations Hub review doorway

This directory contains the three Edublogs blocks for the active review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched and is not the visual, layout, typography, copy, or interaction reference for this work. The reconstructed repository application supersedes that archaic presentation.

## Ownership boundary

Edublogs owns only:

1. the semantic mount element;
2. a small friendly unavailable card;
3. the minimal CSS needed to display that card;
4. the tiny JavaScript handoff that loads the repository application.

The repository owns the Hub source, route contract, Lanternworks control manifest, application runtime, responsive presentation, validation, and future immutable publication pipeline.

The persistent HRV Reduced Effects control and preference belong to the global site shell. The Hub must not create a competing page-local control or private effects preference.

## Current review release

```text
2026.08.29.4-review
```

The review handoff loads:

```text
apps/classroom-explorations-hub/src/runtime-v3.js
apps/classroom-explorations-hub/src/hub-v3.css
```

`hub-v3.css` is now only the entry point for the active standalone module set:

```text
hub-foundation.css
hub-hero-and-map.css
hub-feature-rooms.css
hub-galleries-and-motion.css
hub-responsive.css
```

It does not import `hub-v2.css` or any other retired visual layer.

This revision:

- preserves the established order Hero → Welcome Theater → Current Exploration;
- retains the real Zinnia photograph and the current Hub manifest;
- keeps the corrected 1920×911 desktop density without oversized mission-control rooms;
- uses the viewport laterally through asymmetric rooms and multi-column galleries;
- gives the Welcome Theater surrounding museum context rather than a giant isolated video;
- replaces the old inline animal SVG with a neutral museum-guide asset/fallback;
- uses approved NLL Runtime Assets as decorative ingredients only;
- introduces genuinely drifting and softly breathing star layers;
- leaves page 17 untouched.

## Paste order

For this release, replace **all three** page-2589 editor blocks because the host fallback changed as well as the repository handoff:

1. Replace the HTML field with `HTML-BOX.html`.
2. Replace the CSS field with `CSS-BOX.css`.
3. Replace the JavaScript field with `JAVASCRIPT-BOX.js`.
4. Save/update page `2589` only.
5. Review `/hub-test/` at 100% zoom in the real 1920×911 desktop viewport, then tablet, phone, keyboard, and 300% zoom.

The JavaScript also removes the former inline animal SVG defensively if stale Edublogs content survives a paste/cache cycle.

## Review-channel warning

The JavaScript block intentionally points at the existing review branch `hub-authoring-v2-2026-08-28`. No new branch is required for incremental Hub work. The branch-backed doorway is temporary and must not be copied to page `17`.

After the contract, runtime, and visual implementation are accepted, production must use an exact immutable commit/publication reference.

## Failure behavior

The unavailable card is the complete host-level fallback. The repository bootstrap hides it during startup and replaces the mount only after the source, routes, control manifest, runtime, and styles load successfully. Any startup failure restores the preserved card.
