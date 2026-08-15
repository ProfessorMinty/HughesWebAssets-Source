# Classroom Explorations Hub permanent baseline

The Classroom Explorations Hub uses the clean repository-owned page architecture, but its visible experience deliberately preserves and modernizes the selected historical Hub's successful composition and hierarchy. The rejected 2026-08-10 modernization and the rejected first clean visual candidates remain historical evidence only.

## Ownership

Edublogs page 17 owns the stable public doorway only. Its HTML provides one semantic mount and a friendly unavailable state; its CSS styles only that state; its JavaScript injects one exact immutable repository bootstrap and publication URL. The repository owns application markup, host compatibility, renderer, effects, accessibility behavior, diagnostics, source contracts, validation, content projection, and immutable publication artifacts.

## Authoring contract

`apps/classroom-explorations-hub/source/hub.source.json` is the friendly source of truth. It uses the common page envelope and Hub-specific data contract. Content catalog entities are stable; placement lives under `composition`. Current TWWL `coming-soon` is a slot state, not fake content. Previous-year doorways are composition relationships, not content records.

For the current human visual-review phase, composition intentionally keeps selected recovered 2025–2026 material visible in the main Past galleries while each record retains its true `schoolYear`. The semantic validator permits a visible Past record only when its year is either the current school year or an explicitly declared `previousYears` relationship. This is a temporary presentation choice, not a mutation of classroom history. After Arctic and Poppet approve the permanent visual model, moving the older material behind Previous School Years is a composition operation.

`registry/hrv-routes.source.json` separates HRV route identity from WordPress page ID and current slug/path. The historical page-691 Cats/Caterpillars anomaly is preserved as recovered evidence rather than silently rewritten.

## Validation

Structural validity is schema-driven and fail-closed. The build executes the common page-envelope schema, Hub source-data schema, route-registry schema, and generated runtime schema. Cross-record rules live separately in `classroom-explorations-hub-contract.mjs` and emit stable coded failures suitable for Lanternworks.

The contract preserves the stronger invariant that Current Exploration and any published Current TWWL must belong to `composition.currentSchoolYear`. Historical visibility is therefore explicit without weakening the meaning of Current.

## Runtime projection and publication

Normal content publication resolves routes and provider URLs into a smaller deterministic browser manifest with a SHA-256 snapshot identity. Renderer JS/CSS do not need to rebuild for a schema-compatible content-only change.

Renderer or host-compatibility changes mint a new immutable runtime. An immutable publication pairs one runtime version and one content snapshot. Rejected preview publications are not treated as accepted previous-known-good production publications.

## Visual baseline

The permanent visible sequence is intentionally recognizable from the selected historical Hub:

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

The historical implementation architecture is not reused. What survives is the successful visitor experience: card-based sectioning, strong Current/learning/Past hierarchy, compass/discovery identity, green Exploration family, purple TWWL family, separate Welcome Theater, subject-specific cards, explicit gallery framing, decorative rhythm, and a warm populated sense of place.

The modernization adds a repository-owned full-viewport museum environment around that furniture: midnight/indigo architecture, aurora and exhibit light, luminous glass, warm brass/gold accents, responsive layouts, deliberate motion, subject-specific gallery effects, stronger contrast, explicit Reduced Effects, system motion safety, and a true viewport breakout below the normal Edublogs navigation.

Current Zinnia is the dominant living greenhouse exhibit. Current TWWL remains truthfully Coming Soon inside the purple Learning Lantern family. The recovered Great Barrier Reef, Mushrooms, Caterpillars-labelled page-691 destination, Tubers, Russian Winter, Owls, Bats, and Spiders remain visible during visual review with truthful 2025–2026 labels.

## Human approval

Passing CI, overflow checks, schema validation, or lifecycle tests does not constitute visual approval. WordPress page 17 at `/hub/` is the permanent production doorway. During the current route-migration review phase, WordPress page 2589 at `/hub-test/` is the real-host visual-review surface for the same Source implementation. Arctic and Poppet remain the visual/product approval authority.

## Lanternworks operations

The contract remains compatible with registering/editing content entities, changing `composition.currentExplorationId`, moving outgoing Current content into ordered Past placement, setting the TWWL slot, changing featured media, reordering galleries, resolving route changes, managing previous-year relationships, validating, previewing, publishing an exact structured snapshot, and restoring a prior accepted publication.
