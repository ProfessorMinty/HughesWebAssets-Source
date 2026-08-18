import discoveryOrnamentUrl from "./assets/ornament-discovery.svg?url";
import gardenOrnamentUrl from "./assets/ornament-garden.svg?url";
import harvestOrnamentUrl from "./assets/ornament-harvest.svg?url";
import constellationOrnamentUrl from "./assets/ornament-constellation.svg?url";
import woodlandOrnamentUrl from "./assets/ornament-woodland.svg?url";
import { HeroCarousel } from "./components/carousel";
import { PhotoLightbox } from "./components/lightbox";
import { PhotoGrid } from "./components/photo-grid";
import type { PhotoAlbumOptions } from "./config";
import { DEFAULT_MANIFEST_URL } from "./config";
import { loadManifest } from "./data/manifest";
import { buildAlbumCollection } from "./domain/albums";
import { HashRouter, routeHref } from "./runtime/router";
import type {
  AlbumCollection,
  AlbumViewModel,
  AppRoute,
  PhotoAlbumManifest,
  PhotoRecord,
} from "./types";
import { createElement } from "./utils/dom";

type Cleanup = () => void;

const ORNAMENT_URLS = {
  harvest: harvestOrnamentUrl,
  discovery: discoveryOrnamentUrl,
  woodland: woodlandOrnamentUrl,
  garden: gardenOrnamentUrl,
  constellation: constellationOrnamentUrl,
} as const;

function schoolYearLabel(schoolYear: string): string {
  return schoolYear.replace("-", "–");
}

function setLinkRoute(link: HTMLAnchorElement, route: AppRoute): void {
  link.href = routeHref(route);
  link.dataset.route = route.name;
}

function createRouteLink(label: string, route: AppRoute, className: string): HTMLAnchorElement {
  const link = createElement("a", className, label);
  setLinkRoute(link, route);
  return link;
}

export class PhotoAlbumApp {
  private readonly manifestUrl: string;
  private readonly layout: "contained" | "viewport";
  private readonly root: HTMLElement;
  private main: HTMLElement | null = null;
  private nav: HTMLElement | null = null;
  private router: HashRouter | null = null;
  private lightbox: PhotoLightbox | null = null;
  private manifest: PhotoAlbumManifest | null = null;
  private collection: AlbumCollection | null = null;
  private viewCleanup: Cleanup | null = null;
  private destroyed = false;
  private previousRouteName: AppRoute["name"] | null = null;

  constructor(root: HTMLElement, options: PhotoAlbumOptions = {}) {
    this.root = root;
    this.manifestUrl = options.manifestUrl ?? DEFAULT_MANIFEST_URL;
    this.layout = options.layout ?? "viewport";
  }

  async start(): Promise<void> {
    this.prepareRoot();
    this.renderLoading();
    try {
      const loaded = await loadManifest(this.manifestUrl);
      if (this.destroyed) return;
      this.manifest = loaded.manifest;
      this.collection = buildAlbumCollection(loaded.manifest);
      this.renderShell(loaded.origin === "cache" ? loaded.cachedAt : null);
      this.router = new HashRouter((route) => this.renderRoute(route));
      this.router.start();
    } catch (error) {
      if (!this.destroyed) this.renderError(error instanceof Error ? error.message : "The album could not be loaded.");
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.viewCleanup?.();
    this.lightbox?.destroy();
    this.router?.stop();
    window.removeEventListener("resize", this.updateViewportWidth);
    this.root.replaceChildren();
    this.root.classList.remove("hrv-photo-album");
    delete this.root.dataset.layout;
    delete this.root.dataset.state;
    this.root.style.removeProperty("--hrv-viewport-width");
  }

  private prepareRoot(): void {
    this.root.classList.add("hrv-photo-album");
    this.root.dataset.layout = this.layout;
    this.root.dataset.state = "loading";
    this.root.setAttribute("aria-busy", "true");
    window.removeEventListener("resize", this.updateViewportWidth);
    if (this.layout === "viewport") {
      this.updateViewportWidth();
      window.addEventListener("resize", this.updateViewportWidth, { passive: true });
    }
  }

  private readonly updateViewportWidth = (): void => {
    this.root.style.setProperty("--hrv-viewport-width", `${document.documentElement.clientWidth}px`);
  };

  private renderLoading(): void {
    const state = createElement("div", "hrv-state hrv-state--loading");
    state.setAttribute("role", "status");
    const sparkle = createElement("span", "hrv-loading-sparkle", "✦");
    sparkle.setAttribute("aria-hidden", "true");
    state.append(sparkle, createElement("p", "hrv-state__title", "Gathering classroom memories…"));
    this.root.replaceChildren(state);
  }

  private renderError(message: string): void {
    this.root.dataset.state = "error";
    this.root.removeAttribute("aria-busy");
    const state = createElement("div", "hrv-state hrv-state--error");
    state.setAttribute("role", "alert");
    state.append(
      createElement("p", "hrv-eyebrow", "The gallery needs a moment"),
      createElement("h1", "hrv-state__title", "We couldn’t open the photo album."),
      createElement("p", "hrv-state__copy", message),
    );
    const retry = createElement("button", "hrv-button", "Try again");
    retry.type = "button";
    retry.addEventListener("click", () => void this.start());
    state.append(retry);
    this.root.replaceChildren(state);
  }

  private renderShell(cachedAt: string | null): void {
    this.root.dataset.state = "ready";
    this.root.removeAttribute("aria-busy");
    const skip = createElement("a", "hrv-skip-link", "Skip to photo album content");
    skip.href = "#hrv-photo-album-main";

    const shell = createElement("div", "hrv-shell");
    const header = createElement("header", "hrv-site-header");
    const headerInner = createElement("div", "hrv-site-header__inner");
    const brand = createRouteLink("Hughes Room Views", { name: "home" }, "hrv-brand");
    const brandMark = createElement("span", "hrv-brand__mark", "✦");
    brandMark.setAttribute("aria-hidden", "true");
    brand.prepend(brandMark);

    this.nav = createElement("nav", "hrv-nav");
    this.nav.setAttribute("aria-label", "Photo album");
    this.nav.append(
      createRouteLink("Featured", { name: "home" }, "hrv-nav__link"),
      createRouteLink("View All", { name: "all", albumIds: [] }, "hrv-nav__link"),
      createRouteLink("Previous Years", { name: "years" }, "hrv-nav__link"),
    );
    headerInner.append(brand, this.nav);
    header.append(headerInner);
    shell.append(header);

    if (cachedAt) {
      const notice = createElement("div", "hrv-notice");
      notice.setAttribute("role", "status");
      const time = new Date(cachedAt);
      const timestamp = Number.isNaN(time.valueOf()) ? "an earlier visit" : time.toLocaleString();
      notice.textContent = `Showing the last available album from ${timestamp} while the live gallery reconnects.`;
      shell.append(notice);
    }

    const hasDataWarnings = (this.manifest?.warnings.length ?? 0) > 0 || (this.collection?.orphanedPhotoCount ?? 0) > 0;
    if (hasDataWarnings) {
      const notice = createElement("div", "hrv-notice hrv-notice--soft", "Some album items could not be displayed safely.");
      notice.setAttribute("role", "status");
      shell.append(notice);
    }

    this.main = createElement("main", "hrv-main");
    this.main.id = "hrv-photo-album-main";
    this.main.tabIndex = -1;
    shell.append(this.main);
    this.root.replaceChildren(skip, shell);
    if (this.layout === "viewport") this.updateViewportWidth();
    this.lightbox = new PhotoLightbox(this.root);
  }

  private renderRoute(route: AppRoute): void {
    if (!this.main || !this.manifest || !this.collection) return;
    this.viewCleanup?.();
    this.viewCleanup = null;
    this.main.replaceChildren();
    this.updateNavigation(route);

    if (route.name === "home") this.renderHome();
    else if (route.name === "all") this.renderAll(route.albumIds);
    else if (route.name === "album") this.renderAlbum(route.albumId);
    else this.renderPreviousYears();

    if (this.previousRouteName !== null && this.previousRouteName !== route.name) {
      window.requestAnimationFrame(() => this.main?.querySelector<HTMLElement>("h1")?.focus());
    }
    if (this.layout === "viewport") {
      window.requestAnimationFrame(() => this.updateViewportWidth());
    }
    this.previousRouteName = route.name;
  }

  private updateNavigation(route: AppRoute): void {
    for (const link of this.nav?.querySelectorAll<HTMLAnchorElement>("[data-route]") ?? []) {
      if (link.dataset.route === route.name || (route.name === "album" && link.dataset.route === "all")) {
        link.setAttribute("aria-current", "page");
      } else {
        link.removeAttribute("aria-current");
      }
    }
  }

  private renderHome(): void {
    if (!this.main || !this.manifest || !this.collection) return;
    const cleanups: Cleanup[] = [];
    if (this.collection.photos.length > 0) {
      const heroMount = createElement("section");
      this.main.append(heroMount);
      const carousel = new HeroCarousel(
        heroMount,
        this.collection.photos,
        schoolYearLabel(this.manifest.schoolYear),
        (photo) => this.openPhoto(this.collection?.photos ?? [], photo),
      );
      cleanups.push(() => carousel.destroy());
    } else {
      this.main.append(this.createEmptyState(
        "A new year of memories starts here",
        "Albums will appear as soon as the current school year has published photographs.",
      ));
    }

    const albumsSection = createElement("section", "hrv-section hrv-albums-section");
    albumsSection.setAttribute("aria-labelledby", "hrv-current-albums-title");
    const sectionHeading = createElement("div", "hrv-section-heading");
    const headingCopy = createElement("div");
    headingCopy.append(
      createElement("p", "hrv-eyebrow", "Choose an adventure"),
      createElement("h2", "hrv-section-title", `Current year · ${schoolYearLabel(this.manifest.schoolYear)}`),
    );
    headingCopy.querySelector("h2")!.id = "hrv-current-albums-title";
    const viewAll = createRouteLink("View All Photos", { name: "all", albumIds: [] }, "hrv-button hrv-button--ghost");
    sectionHeading.append(headingCopy, viewAll);
    albumsSection.append(sectionHeading);

    if (this.collection.albums.length > 0) {
      const row = createElement("div", "hrv-album-row");
      for (const album of this.collection.albums) row.append(this.createAlbumCard(album));
      albumsSection.append(row);
    } else {
      albumsSection.append(createElement("p", "hrv-empty__copy", "No current-year albums have been published yet."));
    }
    this.main.append(albumsSection);

    const prior = createElement("section", "hrv-prior-year");
    const priorCopy = createElement("div");
    priorCopy.append(
      createElement("p", "hrv-eyebrow", "The story continues backward"),
      createElement("h2", "hrv-prior-year__title", "Previous Year Memories"),
      createElement("p", "hrv-prior-year__copy", "A permanent doorway is ready for historical albums when their manifests are published."),
    );
    prior.append(priorCopy, createRouteLink("Explore previous years", { name: "years" }, "hrv-button hrv-button--light"));
    this.main.append(prior);
    this.viewCleanup = () => cleanups.forEach((cleanup) => cleanup());
  }

  private createAlbumCard(album: AlbumViewModel): HTMLAnchorElement {
    const card = createRouteLink(album.name, { name: "album", albumId: album.id }, "hrv-album-card");
    card.dataset.theme = album.theme;
    card.setAttribute("aria-label", `Open ${album.name}, ${album.photos.length} photos`);

    const media = createElement("span", "hrv-album-card__media");
    const cover = album.photos[0];
    if (cover) {
      const image = createElement("img", "hrv-album-card__image");
      image.src = cover.galleryUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      media.append(image);
    } else {
      media.append(createElement("span", "hrv-album-card__placeholder", "A new memory is on its way"));
    }

    if (album.theme !== "memory") {
      const ornament = createElement("img", "hrv-album-card__ornament");
      ornament.src = ORNAMENT_URLS[album.theme];
      ornament.alt = "";
      ornament.setAttribute("aria-hidden", "true");
      media.append(ornament);
    }

    const body = createElement("span", "hrv-album-card__body");
    body.append(
      createElement("strong", "hrv-album-card__title", album.name),
      createElement("span", "hrv-album-card__count", `${album.photos.length} ${album.photos.length === 1 ? "photo" : "photos"}`),
    );
    card.replaceChildren(media, body);
    return card;
  }

  private renderAll(requestedAlbumIds: string[]): void {
    if (!this.main || !this.collection || !this.router) return;
    const knownIds = new Set(this.collection.albums.map((album) => album.id));
    const selected = requestedAlbumIds.filter((id) => knownIds.has(id));
    const selectedSet = new Set(selected);
    const photos = selected.length === 0
      ? this.collection.photos
      : this.collection.albums.filter((album) => selectedSet.has(album.id)).flatMap((album) => album.photos);

    const header = this.createGalleryHeader(
      "All classroom memories",
      selected.length === 0 ? "Every published album in the current school year." : "Showing the albums you selected.",
    );
    this.main.append(header);

    const filters = createElement("div", "hrv-filter-bar");
    filters.setAttribute("role", "group");
    filters.setAttribute("aria-label", "Filter photos by album");
    const all = createElement("button", "hrv-filter-chip", "All");
    all.type = "button";
    all.setAttribute("aria-pressed", String(selected.length === 0));
    all.addEventListener("click", () => this.router?.navigate({ name: "all", albumIds: [] }));
    filters.append(all);
    for (const album of this.collection.albums) {
      const chip = createElement("button", "hrv-filter-chip", album.name);
      chip.type = "button";
      chip.dataset.theme = album.theme;
      chip.setAttribute("aria-pressed", String(selectedSet.has(album.id)));
      chip.addEventListener("click", () => {
        const next = new Set(selectedSet);
        if (next.has(album.id)) next.delete(album.id);
        else next.add(album.id);
        this.router?.navigate({ name: "all", albumIds: [...next] });
      });
      filters.append(chip);
    }
    this.main.append(filters);
    this.mountGallery(photos, "No photos match the selected albums.");
  }

  private renderAlbum(albumId: string): void {
    if (!this.main || !this.collection) return;
    const album = this.collection.albums.find((candidate) => candidate.id === albumId);
    if (!album) {
      const state = this.createEmptyState("That album isn’t available", "It may have moved or may not be published yet.");
      state.append(createRouteLink("Return to current albums", { name: "home" }, "hrv-button"));
      this.main.append(state);
      return;
    }
    const header = this.createGalleryHeader(album.name, `${album.photos.length} ${album.photos.length === 1 ? "memory" : "memories"}`);
    header.dataset.theme = album.theme;
    header.prepend(createRouteLink("← Current albums", { name: "home" }, "hrv-back-link"));
    this.main.append(header);
    this.mountGallery(album.photos, "This album is ready, but no photos have been published into it yet.");
  }

  private createGalleryHeader(title: string, copy: string): HTMLElement {
    const header = createElement("header", "hrv-gallery-header");
    const heading = createElement("h1", "hrv-gallery-header__title", title);
    heading.tabIndex = -1;
    header.append(createElement("p", "hrv-eyebrow", "Hughes Room Views Photo Album"), heading, createElement("p", "hrv-gallery-header__copy", copy));
    return header;
  }

  private mountGallery(photos: readonly PhotoRecord[], emptyMessage: string): void {
    if (!this.main) return;
    const mount = createElement("section", "hrv-gallery");
    mount.setAttribute("aria-label", "Photos");
    this.main.append(mount);
    const grid = new PhotoGrid(mount, photos, {
      emptyMessage,
      onOpen: (index, button) => this.lightbox?.open(photos, index, button, (returnIndex) => grid.focusItem(returnIndex)),
    });
    this.viewCleanup = () => grid.destroy();
  }

  private renderPreviousYears(): void {
    if (!this.main) return;
    const header = this.createGalleryHeader(
      "Previous Year Memories",
      "Historical browsing has a permanent home here without assuming albums that have not been published.",
    );
    this.main.append(header);
    const state = this.createEmptyState(
      "The archive doorway is ready",
      "Previous-year albums will appear here when a historical manifest is available. Nothing has been invented or pulled from an unapproved source.",
    );
    state.append(createRouteLink("Return to current memories", { name: "home" }, "hrv-button"));
    this.main.append(state);
  }

  private createEmptyState(title: string, copy: string): HTMLElement {
    const state = createElement("section", "hrv-empty");
    state.append(
      createElement("span", "hrv-empty__sparkle", "✦"),
      createElement("h1", "hrv-empty__title", title),
      createElement("p", "hrv-empty__copy", copy),
    );
    state.querySelector(".hrv-empty__sparkle")?.setAttribute("aria-hidden", "true");
    state.querySelector<HTMLElement>("h1")!.tabIndex = -1;
    return state;
  }

  private openPhoto(photos: readonly PhotoRecord[], photo: PhotoRecord): void {
    const index = photos.findIndex((candidate) => candidate.id === photo.id);
    if (index >= 0) this.lightbox?.open(photos, index, document.activeElement as HTMLElement | null);
  }
}
