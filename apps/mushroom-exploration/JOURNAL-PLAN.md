# Classroom growing journal — working plan

November 7, 2026. New journal phase authorized by Arctic. Planning and supplied-media
review at this point; the renderer/uploader below are not yet implemented. The prior
museum checklist remains 44/46 with its two existing acceptance items open.

## Agreed requirements

- A framed, collapsible entry for each observation day.
- Collapsed: day/date, an editable stage label or short stage sentence, and a cover picture.
- Open: that day's photographs/videos, captions/observations and any optional content cards.
- The journal centers on the classroom's experience: what the class did, saw and noticed.
  Facts are optional additions, not the purpose of every entry or a prerequisite to building.
- One Mushinator “＋ Add to this day” menu offers Photo or video, Observation, Fact,
  Teacher note and Student note. All text-card types are optional and repeatable.
- Teacher and student cards have optional author credits. Fact cards may have an optional
  heading and source link. No forced contributor name, species or scientific-report template.
- An optional mushroom-type field may be filled in or corrected later; an unknown species
  must not block creating, editing or publishing a journal entry.
- No required contributor name. Blank author names are valid for both teacher and child notes;
  omit an author credit when blank. Notes may be anonymous without a fabricated name.
- Accept original large media, explicitly including HEIC photographs of 15 MB or more and
  video. Automatically convert and optimize for viewing; do not require manual resizing.
- No arbitrary small-file, per-day media-count or contributor-name restriction in the product.
  Real service/decoder limits must be discovered and handled rather than promised away.
- Work from actual supplied media and words; do not invent species, dates, observations,
  teacher statements or pupil quotations. Child notes retain the supplied wording.
- Review media chronologically. Arctic supplied all four day folders in one ZIP; do not
  request those batches again.
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
3. Optional content cards: observations, facts, teacher notes and student notes. Use the
   teacher's chosen order; supporting text cards can share desktop columns and stack on
   phones. Empty cards and categories are omitted. No default notes or invented quotations.
4. Optional additional evidence, such as a photograph of a handwritten pupil observation,
   measurement or comparison. No required measurement, prediction or conclusion template.

The optional cards should look like coordinated parts of the field journal, with readable
warm text, modest borders and clear labels. A small icon and text label distinguish each
kind without relying on color alone. Proposed treatments: leaf detail for Observation,
small gold “Did you know?” tab for Fact, warm amber annotation edge for Teacher note and
cyan/teal speech detail for Student note. Keep the existing moss/bark/teal palette; avoid
large competing decorations or a separate oversized section for every note. Final contrast,
spacing and thumbnail crop need visual review at 1920×911 and on phones.

Use the calendar day/date, not an assumed Day 1 of growth. The first available photograph
may have been taken after the kit was already growing. A numbered observation is possible
once the sequence is established; elapsed growth days require a confirmed start date.

Load gallery media only when needed; collapsed entries should not download every photograph
and video. Keep the day index small, and load longer notes/gallery records separately as
the history grows, rather than treating the existing source-JSON bound as a media upload limit.

Stage wording is editable free text, with optional suggestions after media review. The
latest published observation can supply the journal's current-stage summary, avoiding two
independent copies that disagree. Do not present a species inferred from photographs as
confirmed. A visual comparison suggested probable shiitake; retain that only as a tentative
planning identification. Public wording can remain “our mushrooms” until a type is confirmed.

## Proposed Mushinator workflow

One Add day screen: choose date → add the original files → review/reorder media and choose
cover → set the stage wording → optionally use “＋ Add to this day” → preview → publish.
Save unfinished work as a draft. Reopen a day to add more media, change its cover, replace
media, edit content cards or correct its date/stage without changing its stable identity.

The add menu belongs in the authenticated editor, not the public classroom page:

| Choice | Content | Optional extras |
| --- | --- | --- |
| Photo or video | Original uploads, converted for the gallery | Caption; select as cover |
| Observation | What changed, what the class did or what someone noticed | Heading |
| Fact | A short supporting science fact | Heading; source link |
| Teacher note | Teacher reflection or context | Name/display credit |
| Student note | Supplied pupil words or reflection | Name/display credit |

Choosing a type opens a compact inline composer with a preview of the resulting card.
Allow multiple cards of the same type. Each saved card has Edit, Move up, Move down and
Remove controls; drag reordering may supplement keyboard-accessible move buttons. Preserve
stable card IDs when reordering or editing. Keep text through type selection and draft save;
removal should offer Undo. The preview and public view hide all editor-only controls.
Do not require a fact or note before saving a day that already contains its actual media.

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

## Supplied media intake

Arctic supplied Pics.zip with four ordered weekday folders. Extraction preserved all folders;
12 JPEG photographs passed image verification and all 3 MOV videos decoded without errors.
Photographs and sampled video frames were visually reviewed. No files were published.

| Supplied folder | Working calendar date | Media | Proposed observation wording |
| --- | --- | --- | --- |
| 01Friday | October 30, 2026 | 2 JPEG | Our growing station |
| 02Tuesday | November 3, 2026 | 3 JPEG | Looking closer at the growing block |
| 03Wednesday | November 4, 2026 | 4 JPEG + 1 MOV | Small mushrooms are visible |
| 04Thursday | November 5, 2026 | 3 JPEG + 2 MOV | More developed mushroom caps |

Dates remain working assignments from the folders and Arctic's sending-date context.
The large sticky note in Wednesday's B1C1B4BC photo visibly reads 11/03/26 and 11/04/26.
Thursday's 69377AA7 photo also shows 11/04/26. These support the November 2026 timeline,
but a retained, multi-date note is not a unique capture timestamp for each image. No original
capture dates were found in the inspected metadata. Keep these distinctions in authoring
records; do not put internal evidence commentary into the children's page.

Friday's clearer close-up (3F68316F photo) is the proposed cover; the enclosure view is
supporting context. Wednesday and Thursday mushroom close-ups are strong cover candidates.
No teacher or pupil text has been supplied; leave those optional blocks empty until it is.

All videos contain H.264 video and AAC audio tracks. Wednesday's video is about 6.3 seconds;
Thursday's are about 9.8 and 9.5 seconds. The audio has not been reviewed/transcribed, so do
not invent spoken captions. Check full playback/audio before public release. Consider MP4
remuxing if the actual streams are web-compatible rather than automatically recompressing.
This ZIP contains JPEGs, not HEIC, and does not test the requested 15 MB+ HEIC capability.

## Build order

1. Supplied-day visual intake is complete; preserve the inventory and review video audio
   before publication. Do not wait for a mushroom-type answer to start the journal.
2. Extend the current zero-entry journal contract with stable day/media/content-card records,
   optional authors/type/facts, draft/publication state and editable stage/date/cover. Add the
   shared add-menu types, card editing/reordering and optional source link. Regenerate schema/control
   descriptions together. Preserve existing page/block identities and the Edublogs injection.
3. Build the public compact day-card accordion and full-width expanded gallery/notes against
   real supplied content. Verify keyboard, phone layout, image inspection and media cleanup.
4. Inspect and wire the actual Lanternworks /mushrooms Mushinator route and home button; build
   the working editor/upload/processing flow. A JSON contract alone is not an editor.
5. Test real HEIC files ≥15 MB, large photos, the supplied video types, unnamed notes,
   adding/editing/reordering each optional card type, empty-section hiding, retries,
   edit/replace/reorder, draft recovery and publication. Record actual results and limitations.
6. Prepare publication/manual Hub swap separately. Do not activate a live route from this plan.
