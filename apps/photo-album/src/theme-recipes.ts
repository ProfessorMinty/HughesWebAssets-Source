import type { AlbumTheme } from "./types";

export type ThemeSlotName =
  | "banner"
  | "top-trim"
  | "bottom-trim"
  | "photo-frame"
  | "corner-accent"
  | "background"
  | "divider"
  | "decorations";

export interface RuntimeThemeAsset {
  id: string;
  url: string;
}

export interface PhotoAlbumThemeRecipe {
  id: AlbumTheme;
  label: string;
  motion: "memory" | "harvest" | "discovery" | "woodland" | "garden" | "constellation";
  slots: Record<ThemeSlotName, readonly RuntimeThemeAsset[]>;
}

const asset = (id: string, url: string): RuntimeThemeAsset => ({ id, url });
const none = [] as const;

const HARVEST_FOREST = asset(
  "autumn-forest-7e0183a203",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/autumn-forest-7e0183a203/autumn-forest-7e0183a203.svg",
);
const HARVEST_SPLENDOR = asset(
  "autumn-splendor-94a8692f6e",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/autumn-splendor-94a8692f6e/autumn-splendor-94a8692f6e.svg",
);
const SCIENCE_MICROSCOPE = asset(
  "microscope-11ddba1106",
  "https://cdn.nlightlabs.com/assets/prop/hero-prop/microscope-11ddba1106/microscope-11ddba1106.webp",
);
const SCIENCE_LINE_MICROSCOPE = asset(
  "microscope-5993ce3a67",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/microscope-5993ce3a67/microscope-5993ce3a67.svg",
);
const WOODLAND_MUSHROOMS = asset(
  "mushrooms-d9549e0535",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/mushrooms-d9549e0535/mushrooms-d9549e0535.webp",
);
const WOODLAND_FOREST = asset(
  "forest-scenery-bb97623951",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/forest-scenery-bb97623951/forest-scenery-bb97623951.svg",
);
const GARDEN_FLOWERS = asset(
  "flower-plants-93bdc61203",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/flower-plants-93bdc61203/flower-plants-93bdc61203.svg",
);
const GARDEN_TRELLIS = asset(
  "plant-trellis-9cfbeab81a",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/plant-trellis-9cfbeab81a/plant-trellis-9cfbeab81a.svg",
);
const CONSTELLATION_MOON = asset(
  "moon-b7752b8c1d",
  "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/moon-b7752b8c1d/moon-b7752b8c1d.svg",
);
const CONSTELLATION_FULL_MOON = asset(
  "full-moon-72e35c84c6",
  "https://cdn.nlightlabs.com/assets/icon/icon/full-moon-72e35c84c6/full-moon-72e35c84c6.webp",
);

export const PHOTO_ALBUM_THEME_RECIPES: Record<AlbumTheme, PhotoAlbumThemeRecipe> = {
  memory: {
    id: "memory",
    label: "Memory Gallery",
    motion: "memory",
    slots: {
      banner: none,
      "top-trim": none,
      "bottom-trim": none,
      "photo-frame": none,
      "corner-accent": none,
      background: none,
      divider: none,
      decorations: none,
    },
  },
  harvest: {
    id: "harvest",
    label: "Autumn Memory Album",
    motion: "harvest",
    slots: {
      banner: [HARVEST_FOREST],
      "top-trim": none,
      "bottom-trim": none,
      "photo-frame": none,
      "corner-accent": [HARVEST_SPLENDOR],
      background: none,
      divider: none,
      decorations: [HARVEST_FOREST, HARVEST_SPLENDOR],
    },
  },
  discovery: {
    id: "discovery",
    label: "Science Discovery Album",
    motion: "discovery",
    slots: {
      banner: [SCIENCE_LINE_MICROSCOPE],
      "top-trim": none,
      "bottom-trim": none,
      "photo-frame": none,
      "corner-accent": [SCIENCE_MICROSCOPE],
      background: none,
      divider: none,
      decorations: [SCIENCE_MICROSCOPE, SCIENCE_LINE_MICROSCOPE],
    },
  },
  woodland: {
    id: "woodland",
    label: "Woodland Field Album",
    motion: "woodland",
    slots: {
      banner: [WOODLAND_FOREST],
      "top-trim": none,
      "bottom-trim": none,
      "photo-frame": none,
      "corner-accent": [WOODLAND_MUSHROOMS],
      background: none,
      divider: none,
      decorations: [WOODLAND_MUSHROOMS, WOODLAND_FOREST],
    },
  },
  garden: {
    id: "garden",
    label: "Greenhouse Memory Album",
    motion: "garden",
    slots: {
      banner: [GARDEN_FLOWERS],
      "top-trim": none,
      "bottom-trim": none,
      "photo-frame": none,
      "corner-accent": [GARDEN_TRELLIS],
      background: none,
      divider: none,
      decorations: [GARDEN_FLOWERS, GARDEN_TRELLIS],
    },
  },
  constellation: {
    id: "constellation",
    label: "Observatory Memory Album",
    motion: "constellation",
    slots: {
      banner: [CONSTELLATION_MOON],
      "top-trim": none,
      "bottom-trim": none,
      "photo-frame": none,
      "corner-accent": [CONSTELLATION_FULL_MOON],
      background: none,
      divider: none,
      decorations: [CONSTELLATION_MOON, CONSTELLATION_FULL_MOON],
    },
  },
};

export function recipeForTheme(theme: AlbumTheme): PhotoAlbumThemeRecipe {
  return PHOTO_ALBUM_THEME_RECIPES[theme];
}

export function applyThemeAssets(target: HTMLElement, theme: AlbumTheme): void {
  const recipe = recipeForTheme(theme);
  target.dataset.theme = theme;
  target.dataset.themeRecipe = recipe.label;
  const primary = recipe.slots.decorations[0];
  const secondary = recipe.slots.decorations[1];
  if (primary) {
    target.dataset.themeAssetPrimary = primary.id;
    target.style.setProperty("--hrv-theme-art-primary", `url("${primary.url}")`);
  } else {
    delete target.dataset.themeAssetPrimary;
    target.style.removeProperty("--hrv-theme-art-primary");
  }
  if (secondary) {
    target.dataset.themeAssetSecondary = secondary.id;
    target.style.setProperty("--hrv-theme-art-secondary", `url("${secondary.url}")`);
  } else {
    delete target.dataset.themeAssetSecondary;
    target.style.removeProperty("--hrv-theme-art-secondary");
  }
}
