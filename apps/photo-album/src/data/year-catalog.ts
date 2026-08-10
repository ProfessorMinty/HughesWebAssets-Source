import { MANIFEST_TIMEOUT_MS } from "../config";
import type { PhotoAlbumManifest } from "../types";

export interface PhotoYearDescriptor {
  schoolYear: string;
  label: string;
  manifestUrl: string;
  kind: "current" | "archive";
}

export interface PhotoYearCatalog {
  version: number;
  currentSchoolYear: string;
  years: PhotoYearDescriptor[];
  origin: "network" | "fallback";
}

type JsonObject = Record<string, unknown>;

function isObject(value: unknown): value is JsonObject {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function requiredString(value: unknown): string | null {
  return typeof value === "string" && value.trim() !== "" ? value.trim() : null;
}

function yearLabel(schoolYear: string): string {
  return schoolYear.replace(/-/g, "–");
}

function validManifestUrl(value: unknown): string | null {
  if (typeof value !== "string") return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

function parseYear(value: unknown, currentSchoolYear: string): PhotoYearDescriptor | null {
  if (!isObject(value)) return null;
  const schoolYear = requiredString(value.schoolYear);
  const manifestUrl = validManifestUrl(value.manifestUrl);
  if (!schoolYear || !manifestUrl) return null;
  const label = requiredString(value.label) ?? yearLabel(schoolYear);
  const kind = schoolYear === currentSchoolYear ? "current" : "archive";
  return { schoolYear, label, manifestUrl, kind };
}

function fallbackCatalog(
  currentManifestUrl: string,
  currentManifest: PhotoAlbumManifest,
): PhotoYearCatalog {
  return {
    version: 1,
    currentSchoolYear: currentManifest.schoolYear,
    years: [
      {
        schoolYear: currentManifest.schoolYear,
        label: yearLabel(currentManifest.schoolYear),
        manifestUrl: currentManifestUrl,
        kind: "current",
      },
    ],
    origin: "fallback",
  };
}

export async function loadYearCatalog(
  catalogUrl: string,
  currentManifestUrl: string,
  currentManifest: PhotoAlbumManifest,
): Promise<PhotoYearCatalog> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), MANIFEST_TIMEOUT_MS);

  try {
    const response = await fetch(catalogUrl, {
      credentials: "omit",
      headers: { Accept: "application/json" },
      signal: controller.signal,
    });
    if (!response.ok) return fallbackCatalog(currentManifestUrl, currentManifest);

    const raw: unknown = await response.json();
    if (!isObject(raw) || !Array.isArray(raw.years)) {
      return fallbackCatalog(currentManifestUrl, currentManifest);
    }

    const version = typeof raw.version === "number" && Number.isInteger(raw.version) && raw.version > 0
      ? raw.version
      : 1;
    const declaredCurrent = requiredString(raw.currentSchoolYear) ?? currentManifest.schoolYear;
    const parsed = raw.years
      .map((year) => parseYear(year, declaredCurrent))
      .filter((year): year is PhotoYearDescriptor => year !== null);

    const deduped = new Map<string, PhotoYearDescriptor>();
    for (const year of parsed) deduped.set(year.schoolYear, year);

    // The live manifest is authoritative for the active year. A stale catalog must
    // never make the current album disappear or point it at a different manifest.
    deduped.set(currentManifest.schoolYear, {
      schoolYear: currentManifest.schoolYear,
      label: yearLabel(currentManifest.schoolYear),
      manifestUrl: currentManifestUrl,
      kind: "current",
    });

    const years = [...deduped.values()]
      .map((year) => ({
        ...year,
        kind: year.schoolYear === currentManifest.schoolYear ? "current" as const : "archive" as const,
      }))
      .sort((a, b) => b.schoolYear.localeCompare(a.schoolYear));

    return {
      version,
      currentSchoolYear: currentManifest.schoolYear,
      years,
      origin: "network",
    };
  } catch {
    return fallbackCatalog(currentManifestUrl, currentManifest);
  } finally {
    window.clearTimeout(timer);
  }
}
