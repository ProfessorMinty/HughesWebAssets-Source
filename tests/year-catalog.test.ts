import { afterEach, describe, expect, it, vi } from "vitest";
import { loadYearCatalog } from "../apps/photo-album/src/data/year-catalog";
import type { PhotoAlbumManifest } from "../apps/photo-album/src/types";

const currentManifest: PhotoAlbumManifest = {
  version: 1,
  albumId: "photo-album-2026-27",
  schoolYear: "2026-27",
  source: null,
  generatedAt: null,
  albums: [],
  photos: [],
  warnings: [],
};

afterEach(() => {
  vi.restoreAllMocks();
});

describe("Photo Album year catalog", () => {
  it("falls back safely to the current manifest when years.json is unavailable", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response("not found", { status: 404 }));

    const catalog = await loadYearCatalog(
      "https://photos.example.test/years.json",
      "https://photos.example.test/manifest.json",
      currentManifest,
    );

    expect(catalog.origin).toBe("fallback");
    expect(catalog.currentSchoolYear).toBe("2026-27");
    expect(catalog.years).toEqual([
      {
        schoolYear: "2026-27",
        label: "2026–27",
        manifestUrl: "https://photos.example.test/manifest.json",
        kind: "current",
      },
    ]);
  });

  it("loads a historical year while keeping the live manifest authoritative for current year", async () => {
    vi.spyOn(globalThis, "fetch").mockResolvedValue(new Response(JSON.stringify({
      version: 1,
      currentSchoolYear: "2026-27",
      years: [
        {
          schoolYear: "2025-26",
          label: "2025–26",
          manifestUrl: "https://photos.example.test/archive/2025-26/manifest.json",
        },
        {
          schoolYear: "2026-27",
          label: "wrong current label",
          manifestUrl: "https://wrong.example.test/current.json",
        },
      ],
    }), { status: 200, headers: { "Content-Type": "application/json" } }));

    const catalog = await loadYearCatalog(
      "https://photos.example.test/years.json",
      "https://photos.example.test/manifest.json",
      currentManifest,
    );

    expect(catalog.origin).toBe("network");
    expect(catalog.years.map((year) => year.schoolYear)).toEqual(["2026-27", "2025-26"]);
    expect(catalog.years[0]?.manifestUrl).toBe("https://photos.example.test/manifest.json");
    expect(catalog.years[1]?.kind).toBe("archive");
  });
});
