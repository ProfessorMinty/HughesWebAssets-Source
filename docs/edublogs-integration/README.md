# Edublogs Photo Album three-box contract

The Photo Album follows the repository-wide Hughes Room Views page law:

> **Edublogs provides the doorway. The repository owns the room.**

The three page-local Edublogs blocks contain no Photo Album application UI or application styling.

1. `HTML-BOX.html` provides only the stable `#hrv-photo-album` mount and a small truthful unavailable / come-back-later fallback.
2. `CSS-BOX.css` styles only that small fallback.
3. `JAVASCRIPT-BOX.js` is only the tiny injector for the exact immutable repository candidate and permanent Worker manifest.

The repository owns everything visitors experience after bootstrap succeeds: loading state, full-viewport breakout, application shell, Current Memories, album covers, routes, galleries, lightbox, themes, motion/effects, responsive behavior, host compatibility, diagnostics, and application failure states.

The Edublogs blocks must never contain a Photo Album loading experience, construction banner, page layout, viewport-breakout rules, album UI, or theme/effects code.

The JavaScript injector must pin an immutable Git commit SHA plus an immutable release directory. Never use mutable `@main`.

Current visual-review candidate:

```text
Artifact commit: d036ff1a61bba7b7efced91c2f30881aa0e0d98a
Release: 2026.08.18.1
```

Before any Photo Album candidate is approved, it must pass repository tests/build, browser/viewport QA, bootstrap/failure QA, and then an exact three-block test on the real Edublogs host. Local screenshots are supporting evidence only and do not replace the real-host gate.
