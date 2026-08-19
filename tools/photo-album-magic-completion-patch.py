from pathlib import Path


def replace_once(text: str, old: str, new: str, label: str) -> str:
    if new in text:
        return text
    if old not in text:
        raise SystemExit(f"{label}: expected source anchor missing; refusing to guess")
    return text.replace(old, new, 1)


# app-v2: gallery header art, themed gallery, and explicit return/navigation moment.
path = Path("apps/photo-album/src/app-v2.ts")
text = path.read_text(encoding="utf-8")
text = replace_once(
    text,
    'import { buildAlbumCollection } from "./domain/albums";\n',
    'import { buildAlbumCollection } from "./domain/albums";\nimport { applyThemeAssets, recipeForTheme } from "./theme-recipes";\n',
    "app-v2 import",
)
text = replace_once(
    text,
    '''    const header = this.createGalleryHeader(\n      album.name,\n      `${album.photos.length} memories`,\n      this.routeForYearHome(manifest.schoolYear),\n    );\n    header.dataset.theme = album.theme;\n    const gallery = createElement("section", "hrv-gallery");\n    this.photoGrid = new PhotoGrid(gallery, album.photos, {\n      emptyMessage: "This album does not have any published memories yet.",\n      onOpen: (index, button) => this.lightbox.open(album.photos, index, button, (nextIndex) => this.photoGrid?.focusItem(nextIndex)),\n    });\n    this.main.replaceChildren(header, gallery);\n''',
    '''    const header = this.createGalleryHeader(\n      album.name,\n      `${album.photos.length} memories`,\n      this.routeForYearHome(manifest.schoolYear),\n    );\n    applyThemeAssets(header, album.theme);\n    const recipe = recipeForTheme(album.theme);\n    const themeLabel = createElement("p", "hrv-gallery-header__theme-label", recipe.label);\n    const headerArt = createElement("div", "hrv-gallery-header__art");\n    headerArt.setAttribute("aria-hidden", "true");\n    headerArt.append(\n      createElement("span", "hrv-gallery-header__art-layer hrv-gallery-header__art-layer--secondary"),\n      createElement("span", "hrv-gallery-header__art-layer hrv-gallery-header__art-layer--primary"),\n    );\n    header.append(themeLabel, headerArt);\n\n    const gallery = createElement("section", "hrv-gallery");\n    applyThemeAssets(gallery, album.theme);\n    this.photoGrid = new PhotoGrid(gallery, album.photos, {\n      emptyMessage: "This album does not have any published memories yet.",\n      onOpen: (index, button) => this.lightbox.open(album.photos, index, button, (nextIndex) => this.photoGrid?.focusItem(nextIndex)),\n    });\n\n    const albumReturn = createElement("section", "hrv-album-return");\n    applyThemeAssets(albumReturn, album.theme);\n    const returnArt = createElement("span", "hrv-album-return__art");\n    returnArt.setAttribute("aria-hidden", "true");\n    const returnCopy = createElement("div", "hrv-album-return__copy");\n    returnCopy.append(\n      createElement("p", "hrv-eyebrow", "Close this album"),\n      createElement("h2", "hrv-album-return__title", "Back to the memory shelf"),\n      createElement("p", "hrv-album-return__text", `Return to ${yearLabel(manifest.schoolYear)} and choose another classroom adventure.`),\n    );\n    albumReturn.append(\n      returnArt,\n      returnCopy,\n      this.createLink(\n        `Back to ${yearLabel(manifest.schoolYear)} albums`,\n        this.routeForYearHome(manifest.schoolYear),\n        "hrv-button hrv-button--memory",\n      ),\n    );\n\n    this.main.replaceChildren(header, gallery, albumReturn);\n''',
    "renderAlbum four-moment composition",
)
path.write_text(text, encoding="utf-8")

# Home covers: eager first-class content, and fall through broken synthetic media records.
path = Path("apps/photo-album/src/components/year-home-v2.ts")
text = path.read_text(encoding="utf-8")
text = replace_once(
    text,
    '''    const cover = album.photos[0];\n    if (cover) {\n      const image = createElement("img", "hrv-album-card__image");\n      image.src = cover.galleryUrl;\n      image.alt = "";\n      image.loading = "lazy";\n      image.decoding = "async";\n      media.append(image);\n    } else {\n      media.append(createElement("span", "hrv-album-card__placeholder", "A new memory is on its way"));\n    }\n''',
    '''    const cover = album.photos[0];\n    if (cover) {\n      const image = createElement("img", "hrv-album-card__image");\n      image.alt = "";\n      image.loading = "eager";\n      image.decoding = "async";\n      image.fetchPriority = "auto";\n      let coverIndex = 0;\n      const loadNextCover = (): void => {\n        const candidate = album.photos[coverIndex];\n        coverIndex += 1;\n        if (!candidate) {\n          image.remove();\n          if (!media.querySelector(".hrv-album-card__placeholder")) {\n            media.append(createElement("span", "hrv-album-card__placeholder", "This memory is getting ready"));\n          }\n          return;\n        }\n        image.src = candidate.galleryUrl;\n      };\n      image.addEventListener("error", loadNextCover);\n      image.addEventListener("load", () => image.classList.add("is-loaded"));\n      media.append(image);\n      loadNextCover();\n    } else {\n      media.append(createElement("span", "hrv-album-card__placeholder", "A new memory is on its way"));\n    }\n''',
    "home cover loading",
)
path.write_text(text, encoding="utf-8")

# Grid: failed synthetic media is gracefully withheld instead of rendering gray slabs.
path = Path("apps/photo-album/src/components/photo-grid.ts")
text = path.read_text(encoding="utf-8")
text = replace_once(
    text,
    '''      image.setAttribute("fetchpriority", index < EAGER_IMAGE_COUNT ? "auto" : "low");\n      if (image.loading === "lazy") this.preloadObserver?.observe(image);\n\n      button.append(image);\n''',
    '''      image.setAttribute("fetchpriority", index < EAGER_IMAGE_COUNT ? "auto" : "low");\n      if (image.loading === "lazy") this.preloadObserver?.observe(image);\n      image.addEventListener("error", () => {\n        this.preloadObserver?.unobserve(image);\n        button.disabled = true;\n        item.classList.add("hrv-photo-grid__item--unavailable");\n        item.hidden = true;\n      });\n\n      button.append(image);\n''',
    "grid broken-image handling",
)
path.write_text(text, encoding="utf-8")

# Current Memories: don't park the hero on a broken random test-media record.
path = Path("apps/photo-album/src/components/memory-carousel-v2.ts")
text = path.read_text(encoding="utf-8")
text = replace_once(
    text,
    '  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;\n',
    '  private readonly onOpen: ((photo: PhotoRecord) => void) | undefined;\n  private readonly brokenPhotoIds = new Set<string>();\n',
    "carousel broken-photo field",
)
text = replace_once(
    text,
    '''  private photoAtOffset(offset: number): PhotoRecord | null {\n    if (this.photos.length === 0) return null;\n    const index = (this.position + offset + this.photos.length) % this.photos.length;\n    return this.photos[index] ?? null;\n  }\n''',
    '''  private photoAtOffset(offset: number): PhotoRecord | null {\n    if (this.photos.length === 0) return null;\n    const start = (this.position + offset + this.photos.length) % this.photos.length;\n    for (let step = 0; step < this.photos.length; step += 1) {\n      const candidate = this.photos[(start + step) % this.photos.length];\n      if (candidate && !this.brokenPhotoIds.has(candidate.id)) return candidate;\n    }\n    return null;\n  }\n''',
    "carousel usable-photo lookup",
)
text = replace_once(
    text,
    '''    const slide = { button, image, slot };\n    this.applySlot(slide, slot);\n    button.addEventListener("click", () => this.activateSlide(slide));\n    return slide;\n''',
    '''    const slide = { button, image, slot };\n    image.addEventListener("load", () => button.classList.remove("is-photo-error"));\n    image.addEventListener("error", () => this.handleImageError(slide));\n    this.applySlot(slide, slot);\n    button.addEventListener("click", () => this.activateSlide(slide));\n    return slide;\n''',
    "carousel image listeners",
)
anchor = '''  private updatePhoto(slide: MemorySlide, photo: PhotoRecord): void {\n    if (slide.image.src !== photo.galleryUrl) slide.image.src = photo.galleryUrl;\n    slide.button.dataset.photoId = photo.id;\n  }\n'''
addition = anchor + '''\n  private handleImageError(slide: MemorySlide): void {\n    const photoId = slide.button.dataset.photoId;\n    if (photoId) this.brokenPhotoIds.add(photoId);\n    slide.button.classList.add("is-photo-error");\n    if (slide.slot !== 0 || this.traveling || this.photos.length <= this.brokenPhotoIds.size) return;\n    window.setTimeout(() => {\n      if (!this.traveling) this.move("next");\n    }, 60);\n  }\n'''
text = replace_once(text, anchor, addition, "carousel error method")
path.write_text(text, encoding="utf-8")

# Lightbox inherits exact same recipe context so theme survives without touching photo pixels.
path = Path("apps/photo-album/src/components/lightbox.ts")
text = path.read_text(encoding="utf-8")
text = replace_once(
    text,
    'import { themeForAlbumName } from "../domain/albums";\n',
    'import { themeForAlbumName } from "../domain/albums";\nimport { applyThemeAssets } from "../theme-recipes";\n',
    "lightbox asset import",
)
text = replace_once(
    text,
    '    this.dialog.dataset.theme = themeForAlbumName(photo.albumName);\n',
    '    applyThemeAssets(this.dialog, themeForAlbumName(photo.albumName));\n',
    "lightbox theme context",
)
path.write_text(text, encoding="utf-8")

# Finish the four visual moments with governed art + renderer-generated trim/material/motion.
path = Path("apps/photo-album/src/styles/photo-album-complete.css")
text = path.read_text(encoding="utf-8")
marker = "/* FOUR-MOMENT MAGIC COMPLETION 2026-08-18 */"
if marker not in text:
    text += r'''

/* FOUR-MOMENT MAGIC COMPLETION 2026-08-18 */

.hrv-gallery-header[data-theme] {
  min-height: 244px;
  padding-right: min(29vw, 410px);
}

.hrv-gallery-header__theme-label {
  position: relative;
  z-index: 3;
  display: inline-flex;
  margin-top: 14px !important;
  padding: 6px 10px;
  border: 1px solid color-mix(in srgb, var(--theme-accent) 32%, transparent);
  border-radius: 999px;
  color: color-mix(in srgb, var(--theme-accent) 82%, white) !important;
  background: rgb(2 17 23 / 54%);
  font-size: 10px !important;
  font-weight: 840;
  letter-spacing: .13em;
  text-transform: uppercase;
}

.hrv-gallery-header__art {
  position: absolute;
  z-index: 2;
  top: 28px;
  right: 26px;
  width: min(26vw, 360px);
  height: 190px;
  pointer-events: none;
}

.hrv-gallery-header__art::before {
  position: absolute;
  inset: 18% 4% 4% 18%;
  content: "";
  border-radius: 50%;
  background: radial-gradient(circle, color-mix(in srgb, var(--theme-accent) 18%, transparent), transparent 66%);
  filter: blur(18px);
  animation: hrv-theme-halo 5.4s ease-in-out infinite alternate;
}

.hrv-gallery-header__art-layer {
  position: absolute;
  display: block;
  background-repeat: no-repeat;
  background-position: center;
  background-size: contain;
  filter: drop-shadow(0 16px 20px rgb(0 0 0 / 34%));
}

.hrv-gallery-header__art-layer--secondary {
  inset: 0 32% 34% 0;
  opacity: .38;
  background-image: var(--hrv-theme-art-secondary, none);
  transform: rotate(-7deg);
}

.hrv-gallery-header__art-layer--primary {
  inset: 16% 0 0 28%;
  opacity: .9;
  background-image: var(--hrv-theme-art-primary, none);
  transform: rotate(4deg);
}

.hrv-gallery-header[data-theme="harvest"] .hrv-gallery-header__art-layer--primary { animation: hrv-album-bough 6.5s ease-in-out infinite alternate; }
.hrv-gallery-header[data-theme="discovery"] .hrv-gallery-header__art-layer--primary { animation: hrv-instrument-float 5.4s ease-in-out infinite; }
.hrv-gallery-header[data-theme="woodland"] .hrv-gallery-header__art-layer--primary { animation: hrv-forest-breathe 6.2s ease-in-out infinite alternate; }
.hrv-gallery-header[data-theme="garden"] .hrv-gallery-header__art-layer--primary { transform-origin: 50% 90%; animation: hrv-greenhouse-sway 5.6s ease-in-out infinite alternate; }
.hrv-gallery-header[data-theme="constellation"] .hrv-gallery-header__art-layer--primary { animation: hrv-observatory-orbit 8.4s ease-in-out infinite; }

.hrv-gallery[data-theme] {
  --theme-accent: #72e4d8;
  --theme-accent-2: #9d88e9;
  position: relative;
  padding: 38px 20px 52px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--theme-accent) 17%, transparent);
  border-radius: 32px;
  background:
    linear-gradient(145deg, rgb(2 17 23 / 34%), rgb(2 13 19 / 56%)),
    repeating-linear-gradient(135deg, rgb(255 255 255 / 1.5%) 0 1px, transparent 1px 28px);
  box-shadow: inset 0 1px 0 rgb(255 255 255 / 4%), 0 22px 60px rgb(0 5 8 / 16%);
}

.hrv-gallery[data-theme="harvest"] { --theme-accent: #f5a34b; --theme-accent-2: #b84d31; background: radial-gradient(circle at 8% 12%, rgb(245 163 75 / 8%), transparent 22%), repeating-linear-gradient(0deg, rgb(255 228 187 / 2%) 0 1px, transparent 1px 7px), linear-gradient(145deg, rgb(42 26 16 / 48%), rgb(20 28 21 / 58%)); }
.hrv-gallery[data-theme="discovery"] { --theme-accent: #55e7ff; --theme-accent-2: #8e6fff; background: linear-gradient(90deg, rgb(85 231 255 / 4%) 1px, transparent 1px) 0 0 / 54px 54px, linear-gradient(rgb(85 231 255 / 4%) 1px, transparent 1px) 0 0 / 54px 54px, linear-gradient(145deg, rgb(4 25 49 / 62%), rgb(7 20 43 / 70%)); }
.hrv-gallery[data-theme="woodland"] { --theme-accent: #a9d570; --theme-accent-2: #c890b5; background: radial-gradient(circle at 12% 28%, rgb(169 213 112 / 8%), transparent 27%), repeating-linear-gradient(110deg, rgb(212 232 179 / 2%) 0 2px, transparent 2px 34px), linear-gradient(145deg, rgb(14 31 18 / 65%), rgb(20 26 22 / 70%)); }
.hrv-gallery[data-theme="garden"] { --theme-accent: #ff8fab; --theme-accent-2: #f0c756; background: linear-gradient(112deg, rgb(255 255 255 / 3%) 1px, transparent 1px) 0 0 / 88px 88px, linear-gradient(22deg, rgb(255 255 255 / 2%) 1px, transparent 1px) 0 0 / 88px 88px, radial-gradient(circle at 82% 16%, rgb(255 143 171 / 9%), transparent 25%), linear-gradient(145deg, rgb(10 43 35 / 61%), rgb(15 37 33 / 69%)); }
.hrv-gallery[data-theme="constellation"] { --theme-accent: #7fa6ff; --theme-accent-2: #ac84ff; background: radial-gradient(circle, rgb(219 228 255 / 16%) 0 1px, transparent 1.5px) 0 0 / 73px 73px, radial-gradient(circle at 78% 16%, rgb(127 166 255 / 10%), transparent 26%), linear-gradient(145deg, rgb(7 11 34 / 72%), rgb(13 17 48 / 74%)); }

.hrv-gallery[data-theme]::before,
.hrv-gallery[data-theme]::after {
  position: absolute;
  right: 24px;
  left: 24px;
  height: 2px;
  content: "";
  pointer-events: none;
  background: linear-gradient(90deg, transparent, var(--theme-accent), var(--theme-accent-2), transparent);
  box-shadow: 0 0 16px color-mix(in srgb, var(--theme-accent) 18%, transparent);
}
.hrv-gallery[data-theme]::before { top: 15px; }
.hrv-gallery[data-theme]::after { bottom: 18px; opacity: .62; }

.hrv-gallery[data-theme="harvest"] .hrv-photo-grid__item:nth-child(6n + 2) .hrv-photo-card { transform: rotate(-.35deg); }
.hrv-gallery[data-theme="harvest"] .hrv-photo-grid__item:nth-child(6n + 4) .hrv-photo-card { transform: rotate(.35deg); }
.hrv-photo-card[data-theme="harvest"] { border-color: rgb(238 175 91 / 28%); box-shadow: 0 12px 28px rgb(0 0 0 / 30%), 0 0 0 1px rgb(151 74 38 / 12%); }
.hrv-photo-card[data-theme="discovery"] { border-color: rgb(89 231 255 / 30%); border-radius: 10px; box-shadow: 0 12px 30px rgb(0 0 0 / 32%), 0 0 24px rgb(80 225 255 / 5%); }
.hrv-photo-card[data-theme="discovery"]::before { position: absolute; z-index: 2; inset: 2px; content: ""; border: 1px solid transparent; border-top-color: rgb(85 231 255 / 42%); border-left-color: rgb(85 231 255 / 24%); border-radius: 8px; pointer-events: none; }
.hrv-photo-card[data-theme="woodland"] { border-color: rgb(170 211 116 / 24%); border-radius: 18px 12px 20px 13px; box-shadow: 0 13px 30px rgb(0 0 0 / 33%), 0 0 0 2px rgb(71 92 48 / 10%); }
.hrv-photo-card[data-theme="garden"] { border-color: rgb(255 151 180 / 28%); box-shadow: 0 13px 30px rgb(0 0 0 / 31%), 0 0 0 1px rgb(241 200 90 / 12%); }
.hrv-photo-card[data-theme="constellation"] { border-color: rgb(137 169 255 / 26%); background: #e9e9fb; box-shadow: 0 13px 30px rgb(0 0 0 / 35%), 0 0 24px rgb(104 133 255 / 7%); }
.hrv-photo-grid__item[hidden], .hrv-photo-grid__item--unavailable { display: none !important; }
.hrv-carousel__slide.is-photo-error { opacity: .12 !important; filter: grayscale(.7) brightness(.45) !important; }

.hrv-album-return {
  --theme-accent: #72e4d8;
  --theme-accent-2: #9d88e9;
  position: relative;
  display: grid;
  grid-template-columns: minmax(0, 1fr) auto;
  align-items: center;
  width: min(calc(100% - 36px), 1320px);
  min-height: 150px;
  margin: -28px auto 70px;
  padding: 34px 190px 34px 34px;
  gap: 24px;
  overflow: hidden;
  border: 1px solid color-mix(in srgb, var(--theme-accent) 20%, transparent);
  border-radius: 28px;
  background: radial-gradient(circle at 88% 20%, color-mix(in srgb, var(--theme-accent) 13%, transparent), transparent 32%), linear-gradient(135deg, rgb(6 28 35 / 92%), rgb(12 20 38 / 94%));
  box-shadow: 0 22px 58px rgb(0 4 7 / 27%);
}
.hrv-album-return[data-theme="harvest"] { --theme-accent: #f5a34b; --theme-accent-2: #b84d31; }
.hrv-album-return[data-theme="discovery"] { --theme-accent: #55e7ff; --theme-accent-2: #8e6fff; }
.hrv-album-return[data-theme="woodland"] { --theme-accent: #a9d570; --theme-accent-2: #c890b5; }
.hrv-album-return[data-theme="garden"] { --theme-accent: #ff8fab; --theme-accent-2: #f0c756; }
.hrv-album-return[data-theme="constellation"] { --theme-accent: #7fa6ff; --theme-accent-2: #ac84ff; }
.hrv-album-return__art { position: absolute; right: 18px; bottom: -18px; width: 170px; height: 150px; opacity: .72; pointer-events: none; background-image: var(--hrv-theme-art-primary, none); background-repeat: no-repeat; background-position: center; background-size: contain; filter: drop-shadow(0 14px 16px rgb(0 0 0 / 28%)); animation: hrv-return-art 6.2s ease-in-out infinite alternate; }
.hrv-album-return__copy { position: relative; z-index: 2; max-width: 650px; }
.hrv-album-return__title { margin-top: 5px !important; color: #fff !important; font-family: Georgia, "Times New Roman", serif !important; font-size: clamp(26px, 2.2vw, 38px) !important; font-weight: 500; line-height: 1.04 !important; letter-spacing: -.035em; }
.hrv-album-return__text { margin-top: 7px !important; color: #aec9c7 !important; font-size: 14px !important; }
.hrv-album-return > .hrv-button { position: relative; z-index: 3; }

@media (max-width: 900px) {
  .hrv-gallery-header[data-theme] { min-height: 230px; padding-right: 180px; }
  .hrv-gallery-header__art { top: 48px; right: 12px; width: 180px; height: 150px; opacity: .78; }
  .hrv-gallery[data-theme] { padding: 30px 12px 44px; border-radius: 24px; }
  .hrv-album-return { width: calc(100% - 24px); grid-template-columns: 1fr; padding: 28px 120px 28px 24px; }
  .hrv-album-return__art { right: -8px; width: 130px; }
}

@media (max-width: 560px) {
  .hrv-gallery-header[data-theme] { min-height: 255px; padding-right: 96px; }
  .hrv-gallery-header__art { top: 74px; right: -18px; width: 126px; height: 120px; opacity: .65; }
  .hrv-gallery-header__theme-label { max-width: 80%; }
  .hrv-gallery[data-theme] { width: calc(100% - 12px); padding: 26px 6px 38px; border-radius: 19px; }
  .hrv-gallery[data-theme]::before, .hrv-gallery[data-theme]::after { right: 10px; left: 10px; }
  .hrv-album-return { width: calc(100% - 12px); margin-top: -24px; padding: 26px 18px 115px; border-radius: 22px; }
  .hrv-album-return__art { right: 8px; bottom: -22px; width: 120px; height: 110px; opacity: .62; }
}

@keyframes hrv-theme-halo { to { opacity: .8; transform: scale(1.09) translate3d(-4px, 6px, 0); } }
@keyframes hrv-album-bough { to { transform: rotate(8deg) translate3d(-7px, 5px, 0) scale(1.04); } }
@keyframes hrv-instrument-float { 50% { transform: rotate(-2deg) translate3d(-6px, -9px, 0) scale(1.04); } }
@keyframes hrv-forest-breathe { to { transform: rotate(1deg) translate3d(-5px, -5px, 0) scale(1.035); } }
@keyframes hrv-greenhouse-sway { from { transform: rotate(-4deg) translate3d(0, 2px, 0); } to { transform: rotate(4deg) translate3d(-5px, -5px, 0); } }
@keyframes hrv-observatory-orbit { 50% { transform: rotate(8deg) translate3d(-9px, 6px, 0) scale(1.035); } }
@keyframes hrv-return-art { to { transform: translate3d(-7px, -7px, 0) rotate(3deg) scale(1.04); } }
'''

path.write_text(text, encoding="utf-8")
print("Photo Album four-moment magic patch applied deterministically.")
