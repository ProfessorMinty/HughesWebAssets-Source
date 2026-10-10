# Page 17 cutover and current-year separation

Status: implementation prepared; live cutover pending verification. This is the next explicitly authorized step after the separate HUB TEST and archive installation recorded in `classroom-explorations-live-installation-2026-10-10.md`.

Scope: clear temporary 2025–2026 placements from the 2026–2027 Hub dialogs, preserve the complete historical catalog and archive, install the approved Hub on Page 17 at `/hub/`, and repair stale historical child-page return links. No palette or presentation redesign, route moves, child-page deletions, PR merge, Cloudflare/photo-album changes, or Hub Swapper activation.

The canonical authoring now has empty `pastExplorationIds` and `pastTwwlIds`. All three historical explorations and five historical learning stories remain in their original source records; the separate archive still references those IDs. Populated-gallery regression coverage uses an explicitly test-only fixture derived from the archive composition. Production builders never consume that fixture. Canonical empty galleries retain two explanatory states, no unusable filters or zero-count labels, and one previous-year doorway.

Production Page 17 has an authenticated, exact three-field preservation capture in `evidence/classroom-explorations-hub/page17-migration-2026-10-10/`. The native shell seam suppression is now authorized for Page 17 as well as HUB TEST, but only after successful Hub readiness. Failure/loading states retain the native shell, the admin toolbar is not hidden, and other pages are unaffected. The webapp production writer remains disabled (`mayPublish: false`); manual installation approval is not automated-writer activation.

Public read-only backlink inventory: pages 886 (spiders), 674 (butterflies), 413 (mushrooms), and 1043 (Russian winter) have explicit return links to the retired `/classroom-explorations/` path. Those exact links should be changed to canonical `/hub/`, preserving their labels and all other content. Page 906 already has a correct explicit return link; the other managed child pages expose the correct native global Hub menu. The archive's existing return link already points to `/hub/`. No new navigation design or historical page reparenting is required.

Release, CI, CDN, live readback, browser evidence, and completion status will be added after execution; this document does not claim that prepared changes are already live.
