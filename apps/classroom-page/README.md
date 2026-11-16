# Classroom Page builds

The editable visitor source for each Page lives at `pages/<page-uuid>/source.json`. Lanternworks publishes the teacher-approved version here. Private notes, original pasted HTML and research prompts stay in Studio.

The standalone Node 24 builder validates that source and writes an immutable release containing `source.json`, `index.html` and `release.json`. The manifest identifies the source Page, its host, revision and artifact hashes. The HTML includes the complete classroom presentation, native keyboard-operated exhibit interactions and a collapsed sources panel drawn from the material used on that Page.

From the repository root:

```sh
node apps/classroom-page/build/build.mjs apps/classroom-page/pages/<page-uuid>/source.json <revision> releases/classroom-page/<page-uuid>/studio-r<revision> <host-uuid>
```

Supply the lowercase UUID of the installed host that was reviewed in the private preview. Omit that argument when the host has the same identity as the draft. Repeating a build verifies matching output. A different revision belongs in its own release directory. Open `index.html` to inspect the result without a Studio login. External images and embedded videos use the source addresses in the approved document.

The committed builder includes its validation dependency and runs without package installation. Its maintained source is the Studio release’s `src/modules/page-drafts/creator-source-build.ts`, `creator-public-render.ts` and `creator-content.ts`. Studio packages it with `node tools/classroom-page-builder/package.mjs <destination/build.mjs>`.
