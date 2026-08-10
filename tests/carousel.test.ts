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

  it("renders a five-slot track and moves the actual cards through previous/current/next positions", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(
      mount,
      [photo("1"), photo("2"), photo("3"), photo("4"), photo("5"), photo("6")],
      "2099–00",
    );
    const region = mount.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!;
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;

    expect(stage.querySelectorAll(".hrv-carousel__slide")).toHaveLength(5);
    expect(stage.querySelector('[data-slot="-1"]')).not.toBeNull();
    expect(stage.querySelector('[data-slot="0"]')).not.toBeNull();
    expect(stage.querySelector('[data-slot="1"]')).not.toBeNull();

    const initial = stage.dataset.currentPhotoId;
    const oldCenter = stage.querySelector<HTMLElement>('[data-slot="0"]')!;
    const incoming = stage.querySelector<HTMLElement>('[data-slot="1"]')!;

    region.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));

    expect(stage.dataset.currentPhotoId).not.toBe(initial);
    expect(stage.classList.contains("is-traveling")).toBe(true);
    expect(oldCenter.dataset.slot).toBe("-1");
    expect(incoming.dataset.slot).toBe("0");

    vi.advanceTimersByTime(780);

    expect(stage.classList.contains("is-traveling")).toBe(false);
    expect(stage.querySelector<HTMLElement>('[data-slot="0"]')?.dataset.photoId).toBe(
      stage.dataset.currentPhotoId,
    );
    expect(stage.querySelectorAll('[data-slot="-2"], [data-slot="-1"], [data-slot="0"], [data-slot="1"], [data-slot="2"]')).toHaveLength(5);

    region.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(stage.dataset.currentPhotoId).toBe(initial);

    carousel.destroy();
    vi.useRealTimers();
  });

  it("uses side previews as real previous and next controls", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(
      mount,
      [photo("1"), photo("2"), photo("3"), photo("4"), photo("5")],
      "2099–00",
    );
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    const initial = stage.dataset.currentPhotoId;

    mount.querySelector<HTMLButtonElement>('[data-slot="1"]')!.click();
    expect(stage.dataset.currentPhotoId).not.toBe(initial);
    vi.advanceTimersByTime(780);

    mount.querySelector<HTMLButtonElement>('[data-slot="-1"]')!.click();
    expect(stage.dataset.currentPhotoId).toBe(initial);

    carousel.destroy();
    vi.useRealTimers();
  });

  it("keeps autoplay running after pointer-created focus", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2"), photo("3")], "2099–00");
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    const nextButton = [...mount.querySelectorAll<HTMLButtonElement>(".hrv-icon-button")].at(-1)!;

    nextButton.focus();
    const focusedPosition = stage.dataset.currentPhotoId;
    vi.advanceTimersByTime(7_001);

    expect(stage.dataset.currentPhotoId).not.toBe(focusedPosition);
    carousel.destroy();
    vi.useRealTimers();
  });

  it("provides an explicit pause and resume control", () => {
    vi.useFakeTimers();
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2"), photo("3")], "2099–00");
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    const pause = mount.querySelector<HTMLButtonElement>(".hrv-carousel__pause")!;
    const initial = stage.dataset.currentPhotoId;

    pause.click();
    expect(pause.getAttribute("aria-pressed")).toBe("true");
    expect(pause.getAttribute("aria-label")).toContain("Resume");
    vi.advanceTimersByTime(14_000);
    expect(stage.dataset.currentPhotoId).toBe(initial);

    pause.click();
    expect(pause.getAttribute("aria-pressed")).toBe("false");
    vi.advanceTimersByTime(7_001);
    expect(stage.dataset.currentPhotoId).not.toBe(initial);

    carousel.destroy();
    vi.useRealTimers();
  });
});
