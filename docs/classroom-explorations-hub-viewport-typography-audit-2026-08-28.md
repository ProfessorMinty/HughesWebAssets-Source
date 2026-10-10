# Hughes Room Views Classroom Explorations Hub
## Full-Width, Visual Hierarchy, Typography, Visibility, and Color Audit

**Date:** 2026-08-28  
**Primary reference viewport:** approximately `1920 × 911` CSS pixels  
**Video evidence:** `ea062ca6-256f-4e90-97cd-35a6ca45a062.mp4` (`1920 × 1080`, 65.875 seconds)  
**Repository review branch:** `hub-authoring-v2-2026-08-28`  
**Production page 17:** untouched  
**Review page 2589:** no WordPress write performed by this pass

## Executive verdict

The Hub's repository-owned background technically reached the viewport edges, but the important content remained constrained to an `1180px` shell. At the 1920px reference viewport, that used only 61.5% of the viewport and left roughly 370px of atmospheric gutter on each side. The result looked like a centered application box inside a full-width background rather than the full-page HRV experience required by the platform contract.

The page-local Reduced Effects control was also a contract violation. The global site shell owns the persistent HRV Reduced Effects preference and user control. The Hub must not render its own button or persist a private preference.

The review correction therefore:

- removes the Hub-local Reduced Effects control and its localStorage contract;
- keeps only narrowly scoped operating-system reduced-motion safety behavior;
- widens ordinary exhibit shells to as much as 1520px;
- widens major rooms to as much as 1720px;
- preserves deliberate narrower reading/theater widths where appropriate;
- maps body and structural heading typography to the native Amadeus baseline;
- raises small labels, metadata, card copy, and actions to practical desktop sizes;
- strengthens muted-text colors while preserving the Hub's local museum palette.

The visual direction remains strong. A later composition pass should still compress the Welcome Theater and bring Current Exploration earlier in the visitor journey.

---

# 1. Governing platform and native-theme baseline

## Full Width

The canonical HRV page contract requires the application environment to own the visible viewport beneath Edublogs navigation. Internal readable widths remain application-owned. Full Width does not mean every paragraph stretches edge to edge, but it does mean the application cannot fall back into the narrow Amadeus article column or visually read as one small website rectangle.

## Native typography

| Role | Amadeus baseline |
|---|---|
| Body family | Atkinson Hyperlegible |
| Body size | 20px |
| Heading family | Nunito Sans |
| H1 | 48px |
| H2 | 40px |
| H3 | 34px |
| H4 | 29px |
| H5 | 25px |
| H6 | 22px |

Special display faces remain permitted inside an enhanced page root. The corrected Hub therefore uses:

- **Atkinson Hyperlegible** for body copy, metadata, labels, navigation, controls, and actions;
- **Nunito Sans** for structural room headings and card titles;
- **Georgia** only as a scoped museum/story display face for the entrance title, Current subject title, and Learning Lantern feature title.

## Native colors

| Native role | Value |
|---|---:|
| Canvas | `#F8FAFA` |
| Branding surface | `#EEF5F6` |
| Structural deep teal | `#173A43` |
| Action teal | `#0F6B78` |
| Body ink | `#263238` |
| Secondary ink | `#4B5D63` |
| Meta ink | `#5F6F75` |
| Inverse text | `#FFFFFF` |

The Hub is allowed a local night-museum palette. The corrected entrance begins with native structural teal and transitions into the Hub's indigo environment so the edge between Amadeus and the repository experience feels intentional rather than accidental.

---

# 2. Video viewport findings

The supplied recording shows the real signed-in Amadeus host, Chrome UI, bookmarks bar, WordPress admin bar, and Windows taskbar. It therefore provides stronger viewport evidence than a local isolated renderer.

## Confirmed visual behavior

- Amadeus branding and navigation remain above the repository experience.
- The site shell's delayed scroll brings the Hub entrance beneath the repeated host chrome.
- The dark repository environment reaches both visible viewport edges.
- The hero exhibit itself remains centered in a substantially narrower rectangle.
- The page-local Reduced Effects button is visibly present beneath the hero.
- The Museum Map, labels, tags, card copy, and small actions appear unusually tiny at ordinary 1920px viewing distance.
- Welcome Theater occupies nearly another major-hero-sized room before Current Exploration.
- Current Exploration is visually effective when reached but appears too late in the tour.

## Technical breakout versus visual breakout

The existing `host-compat.css` already resets the Amadeus ancestors and gives the Hub root `100vw`. That part is technically correct.

The visible failure is inside the application:

```text
Old primary shell: 1180px
1920px viewport share: 61.5%
Approximate side space: 370px each side
```

The corrected review system uses:

```text
Standard exhibit shell: up to 1520px
1920px viewport share: 79.2%
Approximate side space: 200px each side

Wide room shell: up to 1720px
1920px viewport share: 89.6%
Approximate side space: 100px each side

Deliberate theater/readable shell: up to 1320px
```

This preserves readable line lengths without visually returning the museum to a middle column.

---

# 3. Text hierarchy audit

## Before correction

| Role | Previous implementation | Finding |
|---|---:|---|
| Hub body family | Inter/system | Did not use native reading baseline |
| Structural headings | Georgia | Too many levels used the same display voice |
| Hero H1 | up to ~102px | Strong and readable |
| Hero lead | up to ~23px | Readable |
| Eyebrows/meta | ~12px | Too small |
| Museum Map links | ~12px | Too small for primary wayfinding |
| Section summaries | ~16px | Below native body baseline |
| Current summary | ~17px | Borderline at distance |
| Learning points | ~16px | Too quiet for exhibit discoveries |
| Tags | ~11.5px | Too small |
| Primary actions | ~14.4px | Too small for primary controls |
| Past-card titles | ~21.6px | Below native H6/H5 neighborhood |
| Past-card summaries | ~14.4px | Too small |
| Memory actions | ~12.6px | Too small |

The title hierarchy itself was recognizable, but the supporting hierarchy collapsed into microcopy. This made the page feel visually polished from far away while becoming harder to scan once a visitor tried to read it.

## Corrected review hierarchy

| Role | Corrected target | Typeface |
|---|---:|---|
| Root/body baseline | 20px | Atkinson Hyperlegible |
| Hero display title | 64–100px | Georgia, scoped display use |
| Hero lead | ~19–23px | Atkinson Hyperlegible |
| Hero invitation | ~17–20px | Atkinson Hyperlegible |
| Eyebrows/meta/labels | 14px minimum | Atkinson Hyperlegible |
| Museum Map title | 18px | Nunito Sans |
| Museum Map links | 15px, 42px target height | Atkinson Hyperlegible |
| Major room H2 | 40–54px | Nunito Sans |
| Room/body summaries | 18–20px | Atkinson Hyperlegible |
| Current subject title | 48–76px | Georgia, scoped display use |
| Current summary | 18–20px | Atkinson Hyperlegible |
| Learning discoveries | 18px | Atkinson Hyperlegible |
| Tags | 14px minimum | Atkinson Hyperlegible |
| Primary actions | 16px, 50px target height | Atkinson Hyperlegible |
| Past-card title | 25px | Nunito Sans |
| Past-card summary | 18px | Atkinson Hyperlegible |
| Memory title | 23px | Nunito Sans |
| Memory action | 15px, 44px target height | Atkinson Hyperlegible |

This creates a clearer two-voice hierarchy: museum display titles establish atmosphere, while native HRV typography carries the actual reading and wayfinding work.

---

# 4. Text visibility and color audit

## Contrast

The current dark-museum palette generally has excellent contrast. Representative pairs from the reviewed implementation are all comfortably above ordinary WCAG text thresholds:

| Foreground | Background | Approximate contrast |
|---|---|---:|
| `#F8FBFF` | `#061128` | 18.09:1 |
| `#C8D8F5` | `#061128` | 13.05:1 |
| `#72E3C8` | `#061128` | 12.10:1 |
| `#FFE69A` | `#061128` | 15.23:1 |
| `#DCE9FF` | `#07142F` | 14.90:1 |
| `#B9C9E4` | `#07142F` | 10.90:1 |
| `#CFE0FB` | `#07142F` | 13.66:1 |

The primary visibility defect was therefore **not insufficient mathematical contrast**. It was text being too small, too dense, and too visually subordinate.

## Corrected palette roles

- Primary text becomes `#FBFDFF` on dark museum surfaces.
- Secondary body copy becomes `#D7E4F8` or brighter.
- Functional teal becomes `#7CEBD1`.
- Warm emphasis becomes `#FFE7A3`.
- Native structural teal `#173A43` is used at the entrance transition.
- Gold and teal remain accents, not body-copy substitutes.
- Important actions continue to use dark text on bright mint, preserving very high contrast.

No important text should use atmosphere-only opacity. Decorative star fields, auroras, glows, and borders may remain translucent because they are not information.

---

# 5. Reduced Effects ownership correction

The old review runtime did all of the following inside the Hub:

- rendered a `Reduced Effects` button;
- created a Hub-specific localStorage key;
- persisted a Hub-only mode;
- used the operating-system reduced-motion query to alter the whole application mode.

That conflicts with the current platform contract.

The corrected runtime:

- renders no page-local Reduced Effects control;
- contains no Hub effects localStorage key;
- contains no private Hub product-mode state;
- leaves the persistent visitor preference/control to the global shell;
- uses `prefers-reduced-motion` only as a narrow safety signal for entrance reveals, ongoing decorative motion, and pointer-following light.

Important current-system truth: the platform contract assigns Reduced Effects to the global shell, but the currently published site-shell JavaScript still contains only the guarded auto-scroll behavior. The Hub correction removes the conflicting local owner. Building and publishing the actual global control remains separate global-shell work.

---

# 6. Remaining hierarchy recommendations

These are audit findings, not part of the narrow ownership/full-width correction:

1. **Bring Current Exploration earlier.** It remains the crown jewel but still follows a very large Welcome Theater.
2. **Compress Welcome Theater.** It currently behaves like a second hero and delays Current.
3. **Give the first viewport a Current destination action.** The entrance should point visitors toward what is happening now.
4. **Reduce inter-room voids.** Preserve architectural travel, but use light and structure instead of hundreds of pixels of empty starfield.
5. **Continue testing real media.** Illustrated fallbacks should not become the ordinary visual state when authentic classroom imagery is available.

---

# 7. Implementation and safety state

## Preserved state

```text
backup/hub-v2-pre-viewport-typography-correction-2026-08-28
```

This branch preserves the exact prior review tip before the viewport/typography correction.

## Corrected review artifacts

```text
apps/classroom-explorations-hub/src/runtime-v3.js
apps/classroom-explorations-hub/src/hub-v3.css
```

## Review doorway

The page-2589 JavaScript handoff must point to review release:

```text
2026.08.28.2-review
```

and load:

```text
runtime-v3.js
hub-v3.css
```

The HTML and CSS outage-card blocks remain unchanged.

## Explicitly untouched

- WordPress page 17
- WordPress page 2589
- `/hub/` placeholder
- Global shell runtime
- Other HRV pages/applications
- Photo Album
- Cloudflare, Google, R2, D1, and Lanternworks deployment state

---

# 8. Acceptance checks for the next real-host pass

At approximately 1920×911:

- [ ] Hub environment touches both viewport edges beneath Amadeus navigation.
- [ ] Wide hero uses most of the available viewport instead of an 1180px center box.
- [ ] No page-local Reduced Effects button exists.
- [ ] No blank control row remains where the button was removed.
- [ ] Atkinson Hyperlegible is used for reading text.
- [ ] Nunito Sans is used for structural headings and card titles.
- [ ] Labels remain at least 14px.
- [ ] Primary actions remain at least 16px with approximately 44–50px targets.
- [ ] Past-card summaries are readable from ordinary monitor distance.
- [ ] Current remains visually dominant.
- [ ] No horizontal overflow appears.
- [ ] Signed-out and signed-in/admin-bar states both preserve the breakout.
- [ ] Phone and tablet layouts recompose rather than merely shrink.
- [ ] OS reduced-motion removes continuous/reveal motion without exposing or persisting a Hub-specific product mode.
