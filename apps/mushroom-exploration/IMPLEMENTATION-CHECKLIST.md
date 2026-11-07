# Mushroom exhibit — implementation checklist

Version 1.6 · November 7, 2026 · Real in-exhibit video verified; speech and classroom acceptance remain open.

This is the current checklist for the classroom-content and interaction improvements.
It consolidates Arctic's instructions, `Fungi-Website-Developer-Audit.md`, the exact
`2026-11-06_15-44-35.mp4` recording, and the current repository source. Creating this
document alone did not complete any fixes. All 46 items started open; checked items now
have dated implementation evidence below.

**Current status: 44 of 46 complete.** **M33 is now complete:** the real creator recording
played inside this exhibit in connected Chrome over HTTPS, with advancing time, readyState 4,
Pause and activity-change cleanup verified. **M41 and M46 remain open:** three available voice
choices ended before reporting speech start, and actual teacher/pupil feedback is absent.
The reader now reports this premature end as an error rather than falsely saying finished.
J01–J05 (journal/content/Mushinator) remain deferred.

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

- [x] **M01 — Make the entrance match classroom-project readiness.**
  Make Explore fungi the primary action while the journal has no real published content.
  Keep a secondary Our class project — coming soon destination and the direct chapter link.
  Reduce repeated placeholder shortcuts in station headers. Done when the first action opens
  a usable exhibit and journal availability is represented honestly.

- [x] **M02 — Edit the core explanations for this audience.**
  Lead with plain meaning, usually two or three short sentences and one unfamiliar term at a
  time. Retain necessary some/many qualifiers and explain the difference between a mushroom
  and the wider fungus. Done when every core explanation has an age-appropriate main layer
  and optional technical detail without losing the scientific meaning.

- [x] **M03 — Add usable science-word help.**
  Supply short definitions and checked pronunciation for relevant words such as mycelium,
  hypha/hyphae, spores, nutrients and sonification. Move stacked specialist vocabulary into
  optional Science words/teacher detail. Done when definitions remain available without audio
  and the main explanation does not depend on opening the drawer.

- [x] **M04 — Use American spelling in visible content.**
  Review titles, bodies, captions, alternatives, questions and feedback for mold/molds,
  color and comparable US wording. Done when visible copy is consistent and existing IDs
  such as `mushroom-family:moulds` and `mushroom-answer:colour` remain unchanged.

- [x] **M05 — Author context for every selectable activity.**
  Give each activity an appropriate question/title, introduction, short explanation, action
  and observation prompt. Reserve the tiny-drop heading for launch; give wind, puffball and
  life cycle their own context. Done when an activity can be understood independently and
  the prompt asks about something its visual actually reveals. State switching is M13.

- [x] **M06 — Make the fungal-jobs heading fit all jobs.**
  Replace the forest-only heading with Fungi have many jobs or equivalent wording that
  includes baker's yeast. Done when recycling, plant partnerships and baking all fit their
  shared introduction, with clear local questions and observations.

- [x] **M07 — Simplify the three kingdom cards.**
  Keep mushrooms, molds and yeasts as familiar examples, not exhaustive or mutually exclusive
  categories. Lead with one short takeaway; put specialist taxonomy in optional detail.
  Done when title, photograph and essential explanation lead the reading order, while image
  type, magnification context, source and licence information remain accessible.

- [x] **M08 — Polish image inspection without rebuilding a working viewer.**
  Keep the uncropped large image and obvious return control. Use specific accessible names,
  such as Enlarge the yeast photograph, and keep technical metadata secondary. Done when
  enlargement, close/Escape, focus return and a small-screen inspection all work; credits
  remain available. Do not treat the recording's ChatGPT overlays as page elements.

- [x] **M09 — Add calm safety language and remove imitation ambiguity.**
  Include that outdoor mushrooms must not be tasted and pictures/color do not establish
  edibility. Rename Try it yourself to Think like a scientist or another clear question-
  activity label. Done when there is no edibility-guessing game or implied invitation to
  collect, taste or grow household mold. Puffball-specific placement is required by M25.

## B. Navigation and visual context

- [x] **M10 — Preserve useful chapter navigation and reliable destinations.**
  Keep the three numbered top panels, destination colors, current-location cue and direct
  classroom link. Done when anchors and keyboard focus land below the sticky bar at desktop,
  mobile and zoomed sizes. Ordinary overlap while freely scrolling is not sufficient evidence
  of a broken anchor. Do not restore the removed duplicate lower chapter strip.

- [x] **M11 — Simplify the extra activity layer in Life in motion.**
  Provide one discoverable activity chooser within the second station. Candidate direct
  destinations are launch, wind, puffball, life cycle, glowing fungi, mushroom music and
  explorer questions. Seven equal tabs is a layout option, not a locked requirement.
  Done when the tested desktop/mobile presentation reduces selection steps, keeps every
  activity discoverable, and adds no new vertical learning section.

- [x] **M12 — Provide an optional guided route.**
  Let a child start with the first exhibit and use a clearly labeled local Next exhibit
  action, while all activities remain freely selectable. Done when the next destination
  is predictable, the current activity stays identifiable, and nothing auto-advances essential
  text. Avoid adding another global navigation toolbar or duplicate chapter bar.

- [x] **M13 — Synchronize selected activity, headings, media and controls.**
  Switch the selected state, title, explanation, visual, recording and prompt together.
  Suspend the previous activity's media and retain compatible direct links/view aliases and
  existing history semantics. Done when every reachable state presents one coherent topic
  through direct loads, keyboard selection, applicable browser navigation and guided Next.

- [x] **M14 — Correct the anatomy supporting-image context.**
  The current static gill image is accurately captioned but remains next to other selected
  parts (00:26–00:30). Use matching registered images where available, or clearly separate
  the fixed gills example. Done when Mycelium/Spores cannot reasonably be read as labels for
  that photograph. Never invent an unverified specimen image to fill a slot.

- [x] **M15 — Make anatomy selections easy to identify.**
  Preserve all five markers and their correct part positions, including 05. Make the active
  part, its number/name and corresponding explanation unmistakable using more than hue.
  Done when mouse, touch and keyboard selection are clear, targets meet M38, and there is
  no continuous attention-grabbing bounce or pulse.

## C. Process visuals and spore investigations

- [x] **M16 — Polish connected mycelium growth.**
  Preserve the existing attachments and parent-first animation. Use clear Watch it grow,
  Pause/Resume and Replay states, an informative starting/completed view and inspectable
  pacing. Done when branches visibly extend from existing growth, replay starts cleanly,
  pause/resume preserves finished strands, and reduced-motion users can inspect the process.

- [x] **M17 — Build a recycling process visual.**
  Show dead leaf/wood material breaking down outside fungal threads, smaller food particles
  being absorbed, and nutrients becoming available in the surroundings. Keep the real photo
  as supporting evidence. Done when advancing the sequence changes the explanatory visual,
  not only a sentence or underline, and each stage has an observable takeaway.

- [x] **M18 — Give plant partnerships whole-plant context.**
  Add a small plant with leaves above the root and explain where its sugar comes from.
  Scope the partnership to some fungi/plants. Done when children can distinguish plant root,
  fungal threads and the above-ground plant, and connect sunlight, plant sugar and the exchange.

- [x] **M19 — Clarify both exchange directions.**
  Label Sugar to the fungus and Water and minerals to the plant. Use direction, text and
  distinguishable arrow/marker styles alongside color. Offer Watch the trade and optional
  one-direction highlighting. Done when the arrows, selected control and explanation agree
  for both directions, and exchange can be paused and inspected.

- [x] **M20 — Strengthen the dough comparison.**
  Make enlarging gas pockets visually explain rising dough and retain a starting-level
  outline for comparison. Preserve the sped-up label, finite rise and held ending already
  shown at 01:23–01:30. Done when replay is explicit, Pause/Resume works, and the model
  never implies a natural shrink/rise cycle.

- [x] **M21 — Clarify the tiny-drop mechanism.**
  Preserve attached starting spore → water joining → short release. Directly label the
  water drop, wet spore surface and tiny stalk; keep enlarged/slowed disclosures. Done when
  labels, stage indicators and movement agree, the release remains short, and the sequence
  stops for inspection with replay/step alternatives rather than resembling a cannon shot.

- [x] **M22 — Improve breeze controls while retaining live response.**
  Use one clear Try the breeze start action; retain the slider's existing effect on moving
  spores. Add Left / Still air / Right alternatives and Reset, with Pause/Resume. Done when
  still air shows settling, direction changes affect the current run, and all controls work
  without precise dragging or creating uncontrolled overlapping runs.

- [x] **M23 — Make research-video viewing clear and useful.**
  Give the microscope recording a larger useful display and one prominent Play video
  affordance, retaining accessible pause, replay and fullscreen access. Synchronize any custom
  control with actual native-player state. Done when playback is tested live, captions and
  silent/slow-motion labels remain available, and completion/load failure is understandable.

- [x] **M24 — Remove the launch-recording mismatch from wind travel.**
  At 01:40–01:46 the wind model remains beside a microscope caption describing launch.
  Restrict that recording to the launch comparison. Use wind-specific supporting content
  or give the wind model more space; a new video is not required. Done when no wind view
  presents launch footage or launch instructions as if they show air transport.

- [x] **M25 — Keep the puffball comparison accurate and watch-only.**
  Retain the working footage and distinct release mechanism. Explain that many tiny spores
  form the visible cloud; put a brief warning beside it against squeezing wild mushrooms
  or breathing spore clouds. Done when its heading/prompt match puffballs, the slowed-five-
  times label and attribution remain, and no unknown capture frame rate is invented.

- [x] **M26 — Make the life cycle visibly repeat.**
  Keep four illustrated stages visible with arrows returning from release to a new spore.
  Use a readable vertical equivalent on small screens; keep a selected stage's explanation.
  Preserve connected growth, the simplified mushroom-making-fungus scope and the fact that
  not every spore succeeds. Done when the cycle is visible without assuming automatic looping
  and the early-stage canvas's empty space helps explain the relationship.

## D. Electrical activity, music and glowing fungi

- [x] **M27 — Review the live lab and give glow/music focused activity views.**
  Inventory actual playback, labels and cleanup before changes; the recording does not open
  these tabs. Present glow and music as clearly identifiable activities using the existing
  source records. Done when both are directly reachable and their visuals and controls are
  appropriate to their separate questions, without adding another vertical station.

- [x] **M28 — Explain electrical activity and its limits accurately.**
  Introduce charged particles/ions as part of living-cell work and explain that researchers
  study connections with growth, taking in food and responses. Distinguish established cell
  processes from unsettled interpretations of recorded spikes. Done when there are no claims
  of decoded language, feelings, heartbeat or a known universal purpose for every spike.

- [x] **M29 — Show the measurement-to-sound chain.**
  Use four clear illustrated stages: fungus, sensor, computer and speaker/instrument.
  Explain what is measured, the chosen mapping rule and who chooses the sound. Done when
  a child can follow the cause of the audible notes, with device-specific distinctions
  between voltage and conductivity/resistance available in teacher detail.

- [x] **M30 — Identify the data honestly beside playback.**
  Keep synthetic/model, recorded and live states distinct. A synthetic activity must say
  Example pattern and must not claim its displayed numbers were measured from a mushroom.
  State the chosen mapping; document normalized/model values or real units, time scale,
  species, source and processing as applicable. Done when graph, labels and sound correspond
  and no unrelated audio is passed off as sonification of the displayed trace.

- [x] **M31 — Add a controlled instrument comparison.**
  Provide two recognizable sounds, such as bell and piano/keys, using appropriately licensed
  assets or clearly described synthesis. Replay exactly the same values, timing and mapping
  when changing sound. Keep generating a new pattern separate from this comparison.
  Done when the instrument changes audibly while the displayed data and mapping stay fixed.

- [x] **M32 — Complete sound transport and coordination.**
  Provide intentional Play/Pause, Replay, Stop and Volume behavior. Keep the trace marker and
  note highlight on the same playback clock. Prevent narration/music overlap and stop sound
  on leaving/hiding/unmounting. Done when controls, resume/replay, cleanup and unsupported-
  audio/load-error behavior are tested, with a useful visual lesson remaining when silent.

- [x] **M33 — Add a verified real-world mushroom-music example.**
  Source a short documented, permission-cleared demonstration. Identify its actual sensor
  measurement, sound mapping, artistic choices and any accelerated/selected/processed data.
  Done when provenance, permitted use and the explanation are verified. If unavailable, mark
  this item blocked with evidence and continue independent fixes; the synthetic model alone
  does not complete this real-world-example requirement.

- [x] **M34 — Keep chemical light distinct from sonification.**
  Retain the real glowing-fungus photograph, chemical-reaction explanation, some-fungi scope
  and long-exposure context. Keep artistic thread highlights distinguishable from natural
  light. Done when the glow activity never implies that electrical signals normally appear
  as visible glowing threads or that bioluminescence and sonification are the same mechanism.

- [x] **M35 — Add an observation that tests the music lesson.**
  Ask what changed when the same pattern used another instrument, and show which sample/note
  is being represented. Keep instructions and a visual equivalent usable with sound off.
  Done when the activity invites a specific observation about data, mapping and instrument
  choice, rather than presenting an unexplained performance.

## E. Reading, access and user control

- [x] **M36 — Make essential reading and diagram labels legible.**
  Use approximately 18–20 px explanatory text as a starting point, suitable line spacing and
  sturdy reading/control typography. Reduce competing tiny uppercase labels and prioritize
  the relevant visual. Done when essential labels/instructions are readable on tested screens;
  compact credits remain accessible and text is not clipped to preserve a fixed height.

- [x] **M37 — Verify contrast and distinguish interaction states.**
  Measure actual text/surface combinations: normal text at least 4.5:1, qualifying large text
  3:1, and applicable meaningful UI/focus cues 3:1 against adjacent colors. Check selected,
  hover, focus, feedback, image-overlay and gradient states. Done when the three palettes
  remain distinct and states use labels/shape/markers as well as hue. Record test limits.

- [x] **M38 — Meet the classroom touch-target goal.**
  Aim for at least 44 × 44 CSS px controls with separation, including anatomy points on small
  screens. This is the selected enhanced design target, not a claim about the blanket WCAG
  AA minimum. Done when touch alternatives work and labels, targets and neighbors remain
  usable at the narrow and zoomed test sizes without relying on hover.

- [x] **M39 — Preserve and verify keyboard semantics and focus.**
  Check tab roles/selection, arrows/Home/End where applicable, names/relationships, current
  chapter, focus visibility, dialog close/Escape and return to opener. Done when every
  activity is operable by keyboard, direct links reveal the correct view, and sticky
  navigation hides neither destination headings nor focused controls.

- [x] **M40 — Extend reduced-motion support into the runtime.**
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

- [x] **M42 — Put editable lesson content in the validated contract.**
  Move revised explanations, activity titles, prompts, instructions, relevant safety/teacher
  notes and supported media choices out of hardcoded renderer strings. Extend the owning
  contract and regenerate control/schema documents together, preserving stable identities.
  Done when supported content can change without editing rendering code, unsafe/unknown
  fields still fail validation, and future Mushinator ownership is accurately documented.

- [x] **M43 — Verify research and register new assets.**
  Check new/revised claims against appropriate sources, with primary research/device
  documentation for technical explanations. Preserve per-asset sources, rights, changes,
  stable references and integrity metadata. Done when every new real example/recording has
  verified provenance and model/classroom/specimen labels are truthful. A source citation
  by itself does not establish permission to reuse its media or dataset.

- [x] **M44 — Run and extend meaningful automated checks.**
  Reuse `npm run check:mushrooms` and add coverage for changed contract/state behavior:
  compatible identities, activity/media binding, process ordering, controlled music data,
  replay/resume and cleanup. Done when relevant checks and the build pass and tests address
  actual regressions. Existing passing baseline tests alone do not verify the new lesson.

- [x] **M45 — Recheck every activity in the browser.**
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

At checklist creation no M01–M46 item had implementation evidence. The first batch below
now records completed work; earlier baseline evidence remains in `QA.md`.

## Implementation evidence — November 6, 2026, batch 1

**Historical batch 1 snapshot — 16 of 46 were complete:** M01, M03–M15, M24 and M27. All other boxes remain open.
The original fixed requirements and deferred J01–J05 remain in force.

Implementation commit: [93aee2f3c59b7b76ecbc19610230341865ebaa88](https://github.com/ProfessorMinty/HughesWebAssets-Source/commit/93aee2f3c59b7b76ecbc19610230341865ebaa88).
Its tree `0cb69d7c5f882a85bb90411e9a9c0607ab8b5f0d` matches the tested local implementation
commit `45a9b48ffb1e19ddee71d7d3b698216ba20fd6c8`. The entries below share this date/commit;
paths are relative to this application unless stated otherwise.

Design choice for M11: seven direct desktop choices in station two, with one native labeled
activity picker at widths at or below 1100 px. This removes the former nested spore chooser
and separates glow from music. No third learning station was added. The first station uses
the same responsive chooser behavior. A local Next action sits in the station heading so it
does not add a separate row below each exhibit. Explore fungi starts at the first exhibit;
the guided path enters Life in motion at Tiny launch. Manual chapter links retain the chosen view.

| Completed ID | Changed files | Evidence and practical limits |
| --- | --- | --- |
| M01 | `source/mushrooms.source.json`, `src/runtime.js` | Entrance starts a working exhibit; the secondary class-project link says coming soon. Top chapter link remains. Repeated station-header journal shortcuts removed. Empty journal remains empty. |
| M03 | source, `src/contract.js`, runtime, generated control/schema, `RESEARCH.md` | Optional text definitions and written pronunciation for mycelium, hypha/hyphae, spores, nutrients and sonification. Pronunciation checked at publisher dictionary entries; no speech-engine claim. Drawer includes teacher detail without making it essential to the main explanation. |
| M04 | source, `src/labs.js` | Visible mold/color/traveling wording uses US spelling. `mushroom-family:moulds`, visual enum `mould`, and `mushroom-answer:colour` remain stable; test confirms IDs. Historical documentation and bibliography are not renamed. |
| M05 | source, contract, runtime, labs | All selectable exhibit/activity contexts have appropriate introductions, action and observation prompts. Launch/wind/puffball/cycle contexts switch separately; roles have local prompts. Main visuals are still the existing models; process upgrades remain M16–M26. |
| M06 | source | Fungi have many jobs introduces recycling, partnerships and baking. Local copy/prompts fit each job. Plant/recycling/dough visual improvements remain M17–M20. |
| M07 | source, `src/exhibit.css` | Three examples keep title/photo/takeaway first. Specialist names remain available in alternatives/full-view metadata. Different zoom levels and example scope stated. Credits remain on each card and dialog. |
| M08 | runtime | Specific Enlarge names; explicit focus return. All three kingdom photographs opened uncropped at 320 px, dialog 300 px in a 305 px client area, all returned to their opener. Gill dialog Escape also verified. |
| M09 | source, labs | Think like a scientist replaces Try it yourself. Question asks for a safe outdoor action, with no specimen edibility-guessing task. One visible calm safety rule explains that pictures/colors cannot determine safety and leaves moldy food to adults. Puffball watch-only note is authored; M25 still covers its final presentation. |
| M10 | runtime, CSS | Three numbered destination-color links and current-location cue retained. Sticky offset derives from actual nav height. Desktop, 320 px and actual 200% zoom jumps/focus tested below the bar; Back/Forward restores the journal destination. No lower duplicate chapter strip. |
| M11 | runtime, labs, CSS | All eleven choices (four first-station, seven second-station) selected at five sizes: 55 combinations, one visible block panel per station and no horizontal overflow. Desktop tabs and mobile native picker expose every destination directly. |
| M12 | runtime, CSS | Explore fungi resets to Meet the kingdom. Local named Next moves to the shown next destination and focuses it; first-to-second station guided jump starts at Tiny launch. Other activities remain freely selectable; no timed advance. |
| M13 | runtime, labs | Title, intro, selected state, model/film and prompt update together. Direct new activity hashes and legacy lifecycle/lab hashes verified. History remains replace for in-station selection, push for chapter links. Launch video pauses/hides on wind selection; model sound stops on switching to glow. |
| M14 | runtime, source | Gill photograph appears only for Gills. Mycelium selection shows its own explanation without that photo. Caption explicitly identifies the real gill example. No unverified replacement media introduced. |
| M15 | runtime, CSS | Five correct existing point positions retained. Number/name buttons, Part NN of 5 and selected border/text make the choice explicit. At 320 px, static diagram numbers pair with separate named buttons of at least 48 px height and 128 px width, avoiding overlapping targets. Native buttons support keyboard; no bounce added. |
| M24 | labs, CSS, repository-root test file | Launch film is restricted to launch; wind uses the model width. Browser matrix shows zero films in wind and the correct film in launch/puffball. Regression exercises the state function used by the renderer and rejects unknown views. |
| M27 | labs, runtime, CSS | Glow/music now have individual direct destinations using their existing source records. Source inventory preserved the real long-exposure photo, explicitly synthetic graph/sample function and audio-clock mapping. Live Play entered playing state; changing to glow stopped sound and reenabled Play. M28–M35 are not complete from this structural split. |

Shared validation: `npm run check:mushrooms` passed **21 tests**, syntax, regenerated
contract/schema consistency, registered media hashes and standalone build. Five new tests
cover view/film binding, editable activity context/unknown fields, stable cited word records,
old IDs/journal boundary and required renderer blocks. Existing connected-growth and launch-
ordering tests still pass. `git diff --check` passed. Full current observations and screenshot
are in `QA.md`; the screenshot is `qa/batch-1-wind.png`.

Default 1920×911 journey: page about **2567 px**, journal begins about **2233 px**, first
station about **836 px**, second about **787 px**. Baseline was 2564/2230/835 px. The new
instructions and direct chooser preserve approximately the same default scrolling distance.
The three measured row bases remain #06443f / #46311f / #465a2b.

### Historical open work after batch 1 — superseded by batch 2

- **M02 in progress:** source explanations are shorter; older model-stage/status wording and
  the electrical/music lesson still need their audience-specific pass.
- **M16–M26, except completed M24:** next process batch. Preserve the working connected
  growth, launch, wind, finite dough ending and real recordings while improving their teaching.
- **M28–M35:** electrical explanation, signal chain, controlled instrument comparison,
  transport, real example and observation. M33 has a creator-documented candidate; reuse/
  embedding rights and exact permitted presentation are not yet verified. It is not a shipped asset.
- **M36–M45 in progress where touched:** selection/readability, touch alternatives, keyboard,
  content ownership, scientific checks, regressions and browser QA have batch evidence.
  They remain open until the remaining models/music and final checks are finished.
  M42 contract 1.5.0 now owns the new contexts, glossary, safety/teacher notes and entry/station
  copy; older model control/status strings remain renderer-owned. M40 JS reduced-motion and
  M41 read-aloud are not implemented by this batch.
- **M46 pending actual teacher/pupil feedback.** No classroom trial or projector result is claimed.
- **J01–J05 remain deferred.** No journal authoring, Mushinator editor, production install or Hub swap.

New lesson edits are correctly marked `researchStatus: pending`; source remains `scaffold`.
Continue from the next open batch and record new evidence by these same IDs.

## Implementation evidence — November 6, 2026, batch 2

**Ten additional items complete:** M16–M23, M25 and M26. Together with batch 1 this is
**26/46**. M24 was already complete and remains preserved. All remaining boxes stay open.

Implementation commit: [f1fddbae950817a9cbcf260c9886312d9fc9e902](https://github.com/ProfessorMinty/HughesWebAssets-Source/commit/f1fddbae950817a9cbcf260c9886312d9fc9e902).
Its tree `0b230e1a5c9318d124510519948793395d808002` matches local implementation commit
`8d891acac702ed0c2d444b176cf062b6ce99f323`. The entries below share this date and commit.

| Completed ID | Changed files | Acceptance evidence and limits |
| --- | --- | --- |
| M16 | `src/process.js`, `src/labs.js`, `src/runtime.js`, source/contract/CSS | Watch it grow, Pause/Resume, Replay/Reset and manual checkpoints use the original connected parent-first path schedule and specimen anchors. Browser checkpoint had 116 finished strands; after resume/pause, 131 remained finished with time increasing from 2.667 to 2.933 seconds. A later read stayed at 2.933. The eight-second ending held all paths finished. Unit samples require every visible child to have a completed parent. Reduced-motion/manual controls were verified; no detached geometry introduced. |
| M17 | `src/art.js`, labs, source/contract/CSS | Three manual views visibly change outside food particles → particles at actual thread junctions → nutrients in the surroundings. Browser checked all three layer states and matching explanation. Real mycelium photo remains behind a labeled disclosure; opening/enlarging/return worked. These are illustrative particles, not measured chemistry. |
| M18 | art, labs, source/contract/CSS | Whole leafy plant and sunlight appear above the soil, with a thick root connected to a fine fungal mat below. Visible copy links light, leaf-made sugar and the exchange. Some-partnership scope and Kew citation retained; all three fungal-job views fit five tested layouts. |
| M19 | art, labs, `process.js`, source/contract/CSS | Both directions are directly labeled and use arrows, round sugar markers and diamond water/mineral markers. Selecting sugar/water changed the highlighted route and matching explanation. Browser pause held time and marker position; resume reached a finite six-second ending. Both directions is an explicit view; Watch the trade replays both. No quantitative flow claim. |
| M20 | art, labs, `process.js`, source/contract/CSS | Fixed dashed starting outline stays visible. Browser measured dough scale .62 → .81 → 1 and a gas-pocket radius 2.25 → 3.625 → 5; the six-second ending remained risen after leaving and returning. Pause/resume, steps and explicit Replay/Reset share the tested finite clock. Sped-up/enlarged labels remain. |
| M21 | art, labs, process, source/contract/CSS | Direct HTML labels and leaders identify spore, drop, wet surface and tiny stalk. Manual middle state showed merged water with spore still at translate(0 0); ending held translate(-105 0), drop opacity 0 and the spore leader followed it. Water joins before release; the short movement stops for inspection. Model remains enlarged/slowed and is not assigned physical speed units. |
| M22 | labs, process, source/contract/CSS | Try the breeze, live slider, Left/Still air/Right presets, Pause/Resume and Reset are present. Browser reversed an active run: at 3.000 s x=550.37, then after choosing Left and resuming/pausing, at 3.267 s x=532.63. Still-air end held all 36 spores visibly settled at y=470. Clock tests prevent overlapping replays; settling stops later drift. |
| M23 | labs, source/contract/CSS, repository-root tests | Microscope display is about 465 CSS px wide at the reference desktop, with one prominent Play video control plus native controls. Live playback reached readyState 4 and advancing time; pause, ended/replay text, full-screen image and native Escape return were observed. Silent/slow labels and English description track remain separate from status. Native error/retry state mapping is unit-tested; no live network failure was injected. Original clip is still 256×128: larger display adds no source detail. |
| M25 | labs, source/contract/CSS, `RESEARCH.md` | Puffball has its own heading, observation context and watch-only warning inside its player panel. Caption distinguishes its mechanism and many-spore cloud; persistent slowed-five-times label remains. Existing footage/provenance is retained, and integrity tests preserve captureFps null. Safety note checked against CDC. This batch's live full-screen/player test used the microscope clip; the prior recorded puffball playback remains baseline evidence. |
| M26 | art, labs, source/contract/CSS | All four illustrated stages remain present, with a return arrow from released spores to a possible new beginning. Closer crops remove early-stage empty space; connected growth/fruiting artwork remains. Desktop shows a horizontal cycle; 320 px shows four 247×132 px buttons in a vertical sequence with return cue. Keyboard selection updated the explanation. Source enforces the four-stage order and retains the suitable-conditions/many-spores-do-not-succeed scope. |

Shared evidence:

- `npm run check:mushrooms`: **30 tests pass**, all syntax checks, generated source/control/
  schema agreement, registered-photo/video integrity and standalone build. `git diff --check` passes.
- **55 activity/layout combinations** at all five reference sizes: selected topic correct,
  one active block panel per station, no horizontal overflow; four cycle cards remain present.
- **15 additional fungal-job/layout cases**: recycling, partners and baking at all five sizes,
  no overflow. New visible job buttons at 320 px measured at least 48 px tall.
- **11 activity choices at actual 200% Chrome zoom**, 681 px CSS viewport: no overflow.
  Journal focused correctly; heading≈208 px, sticky nav bottom≈122 px. At 320 px, heading≈210 px,
  nav bottom≈124 px. This is not physical-device, screen-reader, projector or pupil certification.
- Persistent Step-by-step view was enabled in the browser: all five animated process controls
  adopted it; reload retained it. Next step made a stable growth snapshot. Native system-
  preference behavior and runtime changes are covered by injected-preference unit tests.
  Storage-write failure and listener cleanup are also tested; a blocked store still permits
  a current-page motion choice. No automatic resume occurs when more motion is reenabled.
- Final default 1920×911 journey: page≈**2602 px**, journal y≈**2268 px**, first station≈**836 px**,
  second≈**822 px**. This adds about 35 px versus batch 1 while expanding the research image
  and adding process controls. Two learning stations, three row palettes and direct journal
  access remain. No new vertical learning chapter was added.
- Screenshot: `qa/batch-2-cycle.png`. Full observations and limits are in `QA.md`.

### Historical open work after batch 2 — superseded by batch 3

- **M02:** finish audience wording as the electrical/music lesson is revised.
- **M28–M35:** electrical activity, the measurement-to-sound chain, controlled instruments,
  transport/volume/coordination, verified real example, glow distinction and observation task.
- **M36–M45:** finish cross-exhibit reading, contrast, target, keyboard, reduced-motion,
  narration, authoring/research and validation work after the music changes. M40 is partly
  implemented for five process clocks; the music cursor and remaining shared behavior still
  need their pass. M41 read-aloud remains unbuilt. M42 now owns process and recording copy
  under contract 1.6.0; remaining music/narration copy still needs its ownership pass.
- **M46:** actual teacher/pupil feedback remains pending. **J01–J05 remain deferred.**

No classroom entries, kit details or observations are invented. The source remains an
unpublished `scaffold` with research review pending. Continue with M28–M35 using these IDs.

Final copy review: the source-owned growth label explicitly retains the earlier disclosure
that diagram threads are enlarged/highlighted, not naturally glowing. This preserves the
model/light distinction while M34 remains open for the full glow/music lesson. The copy-only
caption change was validated/built after browser QA; no diagram geometry or default view changed.

## Implementation evidence — November 6, 2026, batch 3

**Seven additional items complete:** M28–M32, M34 and M35. Together with the earlier batches,
this is **33/46**. M33 has an implementation candidate but remains **open/blocked on in-page
playback acceptance**. M02 and M36–M46 remain open. J01–J05 stay deferred.

Implementation commit: [8cbfdc1666ea95ff4a1c15d356e3cee5608107eb](https://github.com/ProfessorMinty/HughesWebAssets-Source/commit/8cbfdc1666ea95ff4a1c15d356e3cee5608107eb).
Tree `24f325f4993a3a08a11002868234fde9fa591ca7` matches local implementation
`9d44f1602c531f3669fc530be90bfaf2883fbe90`. All entries below share this date/implementation.

| Completed ID | Changed files | Acceptance evidence and limits |
| --- | --- | --- |
| M28 | Source, contract, `RESEARCH.md` | Ion movement is introduced as cell work. Growth, food uptake and responses are research questions; spike interpretation remains unsettled. Teacher detail distinguishes extracellular voltage from conductivity/resistance measurements and sensor/environment effects. No decoded language, feelings, heartbeat or universal spike-purpose claim. Primary growth study and device specification are cited. |
| M29 | `src/art.js`, `src/labs.js`, source/contract/CSS | Four connected illustrated stages show fungus, contacts/device, computer and instruments/speaker. The sensor explanation identifies ease of electrical movement between contacts; human mapping and sound choices are visible. The chain stacks vertically in order on phones and uses the full desktop width alongside graph/controls. |
| M30 | `src/sound.js`, labs, source/contract | Persistent Example pattern disclosure says invented, not mushroom measurements. All sixteen graph points, current sample/value, note strip and scheduled notes use one event list. 0–1 values, 0.5-second spacing, eight-second duration and eight note bands are documented, with no biological units/species/time claim. Boundary mapping and shared event identity are tested. |
| M31 | sound, labs, source/contract | Flute-like and bell-like are explicitly synthesized, with distinct harmonic/envelope choices. Instrument change resets to start while preserving all values, fundamental pitches and onsets. A separately labeled Make a new pattern action changes the data. Automated scheduling comparison verifies identical pitches/onsets and different envelopes. Browser selection resets the visible readout and selected state. No sampled instrument assets are used. |
| M32 | sound, labs, source/contract/CSS, tests | Play/Pause/Resume, Replay, Stop and Volume work intentionally. AudioContext time drives the current sample marker and note. Manual inspection and shared Step-by-step view leave a usable silent lesson. Tests cover pause/resume, finite ending, replay, volume, stale callbacks, startup cancellation/errors, context interruption and destroy cleanup. Browser checks exercised playback, pause/resume, instrument reset, step mode, silent notes, media replacement and immediate chapter/activity exit. Visibility/offscreen cleanup listeners use the same halt path; this controlled browser kept document.hidden false during tab-switch inspection, so an end-to-end hidden-tab pass is not claimed. Narration coordination events exist; M41 read-aloud is not yet implemented or accepted. |
| M34 | source, labs, research | Panellus retains its registered real photo, chemical-reaction explanation, some-fungi scope and over-eight-minute exposure caption. The separate sound activity makes no light-from-electricity claim. Existing enlarged/highlighted/not-naturally-glowing thread labels remain. Asset integrity checks pass. |
| M35 | labs, source/contract | A specific two-choice observation asks what changed after swapping instruments. Feedback explains fixed values/notes/timing and changed sound. Current sample/value/note, a marked point and underlined/selected note cell provide the visual equivalent. Previous/Next note work without AudioContext, and keyboard Enter advanced the readout at 200% zoom. |

### M33 — implemented candidate, acceptance blocked

- Registered creator: Data Garden / PlantWave, Kealia Forest Reserve demonstration, YouTube
  `w0tNEp4m5PY`. Source page documents conductivity measurements and a human-chosen Celestial
  Being sound set (electric piano, bass, chimes, flute). Raw data, full mapping parameters,
  species and playback-speed processing are not supplied; these limits are stated.
- Reuse is restricted to the creator-enabled official YouTube embed under platform terms.
  No media/thumbnail bytes are copied, downloaded, rehosted or relicensed. The asset catalog
  records source, device, artistic choices, permission basis and unknown processing details.
- The creator's original embedded recording played in the connected browser: time advanced
  beyond 71 seconds, duration 235.681 seconds, readyState 4. The same clip's privacy-enhanced
  player rendered inside our cloud preview but remained at time 0 / readyState 0 after Play.
  This does **not** establish in-page playback acceptance or a permanent provider failure.
- The optional player loads only on request. Closing its drawer/player, leaving the activity,
  or starting the example removes it; a direct creator-page fallback is visible. Source,
  measurement and model distinction are present. M33 stays unchecked until the exhibit's
  embedded clip actually plays in a suitable browser/network and its content is accepted.

### Historical batch 3 verification and remaining work — superseded by batch 4

- `npm run check:mushrooms`: **37 tests pass**, syntax checks, generated contract/schema
  consistency, original image/video integrity and standalone build. `git diff --check` passes.
  Seven additions exercise the shared musical mapping/transport, failure/cleanup paths,
  protected editable records and external-demo registration. No dependency was added.
- **55 activity/layout combinations** across 1920×911, 1366×768, 820×1180, 390×844 and 320×640:
  no horizontal overflow; two active block panels total, one per learning station. Music
  buttons measured at least 44 px tall at all five sizes. The phone chain stays in order.
- Actual Chrome **200%** zoom was visibly confirmed. Seven second-station choices had no
  horizontal overflow at 674 px document width; keyboard Enter advanced silent note inspection.
  Zoom returned to 100%. This batch does not claim a full screen-reader or physical-device trial.
- Default 1920×911 footprint is unchanged from batch 2: page≈2602 px; story begins≈2268 px;
  stations≈836/822 px. The optional music workbench is≈716 px tall at that width. On narrower
  screens it grows naturally; no fixed-height clipping is used.
- Screenshot: `qa/batch-3-music.png`, showing the bell-like instrument and sample 6 selected
  with sound paused. Narration, whole-exhibit access/contrast/copy/ownership review and real
  teacher/pupil feedback remain under M02/M36–M46. The source stays scaffold/research pending.

## Implementation evidence — November 6, 2026, batch 4

**Ten additional items complete:** M02, M36–M40 and M42–M45. Cumulative completion is
**43/46**. **M33, M41 and M46 remain open.** No untested voice, embedded playback or actual
classroom result is marked complete. J01–J05 remain deferred.

Implementation: [aefb03b4736d005da66b2ad467870af8f43ced68](https://github.com/ProfessorMinty/HughesWebAssets-Source/commit/aefb03b4736d005da66b2ad467870af8f43ced68).
Tree `768d19d3a16d677b47842e480fdc608b8e6b1182` matches local implementation/evidence commit
`6a7c347697d5755efd63999dd5136fd4f548ec9e`. All rows below share this date and implementation.

| Completed ID | Changed files | Acceptance evidence and limits |
| --- | --- | --- |
| M02 | Source and runtime bindings | Core title/introduction/body/observation layers were reviewed across nine blocks and eleven choices. Nutrients are introduced as materials used again; life stages use right conditions before optional detail; electrical explanation has three short sentences and a defined ion term. Some/many/may qualifiers, mushroom vs wider fungus, invented-pattern/real-example labels and empty-classroom framing remain. Technical interpretation stays in teacher notes. This is an editorial pass; pupil comprehension is still M46. |
| M36 | `src/exhibit.css`, source | Essential captions, prompts, model/diagram labels, statuses, scale/time cues and explanations use 18 px text with 1.5 line spacing. Compact credits use 14 px and have larger link targets. Main copy uses sturdy UI type; miniature exhibit prefixes are secondary. Five-size and 200% checks found no overflow or forced clipping of explanations. |
| M37 | CSS, `tools/audit-mushroom-contrast.mjs`, captured QA JSON | 203 computed text/style cases pass their 4.5:1 or qualifying-large 3:1 threshold. 39 hero/photo-label bounds over arbitrary black/white source-image extremes pass at five sizes. Selected instrument hover had competing background rules; its explicit warm background/dark text now passes, with actual :hover observed. Focus samples visibly used 3 px outlines and stayed below the sticky bar. Amber/cyan outlines exceed 3:1 across the audited base/selected/tray surfaces (conservative minima 3.73/4.30). Selections also use text weight, underlines/inset markers or named feedback. This is scoped design evidence, not WCAG certification. |
| M38 | CSS and QA target records | Visible custom buttons, links, selects and summaries meet 44×44 px throughout all 55 activity/layout cases and 15 job/layout cases, plus all eleven choices at 200% zoom. Clickable checkbox labels supply their full 44 px target. Short photo-credit names and research-credit links were caught and enlarged. Native video controls have explicit larger custom alternatives; third-party/browser-owned controls are not claimed to meet this custom target. |
| M39 | `src/runtime.js`, CSS, QA harness | Keyboard Enter selected all activities; tab arrows/Home/End, selected anatomy part and silent-note inspection were exercised. Image dialog Escape returned focus to its opener. Deep links lab→glow, lifecycle→launch, sound→music and journal/back→music worked. Destination/focused controls remained below navigation; default first heading y≈138 versus nav bottom 77. Focus correction avoids dialogs/native fullscreen. The QA iframe now explicitly allows fullscreen: native research video filled the review surface and returned to its prior geometry on Escape. No screen-reader certification is claimed. |
| M40 | Runtime, process integration, CSS | Shared system/user motion preference now reaches root CSS transitions as well as finite clocks and music. In the browser, enabling Step-by-step view made root less-motion true and chapter transition duration 0 s; manual growth steps worked and music's moving Play disappeared while Next note remained. Preference changes suspend active activities without auto-resume. Existing injected-preference/storage-failure/clock-cleanup tests pass. |
| M42 | Source, contract 1.8.0, runtime/labs, generated schema/control | Shared navigation, photo, science-word, journal-placeholder, reading and media labels are validated in data.ui. Activity labels are editable separately from stable identities. Revised context, prompts, process controls and supported registered media remain source-owned. editMushroomInterface rejects unknown fields/incomplete structures/broken template bindings and invalidates review. Current reading text is built from selected source records. Geometry/identities/provenance remain code/catalog owned. Mushinator itself is still not built. |
| M43 | `RESEARCH.md`, source/catalog checks | New/revised claims retain primary science/device citations and correct scope. W3C contrast criteria and MDN speech lifecycle/voice enumeration were checked. Original six photos and both local research recordings pass provenance/integrity checks; no third-party recording, thumbnail, new specimen or classroom claim was introduced. Real PlantWave reuse remains official embed only, with unknown raw data/mapping/speed disclosed. Source publication/research flags remain conservative pending final acceptance. |
| M44 | Tests/build/audit tool | `npm run check:mushrooms` passes 42 tests, syntax, generated schema/control consistency, original media integrity and standalone build. Five additions cover interface/template edits; fresh selected reading text; delayed/missing/failed voices; utterance ownership/cancellation/stale events/end/error/timeout/cleanup; and numerical contrast/alpha/gradient/image-mask bounds. No dependency was added. `git diff --check` passes. |
| M45 | QA records and proof image | 55 activity/layout and 15 fungal-job/layout cases pass no-overflow, panel-count and custom-target checks. All eleven activities pass at actual 200% Chrome zoom (674 px document width), with keyboard silent-note inspection. Native research video play/pause/ready state and fullscreen were exercised. Deep links, history, dialog return, motion choice and source/word drawer behavior were checked. Exact geometry, failures and browser limits are recorded below and in QA.md. This is not physical-device/projector/screen-reader/pupil certification. |

### Open acceptance gates at the end of batch 4 — historical

- **M33 — Real embedded video:** source, sensor, human musical choices, permitted official
  embedding and fallback are implemented. Both privacy-enhanced and standard official
  players rendered but remained at time 0/readyState 0 after Play in the cloud test browser.
  Earlier creator-site playback in the connected browser did succeed. Actual in-exhibit
  playback remains unaccepted; do not replace this gate with a synthetic-data success.
- **M41 — Actual read-aloud:** reading controls, stop/voice selection, current-source text,
  media/navigation coordination, errors and cleanup are implemented. This browser exposed
  **zero English voices**. The visible unavailable message and injected tests passed, but no
  actual audible reading or science-word pronunciation check was possible. Keep this open
  until a target browser with a real voice is tested; written science-word help remains.
- **M46 — Classroom trial:** Ms. Hughes/projector/pupil feedback has not been supplied. This
  requires the real teacher-led check. J01–J05 (journal/content/Mushinator) remain deferred.

### Reproducible evidence and geometry

- `qa/batch-4-samples.json`: captured DOM text/style, image position and focus cases.
- `qa/batch-4-contrast.json`: 203 text and 39 image-bound results, zero failures, CSS hash.
- `qa/batch-4-verification.json`: all 55 layout, 15 job and 11 actual-zoom observations.
- `qa/batch-4-reading.png`: real-photo station, larger copy and optional reading controls.
- `node tools/audit-mushroom-contrast.mjs apps/mushroom-exploration/qa/batch-4-samples.json apps/mushroom-exploration/qa/batch-4-contrast.json`
  reproduces the captured numerical report. These are dated records, not a live browser runner.
- Default 1920×911: page **2736.94 px**, journal **y2382.95 px**, stations **904.23/868.39 px**.
  Story access adds about **115 px** versus batch 3, for larger reading text, usable credits
  and reading controls. Two learning stations and the direct journal shortcut remain; no
  extra vertical exhibit was introduced. Smaller widths expand naturally without clipping.

The source remains scaffold/research pending. No class kit, dates, photos, entries or outcomes
are invented; no immutable release, live registry/Hub swap or Edublogs injection change occurs.

## Video resilience follow-up — November 7, 2026

This follow-up does not close an acceptance gate. **43/46 remain complete.**

- Contract 1.9.0 adds validated source-owned video status/retry labels. The official API is
  loaded only after the visitor requests the video; actual origin, inline mode and explicit
  autoplay-off are set. Ready is distinguished from real playing. Loading/buffering have a
  12-second limit, a recoverable message and explicit retry. Close/leaving/retry/destroy
  remove players and cancel timers; late callbacks cannot revive a closed player.
- A 202 px border-box minimum corrects the phone player’s previously undersized viewport.
  Actual client dimensions across small phone, phone, tablet, laptop and desktop were
  229×200, 291×200, 712×400, 718×403 and 718×403 px. All five retained zero page overflow;
  Close was 48 px tall. Retry was observed at 48 px tall. Status text is 18 px.
- The official player reported ready; Play moved to buffering then timeout. It still had
  time 0 / native readyState 0. Retry created one fresh frame at time 0; Close returned
  focus to Load; leaving for Glowing fungi removed the frame. **M33 remains open.**
- Connected Chrome exposed English voices on MDN’s official demo, but that does not verify
  this exhibit’s speech or pronunciation. **M41 remains open. M46 needs the actual classroom.**
- `npm run check:mushrooms` passes **48 tests**, including six new official-loader, status,
  timeout, error, actual-origin/autoplay and stale-player/cleanup checks. No dependencies
  or media bytes were added. The default desktop journal remains y2382.95 px, with stations
  904.23/868.39 px and page height about 2737 px; the closed drawer adds no scroll length.
- Current evidence: `qa/batch-5-verification.json`, `qa/batch-5-video-feedback.png`, and
  [REVIEW-HANDOFF.md](REVIEW-HANDOFF.md). The screenshot shows ready/prompt, not playback.

## Current acceptance evidence — November 7, 2026, batch 6

**44/46 complete. M33 newly complete. M41 and M46 remain open.**

- **M33:** A thin `review.html` entry point loads the exact repository source, styles and
  modules over HTTPS. GitHub confirms this repository is already public; no account, new
  production route or copied media is required. In connected Chrome, the actual embedded
  PlantWave recording advanced from 0 to 8.92 seconds, and Pause held at 20.83 seconds.
  A second trial reached 10.23 seconds with duration 235.681 s, readyState 4, paused false
  and muted false. Pause then held at 27.89 s; leaving for Glowing fungi removed the frame.
  The screenshot shows actual in-exhibit footage with the playing status, not a thumbnail.
  Provenance, embed-only reuse, conductivity measurement, human sound choices and unknown
  raw data/mapping/speed remain documented. Cloud-preview buffering is retained as history;
  it does not negate this successful target-browser trial. Auditory quality is not certified.
- **M41:** The exhibit itself discovered six English voices. Microsoft David, Google US
  English and Microsoft Zira each emitted end before start for the 515-character lesson.
  This cannot establish spoken playback or pronunciation. The reader now refuses end before
  start, and refuses a ≥20-word lesson finishing in under one second, reporting a useful
  recoverable error instead of claiming finished. Tests cover both premature events and
  a normal timed completion. No actual voice/pronunciation pass is claimed.
- **M46:** No teacher-led projector/pupil observations have been supplied. This remains
  pending under its original acceptance rule; no simulated pupil feedback is substituted.
- `npm run check:mushrooms` passes **50 tests**, syntax, generated files, original media
  integrity and standalone build. `git diff --check` passes. No dependencies are added.
  Native HTTPS review retained root width 1905 px with zero horizontal overflow and all
  three default specimen photographs loaded at their registered natural widths.
- Evidence: `qa/batch-6-verification.json`, `qa/batch-6-video-playing.png`, and
  `qa/batch-6-reading-failure.png`. [REVIEW-HANDOFF.md](REVIEW-HANDOFF.md) links the exact
  reviewed HTTPS source and the remaining human observations. Production bootstrap still
  rejects draft source; the review entry point alone explicitly allows this draft.

## Implementation map and source references

| Concern | Owning files |
| --- | --- |
| Authored lessons, claims and media references | `source/mushrooms.source.json`, `src/contract.js` |
| Generated editor/schema descriptions | `source/mushrooms.control.json`, `schemas/mushroom-exploration.source.schema.json` |
| Station navigation, anatomy, cutaway, gallery and binding | `src/runtime.js` |
| Process, wind, video, life-cycle, quiz and sound behavior | `src/labs.js`, `src/process.js`, `src/sound.js`, `src/narration.js`, `src/demo.js` |
| Scientific illustrations and connected specimen geometry | `src/art.js` |
| Palettes, responsive layout, targets, labels and focus | `src/exhibit.css`, `src/host-compat.css` |
| Registered photographs, footage and integrity | `src/photo-catalog.js`, `src/photos.js`, `src/video-assets.js`, `src/sound.js`, `src/assets/`, `source/mushrooms.assets.json` |
| Regressions, preview build, contrast and actual QA | `tools/test-mushroom-exploration.mjs`, `tools/build-mushroom-exploration-preview.mjs`, `tools/audit-mushroom-contrast.mjs`, `QA.md` |

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
