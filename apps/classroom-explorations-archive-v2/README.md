# School-year archive compiler v2 — isolated candidate

Status: **implemented for private review; release integration remains closed**. This additive candidate supports complete frozen year collections from 2026–2027 onward. It does not modify the original archive contract, runtime, bootstrap, publication, release pins, Source data, or WordPress pages.

The original 2025–2026 archive remains under its reviewed v1 contract: stable archive identity `hub-archive:2025-2026`, Page 2627, exactly three Explorations and five learning stories. The v2 compiler explicitly rejects that year. Canonical Hub Page 17 and review Hub Page 2589 also remain unchanged.

## What is implemented

The compiler validates the exact Hub source and route registry with their existing schemas and semantic contract. It captures **every catalog member for the chosen year**, including the Current Exploration and learning stories outside the visible Hub galleries. It preserves content IDs, complete titles and summaries, learning points, tags, images, numeric WordPress destination IDs, route references, paths, and parent identities. Cards cannot silently move to a different year or disappear because the current Hub galleries changed.

It emits a frozen source record and a separate v2 runtime manifest, each with a canonical content hash. The output package includes the input documents so another reviewer can reproduce the result. The package directory is addressed by the complete artifact manifest hash. Existing files are never overwritten: an identical repeat succeeds; changed bytes at the same address stop with a conflict.

The responsive private archive preview contains the real frozen content and working links to its recorded destinations. It includes searchable, keyboard-accessible collections, Exploration/story filters, optional images and learning details, a static fallback, and the Source-owned shared Reduced Effects contract. Full effects are the default independently of OS preferences. When hosted, `html[data-hrv-effects="reduced"]` immediately suppresses the archive's entrance animation and smooth scrolling; the shared site-shell owns the control and persistence. The isolated preview defaults to full effects and introduces no page-local toggle or storage. The interactive renderer checks the content digest before mounting. It never uses the 2025–2026 runtime with a substituted identity.

The installation handoff records a proposed path and stable archive identity, but **no numeric destination Page is invented**. `wordpressPageId` and `nativeDoorway` remain `null`; `publicationAvailable` is always `false`; no `hub.publish-archive` command is emitted.

## Build and verify

Run from the reviewed Source checkout:

```sh
node tools/build-classroom-year-archive-candidate.mjs \
  --year 2026-2027 \
  --source-revision 692f4fa0ba477624c298e0e01aff0321fdb189c4 \
  --out /absolute/path/to/private-review

node tools/verify-classroom-year-archive-candidate.mjs \
  /absolute/path/to/private-review/2026-2027/ARTIFACT_HASH

node --test tools/test-classroom-year-archive-v2.mjs
```

Optional `--hub-source` and `--routes` arguments accept the exact saved input documents from a proposed year transition. The year must be the current or an earlier declared year, from 2026 onward, with at least one catalog item. Every destination must be published and retain its correct type, numeric ID, unambiguous path, and parent Hub Page 17. Unknown, incomplete, cross-site, or retired destinations fail the candidate build instead of being silently omitted.

The input commit is **caller-supplied provenance**, not a claim that this local compiler has queried GitHub. Both complete input byte representations are independently hashed. A release reviewer must verify that the supplied commit actually owns those documents. Use the same exact compiler source to verify a previously generated candidate; compiler asset changes correctly change the candidate identity.

## Package contents

| File | Purpose |
| --- | --- |
| `hub-source.input.json`, `routes.input.json` | Complete, reproducible source inputs. |
| `frozen-source.json` | Immutable year membership, original content, destination records, and provenance. |
| `manifest.json` | Exact runtime content and snapshot identity. |
| `runtime.js`, `archive.css` | Additive v2 presentation assets; original v1 files are untouched. |
| `preview.html` | Self-contained private review with static fallback and verified interactive rendering. |
| `INSTALLATION.json` | Pending native target, protected identities, and explicit release acceptance requirements. |
| `ARTIFACTS.json` | Hash, byte size, and media type of every output artifact, plus package content address. |

## Remaining release integration

This compiler closes the code gap for producing and reviewing a complete new-year archive artifact. It does not close live release acceptance. Before the application’s year/archive publication gate is removed, the successor contract and artifacts must be reviewed, a distinct native Page must be reserved and read back, exact immutable assets and a verified doorway must be installed, and signed-in and signed-out behavior must pass acceptance. Only then may a source-revision-locked transaction publish the archive relationship and activate the next year.

The handoff lists those gates in machine-readable form. Required checks include exact Page/type/parent/path/status/template, content and asset hashes, counts and visitor destinations, accessibility and the shared Reduced Effects preference, and preservation of the previous known-good Hub/restore path. No pay-as-you-go service, AI request, production setting, or account enrollment is involved in this build.
