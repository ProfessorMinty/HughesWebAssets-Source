# Classroom Explorations Hub review doorway

This directory contains the three Edublogs blocks for the active review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` is not the visual, layout, typography, copy, or interaction reference for this work. The reconstructed repository application supersedes that archaic presentation.

## Ownership boundary

Edublogs owns only:

1. the semantic mount element;
2. the friendly confused-puppy outage card;
3. the minimal CSS needed to display that card;
4. the tiny JavaScript handoff that loads the repository application.

The repository owns the Hub source, route contract, Lanternworks control manifest, application runtime, responsive presentation, validation, and future immutable publication pipeline.

The persistent HRV Reduced Effects control and preference belong to the global site shell. The Hub must not create a competing page-local control or private effects preference.

## Current review release

```text
2026.08.28.3-review
```

The review handoff loads:

```text
apps/classroom-explorations-hub/src/runtime-v3.js
apps/classroom-explorations-hub/src/hub-v3.css
```

This revision keeps the accepted dark museum art direction while correcting the over-maximized desktop scale exposed by the real `/hub-test/` recording:

- the common desktop target is a 1920×911 browser viewport at 100% zoom;
- a complete major room should fit without requiring browser zoom-out;
- the Current Exploration remains dominant but no longer occupies the whole viewport;
- the Welcome Theater presents the video inside a surrounding orientation room rather than as a nearly edge-to-edge screen;
- the Hero, section headings, cards, and copy use a compact but readable hierarchy;
- Past TWWL uses two learning cabinets per desktop row to reduce page length;
- the environment remains full width while room content uses deliberate internal bounds;
- mobile, tablet, high-zoom, keyboard, and reduced-motion safety behavior remain required.

## Paste order

1. Paste `HTML-BOX.html` into the page HTML field.
2. Paste `CSS-BOX.css` into the page CSS field.
3. Paste `JAVASCRIPT-BOX.js` into the page JavaScript field.
4. Save or update page `2589` only.
5. Review `/hub-test/` at 100% zoom in the real desktop viewport, then tablet, phone, keyboard, and 300% zoom.

The HTML and fallback CSS are unchanged. Upgrading from the previous review requires replacing only the JavaScript field.

## Review-channel warning

The JavaScript block intentionally points at the existing review branch `hub-authoring-v2-2026-08-28`. No new branch is required for incremental Hub work. The branch-backed doorway is temporary and must not be copied to page `17`.

After the contract, runtime, and visual implementation are accepted, production must use an exact immutable commit/publication reference.

## Failure behavior

The outage card is the complete host-level fallback. The repository bootstrap hides it during startup and replaces the mount only after the source, routes, control manifest, runtime, and styles load successfully. Any startup failure restores the preserved card.
