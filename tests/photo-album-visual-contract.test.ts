import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";
import { PHOTO_ALBUM_THEME_RECIPES } from "../apps/photo-album/src/theme-recipes";
import { themeForAlbumName } from "../apps/photo-album/src/domain/albums";

const read = (path: string): string => readFileSync(new URL(`../${path}`, import.meta.url), "utf8");

describe("Photo Album visual completion contract", () => {
  it("maps the four synthetic visual albums deliberately and keeps unknown albums neutral", () => {
    expect(themeForAlbumName("TEST - Pumpkin Patch")).toBe("harvest");
    expect(themeForAlbumName("TEST - Science Museum")).toBe("discovery");
    expect(themeForAlbumName("TEST - Mushroom Exploration")).toBe("woodland");
    expect(themeForAlbumName("TEST - Zinnia Garden")).toBe("garden");
    expect(themeForAlbumName("Night Sky & Constellations")).toBe("constellation");
    expect(themeForAlbumName("A Completely New Classroom Event")).toBe("memory");
  });

  it("records only approved NL runtime URLs in visual recipes", () => {
    for (const recipe of Object.values(PHOTO_ALBUM_THEME_RECIPES)) {
      for (const assets of Object.values(recipe.slots)) {
        for (const asset of assets) {
          expect(asset.id.length).toBeGreaterThan(3);
          expect(asset.url.startsWith("https://cdn.nlightlabs.com/")).toBe(true);
        }
      }
    }
  });

  it("uses only the clean visual CSS stack and contains no app-owned reduced-motion branch", () => {
    const entry = read("apps/photo-album/src/entry.ts");
    const visualCss = read("apps/photo-album/src/styles/photo-album-complete.css");
    const lightboxCss = read("apps/photo-album/src/styles/lightbox-themes.css");
    const hostCss = read("apps/photo-album/src/styles/host-compat.css");

    expect(entry).toContain("photo-album-complete.css");
    expect(entry).toContain("host-compat.css");
    expect(entry).not.toContain("temporary-launch-bridge.css");
    expect(entry).not.toContain("album-card-refinement.css");
    expect(entry).not.toContain("carousel-refinement.css");

    for (const source of [entry, visualCss, lightboxCss, hostCss]) {
      expect(source).not.toContain("prefers-reduced-motion");
    }
  });

  it("keeps host breakout in repository-owned, mount-scoped compatibility CSS", () => {
    const hostCss = read("apps/photo-album/src/styles/host-compat.css");
    expect(hostCss).toContain("body:has(#hrv-photo-album.hrv-photo-album)");
    expect(hostCss).toContain("#content.site-content.container");
    expect(hostCss).toContain("#primary.content-area");
    expect(hostCss).toContain("100dvw");
  });

  it("targets five compact album columns at the wide reference canvas", () => {
    const visualCss = read("apps/photo-album/src/styles/photo-album-complete.css");
    expect(visualCss).toContain("grid-template-columns: repeat(5, minmax(0, 292px));");
    expect(visualCss).toContain("@media (max-width: 1640px)");
  });
});
