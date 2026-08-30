# Classroom Explorations Hub review doorway

This directory contains the Edublogs doorway blocks for the active review page:

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

The persistent HRV Reduced Effects control and preference belong to the global site shell. The Hub does not create a competing page-local control or private effects preference.

## Connected-state failure found in `.4-review`

The `.4-review` entry stylesheet named two files that did not exist and failed to name three files that contained the intended layout, button colors, footer treatment, and motion. The browser accepted the top-level stylesheet link, so the bootstrap mounted the application with only part of its CSS. That produced the observed mixed state: static star dots, mostly unchanged layout, inherited white action text, and an unrelated native footer floor.

The `.5-review` handoff removes that failure mode. It requests every required stylesheet module as an independent `<link>` and waits for all of them before mounting the application. If any required CSS module fails, the friendly unavailable card is restored instead of displaying a half-styled Hub.

## Current review release

```text
2026.08.29.5-review
```

The review handoff loads:

```text
apps/classroom-explorations-hub/src/runtime-v3.js
apps/classroom-explorations-hub/src/hub-foundation.css
apps/classroom-explorations-hub/src/hub-hero-and-map.css
apps/classroom-explorations-hub/src/hub-feature-rooms.css
apps/classroom-explorations-hub/src/hub-galleries-and-motion.css
apps/classroom-explorations-hub/src/hub-responsive.css
apps/classroom-explorations-hub/src/host-compat.css
```

`hub-v3.css` remains a source-inspection entry point containing the same correct module list, but the browser doorway does not rely on nested `@import` success.

This revision:

- preserves the established order Hero → Welcome Theater → Current Exploration;
- retains the real Zinnia photograph and current Hub manifest;
- keeps the corrected 1920×911 desktop density;
- restores the intended lateral/asymmetric room layouts and multi-column galleries;
- restores the dark text on mint primary actions;
- restores the star drift, breathing, aurora, lantern, botanical, and gallery motion definitions;
- keeps the Welcome Theater surrounded by museum context rather than becoming a giant isolated video;
- removes the old inline animal SVG from the fallback;
- uses approved NLL Runtime Assets as decorative ingredients only;
- reconciles the native Amadeus footer and back-to-top control with the dark museum environment;
- fixes the misspelled responsive root selectors;
- leaves page 17 untouched.

## Editor update boundary

The current page-2589 HTML and CSS have already been confirmed by the live review because the old inline SVG animal disappeared. Once the exact passing repository commit is pinned in `JAVASCRIPT-BOX.js`, only the JavaScript field needs to be replaced for `.5-review`.

Do not paste a branch-backed doorway into page 17. Production must use an immutable publication after the Hub is accepted.

## Failure behavior

The unavailable card is the complete host-level fallback. The repository bootstrap hides it during startup and replaces the mount only after the source, routes, control manifest, runtime, host compatibility, and every application stylesheet have loaded successfully. Any startup failure restores the preserved card.
