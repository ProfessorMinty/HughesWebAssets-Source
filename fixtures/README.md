# Fixtures

Files here are local contract fixtures for automated tests and offline development checks. They are not production manifests and must never be treated as historical Hughes Room Views content.

`manifests/current-v1.fixture.json` uses only fields verified in the permanent Worker's public version 1 manifest on 2026-08-10:

- top level: `version`, `albumId`, `schoolYear`, `source`, `generatedAt`, `albums`, `photos`;
- album: `id`, `name`, `photoCount`;
- photo: `id`, `revision`, `albumId`, `albumName`, `name`, `alt`, `url`, `fullSizeUrl`.

The URLs use the documented `/media/derivatives/gallery/` and `/media/derivatives/full/` shapes on a non-resolving `.test` host.
