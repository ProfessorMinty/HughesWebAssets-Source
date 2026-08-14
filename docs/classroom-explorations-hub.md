# Classroom Explorations Hub permanent baseline

The current Hub source is a clean-sheet implementation based on the historical Edublogs Hub's content responsibilities and the approved repository-owned page standard. The rejected 2026-08-10 modernization lineage is not an architectural or visual dependency.

## Ownership

Edublogs page 17 owns the stable public doorway only. Its HTML provides one semantic mount and a friendly unavailable state; its CSS styles only that state; its JavaScript injects one exact immutable repository bootstrap and publication URL. The repository owns the application, host compatibility, renderer, effects, accessibility behavior, diagnostics, source contracts, validation, content projection, and immutable publication artifacts.

## Authoring contract

`apps/classroom-explorations-hub/source/hub.source.json` is the friendly source of truth. It uses the common page envelope and Hub-specific data contract. Content catalog entities are stable; placement lives under `composition`. Current TWWL `coming-soon` is a slot state, not fake content. Previous-year doorways are composition relationships, not content records.

`registry/hrv-routes.source.json` separates HRV route identity from WordPress page ID and current slug/path. The Hub source refers to managed pages with stable `routeRef` values.

## Validation

Structural validity is schema-driven and fail-closed. The build executes the common page-envelope schema, Hub source-data schema, route-registry schema, and generated runtime schema. `tools/lib/json-schema-lite.mjs` is a generic schema interpreter; it does not encode Hub field names. Cross-record rules live separately in `classroom-explorations-hub-contract.mjs` and emit stable coded failures suitable for Lanternworks.

## Runtime projection

Normal content publication runs `node tools/build-classroom-explorations-hub-content.mjs`. It resolves managed routes and provider URLs into a smaller browser manifest, validates the generated result, and gives the snapshot a SHA-256 identity. Renderer JS/CSS do not need to rebuild for a schema-compatible content-only change.

Runtime publication runs `node tools/build-classroom-explorations-hub-runtime.mjs`. The runtime is plain browser ES2022, intentionally avoiding a Hub-specific bundler dependency. `stage-classroom-explorations-hub-publication.mjs` pairs one immutable runtime release with one immutable content snapshot in an immutable publication record. A controlled future resolver may replace the explicit pin without changing the bootstrap contract.

The first clean baseline has no previous-known-good publication in the new architecture. Rejected modernization releases are not carried forward as rollback lineage.

## Visual direction

The new renderer is a fresh museum-front-lobby interpretation: luminous entry doors, orientation theater, Current Exploration spotlight, truthful TWWL case, quiet current-year galleries, and a school-year time gallery. It uses code-native atmosphere and the current approved Zinnia photograph rather than inheriting uncertain legacy decorative art. Reduced Effects is both system-aware and explicitly user-controllable.

## Lanternworks operations

The contract is intentionally compatible with structured operations such as registering/editing content entities, changing `composition.currentExplorationId`, moving the outgoing Exploration into `pastExplorationIds`, setting the TWWL slot to `coming-soon` or `published`, changing featured media, reordering gallery ID arrays, resolving route changes in the route registry, validating, previewing, publishing an exact structured snapshot, and restoring a prior accepted publication.
