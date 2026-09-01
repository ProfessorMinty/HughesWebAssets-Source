# Classroom Explorations 2025–2026 Archive Build Evidence

Date: 2026-09-01

Status: local implementation candidate; not published or installed

Branch: `hub-authoring-v2-2026-08-28`

Verified starting HEAD: `952500612dbb9e17d308bee0c0f26316dd0381b4`

## Scope

This change builds the dedicated 2025–2026 archive for Edublogs Page 2627. It does not change Page 17, the approved Hub application, an Edublogs page, or a live CDN publication.

The archive has an explicit ordered collection of three past explorations and five past “This Week We Learned” displays. `Butterflies in the Classroom` uses the canonical route `/hub/exploration-butterflies/`; the stale Caterpillars destination is rejected by the contract.

The archive is a separate page, not a Hub modal. It presents the Hughes Room Views global navigation, two explicit return controls to `/hub/`, the approved Hub visual foundation, archive-specific side artwork, filtering, accessible heading structure, and responsive desktop/tablet/mobile layouts.

## Deterministic build evidence

- Content snapshot: `sha256:c95146e9f6850df0bb3c6ff2b8c0ad43a0bfe825f6fdf9797d231425f7fa5b06`
- Bootstrap: `sha256:45e0e3bff41a94016188107bf4989d1513fdad4522142ae5f4978a63426a0726`
- Runtime: `sha256:1e48db11841a381971a782e7bae4cb536eab60e9f5d8ba347321eeefb9b27e70`
- Stylesheet: `sha256:db704cf267c242390fc0c166bd17288ee85759e8677de9b84cf7578ad2d21cb8`
- Page-2627 host compatibility stylesheet: `sha256:b59423e5a9778ca7f50a74d24c340545a0809ae4f78ed23a40e34684ecaee50b`

## Automated verification

- `npm run check:archive` passed.
- Archive source/runtime schema and referential-contract tests passed.
- Presentation and Page-2627-only host-compatibility tests passed.
- Immutable publication staging, reuse, injected-failure cleanup, duplicate rejection, and tamper rejection passed.
- `git diff --check` passed.
- `npm run test:hub`, `npm run build:hub`, and the Hub publication tests passed with identical pre/post Hub source and runtime hashes.

## Real-browser verification

The generated preview was exercised in the isolated in-app browser against the exact local build.

- 1920×911: ready state; one H1; three exploration cards; five learning cards; two archive return links; zero dialogs; zero `aria-current`; no horizontal overflow; full page height 1090 px.
- 980×911: seven-item global navigation remains one balanced row; three-column galleries; no horizontal overflow.
- 390×844: two-column navigation with the final link spanning both columns; one-column galleries; 39 px H1, 30 px H2, 20 px card headings; no horizontal overflow.
- The footer and its second Hub-return control remain visible without depending on an intersection reveal.

Evidence files:

- `evidence/classroom-explorations-archive/archive-desktop-1920x911.png` — `sha256:534bdaded163e92cc074b79c3c9e65b170c1bfa4e345294658e794a40c251d00`
- `evidence/classroom-explorations-archive/archive-desktop-full-1920x1090.png` — `sha256:8a0c9506c15d4c8427d2aae52e12428b562961a2b5feb9646a00e963e4c16649`
- `evidence/classroom-explorations-archive/archive-narrow-desktop-1366x768.png` — `sha256:ff79be9693c970b2ea13f879ebcfb0df28161dfb44e87b80f109f49da0603b15`
- `evidence/classroom-explorations-archive/archive-tablet-980x911.png` — `sha256:3adab84d26b7c2835df48c0324dc3ff0294d3d0b30041ae29acec70ca1bcc5f9`
- `evidence/classroom-explorations-archive/archive-mobile-390x844.png` — `sha256:26f15be53e55ecd42287612647b3093b71eaccecffed676b2590fb0ff5e29845`

## Deliberately deferred

After visual approval, the next repository step is to mint an immutable archive runtime/content publication from this source revision and generate the Page 2627 HTML/CSS/JavaScript handoff with pinned hashes. Only after Page 2627 is installed and verified should the Hub current-year historical placeholders and all back-to-Hub wiring be changed. Page 17 migration remains later work.
