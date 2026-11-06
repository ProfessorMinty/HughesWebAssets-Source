# The hidden world of fungi — exhibit draft

Unpublished 2026–2027 exhibit for second and third graders. Based on the verified active
Hub workstream dc7237d3912746afbe9f15dc215dfd18aad6b31f, rather than the older default main.
This branch does not activate a new Edublogs route, swap the Hub, or deploy Lanternworks.

## The page

Viewport breakout is the only layout method. The reference viewport is 1920 × 911 CSS px.
Responsive styles recompose the same exhibit at smaller widths. Breakout uses available
client width, excluding the vertical scrollbar. The preview supplies an Amadeus-like narrow
ancestor chain to exercise the mount-scoped compatibility rules.

The nine stable source blocks now render as a shorter journey: entrance → two full-width
learning stations → classroom growing story. Station one contains kingdom, anatomy,
hidden threads and fungal jobs. Station two contains spores/growing, light/sound and
discoveries/questions. The journal is directly linked from the entrance and sticky navigation.
Tabs retain all block IDs and content, support arrows/Home/End, and reveal direct hash links. Hands-on stations include five anatomy selections, a detailed mycelium
cutaway, drop-launch/wind models beside real microscope footage, photographic bioluminescence,
an invented signal-to-sound model, and three discovery questions. Animations and audio start on request; spore movement, network growth and dough rise can be paused.
Changing an exhibit suspends its active media. Sound starts only on a button press and stops on demand, when
its exhibit leaves view, when the document becomes hidden, or when unmounted.

The palette comes from the woodland entrance image: deep forest `#01231b`, forest surface
`#023327`, moss `#769e53`, cap amber `#e1ad4d`, luminous threads `#2ad9c8` and warm
highlights `#f2dec4`. Representative colors were extracted from the image; secondary text
uses a lighter moss tint for readability. Both learning stations use forest surfaces and
warm text. The classroom story uses moss and bark tones. Selected controls remain dark
teal with a cyan inset marker; amber identifies primary actions. Keyboard focus uses amber
or cyan on dark surfaces. The sticky chapter panels track the section at the reading edge
with `aria-current="location"` and a visible marker. Specimen names precede photographs;
descriptions precede compact captions and credits. Contained photographs retain the full
image in dark specimen displays with explanatory side labels where space permits. The
inspection dialog remains uncropped.

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
captions, observation points and supported records from rendering. Data renders as text,
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
Research has been independently checked, but publication state remains scaffold until
Arctic reviews the exhibit and we prepare an immutable release.

## Run and review

- npm run check:mushrooms — syntax, contract/edit refusal tests, generated contract checks, preview build.
- npm run build:mushrooms — creates dist/mushroom-exploration/index.html and internal qa.html.
- node tools/build-mushroom-exploration-preview.mjs --write-contracts — regenerate contracts after reviewing authority changes.

The standalone index includes code, source, all six real photographs and WebP artwork; it requires no network to
render or play its models. Research and navigation links go to external sites if followed.
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
