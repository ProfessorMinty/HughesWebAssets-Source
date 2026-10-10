# Classroom Explorations Hub card-state, responsive, zoom, and cascade audit

**Audit date:** 2026-09-12<br>
**Audited baseline:** `9352b9b07fd530e725cebda0d1e07dcdc221eb0b` on `hub-authoring-v2-2026-08-28`<br>
**Status:** covered local repair implemented and locally verified at `2379c500cd2c445939245246c1b0b44b1e4e3c42`; full future-rubric acceptance not established<br>
**Primary product viewport:** `1920 x 911` CSS pixels<br>
**Companion rubric:** [Classroom Explorations Hub manifest authoring and presentation rubric](classroom-explorations-hub-manifest-authoring-rubric.md)

## Outcome

The approved Hub composition is a sound product direction: Welcome/video and Current Exploration share the primary row, Current TWWL spans most of the second row, and three equal archive doors occupy the right rail. The exact approved responsive publication also has meaningful happy-path browser evidence.

The baseline was not, however, safe for every state the authoring contract permits. The forensic pass found gaps in published Current TWWL, empty and filtered galleries, zero archives, media failure, startup, non-native dialog behavior, short-wide windows, and CSS cascade continuity. Those gaps matter to Hub Swapper/Lanternworks because a valid source edit can move the renderer into one of these states without changing application code.

This document separates the audited baseline findings from the local repair and its evidence. It does not supersede Poppet's visual approval, change the palette, redesign mobile, update an Edublogs field, or declare the current working tree released.

## Authority and evidence order

The audit used the following sources in this order:

1. the canonical HRV current-authority and current-system-map documents in `ProfessorMinty/ProjectDocumentation`;
2. `ProjectDocumentation/EDUBlogs/Architecture/HUGHES_ROOM_VIEWS_NATIVE_AMADEUS_BASELINE.md`;
3. [Classroom Explorations Hub permanent baseline](classroom-explorations-hub.md);
4. [Classroom Explorations Hub Lanternworks authoring contract](classroom-explorations-hub-lanternworks-contract.md);
5. the source, schemas, projector, runtime, CSS, Edublogs doorway, and tests at the audited commit;
6. the previously recorded browser evidence in [the approved responsive doorway handoff](edublogs-integration/classroom-explorations-hub-test/README.md).

The Amadeus baseline is the readable neutral shell boundary. The Hub may own its internal atmosphere, typography, palette, animation, and page-specific magic, but its rules must remain scoped to `.hrv-classroom-hub`, and the doorway fallback must remain readable under native Amadeus behavior.

## Verification boundaries and tested matrix

### Previously recorded accepted browser evidence

The approved responsive doorway handoff records real-browser checks for immutable runtime `2026.08.31.2` / publication `pub-2026-08-31-002`. That evidence includes:

- exact `1920 x 911` desktop geometry with the opening composition ending at `y=910` and the footer continuing below;
- width checkpoints at `390`, `719`, `720`, `721`, `768`, `980`, `1024`, `1179`, `1180`, `1181`, `1330`, `1331`, `1366`, `1439`, `1440`, and `1920` pixels;
- a `1920 -> 1366 -> 980 -> 768 -> 390 -> 1920` resize round trip;
- equal archive doors and no horizontal overflow at those checkpoints;
- native-dialog open/close behavior, focus return, gallery filtering, recorded media/provider readiness, and continuous star animation. An iframe `load` event is navigation evidence, not proof of video playback.

That accepted evidence remains valid for the exact immutable bytes and states it exercised. The local repair evidence below is a new pre-release evidence tier; it does not retroactively broaden that publication or prove a live doorway.

### Direct forensic coverage on 2026-09-12

| Evidence class | Result | Boundary |
| --- | --- | --- |
| Source/schema/projector inspection | Complete | All authorable Hub fields and source-to-runtime projection inspected. |
| Runtime/stylesheet/doorway inspection | Complete | Welcome, Current Exploration, Current TWWL, all three history doors, three dialogs, galleries, archives, loading, error, media, and responsive rules inspected. |
| Clean-baseline `npm run test:hub` | Passed before repair edits | Static contract, transaction, presentation, and host-compatibility checks; the presentation test explicitly does not claim browser visual acceptance. |
| Repaired commit `npm run check:hub` | **Passed 2026-09-12** | Syntax, source/transaction/runtime/lifecycle/presentation/host checks, deterministic Hub build, 27-case Chrome geometry, native and fallback dialogs, 11 responsive lifecycle cases, 10 Windows-native zoom cases, and publication staging passed. |
| Repository-wide `npm run check` | **Passed 2026-09-12** | Seven Vitest files / 25 tests plus TypeScript and Vite production build passed. This remains regression evidence, not Hub publication evidence. |
| Real-browser geometry and screenshots | **Passed for the covered local-preview matrix** | Chrome `152.0.7977.83`; 27 geometry cases passed and five atomically generated screenshots were visually inspected. This is headless local-preview evidence, not a physical-window or live-site claim. |
| Native browser zoom | **Passed on Windows for the recorded cases** | Ten cases used real Chrome accelerator zoom at `80%`, `100%`, `125%`, `150%`, and `200%`. Their desktop-window and Windows-display-scaling bases are emulated viewport/DPR proxies, not proof of a physical monitor or actual OS display scaling. |
| Alternative lifecycle states | **Passed for the covered subset** | Eleven desktop/tablet/phone cases cover published TWWL with/without image, intentional media-unavailable geometry, and empty galleries/archives; unit coverage also proves filter-to-zero/clear, visible loading, and dispatched media errors. Fifteen native-dialog and three forced-fallback-dialog cases passed. Long-copy, large-collection, complete failure/retry, motion, and other full-rubric cases remain future work. |
| Live Edublogs / CDN | Not exercised | No signed-in profile, Edublogs field, immutable release, CDN object, or doorway pin was read or changed by this repair. |

## Responsive and cascade findings at `9352b9b`

Line references in this section are anchored to the audited commit. Later repairs may move them.

### 1. The desktop panorama had almost no vertical tolerance

`apps/classroom-explorations-hub/src/hub.css:1886-2019` declares the desktop grid as:

```text
top padding 14
+ row 1 minimum 88
+ gap 14
+ row 2 minimum 480
+ gap 14
+ row 3 minimum 300
= y 910
```

That exactly explains the accepted `y=910` result at `1920 x 911`. It also means the happy-path composition has approximately one pixel of tolerance before the third row moves below the opening viewport. Expansion is allowed and preferable to clipping, but a published TWWL, longer authoring copy, font fallback, or host-height change can no longer satisfy the one-canvas goal without a deliberate reflow.

### 2. A short-wide override expanded the identity rail to roughly 390 pixels

`hub.css:2843-2852` applies at widths of at least `1600px` and heights of at most `820px`. It gives `.hub-hero-card` a `390px` minimum height and `.current-visual` a `370px` minimum/`400px` height. Because the desktop first row is `minmax(88px, auto)` and the card participates in that row, a short browser window can expand the identity/navigation rail by more than 300 pixels and push the primary cards down.

The presentation test at `tools/test-classroom-explorations-hub-presentation.mjs:595-599` rejects one older grouped-selector pattern, but it did not detect these two standalone declarations.

### 3. Width rules had a declarative continuity gap from `1331` through `1439`

The stacking rule ends at `hub.css:1846-1878` (`max-width: 1330px`). The panorama begins at `hub.css:1886` (`min-width: 1440px`). The interval between them falls back to legacy base geometry, including the Welcome grid at `hub.css:552-558` with `430px` and `720px` minimum tracks plus a gap.

The approved content reportedly rendered without horizontal overflow at `1331`, `1366`, and `1439` pixels. The defect is not that those screenshots are invalid; it is that the cascade has very little content, scrollbar, font, or zoom tolerance and no continuous explicit layout owner across the interval.

### 4. Two large intended desktop blocks were permanently dormant

The stylesheet contains impossible queries beginning at `hub.css:2863` and `hub.css:3837`:

```css
@media (min-width: 1440px) and (max-width: 1439px)
```

The latter block contains extensive composition and typography declarations described as approved or definitive, but none can match. This makes source order hard to reason about and allows a later maintainer to read dormant declarations as active behavior. Impossible ranges and superseded blocks do not belong in the production cascade; history belongs in Git and dated evidence.

### 5. Browser zoom was not equivalent to the recorded width matrix

Browser zoom changes the CSS-pixel viewport in both axes and can therefore cross a width breakpoint while simultaneously triggering a short-height condition. A resized `1366 x 768` viewport does not prove the same layout as a physical `1920 x 911` display at `125%`, `150%`, or `200%` zoom. The accepted evidence covered width seams and a resize round trip, but it did not record native browser zoom, computed card sizes, or scroll/client dimensions at zoom.

### 6. No component has a container-query contract

No `@container` or `container-type` rule existed. Every card responds only to the viewport even though the same gallery/archive content also renders inside an approximately `1180px` dialog (`hub.css:3684-3705`) and the desktop Current TWWL/history rail receive narrow grid columns. Viewport rules can remain part of the page composition, but reusable card/dialog content needs explicit container-size acceptance or equivalent tested intrinsic rules.

### 7. Root clipping could hide rather than solve an overflow defect

The application and museum both use `overflow: clip` (`hub.css:1-32` and `72-80`). Card-level clipping is an appropriate paint boundary for media and decoration. Root-level clipping is not proof of successful layout: acceptance must compare scroll and client dimensions and inspect every card's descendants so off-canvas content cannot be hidden and misreported as “no scrollbar.”

## Card and lifecycle-state audit

| Surface/state | Baseline behavior | Finding at audited commit | Required outcome |
| --- | --- | --- | --- |
| Welcome/video, normal | Required featured YouTube embed in a contained 16:9 screen | Approved happy path was visually verified. | Preserve proportions, title, controls, and card containment. |
| Welcome/video, blocked or failed | Iframe has no reliable load-failure UI or poster; no direct alternate link | Post-mount provider/network failure can leave a blank screen. | Keep the card and copy; show a truthful contained fallback and safe alternate action. |
| Current Exploration, normal | Required record, route, image, title, summary, points, tags, CTA | Approved Zinnia state fits and is visually dominant. | Current remains required and dominant; all copy/CTA remain inside the card. |
| Current Exploration, image failure | `imageNode` only assigns `src`, `alt`, `loading`, and `decoding` (`runtime.js:52-59`) | Broken media has no component fallback after mount. | Replace only the media pane with a contained fallback; preserve copy and route. |
| Current Exploration, long copy | Desktop row is fixed by the panoramic target; primary copy is not intentionally truncated | Valid source has no maximum lengths or list counts. | Reflow or continue vertically; never overlap media or silently shrink/truncate essential copy. |
| Current TWWL, Coming Soon | Explicit slot state with lantern visual | This is the only TWWL state exercised by the presentation fixture (`test-classroom-explorations-hub-presentation.mjs:781-784`). | Preserve truthful Coming Soon state and accessible text. |
| Current TWWL, published with image | Runtime appends image, `.twwl-glass`, label, tags, and CTA (`runtime.js:693-711`) | `.twwl-glass` had no stylesheet rule; `.twwl-visual-label` shared only generic absolute styling at `hub.css:853-864` with no dedicated inset/padding. This state lacked browser evidence. | Complete media overlay styling and prove copy, tags, CTA, and label at every acceptance tier. |
| Current TWWL, published without image | Source schema permits TWWL `image` to be absent (`schemas/classroom-explorations-hub.source.schema.json:373-443`); projector preserves that absence (`contract.mjs:366-375`) | Runtime creates an empty visual pane when no image exists. | Require media for ordinary publication or render an explicit, approved no-image/fallback state. |
| Current TWWL, image failure | Same `imageNode` behavior as Current Exploration | A network/media failure can leave a blank pane. | Localized contained fallback; story route and text remain usable. |
| Past Explorations, populated | Three cards inside a dialog with search/count | Approved `3`-card state and filtering were tested. | Preserve accessible links and image-rich density. |
| Past TWWL, populated | Five cards inside a dialog with search/count | Approved `5`-card state and filtering were tested. | Preserve accessible links and image-rich density. |
| Either gallery, truly empty | Empty copy renders after the normal header (`runtime.js:740-793`) | Filter input and blank live count still render but are never wired. | Suppress or disable irrelevant tools and show one purposeful empty state. |
| Either gallery, filter-to-zero | Cards are hidden and count becomes zero (`runtime.js:823-842`) | No visible “no matches” state or clear-filter route exists. | Announce zero results, show a clear action, and keep dialog geometry stable. |
| Gallery card, missing/failed image | Exploration image is required; TWWL image is optional; neither renderer has failure handling (`runtime.js:851-910`) | Blank or broken visual can remain inside an otherwise valid card. | Render a labeled, contained subject fallback without removing the destination. |
| Past Explorations door | Runtime-owned artwork-backed button | Equal-size desktop and responsive geometry was a verified success. | Freeze equal relationship/priority with the other two doors. |
| Past TWWL door | Runtime-owned artwork-backed button | Same as above. | Same as above. |
| Past Years door | Runtime-owned artwork-backed button | Same as above; one baseline rule used a different `2.5 / 1` ratio before later overrides normalized desktop. | Same intrinsic ratio and dimensions as the other doors at every tier. |
| Previous-year entry, published | Link with year label and caption (`runtime.js:929-933`) | One published archive was tested. | Link must resolve through the route registry and remain keyboard accessible. |
| Previous-year entry, `coming-soon` | Non-link status card (`runtime.js:934-941`) | Representable but not part of the accepted browser fixture. | Clearly non-actionable status; visitor-facing “preparing” text must not look like a broken link. |
| Previous Years, zero entries | `previousYears` has no `minItems`; renderer loops zero times (`runtime.js:913-948`) | Modal opens with heading/intro and no controls or explicit state. | Show a purposeful “no previous years yet” state or disable the doorway with equivalent explanation. |
| History dialog, native | Native `<dialog>` with close button/backdrop click | Approved browser path opened/closed all three and restored focus. | Retain native top-layer semantics, Escape, focus return, and bounded scrolling. |
| History dialog, no `showModal` | Runtime merely sets `open` (`runtime.js:524-526`) | Fixed positioning is only active inside the desktop query (`hub.css:1997-1999`); below desktop it can be clipped by the Hub root. No focus trap, Escape handler, or guaranteed focus return exists. | Implement and test a real fallback modality path at desktop, tablet, and phone. |
| Initial host fallback | Friendly Edublogs outage card | Correct fail-closed destination exists. | Remain visible and readable before startup and after failure. |
| Loading | Doorway hides its only notice immediately (`JAVASCRIPT-BOX.js:56-58`); bootstrap waits for CSS, runtime, manifest, and nine artwork resources (`bootstrap.js:146-193`) | Slow startup presents a blank root for as long as 20 seconds. | Keep useful status visible or show a dedicated loading state until atomic mount. |
| Fatal load/integrity/schema error | Bootstrap restores original fallback (`bootstrap.js:10-23`, `201-205`) | Architecture is correct, but fallback CSS uses `rem` under an Edublogs environment known to alter root sizing. | Exact fallback restoration with pixel-safe, Amadeus-readable type and no partial app styles. |
| Teardown/remount/duplicate start | Runtime owns listeners, observers, blob URLs, and duplicate mount map | Static tests cover teardown/remount and duplicate renderer mount. | Preserve; add open-dialog and in-flight-media cleanup coverage. |

## Typography and intrinsic-sizing findings

The approved desktop release records deliberate Georgia/Cambria display type and system-UI reading type. That visual approval should not be erased. The durable integration issue is that repository text must remain legible and stable under the Amadeus host:

- [UI conventions](ui-conventions.md) require an 18px normal desktop body baseline, 17px narrow baseline, 16px controls/secondary text, and 15px metadata/eyebrows. Several active desktop roles at the audited commit are smaller: 13px section kickers, 13px tags, 15px actions, 13px captions, and 10.5px archive-door labels (`hub.css:2121-2131`, `2293-2315`, `2358-2368`, `2583-2603`).
- The doorway fallbacks use many `rem` values (`docs/edublogs-integration/classroom-explorations-hub-test/CSS-BOX.css:22-25`, `56-60`, `88-134`; production `CSS-BOX.css:8-76`). The local preview deliberately emulates a 10px host root, so these values can collapse exactly when the repository runtime is unavailable.
- Source strings and arrays have minimum-presence checks but almost no maximum lengths or item counts. The accepted source already contains a 141-character Current summary, 61-character learning point, and 44-character TWWL title; arbitrary shorter hard limits would destroy valid teacher copy. The correct control is a warning budget plus an absolute safety cap and rendered fit gate, as defined in the companion rubric.
- Unbreakable tokens, long translated words, and user-inserted URLs need `overflow-wrap`/intrinsic-size handling. Root clipping is not an acceptable substitute.

The local repair defines semantic type tokens matching the repository baseline: `--text-body: 18px`, `--text-ui: 16px`, `--text-secondary: 16px`, `--text-small: 15px`, and `--text-eyebrow: 15px`, with a `17px` narrow/phone body baseline and separate display-heading tokens. It also replaces Host-root-dependent fallback sizing with pixels. Computed browser assertions now verify the body/metadata floors, heading hierarchy, line spacing, wrapping caps, and expected display/UI families across the 27-case geometry matrix. The rubric's full long-copy, localization, and fallback-font matrix has not yet been satisfied.

## Invariants the repair must preserve

1. The card is the viewport for its subject. Images, iframes, glows, glass, pointer light, labels, and fallback art must paint inside the card's border radius.
2. Text, tags, pills, and actions must remain in the card's readable content flow. A background layer may sit behind them, but no element may appear visually detached from its owning card.
3. At `1920 x 911`, the main identity/navigation, Welcome/video, Current Exploration, Current TWWL, and three history doors remain glanceable together. Supporting footer/content may require scrolling.
4. At smaller windows and high zoom, preserving all content and usable type outranks one-canvas density. The page may grow vertically; it may not overlap, clip, or shrink essential text into dashboard microtype.
5. The three history doors are equal peers at every responsive tier.
6. Current Exploration remains dominant. Welcome/video and Current TWWL remain supporting regions, not thumbnail afterthoughts.
7. The six banner-frame pieces remain decorative page chrome, absolutely positioned outside content flow, and never move to the top as cards.
8. Native Amadeus shell styles are not repainted. Hub personality stays inside `.hrv-classroom-hub`; fallback stays readable against the native shell.
9. Existing performance, motion-pausing, endpoint-continuous star animation, reduced-motion safety, cleanup, immutable publication, and hash-verification architecture remains intact.
10. No source-valid state may depend on accidental clipping or a CSS declaration inside an impossible media query.

## Implemented local repository repair

The following repair is recorded in local commit `2379c500cd2c445939245246c1b0b44b1e4e3c42` and passed the covered verification described below:

- removes the harmful short-wide minimum-height override, impossible media queries, and misleading superseded desktop blocks;
- assigns continuous responsive ownership across the `1440`, `1330`, `1180`, `1000`, and `720` seams, including narrowed windows and zoom-derived CSS viewports;
- keeps the identity/navigation compact, gives all three history doors equal geometry, and preserves the approved `1920 x 911` panorama while allowing vertical document growth elsewhere;
- establishes a two-family, three-weight typography system with explicit title/section/body/metadata roles, aligned pills, readable actions, and no Host-root-dependent `rem` sizing in either Edublogs doorway fallback;
- enforces card and media paint containment in every tier and adds localized image, Current TWWL, gallery-card, and Welcome-video fallbacks;
- adds published Current TWWL, empty gallery/archive, filter-to-zero/clear, and visible loading states;
- gives the non-native dialog path a document-level portal, background isolation, focus containment, Escape close, cleanup, and exact invoker focus return;
- preserves legacy runtime-schema-v1 snapshots whose Hero predates the newer optional pillars/oath fields, supplying runtime defaults instead of breaking an already published manifest;
- validates projected manifests against both JSON Schema and browser-runtime compatibility during content build, and repeats both checks before immutable publication staging mutates release directories; and
- makes the browser suite part of `check:hub`, with responsive geometry, native/fallback dialog, lifecycle, media-state evidence, and actual Chrome browser-zoom coverage. The desktop-window and display-scaling labels remain geometry proxies unless a real interactive OS-scaling run is performed.

The canonical Hub source, route registry, control manifest, approved artwork bytes, palette, and external systems were not changed.

## Verification and release evidence

Local pre-release evidence, immutable release evidence, and live doorway evidence are different claims. A local pass must not be promoted into a release or deployment claim.

### Current local repair verification

| Evidence | Current result |
| --- | --- |
| Base HEAD | `9352b9b07fd530e725cebda0d1e07dcdc221eb0b` |
| Branch | `hub-authoring-v2-2026-08-28` |
| Repair commit | `2379c500cd2c445939245246c1b0b44b1e4e3c42` |
| Canonical source raw UTF-8 byte SHA-256 | `3c85a2ce02f4ff11c337c8d28444604907971d4c2ca59d74d65e20b3ee009977` (`10,997` bytes) |
| Canonical source transaction revision (canonical JSON SHA-256) | `696c09c63695b6a8c0360aa5e5e32029cf418e21dcac9bf2b5ad5d810bac5be3` |
| Route-registry raw UTF-8 byte SHA-256 | `29ab9bc8262b128b2222d4a115b3906701f0d5747f6d3ebcab059680204c1a73` (`3,364` bytes) |
| Route-registry transaction revision (canonical JSON SHA-256) | `3af5e8c391e67d19e8a68f3dd444b8735d660e825c44b47bc2deada335b98a90` |
| Control-manifest raw UTF-8 byte SHA-256 | `7784b2d569ba13bf45ef512ca48c431166d6e249a75ad13058f848dca55110be` (`9,783` bytes) |
| Control-manifest canonical JSON revision | `207a0ba051218194111c81f8a2af95fcfc0e7e48e886501b3b3e6774fbbe1b6b` |
| Machine-readable common-policy / Hub-profile IDs, versions, and hashes | **PENDING FUTURE CONTRACT — not currently bound** |
| Local content snapshot | `sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b`; projected manifest bytes SHA-256 `99f92a626f362b37fea48a358ae786ac3a980d4a877823913f790c1080d4a054` |
| Local runtime/CSS/bootstrap/host-compatibility raw byte SHA-256 | runtime `d7242540de3b9f248d9d2f188a9a7256ff16ba3d89e1e7bd8886c6a5581f1081`; CSS `22a50907403d2a0bb370de44f121b33bb7df41ae966f41715c7c5842dfa5b3d8`; bootstrap `86c709f9254791884a52fe8031a8e2d23d29a6a61d34964ee8b39594e36fc159`; host compatibility `cd3bdebe94f39533e895764e126de568fb8221f7030157c79713df09c3d8d300` |
| Evidence-harness SHA-256 and numeric tolerances | harness `91d940bbedafdea0e05e983ccec40a191ae169eb5d588279e6b7e6c85a34108c`; `1px` containment, `1.5px` equal-door delta, `44px` minimum target with `1px` measurement tolerance |
| `npm run check:hub` | **Passed 2026-09-12** |
| `npm run check` | **Passed 2026-09-12** — seven test files / 25 tests, TypeScript, and Vite build |
| Browser evidence | [`browser-matrix.json`](../evidence/classroom-explorations-hub/repair-2026-09-12/browser-matrix.json) — SHA-256 `1541ce7f5d33939c129b111fbfe6b793fd505d52d7af5e9d456436ef1f1d04ce` |
| Browser/coverage | Chrome `152.0.7977.83`; 27 geometry, 11 responsive lifecycle, 15 native-dialog, three fallback-dialog, and 10 native-zoom cases; zero retained-observation drops and zero unexpected local browser errors |
| Native browser zoom | **Passed for the recorded Windows/headless cases** — real Chrome accelerator zoom; emulated viewport/DPR bases are not called physical or actual Windows display scaling |
| Screenshot media gate | **Passed** — Current image decoded, visible, and paint-eligible in all five captures; Welcome iframe emitted a `load` event in all five. Playback is not claimed. |
| Desktop screenshot | [`approved-desktop-1920x911.png`](../evidence/classroom-explorations-hub/repair-2026-09-12/approved-desktop-1920x911.png) — visually reviewed; `1,802,186` bytes; SHA-256 `ed3bbb504fd655e6ddfe882440a5397ab1cb5fc4474c3e27f5102f64e7fd72cd` |
| Short-wide screenshot | [`short-wide-former-failure-1920x820.png`](../evidence/classroom-explorations-hub/repair-2026-09-12/short-wide-former-failure-1920x820.png) — visually reviewed; `1,647,360` bytes; SHA-256 `f143ab574f6e5dbd974c46f9087e35e863aec20a6f9becb8fbf9c8b124283f22` |
| Narrow-desktop screenshot | [`narrow-desktop-1366x768.png`](../evidence/classroom-explorations-hub/repair-2026-09-12/narrow-desktop-1366x768.png) — visually reviewed; `1,476,834` bytes; SHA-256 `91e82edd3fea24bfc2749d775bd0aff14c99d0b5a0bbd2904971c4793630d640` |
| Tablet screenshot | [`tablet-980x911.png`](../evidence/classroom-explorations-hub/repair-2026-09-12/tablet-980x911.png) — visually reviewed; `1,474,141` bytes; SHA-256 `6509fd6e7482090ad63ae5dda46cd58c421b663074e1a877f7f89845253cdbd5` |
| Phone screenshot | [`phone-390x844.png`](../evidence/classroom-explorations-hub/repair-2026-09-12/phone-390x844.png) — visually reviewed; `1,924,514` bytes; SHA-256 `c44403583707d1edc05f227f91b03467fc386668b6b260c4e27ff19d2b5c9d13` |

The final browser artifact must identify its source as `working-tree` and its runtime/publication IDs as `local-preview`. Those labels are deliberate: local Chrome evidence for exact build bytes is not an immutable release, CDN response, or live Edublogs result.

### Immutable release evidence

| Evidence | Final value |
| --- | --- |
| Runtime version | **PENDING — not minted** |
| Publication ID | **PENDING — not minted** |
| Immutable content/release tree | **PENDING — not staged** |
| CI run URL and exact-commit result | **PENDING — no push** |
| Public CDN GET byte/hash verification | **PENDING — no upload** |

### Doorway and live-site evidence

| Evidence | Final value |
| --- | --- |
| Target Edublogs page and public URL | Page `17` / `/hub/` is the intended production target; **not changed or verified in this repair** |
| Review doorway | Page `2589` / `/hub-test/`; **not changed or verified in this repair** |
| Doorway bootstrap/publication pins and SRI | **PENDING — not installed** |
| Installed HTML/CSS/JavaScript field hashes | **PENDING — not installed** |
| Signed-out Edublogs browser evidence | **PENDING — not run** |

### Rollback evidence

| Evidence | Final value |
| --- | --- |
| Review-doorway previous-known-good publication | **PENDING — must be resolved from the target environment** |
| Production Page 17 rollback target or verified field backup | **PENDING — must exist before installation** |
| Rollback instructions/evidence path | **PENDING** |

## Covered repair and future-rubric acceptance

The current repair satisfies the following covered local-preview outcomes at commit `2379c500cd2c445939245246c1b0b44b1e4e3c42`; the exact hashes and case counts are recorded above:

- one active, continuous layout owner exists for every width; impossible media ranges and misleading dead production blocks are absent;
- `1600+`-wide short windows do not inflate the identity rail or push the primary row down unexpectedly;
- the implemented normal, published/no-image TWWL, intentional media-unavailable, empty/filter, zero-archive, loading, native-dialog, and forced-fallback-dialog fixtures pass at their recorded sizes;
- current and gallery media failures preserve readable copy, destination actions, and contained geometry;
- loading is not a blank root, and fatal failure restores the exact readable fallback without partial runtime styles;
- published Current TWWL is tested with media and with the runtime's explicit compatibility fallback; intentional source-level no-image publication remains blocked until a versioned intent field exists;
- empty galleries do not expose dead controls, filter-to-zero has visible/live feedback, and zero archives has a truthful state;
- native and fallback dialogs are modal, scrollable, keyboard-contained, Escape-closeable, and return focus;
- no card has `scrollWidth > clientWidth`; no fixed-height card with required visible copy has `scrollHeight > clientHeight`; document/root overflow is checked rather than merely clipped;
- the covered browser/zoom matrix passes with the normal and implemented lifecycle fixtures;
- static tests, deterministic hashes, and local real-browser evidence all pass on the same exact working tree or commit;
- no Edublogs page, CDN doorway, or production publication is claimed or changed until separately authorized and verified.

Full acceptance of rubric `2026-09-12.1` remains a future gate. It additionally requires the machine-readable common policy and Hub profile; long-but-allowed/unbreakable copy; zero/one/twelve/large collections; the complete delayed/failure/retry/remount and motion matrix; source-to-DOM traceability; deterministic media/provider/tag/year policy; policy-bound warning acknowledgements; real interactive evidence for any claimed Windows display-scaling state; and immutable-release, CDN, doorway, signed-out live-site, and rollback evidence. None of those gaps should block describing the narrower local repair honestly, and none may be silently inferred from it.
