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
  reducedMotion?: boolean;
  random?: () => number;
  onChange?: (change: CarouselChange) => void;
}

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
  private reducedMotion: boolean;
  private paused = false;

  constructor(photos: readonly PhotoRecord[], options: CarouselControllerOptions = {}) {
    this.photos = shuffled(photos, options.random ?? Math.random);
    this.intervalMs = options.intervalMs ?? CAROUSEL_INTERVAL_MS;
    this.reducedMotion = options.reducedMotion ?? false;
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

  next(): void {
    this.move("next");
  }

  previous(): void {
    this.move("previous");
  }

  start(): void {
    this.stop();
    if (this.photos.length < 2 || this.reducedMotion || this.paused) return;
    this.timer = window.setInterval(() => this.next(), this.intervalMs);
  }

  stop(): void {
    if (this.timer !== null) window.clearInterval(this.timer);
    this.timer = null;
  }

  setPaused(paused: boolean): void {
    this.paused = paused;
    if (paused) this.stop();
    else this.start();
  }

  setReducedMotion(reducedMotion: boolean): void {
    this.reducedMotion = reducedMotion;
    if (reducedMotion) this.stop();
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
  private readonly currentImage: HTMLImageElement;
  private readonly incomingImage: HTMLImageElement;
  private readonly status: HTMLElement;
  private readonly motionQuery: MediaQueryList;
  private readonly intersectionObserver: IntersectionObserver | null;
  private transitionTimer: number | null = null;
  private visible = true;
  private interacting = false;

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

    const stage = createElement("button", "hrv-carousel__stage");
    stage.type = "button";
    this.stage = stage;
    this.currentImage = createElement("img", "hrv-carousel__image hrv-carousel__image--current");
    this.currentImage.alt = "";
    this.currentImage.decoding = "async";
    this.currentImage.fetchPriority = "high";
    this.incomingImage = createElement("img", "hrv-carousel__image hrv-carousel__image--incoming");
    this.incomingImage.alt = "";
    this.incomingImage.decoding = "async";
    this.stage.append(this.currentImage, this.incomingImage);

    const controls = createElement("div", "hrv-carousel__controls");
    const previous = createIconButton("Previous featured memory", "←", "hrv-icon-button");
    const next = createIconButton("Next featured memory", "→", "hrv-icon-button");
    this.status = createElement("p", "hrv-carousel__status");
    this.status.setAttribute("aria-live", "polite");
    controls.append(previous, this.status, next);
    carousel.append(this.stage, controls);
    mount.append(copy, carousel);

    this.motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    this.controller = new CarouselController(photos, {
      reducedMotion: this.motionQuery.matches,
      onChange: (change) => this.showChange(change),
    });

    const initial = this.controller.current;
    if (initial) {
      this.currentImage.src = initial.galleryUrl;
      this.stage.dataset.currentPhotoId = initial.id;
      this.stage.setAttribute("aria-label", "Open featured memory");
      this.updateStatus();
    }

    this.stage.addEventListener("click", () => {
      const current = this.controller.current;
      if (current) onOpen?.(current);
    });

    previous.addEventListener("click", () => this.controller.previous());
    next.addEventListener("click", () => this.controller.next());
    carousel.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.controller.previous();
      }
      if (event.key === "ArrowRight") {
        event.preventDefault();
        this.controller.next();
      }
    });
    carousel.addEventListener("pointerenter", () => this.setInteracting(true));
    carousel.addEventListener("pointerleave", () => this.setInteracting(false));
    carousel.addEventListener("focusin", () => this.setInteracting(true));
    carousel.addEventListener("focusout", (event) => {
      if (!carousel.contains(event.relatedTarget as Node | null)) this.setInteracting(false);
    });

    const onMotionChange = (event: MediaQueryListEvent): void => {
      this.controller.setReducedMotion(event.matches);
    };
    this.motionQuery.addEventListener("change", onMotionChange);
    carousel.addEventListener("hrv:destroy", () => this.motionQuery.removeEventListener("change", onMotionChange));

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
    this.stage.closest(".hrv-carousel")?.dispatchEvent(new Event("hrv:destroy"));
  }

  private readonly onVisibilityChange = (): void => this.syncPlayback();

  private setInteracting(interacting: boolean): void {
    this.interacting = interacting;
    this.syncPlayback();
  }

  private syncPlayback(): void {
    this.controller.setPaused(this.interacting || !this.visible || document.hidden);
  }

  private updateStatus(): void {
    this.status.textContent = `Memory ${this.controller.currentPosition + 1} of ${this.controller.length}`;
  }

  private showChange(change: CarouselChange): void {
    this.stage.dataset.currentPhotoId = change.current.id;
    this.status.textContent = `Memory ${change.position + 1} of ${change.total}`;

    if (prefersReducedMotion()) {
      this.currentImage.src = change.current.galleryUrl;
      return;
    }

    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
    this.incomingImage.src = change.current.galleryUrl;
    this.incomingImage.classList.remove("is-next", "is-previous");
    this.incomingImage.classList.add(change.direction === "next" ? "is-next" : "is-previous");
    this.stage.classList.remove("is-moving-next", "is-moving-previous");
    void this.stage.offsetWidth;
    this.stage.classList.add(change.direction === "next" ? "is-moving-next" : "is-moving-previous");

    this.transitionTimer = window.setTimeout(() => {
      this.currentImage.src = change.current.galleryUrl;
      this.stage.classList.remove("is-moving-next", "is-moving-previous");
      this.incomingImage.removeAttribute("src");
      this.transitionTimer = null;
    }, 620);
  }
}
