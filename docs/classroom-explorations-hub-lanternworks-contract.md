# Classroom Explorations Hub: Lanternworks authoring contract

**Contract baseline:** `2026-08-28`  
**Canonical Hub page identity:** `hrv-page:classroom-explorations`  
**Production WordPress page:** `17` at `/hub/`  
**Review WordPress page:** `2589` at `/hub-test/`

## The three-document model

Lanternworks must treat the Hub as one coordinated state assembled from three repository documents:

| Document | Purpose | Editable? |
|---|---|---:|
| `apps/classroom-explorations-hub/source/hub.source.json` | Human-authorable Hub copy, content catalog, relationships, and composition | Yes, through approved commands |
| `registry/hrv-routes.source.json` | Stable WordPress identity, route, parent, order, kind, and publication state | Yes, only through route-aware commands |
| `apps/classroom-explorations-hub/source/hub.control.json` | Stable editor nodes, allowed operations, concurrency rules, transaction invariants, and host safety | No ordinary page edit |

The generated browser manifest and immutable publication files are outputs. They are never ordinary editor targets.

## Stable identity

The following identities are immutable after creation:

- Hub page ID and page type;
- route reference and WordPress page ID;
- Exploration, TWWL, media, archive, and slot IDs;
- editable copy node IDs.

Titles, summaries, images, tags, ordering, Current/Past relationships, and other approved fields may change without changing those identities.

## Current and Past are relationships

An Exploration record does not carry a mutable `status=current` field. The current position is declared once in:

```text
/data/composition/currentExplorationId
```

Past order is declared once in:

```text
/data/composition/pastExplorationIds
```

A Current swap therefore performs a coordinated relationship change:

1. optionally register the new route;
2. optionally register the new Exploration record;
3. archive the outgoing Current item when requested;
4. remove the incoming item from Past;
5. set the incoming item as Current;
6. validate the entire source and route pair;
7. emit before and after document hashes.

The same rule applies to the Current TWWL slot. `coming-soon` is a truthful slot state, not a fabricated TWWL record.

## Concurrency and stale-state rejection

Every Lanternworks command must include the exact SHA-256 revision of both editable documents:

```json
{
  "expected": {
    "authoringSha256": "<sha256 of canonical hub.source.json>",
    "routesSha256": "<sha256 of canonical hrv-routes.source.json>"
  }
}
```

The transaction projector rejects the command when either hash differs. A Hub swap prepared against an older title, order, route, or Current relationship cannot silently overwrite newer work.

## Command envelope

The pure transaction projector accepts this envelope:

```json
{
  "schemaVersion": "1.0",
  "commandId": "hub-command:<stable-command-id>",
  "idempotencyKey": "hub-idempotency:<stable-key>",
  "operation": "hub.swap-current-exploration",
  "targetPageId": "hrv-page:classroom-explorations",
  "expected": {
    "authoringSha256": "<authoring revision>",
    "routesSha256": "<route revision>"
  },
  "payload": {}
}
```

Lanternworks owns persistence of command IDs and idempotency keys. The repository transaction module is deliberately pure: it projects exact before and after documents but does not hide a database or perform network writes.

## Declared operations

The first canonical control manifest declares:

- `hub.swap-current-exploration`
- `hub.edit-node`
- `hub.update-content`
- `hub.set-current-twwl`
- `hub.set-current-twwl-coming-soon`
- `hub.set-featured-media`
- `hub.reorder-gallery`
- `hub.publish-archive`
- `hub.roll-school-year`

The implementation lives in:

```text
tools/lib/classroom-explorations-hub-transactions.mjs
```

## Editing page copy

Page copy is addressed by stable node ID rather than by visible text or DOM position. For example, the hero copy is:

```text
nodeId: hub-node:hero
path:   /data/copy/hero
```

The control manifest allows only the listed fields for that node. A request to change `nodeId`, an undeclared field, a content ID, a route reference, or a WordPress page ID is rejected.

The review runtime mirrors those stable identities into the DOM:

```html
<section data-hrv-node-id="hub-node:hero">…</section>
<article data-hrv-content-id="summer-bloom-adoption-project">…</article>
<section data-hrv-slot-id="hub-slot:current-twwl">…</section>
```

This gives a future Lanternworks visual editor a deterministic bridge from a selected rendered element back to its authoring record.

## Publication boundary

A successful projection is not a publication. The production publisher must still:

1. create a reviewable repository change;
2. run schema, semantic, adversarial, host, and build checks;
3. mint an immutable browser content snapshot;
4. bind it to an exact immutable runtime;
5. verify hashes and public retrieval;
6. update only the approved Edublogs doorway;
7. record the publication and rollback target.

The review page may load the branch-backed source directly for visual review. Page `17` must never use the review channel.

## Host safety

The control manifest encodes two distinct hosts:

- Page `17` is the frozen production doorway and has `mayPublish: false` during this review phase.
- Page `2589` is the review doorway and has `mayPublish: true` for branch-backed testing.

No ordinary Hub command changes either WordPress page. WordPress integration is a separate, explicit publisher responsibility.
