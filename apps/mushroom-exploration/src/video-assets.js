// Source-verified research footage; no synthetic or interpolated frames.
export const MUSHROOM_MUSIC_DOCUMENTARY = {
  id:'mushroom-documentary:reuters-music',
  creator:'Reuters',
  title:'Musical Mushrooms: Fungi play instruments via electric sensors',
  watch:'https://www.youtube.com/watch?v=PVzPD4U-Lno',
  embed:'https://www.youtube-nocookie.com/embed/PVzPD4U-Lno?rel=0',
  page:'https://www.youtube.com/watch?v=PVzPD4U-Lno',
  license:'Official YouTube embed; copyright Reuters',
  licenseUrl:'https://www.youtube.com/static?template=terms',
  changes:'Linked and embedded from the official Reuters channel. No video download, rehosting or editing.'
};
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
  },
  {
    "id": "mushroom-video:puffball-cloud",
    "name": "A puffball sends out a cloud",
    "subject": "Lycoperdon pyriforme (name in the 2019 paper); a dried puffball squeezed in a research demonstration",
    "file": "./assets/puffball-spore-cloud.mp4",
    "poster": "./assets/puffball-cloud-poster.webp",
    "captions": "./assets/puffball-description.vtt",
    "width": 1068,
    "height": 600,
    "duration": 8.9,
    "captureFps": null,
    "playbackFps": 30,
    "slowdownFactor": 5,
    "silent": true,
    "creator": "Zhirnov and colleagues (2019), S1b",
    "authors": [
      "Anatoliy A. Zhirnov",
      "Nina N. Kudryashova",
      "Olga B. Kudryashova",
      "Nataliya V. Korovina",
      "Anatoliy A. Pavlenko",
      "Sergey S. Titov"
    ],
    "page": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0210754",
    "originalUrl": "https://journals.plos.org/plosone/article/file?id=10.1371/journal.pone.0210754.s001&type=supplementary",
    "license": "CC BY 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/4.0/",
    "licenseNote": "The primary article copyright notice grants Creative Commons Attribution; its linked license resolves to CC BY 4.0. S1 is identified as supporting information and has no separate restrictive credit notice.",
    "changes": "Video copied unchanged from the primary S1 ZIP; no crop, interpolation, retiming, colour alteration or added audio. Poster extracted at 4.0 seconds and encoded as WebP.",
    "originalSha256": "ddb7b075aefbb14392a3ccf0b5616485197b8c8b5a79211d6d37f9e23d01607b",
    "sourceArchiveSha256": "238e8a627e687a45ab19f363b898c09bc1f221d7c28474785bffae68821a892f",
    "verified": "2026-11-06",
    "files": [
      {
        "path": "./assets/puffball-spore-cloud.mp4",
        "sha256": "ddb7b075aefbb14392a3ccf0b5616485197b8c8b5a79211d6d37f9e23d01607b",
        "bytes": 742745,
        "mime": "video/mp4"
      },
      {
        "path": "./assets/puffball-cloud-poster.webp",
        "sha256": "a61c5881635adae003123ea258c9ce8f8bcb5e0460cd2856a068e9f15da52ef9",
        "bytes": 22268,
        "mime": "image/webp"
      },
      {
        "path": "./assets/puffball-description.vtt",
        "sha256": "811b7dd14fc299a5542e9be3e06cd83ce2f00c4c95478a325b6728612d740255",
        "bytes": 222,
        "mime": "text/vtt"
      }
    ]
  }
];

export function mushroomVideoAsset(url) {
  return MUSHROOM_VIDEOS.find(video => "asset:" + video.id === url) || null;
}
export function mushroomVideoURL(path) { return new URL(path, import.meta.url).href; }
