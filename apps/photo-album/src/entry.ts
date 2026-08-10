import "./styles/photo-album.css";
import "./styles/photo-album-home.css";
import { PhotoAlbumAppV2 } from "./app-v2";
import type { PhotoAlbumOptions } from "./config";

export interface MountedPhotoAlbum {
  destroy: () => void;
  ready: Promise<void>;
}

const mountedApps = new WeakMap<HTMLElement, MountedPhotoAlbum>();

export function mountPhotoAlbum(
  target: Element | null,
  options: PhotoAlbumOptions = {},
): MountedPhotoAlbum {
  if (!(target instanceof HTMLElement)) {
    throw new TypeError("Photo Album mount target must be an HTMLElement.");
  }

  const existing = mountedApps.get(target);
  if (existing) return existing;

  const app = new PhotoAlbumAppV2(target, options);
  const mounted: MountedPhotoAlbum = {
    ready: app.start(),
    destroy: () => {
      app.destroy();
      mountedApps.delete(target);
    },
  };
  mountedApps.set(target, mounted);
  return mounted;
}

export type { PhotoAlbumOptions } from "./config";
