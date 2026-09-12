# Classroom Explorations 2025–2026 archive doorway

This directory owns the three small Edublogs fields for WordPress Page `2627`:

- URL: `https://rmhughes.edublogs.org/hub/archive-2025-2026/`
- Template: `page_fullwidth.php`
- Repository application: `releases/classroom-explorations-archive/`

The approved archive application stays in the repository. The HTML field supplies one semantic mount and a truthful unavailable state. The CSS field styles only that fallback and is scoped to `body.page-id-2627`. The JavaScript field loads one SRI-protected bootstrap from one exact asset commit and passes one publication URL from that same commit.

## Current state

`HTML-BOX.html`, `CSS-BOX.css`, and `JAVASCRIPT-BOX.template.js` are source templates. A final `JAVASCRIPT-BOX.js` and `RELEASE-PIN.json` are deliberately absent until the immutable archive release exists in a committed Git object. Never paste the template JavaScript and never replace its tokens by hand.

After the release asset commit is known, generate the exact doorway with:

```text
node tools/generate-classroom-explorations-archive-doorway.mjs <runtime-version> <publication-id> <40-character-asset-commit>
```

The generator refuses mutable refs, abbreviated commits, missing commit objects, release files that differ from their committed bytes, unexpected publication contracts, and any publication dependency whose committed SHA-256 digest does not match `publication.json`. It derives the browser SRI value from the committed bootstrap bytes and writes the final JavaScript and release-pin record deterministically.

Verify source-template state at any time with:

```text
node tools/verify-classroom-explorations-archive-doorway.mjs
```

After generation, require a complete final pin with:

```text
node tools/verify-classroom-explorations-archive-doorway.mjs --require-final
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
