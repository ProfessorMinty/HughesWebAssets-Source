# Classroom Explorations Hub permanent baseline

The Classroom Explorations Hub uses the clean repository-owned page architecture, but its visible experience deliberately preserves and modernizes the selected historical Hub's successful composition and hierarchy. The rejected 2026-08-10 modernization and the rejected first clean visual candidates remain historical evidence only.

## Ownership

Edublogs page 17 owns the stable public doorway only. Its HTML provides one semantic mount and a friendly unavailable state; its CSS styles only that state; its JavaScript injects one exact immutable repository bootstrap and publication URL. The repository owns application markup, host compatibility, renderer, effects, accessibility behavior, diagnostics, source contracts, validation, content projection, and immutable publication artifacts.

## Authoring contract

`apps/classroom-explorations-hub/source/hub.source.json` is the friendly source of truth. It uses the common page envelope and Hub-specific data contract. Content catalog entities are stable; placement lives under `composition`. Current TWWL `coming-soon` is a slot state, not fake content. Previous-year doorways are composition relationships, not content records.

The approved composition currently keeps selected recovered 2025–2026 material available through the Past-history dialogs while each record retains its true `schoolYear`. The semantic validator permits a visible Past record only when its year is either the current school year or an explicitly declared `previousYears` relationship. This is a temporary content-placement choice, not a mutation of classroom history. Moving older material into its school-year archive remains a separate composition operation.

`registry/hrv-routes.source.json` separates HRV route identity from WordPress page ID and current slug/path. The historical page-691 Cats/Caterpillars anomaly is preserved as recovered evidence rather than silently rewritten.

## Validation

Structural validity is schema-driven and fail-closed. The build executes the common page-envelope schema, Hub source-data schema, route-registry schema, and generated runtime schema. Cross-record rules live separately in `classroom-explorations-hub-contract.mjs` and emit stable coded failures suitable for Lanternworks.

The contract preserves the stronger invariant that Current Exploration and any published Current TWWL must belong to `composition.currentSchoolYear`. Historical visibility is therefore explicit without weakening the meaning of Current.

## Runtime projection and publication

Normal content publication resolves routes and provider URLs into a smaller deterministic browser manifest with a SHA-256 snapshot identity. Renderer JS/CSS do not need to rebuild for a schema-compatible content-only change.

Renderer or host-compatibility changes mint a new immutable runtime. An immutable publication pairs one runtime version and one content snapshot. Rejected preview publications are not treated as accepted previous-known-good production publications.

## Visual baseline

The approved desktop composition is panoramic and horizontally composed:

```text
compact identity | global site navigation
Welcome Theater/video | Current Exploration
Current TWWL (wide) | Past Explorations / Past TWWL / Past Years doors (equal stack)
history galleries and school years in bounded dialogs
supporting footer/content may continue below the opening viewport
```

At `1920 x 911`, the identity/navigation and the three main content regions remain glanceable together without page scrolling. At smaller widths, shorter windows, and high zoom, readable reflow outranks the one-canvas target; content stacks vertically rather than overlapping or shrinking into microtype.

The local responsive repair defines semantic typography roles rather than card-by-card microtype: `18px` desktop body, `17px` narrow/phone body, `16px` UI and secondary text, `15px` metadata/eyebrows, and separate display-heading tokens. Those values preserve the repository's Georgia/Cambria display personality and system-UI reading face without relying on the Amadeus root font size. They do not replace rendered review for long copy, localization, fallback fonts, or zoom.

The historical implementation architecture is not reused. What survives is the successful visitor experience: card-based sectioning, strong Current/learning/Past hierarchy, compass/discovery identity, green Exploration family, purple TWWL family, separate Welcome Theater, subject-specific cards, explicit gallery framing, decorative rhythm, and a warm populated sense of place.

The modernization adds a repository-owned full-viewport museum environment around that furniture: midnight/indigo architecture, aurora and exhibit light, luminous glass, warm brass/gold accents, responsive layouts, deliberate motion, subject-specific gallery effects, stronger contrast, operating-system reduced-motion safety, and a true viewport breakout below the normal Edublogs navigation. There is intentionally no Hub-local effects toggle.

Current Zinnia is the dominant living greenhouse exhibit. Current TWWL remains truthfully Coming Soon inside the purple Learning Lantern family. The recovered Great Barrier Reef, Mushrooms, Caterpillars-labelled page-691 destination, Tubers, Russian Winter, Owls, Bats, and Spiders remain visible during visual review with truthful 2025–2026 labels.

## Presentation-safe authoring

Schema-valid content is necessary but does not by itself prove that every card or lifecycle state renders safely. [The Hub manifest authoring and presentation rubric](classroom-explorations-hub-manifest-authoring-rubric.md) is documentation profile `hrv-presentation-policy:classroom-explorations-hub` version `2026-09-12.1`. It defines the intended form-validation, media/fallback, empty-state, dialog, loading/error, breakpoint, zoom, and real-browser acceptance requirements for Hub Swapper/Lanternworks. It is not yet a machine-readable policy bound to the control manifest or publication format.

[The 2026-09-12 card-state and responsive audit](classroom-explorations-hub-card-state-responsive-audit-2026-09-12.md) records the findings, the verified local repair subset and exact evidence, plus the still-separate full-rubric, immutable-release, CDN, doorway, live-site, and rollback gates. No local browser subset should be reported as satisfying that complete future rubric.

## Human approval

Passing CI, overflow checks, schema validation, or lifecycle tests does not constitute visual approval. The production integration target is Edublogs page `17` at `/hub/`; branch-backed review may use page `2589` at `/hub-test/`. Repository evidence alone does not prove that either live Edublogs page was updated or accepted. Arctic and Poppet remain the visual/product approval authority.

## Lanternworks operations

The contract remains compatible with registering/editing content entities, changing `composition.currentExplorationId`, moving outgoing Current content into ordered Past placement, setting the TWWL slot, changing featured media, reordering galleries, resolving route changes, managing previous-year relationships, validating, previewing, publishing an exact structured snapshot, and restoring a prior accepted publication.
