import { CAROUSEL_INTERVAL_MS } from "../config";
import type { PhotoRecord } from "../types";
import { createElement, createIconButton } from "../utils/dom";

export type MemoryCarouselDirection = "next" | "previous";

interface MemorySlide {
  button: HTMLButtonElement;
  image: HTMLImageElement;
  slot: number;
}

const INITIAL_SLOTS = [-2, -1, 0, 1, 2] as const;
const TRAVEL_MS = 920;
const SWIPE_THRESHOLD_PX = 48;

function shuffled<T>(items: readonly T[], random: () => number = Math.random): T[] {
  const result = [...items];
  for (let index = result.length - 1; index > 0; index -= 1) {
    const swapIndex = Math.floor(random() * (index + 1));
    const value = result[index];
    result[index] = result[swapIndex] as T;
    result[swapIndex] = value as T;
  }
  return result;
}

export class MemoryCarouselV2 {
  private readonly photos: PhotoRecord[];
  private readonly stage: HTMLElement;
  private readonly slides: MemorySlide[] = [];
  private readonly status: HTMLElement;
  private readonly pauseButton: HTMLButtonElement;
  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;
  private position = 0;
  private timer: number | null = null;
  private transitionTimer: number | null = null;
  private userPaused = false;
  private traveling = false;
  private pointerStartX: number | null = null;

  constructor(
    mount: HTMLElement,
    photos: readonly PhotoRecord[],
    onOpen?: (photo: PhotoRecord) => void,
  ) {
    this.photos = shuffled(photos);
    this.onOpen = onOpen;

    const shell = createElement("div", "hrv-v2-memory");
    const glass = createElement("div", "hrv-v2-memory__glass");
    const aura = createElement("div", "hrv-v2-memory__aura");
    aura.setAttribute("aria-hidden", "true");

    this.stage = createElement("div", "hrv-v2-memory__stage");
    this.stage.setAttribute("role", "region");
    this.stage.setAttribute("aria-roledescription", "carousel");
    this.stage.setAttribute("aria-label", "Featured classroom memories");

    for (const slot of INITIAL_SLOTS) {
      const slide = this.createSlide(slot);
      this.slides.push(slide);
      this.stage.append(slide.button);
    }

    const controls = createElement("div", "hrv-v2-memory__controls");
    const previous = createIconButton("Previous featured memory", "←", "hrv-v2-memory__arrow");
    const next = createIconButton("Next featured memory", "→", "hrv-v2-memory__arrow");
    this.pauseButton = createIconButton("Pause featured memories", "Ⅱ", "hrv-v2-memory__pause");
    this.pauseButton.setAttribute("aria-pressed", "false");
    this.status = createElement("p", "hrv-v2-memory__status");
    controls.append(previous, this.status, this.pauseButton, next);

    const hint = createElement("p", "hrv-v2-memory__hint", "Featured memories");
    hint.setAttribute("aria-hidden", "true");

    glass.append(aura, this.stage, hint, controls);
    shell.append(glass);
    mount.append(shell);

    this.renderInitialTrack();

    previous.addEventListener("click", () => this.move("previous"));
    next.addEventListener("click", () => this.move("next"));
    this.pauseButton.addEventListener("click", () => this.togglePause());

    this.stage.addEventListener("keydown", (event) => {
      if (event.key === "ArrowLeft") {
        event.preventDefault();
        this.move("previous");
      } else if (event.key === "ArrowRight") {
        event.preventDefault();
        this.move("next");
      }
    });

    this.stage.addEventListener("pointerdown", (event) => {
      this.pointerStartX = event.clientX;
    });
    this.stage.addEventListener("pointercancel", () => {
      this.pointerStartX = null;
    });
    this.stage.addEventListener("pointerup", (event) => {
      if (this.pointerStartX === null) return;
      const delta = event.clientX - this.pointerStartX;
      this.pointerStartX = null;
      if (Math.abs(delta) < SWIPE_THRESHOLD_PX) return;
      this.move(delta < 0 ? "next" : "previous");
    });

    document.addEventListener("visibilitychange", this.onVisibilityChange);
    this.startAutoplay();
  }

  destroy(): void {
    this.stopAutoplay();
    if (this.transitionTimer !== null) window.clearTimeout(this.transitionTimer);
    document.removeEventListener("visibilitychange", this.onVisibilityChange);
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
    const index = (this.position + offset + this.photos.length) % this.photos.length;
    return this.photos[index] ?? null;
  }

  private createSlide(slot: number): MemorySlide {
    const button = createElement("button", "hrv-v2-memory__slide");
    button.type = "button";
    const image = createElement("img", "hrv-v2-memory__image");
    image.alt = "";
    image.decoding = "async";
    image.loading = Math.abs(slot) <= 1 ? "eager" : "lazy";
    button.append(image);

    const slide = { button, image, slot };
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
    if (slide.image.src !== photo.galleryUrl) slide.image.src = photo.galleryUrl;
    slide.button.dataset.photoId = photo.id;
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
      ? `${this.position + 1} / ${this.photos.length}`
      : "0 / 0";
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
