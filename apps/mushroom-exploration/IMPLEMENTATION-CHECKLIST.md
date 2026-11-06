# Mushroom exhibit — implementation checklist

Version 1.0 · November 6, 2026 · Planning reference; implementation pending.

This is the current checklist for the classroom-content and interaction improvements.
It consolidates Arctic's instructions, `Fungi-Website-Developer-Audit.md`, the exact
`2026-11-06_15-44-35.mp4` recording, and the current repository source. Creating this
document does not complete any of the fixes below. All 46 implementation items start open.

## Baseline and evidence

- Repository: `ProfessorMinty/HughesWebAssets-Source`.
- Work branch: `feature/mushroom-exhibit-scaffold`, draft PR #24.
- Application baseline before this checklist: local commit `1851ea6`, remote commit
  `f5e31d1e7c56095c9940b7e8c427a2addcea921a`; identical tree
  `a2033b9642dbb65dd92d9bcc61d2b690ac932192`.
- Recording: 129.544 seconds, 1920 × 912 recorded pixels. Recorded pixels do not establish
  the browser's CSS viewport. The audio track was silent throughout at a −60 dB threshold.
- Review covered the full timeline with two-second samples, full-resolution detail frames,
  and closer samples of network growth, dough rise, spore launch and life stages.
- Source identity, `Fungi-Website-Developer-Audit.md` SHA-256: `cdb77bf286fac4f948638c4ec24cc54a98d2480865f95dac4727e9712bea519c`.
- Source identity, `2026-11-06_15-44-35.mp4` SHA-256: `90d023ca15d9d77329ad241fd53c9bd533001fb0512973b300ad6beb98b9d015`.
- Light & sound and Try it yourself were not opened in the recording. Their implementation
  was separately inspected in source. Recording observations do not certify those activities,
  music playback, keyboard support, touch, zoom or CSS contrast.
- Current default desktop baseline: about 2564 px page height; classroom story about
  2230 px from the top. These are comparison measurements, not fixed-height constraints.
- Existing behavior and verification are recorded in `QA.md`. Historical audit documents
  remain history; this checklist defines the current follow-up scope.

## Fixed requirements

These reflect Arctic's current instructions. Later instructions take precedence; record the
dated change in this reference so the working agreement remains explicit.

1. Preserve the immersive museum experience for second and third graders, with teacher support.
2. Use viewport breakout only. Design hierarchy at 1920 × 911 CSS px and recompose responsively.
3. Preserve entrance → two compact learning stations → classroom growing story. Use the width
   before adding height. Additional activity views belong inside the stations. Zoomed text and
   small screens may require more height; never clip a lesson to force a viewport-sized panel.
4. Preserve the three destination colors and their navigation families:

   | Role | Destination | Base surface |
   | --- | --- | --- |
   | Primary | Fungi up close | Forest teal `#06443f` |
   | Secondary | Life in motion | Warm bark `#46311f` |
   | Tertiary | Our growing story | Moss green `#465a2b` |

   Amber actions, cyan state cues and warm text connect the rows. Maintain variation between
   rows; do not flatten the page into one color or return to broad white/cream surfaces.
5. Keep the existing repository-backed architecture and stable Edublogs injection. Work on the
   page source, renderers, validated content and registered assets. This is not a WordPress
   integration project. Do not change the live Hub/route manifest or injection in these batches.
6. Preserve page/block/nested record identities and existing deep links. Add compatible fields
   or view aliases where necessary. Visible spelling changes do not rename identifiers.
7. Preserve scientific scope: distinguish models, real specimen examples, actual measurements
   and future classroom observations. Retain the hero's imaginative-art disclosure, model
   scale/time caveats, citations and media attribution. Do not recolor specimen photographs.
8. Instructional movement starts intentionally, has appropriate pause/step/replay support, and
   ends in an informative state. Do not adopt blanket autoplay, looping, bouncing hotspots or
   removal of Pause. Reading and essential explanations are not timed or auto-advanced.
9. Keep the empty journal honest. Do not invent a kit, species, dates, growth stage, photographs,
   observations, student writing, measurements or outcomes.
10. Keep implementation instructions, completion evidence and repository details in development
    documentation. Public scientific labels remain where children need them to interpret an exhibit.

## Working behavior to preserve

These are baseline protections, not unfinished features to rebuild automatically:

- All three kingdom photographs enlarge prominently; a visible return control already exists
  (00:08–00:16). Preserve the full-image inspection behavior and attribution.
- Five anatomy markers exist, including **05**. The previously quoted comma splice in the
  above-surface explanation is already corrected.
- Cutaway growth visibly connects to both stem bases and finishes in a completed still
  (00:41–00:44). Preserve shared specimen anchors, connected parent-first branch scheduling,
  and the existing pause/resume behavior; do not rewind completed strands on resume.
- The wind slider already affects moving spores (01:40–01:46). Preserve settling and drift
  behavior rather than replacing the working interaction unnecessarily.
- Dough expands and holds its risen state (01:23–01:30). Preserve the finite ending and
  sped-up disclosure; do not introduce a repeated shrink/rise loop.
- The droplet model already progresses through growing, joining and release (01:34–01:38).
- Puffball playback is visibly demonstrated (01:49–01:58). Its local explanation already
  distinguishes puffballs from gilled mushrooms. The microscope player is displayed but its
  playback is not demonstrated in this recording.
- The current sound model uses an explicitly synthetic trace; graph and note generation use
  the same function and audio clock. Preserve synchronization and inactive-media cleanup.
- Existing keyboard tabs, semantic controls, focus styling, dialog behavior, deep-link reveal,
  current-chapter indicators and registered-media checks are foundations to extend and verify.

## Execution order

| Batch | Work | Expected review result |
| --- | --- | --- |
| 0 | Record baseline; begin M42–M43 content/asset work; inventory the live music activity for M27. Start sourcing M33 early. | Preserved behavior identified; content ownership and real-demo dependencies understood. |
| 1 | M01–M15 and M24, with relevant M42 contract changes. | Clearer copy, correct activity context, matched supporting media and a compact navigation prototype. |
| 2 | Remaining M16–M26. | Processes are visibly explained while working animation behavior is retained. |
| 3 | M27–M35, finishing the M33 asset dependency. | Accurate, understandable glow and mushroom-music activities with a real example and controllable teaching model. |
| 4 | Complete M36–M46 and final evidence. | Access, layout, media, authoring and classroom checks documented. |

Apply access, motion and authoring requirements throughout every batch. The final batch is
verification and remaining polish, not the first time those requirements are considered.
Preserve reviewable progress between batches without requiring new approval for routine fixes
already within the requested scope.

## A. Entry, copy and interpretation

- [ ] **M01 — Make the entrance match classroom-project readiness.**
  Make Explore fungi the primary action while the journal has no real published content.
  Keep a secondary Our class project — coming soon destination and the direct chapter link.
  Reduce repeated placeholder shortcuts in station headers. Done when the first action opens
  a usable exhibit and journal availability is represented honestly.

- [ ] **M02 — Edit the core explanations for this audience.**
  Lead with plain meaning, usually two or three short sentences and one unfamiliar term at a
  time. Retain necessary some/many qualifiers and explain the difference between a mushroom
  and the wider fungus. Done when every core explanation has an age-appropriate main layer
  and optional technical detail without losing the scientific meaning.

- [ ] **M03 — Add usable science-word help.**
  Supply short definitions and checked pronunciation for relevant words such as mycelium,
  hypha/hyphae, spores, nutrients and sonification. Move stacked specialist vocabulary into
  optional Science words/teacher detail. Done when definitions remain available without audio
  and the main explanation does not depend on opening the drawer.

- [ ] **M04 — Use American spelling in visible content.**
  Review titles, bodies, captions, alternatives, questions and feedback for mold/molds,
  color and comparable US wording. Done when visible copy is consistent and existing IDs
  such as `mushroom-family:moulds` and `mushroom-answer:colour` remain unchanged.

- [ ] **M05 — Author context for every selectable activity.**
  Give each activity an appropriate question/title, introduction, short explanation, action
  and observation prompt. Reserve the tiny-drop heading for launch; give wind, puffball and
  life cycle their own context. Done when an activity can be understood independently and
  the prompt asks about something its visual actually reveals. State switching is M13.

- [ ] **M06 — Make the fungal-jobs heading fit all jobs.**
  Replace the forest-only heading with Fungi have many jobs or equivalent wording that
  includes baker's yeast. Done when recycling, plant partnerships and baking all fit their
  shared introduction, with clear local questions and observations.

- [ ] **M07 — Simplify the three kingdom cards.**
  Keep mushrooms, molds and yeasts as familiar examples, not exhaustive or mutually exclusive
  categories. Lead with one short takeaway; put specialist taxonomy in optional detail.
  Done when title, photograph and essential explanation lead the reading order, while image
  type, magnification context, source and licence information remain accessible.

- [ ] **M08 — Polish image inspection without rebuilding a working viewer.**
  Keep the uncropped large image and obvious return control. Use specific accessible names,
  such as Enlarge the yeast photograph, and keep technical metadata secondary. Done when
  enlargement, close/Escape, focus return and a small-screen inspection all work; credits
  remain available. Do not treat the recording's ChatGPT overlays as page elements.

- [ ] **M09 — Add calm safety language and remove imitation ambiguity.**
  Include that outdoor mushrooms must not be tasted and pictures/color do not establish
  edibility. Rename Try it yourself to Think like a scientist or another clear question-
  activity label. Done when there is no edibility-guessing game or implied invitation to
  collect, taste or grow household mold. Puffball-specific placement is required by M25.

## B. Navigation and visual context

- [ ] **M10 — Preserve useful chapter navigation and reliable destinations.**
  Keep the three numbered top panels, destination colors, current-location cue and direct
  classroom link. Done when anchors and keyboard focus land below the sticky bar at desktop,
  mobile and zoomed sizes. Ordinary overlap while freely scrolling is not sufficient evidence
  of a broken anchor. Do not restore the removed duplicate lower chapter strip.

- [ ] **M11 — Simplify the extra activity layer in Life in motion.**
  Provide one discoverable activity chooser within the second station. Candidate direct
  destinations are launch, wind, puffball, life cycle, glowing fungi, mushroom music and
  explorer questions. Seven equal tabs is a layout option, not a locked requirement.
  Done when the tested desktop/mobile presentation reduces selection steps, keeps every
  activity discoverable, and adds no new vertical learning section.

- [ ] **M12 — Provide an optional guided route.**
  Let a child start with the first exhibit and use a clearly labeled local Next exhibit
  action, while all activities remain freely selectable. Done when the next destination
  is predictable, the current activity stays identifiable, and nothing auto-advances essential
  text. Avoid adding another global navigation toolbar or duplicate chapter bar.

- [ ] **M13 — Synchronize selected activity, headings, media and controls.**
  Switch the selected state, title, explanation, visual, recording and prompt together.
  Suspend the previous activity's media and retain compatible direct links/view aliases and
  existing history semantics. Done when every reachable state presents one coherent topic
  through direct loads, keyboard selection, applicable browser navigation and guided Next.

- [ ] **M14 — Correct the anatomy supporting-image context.**
  The current static gill image is accurately captioned but remains next to other selected
  parts (00:26–00:30). Use matching registered images where available, or clearly separate
  the fixed gills example. Done when Mycelium/Spores cannot reasonably be read as labels for
  that photograph. Never invent an unverified specimen image to fill a slot.

- [ ] **M15 — Make anatomy selections easy to identify.**
  Preserve all five markers and their correct part positions, including 05. Make the active
  part, its number/name and corresponding explanation unmistakable using more than hue.
  Done when mouse, touch and keyboard selection are clear, targets meet M38, and there is
  no continuous attention-grabbing bounce or pulse.

## C. Process visuals and spore investigations

- [ ] **M16 — Polish connected mycelium growth.**
  Preserve the existing attachments and parent-first animation. Use clear Watch it grow,
  Pause/Resume and Replay states, an informative starting/completed view and inspectable
  pacing. Done when branches visibly extend from existing growth, replay starts cleanly,
  pause/resume preserves finished strands, and reduced-motion users can inspect the process.

- [ ] **M17 — Build a recycling process visual.**
  Show dead leaf/wood material breaking down outside fungal threads, smaller food particles
  being absorbed, and nutrients becoming available in the surroundings. Keep the real photo
  as supporting evidence. Done when advancing the sequence changes the explanatory visual,
  not only a sentence or underline, and each stage has an observable takeaway.

- [ ] **M18 — Give plant partnerships whole-plant context.**
  Add a small plant with leaves above the root and explain where its sugar comes from.
  Scope the partnership to some fungi/plants. Done when children can distinguish plant root,
  fungal threads and the above-ground plant, and connect sunlight, plant sugar and the exchange.

- [ ] **M19 — Clarify both exchange directions.**
  Label Sugar to the fungus and Water and minerals to the plant. Use direction, text and
  distinguishable arrow/marker styles alongside color. Offer Watch the trade and optional
  one-direction highlighting. Done when the arrows, selected control and explanation agree
  for both directions, and exchange can be paused and inspected.

- [ ] **M20 — Strengthen the dough comparison.**
  Make enlarging gas pockets visually explain rising dough and retain a starting-level
  outline for comparison. Preserve the sped-up label, finite rise and held ending already
  shown at 01:23–01:30. Done when replay is explicit, Pause/Resume works, and the model
  never implies a natural shrink/rise cycle.

- [ ] **M21 — Clarify the tiny-drop mechanism.**
  Preserve attached starting spore → water joining → short release. Directly label the
  water drop, wet spore surface and tiny stalk; keep enlarged/slowed disclosures. Done when
  labels, stage indicators and movement agree, the release remains short, and the sequence
  stops for inspection with replay/step alternatives rather than resembling a cannon shot.

- [ ] **M22 — Improve breeze controls while retaining live response.**
  Use one clear Try the breeze start action; retain the slider's existing effect on moving
  spores. Add Left / Still air / Right alternatives and Reset, with Pause/Resume. Done when
  still air shows settling, direction changes affect the current run, and all controls work
  without precise dragging or creating uncontrolled overlapping runs.

- [ ] **M23 — Make research-video viewing clear and useful.**
  Give the microscope recording a larger useful display and one prominent Play video
  affordance, retaining accessible pause, replay and fullscreen access. Synchronize any custom
  control with actual native-player state. Done when playback is tested live, captions and
  silent/slow-motion labels remain available, and completion/load failure is understandable.

- [ ] **M24 — Remove the launch-recording mismatch from wind travel.**
  At 01:40–01:46 the wind model remains beside a microscope caption describing launch.
  Restrict that recording to the launch comparison. Use wind-specific supporting content
  or give the wind model more space; a new video is not required. Done when no wind view
  presents launch footage or launch instructions as if they show air transport.

- [ ] **M25 — Keep the puffball comparison accurate and watch-only.**
  Retain the working footage and distinct release mechanism. Explain that many tiny spores
  form the visible cloud; put a brief warning beside it against squeezing wild mushrooms
  or breathing spore clouds. Done when its heading/prompt match puffballs, the slowed-five-
  times label and attribution remain, and no unknown capture frame rate is invented.

- [ ] **M26 — Make the life cycle visibly repeat.**
  Keep four illustrated stages visible with arrows returning from release to a new spore.
  Use a readable vertical equivalent on small screens; keep a selected stage's explanation.
  Preserve connected growth, the simplified mushroom-making-fungus scope and the fact that
  not every spore succeeds. Done when the cycle is visible without assuming automatic looping
  and the early-stage canvas's empty space helps explain the relationship.

## D. Electrical activity, music and glowing fungi

- [ ] **M27 — Review the live lab and give glow/music focused activity views.**
  Inventory actual playback, labels and cleanup before changes; the recording does not open
  these tabs. Present glow and music as clearly identifiable activities using the existing
  source records. Done when both are directly reachable and their visuals and controls are
  appropriate to their separate questions, without adding another vertical station.

- [ ] **M28 — Explain electrical activity and its limits accurately.**
  Introduce charged particles/ions as part of living-cell work and explain that researchers
  study connections with growth, taking in food and responses. Distinguish established cell
  processes from unsettled interpretations of recorded spikes. Done when there are no claims
  of decoded language, feelings, heartbeat or a known universal purpose for every spike.

- [ ] **M29 — Show the measurement-to-sound chain.**
  Use four clear illustrated stages: fungus, sensor, computer and speaker/instrument.
  Explain what is measured, the chosen mapping rule and who chooses the sound. Done when
  a child can follow the cause of the audible notes, with device-specific distinctions
  between voltage and conductivity/resistance available in teacher detail.

- [ ] **M30 — Identify the data honestly beside playback.**
  Keep synthetic/model, recorded and live states distinct. A synthetic activity must say
  Example pattern and must not claim its displayed numbers were measured from a mushroom.
  State the chosen mapping; document normalized/model values or real units, time scale,
  species, source and processing as applicable. Done when graph, labels and sound correspond
  and no unrelated audio is passed off as sonification of the displayed trace.

- [ ] **M31 — Add a controlled instrument comparison.**
  Provide two recognizable sounds, such as bell and piano/keys, using appropriately licensed
  assets or clearly described synthesis. Replay exactly the same values, timing and mapping
  when changing sound. Keep generating a new pattern separate from this comparison.
  Done when the instrument changes audibly while the displayed data and mapping stay fixed.

- [ ] **M32 — Complete sound transport and coordination.**
  Provide intentional Play/Pause, Replay, Stop and Volume behavior. Keep the trace marker and
  note highlight on the same playback clock. Prevent narration/music overlap and stop sound
  on leaving/hiding/unmounting. Done when controls, resume/replay, cleanup and unsupported-
  audio/load-error behavior are tested, with a useful visual lesson remaining when silent.

- [ ] **M33 — Add a verified real-world mushroom-music example.**
  Source a short documented, permission-cleared demonstration. Identify its actual sensor
  measurement, sound mapping, artistic choices and any accelerated/selected/processed data.
  Done when provenance, permitted use and the explanation are verified. If unavailable, mark
  this item blocked with evidence and continue independent fixes; the synthetic model alone
  does not complete this real-world-example requirement.

- [ ] **M34 — Keep chemical light distinct from sonification.**
  Retain the real glowing-fungus photograph, chemical-reaction explanation, some-fungi scope
  and long-exposure context. Keep artistic thread highlights distinguishable from natural
  light. Done when the glow activity never implies that electrical signals normally appear
  as visible glowing threads or that bioluminescence and sonification are the same mechanism.

- [ ] **M35 — Add an observation that tests the music lesson.**
  Ask what changed when the same pattern used another instrument, and show which sample/note
  is being represented. Keep instructions and a visual equivalent usable with sound off.
  Done when the activity invites a specific observation about data, mapping and instrument
  choice, rather than presenting an unexplained performance.

## E. Reading, access and user control

- [ ] **M36 — Make essential reading and diagram labels legible.**
  Use approximately 18–20 px explanatory text as a starting point, suitable line spacing and
  sturdy reading/control typography. Reduce competing tiny uppercase labels and prioritize
  the relevant visual. Done when essential labels/instructions are readable on tested screens;
  compact credits remain accessible and text is not clipped to preserve a fixed height.

- [ ] **M37 — Verify contrast and distinguish interaction states.**
  Measure actual text/surface combinations: normal text at least 4.5:1, qualifying large text
  3:1, and applicable meaningful UI/focus cues 3:1 against adjacent colors. Check selected,
  hover, focus, feedback, image-overlay and gradient states. Done when the three palettes
  remain distinct and states use labels/shape/markers as well as hue. Record test limits.

- [ ] **M38 — Meet the classroom touch-target goal.**
  Aim for at least 44 × 44 CSS px controls with separation, including anatomy points on small
  screens. This is the selected enhanced design target, not a claim about the blanket WCAG
  AA minimum. Done when touch alternatives work and labels, targets and neighbors remain
  usable at the narrow and zoomed test sizes without relying on hover.

- [ ] **M39 — Preserve and verify keyboard semantics and focus.**
  Check tab roles/selection, arrows/Home/End where applicable, names/relationships, current
  chapter, focus visibility, dialog close/Escape and return to opener. Done when every
  activity is operable by keyboard, direct links reveal the correct view, and sticky
  navigation hides neither destination headings nor focused controls.

- [ ] **M40 — Extend reduced-motion support into the runtime.**
  Honor system preference with informative stills or manual steps for JavaScript/WAAPI/rAF
  models as well as CSS motion. Provide a persistent Less motion preference if needed across
  exhibits. Done when movement remains intentional, Pause/Resume/Replay are usable, inactive
  work stops, and the core lesson remains understandable without continuous animation.

- [ ] **M41 — Add optional core-description read-aloud.**
  Choose browser speech or recorded clips only after checking target-browser capability and
  science-word pronunciation. Narration is intentional, stoppable and tied to current visible
  content; it coordinates with M32. Done when text remains fully usable without voice support,
  no stale narration contradicts edited text, and sources/credits are not read unnecessarily.

## F. Content ownership, evidence and completion

- [ ] **M42 — Put editable lesson content in the validated contract.**
  Move revised explanations, activity titles, prompts, instructions, relevant safety/teacher
  notes and supported media choices out of hardcoded renderer strings. Extend the owning
  contract and regenerate control/schema documents together, preserving stable identities.
  Done when supported content can change without editing rendering code, unsafe/unknown
  fields still fail validation, and future Mushinator ownership is accurately documented.

- [ ] **M43 — Verify research and register new assets.**
  Check new/revised claims against appropriate sources, with primary research/device
  documentation for technical explanations. Preserve per-asset sources, rights, changes,
  stable references and integrity metadata. Done when every new real example/recording has
  verified provenance and model/classroom/specimen labels are truthful. A source citation
  by itself does not establish permission to reuse its media or dataset.

- [ ] **M44 — Run and extend meaningful automated checks.**
  Reuse `npm run check:mushrooms` and add coverage for changed contract/state behavior:
  compatible identities, activity/media binding, process ordering, controlled music data,
  replay/resume and cleanup. Done when relevant checks and the build pass and tests address
  actual regressions. Existing passing baseline tests alone do not verify the new lesson.

- [ ] **M45 — Recheck every activity in the browser.**
  Exercise all revised views at 1920×911, 1366×768, 820×1180, 390×844 and 320×640, plus
  200% text/zoom, keyboard and touch-relevant behavior. Check overflow, media, focus, controls,
  default journey length and the journal shortcut. Done when `QA.md` records actual results,
  screenshots where useful, failures/limits and changes from the baseline without calling
  this browser testing physical-device or screen-reader certification.

- [ ] **M46 — Complete the teacher-led classroom usability check.**
  Ms. Hughes checks the actual display/projector and observes a short pupil trial: finding
  an exhibit, identifying what to press and explaining mushroom, spores and music mapping.
  Done when provided teacher/pupil feedback is recorded and material misunderstandings are
  addressed. Keep this pending until that real check occurs; automated tests cannot replace it.

## Deferred work — distinct from the exhibit-fix batches

These remain part of the wider project. They are not silently discarded, nor are they
required to implement the museum fixes above. Do not mark them complete from this checklist.

- **J01 — Journal contract and renderer.** The current contract enforces `currentStage: null`
  and zero entries. Define and implement real journal records, stage display and publication
  behavior in the later classroom-authoring phase.
- **J02 — Actual classroom content.** Collect the question, prediction, selected kit/species,
  real dates/setup, dated photos/drawings/videos, observations, measurements with units,
  comparisons and evidence-supported conclusions. Support teacher/student contributions
  without inventing entries or making up missing facts.
- **J03 — Accurate investigation framing.** Use the actual kit's care instructions and
  starting stage. A kit already containing mycelium starts at that stage. Use observation/
  growing-investigation language unless an actual controlled comparison is defined; do not
  generalize one kit's outcome to all mushrooms. Teacher notes cover appropriate handling.
- **J04 — Mushinator.** Build genuine teacher-facing editing through the planned Lanternworks
  route/button, with validated text/media/journal operations. The content contract alone is
  not the editor. Broader authentication, upload and platform work belongs to that scope.
- **J05 — Publication and other project work.** Prepare the immutable release and manual
  Hub/manifest swap as separate work when appropriate. Hub Swapper, Photo Album/Drive wiring,
  the wider page builder and asset-control platform are outside these exhibit-fix batches.

## Completion and drift rules

- Refer to work by its stable ID, for example M14 or M33. Do not renumber or delete an item
  when the plan evolves; record a dated clarification or superseded entry instead.
- Append new IDs only for a new instruction or a verified issue, recording the reason and
  effect on scope. Do not let an implementation preference silently become a new requirement.
- An unchecked item is open. Mark an item in progress or blocked explicitly when relevant.
  Check it only after its Done when condition has evidence; planning text is not evidence.
- For each completed item, append an evidence entry containing ID, date, changed files/commit,
  relevant tests/browser observation, source/rights verification where applicable, and limits.
- Preserve the baseline protections. If a change affects them, recheck the affected behavior.
- Settle design options inside the fixed requirements with a concrete desktop/mobile preview
  and record the choice here. The exact seven-choice tab layout is not a pre-decided constraint.
- Do not silently substitute an invented example for a real-world requirement, expand work
  into another application, or drop the music lesson because sourcing needs more work.
- Keep research/publication state truthful after content changes. Update current documentation
  and QA while retaining historical evidence. The page remains a draft until its separate
  release work is actually completed.
- Progress updates should identify completed IDs, verified behavior, remaining IDs and any
  blocker or scope decision. Keep progressing on independent authorized work.

No M01–M46 item has implementation evidence at checklist creation. Existing baseline evidence
belongs to `QA.md` and the recorded/source observations above.

## Implementation map and source references

| Concern | Owning files |
| --- | --- |
| Authored lessons, claims and media references | `source/mushrooms.source.json`, `src/contract.js` |
| Generated editor/schema descriptions | `source/mushrooms.control.json`, `schemas/mushroom-exploration.source.schema.json` |
| Station navigation, anatomy, cutaway, gallery and binding | `src/runtime.js` |
| Process, wind, video, life-cycle, quiz and sound behavior | `src/labs.js` |
| Scientific illustrations and connected specimen geometry | `src/art.js` |
| Palettes, responsive layout, targets, labels and focus | `src/exhibit.css`, `src/host-compat.css` |
| Registered photographs, footage and integrity | `src/photo-catalog.js`, `src/photos.js`, `src/video-assets.js`, `src/assets/`, `source/mushrooms.assets.json` |
| Regressions, preview build and actual QA | `tools/test-mushroom-exploration.mjs`, `tools/build-mushroom-exploration-preview.mjs`, `QA.md` |

Paths are relative to this application unless prefixed `schemas/` or `tools/`, which are
relative to the repository root. Keep generated files derived from their owning modules.

Key technical verification starting points, alongside the audit's S1–S18 and `RESEARCH.md`:

- [Growth-associated fungal electrical activity, Ablonczy et al. (2026)](https://link.springer.com/article/10.1557/s43579-026-01041-7).
- [Biodata Sonification — device creator's conductivity-to-MIDI explanation](https://electricityforprogress.com/).
  This plant-device description is not itself proof of a particular fungal recording.
- [Xamk's first-person mushroom-sonification project account](https://julkaisut.xamk.fi/elo/yleinen/can-mushrooms-sing-bioelectrical-signals-as-a-component-in-creative-work/).
  Use documented measurement/processing limits; do not import speculative language claims.
- [W3C: Pause, Stop, Hide](https://www.w3.org/WAI/WCAG22/Understanding/pause-stop-hide.html).
- [W3C: Contrast Minimum](https://www.w3.org/WAI/WCAG22/Understanding/contrast-minimum.html)
  and [Non-text Contrast](https://www.w3.org/WAI/WCAG22/Understanding/non-text-contrast.html).
- [W3C: Target Size Enhanced](https://www.w3.org/WAI/WCAG22/Understanding/target-size-enhanced.html).

### Recording crosswalk

| Approximate timestamp | Evidence informing tasks |
| --- | --- |
| 00:00–00:06 | Hero readiness and primary action: M01. |
| 00:06–00:18 | Kingdom cards and working image enlargement: M02–M04, M07–M08. |
| 00:20–00:30 | Anatomy selections, existing 05 and static gill support image: M14–M15. |
| 00:32–00:50 | Connected finite thread growth and model/photo distinction: M16. |
| 00:52–01:12 | Text/stage changes without a recycling process visual: M06, M17. |
| 01:14–01:22 | Root exchange markers; missing whole-plant context: M18–M19. |
| 01:23–01:30 | Dough rises and holds: M20. |
| 01:32–01:38 | Droplet sequence; displayed but unplayed microscope recording: M21, M23. |
| 01:40–01:46 | Live wind response, launch heading/recording mismatch: M05, M13, M22, M24. |
| 01:48–01:58 | Working puffball playback, distinct mechanism, shared-heading mismatch: M05, M23, M25. |
| 01:59–02:05 | Four selectable stages without a visible cycle return: M26. |
| 02:06–02:09 | Honest classroom placeholder: M01, deferred J01–J03. |
| Not demonstrated | Live glow/music/questions, keyboard, mobile, zoom and sound quality: M27–M41, M44–M46. |
