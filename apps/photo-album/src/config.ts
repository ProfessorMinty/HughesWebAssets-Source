export const DEFAULT_MANIFEST_URL =
  "https://hrv-photo-album.drminty17.workers.dev/manifest.json";

export const DEFAULT_YEAR_CATALOG_URL =
  "https://hrv-photo-album.drminty17.workers.dev/years.json";

export const APP_HASH_PREFIX = "hrv-photo-album";
export const MANIFEST_TIMEOUT_MS = 12_000;
export const CAROUSEL_INTERVAL_MS = 7_000;

export interface PhotoAlbumOptions {
  manifestUrl?: string;
  yearCatalogUrl?: string;
  layout?: "contained" | "viewport";
}
