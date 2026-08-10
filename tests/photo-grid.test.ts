import { describe, expect, it, vi } from "vitest";
import { PhotoGrid } from "../apps/photo-album/src/components/photo-grid";
import { photo } from "./helpers";

describe("photo grid", () => {
  it("keeps the complete realistic gallery mounted without virtual spacers or placeholder fields", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const photos = Array.from({ length: 139 }, (_, index) => photo(String(index + 1)));
    const grid = new PhotoGrid(mount, photos, { onOpen: () => undefined });
    const images = [...mount.querySelectorAll<HTMLImageElement>("img")];

    expect(mount.querySelectorAll('[role="listitem"]')).toHaveLength(139);
    expect(images).toHaveLength(139);
    expect(mount.querySelector(".hrv-virtual-grid__spacer")).toBeNull();
    expect(images.slice(0, 12).every((image) => image.loading === "eager")).toBe(true);
    expect(images.slice(12).every((image) => image.loading === "lazy")).toBe(true);
    expect(images.every((image) => image.decoding === "async")).toBe(true);
    expect(images.every((image) => image.src.includes("/media/derivatives/gallery/"))).toBe(true);
    expect(images.every((image) => !image.src.includes("/media/derivatives/full/"))).toBe(true);
    grid.destroy();
  });

  it("returns focus without changing the document scroll position", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const scrollSpy = vi.spyOn(window, "scrollTo");
    const grid = new PhotoGrid(mount, [photo("1"), photo("2")], { onOpen: () => undefined });

    grid.focusItem(1);

    expect(document.activeElement).toBe(mount.querySelector('[data-photo-index="1"]'));
    expect(scrollSpy).not.toHaveBeenCalled();
    grid.destroy();
  });
});
