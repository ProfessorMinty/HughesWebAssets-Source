# Release portability follow-up — 2026-10-10

Before Edublogs installation, CI at source commit `94885b375965b6d749e2f661683f477a93764b93` exposed two release-gate failures.

- Hub run `38080647213`: the installed desktop Chrome version `152.0.7977.83` was not an available Chrome for Testing download on either Linux or Windows. Both Hub jobs now pin `155.0.8059.39`, confirmed in Google's official Chrome for Testing download catalog. The archive job now provisions the same version for its shared Hub regression check instead of silently using the runner browser.
- Archive run `38080647187`: archive-specific checks passed, but shared Hub geometry failed at 1920×911. The primary row grew to 518.203125px and TWWL ended at 948.75px. The desktop subject title had an unnecessary `16ch` cap; removing that alone did not resolve the Linux failure. The current copy column now receives 52% (maximum 480px), rather than 48% (maximum 440px), to accommodate fallback-font wrapping without reducing semantic font-size floors or relaxing the viewport assertion. Windows native zoom and responsive checks passed at `7c84d02`; cross-platform acceptance still requires the subsequent CI run.

Reference catalog: https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json

The first local staging candidate (`2026.10.10.1`, `pub-2026-10-10-001`) was not pushed or installed. It is not accepted release evidence. Subsequent browser checks, publication identity, CDN byte verification, and authenticated editor readback must be recorded separately before claiming installation.

For the future manifest rubric: acceptance must include cross-platform font fallback geometry, an available reproducible browser version, and the actual runtime bytes. Windows-only preview evidence does not establish portable opening-viewport fit.

The 52% candidate also failed Linux fit at `59e901f`. Its retained failure diagnostic confirms a two-line title, four-line summary, and three two-line learning points in a 453.40625px inner copy width; the Current copy's intrinsic height was 492.203125px. The next candidate budgets 58% (maximum 520px) for that copy. This is a reading-width correction within the same equal-sized Welcome/Current cards, not smaller typography or a relaxed fit test. Failure screenshots are explicitly labeled FAILED and are not accepted release evidence.

## Accepted outcome

The 58%/520px candidate at `4e1631c45aefcd3b9d637e7760cc89ea8a05bb08` passed both Linux geometry and Windows native-zoom CI. Runtime `2026.10.10.2`, publication `pub-2026-10-10-002`, was committed at `f2381f5b9e284e87e17c3b45b25f381a55663c1c`; its exact-commit CI, all 16 CDN bytes, and generated SRI doorway passed. It is now installed on HUB TEST only. See [live installation and its explicit limits](classroom-explorations-live-installation-2026-10-10.md).

The first rejected local staging tree was moved recoverably to `outputs/rejected-hub-release-2026-10-10-001/` outside the repository. The retained FAILED portability bundle corresponds to PR merge commit `7d7469c161be8153c387eb03e7db1b035350f376` from run `38081470230`, not accepted release commit `f2381f5…`. These failures are diagnostic history, not successful release evidence.
