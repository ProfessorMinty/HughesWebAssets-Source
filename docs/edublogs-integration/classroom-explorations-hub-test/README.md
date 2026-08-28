# Classroom Explorations Hub review doorway

This directory contains the three blocks intended for the Edublogs review page at:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

It is deliberately separate from the production Hub doorway on page `17`.

## Ownership boundary

Edublogs owns only:

1. the semantic mount element;
2. the friendly confused-puppy outage card;
3. the minimal CSS required to display that card;
4. the tiny JavaScript handoff that loads the repository application.

The repository owns the Hub authoring source, route contract, Lanternworks control manifest, application runtime, responsive presentation, validation, and future immutable publication pipeline.

The persistent HRV Reduced Effects preference/control belongs to the global site shell. The Hub review runtime must not render a competing page-local control or persist a private effects preference.

## Current review release

```text
2026.08.28.2-review
```

The review handoff loads:

```text
apps/classroom-explorations-hub/src/runtime-v3.js
apps/classroom-explorations-hub/src/hub-v3.css
```

This review correction widens the desktop exhibit composition, applies the native Amadeus typography baseline to reading/structural text, raises small text sizes, and removes the Hub-local Reduced Effects control.

## Paste order

1. Paste `HTML-BOX.html` into the page HTML field.
2. Paste `CSS-BOX.css` into the page CSS field.
3. Paste `JAVASCRIPT-BOX.js` into the page JavaScript field.
4. Save or update page `2589` only.
5. Open `/hub-test/` in a signed-out browser window and verify the 1920×911 desktop reference plus tablet and phone behavior.

The HTML and CSS outage-card blocks are unchanged from review release `2026.08.28.1-review`. When upgrading an existing page-2589 installation, only the JavaScript field needs to be replaced.

## Review-channel warning

The JavaScript block intentionally points at the review branch `hub-authoring-v2-2026-08-28`. This makes page `2589` a branch-backed laboratory doorway. It must not be copied to page `17`.

After the Hub contract, runtime, and visual implementation are accepted, the production integration must be replaced with an exact immutable commit and publication reference. Branch-backed loading is for review only.

## Failure behavior

The outage card is the complete host-level fallback. The repository bootstrap hides it during startup and replaces the mount only after the Hub source, routes, control manifest, runtime, and styles have loaded successfully. Any startup failure restores the preserved card.
