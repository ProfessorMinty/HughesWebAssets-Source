# Edublogs Photo Album three-box contract

**Current visual candidate release:** `2026.08.18.6`  
**Immutable release commit:** `b8f8c51ca3f23f279360f23bdd956e39ca64eb23`  
**Host requirement:** the Edublogs Photo Album Page uses the **Full Width** page template.

The permanent law is:

> **Edublogs provides the doorway. The repository owns the room.**

The three Edublogs boxes are intentionally tiny:

1. `HTML-BOX.html` contains one stable mount plus the small friendly unavailable/check-back-later sign.
2. `CSS-BOX.css` styles only that unavailable sign. It owns no Photo Album layout, breakout, theme or animation.
3. `JAVASCRIPT-BOX.js` injects one exact immutable repository bootstrap. It contains no Photo Album application logic, construction banner, loading experience, MutationObserver, diagnostics or repository-DOM selectors.

The immutable repository bootstrap then loads:

```text
releases/photo-album/2026.08.18.6/bootstrap.js
releases/photo-album/2026.08.18.6/assets/photo-album.css
releases/photo-album/2026.08.18.6/assets/photo-album.js
```

The application consumes the existing synthetic/test Worker manifest:

```text
https://hrv-photo-album.drminty17.workers.dev/manifest.json
```

## Real-host review procedure

1. Confirm the Edublogs Photo Album Page template is **Full Width**.
2. Replace the current page HTML, CSS and JavaScript boxes with the three files in this directory.
3. Save/update the page.
4. Open the public Photo Album in a signed-out browser and hard refresh once.
5. Confirm the repository application replaces the tiny puppy/unavailable sign.
6. At the normal wide desktop reference, confirm the Photo Album environment reaches the viewport edges beneath normal Edublogs navigation, Current Memories is compact, View All is obvious, and the four current album covers occupy one row.
7. Open Pumpkin Patch, Science Museum, Mushroom Exploration and Zinnia Garden; verify each gallery visually changes with its subject and keeps photographs unobscured.
8. Open a photo lightbox, navigate previous/next, close it, and confirm focus/page position recover correctly.
9. Check a phone viewport and confirm the application remains full-width while its internal composition deliberately recomposes.

Local/browser CI evidence does not substitute for this final Amadeus real-host check.

## Failure behavior

If the external bootstrap cannot start, the tiny Edublogs unavailable sign remains. The Edublogs boxes do not attempt to reconstruct a second Photo Album.

If repository bootstrap starts but the runtime fails, the immutable repository bootstrap preserves a simple repository-owned temporary-unavailable state.

## Rollback

Do not edit this immutable release in place.

Current recovery surfaces include:

- known-good V2 branch: `photo-album-home-v2-rebuild`;
- known-good V2 commit: `e2b966d193668d8373316760a3531b61eea9653b`;
- backup branch: `backup/photo-album-pre-visual-redesign-2026-08-17`;
- pre-autonomous-partial-redesign backup: `backup/photo-album-visual-redesign-v3-pre-autonomous-rebuild-2026-08-18`.

To roll the Edublogs doorway back, restore the previously preserved three boxes or repoint the tiny injector to the previous known-good immutable Photo Album release. Never use mutable `@main` or `latest` browser assets.
