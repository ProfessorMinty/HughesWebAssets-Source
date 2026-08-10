# Hughes Room Views Web Assets Source

`ProfessorMinty/HughesWebAssets-Source` is the permanent source/build repository for repository-owned Hughes Room Views website applications and content that has passed into the website system.

This is the source side of the modern architecture. Human-friendly source, schemas, renderers, scoped styles, validation, tests, build tooling, and immutable browser releases live here. Individual website applications remain isolated under `apps/` rather than being folded into one site-wide runtime.

Nothing in this repository by itself deploys Cloudflare, Google Drive, Edublogs, WordPress, or the live Hughes Room Views site. Live Edublogs pages retain their stable routes and load pinned immutable releases produced here through small page-local hybrid mounts.

## Current applications

### Photo Album

`apps/photo-album/` is the permanent repository frontend for the Drive/Cloudflare-backed classroom Photo Album. Current immutable browser releases live under `releases/photo-album/`; release directories never mutate after publication.

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

### Classroom Explorations Hub

`apps/classroom-explorations-hub/` is the permanent source application for the Classroom Explorations Hub at WordPress page 17 / `/classroom-explorations/`.

Its controlled content pipeline is:

```text
apps/classroom-explorations-hub/content/hub.source.json
  -> schema + semantic validation / normalization
  -> generated hub.manifest.json
  -> repository renderer + scoped full-page CSS / animation presets
  -> immutable Hub release
  -> tiny Edublogs hybrid loader on the permanent Hub route
```

`hub.source.json` is the future Hub Swapper transaction boundary. The Swapper must edit the friendly source contract, then run the same validators/build pipeline. It must not edit generated manifests, browser bundles, immutable releases, or rendered Edublogs HTML as its data store.

The first 2026–2027 Hub release intentionally contains only the approved current-state structure: Zinnia as Current Exploration, This Week We Learned as Coming Soon, empty current-year past collections, the approved welcome video, and one Last Year Content doorway to the separate 2025–2026 archive page once that page is built. Prior-year individual pages are not imported into the launch Hub manifest.

## Repository layout

```text
apps/
  photo-album/
  classroom-explorations-hub/
schemas/                  strict application data contracts
docs/                      architecture, integration, handoff, UI conventions
fixtures/                  clearly labeled non-production contract fixtures
releases/                  committed immutable browser-ready releases by application
tests/                     representative behavior and contract tests
tools/                     normalization/build/release staging helpers
dist/                      generated build output, not committed
```

New modernized Hughes Room Views page applications should enter this repository as sibling applications with scoped ownership. Do not return passed pages to the old widget-owned or monolithic asset model.

## Photo Album Worker dependency

Default Photo Album manifest endpoint:

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

## Local development and verification

Requirements: Node.js 24 or newer and npm 11 or newer.

Photo Album:

```powershell
npm install
npm run dev
npm run check
```

Classroom Explorations Hub:

```powershell
npm install
npm run dev:hub
npm run check:hub
```

Hub local development uses the normalized source manifest and performs no Edublogs writes.

## Immutable releases

Browser releases are staged into application-specific directories under `releases/` only after successful verification. Published release directories are immutable; a changed application receives a new release identifier.

Photo Album currently stages with:

```powershell
npm run stage:photo-album-release
```

The Hub stages a named release with:

```powershell
$env:HRV_SOURCE_COMMIT = (git rev-parse HEAD)
npm run stage:hub-release -- <release-id>
```

Never use mutable `@main` delivery for an Edublogs production loader.

## Edublogs hybrid boundary

Modernized pages use the same ownership rule:

1. Edublogs owns the stable public route, semantic/native fallback, and tiny pinned loader.
2. This repository owns the page application, validated data contract, scoped responsive styles, animation/interaction behavior, tests, and immutable release.
3. Failure to load repository assets must leave a truthful usable fallback rather than a blank page.

Photo Album integration lives under `docs/edublogs-integration/`. Hub integration lives under `docs/edublogs-integration/classroom-explorations-hub/`.

## Architecture notes

See `docs/architecture.md` for the Photo Album lifecycle/security/performance foundation, `docs/ui-conventions.md` for host-isolation and typography conventions, and `docs/classroom-explorations-hub.md` for the Hub source, hybrid, release, rollback, and future Hub Swapper contract.
