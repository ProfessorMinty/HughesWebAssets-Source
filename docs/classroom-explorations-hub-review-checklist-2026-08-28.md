# Classroom Explorations Hub review checklist

## Repository checks

- [ ] `node --check apps/classroom-explorations-hub/src/review-bootstrap.js`
- [ ] `node --check apps/classroom-explorations-hub/src/runtime-v3.js`
- [ ] `node --check tools/lib/classroom-explorations-hub-transactions.mjs`
- [ ] `npm run check:hub`
- [ ] Confirm no file outside the Hub contract, integration docs, schemas, tests, or package script changed unexpectedly.
- [ ] Confirm production page 17 remains untouched.

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
- [ ] Operating-system reduced-motion behavior is limited to motion safety and does not expose a competing product control.
- [ ] The future persistent Reduced Effects control remains a global-shell responsibility.

## Page 2589 review

- [ ] Paste only the three blocks from `docs/edublogs-integration/classroom-explorations-hub-test/`.
- [ ] Confirm the confused-puppy fallback appears before JavaScript starts.
- [ ] Confirm successful startup replaces the fallback.
- [ ] Confirm blocked JavaScript, blocked JSON, blocked CSS, or network timeout restores the fallback.
- [ ] Confirm `/hub-test/` does not redirect or mutate `/hub/`.
- [ ] Confirm signed-out desktop rendering.
- [ ] Confirm tablet rendering.
- [ ] Confirm phone rendering.
- [ ] Confirm keyboard-only navigation.
- [ ] Confirm skip link.
- [ ] Confirm focus indicators.
- [ ] Confirm video playback and title.
- [ ] Confirm every content card opens the expected route.
- [ ] Confirm image failures produce graceful illustrated fallbacks.
- [ ] Confirm Edublogs header, navigation, footer, and admin bar do not overlap the repository application.

## 1920×911 full-width and text checks

- [ ] Environment touches both viewport edges beneath normal Edublogs navigation.
- [ ] Hero and major exhibit rooms no longer read as an 1180px middle-column application.
- [ ] No blank settings/control row remains below the hero.
- [ ] Atkinson Hyperlegible carries body copy, labels, metadata, controls, and actions.
- [ ] Nunito Sans carries structural room headings and card titles.
- [ ] Scoped display typography is limited to major museum/feature titles.
- [ ] Major room headings remain at least approximately 40px on desktop.
- [ ] Important labels remain at least 14px.
- [ ] Body/card summaries remain approximately 18–20px.
- [ ] Primary actions remain at least 16px with approximately 44–50px targets.
- [ ] Muted text remains visibly secondary without becoming faint.
- [ ] No horizontal overflow appears.

## Production gate

- [ ] Review branch accepted.
- [ ] Exact immutable commit selected.
- [ ] Immutable runtime and content snapshot minted.
- [ ] Publication hashes verified.
- [ ] Lanternworks publisher certified against the accepted command contract.
- [ ] Host rollback package preserved.
- [ ] Only then prepare a separate page-17 doorway change for explicit approval.
