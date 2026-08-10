import { describe, expect, it, vi } from "vitest";
import { MemoryCarouselV2 } from "../apps/photo-album/src/components/memory-carousel-v2";
import { photo } from "./helpers";

describe("Photo Album V2 memory carousel", () => {
  it("keeps five physical slides and moves photographs through persistent slots", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new MemoryCarouselV2(
      mount,
      [photo("1"), photo("2"), photo("3"), photo("4"), photo("5"), photo("6")],
    );

    const originalSlides = [...mount.querySelectorAll<HTMLButtonElement>(".hrv-v2-memory__slide")];
    expect(originalSlides).toHaveLength(5);
    expect(originalSlides.map((slide) => slide.dataset.slot)).toEqual(["-2", "-1", "0", "1", "2"]);

    const initialCenter = mount.querySelector<HTMLButtonElement>('[data-slot="0"]')?.dataset.photoId;
    vi.advanceTimersByTime(7_001);

    const movingCenter = mount.querySelector<HTMLButtonElement>('[data-slot="0"]')?.dataset.photoId;
    expect(movingCenter).not.toBe(initialCenter);
    expect([...mount.querySelectorAll(".hrv-v2-memory__slide")]).toEqual(originalSlides);

    vi.advanceTimersByTime(920);
    expect([...mount.querySelectorAll<HTMLButtonElement>(".hrv-v2-memory__slide")].map((slide) => slide.dataset.slot).sort())
      .toEqual(["-2", "-1", "0", "1", "2"]);

    carousel.destroy();
    vi.useRealTimers();
  });

  it("uses an explicit pause control instead of a hidden reduced-motion branch", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new MemoryCarouselV2(mount, [photo("1"), photo("2"), photo("3")]);
    const pause = mount.querySelector<HTMLButtonElement>(".hrv-v2-memory__pause")!;
    const initialCenter = mount.querySelector<HTMLButtonElement>('[data-slot="0"]')?.dataset.photoId;

    pause.click();
    expect(pause.getAttribute("aria-pressed")).toBe("true");
    vi.advanceTimersByTime(14_000);
    expect(mount.querySelector<HTMLButtonElement>('[data-slot="0"]')?.dataset.photoId).toBe(initialCenter);

    pause.click();
    vi.advanceTimersByTime(7_001);
    expect(mount.querySelector<HTMLButtonElement>('[data-slot="0"]')?.dataset.photoId).not.toBe(initialCenter);

    carousel.destroy();
    vi.useRealTimers();
  });
});
