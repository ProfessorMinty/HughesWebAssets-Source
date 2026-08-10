import type { PhotoRecord } from "../types";
import { clamp, createElement } from "../utils/dom";

export interface VirtualPhotoGridOptions {
  onOpen: (index: number, button: HTMLButtonElement) => void;
  emptyMessage?: string;
}

const GAP = 14;
const OVERSCAN_ROWS = 3;

function columnsForWidth(width: number): number {
  if (width >= 1180) return 5;
  if (width >= 900) return 4;
  if (width >= 620) return 3;
  if (width >= 330) return 2;
  return 1;
}

export class VirtualPhotoGrid {
  private photos: PhotoRecord[];
  private readonly options: VirtualPhotoGridOptions;
  private readonly root: HTMLElement;
  private readonly topSpacer: HTMLElement;
  private readonly grid: HTMLElement;
  private readonly bottomSpacer: HTMLElement;
  private readonly resizeObserver: ResizeObserver | null;
  private frame: number | null = null;
  private startIndex = -1;
  private endIndex = -1;
  private columns = 0;
  private rowHeight = 220;

  constructor(mount: HTMLElement, photos: readonly PhotoRecord[], options: VirtualPhotoGridOptions) {
    this.photos = [...photos];
    this.options = options;
    this.root = createElement("div", "hrv-virtual-grid");
    this.root.setAttribute("role", "list");
    this.root.setAttribute("aria-label", "Photo gallery");
    this.topSpacer = createElement("div", "hrv-virtual-grid__spacer");
    this.topSpacer.setAttribute("aria-hidden", "true");
    this.grid = createElement("div", "hrv-photo-grid");
    this.bottomSpacer = createElement("div", "hrv-virtual-grid__spacer");
    this.bottomSpacer.setAttribute("aria-hidden", "true");
    this.root.append(this.topSpacer, this.grid, this.bottomSpacer);
    mount.append(this.root);

    if ("ResizeObserver" in window) {
      this.resizeObserver = new ResizeObserver(() => this.scheduleRender(true));
      this.resizeObserver.observe(this.root);
    } else {
      this.resizeObserver = null;
    }

    window.addEventListener("scroll", this.onViewportChange, { passive: true });
    window.addEventListener("resize", this.onViewportChange, { passive: true });
    this.render(true);
  }

  setPhotos(photos: readonly PhotoRecord[]): void {
    this.photos = [...photos];
    this.startIndex = -1;
    this.endIndex = -1;
    this.render(true);
  }

  focusItem(index: number): void {
    if (this.photos.length === 0) return;
    const safeIndex = clamp(index, 0, this.photos.length - 1);
    const row = Math.floor(safeIndex / Math.max(1, this.columns));
    const rootTop = this.root.getBoundingClientRect().top + window.scrollY;
    window.scrollTo({ top: Math.max(0, rootTop + row * this.rowHeight - 120), behavior: "auto" });
    this.render(true);
    window.requestAnimationFrame(() => {
      this.grid.querySelector<HTMLButtonElement>(`[data-photo-index="${safeIndex}"]`)?.focus();
    });
  }

  destroy(): void {
    window.removeEventListener("scroll", this.onViewportChange);
    window.removeEventListener("resize", this.onViewportChange);
    this.resizeObserver?.disconnect();
    if (this.frame !== null) window.cancelAnimationFrame(this.frame);
  }

  private readonly onViewportChange = (): void => this.scheduleRender(false);

  private scheduleRender(force: boolean): void {
    if (this.frame !== null) return;
    this.frame = window.requestAnimationFrame(() => {
      this.frame = null;
      this.render(force);
    });
  }

  private render(force: boolean): void {
    if (this.photos.length === 0) {
      this.grid.replaceChildren(createElement("p", "hrv-empty__copy", this.options.emptyMessage ?? "No photos are available yet."));
      this.topSpacer.style.height = "0px";
      this.bottomSpacer.style.height = "0px";
      return;
    }

    const width = this.root.clientWidth || this.root.parentElement?.clientWidth || 960;
    const columns = columnsForWidth(width);
    const cardWidth = (width - GAP * (columns - 1)) / columns;
    const rowHeight = cardWidth * 0.75 + GAP;
    const bounds = this.root.getBoundingClientRect();
    const relativeTop = Math.max(0, -bounds.top);
    const firstVisibleRow = Math.floor(relativeTop / rowHeight);
    const visibleRows = Math.ceil(window.innerHeight / rowHeight);
    const totalRows = Math.ceil(this.photos.length / columns);
    const startRow = clamp(firstVisibleRow - OVERSCAN_ROWS, 0, Math.max(0, totalRows - 1));
    const endRow = clamp(firstVisibleRow + visibleRows + OVERSCAN_ROWS, 0, totalRows);
    const startIndex = startRow * columns;
    const endIndex = Math.min(this.photos.length, endRow * columns);

    if (!force && startIndex === this.startIndex && endIndex === this.endIndex && columns === this.columns) return;

    this.startIndex = startIndex;
    this.endIndex = endIndex;
    this.columns = columns;
    this.rowHeight = rowHeight;
    this.grid.style.setProperty("--hrv-grid-columns", String(columns));
    this.topSpacer.style.height = `${startRow * rowHeight}px`;
    this.bottomSpacer.style.height = `${Math.max(0, totalRows - endRow) * rowHeight}px`;

    const fragment = document.createDocumentFragment();
    for (let index = startIndex; index < endIndex; index += 1) {
      const photo = this.photos[index];
      if (!photo) continue;
      const item = createElement("div", "hrv-photo-grid__item");
      item.setAttribute("role", "listitem");
      item.setAttribute("aria-posinset", String(index + 1));
      item.setAttribute("aria-setsize", String(this.photos.length));
      const button = createElement("button", "hrv-photo-card");
      button.type = "button";
      button.dataset.photoIndex = String(index);
      button.setAttribute("aria-label", `Open photo ${index + 1} of ${this.photos.length} from ${photo.albumName}`);
      const image = createElement("img", "hrv-photo-card__image");
      image.src = photo.galleryUrl;
      image.alt = photo.alt;
      image.loading = "lazy";
      image.decoding = "async";
      image.setAttribute("fetchpriority", "low");
      button.append(image);
      button.addEventListener("click", () => this.options.onOpen(index, button));
      item.append(button);
      fragment.append(item);
    }
    this.grid.replaceChildren(fragment);
  }
}
