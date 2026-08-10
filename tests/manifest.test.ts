import { describe, expect, it, vi } from "vitest";
import fixture from "../fixtures/manifests/current-v1.fixture.json";
import { loadManifest, ManifestError, parseManifest } from "../apps/photo-album/src/data/manifest";

describe("manifest adapter", () => {
  it("parses the verified flat version 1 contract", () => {
    const manifest = parseManifest(fixture);

    expect(manifest.version).toBe(1);
    expect(manifest.albums).toHaveLength(2);
    expect(manifest.photos).toHaveLength(4);
    expect(manifest.photos[0]?.galleryUrl).toContain("/media/derivatives/gallery/");
    expect(manifest.photos[0]?.fullSizeUrl).toContain("/media/derivatives/full/");
  });

  it("accepts an empty manifest without inventing albums or photos", () => {
    const manifest = parseManifest({
      version: 1,
      albumId: "empty-year",
      schoolYear: "2099-00",
      albums: [],
      photos: [],
    });

    expect(manifest.albums).toEqual([]);
    expect(manifest.photos).toEqual([]);
    expect(manifest.source).toBeNull();
    expect(manifest.generatedAt).toBeNull();
  });

  it("defaults missing optional photo data and never substitutes a gallery URL for full size", () => {
    const raw = structuredClone(fixture) as Record<string, any>;
    delete raw.photos[0].alt;
    delete raw.photos[0].revision;
    raw.photos[0].fullSizeUrl = raw.photos[0].url;

    const manifest = parseManifest(raw);

    expect(manifest.photos[0]?.alt).toBe("");
    expect(manifest.photos[0]?.revision).toBeNull();
    expect(manifest.photos[0]?.fullSizeUrl).toBeNull();
    expect(manifest.warnings).toHaveLength(1);
  });

  it("quarantines photos outside the approved gallery media prefix", () => {
    const raw = structuredClone(fixture) as Record<string, any>;
    raw.photos[0].url = "https://photos.example.test/media/state/photos/private.json";

    const manifest = parseManifest(raw);

    expect(manifest.photos).toHaveLength(3);
    expect(manifest.warnings[0]).toContain("approved gallery derivative");
  });

  it("rejects malformed required structures and duplicate ids", () => {
    expect(() => parseManifest(null)).toThrow(ManifestError);
    expect(() => parseManifest({ version: 1, albumId: "x", schoolYear: "y", photos: [] })).toThrow("albums");
    const raw = structuredClone(fixture) as Record<string, any>;
    raw.albums[1].id = raw.albums[0].id;
    expect(() => parseManifest(raw)).toThrow("Duplicate album id");
  });

  it("falls back to a previously validated manifest when the network is unavailable", async () => {
    const success = vi.fn<typeof fetch>().mockResolvedValue(new Response(JSON.stringify(fixture), { status: 200 }));
    const first = await loadManifest("https://manifest.example.test/current.json", {
      fetchImpl: success,
      storage: window.localStorage,
    });
    expect(first.origin).toBe("network");

    const failure = vi.fn<typeof fetch>().mockRejectedValue(new Error("offline"));
    const second = await loadManifest("https://manifest.example.test/current.json", {
      fetchImpl: failure,
      storage: window.localStorage,
    });
    expect(second.origin).toBe("cache");
    expect(second.manifest.photos).toHaveLength(4);
  });
});
