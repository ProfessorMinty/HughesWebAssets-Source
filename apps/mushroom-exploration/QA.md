# Observed draft checks — 2026-11-06

`npm run check:mushrooms` passed: syntax checks, eight source/edit/publication-guard tests,
generated schema/control consistency and the standalone build. No dependency install is
needed for this isolated application. Standalone preview size: 466,003 bytes, including
its optimized 285,228-byte WebP artwork, source data, SVG models, styles and JavaScript.

## Full viewport breakout

Checked in Chrome using the internal screen-size harness. These are CSS viewport checks,
not claims about physical devices. Each viewport showed state `ready` and nine stable blocks.
The root started at x=0; its width equalled available client width, excluding the scrollbar.

| CSS viewport | Root width | Horizontal page overflow |
| --- | ---: | ---: |
| 1920 × 911 | 1905 px | 0 px |
| 1366 × 768 | 1351 px | 0 px |
| 820 × 1180 | 805 px | 0 px |
| 390 × 844 | 375 px | 0 px |
| 320 × 640 | 305 px | 0 px |

An additional descendant-bounds check at 320 px found no exhibit element outside the
available document width. The standalone page was also inspected outside the harness:
edge-to-edge root, no review toolbar by default, no horizontal overflow.

## Interactive observations

- Selecting Gills changed the observation text/pressed state and faded the cap to reveal
  the gill model. All five observation controls are keyboard-operable buttons.
- Grow the threads switched to Below the surface and ran the finite SVG branch drawing.
- Release spores created 36 model particles. Their positions advanced from the gills;
  Pause model stopped the run. Moving the slider to its left endpoint changed the output
  to “Breeze to the left · 100%”.
- Turn out the lights changed the light-lab state to night and displayed illustrated glow.
- Play model sound showed its playing state; Stop sound restored the off state. Scrolling
  to a discovery answer while the sound was playing also restored the off state. This
  checks application control state and cleanup, not a calibrated audio measurement.
- Both choices in the safety question produced appropriate explanatory feedback.
- Application-filtered warning/error logs were empty during inspection. Browser-extension
  metadata errors were present under a chrome-extension URL and are separate from this app.

The draft has not been installed in live Edublogs or tested against the exact live DOM,
on Safari/Firefox, or with a screen reader. The preview uses an Amadeus-like ancestor
simulation. Publication, actual classroom content and the Mushinator editor remain later work.
