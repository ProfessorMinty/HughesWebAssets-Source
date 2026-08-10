import atomUrl from "../assets/ornament-discovery.svg?url";
import flowerUrl from "../assets/ornament-garden.svg?url";
import pumpkinUrl from "../assets/ornament-harvest.svg?url";
import constellationUrl from "../assets/ornament-constellation.svg?url";
import mushroomUrl from "../assets/ornament-woodland.svg?url";
import type { PhotoYearDescriptor } from "../data/year-catalog";
import type { PhotoAlbumRoute } from "../runtime/router-v2";
import type { AlbumCollection, AlbumTheme, AlbumViewModel, PhotoAlbumManifest, PhotoRecord } from "../types";
import { createElement } from "../utils/dom";
import { MemoryCarouselV2 } from "./memory-carousel-v2";

const ORNAMENTS: Record<AlbumTheme, string> = {
  harvest: pumpkinUrl,
  discovery: atomUrl,
  woodland: mushroomUrl,
  garden: flowerUrl,
  constellation: constellationUrl,
};

export interface YearHomeOptions {
  manifest: PhotoAlbumManifest;
  collection: AlbumCollection;
  kind: "current" | "archive";
  previousYear: PhotoYearDescriptor | null;
  currentYear: PhotoYearDescriptor;
  createLink: (label: string, route: PhotoAlbumRoute, className: string) => HTMLAnchorElement;
  openPhoto: (photos: readonly PhotoRecord[], photo: PhotoRecord) => void;
}

function yearLabel(year: string): string {
  return year.replace(/-/g, "–");
}

function yearHomeRoute(kind: "current" | "archive", schoolYear: string): PhotoAlbumRoute {
  return kind === "current" ? { name: "home" } : { name: "year", schoolYear };
}

function yearAllRoute(kind: "current" | "archive", schoolYear: string): PhotoAlbumRoute {
  return kind === "current"
    ? { name: "all", albumIds: [] }
    : { name: "year-all", schoolYear, albumIds: [] };
}

function yearAlbumRoute(kind: "current" | "archive", schoolYear: string, albumId: string): PhotoAlbumRoute {
  return kind === "current"
    ? { name: "album", albumId }
    : { name: "year-album", schoolYear, albumId };
}

export class YearHomeV2 {
  private readonly carousel: MemoryCarouselV2 | null;

  constructor(mount: HTMLElement, options: YearHomeOptions) {
    const { manifest, collection, kind } = options;
    const label = yearLabel(manifest.schoolYear);
    const page = createElement("div", "hrv-v2-home");
    page.dataset.yearKind = kind;
    page.dataset.schoolYear = manifest.schoolYear;

    const hero = createElement("section", "hrv-v2-hero");
    hero.setAttribute("aria-labelledby", "hrv-v2-home-title");
    const copy = createElement("div", "hrv-v2-hero__copy");
    const eyebrow = createElement(
      "p",
      "hrv-v2-eyebrow",
      kind === "current" ? `${label} classroom memories` : `${label} memory archive`,
    );
    const title = createElement(
      "h1",
      "hrv-v2-hero__title",
      kind === "current" ? "Step inside a year of wonder" : "Step back into a year of wonder",
    );
    title.id = "hrv-v2-home-title";
    title.tabIndex = -1;
    const description = createElement(
      "p",
      "hrv-v2-hero__copyline",
      kind === "current"
        ? "A living window into field trips, discoveries, gardens, experiments, and the small classroom moments worth keeping."
        : "Revisit the photographs, explorations, field trips, and classroom moments that made this school year its own story.",
    );
    copy.append(eyebrow, title, description);

    const memoryMount = createElement("div", "hrv-v2-hero__memory");
    if (collection.photos.length > 0) {
      this.carousel = new MemoryCarouselV2(memoryMount, collection.photos, (photo) => {
        options.openPhoto(collection.photos, photo);
      });
    } else {
      this.carousel = null;
      memoryMount.append(this.createEmptyMemory(options));
    }
    hero.append(copy, memoryMount);
    page.append(hero);

    page.append(this.createAlbumSection(options));
    page.append(this.createYearDoorway(options));
    mount.append(page);
  }

  destroy(): void {
    this.carousel?.destroy();
  }

  private createEmptyMemory(options: YearHomeOptions): HTMLElement {
    const empty = createElement("div", "hrv-v2-memory-empty");
    const glow = createElement("span", "hrv-v2-memory-empty__glow", "✦");
    glow.setAttribute("aria-hidden", "true");
    const copy = createElement("div", "hrv-v2-memory-empty__copy");
    copy.append(
      createElement("p", "hrv-v2-eyebrow", "The first memory is still ahead"),
      createElement("h2", "hrv-v2-memory-empty__title", "This year is just getting started."),
      createElement(
        "p",
        "hrv-v2-memory-empty__text",
        "New photographs will appear here as classroom adventures begin.",
      ),
    );
    empty.append(glow, copy);

    if (options.previousYear) {
      empty.append(
        options.createLink(
          `Explore ${options.previousYear.label} memories`,
          { name: "year", schoolYear: options.previousYear.schoolYear },
          "hrv-v2-button hrv-v2-button--glass",
        ),
      );
    }
    return empty;
  }

  private createAlbumSection(options: YearHomeOptions): HTMLElement {
    const { manifest, collection, kind } = options;
    const label = yearLabel(manifest.schoolYear);
    const section = createElement("section", "hrv-v2-albums");
    section.setAttribute("aria-labelledby", "hrv-v2-albums-title");

    const heading = createElement("div", "hrv-v2-section-heading");
    const headingCopy = createElement("div");
    headingCopy.append(
      createElement("p", "hrv-v2-eyebrow", kind === "current" ? "Choose an adventure" : "Open an old chapter"),
      createElement("h2", "hrv-v2-section-title", kind === "current" ? `Current year · ${label}` : `${label} albums`),
    );
    headingCopy.querySelector("h2")!.id = "hrv-v2-albums-title";
    heading.append(
      headingCopy,
      options.createLink("View All Photos", yearAllRoute(kind, manifest.schoolYear), "hrv-v2-button hrv-v2-button--primary"),
    );
    section.append(heading);

    if (collection.albums.length === 0) {
      section.append(
        createElement(
          "p",
          "hrv-v2-albums__empty",
          kind === "current"
            ? "Albums will appear here as this school year begins."
            : "No albums are published for this archived year yet.",
        ),
      );
      return section;
    }

    const grid = createElement("div", "hrv-v2-album-grid");
    for (const album of collection.albums) {
      grid.append(this.createAlbumCard(album, manifest.schoolYear, kind, options));
    }
    section.append(grid);
    return section;
  }

  private createAlbumCard(
    album: AlbumViewModel,
    schoolYear: string,
    kind: "current" | "archive",
    options: YearHomeOptions,
  ): HTMLAnchorElement {
    const card = options.createLink(
      album.name,
      yearAlbumRoute(kind, schoolYear, album.id),
      "hrv-v2-album-card",
    );
    card.dataset.theme = album.theme;
    card.setAttribute("aria-label", `Open ${album.name}, ${album.photos.length} photos`);

    const media = createElement("span", "hrv-v2-album-card__media");
    const cover = album.photos[0];
    if (cover) {
      const image = createElement("img", "hrv-v2-album-card__image");
      image.src = cover.galleryUrl;
      image.alt = "";
      image.loading = "lazy";
      image.decoding = "async";
      media.append(image);
    } else {
      media.append(createElement("span", "hrv-v2-album-card__placeholder", "A memory is on its way"));
    }

    const ornamentLeft = createElement("img", "hrv-v2-album-card__ornament hrv-v2-album-card__ornament--left");
    const ornamentRight = createElement("img", "hrv-v2-album-card__ornament hrv-v2-album-card__ornament--right");
    ornamentLeft.src = ORNAMENTS[album.theme];
    ornamentRight.src = ORNAMENTS[album.theme];
    ornamentLeft.alt = "";
    ornamentRight.alt = "";
    ornamentLeft.setAttribute("aria-hidden", "true");
    ornamentRight.setAttribute("aria-hidden", "true");
    media.append(ornamentLeft, ornamentRight);

    const body = createElement("span", "hrv-v2-album-card__body");
    body.append(
      createElement("strong", "hrv-v2-album-card__title", album.name),
      createElement(
        "span",
        "hrv-v2-album-card__count",
        `${album.photos.length} ${album.photos.length === 1 ? "photo" : "photos"}`,
      ),
    );
    card.append(media, body);
    return card;
  }

  private createYearDoorway(options: YearHomeOptions): HTMLElement {
    const { manifest, kind, previousYear, currentYear } = options;
    const doorway = createElement("section", "hrv-v2-year-doorway");

    if (kind === "current") {
      if (previousYear) {
        const copy = createElement("div", "hrv-v2-year-doorway__copy");
        copy.append(
          createElement("span", "hrv-v2-year-doorway__jewel", "✦"),
          createElement("strong", "hrv-v2-year-doorway__title", `${previousYear.label} Memories`),
          createElement("span", "hrv-v2-year-doorway__subtitle", "View Previous Year"),
        );
        doorway.append(
          copy,
          options.createLink(
            "›",
            { name: "year", schoolYear: previousYear.schoolYear },
            "hrv-v2-year-doorway__action",
          ),
        );
      } else {
        doorway.append(
          createElement("strong", "hrv-v2-year-doorway__title", "Previous Year Memories"),
          options.createLink("Browse Years", { name: "years" }, "hrv-v2-year-doorway__text-link"),
        );
      }
      return doorway;
    }

    const copy = createElement("div", "hrv-v2-year-doorway__copy");
    copy.append(
      createElement("span", "hrv-v2-year-doorway__jewel", "✦"),
      createElement("strong", "hrv-v2-year-doorway__title", `${currentYear.label} Memories`),
      createElement("span", "hrv-v2-year-doorway__subtitle", "Return to the current year"),
    );
    doorway.append(
      copy,
      options.createLink("›", yearHomeRoute("current", currentYear.schoolYear), "hrv-v2-year-doorway__action"),
    );

    const allYears = options.createLink("All years", { name: "years" }, "hrv-v2-year-doorway__text-link");
    allYears.setAttribute("aria-label", `Browse all Photo Album years from ${yearLabel(manifest.schoolYear)}`);
    doorway.append(allYears);
    return doorway;
  }
}
