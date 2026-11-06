# Current checks — palette and hierarchy, 2026-11-06

- `npm run check:mushrooms` passes all 16 tests, syntax checks, contract/media-integrity
  checks and the standalone build. No source data, scientific diagrams or asset bytes changed.
- Chrome checked the seven main tabs at 1920×911, 1366×768, 820×1180, 390×844 and
  320×640: 35 combinations with the requested panel visible, state ready, root x=0,
  zero horizontal overflow, nine stable content blocks and mint selected tabs in both stations.
  Viewport measurements wait for the breakout width to settle after the resize observer runs.
- At 1920×911, all three specimen titles align at the same y position. Names now lead
  each card, followed by image, explanation, caption and credit. Contained images use dark
  displays and retain `object-fit: contain`; no microscopy is cropped to fill a landscape box.
- Default page height: about 2564 px; journal begins around 2230 px. Station one default
  is about 835 px; Light & sound is about 811 px. The two-station structure is preserved.
- Measured CSS color pairs: ink/paper 11.25:1, ink/mint 9.47:1, ink/amber 7.62:1,
  dark focus/paper 6.61:1, luminous focus/forest 9.09:1. Actual keyboard focus was observed
  on light and dark tabpanels. These checks do not constitute a whole-site accessibility audit.
- Chapter links display the current section with `aria-current="location"`, a visible
  underline and stronger label. Desktop chapter tracking and a 320 px journal jump worked;
  the journal heading landed below the sticky bar. Destroy cleanup disconnects its observer
  and cancels a scheduled chapter update.
- The yeast inspection dialog loaded its full image at 320 px and stayed within the
  305 px available width (approximately x=2.5 to x=302.5). Returning to the exhibit worked.
- Sound play/stop worked. The recording's primary Play control becomes an outlined Pause
  control while playing, then returns to its primary role. Spore investigation selections
  use the same mint fill plus inset marker as the main tabs.

The page remains an unpublished draft. Physical-device, screen-reader and other-browser
validation, classroom uploads, Mushinator, immutable release and live installation remain
outside this change.

## Previous two-station checks — retained history

This edition supersedes the earlier flat/reading-rail measurements below. All nine source
blocks remain, rendered in two learning stations and the classroom story.

- Sixteen local tests cover source/edit/refusal rules, registered media integrity, launch
  phase order, parent-before-child network growth and rendered stem-base attachments. Syntax and generated
  source/control/schema checks pass through `npm run check:mushrooms`.
- Chrome UI checks exercised every main tab at 1920×911, 1366×768, 820×1180,
  390×844 and 320×640: **35 combinations**, all ready, x=0, no horizontal overflow.
  All scientific SVGs have zero text elements; their labels are HTML.
- At 1920×911, station-one defaults: family about 830 px, anatomy 834 px, cutaway 799 px,
  roles 808 px. Station-two defaults: spores 788 px, light/sound 808 px, questions 830 px.
  The 77 px sticky navigation and each selected station fit within the 911 px reference
  viewport. Expanded explanations, credits and answer feedback can grow a station.
- Default page height is about 2560 px. Classroom-story position: approximately 2220 px from page top. The prior
  reading-rail edition placed it around 6038 px down. An entrance button and sticky
  navigation link bypass both learning stations. The jump brought the entire reserved
  classroom story into view during a 1363×936 standalone-browser check.
- Keyboard End selected the last station-one tab; one tab remained in the Tab order and
  selection/tabpanel visibility matched. A direct `#mushrooms-anatomy` load revealed
  the hidden panel. Sources and nested record identities remain attached.
- Root/fungus sugar flow, pause, dough rise/pause, all selected anatomy details, connected
  network replay/pause, leftward wind/release/pause, and all four illustrated life stages
  were exercised. Selecting a life stage changed its graphic state and explanation.
- Real puffball playback loaded at 1068×600, readyState 4, duration 8.9 seconds; currentTime
  advanced to 1.0022 seconds and paused on changing the view. Autoplay and looping are off.
  The lower-resolution microscopic clip remains separately identified.
- The invented sound model started on request and stopped on changing tabs. Audio notes
  and cursor use the same AudioContext clock and eight-second mapping. Its invented-data
  disclosure remains visible. Extended ion/mapping explanation is under the disclosure.
- The uncropped photo dialog opened with a loaded original-aspect image, closed back to
  the exhibit, and a discovery answer showed its authored feedback. Photos remain real
  specimen examples, not classroom observations.

The stem-connection follow-up rechecked the 35 tab/viewport combinations above. All three
numbered chapter panels remain visible down to 320 px; the lower chapter strip is absent.
The three top links were exercised at both 1920×911 and 320×640, landing their headings
below the sticky navigation. The removed strip also leaves no reserved blank image band.

The new rendered-SVG regression failed against the previous detached drawing, then passed
with both stem anchors attached. Cutaway paths start at (346.48,229.98) and (680.64,229.64);
anatomy starts at (438,463). Specimen positions/scales also define their corresponding
anchors. The life cycle connects the early mycelium to the visible germ tube, then connects
the fruiting stem to that network. The stage-two germ tube remained visible in Chrome.

During a paused growth replay, both base strands were complete while 254 later paths
remained undrawn. Resuming kept both base strands complete. All paths share one document
animation start time; finished strands are not rewound by pause/resume. Anatomy, cutaway
and life-cycle SVGs parse successfully. Current measurements are approximate CSS pixels.

These are Chrome CSS-viewport/interaction checks, not physical-device, assistive-technology
or cross-browser certification. The journal still has no invented entries, stage or species.
The Mushinator editor, classroom uploads, immutable release and live Edublogs installation
remain outside this implementation.

## Earlier observations — retained history

# Observed draft checks — 2026-11-06

`npm run check:mushrooms` passed: syntax checks, thirteen source/edit/publication-guard tests,
generated schema/control consistency and the standalone build. No dependency install is
needed for this isolated application. Standalone preview size: 1,908,262 bytes, including the entrance illustration, six real
photographs, the research clip/poster/description, source data, models, styles and JavaScript.

## Full viewport breakout

Checked in Chrome using the internal screen-size harness. These are CSS viewport checks,
not claims about physical devices. Each viewport showed state `ready` and nine stable blocks.
The root started at x=0; its width equalled available client width, excluding the scrollbar.

| CSS viewport | Root width | Horizontal page overflow |
| --- | ---: | ---: |
| 1920 × 911 | 1905 px | 0 px |
| 1366 × 768 | 1351 px | 0 px |
| 820 × 1180 | 805 px | 0 px |
| 390 × 844 | 375 px | 0 px |
| 320 × 640 | 305 px | 0 px |

An additional descendant-bounds check at 320 px found no exhibit element outside the
available document width. The standalone page was also inspected outside the harness:
edge-to-edge root, no review toolbar by default, no horizontal overflow.

## Interactive observations

- Selecting Gills changed the observation text/pressed state and faded the cap to reveal
  the gill model. All five observation controls are keyboard-operable buttons.
- Grow the threads switched to Below the surface and ran the finite SVG branch drawing.
- Release spores created 36 model particles. Their positions advanced from the gills;
  Pause model stopped the run. Moving the slider to its left endpoint changed the output
  to “Breeze to the left · 100%”.
- The earlier cartoon light switch was exercised in the first scaffold; it has now been
  retired in favour of the real glowing-fungus photograph.
- Play model sound showed its playing state; Stop sound restored the off state. Scrolling
  to a discovery answer while the sound was playing also restored the off state. This
  checks application control state and cleanup, not a calibrated audio measurement.
- Both choices in the safety question produced appropriate explanatory feedback.
- Application-filtered warning/error logs were empty during inspection. Browser-extension
  metadata errors were present under a chrome-extension URL and are separate from this app.

The draft has not been installed in live Edublogs or tested against the exact live DOM,
on Safari/Firefox, or with a screen reader. The preview uses an Amadeus-like ancestor
simulation. Publication, actual classroom content and the Mushinator editor remain later work.

## Real photograph edition — 2026-11-06

Ten local tests now pass, including registered-asset URL refusal, editable photo captions,
provenance catalog consistency, WebP signatures and delivery SHA-256 checks. The build
independently verifies the byte count and SHA-256 of every embedded photograph.

The same five CSS viewport checks above passed again with nine sections and zero horizontal
overflow. At 320 px, the open photo dialog stayed inside the available 305 px width
(left 4 px, right 302 px). Escape closed it; a subsequent descendant-bounds check found
no exhibit element outside the viewport.

All six photo buttons opened their inspection dialogs and returned to the exhibit. Chrome
reported complete image loads with natural sizes 1600×1084, 720×540, 1560×1560, 1200×1600,
1600×1200 and 1200×800 respectively. The gallery uses real photos in place of the first
three specimen icons, with additional gill, mycelium and glowing-fungus views. The full
viewer retains original aspect ratios; microscopy is labelled. Photo creators and licence
links remain available on each figure and in its dialog. Application-filtered warning/error
logs were empty during this pass.

Current self-contained photo-preview size: 1,780,675 bytes. It embeds all six image files.
The initial scaffold used eight tests and a 466,003-byte preview; its source remains in Git
history. This photo edition is the current draft. Live Edublogs remains untested/unchanged.

## Diagram and width audit — current edition

See DIAGRAM-AUDIT.md for findings, resolutions and the before/after section measurements.
The current default desktop height is 6461 px, versus 11125 px before the audit.
The current thirteen-test suite supersedes the earlier eight- and ten-test counts.
The spore station has two model views and a real 5.35-second research clip. Its native
metadata loaded without error; playback started and advanced, then paused on leaving view.
At the smallest viewport, the retained wind controls and new life-cycle step selector
worked. The final five-size breakout check again showed no horizontal overflow.
