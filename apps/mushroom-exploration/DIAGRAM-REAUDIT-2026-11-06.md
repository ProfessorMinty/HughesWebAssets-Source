# Mushroom exhibit: recording-based re-audit

Date: 2026-11-06. Verdict: **the visual exhibit needs another design pass before acceptance.** The previous audit overstated completion of the role illustrations and treated working code, valid SVG and absence of overflow as stronger evidence of readiness than they are.

This is an audit, not an implementation update. No exhibit source, media, journal data, Edublogs configuration or production release was changed during this pass.

## Evidence and scope

- Reviewed the supplied `2026-11-06_09-52-00.mp4`: 111.15 seconds, 1920×912, silent audio track. Sampled the full recording and examined the anatomy, cutaway, launch, wind, roles, sound and question views. Timestamps below are approximate navigation points.
- Inspected `src/art.js`, `src/labs.js`, `src/runtime.js`, `src/exhibit.css` and the authored source JSON, including hidden and fallback visuals.
- Rechecked the existing build in Chrome at **1920×911 CSS pixels** and **390×844 CSS pixels**. Exercised all five anatomy selections and the hidden wind view.
- Audited implementation baseline: remote draft head `a666fea72ab85490e755fa93630919d15fb51ad6`; matching source tree `2c1aa59faf808a39b2539878706ca37a713f5086`. Local equivalent commit is `9a63e51`.
- There are **nine mounted SVG instances**, including the hidden wind model and navigation mark, plus **three authored family fallback variants** that do not render while their photographs are present. All twelve are accounted for below. The hero is raster artwork; the six specimen photographs are raster assets.

## Every SVG accounted for

| Visual | Current finding | Disposition for the next build |
| --- | --- | --- |
| Navigation mushroom mark | A simple 38 px interface emblem. It is decorative and does not carry the science lesson. | Keep simple. |
| Anatomy specimen | Shading and extra strokes improved the first draft, but the cap remains very regular, gills resemble a spoke pattern, and the network fans down from the stem like roots. | Redesign the specimen and underground relationship; keep the five editable observation IDs and working selections. |
| Forest-floor cutaway | Two regular mushrooms over two downward branching trees. The log provides context, but the dominant shape still suggests roots growing out of mushrooms. | Build a connected, irregular fungal network through substrate, with fruiting bodies arising from it. Distinguish wood, soil, hyphae and fruiting body clearly. |
| Tiny-drop catapult | An oval, water circles and an isolated piece of tissue explain the broad sequence, but the connection to the mushroom's gill is absent. Labels also shrink inside a letterboxed SVG. | Add a mushroom → gill → spore magnification sequence, a clear attachment point and visible droplet coalescence. Keep the scientific mechanism and model label. |
| Wind mushroom — hidden tab | Still a small umbrella shape with straight radial strokes, a long rectangular stem and particles. It was missed as a separate visual in the first pass. | Replace the specimen treatment; show the path from between the gills to below the cap and then into moving air. |
| Recycler — leaf variant | A leaf, a few pale threads, an arrow and dots. It is still a pictogram, with the important fungal action barely visible. | Show a recognizable decaying leaf/wood specimen, fungal growth and a small explained breakdown sequence. |
| Plant partner — tree variant | Triangle tree, stick roots and a separate branching symbol. Arrows carry the explanation while the actual root/fungus relationship is absent. | Show a root detail with fungal hyphae at the root; animate or step through the two exchange directions and label them plainly. |
| Tiny baker — bread variant | Oval cells, bubbles and a loaf-like shape. It omits a visible before/after change in dough. | Use a yeast magnification plus a dough cross-section that visibly expands as gas pockets grow. |
| Signal-to-sound graph | A simple line graph is appropriate here, and the invented-data disclosure is honest. Its labels are tiny, the measurement setup is missing, and cursor/audio timing differs. | Retain a clear graph; add a simple measurement-to-note explanation and synchronize the visible playhead to the notes. Never relabel the invented pattern as fungal data. |
| Mushroom family fallback | Basic cap/stem pictogram, currently bypassed by its real photograph. | Upgrade or retire the fallback so removing a photo cannot quietly restore the old visual quality. |
| Mould family fallback | Five stems with circular spore cases; currently bypassed by its real photograph. | Same fallback decision; preserve a truthful alternative description. |
| Yeast family fallback | Three ellipses; currently bypassed by its real micrograph. | Same fallback decision; budding should remain intelligible if a visual fallback is retained. |

## Open findings

### 1. The three role illustrations were not finished

Reference: roughly **00:46–00:54**. `specimenArtwork('leaf'|'tree'|'bread')` still supplies all three displayed visuals. Calling these “process illustrations” in the previous audit did not establish that they meet the requested museum standard. They need observable processes and recognizable subject material, rather than another detail pass on the existing icons.

Their essential fine lines also have poor contrast in the authored light palette. Against the verified roles background `#e6eadc`, the leaf/fungus threads `#bfd0a3` measure about **1.34:1**, the partner threads `#bed0a1` about **1.35:1**, and the leaf process arrow `#c4b17e` about **1.73:1**. Meaningful graphical features should reach 3:1 against adjacent colors under [WCAG non-text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html). The role text itself measures about 4.62:1; the finding is not that everything in these diagrams fails contrast.

### 2. Mycelium is visually being taught as a root system

Reference: roughly **00:02–00:21**. Both large diagrams reuse `organicThreads()`, whose branches mainly travel downward from a stem-centered origin. More branches and a glow effect do not resolve that conceptual resemblance. It is especially unhelpful when the later quiz asks children to distinguish fungal threads from plant roots.

The [ANBG explanation](https://www.anbg.gov.au/fungi/mycelium.html) describes outward hyphal growth, branching and cross-connections, with mycelium in soil or wood. The next visual should communicate that network and its connection to fruiting bodies. The present drawing is a simplified model, not evidence that the text is false, but the visual implication needs correction.

### 3. The thread-growth animation does not follow connected growth

Reference: cutaway interaction around **00:14–00:21**. In `runtime.js`, path delays are assigned by flat list index (`i < 4` or `700 + (i % 4) * 200`), independent of branch depth or parent completion. A child path can begin before its parent has grown to the junction. The final dense drawing hides this during static review.

Next build: draw growth from connected tips, then branch behind those tips; use a replayable sequence with inspectable stages. This is a teaching behavior finding established from the implementation, not a claim that the recording measures biological growth speed.

### 4. “Fits the screen” concealed unreadable diagrams

The desktop still uses the whole breakout width, with a 1905 px root after scrollbar allowance, nine sections and no horizontal overflow. Its height is about **6461 px**. That is useful layout evidence, but not a readability verdict.

The following approximate text sizes account for SVG viewBox scaling and the default proportional fit. They are derived from measured SVG boxes, not merely the authored `font-size`.

| Teaching text | At 1920×911 | At 390×844 |
| --- | ---: | ---: |
| Anatomy embedded labels | 15.3 px | 5.6 px |
| Cutaway embedded labels | 14.6 px | 5.2 px |
| Catapult labels | 10.5–12.1 px | 6.5–7.5 px |
| Role-diagram labels | 14 px | 3.7 px |
| Graph higher/lower labels | 9.3 px | 5.5 px |
| HTML model disclosure | 9 px | 7–9 px, depending on panel |
| Quiz answers | 12 px | 13 px |

On the phone, each role diagram is only **90×50 px**. The three diagrams are treated like thumbnail icons even though they contain an entire lesson. This needs responsive composition, not proportional shrinking. Move critical labels to normal HTML and stack meaningful diagrams at usable widths. Set an explicit design target for child-facing copy and controls, then inspect it at actual size; 16–18 px labels are a proposed design target, not a WCAG font-size requirement.

The small anatomy model note also uses `#6d8069` on an approximately `#eceee1` background: about 3.62:1, below the 4.5:1 threshold for ordinary small text in [WCAG text contrast guidance](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html).

### 5. The launch station needs a visual bridge across scales

Reference: roughly **00:22–00:43**. The model starts with tissue and a single enlarged spore. Children have to infer where this sits on a mushroom. The wind tab then jumps back to a whole mushroom without a linking view. Add an explicit magnification journey and keep the selected physical part consistent across it.

The [ANBG discharge diagrams](https://www.anbg.gov.au/fungi/spore-discharge-mushrooms.html) show why the gill airspace, tiny attachment stalk, water film and growing drop matter. The next design can simplify terminology while keeping those relationships visible. The drawn drop should meet the water film at the narrated joining stage; do not validate only the numeric phase order.

### 6. The real video meets only part of the media brief

The installed recording is genuine microscopic **single-spore discharge**, from the [2009 PLOS study](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0004163). It is 256×128 and 5.35 seconds, displayed up to 520 px wide. Its grain and very brief event are evident around **00:26–00:35**. It should remain useful supporting evidence, with an obvious “watch this spot” cue, a clear replay and an explanation of what is magnified.

It does **not** supply an easily recognized whole-mushroom spore plume. That is an open media need from the earlier request. A suitable additional recording needs verified subject identity and reuse rights; no replacement has been acquired in this audit. Upscaling this clip cannot supply missing detail.

### 7. The life cycle has no visual progression

Reference: roughly **00:41–00:49**. All four step media fields are `null`; selecting a step changes its heading and paragraph. The previous conversion saved vertical space, but left a text selector rather than a visual life-cycle exhibit. Use one illustrated stage/workbench that changes with the four controls, and retain the existing qualification about compatible threads and suitable conditions.

### 8. The sound exhibit needs a complete teaching sequence

Reference: roughly **00:55–01:18**. Keeping the graph simple is sensible. However, the child sees a wavy line and hears notes without a visual of what is measured or how a person chooses the mapping. The invented-data disclosure is essential and must remain legible. The [electrical-signaling review](https://academic.oup.com/femsre/article/doi/10.1093/femsre/fuaf009/8090185) also supports keeping scientific uncertainty explicit.

Implementation finding: note `i` samples `i * 590 / 15` but begins at audio time `0.08 + i * 0.48` seconds; the visual playhead takes eight seconds to cross the graph. The last note samples x=590 while the visual playhead is near x=537. Derive both from one shared timeline so children can match the line position to the note they hear.

### 9. The reference and current Chrome palette differ

The recording presents pale sections with a much darker olive treatment. This audit's Chrome preview reports the roles background as `rgb(230, 234, 220)` and visibly shows a pale green section. The cause is **unconfirmed**; the recording alone cannot identify a browser, preview or display setting. Do not silently rewrite the palette or photographic colors on the assumption that the cause is known. Check the intended delivery surface during acceptance.

## What can be retained

The full-width breakout structure, stable block and observation identities, real photograph catalog, uncropped inspection dialogs, honest long-exposure caption, reserved empty classroom journal and registered research-video provenance remain useful foundations. All six photographs loaded in this pass. All five anatomy buttons selected the matching detail text. Those results support retaining the structure, not accepting every visual.

## Order for the next implementation

1. Establish one specimen/diagram art direction with a finished role panel and the gill-to-spore magnification sequence. Check these at actual desktop and phone sizes before extending the treatment.
2. Replace all three role pictograms and the wind specimen. Resolve embedded labels, contrast and responsive diagram composition at the same time.
3. Redesign the anatomy/cutaway network and its connected-growth animation; retain the authored IDs and science qualifications.
4. Add a visual life-cycle progression; improve the research-footage presentation and resolve the additional plume-video search.
5. Complete the measurement-to-note explanation and shared audio/playhead timeline; upgrade or retire the three dormant family fallbacks.
6. Review the complete exhibit again in the 1920×911 delivery context and on a phone. Acceptance must include legibility, meaningful process changes, truthful visual relationships and art direction. Page height, build success and zero overflow remain supporting checks.

No new child, teacher or accessibility-user study was conducted. This is a recording, source and Chrome inspection, not certification across browsers, assistive technologies or physical devices. The journal authoring module, Hub Swapper and production installation remain outside this audit.
