from pathlib import Path
import re


def must_sub(pattern: str, replacement: str, text: str, label: str, flags: int = 0) -> str:
    updated, count = re.subn(pattern, replacement, text, count=1, flags=flags)
    if count != 1:
        raise SystemExit(f"{label}: expected exactly one source match, found {count}; refusing to guess")
    return updated


# ---------------------------------------------------------------------------
# app-v2: replace the complete known renderAlbum method rather than assuming
# an older intermediate implementation shape.
# ---------------------------------------------------------------------------
path = Path("apps/photo-album/src/app-v2.ts")
text = path.read_text(encoding="utf-8")
if 'import { applyThemeAssets, recipeForTheme } from "./theme-recipes";' not in text:
    text = text.replace(
        'import { buildAlbumCollection } from "./domain/albums";\n',
        'import { buildAlbumCollection } from "./domain/albums";\nimport { applyThemeAssets, recipeForTheme } from "./theme-recipes";\n',
        1,
    )

new_render_album = r'''  private renderAlbum(year: LoadedYear, albumId: string): void {
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
'''
text = must_sub(
    r"  private renderAlbum\(year: LoadedYear, albumId: string\): void \{.*?\n  \}\n\n  private createGalleryHeader",
    new_render_album + "\n  private createGalleryHeader",
    text,
    "app-v2 renderAlbum",
    re.S,
)
path.write_text(text, encoding="utf-8")

# ---------------------------------------------------------------------------
# Home cover image loading/fallback.
# ---------------------------------------------------------------------------
path = Path("apps/photo-album/src/components/year-home-v2.ts")
text = path.read_text(encoding="utf-8")
replacement = r'''    const cover = album.photos[0];
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

    const artBack'''
text = must_sub(
    r"    const cover = album\.photos\[0\];.*?\n\n    const artBack",
    replacement,
    text,
    "home cover block",
    re.S,
)
path.write_text(text, encoding="utf-8")

# ---------------------------------------------------------------------------
# Photo grid: graceful handling of broken current test-media records.
# ---------------------------------------------------------------------------
path = Path("apps/photo-album/src/components/photo-grid.ts")
text = path.read_text(encoding="utf-8")
if 'hrv-photo-grid__item--unavailable' not in text:
    anchor = '''      image.setAttribute("fetchpriority", index < EAGER_IMAGE_COUNT ? "auto" : "low");
      if (image.loading === "lazy") this.preloadObserver?.observe(image);

      button.append(image);
'''
    replacement = '''      image.setAttribute("fetchpriority", index < EAGER_IMAGE_COUNT ? "auto" : "low");
      if (image.loading === "lazy") this.preloadObserver?.observe(image);
      image.addEventListener("error", () => {
        this.preloadObserver?.unobserve(image);
        button.disabled = true;
        item.classList.add("hrv-photo-grid__item--unavailable");
        item.hidden = true;
      });

      button.append(image);
'''
    if anchor not in text:
        raise SystemExit("photo-grid image anchor missing; refusing to guess")
    text = text.replace(anchor, replacement, 1)
path.write_text(text, encoding="utf-8")

# ---------------------------------------------------------------------------
# Current Memories: stop settling on a known broken random image.
# ---------------------------------------------------------------------------
path = Path("apps/photo-album/src/components/memory-carousel-v2.ts")
text = path.read_text(encoding="utf-8")
if "brokenPhotoIds" not in text:
    text = text.replace(
        '  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;\n',
        '  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;\n  private readonly brokenPhotoIds = new Set<string>();\n',
        1,
    )
text = must_sub(
    r"  private photoAtOffset\(offset: number\): PhotoRecord \| null \{.*?\n  \}",
    r'''  private photoAtOffset(offset: number): PhotoRecord | null {
    if (this.photos.length === 0) return null;
    const start = (this.position + offset + this.photos.length) % this.photos.length;
    for (let step = 0; step < this.photos.length; step += 1) {
      const candidate = this.photos[(start + step) % this.photos.length];
      if (candidate && !this.brokenPhotoIds.has(candidate.id)) return candidate;
    }
    return null;
  }''',
    text,
    "carousel photoAtOffset",
    re.S,
)
if "handleImageError(slide)" not in text:
    text = text.replace(
        '''    const slide = { button, image, slot };
    this.applySlot(slide, slot);
''',
        '''    const slide = { button, image, slot };
    image.addEventListener("load", () => button.classList.remove("is-photo-error"));
    image.addEventListener("error", () => this.handleImageError(slide));
    this.applySlot(slide, slot);
''',
        1,
    )
if "private handleImageError" not in text:
    anchor = '''  private updatePhoto(slide: MemorySlide, photo: PhotoRecord): void {
    if (slide.image.src !== photo.galleryUrl) slide.image.src = photo.galleryUrl;
    slide.button.dataset.photoId = photo.id;
  }
'''
    addition = anchor + '''
  private handleImageError(slide: MemorySlide): void {
    const photoId = slide.button.dataset.photoId;
    if (photoId) this.brokenPhotoIds.add(photoId);
    slide.button.classList.add("is-photo-error");
    if (slide.slot !== 0 || this.traveling || this.photos.length <= this.brokenPhotoIds.size) return;
    window.setTimeout(() => {
      if (!this.traveling) this.move("next");
    }, 60);
  }
'''
    if anchor not in text:
        raise SystemExit("carousel updatePhoto anchor missing; refusing to guess")
    text = text.replace(anchor, addition, 1)
path.write_text(text, encoding="utf-8")

# ---------------------------------------------------------------------------
# Lightbox gets the exact same governed visual recipe context.
# ---------------------------------------------------------------------------
path = Path("apps/photo-album/src/components/lightbox.ts")
text = path.read_text(encoding="utf-8")
if 'import { applyThemeAssets } from "../theme-recipes";' not in text:
    text = text.replace(
        'import { themeForAlbumName } from "../domain/albums";\n',
        'import { themeForAlbumName } from "../domain/albums";\nimport { applyThemeAssets } from "../theme-recipes";\n',
        1,
    )
text = text.replace(
    '    this.dialog.dataset.theme = themeForAlbumName(photo.albumName);\n',
    '    applyThemeAssets(this.dialog, themeForAlbumName(photo.albumName));\n',
    1,
)
path.write_text(text, encoding="utf-8")

# ---------------------------------------------------------------------------
# Reuse the already-reviewed four-moment CSS suffix stored in the v1 patch
# rather than maintaining a second giant duplicate text block.
# ---------------------------------------------------------------------------
path = Path("apps/photo-album/src/styles/photo-album-complete.css")
text = path.read_text(encoding="utf-8")
marker = "/* FOUR-MOMENT MAGIC COMPLETION 2026-08-18 */"
if marker not in text:
    control = Path(__file__).with_name("photo-album-magic-completion-patch.py").read_text(encoding="utf-8")
    match = re.search(r"if marker not in text:\n\s+text \+= r'''(.*?)'''\n\npath\.write_text", control, re.S)
    if not match:
        raise SystemExit("Could not extract reviewed four-moment CSS suffix; refusing to guess")
    suffix = match.group(1)
    if marker not in suffix:
        raise SystemExit("Extracted CSS suffix is not the reviewed four-moment block")
    text += suffix
path.write_text(text, encoding="utf-8")

print("Photo Album four-moment magic completion v2 applied.")
