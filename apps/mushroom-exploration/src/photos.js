import { MUSHROOM_PHOTOS } from "./photo-catalog.js";
import { MUSHROOM_DIAGRAMS } from "./diagram-catalog.js";

export function mushroomPhotoAsset(url) {
  if (typeof url !== 'string' || !url.startsWith('asset:')) return null;
  return [...MUSHROOM_PHOTOS,...MUSHROOM_DIAGRAMS].find(photo => 'asset:' + photo.id === url) || null;
}
export function mushroomDiagramReference(id){const item=MUSHROOM_DIAGRAMS.find(item=>item.id==='mushroom-diagram:'+id);if(!item)throw new Error('Unknown published diagram');return {kind:'image',url:'asset:'+item.id,alt:item.alt,caption:item.caption};}
export function mushroomPhotoURL(url) {
  const photo = mushroomPhotoAsset(url);
  if (photo) return new URL(photo.file, import.meta.url).href;
  if (typeof url === 'string' && url.startsWith('https://')) return url;
  throw new Error('Unknown or unsafe mushroom image reference.');
}
