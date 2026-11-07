# The hidden world of fungi — exhibit draft

Unpublished 2026–2027 exhibit for second and third graders. Based on the verified active
Hub workstream dc7237d3912746afbe9f15dc215dfd18aad6b31f, rather than the older default main.
This branch does not activate a new Edublogs route, swap the Hub, or deploy Lanternworks.

The current follow-up scope is in [IMPLEMENTATION-CHECKLIST.md](IMPLEMENTATION-CHECKLIST.md):
46 stable fix IDs with acceptance criteria, baseline protections, execution order and separately
deferred classroom/editor work. Completed items have dated evidence; unchecked items remain open.

## The page

Viewport breakout is the only layout method. The reference viewport is 1920 × 911 CSS px.
Responsive styles recompose the same exhibit at smaller widths. Breakout uses available
client width, excluding the vertical scrollbar. The preview supplies an Amadeus-like narrow
ancestor chain to exercise the mount-scoped compatibility rules.

The nine stable source blocks now render as a shorter journey: entrance → two full-width
learning stations → classroom growing story. Station one contains kingdom, anatomy,
hidden threads and fungal jobs. Station two has seven direct choices: tiny launch, breeze,
puffball cloud, life cycle, glowing fungi, mushroom music and explorer questions. Desktop
tabs become a single native activity picker below 1100 px. The primary entrance starts
the exhibit; the secondary journal destination says coming soon. The journal stays directly
linked from the sticky navigation. A local Next action provides an optional guided path.
Tabs retain all block IDs and content, support arrows/Home/End, and reveal direct hash links. Hands-on stations include five anatomy selections, a detailed mycelium
cutaway, a drop-launch model beside real microscope footage, a separate wind model, photographic bioluminescence,
an invented signal-to-sound model, and three discovery questions. Animations and audio start on request; spore movement, network growth and dough rise can be paused.
Changing an exhibit suspends its active media. Sound starts only on a button press and stops on demand, when
its exhibit leaves view, when the document becomes hidden, or when unmounted.

The process workbenches now show recycling outside the threads, food uptake and nutrient
return; a whole plant with sunlight and both directions of its fungal partnership; and
gas pockets growing above a fixed starting-dough outline. The four life-cycle illustrations
remain visible together with a return arrow, stacking vertically on phones. The launch model
has direct water/surface/stalk labels and a short finite release. Breeze presets supplement
the live slider, and settled spores stay visible. The enlarged research player keeps its
silent/slow labels, native controls, replay, full-screen access and recoverable error message.

Growth, trade, dough, launch and wind use finite teaching clocks with pause/resume, explicit
replay/reset and manual checkpoints. System reduced motion defaults to manual steps; the
Step-by-step view choice is shared across these models and persists when browser storage is
available. If storage cannot be written, the choice still works for the current page.
Changing the preference stops active model motion without auto-resuming it. Music now shares
the manual-step preference. Remaining narration/access work is tracked in the checklist.

The woodland entrance supplies the forest, wood, moss, amber and cyan color families.
Three distinct row surfaces provide wayfinding, with derived shades for each row's panels
and controls:

| Role | Destination | Surface |
| --- | --- | --- |
| Primary | Fungi up close | Forest teal `#06443f` |
| Secondary | Life in motion | Warm bark `#46311f` |
| Tertiary | Our growing story | Moss green `#465a2b` |

Chapter buttons use the matching destination family. Selected controls inherit their row's
colors with a cyan inset marker; amber identifies primary actions. Warm text remains common
across the rows, with lighter moss and gold labels in the tertiary row for contrast.
Keyboard focus uses amber or cyan on dark surfaces. The sticky chapter panels track the
section at the reading edge with `aria-current="location"` and a visible marker. Specimen
names precede photographs; descriptions precede compact captions and credits. Contained
photographs retain the full image in dark specimen displays with explanatory side labels
where space permits. The inspection dialog remains uncropped.

The woodland entrance is generated imaginative artwork, not a specimen photograph or
classroom record. Its cyan threads are fantasy atmosphere. All scientific diagrams are
code-owned SVG models. Gilled-mushroom anatomy is generic, not an identification guide.
The spore tunnel enlarges particles, simplifies airflow and speeds time; it is not a
quantitative dispersal simulation. The retired glow cartoon is replaced by the real long-exposure photograph. The
sound graph is explicitly invented, without physical units or purported fungal recordings.

Six real photographs now complement the models: blue Mycena interrupta, Rhizopus mould,
yeast under DIC microscopy, a gill macro, mycelium on wood and bioluminescent Panellus
stipticus. Cards open an accessible native dialog showing the uncropped delivery image.
Creators, original sources, licences, dimensions and original/delivery SHA-256 values live
in src/photo-catalog.js; source/mushrooms.assets.json is its generated editor-readable view.
The shipped WebP files remain under their individual image licences, including share-alike
where specified. The page and full-view dialog retain credits and licence/source links.
See src/assets/PHOTO-CREDITS.md for the readable per-file licence list.
Images were resized and converted for delivery without retouching or recolouring.

## Source and future editing

source/mushrooms.source.json separates content, source references, image references,
captions, observation points and supported records from rendering. Contract 1.7.0 includes
authored activity titles/intros, action/observation prompts, safety/teacher notes, science-word
definitions and checked written pronunciation. Entrance/station copy is also editable.
These fields are validated; all nine blocks required by the renderer must be present.
The five anatomy parts have named selection buttons. On phones the diagram numbers are
static markers and the separate buttons provide full-size targets. The gill photograph is
shown only for Gills, so it cannot be mistaken for a photograph of mycelium or spores.
The new process labels, stages, status text, control names and recording messages are also
source-owned. Music chain copy, labels, controls, statuses, instruments and observation feedback
are validated too; the broader M42 ownership review remains open. The actual editor is not built. Data renders as text,
never arbitrary HTML. Stable IDs, year, viewport method and reference size are protected.
Content edits invalidate the document's research/publication review state. Add/remove
operations for nested records remain a future explicit command.

Bundled photo references use stable asset:mushroom-photo:* identifiers; unknown IDs fail
validation. Captions and alternatives remain editable. The anatomy detail photograph is a
separate field from its diagram, so selecting a photograph does not move diagram hotspots.

source/mushrooms.control.json and schemas/mushroom-exploration.source.schema.json are
generated from src/contract.js; checks reject drift. These are the contract for the future
Lanternworks /mushrooms module, named Mushinator. The editor, classroom media uploads,
journal authoring and Lanternworks home button are not implemented in this phase.

The actual class kit/species, observation dates, photos and current growth stage remain
unknown. No journal entries or classroom outcomes are invented. The journal block is reserved.
The edited source is marked researchStatus pending while the remaining model/music content
receives its final cross-exhibit review. Publication state remains scaffold. Final review and an immutable
release belong to the later publication phase.

## Run and review

- npm run check:mushrooms — syntax, contract/edit refusal tests, generated contract checks, preview build.
- npm run build:mushrooms — creates dist/mushroom-exploration/index.html and internal qa.html.
- node tools/build-mushroom-exploration-preview.mjs --write-contracts — regenerate contracts after reviewing authority changes.

The standalone index includes code, source, all six real photographs and WebP artwork; it requires no network to
render or play its models. The optional real mushroom-music demonstration needs a network
connection and loads only on request through the creator-enabled YouTube embed. No third-party
video bytes or thumbnail are rehosted. Creator/research/navigation links lead to external sites.
Open index.html directly in a modern browser. Both credited research videos are embedded. Optional ?review=1 reveals adult block-outline
tools outside the exhibit. qa.html is an internal screen-size harness, not a contained page
layout option or the user-facing preview.

src/bootstrap.js is the separate future Edublogs entry. It preserves the unavailable
notice on failure, bounds and times out source fetch, rejects draft source, then loads the
repository-owned runtime/CSS. No three-box installation package or immutable release is
claimed yet. Existing Hub, routes, archives, historical mushroom Page 413 and Zinnia remain
outside this change. The later manual swap must register the new-year route, move Zinnia
to 2026–2027 Past and preserve the 2025–2026 archive.

See RESEARCH.md for independent source review and QA.md for observed browser checks.

## Two full-width learning stations

The current two-station implementation supersedes the earlier nine-section reading-rail
layout. At 1920×911, the default stations are about 830 and 788 px tall; the classroom
story begins around 2220 px from the page top, versus about 6038 px in the earlier edition.
Other main tab defaults range from about 790 to 840 px. Expanded sources/explanations
may grow the selected station intentionally. Smaller screens recompose at readable sizes.
There is no fixed-height clipping, internal content scroller or contained layout mode.

Scientific SVG models carry no embedded text. HTML carries their labels and explanations.
The three old role pictograms and dormant family picture fallbacks have been retired.
Roles now use a full workbench per job: real mycelium photography and a recycling sequence;
a magnified plant-root/fungus exchange; and dough expanding around gas pockets.
Mycelial models use irregular cross-connected networks with dependency-ordered growth.
Each cutaway growth origin is attached to its visible stem base, using the same specimen
position and scale. Anatomy is connected too. The life cycle retains spore/germ-tube
growth before fruiting, with a continuous connection once the mushroom appears.
There is one numbered chapter navigation in the sticky header; the redundant lower strip
is removed. All three chapter links remain visible on narrow layouts.
The life cycle reveals illustrated stages instead of changing text alone.

The spore workbench offers a gilled-fungus catapult, wind journey, real puffball cloud and
illustrated life cycle. The puffball is a dried specimen squeezed in a research demonstration,
clearly distinguished from gilled-mushroom discharge. Unknown capture fps remains unknown.
Registered asset:mushroom-video:* references are not a general upload mechanism.
src/video-assets.js owns provenance; the generated asset catalog exposes both records.
The build verifies and embeds each MP4, poster and description. Contract version is 1.4.0.

See QA.md for current measured checks, RESEARCH.md for sources, and the dated diagram
audits for the earlier findings. Their earlier measurements are historical evidence.

## Music lesson — current draft

The illustrated fungus → conductivity sensor → computer rule → instrument chain separates
measurement from artistic sound choices. A shared list of sixteen invented normalized values
drives the graph, note readout and both synthesized timbres. Flute-like/bell-like selection
resets to the beginning and preserves every value, pitch and onset; generating a new pattern
is separate. Play/Pause/Resume, Replay, Stop, Volume and silent note inspection are available.
Audio time drives the marker and note highlight. Manual-step preference pauses playback;
leaving by a link/activity, hidden/offscreen state and unmount all have cleanup hooks.

The real PlantWave demonstration has a registered external-media record in `src/sound.js`
and the generated asset catalog, with source/device/permission/processing limits. Its
creator-page playback was verified. The cloud-preview embed rendered but kept buffering,
so **M33 remains open** for actual in-page playback acceptance. A creator-page fallback
remains visible. M41 narration is still unbuilt; its start event must suspend music through
`hrv-mushrooms-narration-start`, and it must respond to `hrv-mushrooms-audio-start`.

`src/sound.js` owns deterministic data, musical mapping, synthesis and the finite audio
transport. There are no sampled-instrument assets or added dependencies. The current
checklist and QA record define completion; this draft is not a classroom-tested release.
