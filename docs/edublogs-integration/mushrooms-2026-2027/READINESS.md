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
- Production preflight verifies exact immutable CDN bytes, at least the supplied four days,
  twelve photos and three videos, every day record, cover membership and public media files.
- The final injection generator refuses to emit paste-ready code until both public delivery
  and the authenticated Mushinator publishing receipts pass. A staged candidate is not a
  successful live import or a production-readiness claim.

## Account handoffs currently blocking completion

1. Chrome's ChatGPT extension previously refused the supplied-file upload because **Allow
   access to file URLs** was disabled. The latest attempt timed out and no media appeared in
   the live Friday draft. Do not bypass the extension or authentication boundary.
2. The deployed Mushinator still reports the missing repo connection and disables Publish day.
   Cloudflare's visible variable/secret table has no `MUSHROOM_GITHUB_TOKEN` or enabled
   `MUSHROOM_PUBLISH_ENABLED`. The existing deployment token is not a repo writing credential.
3. The GitHub token-setup page requires the signed-in owner's **Confirm access / Verify via
   email** step. No verification email was triggered and no token was created or copied.
   The owner's authentication/credential entry must be completed in the browser, not pasted
   into chat, committed to source or included in deployment logs.

The intended least-privilege publishing connection is limited to
`ProfessorMinty/HughesWebAssets-Source` with repository Contents read/write and required
Metadata read, retained in Cloudflare as the encrypted `MUSHROOM_GITHUB_TOKEN`. No unrelated
repository, account, WordPress or Cloudflare permissions are needed.

## Exact continuation after the handoffs

1. Verify the publishing credential and `MUSHROOM_PUBLISH_ENABLED=true` through the existing
   administrator session; confirm Publish day becomes available for a saved, ready-media day.
2. Import the original supplied files into private `hrv-mushroom-journal`, using the existing
   Friday draft and creating Tuesday/Wednesday/Thursday. Keep species and contributor names
   optional. Use the supplied folder grouping, with provisional dates October 30 and November
   3–5; no teacher/student quotations are invented. Choose the inspected close-up covers.
3. Verify JPEG and MOV conversion/upload, actual viewing copies/posters, save/reload,
   cover/reorder/captions and video playback. Run a real valid 15 MB+ HEIC conversion check;
   the prior synthetic 17 MiB transport test does not establish decoder success.
4. Publish all four days from Mushinator. Record actual IDs, revisions and returned Git
   commits in private/public-safe live publisher evidence; original names/keys stay private.
5. Stage and push an immutable release from the final tested code. Run:
   `node tools/verify-mushroom-exploration-publication.mjs CANDIDATE_DIR EXACT_COMMIT VERSION EVIDENCE_JSON`.
   Compare live public day records and CDN assets with the editor and supplied media.
6. Only after successful delivery and live publisher evidence, generate the final field:
   `node tools/generate-mushroom-exploration-doorway.mjs EXACT_COMMIT VERSION EVIDENCE_JSON PUBLISHER_JSON`.
7. Browser-test the generated loader over HTTPS in the Amadeus-shaped host, including
   classroom cards, optional science, small screens, retries, deep links and media cleanup.
8. Stop with the complete `JAVASCRIPT-BOX.js`, `RELEASE-PIN.json` and successful preflight
   evidence. The next action belongs to the new Edublogs page's JavaScript edit window.

The real teacher/projector/pupil trial is a post-install acceptance check. Optional native
read-aloud still needs successful target-browser speech and pronunciation observations;
neither is claimed from automated tests or from the presence of a voice menu.
