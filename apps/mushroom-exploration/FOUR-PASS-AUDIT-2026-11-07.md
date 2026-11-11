# Four-pass audit — November 7, 2026

**Result: three code issues found and corrected. 55 automated tests and 55 activity/layout
cases pass. All three GitHub CI workflows pass. The exhibit remains 44/46, with M41 and M46
explicitly open.** This audit does not create a classroom-tested or published release.

[Open the corrected HTTPS review](https://raw.githack.com/ProfessorMinty/HughesWebAssets-Source/ea261ba8a25984a026c36ae20381dd88942d5079/apps/mushroom-exploration/review.html).
Code: remote `ea261ba8a25984a026c36ae20381dd88942d5079`, local `f37eb444245cd3ea85415cc7a303cfd769a6823b`,
identical tree `510ef8df452fcec21e093c4dbbc7cdc6bdf8737b`. Audit baseline: remote
`2649ffd52511e56f24fd679ed2366866428adf47`, local `42da0b9`, tree `13d1acc51be12540b7555d1929ce4001c8bf8034`.

## Pass 1 — Requirements, architecture and scope

Compared the latest work against the fixed requirements and original acceptance wording.
All **130 source identities**, nine source blocks, year, route/page identities and viewport
contract are preserved against the reading-batch baseline. Source remains scaffold/research
pending; the journal contains no invented entries or stage. No live Hub registry, Edublogs
injection, production bootstrap, asset bytes, permissions or dependency set changed.

The two-station journey and teal/bark/moss families are unchanged. M33’s real-example claim
has provenance, permitted embedding, sensor/artistic-choice/unknown-processing explanation
and actual in-exhibit playback evidence. The canonical checklist contains exactly 46 IDs:
44 checked; only M41 and M46 unchecked. Automated tests do not substitute for those gates.

## Pass 2 — Code, failure paths and cleanup

| Finding | Severity | Correction | Verification |
| --- | --- | --- | --- |
| review.html statically imported its runtime before its catch block; a failed import could leave Opening indefinitely. Styles and startup had no bounded acceptance. | Medium | Dynamic import inside the guarded pipeline; wait for both styles; 12-second timeout; abort fetch, remove failed styles, show fallback and ignore late results. | Unit cases for module/style failure, timeout/late result, invalid/oversized source and successful style-gated mount; actual missing-module/source pages show fallback. |
| New reading-failure/start/character/time attributes remained on the root after destroy or rollback. | Low | Shared root restoration clears all owned reading attributes in both cleanup paths. | Actual unmount removes six reading attributes and the ready state; remount restores nine blocks and exactly two reading toolbars. |
| Utterances retained en-US even after choosing an en-GB voice. | Low | Set utterance language from the selected voice. | Regression verifies the chosen UK voice object and en-GB tag; native UK choice exercised without claiming successful speech. |

`npm run check:mushrooms` passes **55 tests**, syntax, generated contract/schema/control
consistency, original media integrity and standalone build. `git diff --check` passes. The
review unit harness substitutes the dynamic-import dependency; actual browser failures were
also checked rather than claiming that the substitute itself tests network delivery.

Premature speech end remains an error, not a completion claim. Its one-second long-text
floor is an application sanity check, not a reading-speed standard. Player polling, retry,
close, stale callbacks and no-autoplay behavior retain their tests.

## Pass 3 — Actual browser and responsive behavior

All eleven activities at each of five reference sizes: **55 cases, zero failures**. Each
case had zero horizontal overflow, two active station panels, and visible custom controls
at least 44×44 CSS px. Third-party/native player controls are outside that custom-size claim.

| Viewport | Player client area | Page overflow |
| --- | --- | --- |
| 1920×911 | 718×403 | 0 |
| 1366×768 | 718×403 | 0 |
| 820×1180 | 712×400 | 0 |
| 390×844 | 291×200 | 0 |
| 320×640 | 229×200 | 0 |

The corrected review opened over HTTPS in connected Chrome. The real embedded video
reported playing and advanced to **19.117496 seconds**, duration 235.681 s, readyState 4,
paused false and muted false. Pause later held at **47.110668 seconds**. Leaving the activity
removed the player. Screenshot: [actual playing footage](qa/four-pass-video-proof.jpg).
Auditory quality is not independently certified.

The selected UK voice still ended before speech start. At a 320 px viewport, the actual
recoverable error wrapped inside 265 px, with zero page overflow. The temporary viewport
override was reset. This verifies failure handling and layout, not speech or pronunciation.

Default desktop geometry is unchanged: page about **2737 px**, journal **y2382.95 px**,
stations **904.23/868.39 px**. Actual startup-failure fixtures removed their styles and
showed a readable fallback; late loading cannot revive a timed-out review.

## Pass 4 — Saved source, CI and evidence truth

Local and remote correction trees match exactly. PR #24 remains open/draft/unmerged.
The current preview link pins the corrected code; previous dated evidence keeps its own
original revision. Current README, QA, checklist and handoff are updated together.

| GitHub workflow on corrected code | Run ID | Result |
| --- | --- | --- |
| Mushroom exhibit draft | 42345478520 | Success |
| Classroom Explorations Archive CI | 42345478760 | Success |
| Classroom Explorations Hub CI | 42345478476 | Success |

One evidence-format discrepancy was also found: older browser screenshots named .png
contain JPEG bytes. They decode correctly and remain intact as historical records. The
new proof uses the correct .jpg extension; no image content is altered. The browser’s DOM
bridge did not expose link.sheet reliably, so that readout is not used as proof of missing
styles; rendered layout, the actual load/failure paths and screenshots are the evidence.

Detailed captures: `qa/four-pass-browser.json`, `qa/four-pass-verification.json`.
Earlier 200% zoom, contrast and image-overlay reports remain dated prior evidence. This
pass does not relabel them as newly repeated or claim WCAG, screen-reader or device certification.

## Remaining acceptance

- **M41:** successful actual speech and science-word pronunciation remain unverified.
- **M46:** actual Ms. Hughes/projector/pupil observations remain absent.

No feedback is invented and neither item is checked. Journal/Mushinator, classroom uploads,
live Hub swap and production release remain outside these exhibit corrections.
