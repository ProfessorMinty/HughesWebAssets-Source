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

## Navigation ownership and legacy state

The old floating Exploration Helper is **retired historical architecture**. It previously downloaded the Hub and scraped visible links to infer Exploration/TWWL membership. The permanent architecture does not preserve or replace that behavior.

Current live-state verification supersedes earlier migration notes: **the Exploration Helper is no longer present as a live Hub dependency. The only remaining legacy Hub surface that must be replaced at cutover is the page 17 HTML already preserved in backup.**

Therefore:

- do not rebuild a manifest-driven floating Exploration Helper;
- do not add any Hub-specific Footer Left dependency;
- do not alter Footer Left, Footer Right, Center/global CSS, or unrelated widget behavior as part of Hub cutover;
- future Exploration/TWWL child pages will own their own appropriate Back/Up and sibling-navigation components when those page families are modernized.

## Visual and animation ownership

The renderer places each record's stable `theme`, `animation`, `status`, and record ID onto its rendered component as data attributes.

The experience layer maps manifest animation presets such as:

- `gentle-glow`
- `garden-glow`
- `lantern-soft`
- `crystalline-door`

into scoped CSS effects. This keeps visual presets data-driven for the future Hub Swapper instead of hard-coding content-specific animation logic into page HTML.

All motion must honor `prefers-reduced-motion`.

The Hub follows the shared Source-repository UI conventions: 18px desktop body baseline, 17px narrow/mobile body baseline, readable UI/secondary text, scoped host-resistant typography, and no styling of unrelated Edublogs document surfaces.

## Hybrid page contract

The live page must use:

1. **HTML box:** semantic mount and useful native fallback only.
2. **CSS box:** tiny fallback styling only.
3. **JavaScript box:** tiny loader pinned to an exact immutable repository commit/release.

The repository bootstrap must remain fallback-first: preflight stylesheet, runtime, and manifest before taking visual ownership; restore the exact fallback if any required asset fails.

The JavaScript loader uses `data-layout="viewport"`. The Edublogs page template must be **Full Width** so the theme does not reserve a sidebar beside the repository experience.

## Current immutable release

The first permanent Hub release is:

```text
2026.08.10.2
```

It is stored under:

```text
releases/classroom-explorations-hub/2026.08.10.2/
```

Its `release.json` records source commit:

```text
98f58e6bacfb0c275e3ccafe9e7c3d69bf620ea7
```

The release was promoted to `main` in merge commit:

```text
42d251fff66e038d6ca383a0262e0fe87b1a032a
```

The Edublogs JavaScript integration example is pinned to that immutable commit and release. Never substitute mutable `@main` delivery.

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

Release directories are immutable. Never modify `2026.08.10.2` in place. Any future source/content change that requires a browser release gets a new release identifier.

## Cutover boundary

Repository preparation may happen before live authorization. Until `GO HUB CUTOVER`, do not edit:

- page 17;
- Edublogs widgets;
- global CSS;
- WordPress configuration/template assignment;
- existing Exploration/TWWL pages;
- Photo Album, Cloudflare, or Google Drive.

At cutover:

1. confirm page 17 still matches the known HTML-only legacy state;
2. retain the already-preserved legacy page 17 HTML as the rollback point;
3. confirm immutable release assets are reachable;
4. set page 17 to Full Width;
5. replace legacy page 17 content with the semantic Hub mount/fallback;
6. install the tiny fallback CSS and pinned immutable loader;
7. make no Hub-related widget/global-CSS changes because there are no remaining live Hub-specific dependencies there;
8. validate signed out on desktop and mobile, keyboard navigation, reduced motion, normal runtime load, and fallback behavior.

## Minimum rollback

Rollback requires only the surfaces changed by this cutover:

1. restore the preserved legacy page 17 HTML;
2. restore the previous page-template value if it was changed;
3. remove/disable the new Hub page-local hybrid integration.

No widget restoration, Exploration/TWWL permalink changes, WordPress reparenting, archive conversion, Photo Album changes, Cloudflare changes, or Drive changes are part of this Hub cutover.
