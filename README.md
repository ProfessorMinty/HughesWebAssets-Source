# Hughes Room Views Development Workshop

> **Current role as of 2026-08-28:** active development, integration, and test workshop for Hughes Room Views.
>
> This repository is **not** the future clean production Source repository.

## Why this repository changed roles

`ProfessorMinty/HughesWebAssets-Source` was originally intended to remain a clean permanent source/build repository containing only finalized, publishable Hughes Room Views systems.

That boundary did not survive active reconstruction. Development work accumulated here across multiple Hub, Photo Album, site-shell, route, manifest, publication, documentation, QA, backup, and experimental branch lines. Some of those lines are accepted work, some are incomplete, some are superseded, and some exist only as historical evidence. Documentation also continued to describe the repository as a clean production source after that description was no longer true.

Attempting to restore the repository to an artificially pristine state now would create another large forensic cleanup project and increase the risk of deleting useful work, selecting the wrong lineage, or conflating historical and current implementations.

The repository is therefore formally reclassified as the **Hughes Room Views development workshop**.

Older files, reports, branch names, and project records may still call it the permanent Source repository. Where they conflict with this README and the current project decision, that description is historical and superseded.

## Current workshop role

This repository may be used to build, test, reconcile, and finish:

- Classroom Explorations Hub source, rendering, routes, manifests, and Lanternworks contracts;
- Photo Album frontend, runtime, themes, manifests, and integration work;
- the HRV global site shell;
- repository-owned page applications and page-type contracts;
- schemas, validation, deterministic build tooling, publication tooling, fixtures, and tests;
- Edublogs doorway packages and host-compatibility work;
- integration work involving Lanternworks, Cloudflare, Google, R2, and the NLL asset platform;
- review candidates and evidence needed to reach a final accepted system.

The presence of a file, branch, release, publication, or document in this repository does **not** by itself mean that it is approved, current, production-ready, or the authoritative implementation.

## What this repository is not

This repository is not:

- the future clean production Source repository;
- a guarantee that every branch or release is accepted;
- a safe place from which to copy every file blindly into production;
- a binary warehouse for private licensed master assets;
- a place for secrets, credentials, OAuth tokens, private keys, or production access material;
- an excuse to maintain several competing implementations of the same system without an explicit decision about which one is current.

## Working authority inside the workshop

When workshop artifacts disagree, use this order unless Arctic explicitly establishes a narrower authority for a workstream:

1. Arctic's current explicit decision.
2. The exact accepted commit, release, manifest, or contract named for the current task.
3. The current integrated workshop baseline on `main`.
4. The one explicitly designated active workstream branch, when one exists.
5. Older branches, publications, reports, screenshots, and recovery material as historical evidence only.

Branch names are not proof of authority. A newer timestamp is not proof of authority. A successful build is not human acceptance. Confirm the exact source, state, and purpose before modifying or publishing anything.

## Branch and preservation rules

The workshop designation does **not** authorize unlimited branch proliferation.

- Do not create a branch automatically merely because work is beginning.
- Create a new branch only when Arctic explicitly approves it or the current task names it.
- Do not create `backup/*` branches or other branches whose only purpose is preservation.
- Git history, exact commit SHAs, tags, immutable releases, exported evidence, and external backups are the preservation mechanisms.
- Use one clearly designated writing line for a workstream. Do not create parallel alternate implementations without explicit approval.
- Finish, reconcile, merge, or deliberately abandon a workstream before starting another branch for the same responsibility.
- Record the exact current branch/commit when handing work to another agent or chat.
- Never infer that the branch with the most commits is the correct branch.

## Production and review references during the transition

Some existing Edublogs doorways or review surfaces may temporarily load artifacts from this repository while the final systems are being completed.

Any browser-facing reference must use an exact immutable commit or immutable release/publication. Do not point production or formal review doorways at mutable aliases such as `main`, `latest`, or a moving development branch.

Before this repository is renamed, every external dependency must be inventoried, including:

- Edublogs HTML/CSS/JavaScript doorway blocks;
- jsDelivr and raw GitHub URLs;
- immutable runtime and content publications;
- Lanternworks repository references and adapters;
- CI workflows and release tooling;
- project documentation and recovery instructions;
- Cloudflare, Google, R2, and asset-platform integrations that record repository identity.

## Future clean production Source repository

After the Hub, Photo Album, pages, manifests, publication machinery, Lanternworks contracts, and related systems are finalized and accepted, Arctic will control a deliberate repository transition:

```text
this development workshop
        ↓
complete, reconcile, test, and accept each system
        ↓
Arctic renames this repository for its permanent workshop role
        ↓
create a brand-new clean production Source repository
        ↓
transfer only the final accepted source, contracts, tooling, and immutable artifacts
        ↓
update every repository URL, loader, publication reference, CI path, and integration
        ↓
perform complete end-to-end and rollback verification
        ↓
clean production Source becomes the publication authority
```

The new production repository must be built from an explicit final-state inventory. It must not be produced by cloning this repository wholesale and attempting to delete the unwanted pieces afterward.

After that transition:

- the renamed workshop remains the place where new systems are built and tested;
- the clean production Source contains only accepted production source and publication artifacts;
- promotion from workshop to production is a deliberate, reviewed, verifiable operation;
- nothing is considered successfully migrated until all dependent systems have been tested against the new repository identity.

Do not rename this repository, create the new production repository, remove the separate Testing repository, or begin the final migration unless Arctic explicitly authorizes that action. Arctic owns those repository-administration decisions.

## Permanent application boundary

For modern repository-owned HRV pages, the architectural law remains:

> **Edublogs provides the doorway. The repository application owns the room.**

Edublogs should contain only the stable WordPress page/route, semantic mount, small friendly unavailable state, minimal fallback styling, and tiny immutable bootstrap handoff. Repository applications own rendering, scoped CSS, host compatibility, interactions, responsive behavior, accessibility, diagnostics, structured content, validation, and publication artifacts.

That architecture may be developed and tested here. Only accepted final implementations will later be promoted to the clean production Source repository.

## Current major work areas

```text
apps/
  classroom-explorations-hub/
  photo-album/
  site-shell/

registry/                   HRV route/page references
schemas/                    structural contracts
docs/                       architecture, integration, handoff, and evidence
fixtures/                   labeled non-production fixtures
releases/                   workshop release/publication evidence
tests/                      application and contract tests
tools/                      build, validation, transaction, and publication tooling
```

These directories may contain a mixture of active workshop work and historical evidence. Verify the exact workstream authority before relying on them.

## Local development

Requirements: Node.js 22 or newer.

Use the scripts defined in `package.json` for the subsystem being worked on. Run the relevant baseline checks before modification and the relevant regression checks afterward.

Do not interpret a green local build as permission to publish, merge, change Edublogs, deploy Cloudflare, alter Google resources, or promote work into the future production repository.

---

**Workshop rule:** build freely enough to discover the right answer, but never confuse an experiment with accepted truth.
