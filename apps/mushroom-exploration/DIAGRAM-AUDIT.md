# Diagram and desktop layout audit — 2026-11-06

Follow-up: [the recording-based re-audit](DIAGRAM-REAUDIT-2026-11-06.md) identifies remaining visual, teaching, animation and readability problems. The resolutions below describe changes made in the first pass; they do not constitute acceptance of the exhibit's visual quality. The exhibit remains an unpublished draft.

Current implementation: unpublished exhibit draft on feature/mushroom-exhibit-scaffold. The audit covers the visual scientific models, their photographic companions, and desktop reading order.

| Exhibit | Finding | Resolution |
| --- | --- | --- |
| Gilled-mushroom anatomy | Flat cap/stem geometry, sparse root-like lines, gills without convincing volume; preserveAspectRatio="none" could distort the specimen. | Redrawn with cap/stem shading and fibres, radial gill detail, a much finer branching network, a separate enlarged spore inset and selection highlights. Aspect ratio and hotspot coordinates agree. The actual gill macro remains beside the model. |
| Forest-floor cutaway | Sparse wire-like branches and disconnected visual context; the photo occupied a separate large row. | Redrawn soil/wood scene with branching hyphae, two connected fruiting bodies and a decaying-wood context. Surface/below/growth controls sit with the model; the real mycelium photograph is alongside it. Threads are still explicitly highlighted and growth accelerated. |
| Spore release | The wind model began after discharge and did not explain the launch mechanism. There was no real recording. | Added a three-stage Buller’s-drop model with droplet growth, coalescence and launch, directly beside real research footage. A second model view retains the wind experiment. The life cycle is an accessible step selector with every authored step available. |
| Ecological roles | Leaf/tree/bread symbols were decorative rather than explanatory. | Replaced with small process illustrations: recycling, two-way plant/fungus exchange and yeast gas helping dough rise. Photo-optional family fallbacks remain semantically correct. |
| Glowing fungi | A simple cartoon and a real photograph repeated the same point in a tall stack. | Retired the cartoon light switch. The real long-exposure photograph is now the primary visual, with its original explanation and credits. |
| Signal-to-sound model | The line was explicitly invented but its mapping could be clearer. | Added higher/lower note labels and retained the user-triggered sound conversion and uncertainty explanation. It remains invented data, with no claim to be a fungal recording or decoded language. |

## Real recording

[PLOS ONE, Video S1, Stolze-Rybczynski and colleagues (2009)](https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0004163) records a spore launch from the gilled fungus named Armillaria tabescens in the paper. The primary article grants Creative Commons Attribution reuse. The catalog links that notice without guessing a version from inconsistent mirror metadata.

The original is 256 × 128, captured at 50,000 fps and delivered by the researchers at 20 fps playback. Its 5.35-second silent clip is converted to browser-ready H.264 without interpolation, cropping or retiming. It is a microscopic single-spore view, not a whole-mushroom cloud shot. The low source resolution remains visible; no extra detail is claimed. Source URLs, original/delivery hashes, poster, description track and credits are committed with the application.

The model’s sequence was checked against [ANBG’s discharge explanation](https://www.anbg.gov.au/fungi/spore-discharge-mushrooms.html) and the primary study. Tests check that merging precedes flight. Models are qualitative and enlarged/slowed; no numerical trajectory simulation is claimed.

## Measured desktop result

At the same 1920 × 911 CSS viewport, default-state page height changed from **11,125 px to 6,461 px**, a **41.9% reduction**. All nine stable blocks remain. The biggest changes are side-by-side reading rails/workbenches, adjacent model/photo/video views, compact process controls and three parallel question columns. Content is not horizontally scrolled.

| Section | Before | After |
| --- | ---: | ---: |
| hero | 780 px | 780 px |
| family | 1,040 px | 673 px |
| anatomy | 1,291 px | 748 px |
| cutaway | 1,689 px | 820 px |
| lifecycle | 1,252 px | 902 px |
| roles | 992 px | 527 px |
| lab | 1,783 px | 798 px |
| facts | 1,485 px | 714 px |
| journal | 658 px | 347 px |

## Verification and limits

Thirteen tests pass, including source/editing refusal guards, registered video selection, phase order and committed media hashes. Ten diagram variants were parsed as SVG XML. Chrome playback reached readyState 4, advanced in time and paused when the recording left view; autoplay and looping are off. Wind direction/pause and life-cycle selection were exercised after the reflow.

Five CSS viewport checks (1920×911, 1366×768, 820×1180, 390×844, 320×640) showed ready state, nine blocks, x=0 and no horizontal overflow. Small-screen reading remains stacked. The laptop workbench fills the allocated inner width. These are CSS viewport checks in Chrome, not physical device, screen-reader, Safari or Firefox certification. Edublogs installation and immutable publication remain pending.
