import { describe, expect, it } from "vitest";
import { VirtualPhotoGrid } from "../apps/photo-album/src/components/virtual-grid";
import { photo } from "./helpers";

describe("virtual photo grid", () => {
  it("keeps a bounded image DOM for a large logical gallery", () => {
    const mount = document.createElement("div");
    Object.defineProperty(mount, "clientWidth", { value: 1200 });
    document.body.append(mount);
    const photos = Array.from({ length: 1000 }, (_, index) => photo(String(index + 1)));
    const grid = new VirtualPhotoGrid(mount, photos, { onOpen: () => undefined });
    const images = [...mount.querySelectorAll<HTMLImageElement>("img")];

    expect(images.length).toBeGreaterThan(0);
    expect(images.length).toBeLessThan(100);
    expect(images.every((image) => image.loading === "lazy")).toBe(true);
    expect(images.every((image) => image.src.includes("/media/derivatives/gallery/"))).toBe(true);
    expect(images.every((image) => !image.src.includes("/media/derivatives/full/"))).toBe(true);
    grid.destroy();
  });
});
