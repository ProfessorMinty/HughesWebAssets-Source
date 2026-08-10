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
- `components/`: carousel, windowed gallery, and lightbox lifecycle owners.
- `styles/`: one `.hrv-photo-album`-scoped compatibility and visual layer.
- `assets/`: code-owned decorative vectors; no production photographs.
- `public/bootstrap.js`: classic-script loader suitable for a tiny Edublogs mount.

Each mounted application instance owns and tears down its listeners, observers, timers, modal, and rendered state. Duplicate initialization of the same mount returns the existing instance.

## Manifest rules

The adapter implements live manifest version 1 without adding backend fields. `photo.url` must be an HTTPS `/media/derivatives/gallery/` URL. `photo.fullSizeUrl`, when present, must be an HTTPS `/media/derivatives/full/` URL. An invalid gallery URL quarantines the photo; an invalid/missing full URL removes only the Open Full Size action. The application never derives a full URL from a gallery URL.

## Performance rules

- The hero maintains one active image plus one transition image.
- Album discovery mounts one gallery derivative per album.
- The gallery uses a fixed-row window with overscan; even a 1,000-photo logical set keeps a bounded DOM.
- Mounted grid images use `loading="lazy"`, `decoding="async"`, and only gallery derivatives.
- The lightbox starts with a gallery derivative and preloads only adjacent gallery derivatives.
- A full derivative is requested only if the visitor activates Open Full Size.
- Reduced motion disables carousel autoplay and collapses CSS transitions/animation.

## Intentional open seams

- Historical manifests are not invented; `#/hrv-photo-album/years` is an honest ready-state route.
- The current backend has no album theme field. Themes are deterministic presentation tokens derived from stable album identity/name and can later be adapted to an approved contract.
- Empty manifest `alt` values remain empty. Controls provide contextual accessible names without pretending to describe image content. A future approved alt-text workflow can populate the existing manifest field.
- No public Save/Download control is introduced. Open Full Size remains a distinct viewing action.
