export interface RuntimeVisualAsset {
  id: string;
  url: string;
}

export interface AlbumVisualRecipe {
  id: string;
  label: string;
  assets: readonly RuntimeVisualAsset[];
}

const asset = (id: string, url: string): RuntimeVisualAsset => ({ id, url });

export const MEMORY_GALLERY_RECIPE: AlbumVisualRecipe = {
  id: "memory-gallery",
  label: "Memory Gallery",
  assets: [
    asset(
      "photo-frame-970e2e989f",
      "https://cdn.nlightlabs.com/assets/frame/card-decoration/photo-frame-970e2e989f/photo-frame-970e2e989f.svg",
    ),
    asset(
      "roman-glass-135c9b02b8",
      "https://cdn.nlightlabs.com/assets/texture/background/roman-glass-135c9b02b8/roman-glass-135c9b02b8.svg",
    ),
  ],
};

export const CURRENT_ALBUM_VISUAL_RECIPES: readonly AlbumVisualRecipe[] = [
  {
    id: "pumpkin-patch",
    label: "Pumpkin Patch",
    assets: [
      asset(
        "autumn-forest-7e0183a203",
        "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/autumn-forest-7e0183a203/autumn-forest-7e0183a203.svg",
      ),
    ],
  },
  {
    id: "science-museum",
    label: "Science Museum",
    assets: [
      asset(
        "microscope-11ddba1106",
        "https://cdn.nlightlabs.com/assets/prop/hero-prop/microscope-11ddba1106/microscope-11ddba1106.webp",
      ),
      asset(
        "roman-glass-135c9b02b8",
        "https://cdn.nlightlabs.com/assets/texture/background/roman-glass-135c9b02b8/roman-glass-135c9b02b8.svg",
      ),
    ],
  },
  {
    id: "woodland-fungi",
    label: "Woodland & Fungi",
    assets: [
      asset(
        "mushrooms-d9549e0535",
        "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/mushrooms-d9549e0535/mushrooms-d9549e0535.webp",
      ),
    ],
  },
  {
    id: "zinnia-garden",
    label: "Zinnia Garden",
    assets: [
      asset(
        "flower-plants-93bdc61203",
        "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/flower-plants-93bdc61203/flower-plants-93bdc61203.svg",
      ),
      asset(
        "plant-trellis-9cfbeab81a",
        "https://cdn.nlightlabs.com/assets/illustration/hero-decoration/plant-trellis-9cfbeab81a/plant-trellis-9cfbeab81a.svg",
      ),
    ],
  },
] as const;

export function visualRecipeForAlbum(albumName: string): AlbumVisualRecipe {
  const normalized = albumName.toLocaleLowerCase();

  if (/pumpkin|harvest|autumn|fall/.test(normalized)) {
    return CURRENT_ALBUM_VISUAL_RECIPES[0]!;
  }

  if (/science|museum|experiment/.test(normalized)) {
    return CURRENT_ALBUM_VISUAL_RECIPES[1]!;
  }

  if (/mushroom|fungi|forest|woods/.test(normalized)) {
    return CURRENT_ALBUM_VISUAL_RECIPES[2]!;
  }

  if (/zinnia|garden|flower|plant/.test(normalized)) {
    return CURRENT_ALBUM_VISUAL_RECIPES[3]!;
  }

  return MEMORY_GALLERY_RECIPE;
}
