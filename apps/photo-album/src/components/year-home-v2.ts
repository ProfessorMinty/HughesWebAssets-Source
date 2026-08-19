import type { PhotoYearDescriptor } from "../data/year-catalog";
import type { PhotoAlbumRoute } from "../runtime/router-v2";
import { applyThemeAssets, recipeForTheme } from "../theme-recipes";
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
    mount.classList.add("hrv-year-home");
    mount.dataset.yearKind = kind;

    const hero = createElement("section", "hrv-memory-stage");
    hero.setAttribute("aria-labelledby", "hrv-featured-title");

    const copy = createElement("div", "hrv-memory-stage__copy");
    const eyebrow = createElement(
      "p",
      "hrv-eyebrow",
      kind === "current" ? `${label} Photo Album` : `${label} Photo Album archive`,
    );
    const title = createElement(
      "h1",
      "hrv-memory-stage__title",
      kind === "current" ? "Current Memories" : `${label} Memories`,
    );
    title.id = "hrv-featured-title";
    title.tabIndex = -1;
    const description = createElement(
      "p",
      "hrv-memory-stage__description",
      kind === "current"
        ? "A living collection of classroom adventures, discoveries, field trips, celebrations, and the small moments worth keeping."
        : "Open the albums from this school year and revisit the classroom moments that made it unforgettable.",
    );
    const glimmer = createElement("span", "hrv-memory-stage__glimmer");
    glimmer.setAttribute("aria-hidden", "true");
    copy.append(eyebrow, title, description, glimmer);

    const memoryMount = createElement("div", "hrv-memory-stage__carousel");
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
    mount.append(hero, this.createAlbumSection(options), this.createYearDoorway(options));
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
      createElement("p", "hrv-v2-memory-empty__text", "New photographs will appear here as classroom adventures begin."),
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
    const section = createElement("section", "hrv-album-shelf");
    section.setAttribute("aria-labelledby", "hrv-current-albums-title");

    const heading = createElement("div", "hrv-album-shelf__heading");
    const headingCopy = createElement("div", "hrv-album-shelf__heading-copy");
    headingCopy.append(
      createElement("p", "hrv-eyebrow", kind === "current" ? "Open an album" : "Open a memory volume"),
      createElement("h2", "hrv-album-shelf__title", kind === "current" ? `Current school year · ${label}` : `${label} albums`),
      createElement(
        "p",
        "hrv-album-shelf__intro",
        kind === "current"
          ? "Each cover opens into its own decorated memory world."
          : "Every album keeps the personality of the day it remembers.",
      ),
    );
    headingCopy.querySelector("h2")!.id = "hrv-current-albums-title";
    heading.append(
      headingCopy,
      options.createLink("View All Photos", yearAllRoute(kind, manifest.schoolYear), "hrv-button hrv-button--memory"),
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
    const card = options.createLink(album.name, yearAlbumRoute(kind, schoolYear, album.id), "hrv-album-card");
    const recipe = recipeForTheme(album.theme);
    applyThemeAssets(card, album.theme);
    card.setAttribute("aria-label", `Open ${album.name}, ${album.photos.length} photos`);

    const portal = createElement("span", "hrv-album-card__portal");
    const media = createElement("span", "hrv-album-card__media");
    const cover = album.photos[0];
    if (cover) {
      const image = createElement("img", "hrv-album-card__image");
      image.alt = "";
      image.loading = "eager";
      image.decoding = "async";
      image.fetchPriority = "auto";
      let coverIndex = 0;
      const loadNextCover = (): void => {
        const candidate = album.photos[coverIndex];
        coverIndex += 1;
        if (!candidate) {
          image.remove();
          if (!media.querySelector(".hrv-album-card__placeholder")) {
            media.append(createElement("span", "hrv-album-card__placeholder", "This memory is getting ready"));
          }
          return;
        }
        image.src = candidate.galleryUrl;
      };
      image.addEventListener("error", loadNextCover);
      image.addEventListener("load", () => image.classList.add("is-loaded"));
      media.append(image);
      loadNextCover();
    } else {
      media.append(createElement("span", "hrv-album-card__placeholder", "A new memory is on its way"));
    }

    const artBack = createElement("span", "hrv-album-card__art hrv-album-card__art--back");
    const artFront = createElement("span", "hrv-album-card__art hrv-album-card__art--front");
    artBack.setAttribute("aria-hidden", "true");
    artFront.setAttribute("aria-hidden", "true");
    const frame = createElement("span", "hrv-album-card__frame");
    frame.setAttribute("aria-hidden", "true");
    portal.append(artBack, media, frame, artFront);

    const body = createElement("span", "hrv-album-card__body");
    const label = createElement("span", "hrv-album-card__theme-label", recipe.label);
    body.append(
      label,
      createElement("strong", "hrv-album-card__title", album.name),
      createElement(
        "span",
        "hrv-album-card__count",
        `${album.photos.length} ${album.photos.length === 1 ? "photo" : "photos"}`,
      ),
      createElement("span", "hrv-album-card__enter", "Open album  →"),
    );

    card.replaceChildren(portal, body);
    return card;
  }

  private createYearDoorway(options: YearHomeOptions): HTMLElement {
    const { kind, previousYear, currentYear } = options;
    const prior = createElement("section", "hrv-year-doorway");
    const copy = createElement("div", "hrv-year-doorway__copy");

    if (kind === "current") {
      if (previousYear) {
        copy.append(
          createElement("p", "hrv-eyebrow", "Memory archive"),
          createElement("h2", "hrv-year-doorway__title", `${previousYear.label} Memories`),
          createElement("p", "hrv-year-doorway__text", "Turn back a year and reopen the albums that came before."),
        );
        prior.append(
          copy,
          options.createLink(
            "Open previous school year",
            { name: "year", schoolYear: previousYear.schoolYear },
            "hrv-button hrv-button--light",
          ),
        );
      } else {
        copy.append(
          createElement("p", "hrv-eyebrow", "Memory archive"),
          createElement("h2", "hrv-year-doorway__title", "Previous School Years"),
          createElement("p", "hrv-year-doorway__text", "Older school years will appear here as their published catalogs come online."),
        );
        prior.append(copy, options.createLink("Browse school years", { name: "years" }, "hrv-button hrv-button--light"));
      }
      return prior;
    }

    copy.append(
      createElement("p", "hrv-eyebrow", "Back to today"),
      createElement("h2", "hrv-year-doorway__title", `${currentYear.label} Memories`),
      createElement("p", "hrv-year-doorway__text", "Return to the newest classroom albums and the memories being made now."),
    );
    prior.append(copy, options.createLink("Return to current year", { name: "home" }, "hrv-button hrv-button--light"));
    return prior;
  }
}
