# Classroom Explorations Hub permanent architecture

## Governing boundary

The existing Edublogs page remains the permanent public route:

- WordPress page ID: `17`
- slug: `classroom-explorations`
- URL: `https://rmhughes.edublogs.org/classroom-explorations/`

Edublogs owns only the semantic mount, truthful native fallback, small fallback CSS, and immutable loader. The repository application owns Hub rendering, animation, filtering, archive routes, Hub navigation, and Hub-specific responsive behavior.

The Hub must use the Edublogs **Full Width** page template at cutover. The repository root performs the already-proven page-scoped viewport breakout. No sitewide CSS cleanup is required for this release.

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

The friendly source is not a Poppet editing requirement. It is the controlled source contract that the future Hub Swapper will edit transactionally. The browser consumes only generated strict JSON.

## Stable routes

The Hub uses app-scoped hashes so no second WordPress Hub route is required:

```text
#hrv-explorations
#hrv-explorations/archive/2025-2026
```

A future year archive uses the same pattern. Existing Exploration/TWWL page permalinks remain unchanged.

## Current-state contract

For the first 2026–2027 release:

- Current Exploration: `summer-bloom-adoption-project` (Summer Bloom Adoption Project / Zinnia)
- Current TWWL: intentional `coming-soon` record until an approved recap exists
- current-year Past Explorations: derived from records, initially empty
- current-year Past TWWL: derived from records, initially empty
- prior-year doorway: `archive-2025-2026`
- welcome video: current approved legacy Hub video, normalized to privacy-enhanced embed

The 2025–2026 archive preserves three records verified as Explorations and five records verified as weekly learning/TWWL. `botany-lets-talk-about-tubers` is explicitly marked incomplete; the runtime must not fill missing classroom content.

## Navigation/helper replacement

The legacy Footer Left Exploration Helper is not an authority because it discovers membership by scraping links visible on the Hub. After archive cutover that model becomes incomplete by construction.

The replacement helper must read the same generated Hub manifest (or a deterministic navigation projection generated from it) and derive:

- valid Exploration/TWWL membership;
- school-year grouping;
- previous/next ordering;
- return-to-Hub/archive destinations.

Do not restore the multi-generation fairy CSS stack or permanent hide state with no obvious restore control. The old helper remains untouched until the live cutover is explicitly authorized.

## Build and release

```powershell
npm install
npm run check:hub
npm run build:hub
$env:HRV_SOURCE_COMMIT = (git rev-parse HEAD)
npm run stage:hub-release -- 2026.08.10.1
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

At cutover, preserve the complete legacy page 17 HTML plus the Hub-relevant Footer Left helper and any Hub-specific global CSS fragments before changing ownership. Apply Full Width, install the three page-local boxes, validate signed out at desktop/tablet/phone/reduced-motion/keyboard, then retire only legacy Hub-specific ownership superseded by the repository runtime.

## Minimum rollback

A morning-safe rollback requires only:

1. the exact pre-cutover page 17 content;
2. the pre-cutover page template value;
3. the pre-cutover Hub-relevant Footer Left helper source;
4. any Hub-specific Center/global CSS fragment actually removed during cutover.

Rollback restores those preserved values and removes/disables the three new Hub boxes. No Exploration/TWWL permalink changes, WordPress reparenting, or repository rollback is required to restore the old Hub.
