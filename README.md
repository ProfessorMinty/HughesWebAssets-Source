# Hughes Room Views Web Assets Source

`ProfessorMinty/HughesWebAssets-Source` is the permanent source/build repository for repository-owned Hughes Room Views website applications and content that has passed into the website system.

Human-friendly source, schemas, renderers, scoped styles, validation, tests, build tooling, and immutable browser artifacts live here. Rich page applications remain isolated under `apps/`; this repository is not one giant site application.

Nothing in this repository by itself deploys Cloudflare, Google Drive, Edublogs, WordPress, or the live Hughes Room Views site. Edublogs retains stable public page identity and uses a tiny page-local doorway to load exact immutable repository publications.

## Current applications

### Photo Album

`apps/photo-album/` is the permanent repository frontend for the Drive/Cloudflare-backed classroom Photo Album. Its existing architecture and release history remain independent of the Classroom Explorations work.

### Classroom Explorations Hub

`apps/classroom-explorations-hub/` is the first standardized repository-owned HRV page application. Its stable platform doorway is WordPress page 17 at `/classroom-explorations/`.

The clean permanent flow is:

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

The Hub source separates stable content entities from Hub composition. `composition.currentExplorationId`, the Current TWWL slot, ordered current-year Past galleries, featured media, and previous-year archive relationships describe what the museum is showing without rewriting the identity of the underlying content.

Managed Edublogs destinations use stable `routeRef` values resolved through `registry/hrv-routes.source.json`. HRV content identity, WordPress page identity, and current slug/path remain distinct.

Normal Hub content changes run the content build only. They do not require rebuilding browser JS/CSS while the runtime schema remains compatible.

The browser renderer is application-owned and supports duplicate-init protection, teardown/remount, diagnostics events, responsive layout, keyboard focus, system Reduced Motion, and an explicit Reduced Effects control.

The current Source tree intentionally does not preserve the rejected 2026-08-10 Hub modernization releases as active rollback lineage. Git history retains that experiment; the clean Hub establishes a new baseline.

## Repository layout

```text
apps/
  photo-album/
  classroom-explorations-hub/
registry/                   stable HRV route/page references
schemas/                    canonical structural contracts
docs/                       architecture, integration, handoff, UI conventions
fixtures/                   clearly labeled non-production contract fixtures
releases/                   immutable accepted artifacts by application
tests/                      application tests where appropriate
tools/                      deterministic build/validation/publication helpers
dist/                       generated output, not committed
```

Standardize machinery, not imagination. Future repository-owned page types may use different page-specific source contracts and wildly different visual experiences while reusing the same identity, validation, lifecycle, accessibility, publication, and rollback principles.

## Local development and verification

Requirements: Node.js 22 or newer.

Photo Album keeps its existing npm/Vite workflow.

Classroom Explorations Hub has a dependency-light contract/build path:

```powershell
npm run test:hub
npm run build:hub
```

`build:hub` creates deterministic runtime/content output plus an exact local preview package under `dist/classroom-explorations-hub/`. The local preview may be served from localhost for visual QA without touching Edublogs.

To stage a reviewed immutable Hub publication after the source revision is known:

```powershell
npm run stage:hub-publication -- 2026.08.14.1 pub-2026-08-14-001 <source-commit-sha>
```

The first clean baseline deliberately records `previousKnownGoodPublication: null`; a rejected implementation is not promoted into the new rollback chain. Later accepted publications should point to the immediately previous accepted publication.

## Edublogs boundary

For a repository-owned application page:

1. Edublogs owns the stable WordPress page/route, one semantic mount, a small friendly unavailable state, minimal fallback styling, and a tiny immutable bootstrap handoff.
2. The repository owns page markup after mount, application CSS, host compatibility, behavior, effects, accessibility, diagnostics, source contracts, validation, and publication artifacts.
3. Failure before successful mount leaves the small truthful Edublogs unavailable state intact.
4. Edublogs integration code must not know internal repository component selectors or duplicate current content.

Hub integration source lives under `docs/edublogs-integration/classroom-explorations-hub/`. The checked-in JavaScript box is pinned to the current immutable preview candidate by exact Git commit and browser SRI. It is a review/test package only; nothing in Source installs it on Edublogs or changes live page 17.

See `docs/architecture.md` for the independent Photo Album architecture, `docs/ui-conventions.md` for general host-isolation conventions, and `docs/classroom-explorations-hub.md` for the Hub permanent baseline.
