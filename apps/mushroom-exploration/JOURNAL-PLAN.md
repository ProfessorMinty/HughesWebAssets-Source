# Classroom growing journal — working plan

November 7, 2026. New journal phase authorized by Arctic. Planning and day-by-day media
intake only at this point; the renderer/uploader below are not yet implemented. The prior
museum checklist remains 44/46 with its two existing acceptance items open.

## Agreed requirements

- A framed, collapsible entry for each observation day.
- Collapsed: day/date, an editable stage label or short stage sentence, and a cover picture.
- Open: that day's photographs/videos, captions/observations, teacher notes and child notes.
- No required contributor name. Blank author names are valid for both teacher and child notes;
  omit an author credit when blank. Notes may be anonymous without a fabricated name.
- Accept original large media, explicitly including HEIC photographs of 15 MB or more and
  video. Automatically convert and optimize for viewing; do not require manual resizing.
- No arbitrary small-file, per-day media-count or contributor-name restriction in the product.
  Real service/decoder limits must be discovered and handled rather than promised away.
- Work from actual supplied media and words; do not invent species, dates, observations,
  teacher statements or pupil quotations. Child notes retain the supplied wording.
- Analyze one day's files, then request the next day's files. Start with Friday.
- Retain viewport breakout, the existing moss journal destination and the 1920×911 reference.

## Proposed public design

Use a field-journal/museum specimen aesthetic: moss surface, warm wood/amber frames,
readable warm lettering and a quiet cyan detail tying it to the exhibit. The photograph
leads; the frame supports it rather than covering the specimen.

At desktop, use two compact day cards across the available width, with a framed thumbnail
beside date/stage text. Stack on phones. An opened entry can span the row to use the full
width for its gallery and notes. Keep other day summaries compact and the selected date in
view. Final spacing and crop choices depend on the actual photographs and videos.

Proposed expanded order:

1. Short, editable stage/observation introduction, if supplied or approved.
2. Mixed photo/video gallery. Videos use a poster and explicit Play; no autoplay. Full photos
   can be inspected without losing their edges. Captions stay with the correct item.
3. Optional teacher notes and optional child notes, in adjacent desktop columns and stacked
   on phones. Empty sections are omitted. Add another note without inventing an author name.
4. Optional additional evidence, such as a photograph of a handwritten pupil observation,
   measurement or comparison. No required measurement, prediction or conclusion template.

Use the calendar day/date, not an assumed Day 1 of growth. The first available photograph
may have been taken after the kit was already growing. A numbered observation is possible
once the sequence is established; elapsed growth days require a confirmed start date.

Load gallery media only when needed; collapsed entries should not download every photograph
and video. Keep the day index small, and load longer notes/gallery records separately as
the history grows, rather than treating the existing source-JSON bound as a media upload limit.

Stage wording is editable free text, with optional suggestions after media review. The
latest published observation can supply the journal's current-stage summary, avoiding two
independent copies that disagree. Do not identify a mushroom species from appearance alone.

## Proposed Mushinator workflow

One Add day screen: choose date → add the original files → review/reorder media and choose
cover → set the stage wording → optionally add teacher/child notes → preview → publish.
Save unfinished work as a draft. Reopen a day to add more media, change its cover, replace
media, edit notes or correct its date/stage without changing its stable identity.

Names are optional display credits, separate from permission to use the editor. The proposed
initial workflow has Ms. Hughes adding/pasting children's contributions in Mushinator. Direct
pupil submission is a separate workflow decision, not silently introduced as public comments.

If a day contains only video, generate a poster frame that can be used as its collapsed cover.
Uploads and conversions need per-file progress, retry and resumability; one failed file should
not erase other completed files or the day's text. Keep incomplete conversions in the editor
rather than publishing broken gallery items.

## Media handling proposal and verified constraints

Keep entry content and stable media references in the repository's authoring contract, with
large media delivered from cloud storage. Do not embed classroom originals into the page's
JavaScript or send large binaries through ordinary Git commits. Verify the current authorized
media service/bucket and Lanternworks implementation before wiring uploads; the historical
asset-platform document is not proof of a current journal upload service.

Proposed pipeline: original upload → retained original → conversion job → optimized display
image/video + thumbnail/poster → verified ready media reference → draft/publish.

For photographs: normalize orientation and color, preserve the actual image, generate useful
viewing sizes and thumbnails, and retain the original separately. For video: inspect the real
container/codecs, create compatible web playback and a poster, preserve audio where present,
and keep playback intentional. Do not treat changing the extension as conversion. Decoder,
quality and size choices must pass the actual supplied files before being described as supported.

Verified platform facts, checked November 7, 2026:

- Cloudflare Images hosted-image uploads are limited to 10 MB. This cannot be the ingestion
  ceiling for the requested 15 MB+ originals. Its remote-image transformation limit is a
  different limit; do not confuse the two. Source:
  https://developers.cloudflare.com/images/get-started/limits/
- R2 supports multipart upload/resume for large files. Use this capability when appropriate
  to the actual upload service. Source:
  https://developers.cloudflare.com/r2/objects/upload-objects/
- Workers have per-isolate memory/CPU limits. Heavy HEIC/video processing needs a verified
  processing approach and cannot be assumed to fit inside a normal request handler. Source:
  https://developers.cloudflare.com/workers/platform/limits/

These are proposed engineering choices, not claims that the storage, converter or uploader
already exists. The product should not impose an arbitrary 15 MB rejection or make Ms. Hughes
perform format conversion. Literally every possible format and unlimited size are not verified
capabilities; unusual/unreadable files need truthful per-file feedback and a recoverable path.

## Provisional intake sequence

Arctic reports weekday-labeled files sent on November 5. Assuming November 5, 2026, these
are the likely dates. Calendar weekdays are verified; observation dates remain unconfirmed.

| Supplied label | Provisional calendar date | Intake state |
| --- | --- | --- |
| Friday | October 30, 2026 | Request first; no files received yet |
| Tuesday | November 3, 2026 | Wait until Friday is reviewed |
| Wednesday | November 4, 2026 | Wait until Tuesday is reviewed |
| Thursday | November 5, 2026 | Wait until Wednesday is reviewed |

For each batch, inspect image/video content and available original metadata; distinguish
capture date from sending/upload date. Record file formats, byte sizes, orientation, video
codecs/duration when available, proposed sequence/cover and evidence-supported stage wording.
Flag uncertainty; do not turn a provisional filename/date inference into a confirmed observation.
Request accompanying actual teacher/child words only where needed after seeing that day.

## Build order

1. Review the four day batches one at a time and preserve an accurate content/media inventory.
2. Extend the current zero-entry journal contract with stable day/media/note records, optional
   authors, draft/publication state and editable stage/date/cover. Regenerate schema/control
   descriptions together. Preserve existing page/block identities and the Edublogs injection.
3. Build the public compact day-card accordion and full-width expanded gallery/notes against
   real supplied content. Verify keyboard, phone layout, image inspection and media cleanup.
4. Inspect and wire the actual Lanternworks /mushrooms Mushinator route and home button; build
   the working editor/upload/processing flow. A JSON contract alone is not an editor.
5. Test real HEIC files ≥15 MB, large photos, the supplied video types, unnamed notes, retries,
   edit/replace/reorder, draft recovery and publication. Record actual results and limitations.
6. Prepare publication/manual Hub swap separately. Do not activate a live route from this plan.
