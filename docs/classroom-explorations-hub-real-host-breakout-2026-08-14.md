# Classroom Explorations Hub real-host breakout failure and correction

Date: 2026-08-14
Status: repository correction prepared after failed `/asdf-test/` preview; live page 17 remains untouched

## What the real host exposed

The first clean candidate (`runtime 2026.08.14.1`, `pub-2026-08-14-001`) successfully loaded on the approved Edublogs test page, but failed the required host-isolation gate. The application remained inside the narrow Amadeus content column and the foyer title collapsed into an extremely narrow text track.

This invalidates full-width approval for publication 001. Publication 001 remains immutable evidence of a failed preview candidate and is not an accepted production previous-known-good publication.

## Mechanical root cause

The candidate host compatibility stylesheet required `body.page-id-17`. That condition is false on `/asdf-test/`, so none of its Amadeus resets could activate on the preview page.

The upstream Amadeus structure used by the site establishes the relevant chain:

```text
#page.site
  #content.site-content.container
    #primary.content-area
      #main.site-main
        article.page.hentry
          .entry-header
          .entry-content
            #hrv-classroom-explorations-root
    #secondary.widget-area
```

The Amadeus theme itself constrains that chain:

- `#content` carries Bootstrap-style `.container` behavior.
- `.content-area` is 740 px with a floated sidebar in the desktop layout.
- at `max-width: 1199px`, `.content-area` becomes 540 px.
- `.widget-area` is 360 px and floats right.
- `.page .hentry` adds 45 px of padding.
- `body` inherits `word-wrap: break-word`.

At a laptop-width host around the 1180 px breakpoint, the repository hero therefore received roughly a 540 px content area before article padding. The hero grid still reserved a 300 px minimum track for the museum-door side plus its gap, leaving the title track extremely narrow. The inherited break-word behavior then made the visual failure even more severe. The title was a symptom of host imprisonment, not an isolated typography defect.

## Prior proof used as engineering evidence

The repository Layout and Resilience Laboratory already proved a full-viewport breakout on the real Edublogs host using the general geometry:

```css
width: 100vw;
max-width: none;
position: relative;
left: 50%;
margin-left: -50vw;
margin-right: -50vw;
```

The permanent Hub correction reuses that proven capability rather than inventing a new layout trick.

## Permanent correction

The clean Hub already adds `hrv-page-classroom-explorations-ready` to the document element only after the repository renderer mounts successfully, and removes it during teardown/failure. That runtime-added state is the correct page scope.

The corrected `host-compat.css` therefore:

1. removes the hard dependency on WordPress page ID 17;
2. scopes every host rule beneath `html.hrv-page-classroom-explorations-ready body`;
3. resets the actual Amadeus `#content.site-content.container` width/max-width/padding constraint;
4. resets `#primary.content-area`, `#main.site-main`, and `.entry-content` width/float constraints;
5. removes the Amadeus page-card padding/border/background while the application is mounted;
6. hides the sidebar and theme entry header/footer only while the application-ready state is active;
7. gives the Hub mount itself the previously proven viewport-breakout geometry;
8. leaves the site header/navigation outside the affected `#content` subtree;
9. keeps readable exhibit widths owned by the repository application CSS rather than stretching every paragraph to the viewport.

No application/layout CSS moves into the Edublogs CSS box.

## Automated guard

A repository test now rejects any return of `page-id-17` scoping in the Host compatibility stylesheet, requires the known Amadeus ancestor reset selectors, requires the viewport-breakout declarations, and rejects unscoped host selectors.

This is a source/CI guard only. It does not replace the real-host acceptance gate.

## Acceptance status

The corrected source must produce a new immutable runtime and publication because host compatibility is renderer/runtime behavior. Runtime `2026.08.14.1` is not mutated.

The next candidate must be repinned onto `/asdf-test/` and manually rechecked on the real Edublogs host for:

- true viewport-width environmental canvas;
- no horizontal scrollbar;
- correct foyer title geometry;
- intact site header/navigation;
- signed-in admin-bar behavior;
- signed-out behavior;
- desktop/laptop/tablet/phone widths;
- keyboard and Reduced Effects behavior;
- Current Exploration/video delivery;
- fallback behavior;
- teardown/remount behavior.

Only that real-host pass can authorize page 17 cutover.
