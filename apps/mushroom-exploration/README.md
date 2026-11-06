# The hidden world of fungi — exhibit draft

Unpublished 2026–2027 exhibit for second and third graders. Based on the verified active
Hub workstream dc7237d3912746afbe9f15dc215dfd18aad6b31f, rather than the older default main.
This branch does not activate a new Edublogs route, swap the Hub, or deploy Lanternworks.

## The page

Viewport breakout is the only layout method. The reference viewport is 1920 × 911 CSS px.
Responsive styles recompose the same exhibit at smaller widths. Breakout uses available
client width, excluding the vertical scrollbar. The preview supplies an Amadeus-like narrow
ancestor chain to exercise the mount-scoped compatibility rules.

Nine stable blocks: welcome, kingdom, anatomy, below, lifecycle, roles, lab, discoveries,
and journal. Hands-on stations include five anatomy selections, a detailed mycelium
cutaway, drop-launch/wind models beside real microscope footage, photographic bioluminescence,
an invented signal-to-sound model, and three discovery questions. Animation/audio have finite runs; spore
movement can be paused. Sound starts only on a button press and stops on demand, when
its exhibit leaves view, when the document becomes hidden, or when unmounted.

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
Open index.html directly in a modern browser. Optional ?review=1 reveals adult block-outline
tools outside the exhibit. qa.html is an internal screen-size harness, not a contained page
layout option or the user-facing preview.

src/bootstrap.js is the separate future Edublogs entry. It preserves the unavailable
notice on failure, bounds and times out source fetch, rejects draft source, then loads the
repository-owned runtime/CSS. No three-box installation package or immutable release is
claimed yet. Existing Hub, routes, archives, historical mushroom Page 413 and Zinnia remain
outside this change. The later manual swap must register the new-year route, move Zinnia
to 2026–2027 Past and preserve the 2025–2026 archive.

See RESEARCH.md for independent source review and QA.md for observed browser checks.

## Audited wide stations

At 1280 px and above, each section uses a reading rail alongside its visual workbench.
The desktop default is about 42% shorter while preserving nine blocks. Diagrams, photos
and the real research clip sit beside their related controls. At narrower widths the
same sections stack for reading. DIAGRAM-AUDIT.md records the audit and measurements.

The curated research video uses a protected asset:mushroom-video:* reference; it is not
a general video uploader. src/video-assets.js owns its provenance and the generated
mushrooms.assets.json exposes the record to the future editor. The build verifies all
media bytes and embeds the MP4, poster and description in the standalone preview.
