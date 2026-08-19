import { describe, expect, it, vi } from "vitest";
import { YearHomeV2 } from "../apps/photo-album/src/components/year-home-v2";
import type { PhotoYearDescriptor } from "../apps/photo-album/src/data/year-catalog";
import type { AlbumCollection, PhotoAlbumManifest } from "../apps/photo-album/src/types";

const currentYear: PhotoYearDescriptor = {
  schoolYear: "2026-27",
  label: "2026–27",
  manifestUrl: "https://photos.example.test/manifest.json",
  kind: "current",
};

const emptyManifest: PhotoAlbumManifest = {
  version: 1,
  albumId: "photo-album-2026-27",
  schoolYear: "2026-27",
  source: null,
  generatedAt: "2026-08-19T00:00:00.000Z",
  albums: [],
  photos: [],
  warnings: [],
};

const emptyCollection: AlbumCollection = {
  albums: [],
  photos: [],
  orphanedPhotoCount: 0,
};

describe("Photo Album production readiness", () => {
  it("shows a friendly current-year coming-soon state and omits dead View All controls when no photos exist", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const createLink = vi.fn((label: string, _route: unknown, className: string) => {
      const link = document.createElement("a");
      link.className = className;
      link.textContent = label;
      return link;
    });

    const home = new YearHomeV2(mount, {
      manifest: emptyManifest,
      collection: emptyCollection,
      kind: "current",
      previousYear: null,
      currentYear,
      createLink,
      openPhoto: () => undefined,
    });

    expect(mount.dataset.hasPhotos).toBe("false");
    expect(mount.querySelector(".hrv-memory-stage--empty")).not.toBeNull();
    expect(mount.textContent).toContain("Photos are coming soon");
    expect(mount.textContent).toContain("New memories will appear here.");
    expect(mount.textContent).toContain("As classroom photos are added throughout the school year");
    expect(mount.textContent).toContain("Album covers will appear here when the first classroom photos are published.");
    expect([...mount.querySelectorAll("a")].some((link) => link.textContent === "View All Photos")).toBe(false);

    home.destroy();
  });
});
