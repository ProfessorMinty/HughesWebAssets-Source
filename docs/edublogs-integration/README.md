# Hughes Room Views Edublogs integration

The authoritative repository-wide contract for every repository-owned Hughes Room Views page, post experience, Hub, exhibit, gallery, and application is:

`docs/hrv-repository-page-publication-standard.md`

The governing law is:

> **Edublogs provides the doorway. The repository owns the room.**

For every repository-owned page, the permanent Edublogs seam is three page-local blocks:

1. **HTML** — one stable semantic mount plus a small truthful unavailable / come-back-later fallback only.
2. **CSS** — styles only that small unavailable fallback.
3. **JavaScript** — a tiny injector pinned to the exact immutable repository candidate.

The actual application, including loading state, layout, full-viewport breakout, host compatibility, visual design, animation/effects, responsive behavior, application errors, navigation, content projection, and diagnostics, belongs to repository code after bootstrap succeeds.

The Edublogs blocks must not duplicate or approximate the repository application. They must not contain application loading experiences, page sections, page-specific layout CSS, viewport-breakout CSS, repository content, or feature logic.

Repository review/production candidates are pinned by immutable commit SHA plus immutable release/publication identifier. Never use mutable `@main` delivery.

Page-specific folders under this directory are integration records/templates. Where an older page-specific integration package conflicts with the repository-wide standard, treat that package as legacy migration debt rather than as precedent for new work.

The global standard also documents release/publication manifest construction and the required testing ladder, including mandatory real-Edublogs-host QA before a candidate can be approved for production.
