# Hughes Room Views repository-page publication standard

Status: authoritative repository-wide platform contract
Date established: 2026-08-18
Scope: every Hughes Room Views repository-owned page, post experience, Hub, exhibit, gallery, and application embedded through Edublogs

## 1. Core ownership law

**Edublogs provides the doorway. The repository owns the room.**

For every repository-owned Hughes Room Views experience, Edublogs owns only the smallest stable integration seam needed to launch the repository application and to remain truthful if the repository application cannot load.

The repository owns the actual page experience: markup, visual design, loading states after bootstrap begins, layout, full-width breakout, responsive behavior, host compatibility, navigation inside the application, effects and animation, accessibility behavior, diagnostics, content projection, runtime validation, and failure handling after repository code has loaded.

No page may move application presentation into Edublogs merely to make previewing or deployment easier.

## 2. Permanent three-block Edublogs contract

Every repository-owned page uses the same three-surface model unless an explicitly approved platform-level successor replaces it.

### HTML block

The HTML block contains only:

- one stable semantic mount/root for the repository application;
- one small truthful unavailable / please-come-back-later message that remains readable if JavaScript or the repository release is unavailable;
- optional `noscript` text when needed.

The HTML block does **not** contain:

- the application UI;
- application loading presentation;
- page sections or cards;
- repository content copies;
- visual effects;
- navigation owned by the application;
- release manifests or application data.

### CSS block

The CSS block styles only the unavailable fallback sign sufficiently for the native Edublogs page to remain readable.

The CSS block does **not** contain:

- application layout;
- viewport breakout rules;
- page colors/themes beyond the tiny fallback;
- animations or visual effects for the real application;
- responsive application rules;
- host-compatibility fixes for the repository application.

The fallback must remain modest. It must never resemble the real application or consume a large portion of the viewport as a loading experience.

### JavaScript block

The JavaScript block is a tiny page-local injector only. Its responsibilities are limited to:

1. find the stable mount;
2. guard against duplicate injection;
3. construct the exact immutable repository bootstrap/publication URL;
4. inject the bootstrap script and pass only the small launch parameters required by that bootstrap;
5. if the bootstrap script itself cannot load, leave or restore the native unavailable fallback.

The JavaScript block does **not** own:

- application rendering;
- loading UI;
- application styling;
- content data;
- route rendering;
- banners or notices inside the application;
- animation/effects logic;
- responsive behavior;
- viewport breakout;
- page-specific feature code.

Never use mutable `@main` delivery for a published or review candidate. Pin an immutable commit SHA and immutable release/publication identifier.

## 3. Repository bootstrap law

The injected repository bootstrap is the first repository-owned code executed on the page. It may validate the mount, release/publication compatibility, required artifacts, and integrity metadata as appropriate for that application.

Once repository bootstrap succeeds, the repository application immediately takes ownership of the mount. From that point forward all visible loading, ready, empty, error, and interaction states belong to repository code.

If repository bootstrap or validation fails before takeover, the Edublogs unavailable fallback remains or is restored. A broken repository release must never leave a half-mounted application mixed with native fallback content.

## 4. Full-viewport and host-isolation standard

Repository-owned immersive pages must escape the Amadeus article/content column and own the available viewport width below the normal site navigation.

The repository owns this breakout. It does not belong in the Edublogs CSS block.

The proven general geometry is based on viewport ownership such as:

```css
width: 100vw;
max-width: none;
position: relative;
left: 50%;
margin-left: -50vw;
margin-right: -50vw;
```

Exact implementation may differ when required by host markup, admin bars, scrollbar geometry, or future shell behavior, but the invariant is the same:

- no imprisonment inside the Amadeus article column;
- no unintended horizontal scrollbar;
- normal Edublogs/site navigation remains intact;
- internal readable widths, grids, margins, and composition are owned by the application inside the viewport canvas;
- phone/tablet layouts are deliberately recomposed rather than scaled-down desktop layouts.

Host compatibility must be scoped to an application-ready state so repository rules do not leak into unrelated Edublogs content.

## 5. Global shell ownership

Sitewide behavior belongs to the Hughes Room Views global shell when it is genuinely global.

Page applications must not independently invent competing global controls or persistent settings. In particular, the global motion/effects preference is a shell responsibility. Page applications may later consume a documented shell state or API, but must not create their own local Full/Reduced motion toggle unless the platform contract is explicitly changed.

Legacy page-local controls that predate the global standard are migration debt, not precedent for new work.

## 6. Repository release and publication manifests

The repository uses immutable browser-ready artifacts. A release/publication that has been used for review or production is evidence and is never rewritten in place.

There are two related manifest classes.

### Runtime/release manifest

Every browser-ready runtime release must have an immutable release directory and a machine-readable manifest describing the exact artifacts in that release.

At minimum record:

- application/page-system identity;
- immutable release identifier;
- manifest/schema contract version;
- source repository identity;
- each browser artifact path;
- artifact byte size;
- artifact SHA-256 digest.

Artifact paths are relative to the immutable release directory. The Edublogs injector never invents artifact filenames that are not part of the committed release contract.

### Publication/content manifest

Content-driven applications may additionally use an immutable publication manifest that pairs:

- one immutable runtime/release;
- one exact validated content snapshot;
- route/page-system/schema compatibility information;
- integrity metadata required to fail closed.

A schema-compatible content-only change may mint a new publication without rebuilding the runtime. Renderer, host-compatibility, or application code changes mint a new runtime/release.

Applications without a separate repository content snapshot may use only the runtime/release manifest and consume an external approved data endpoint, such as the Photo Album Worker manifest.

### Manifest construction law

Manifests are generated from built/validated artifacts. They are not hand-written guesses in Edublogs.

The correct flow is:

```text
source
  -> schema/contract validation
  -> tests/typecheck
  -> deterministic build
  -> stage immutable release directory
  -> calculate bytes + SHA-256 for exact staged artifacts
  -> write release/publication manifest
  -> commit release artifacts
  -> pin Edublogs injector to the commit containing that immutable candidate
```

A commit cannot safely point to a final immutable artifact that is not yet committed. Therefore staging workflows may require a first commit that triggers generation followed by the automation/bot commit containing the actual release artifacts. The Edublogs injector must pin the commit that **actually contains the staged immutable release**, not merely the source commit that triggered the build.

Rejected preview releases/publications remain immutable historical evidence and are not silently promoted as previous-known-good production candidates.

## 7. Testing and promotion ladder

Automated tests and local screenshots are necessary but are never sufficient for publication approval.

Every repository-owned page follows this ladder.

### Gate A: source and contract verification

Run the applicable:

- schema validation;
- contract tests;
- unit/component tests;
- typecheck;
- deterministic production build;
- release-manifest/integrity checks;
- duplicate-mount/teardown checks where applicable.

### Gate B: hostile-host local/browser QA

Use a local/browser harness that intentionally approximates hostile legacy WordPress/Amadeus rules. Verify application isolation, image/button/dialog geometry, lifecycle behavior, and failure states without changing Edublogs.

### Gate C: viewport QA

Render the actual candidate at a meaningful viewport matrix. Use the application's known reference viewport when one exists, plus representative desktop, laptop, tablet, and phone sizes.

Verify at minimum:

- no horizontal overflow;
- intended viewport breakout;
- readable typography;
- correct interaction geometry;
- deliberate phone/tablet composition;
- application-owned loading/error/empty states;
- no theme leakage outside the application root.

For Photo Album visual work, approximately 1920 x 911 is the primary art-direction reference canvas, not a universal breakpoint.

### Gate D: bootstrap and failure QA

Exercise the exact repository bootstrap/publication candidate:

- valid release;
- missing artifact/content;
- incompatible manifest/schema where applicable;
- integrity mismatch where integrity metadata is used;
- duplicate initialization;
- teardown/remount if supported.

Failure must restore/preserve the tiny Edublogs unavailable fallback and leave no partial repository application behind.

### Gate E: real Edublogs host QA

Install the **exact three-block candidate** on a safe Edublogs review/test page.

This is mandatory before production cutover. Verify through the real host:

- actual immutable CDN/repository delivery;
- actual Amadeus markup and CSS interaction;
- true viewport-width breakout;
- no horizontal scrollbar;
- normal site header/navigation remains intact;
- signed-in/admin-bar geometry;
- signed-out geometry when possible;
- desktop/laptop/tablet/phone behavior;
- application interactions and media delivery;
- bootstrap failure fallback;
- browser console/network errors.

Local QA may predict this gate. It may not replace it.

### Gate F: human visual/product approval

The actual real-host candidate is reviewed by the project/product authority before promotion. Passing CI or producing attractive local screenshots does not authorize publication.

Only after the real-host candidate passes may the same immutable release/publication be promoted to the permanent page doorway.

## 8. Review-build law

A visual review is not ready merely because a branch builds or a screenshot exists.

If the reviewer is expected to judge the page on Edublogs, the review package is incomplete until:

1. the immutable repository candidate exists;
2. the exact commit containing it is known;
3. the three Edublogs blocks are prepared against that candidate;
4. the candidate has passed the basic repository/bootstrap checks needed to make a real-host review meaningful.

Do not stop implementation for a human Edublogs visual-review gate before the reviewer has a working three-block candidate to install.

## 9. Authority and exceptions

This document is the default publication/integration authority for all Hughes Room Views repository-owned pages.

Page-specific documents may add requirements, but must not weaken or contradict this contract silently. If a page genuinely requires an exception, document the exception explicitly, explain why, and obtain project approval before implementation.

When older recovery notes, PR descriptions, or page-specific docs conflict with this standard, newer explicitly approved project intent and this repository-wide contract win unless a later authority supersedes them.
