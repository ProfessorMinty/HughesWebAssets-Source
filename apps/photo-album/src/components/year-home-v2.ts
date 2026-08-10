import type { PhotoYearDescriptor } from "../data/year-catalog";
import type { PhotoAlbumRoute } from "../runtime/router-v2";
import type { AlbumCollection, AlbumViewModel, PhotoAlbumManifest, PhotoRecord } from "../types";
import { createElement } from "../utils/dom";
import { MemoryCarouselV2 } from "./memory-carousel-v2";

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

    const hero = createElement("section", "hrv-hero");
    hero.setAttribute("aria-labelledby", "hrv-featured-title");

    const copy = createElement("div", "hrv-hero__copy");
    const eyebrow = createElement(
      "p",
      "hrv-eyebrow",
      kind === "current" ? `${label} classroom memories` : `${label} memory archive`,
    );
    const title = createElement(
      "h1",
      "hrv-hero__title",
      kind === "current" ? "Step inside a year of wonder" : "Step back into a year of wonder",
    );
    title.id = "hrv-featured-title";
    title.tabIndex = -1;
    const description = createElement(
      "p",
      "hrv-hero__description",
      kind === "current"
        ? "A growing gallery of discoveries, field trips, gardens, and small moments worth remembering."
        : "Revisit the photographs, explorations, field trips, and classroom moments that made this school year its own story.",
    );
    copy.append(eyebrow, title, description);

    const memoryMount = createElement("div");
    if (collection.photos.length > 0) {
      this.carousel = new MemoryCarouselV2(memoryMount, collection.photos, (photo) => {
        options.openPhoto(collection.photos, photo);
      });
    } else {
      this.carousel = null;
      memoryMount.classList.add("hrv-carousel", "hrv-v2-memory-empty-wrap");
      memoryMount.append(this.createEmptyMemory(options));
    }

    hero.append(copy, memoryMount);
    mount.append(hero);
    mount.append(this.createAlbumSection(options));
    mount.append(this.createYearDoorway(options));
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
      createElement("p", "hrv-eyebrow", "The first memory is still ahead"),
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
          "hrv-button hrv-button--ghost",
        ),
      );
    }
    return empty;
  }

  private createAlbumSection(options: YearHomeOptions): HTMLElement {
    const { manifest, collection, kind } = options;
    const label = yearLabel(manifest.schoolYear);
    const section = createElement("section", "hrv-section hrv-albums-section");
    section.setAttribute("aria-labelledby", "hrv-current-albums-title");

    const heading = createElement("div", "hrv-section-heading");
    const headingCopy = createElement("div");
    headingCopy.append(
      createElement("p", "hrv-eyebrow", kind === "current" ? "Choose an adventure" : "Open an old chapter"),
      createElement("h2", "hrv-section-title", kind === "current" ? `Current year · ${label}` : `${label} albums`),
    );
    headingCopy.querySelector("h2")!.id = "hrv-current-albums-title";
    heading.append(
      headingCopy,
      options.createLink("View All Photos", yearAllRoute(kind, manifest.schoolYear), "hrv-button hrv-button--ghost"),
    );
    section.append(heading);

    if (collection.albums.length === 0) {
      section.append(
        createElement(
          "p",
          "hrv-empty__copy",
          kind === "current"
            ? "Albums will appear here as this school year begins."
            : "No albums are published for this archived year yet.",
        ),
      );
      return section;
    }

    const row = createElement("div", "hrv-album-row");
    for (const album of collection.albums) {
      row.append(this.createAlbumCard(album, manifest.schoolYear, kind, options));
    }
    section.append(row);
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
      "hrv-album-card",
    );
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

    const body = createElement("span", "hrv-album-card__body");
    body.append(
      createElement("strong", "hrv-album-card__title", album.name),
      createElement(
        "span",
        "hrv-album-card__count",
        `${album.photos.length} ${album.photos.length === 1 ? "photo" : "photos"}`,
      ),
    );

    card.replaceChildren(media, body);
    return card;
  }

  private createYearDoorway(options: YearHomeOptions): HTMLElement {
    const { kind, previousYear, currentYear } = options;
    const prior = createElement("section", "hrv-prior-year");
    const copy = createElement("div");

    if (kind === "current") {
      if (previousYear) {
        copy.append(
          createElement("p", "hrv-eyebrow", "The story continues backward"),
          createElement("h2", "hrv-prior-year__title", `${previousYear.label} Memories`),
          createElement("p", "hrv-prior-year__copy", "Step back into the photographs and classroom adventures from the previous school year."),
        );
        prior.append(
          copy,
          options.createLink(
            "Explore previous year",
            { name: "year", schoolYear: previousYear.schoolYear },
            "hrv-button hrv-button--light",
          ),
        );
      } else {
        copy.append(
          createElement("p", "hrv-eyebrow", "The story continues backward"),
          createElement("h2", "hrv-prior-year__title", "Previous Year Memories"),
          createElement("p", "hrv-prior-year__copy", "Historical albums will appear here as their year manifests are published."),
        );
        prior.append(copy, options.createLink("Browse years", { name: "years" }, "hrv-button hrv-button--light"));
      }
      return prior;
    }

    copy.append(
      createElement("p", "hrv-eyebrow", "Return to the present"),
      createElement("h2", "hrv-prior-year__title", `${currentYear.label} Memories`),
      createElement("p", "hrv-prior-year__copy", "Return to the current school year and the newest classroom memories."),
    );
    prior.append(
      copy,
      options.createLink("Return to current year", { name: "home" }, "hrv-button hrv-button--light"),
    );
    return prior;
  }
}
