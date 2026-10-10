# Classroom Explorations Hub manifest authoring and presentation rubric

**Rubric ID:** `hrv-presentation-policy:classroom-explorations-hub`<br>
**Rubric version:** `2026-09-12.1`<br>
**Status:** documentation profile for a future machine-readable presentation policy; current local implementation covers only the subset identified in the companion audit<br>
**Applies to:** the canonical Classroom Explorations Hub source, route registry, generated runtime manifest, preview, and immutable publication flow<br>
**Related evidence:** [2026-09-12 card-state, responsive, zoom, and cascade audit](classroom-explorations-hub-card-state-responsive-audit-2026-09-12.md)

## Purpose and authority

This rubric defines what must eventually turn a structurally valid Hub manifest into a presentation-safe authoring contract. It is an input to future Hub Swapper/Lanternworks forms, previews, transaction review, and publication gates. It is not yet a machine-enforced policy, and it does not authorize a repository push, immutable release, CDN change, or Edublogs update.

The existing JSON schemas and semantic transaction checks remain authoritative for the behavior they currently implement: document shape, stable identity, relationships, routes, and concurrency. This documentation profile records additional requirements that JSON Schema alone cannot prove: readable copy, intentional media states, card containment, responsive and zoom behavior, accessible dialogs, truthful loading/error handling, and exact source-to-runtime release separation. A client must not report those additional requirements as enforced until a versioned machine-readable policy and its Hub profile are bound as described below.

When this rubric and a generated preview disagree, the rendered acceptance gate wins. Content must not be silently rewritten, truncated, hidden, or reduced to unreadable type merely to satisfy a nominal character count.

## Validation levels

Lanternworks should report three distinct levels rather than collapsing every issue into “valid” or “invalid”:

| Level | Meaning | Required behavior |
| --- | --- | --- |
| Contract error | The proposed state is unsafe, ambiguous, structurally invalid, or cannot preserve required meaning. | Reject before projection or publication. Return a stable field/operation error code and keep the prior accepted state unchanged. |
| Fit warning | The value is legal but exceeds the normal visual budget or creates an unusual collection/state. | Preserve the author's exact words, show the affected preview tiers, and require explicit acknowledgement before review can continue. |
| Rendered acceptance failure | The generated preview overlaps, clips, overflows, loses an accessible action, or violates a state invariant. | Reject publication even when schemas and length budgets pass. Fix content or presentation deliberately; never auto-shrink essential text. |

Warnings are not permission to publish a broken composition. Conversely, a soft budget is not a reason to erase meaningful teacher copy that renders correctly.

## Canonical source and generated-output separation

| Concern | Canonical location | Authoring rule |
| --- | --- | --- |
| Human Hub copy, content catalog, relationships, and composition | `apps/classroom-explorations-hub/source/hub.source.json` | Ordinary Hub authoring begins here and only through declared transaction operations. |
| WordPress identity, routes, hierarchy, and publication state | `registry/hrv-routes.source.json` | Change only through route-aware commands with exact expected revision. |
| Stable editor nodes, permitted operations, invariants, and host safety | `apps/classroom-explorations-hub/source/hub.control.json` | Control-plane contract; never an ordinary content-form target. |
| Source document structure | `schemas/classroom-explorations-hub.source.schema.json` | Validate before semantic projection. |
| Browser manifest structure | `schemas/classroom-explorations-hub.runtime.schema.json` | Validate the generated output; do not edit it by hand. |
| Deterministic projected content | `dist/classroom-explorations-hub/content/<snapshot-sha256>/manifest.json` | Build output only. A content snapshot does not become accepted merely because it exists. |
| Current generated snapshot record | `dist/classroom-explorations-hub/content-snapshot.json` | Build output only. Do not use it as an authoring database. |
| Generated runtime staging tree | `dist/classroom-explorations-hub/runtime/` | Flat build output containing the current generated runtime and `runtime-release.json`; never edit by hand or treat as immutable. |
| Immutable runtime release | `releases/classroom-explorations-hub/runtime/<runtime-version>/` | Versioned release output minted only after review and verification; never rewrite an existing version. |
| Immutable content snapshot | `releases/classroom-explorations-hub/content/<snapshot-sha256>/manifest.json` | Exact committed content bytes paired with a publication. |
| Immutable publication | `releases/classroom-explorations-hub/publications/<publication-id>/publication.json` | Exact binding between one runtime version and one content snapshot. |
| Edublogs page | Thin semantic mount, friendly unavailable state, and exact immutable pins | Doorway only. It is not the Hub content store or visual editor. |

Every mutation request must carry exact expected SHA-256 revisions for both authorable documents. Stable page, route, content, media, archive, slot, and node IDs must not change when labels, copy, media, ordering, or Current/Past relationships change. Generated manifests, release files, and pasted Edublogs fields are never accepted as the origin of an edit.

### Raw bytes and canonical transaction revisions are different evidence

A raw file SHA-256 identifies the exact UTF-8 bytes stored in a repository or artifact. The authoring and route revisions used for optimistic concurrency identify canonical JSON values. They are not interchangeable: whitespace or object-key ordering can change a raw byte hash without changing a canonical value revision.

The future common contract must name and version the canonicalization algorithm. The required baseline is recursive object-key sorting followed by JavaScript `JSON.stringify` semantics, preserving array order and value types, then SHA-256 over the resulting UTF-8 bytes. It must publish cross-language golden vectors for nested objects, arrays, `null`, escapes, non-ASCII text, and supplementary-plane characters. Implementations may not substitute language-specific map ordering, pretty-printing, Unicode rewriting, or number formatting and still call the result the same revision.

Every review and evidence artifact must record both kinds explicitly, for example `sourceRawByteSha256` versus `sourceCanonicalRevisionSha256`. An unqualified `sourceSha256` is too ambiguous for the standard rubric.

## Future machine-readable policy binding

This Markdown file is a reviewable design record, not the policy payload that Hub Swapper may trust. The standard manifest system requires two machine-readable layers:

1. a common HRV presentation policy for shared copy measurement, media, routes, evidence, accessibility, and acknowledgement semantics; and
2. a Classroom Explorations Hub profile for its card identities, copy budgets, typography roles, lifecycle fixtures, responsive seams, and publication rules.

Each layer must have a stable ID, version, canonical-content hash, JSON Schema, and migration history. The Hub control manifest must bind both exact policy identities. The transaction review artifact, human approval record, immutable publication, and browser-evidence bundle must repeat those identities and hashes. A mismatch or unknown policy version is a fail-closed review/publication error.

That binding is not present in the current v1 source/control/publication contract. Therefore the budgets and matrices below are normative design targets, not a claim that today’s Hub Swapper, schema, control manifest, or publication format enforces them.

Warning acknowledgement must also be deterministic. It must bind the stable warning code, JSON Pointer, hash of the normalized measured value, source canonical revision, route-registry canonical revision, common-policy ID/version/hash, Hub-profile ID/version/hash, actor, and acknowledgement time. Acknowledging one value or revision must not suppress a later value, route, or policy change.

## Copy budgets

These values are authoring-interface targets, not claims about what the current v1 schema already enforces. A **soft budget** creates a fit warning and expanded preview review. An **absolute safety cap** is a contract error until a deliberately versioned schema/presentation change supports more. Counts include spaces and punctuation after normal JSON decoding.

### Deterministic measurement

Copy limits are measured by the authoring service, not inferred from rendered DOM text. For each string, the service must:

1. decode the JSON string;
2. normalize it to Unicode NFC;
3. normalize `CRLF` and lone `CR` to `LF`;
4. remove leading and trailing Unicode whitespace for measurement only; and
5. count Unicode code points, not UTF-16 code units or encoded bytes.

Equivalent JavaScript:

```js
function measureHubCopy(value) {
  const measured = value
    .normalize("NFC")
    .replace(/\r\n?/g, "\n")
    .trim();
  return [...measured].length;
}
```

Measurement must not silently rewrite the stored value. Leading/trailing whitespace or normalization changes must be shown in the proposed diff. Every warning or error must include `pointer`, `measuredLength`, `softLimit`, `hardLimit`, and `counterVersion: "unicode-code-points-nfc-v1"`.

Code-point limits are not storage limits. The future machine-readable policy must also define raw UTF-8 byte caps for each field and whole canonical document, measured before trimming so megabytes of surrounding whitespace cannot evade the presentation counter. Byte failures must report `rawByteLength`, `rawByteLimit`, and a versioned byte-counter identifier. Numeric byte caps remain unresolved until that common policy is authored; no current client may invent them locally.

In the pointer patterns below, `*` denotes one decimal array index; it is not a literal JSON Pointer segment.

| Pointer pattern | Budget class |
| --- | --- |
| `/data/copy/hero/eyebrow`, `/data/copy/welcome/eyebrow`, `/data/copy/currentExploration/eyebrow`, `/data/copy/currentTwwl/eyebrow`, `/data/copy/pastExplorations/eyebrow`, `/data/copy/pastTwwl/eyebrow`, `/data/copy/archives/eyebrow` | Eyebrow/kicker/section label |
| `/data/copy/hero/title`, `/data/copy/hero/oathTitle`, `/data/copy/welcome/title`, `/data/copy/currentExploration/title`, `/data/copy/currentTwwl/title`, `/data/copy/currentTwwl/comingSoonTitle`, `/data/copy/pastExplorations/title`, `/data/copy/pastTwwl/title`, `/data/copy/archives/title`, `/data/explorations/*/title` | Page, Welcome, Current, Coming Soon, or Exploration title |
| `/data/twwl/*/title` | TWWL story title |
| `/data/copy/hero/intro`, `/data/copy/hero/invitation`, `/data/copy/hero/oathBody`, `/data/copy/welcome/summary`, `/data/copy/currentTwwl/comingSoonBody`, `/data/copy/pastExplorations/emptyText`, `/data/copy/pastTwwl/emptyText`, `/data/copy/archives/intro`, `/data/explorations/*/summary`, `/data/twwl/*/summary` | Narrative copy |
| `/data/copy/footer/text` | Footer statement |
| `/data/copy/hero/pillars/*` | Pillar |
| `/data/explorations/*/learningPoints/*` | Learning point |
| `/data/explorations/*/tags/*`, `/data/twwl/*/tags/*` | Tag |
| `/data/explorations/*/image/alt`, `/data/twwl/*/image/alt` when present | Image alternative text |
| `/data/media/*/title` | Media title |
| `/data/schoolYears/*/label` | School-year label |

Rubric-level array policy is:

- `/data/copy/hero/pillars`: one to six items; the v1 schema already requires at least one;
- `/data/explorations/*/learningPoints`: one to five items; the v1 schema currently requires the property but permits an empty array;
- `/data/explorations/*/tags` and `/data/twwl/*/tags`: zero to five items; and
- each visible Past placement list: warn above twelve items and reject above fifty until a versioned large-collection presentation exists.

These are presentation-policy rules until they are added to the schema/control contract. The authoring service must not claim that v1 JSON Schema already enforces them. Runtime-owned labels such as `Explore Now`, `Learn with Us`, `Revisit exhibit`, and `Open learning display` are not authorable record fields; changing that requires a versioned source-schema and control-manifest update.

| Field class | Soft budget | Absolute safety cap | Notes |
| --- | ---: | ---: | --- |
| Eyebrow/kicker/section label | 40 characters | 80 characters | Must remain secondary; it cannot displace the section title. |
| Page, Welcome, Current, or Coming Soon title | 48 characters | 120 characters | Do not force a fixed line count. Warn at the actual card tier. |
| TWWL story title | 60 characters | 140 characters | Slightly larger allowance for teacher-authored story language. |
| Intro, summary, invitation, oath, Coming Soon body, or archive intro | 180 characters | 600 characters | Preserve paragraphs and accessible reading order. |
| Footer statement | 100 characters | 300 characters | Footer may remain below the opening desktop viewport. |
| Learning point | 100 characters each | 240 characters each | Presentation policy requires one to five; the v1 schema requires the array property but currently permits zero items. |
| Pillar | 18 characters each | 48 characters each | One to six concise values; wrapping must not overlap adjacent content. |
| Tag | 20 characters each | 48 characters each | Zero to five visible tags per record unless a versioned component explicitly supports more. |
| Media title/credit label | 100 characters | 200 characters | Must not become a second competing headline. |
| Image alternative text | 180 characters | 500 characters | Describe the image's relevant meaning; do not prepend “image of.” |
| School-year label | 20 characters | 40 characters | Prefer a generated, normalized year span rather than free-form marketing text. |

Additional collection rules:

- warn when a visible Past gallery exceeds twelve placed records; reject above fifty until pagination, search performance, and large-collection browser evidence are versioned into the contract;
- reject duplicate tags according to a versioned Unicode rule: normalize to NFC, trim Unicode whitespace, apply the policy's defined Unicode case-folding table/version, and compare the resulting values;
- reject control characters, markup, script, embedded event handlers, and author-entered layout CSS in copy fields;
- warn on unbroken tokens longer than forty characters, including pasted URLs, and present the exact responsive preview where wrapping is at risk;
- never solve a fit warning by changing the teacher's words, applying ellipsis to required information, hiding learning points, or shrinking reading text below the site's accessibility baseline.

## Record and relationship requirements

### Current Exploration

A valid Current Exploration must have one stable content ID, one resolvable route reference, a title, summary, school year equal to `composition.currentSchoolYear`, one to five learning points under presentation policy, policy-valid tags, and one usable image with meaningful alternative text. It must not also appear in Past placement. Its `Explore Now` label is runtime-owned in v1.

The current repository does not identify an authoritative controlled vocabulary for “approved tags,” nor an authoritative provider allowlist. Until the future common policy binds those authorities, clients may validate structure, normalization, and current projector compatibility but must not claim an organization-approved tag or provider decision.

The form must preview the outgoing and incoming relationships before a swap. A swap is one atomic projection: register approved new records/routes when necessary, move the outgoing Current record according to the operator's choice, remove the incoming record from Past, set Current, validate both canonical documents, and show before/after hashes. A partial relationship update is a contract error.

### Current TWWL

`coming-soon` is a complete and truthful slot state. It requires the approved Coming Soon title/body and no fabricated story record.

A published TWWL must have one stable content ID, one resolvable route reference, title, summary, and Current school year. Its `Learn with Us` label is runtime-owned in v1. The current source schema permits its image to be absent, but it does not encode whether omission is intentional. The authoring UI must not infer intent from absence:

- **image supplied:** require usable media, alternative text, and the media-state previews below;
- **intentional no-image publication:** the current runtime has a labeled, contained fallback, but the form must keep publication blocked until a versioned intent field records the author's choice; and
- **image omitted accidentally or unresolved:** contract error.

Until intentional omission is represented in a versioned source/control contract, ordinary published TWWL authoring must require an image even though direct legacy manifests continue to render the fallback safely.

### Actionable route semantics

Resolving a route reference by ID is necessary but insufficient for an actionable production link. At the target publication revision, the referenced registry entry must be unique, published, of the content kind expected by the owning card, and compatible with the Hub's declared parent/hierarchy rules. Review-only, draft, wrong-kind, or hierarchy-incompatible routes must not become visitor actions merely because they have a path.

A `coming-soon` relationship must either carry `routeRef: null` or point to an explicitly dormant route with a versioned rationale that the runtime cannot render as actionable. The source schema/control contract does not yet encode that conditional rule; it is a future policy/schema requirement.

### School-year identity

The common policy must normalize academic years to one canonical machine representation and derive or validate the visitor label from it. Previous-year relationship IDs, archive records, route targets, and `schoolYear` values must correspond to the same normalized span. Free-form labels must not silently associate a 2025-2026 archive ID with a different year. Exact format and migration rules remain to be versioned rather than inferred independently by each client.

### Past galleries

Past Exploration and Past TWWL placement lists contain stable IDs, not duplicated records. Every placed ID must resolve exactly once, must not equal its Current counterpart, and must retain its truthful school year.

Past Exploration records require a usable image. Past TWWL records should require an image for the image-rich gallery; if a versioned contract permits no image, it must render the same deliberate labeled fallback used in preview and runtime. A missing or failed image must never remove the title, year, summary, or destination.

### Previous School Years

Each previous-year relationship must use one canonical manifest state:

- `published`: requires a resolvable route and renders a clearly actionable link; or
- `coming-soon`: renders a clearly non-actionable status with no link-shaped false affordance.

“Preparing” is visitor-facing presentation language only. It is not a valid source or runtime manifest state. When `composition.previousYears` is empty, the dialog must show one purposeful “no previous years yet” state, or the doorway must be disabled with the same explanation. An empty list must not open an unexplained blank dialog.

## Media validation and fallback policy

The policy must distinguish media-reference species rather than applying one vague URL rule to all of them:

| Species | Current shape | Future policy requirement |
| --- | --- | --- |
| Inline content image | Image object embedded in an Exploration or TWWL record | Stable media identity or immutable asset reference, URL/path, alt text, intrinsic dimensions, aspect/crop behavior, focal point when cropping is allowed, MIME type, byte size, provenance, and required/optional criticality. |
| Catalog video | Record under the media catalog referenced by the Welcome slot | Provider and provider-specific ID, accessible title, embed and safe alternate-link derivation, poster/fallback policy, provenance, and required/optional criticality. |
| Runtime-owned artwork | Banner frame and three archive-door assets | Runtime-version-bound path/hash, intrinsic dimensions, MIME type, provenance, and explicit bootstrap criticality; never an ordinary content-form field. |

The source schema advertises a `managed-asset` media variant, but the current semantic validator always rejects it as unresolved because no permanent resolver is authorized. Hub Swapper must display that variant as unavailable until an end-to-end resolver, preview, publication, and runtime contract is implemented; schema vocabulary alone is not feature availability.

For every supported authorable image or video reference, Lanternworks must validate before review:

1. the media record exists and the reference is unique;
2. the URL is HTTPS and from a provider authority explicitly bound by policy, or is a repository-controlled asset path;
3. provider-specific identity parses correctly;
4. the alternative text or accessible title is present where required;
5. the preview can exercise normal, slow, missing, and failed retrieval without changing the canonical record; and
6. runtime-owned banner and archive-button assets remain outside the content form.

The current bootstrap treats all nine runtime artwork files as required before mount. Earlier “failed optional artwork” language would contradict that behavior. The future policy must either preserve all nine as required or deliberately reclassify named assets and update bootstrap/runtime/fallback tests in the same versioned change; clients must not assume any current artwork is optional.

Google Drive/document share links and other non-media pages are not valid image sources. A successful preflight fetch is useful evidence but cannot guarantee a future network request; every visual component therefore needs a localized fallback.

Fallback rules:

- replace only the failed media pane, not the owning card;
- preserve the subject title, explanatory copy, route, and action whenever they are still valid;
- identify the missing subject in text, not only by a decorative icon;
- keep the fallback inside the same rounded viewport and aspect contract;
- do not retry indefinitely or delay the entire Hub because one localized post-mount media request failed; and
- for a blocked/unavailable video, provide a truthful message plus a safe alternate provider link when available.

## Card and typography invariants

1. A card is the visible viewport for its subject. Its image, iframe, fallback, overlay, label, decorative light, and animation remain inside the card border and clipping boundary.
2. Headings, copy, pills, tags, and actions remain in readable flow inside their owning card. No foreground item may look detached onto the page or overlap another component.
3. Current Exploration remains the dominant subject. Welcome/video and Current TWWL are supporting regions, not miniature thumbnails.
4. At `1920 x 911`, identity/navigation, Welcome/video, Current Exploration, Current TWWL, and all three history doors remain glanceable without page scrolling. Supporting footer or additional detail may continue below.
5. When width, height, zoom, localization, or author copy removes the panoramic fit, the document grows vertically. It must not hide content, overlap layers, or compress essential reading text into microtype.
6. The three history doors have equal width, height, aspect behavior, and priority at every layout tier.
7. The six decorative banner-frame pieces remain side/bottom page chrome and outside normal content flow. They do not become top-of-page cards on mobile or narrowed desktop.
8. Repository personality remains scoped to `.hrv-classroom-hub`. The native Amadeus shell remains the neutral boundary and the unavailable doorway remains readable without runtime CSS.
9. Essential copy uses the repository accessibility baseline documented in [UI conventions](ui-conventions.md). Metadata and decoration may be quieter, but no interactive label or necessary status may become illegible dashboard microtype.
10. Long words and unbreakable content wrap within their component. Root-level clipping is never treated as proof that overflow is solved.

The local repair implements semantic typography tokens for this baseline: `--text-body: 18px`, `--text-ui: 16px`, `--text-secondary: 16px`, `--text-small: 15px`, and `--text-eyebrow: 15px`, with a `17px` narrow/phone body baseline and separate display-heading tokens. That is a covered implementation subset, not evidence that every long-copy, localization, fallback-font, and zoom fixture in this rubric has passed.

### Source-to-render traceability

The future Hub profile must publish a machine-readable mapping from each authorable JSON Pointer and stable `nodeId` to the rendered `data-hrv-node-id`, `data-hrv-content-id`, or `data-hrv-slot-id`, the owning card/state, applicable copy/media rules, and required fixtures. Preview diagnostics and warning acknowledgements must use that map so a selected DOM element and a reported policy failure resolve back to one canonical field. Heuristic matching by visible title or DOM position is not sufficient.

## Empty, loading, and error states

Every lifecycle state must preserve a stable accessible heading, a truthful status, and a useful next action when one exists.

| State | Required presentation |
| --- | --- |
| Initial host fallback | Visible before runtime starts; readable in native Amadeus with no dependency on root `rem`; identifies the Hub and temporary unavailability. |
| Loading | The mount must not become a blank rectangle while CSS, runtime, manifest, and artwork load. Retain the fallback or replace it with a dedicated labeled loading state until one atomic ready mount. |
| Fatal bootstrap/integrity/schema error | Restore the exact original fallback, remove partial runtime styles/resources, and record diagnostic detail outside visitor-facing copy. |
| Individual media failure | Localized contained fallback; do not fail the whole Hub when the subject's non-media content remains valid. |
| Empty Past gallery | Purposeful empty explanation; search/filter and result-count controls are hidden or disabled because they have nothing to operate on. |
| Filter-to-zero | Visible “no matches” result, polite live announcement, and a clear-filter action; dialog size and close action remain stable. |
| Zero previous years | Purposeful empty explanation or equivalently explained disabled door; never a heading followed by an unexplained void. |
| `coming-soon` archive | Explicit non-link preparing status that cannot be mistaken for a failed published link. |
| Teardown/remount | Remove listeners, observers, object URLs, pending media work, dialog state, and temporary fallback resources before a deterministic remount. |

Loading and error tests must include delayed CSS/runtime/manifest/artwork, each policy-declared artwork criticality class, failed required runtime bytes, malformed content, and a retry/remount. Under the current bootstrap all nine artwork files belong to the required class. The visitor-facing state must not expose internal URLs, hashes, stack traces, or credentials.

## Dialog accessibility requirements

The three history doors open native `<dialog>` elements when supported. Every dialog must have an accessible name, visible close control, logical heading order, bounded internal scrolling, and content whose reading order matches its visual order.

Both native and fallback modality paths must prove:

- focus moves to the dialog or its first meaningful control on open;
- Tab and Shift+Tab remain within the modal while it is open;
- Escape closes it;
- backdrop dismissal, if supported, does not trigger when the user clicks dialog content;
- focus returns to the exact invoking door;
- background content is inert/unavailable to assistive technology during fallback modality;
- the dialog remains fixed to the viewport and cannot be clipped by the Hub root at desktop, tablet, phone, or high zoom; and
- opening, filtering, emptying, closing, remounting, and route activation do not leak event listeners.

A test that exercises only browsers with `HTMLDialogElement.showModal` does not satisfy the fallback requirement.

## Required responsive, height, and zoom acceptance matrix

The form preview may offer fewer convenient presets, but publication evidence must exercise the boundary pairs where the cascade changes, not only familiar device names.

### CSS viewport widths

`2560`, `1920`, `1680`, `1679`, `1440`, `1439`, `1331`, `1330`, `1181`, `1180`, `1000`, `999`, `721`, `720`, `719`, `390`, and `320` pixels.

### CSS viewport heights

At least `911`, `821`, `820`, `819`, `768`, `667`, and one shorter supported browser window. Pair the `821/820/819` heights with `1920` and `1600` widths to catch short-wide regressions.

### Native browser zoom and display-scaling claims

Exercise real Chrome browser zoom through native accelerator behavior at least at `80%`, `100%`, `125%`, `150%`, and `200%`, including a narrowed non-full-screen browser geometry. Record the resulting CSS-pixel viewport instead of assuming zoom equals a width-only resize.

A headless/devtools viewport and device-pixel-ratio scenario is an emulated geometry proxy. It is not evidence of a physical `1920 x 911` monitor, an interactive non-full-screen browser window, or Windows display scaling. Evidence must label native browser zoom separately from emulated viewport/DPR. A claim about Windows `125%` or `150%` display scaling requires an authorized interactive Windows run with the actual OS setting recorded. Check signed-out native Amadeus for public evidence; when authorized, a signed-in administrator view may diagnose host chrome but must remain separately labeled.

### Content/lifecycle fixtures

At minimum, combine the geometry matrix with representative fixtures for:

- accepted normal content;
- long-but-allowed titles, summaries, learning points, tags, and unbreakable tokens;
- Current TWWL Coming Soon;
- published Current TWWL with image, intentional no-image fallback, and failed image;
- Past galleries with zero, one, the normal accepted count, twelve, filter-to-zero, and a failed card image;
- Previous Years with zero entries, a canonical `coming-soon` entry rendered as preparing, and a `published` entry;
- normal video, delayed video, and blocked/unavailable video;
- native dialog and forced fallback-dialog capability;
- initial fallback, delayed loading, integrity failure, schema failure, teardown, and remount; and
- normal motion, reduced motion, and background/foreground lifecycle transitions.

An optimized pairwise matrix may reduce duplicate browser runs, but it must still cover every seam, height trigger, zoom level, lifecycle state, and card class. Keep the generated case map with the evidence so omitted combinations are visible.

## Rendered acceptance measurements

For each applicable case, automated evidence must record and assert:

- `documentElement.scrollWidth <= documentElement.clientWidth + 1` and the same for the body/mount;
- every required card descendant's rectangle remains within its owning card within a `1 CSS px` containment tolerance;
- media stages and fallbacks remain within the corresponding visual viewport;
- the three history doors differ by no more than `1.5 CSS px` in corresponding width and height;
- no fixed-height card containing required visible copy has `scrollHeight > clientHeight`;
- the first panoramic group ends within `1920 x 911` in the approved desktop case;
- no focusable control is clipped, covered, off-screen without an accessible scroll path, or below the `44 CSS px` target; browser subpixel measurement may use at most `1 CSS px` reporting tolerance and must record the measured value;
- computed font size, line height, wrapping, line count, and overflow for every text role under long-content and zoom fixtures;
- dialog viewport rectangle, internal scroll dimensions, active element, focus loop, close route, and returned focus;
- loading/error status text and atomic transition to ready or restored fallback; and
- image/video normal and fallback state, including the remaining usable destination.

Screenshots are required for visual judgment, but DOM measurements and interaction traces are required because root clipping, dark overlays, and stitched screenshots can conceal defects.

### Browser evidence integrity

A browser-evidence command must refuse to run against stale generated output. Before launching the browser, it must prove that the built content manifest equals a fresh projection of the current canonical source/routes and that the built runtime, stylesheet, bootstrap, and host-compatibility hashes equal the current repository source bytes.

Evidence must be assembled in a temporary sibling directory and promoted as one bundle only after the complete run succeeds. A failed or interrupted rerun must leave the prior complete bundle intact; it must not mix new screenshots with old JSON. Each screenshot record must include its CSS viewport, device-pixel ratio, PNG pixel dimensions, byte length, and SHA-256.

The bundle must also record the evidence-harness path and SHA-256, browser executable/version, exact raw-byte hashes for source, routes, control manifest, runtime, CSS, bootstrap, and host-compatibility bytes, the distinct canonical source/routes transaction revisions, and a canonical control-manifest revision. Once machine-readable policies exist, their common-policy and Hub-profile IDs, versions, and hashes are required too. The exact numeric tolerances used by the assertions must be data: `containmentToleranceCssPx: 1`, `equalDoorDeltaCssPx: 1.5`, `minimumTargetCssPx: 44`, and `targetMeasurementToleranceCssPx: 1`.

Browser diagnostics should retain uncaught runtime exceptions, relevant console/log errors, failed required first-party requests, and unexpected first-party HTTP failures. Expected external-provider failure fixtures must remain distinguishable from application defects so a deliberate localized fallback does not create a false global failure.

Media evidence must use exact language:

- a decoded/complete image plus visible pixels can be recorded as image-ready;
- an iframe `load` event proves only that its framed navigation completed, not that a third-party video is playable;
- a screenshot may prove that provider UI was visibly present at capture time; and
- playback requires a separate authorized interaction check and must never be inferred from iframe load alone.

Hosted Linux geometry evidence and Windows-native browser-zoom evidence are complementary artifacts. A Linux job that records native zoom as `not-run` may still validate layout geometry, but it cannot satisfy a Windows-native zoom gate. CI must provision an explicit browser version, preserve both evidence bundles, and label the uncovered platform honestly.

## Authoring-form behavior

A future Hub Swapper/Lanternworks form should:

- group fields by stable card/slot identity and show the exact target year and route;
- state which media is required, optional, intentionally omitted, unresolved, or runtime-owned;
- display remaining soft-budget characters without treating the budget as the only fit test;
- show stable coded errors next to the exact field and retain all unsaved input after rejection;
- preview all changed cards at desktop, narrowed desktop/tablet, and phone, with an expanded boundary/zoom review when warnings exist;
- show before/after Current/Past/previous-year relationships and exact expected source/route revisions;
- reject stale revisions and duplicate command/idempotency use without applying a partial update;
- provide an explicit empty-state preview before removing the last gallery/archive item;
- identify whether a warning is copy fit, media readiness, route integrity, accessibility, or rendered geometry;
- never expose `hub.control.json`, generated runtime JSON, immutable release files, or Edublogs field contents as free-form editable text; and
- generate a reviewable diff before any repository mutation or publication step.

Suggested stable presentation error families include `HUB_COPY_SOFT_BUDGET`, `HUB_COPY_SAFETY_CAP`, `HUB_MEDIA_REQUIRED`, `HUB_MEDIA_UNRESOLVED`, `HUB_EMPTY_STATE_UNSUPPORTED`, `HUB_CARD_OVERFLOW`, `HUB_DIALOG_ACCESSIBILITY`, `HUB_LOADING_STATE`, `HUB_BREAKPOINT_REGRESSION`, and `HUB_ZOOM_REFLOW`. Exact error codes must be versioned with the control contract rather than improvised by each client.

## Publication and evidence gate

A successful form transaction is not publication. The same exact projected source/routes pair must pass:

1. schema and semantic validation;
2. adversarial transaction and stale-revision tests;
3. deterministic content projection, runtime-schema validation, browser-runtime compatibility validation, and runtime build checks;
4. the state and geometry matrix above;
5. human visual approval of real-browser screenshots, including `1920 x 911`;
6. immutable release-tree and public CDN byte/hash verification;
7. thin-doorway pin verification against the approved runtime and publication; and
8. signed-out Edublogs behavior plus recorded rollback target.

Evidence must identify one exact commit, source revision, runtime version, publication ID, content snapshot, previous-known-good publication, browser evidence artifact, and screenshot set. Do not fill any field from an earlier publication, and do not use “deployed,” “published,” or “live” until external state has been verified.

### Evidence claim levels

The authoring/release interface must keep these evidence tiers visibly separate:

| Tier | What it may prove | Minimum evidence |
| --- | --- | --- |
| Local preview | One working tree or commit built and rendered safely in the recorded local browser matrix. | Exact raw-byte hashes and canonical revisions (kept distinct), control/policy identities where available, harness hash, browser/version, numeric tolerances, generated case map, DOM/interaction results, screenshots with byte length, and explicit `local-preview` identity. |
| Immutable release | One exact commit produced a verified immutable runtime, content snapshot, and publication binding. | Commit and ancestry, runtime version, publication ID, snapshot ID, release-tree hashes, CI URL/result, and public CDN GET byte/hash verification. |
| Doorway/live site | One Edublogs page points at the intended immutable release and behaves correctly in the native host. | Page ID/URL, installed field hashes, bootstrap/publication pins, SRI, signed-out browser evidence, approval identity/time, and no unverified administrator chrome in public evidence. |
| Rollback | A named target can be restored for the exact environment being changed. | Previous-known-good publication or verified page-field backup, target environment, restoration instructions, and validation evidence. |

The publication-staging command must distrust generated `dist` bytes: before creating or changing any immutable release directory, it must parse the incoming manifest, validate the runtime JSON Schema, apply the same runtime-compatibility validator used by the browser boundary, and fail without staging residue. A content build pass alone is not authority to promote manually altered output.

Current implementation coverage and gaps are recorded in the companion audit. That dated repair evidence is an example of the local-preview tier, not a substitute for the immutable-release, doorway, or rollback tiers.

## Change control

This rubric is deliberately durable and not frozen to one runtime hash or release. A change to field meaning, identity, relationship semantics, media optionality, copy safety caps, breakpoint ownership, accessible interaction, or publication evidence requires a reviewed contract/rubric version change and migration notes. A visual-only implementation change may preserve this rubric only when the full acceptance matrix proves every invariant still holds.

The canonical operation model remains documented in [the Lanternworks authoring contract](classroom-explorations-hub-lanternworks-contract.md). The permanent page/runtime boundary remains documented in [the Hub baseline](classroom-explorations-hub.md).
