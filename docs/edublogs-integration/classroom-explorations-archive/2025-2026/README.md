# Classroom Explorations 2025–2026 archive doorway

This directory owns the three small Edublogs fields for WordPress Page `2627`:

- URL: `https://rmhughes.edublogs.org/hub/archive-2025-2026/`
- Template: `page_fullwidth.php`
- Repository application: `releases/classroom-explorations-archive/`

The approved archive application stays in the repository. The HTML field supplies one semantic mount and a truthful unavailable state. The CSS field styles only that fallback and is scoped to `body.page-id-2627`. The JavaScript field loads one SRI-protected bootstrap from one exact asset commit and passes one publication URL from that same commit.

## Current state

The final repository handoff exists and is pinned to one immutable release:

- Asset commit: `9deaf1723109c5259b5813d271a23d336d68559d`
- Runtime: `2026.09.12.1`
- Publication: `pub-2026-09-12-001`
- Source revision: `1ab0b4dfa9c339e58583c454816193e5247f6c1c`
- Previous known-good repository publication: `null` (first repository-native archive baseline)
- Bootstrap SRI: `sha256-ReDjv/QalAFhiBB79JidFRP9rUUiFCrl9JeKY0JqByY=`

`JAVASCRIPT-BOX.js` and `RELEASE-PIN.json` were generated from the exact committed release bytes. The complete 14-file CDN GET-and-hash proof is in `evidence/classroom-explorations-archive/release-2026-09-12/cdn-byte-verification.json`. Never paste `JAVASCRIPT-BOX.template.js`, replace its tokens by hand, or mix doorway files from different generations.

The exact regeneration command is:

```text
node tools/generate-classroom-explorations-archive-doorway.mjs 2026.09.12.1 pub-2026-09-12-001 9deaf1723109c5259b5813d271a23d336d68559d
```

The generator refuses mutable refs, abbreviated commits, non-ancestor or missing commit objects, release files that differ from their committed bytes, unexpected publication contracts, and any publication dependency whose committed SHA-256 digest does not match `publication.json`. It derives the browser SRI value from the committed bootstrap bytes and writes the final JavaScript and release-pin record deterministically.

Verify the final package with:

```text
node tools/verify-classroom-explorations-archive-doorway.mjs --require-final
```

Exercise the exact doorway against its immutable CDN release in a local browser with:

```text
npm run preview:archive:doorway
```

## Preservation gate

The read-only public HTML and REST captures taken on 2026-09-12 are recorded in `PRE-INSTALL-PRESERVATION.json`. They prove the observed route, template, legacy `8331606…` pin, and stale Caterpillars state, but they are not substitutes for the three authenticated editor fields.

Before anyone replaces Page 2627:

1. Export its exact existing HTML, CSS, and JavaScript editor fields to the paths named in `PRE-INSTALL-PRESERVATION.json`.
2. Record each byte length and SHA-256 digest.
3. Change `authenticatedEditorFields.status` to `complete` and `installationGate` to `satisfied`.
4. Run `node tools/verify-classroom-explorations-archive-doorway.mjs --require-final --require-editor-preservation`.
5. Paste `HTML-BOX.html`, `CSS-BOX.css`, and the generated `JAVASCRIPT-BOX.js` together. Do not mix generations.

If rollback is necessary, restore the three preserved editor fields together and retain `page_fullwidth.php`.

## Boundaries

- Do not use a branch, tag, `@main`, or shortened SHA in the doorway.
- Do not move application or Amadeus host-compatibility rules into `CSS-BOX.css`.
- Do not edit the generated JavaScript or release pin by hand.
- Do not change Page 17 or historical child-page backlinks as part of the Page 2627 installation.
- Do not claim installation from repository or CDN evidence; verify the signed-out Edublogs page after the user pastes all three fields.
