import type { AlbumCollection, AlbumRecord, AlbumTheme, PhotoAlbumManifest } from "../types";

const THEMES: AlbumTheme[] = ["harvest", "discovery", "woodland", "garden", "constellation"];

function stableHash(value: string): number {
  let hash = 2166136261;
  for (const character of value) {
    hash ^= character.charCodeAt(0);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

export function themeForAlbum(album: AlbumRecord): AlbumTheme {
  const name = album.name.toLocaleLowerCase();
  if (/pumpkin|harvest|autumn|fall/.test(name)) return "harvest";
  if (/science|museum|space|experiment/.test(name)) return "discovery";
  if (/mushroom|forest|woods|nature/.test(name)) return "woodland";
  if (/zinnia|garden|flower|plant/.test(name)) return "garden";
  return THEMES[stableHash(album.id) % THEMES.length] ?? "constellation";
}

export function buildAlbumCollection(manifest: PhotoAlbumManifest): AlbumCollection {
  const photosByAlbum = new Map<string, typeof manifest.photos>();
  for (const album of manifest.albums) photosByAlbum.set(album.id, []);

  let orphanedPhotoCount = 0;
  for (const photo of manifest.photos) {
    const bucket = photosByAlbum.get(photo.albumId);
    if (bucket) bucket.push(photo);
    else orphanedPhotoCount += 1;
  }

  const albums = manifest.albums.map((album) => ({
    ...album,
    photos: photosByAlbum.get(album.id) ?? [],
    theme: themeForAlbum(album),
  }));

  return {
    albums,
    photos: albums.flatMap((album) => album.photos),
    orphanedPhotoCount,
  };
}
