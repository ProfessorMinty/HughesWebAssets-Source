# Mushroom Hub feature update

Status: **installed and live-verified on 2026-11-07 (America/New_York; 2026-11-08 UTC)**. The user completed WordPress sign-in, and the verified JavaScript was saved to Page 17. The prior sign-in handoff is resolved.

| Slot | Installed value |
| --- | --- |
| Current school year | 2026–2027 |
| Current Exploration | Mushroom Explorations |
| Explore Now | https://rmhughes.edublogs.org/hub/mushrooms/ |
| WordPress identity | Page 2662, parent Page 17 |
| Hub video | https://www.youtube.com/watch?v=7IZ-Fek2kzE |
| Video title | The life of the forest. Fungi |
| Past Explorations, this year | Summer Bloom Adoption Project (Zinnias), Page 2463 |

The new Mushroom page was observed live with four classroom days. Historical Mushroom Page 413 remains the separate 2025–2026 exhibit. Current TWWL, Past TWWL, previous-year archive, page shell and navigation are preserved.

## Release and verification

- Approved source: `a97a838751611b8e98f714f307c933467af6606e`.
- Asset delivery: `56623f31610fb964421989e172dd49f0b7b8c9cb`.
- Runtime: `2026.11.07.3`; publication: `pub-2026-11-07-003`.
- Content snapshot: `sha256:0040c5ad502100bad876ddaa40a1c8591579b2618cfc2f66e3033642eb116002`.
- Preview source: `478cd7818fe3071712275335b6c67c516d1c6343`.
- Previous known good: `pub-2026-10-10-003` at `d819f5c1493e725624a09adcbf0de258aa88bd8f`.

`cdn-verification.json` records all 16 successful HTTP GETs, exact byte counts and SHA-256 verification against committed files. Source ancestry and earlier immutable releases are verified. The generated JavaScript has SHA-256 `ba9aec642806cbf56173ce033b07f0147135bd79235b3806b07954578788e71f`.

Final release CI passed at `478cd7818fe3071712275335b6c67c516d1c6343`: [Hub](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/42440477812), [Archive](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/42440477775), and [Mushrooms](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/42440477732). The Hub run includes Linux repository/contract/build/publication/browser checks and Windows native zoom/responsive checks. Job snapshots are in `ci-verification.json`.

Connected Chrome loaded the final publication and reached `ready`. The fungi iframe uses `https://www.youtube-nocookie.com/embed/7IZ-Fek2kzE`; its thumbnail/title rendered. The classroom cover loaded at 480 × 640, and Explore Now links to the new page. Past Explorations opens one Zinnia exhibit with the 2026–2027 label and original revisit link. At 320 × 640, the featured card and title have zero horizontal overflow. Viewport overrides were reset. Screenshots are **preview evidence**, not live installation evidence.

The longer title exposed a narrow-phone layout limitation. Flexible columns now permit shrinking, the text column has `min-width: 0`, and the title scales/wraps on phones. Browser assertions retain their original tolerances and include measured failure details. Candidate publications `pub-2026-11-07-001` and `pub-2026-11-07-002` are retained as unused candidates and must not be installed.

The asset-delivery branch retains the previous production delivery tree plus added immutable releases, with the approved source in its ancestry. The full canonical Source tree is preserved separately. This keeps the delivery snapshot below jsDelivr's repository size limit; it is not a canonical cleanup.

## Completed installation

1. Captured the actual authenticated HTML, CSS and JavaScript fields before editing. `page17-editor-capture.json` preserves the exact before/after values; individual files are included for restoration. `previous-release-JAVASCRIPT-BOX.js` remains the earlier prepared rollback reference.
2. Replaced only the JavaScript field. Before applying, verified that the prepared code differs from the actual prior code in only the three immutable release pins (plus its trailing newline). Applied the dialog Update, then the normal page Save.
3. Reloaded the authenticated editor and reopened all three code fields. HTML and CSS match their pre-update values exactly. The saved JavaScript matches the generated package after ignoring its trailing newline.
4. Opened the public Hub URL and observed `ready` with the exact new bootstrap/publication URLs. The Mushroom cover loaded, the fungi iframe/thumbnail matched video `7IZ-Fek2kzE`, and Past Explorations showed Zinnias with the 2026–2027 badge and original link. Clicked Explore Now and verified Page 2662 reached `ready` with all four journal days, then returned to the Hub.

`live-installation.json` contains the installation receipt and field digests. `live-desktop.jpg` and `live-past.jpg` show the actual Edublogs Hub. Earlier `preview-*.jpg` images remain candidate-preview evidence.

Lanternworks production publishing remains disabled. No publishing gate, historical exhibit page, Zinnia content, or Mushroom page injection was changed during this Hub update.
