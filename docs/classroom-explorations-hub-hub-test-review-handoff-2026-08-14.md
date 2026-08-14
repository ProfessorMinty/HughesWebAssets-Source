# Classroom Explorations Hub `/hub-test/` review handoff

Date: 2026-08-14
Status: permanent Hub implementation ready for human review on the real Hub Test page

## Same permanent Hub, new review doorway

This handoff does not create a second Classroom Explorations implementation.

The active review surface is:

- URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`
- Route: `/hub-test/`

The permanent production target remains:

- WordPress page ID: `17`
- Route: `/classroom-explorations/`

The repository host-compatibility layer supports both WordPress page classes while the Classroom Explorations application is mounted and ready. Page 2589 is a review host only; it is not promoted into the permanent HRV route registry as the Hub's product identity.

## Immutable review publication

- Artifact commit: `9ce65cf73c820db7b7292863ace7611d60e61524`
- Runtime: `2026.08.14.4`
- Publication: `pub-2026-08-14-004`
- Content snapshot: `sha256:ba5664964d1f228a203ac177f92c160d73e70ee56342c9a505a6805a01cc8102`
- Source revision recorded by publication: `017182988e89e6b37e2823d0716fa26145b30e03`
- Previous known good: `null`

Runtime `.4` reuses the exact `.3` application renderer and museum CSS. The runtime change is limited to the repository bootstrap outage behavior and host compatibility required to support page 2589 while retaining page 17.

Publications 001, 002, and 003 remain immutable unaccepted review evidence. None is promoted into accepted-production rollback ancestry.

## Edublogs boundary

Use the checked-in three-box files exactly:

- `docs/edublogs-integration/classroom-explorations-hub/HTML-BOX.html`
- `docs/edublogs-integration/classroom-explorations-hub/CSS-BOX.css`
- `docs/edublogs-integration/classroom-explorations-hub/JAVASCRIPT-BOX.js`

Edublogs owns only:

- one semantic Hub mount;
- one small static outage notice;
- tiny outage-notice CSS;
- the tiny immutable repository bootstrap handoff.

Everything that constitutes the Classroom Explorations experience remains repository-owned.

## Static outage notice

The old fallback concept has been replaced with a true outage notice. The notice is hidden during normal startup and remains absent after a successful Hub mount. It is shown if the immutable bootstrap fails to load, the repository runtime reports an application error, or startup remains unresolved for 20 seconds.

The outage notice contains only:

- a puppy/dog-face illustration with question-mark decorations;
- `Oops! Something went wrong.`;
- `Classroom Explorations is temporarily unavailable.`;
- `Please come back and check again later.`

It is not a reduced Hub and contains no duplicated classroom content, navigation, gallery state, or museum presentation.

### Outage illustration independence and license

The dog-face SVG is embedded directly in the Edublogs HTML box. Therefore the outage illustration has no runtime dependency on `HughesWebAssets-Source`, jsDelivr, or OpenMoji being reachable during the outage.

The asset record is stored at:

`docs/edublogs-integration/classroom-explorations-hub/OUTAGE-NOTICE-ASSET.md`

It records OpenMoji dog face U+1F436 from pinned OpenMoji release `17.0.0`, licensed under CC BY-SA 4.0. The outage card includes visible attribution. The surrounding question marks are separate HRV doorway styling.

## Host compatibility

Repository host compatibility is scoped to:

`html.hrv-page-classroom-explorations-ready body:is(.page-id-17, .page-id-2589)`

Only after the repository application reaches ready state does it neutralize the Amadeus article/container/sidebar surfaces and apply the full-viewport mount breakout. Unrelated Edublogs pages are outside this selector.

The breakout contract retains the proven geometry:

- `width: 100vw`
- `left: 50%`
- `margin-left: -50vw`
- `margin-right: -50vw`
- no host article/card background or padding around the museum
- `overflow-x: clip` protection against a horizontal scrollbar

## Review acceptance on the real host

After the three boxes are installed on page 2589, inspect the actual `/hub-test/` page rather than a local substitute. Verify at minimum:

1. the normal Edublogs header/navigation remains intact above the Hub;
2. the repository museum begins edge-to-edge beneath it;
3. no beige/white Amadeus frame surrounds the museum;
4. no horizontal scrollbar appears on desktop, laptop, tablet, or phone;
5. the historical-baseline Hero, Welcome Theater, Current Exploration, Current TWWL, divider, Past Explorations, Past TWWL, compact Previous School Years control, and footer remain intact;
6. Current Zinnia and the populated historical review galleries render with truthful metadata;
7. real video/media load responsively;
8. keyboard/focus and Reduced Effects work;
9. signed-in admin-bar geometry remains correct;
10. signed-out rendering remains correct;
11. a deliberate repository/bootstrap failure reveals the static outage notice rather than partial Hub content;
12. successful application loading leaves the outage notice absent.

## Production boundary

Review approval on page 2589 does not itself modify page 17. Once the visual/product review is approved, the same accepted immutable Hub publication can be prepared for the production doorway while retaining page 17 as the permanent HRV route identity.
