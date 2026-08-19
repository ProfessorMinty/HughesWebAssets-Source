import type { PhotoRecord } from "../types";
import { createElement, createIconButton } from "../utils/dom";

export type MemoryCarouselDirection = "previous" | "next";

type MemorySlide = {
  button: HTMLButtonElement;
  image: HTMLImageElement;
  slot: number;
};

const INITIAL_SLOTS = [-2, -1, 0, 1, 2] as const;
const TRAVEL_MS = 820;
const CAROUSEL_INTERVAL_MS = 6800;
const SWIPE_THRESHOLD_PX = 52;

export class MemoryCarouselV2 {
  private readonly photos: PhotoRecord[];
  private readonly root: HTMLElement;
  private readonly stage: HTMLElement;
  private readonly status: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly slides: MemorySlide[];
  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;
  private readonly brokenPhotoIds = new Set<string>();
  private position = 0;
  private traveling = false;
  private timer: number | null = null;
  private transitionTimer: number | null = null;
  private userPaused = false;
  private pointerId: number | null = null;
  private pointerStartX = 0;
  private pointerStartY = 0;

  constructor(mount: HTMLElement, photos: readonly PhotoRecord[], onOpen?: (photo: PhotoRecord) => void) {
    this.photos = [...photos];
    this.onOpen = onOpen;
    this.root = createElement("div", "hrv-carousel hrv-carousel--memories");
    this.root.tabIndex = -1;
    this.root.setAttribute("aria-label", "Current memories");

    this.stage = createElement("div", "hrv-carousel__stage");
    this.stage.setAttribute("aria-live", "off");
    this.slides = INITIAL_SLOTS.map((slot) => this.createSlide(slot));
    this.stage.append(...this.slides.map((slide) => slide.button));

    const controls = createElement("div", "hrv-carousel__controls");
    const previous = createIconButton("Previous memory", "←", "hrv-icon-button");
    previous.addEventListener("click", () => this.move("previous"));
    this.status = createElement("span", "hrv-carousel__status");
    this.status.setAttribute("aria-live", "polite");
    const next = createIconButton("Next memory", "→", "hrv-icon-button");
    next.addEventListener("click", () => this.move("next"));
    this.pauseButton = createIconButton(
      "Pause featured memories",
      "Ⅱ",
      "hrv-icon-button hrv-carousel__pause",
    );
    this.pauseButton.setAttribute("aria-pressed", "false");
    this.pauseButton.addEventListener("click", () => this.togglePause());
    controls.append(previous, this.status, next, this.pauseButton);

    this.root.append(this.stage, controls);
    mount.append(this.root);
    this.renderInitialTrack();
    this.bindPointer();
    this.bindVisibility();
    this.startAutoplay();
  }

  destroy(): void {
    this.stopAutoplay();
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
    this.root.remove();
  }

  private bindPointer(): void {
    this.stage.addEventListener("pointerdown", (event) => {
      if (event.button !== 0 || this.traveling) return;
      this.pointerId = event.pointerId;
      this.pointerStartX = event.clientX;
      this.pointerStartY = event.clientY;
      this.stage.setPointerCapture?.(event.pointerId);
    });
    this.stage.addEventListener("pointerup", (event) => {
      if (this.pointerId !== event.pointerId) return;
      const deltaX = event.clientX - this.pointerStartX;
      const deltaY = event.clientY - this.pointerStartY;
      this.pointerId = null;
      if (Math.abs(deltaX) < SWIPE_THRESHOLD_PX || Math.abs(deltaX) <= Math.abs(deltaY)) return;
      this.move(deltaX < 0 ? "next" : "previous");
    });
    this.stage.addEventListener("pointercancel", () => {
      this.pointerId = null;
    });
  }

  private bindVisibility(): void {
    document.addEventListener("visibilitychange", this.onVisibilityChange);
  }

  private readonly onVisibilityChange = (): void => {
    if (document.hidden) this.stopAutoplay();
    else this.startAutoplay();
  };

  private get current(): PhotoRecord | null {
    return this.photos[this.position] ?? null;
  }

  private photoAtOffset(offset: number): PhotoRecord | null {
    if (this.photos.length === 0) return null;
    const start = (this.position + offset + this.photos.length) % this.photos.length;
    for (let step = 0; step < this.photos.length; step += 1) {
      const candidate = this.photos[(start + step) % this.photos.length];
      if (candidate && !this.brokenPhotoIds.has(candidate.id)) return candidate;
    }
    return null;
  }

  private createSlide(slot: number): MemorySlide {
    const button = createElement("button", "hrv-carousel__slide is-photo-loading");
    button.type = "button";
    const image = createElement("img", "hrv-carousel__image");
    image.alt = "";
    image.decoding = "async";
    image.loading = slot === 0 ? "eager" : "lazy";
    image.fetchPriority = slot === 0 ? "high" : "low";
    button.append(image);

    const slide = { button, image, slot };
    image.addEventListener("load", () => {
      button.classList.remove("is-photo-error", "is-photo-loading");
      button.classList.add("is-photo-loaded");
    });
    image.addEventListener("error", () => this.handleImageError(slide));
    this.applySlot(slide, slot);
    button.addEventListener("click", () => this.activateSlide(slide));
    return slide;
  }

  private renderInitialTrack(): void {
    const hasMultiple = this.photos.length > 1;
    for (let index = 0; index < this.slides.length; index += 1) {
      const slide = this.slides[index];
      const slot = INITIAL_SLOTS[index];
      if (!slide || slot === undefined) continue;
      this.applySlot(slide, slot);
      const photo = this.photoAtOffset(slot);
      if (photo) this.updatePhoto(slide, photo);
      slide.button.hidden = !hasMultiple && slot !== 0;
    }
    this.pauseButton.hidden = !hasMultiple;
    this.updateStatus();
  }

  private updatePhoto(slide: MemorySlide, photo: PhotoRecord): void {
    if (slide.image.src !== photo.galleryUrl) {
      slide.button.classList.remove("is-photo-loaded", "is-photo-error");
      slide.button.classList.add("is-photo-loading");
      slide.image.src = photo.galleryUrl;
    }
    slide.button.dataset.photoId = photo.id;
  }

  private handleImageError(slide: MemorySlide): void {
    const photoId = slide.button.dataset.photoId;
    if (photoId) this.brokenPhotoIds.add(photoId);
    slide.button.classList.remove("is-photo-loading", "is-photo-loaded");
    slide.button.classList.add("is-photo-error");
    if (slide.slot !== 0 || this.traveling || this.photos.length <= this.brokenPhotoIds.size) return;
    window.setTimeout(() => {
      if (!this.traveling) this.move("next");
    }, 60);
  }

  private applySlot(slide: MemorySlide, slot: number): void {
    slide.slot = slot;
    slide.button.dataset.slot = String(slot);
    const interactive = Math.abs(slot) <= 1;
    slide.button.tabIndex = interactive ? 0 : -1;
    if (!interactive) {
      slide.button.setAttribute("aria-hidden", "true");
      slide.button.removeAttribute("aria-label");
      return;
    }
    slide.button.removeAttribute("aria-hidden");
    if (slot === 0) slide.button.setAttribute("aria-label", "Open featured memory");
    else if (slot < 0) slide.button.setAttribute("aria-label", "Show previous featured memory");
    else slide.button.setAttribute("aria-label", "Show next featured memory");
  }

  private activateSlide(slide: MemorySlide): void {
    if (this.traveling) return;
    if (slide.slot === 0) {
      const photo = this.current;
      if (photo) this.onOpen?.(photo);
    } else if (slide.slot === -1) {
      this.move("previous");
    } else if (slide.slot === 1) {
      this.move("next");
    }
  }

  private move(direction: MemoryCarouselDirection): void {
    if (this.traveling || this.photos.length < 2) return;
    this.traveling = true;
    this.stopAutoplay();

    this.position = direction === "next"
      ? (this.position + 1) % this.photos.length
      : (this.position - 1 + this.photos.length) % this.photos.length;

    this.stage.dataset.direction = direction;
    this.stage.classList.add("is-traveling");
    const delta = direction === "next" ? -1 : 1;
    for (const slide of this.slides) this.applySlot(slide, slide.slot + delta);
    this.updateStatus();

    this.transitionTimer = window.setTimeout(() => {
      this.recycle(direction);
    }, TRAVEL_MS);
  }

  private recycle(direction: MemoryCarouselDirection): void {
    this.stage.classList.add("is-recycling");
    const outgoingSlot = direction === "next" ? -3 : 3;
    const recycledSlot = direction === "next" ? 2 : -2;
    const outgoing = this.slides.find((slide) => slide.slot === outgoingSlot);
    const incomingPhoto = this.photoAtOffset(recycledSlot);

    if (outgoing && incomingPhoto) {
      this.updatePhoto(outgoing, incomingPhoto);
      this.applySlot(outgoing, recycledSlot);
      void outgoing.button.offsetWidth;
    }

    this.stage.classList.remove("is-traveling");
    this.stage.classList.remove("is-recycling");
    delete this.stage.dataset.direction;
    this.traveling = false;
    this.transitionTimer = null;
    this.startAutoplay();
  }

  private togglePause(): void {
    this.userPaused = !this.userPaused;
    this.pauseButton.textContent = this.userPaused ? "▶" : "Ⅱ";
    this.pauseButton.setAttribute("aria-pressed", String(this.userPaused));
    this.pauseButton.setAttribute(
      "aria-label",
      this.userPaused ? "Resume featured memories" : "Pause featured memories",
    );
    if (this.userPaused) this.stopAutoplay();
    else this.startAutoplay();
  }

  private updateStatus(): void {
    this.status.textContent = this.photos.length > 0
      ? `Memory ${this.position + 1} of ${this.photos.length}`
      : "Memory 0 of 0";
  }

  private startAutoplay(): void {
    this.stopAutoplay();
    if (this.userPaused || document.hidden || this.photos.length < 2) return;
    this.timer = window.setTimeout(() => {
      this.timer = null;
      this.move("next");
    }, CAROUSEL_INTERVAL_MS);
  }

  private stopAutoplay(): void {
    if (this.timer !== null) window.clearTimeout(this.timer);
    this.timer = null;
  }
}
