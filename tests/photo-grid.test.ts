import { describe, expect, it, vi } from "vitest";
import { PhotoGrid } from "../apps/photo-album/src/components/photo-grid";
import { photo } from "./helpers";

describe("photo grid", () => {
  it("progressively mounts large galleries instead of creating the full archive DOM at once", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const photos = Array.from({ length: 3000 }, (_, index) => photo(String(index + 1)));
    const grid = new PhotoGrid(mount, photos, { onOpen: () => undefined });
    const images = [...mount.querySelectorAll<HTMLImageElement>("img")];

    expect(mount.querySelectorAll('[role="listitem"]')).toHaveLength(60);
    expect(images).toHaveLength(60);
    expect(images.slice(0, 12).every((image) => image.loading === "eager")).toBe(true);
    expect(images.slice(12).every((image) => image.loading === "lazy")).toBe(true);
    expect(images.every((image) => image.decoding === "async")).toBe(true);
    expect(images.every((image) => image.src.includes("/media/derivatives/gallery/"))).toBe(true);
    expect(images.every((image) => !image.src.includes("/media/derivatives/full/"))).toBe(true);

    const more = mount.querySelector<HTMLButtonElement>(".hrv-photo-grid__more");
    expect(more).not.toBeNull();
    expect(more?.dataset.remaining).toBe("2940");
    more?.click();
    expect(mount.querySelectorAll('[role="listitem"]')).toHaveLength(120);
    expect(more?.dataset.remaining).toBe("2880");
    grid.destroy();
  });

  it("returns focus to an item beyond the initial render batch without changing document scroll position", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const scrollSpy = vi.spyOn(window, "scrollTo");
    const photos = Array.from({ length: 180 }, (_, index) => photo(String(index + 1)));
    const grid = new PhotoGrid(mount, photos, { onOpen: () => undefined });

    grid.focusItem(179);

    expect(mount.querySelectorAll('[role="listitem"]')).toHaveLength(180);
    expect(document.activeElement).toBe(mount.querySelector('[data-photo-index="179"]'));
    expect(scrollSpy).not.toHaveBeenCalled();
    expect(mount.querySelector(".hrv-photo-grid__more")).toBeNull();
    grid.destroy();
  });

  it("resets progressive rendering when the photo set changes", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const grid = new PhotoGrid(
      mount,
      Array.from({ length: 150 }, (_, index) => photo(String(index + 1))),
      { onOpen: () => undefined },
    );

    mount.querySelector<HTMLButtonElement>(".hrv-photo-grid__more")?.click();
    expect(mount.querySelectorAll('[role="listitem"]')).toHaveLength(120);

    grid.setPhotos(Array.from({ length: 75 }, (_, index) => photo(`replacement-${index + 1}`)));
    expect(mount.querySelectorAll('[role="listitem"]')).toHaveLength(60);
    expect(mount.querySelector<HTMLButtonElement>(".hrv-photo-grid__more")?.dataset.remaining).toBe("15");
    grid.destroy();
  });
});
