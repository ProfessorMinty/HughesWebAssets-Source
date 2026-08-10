import type { PhotoRecord } from "../types";
import { createElement, createIconButton } from "../utils/dom";

export class PhotoLightbox {
  private readonly dialog: HTMLDialogElement;
  private readonly image: HTMLImageElement;
  private readonly albumLabel: HTMLElement;
  private readonly counter: HTMLElement;
  private readonly fullSizeLink: HTMLAnchorElement;
  private photos: PhotoRecord[] = [];
  private index = 0;
  private returnFocus: HTMLElement | null = null;
  private returnToIndex: ((index: number) => void) | null = null;
  private pointerStartX: number | null = null;

  constructor(root: HTMLElement) {
    this.dialog = document.createElement("dialog");
    this.dialog.className = "hrv-lightbox";
    this.dialog.setAttribute("aria-label", "Photo viewer");

    const shell = createElement("div", "hrv-lightbox__shell");
    const close = createIconButton("Close photo viewer", "×", "hrv-lightbox__close hrv-icon-button");
    const media = createElement("div", "hrv-lightbox__media");
    this.image = createElement("img", "hrv-lightbox__image");
    this.image.decoding = "async";
    const previous = createIconButton("Previous photo", "←", "hrv-lightbox__previous hrv-icon-button");
    const next = createIconButton("Next photo", "→", "hrv-lightbox__next hrv-icon-button");
    media.append(previous, this.image, next);

    const footer = createElement("div", "hrv-lightbox__footer");
    const details = createElement("div", "hrv-lightbox__details");
    this.albumLabel = createElement("p", "hrv-lightbox__album");
    this.counter = createElement("p", "hrv-lightbox__counter");
    this.counter.setAttribute("aria-live", "polite");
    details.append(this.albumLabel, this.counter);
    this.fullSizeLink = createElement("a", "hrv-button hrv-button--light", "Open Full Size");
    this.fullSizeLink.target = "_blank";
    this.fullSizeLink.rel = "noopener noreferrer";
    footer.append(details, this.fullSizeLink);
    shell.append(close, media, footer);
    this.dialog.append(shell);
    root.append(this.dialog);

    close.addEventListener("click", () => this.close());
    previous.addEventListener("click", () => this.previous());
    next.addEventListener("click", () => this.next());
    this.dialog.addEventListener("cancel", (event) => {
      event.preventDefault();
      this.close();
    });
    this.dialog.addEventListener("close", () => this.finishClose());
    this.dialog.addEventListener("click", (event) => {
      if (event.target === this.dialog) this.close();
    });
    this.dialog.addEventListener("keydown", (event) => this.onKeyDown(event));
    media.addEventListener("pointerdown", (event) => {
      this.pointerStartX = event.clientX;
    });
    media.addEventListener("pointerup", (event) => {
      if (this.pointerStartX === null) return;
      const delta = event.clientX - this.pointerStartX;
      this.pointerStartX = null;
      if (Math.abs(delta) < 55) return;
      if (delta < 0) this.next();
      else this.previous();
    });
  }

  get isOpen(): boolean {
    return this.dialog.hasAttribute("open");
  }

  get currentIndex(): number {
    return this.index;
  }

  open(
    photos: readonly PhotoRecord[],
    index: number,
    returnFocus: HTMLElement | null = document.activeElement as HTMLElement | null,
    returnToIndex?: (index: number) => void,
  ): void {
    if (photos.length === 0) return;
    this.photos = [...photos];
    this.index = Math.min(Math.max(index, 0), this.photos.length - 1);
    this.returnFocus = returnFocus;
    this.returnToIndex = returnToIndex ?? null;
    this.render();
    document.documentElement.classList.add("hrv-lightbox-open");
    if (typeof this.dialog.showModal === "function") this.dialog.showModal();
    else this.dialog.setAttribute("open", "");
    this.dialog.querySelector<HTMLButtonElement>(".hrv-lightbox__close")?.focus();
  }

  close(): void {
    if (!this.isOpen) return;
    if (typeof this.dialog.close === "function") this.dialog.close();
    else {
      this.dialog.removeAttribute("open");
      this.finishClose();
    }
  }

  next(): void {
    if (this.photos.length < 2) return;
    this.index = (this.index + 1) % this.photos.length;
    this.render();
  }

  previous(): void {
    if (this.photos.length < 2) return;
    this.index = (this.index - 1 + this.photos.length) % this.photos.length;
    this.render();
  }

  destroy(): void {
    if (this.isOpen) this.close();
    this.dialog.remove();
  }

  private render(): void {
    const photo = this.photos[this.index];
    if (!photo) return;
    this.image.src = photo.galleryUrl;
    this.image.alt = photo.alt;
    this.albumLabel.textContent = photo.albumName;
    this.counter.textContent = `Photo ${this.index + 1} of ${this.photos.length}`;
    if (photo.fullSizeUrl) {
      this.fullSizeLink.href = photo.fullSizeUrl;
      this.fullSizeLink.hidden = false;
      this.fullSizeLink.removeAttribute("aria-disabled");
    } else {
      this.fullSizeLink.removeAttribute("href");
      this.fullSizeLink.hidden = true;
      this.fullSizeLink.setAttribute("aria-disabled", "true");
    }

    for (const adjacent of [
      this.photos[(this.index + 1) % this.photos.length],
      this.photos[(this.index - 1 + this.photos.length) % this.photos.length],
    ]) {
      if (!adjacent) continue;
      const image = new Image();
      image.decoding = "async";
      image.src = adjacent.galleryUrl;
    }
  }

  private finishClose(): void {
    document.documentElement.classList.remove("hrv-lightbox-open");
    if (this.returnFocus?.isConnected) this.returnFocus.focus();
    else this.returnToIndex?.(this.index);
    this.returnFocus = null;
    this.returnToIndex = null;
  }

  private onKeyDown(event: KeyboardEvent): void {
    if (event.key === "ArrowLeft") {
      event.preventDefault();
      this.previous();
      return;
    }
    if (event.key === "ArrowRight") {
      event.preventDefault();
      this.next();
      return;
    }
    if (event.key === "Escape") {
      event.preventDefault();
      this.close();
      return;
    }
    if (event.key !== "Tab") return;

    const focusable = [...this.dialog.querySelectorAll<HTMLElement>(
      'button:not([disabled]), a[href]:not([hidden]), [tabindex]:not([tabindex="-1"])',
    )].filter((element) => !element.hidden);
    const first = focusable[0];
    const last = focusable.at(-1);
    if (!first || !last) return;
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault();
      last.focus();
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault();
      first.focus();
    }
  }
}
