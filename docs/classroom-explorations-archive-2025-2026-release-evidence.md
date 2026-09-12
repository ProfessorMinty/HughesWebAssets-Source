# Classroom Explorations 2025–2026 Archive Release Evidence

Date: 2026-09-12

Status: immutable repository release, CDN bytes, and final Page 2627 doorway verified; not installed on Edublogs

Branch: `hub-authoring-v2-2026-08-28`

## Identity and commit chain

The host GitHub keyring was checked immediately before each push. The authenticated account was `ProfessorMinty`, the repository owner and Drminty identity. No `thewanderingblooms` account or browser profile was used.

- Approved archive source: `1ab0b4dfa9c339e58583c454816193e5247f6c1c`
- Release gates and Page 2627 preservation baseline: `e0473808b5310f4d692a004d5e9d552d05504dd8`
- Immutable archive release: `9deaf1723109c5259b5813d271a23d336d68559d`
- Runtime: `2026.09.12.1`
- Publication: `pub-2026-09-12-001`
- Content snapshot: `sha256:c95146e9f6850df0bb3c6ff2b8c0ad43a0bfe825f6fdf9797d231425f7fa5b06`
- Previous known-good repository publication: `null` because this is the first repository-native archive baseline

## GitHub Actions

Every exact-commit Archive and Hub check completed successfully for both the branch push and the open pull request.

| Commit | Event | Workflow | Run |
| --- | --- | --- | --- |
| `e0473808b5310f4d692a004d5e9d552d05504dd8` | push | Classroom Explorations Archive CI | [34706491058](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706491058) |
| `e0473808b5310f4d692a004d5e9d552d05504dd8` | push | Classroom Explorations Hub CI | [34706491025](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706491025) |
| `e0473808b5310f4d692a004d5e9d552d05504dd8` | pull request | Classroom Explorations Archive CI | [34706493366](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706493366) |
| `e0473808b5310f4d692a004d5e9d552d05504dd8` | pull request | Classroom Explorations Hub CI | [34706493356](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706493356) |
| `9deaf1723109c5259b5813d271a23d336d68559d` | push | Classroom Explorations Archive CI | [34706797309](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706797309) |
| `9deaf1723109c5259b5813d271a23d336d68559d` | push | Classroom Explorations Hub CI | [34706797314](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706797314) |
| `9deaf1723109c5259b5813d271a23d336d68559d` | pull request | Classroom Explorations Archive CI | [34706800481](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706800481) |
| `9deaf1723109c5259b5813d271a23d336d68559d` | pull request | Classroom Explorations Hub CI | [34706800482](https://github.com/ProfessorMinty/HughesWebAssets-Source/actions/runs/34706800482) |

The release verifier is now strict: removal of the established release tree fails instead of downgrading to a permitted pre-release state. The final doorway verifier is likewise required once its generated files are committed.

## CDN byte verification

`evidence/classroom-explorations-archive/release-2026-09-12/cdn-byte-verification.json` records 14 commit-pinned jsDelivr `GET` responses. Every response was HTTP 200 and byte-identical to the corresponding blob in release commit `9deaf1723109c5259b5813d271a23d336d68559d`.

- Evidence bytes: `7344`
- Evidence SHA-256: `7a263f814c72644a94820a8eeaf77967b112fd0992933b1dbcb63aea48b180f0`
- Bootstrap SHA-256: `45e0e3bff41a94016188107bf4989d1513fdad4522142ae5f4978a63426a0726`
- Bootstrap SRI: `sha256-ReDjv/QalAFhiBB79JidFRP9rUUiFCrl9JeKY0JqByY=`
- Publication SHA-256: `cd831376381214a6589c610ce538f1425ffc6867a6509c5da9192807ad3a2efd`
- Runtime release manifest SHA-256: `5df2b3da52574e29e657736b258123b2f971dde42c7687e4719e131e2aeaab6a`

The verifier uses `GET`, forbids redirects and mutable refs, reads comparison bytes from the exact Git commit rather than the working tree, checks all paths and contracts, and writes deterministic JSON evidence.

## Final doorway

The Page 2627 handoff is in `docs/edublogs-integration/classroom-explorations-archive/2025-2026/`.

- `HTML-BOX.html`: `784` bytes, `sha256:a40dce64d5d39e0c1d23d90ba6510a0165b17b0eb333374de9679b2a1ffc783d`
- `CSS-BOX.css`: `2828` bytes, `sha256:3ac01c786cdf56e53ff39a155419fa3d957d1a59bdd63b9c7a3750fca5a8dff3`
- `JAVASCRIPT-BOX.js`: `3243` bytes, `sha256:126bd6f63bc8e367a92f5eae258cf632f9f374a367f3e15e176e1d631e4cb589`
- `RELEASE-PIN.json`: `8383` bytes, `sha256:a5c83209cb4b915e2ae65907cadb902ad657064a06ef61befcea3698363a0391`

The HTML owns one semantic mount and a truthful outage fallback. The CSS is fallback-only and scoped to `body.page-id-2627`. The generated JavaScript loads the bootstrap and publication from the same exact commit, applies bootstrap SRI, and fails back to the truthful notice on script, runtime, or timeout failure.

## Real-browser evidence

The generated final doorway was loaded at `1920×911`, `1366×768`, `980×911`, and `390×844` in the isolated Codex in-app browser. It fetched the immutable CDN release and reached `data-hrv-state="ready"` with no console errors or warnings.

At `1920×911`, the browser reported one H1, seven global-navigation links, three exploration cards, five learning cards, two archive return controls, 15 of 15 images loaded, two repository style blocks, and no horizontal overflow beyond the viewport. All responsive checkpoints retained the same content counts, had no horizontal overflow, and reported no card-containment failures. Filtering to `Butterflies` produced exactly one visible exhibit and reset to all three.

The structured observation is `evidence/classroom-explorations-archive/release-2026-09-12/browser-cdn-verification.json` (`3760` bytes, `sha256:57a7246e84ed8bbf08cec416a02ce0c26c6466281190e5c57ed266c269a209af`). The approved visual screenshots remain:

- `evidence/classroom-explorations-archive/archive-desktop-1920x911.png`
- `evidence/classroom-explorations-archive/archive-desktop-full-1920x1090.png`
- `evidence/classroom-explorations-archive/archive-narrow-desktop-1366x768.png`
- `evidence/classroom-explorations-archive/archive-tablet-980x911.png`
- `evidence/classroom-explorations-archive/archive-mobile-390x844.png`

The source/runtime/style/image hashes exercised by those accepted local-build screenshots are identical to the 14-file CDN proof.

## Installation boundary and next gate

No Edublogs field was edited. Page 2627 still runs its legacy `8331606ba430e039a78174da3825c275fefa9c46` archive, Page 17 remains unchanged, current-Hub historical placeholders remain unchanged, and child-page backlinks remain unchanged.

Before Page 2627 can be replaced, its authenticated HTML, CSS, and JavaScript editor fields must be exported and hashed into `PRE-INSTALL-PRESERVATION.json`. Then the user can paste the three final doorway boxes together, retain `page_fullwidth.php`, and request signed-out live-browser verification. Only after that succeeds should the Hub current-year galleries be cleared of the temporary 2025–2026 placements and the later Page 17 migration proceed.
