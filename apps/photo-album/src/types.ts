export interface ManifestSource {
  type?: string;
  rootFolderId?: string;
  rootFolderName?: string;
}

export interface AlbumRecord {
  id: string;
  name: string;
  declaredPhotoCount: number | null;
}

export interface PhotoRecord {
  id: string;
  revision: string | null;
  albumId: string;
  albumName: string;
  name: string | null;
  alt: string;
  galleryUrl: string;
  fullSizeUrl: string | null;
}

export interface PhotoAlbumManifest {
  version: number;
  albumId: string;
  schoolYear: string;
  source: ManifestSource | null;
  generatedAt: string | null;
  albums: AlbumRecord[];
  photos: PhotoRecord[];
  warnings: string[];
}

export type AlbumTheme = "memory" | "harvest" | "discovery" | "woodland" | "garden" | "constellation";

export interface AlbumViewModel extends AlbumRecord {
  photos: PhotoRecord[];
  theme: AlbumTheme;
}

export interface AlbumCollection {
  albums: AlbumViewModel[];
  photos: PhotoRecord[];
  orphanedPhotoCount: number;
}

export type AppRoute =
  | { name: "home" }
  | { name: "all"; albumIds: string[] }
  | { name: "album"; albumId: string }
  | { name: "years" };
