# Classroom Explorations Hub permanent architecture

## Governing boundary

The existing Edublogs page remains the permanent public Hub route:

- WordPress page ID: `17`
- slug: `classroom-explorations`
- URL: `https://rmhughes.edublogs.org/classroom-explorations/`

Edublogs owns only the stable route, semantic mount, truthful native fallback, small fallback CSS, Full Width page setting, and tiny immutable loader. The repository application owns Hub rendering, scoped styling, animation presets, responsive behavior, structured Hub data, validation, and release assets.

The Hub must use the Edublogs **Full Width** page template at cutover. The repository root also performs the proven page-scoped viewport breakout. Do not move Hub application ownership back into page HTML or global widgets.

## Source-to-runtime pipeline

```text
apps/classroom-explorations-hub/content/hub.source.json
  -> tools/build-classroom-explorations-hub.mjs
     - structural/semantic validation
     - stable-id validation
     - privacy validation
     - YouTube normalization to youtube-nocookie.com
     - deterministic ordering
  -> apps/classroom-explorations-hub/public/hub.manifest.json (generated, ignored)
  -> dist/classroom-explorations-hub/hub.manifest.json
  -> immutable release directory
```

`hub.source.json` is the friendly authoritative content contract. Generated manifests and rendered HTML are outputs, not editing surfaces.

The future Hub Swapper must edit the friendly source transactionally, validate it, regenerate the strict manifest, run Hub checks, and produce a reviewable repository change. It must not scrape rendered Hub HTML or edit generated JSON directly.

## Launch content state

For the first 2026–2027 permanent release:

- welcome video: current approved legacy Hub video, normalized to the privacy-enhanced YouTube embed;
- Current Exploration: `summer-bloom-adoption-project` (Summer Bloom Adoption Project / Zinnia);
- Current This Week We Learned: intentional `coming-soon` record until an approved 2026–2027 recap exists;
- current-year Past Explorations: empty;
- current-year Past This Week We Learned: empty;
- prior-year representation: exactly one `archive-2025-2026` doorway record;
- individual 2025–2026 Exploration/TWWL page records are **not** part of the launch Hub manifest.

The 2025–2026 material will be converted to the permanent page system after Hub launch. When that archive exists, the doorway record receives its real HTTPS `pageUrl` and becomes the route into last year's material. Until then the source truthfully carries `pageUrl: null` and `status: coming-soon`.

Do not reintroduce the old Hub's individual historical cards merely to make the doorway appear populated before the archive conversion is complete.

## Current-year rotation contract

The permanent schema remains capable of supporting future content even though launch data is deliberately small.

The Hub Swapper will eventually implement these operations:

1. Exactly one current Exploration for the current school year.
2. Exactly one current or Coming Soon This Week We Learned slot for the current school year.
3. Replacing a current item can move the outgoing item to `past` in the same school year.
4. Current-year `past` records render in the corresponding Past section.
5. School-year archive doorways are explicit records with stable IDs and machine-readable school years.
6. IDs remain stable when an item moves between current and past states.
7. Generated manifests are never directly edited.
8. Production releases are immutable.

## Navigation ownership

The legacy Footer Left Exploration Helper is retired architecture.

It previously downloaded the Hub and scraped visible links to infer Exploration/TWWL membership. The permanent Hub architecture does not preserve or replace that behavior.

Future Exploration/TWWL child pages will own their own appropriate navigation components, including Back/Up navigation to Classroom Explorations and sibling navigation when designed for that page family.

At Hub cutover:

- remove the `#hrvExplorationNav` markup and its Exploration Helper script from Footer Left;
- preserve the separate Posts Helper;
- preserve the separate automatic header-scroll script unless later modernization explicitly replaces it;
- do not rebuild a manifest-driven floating Exploration Helper;
- do not restore permanent localStorage hide state for the retired helper.

The Center widget's `.hrv-floating-return-nav` CSS is shared with the Posts Helper, so do **not** remove the shared floating-nav CSS during Hub cutover. Cleanup can happen later after Posts navigation has its own permanent architecture.

Footer Right remains independent of the Hub and is not part of this cutover.

## Visual and animation ownership

The renderer places each record's stable `theme`, `animation`, `status`, and record ID onto its rendered component as data attributes.

The experience layer maps manifest animation presets such as:

- `gentle-glow`
- `garden-glow`
- `lantern-soft`
- `crystalline-door`

into scoped CSS effects. This keeps visual presets data-driven for the future Hub Swapper instead of hard-coding content-specific animation logic into page HTML.

All motion must honor `prefers-reduced-motion`.

## Hybrid page contract

The live page must use:

1. **HTML box:** semantic mount and useful native fallback only.
2. **CSS box:** tiny fallback styling only.
3. **JavaScript box:** tiny loader pinned to an exact immutable repository commit/release.

The repository bootstrap must remain fallback-first: preflight stylesheet, runtime, and manifest before taking visual ownership; restore the exact fallback if any required asset fails.

The JavaScript loader uses `data-layout="viewport"`. The Edublogs page template must be **Full Width** so the theme does not reserve a sidebar beside the repository experience.

## Build and release

```powershell
npm install
npm run check:hub
npm run build:hub
$env:HRV_SOURCE_COMMIT = (git rev-parse HEAD)
npm run stage:hub-release -- <release>
```

The staged release must contain:

```text
releases/classroom-explorations-hub/<release>/
  bootstrap.js
  hub.manifest.json
  assets/classroom-explorations-hub.js
  assets/classroom-explorations-hub.css
  release.json
```

Release directories are immutable. Replace `__IMMUTABLE_COMMIT_SHA__` and `__RELEASE__` in the Edublogs JavaScript example only after the release commit is published. Never use mutable `@main` delivery.

## Cutover boundary

Repository preparation may happen before live authorization. Until `GO HUB CUTOVER`, do not edit:

- page 17;
- Edublogs widgets;
- global CSS;
- WordPress configuration/template assignment;
- existing Exploration/TWWL pages;
- Photo Album, Cloudflare, or Google Drive.

At cutover:

1. retain the already-preserved legacy page 17 HTML as rollback evidence;
2. use the captured Footer Left widget source as rollback evidence;
3. set page 17 to Full Width;
4. replace legacy page 17 content with the semantic Hub mount/fallback;
5. install the tiny fallback CSS and immutable loader;
6. remove only the retired Exploration Helper portion of Footer Left, preserving Posts Helper and automatic scroll;
7. leave Center/global CSS and Footer Right untouched for this cutover;
8. validate signed out on desktop and mobile, keyboard navigation, reduced motion, normal runtime load, and fallback behavior.

## Minimum rollback

Rollback restores:

1. the preserved legacy page 17 HTML;
2. the previous page-template value if it was changed;
3. the preserved Footer Left widget source if the Exploration Helper removal must be reversed;
4. removal/disablement of the new Hub three-box integration.

No Exploration/TWWL permalink changes, WordPress reparenting, archive conversion, Photo Album changes, Cloudflare changes, or Drive changes are part of this Hub cutover.
