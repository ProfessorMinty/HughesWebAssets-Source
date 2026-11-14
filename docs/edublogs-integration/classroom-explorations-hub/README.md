# Production Hub doorway — Page 17

Page 17 reads the production channel through the selector installed November 14, 2026. For content changes and restores, use the [Studio Hub Swapper runbook](https://github.com/ProfessorMinty/lanternworks-hrv-studio/blob/feature/hub-live-production-2026-11-14/docs/HUB-SWAPPER-PUBLICATIONS.md). The installation and live swap/restore are recorded in the [November 14 live publication receipt](https://github.com/ProfessorMinty/lanternworks-hrv-studio/blob/feature/hub-live-production-2026-11-14/ops/hub-swapper/2026-11-14/live-publication.json).

## Historical October 10 fixed doorway

These files record the October 10 installation on WordPress Page 17, Full width template, at `https://rmhughes.edublogs.org/hub/`. That package used asset commit `d819f5c1493e725624a09adcbf0de258aa88bd8f`, runtime `2026.10.10.3`, publication `pub-2026-10-10-003`, and source `be5836526e02212dd693a13cf9abc6a53b8501e0`.

The October build checked the captured Page 17 fields, 16 CDN files, the immutable commit, and the then-empty current-year galleries. Its three editor fields were `HTML-BOX.html`, `CSS-BOX.css`, and `JAVASCRIPT-BOX.js`. The accompanying `HOST-COMPATIBILITY.css` records the published stylesheet.

```text
node tools/generate-classroom-explorations-hub-doorway.mjs d819f5c1493e725624a09adcbf0de258aa88bd8f 2026.10.10.3 pub-2026-10-10-003 evidence/classroom-explorations-hub/page17-migration-2026-10-10/cdn-verification.json production
```

The October publication recorded `pub-2026-10-10-002` as its preceding publication. Its pre-cutover HTML, CSS and JavaScript are archived in `evidence/classroom-explorations-hub/page17-migration-2026-10-10/`. See the [October cutover record](../../classroom-explorations-page17-cutover-2026-10-10.md).
