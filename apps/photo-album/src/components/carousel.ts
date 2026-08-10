import { CAROUSEL_INTERVAL_MS } from "../config";
import type { PhotoRecord } from "../types";
import { createElement, createIconButton, prefersReducedMotion } from "../utils/dom";

export type CarouselDirection = "next" | "previous";

export interface CarouselChange {
  current: PhotoRecord;
  previous: PhotoRecord;
  direction: CarouselDirection;
  position: number;
  total: number;
}

export interface CarouselControllerOptions {
  intervalMs?: number;
  random?: () => number;
  onChange?: (change: CarouselChange) => void;
}

const CAROUSEL_TRANSITION_MS = 920;
const REDUCED_FADE_HALF_MS = 240;

function shuffled<T>(items: readonly T[], random: () => number): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const value = result[index];
    result[index] = result[swapIndex] as T;
    result[swapIndex] = value as T;
  }
  return result;
}

export class CarouselController {
  private readonly photos: PhotoRecord[];
  private readonly intervalMs: number;
  private readonly onChange: ((change: CarouselChange) => void) | undefined;
  private position = 0;
  private timer: number | null = null;
  private paused = false;

  constructor(photos: readonly PhotoRecord[], options: CarouselControllerOptions = {}) {
    this.photos = shuffled(photos, options.random ?? Math.random);
    this.intervalMs = options.intervalMs ?? CAROUSEL_INTERVAL_MS;
    this.onChange = options.onChange;
  }

  get current(): PhotoRecord | null {
    return this.photos[this.position] ?? null;
  }

  get length(): number {
    return this.photos.length;
  }

  get currentPosition(): number {
    return this.position;
  }

  photoAtOffset(offset: number): PhotoRecord | null {
    if (this.photos.length === 0) return null;
    const position = (this.position + offset + this.photos.length) % this.photos.length;
    return this.photos[position] ?? null;
  }

  next(): void {
    this.move("next");
  }

  previous(): void {
    this.move("previous");
  }

  start(): void {
    this.stop();
    if (this.photos.length < 2 || this.paused) return;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.next();
    }, this.intervalMs);
  }

  stop(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) this.stop();
    else this.start();
  }

  destroy(): void {
    this.stop();
  }

  private move(direction: CarouselDirection): void {
    if (this.photos.length < 2) return;
    const previousPosition = this.position;
    this.position = direction === "next"
      ? (this.position + 1) % this.photos.length
      : (this.position - 1 + this.photos.length) % this.photos.length;
    const current = this.photos[this.position];
    const previous = this.photos[previousPosition];
    if (!current || !previous) return;
    this.onChange?.({
      current,
      previous,
      direction,
      position: this.position,
      total: this.photos.length,
    });
    this.start();
  }
}

export class HeroCarousel {
  private readonly controller: CarouselController;
  private readonly stage: HTMLElement;
  private readonly previousSlide: HTMLButtonElement;
  private readonly previousImage: HTMLImageElement;
  private readonly currentSlide: HTMLButtonElement;
  private readonly currentImage: HTMLImageElement;
  private readonly nextSlide: HTMLButtonElement;
  private readonly nextImage: HTMLImageElement;
  private readonly status: HTMLElement;
  private readonly intersectionObserver: IntersectionObserver | null;
  private transitionTimer: number | null = null;
  private visible = true;
  private keyboardFocusWithin = false;
  private pointerFocusGuard = false;

  constructor(
    mount: HTMLElement,
    photos: readonly PhotoRecord[],
    schoolYear: string,
    onOpen?: (photo: PhotoRecord) => void,
  ) {
    mount.classList.add("hrv-hero");
    mount.setAttribute("aria-labelledby", "hrv-featured-title");

    const copy = createElement("div", "hrv-hero__copy");
    const eyebrow = createElement("p", "hrv-eyebrow", `${schoolYear} classroom memories`);
    const title = createElement("h1", "hrv-hero__title", "Step inside a year of wonder");
    title.id = "hrv-featured-title";
    const description = createElement(
      "p",
      "hrv-hero__description",
      "A growing gallery of discoveries, field trips, gardens, and small moments worth remembering.",
    );
    copy.append(eyebrow, title, description);

    const carousel = createElement("div", "hrv-carousel");
    carousel.tabIndex = 0;
    carousel.setAttribute("role", "region");
    carousel.setAttribute("aria-roledescription", "carousel");
    carousel.setAttribute("aria-label", "Featured classroom memories");

    this.stage = createElement("div", "hrv-carousel__stage");
    this.stage.setAttribute("aria-label", "Previous, current, and next featured memories");
    [this.previousSlide, this.previousImage] = this.createSlide("previous");
    [this.currentSlide, this.currentImage] = this.createSlide("current");
    [this.nextSlide, this.nextImage] = this.createSlide("next");
    this.stage.append(this.previousSlide, this.currentSlide, this.nextSlide);

    const controls = createElement("div", "hrv-carousel__controls");
    const previous = createIconButton("Previous featured memory", "←", "hrv-icon-button");
    const next = createIconButton("Next featured memory", "→", "hrv-icon-button");
    this.status = createElement("p", "hrv-carousel__status");
    this.status.setAttribute("aria-live", "polite");
    controls.append(previous, this.status, next);
    carousel.append(this.stage, controls);
    mount.append(copy, carousel);

    this.controller = new CarouselController(photos, {
      onChange: (change) => this.showChange(change),
    });

    const initial = this.controller.current;
    if (initial) {
      this.renderTriplet();
    }

    this.currentSlide.addEventListener("click", () => {
      const current = this.controller.current;
      if (current) onOpen?.(current);
    });
    this.previousSlide.addEventListener("click", () => this.requestMove("previous"));
    this.nextSlide.addEventListener("click", () => this.requestMove("next"));

    previous.addEventListener("click", () => this.requestMove("previous"));
    next.addEventListener("click", () => this.requestMove("next"));
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.requestMove("previous");
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.requestMove("next");
      }
    });

    carousel.addEventListener("pointerdown", () => {
      this.pointerFocusGuard = true;
      this.keyboardFocusWithin = false;
      this.syncPlayback();
      queueMicrotask(() => {
        this.pointerFocusGuard = false;
      });
    });
    carousel.addEventListener("focusin", () => {
      if (this.pointerFocusGuard) return;
      this.keyboardFocusWithin = true;
      this.syncPlayback();
    });
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget as Node | null)) {
        this.keyboardFocusWithin = false;
        this.syncPlayback();
      }
    });

    if ("IntersectionObserver" in window) {
      this.intersectionObserver = new IntersectionObserver((entries) => {
        this.visible = entries[0]?.isIntersecting ?? true;
        this.syncPlayback();
      }, { threshold: 0.25 });
      this.intersectionObserver.observe(mount);
    } else {
      this.intersectionObserver = null;
    }

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.controller.start();
  }

  destroy(): void {
    this.controller.destroy();
    this.intersectionObserver?.disconnect();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
  }

  private readonly onVisibilityChange = (): void => this.syncPlayback();

  private createSlide(position: "previous" | "current" | "next"): [HTMLButtonElement, HTMLImageElement] {
    const slide = createElement("button", `hrv-carousel__slide hrv-carousel__slide--${position}`);
    slide.type = "button";
    slide.dataset.position = position;
    const image = createElement("img", "hrv-carousel__image");
    image.alt = "";
    image.decoding = "async";
    image.loading = position === "current" ? "eager" : "lazy";
    image.fetchPriority = position === "current" ? "high" : "low";
    slide.append(image);
    return [slide, image];
  }

  private requestMove(direction: CarouselDirection): void {
    if (this.transitionTimer !== null) return;
    if (direction === "next") this.controller.next();
    else this.controller.previous();
  }

  private syncPlayback(): void {
    this.controller.setPaused(this.keyboardFocusWithin || !this.visible || document.hidden);
  }

  private updateStatus(): void {
    this.status.textContent = `Memory ${this.controller.currentPosition + 1} of ${this.controller.length}`;
  }

  private renderTriplet(): void {
    const previous = this.controller.photoAtOffset(-1);
    const current = this.controller.current;
    const next = this.controller.photoAtOffset(1);
    if (!previous || !current || !next) return;

    this.updateSlide(this.previousSlide, this.previousImage, previous, "Show previous featured memory");
    this.updateSlide(this.currentSlide, this.currentImage, current, "Open featured memory");
    this.updateSlide(this.nextSlide, this.nextImage, next, "Show next featured memory");
    const hasMultiplePhotos = this.controller.length > 1;
    this.previousSlide.hidden = !hasMultiplePhotos;
    this.nextSlide.hidden = !hasMultiplePhotos;
    this.stage.dataset.currentPhotoId = current.id;
    this.updateStatus();
  }

  private updateSlide(
    slide: HTMLButtonElement,
    image: HTMLImageElement,
    photo: PhotoRecord,
    label: string,
  ): void {
    image.src = photo.galleryUrl;
    slide.dataset.photoId = photo.id;
    slide.setAttribute("aria-label", label);
  }

  private showChange(change: CarouselChange): void {
    this.stage.dataset.currentPhotoId = change.current.id;
    this.status.textContent = `Memory ${change.position + 1} of ${change.total}`;
    this.stage.classList.remove(
      "is-moving-next",
      "is-moving-previous",
      "is-reduced-fading",
    );

    if (prefersReducedMotion()) {
      void this.stage.offsetWidth;
      this.stage.classList.add("is-reduced-fading");
      this.transitionTimer = window.setTimeout(() => {
        this.renderTriplet();
        this.stage.classList.remove("is-reduced-fading");
        this.transitionTimer = window.setTimeout(() => {
          this.transitionTimer = null;
        }, REDUCED_FADE_HALF_MS);
      }, REDUCED_FADE_HALF_MS);
      return;
    }

    void this.stage.offsetWidth;
    this.stage.classList.add(change.direction === "next" ? "is-moving-next" : "is-moving-previous");

    this.transitionTimer = window.setTimeout(() => {
      this.stage.classList.add("is-resetting");
      this.stage.classList.remove("is-moving-next", "is-moving-previous");
      this.renderTriplet();
      void this.stage.offsetWidth;
      this.stage.classList.remove("is-resetting");
      this.transitionTimer = null;
    }, CAROUSEL_TRANSITION_MS);
  }
}
