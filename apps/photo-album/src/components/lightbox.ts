import type { PhotoRecord } from "../types";
import { createElement, createIconButton } from "../utils/dom";

interface InlineStyleValue {
  property: string;
  value: string;
  priority: string;
}

interface PageScrollState {
  x: number;
  y: number;
  html: InlineStyleValue[];
  body: InlineStyleValue[];
}

const HTML_LOCK_PROPERTIES = ["overflow", "overscroll-behavior", "scroll-behavior"];
const BODY_LOCK_PROPERTIES = [
  "position",
  "top",
  "left",
  "width",
  "height",
  "overflow",
  "overscroll-behavior",
  "touch-action",
];

function captureStyles(element: HTMLElement, properties: readonly string[]): InlineStyleValue[] {
  return properties.map((property) => ({
    property,
    value: element.style.getPropertyValue(property),
    priority: element.style.getPropertyPriority(property),
  }));
}

function restoreStyles(element: HTMLElement, styles: readonly InlineStyleValue[]): void {
  for (const style of styles) {
    if (style.value) element.style.setProperty(style.property, style.value, style.priority);
    else element.style.removeProperty(style.property);
  }
}

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
  private pageScrollState: PageScrollState | null = null;

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
    this.dialog.addEventListener("wheel", (event) => event.preventDefault(), { passive: false });
    this.dialog.addEventListener("touchmove", (event) => event.preventDefault(), { passive: false });
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
    this.lockPageScroll();
    try {
      if (typeof this.dialog.showModal === "function") this.dialog.showModal();
      else this.dialog.setAttribute("open", "");
    } catch (error) {
      this.unlockPageScroll();
      throw error;
    }
    this.dialog.querySelector<HTMLButtonElement>(".hrv-lightbox__close")?.focus({ preventScroll: true });
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
    const position = this.unlockPageScroll();
    if (this.returnFocus?.isConnected) this.returnFocus.focus({ preventScroll: true });
    else this.returnToIndex?.(this.index);
    if (position) this.restorePagePosition(position);
    this.returnFocus = null;
    this.returnToIndex = null;
  }

  private lockPageScroll(): void {
    if (this.pageScrollState) return;
    const html = document.documentElement;
    const body = document.body;
    const x = window.scrollX;
    const y = window.scrollY;
    this.pageScrollState = {
      x,
      y,
      html: captureStyles(html, HTML_LOCK_PROPERTIES),
      body: captureStyles(body, BODY_LOCK_PROPERTIES),
    };

    html.classList.add("hrv-lightbox-open");
    body.classList.add("hrv-lightbox-open");
    html.style.setProperty("overflow", "hidden", "important");
    html.style.setProperty("overscroll-behavior", "none", "important");
    html.style.setProperty("scroll-behavior", "auto", "important");
    body.style.setProperty("position", "fixed", "important");
    body.style.setProperty("top", `${-y}px`, "important");
    body.style.setProperty("left", `${-x}px`, "important");
    body.style.setProperty("width", "100%", "important");
    body.style.setProperty("height", "100%", "important");
    body.style.setProperty("overflow", "hidden", "important");
    body.style.setProperty("overscroll-behavior", "none", "important");
    body.style.setProperty("touch-action", "none", "important");
  }

  private unlockPageScroll(): { x: number; y: number } | null {
    const state = this.pageScrollState;
    if (!state) return null;
    this.pageScrollState = null;
    const html = document.documentElement;
    const body = document.body;

    restoreStyles(body, state.body);
    restoreStyles(html, state.html);
    html.classList.remove("hrv-lightbox-open");
    body.classList.remove("hrv-lightbox-open");
    this.restorePagePosition(state);
    return { x: state.x, y: state.y };
  }

  private restorePagePosition(position: { x: number; y: number }): void {
    const html = document.documentElement;
    const scrollBehavior = captureStyles(html, ["scroll-behavior"]);
    html.style.setProperty("scroll-behavior", "auto", "important");
    window.scrollTo(position.x, position.y);
    restoreStyles(html, scrollBehavior);
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
