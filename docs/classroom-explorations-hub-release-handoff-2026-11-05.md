# Hub release preparation — 2026-11-05

This is a build handoff between Lanternworks' approved proposals and the existing repository release tools. It is not an activated publisher. The production host in `hub.control.json` remains disabled.

Lanternworks exports `lanternworks-hub-release/1.0.0` only after an independent approval, exact proposal revision, unexpired release window, live Source lookup, pinned control check, and replay of the owning transaction. Both authoring and routes are included in the before/after hashes. Downloaded JSON itself is untrusted and cannot authorize a live write.

From a trusted checkout with the proposal base in its history:

```sh
node tools/prepare-classroom-explorations-hub-release.mjs /path/to/handoff.json /path/to/new-review-directory
```

The command replays the transaction, validates all four document schemas, binds the before documents to the exact base Git objects and current checkout, and writes to a new output directory. It produces proposed authoring/routes, the deterministic content manifest, Source rollback documents, and the hash-checked repository doorway baseline. It leaves Source and Edublogs unchanged and refuses to replace an existing output directory. It can run in a CI checkout; the user's computer is not part of the architecture.

`release-plan.json` lists each artifact's hash and the remaining release gates. Review and commit both proposed Source documents together. Then use the existing content/runtime builders, immutable publication staging, 16-file CDN verifier, and doorway generator, binding `sourceRevision` to the newly committed Source documents. The previous publication is carried from the current repository pin. Do not use the proposal base as the new Source revision.

Normal production doorway generation now verifies its content against the committed Source projection instead of requiring the initial cutover's empty galleries. Existing preservation, immutable release, CDN-byte and SRI checks remain in place. This permits routine swaps while rejecting unrelated release content.

## Installation and rollback boundary

The copied rollback doorway is explicitly **repository baseline only**, not a capture of the currently installed page. Before any CMS replacement, an authenticated writer must capture the actual three fields and preserve page ID, slug, parent, template, title and unrelated blocks. It must recheck the installed revision, record a durable write attempt, save all fields together, read them back, and verify public rendering. A lost response must be reconciled by readback before retrying. Rollback must restore that captured known-good doorway with equivalent revision and readback checks; Source rollback is a separate reviewed transaction.

The initial browser inspection reached Edublogs' sign-in screen. A subsequent signed-in inspection confirmed the native three-field `core/html` post format and found an existing WordPress.com OAuth connection in the Cloudflare Photo Album mirror. That connection is the candidate for reuse; its live page privileges and script-preserving round trip remain unverified. An administrator-only OAuth read probe and content/rollback preparation are being reviewed in Lanternworks. No separate CMS meta fields, application-password requirement or atomic CAS guarantee is assumed. Automatic GitHub release publication and the authenticated CMS writer remain to be connected and rehearsed on Page 2589 before production activation. This preparation work must not be reported as a finished Hub Swapper.

Validation: `npm run test:hub:handoff` covers independent input checks, outgoing archival, preservation of historical lessons, normal populated galleries, stale/control/tampered input, exact build output and rollback hashes, unchanged checkout, and refusal to overwrite output. Hub CI runs it without live credentials.
