# Classroom Explorations presentation artwork

The project owner supplied and directed use of the three history-button images on 2026-08-30. The originals remain in `ProfessorMinty/NLL-Community-Assets` at immutable commit `50d747d1e83d42eeac8e5ebf7cc4810233ae7260`; that repository is a community sharing surface rather than the Hub's canonical source.

| Source file | Original size | Original SHA-256 | Runtime derivative | Derivative SHA-256 |
| --- | ---: | --- | --- | --- |
| `Past Exploration Button.png` | 1774×887 | `7e1819783f1693eee095718098cd7382848496fb8b5fffc5052e82547b797d45` | `src/assets/history/past-explorations.webp` (960×480) | `b524f0839bc50a38fde72ed418cb288753ca238eadb7e9cea3bf33d93625e983` |
| `Past TWWL Button.png` | 1774×887 | `4b4c7ff8464fa38cf319bd372140c44fd496ccf26c7729588277ee51cd5cd572` | `src/assets/history/past-twwl.webp` (960×480) | `dcece4282c73dce3026c8233d333bdde78082249392b45d159eb090fef76d425` |
| `PastYears Button.png` | 1983×793 | `e7a02874aa9e02cea9de92ca8b3c13ee6ff8aafcd3741dba6502dcfc4aa23036` | `src/assets/history/past-years.webp` (960×384) | `5c221b1f900d49cdc01c6c6fe45ea8340fabbb5ae299094e5708df05770941a4` |

The derivatives are geometry-preserving Lanczos resizes encoded with Pillow 12.3.0 as WebP (`quality=86`, `method=6`). They are application-owned presentation furniture, not classroom content records. The runtime builder packages and hashes them, the publication carries their immutable paths and digests, and the bootstrap verifies every byte before mounting the Hub.

## Hub banner frame

The project owner supplied and directed use of six transparent banner-frame PNGs on 2026-08-30. The supplied files byte-match `ProfessorMinty/NLL-Community-Assets` at immutable commit `50d747d1e83d42eeac8e5ebf7cc4810233ae7260`. Byte-exact copies are retained in `source-assets/banner-frame-originals/`; these retained originals are the Hub provenance boundary for the optimized runtime artwork.

| Retained source file | Original size | Original SHA-256 | Runtime derivative | Derivative SHA-256 |
| --- | ---: | --- | --- | --- |
| `TopLeftHubBannerFrame.png` | 724×2172 | `5f44d39eedaa59c48a486fba2ef3cc9342681871de24c47f1dd99129734df15c` | `src/assets/frame/top-left.webp` (362×1086) | `7a7a9cebcad631d3287211f8e7529e301cdaf9d70de55cd21a64fc505ead7c54` |
| `TopRightHubBannerFrame.png` | 724×2172 | `d8a2fca272fb1d470d5c459e8e9a036e80143a0058e27ade27f392b8a5a3b004` | `src/assets/frame/top-right.webp` (362×1086) | `c74cee00ba8504186647f8641126accabd0a2fcc8a832d9e0ffd6e017c79ba11` |
| `MiddleLeftHubBannerFrame.png` | 724×2172 | `20583a73fab1acc3bb662c913f827615e6f36b5750e40b08f7aca4a5629a1b75` | `src/assets/frame/middle-left.webp` (362×1086) | `81b0ee9ee9e93687ee1aaffb214feca1d31de986751318405b29f258eff565b7` |
| `MiddleRightHubBannerFrame.png` | 724×2172 | `50c2d5ae54a00b08c6d8bbd5c0c6930ab83c17b8284368dbf5d885158d404a9f` | `src/assets/frame/middle-right.webp` (362×1086) | `ec015b8e4f98f0eca9d48254b6b719e3826ea8927a78891151627378ce13c889` |
| `BottomLeftHubBannerFrame.png` | 724×2172 | `f710e726d7c5adeff6e696525e8b7c280ec0de7764a5bfb467efa217d7e08315` | `src/assets/frame/bottom-left.webp` (362×1086) | `4c41de2d714d324e565ab779fcd8e9c80e9ae181d654a95380ecfa3deed248b6` |
| `BottomRightHubBannerFrame.png` | 724×2172 | `022d538873ba6e787bb5a8496b4b0e595c4456d933fa6bff78a1f13853fdd5d9` | `src/assets/frame/bottom-right.webp` (362×1086) | `ad4450dba040a20a393fd026d00df644faed9be86e8e265ce730ee481ae91074` |

The frame derivatives preserve the 1:3 geometry and alpha channel. They are Lanczos resizes encoded with Pillow 12.3.0 as WebP (`quality=90`, `method=6`, `exact=true`). Like the history artwork, all six frame files are packaged, hashed, publication-addressed, fetched without credentials, and byte-verified by the bootstrap before the Hub mounts.
