import type { PhotoRecord } from "../apps/photo-album/src/types";

export function photo(id: string, albumId = "album-1"): PhotoRecord {
  return {
    id,
    revision: "2099-08-10T00:00:00.000Z",
    albumId,
    albumName: `Album ${albumId}`,
    name: `${id}.jpg`,
    alt: "",
    galleryUrl: `https://photos.example.test/media/derivatives/gallery/${id}/revision.jpg`,
    fullSizeUrl: `https://photos.example.test/media/derivatives/full/${id}/revision.jpg`,
  };
}
