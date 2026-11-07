import { MUSHROOM_PHOTOS } from "./photo-catalog.js";

export function mushroomPhotoAsset(url) {
  if (typeof url !== 'string' || !url.startsWith('asset:')) return null;
  return MUSHROOM_PHOTOS.find(photo => 'asset:' + photo.id === url) || null;
}
export function mushroomPhotoURL(url) {
  const photo = mushroomPhotoAsset(url);
  if (photo) return new URL(photo.file, import.meta.url).href;
  if (typeof url === 'string' && url.startsWith('https://')) return url;
  throw new Error('Unknown or unsafe mushroom image reference.');
}
