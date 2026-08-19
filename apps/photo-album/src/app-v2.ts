import { PhotoLightbox } from "./components/lightbox";
import { PhotoGrid } from "./components/photo-grid";
import { YearHomeV2 } from "./components/year-home-v2";
import type { PhotoAlbumOptions } from "./config";
import { DEFAULT_MANIFEST_URL, DEFAULT_YEAR_CATALOG_URL } from "./config";
import { loadManifest } from "./data/manifest";
import { loadYearCatalog, type PhotoYearCatalog, type PhotoYearDescriptor } from "./data/year-catalog";
import { buildAlbumCollection } from "./domain/albums";
import { applyThemeAssets, recipeForTheme } from "./theme-recipes";
import { PhotoAlbumRouter, routeHref, type PhotoAlbumRoute } from "./runtime/router-v2";
import type { AlbumCollection, PhotoAlbumManifest, PhotoRecord } from "./types";
import { createElement } from "./utils/dom";

type Cleanup = () => void;

interface LoadedYear {
  descriptor: PhotoYearDescriptor;
  manifest: PhotoAlbumManifest;
  collection: AlbumCollection;
}

function schoolYearLabel(schoolYear: string): string {
  return schoolYear.replace(/-/g, "–");
}

export class PhotoAlbumAppV2 {
  private readonly manifestUrl: string;
  private readonly yearCatalogUrl: string;
  private readonly layout: "contained" | "viewport";
  private readonly root: HTMLElement;
  private readonly yearCache = new Map<string, LoadedYear>();
  private main: HTMLElement | null = null;
  private nav: HTMLElement | null = null;
  private router: PhotoAlbumRouter | null = null;
  private lightbox: PhotoLightbox | null = null;
  private currentManifest: PhotoAlbumManifest | null = null;
  private catalog: PhotoYearCatalog | null = null;
  private viewCleanup: Cleanup | null = null;
  private destroyed = false;
  private renderGeneration = 0;

  constructor(root: HTMLElement, options: PhotoAlbumOptions = {}) {
    this.root = root;
    this.manifestUrl = options.manifestUrl ?? DEFAULT_MANIFEST_URL;
    this.yearCatalogUrl = options.yearCatalogUrl ?? DEFAULT_YEAR_CATALOG_URL;
    this.layout = options.layout ?? "viewport";
  }

  async start(): Promise<void> {
    this.prepareRoot();
    this.renderLoading("Gathering classroom memories…");

    try {
      const loaded = await loadManifest(this.manifestUrl);
      if (this.destroyed) return;
      this.currentManifest = loaded.manifest;
      this.catalog = await loadYearCatalog(this.yearCatalogUrl, this.manifestUrl, loaded.manifest);
      if (this.destroyed) return;

      const currentDescriptor = this.currentYearDescriptor();
      this.yearCache.set(loaded.manifest.schoolYear, {
        descriptor: currentDescriptor,
        manifest: loaded.manifest,
        collection: buildAlbumCollection(loaded.manifest),
      });

      this.renderShell(loaded.origin === "cache" ? loaded.cachedAt : null);
      this.router = new PhotoAlbumRouter((route) => void this.renderRoute(route));
      this.router.start();
    } catch (error) {
      if (!this.destroyed) {
        this.renderFatalError(error instanceof Error ? error.message : "The album could not be loaded.");
      }
    }
  }

  destroy(): void {
    this.destroyed = true;
    this.renderGeneration += 1;
    this.viewCleanup?.();
    this.lightbox?.destroy();
    this.router?.stop();
    window.removeEventListener("resize", this.updateViewportWidth);
    this.root.replaceChildren();
    this.root.classList.remove("hrv-photo-album", "hrv-photo-album-v2");
    delete this.root.dataset.layout;
    delete this.root.dataset.state;
    this.root.style.removeProperty("--hrv-viewport-width");
  }

  private prepareRoot(): void {
    this.root.classList.add("hrv-photo-album", "hrv-photo-album-v2");
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

  private renderLoading(message: string): void {
    const state = createElement("div", "hrv-state hrv-state--loading");
    state.setAttribute("role", "status");
    const sparkle = createElement("span", "hrv-loading-sparkle", "✦");
    sparkle.setAttribute("aria-hidden", "true");
    state.append(sparkle, createElement("p", "hrv-state__title", message));
    this.root.replaceChildren(state);
  }

  private renderFatalError(message: string): void {
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
    const brand = this.createRouteLink("Hughes Room Views", { name: "home" }, "hrv-brand");
    const brandMark = createElement("span", "hrv-brand__mark", "✦");
    brandMark.setAttribute("aria-hidden", "true");
    brand.prepend(brandMark);

    this.nav = createElement("nav", "hrv-nav");
    this.nav.setAttribute("aria-label", "Photo album");
    this.nav.append(
      this.createRouteLink("Featured", { name: "home" }, "hrv-nav__link"),
      this.createRouteLink("View All", { name: "all", albumIds: [] }, "hrv-nav__link"),
      this.createRouteLink("Years", { name: "years" }, "hrv-nav__link"),
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

    this.main = createElement("main", "hrv-main");
    this.main.id = "hrv-photo-album-main";
    this.main.tabIndex = -1;
    shell.append(this.main);
    this.root.replaceChildren(skip, shell);
    if (this.layout === "viewport") this.updateViewportWidth();
    this.lightbox = new PhotoLightbox(this.root);
  }

  private async renderRoute(route: PhotoAlbumRoute): Promise<void> {
    if (!this.main || !this.catalog) return;
    const generation = ++this.renderGeneration;
    this.viewCleanup?.();
    this.viewCleanup = null;
    this.main.replaceChildren();
    this.updateNavigation(route);

    try {
      if (route.name === "years") {
        this.renderYearsIndex();
      } else {
        const schoolYear = "schoolYear" in route ? route.schoolYear : this.catalog.currentSchoolYear;
        const year = await this.loadYear(schoolYear);
        if (this.destroyed || generation !== this.renderGeneration) return;

        if (route.name === "home" || route.name === "year") {
          this.renderYearHome(year);
        } else if (route.name === "all" || route.name === "year-all") {
          this.renderAll(year, route.albumIds);
        } else {
          this.renderAlbum(year, route.albumId);
        }
      }
    } catch (error) {
      if (this.destroyed || generation !== this.renderGeneration) return;
      this.renderRouteError(error instanceof Error ? error.message : "That school year could not be opened.");
    }

    window.requestAnimationFrame(() => {
      this.main?.querySelector<HTMLElement>("h1")?.focus();
      if (this.layout === "viewport") this.updateViewportWidth();
    });
  }

  private currentYearDescriptor(): PhotoYearDescriptor {
    if (!this.currentManifest) throw new Error("Current manifest is not loaded.");
    return this.catalog?.years.find((year) => year.schoolYear === this.currentManifest?.schoolYear) ?? {
      schoolYear: this.currentManifest.schoolYear,
      label: schoolYearLabel(this.currentManifest.schoolYear),
      manifestUrl: this.manifestUrl,
      kind: "current",
    };
  }

  private previousYearDescriptor(): PhotoYearDescriptor | null {
    if (!this.catalog) return null;
    return this.catalog.years.find((year) => year.kind === "archive") ?? null;
  }

  private async loadYear(schoolYear: string): Promise<LoadedYear> {
    const cached = this.yearCache.get(schoolYear);
    if (cached) return cached;
    if (!this.catalog) throw new Error("The school-year catalog is unavailable.");

    const descriptor = this.catalog.years.find((year) => year.schoolYear === schoolYear);
    if (!descriptor) throw new Error("That school year is not published in the Photo Album yet.");

    if (this.main) {
      const state = createElement("section", "hrv-state hrv-state--loading");
      state.setAttribute("role", "status");
      state.append(
        createElement("span", "hrv-loading-sparkle", "✦"),
        createElement("p", "hrv-state__title", `Opening ${descriptor.label} memories…`),
      );
      this.main.replaceChildren(state);
    }

    const loaded = await loadManifest(descriptor.manifestUrl);
    if (loaded.manifest.schoolYear !== descriptor.schoolYear) {
      throw new Error(`The ${descriptor.label} archive manifest identifies a different school year.`);
    }
    const year: LoadedYear = {
      descriptor,
      manifest: loaded.manifest,
      collection: buildAlbumCollection(loaded.manifest),
    };
    this.yearCache.set(schoolYear, year);
    return year;
  }

  private renderYearHome(year: LoadedYear): void {
    if (!this.main) return;
    const mount = createElement("div");
    this.main.append(mount);
    const home = new YearHomeV2(mount, {
      manifest: year.manifest,
      collection: year.collection,
      kind: year.descriptor.kind,
      previousYear: this.previousYearDescriptor(),
      currentYear: this.currentYearDescriptor(),
      createLink: (label, route, className) => this.createRouteLink(label, route, className),
      openPhoto: (photos, photo) => this.openPhoto(photos, photo),
    });
    this.viewCleanup = () => home.destroy();
  }

  private renderYearsIndex(): void {
    if (!this.main || !this.catalog) return;
    const section = createElement("section", "hrv-v2-years");
    const heading = createElement("div", "hrv-v2-years__heading");
    const title = createElement("h1", "hrv-v2-years__title", "Photo Album Years");
    title.tabIndex = -1;
    heading.append(
      createElement("p", "hrv-v2-eyebrow", "Every year keeps its own front door"),
      title,
      createElement("p", "hrv-v2-years__copy", "Choose a school year to open the same Photo Album experience with that year’s photographs and albums."),
    );
    section.append(heading);

    const grid = createElement("div", "hrv-v2-years__grid");
    for (const year of this.catalog.years) {
      const route: PhotoAlbumRoute = year.kind === "current" ? { name: "home" } : { name: "year", schoolYear: year.schoolYear };
      const card = this.createRouteLink(year.label, route, "hrv-v2-year-card");
      card.dataset.kind = year.kind;
      card.append(
        createElement("span", "hrv-v2-year-card__spark", "✦"),
        createElement("span", "hrv-v2-year-card__label", year.label),
        createElement("span", "hrv-v2-year-card__kind", year.kind === "current" ? "Current year" : "Open archive"),
        createElement("span", "hrv-v2-year-card__arrow", "›"),
      );
      grid.append(card);
    }
    section.append(grid);

    if (this.catalog.years.length === 1) {
      section.append(
        createElement(
          "p",
          "hrv-v2-years__notice",
          "The archive renderer is ready. Historical years will appear here as soon as the public year catalog is published.",
        ),
      );
    }
    this.main.append(section);
  }

  private renderAll(year: LoadedYear, requestedAlbumIds: string[]): void {
    if (!this.main || !this.router) return;
    const knownIds = new Set(year.collection.albums.map((album) => album.id));
    const selected = requestedAlbumIds.filter((id) => knownIds.has(id));
    const selectedSet = new Set(selected);
    const photos = selected.length === 0
      ? year.collection.photos
      : year.collection.albums.filter((album) => selectedSet.has(album.id)).flatMap((album) => album.photos);

    const header = this.createGalleryHeader(
      `All ${schoolYearLabel(year.manifest.schoolYear)} memories`,
      selected.length === 0 ? "Every published album in this school year." : "Showing the albums you selected.",
      year,
    );
    this.main.append(header);

    const filters = createElement("div", "hrv-filter-bar");
    filters.setAttribute("role", "group");
    filters.setAttribute("aria-label", "Filter photos by album");
    const all = createElement("button", "hrv-filter-chip", "All");
    all.type = "button";
    all.setAttribute("aria-pressed", String(selected.length === 0));
    all.addEventListener("click", () => this.router?.navigate(this.allRoute(year, [])));
    filters.append(all);

    for (const album of year.collection.albums) {
      const chip = createElement("button", "hrv-filter-chip", album.name);
      chip.type = "button";
      chip.dataset.theme = album.theme;
      chip.setAttribute("aria-pressed", String(selectedSet.has(album.id)));
      chip.addEventListener("click", () => {
        const next = new Set(selectedSet);
        if (next.has(album.id)) next.delete(album.id);
        else next.add(album.id);
        this.router?.navigate(this.allRoute(year, [...next]));
      });
      filters.append(chip);
    }
    this.main.append(filters);
    this.mountGallery(photos, "No photos match the selected albums.");
  }

  private renderAlbum(year: LoadedYear, albumId: string): void {
    if (!this.main) return;
    const album = year.collection.albums.find((candidate) => candidate.id === albumId);
    if (!album) {
      this.renderRouteError("That album is not published for this school year.");
      return;
    }

    const homeRoute: PhotoAlbumRoute = year.descriptor.kind === "current"
      ? { name: "home" }
      : { name: "year", schoolYear: year.manifest.schoolYear };
    const header = this.createGalleryHeader(
      album.name,
      `${album.photos.length} ${album.photos.length === 1 ? "memory" : "memories"}`,
      year,
    );
    applyThemeAssets(header, album.theme);
    const recipe = recipeForTheme(album.theme);
    const themeLabel = createElement("p", "hrv-gallery-header__theme-label", recipe.label);
    const headerArt = createElement("div", "hrv-gallery-header__art");
    headerArt.setAttribute("aria-hidden", "true");
    headerArt.append(
      createElement("span", "hrv-gallery-header__art-layer hrv-gallery-header__art-layer--secondary"),
      createElement("span", "hrv-gallery-header__art-layer hrv-gallery-header__art-layer--primary"),
    );
    header.append(themeLabel, headerArt);

    const gallery = createElement("section", "hrv-gallery");
    gallery.setAttribute("aria-label", "Photos");
    applyThemeAssets(gallery, album.theme);
    const grid = new PhotoGrid(gallery, album.photos, {
      emptyMessage: "This album is ready, but no photos have been published into it yet.",
      onOpen: (index, button) => this.lightbox?.open(album.photos, index, button, (returnIndex) => grid.focusItem(returnIndex)),
    });

    const albumReturn = createElement("section", "hrv-album-return");
    applyThemeAssets(albumReturn, album.theme);
    const returnArt = createElement("span", "hrv-album-return__art");
    returnArt.setAttribute("aria-hidden", "true");
    const returnCopy = createElement("div", "hrv-album-return__copy");
    returnCopy.append(
      createElement("p", "hrv-eyebrow", "Close this album"),
      createElement("h2", "hrv-album-return__title", "Back to the memory shelf"),
      createElement("p", "hrv-album-return__text", `Return to ${year.descriptor.label} and choose another classroom adventure.`),
    );
    albumReturn.append(
      returnArt,
      returnCopy,
      this.createRouteLink(
        `Back to ${year.descriptor.label} albums`,
        homeRoute,
        "hrv-button hrv-button--memory",
      ),
    );

    this.main.append(header, gallery, albumReturn);
    this.viewCleanup = () => grid.destroy();
  }

  private createGalleryHeader(titleText: string, copy: string, year: LoadedYear): HTMLElement {
    const header = createElement("header", "hrv-gallery-header");
    const title = createElement("h1", "hrv-gallery-header__title", titleText);
    title.tabIndex = -1;
    const homeRoute: PhotoAlbumRoute = year.descriptor.kind === "current"
      ? { name: "home" }
      : { name: "year", schoolYear: year.manifest.schoolYear };
    header.append(
      this.createRouteLink(`← ${year.descriptor.label} album home`, homeRoute, "hrv-back-link"),
      createElement("p", "hrv-eyebrow", `${year.descriptor.label} Hughes Room Views Photo Album`),
      title,
      createElement("p", "hrv-gallery-header__copy", copy),
    );
    return header;
  }

  private allRoute(year: LoadedYear, albumIds: string[]): PhotoAlbumRoute {
    return year.descriptor.kind === "current"
      ? { name: "all", albumIds }
      : { name: "year-all", schoolYear: year.manifest.schoolYear, albumIds };
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

  private renderRouteError(message: string): void {
    if (!this.main) return;
    const state = createElement("section", "hrv-empty");
    const title = createElement("h1", "hrv-empty__title", "That memory doorway isn’t ready.");
    title.tabIndex = -1;
    state.append(
      createElement("span", "hrv-empty__sparkle", "✦"),
      title,
      createElement("p", "hrv-empty__copy", message),
      this.createRouteLink("Return to current memories", { name: "home" }, "hrv-button"),
    );
    this.main.replaceChildren(state);
  }

  private createRouteLink(label: string, route: PhotoAlbumRoute, className: string): HTMLAnchorElement {
    const link = createElement("a", className, label);
    link.href = routeHref(route);
    link.dataset.route = route.name;
    return link;
  }

  private updateNavigation(route: PhotoAlbumRoute): void {
    const active = route.name === "years"
      ? "years"
      : route.name === "all" || route.name === "album" || route.name === "year-all" || route.name === "year-album"
        ? "all"
        : "home";
    for (const link of this.nav?.querySelectorAll<HTMLAnchorElement>("[data-route]") ?? []) {
      const linkRole = link.dataset.route === "years" ? "years" : link.dataset.route === "all" ? "all" : "home";
      if (linkRole === active) link.setAttribute("aria-current", "page");
      else link.removeAttribute("aria-current");
    }
  }

  private openPhoto(photos: readonly PhotoRecord[], photo: PhotoRecord): void {
    const index = photos.findIndex((candidate) => candidate.id === photo.id);
    if (index >= 0) this.lightbox?.open(photos, index, document.activeElement as HTMLElement | null);
  }
}
