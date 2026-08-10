import { describe, expect, it, vi } from "vitest";
import { CarouselController, HeroCarousel } from "../apps/photo-album/src/components/carousel";
import { photo } from "./helpers";

describe("featured-memory carousel", () => {
  it("moves in both directions and wraps through a bounded photo order", () => {
    const changes: string[] = [];
    const controller = new CarouselController([photo("1"), photo("2"), photo("3")], {
      random: () => 0.5,
      onChange: (change) => changes.push(change.current.id),
    });
    const initial = controller.current?.id;

    controller.next();
    expect(controller.current?.id).not.toBe(initial);
    controller.previous();
    expect(controller.current?.id).toBe(initial);
    expect(changes).toHaveLength(2);
  });

  it("autoplays on schedule and manual navigation resets the autoplay clock", () => {
    vi.useFakeTimers();
    const controller = new CarouselController([photo("1"), photo("2"), photo("3")], {
      intervalMs: 100,
      random: () => 0.5,
    });
    const initial = controller.current?.id;

    controller.start();
    vi.advanceTimersByTime(99);
    expect(controller.current?.id).toBe(initial);
    vi.advanceTimersByTime(1);
    const afterAutoplay = controller.current?.id;
    expect(afterAutoplay).not.toBe(initial);

    controller.next();
    const afterManual = controller.current?.id;
    vi.advanceTimersByTime(99);
    expect(controller.current?.id).toBe(afterManual);
    vi.advanceTimersByTime(1);
    expect(controller.current?.id).not.toBe(afterManual);

    controller.destroy();
    vi.useRealTimers();
  });

  it("renders real previous, current, and next positions and supports keyboard navigation", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2"), photo("3")], "2099–00");
    const region = mount.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!;
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    expect(stage.querySelectorAll(".hrv-carousel__slide")).toHaveLength(3);
    expect(stage.querySelector('[data-position="previous"]')).not.toBeNull();
    expect(stage.querySelector('[data-position="current"]')).not.toBeNull();
    expect(stage.querySelector('[data-position="next"]')).not.toBeNull();
    const initial = stage.dataset.currentPhotoId;
    region.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(stage.dataset.currentPhotoId).not.toBe(initial);
    expect(stage.classList.contains("is-moving-next")).toBe(true);
    vi.advanceTimersByTime(920);
    expect(stage.classList.contains("is-moving-next")).toBe(false);
    expect(stage.querySelector<HTMLElement>('[data-position="current"]')?.dataset.photoId).toBe(stage.dataset.currentPhotoId);
    region.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(stage.dataset.currentPhotoId).toBe(initial);
    carousel.destroy();
    vi.useRealTimers();
  });

  it("continues autoplay while the pointer rests over the carousel", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2"), photo("3")], "2099–00");
    const region = mount.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!;
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    const initial = stage.dataset.currentPhotoId;

    region.dispatchEvent(new PointerEvent("pointerenter", { bubbles: true }));
    vi.advanceTimersByTime(7_001);

    expect(stage.dataset.currentPhotoId).not.toBe(initial);
    carousel.destroy();
    vi.useRealTimers();
  });

  it("does not let pointer-created focus freeze autoplay", async () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2"), photo("3")], "2099–00");
    const region = mount.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!;
    const nextButton = [...mount.querySelectorAll<HTMLButtonElement>(".hrv-icon-button")].at(-1)!;
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;

    region.dispatchEvent(new PointerEvent("pointerdown", { bubbles: true }));
    nextButton.focus();
    await Promise.resolve();
    const focusedPosition = stage.dataset.currentPhotoId;
    vi.advanceTimersByTime(7_001);

    expect(stage.dataset.currentPhotoId).not.toBe(focusedPosition);
    carousel.destroy();
    vi.useRealTimers();
  });

  it("pauses autoplay for keyboard focus and resumes after focus leaves", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2"), photo("3")], "2099–00");
    const region = mount.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!;
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    const initial = stage.dataset.currentPhotoId;

    region.focus();
    vi.advanceTimersByTime(7_001);
    expect(stage.dataset.currentPhotoId).toBe(initial);

    region.blur();
    vi.advanceTimersByTime(7_001);
    expect(stage.dataset.currentPhotoId).not.toBe(initial);

    carousel.destroy();
    vi.useRealTimers();
  });
});
