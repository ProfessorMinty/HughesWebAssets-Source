# Production Hub doorway — Page 17

The Mushroom feature update is prepared and verified, but **has not been installed in Edublogs**. The Page 17 editor is at the sign-in screen. See the [current installation record](../../../evidence/classroom-explorations-hub/mushrooms-feature-2026-11-07/README.md).

Target: `https://rmhughes.edublogs.org/hub/`, WordPress Page 17, Full width template. Generated package: immutable asset commit `56623f31610fb964421989e172dd49f0b7b8c9cb`, runtime `2026.11.07.3`, publication `pub-2026-11-07-003`, source `a97a838751611b8e98f714f307c933467af6606e`.

This update features Mushroom Explorations at `/hub/mushrooms/` (Page 2662), selects YouTube video `7IZ-Fek2kzE`, and moves Summer Bloom Adoption Project into Past Explorations for 2026–2027. Historical Mushroom Page 413 remains separate.

`HTML-BOX.html` and `CSS-BOX.css` are byte-identical to the previous production package. After signing in, capture the actual Page 17 editor fields and replace only its JavaScript field with `JAVASCRIPT-BOX.js`. Preserve page identity and unrelated fields. `HOST-COMPATIBILITY.css` is release evidence, not a fourth editor field.

Production generation requires the captured Page 17 preservation fields, successful 16-file CDN byte evidence, immutable commit binding, and exact agreement with the current approved source and routes. It does not write to Edublogs or enable Lanternworks publishing.

```text
node tools/generate-classroom-explorations-hub-doorway.mjs 56623f31610fb964421989e172dd49f0b7b8c9cb 2026.11.07.3 pub-2026-11-07-003 evidence/classroom-explorations-hub/mushrooms-feature-2026-11-07/cdn-verification.json production
```

The last live-observed package remains commit `d819f5c1493e725624a09adcbf0de258aa88bd8f`, runtime `2026.10.10.3`, publication `pub-2026-10-10-003`. That is this update's previous known good publication. Its prepared rollback JavaScript is retained with the current evidence; capture the actual editor value before updating.

The [2026-10-10 cutover record](../../classroom-explorations-page17-cutover-2026-10-10.md) and original preservation files remain historical evidence for that installation.
