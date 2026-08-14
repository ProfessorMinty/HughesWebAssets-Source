# Classroom Explorations Hub clean-baseline preview QA

Date: 2026-08-14
Candidate source phase: pre-publication clean baseline

## Browser environment note

The available Chromium installation is managed with a policy that blocks top-level navigation (`URLBlocklist: ["*"]`). Visual QA therefore used Chrome DevTools Protocol on `about:blank`, injected the exact candidate runtime JavaScript and CSS bytes, installed a real responsive viewport meta tag, and mounted the exact generated runtime manifest. External Zinnia/video resources were replaced with local non-sensitive visual stand-ins only for offline screenshot inspection; renderer DOM/CSS/behavior remained the candidate implementation.

The exact bootstrap was tested separately with localhost subresource fetches. Because `about:blank` is not a secure context and therefore does not expose `crypto.subtle`, the test harness supplied a SHA-256 digest shim mapped to the exact fetched QA bytes. The production bootstrap itself was not modified. This allowed success, missing-content, incompatible-runtime-manifest, and integrity-mismatch paths to be exercised in Chromium.

## Responsive rendering

| viewport | client width | horizontal overflow | renderer state | orientation theater ratio |
|---|---:|---|---|---:|
| 1440 × 1000 | 1425 | no | ready | 1.778 |
| 1180 × 900 | 1165 | no | ready | 1.778 |
| 768 × 1024 | 768 | no | ready | 1.778 |
| 390 × 844 | 390 | no | ready | 1.778 |

At every viewport the rendered content showed:

- `Classroom Explorations` museum entrance;
- Current Exploration `Summer Bloom Adoption Project`;
- Current TWWL `Coming Soon`;
- previous-school-year doorway `2025–2026`;
- eight stable editable `data-hrv-node-id` nodes;
- no runtime exceptions captured by the QA harness.

## Interaction and accessibility checks

- Skip link is first keyboard focus target.
- Reduced Effects is the second keyboard focus target.
- Measured interactive heights were approximately 48.8 px, 49.2 px, and 50.4 px for the skip link, effects control, and Current Exploration CTA respectively.
- Explicit Reduced Effects changes the root state from `full` to `reduced` and computed ambient animation becomes `none`.
- Emulated `prefers-reduced-motion: reduce` also produces reduced effects and `animation-name: none`.
- With a standards-shaped browser storage stub (required because `about:blank` has no persistent origin), the explicit Reduced Effects preference writes `true` and a teardown/remount reads it back as `reduced`.
- Teardown removes the mounted application cleanly; remount returns to `ready`.
- Duplicate renderer initialization returns the same controller and leaves exactly one museum mounted.

## Bootstrap/failure checks

### Valid publication

Result:

- state `ready`;
- repository application mounted;
- native unavailable fallback removed;
- exactly two verified style payloads installed (application + host compatibility);
- no bootstrap console errors.

### Missing content snapshot

A publication pointing to a nonexistent manifest returned HTTP 404.

Result:

- state `unavailable`;
- repository application not mounted;
- friendly Edublogs fallback restored;
- repository styles removed;
- failure reported through the bootstrap diagnostic path.

### Incompatible future runtime manifest

A manifest with `runtimeSchemaVersion: 9.0` was supplied with a correct integrity digest so the compatibility check, rather than the hash check, was exercised.

Result:

- fail closed;
- friendly fallback restored;
- no partial repository application remained mounted.

### Integrity mismatch

A publication intentionally supplied the wrong SHA-256 for `hub.css`.

Result:

- integrity mismatch detected;
- friendly fallback restored;
- no repository styles/application left behind.

## Visual inspection

The clean visual design reads as a museum front lobby rather than a generic card list:

- dark luminous entry foyer with code-native museum doors;
- strong entry/title hierarchy;
- bright Orientation Theater transition;
- botanical Current Exploration spotlight;
- warm illuminated TWWL display case;
- quiet current-year Past galleries that do not fabricate content;
- dark school-year time gallery providing a strong closing room.

Desktop, tablet, and phone screenshots were inspected after the viewport correction. The phone layout stacks the entry, theater, Current Exploration, TWWL, Past galleries, and previous-year room without horizontal scrolling.

## Still reserved for real-host preview

This QA does not pretend to replace the Edublogs-host test. The following remain cutover gates:

- install exact three-block candidate package on a safe Edublogs test page;
- signed-out fetch/render through the actual host/theme;
- confirm Amadeus host-compat rules against real page markup;
- test actual CDN/public GitHub delivery and cross-origin behavior;
- teacher/Poppet visual review;
- Arctic approval before page 17 changes.
