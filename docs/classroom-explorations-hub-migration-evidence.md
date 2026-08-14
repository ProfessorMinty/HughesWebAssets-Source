# Classroom Explorations Hub clean-baseline migration evidence

Date: 2026-08-14

This document is evidence that the information needed by Classroom Explorations can be represented in the permanent contract without carrying the rejected 2026-08-10 Hub modernization forward as architecture, visual language, renderer code, schema lineage, or rollback lineage.

The historical Edublogs backup is the content/experience archaeology source. The rejected modernization is referenced below only to demonstrate that its data responsibilities have a lossless destination in the new model. Its implementation is not a migration target.

## Information mapping

| Information / responsibility | Rejected transitional representation | Permanent clean representation |
|---|---|---|
| Hub page identity | Hub-specific page object and raw route URL | common page envelope: `hrv-page:classroom-explorations` + stable `routeRef` |
| WordPress identity | coupled to current URL | route registry: stable route ref + WordPress page ID + current slug/path |
| Current Exploration | `records[]` + `type=exploration` + `status=current` | stable Exploration entity + `composition.currentExplorationId` |
| Current TWWL Coming Soon | fabricated TWWL record with `status=coming-soon` | `composition.currentTwwl = { id, state: "coming-soon" }` |
| Current real TWWL | record lifecycle/status | real TWWL entity + published Current TWWL relationship |
| Welcome video | flat video record inferred as current by school year | stable media entity + explicit `composition.featuredMediaId`; association truthfully records `hub` |
| Past Exploration order | per-record `status` + `order` | ordered `composition.pastExplorationIds` |
| Past TWWL order | per-record `status` + `order` | ordered `composition.pastTwwlIds` |
| Previous-year doorway | fake `archive-doorway` record | `composition.previousYears[]` relationship with explicit state and optional routeRef |
| Managed destination | raw `pageUrl` | stable `routeRef`, resolved at build time |
| External image | raw image URL mixed with record lifecycle/presentation state | typed media reference inside the content entity; future managed-asset seam reserved but not invented |
| YouTube embed URL | source and generated URL mixed in runtime-ish record | authoring keeps provider source; deterministic projection emits privacy-enhanced browser embed URL |
| School-year placement | record status plus school-year status | content keeps school-year membership; composition owns the current school year and archive relationships |
| Renderer theme/animation strings | source fields implied controls not consistently implemented | removed; renderer owns actual visual behavior and documented controls |
| Manual content version | human-edited version string | generated SHA-256 snapshot identity |
| Browser manifest | normalized/sorted authoring clone | smaller resolved browser projection containing only renderer-required data |
| Edublogs fallback | duplicate partial application | one semantic mount + one truthful unavailable state |
| Edublogs loader | page-local application controller | tiny handoff to one exact immutable repository bootstrap/publication |

## Current product truth represented by the clean contract

- Current school year: `2026-2027`.
- Current Exploration: `summer-bloom-adoption-project` (Summer Bloom Adoption Project / Zinnia).
- Current TWWL: explicit `coming-soon` slot state; there is no fake TWWL entity.
- Current-year Past Exploration gallery: empty.
- Current-year Past TWWL gallery: empty.
- Welcome media: `welcome-classroom-explorations`, explicitly Hub-associated rather than falsely tied to the Zinnia Exploration.
- Previous school year: `2025-2026`, represented as a `coming-soon` archive relationship with no invented destination URL.
- Hub WordPress page identity: page 17, resolved through `hrv-route:classroom-explorations`.
- Zinnia WordPress page identity: page 2463, resolved through `hrv-route:zinnia`.

## Stable identity proof

The contract separates three things that historically changed independently:

1. HRV content identity, for example `summer-bloom-adoption-project`.
2. HRV route identity, for example `hrv-route:zinnia`.
3. WordPress platform identity and current slug/path, for example page ID 2463 at `/zinnia-page/`.

A route update changes the route registry only. It does not rewrite the Exploration ID or infer Hub placement from WordPress hierarchy.

## Lanternworks manipulation proof

Pure domain operations exercise the same structured source used by the build. Tests prove that a Hub Swapper can:

- register a real Exploration;
- set it Current while moving the outgoing Current into Past without changing the outgoing ID;
- register a real TWWL and publish it into the Current slot;
- return the slot to Coming Soon while archiving the outgoing TWWL;
- reorder the two Past galleries independently;
- register, update, and select featured media;
- update a previous-school-year relationship;
- change the slug/path behind a stable route reference without changing the WordPress page ID or content identity.

Generated JSON and browser DOM are not editing state.

## Deliberately dropped transitional concepts

The clean baseline does not preserve:

- flat heterogeneous `records[]`;
- `status` as Current/Past placement;
- fake Coming Soon content;
- `archive-doorway` as a content species;
- raw managed page URLs as identity;
- manually edited content versions;
- renderer-facing `theme` and `animation` strings that advertise capabilities the renderer does not actually contractually support;
- old museum component names, selectors, layout, CSS, motion, bootstrap, construction curtain, or fallback architecture;
- the `.2-.6` release family as new-system rollback ancestry.

Git history remains the record of that experiment. The current Source tree and new publication lineage do not inherit it.
