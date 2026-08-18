import { themeForAlbumName } from "../domain/albums";
import type { PhotoRecord } from "../types";
import { clamp, createElement } from "../utils/dom";

export interface PhotoGridOptions {
  onOpen: (index: number, button: HTMLButtonElement) => void;
  emptyMessage?: string;
}

const EAGER_IMAGE_COUNT = 12;

export class PhotoGrid {
  private photos: PhotoRecord[];
  private readonly options: PhotoGridOptions;
  private readonly root: HTMLElement;
  private readonly preloadObserver: IntersectionObserver | null;

  constructor(mount: HTMLElement, photos: readonly PhotoRecord[], options: PhotoGridOptions) {
    this.photos = [...photos];
    this.options = options;
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
    this.root.querySelector<HTMLButtonElement>(`[data-photo-index="${safeIndex}"]`)?.focus({ preventScroll: true });
  }

  destroy(): void {
    this.preloadObserver?.disconnect();
    this.root.replaceChildren();
  }

  private render(): void {
    this.preloadObserver?.disconnect();
    if (this.photos.length === 0) {
      this.root.replaceChildren(createElement("p", "hrv-empty__copy", this.options.emptyMessage ?? "No photos are available yet."));
      return;
    }

    const fragment = document.createDocumentFragment();
    for (const [index, photo] of this.photos.entries()) {
      const theme = themeForAlbumName(photo.albumName);
      const item = createElement("div", "hrv-photo-grid__item");
      item.setAttribute("role", "listitem");
      item.setAttribute("aria-posinset", String(index + 1));
      item.setAttribute("aria-setsize", String(this.photos.length));
      item.dataset.theme = theme;

      const button = createElement("button", "hrv-photo-card");
      button.type = "button";
      button.dataset.photoIndex = String(index);
      button.dataset.theme = theme;
      button.setAttribute("aria-label", `Open photo ${index + 1} of ${this.photos.length} from ${photo.albumName}`);

      const image = createElement("img", "hrv-photo-card__image");
      image.src = photo.galleryUrl;
      image.alt = photo.alt;
      image.loading = index < EAGER_IMAGE_COUNT ? "eager" : "lazy";
      image.decoding = "async";
      image.setAttribute("fetchpriority", index < EAGER_IMAGE_COUNT ? "auto" : "low");
      if (image.loading === "lazy") this.preloadObserver?.observe(image);

      button.append(image);
      button.addEventListener("click", () => this.options.onOpen(index, button));
      item.append(button);
      fragment.append(item);
    }
    this.root.replaceChildren(fragment);
  }
}
