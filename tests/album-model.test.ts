import { describe, expect, it } from "vitest";
import fixture from "../fixtures/manifests/current-v1.fixture.json";
import { parseManifest } from "../apps/photo-album/src/data/manifest";
import { buildAlbumCollection, themeForAlbum } from "../apps/photo-album/src/domain/albums";

describe("album model", () => {
  it("groups the flat photo array in manifest album order", () => {
    const collection = buildAlbumCollection(parseManifest(fixture));

    expect(collection.albums.map((album) => album.id)).toEqual(["fixture-garden", "fixture-science"]);
    expect(collection.albums.map((album) => album.photos.length)).toEqual([2, 2]);
    expect(collection.photos.map((item) => item.id)).toEqual([
      "fixture-photo-1",
      "fixture-photo-2",
      "fixture-photo-3",
      "fixture-photo-4",
    ]);
  });

  it("keeps orphaned photos out of public album browsing", () => {
    const manifest = parseManifest(fixture);
    manifest.photos[0]!.albumId = "unknown-album";
    const collection = buildAlbumCollection(manifest);

    expect(collection.orphanedPhotoCount).toBe(1);
    expect(collection.photos).toHaveLength(3);
  });

  it("assigns stable presentation themes without adding manifest fields", () => {
    expect(themeForAlbum({ id: "a", name: "Science Museum", declaredPhotoCount: 1 })).toBe("discovery");
    expect(themeForAlbum({ id: "b", name: "Zinnia Garden", declaredPhotoCount: 1 })).toBe("garden");
    expect(themeForAlbum({ id: "stable", name: "An Event", declaredPhotoCount: 1 }))
      .toBe(themeForAlbum({ id: "stable", name: "An Event", declaredPhotoCount: 999 }));
  });
});
