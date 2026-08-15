# Hughes Room Views Web Assets Source

`ProfessorMinty/HughesWebAssets-Source` is the permanent source/build repository for repository-owned Hughes Room Views website applications and content that has passed into the website system.

Human-friendly source, schemas, renderers, scoped styles, validation, tests, build tooling, and immutable browser artifacts live here. Rich page applications remain isolated under `apps/`; this repository is not one giant site application.

Nothing in this repository by itself deploys Cloudflare, Google Drive, Edublogs, WordPress, or the live Hughes Room Views site. Edublogs retains stable public page identity and uses a tiny page-local doorway to load exact immutable repository publications.

## Current applications

### Photo Album

`apps/photo-album/` is the permanent repository frontend for the Drive/Cloudflare-backed classroom Photo Album. Its architecture and release history remain independent of Classroom Explorations work.

### Classroom Explorations Hub

`apps/classroom-explorations-hub/` is the first standardized repository-owned HRV page application. Its stable platform doorway is WordPress page 17 at `/hub/`.

The permanent flow is:

```text
friendly Hub source + shared page envelope + route registry
  -> canonical structural validation
  -> semantic/domain validation
  -> deterministic browser projection
  -> immutable content snapshot

repository bootstrap + renderer + scoped CSS + host compatibility
  -> immutable runtime release

immutable runtime + immutable content
  -> immutable publication record
  -> exact pinned Edublogs handoff
```

The Hub source separates stable content entities from Hub composition. Current/Past placement, the Current TWWL slot, featured media, gallery order, and previous-year relationships do not rewrite content identity.

Managed Edublogs destinations use stable `routeRef` values resolved through `registry/hrv-routes.source.json`. HRV content identity, WordPress page identity, and current slug/path remain distinct.

Normal Hub content changes do not require rebuilding browser JS/CSS while the runtime schema remains compatible. Renderer/host changes mint a new immutable runtime.

## Current Hub visual-review state

The selected historical Hub is the visual/compositional baseline for the permanent modernization. The new implementation preserves its recognizable furniture and hierarchy while replacing the old inline/hybrid implementation architecture.

The current review build preserves:

```text
Hero
→ Welcome Theater
→ Current Exploration
→ Current TWWL
→ decorative divider
→ Past Explorations
→ Past TWWL
→ compact Previous School Years control
→ footer
```

It also preserves the compass/discovery identity, green Exploration family, purple TWWL family, card-based gallery organization, and subject-specific identities inside a new repository-owned full-viewport magical museum environment.

During human visual review, recovered `2025–2026` content intentionally remains visible in the actual Hub while retaining truthful school-year metadata. Current Zinnia remains `2026–2027` and Current TWWL remains truthfully Coming Soon. After Arctic/Poppet approve the permanent visual model, older material can move behind Previous School Years through composition.

The current immutable review package is:

```text
Artifact commit: 1dc599dea9ae5caf01600292f153681009962ee7
Runtime: 2026.08.14.3
Publication: pub-2026-08-14-003
Content snapshot: sha256:ba5664964d1f228a203ac177f92c160d73e70ee56342c9a505a6805a01cc8102
```

Publications 001 and 002 are immutable failed/unaccepted preview evidence and are not production rollback ancestry.

## Repository layout

```text
apps/
  photo-album/
  classroom-explorations-hub/
registry/                   stable HRV route/page references
schemas/                    canonical structural contracts
docs/                       architecture, integration, handoff, UI conventions
fixtures/                   clearly labeled non-production contract fixtures
releases/                   immutable artifacts by application
tests/                      application tests where appropriate
tools/                      deterministic build/validation/publication helpers
dist/                       generated output, not committed
```

Standardize machinery, not imagination. Future repository-owned page types may use different page-specific source contracts and radically different visual experiences while reusing identity, validation, lifecycle, accessibility, publication, and rollback principles.

## Local development and verification

Requirements: Node.js 22 or newer.

```powershell
npm run test:hub
npm run build:hub
```

`build:hub` creates deterministic runtime/content output plus a local preview package under `dist/classroom-explorations-hub/`. Local preview remains supporting engineering evidence only for this first Hub standardization. During the current route-migration review phase, the human visual-review surface is WordPress page 2589 at `/hub-test/`; page 17 at `/hub/` remains the permanent production doorway.

To stage a future reviewed immutable publication after the source revision is known:

```powershell
npm run stage:hub-publication -- <runtime-version> <publication-id> <source-commit-sha> [previous-known-good]
```

Only an accepted publication should become `previous-known-good` for a later publication.

## Edublogs boundary

For a repository-owned application page:

1. Edublogs owns the stable WordPress page/route, one semantic mount, a small friendly unavailable state, minimal fallback styling, and a tiny immutable bootstrap handoff.
2. The repository owns page markup after mount, application CSS, host compatibility, behavior, effects, accessibility, diagnostics, source contracts, validation, and publication artifacts.
3. Failure before successful mount leaves the small truthful Edublogs unavailable state intact.
4. Edublogs integration code must not know internal repository component selectors or duplicate current content.

Hub integration source lives under `docs/edublogs-integration/classroom-explorations-hub/`. The checked-in JavaScript box is pinned to the immutable `.3` review package by exact Git commit and browser SRI. Source does not install or modify Edublogs by itself.

See `docs/classroom-explorations-hub.md` for the permanent Hub baseline and `docs/classroom-explorations-hub-hub-test-review-handoff-2026-08-14.md` for the current `/hub-test/` review process.
