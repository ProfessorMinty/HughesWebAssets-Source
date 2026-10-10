# HUB TEST and 2025–2026 archive: live installation

Date: 2026-10-10. Checkpoint status: both initial authorized Edublogs installations completed and verified. Page 17 and historical child-page backlinks were unchanged at this checkpoint. **Later same-day cutover completed:** Page 17 now runs the approved Hub, current-year placeholders are cleared and four stale backlinks are repaired; see [the current cutover record](classroom-explorations-page17-cutover-2026-10-10.md). Publication-002 evidence below is historical, not the newest Hub pin.

## Installed identities

| Destination | Asset commit | Runtime | Publication |
| --- | --- | --- | --- |
| HUB TEST, Page 2589, `/hub-test/` | `f2381f5b9e284e87e17c3b45b25f381a55663c1c` | `2026.10.10.2` | `pub-2026-10-10-002` |
| Archive, Page 2627, `/hub/archive-2025-2026/` | `9deaf1723109c5259b5813d271a23d336d68559d` | `2026.09.12.1` | `pub-2026-09-12-001` |

Hub source is `4e1631c45aefcd3b9d637e7760cc89ea8a05bb08`; previous known good is `pub-2026-08-31-002`. Archive source is `1ab0b4dfa9c339e58583c454816193e5247f6c1c`; this is its first repository-native publication. Existing content snapshots and approved imagery were preserved. No palette or further visual redesign was performed.

The computer-use skill was used for the authenticated editor installation and live checks. Only the positively beacon-identified existing Yumii Chrome-Control browser was used. HTML, CSS, and generated JavaScript were saved together on each page; the editor then displayed its updated confirmation. Reloaded editor fields were exported, not inferred from the local package. Page templates were retained.

## Restoration and saved-field verification

Exact pre-installation editor fields are preserved under:

- `evidence/classroom-explorations-hub/pre-install-2026-10-10/`
- `evidence/classroom-explorations-archive/pre-install-2026-10-10/`

They were checked against the current editor immediately before replacement. Restore all three original fields together, retaining the original page template, if rollback becomes necessary. A rollback was not executed or certified.

Saved fields and `installed-doorway-verification.json` are in each application's `release-2026-10-10/` evidence directory. WordPress normalized HTML formatting and empty-attribute serialization, and removed trailing field newlines. HTML DOM structure/attributes/text passed semantic comparison; CSS and JavaScript passed exact comparison after trailing-newline normalization. Raw saved-field hashes remain separate from source hashes. Git attributes preserve exported editor and public-HTTP bytes.

`node tools/verify-edublogs-installed-doorways.mjs` passed for both pages. Its unauthenticated HTTP GETs returned 200 and contained the exact installed asset commit, publication, and bootstrap SRI. This is public-delivery proof, not a signed-out browser-rendering test; the user's browser was not logged out.

## Immutable delivery and CI

The October CDN reports record 16 of 16 Hub and 14 of 14 archive files returning 200 and matching their exact committed blob bytes. Doorways use full immutable commit IDs and bootstrap SRI. The Hub doorway generator requires the matching 16-file CDN proof before producing the JavaScript and pin record.

Exact Hub asset-commit CI passed: [push 38081902272](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/38081902272), [PR 38081905400](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/38081905400), and [shared archive checks 38081905343](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/38081905343). Doorway-generator commit `d69044cf2bcff35251bf23a315a6de2e2fdf0856` also passed [push Hub 38082174053](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/38082174053), [PR Hub 38082178368](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/38082178368), and [archive 38082178362](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/38082178362).

Downloaded exact-asset-commit CI bundles under the Hub `ci/` evidence directory contain 57 Linux and 67 Windows checks, with five screenshots per platform. Windows passed native Chrome zoom at 80%, 100%, 125%, 150%, and 200% in desktop and 150%-display-metrics-proxy scenarios. Linux native accelerator zoom was not run. Physical Windows monitor scaling remains unverified: DPR/device-metric emulation is not an OS settings test. CI media policy allows truthful unavailable states; real-host image loading was checked separately.

## Live browser results

Hub `live-responsive-and-dialogs.json` records measured CSS viewports 1920×911, 1920×820, 1366×768, 980×911, 390×844, and 320×640. Every checkpoint reached `ready`, had zero document horizontal overflow, zero measured card scrolling overflow, and equal archive-door heights. All six frame images, the Zinnia subject image, and three history-button images loaded.

At 1920×911 the primary cards were equal, approximately 929×480px. TWWL was approximately 1557.7×300px; the three doors were approximately 300.3×93.3px. The signed-in WordPress toolbar adds 32px: TWWL ends near y=941.7, equivalent to y=909.7 after accounting for that toolbar. The live 1920×911 screenshot truthfully shows the signed-in bottom-edge difference; it is not presented as public-browser fit. The restored natural browser measured 2195×1010, DPR 1.75, and scrollY 0; `live-normal-browser.jpg` shows the complete composition. Temporary viewport overrides were reset.

Past Explorations opened with three entries; a no-match filter showed zero with an explicit message. Escape closed it and restored launch-button focus. Past TWWL opened with five entries and all five images loaded. Past Years linked to the installed archive's exact canonical URL. The welcome YouTube iframe loaded; playback was not tested.

Archive `live-responsive.json` records desktop, tablet-width, and phone-width states with zero horizontal overflow, eight entries, and six absolutely positioned frame pieces. All 15 archive images loaded. Butterflies is the destination/label, not the stale Caterpillars route. Both filters, clearing, and no-results messaging passed. Archive return controls point to `https://rmhughes.edublogs.org/hub/`. The archive is a scrolling collection page, not a one-screen Hub.

Screenshots: Hub `live-desktop-1920x911.jpg` and `live-normal-browser.jpg`; archive `live-desktop-verified-view.jpg`. Capture-calibration failures were retained outside accepted repository evidence at `outputs/capture-calibration-2026-10-10/`; no material evidence was deleted. The rejected local `2026.10.10.1` publication remains quarantined at `outputs/rejected-hub-release-2026-10-10-001/`, was never pushed, and was never installed.

## Next gate, not performed

The old 2025–2026 placeholder entries still remain in HUB TEST's current-year history dialogs. Clear/migrate those placements and verify truthful empty Past Explorations/Past TWWL states before copying the Hub to Page 17. Historical content is now preserved in the installed archive; do not delete its source records or child pages. Then prepare the Page 17-specific doorway and repair historical child-page backlinks. Hub Swapper/Lanternworks writes remain later work; the presentation rubric still needs machine-readable policy binding. No PR was merged, no Cloudflare/photo-album system was changed, and no historical child page was edited.
