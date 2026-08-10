# Hughes Room Views Web Assets Source

Permanent source for repository-owned Hughes Room Views page applications. The first application is the Photo Album frontend backed by the existing permanent Worker.

This repository contains source and build infrastructure only. Nothing here deploys Cloudflare, Google Drive, Edublogs, WordPress, or the live Hughes Room Views site.

## Photo Album status

The current foundation provides:

- a positional featured-memory carousel with persistent previous/current/next slides;
- current-year album discovery with stable per-album visual identities;
- individual album routes and a View All route with multi-album filters;
- a stable native image grid with eager first rows and lazy-loaded remaining gallery derivatives;
- a host-hardened lightbox with contain geometry, exact page scroll restoration, previous/next, Escape, focus return, focus trapping, and swipe gestures;
- an Open Full Size action that uses only the manifest's sanitized `fullSizeUrl` derivative;
- loading, retry, empty, partial-data, and last-known-good states;
- responsive layout, visible keyboard focus, and reduced-motion behavior;
- a permanent Previous Year Memories route without invented historical content;
- a classic loader and inert Edublogs mount example.

## Repository layout

```text
apps/photo-album/
  public/                 stable classic bootstrap loader
  src/assets/             code-owned visual assets
  src/components/         carousel, stable photo grid, lightbox
  src/data/               Worker manifest client and adapter
  src/domain/             album grouping and theme projection
  src/runtime/            app route ownership
  src/styles/             scoped responsive visual system
docs/                     architecture and inert mount contract
fixtures/                 clearly labeled non-production contract fixtures
releases/                 committed immutable browser-ready releases
tests/                    representative behavior and contract tests
tools/                    release staging helpers
dist/photo-album/         generated build output (not committed)
```

The structure leaves room for future sibling applications under `apps/` without putting all Hughes Room Views pages into one bundle.

## Worker dependency

Default manifest endpoint:

```text
https://hrv-photo-album.drminty17.workers.dev/manifest.json
```

The live version 1 contract verified on 2026-08-10 is flat:

```text
manifest: version, albumId, schoolYear, source, generatedAt, albums[], photos[]
album:    id, name, photoCount
photo:    id, revision, albumId, albumName, name, alt, url, fullSizeUrl
```

The frontend consumes `url` as the gallery/display derivative and `fullSizeUrl` only as the sanitized full-resolution action. It rejects media URLs outside the Worker's approved gallery/full derivative path shapes. It never requests Drive originals or arbitrary R2 keys.

## Local development

Requirements: Node.js 24 or newer and npm 11 or newer.

```powershell
npm install
npm run dev
```

Open `http://127.0.0.1:4173`. Local development uses the permanent Worker's public manifest by default and performs no writes.

## Verification

```powershell
npm test
npm run build
```

`npm run build` type-checks source and creates a static package in `dist/photo-album/` with stable loader-facing names:

```text
bootstrap.js
assets/photo-album.js
assets/photo-album.css
```

To stage the current permanent browser release after a successful build:

```powershell
npm run stage:photo-album-release
```

Releases `2026.08.10.1` and `2026.08.10.2` are committed under `releases/photo-album/`. Published release directories are immutable; future source changes receive a new release identifier.

Fixtures are test-only and use a non-resolving `.test` host. They are not production or historical content.

## Edublogs mount contract

The existing Edublogs Photo Album page uses three page-local boxes:

1. HTML: mount plus truthful loading/no-script fallback;
2. CSS: minimal fallback styling before repository CSS loads;
3. JavaScript: a small loader for the immutable repository release and permanent Worker manifest.

See `docs/edublogs-integration/`. The JavaScript template uses `__IMMUTABLE_COMMIT_SHA__` because a commit cannot contain its own final hash. Replace it with the complete published commit SHA before pasting it into Edublogs. Never use mutable `@main` delivery.

## Routes

Routes are app-scoped hashes so the same runtime can live inside an Edublogs page without server rewrites:

```text
#hrv-photo-album
#hrv-photo-album/all
#hrv-photo-album/all?albums=<album-id>,<album-id>
#hrv-photo-album/album/<album-id>
#hrv-photo-album/years
```

The previous-years route is a permanent honest placeholder until a historical manifest contract exists.

## Architecture notes

See `docs/architecture.md` for lifecycle, security, performance, manifest, and intentionally open integration seams. See `docs/ui-conventions.md` for the typography and host-isolation conventions future Hughes Room Views applications must inherit.
