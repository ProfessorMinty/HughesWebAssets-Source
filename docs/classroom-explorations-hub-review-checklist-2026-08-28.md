# Classroom Explorations Hub review checklist

## Repository checks

- [ ] `node --check apps/classroom-explorations-hub/src/review-bootstrap.js`
- [ ] `node --check apps/classroom-explorations-hub/src/runtime-v3.js`
- [ ] `node --check tools/lib/classroom-explorations-hub-transactions.mjs`
- [ ] `npm run check:hub`
- [ ] Exact review commit has green Classroom Explorations Hub CI.
- [ ] Page-2589 doorway uses that exact immutable commit, not a mutable branch.
- [ ] No new branch was created for this incremental correction.
- [ ] No file outside the Hub contract, integration docs, schemas, tests, or package script changed unexpectedly.
- [ ] Production page 17 remains untouched.

## Stylesheet integrity

- [ ] Browser doorway requests each required module directly:
  - [ ] `hub-foundation.css`
  - [ ] `hub-hero-and-map.css`
  - [ ] `hub-feature-rooms.css`
  - [ ] `hub-galleries-and-motion.css`
  - [ ] `hub-responsive.css`
- [ ] No doorway or stylesheet references `hub-current-and-theater.css`.
- [ ] No doorway or stylesheet references `hub-galleries.css`.
- [ ] Missing app CSS restores the unavailable card rather than mounting a partial Hub.
- [ ] `hub-v3.css` imports the same five valid modules and no retired `hub-v1.css`/`hub-v2.css` layer.
- [ ] Responsive CSS contains no misspelled `#hrv-classroomexplorations-root` selectors.

## Authoring and route checks

- [ ] Zinnia is Current.
- [ ] Current TWWL is Coming Soon.
- [ ] Past Explorations are Mushrooms, Butterflies, Great Barrier Reef.
- [ ] Great Barrier Reef is last.
- [ ] Tubers is in Past TWWL.
- [ ] Archive 2025–2026 is published through route page 2627.
- [ ] Welcome video uses `kRTJp4pqbtg`.
- [ ] Page IDs, parents, slugs, paths, orders, and kinds match the accepted identity ledger.
- [ ] Historical Caterpillars/Cats route remains historical and is not accidentally shown as the corrected Butterflies card.

## Lanternworks contract checks

- [ ] Editor resolves every copy block by stable node ID.
- [ ] Stable IDs cannot be edited.
- [ ] WordPress page IDs cannot be changed by ordinary content commands.
- [ ] Commands require both source and route revisions.
- [ ] Stale commands are rejected.
- [ ] Current Exploration swap can atomically register route + content + composition.
- [ ] Incoming Current content is removed from Past.
- [ ] Outgoing Current content is archived when requested.
- [ ] Coming Soon is represented as a slot state.
- [ ] Transaction output includes exact before/after hashes and documents.
- [ ] Page 17 is explicitly prohibited during review publication.

## Global-shell and motion ownership

- [ ] Hub renders no page-local Reduced Effects button.
- [ ] Hub runtime contains no Hub-specific effects localStorage key.
- [ ] Hub runtime does not persist a private Reduced Effects product mode.
- [ ] Operating-system reduced-motion behavior is limited to motion safety.
- [ ] Persistent Reduced Effects remains a global-shell responsibility.

## Page 2589 review

- [ ] Existing HTML has no inline animal SVG.
- [ ] Existing fallback CSS remains small and page-local.
- [ ] Replace only the JavaScript field with the immutable `.5-review` handoff.
- [ ] Successful startup replaces the fallback.
- [ ] Blocked runtime, JSON, host CSS, or any app CSS restores the fallback.
- [ ] `/hub-test/` does not redirect or mutate `/hub/`.
- [ ] Signed-out desktop rendering is verified.
- [ ] Tablet rendering is verified.
- [ ] Phone rendering is verified.
- [ ] Keyboard-only navigation, skip link, and focus indicators are verified.
- [ ] Video playback and title are correct.
- [ ] Every content card opens the expected route.
- [ ] The real Zinnia photograph is present.
- [ ] Image failures produce graceful illustrated fallbacks.
- [ ] Edublogs header, navigation, footer, back-to-top control, and admin bar do not overlap the repository application.

## 1920×911 visual checks

- [ ] Environment touches both viewport edges beneath normal Edublogs navigation.
- [ ] Hero, Theater, Current, galleries, and archive use the intended lateral layouts.
- [ ] Welcome remains before Current.
- [ ] Current uses the real photograph and fits comfortably in the desktop viewport.
- [ ] Star layers visibly drift/breathe at full motion.
- [ ] Aurora, lantern, botanical, and gallery motion are present but restrained.
- [ ] Primary mint action text is dark and readable.
- [ ] Native footer continues the dark museum palette rather than introducing a teal/white floor.
- [ ] Atkinson Hyperlegible carries reading copy; Nunito Sans carries structural text.
- [ ] Muted text remains visibly secondary without becoming faint.
- [ ] No horizontal overflow appears.

## Production gate

- [ ] Review workstream accepted.
- [ ] Exact immutable production artifact selected.
- [ ] Immutable runtime and content snapshot minted.
- [ ] Publication hashes verified.
- [ ] Lanternworks publisher certified against the accepted command contract.
- [ ] Host rollback package preserved.
- [ ] Only then prepare a separate page-17 doorway change for explicit approval.
