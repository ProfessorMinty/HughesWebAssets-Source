# Hughes Room Views Global Site Shell

**Owner:** site/global layer
**First permanent version:** `2026.08.14.1`
**Candidate version:** `2026.11.20.1`, not installed or accepted by this continuation.

This package is the one deliberately small global shell for Hughes Room Views.

## What it owns

- shared Amadeus site-header and main-navigation presentation;
- guarded delayed auto-scroll below repeated Amadeus chrome.
- one persistent **Reduced effects** control and shared preference contract.

## Shared effects contract, version 1

The original HRV platform contract assigns persistent Reduced Effects to the global shell. This candidate implements that previously missing responsibility. Full effects remain the default. An OS/browser motion preference does not change the product mode; keyboard, readable contrast, focus, touch and safety requirements still apply to every mode.

| Surface | Contract |
|---|---|
| Current mode | `document.documentElement.getAttribute('data-hrv-effects')` is `full` or `reduced`. Consumers treat an absent/invalid value as `full`. |
| Notification | Window event `hrv:effectschange`, detail `{ version: 1, mode: 'full' | 'reduced' }`, after initialization and changes. Read the attribute on mount as well as subscribing. |
| Persistence owner | Only the global shell writes `localStorage['hrv:effects:v1']` as `full` or `reduced`. Other tabs synchronize through storage events. |
| Control | One native toggle button labelled “Reduced effects”, `aria-pressed` true in reduced mode. It sits in the shared header, or above content if no header exists, without floating over a lesson. An explicit `[data-hrv-effects-control-host]` may choose its shared-shell placement. |
| Unavailable storage | The current page still changes mode. A visible status explains that the choice could not be saved for next time. No false persistence claim. |
| Application boundary | Each application owns which decorative effects to reduce. The shell does not apply a blanket animation reset to unrelated application controls. Do not add competing per-page toggles or persistence. |

The shell also removes its own navigation motion and uses immediate rather than smooth auto-scroll when reduced mode is active. Auto-scroll respects an existing fragment, admin/customizer context, prior scroll and visitor interaction. Duplicate execution mounts one control; the versioned instance supports listener/UI cleanup before replacement.

The Lanternworks museum-format candidate consumes this contract and mirrors it into its private editor preview. Existing released Hub, Album and other applications require individual consumer adoption/verification; the shell's presence alone does not prove every old animation responds. The new museum publication gate remains closed until the compatible shell and Source builder are installed and actual hosted/visual acceptance passes.

## Candidate verification and installation

The source files are copied byte-for-byte into `releases/site-shell/2026.11.20.1/`. The August release directories and the currently checked-in sitewide loader remain unchanged. `tests/site-shell-effects.test.ts` covers full-default behavior, persistence, cross-tab changes, unavailable storage, duplicate mount/cleanup, guarded scroll and immutable August checksums. Existing shell scope tests still prohibit page/application ownership.

Before changing the sitewide loader, pin the reviewed candidate commit, inspect the shared control on the real desktop/mobile host and exercise consumer behavior, then record the actual three-part evidence: source artifact, installed loader and observed page. Preserve the previous installed commit/release for rollback. This candidate is not a deployment record and does not retire legacy widgets.

## What it does not own

The shell must not accumulate page/application behavior simply because it loads everywhere. In particular, it does not own:

- Classroom Explorations Hub rendering, styling, routes, placeholder, or host compatibility;
- Photo Album rendering or data;
- Home runtime behavior;
- Posts-index runtime behavior;
- Zinnia plant-journal behavior;
- Contact styling;
- Class Library styling;
- Bat-page styling;
- Quote-of-the-Day component styling;
- generic typography, heading, paragraph, link, button, input, form, widget, article, or page-background rescue rules;
- retired helper-scraped Exploration/Posts navigation.

## Edublogs integration

The permanent browser release is immutable under `releases/site-shell/<version>/`.

Edublogs should load it through one tiny sitewide Custom HTML bootstrap pinned to an exact repository commit. That bootstrap is the integration seam, not a fourth legacy widget implementation. Footer Left, Footer Center, and Footer Right remain retirement targets.

## Change rule

Adding a new shell responsibility requires evidence that the behavior is genuinely site-wide or requires global coordination. Page-specific needs remain page-local or application-owned.
