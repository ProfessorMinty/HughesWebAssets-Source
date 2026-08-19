# Edublogs Photo Album three-box contract

**Current visual candidate release:** `2026.08.19.1`  
**Immutable release commit:** `e524301c12b2298102a7ed59de3c8d765b39755f`  
**Host requirement:** the Edublogs Photo Album Page uses the **Full Width** page template.

The permanent law is:

> **Edublogs provides the doorway. The repository owns the room.**

The three Edublogs boxes are intentionally tiny:

1. `HTML-BOX.html` contains one stable mount plus the small friendly unavailable/check-back-later sign.
2. `CSS-BOX.css` styles only that unavailable sign. It owns no Photo Album layout, breakout, theme or animation.
3. `JAVASCRIPT-BOX.js` injects one exact immutable repository bootstrap. It contains no Photo Album application logic, construction banner, loading experience, MutationObserver, diagnostics or repository-DOM selectors.

The immutable repository bootstrap then loads:

```text
releases/photo-album/2026.08.19.1/bootstrap.js
releases/photo-album/2026.08.19.1/assets/photo-album.css
releases/photo-album/2026.08.19.1/assets/photo-album.js
```

The application consumes the existing synthetic/test Worker manifest:

```text
https://hrv-photo-album.drminty17.workers.dev/manifest.json
```

## Verified automated proof

The complete visual system was proven in release `2026.08.18.8`, then the approved album-cover sizing refinement was independently proven in `2026.08.19.1`.

The visual-system proof verified:

- all unit tests and the production build;
- no Photo Album-owned `prefers-reduced-motion` / reduced-effects branch;
- repository-owned Amadeus/viewport breakout;
- 1920x911 reference geometry with a compact Current Memories region;
- View All with 144 synthetic/test memories and no horizontal overflow;
- Pumpkin Patch, Science Museum, Mushroom Exploration and Zinnia Garden gallery routes;
- governed NL Asset IDs on the four theme worlds;
- themed gallery propagation, return navigation and lightbox opening/closing;
- phone rendering at 390x844.

The `2026.08.19.1` cover-sizing proof additionally verifies this explicit album-cover contract:

- desktop album cover width: `292px`;
- desktop album cover outer height: `340px`;
- cover portal height: `202px`;
- framed media CSS height: `164px`;
- album title: normal wrapping with a maximum of two lines instead of one-line ellipsis cropping;
- the current four albums remain on one row;
- a simulated fifth 292px album also fits the wide desktop row;
- no horizontal title clipping or vertical title clipping on the current album names;
- mobile restores the existing left-to-right horizontal shelf so the first cover begins on-screen.

Automated sizing evidence is committed under:

```text
qa/photo-album/cover-sizing-2026-08-19-v1/
```

## Real-host review procedure

1. Confirm the Edublogs Photo Album Page template is **Full Width**.
2. Replace the current page HTML, CSS and JavaScript boxes with the three files in this directory. When moving between immutable releases, HTML and CSS normally remain unchanged; the JavaScript injector is repointed to the newly approved immutable bootstrap.
3. Save/update the page.
4. Open the public Photo Album in a signed-out browser and hard refresh once.
5. Confirm the repository application replaces the tiny puppy/unavailable sign.
6. At the normal wide desktop reference, confirm the Photo Album environment reaches the viewport edges beneath normal Edublogs navigation, Current Memories is compact, View All is obvious, and album covers are not clipped.
7. Confirm long album names wrap cleanly inside the cover body rather than being cropped by the card edge.
8. Open Pumpkin Patch, Science Museum, Mushroom Exploration and Zinnia Garden; verify each gallery visually changes with its subject and keeps photographs unobscured.
9. Open a photo lightbox, navigate previous/next, close it, and confirm focus/page position recover correctly.
10. Check a phone viewport and confirm the application remains full-width while its internal composition deliberately recomposes.

Local/browser CI evidence does not substitute for this final Amadeus real-host check.

## Failure behavior

If the external bootstrap cannot start, the tiny Edublogs unavailable sign remains. The Edublogs boxes do not attempt to reconstruct a second Photo Album.

If repository bootstrap starts but the runtime fails, the immutable repository bootstrap preserves a simple repository-owned temporary-unavailable state.

## Motion ownership

The Photo Album owns its normal visual animation and Current Memories pause/play interaction. It does **not** own the HRV Reduced Effects policy or a `prefers-reduced-motion` implementation. Any future sitewide reduction control belongs to the global HRV shell.

## Rollback

Do not edit an immutable release in place.

Current recovery surfaces include:

- current cover-sizing release: `2026.08.19.1` at immutable commit `e524301c12b2298102a7ed59de3c8d765b39755f`;
- prior finished visual release: `2026.08.18.8` at immutable commit `a38a2eb2eb7a9f5e9300b4861bfeae721ec74eb6`;
- prior green visual release: `2026.08.18.6` at immutable commit `b8f8c51ca3f23f279360f23bdd956e39ca64eb23`;
- known-good V2 branch: `photo-album-home-v2-rebuild`;
- known-good V2 commit: `e2b966d193668d8373316760a3531b61eea9653b`;
- backup branch: `backup/photo-album-pre-visual-redesign-2026-08-17`;
- pre-autonomous-partial-redesign backup: `backup/photo-album-visual-redesign-v3-pre-autonomous-rebuild-2026-08-18`.

To roll the Edublogs doorway back, restore the previously preserved three boxes or repoint the tiny injector to the previous known-good immutable Photo Album release. Never use mutable `@main` or `latest` browser assets.
