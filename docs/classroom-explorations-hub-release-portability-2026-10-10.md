# Release portability follow-up — 2026-10-10

Before Edublogs installation, CI at source commit `94885b375965b6d749e2f661683f477a93764b93` exposed two release-gate failures.

- Hub run `38080647213`: the installed desktop Chrome version `152.0.7977.83` was not an available Chrome for Testing download on either Linux or Windows. Both Hub jobs now pin `155.0.8059.39`, confirmed in Google's official Chrome for Testing download catalog. The archive job now provisions the same version for its shared Hub regression check instead of silently using the runner browser.
- Archive run `38080647187`: archive-specific checks passed, but shared Hub geometry failed at 1920×911. The primary row grew to 518.203125px and TWWL ended at 948.75px. The desktop subject title had an unnecessary `16ch` cap; fallback Georgia metrics can make that narrower than the available copy column. It now uses the full existing copy column without reducing semantic font-size floors or relaxing the viewport assertion.

Reference catalog: https://googlechromelabs.github.io/chrome-for-testing/last-known-good-versions-with-downloads.json

The first local staging candidate (`2026.10.10.1`, `pub-2026-10-10-001`) was not pushed or installed. It is not accepted release evidence. Subsequent browser checks, publication identity, CDN byte verification, and authenticated editor readback must be recorded separately before claiming installation.

For the future manifest rubric: acceptance must include cross-platform font fallback geometry, an available reproducible browser version, and the actual runtime bytes. Windows-only preview evidence does not establish portable opening-viewport fit.
