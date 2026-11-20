# Classroom Page builds

The editable visitor source for each approved revision lives at `pages/<page-uuid>/revisions/<revision>/source.json`. Private notes, original pasted HTML and research prompts stay in Studio.

The standalone Node 24 builder validates that source and writes an immutable release containing `source.json`, `index.html`, `story.html` and `release.json`. The manifest identifies the source Page, its host, revision and artifact hashes. The HTML includes the complete classroom presentation, native keyboard-operated exhibit interactions and a collapsed sources panel drawn from the material used on that Page. The installed Edublogs loader mounts the exact fragment in `story.html`.

From the repository root:

```sh
node apps/classroom-page/build/build.mjs apps/classroom-page/pages/<page-uuid>/revisions/<revision>/source.json <revision> releases/classroom-page/<page-uuid>/studio-r<revision> <host-uuid>
```

Supply the lowercase UUID of the installed host that was reviewed in the private preview. Omit that argument when the host has the same identity as the draft. Repeating a build verifies matching output. A different revision belongs in its own release directory. Open `index.html` to inspect the result without a Studio login. External images and embedded videos use the source addresses in the approved document.

The committed builder includes its validation dependency and runs without package installation. Its maintained source is the Studio release’s `src/modules/page-drafts/creator-source-build.ts`, `creator-public-render.ts` and `creator-content.ts`. Studio packages it with `node tools/classroom-page-builder/package.mjs <destination/build.mjs>`.

## Explicit native Posts and museum presentation

The logical renderer name remains `classroom-page`. New native Posts carry `page.nativeKind: "post"` in public source and `nativeKind: "post"` in their release manifest. Their fixed Edublogs host remains a native Post. Studio verifies the native ID and actual canonical permalink, preserves the host body, and records that verified identity in `native-host.json` beside a selected immutable release. The standalone builder does not invent or verify that host identity.

Version 2 visitor sources without `experience` retain their exact renderer bytes. Museum presentation opts into `data.schemaVersion: "3.0"` with `experience.version: 1`, explicit decorative tokens, optional opening moment, and heading-bound station layout choices. Version 3 manifests are also explicit. Educational content, licensed images, source credits and text remain structured content; decorative symbols cannot substitute for educational visuals. No arbitrary script allowance is introduced.

Museum motion consumes the shared site-shell contract `html[data-hrv-effects="full"|"reduced"]`. Full is the default; the renderer has no local preference, storage or control. The shared shell owns the persistent choice. The matching shell release, actual native host, accessibility, responsive behavior and creative quality must be accepted together before the museum publication gate is opened. Native Post acceptance also includes permalink, index, excerpt, feed, unavailable and restore behavior. These gates are independent of the still-deferred AI provider decision.

Run the offline compatibility verification:

```sh
node apps/classroom-page/verify-build.mjs
```

It rebuilds the existing approved Page source at revision 2 byte for byte, validates synthetic native Post and museum fixtures, verifies exact artifact hashes, retries unchanged outputs and rejects altered immutable output. The fixture words explicitly identify their synthetic nature. This verifies implementation capability, not live AI research, visual approval, public installation or deployment. Builder provenance is recorded in `build/provenance.json`.

## Synthetic browser verification

The read-only `classroom-page-renderer-ci.yml` workflow runs that byte verification and then `node apps/classroom-page/browser-smoke.mjs` using the existing pinned CI browser. There is no package installation, deployment, public selector change, model request or signed-in browser session. The smoke script uses a new temporary profile and serves only the synthetic fixtures over local HTTP; its content security policy and request interception exclude outside resources.

The browser checks the Page and native Post fixture at desktop and mobile sizes, exercises labelled comparison controls and disclosures, opens source credits, checks readable content for horizontal overflow and verifies explicit Full/Reduced Effects. An operating-system Reduced Motion preference does not silently change the owner-selected Full default. It saves full-page Full and Reduced screenshots, browser version, source commit and artifact hashes in `artifacts/classroom-page-browser`. Set `CLASSROOM_CHROME_PATH` for a local installed Chrome and optionally `CLASSROOM_BROWSER_OUTPUT` for a different evidence directory.

Those screenshots require visual review. Passing synthetic checks does not establish the original prompt's full creative quality, fresh research, real educational image selection, keyboard and assistive-technology acceptance, installation of the shared shell or Edublogs host/feed behavior. The publication gates remain closed until their separate acceptance records exist. A prepared workflow or syntax check is not a claim that the browser run has already passed.
