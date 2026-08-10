# Classroom Explorations Hub — current state and recovery record

Date: 2026-08-10
Public route: https://rmhughes.edublogs.org/classroom-explorations/
WordPress page ID: 17

## Executive state

The Classroom Explorations Hub is in an intentional construction hold.

The approved live-facing experience for the hold is limited to:

1. Museum entrance / hero.
2. Welcome Theater.
3. Current Exploration: Summer Bloom Adoption Project / Zinnia.
4. A large, explicit Under Construction notice immediately after the current exhibit.

Everything below that point in the fuller museum design is intentionally not rendered during the hold. The hidden sections remain in repository source for later refinement and are not deleted.

## Why the hold exists

The project moved from a legacy Edublogs implementation with substantial widget/global-CSS support into a repository-owned hybrid page system. During modernization, several architectural and visual regressions occurred:

- an early replacement renderer flattened the established museum identity into generic cards;
- the backed-up August 4 museum HTML was subsequently restored as the visual authority;
- the Hub was recomposed for full-width ownership in release 2026.08.10.6;
- the upper museum experience became substantially stronger, but motion did not behave as intended and the visual hierarchy weakened heavily below the Zinnia section;
- several publication-seam experiments incorrectly attempted to launch repository code from page HTML, despite the established Edublogs production pattern using separate HTML, CSS, and JavaScript enhancement surfaces;
- the project reconverged on the mature hybrid boundary already documented for the Hub and demonstrated by the Black Hole Museum V2 work.

The construction hold prevents unfinished lower museum sections from appearing public while preserving the strongest current portion of the page.

## Authoritative visual reference

The backed-up August 4 page-17 museum remains the historical visual authority for identity. Important preserved language includes:

- museum entrance / discovery hub framing;
- atmospheric sky, aurora, clouds, stars, and floating exploration objects;
- compass identity;
- Exploration Oath;
- Museum at a Glance;
- Welcome Theater;
- Featured Exhibit Hall / Zinnia presentation;
- Learning Lantern language;
- crystalline transition language;
- Archive Gallery and Learning Archive concepts;
- museum footer language.

Modernization is allowed to become larger, richer, and flashier, but must remain recognizably the same museum family rather than replacing the identity with generic UI.

## Permanent architecture boundary

Edublogs owns:

- stable route;
- semantic mount;
- truthful native fallback;
- small fallback/readability CSS;
- Full Width page setting;
- tiny page-local JavaScript loader.

Repository owns:

- actual museum renderer;
- museum CSS;
- animations and motion systems;
- responsive composition;
- content manifest;
- release manifest;
- host compatibility CSS;
- validation;
- immutable releases.

Production Edublogs surface contract:

1. HTML tab = semantic mount + readable fallback only.
2. CSS tab = fallback readability / minimal route shell support only.
3. JavaScript tab = tiny repository loader only.

Do not place repository launch `<script>` tags in the HTML tab. Do not move magical presentation into Edublogs CSS. Do not restore the old global widgets as feature-code containers.

## Deleted-widget migration record

The deleted widgets were migration evidence, not irrelevant historical files.

Hub-relevant responsibilities identified from them include:

- hiding the duplicate WordPress/Amadeus page title;
- full-width / article-shell compatibility formerly supplied globally;
- automatic scroll below the oversized Amadeus shell/header where still appropriate.

The old Exploration Helper is intentionally retired and must not return. Its Hub-scraping, DOM inference, helper localStorage, and floating global navigation architecture are obsolete.

Footer Right did not contain required Hub presentation ownership to restore.

## Release history relevant to this recovery

### 2026.08.10.2
First permanent release attempt. Architecture work existed, but production runtime accidentally bundled an additional auto-mount owner. This violated single-owner bootstrap behavior.

### 2026.08.10.3
Corrected runtime ownership and page-local Amadeus shell compatibility. Still represented an unacceptable visual replacement rather than the historical museum.

### 2026.08.10.4
Museum renderer rebuilt from the backed-up Hub source. Historical museum vocabulary restored. Content contract remained Zinnia current, TWWL Coming Soon, empty current-year archives, one prior-year archive doorway.

### 2026.08.10.5
Attempted publication-contract correction using a direct bootstrap in the page HTML. This later proved inconsistent with the established Edublogs production history and was not retained as the preferred seam.

### 2026.08.10.6
Full-page museum composition pass. Stronger immersive entrance, Welcome Theater, Zinnia greenhouse, Learning Lantern, archive areas, and archive portal. Upper page became substantially stronger. However, motion was not functioning as expected in live use and lower-page hierarchy appeared unfinished.

### Black-Hole-style Edublogs seam correction

The Hub was reconverged on the mature production boundary:

- HTML fallback only;
- CSS fallback only;
- JavaScript page-local repository loader;
- repository owns the enhanced museum.

The integration verifier now fails if scripts/styles leak back into the HTML tab or if museum presentation leaks into the Edublogs CSS tab.

## Construction hold decision

The approved public composition during the hold is:

Museum Entrance
→ Welcome Theater
→ Summer Bloom Adoption Project
→ LARGE UNDER CONSTRUCTION NOTICE
→ stop rendering further museum sections

The following fuller `.6` sections remain source-preserved but are intentionally disabled from public rendering during the hold:

- Learning Lantern / current TWWL presentation;
- crystalline divider;
- current-year Past Explorations gallery;
- current-year Past This Week We Learned gallery;
- Previous School Years / prior-year archive portal;
- lower museum footer/confetti presentation.

Do not delete these source methods solely because they are hidden during the hold.

## Content contract during hold

The repository content manifest remains structurally capable of representing the full Hub. Classroom data is not rewritten merely to hide unfinished presentation.

Current truth remains:

- Current Exploration: Summer Bloom Adoption Project / Zinnia;
- Current TWWL: Coming Soon;
- current-year past galleries: empty;
- prior-year representation: one 2025–2026 archive doorway record;
- individual 2025–2026 historical records remain outside the launch Hub manifest.

## Known unresolved work after construction hold

1. Diagnose why ambient CSS animations appear frozen in the live Hub even though repository CSS is delivered.
2. Implement real scroll-triggered reveals rather than load-time animations that finish off-screen.
3. Add an accessible museum motion controller for long-running ambient motion.
4. Rebuild hierarchy below the current exhibit into intentional museum rooms, not large pale slabs.
5. Revisit Learning Lantern as a magical Coming Soon chamber.
6. Rebuild archive transition and archive wings for the full-width canvas.
7. Rebuild the prior-year doorway as a strong museum portal.
8. Validate normal motion and prefers-reduced-motion behavior independently.
9. Add browser-level regression testing that proves objects actually change state over time, not merely that `@keyframes` exist in CSS.
10. Validate signed-out desktop, tablet, phone, keyboard, reduced motion, runtime failure fallback, and public CDN delivery before removing the construction hold.

## Rollback and safety

Immutable releases remain immutable. Never edit a staged release directory in place.

The backed-up legacy page 17 HTML remains the historical rollback source.

The construction-hold release should itself have an immutable rollback target to the preceding museum release.

Do not modify Photo Album, Cloudflare, Google Drive, unrelated Edublogs pages, or child Exploration/TWWL routes as part of this hold.

## Next-resume instruction

When work resumes, begin from this document and the current immutable construction-hold release. Do not reconstruct state from memory or re-open the architectural question from scratch. Preserve the approved upper museum, repair motion separately, then rebuild one lower museum room at a time behind explicit acceptance checks.
