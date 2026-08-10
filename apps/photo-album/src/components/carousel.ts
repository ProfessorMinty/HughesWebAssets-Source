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

const CAROUSEL_TRANSITION_MS = 780;
const REDUCED_FADE_HALF_MS = 180;
const INITIAL_SLOTS = [-2, -1, 0, 1, 2] as const;

interface CarouselSlideView {
  button: HTMLButtonElement;
  image: HTMLImageElement;
  slot: number;
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
  private readonly slides: CarouselSlideView[] = [];
  private readonly status: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;
  private transitionTimer: number | null = null;
  private userPaused = false;
  private transitioning = false;

  constructor(
    mount: HTMLElement,
    photos: readonly PhotoRecord[],
    schoolYear: string,
    onOpen?: (photo: PhotoRecord) => void,
  ) {
    this.onOpen = onOpen;

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
    this.stage.setAttribute("aria-label", "Featured memory carousel");

    for (const slot of INITIAL_SLOTS) {
      const view = this.createSlide(slot);
      this.slides.push(view);
      this.stage.append(view.button);
    }

    const controls = createElement("div", "hrv-carousel__controls");
    const previous = createIconButton("Previous featured memory", "←", "hrv-icon-button");
    const next = createIconButton("Next featured memory", "→", "hrv-icon-button");
    this.pauseButton = createIconButton(
      "Pause featured memories",
      "Ⅱ",
      "hrv-icon-button hrv-carousel__pause",
    );
    this.pauseButton.setAttribute("aria-pressed", "false");
    this.status = createElement("p", "hrv-carousel__status");
    this.status.setAttribute("aria-live", "polite");
    controls.append(previous, this.status, this.pauseButton, next);

    carousel.append(this.stage, controls);
    mount.append(copy, carousel);

    this.controller = new CarouselController(photos, {
      onChange: (change) => this.showChange(change),
    });

    this.renderInitialTrack();

    for (const view of this.slides) {
      view.button.addEventListener("click", () => this.onSlideClick(view));
    }

    previous.addEventListener("click", () => this.requestMove("previous"));
    next.addEventListener("click", () => this.requestMove("next"));
    this.pauseButton.addEventListener("click", () => this.togglePaused());

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

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.syncPlayback();
  }

  destroy(): void {
    this.controller.destroy();
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
  }

  private readonly onVisibilityChange = (): void => this.syncPlayback();

  private createSlide(slot: number): CarouselSlideView {
    const button = createElement("button", "hrv-carousel__slide");
    button.type = "button";

    const image = createElement("img", "hrv-carousel__image");
    image.alt = "";
    image.decoding = "async";
    image.loading = slot === 0 ? "eager" : "lazy";
    image.fetchPriority = slot === 0 ? "high" : "low";

    button.append(image);

    const view: CarouselSlideView = { button, image, slot };
    this.applySlot(view, slot);
    return view;
  }

  private onSlideClick(view: CarouselSlideView): void {
    if (this.transitioning) return;
    if (view.slot === 0) {
      const current = this.controller.current;
      if (current) this.onOpen?.(current);
      return;
    }
    if (view.slot === -1) {
      this.requestMove("previous");
      return;
    }
    if (view.slot === 1) {
      this.requestMove("next");
    }
  }

  private requestMove(direction: CarouselDirection): void {
    if (this.transitioning) return;
    if (direction === "next") this.controller.next();
    else this.controller.previous();
  }

  private togglePaused(): void {
    this.userPaused = !this.userPaused;
    this.pauseButton.textContent = this.userPaused ? "▶" : "Ⅱ";
    this.pauseButton.setAttribute("aria-pressed", String(this.userPaused));
    this.pauseButton.setAttribute(
      "aria-label",
      this.userPaused ? "Resume featured memories" : "Pause featured memories",
    );
    this.syncPlayback();
  }

  private syncPlayback(): void {
    this.controller.setPaused(this.userPaused || document.hidden);
  }

  private renderInitialTrack(): void {
    const hasMultiplePhotos = this.controller.length > 1;

    for (let index = 0; index < this.slides.length; index += 1) {
      const view = this.slides[index];
      const slot = INITIAL_SLOTS[index];
      if (!view || slot === undefined) continue;
      this.applySlot(view, slot);
      const photo = this.controller.photoAtOffset(slot);
      if (photo) this.updateSlidePhoto(view, photo);
      view.button.hidden = !hasMultiplePhotos && slot !== 0;
    }

    this.pauseButton.hidden = !hasMultiplePhotos;
    const current = this.controller.current;
    if (current) this.stage.dataset.currentPhotoId = current.id;
    this.updateStatus();
  }

  private updateStatus(): void {
    this.status.textContent = `Memory ${this.controller.currentPosition + 1} of ${this.controller.length}`;
  }

  private updateSlidePhoto(view: CarouselSlideView, photo: PhotoRecord): void {
    if (view.image.src !== photo.galleryUrl) {
      view.image.src = photo.galleryUrl;
    }
    view.button.dataset.photoId = photo.id;
  }

  private applySlot(view: CarouselSlideView, slot: number): void {
    view.slot = slot;
    view.button.dataset.slot = String(slot);

    const isOuter = Math.abs(slot) > 1;
    view.button.tabIndex = isOuter ? -1 : 0;

    if (isOuter) {
      view.button.setAttribute("aria-hidden", "true");
      view.button.removeAttribute("aria-label");
      return;
    }

    view.button.removeAttribute("aria-hidden");
    if (slot === 0) {
      view.button.setAttribute("aria-label", "Open featured memory");
    } else if (slot < 0) {
      view.button.setAttribute("aria-label", "Show previous featured memory");
    } else {
      view.button.setAttribute("aria-label", "Show next featured memory");
    }
  }

  private showChange(change: CarouselChange): void {
    this.stage.dataset.currentPhotoId = change.current.id;
    this.status.textContent = `Memory ${change.position + 1} of ${change.total}`;

    if (prefersReducedMotion()) {
      this.showReducedChange();
      return;
    }

    this.transitioning = true;
    this.stage.classList.add("is-traveling");

    const delta = change.direction === "next" ? -1 : 1;
    for (const view of this.slides) {
      this.applySlot(view, view.slot + delta);
    }

    this.transitionTimer = window.setTimeout(() => {
      this.finishTrackMove(change.direction);
    }, CAROUSEL_TRANSITION_MS);
  }

  private finishTrackMove(direction: CarouselDirection): void {
    this.stage.classList.add("is-recycling");

    const outgoingSlot = direction === "next" ? -3 : 3;
    const recycledSlot = direction === "next" ? 2 : -2;
    const outgoing = this.slides.find((view) => view.slot === outgoingSlot);
    const recycledPhoto = this.controller.photoAtOffset(recycledSlot);

    if (outgoing && recycledPhoto) {
      this.updateSlidePhoto(outgoing, recycledPhoto);
      this.applySlot(outgoing, recycledSlot);
      void outgoing.button.offsetWidth;
    }

    this.stage.classList.remove("is-traveling");
    this.stage.classList.remove("is-recycling");
    this.transitioning = false;
    this.transitionTimer = null;
  }

  private showReducedChange(): void {
    this.transitioning = true;
    this.stage.classList.add("is-reduced-fading");

    this.transitionTimer = window.setTimeout(() => {
      this.renderInitialTrack();
      this.stage.classList.remove("is-reduced-fading");
      this.transitionTimer = window.setTimeout(() => {
        this.transitioning = false;
        this.transitionTimer = null;
      }, REDUCED_FADE_HALF_MS);
    }, REDUCED_FADE_HALF_MS);
  }
}
