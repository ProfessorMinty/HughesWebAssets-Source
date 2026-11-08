let mushroomReleaseAssetBase=import.meta.url;
export function configureMushroomReleaseAssetBase(url){const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw new Error('Invalid release asset base');mushroomReleaseAssetBase=parsed.href;}
// Verified photographic assets. Asset files retain the licence listed for each image.
export const MUSHROOM_PHOTOS = [
  {
    "id": "mushroom-photo:blue-mycena",
    "name": "Blue forest mushrooms",
    "subject": "Mycena interrupta",
    "type": "Macro photograph",
    "creator": "JJ Harrison",
    "page": "https://commons.wikimedia.org/wiki/File:Mycena_interrupta.jpg",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "fit": "cover",
    "originalDimensions": [
      2090,
      1416
    ],
    "file": "./assets/blue-mycena.webp",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/16/Mycena_interrupta.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    "originalSha256": "abf937bb0a08bc5a5450be3a7ec88583e1c5d1ae1cc20f53cff0b32021c43972",
    "sha256": "37a20c75a02153df418a199b43925dd07472c8fd18d48e40dafed01f80f742b3",
    "width": 1600,
    "height": 1084,
    "bytes": 296744,
    "verified": "2026-11-06",
    "changes": "Resized and converted to WebP; no retouching. The preview may crop the frame; the full view shows the whole image."
  },
  {
    "id": "mushroom-photo:rhizopus-macro",
    "name": "A forest of tiny spore cases",
    "subject": "Rhizopus stolonifer on a strawberry",
    "type": "Close-up photograph",
    "creator": "Eric McKenzie",
    "page": "https://commons.wikimedia.org/wiki/File:Rhizopus_stolonifer_on_a_strawberry_showing_black_sporangia.jpg",
    "license": "CC BY 3.0 AU",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/au/",
    "fit": "contain",
    "originalDimensions": [
      720,
      540
    ],
    "file": "./assets/rhizopus-macro.webp",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/1/1c/Rhizopus_stolonifer_on_a_strawberry_showing_black_sporangia.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    "originalSha256": "f42cfb7cffade2614935ce958252ef33206e1dd6d2f9fae9aa3a12276d6ee0f3",
    "sha256": "ae8bb6008d0ca94b28c79ce97700be2ee61d1dcd3588e14c2055627044ba9eb4",
    "width": 720,
    "height": 540,
    "bytes": 76166,
    "verified": "2026-11-06",
    "changes": "Resized and converted to WebP; no retouching. The preview may crop the frame; the full view shows the whole image."
  },
  {
    "id": "mushroom-photo:yeast-dic",
    "name": "A tiny world of yeast cells",
    "subject": "Saccharomyces cerevisiae",
    "type": "Microscope photograph · DIC",
    "creator": "Masur",
    "page": "https://commons.wikimedia.org/wiki/File:S_cerevisiae_under_DIC_microscopy.jpg",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:S_cerevisiae_under_DIC_microscopy.jpg#Summary",
    "fit": "contain",
    "originalDimensions": [
      1560,
      1560
    ],
    "file": "./assets/yeast-dic.webp",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/d9/S_cerevisiae_under_DIC_microscopy.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    "originalSha256": "1dfe8508a9d59f6ab985c33e2c64d6465979c0bb13ed372dc8b5ebd7339e8663",
    "sha256": "4acb94e0948059fb1a19f5981ae6da1e6d6b186d9c1234ba5cbc7f84707dc22d",
    "width": 1560,
    "height": 1560,
    "bytes": 80758,
    "verified": "2026-11-06",
    "changes": "Resized and converted to WebP; no retouching. The preview may crop the frame; the full view shows the whole image."
  },
  {
    "id": "mushroom-photo:gill-macro",
    "name": "Under a real mushroom cap",
    "subject": "Mushroom gills; species not specified",
    "type": "Macro photograph",
    "creator": "Jonathan Cutrer",
    "page": "https://commons.wikimedia.org/wiki/File:Macro_Mushroom_Gills_(28584143483).jpg",
    "license": "CC BY 2.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/2.0/",
    "fit": "cover",
    "originalDimensions": [
      2448,
      3264
    ],
    "file": "./assets/gill-macro.webp",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Macro_Mushroom_Gills_%2828584143483%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    "originalSha256": "035d8fd3a04d24a846ad21b4c93d35d3ba550f43ebbf4a2b310a0745afc77e63",
    "sha256": "e36087371a774fcda88eebb3b4bb069ef35a994f6349cb3b79a0a1bb64390d34",
    "width": 1200,
    "height": 1600,
    "bytes": 148350,
    "verified": "2026-11-06",
    "changes": "Resized and converted to WebP; no retouching. The preview may crop the frame; the full view shows the whole image."
  },
  {
    "id": "mushroom-photo:mycelium-wood",
    "name": "Real threads on wood",
    "subject": "Mycelium on wood; species not specified",
    "type": "Close-up photograph",
    "creator": "Jerzy Opioła",
    "page": "https://commons.wikimedia.org/wiki/File:Mycelium_a1(2).jpg",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "fit": "cover",
    "originalDimensions": [
      1950,
      1462
    ],
    "file": "./assets/mycelium-wood.webp",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/f/f7/Mycelium_a1%282%29.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    "originalSha256": "5a806bd0b485b19bf576ed2fe506be6637080f53a12d56e4878edbf823e7c54a",
    "sha256": "fb89a7ee1af06622718e404fe39a6730bb242efd9677a4470a150e99964a82c0",
    "width": 1600,
    "height": 1200,
    "bytes": 210042,
    "verified": "2026-11-06",
    "changes": "Resized and converted to WebP; no retouching. The preview may crop the frame; the full view shows the whole image."
  },
  {
    "id": "mushroom-photo:glowing-panellus",
    "name": "Fungi that make their own light",
    "subject": "Panellus stipticus",
    "type": "Long-exposure photograph · 517 seconds",
    "creator": "Ylem",
    "page": "https://commons.wikimedia.org/wiki/File:PanellusStipticusAug12_2009.jpg",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/File:PanellusStipticusAug12_2009.jpg#Summary",
    "fit": "cover",
    "originalDimensions": [
      1200,
      800
    ],
    "file": "./assets/glowing-panellus.webp",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/e/e8/PanellusStipticusAug12_2009.jpg?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original",
    "originalSha256": "b9b6d8c687e238a40c7a543c9b05f814bf32258a617bbfb891f7bc927ab284f3",
    "sha256": "318e162d31ac9d7f0253a649b0b8c5074d07a3d43e1bf8cf55008a677795a1c7",
    "width": 1200,
    "height": 800,
    "bytes": 160234,
    "verified": "2026-11-06",
    "changes": "Resized and converted to WebP; no retouching. The preview may crop the frame; the full view shows the whole image."
  }
];

// Published illustrations: creator, source, licence and byte provenance.
export const MUSHROOM_DIAGRAMS = [
  {
    "id": "mushroom-diagram:anatomy",
    "name": "Parts of a mushroom",
    "creator": "Zhousun21; public-domain base illustration by Gustav Kaiserling",
    "page": "https://commons.wikimedia.org/wiki/File:Parts_of_a_mushroom.jpg",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/2/22/Parts_of_a_mushroom.jpg",
    "originalExtension": ".jpg",
    "license": "CC0 1.0",
    "licenseUrl": "https://creativecommons.org/publicdomain/zero/1.0/",
    "alt": "Published labelled mushroom anatomy plate showing the cap, gills, ring, stem, volva and mycelial threads.",
    "caption": "Find the cap, gills, stem and threads on this labelled mushroom.",
    "file": "./assets/diagram-anatomy.webp",
    "width": 1199,
    "height": 1000,
    "bytes": 394920,
    "sha256": "bb29915ae88d01d2043d8cfec2f0a3217d436bacae6fc2f9e793afc05c7c19f3",
    "originalBytes": 128353,
    "originalSha256": "0ac3bce5e37d487fadd057f9de44b5eb8d7b7cb0463072c72c35d97965d42919",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. No redrawing, relabelling, cropping or recolouring.",
    "type": "Published diagram",
    "subject": "Find the cap, gills, stem and threads on this labelled mushroom.",
    "fit": "contain"
  },
  {
    "id": "mushroom-diagram:structure",
    "name": "Mushroom structure and sections",
    "creator": "Tomasz Świdziński, Ania Dryżałowska, Égoïté, ArséniureDeGallium and Βερναρδ",
    "page": "https://commons.wikimedia.org/wiki/File:Sch%C3%A9ma_champignon_sans_texte.png",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/0c/Sch%C3%A9ma_champignon_sans_texte.png",
    "originalExtension": ".png",
    "license": "CC BY 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by/3.0/",
    "alt": "Published illustration of a gilled mushroom and a cut-open bolete, with fungal threads extending from their bases.",
    "caption": "Two different mushroom bodies connect to branching fungal threads.",
    "file": "./assets/diagram-structure.webp",
    "width": 950,
    "height": 512,
    "bytes": 242698,
    "sha256": "5f90b79b6ab878e588379573abd60d338fe1d3d0969b3c1bdbe8d1d55664787c",
    "originalBytes": 365563,
    "originalSha256": "560064a5151286f154f494273d56cadfc93c5bc2d5cbf4abd6e13ff944ca255c",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. No redrawing, relabelling, cropping or recolouring.",
    "type": "Published diagram",
    "subject": "Two different mushroom bodies connect to branching fungal threads.",
    "fit": "contain"
  },
  {
    "id": "mushroom-diagram:cycle",
    "name": "Life cycle of Agaricus",
    "creator": "Meike Piepenbring",
    "page": "https://commons.wikimedia.org/wiki/File:03_02_09_life_cycle_of_Agaricus_sp.,_Agaricales_Basidiomycota_(M._Piepenbring).png",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/9/9b/03_02_09_life_cycle_of_Agaricus_sp.%2C_Agaricales_Basidiomycota_%28M._Piepenbring%29.png",
    "originalExtension": ".png",
    "license": "CC BY-SA 3.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/3.0/",
    "alt": "Published Agaricus life-cycle diagram showing a mushroom and its gills, spore formation, germination, joining hyphae and the return to a mushroom.",
    "caption": "Follow the arrows from spores to growing threads and back to a mushroom.",
    "file": "./assets/diagram-cycle.webp",
    "width": 1800,
    "height": 1350,
    "bytes": 325716,
    "sha256": "a6fa14719bb8c1fee0013cafda6a50b51d7a9ad6ac63e0d59bc1d17b4e299fc9",
    "originalBytes": 1253121,
    "originalSha256": "4e17e48e492f1374bfa256b1d9a5b6804fdf6f4bf2d991bb8b870bdadb402962",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. No redrawing, relabelling, cropping or recolouring.",
    "type": "Published diagram",
    "subject": "Follow the arrows from spores to growing threads and back to a mushroom.",
    "fit": "contain"
  },
  {
    "id": "mushroom-diagram:digestion",
    "name": "Fungi external digestion",
    "creator": "Sarah Greenwood",
    "page": "https://commons.wikimedia.org/wiki/File:Fungi_External_Digestion.png",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/5/52/Fungi_External_Digestion.png",
    "originalExtension": ".png",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "alt": "Published diagram showing enzymes released outside a fungal hypha and small digested food molecules absorbed by the fungus.",
    "caption": "Fungi break food down outside their threads, then take in small food molecules.",
    "file": "./assets/diagram-digestion.webp",
    "width": 1800,
    "height": 868,
    "bytes": 88676,
    "sha256": "292c5ddc28023186b57ec633da26aedcb708c12d4fc1b09a430c5e117137c4ab",
    "originalBytes": 128941,
    "originalSha256": "4ec275b35497aab111892c18b532f177c096630cfb5569272fcec09b8d00d90a",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. Transparent background composited on white for legibility. No redrawing, relabelling, cropping or subject recolouring.",
    "type": "Published diagram",
    "subject": "Fungi break food down outside their threads, then take in small food molecules.",
    "fit": "contain"
  },
  {
    "id": "mushroom-diagram:partnership",
    "name": "Mycorrhizal network",
    "creator": "Charlotte Roy, Salsero35 and Nefronus",
    "page": "https://commons.wikimedia.org/wiki/File:Mycorrhizal_network.svg",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/d/de/Mycorrhizal_network.svg",
    "originalExtension": ".svg",
    "license": "CC BY-SA 4.0",
    "licenseUrl": "https://creativecommons.org/licenses/by-sa/4.0/",
    "alt": "Published diagram of plants above ground and fungal networks associated with roots below ground, with arrows for exchanges.",
    "caption": "Some fungi and plant roots form partnerships below the soil.",
    "file": "./assets/diagram-partnership.webp",
    "width": 1600,
    "height": 1319,
    "bytes": 400722,
    "sha256": "ae1788bbf639fef3c20dc4885e0ae2aae5e832358e556ceaaca8260efdca1e9b",
    "originalBytes": 610438,
    "originalSha256": "27c8e0d4c90aa0f0ed34ddb3b00ddd4fc29916cb452fa0ef9ea8cf9075968e3e",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. Transparent background composited on white for legibility. No redrawing, relabelling, cropping or subject recolouring.",
    "type": "Published diagram",
    "subject": "Some fungi and plant roots form partnerships below the soil.",
    "fit": "contain"
  },
  {
    "id": "mushroom-diagram:spore-release",
    "name": "The process of ballistospore discharge, Figure 1",
    "creator": "Jessica L. Stolze-Rybczynski, Yunluan Cui, M. Henry H. Stevens, Diana J. Davis, Mark W. F. Fischer and Nicholas P. Money (2009); panel b after A. H. R. Buller",
    "page": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0004163",
    "originalUrl": "https://journals.plos.org/plosone/article/figure/image?download=&id=10.1371%2Fjournal.pone.0004163.g001&size=large",
    "originalExtension": ".png",
    "license": "Creative Commons Attribution (article notice)",
    "licenseUrl": "https://journals.plos.org/plosone/article?id=10.1371/journal.pone.0004163",
    "alt": "Published research figure showing a spore with a droplet, a drawing of short spore paths between gills, and successive microscope frames of a spore launching.",
    "caption": "A tiny droplet helps launch a spore clear of the gill. The microscope images show a real launch.",
    "file": "./assets/diagram-spore-release.webp",
    "width": 1800,
    "height": 943,
    "bytes": 455020,
    "sha256": "a0fc1d878b8718467fe053cbd9472fc3c2dfb6a004bc5edb2b2dfd868f5603ad",
    "originalBytes": 1301786,
    "originalSha256": "c032a39611182d416ad1316d95d990e90d491abaf062880ae496d5973ad7ae7d",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. No redrawing, relabelling, cropping or recolouring.",
    "type": "Published diagram",
    "subject": "A tiny droplet helps launch a spore clear of the gill. The microscope images show a real launch.",
    "fit": "contain"
  },
  {
    "id": "mushroom-diagram:mushroom",
    "name": "Mushroom line illustration",
    "creator": "Pearson Scott Foresman",
    "page": "https://commons.wikimedia.org/wiki/File:Mushroom_(PSF).png",
    "originalUrl": "https://upload.wikimedia.org/wikipedia/commons/0/00/Mushroom_%28PSF%29.png",
    "originalExtension": ".png",
    "license": "Public domain",
    "licenseUrl": "https://commons.wikimedia.org/wiki/Commons:Pearson_Scott_Foresman",
    "alt": "Published textbook line illustration of a gilled mushroom, viewed from the side and underneath its cap.",
    "caption": "The gills sit under the cap. After release, spores can be carried by moving air.",
    "file": "./assets/diagram-mushroom.webp",
    "width": 1779,
    "height": 1694,
    "bytes": 254124,
    "sha256": "a5c4e4cd82b764e6776ce13b06e312b7e54b6a5895a34955ce261c02ce2695ca",
    "originalBytes": 317430,
    "originalSha256": "d1591806725bab269caa72b7f5b677c1a2cea272fa06f77946daa4d7b210de5c",
    "changes": "Converted to lossless WebP and resized to at most 1800 pixels. No redrawing, relabelling, cropping or recolouring.",
    "type": "Published diagram",
    "subject": "The gills sit under the cap. After release, spores can be carried by moving air.",
    "fit": "contain"
  }
];




export function mushroomPhotoAsset(url) {
  if (typeof url !== 'string' || !url.startsWith('asset:')) return null;
  return [...MUSHROOM_PHOTOS,...MUSHROOM_DIAGRAMS].find(photo => 'asset:' + photo.id === url) || null;
}
export function mushroomDiagramReference(id){const item=MUSHROOM_DIAGRAMS.find(item=>item.id==='mushroom-diagram:'+id);if(!item)throw new Error('Unknown published diagram');return {kind:'image',url:'asset:'+item.id,alt:item.alt,caption:item.caption};}
export function mushroomPhotoURL(url) {
  const photo = mushroomPhotoAsset(url);
  if (photo) return new URL(photo.file, mushroomReleaseAssetBase).href;
  if (typeof url === 'string' && url.startsWith('https://')) return url;
  throw new Error('Unknown or unsafe mushroom image reference.');
}

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
export function mushroomVideoURL(path) { return new URL(path, mushroomReleaseAssetBase).href; }



export const MUSHROOM_CONTRACT_VERSION = "mushroom-exploration/1.10.0";

const fields = {
  hero: ["eyebrow", "title", "intro", "sourceRefs", "media", "entry"],
  family: ["eyebrow", "title", "intro", "sourceRefs", "cards", "station"],
  anatomy: ["eyebrow", "title", "intro", "sourceRefs", "media", "detailMedia", "hotspots"],
  cutaway: ["eyebrow", "title", "intro", "sourceRefs", "media", "views", "growth"],
  lifecycle: ["eyebrow", "title", "intro", "sourceRefs", "steps", "video", "plumeVideo", "activities", "station", "launch", "wind", "cycle", "recording"],
  roles: ["eyebrow", "title", "intro", "sourceRefs", "cards"],
  lab: ["eyebrow", "title", "intro", "sourceRefs", "experiments", "music"],
  facts: ["eyebrow", "title", "intro", "sourceRefs", "cards", "questions"],
  journal: ["eyebrow", "title", "intro", "sourceRefs", "currentStage", "entries"]
};
Object.values(fields).forEach(list => list.push("learning","label"));
export const MUSHROOM_UI_FIELDS = ['brand','navLabel','skipLabel','noticePrefix','wordsTitle','sourcesTitle','photoClose','photoFallbackTitle','photoEnlargeTemplate','photographLabel','photoZoom','photoChangeSuffix','heroArtworkLabel','partGroup','partCountTemplate','partNameTemplate','anatomyModelNote','chooseActivity','chooseActivityTemplate','nextTemplate','exhibitPrefix','jobPrefix','roleGroup','cutawayGroup','realFootage','captionTrack','bridgeCap','bridgeGill','bridgeSpore','quizEyebrow','footerLabel','footerLink','journalHeading','journalBody'];
const narrationFields=['read','stop','options','voiceLabel','ready','reading','complete','stopped','unavailable','error','starting','none','voiceHelp'];
const uiTemplates={photoEnlargeTemplate:['name'],partCountTemplate:['index','total'],partNameTemplate:['index','name'],chooseActivityTemplate:['title'],nextTemplate:['title']};
export function mushroomCopy(template,values){return template.replace(/\{([a-z]+)\}/g,(match,key)=>Object.hasOwn(values,key)?String(values[key]):match);}
export const MUSHROOM_ACTIVITY_VIEWS = ["launch", "wind", "puffball", "cycle"];
const processLabels={growth:[],recycle:['material','threads','food','nutrients','evidence'],trade:['sunlight','root','threads','sugar','water','both'],dough:['outline','gas','bowl'],launch:['spore','drop','film','stalk'],wind:['breeze','left','still','right','left-state','right-state']};
const processStepCounts={growth:4,recycle:3,trade:2,dough:3,launch:3,wind:3};
const recordingFields=['play','pause','replay','fullscreen','paused','playing','finished','error','retry','fullscreenError','silentMicroscope','silentPuffball'];
const musicControls=['play','pause','resume','replay','stop','volume','previous','next','pattern','motion'];
const musicMessages=['ready','playing','starting','paused','complete','error','silent','pattern','lessMotion'];
const musicTexts=['demoRetry','demoLoading','demoReady','demoPlaying','demoPaused','demoEnded','demoBuffering','demoBlocked','demoError','demoTimeout','demoUnavailable','instrumentTitle','detailsTitle','noteStripLabel','loadDemo','closeDemo','demoPlayerTitle','demoFallback','chainLabel','limits','exampleLabel','mapping','graphLabel','high','low','time','noteTemplate','observationTitle','demoTitle','demoBody','demoLinkLabel','demoNote'];

export const MUSHROOM_EDITOR_CONTRACT = {
  schemaVersion: MUSHROOM_CONTRACT_VERSION,
  sourceDocument: "apps/mushroom-exploration/source/mushrooms.source.json",
  photoCatalog: "apps/mushroom-exploration/source/mushrooms.assets.json",
  videoCatalog: "apps/mushroom-exploration/source/mushrooms.assets.json",
  editorRoute: "/mushrooms",
  editorLabel: "Mushinator",
  editorImplementation: "journal-editor-built; deployment verification pending",
  protectedFields: ["schemaVersion", "page", "data.meta", "data.sources", "block.id", "block.type", "nested record IDs", "process mode and phase/label IDs"],
  layout: { mode: "viewport-breakout", referenceViewport: { width: 1920, height: 911 } },
  blocks: Object.entries(fields).map(function (entry) {
    return { type: entry[0], editableFields: entry[1], identityField: "id" };
  }),
  journalImplementation: "separate versioned journal index and day records; private Mushinator drafts; credential-gated repo publisher",
  journalContract: { schemaVersion:"1.0.0", indexDocument:"apps/mushroom-exploration/source/journal/index.json", recordsDirectory:"apps/mushroom-exploration/source/journal/days/", cardTypes:["observation","fact","teacher-note","student-note"], authorRequired:false, mushroomTypeRequired:false },
  publicationAvailable: false
};
MUSHROOM_EDITOR_CONTRACT.interface={sourcePath:'data.ui',editableFields:[...MUSHROOM_UI_FIELDS,'narration'],narrationFields};

export function mushroomSourceJsonSchema() {
  const short = { type: "string", maxLength: 140, minLength: 1 };
  const body = { type: "string", maxLength: 6000 };
  const recordId = { type: "string", pattern: "^mushroom-[a-z]+:[a-z0-9]+(?:-[a-z0-9]+)*$" };
  const sourceRefs = { type: "array", maxItems: 12, items: { type: "string" } };
  const obj = function (properties) { return { type: "object", additionalProperties: false, required: Object.keys(properties), properties: properties }; };
  const list = function (items, maxItems) { return { type: "array", maxItems: maxItems, items: items }; };
  const imageUrl = { anyOf: [{ type: "string", format: "uri", pattern: "^https://" }, { enum: MUSHROOM_PHOTOS.map(photo => 'asset:' + photo.id) }] };
  const image = { anyOf: [{ type: "null" }, obj({ kind: { const: "image" }, url: imageUrl, alt: { type: "string", minLength: 1, maxLength: 500 }, caption: { type: "string", maxLength: 600 } })] };
  const research = { id: recordId, body: body, sourceRefs: sourceRefs };
  const learning = obj({ action: shortText(), observe: shortText(), safety: shortText(), teacher: body,
    words: list(obj({ id: recordId, term: short, pronunciation: {type:"string",maxLength:120}, body, sourceRefs }), 12) });
  function shortText(){ return { type:"string", maxLength:600 }; }
  const station = obj({ title: short, intro: {type:"string",maxLength:600} });
  const process = mode => obj({id:{const:'mushroom-process:'+mode},mode:{const:mode},label:shortText(),initial:shortText(),playing:shortText(),finished:shortText(),lessMotion:shortText(),controls:obj(Object.fromEntries(['play','replay','pause','resume','step','reset','motion'].map(key=>[key,short]))),steps:{...list(obj({id:recordId,label:short,body:shortText()}),processStepCounts[mode]),minItems:processStepCounts[mode]},labels:{...list(obj({id:recordId,text:short}),processLabels[mode].length),minItems:processLabels[mode].length}});
  const video = {anyOf:[{type:'null'},obj({kind:{const:'video'},url:{enum:MUSHROOM_VIDEOS.map(item=>'asset:'+item.id)},title:short,caption:{type:'string',minLength:1,maxLength:600},sourceRefs})]};
  const shapes = {
    hero: { media: image, entry: obj({exploreLabel:short,journalLabel:short,journalReadyLabel:short,note:{type:"string",maxLength:600}}) },
    family: { station, cards: list(obj({ ...research, title: short, visual: { enum: ["mushroom", "mould", "yeast", "leaf", "tree", "bread"] }, media: image }), 6) },
    anatomy: { media: image, detailMedia: image, hotspots: list(obj({ ...research, label: short, x: { type: "number", minimum: 0, maximum: 100 }, y: { type: "number", minimum: 0, maximum: 100 } }), 12) },
    cutaway: { growth:process('growth'),media: image, views: { ...list(obj({ ...research, label: short }), 2), minItems: 2 } },
    lifecycle: { station, launch:process('launch'),wind:process('wind'),cycle:obj({label:shortText(),returnLabel:shortText(),scopeNote:shortText()}),recording:obj(Object.fromEntries(recordingFields.map(key=>[key,shortText()]))), activities: {...list(obj({id:recordId,view:{enum:MUSHROOM_ACTIVITY_VIEWS},label:short,title:short,intro:{type:"string",maxLength:1600},learning,sourceRefs}),4),minItems:4}, steps: {...list(obj({ ...research, title: short, media: image }), 4),minItems:4}, video, plumeVideo: video },
    roles: { cards: list(obj({ ...research, title: short, visual: { enum: ["leaf", "tree", "bread"] }, media: image, learning,process:{oneOf:['recycle','trade','dough'].map(process)} }), 3) },
    lab: { experiments: list(obj({ ...research, title: short, label: short, mode: { enum: ["glow", "sound"] }, media: image, learning }), 2),music:obj({
      ...Object.fromEntries(musicTexts.map(key=>[key,shortText()])),
      chain:{...list(obj({id:recordId,stage:{enum:['fungus','sensor','computer','instrument']},title:short,body:shortText()}),4),minItems:4},
      instruments:{...list(obj({id:recordId,mode:{enum:['flute','bell']},label:short,description:shortText()}),2),minItems:2},
      controls:obj(Object.fromEntries(musicControls.map(key=>[key,short]))),messages:obj(Object.fromEntries(musicMessages.map(key=>[key,shortText()]))),
      answers:{...list(obj({id:recordId,label:short,correct:{type:'boolean'},feedback:shortText()}),2),minItems:2},demoSourceRef:{const:'mushroom-source:plantwave-demo'}
    }) },
    facts: { cards: list(obj({ ...research, title: short }), 12), questions: list(obj({ id: recordId, prompt: short, sourceRefs: sourceRefs, choices: list(obj({ id: recordId, label: short, correct: { type: "boolean" }, feedback: { type: "string", minLength: 1, maxLength: 600 } }), 4) }), 6) },
    journal: { currentStage: { type: "null" }, entries: { type: "array", maxItems: 0 } }
  };
  return {
    $schema: "https://json-schema.org/draft/2020-12/schema",
    title: "Mushroom exhibit source scaffold",
    description: "Generated from the owning runtime contract. Semantic/publication guards also run in validateMushroomSource.",
    ...obj({
      schemaVersion: { const: "1.0" },
      page: obj({ id: { const: "hrv-page:mushrooms-2026-2027" }, type: { const: "mushroom-exploration" }, routeRef: { const: "hrv-route:mushrooms-2026-2027" } }),
      data: obj({
        ui:obj({...Object.fromEntries(MUSHROOM_UI_FIELDS.map(key=>[key,shortText()])),narration:obj(Object.fromEntries(narrationFields.map(key=>[key,shortText()])))}),
        meta: obj({ schoolYear: { const: "2026-2027" }, state: { enum: ["scaffold", "review-ready"] }, researchStatus: { enum: ["pending", "reviewed"] }, layout: { const: "viewport-breakout" }, designViewport: obj({ width: { const: 1920 }, height: { const: 911 } }) }),
        sources: list(obj({ id: { type: "string", pattern: "^mushroom-source:" }, title: { type: "string", minLength: 1, maxLength: 300 }, url: { type: "string", format: "uri", pattern: "^https://" } }), 80),
        blocks: { type: "array", minItems: 9, maxItems: 12, items: { oneOf: Object.keys(fields).map(function (type) {
          return obj({ id: recordId, type: { const: type }, label:short, eyebrow: { type: "string", minLength: 1, maxLength: 100 }, title: short, intro: { type: "string", maxLength: 1600 }, sourceRefs: sourceRefs, learning, ...shapes[type] });
        }) } }
      })
    })
  };
}

function requireThat(condition, message) {
  if (!condition) throw new Error("MUSHROOM_CONTRACT: " + message);
}
function object(value, keys, label) {
  requireThat(value !== null && typeof value === "object" && !Array.isArray(value), label + " must be an object");
  requireThat(Object.keys(value).every(function (key) { return keys.includes(key); }), label + " contains an unsupported field");
  requireThat(keys.every(function (key) { return Object.hasOwn(value, key); }), label + " is missing a field");
}
function text(value, label, maximum, required) {
  requireThat(typeof value === "string" && Array.from(value).length <= maximum, label + " is invalid or too long");
  if (required) requireThat(value.trim().length > 0, label + " is required");
}
function array(value, label, maximum) {
  requireThat(Array.isArray(value) && value.length <= maximum, label + " must be a bounded array");
}
function https(value, label) {
  let url;
  try { url = new URL(value); } catch { throw new Error("MUSHROOM_CONTRACT: " + label + " is not a URL"); }
  requireThat(url.protocol === "https:" && !url.username && !url.password, label + " must be credential-free HTTPS");
}
function media(value, label) {
  if (value === null) return;
  object(value, ["kind", "url", "alt", "caption"], label);
  requireThat(value.kind === "image", label + " supports image references only in this scaffold");
  if (typeof value.url === 'string' && value.url.startsWith('asset:')) {
    requireThat(MUSHROOM_PHOTOS.some(photo => 'asset:' + photo.id === value.url), 'unknown bundled photo reference');
  } else https(value.url, label + ".url");
  text(value.alt, label + ".alt", 500, true);
  text(value.caption, label + ".caption", 600, false);
}

export function validateMushroomSource(source, options) {
  const allowDraft = options && options.allowDraft === true;
  object(source, ["schemaVersion", "page", "data"], "source");
  requireThat(source.schemaVersion === "1.0", "unsupported source version");
  object(source.page, ["id", "type", "routeRef"], "page");
  requireThat(source.page.id === "hrv-page:mushrooms-2026-2027" &&
    source.page.type === "mushroom-exploration" &&
    source.page.routeRef === "hrv-route:mushrooms-2026-2027", "protected page identity changed");
  object(source.data, ["meta", "sources", "blocks", "ui"], "data");
  object(source.data.ui,[...MUSHROOM_UI_FIELDS,'narration'],'interface copy');
  MUSHROOM_UI_FIELDS.forEach(key=>text(source.data.ui[key],'interface '+key,600,true));
  object(source.data.ui.narration,narrationFields,'narration copy');narrationFields.forEach(key=>text(source.data.ui.narration[key],'narration '+key,600,key!=='ready'));
  Object.entries(uiTemplates).forEach(([key,tokens])=>requireThat(tokens.every(token=>source.data.ui[key].includes('{'+token+'}'))&&[...source.data.ui[key].matchAll(/\{([^}]+)\}/g)].every(match=>tokens.includes(match[1])),'interface template tokens changed'));
  const meta = source.data.meta;
  object(meta, ["schoolYear", "state", "researchStatus", "layout", "designViewport"], "meta");
  object(meta.designViewport, ["width", "height"], "designViewport");
  requireThat(meta.layout === "viewport-breakout" && meta.designViewport.width === 1920 &&
    meta.designViewport.height === 911 && meta.schoolYear === "2026-2027", "protected layout or year changed");
  requireThat(["scaffold", "review-ready"].includes(meta.state), "unknown publication state");
  requireThat(["pending", "reviewed"].includes(meta.researchStatus), "unknown research state");
  if (!allowDraft) requireThat(meta.state === "review-ready" && meta.researchStatus === "reviewed",
    "draft content cannot be published; content and publication review are required");

  const ids = new Set();
  function id(value, prefix) {
    text(value, "stable ID", 120, true);
    requireThat(new RegExp("^" + prefix + ":[a-z0-9]+(?:-[a-z0-9]+)*$").test(value), "invalid stable ID");
    requireThat(!ids.has(value), "duplicate stable ID " + value);
    ids.add(value);
  }
  array(source.data.sources, "sources", 80);
  const sourceIds = new Set();
  source.data.sources.forEach(function (item) {
    object(item, ["id", "title", "url"], "citation");
    id(item.id, "mushroom-source"); sourceIds.add(item.id);
    text(item.title, "source title", 300, true); https(item.url, "source URL");
  });
  function research(item, label) {
    text(item.body, label + " body", 6000, !allowDraft);
    array(item.sourceRefs, label + " sources", 12);
    requireThat(item.sourceRefs.every(function (ref) { return sourceIds.has(ref); }), "unresolved research citation");
    if (!allowDraft) requireThat(item.sourceRefs.length > 0, label + " requires reviewed citations");
  }
  function lesson(value) {
    object(value,["action","observe","safety","teacher","words"],"learning context");
    ["action","observe","safety"].forEach(key=>text(value[key],"learning "+key,600,false));
    text(value.teacher,"teacher detail",6000,false);array(value.words,"science words",12);
    value.words.forEach(word=>{object(word,["id","term","pronunciation","body","sourceRefs"],"science word");id(word.id,"mushroom-word");text(word.term,"science term",140,true);text(word.pronunciation,"pronunciation",120,false);research(word,"science word");});
  }
  function process(value,mode){
    object(value,['id','mode','label','initial','playing','finished','lessMotion','controls','steps','labels'],'process');id(value.id,'mushroom-process');
    requireThat(value.mode===mode&&value.id==='mushroom-process:'+mode,'protected process mode changed');
    ['label','initial','playing','finished','lessMotion'].forEach(key=>text(value[key],'process '+key,600,key!=='playing'));
    object(value.controls,['play','replay','pause','resume','step','reset','motion'],'process controls');Object.values(value.controls).forEach(label=>text(label,'process control',140,true));
    array(value.steps,'process steps',processStepCounts[mode]);requireThat(value.steps.length===processStepCounts[mode],'process stage count changed');
    value.steps.forEach((step,i)=>{object(step,['id','label','body'],'process step');id(step.id,'mushroom-phase');requireThat(step.id==='mushroom-phase:'+mode+'-'+(i+1),'protected process step order changed');text(step.label,'process step label',140,true);text(step.body,'process step explanation',600,true);});
    array(value.labels,'process labels',processLabels[mode].length);requireThat(value.labels.length===processLabels[mode].length,'process label count changed');
    value.labels.forEach(label=>{object(label,['id','text'],'process label');id(label.id,'mushroom-label');requireThat(processLabels[mode].some(key=>label.id==='mushroom-label:'+mode+'-'+key),'unknown process label');text(label.text,'diagram label',140,true);});
  }
  const kinds = new Set();
  array(source.data.blocks, "blocks", 12);
  requireThat(source.data.blocks.length >= 9, "core exhibit sections must be present");
  source.data.blocks.forEach(function (block) {
    requireThat(block && Object.hasOwn(fields, block.type), "unsupported block type");
    object(block, ["id", "type"].concat(fields[block.type]), "block");
    id(block.id, "mushroom-block");
    requireThat(!kinds.has(block.type), "duplicate block kind"); kinds.add(block.type);
    text(block.eyebrow, "eyebrow", 100, true);
    text(block.title, "title", 140, true);
    text(block.intro, "introduction", 1600, !allowDraft && block.type !== "journal");
    lesson(block.learning);text(block.label,'activity label',140,true);
    if(block.type==='hero'){
      object(block.entry,["exploreLabel","journalLabel","journalReadyLabel","note"],"entrance copy");
      ["exploreLabel","journalLabel","journalReadyLabel"].forEach(key=>text(block.entry[key],key,140,true));text(block.entry.note,"entrance note",600,false);
    }
    if(block.type==='family'||block.type==='lifecycle'){
      object(block.station,["title","intro"],"station copy");text(block.station.title,"station title",140,true);text(block.station.intro,"station intro",600,true);
    }
    array(block.sourceRefs, "block source references", 12);
    requireThat(block.sourceRefs.every(function (ref) { return sourceIds.has(ref); }), "unresolved block research citation");
    if (!allowDraft && block.type !== "journal") requireThat(block.sourceRefs.length > 0, "section requires reviewed citations");
    if (Object.hasOwn(block, "media")) media(block.media, "block media");
    if (Object.hasOwn(block, "detailMedia")) media(block.detailMedia, "specimen detail media");
    if (block.type === "anatomy") {
      array(block.hotspots, "hotspots", 12);
      requireThat(block.hotspots.length > 0, "anatomy needs observation points");
      block.hotspots.forEach(function (point) {
        object(point, ["id", "x", "y", "label", "body", "sourceRefs"], "hotspot");
        id(point.id, "mushroom-point");
        requireThat([point.x, point.y].every(function (n) { return Number.isFinite(n) && n >= 0 && n <= 100; }), "hotspot outside the diagram");
        text(point.label, "hotspot label", 100, true); research(point, "hotspot");
      });
    }
    if (block.type === "cutaway") {
      process(block.growth,'growth');
      array(block.views, "cutaway views", 2);
      requireThat(block.views.length === 2, "cutaway needs two views");
      block.views.forEach(function (view) {
        object(view, ["id", "label", "body", "sourceRefs"], "cutaway view");
        id(view.id, "mushroom-view"); text(view.label, "view label", 100, true); research(view, "cutaway view");
      });
    }
    if (block.type === "lifecycle") {
      process(block.launch,'launch');process(block.wind,'wind');
      object(block.cycle,['label','returnLabel','scopeNote'],'cycle context');Object.values(block.cycle).forEach(value=>text(value,'cycle copy',600,true));
      object(block.recording,recordingFields,'recording copy');Object.values(block.recording).forEach(value=>text(value,'recording copy',600,true));
      array(block.activities,"spore activities",4);
      requireThat(block.activities.length===4&&new Set(block.activities.map(a=>a.view)).size===4,"four distinct spore activities are required");
      block.activities.forEach(activity=>{object(activity,["id","view","label","title","intro","learning","sourceRefs"],"spore activity");id(activity.id,"mushroom-activity");requireThat(MUSHROOM_ACTIVITY_VIEWS.includes(activity.view)&&activity.id==='mushroom-activity:'+activity.view,"protected activity view changed");["label","title"].forEach(key=>text(activity[key],"activity "+key,140,true));text(activity.intro,"activity intro",1600,true);research({body:activity.intro,sourceRefs:activity.sourceRefs},"activity");lesson(activity.learning);});
      for(const key of ['video','plumeVideo']){
        const recording=block[key];
        if(recording!==null){
          object(recording,['kind','url','title','caption','sourceRefs'],'research video');
          requireThat(recording.kind==='video'&&MUSHROOM_VIDEOS.some(item=>'asset:'+item.id===recording.url),'unknown research video reference');
          text(recording.title,'video title',140,true);text(recording.caption,'video caption',600,true);
          research({body:recording.caption,sourceRefs:recording.sourceRefs},'research video');
        }else if(!allowDraft&&key==='video')requireThat(false,'reviewed spore recording is missing');
      }
      array(block.steps, "lifecycle steps", 12);
      requireThat(block.steps.length===4&&block.steps.every((step,i)=>step.id==='mushroom-step:'+['spore','threads','fruit','release'][i]),'protected life-cycle stage order changed');
      if (!allowDraft) requireThat(block.steps.length > 0, "reviewed lifecycle is missing");
      block.steps.forEach(function (step) {
        object(step, ["id", "title", "body", "sourceRefs", "media"], "lifecycle step");
        id(step.id, "mushroom-step"); text(step.title, "step title", 140, true);
        research(step, "lifecycle step"); media(step.media, "step media");
      });
    }
    if (block.type === "facts") {
      array(block.cards, "fact cards", 12);
      if (!allowDraft) requireThat(block.cards.length > 0, "reviewed discovery cards are missing");
      block.cards.forEach(function (card) {
        object(card, ["id", "title", "body", "sourceRefs"], "fact card");
        id(card.id, "mushroom-fact"); text(card.title, "fact title", 140, true); research(card, "fact card");
      });
      array(block.questions, "discovery questions", 6);
      block.questions.forEach(function (question) {
        object(question, ["id", "prompt", "sourceRefs", "choices"], "question");
        id(question.id, "mushroom-question"); text(question.prompt, "question prompt", 140, true);
        research({ body: question.prompt, sourceRefs: question.sourceRefs }, "question");
        array(question.choices, "answer choices", 4);
        requireThat(question.choices.length >= 2 && question.choices.filter(function (choice) { return choice.correct === true; }).length === 1, "questions need exactly one correct answer");
        question.choices.forEach(function (choice) {
          object(choice, ["id", "label", "correct", "feedback"], "answer");
          id(choice.id, "mushroom-answer"); text(choice.label, "answer label", 140, true);
          text(choice.feedback, "answer feedback", 600, true);
          requireThat(typeof choice.correct === "boolean", "invalid answer marker");
        });
      });
    }
    if (block.type === "family" || block.type === "roles") {
      array(block.cards, "specimen cards", 6);
      if (!allowDraft) requireThat(block.cards.length > 0, "reviewed specimen cards are missing");
      block.cards.forEach(function (card) {
        object(card, ["id", "title", "body", "sourceRefs", "visual", "media"].concat(block.type==='roles'?["learning","process"]:[]), "specimen card");
        if(block.type==='roles'){lesson(card.learning);const mode={leaf:'recycle',tree:'trade',bread:'dough'}[card.visual];requireThat(!!mode,'unknown fungal job visual');process(card.process,mode);}
        id(card.id, block.type === "family" ? "mushroom-family" : "mushroom-role");
        text(card.title, "card title", 140, true); research(card, "specimen card");
        requireThat(["mushroom", "mould", "yeast", "leaf", "tree", "bread"].includes(card.visual), "unknown specimen illustration");
        media(card.media, "specimen photo");
      });
    }
    if (block.type === "lab") {
      const music=block.music;object(music,[...musicTexts,'chain','instruments','controls','messages','answers','demoSourceRef'],'music lesson');
      musicTexts.forEach(key=>text(music[key],'music '+key,600,true));
      object(music.controls,musicControls,'music controls');Object.values(music.controls).forEach(value=>text(value,'music control',140,true));
      object(music.messages,musicMessages,'music messages');Object.values(music.messages).forEach(value=>text(value,'music message',600,true));
      for(const [key,kinds,prefix] of [['chain',['fungus','sensor','computer','instrument'],'mushroom-chain'],['instruments',['flute','bell'],'mushroom-instrument']]){
        array(music[key],'music '+key,kinds.length);requireThat(music[key].length===kinds.length,'music records missing');music[key].forEach((item,index)=>{
          object(item,key==='chain'?['id','stage','title','body']:['id','mode','label','description'],'music record');id(item.id,prefix);
          requireThat(item.id===prefix+':'+kinds[index]&&item[key==='chain'?'stage':'mode']===kinds[index],'protected music record changed');
          text(item[key==='chain'?'title':'label'],'music label',140,true);text(item[key==='chain'?'body':'description'],'music explanation',600,true);
        });
      }
      array(music.answers,'music observations',2);requireThat(music.answers.length===2,'music observation missing');music.answers.forEach((answer,index)=>{object(answer,['id','label','correct','feedback'],'music answer');id(answer.id,'mushroom-answer');requireThat(answer.id===['mushroom-answer:instrument','mushroom-answer:music-pattern'][index]&&answer.correct===(index===0),'protected music answer changed');text(answer.label,'music answer',140,true);text(answer.feedback,'music feedback',600,true);});
      requireThat(music.demoSourceRef==='mushroom-source:plantwave-demo'&&sourceIds.has(music.demoSourceRef),'unknown demonstration source');
      requireThat(['{index}','{value}','{note}'].every(token=>music.noteTemplate.includes(token)),'music note template needs sample, value and note');
      array(block.experiments, "lab exhibits", 2);
      requireThat(block.experiments.length === 2 && new Set(block.experiments.map(function (item) { return item.mode; })).size === 2, "lab needs distinct light and sound exhibits");
      block.experiments.forEach(function (item) {
        object(item, ["id", "title", "body", "sourceRefs", "mode", "media", "label", "learning"], "lab exhibit");
        text(item.label,"activity label",140,true);lesson(item.learning);
        id(item.id, "mushroom-lab"); text(item.title, "lab title", 140, true); research(item, "lab exhibit");
        requireThat(["glow", "sound"].includes(item.mode), "unknown lab activity");
        media(item.media, "lab photograph");
      });
    }
    if (block.type === "journal") {
      requireThat(block.currentStage === null, "growth-stage authoring is reserved for the journal implementation");
      array(block.entries, "journal entries", 0);
    }
  });
  Object.keys(fields).forEach(function (type) { requireThat(kinds.has(type), "missing core exhibit " + type); });
  requireThat(source.data.blocks[0].type === "hero" && source.data.blocks.at(-1).type === "journal", "welcome and journal positions are protected");
  return source;
}

export function editMushroomBlock(source, blockId, patch) {
  validateMushroomSource(source, { allowDraft: true });
  const next = structuredClone(source);
  const block = next.data.blocks.find(function (item) { return item.id === blockId; });
  requireThat(!!block, "unknown block");
  requireThat(patch && typeof patch === "object" && !Array.isArray(patch), "patch must be an object");
  requireThat(Object.keys(patch).every(function (key) { return fields[block.type].includes(key); }), "patch changes a protected or unsupported field");
  ["hotspots", "views", "cards", "steps", "experiments", "questions", "activities"].forEach(function (key) {
    if (!Object.hasOwn(patch, key)) return;
    requireThat(Array.isArray(patch[key]), "nested records must be an array");
    const before = block[key].map(function (item) { return item.id; }).sort();
    const after = patch[key].map(function (item) { return item.id; }).sort();
    requireThat(JSON.stringify(before) === JSON.stringify(after), "nested IDs require a separate add/remove operation");
    if (key === "questions") block.questions.forEach(function (question) {
      const updated = patch.questions.find(function (item) { return item.id === question.id; });
      requireThat(Array.isArray(updated.choices), "answer choices must be an array");
      requireThat(JSON.stringify(question.choices.map(function (item) { return item.id; }).sort()) ===
        JSON.stringify(updated.choices.map(function (item) { return item.id; }).sort()), "nested answer IDs require a separate add/remove operation");
    });
  });
  // Lesson text is editable; word identities are stable across those edits too.
  function wordIds(value,result=[]) { if(!value||typeof value!=="object")return result;if(Array.isArray(value.words))result.push(...value.words.map(w=>w.id));Object.entries(value).filter(([key])=>key!=="words").forEach(([,item])=>{if(Array.isArray(item))item.forEach(v=>wordIds(v,result));else if(item&&typeof item==="object")wordIds(item,result);});return result.sort(); }
  requireThat(JSON.stringify(wordIds(block))===JSON.stringify(wordIds({...block,...patch})),"science word IDs require a separate add/remove operation");
  function processIds(value,result=[]){if(!value||typeof value!=='object')return result;if(typeof value.id==='string'&&/^mushroom-(process|phase|label):/.test(value.id))result.push(value.id+(value.mode?':'+value.mode:''));Object.values(value).forEach(item=>{if(Array.isArray(item))item.forEach(v=>processIds(v,result));else if(item&&typeof item==='object')processIds(item,result);});return result.sort();}
  requireThat(JSON.stringify(processIds(block))===JSON.stringify(processIds({...block,...patch})),"process identities require a separate add/remove operation");
  Object.assign(block, structuredClone(patch));
  next.data.meta.state = "scaffold";
  next.data.meta.researchStatus = "pending";
  validateMushroomSource(next, { allowDraft: true });
  return next;
}

export function editMushroomInterface(source,patch){
  validateMushroomSource(source,{allowDraft:true});
  requireThat(patch&&typeof patch==='object'&&!Array.isArray(patch),'interface patch must be an object');
  requireThat(Object.keys(patch).every(key=>[...MUSHROOM_UI_FIELDS,'narration'].includes(key)),'protected or unsupported interface field');
  const next=structuredClone(source);Object.assign(next.data.ui,structuredClone(patch));next.data.meta.state='scaffold';next.data.meta.researchStatus='pending';validateMushroomSource(next,{allowDraft:true});return next;
}

let rememberedMotion=null;
export function browserMotionPreference(){
  const media=window.matchMedia('(prefers-reduced-motion: reduce)'),wrappers=new Map(),key='hrv:mushrooms:less-motion',eventName='hrv-mushrooms-motion-change';
  function value(){let stored=null;try{stored=window.localStorage.getItem(key);}catch{}return rememberedMotion??(stored==='1'?true:stored==='0'?false:media.matches);}
  const result={get matches(){return value();},setMatches(next){rememberedMotion=!!next;try{window.localStorage.setItem(key,next?'1':'0');}catch{}window.dispatchEvent(new Event(eventName));},addEventListener(type,fn){const update=event=>{if(event?.type==='storage'&&event.key===key)rememberedMotion=null;fn({matches:value()});};wrappers.set(fn,update);media.addEventListener(type,update);window.addEventListener(eventName,update);window.addEventListener('storage',update);},removeEventListener(type,fn){const update=wrappers.get(fn);if(!update)return;media.removeEventListener(type,update);window.removeEventListener(eventName,update);window.removeEventListener('storage',update);wrappers.delete(fn);}};return result;
}
// Finite teaching clocks. A paused or reduced-motion model never advances itself.
export function createTeachingTimeline({duration,checkpoints=[0,duration],onRender=()=>{},onState=()=>{},request=callback=>requestAnimationFrame(callback),cancel=id=>cancelAnimationFrame(id),preference=browserMotionPreference()}) {
  if(!(duration>0)||!Number.isFinite(duration))throw new TypeError('A finite positive duration is required.');
  if(checkpoints[0]!==0||checkpoints.at(-1)!==duration||checkpoints.some((t,i)=>!Number.isFinite(t)||t<0||t>duration||(i>0&&t<=checkpoints[i-1])))throw new TypeError('Teaching checkpoints must increase from zero to the ending.');
  let time=0,state='ready',frame=null,last=null,generation=0,destroyed=false,reduced=preference.matches;
  const snapshot=()=>({time,duration,state,reduced});
  function refresh(){if(destroyed)return;const value=snapshot();onRender(time,value);onState(value);}
  function unschedule(){generation++;if(frame!==null)cancel(frame);frame=null;last=null;}
  function schedule(){const ticket=generation;frame=request(t=>tick(t,ticket));}
  function tick(timestamp,ticket){if(destroyed||ticket!==generation||state!=='running')return;frame=null;const dt=last===null?0:Math.max(0,Math.min((timestamp-last)/1000,.05));last=timestamp;time=Math.min(duration,time+dt);if(time===duration)state='complete';refresh();if(state==='running')schedule();}
  function pause(){if(destroyed||state!=='running')return;unschedule();state='paused';refresh();}
  function seek(next){if(destroyed)return;unschedule();time=Math.max(0,Math.min(duration,Number.isFinite(next)?next:0));state=time===duration?'complete':'paused';refresh();}
  function step(){if(destroyed)return;seek(checkpoints.find(t=>t>time+1e-6)??duration);}
  function play(){if(destroyed||state==='running')return;if(reduced){step();return;}if(time>=duration)time=0;unschedule();state='running';refresh();schedule();}
  function reset(){if(destroyed)return;unschedule();time=0;state='ready';refresh();}
  function restart(){reset();play();}
  function changed(event){if(destroyed)return;reduced=event.matches;if(reduced&&state==='running')pause();else refresh();}
  preference.addEventListener('change',changed);
  return {snapshot,refresh,play,pause,seek,step,reset,restart,setReduced(value){if(preference.setMatches)preference.setMatches(value);else changed({matches:!!value});},suspend:pause,destroy(){if(destroyed)return;unschedule();destroyed=true;preference.removeEventListener('change',changed);}};
}
export function connectedGrowthProgress(time,start,duration){return Math.max(0,Math.min(1,(time-start)/duration));}
export function doughRiseState(progress){const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));return {scale:.62+.38*p,pocketScale:.45+.55*p};}
export function advanceWindParticle(particle,seconds,breeze){
  const dt=Math.max(0,Number.isFinite(seconds)?seconds:0),wind=Math.max(-100,Math.min(100,Number.isFinite(breeze)?breeze:0));
  const falling=Math.min(dt,Math.max(0,(470-particle.y)/(34+particle.speed)));
  const clearAfter=Math.max(0,(290-particle.y)/(34+particle.speed));
  return {...particle,x:particle.x+wind*Math.max(0,falling-clearAfter)*.95,y:Math.min(470,particle.y+(34+particle.speed)*falling)};
}

// Intentional reading of the current authored lesson, never credits or teacher drawers.
export function mushroomReadingText(block,{view,recordId,partId,stage=0,status=''}={}){
  let record=block,parts=[];
  if(block.type==='roles')record=block.cards.find(item=>item.id===recordId)||block.cards[0];
  if(block.type==='lifecycle')record=block.activities.find(item=>item.view===view)||block.activities[0];
  if(block.type==='lab')record=block.experiments.find(item=>item.mode===view)||block.experiments[0];
  parts.push(record.title,record.intro||record.body);
  if(block.type==='family')block.cards.forEach(item=>parts.push(item.title,item.body));
  if(block.type==='anatomy'){const item=block.hotspots.find(item=>item.id===partId)||block.hotspots[0];parts.push(item.label,item.body);}
  if(block.type==='cutaway'){const item=block.views[view==='below'?1:0];parts.push(item.label,item.body);}
  if(block.type==='lifecycle'&&view==='cycle'){const item=block.steps[stage];parts.push(item.title,item.body);}
  if(block.type==='lab'&&view==='sound')parts.push('The equipment and the artist turn measurements into music.');
  if(block.type==='facts')block.cards.forEach(item=>parts.push(item.title,item.body));
  if(status)parts.push(status);
  const learning=record.learning||block.learning;parts.push(learning.action,learning.observe,learning.safety);
  return [...new Set(parts.filter(value=>typeof value==='string'&&value.trim()).map(value=>value.trim().replace(/\n/g,' ')))].join('\n\n');
}
export function createMushroomNarration({synthesis,utteranceFactory,onChange=()=>{},schedule=fn=>setTimeout(fn,4000),unschedule=id=>clearTimeout(id),now=()=>performance.now()}={}){
  let voices=[],selected='',state='ready',owner=null,generation=0,timer=null,destroyed=false,utterance=null,lastReading=null,failure=null;
  const key=voice=>voice.voiceURI||voice.name+'|'+voice.lang;
  function snapshot(){return{state,owner,selected,failure,lastReading:lastReading?{...lastReading}:null,voices:voices.map(v=>({id:key(v),name:v.name,lang:v.lang,local:v.localService}))};}
  function report(){if(!destroyed)onChange(snapshot());return snapshot();}
  function refresh(){if(destroyed)return;let available=[];try{available=synthesis?.getVoices?.()||[];}catch{}voices=available.filter(v=>/^en(?:-|$)/i.test(v.lang)).sort((a,b)=>Number(b.localService)-Number(a.localService)||Number(b.lang==='en-US')-Number(a.lang==='en-US')||a.name.localeCompare(b.name));if(!voices.some(v=>key(v)===selected))selected=voices.length?key(voices[0]):'';return report();}
  function clear(){generation++;if(timer!==null)unschedule(timer);timer=null;if(utterance){utterance.onstart=utterance.onend=utterance.onerror=null;utterance=null;synthesis?.cancel();}}
  function stop(){const active=['starting','reading'].includes(state);clear();state=active?'stopped':'ready';return report();}
  function read(text,nextOwner){
    if(destroyed)return snapshot();clear();refresh();owner=nextOwner;failure=null;lastReading=null;
    if(!synthesis||!utteranceFactory||!voices.length){state='unavailable';failure='no-voice';return report();}
    if(!text.trim()){state='error';failure='empty-text';return report();}
    const ticket=generation,wordCount=text.trim().split(/\s+/u).length;let startedAt=null;lastReading={characters:text.length,started:false,elapsedMs:0,providerElapsedSeconds:null};state='starting';report();
    try{
      utterance=utteranceFactory(text);utterance.voice=voices.find(v=>key(v)===selected);utterance.lang=utterance.voice?.lang||'en-US';utterance.rate=.88;utterance.pitch=1;utterance.volume=1;
      const valid=()=>!destroyed&&generation===ticket;
      utterance.onstart=()=>{if(!valid())return;startedAt=now();lastReading.started=true;if(timer!==null)unschedule(timer);timer=null;state='reading';report();};
      utterance.onend=event=>{if(!valid())return;lastReading.elapsedMs=startedAt===null?0:Math.max(0,now()-startedAt);lastReading.providerElapsedSeconds=Number.isFinite(event?.elapsedTime)?event.elapsedTime:null;failure=startedAt===null?'ended-before-start':wordCount>=20&&lastReading.elapsedMs<1000?'ended-too-soon':null;clear();state=failure?'error':'complete';report();};
      utterance.onerror=()=>{if(!valid())return;clear();state='error';failure='engine-error';report();};
      timer=schedule(()=>{if(valid()&&state==='starting'){clear();state='error';failure='startup-timeout';report();}});
      synthesis.speak(utterance);
    }catch{if(generation===ticket){clear();state='error';failure='startup-exception';report();}}
    return snapshot();
  }
  synthesis?.addEventListener?.('voiceschanged',refresh);refresh();
  return{snapshot,refresh,read,stop,selectVoice(id){if(!voices.some(v=>key(v)===id))return snapshot();stop();selected=id;return report();},destroy(){if(destroyed)return;clear();destroyed=true;synthesis?.removeEventListener?.('voiceschanged',refresh);}};
}

// Official YouTube API, requested only after the visitor loads the real demonstration.
const mushroomYouTubeLoads=new WeakMap();
export function loadMushroomYouTubeAPI(win=window,doc=document){
  if(typeof win.YT?.Player==='function')return Promise.resolve(win.YT);
  if(mushroomYouTubeLoads.has(win))return mushroomYouTubeLoads.get(win);
  const promise=new Promise((resolve,reject)=>{
    const prior=win.onYouTubeIframeAPIReady,owned=Object.hasOwn(win,'onYouTubeIframeAPIReady'),script=doc.createElement('script');let timer;
    function cleanup(){win.clearTimeout(timer);script.removeEventListener('error',failed);if(win.onYouTubeIframeAPIReady===ready){if(owned)win.onYouTubeIframeAPIReady=prior;else delete win.onYouTubeIframeAPIReady;}}
    function failed(){cleanup();script.remove();reject(new Error('YouTube API unavailable'));}
    function ready(){try{if(typeof prior==='function')prior();}finally{cleanup();if(typeof win.YT?.Player==='function')resolve(win.YT);else reject(new Error('YouTube player unavailable'));}}
    win.onYouTubeIframeAPIReady=ready;try{script.src='https://www.youtube.com/iframe_api';script.async=true;script.addEventListener('error',failed);timer=win.setTimeout(failed,10000);doc.head.append(script);}catch{failed();}
  });mushroomYouTubeLoads.set(win,promise);promise.catch(()=>{if(mushroomYouTubeLoads.get(win)===promise)mushroomYouTubeLoads.delete(win);});return promise;
}
export function mushroomDemoURL(base,origin){const url=new URL(base);url.searchParams.set('enablejsapi','1');url.searchParams.set('autoplay','0');url.searchParams.set('playsinline','1');if(/^https?:\/\//.test(origin))url.searchParams.set('origin',origin);else url.searchParams.delete('origin');return url.href;}
export function connectMushroomYouTube(frame,events){return loadMushroomYouTubeAPI().then(api=>new api.Player(frame,{events}));}
export function createMushroomDemo({connect=connectMushroomYouTube,onChange=()=>{},schedule=(fn,ms)=>setTimeout(fn,ms),unschedule=id=>clearTimeout(id)}={}){
  let state='closed',error=null,time=0,player=null,generation=0,deadline=null,poll=null,disposed=false;
  const snapshot=()=>({state,error,time});
  function emit(){if(!disposed)onChange(snapshot());return snapshot();}
  function cancelDeadline(){if(deadline!==null)unschedule(deadline);deadline=null;}
  function cancelPoll(){if(poll!==null)unschedule(poll);poll=null;}
  function update(next,code=null){const same=state===next;state=next;error=code;if(!['loading','buffering'].includes(next))cancelDeadline();if(next!=='playing')cancelPoll();if(['loading','buffering'].includes(next)&&!same){cancelDeadline();const ticket=generation;deadline=schedule(()=>{deadline=null;if(ticket===generation&&!disposed&&['loading','buffering'].includes(state)){state='timeout';emit();}},12000);}return emit();}
  function close(){generation++;cancelDeadline();cancelPoll();const old=player;player=null;try{old?.destroy();}catch{}state='closed';error=null;time=0;return emit();}
  async function open(frame){
    if(disposed)return snapshot();close();const ticket=generation;update('loading');
    const valid=()=>!disposed&&ticket===generation;
    function tick(){poll=null;if(!valid()||state!=='playing')return;try{const value=Number(player?.getCurrentTime());if(Number.isFinite(value))time=Math.max(0,value);}catch{}emit();poll=schedule(tick,500);}
    const events={onReady(){if(valid())update('ready');},onStateChange(event){if(!valid())return;const next={'-1':'ready',0:'ended',1:'playing',2:'paused',3:'buffering',5:'ready'}[event.data];if(!next)return;update(next);if(next==='playing'&&poll===null)poll=schedule(tick,500);},onError(event){if(valid())update('error',event.data);},onAutoplayBlocked(){if(valid())update('blocked');}};
    try{const connected=await connect(frame,events);if(!valid()){try{connected?.destroy();}catch{}return snapshot();}player=connected;}catch{if(valid())update('unavailable');}
    return snapshot();
  }
  return{snapshot,open,close,destroy(){if(disposed)return;close();disposed=true;}};
}

// Interactive teaching models and separately credited, real research footage.





function labNode(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function labButton(label,action,cleanups,priority='primary'){const button=labNode('button','mushroom-lab-button',label);button.type='button';button.dataset.actionPriority=priority;button.addEventListener('click',action);cleanups.push(()=>button.removeEventListener('click',action));return button;}
function processLabel(copy,key){return copy.labels.find(label=>label.id==='mushroom-label:'+copy.mode+'-'+key).text;}
function processControls(owner,copy,{duration,checkpoints,render,beforePlay=()=>{},beforeStep=()=>{},onStep=()=>{},selectedIndex},prefix){
  const node=labNode('div','mushroom-process-controls'),cleanups=[],sequence=labNode('ol','mushroom-process-steps'),actions=labNode('div','mushroom-lab-actions'),status=labNode('p','mushroom-model-status'),motionNote=labNode('p','mushroom-motion-note',copy.lessMotion);
  status.id=prefix+'-'+copy.mode+'-status';status.setAttribute('aria-live','polite');sequence.setAttribute('aria-label',copy.label);const buttons=[];let timeline;
  copy.steps.forEach((step,index)=>{const li=labNode('li'),b=labButton(String(index+1)+'. '+step.label,()=>{onStep(index);timeline.seek(checkpoints[index]);},cleanups,'secondary');b.dataset.recordId=step.id;b.setAttribute('aria-controls',status.id);buttons.push(b);li.append(b);sequence.append(li);});
  const play=labButton(copy.controls.play,()=>{beforePlay();timeline.restart();},cleanups),pause=labButton(copy.controls.pause,()=>{if(timeline.snapshot().state==='running')timeline.pause();else timeline.play();},cleanups,'secondary'),step=labButton(copy.controls.step,()=>{beforeStep();timeline.step();},cleanups,'secondary'),reset=labButton(copy.controls.reset,()=>{beforePlay();timeline.reset();},cleanups,'secondary');
  const motionLabel=labNode('label','mushroom-motion-choice'),motionToggle=labNode('input');motionToggle.type='checkbox';motionLabel.append(motionToggle,document.createTextNode(copy.controls.motion));const motionChange=()=>timeline.setReduced(motionToggle.checked);motionToggle.addEventListener('change',motionChange);cleanups.push(()=>motionToggle.removeEventListener('change',motionChange));
  function update(value){const index=selectedIndex?selectedIndex(value):Math.max(0,checkpoints.findLastIndex(t=>t<=value.time+1e-6));buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));owner.dataset.modelState=value.state;owner.dataset.modelTime=value.time.toFixed(3);owner.dataset.lessMotion=String(value.reduced);play.textContent=value.time>0?copy.controls.replay:copy.controls.play;play.hidden=value.reduced;play.disabled=value.state==='running';pause.hidden=value.reduced;pause.disabled=['ready','complete'].includes(value.state);pause.textContent=value.state==='paused'?copy.controls.resume:copy.controls.pause;pause.setAttribute('aria-pressed',String(value.state==='paused'));step.disabled=value.time>=duration;step.dataset.actionPriority=value.reduced?'primary':'secondary';reset.disabled=value.state==='ready';motionNote.hidden=!value.reduced;motionToggle.checked=value.reduced;const text=value.state==='ready'?copy.initial:value.state==='running'?copy.playing:value.state==='complete'&&!(selectedIndex&&index>=0)?copy.finished:copy.steps[Math.max(0,index)].body;if(status.textContent!==text)status.textContent=text;}
  timeline=createTeachingTimeline({duration,checkpoints,onRender:(time,state)=>render(time,state),onState:update});actions.append(play,pause,step);const options=labNode('div','mushroom-process-options');options.append(motionLabel,reset);node.append(sequence,actions,options,motionNote,status);timeline.refresh();
  const hidden=()=>{if(document.hidden)timeline.suspend();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)timeline.suspend();});observer.observe(owner);cleanups.push(()=>observer.disconnect());
  return {node,timeline,status,suspend:timeline.suspend,destroy(){timeline.destroy();cleanups.forEach(fn=>fn());}};
}
function diagramSteps(owner,copy,cleanups,prefix){
  const node=labNode('div','mushroom-published-steps'),list=labNode('ol','mushroom-process-steps'),status=labNode('p','mushroom-model-status',copy.initial),buttons=[];status.id=prefix+'-status';status.setAttribute('aria-live','polite');
  copy.steps.forEach((step,index)=>{const li=labNode('li'),button=labButton(String(index+1)+'. '+step.label,()=>{status.textContent=step.body;buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));owner.dataset.stage=String(index);},cleanups,'secondary');button.dataset.recordId=step.id;button.setAttribute('aria-controls',status.id);button.setAttribute('aria-pressed','false');buttons.push(button);li.append(button);list.append(li);});node.append(list,status);return node;
}
export function createGrowthLab(block,prefix,photoRenderer,ui){
  const node=labNode('div','mushroom-cutaway-panel mushroom-published-workbench'),cleanups=[],illustration=labNode('div','mushroom-cutaway-illustration');illustration.append(photoRenderer(mushroomDiagramReference('structure'),'mushroom-published-figure'));
  const controls=labNode('div','mushroom-cutaway-controls'),switcher=labNode('div','mushroom-view-switch'),explanation=labNode('div','mushroom-cutaway-copy'),viewButtons=[];switcher.setAttribute('role','group');switcher.setAttribute('aria-label',ui.cutawayGroup);
  function chooseView(index){node.dataset.view=index===0?'surface':'below';viewButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));explanation.replaceChildren(labNode('h3','',block.views[index].label),labNode('p','',block.views[index].body));}
  block.views.forEach((view,i)=>{const button=labButton(view.label,()=>chooseView(i),cleanups,'secondary');viewButtons.push(button);switcher.append(button);});controls.append(switcher,explanation,diagramSteps(node,block.growth,cleanups,prefix+'-growth'));node.append(illustration,controls);if(block.media)node.append(photoRenderer(block.media,'mushroom-cutaway-photo'));chooseView(0);
  return {node,suspend(){},destroy(){cleanups.forEach(fn=>fn());}};
}
export function sporeLaunchState(seconds){const time=Math.max(0,Math.min(3.8,Number.isFinite(seconds)?seconds:0));return {phase:time<1.4?0:time<1.85?1:2,dropRadius:4+Math.min(time/1.4,1)*14,dropOpacity:1-Math.max(0,Math.min((time-1.4)/.45,1)),mergedOpacity:Math.max(0,Math.min((time-1.4)/.45,1))*.8,x:time<=1.85?0:-105*Math.min((time-1.85)/.35,1)};}
function createCatapultLab(copy,prefix,photoRenderer){
  const node=labNode('div','mushroom-catapult-panel mushroom-published-workbench'),cleanups=[];node.append(photoRenderer(mushroomDiagramReference('spore-release'),'mushroom-published-figure'),diagramSteps(node,copy,cleanups,prefix));return {node,suspend(){},destroy(){cleanups.forEach(fn=>fn());}};
}
function createWindLab(copy,prefix,photoRenderer){
  const node=labNode('div','mushroom-wind-panel'),cleanups=[],stage=labNode('div','mushroom-wind-stage');stage.append(photoRenderer(mushroomDiagramReference('mushroom'),'mushroom-published-figure'));const field=labNode('div','mushroom-airflow-field'),particlesHost=labNode('div','spore-particles');field.setAttribute('aria-label','Airflow experiment: dots represent spores that have already left a mushroom.');field.append(particlesHost);stage.append(field,labNode('p','mushroom-model-label',copy.label));
  const controls=labNode('div','mushroom-wind-controls'),label=labNode('label','mushroom-wind-label',processLabel(copy,'breeze')),range=labNode('input');range.type='range';range.min='-100';range.max='100';range.value='35';range.step='5';range.setAttribute('aria-label',processLabel(copy,'breeze'));label.append(range);
  const output=labNode('output','mushroom-wind-output'),directions=labNode('div','mushroom-breeze-directions');directions.setAttribute('role','group');directions.setAttribute('aria-label',processLabel(copy,'breeze'));const directionButtons=[];
  function update(){const value=Number(range.value),description=value===0?processLabel(copy,'still'):processLabel(copy,value<0?'left-state':'right-state');output.textContent=description;range.setAttribute('aria-valuetext',description);directionButtons.forEach(([button,direction])=>button.setAttribute('aria-pressed',String(direction===Math.sign(value))));}
  for(const [key,value] of [['left',-70],['still',0],['right',70]]){const b=labButton(processLabel(copy,key),()=>{range.value=String(value);update();},cleanups,'secondary');directionButtons.push([b,Math.sign(value)]);directions.append(b);}range.addEventListener('input',update);cleanups.push(()=>range.removeEventListener('input',update));update();
  const group=stage.querySelector('.spore-particles');let particles=[],lastTime=0;
  function resetParticles(){group.replaceChildren();particles=Array.from({length:36},(_,i)=>{const dot=labNode('span','mushroom-airborne-spore');dot.style.width=dot.style.height=String(4.4+i%3*.9)+'px';group.append(dot);return {dot,x:i%2?295+(i*29)%64:478+(i*23)%63,y:225,delay:(i%9)*.16,speed:i%7*3};});lastTime=0;}
  const process=processControls(node,copy,{duration:9,checkpoints:[0,3,9],render(time,state){if(time<lastTime||state.state==='ready'||!particles.length)resetParticles();const start=lastTime;particles=particles.map(p=>{const dt=Math.max(0,time-Math.max(start,p.delay));const next=advanceWindParticle(p,dt,Number(range.value));next.dot.style.left=(next.x/10).toFixed(2)+'%';next.dot.style.top=(next.y/440*100).toFixed(2)+'%';next.dot.style.opacity=time<p.delay||next.x<0||next.x>1000?'0':'.9';return next;});lastTime=time;}},prefix);
  controls.append(label,output,directions,process.node);node.append(stage,controls);return {node,suspend:process.suspend,destroy(){process.destroy();cleanups.forEach(fn=>fn());particles=[];}};
}
export function recordingPlaybackState({failed,ended,paused},copy){return {disabled:failed,button:ended?copy.replay:paused?copy.play:copy.pause,priority:paused?'primary':'secondary',retry:failed,status:failed?copy.error:ended?copy.finished:paused?copy.paused:copy.playing};}
function recordingPanel(reference,prefix,cleanups,copy,ui,safety=''){
  const asset=mushroomVideoAsset(reference.url);if(!asset)throw new Error('Unregistered research recording.');
  const node=labNode('article','mushroom-spore-film'),video=labNode('video','mushroom-research-video');node.append(labNode('p','mushroom-eyebrow',ui.realFootage),labNode('h3','',reference.title));
  video.src=mushroomVideoURL(asset.file);video.poster=mushroomVideoURL(asset.poster);video.controls=true;video.preload='metadata';video.playsInline=true;video.muted=true;video.width=asset.width;video.height=asset.height;video.setAttribute('aria-label',reference.title);
  const track=labNode('track');track.kind='captions';track.srclang='en';track.label=ui.captionTrack;track.src=mushroomVideoURL(asset.captions);video.append(track);
  const text=labNode('div','mushroom-film-description'),caption=labNode('p','mushroom-film-caption',reference.caption);caption.id=prefix+'-description';const timing=labNode('p','mushroom-film-timing',asset.slowdownFactor===5?copy.silentPuffball:copy.silentMicroscope);timing.id=prefix+'-timing';text.append(caption,timing);if(safety)text.append(labNode('p','mushroom-safety-rule',safety));video.setAttribute('aria-describedby',caption.id+' '+timing.id);
  let failed=false,disposed=false;const status=labNode('p','mushroom-model-status',copy.paused);status.setAttribute('aria-live','polite');
  const actions=labNode('div','mushroom-film-actions'),play=labButton(copy.play,()=>{if(video.paused){if(video.ended)video.currentTime=0;video.play().catch(error=>{if(disposed)return;if(error.name==='AbortError')update();else{failed=true;update();}});}else video.pause();},cleanups),fullscreen=labButton(copy.fullscreen,()=>video.requestFullscreen().catch(()=>{status.textContent=copy.fullscreenError;}),cleanups,'secondary'),retry=labButton(copy.retry,()=>{failed=false;video.load();update();},cleanups,'secondary');fullscreen.hidden=typeof video.requestFullscreen!=='function';
  function update(){if(disposed)return;failed=failed||!!video.error;const value=recordingPlaybackState({failed,ended:video.ended,paused:video.paused},copy);play.disabled=value.disabled;play.textContent=value.button;play.dataset.actionPriority=value.priority;retry.hidden=!value.retry;status.textContent=value.status;}
  const error=()=>{failed=true;update();};['play','pause','ended','loadedmetadata'].forEach(event=>{video.addEventListener(event,update);cleanups.push(()=>video.removeEventListener(event,update));});video.addEventListener('error',error);cleanups.push(()=>video.removeEventListener('error',error));
  actions.append(play,fullscreen,retry,status);node.append(video,text,actions);update();
  function suspend(){video.pause();if(document.fullscreenElement===video)document.exitFullscreen().catch(()=>{});}
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)suspend();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend,destroy(){disposed=true;suspend();video.removeAttribute('src');video.load();}};
}
function createLifecycleLab(block,prefix,photoRenderer){
  const {steps,cycle}=block,node=labNode('div','mushroom-lifecycle-workbench mushroom-published-workbench'),cleanups=[],canvas=labNode('div','mushroom-cycle-map'),list=labNode('ol','mushroom-cycle-overview'),detail=labNode('div','mushroom-step-detail'),buttons=[];detail.id=prefix+'-life-detail';detail.setAttribute('aria-live','polite');
  function select(index){const step=steps[index];detail.replaceChildren(labNode('p','mushroom-eyebrow',String(index+1)+' / '+steps.length),labNode('h3','',step.title),labNode('p','',step.body));if(step.media&&photoRenderer)detail.append(photoRenderer(step.media,'mushroom-life-photo'));buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));}
  steps.forEach((step,index)=>{const li=labNode('li'),button=labButton(String(index+1)+'. '+step.title,()=>select(index),cleanups,'secondary');button.className='mushroom-cycle-stage';button.setAttribute('aria-controls',detail.id);button.dataset.recordId=step.id;buttons.push(button);li.append(button);list.append(li);});canvas.append(photoRenderer(mushroomDiagramReference('cycle'),'mushroom-published-figure'),list,labNode('p','mushroom-diagram-note',cycle.returnLabel));const copy=labNode('div','mushroom-lifecycle-copy');copy.append(detail,labNode('p','mushroom-cycle-scope',cycle.scopeNote));node.append(canvas,copy);select(0);return {node,destroy(){cleanups.forEach(fn=>fn());}};
}
export function sporeActivityState(view){if(!['launch','wind','puffball','cycle'].includes(view))throw new Error('Unknown spore activity.');return {comparison:view==='launch'||view==='wind',launch:view==='launch',wind:view==='wind',puffball:view==='puffball',cycle:view==='cycle',launchFilm:view==='launch'};}
export function createSporeLab(block,photoRenderer,prefix='mushroom',ui){
  const node=labNode('div','mushroom-spore-lab'),cleanups=[],comparison=labNode('div','mushroom-spore-comparison'),model=labNode('div','mushroom-spore-model'),bridge=labNode('div','mushroom-scale-bridge');bridge.append(labNode('span','',ui.bridgeCap),labNode('span','',ui.bridgeGill),labNode('strong','',ui.bridgeSpore));model.append(bridge);
  const catapult=createCatapultLab(block.launch,prefix+'-launch',photoRenderer),wind=createWindLab(block.wind,prefix+'-wind',photoRenderer);catapult.node.id='mushrooms-launch';wind.node.id='mushrooms-wind';model.append(catapult.node,wind.node);comparison.append(model);const films=[];let launchFilm;
  if(block.video){launchFilm=recordingPanel(block.video,prefix+'-micro',cleanups,block.recording,ui);comparison.append(launchFilm.node);films.push(launchFilm);}
  const cloud=labNode('div','mushroom-cloud-workbench');cloud.id='mushrooms-puffball';if(block.plumeVideo){const film=recordingPanel(block.plumeVideo,prefix+'-cloud',cleanups,block.recording,ui,block.activities.find(a=>a.view==='puffball').learning.safety);cloud.append(film.node);films.push(film);}
  const life=createLifecycleLab(block,prefix,photoRenderer);life.node.id='mushrooms-cycle';
  function suspend(){catapult.suspend();wind.suspend();films.forEach(f=>f.suspend());}
  function select(view){const state=sporeActivityState(view);suspend();node.dataset.activity=view;comparison.hidden=!state.comparison;catapult.node.hidden=!state.launch;wind.node.hidden=!state.wind;cloud.hidden=!state.puffball;life.node.hidden=!state.cycle;bridge.hidden=!state.launch;if(launchFilm)launchFilm.node.hidden=!state.launchFilm;}
  node.append(comparison,cloud,life.node);select('launch');const hidden=()=>{if(document.hidden)suspend();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  return {node,select,suspend,destroy(){catapult.destroy();wind.destroy();life.destroy();films.forEach(f=>f.destroy());cleanups.forEach(fn=>fn());}};
}
export function createRolesLab(block,photoRenderer,prefix,learningNotes,ui){
  const {cards,learning}=block,node=labNode('div','mushroom-role-labs'),cleanups=[],exhibits=[],roleButtons=[],roleSwitch=labNode('div','mushroom-role-switch');roleSwitch.setAttribute('role','group');roleSwitch.setAttribute('aria-label',ui.roleGroup);node.append(roleSwitch);
  function selectRole(index){exhibits.forEach((exhibit,i)=>{exhibit.hidden=i!==index;roleButtons[i].setAttribute('aria-pressed',String(i===index));});}
  cards.forEach((card,index)=>{const article=labNode('article','mushroom-role-exhibit mushroom-published-workbench'),picture=labNode('div','mushroom-role-picture'),copy=labNode('div','mushroom-role-copy');article.dataset.recordId=card.id;article.dataset.role=card.visual;
    const reference=card.visual==='leaf'?mushroomDiagramReference('digestion'):card.visual==='tree'?mushroomDiagramReference('partnership'):card.media||{kind:'image',url:'asset:mushroom-photo:yeast-dic',alt:'Budding yeast cells under a microscope.',caption:'Yeast cells are tiny fungi.'};picture.append(photoRenderer(reference,'mushroom-published-figure'));copy.append(labNode('p','mushroom-eyebrow',ui.jobPrefix+' / '+String(index+1).padStart(2,'0')),labNode('h3','',card.title),labNode('p','',card.body),diagramSteps(article,card.process,cleanups,prefix+'-role-'+index));
    if(card.visual==='leaf'&&card.media){const evidence=labNode('details','mushroom-role-evidence');evidence.append(labNode('summary','',processLabel(card.process,'evidence')),photoRenderer(card.media,'mushroom-role-photo'));copy.append(evidence);}if(learningNotes)copy.append(learningNotes({...card.learning,words:[...card.learning.words,...learning.words]}));article.append(picture,copy);exhibits.push(article);const choose=labButton(card.title,()=>selectRole(index),cleanups);roleButtons.push(choose);roleSwitch.append(choose);node.append(article);
  });selectRole(0);return {node,suspend(){},destroy(){cleanups.forEach(fn=>fn());}};
}
export function createWonderLab(block,photoRenderer,learningNotes,sources){
  const node=labNode('div','mushroom-wonder-labs'),cleanups=[],glow=block.experiments.find(e=>e.mode==='glow'),sound=block.experiments.find(e=>e.mode==='sound');
  const light=labNode('article','mushroom-light-lab');light.id='mushrooms-glow';light.dataset.recordId=glow.id;light.dataset.night='false';const lightCopy=labNode('div','mushroom-lab-copy');lightCopy.append(labNode('p','mushroom-eyebrow',glow.label),labNode('h3','',glow.title),labNode('p','',glow.body));if(glow.media&&photoRenderer)light.append(photoRenderer(glow.media,'mushroom-lab-photo'));light.append(lightCopy);
  const movie=MUSHROOM_MUSIC_DOCUMENTARY,music=labNode('article','mushroom-sound-lab mushroom-documentary');music.id='mushrooms-sound';music.dataset.recordId=sound.id;music.append(labNode('h3','',sound.title),labNode('p','',sound.body));
  const host=labNode('div','mushroom-documentary-host'),actions=labNode('div','mushroom-lab-actions'),status=labNode('p','mushroom-demo-status');status.setAttribute('aria-live','polite');let frame=null;
  const messages={loading:'Opening the video…',ready:'The video is ready. Press Play in the player.',playing:'Playing the documentary.',paused:'Video paused.',ended:'The video has ended.',buffering:'The video is buffering.',blocked:'This video cannot play here. Use the YouTube link below.',error:'The video could not play. Try again or open it on YouTube.',timeout:'The video is taking too long. Try again or open it on YouTube.',unavailable:'The player is unavailable. Open the video on YouTube.'};
  const monitor=createMushroomDemo({onChange(value){music.dataset.demoState=value.state;status.textContent=messages[value.state]||'';retry.hidden=!['error','timeout','unavailable','blocked'].includes(value.state);}});
  function close(){monitor.close();frame?.remove();frame=null;host.replaceChildren();load.disabled=false;closeButton.hidden=true;retry.hidden=true;status.textContent='';}
  function open(){close();node.closest('.hrv-mushrooms')?.dispatchEvent(new CustomEvent('hrv-mushrooms-audio-start',{bubbles:true}));frame=labNode('iframe','mushroom-demo-frame');frame.title=movie.title;frame.referrerPolicy='strict-origin-when-cross-origin';frame.allow='autoplay; encrypted-media; picture-in-picture; fullscreen';frame.allowFullscreen=true;frame.src=mushroomDemoURL(movie.embed,location.origin);host.append(frame);load.disabled=true;closeButton.hidden=false;monitor.open(frame);}
  const load=labButton('Watch the short documentary',open,cleanups),retry=labButton('Try the video again',open,cleanups,'secondary'),closeButton=labButton('Close video',()=>{close();load.focus();},cleanups,'secondary');retry.hidden=closeButton.hidden=true;actions.append(load,retry,closeButton);
  const link=labNode('a','mushroom-documentary-link','Watch on YouTube');link.href=movie.watch;link.target='_blank';link.rel='noopener noreferrer';music.append(labNode('p','mushroom-documentary-name',movie.title+' · '+movie.creator),actions,host,status,link);node.append(light,music);
  const hidden=()=>{if(document.hidden)close();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)close();});observer.observe(music);cleanups.push(()=>observer.disconnect());
  function select(view){close();light.hidden=view!=='glow';music.hidden=view!=='sound';node.dataset.activity=view;}select('glow');return {node,select,suspend:close,destroy(){close();monitor.destroy();cleanups.forEach(fn=>fn());}};
}
export function createDiscoveryQuestions(questions,ui) {
  const node=labNode('div','mushroom-quiz'),cleanups=[];
  node.append(labNode('p','mushroom-eyebrow',ui.quizEyebrow));
  questions.forEach((question,i)=>{
    const field=labNode('fieldset','mushroom-question');field.dataset.recordId=question.id;field.append(labNode('legend','',`${i+1}. ${question.prompt}`));
    const choices=labNode('div','mushroom-answer-options'),feedback=labNode('p','mushroom-answer-feedback');feedback.setAttribute('aria-live','polite');const buttons=[];
    question.choices.forEach(choice=>{const b=labButton(choice.label,()=>{buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));feedback.textContent=choice.feedback;feedback.dataset.correct=String(choice.correct);},cleanups);b.setAttribute('aria-pressed','false');b.dataset.recordId=choice.id;buttons.push(b);choices.append(b);});field.append(choices,feedback);node.append(field);
  });
  return {node,destroy(){cleanups.forEach(f=>f());}};
}

export const MUSHROOM_JOURNAL_REPOSITORY = 'https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/feature/mushroom-exhibit-scaffold/';
export const MUSHROOM_JOURNAL_FEED = MUSHROOM_JOURNAL_REPOSITORY + 'apps/mushroom-exploration/source/journal/index.json';
const labels = { observation:'Our observations', fact:'Did you know?', 'teacher-note':'Teacher note', 'student-note':'Student note' };
function node(tag, className, text) {
  const result = document.createElement(tag);
  if (className) result.className = className;
  if (text !== undefined) result.textContent = text;
  return result;
}
function mediaURL(url) {
  const parsed = new URL(url);
  if (parsed.origin !== 'https://cdn.nlightlabs.com' || !parsed.pathname.startsWith('/hrv/mushrooms/') || parsed.username || parsed.password) throw new Error('Unapproved journal media');
  return parsed.href;
}
function dateLabel(date) {
  if (typeof date !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(date)) throw new Error('Invalid journal date');
  const parsed = new Date(date + 'T12:00:00Z');
  if (!Number.isFinite(parsed.valueOf()) || parsed.toISOString().slice(0, 10) !== date) throw new Error('Invalid journal date');
  return new Intl.DateTimeFormat('en-US', { weekday:'long', month:'long', day:'numeric', year:'numeric', timeZone:'UTC' }).format(parsed);
}
async function json(fetcher, url, parentSignal, bound, timeoutMs) {
  const controller = new AbortController();
  const cancel = () => controller.abort();
  parentSignal.addEventListener('abort', cancel, { once:true });
  if (parentSignal.aborted) controller.abort();
  const deadline = setTimeout(cancel, timeoutMs);
  let reader;
  try {
    const response = await fetcher(url, { credentials:'omit', redirect:'error', signal:controller.signal, cache:'no-cache' });
    if (!response.ok || !response.body) throw new Error('Journal unavailable');
    reader = response.body.getReader();
    let bytes = 0, text = '';
    const decoder = new TextDecoder('utf-8', { fatal:true });
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.length;
      if (bytes > bound) { await reader.cancel(); throw new Error('Journal record too large'); }
      text += decoder.decode(chunk.value, { stream:true });
    }
    return JSON.parse(text + decoder.decode());
  } finally {
    clearTimeout(deadline);
    parentSignal.removeEventListener('abort', cancel);
    reader?.releaseLock();
  }
}
export function createGrowingJournal(fallback, options = {}) {
  const fetcher = options.fetcher || (typeof window.fetch === 'function' ? window.fetch.bind(window) : null);
  const abort = new AbortController(), cleanups = [];
  const timeoutMs = Number.isSafeInteger(options.timeoutMs) && options.timeoutMs > 0 ? options.timeoutMs : 12000;
  let destroyed = false, loadingIndex = false, loadedIndex = false;
  const grid = node('div', 'mushroom-journal-days');
  let indexError;
  function pause() { grid.querySelectorAll('video').forEach(video => video.pause()); }
  function listen(target, event, handler) {
    target.addEventListener(event, handler);
    cleanups.push(() => target.removeEventListener(event, handler));
  }
  function pauseOther(active) { grid.querySelectorAll('video').forEach(video => { if (video !== active) video.pause(); }); }
  async function loadDay(entry, details, content) {
    if (!/^apps\/mushroom-exploration\/source\/journal\/days\/[a-f0-9-]+-\d+-[a-f0-9]{12}\.json$/.test(entry.recordPath)) throw new Error('Invalid journal path');
    const record = await json(fetcher, MUSHROOM_JOURNAL_REPOSITORY + entry.recordPath, abort.signal, 1000000, timeoutMs);
    if (destroyed) return;
    if (record.schemaVersion !== '1.0.0' || record.id !== entry.id || record.date !== entry.date || record.revision !== entry.revision || !Array.isArray(record.media) || !Array.isArray(record.cards)) throw new Error('Journal record mismatch');
    const gallery = node('div', 'mushroom-journal-gallery');
    for (const media of record.media) {
      const figure = node('figure');
      if (media.kind === 'video') {
        const video = node('video');
        video.controls = true; video.preload = 'none'; video.playsInline = true;
        video.poster = mediaURL(media.thumbnailUrl); video.src = mediaURL(media.url);
        listen(video, 'play', () => { pauseOther(video); options.onPlay?.(); });
        figure.append(video);
      } else if (media.kind === 'image') {
        const image = node('img'); image.src = mediaURL(media.url);
        image.alt = typeof media.alt === 'string' && media.alt.trim() ? media.alt : typeof media.caption === 'string' && media.caption.trim() ? media.caption : 'Our classroom mushroom growing block';
        image.loading = 'lazy'; image.decoding = 'async'; figure.append(image);
      } else throw new Error('Invalid media kind');
      if (typeof media.caption === 'string' && media.caption) figure.append(node('figcaption', '', media.caption));
      gallery.append(figure);
    }
    const notes = node('div', 'mushroom-journal-notes');
    for (const card of record.cards) {
      if (!Object.hasOwn(labels, card.type) || typeof card.text !== 'string' || !card.text.trim()) continue;
      const note = node('article', 'mushroom-journal-note ' + card.type);
      note.append(node('span', 'mushroom-journal-kind', labels[card.type]));
      if (typeof card.heading === 'string' && card.heading) note.append(node('h4', '', card.heading));
      note.append(node('p', '', card.text));
      if (typeof card.author === 'string' && card.author.trim()) note.append(node('p', 'mushroom-journal-author', '— ' + card.author));
      if (card.type === 'fact' && card.sourceUrl) {
        const url = new URL(card.sourceUrl);
        if (url.protocol !== 'https:' || url.username || url.password) throw new Error('Invalid fact source');
        const link = node('a', '', 'Learn more'); link.href = url.href; link.target = '_blank'; link.rel = 'noopener noreferrer'; note.append(link);
      }
      notes.append(note);
    }
    content.replaceChildren(gallery, notes); details.dataset.loaded = 'true';
  }
  function dayFrame(entry) {
    const details = node('details', 'mushroom-journal-day'), summary = node('summary'), copy = node('div', 'mushroom-journal-summary-copy');
    if (entry.cover) {
      const image = node('img', 'mushroom-journal-cover'); image.src = mediaURL(entry.cover.url);
      image.alt = typeof entry.cover.alt === 'string' ? entry.cover.alt : ''; image.loading = 'lazy'; summary.append(image);
    }
    copy.append(node('span', 'mushroom-journal-date', dateLabel(entry.date)), node('h3', '', entry.title || 'Our growing story'));
    if (entry.stage) copy.append(node('p', '', entry.stage));
    const toggle = node('span', 'mushroom-journal-toggle', 'Open this day');
    summary.append(copy, toggle);
    const content = node('div', 'mushroom-journal-day-body'); details.append(summary, content);
    let loading = false, wasOpen = false;
    async function openDay() {
      if (destroyed || details.dataset.loaded || loading) return;
      loading = true; content.setAttribute('aria-busy', 'true');
      content.replaceChildren(node('p', 'mushroom-journal-status', 'Opening this day…'));
      try { await loadDay(entry, details, content); }
      catch {
        if (!destroyed) {
          const retry = node('button', 'mushroom-button', 'Try this day again'); retry.type = 'button';
          listen(retry, 'click', () => { void openDay(); });
          content.replaceChildren(node('p', '', 'This day could not open just now.'), retry);
        }
      } finally { loading = false; content.removeAttribute('aria-busy'); }
    }
    listen(details, 'toggle', () => {
      if (details.open === wasOpen) return;
      wasOpen = details.open;
      toggle.textContent = details.open ? 'Close this day' : 'Open this day';
      if (!details.open) { details.querySelectorAll('video').forEach(video => video.pause()); return; }
      void openDay();
    });
    return details;
  }
  async function load() {
    if (loadingIndex || loadedIndex || destroyed || !fetcher) return;
    loadingIndex = true; fallback.setAttribute('aria-busy', 'true');
    try {
      const index = await json(fetcher, MUSHROOM_JOURNAL_FEED, abort.signal, 1000000, timeoutMs);
      if (destroyed) return;
      if (index.schemaVersion !== '1.0.0' || !Array.isArray(index.entries)) throw new Error('Invalid journal index');
      const seen = new Set(), frames = [];
      for (const entry of index.entries) {
        if (typeof entry.id !== 'string' || !/^[a-f0-9-]{36}$/.test(entry.id) || seen.has(entry.id) || !Number.isInteger(entry.revision) || entry.revision < 1 || typeof entry.title !== 'string' || typeof entry.stage !== 'string') throw new Error('Invalid journal identity');
        seen.add(entry.id); frames.push(dayFrame(entry));
      }
      indexError?.remove(); indexError = null; loadedIndex = true;
      if (frames.length) { grid.replaceChildren(...frames); fallback.replaceWith(grid); options.onReady?.(frames.length); }
    } catch {
      if (!destroyed) {
        indexError?.remove(); indexError = node('div', 'mushroom-journal-status'); indexError.setAttribute('role', 'status');
        const retry = node('button', 'mushroom-button', 'Try the journal again'); retry.type = 'button';
        listen(retry, 'click', () => { void load(); });
        indexError.append(node('p', '', 'Our journal could not open just now. Please try again.'), retry); fallback.append(indexError);
      }
    } finally { loadingIndex = false; fallback.removeAttribute('aria-busy'); }
  }
  function navigation(event) { const anchor = event.target.closest?.('a[href]'); if (anchor && anchor.hash && anchor.hash !== '#mushrooms-journal') pause(); }
  listen(document, 'click', navigation); listen(document, 'visibilitychange', () => { if (document.hidden) pause(); });
  let observer;
  if (typeof window.IntersectionObserver === 'function') {
    observer = new window.IntersectionObserver(entries => { if (entries.some(entry => entry.isIntersecting)) { void load(); observer.disconnect(); } }, { rootMargin:'500px' }); observer.observe(fallback);
  } else if (fetcher) Promise.resolve().then(() => load());
  return { node:grid, load, suspend:pause, destroy() {
    destroyed = true; abort.abort(); observer?.disconnect(); pause(); cleanups.forEach(cleanup => cleanup());
    grid.querySelectorAll('video').forEach(video => { video.removeAttribute('src'); video.load(); });
  } };
}










const mushroomMounts=new WeakMap();
function element(tag,className,value){const result=document.createElement(tag);if(className)result.className=className;if(value!==undefined)result.textContent=value;return result;}
function anchor(text,href,className){const result=element('a',className,text);result.href=href;return result;}
function artwork(html){const template=document.createElement('template');template.innerHTML=html;return template.content;}
function paragraphText(parent,value){value.split(/\n\s*\n/u).filter(Boolean).forEach(part=>parent.append(element('p','',part)));}
function sourceImage(reference,className){const image=element('img',className),photo=mushroomPhotoAsset(reference.url);image.src=mushroomPhotoURL(reference.url);image.alt=reference.alt;image.loading='lazy';image.decoding='async';if(photo){image.width=photo.width;image.height=photo.height;}return image;}
export function mountMushroomExhibit(root,source,options){
  if(!(root instanceof HTMLElement))throw new TypeError('Mushroom mount requires an HTMLElement.');
  const existing=mushroomMounts.get(root);if(existing)return existing;
  const settings=options||{};validateMushroomSource(source,{allowDraft:settings.allowDraft===true});
  const original={html:root.innerHTML,className:root.className};const cleanups=[];let destroyed=false;
  function restoreRoot(){root.innerHTML=original.html;root.className=original.className;for(const name of ['data-hrv-state','data-research-status','data-less-motion','data-narration-state','data-reading-voices','data-reading-failure','data-reading-started','data-reading-characters','data-reading-elapsed-ms'])root.removeAttribute(name);root.style.removeProperty('--mushroom-viewport-width');root.style.removeProperty('--mushroom-nav-height');}
  const idPrefix=root.id.replace(/[^a-z0-9-]/gi,'-'),ui=source.data.ui,readingTools=[];
  const reader=createMushroomNarration({synthesis:window.speechSynthesis,utteranceFactory:typeof window.SpeechSynthesisUtterance==='function'?text=>new SpeechSynthesisUtterance(text):null,onChange(state){root.dataset.narrationState=state.state;root.dataset.readingVoices=String(state.voices.length);root.dataset.readingFailure=state.failure||'';root.dataset.readingStarted=String(state.lastReading?.started||false);root.dataset.readingCharacters=String(state.lastReading?.characters||0);root.dataset.readingElapsedMs=String(state.lastReading?.elapsedMs||0);readingTools.forEach(tool=>tool.update(state));}});cleanups.push(()=>reader.destroy());
  function listen(target,name,handler,options){target.addEventListener(name,handler,options);cleanups.push(()=>target.removeEventListener(name,handler,options));}
  function fitViewport(){root.style.setProperty('--mushroom-viewport-width',document.documentElement.clientWidth+'px');}
  function button(label,handler,className){const b=element('button',className||'mushroom-lab-button',label);b.type='button';listen(b,'click',handler);return b;}
  const panelActivities=new Map(),blockControllers=new Map();
  function registerActivity(type,activity){if(!panelActivities.has(type))panelActivities.set(type,[]);panelActivities.get(type).push(activity);}
  function attachLab(parent,lab){blockControllers.set(parent.closest('[data-block-type]').dataset.blockType,lab);parent.append(lab.node);registerActivity(parent.closest('[data-block-type]').dataset.blockType,lab);cleanups.push(()=>lab.destroy());}
  let photoDialog,photoDialogTitle,photoDialogContent,photoOpener;
  function learningNotes(learning){
    const bar=element('div','mushroom-learning-notes');
    if(learning.action)bar.append(element('p','mushroom-instruction',learning.action));
    if(learning.observe){const prompt=element('p','mushroom-observe');prompt.append(element('strong','',ui.noticePrefix),document.createTextNode(learning.observe));bar.append(prompt);}
    if(learning.safety)bar.append(element('p','mushroom-safety-rule',learning.safety));
    if(learning.words.length||learning.teacher){const details=element('details','mushroom-science-words');details.append(element('summary','',ui.wordsTitle));const dl=element('dl');learning.words.forEach(word=>{const term=element('dt','',word.term);if(word.pronunciation)term.append(element('span','mushroom-pronunciation',' · '+word.pronunciation));dl.append(term,element('dd','',word.body));});if(learning.words.length)details.append(dl);if(learning.teacher)details.append(element('p','',learning.teacher));bar.append(details);}
    return bar;
  }
  function creditLine(photo){
    const credit=element('p','mushroom-photo-credit');
    credit.append(anchor(photo.creator,photo.page),document.createTextNode(' · '),anchor(photo.license,photo.licenseUrl),document.createTextNode(' · '+ui.photoChangeSuffix));
    credit.querySelectorAll('a').forEach(link=>{link.target='_blank';link.rel='noopener noreferrer';});
    return credit;
  }
  function openPhoto(reference){
    photoOpener=document.activeElement;
    const photo=mushroomPhotoAsset(reference.url);
    if(!photoDialog){
      photoDialog=element('dialog','mushroom-photo-dialog');
      photoDialogTitle=element('h2','mushroom-photo-dialog-title');photoDialogTitle.id=idPrefix+'-photo-title';
      photoDialog.setAttribute('aria-labelledby',photoDialogTitle.id);
      photoDialogContent=element('div','mushroom-photo-dialog-content');
      const close=button(ui.photoClose,()=>photoDialog.close(),'mushroom-photo-close');
      photoDialog.append(close,photoDialogTitle,photoDialogContent);root.append(photoDialog);
      listen(photoDialog,'close',()=>{if(photoOpener?.isConnected)photoOpener.focus({preventScroll:true});});
      cleanups.push(()=>{if(photoDialog.open)photoDialog.close();});
    }
    photoDialogTitle.textContent=photo?.name||ui.photoFallbackTitle;
    const image=sourceImage(reference,'mushroom-photo-full');image.loading='eager';
    photoDialogContent.replaceChildren(image,element('p','mushroom-photo-full-caption',reference.caption));
    if(photo){photoDialogContent.append(element('p','mushroom-photo-subject',photo.subject+' · '+photo.type),creditLine(photo),element('p','mushroom-photo-changes',photo.changes));}
    photoDialog.showModal();
  }
  function photoFigure(reference,className,specimen=false){
    const photo=mushroomPhotoAsset(reference.url),figure=element('figure','mushroom-photo '+(className||''));
    if(photo){figure.dataset.photoId=photo.id;figure.dataset.photoFit=photo.fit;}
    const inspect=button('',()=>openPhoto(reference),'mushroom-photo-inspect');
    inspect.setAttribute('aria-label',mushroomCopy(ui.photoEnlargeTemplate,{name:photo?.name||reference.alt}));inspect.setAttribute('aria-haspopup','dialog');
    const image=sourceImage(reference,'mushroom-photo-image'),type=element('span','mushroom-photo-type',photo?.type.split(' · ')[0]||ui.photographLabel);
    if(specimen){
      const window=element('span','mushroom-photo-window');window.append(image,type);inspect.append(window);
      if(photo?.fit==='contain'){
        const plate=element('span','mushroom-specimen-plate');plate.setAttribute('aria-hidden','true');
        plate.append(element('span','mushroom-specimen-view',photo.type.split(' · ')[0]),element('span','mushroom-specimen-name',photo.name));inspect.append(plate);
      }
    }else inspect.append(image,type);
    inspect.append(element('span','mushroom-photo-zoom',ui.photoZoom));
    const caption=element('figcaption','mushroom-photo-caption',reference.caption);figure.append(inspect,caption);
    return figure;
  }
  function sourcesFor(block){
    const refs=new Set();function collect(value){if(!value||typeof value!=='object')return;if(Array.isArray(value.sourceRefs))value.sourceRefs.forEach(ref=>refs.add(ref));Object.values(value).forEach(item=>{if(Array.isArray(item))item.forEach(collect);else if(item&&typeof item==='object')collect(item);});}collect(block);
    if(!refs.size)return null;const details=element('details','mushroom-sources');details.append(element('summary','',ui.sourcesTitle));const list=element('ul');
    source.data.sources.filter(item=>refs.has(item.id)).forEach(item=>{const li=element('li');li.append(anchor(item.title,item.url));list.append(li);});details.append(list);return details;
  }
  const motionPreference=browserMotionPreference();function updateMotion(){root.dataset.lessMotion=String(motionPreference.matches);if(motionPreference.matches)panelActivities.forEach(list=>list.forEach(lab=>lab.suspend?.()));}motionPreference.addEventListener('change',updateMotion);cleanups.push(()=>motionPreference.removeEventListener('change',updateMotion));updateMotion();
  listen(document,'visibilitychange',()=>{if(document.hidden)reader.stop();});listen(root,'hrv-mushrooms-audio-start',()=>reader.stop());listen(root,'play',()=>reader.stop(),true);
  listen(root,'click',event=>{if(event.target.closest('[role=tabpanel] button,[role=tabpanel] a,.mushroom-chapter-link,.mushroom-photo-inspect'))reader.stop();});
  listen(root,'change',event=>{if(event.target.closest('[role=tabpanel]'))reader.stop();});
  let focusFrame=0;listen(root,'focusin',event=>{cancelAnimationFrame(focusFrame);focusFrame=requestAnimationFrame(()=>{focusFrame=0;const target=event.target,nav=root.querySelector('.mushroom-navigation');if(!nav||document.fullscreenElement||nav.contains(target)||target.closest('dialog'))return;const box=target.getBoundingClientRect(),edge=nav.getBoundingClientRect().bottom+18;if(box.top<edge)window.scrollBy({top:box.top-edge,behavior:'instant'});else if(box.height<window.innerHeight-edge&&box.bottom>window.innerHeight-18)window.scrollBy({top:box.bottom-window.innerHeight+18,behavior:'instant'});});});cleanups.push(()=>cancelAnimationFrame(focusFrame));
  root.className='hrv-mushrooms';root.dataset.hrvState='loading';root.dataset.researchStatus=source.data.meta.researchStatus;root.replaceChildren();fitViewport();listen(window,'resize',fitViewport);
  try {
    const skip=anchor(ui.skipLabel,'#mushrooms-journal','mushroom-skip');
    const nav=element('nav','mushroom-navigation');nav.setAttribute('aria-label',ui.navLabel);
    const brand=anchor(ui.brand,'https://rmhughes.edublogs.org/','mushroom-brand');
    const mark=element('span','mushroom-brand-mark');mark.setAttribute('aria-hidden','true');mark.append(artwork('<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 20L15 34H25L23 20" fill="currentColor"/><path d="M4 21Q20 -6 36 21Q20 29 4 21" fill="none" stroke="currentColor" stroke-width="2"/></svg>'));brand.prepend(mark);
    const links=element('div','mushroom-navigation-links'),chapterLinks=[];
    [['01',source.data.blocks.find(b=>b.type==='journal').label,'journal'],['02',source.data.blocks.find(b=>b.type==='family').station.title,'discover'],['03',source.data.blocks.find(b=>b.type==='lifecycle').station.title,'motion']].forEach(([number,label,target])=>{
      const link=anchor('','#mushrooms-'+target,'mushroom-chapter-link');
      const badge=element('span','chapter-number',number),arrow=element('span','chapter-arrow');badge.setAttribute('aria-hidden','true');arrow.setAttribute('aria-hidden','true');
      link.append(badge,element('span','chapter-label',label),arrow);links.append(link);chapterLinks.push(link);
    });nav.append(brand,links);root.append(skip,nav);
    const main=element('div','mushroom-main');main.id='mushrooms-main';root.append(main);
    source.data.blocks.forEach(block=>{
      const section=element('section','mushroom-block mushroom-section-'+block.type);section.dataset.blockId=block.id;section.dataset.blockType=block.type;section.id='mushrooms-'+block.type;section.setAttribute('aria-labelledby',section.id+'-title');
      const inner=element('div','mushroom-inner');section.append(inner);main.append(section);
      if(block.type==='hero'){
        if(block.media){const custom=sourceImage(block.media,'mushroom-hero-custom');section.prepend(custom);}
        const copy=element('div','mushroom-hero-copy');const title=element('h1','mushroom-hero-title',block.title);title.id=section.id+'-title';
        copy.append(element('p','mushroom-eyebrow',block.eyebrow),title,element('p','mushroom-hero-intro',block.intro));
        const actions=element('div','mushroom-hero-actions');actions.append(anchor(block.entry.journalReadyLabel,'#mushrooms-journal','mushroom-button'),anchor(block.entry.exploreLabel,'#mushrooms-discover','mushroom-text-link'));copy.append(actions);inner.append(copy);
        section.append(element('p','mushroom-art-caption',block.media?.caption||ui.heroArtworkLabel));
        return;
      }
      const heading=element('header','mushroom-section-heading');const h2=element('h2','',block.title);h2.id=section.id+'-title';heading.append(element('p','mushroom-eyebrow',block.eyebrow),h2);if(block.intro)heading.append(element('p','section-intro',block.intro));inner.append(heading);
      if(block.type==='family'){
        const grid=element('div','mushroom-specimens');block.cards.forEach(card=>{
          const article=element('article','mushroom-specimen mushroom-specimen-with-photo');article.dataset.recordId=card.id;
          const title=element('h3','mushroom-specimen-title',card.title);title.id=idPrefix+'-'+card.id.replace(/[^a-z0-9-]/gi,'-');article.setAttribute('aria-labelledby',title.id);article.append(title);
          const copy=element('div','mushroom-specimen-copy');copy.append(element('p','',card.body));
          if(card.media){const figure=photoFigure(card.media,'mushroom-specimen-photo',true);figure.insertBefore(copy,figure.querySelector('figcaption'));article.append(figure);}else article.append(copy);
          grid.append(article);
        });inner.append(grid);
      }else if(block.type==='roles'){
        attachLab(inner,createRolesLab(block,photoFigure,idPrefix,learningNotes,ui));
      }else if(block.type==='anatomy'){
        const layout=element('div','mushroom-anatomy-layout'),diagram=element('div','mushroom-diagram');diagram.append(photoFigure(block.media||mushroomDiagramReference('anatomy'),'mushroom-published-figure'));
        const detail=element('div','mushroom-observation-card');detail.id=idPrefix+'-observation';detail.setAttribute('aria-live','polite');const partButtons=[],gillPhoto=block.detailMedia?photoFigure(block.detailMedia,'mushroom-anatomy-photo'):null;
        const partList=element('div','mushroom-anatomy-parts');partList.setAttribute('role','group');partList.setAttribute('aria-label',ui.partGroup);
        function choose(point,index){detail.replaceChildren(element('p','mushroom-eyebrow',mushroomCopy(ui.partCountTemplate,{index:String(index+1).padStart(2,'0'),total:block.hotspots.length})),element('h3','',point.label),element('p','',point.body));partButtons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));if(gillPhoto)gillPhoto.hidden=point.id!=='mushroom-point:gills';diagram.dataset.selected=point.id.split(':')[1];}
        block.hotspots.forEach((point,index)=>{const named=button(String(index+1).padStart(2,'0')+' · '+point.label,()=>choose(point,index),'mushroom-part-button');named.setAttribute('aria-controls',detail.id);named.dataset.recordId=point.id;partButtons.push(named);partList.append(named);});choose(block.hotspots[0],0);
        const desk=element('div','mushroom-specimen-desk');desk.append(diagram,element('p','mushroom-diagram-note',ui.anatomyModelNote));const aside=element('div','mushroom-anatomy-aside');aside.append(partList,detail);if(gillPhoto)aside.append(gillPhoto);layout.append(desk,aside);inner.append(layout);
      }else if(block.type==='cutaway'){
        attachLab(inner,createGrowthLab(block,idPrefix,photoFigure,ui));
      }else if(block.type==='lifecycle'){
        attachLab(inner,createSporeLab(block,photoFigure,idPrefix,ui));

      }else if(block.type==='lab')attachLab(inner,createWonderLab(block,photoFigure,learningNotes,source.data.sources));
      else if(block.type==='facts'){
        const grid=element('div','mushroom-fact-grid');block.cards.forEach((fact,i)=>{const card=element('article','mushroom-fact');card.dataset.recordId=fact.id;const symbol=element('span','mushroom-fact-mark',String(i+1).padStart(2,'0'));symbol.setAttribute('aria-hidden','true');card.append(symbol,element('h3','',fact.title),element('p','',fact.body));grid.append(card);});inner.append(grid);attachLab(inner,createDiscoveryQuestions(block.questions,ui));
      }else if(block.type==='journal'){
        const notebook=element('div','mushroom-journal-placeholder');notebook.append(element('span','mushroom-journal-year',source.data.meta.schoolYear.replace('-', ' / ')),element('h3','',ui.journalHeading),element('p','',ui.journalBody));inner.append(notebook);
        const journal=createGrowingJournal(notebook,{onPlay(){reader.stop();panelActivities.forEach(list=>list.forEach(lab=>lab.suspend?.()));}});cleanups.push(()=>journal.destroy());
      }
      const notes=learningNotes(block.type==='roles'?{...block.learning,action:'',observe:'',words:[]}:block.learning);notes.dataset.blockNotes=block.type;inner.append(notes);
    });
    function readingToolbar(station){
      const tools=element('div','mushroom-reading-tools'),actions=element('div','mushroom-reading-actions'),message=element('p','mushroom-reading-status');message.setAttribute('aria-live','polite');
      const read=button(ui.narration.read,()=>{
        panelActivities.forEach(list=>list.forEach(lab=>lab.suspend?.()));root.querySelectorAll('video,audio').forEach(media=>media.pause());root.dispatchEvent(new CustomEvent('hrv-mushrooms-narration-start',{bubbles:true}));
        const panel=station.querySelector('[role=tabpanel]:not([hidden])'),block=source.data.blocks.find(b=>b.type===panel.dataset.blockType),role=panel.querySelector('.mushroom-role-exhibit:not([hidden])'),diagram=panel.querySelector('.mushroom-diagram'),view=station.dataset.activePanel;
        const selected=panel.querySelector('.mushroom-cycle-stage[aria-pressed=true]'),stage=selected?Array.from(panel.querySelectorAll('.mushroom-cycle-stage')).indexOf(selected):0;
        const reading=mushroomReadingText(block,{view:block.type==='cutaway'?panel.querySelector('.mushroom-cutaway-panel').dataset.view:view,recordId:role?.dataset.recordId,partId:diagram?'mushroom-point:'+diagram.dataset.selected:undefined,stage,status:Array.from((role||panel).querySelectorAll('.mushroom-model-status')).find(el=>el.getBoundingClientRect().height>0)?.textContent||''});reader.read(reading,station.id);
      },'mushroom-read-button');
      const stop=button(ui.narration.stop,()=>reader.stop(),'mushroom-read-stop');actions.append(read,stop);
      const options=element('details','mushroom-voice-options'),summary=element('summary','',ui.narration.options),label=element('label','',ui.narration.voiceLabel),select=element('select');label.append(select);options.append(summary,label,element('p','',ui.narration.voiceHelp));listen(select,'change',()=>reader.selectVoice(select.value));
      let voiceList='';function update(state){const own=state.owner===station.id,busy=own&&['reading','starting'].includes(state.state);read.disabled=busy;stop.hidden=!busy;const key=JSON.stringify(state.voices);if(key!==voiceList){voiceList=key;select.replaceChildren();if(!state.voices.length){const option=element('option','',ui.narration.none);select.append(option);}else state.voices.forEach(voice=>{const option=element('option','',voice.name+' · '+voice.lang);option.value=voice.id;select.append(option);});}select.disabled=!state.voices.length;select.value=state.selected;message.textContent=own?ui.narration[state.state]||'':'';message.hidden=!message.textContent;}
      readingTools.push({update});update(reader.snapshot());tools.append(actions,options,message);return tools;
    }
    const stationControllers=[];
    function learningStation(id,number,stationCopy,entries){
      const station=element('section','mushroom-learning-station');station.id=id;station.setAttribute('aria-labelledby',id+'-title');station.tabIndex=-1;
      const wrap=element('div','mushroom-station-inner'),head=element('header','mushroom-station-heading'),titleWrap=element('div');
      const stationTitle=element('h2','',stationCopy.title);stationTitle.id=id+'-title';titleWrap.append(element('p','mushroom-eyebrow',ui.exhibitPrefix+' / '+number),stationTitle);head.append(titleWrap,element('p','mushroom-station-intro',stationCopy.intro));
      const tabs=element('div','mushroom-station-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',stationCopy.title);
      const pickerLabel=element('label','mushroom-activity-picker',ui.chooseActivity);const picker=element('select');picker.setAttribute('aria-label',mushroomCopy(ui.chooseActivityTemplate,{title:stationCopy.title}));pickerLabel.append(picker);
      const content=element('div','mushroom-station-content'),buttons=[],sections=[];
      const panels=[...new Set(entries.map(entry=>root.querySelector('#mushrooms-'+entry.type)))];
      const next=button('',()=>{const index=Number(station.dataset.activeIndex);if(index+1<entries.length)select(index+1,{focusPanel:true,history:true,scroll:true});else if(id==='mushrooms-discover'){stationControllers.find(c=>c.station.id==='mushrooms-motion').select(0);goTo('#mushrooms-motion');}else goTo('#mushrooms-journal');},'mushroom-next');
      function select(index,options={}){
        reader.stop();const entry=entries[index],active=root.querySelector('#mushrooms-'+entry.type);
        panels.forEach(panel=>{panel.hidden=panel!==active;(panelActivities.get(panel.dataset.blockType)||[]).forEach(lab=>lab.suspend?.());});
        buttons.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
        picker.value=String(index);picker.setAttribute('aria-controls',active.id);station.dataset.activeIndex=String(index);station.dataset.activePanel=entry.view||entry.type;active.setAttribute('aria-labelledby',buttons[index].id);
        if(entry.view)blockControllers.get(entry.type)?.select(entry.view);
        const block=source.data.blocks.find(b=>b.type===entry.type),context=entry.view?(entry.type==='lifecycle'?block.activities.find(a=>a.view===entry.view):block.experiments.find(a=>a.mode===entry.view)):block;
        active.querySelector('.mushroom-section-heading h2').textContent=context.title;
        active.querySelector('.section-intro').textContent=context.intro||context.body;
        const combined=entry.type==='roles'?{...block.learning,action:'',observe:'',words:[]}:entry.view?{...context.learning,words:[...context.learning.words,...block.learning.words],teacher:[context.learning.teacher,block.learning.teacher].filter(Boolean).join(' ')}:context.learning;
        if(entry.view==='puffball')combined.safety='';
        const notes=learningNotes(combined);notes.dataset.blockNotes=entry.type;
        active.querySelector('[data-block-notes]').replaceWith(notes);
        next.textContent=mushroomCopy(ui.nextTemplate,{title:index+1<entries.length?entries[index+1].label:id==='mushrooms-discover'?lifeBlock.station.title:source.data.blocks.find(b=>b.type==='journal').label});
        if(options.focusTab)buttons[index].focus();
        if(options.history)history.replaceState(null,'','#'+entry.target);
        if(options.scroll)active.scrollIntoView({block:'start',behavior:'instant'});
        if(options.focusPanel)active.focus({preventScroll:true});
      }
      entries.forEach((entry,index)=>{
        const panel=root.querySelector('#mushrooms-'+entry.type),tab=button(entry.label,()=>select(index,{history:true}),'mushroom-station-tab');tab.id=id+'-tab-'+(entry.view||entry.type);tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);panel.setAttribute('role','tabpanel');panel.tabIndex=0;
        listen(tab,'keydown',event=>{let nextIndex=index;if(event.key==='ArrowRight')nextIndex=(index+1)%entries.length;else if(event.key==='ArrowLeft')nextIndex=(index+entries.length-1)%entries.length;else if(event.key==='Home')nextIndex=0;else if(event.key==='End')nextIndex=entries.length-1;else return;event.preventDefault();select(nextIndex,{focusTab:true,history:true});});
        const option=element('option','',entry.label);option.value=String(index);picker.append(option);buttons.push(tab);sections.push(panel);tabs.append(tab);
      });
      listen(picker,'change',()=>select(Number(picker.value),{history:true}));
      panels.forEach(panel=>content.append(panel));const stationActions=element('div','mushroom-station-actions');stationActions.append(next,readingToolbar(station));head.append(stationActions);wrap.append(head,tabs,pickerLabel,content);station.append(wrap);main.insertBefore(station,root.querySelector('#mushrooms-journal'));select(0);stationControllers.push({station,entries,select});
    }
    const familyBlock=source.data.blocks.find(b=>b.type==='family'),lifeBlock=source.data.blocks.find(b=>b.type==='lifecycle'),labBlock=source.data.blocks.find(b=>b.type==='lab');
    learningStation('mushrooms-discover','02',familyBlock.station,['family','anatomy','cutaway','roles'].map(type=>({type,label:source.data.blocks.find(b=>b.type===type).label,target:'mushrooms-'+type})));
    learningStation('mushrooms-motion','03',lifeBlock.station,[...lifeBlock.activities.map(activity=>({type:'lifecycle',view:activity.view,label:activity.label,target:'mushrooms-'+activity.view})),...labBlock.experiments.map(activity=>({type:'lab',view:activity.mode,label:activity.label,target:'mushrooms-'+activity.mode})),{type:'facts',label:source.data.blocks.find(b=>b.type==='facts').label,target:'mushrooms-facts'}]);
    // The class's work is the entrance. The existing science remains an optional visit.
    const exploration=element('details','mushroom-optional-exploration'),exploreSummary=element('summary','mushroom-exploration-summary'),exploreCopy=source.data.blocks.find(b=>b.type==='hero').entry;
    exploration.id='mushrooms-explore';exploreSummary.append(element('h2','',exploreCopy.exploreLabel),element('p','',exploreCopy.note));exploration.append(exploreSummary);
    stationControllers.forEach(controller=>exploration.append(controller.station));
    main.append(root.querySelector('#mushrooms-journal'),exploration);
    listen(exploration,'toggle',()=>{if(!exploration.open){reader.stop();panelActivities.forEach(list=>list.forEach(lab=>lab.suspend?.()));}});
    function resolveDestination(hash){
      const value=hash.slice(1);
      for(const controller of stationControllers){
        let index=controller.entries.findIndex(entry=>entry.target===value);
        // Historical block links keep their former first activity as the landing view.
        if(index<0&&['mushrooms-lifecycle','mushrooms-lab'].includes(value))index=controller.entries.findIndex(entry=>'mushrooms-'+entry.type===value);
        if(index>=0)return {controller,index};
      }
      const target=Array.from(root.querySelectorAll('[id]')).find(node=>node.id===value),panel=target?.closest('[role=tabpanel]');
      if(panel)for(const controller of stationControllers){const index=controller.entries.findIndex(entry=>'mushrooms-'+entry.type===panel.id);if(index>=0)return {controller,index};}
      return null;
    }
    function revealHash(){const destination=resolveDestination(location.hash);if(destination){exploration.open=true;destination.controller.select(destination.index);}}
    function goTo(hash,push=true){
      const destination=resolveDestination(hash);if(destination){exploration.open=true;destination.controller.select(destination.index);}
      const target=destination?root.querySelector('#mushrooms-'+destination.controller.entries[destination.index].type):Array.from(root.querySelectorAll('[id]')).find(node=>'#'+node.id===hash);
      if(!target)return;if(exploration.contains(target))exploration.open=true;if(push&&location.hash!==hash)history.pushState(null,'',hash);target.tabIndex=target.tabIndex<0?-1:target.tabIndex;target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true});scheduleChapter();
    }
    listen(window,'hashchange',()=>{revealHash();goTo(location.hash,false);});listen(window,'popstate',()=>{revealHash();goTo(location.hash,false);});
    listen(root,'click',event=>{const link=event.target.closest('a[href]');if(!link)return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search||!url.hash)return;const known=resolveDestination(url.hash)||Array.from(root.querySelectorAll('[id]')).some(node=>'#'+node.id===url.hash);if(known){event.preventDefault();goTo(url.hash);}});
    revealHash();
    // Track the section at the reading edge without changing scroll position or history.
    const navObserver=new ResizeObserver(()=>root.style.setProperty('--mushroom-nav-height',Math.ceil(nav.getBoundingClientRect().height)+'px'));navObserver.observe(nav);cleanups.push(()=>navObserver.disconnect());
    const chapters=chapterLinks.map(link=>root.querySelector(link.getAttribute('href')));let chapterFrame=0;
    function updateChapter(){
      chapterFrame=0;if(destroyed)return;
      const edge=nav.getBoundingClientRect().bottom+24;let current=-1;
      const visible=chapters.map((section,index)=>({section,index})).filter(({section})=>section.getClientRects().length>0);
      visible.forEach(({section,index})=>{if(section.getBoundingClientRect().top<=edge)current=index;});
      const last=visible.at(-1);if(last&&last.section.getBoundingClientRect().top<window.innerHeight&&document.documentElement.getBoundingClientRect().bottom<=window.innerHeight+2)current=last.index;
      chapterLinks.forEach((link,index)=>{if(index===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    }
    function scheduleChapter(){if(!chapterFrame)chapterFrame=requestAnimationFrame(updateChapter);}
    listen(window,'scroll',scheduleChapter);listen(window,'resize',scheduleChapter);listen(window,'hashchange',scheduleChapter);
    const chapterObserver=new ResizeObserver(scheduleChapter);chapterObserver.observe(main);cleanups.push(()=>{chapterObserver.disconnect();cancelAnimationFrame(chapterFrame);});scheduleChapter();
    let initialFrame=requestAnimationFrame(()=>{if(location.hash)goTo(location.hash,false);});cleanups.push(()=>cancelAnimationFrame(initialFrame));
    const credits=element('details','mushroom-credits');credits.id='mushrooms-credits';credits.append(element('summary','','Credits & sources'));const creditBody=element('div','mushroom-credits-body');
    for(const [heading,items] of [['Published diagrams',MUSHROOM_DIAGRAMS],['Photographs',MUSHROOM_PHOTOS],['Videos',[...MUSHROOM_VIDEOS,MUSHROOM_MUSIC_DOCUMENTARY]]]){creditBody.append(element('h3','',heading));const list=element('ul');items.forEach(item=>{const li=element('li');li.append(anchor(item.name||item.title,item.page),element('p','',item.creator),anchor(item.license,item.licenseUrl),element('p','',item.changes));list.append(li);});creditBody.append(list);}
    creditBody.append(element('h3','','Science sources'));const references=element('ul');source.data.sources.forEach(item=>{const li=element('li');li.append(anchor(item.title,item.url));references.append(li);});creditBody.append(references);credits.append(creditBody);root.append(credits);
    const footer=element('footer','mushroom-footer');footer.append(element('span','',ui.footerLabel),anchor(ui.footerLink,'https://rmhughes.edublogs.org/hub/'));root.append(footer);
    const observer=new ResizeObserver(fitViewport);observer.observe(document.documentElement);cleanups.push(()=>observer.disconnect());root.dataset.hrvState='ready';
  }catch(error){cleanups.forEach(f=>f());restoreRoot();throw error;}
  const controller={destroy(){if(destroyed)return;destroyed=true;cleanups.forEach(f=>f());restoreRoot();mushroomMounts.delete(root);}};
  mushroomMounts.set(root,controller);return controller;
}
