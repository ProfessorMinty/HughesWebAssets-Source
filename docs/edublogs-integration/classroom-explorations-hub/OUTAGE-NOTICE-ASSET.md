# Classroom Explorations outage notice asset record

Date: 2026-08-14

## Purpose

The Edublogs doorway contains one static outage notice that is shown only when the repository-owned Classroom Explorations application cannot load. It is not a reduced Hub implementation.

The illustration is embedded directly in the Edublogs HTML box so it remains available even if `ProfessorMinty/HughesWebAssets-Source`, jsDelivr, or the Hub publication is unavailable.

## Illustration

- Asset: OpenMoji `dog face` (Unicode U+1F436)
- Upstream project: OpenMoji
- Pinned upstream release inspected: `17.0.0`
- Upstream file: `color/svg/1F436.svg`
- Upstream repository: `https://github.com/hfg-gmuend/openmoji`
- Project site: `https://openmoji.org/`
- License: Creative Commons Attribution-ShareAlike 4.0 International (CC BY-SA 4.0)
- License text: `https://creativecommons.org/licenses/by-sa/4.0/`
- Upstream item page credits the dog-face illustration to Sofie Ascherl.
- Runtime dependency on upstream: none. The SVG markup is embedded in the Edublogs outage notice.

The outage composition adds separate question-mark decorations around the unmodified dog-face illustration. Those decorations are HRV doorway styling and are not part of the OpenMoji asset.

## Attribution

The outage notice includes a small visible credit:

`Dog face illustration by OpenMoji, licensed CC BY-SA 4.0.`

This preserves attribution at the point of use while keeping the maintenance card child/family friendly.
