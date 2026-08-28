# Classroom Explorations Hub authoring and review implementation report

**Date:** 2026-08-28  
**Change branch:** `hub-authoring-v2-2026-08-28`  
**Preservation branch:** `backup/hub-pre-authoring-v2-2026-08-28`  
**Production page 17:** untouched  
**Review page 2589:** no WordPress write performed by this repository change

## Purpose

This change establishes the first canonical Hub example for Lanternworks while preserving the repository-owned application boundary:

- the authoring source remains human-readable and deterministic;
- the route registry remains the platform identity authority;
- a new control manifest tells Lanternworks exactly what may be edited and which coordinated commands exist;
- a pure transaction projector provides atomic before/after Hub changes with stale-state rejection;
- a branch-backed review runtime renders the redesigned Hub on `/hub-test/` without changing page 17;
- the Edublogs HTML and CSS remain only the confused-puppy fallback;
- the Edublogs JavaScript remains only a tiny repository handoff.

## Preservation

The pre-change `main` state was preserved before implementation on:

```text
backup/hub-pre-authoring-v2-2026-08-28
```

All implementation work was isolated to:

```text
hub-authoring-v2-2026-08-28
```

No production merge or Edublogs write is part of this change.

## Authoring-source reconciliation

`apps/classroom-explorations-hub/source/hub.source.json` was corrected to resolve the known content conflicts:

1. The visible historical card now uses **Butterflies in the Classroom** and route `hrv-route:butterflies`.
2. The unapproved visible Caterpillars/Cats historical card is no longer placed in the Hub gallery.
3. Great Barrier Reef remains the final Past Exploration.
4. Tubers remains the first Past TWWL item.
5. Zinnia remains Current for school year `2026-2027`.
6. Current TWWL remains the truthful `coming-soon` slot state.
7. The `2025-2026` archive relationship now matches the route registry and is published through `hrv-route:archive-2025-2026`.
8. The welcome video remains YouTube ID `kRTJp4pqbtg`.
9. Historical summaries, learning points, tags, accessible image descriptions, and museum copy were expanded.

The source schema remains `1.0`. The browser and existing build pipeline therefore retain compatibility while Lanternworks receives a separate control contract instead of forcing editor metadata into presentation data.

## New Lanternworks control manifest

Added:

```text
apps/classroom-explorations-hub/source/hub.control.json
schemas/classroom-explorations-hub.control.schema.json
```

The control manifest declares:

- source, route, and control document roles;
- canonical page 17 and review page 2589 host boundaries;
- SHA-256 canonical-document concurrency;
- stable DOM, content, and slot identity attributes;
- every editable copy node and its field allow-list;
- every editable catalog and its immutable ID fields;
- supported Hub commands;
- atomic transaction invariants;
- publication rules;
- forbidden direct edits.

The authoring source is not declared as a browser publication. Lanternworks must project and validate a generated browser manifest before production publication.

## Atomic transaction projector

Added:

```text
tools/lib/classroom-explorations-hub-transactions.mjs
```

The pure transaction layer supports:

- `hub.swap-current-exploration`
- `hub.edit-node`
- `hub.update-content`
- `hub.set-current-twwl`
- `hub.set-current-twwl-coming-soon`
- `hub.set-featured-media`
- `hub.reorder-gallery`
- `hub.publish-archive`
- `hub.roll-school-year`

Every command:

1. validates the current Hub source and route registry;
2. verifies expected SHA-256 revisions for both documents;
3. rejects stale commands;
4. applies only the declared operation;
5. protects stable IDs and WordPress identity;
6. validates the projected source and routes;
7. returns changed-document names, before/after hashes, result metadata, and exact projected documents.

The projector performs no network writes. Lanternworks remains responsible for proposals, approval, idempotency persistence, repository commits, CI, immutable publication, WordPress actions, and audit events.

## Test repair

The previous route test assumed that page 17 would always have exactly nine child records. Adding archive page 2627 made that count brittle and caused current main CI to fail.

The replacement test verifies each managed child by:

- stable route reference;
- WordPress page ID;
- parent page ID;
- menu order;
- slug;
- path;
- page kind.

It also verifies that no undeclared page-17 child silently appears.

The canonical test suite additionally covers:

- corrected Butterflies gallery placement;
- archive publication and URL;
- Zinnia Current state;
- Coming Soon TWWL state;
- welcome-video normalization;
- editor-node coverage;
- stable-ID rejection;
- stale command rejection;
- an atomic route + Exploration registration + Current swap;
- gallery reorder behavior;
- Current TWWL behavior;
- duplicate-slot rejection.

## Review runtime redesign

Added:

```text
apps/classroom-explorations-hub/src/review-bootstrap.js
apps/classroom-explorations-hub/src/runtime-v2.js
apps/classroom-explorations-hub/src/hub-v2.css
```

The review runtime projects the source and route registry in the browser for branch review. It is not the final immutable production publication mechanism.

The redesigned museum includes:

- a cinematic museum entrance and Exploration Promise;
- an animated discovery compass;
- a museum-map quick-navigation strip;
- a framed Welcome Theater;
- a large Current Exploration exhibit with learning points and tags;
- a truthful Learning Lantern Coming Soon state;
- a responsive Past Exploration gallery;
- a timeline-style Learning Memory Hall;
- a published school-year archive wing;
- Reduced Effects controls and operating-system motion support;
- keyboard focus treatment, skip navigation, semantic headings, and accessible media labels;
- stable `data-hrv-node-id`, `data-hrv-content-id`, and `data-hrv-slot-id` bridges for a future Lanternworks visual editor;
- graceful image fallbacks;
- responsive desktop, tablet, and phone layouts.

## Edublogs test integration

Added:

```text
docs/edublogs-integration/classroom-explorations-hub-test/HTML-BOX.html
docs/edublogs-integration/classroom-explorations-hub-test/CSS-BOX.css
docs/edublogs-integration/classroom-explorations-hub-test/JAVASCRIPT-BOX.js
docs/edublogs-integration/classroom-explorations-hub-test/README.md
```

The HTML and CSS contain only the confused-puppy fallback. The JavaScript block creates one repository loader and supplies URLs for the source, routes, control contract, runtime, application CSS, and host compatibility CSS.

The review loader preserves the fallback markup before startup. It restores that exact markup when any repository dependency fails or when startup exceeds twenty seconds.

The test bootstrap references the review branch. It must not be pasted into page 17. The accepted production doorway must later pin an exact immutable commit and publication.

## Explicitly unchanged

This implementation does not:

- edit WordPress page 17;
- edit WordPress page 2589;
- merge the review branch to `main`;
- publish a new immutable production Hub release;
- claim the current publication `pub-2026-08-14-005` as current authority;
- add production mutation credentials to Lanternworks;
- alter Photo Album, site shell, global widgets, or other HRV pages.

## Required acceptance sequence

1. Run the complete Hub checks on the review branch.
2. Review the repository diff and transaction contract.
3. Paste the three test blocks into page 2589 only.
4. Verify `/hub-test/` signed out on desktop, tablet, and phone.
5. Review copy, routes, media, keyboard behavior, Reduced Effects, failure restoration, and visual fit.
6. Resolve any remaining live WordPress identity discrepancies before publisher work.
7. After approval, mint an immutable runtime/content publication from an exact green commit.
8. Build and certify the Lanternworks publisher against the accepted contract.
9. Keep page 17 frozen until the final controlled doorway cutover.
