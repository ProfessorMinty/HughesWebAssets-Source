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

  it("does not autoplay when reduced motion is requested", () => {
    vi.useFakeTimers();
    const controller = new CarouselController([photo("1"), photo("2")], {
      intervalMs: 100,
      reducedMotion: true,
      random: () => 0.5,
    });
    const initial = controller.current?.id;
    controller.start();
    vi.advanceTimersByTime(500);
    expect(controller.current?.id).toBe(initial);
    vi.useRealTimers();
  });

  it("supports left and right keyboard navigation", () => {
    const mount = document.createElement("div");
    document.body.append(mount);
    const carousel = new HeroCarousel(mount, [photo("1"), photo("2")], "2099–00");
    const region = mount.querySelector<HTMLElement>('[aria-roledescription="carousel"]')!;
    const stage = mount.querySelector<HTMLElement>(".hrv-carousel__stage")!;
    const initial = stage.dataset.currentPhotoId;
    region.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(stage.dataset.currentPhotoId).not.toBe(initial);
    region.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(stage.dataset.currentPhotoId).toBe(initial);
    carousel.destroy();
  });
});
