# Hughes Room Views Global Site Shell

**Owner:** site/global layer  
**First permanent version:** `2026.08.14.1`

This package is the one deliberately small global shell for Hughes Room Views.

## What it owns

- shared Amadeus site-header and main-navigation presentation;
- guarded delayed auto-scroll below repeated Amadeus chrome.

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
