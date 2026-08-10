import { MANIFEST_TIMEOUT_MS } from "../config";
import type {
  AlbumRecord,
  ManifestSource,
  PhotoAlbumManifest,
  PhotoRecord,
} from "../types";

type JsonObject = Record<string, unknown>;

export class ManifestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ManifestError";
  }
}

export interface LoadedManifest {
  manifest: PhotoAlbumManifest;
  origin: "network" | "cache";
  cachedAt: string | null;
}

export interface ManifestClientOptions {
  fetchImpl?: typeof fetch;
  storage?: Storage | null;
  timeoutMs?: number;
}

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown, path: string): string {
  if (typeof value !== "string" || value.trim() === "") {
    throw new ManifestError(`${path} must be a non-empty string.`);
  }
  return value.trim();
}

function optionalString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function validMediaUrl(value: unknown, derivative: "gallery" | "full"): string | null {
  if (typeof value !== "string") return null;
  try {
    const parsed = new URL(value);
    const marker = `/media/derivatives/${derivative}/`;
    if (parsed.protocol !== "https:" || !parsed.pathname.includes(marker)) return null;
    return parsed.href;
  } catch {
    return null;
  }
}

function parseSource(value: unknown): ManifestSource | null {
  if (!isObject(value)) return null;
  const source: ManifestSource = {};
  const type = optionalString(value.type);
  const rootFolderId = optionalString(value.rootFolderId);
  const rootFolderName = optionalString(value.rootFolderName);
  if (type) source.type = type;
  if (rootFolderId) source.rootFolderId = rootFolderId;
  if (rootFolderName) source.rootFolderName = rootFolderName;
  return source;
}

function parseAlbum(value: unknown, index: number): AlbumRecord {
  if (!isObject(value)) throw new ManifestError(`albums[${index}] must be an object.`);
  const count = typeof value.photoCount === "number" && value.photoCount >= 0
    ? Math.floor(value.photoCount)
    : null;
  return {
    id: requiredString(value.id, `albums[${index}].id`),
    name: requiredString(value.name, `albums[${index}].name`),
    declaredPhotoCount: count,
  };
}

function parsePhoto(value: unknown, index: number, warnings: string[]): PhotoRecord | null {
  if (!isObject(value)) {
    warnings.push(`Skipped photos[${index}] because it is not an object.`);
    return null;
  }

  let id: string;
  let albumId: string;
  let albumName: string;
  try {
    id = requiredString(value.id, `photos[${index}].id`);
    albumId = requiredString(value.albumId, `photos[${index}].albumId`);
    albumName = requiredString(value.albumName, `photos[${index}].albumName`);
  } catch (error) {
    warnings.push(error instanceof Error ? error.message : `Skipped photos[${index}].`);
    return null;
  }

  const galleryUrl = validMediaUrl(value.url, "gallery");
  if (!galleryUrl) {
    warnings.push(`Skipped photo ${id}: url is not an approved gallery derivative.`);
    return null;
  }

  const fullSizeUrl = validMediaUrl(value.fullSizeUrl, "full");
  if (!fullSizeUrl) {
    warnings.push(`Photo ${id} has no usable sanitized full-size derivative.`);
  }

  return {
    id,
    albumId,
    albumName,
    revision: optionalString(value.revision),
    name: optionalString(value.name),
    alt: optionalString(value.alt) ?? "",
    galleryUrl,
    fullSizeUrl,
  };
}

export function parseManifest(input: unknown): PhotoAlbumManifest {
  if (!isObject(input)) throw new ManifestError("Manifest root must be an object.");
  if (!Array.isArray(input.albums)) throw new ManifestError("albums must be an array.");
  if (!Array.isArray(input.photos)) throw new ManifestError("photos must be an array.");

  const version = typeof input.version === "number" ? input.version : Number.NaN;
  if (!Number.isInteger(version) || version < 1) {
    throw new ManifestError("version must be a positive integer.");
  }

  const warnings: string[] = [];
  const albums = input.albums.map(parseAlbum);
  const albumIds = new Set<string>();
  for (const album of albums) {
    if (albumIds.has(album.id)) throw new ManifestError(`Duplicate album id: ${album.id}.`);
    albumIds.add(album.id);
  }

  const photos = input.photos
    .map((photo, index) => parsePhoto(photo, index, warnings))
    .filter((photo): photo is PhotoRecord => photo !== null);

  const photoIds = new Set<string>();
  for (const photo of photos) {
    if (photoIds.has(photo.id)) throw new ManifestError(`Duplicate photo id: ${photo.id}.`);
    photoIds.add(photo.id);
  }

  return {
    version,
    albumId: requiredString(input.albumId, "albumId"),
    schoolYear: requiredString(input.schoolYear, "schoolYear"),
    source: parseSource(input.source),
    generatedAt: optionalString(input.generatedAt),
    albums,
    photos,
    warnings,
  };
}

function cacheKey(url: string): string {
  return `hrv.photo-album.manifest.v1:${url}`;
}

function readCache(storage: Storage | null, url: string): LoadedManifest | null {
  if (!storage) return null;
  try {
    const raw = storage.getItem(cacheKey(url));
    if (!raw) return null;
    const cache = JSON.parse(raw) as { cachedAt?: unknown; manifest?: unknown };
    return {
      manifest: parseManifest(cache.manifest),
      origin: "cache",
      cachedAt: optionalString(cache.cachedAt),
    };
  } catch {
    return null;
  }
}

function writeCache(storage: Storage | null, url: string, manifest: unknown): void {
  if (!storage) return;
  try {
    storage.setItem(cacheKey(url), JSON.stringify({ cachedAt: new Date().toISOString(), manifest }));
  } catch {
    // A cache failure must never prevent the public gallery from rendering.
  }
}

export async function loadManifest(
  url: string,
  options: ManifestClientOptions = {},
): Promise<LoadedManifest> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const storage = options.storage === undefined ? window.localStorage : options.storage;
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), options.timeoutMs ?? MANIFEST_TIMEOUT_MS);

  try {
    const response = await fetchImpl(url, {
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) throw new ManifestError(`Manifest request failed with HTTP ${response.status}.`);
    const raw: unknown = await response.json();
    const manifest = parseManifest(raw);
    writeCache(storage, url, raw);
    return { manifest, origin: "network", cachedAt: null };
  } catch (error) {
    const cached = readCache(storage, url);
    if (cached) return cached;
    if (error instanceof ManifestError) throw error;
    if (error instanceof DOMException && error.name === "AbortError") {
      throw new ManifestError("The photo manifest took too long to respond.");
    }
    throw new ManifestError("The photo manifest is unavailable right now.");
  } finally {
    window.clearTimeout(timer);
  }
}
