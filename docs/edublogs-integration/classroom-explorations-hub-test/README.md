# Classroom Explorations Hub Phase 1 doorway

This directory contains the Edublogs doorway blocks for the review page:

- Public review URL: `https://rmhughes.edublogs.org/hub-test/`
- WordPress page ID: `2589`

Page `17` at `/hub/` remains untouched. It is a route identity and compatibility target, not a visual reference.

## Phase 1 immutable publication

```text
Asset commit:       6f4da0f5481fcc2d6af88c505a67d547ecadf8f8
Source revision:    96ae80965af17172631d208f8aafd2c568b43391
Runtime version:    2026.08.30.2
Publication:        pub-2026-08-30-002
Content snapshot:   sha256:46c27660085a39902ca043bdedd804010129937fd0cb1dc0b1199ddd18333a7b
Rollback target:    pub-2026-08-14-005
```

The doorway loads one SRI-protected canonical bootstrap from the exact asset commit. The bootstrap fetches the immutable publication, verifies the SHA-256 digest of the runtime, one application stylesheet, the host-compatibility stylesheet, and the projected content manifest, then mounts the application.

The active delivery chain is:

```text
page 2589 doorway
  -> releases/classroom-explorations-hub/runtime/2026.08.30.2/bootstrap.js
  -> releases/classroom-explorations-hub/publications/pub-2026-08-30-002/publication.json
  -> verified runtime.js
  -> verified hub.css
  -> verified host-compat.css
  -> verified content/.../manifest.json
```

There is no mutable branch URL, review bootstrap, alternate runtime, split application stylesheet set, or nested `@import` in this doorway.

## Phase 1 acceptance evidence

The exact asset commit passed both the push and pull-request GitHub Actions runs. Local and remote jsDelivr bytes matched for the bootstrap, runtime, application stylesheet, host stylesheet, publication, and content manifest.

The real projected application was exercised in a browser at `1920×911` with real external media. Acceptance included:

- Welcome Theater before Current Exploration;
- real Zinnia photography;
- all five real Past TWWL banners with nonzero natural dimensions;
- no emoji media substitutions;
- one application style and one host style;
- no alternate review assets;
- active star, aurora, compass, screen, greenhouse, lantern, botanical, hover, and pointer motion;
- no Hub-local Reduced Effects control;
- zero horizontal overflow;
- no browser console warnings or errors.

## Editor update boundary

Do not change page `17`. Do not change page `2589` HTML or CSS for this release.

When Arctic is authorized to update Edublogs, replace only the page-2589 JavaScript field with `JAVASCRIPT-BOX.js`.

## Failure behavior

The existing unavailable card remains the host-level fallback. The doorway hides it during startup and the canonical bootstrap replaces the mount only after all immutable assets pass integrity and contract checks. A load, integrity, compatibility, or timeout failure restores the unavailable state.
