# Classroom Explorations Hub permanent architecture

## Governing boundary

The existing Edublogs page remains the permanent public Hub route:

- WordPress page ID: `17`
- slug: `classroom-explorations`
- URL: `https://rmhughes.edublogs.org/classroom-explorations/`

Edublogs owns only the stable route, semantic mount, truthful native fallback, small fallback CSS, Full Width page setting, and tiny page-local JavaScript loader. The repository application owns Hub rendering, scoped presentation CSS, animation and motion systems, responsive composition, host compatibility after successful enhancement, structured Hub data, validation, build products, and immutable releases.

The Hub must use the Edublogs **Full Width** page template. Do not move Hub application ownership back into page HTML, the CSS Enhancement tab, global widgets, or theme hacks.

## Proven Edublogs publication seam

The mature production precedent is the same separation used by the Black Hole Museum V2:

1. **HTML tab:** semantic mount + complete readable fallback only.
2. **CSS tab:** fallback readability only.
3. **JavaScript tab:** small page-local loader pinned to one immutable repository release.
4. **Repository release:** all enhanced presentation, runtime behavior, animation, content, and compatibility assets.

Repository launch scripts do **not** belong in the Edublogs HTML surface. The HTML box must contain no `<script>` and no application `<style>` block. The CSS tab must not contain museum animation or feature presentation. The JavaScript tab may contain integration/loader code, but not the museum application itself.

The page-local loader follows the Black Hole V2 safety order:

```text
semantic mount
  -> validate page / page-system / schema / route
  -> fetch pinned release manifest
  -> validate exact release + route contract
  -> fetch and validate content + import renderer module
  -> only then inject repository presentation CSS
  -> inject ready-gated host compatibility CSS
  -> mount museum
  -> add route-ready class
  -> run integration + motion diagnostics
```

If enhancement fails at any point, injected repository styles are removed and the exact native fallback is restored.

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

For the first 2026–2027 permanent Hub state:

- welcome video: approved Hub welcome video, normalized to the privacy-enhanced YouTube embed;
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

## Widget-loss migration and navigation ownership

The old floating Exploration Helper is **retired historical architecture**. It previously downloaded the Hub and scraped visible links to infer Exploration/TWWL membership. The permanent architecture does not preserve or replace that behavior.

However, deleted widgets also supplied some legitimate site-shell behavior that the Hub depended on. Those responsibilities must be migrated rather than forgotten:

- duplicate WordPress page-title suppression and Amadeus full-width shell compatibility are repository-owned in `host-compat.css` and activate only after successful Hub enhancement;
- the useful automatic scroll below the oversized theme header is owned by the small page-local loader and runs only after successful mount, with anchor/admin/user-scroll/reduced-motion safeguards;
- the retired Hub-scraping Exploration Helper, fake shared celebration count, helper localStorage state, and unrelated Footer Right behavior must **not** return.

Permanent rule:

> Hub data defines the hierarchy. Child pages participate in that hierarchy. The Hub does not scrape children, and global widgets do not scrape the Hub.

Future Exploration/TWWL child pages will own their own appropriate Back/Up and sibling-navigation components when those page families are modernized.

## Visual and animation ownership

The restored August 4 museum is the visual-authority baseline, not a suggestion to flatten the page into generic cards. Repository-owned presentation preserves and may improve the museum's atmosphere, compass identity, sky/aurora/stars/clouds, floating exploration objects, Welcome Theater, Zinnia Featured Exhibit Hall, Learning Lantern, crystalline transitions, archive wings, and museum footer.

The full-page implementation may be more ambitious than the old narrow WordPress layout, but it must remain recognizably the same museum identity and preserve clear exhibit hierarchy.

The renderer places each record's stable `theme`, `animation`, `status`, and record ID onto rendered components. Visual presets remain repository-owned so the future Hub Swapper changes content without becoming responsible for presentation mechanics.

All motion must honor `prefers-reduced-motion`. Long-running ambient motion must ultimately provide a usable museum motion control. Scroll progression belongs in repository runtime behavior, not in Edublogs HTML/CSS.

## Integration diagnostics

The Edublogs JavaScript loader publishes a runtime diagnostic report at:

```text
window.__HRV_CLASSROOM_EXPLORATIONS_DIAGNOSTICS__
```

The report includes immutable release/source identity, viewport and horizontal-overflow measurements, mount ancestry, reduced-motion state, and computed animation information for key museum elements. Use this before guessing about live integration or motion failures.

## Current immutable museum release

The current enhanced museum release is:

```text
2026.08.10.6
```

It is stored under:

```text
releases/classroom-explorations-hub/2026.08.10.6/
```

The immutable release commit is:

```text
f440b1fcff21f59a19fbd4375f526190863108f5
```

Its `release.json` records source commit:

```text
cc82ce85bf82eedbd76a95735ff67f880dcc4f4e
```

The release was promoted to `main` in merge commit:

```text
0b7c5189460e40e719c1545b658e22ddc772cebc
```

Release `2026.08.10.5` remains the repository rollback target recorded by `.6`.

The current Edublogs page-local loader is version `page-local-0.3.0` and is pinned to the immutable `.6` release manifest. Never substitute mutable `@main` delivery.

## Build and release

```powershell
npm install
npm run check:hub
npm run build:hub
$env:HRV_SOURCE_COMMIT = (git rev-parse HEAD)
npm run stage:hub-release -- <release> <rollback-release>
```

A staged release contains at minimum:

```text
releases/classroom-explorations-hub/<release>/
  bootstrap.js
  host-compat.css
  hub.manifest.json
  assets/classroom-explorations-hub.js
  assets/classroom-explorations-hub.css
  release.json
```

The historical `bootstrap.js` remains a repository release asset for compatibility/rollback, but the permanent Edublogs production seam launches through the page-local JavaScript tab loader, not an HTML `<script>` tag.

Release directories are immutable. Never modify an existing release in place.

## Cutover / integration update boundary

Repository preparation may happen without changing the live Edublogs page. Live page changes remain deliberate and reversible.

For a Hub integration update:

1. preserve the current Edublogs page revision as rollback;
2. confirm the target immutable release manifest/assets are publicly reachable;
3. keep page 17 on Full Width;
4. install the semantic fallback in the HTML tab;
5. install fallback-only styling in the CSS tab;
6. install the pinned page-local loader in the JavaScript tab;
7. verify the saved HTML contains no launch script;
8. validate signed out on desktop and mobile, keyboard navigation, normal motion, reduced motion, video, Zinnia CTA, current-year empty galleries, archive doorway, console, network, and the integration diagnostic report;
9. test failure behavior separately and confirm the complete native fallback survives.

## Minimum rollback

Rollback requires only the surfaces changed by the Hub integration:

1. restore the previous page 17 revision / prior HTML, CSS, and JavaScript tab contents;
2. restore the previous page-template value only if it changed;
3. leave immutable repository releases untouched.

No widget restoration, Exploration/TWWL permalink changes, WordPress reparenting, archive conversion, Photo Album changes, Cloudflare changes, or Drive changes are part of this integration seam.
