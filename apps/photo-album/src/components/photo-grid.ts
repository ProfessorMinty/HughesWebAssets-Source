import { themeForAlbumName } from "../domain/albums";
import { applyThemeAssets } from "../theme-recipes";
import type { PhotoRecord } from "../types";
import { clamp, createElement } from "../utils/dom";

export interface PhotoGridOptions {
  onOpen: (index: number, button: HTMLButtonElement) => void;
  emptyMessage?: string;
}

const EAGER_IMAGE_COUNT = 12;
const RENDER_BATCH_SIZE = 60;

export class PhotoGrid {
  private photos: PhotoRecord[];
  private readonly options: PhotoGridOptions;
  private readonly mount: HTMLElement;
  private readonly root: HTMLElement;
  private readonly preloadObserver: IntersectionObserver | null;
  private readonly progressiveObserver: IntersectionObserver | null;
  private loadMoreButton: HTMLButtonElement | null = null;
  private renderedCount = 0;

  constructor(mount: HTMLElement, photos: readonly PhotoRecord[], options: PhotoGridOptions) {
    this.photos = [...photos];
    this.options = options;
    this.mount = mount;
    this.root = createElement("div", "hrv-photo-grid");
    this.root.setAttribute("role", "list");
    this.root.setAttribute("aria-label", "Photo gallery");
    this.preloadObserver = "IntersectionObserver" in window
      ? new IntersectionObserver((entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting || !(entry.target instanceof HTMLImageElement)) continue;
            entry.target.loading = "eager";
            entry.target.fetchPriority = "auto";
            observer.unobserve(entry.target);
          }
        }, { rootMargin: "3000px 0px" })
      : null;
    this.progressiveObserver = "IntersectionObserver" in window
      ? new IntersectionObserver((entries, observer) => {
          for (const entry of entries) {
            if (!entry.isIntersecting || entry.target !== this.loadMoreButton) continue;
            observer.unobserve(entry.target);
            this.renderNextBatch();
          }
        }, { rootMargin: "1200px 0px" })
      : null;
    mount.append(this.root);
    this.render();
  }

  setPhotos(photos: readonly PhotoRecord[]): void {
    this.photos = [...photos];
    this.render();
  }

  focusItem(index: number): void {
    if (this.photos.length === 0) return;
    const safeIndex = clamp(index, 0, this.photos.length - 1);
    this.ensureRenderedThrough(safeIndex);
    this.root.querySelector<HTMLButtonElement>(`[data-photo-index="${safeIndex}"]`)?.focus({ preventScroll: true });
  }

  destroy(): void {
    this.preloadObserver?.disconnect();
    this.progressiveObserver?.disconnect();
    this.removeLoadMoreButton();
    this.root.replaceChildren();
  }

  private render(): void {
    this.preloadObserver?.disconnect();
    this.progressiveObserver?.disconnect();
    this.removeLoadMoreButton();
    this.root.replaceChildren();
    this.renderedCount = 0;

    if (this.photos.length === 0) {
      this.root.replaceChildren(createElement("p", "hrv-empty__copy", this.options.emptyMessage ?? "No photos are available yet."));
      return;
    }

    this.renderNextBatch();
  }

  private renderNextBatch(): void {
    if (this.renderedCount >= this.photos.length) {
      this.removeLoadMoreButton();
      return;
    }

    const start = this.renderedCount;
    const end = Math.min(start + RENDER_BATCH_SIZE, this.photos.length);
    const fragment = document.createDocumentFragment();

    for (let index = start; index < end; index += 1) {
      const photo = this.photos[index];
      if (!photo) continue;
      fragment.append(this.createPhotoItem(photo, index));
    }

    this.root.append(fragment);
    this.renderedCount = end;
    this.updateLoadMoreButton();
  }

  private createPhotoItem(photo: PhotoRecord, index: number): HTMLElement {
    const theme = themeForAlbumName(photo.albumName);
    const item = createElement("div", "hrv-photo-grid__item");
    item.setAttribute("role", "listitem");
    item.setAttribute("aria-posinset", String(index + 1));
    item.setAttribute("aria-setsize", String(this.photos.length));
    item.dataset.theme = theme;

    const button = createElement("button", "hrv-photo-card is-photo-loading");
    button.type = "button";
    button.dataset.photoIndex = String(index);
    applyThemeAssets(button, theme);
    button.setAttribute("aria-label", `Open photo ${index + 1} of ${this.photos.length} from ${photo.albumName}`);

    const image = createElement("img", "hrv-photo-card__image");
    image.src = photo.galleryUrl;
    image.alt = photo.alt;
    image.loading = index < EAGER_IMAGE_COUNT ? "eager" : "lazy";
    image.decoding = "async";
    image.setAttribute("fetchpriority", index < EAGER_IMAGE_COUNT ? "auto" : "low");
    if (image.loading === "lazy") this.preloadObserver?.observe(image);
    image.addEventListener("load", () => {
      button.classList.remove("is-photo-loading");
      button.classList.add("is-photo-loaded");
    });
    image.addEventListener("error", () => {
      this.preloadObserver?.unobserve(image);
      button.disabled = true;
      item.classList.add("hrv-photo-grid__item--unavailable");
      item.hidden = true;
    });

    button.append(image);
    button.addEventListener("click", () => this.options.onOpen(index, button));
    item.append(button);
    return item;
  }

  private ensureRenderedThrough(index: number): void {
    while (this.renderedCount <= index && this.renderedCount < this.photos.length) {
      this.renderNextBatch();
    }
  }

  private updateLoadMoreButton(): void {
    this.progressiveObserver?.disconnect();

    if (this.renderedCount >= this.photos.length) {
      this.removeLoadMoreButton();
      return;
    }

    if (!this.loadMoreButton) {
      const button = createElement("button", "hrv-button hrv-button--memory hrv-photo-grid__more", "Load more memories");
      button.type = "button";
      button.addEventListener("click", () => this.renderNextBatch());
      this.loadMoreButton = button;
      this.mount.append(button);
    }

    const remaining = this.photos.length - this.renderedCount;
    this.loadMoreButton.setAttribute("aria-label", `Load more memories, ${remaining} remaining`);
    this.loadMoreButton.dataset.remaining = String(remaining);
    this.progressiveObserver?.observe(this.loadMoreButton);
  }

  private removeLoadMoreButton(): void {
    if (!this.loadMoreButton) return;
    this.progressiveObserver?.unobserve(this.loadMoreButton);
    this.loadMoreButton.remove();
    this.loadMoreButton = null;
  }
}
