# Photo Album frontend architecture

## Ownership boundaries

```text
Permanent Worker manifest
  -> strict public-manifest adapter
  -> album/photo domain projection
  -> public route and interaction state
  -> repository-owned UI
  -> tiny inert Edublogs mount contract
```

The public frontend reads only `GET /manifest.json` and media URLs already present in the manifest. It has no Cloudflare, Google Drive, WordPress, management, provenance, or authorization capability.

## Runtime boundaries

- `data/`: fetch, validation, approved-media URL enforcement, last-known-good cache.
- `domain/`: album grouping and presentation-only theme projection.
- `runtime/`: app-scoped hash routes.
- `components/`: positional carousel, stable native gallery, and lightbox lifecycle owners.
- `styles/`: one `.hrv-photo-album`-scoped compatibility and visual layer.
- `assets/`: code-owned decorative vectors; no production photographs.
- `public/bootstrap.js`: classic-script loader suitable for a tiny Edublogs mount.

Each mounted application instance owns and tears down its listeners, observers, timers, modal, and rendered state. Duplicate initialization of the same mount returns the existing instance.

`apps/photo-album/host-qa.html` is a local-only compatibility harness with deliberately hostile legacy image, button, dialog, and typography rules plus page content before the mount. `apps/photo-album/lightbox-qa.html` adds deterministic 24:5, 4:3, 3:4, 9:16, and 16:9 modal cases. Both are served by Vite for regression testing and are not part of the production Rollup entry.

## Manifest rules

The adapter implements live manifest version 1 without adding backend fields. `photo.url` must be an HTTPS `/media/derivatives/gallery/` URL. `photo.fullSizeUrl`, when present, must be an HTTPS `/media/derivatives/full/` URL. An invalid gallery URL quarantines the photo; an invalid/missing full URL removes only the Open Full Size action. The application never derives a full URL from a gallery URL.

## Performance rules

- The hero maintains persistent previous/current/next slides and moves them between real positions.
- Album discovery mounts one gallery derivative per album.
- The current gallery keeps its complete lightweight card DOM stable. The first 12 images load eagerly; remaining images use native `loading="lazy"`, `decoding="async"`, and a 3,000px IntersectionObserver look-ahead that promotes incoming images before their rows enter the viewport.
- The grid never destroys visible rows or changes page height during ordinary scrolling. If future manifests materially exceed current classroom-scale collections, use explicit stable chunking rather than custom scroll-window replacement.
- The lightbox starts with a gallery derivative and preloads only adjacent gallery derivatives.
- A full derivative is requested only if the visitor activates Open Full Size.
- Reduced motion disables carousel autoplay and collapses CSS transitions/animation.

## Live-host compatibility rules

- Critical modal, media, button, and image geometry is scoped to `.hrv-photo-album` with sufficient strength to survive legacy WordPress theme rules.
- Opening the modal snapshots the page position and relevant inline styles, locks both `html` and `body`, and fixes the body in place. Closing restores the original styles, focus, and exact scroll coordinates.
- The modal reserves an independent footer row and a definitively bounded media row. The lightbox image uses intrinsic width/height with strong maximum bounds and `object-fit: contain`.
- Typography follows the semantic tokens documented in `docs/ui-conventions.md`; application rules never alter Edublogs typography outside the repository-owned root.

## Intentional open seams

- Historical manifests are not invented; `#/hrv-photo-album/years` is an honest ready-state route.
- The current backend has no album theme field. Themes are deterministic presentation tokens derived from stable album identity/name and can later be adapted to an approved contract.
- Empty manifest `alt` values remain empty. Controls provide contextual accessible names without pretending to describe image content. A future approved alt-text workflow can populate the existing manifest field.
- No public Save/Download control is introduced. Open Full Size remains a distinct viewing action.
