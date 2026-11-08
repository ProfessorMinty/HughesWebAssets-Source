# Mushroom page — pre-injection checkpoint

November 7, 2026. **Not ready to paste into Edublogs yet.** Arctic authorized completing
all preparation and stopping immediately before writing the new page's JavaScript field.
No new Edublogs page, injection, slug, parent relationship or Hub swap has been written.
Historical mushroom Page 413 remains separate.

## Completed code preparation

- Classroom journal first; both science exhibits follow inside an optional disclosure.
- Journal request deadlines, recoverable index/day loading, direct Retry, real calendar-date
  checks and correctly changing Open/Close labels. Duplicate toggle notifications do not
  accidentally retry a failed request.
- A release builder produces a reviewed source copy and one bundled runtime, preserves real
  source media/licences, and records each release file's SHA-256 and exact byte count.
- A pinned bootstrap verifies the manifest and every release file before importing the
  verified module and applying styles. Failures preserve the native page and friendly fallback.
- The JS-field doorway creates its own semantic mount and minimal fallback styles. It does
  not require arbitrary layout code in the WordPress page body or overwrite unrelated content.
- Production preflight verifies exact immutable repository bytes, at least the supplied four days,
  twelve photos and three videos, every day record, cover membership and public media files.
- The final injection generator refuses to emit paste-ready code until both public delivery
  and the authenticated Mushinator publishing receipts pass. A staged candidate is not a
  successful live import or a production-readiness claim.

## Account handoffs currently blocking completion

1. **Upload permission is now confirmed working.** The owner enabled Allow access to file
   URLs, and the browser chooser successfully selected both original Friday JPEGs. Mushinator
   then displayed `Invalid input` for each file before either appeared in the gallery. The
   cause is not yet established. The attempted file paths belong to the Linux workspace,
   whereas the connected Chrome selects files from the owner's Windows computer. Real local
   file availability must be verified before attributing the rejection to the application.
   No successful original storage, conversion or gallery import is claimed from selection.
2. **Publishing configuration is now applied and verified.** Cloudflare production shows
   `MUSHROOM_GITHUB_TOKEN` encrypted and `MUSHROOM_PUBLISH_ENABLED=true`. A fresh authenticated
   `/api/mushrooms/snapshot` navigation returned `publisherReady:true`, four saved days and zero
   media. This establishes installed configuration, not a successful GitHub publication receipt.
3. GitHub owner verification has completed. At the latest inspection, the creation form
   still had Only select repositories checked but its picker/selected repository had disappeared.
   Toggling the draft selection restored the picker; HughesWebAssets-Source was reselected and
   Contents read/write plus required Metadata read were restored and visibly verified. The
   agent did not submit Generate token or create/copy a credential. Whether this repair resolves
   the owner's scroll-without-token symptom still requires the owner's next Generate attempt.
   Private credential entry/submission remains in the owner's browser.

The GitHub credential was subsequently created by the owner. Using the explicitly authorized
existing credential, the agent completed the Cloudflare production secret/flag submission.
The dialog closed and the token row displayed Value encrypted. No credential is included in
repository files or this checkpoint. Earlier blank-dialog and owner-generation notes are history.

All four private drafts now exist and survived a reload: Friday October 30, Tuesday November
3, Wednesday November 4 and Thursday November 5. Their short titles/stages describe the
supplied photo groups. Species and contributor names remain blank; no teacher/student
quotes or classroom media have been added. The dates remain provisional.

The intended least-privilege publishing connection is limited to
`ProfessorMinty/HughesWebAssets-Source` with repository Contents read/write and required
Metadata read, retained in Cloudflare as the encrypted `MUSHROOM_GITHUB_TOKEN`. No unrelated
repository, account, WordPress or Cloudflare permissions are needed.

## Exact continuation after the handoffs

1. Publishing presence is verified. Confirm real repo writing by publishing only after the
   supplied classroom media is imported, ready, saved and previewed.
2. Obtain the actual Windows path to the extracted original Pics folder. The browser download
   route to ChatGPT is blocked by browser host policy; do not retry it through another host or
   surface. Select real local originals through the existing browser chooser, then trace the
   `Invalid input` failure further only if it persists with valid nonempty local files.
   Then import the original supplied files into private `hrv-mushroom-journal`, using the existing
   four saved drafts. Keep species and contributor names
   optional. Use the supplied folder grouping, with provisional dates October 30 and November
   3–5; no teacher/student quotations are invented. Choose the inspected close-up covers.
3. Verify JPEG and MOV conversion/upload, actual viewing copies/posters, save/reload,
   cover/reorder/captions and video playback. Run a real valid 15 MB+ HEIC conversion check;
   the prior synthetic 17 MiB transport test does not establish decoder success.
4. Publish all four days from Mushinator. Record actual IDs, revisions and returned Git
   commits in private/public-safe live publisher evidence; original names/keys stay private.
5. Use the already verified immutable candidate below if the code remains unchanged;
   otherwise stage and push a new version from the final tested code. Run:
   `node tools/verify-mushroom-exploration-publication.mjs CANDIDATE_DIR EXACT_COMMIT VERSION EVIDENCE_JSON`.
   Compare live public day records and CDN assets with the editor and supplied media.
6. Only after successful delivery and live publisher evidence, generate the final field:
   `node tools/generate-mushroom-exploration-doorway.mjs EXACT_COMMIT VERSION EVIDENCE_JSON PUBLISHER_JSON`.
7. Complete the classroom-loaded browser test of the generated loader over HTTPS in the
   Amadeus-shaped host, including
   classroom cards, optional science, small screens, retries, deep links and media cleanup.
8. Stop with the complete `JAVASCRIPT-BOX.js`, `RELEASE-PIN.json` and successful preflight
   evidence. The next action belongs to the new Edublogs page's JavaScript edit window.

The real teacher/projector/pupil trial is a post-install acceptance check. Optional native
read-aloud still needs successful target-browser speech and pronunciation observations;
neither is claimed from automated tests or from the presence of a voice menu.

## Delivery verification finding

The initial jsDelivr snapshot passed its byte comparison, but the next repository snapshot
crossed jsDelivr's configured **50 MB package limit** and returned HTTP 403 for release
assets. The raw.githack review host returns HTTP 301 for binary assets, which the strict
loader intentionally refuses. Neither result is treated as successful page startup.

The current loader instead reads exact-commit `raw.githubusercontent.com` release files.
The JS doorway verifies bootstrap bytes before creating a typed script Blob; that bootstrap
verifies the pinned manifest and all files before importing the typed runtime Blob and
applying styles. Correct JavaScript/CSS MIME types from a third-party CDN are therefore not
a dependency. Both executable code and styles remain owned by the repository. Earlier
release candidates remain preserved; they are not silently overwritten or accepted.

## Verified candidate and remaining acceptance

- Candidate `2026.11.07.3`, immutable commit
  `c151050bf54c8ed5ebba48d1a701106ce9b008a6`: all **21** public release files returned HTTP
  200 and matched local byte counts and SHA-256. The proof is stored in
  `apps/mushroom-exploration/qa/release-v3-delivery-verification.json`. Its historical
  `cdnVerified` property means delivery-byte verification; `classroomVerified` is false.
- The exact JS-window doorway was exercised in the HTTPS review host at commit
  `3899e6221c2f955bb429d6bdaf69d36c9dea359f`. Connected Chrome reached `ready`, loaded two
  verified styles, kept the journal first and optional science closed, and showed no
  horizontal overflow at the actual **1920×855** viewport. Fungi up close opened and all
  three family photographs loaded; journal navigation returned and closed science.
- `npm run check:mushrooms` passes **75** tests plus syntax, consistency, source integrity
  and build checks. The push and pull-request Mushroom workflows and both affected Hub/
  Archive PR workflows passed at the review-host commit. That does not prove a live journal
  publish or an Edublogs installation.
- The live public journal is still empty. Public classroom files, saved-media conversion/
  playback and authenticated publishing receipts are mandatory gates before final injection
  generation. No paste-ready `JAVASCRIPT-BOX.js` or ready-to-paste pin has been emitted.
