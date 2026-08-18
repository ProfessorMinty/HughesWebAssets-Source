import type { AlbumCollection, AlbumRecord, AlbumTheme, PhotoAlbumManifest } from "../types";

export function themeForAlbumName(value: string): AlbumTheme {
  const name = value.toLocaleLowerCase();
  if (/pumpkin|harvest|autumn|fall|apple|orchard/.test(name)) return "harvest";
  if (/science|museum|experiment|stem|laboratory|\blab\b/.test(name)) return "discovery";
  if (/mushroom|fungi|fungus|forest|woods|woodland/.test(name)) return "woodland";
  if (/zinnia|garden|flower|plant|botanical|greenhouse/.test(name)) return "garden";
  if (/constellation|night sky|star|space|planetarium|astronomy|observatory/.test(name)) return "constellation";
  return "memory";
}

export function themeForAlbum(album: AlbumRecord): AlbumTheme {
  return themeForAlbumName(album.name);
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
