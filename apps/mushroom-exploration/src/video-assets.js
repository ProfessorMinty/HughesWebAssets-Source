// Source-verified research footage; no synthetic or interpolated frames.
export const MUSHROOM_VIDEOS = [
  {
    "id": "mushroom-video:armillaria-release",
    "name": "A real spore launches",
    "subject": "Armillaria tabescens (name used in the 2009 paper)",
    "file": "./assets/armillaria-spore-launch.mp4",
    "poster": "./assets/armillaria-poster.webp",
    "captions": "./assets/armillaria-description.vtt",
    "width": 256,
    "height": 128,
    "duration": 5.35,
    "captureFps": 50000,
    "playbackFps": 20,
    "silent": true,
    "creator": "Stolze-Rybczynski and colleagues (2009), Video S1",
    "authors": [
      "Jessica L. Stolze-Rybczynski",
      "Yunluan Cui",
      "M. Henry H. Stevens",
      "Diana J. Davis",
      "Mark W. F. Fischer",
      "Nicholas P. Money"
    ],
    "page": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0004163",
    "originalUrl": "https://journals.plos.org/plosone/article/file?type=supplementary&id=10.1371/journal.pone.0004163.s003",
    "license": "Creative Commons Attribution",
    "licenseUrl": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0004163",
    "licenseNote": "The primary article notice grants Creative Commons Attribution reuse without naming a version. No version is inferred from inconsistent mirror metadata.",
    "changes": "Original AVI converted to H.264 MP4 at its original 256 × 128 resolution and 20 fps playback. No interpolation, cropping, retiming or added audio. Poster extracted from the recording.",
    "originalSha256": "46f1c068cc3696b3b5d9bd38f28dd280eccfec8c719d72a99ddaea34d7da5328",
    "verified": "2026-11-06",
    "files": [
      {
        "path": "./assets/armillaria-spore-launch.mp4",
        "sha256": "6b43c51f92e4030dd33e89dcbea36e0b181444a865028d03322f32f2cb2f5f14",
        "bytes": 35676,
        "mime": "video/mp4"
      },
      {
        "path": "./assets/armillaria-poster.webp",
        "sha256": "8a3c8740e038fdb9357aba2ee94fcdcb2a7d1c580488977a93060cc54ffdd880",
        "bytes": 1494,
        "mime": "image/webp"
      },
      {
        "path": "./assets/armillaria-description.vtt",
        "sha256": "9a7f3a0eb661344367414bda5cd263bc445024e1eeaf83f380a2312f53c6cfad",
        "bytes": 125,
        "mime": "text/vtt"
      }
    ]
  }
];

export function mushroomVideoAsset(url) {
  return MUSHROOM_VIDEOS.find(video => "asset:" + video.id === url) || null;
}
export function mushroomVideoURL(path) { return new URL(path, import.meta.url).href; }
