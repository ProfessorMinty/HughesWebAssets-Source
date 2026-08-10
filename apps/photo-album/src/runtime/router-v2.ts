import { APP_HASH_PREFIX } from "../config";

export type PhotoAlbumRoute =
  | { name: "home" }
  | { name: "all"; albumIds: string[] }
  | { name: "album"; albumId: string }
  | { name: "years" }
  | { name: "year"; schoolYear: string }
  | { name: "year-all"; schoolYear: string; albumIds: string[] }
  | { name: "year-album"; schoolYear: string; albumId: string };

function albumQuery(albumIds: string[]): string {
  return albumIds.length > 0
    ? `?albums=${albumIds.map(encodeURIComponent).join(",")}`
    : "";
}

export function routeHref(route: PhotoAlbumRoute): string {
  const base = `#${APP_HASH_PREFIX}`;
  if (route.name === "home") return base;
  if (route.name === "years") return `${base}/years`;
  if (route.name === "all") return `${base}/all${albumQuery(route.albumIds)}`;
  if (route.name === "album") return `${base}/album/${encodeURIComponent(route.albumId)}`;

  const yearBase = `${base}/year/${encodeURIComponent(route.schoolYear)}`;
  if (route.name === "year") return yearBase;
  if (route.name === "year-all") return `${yearBase}/all${albumQuery(route.albumIds)}`;
  return `${yearBase}/album/${encodeURIComponent(route.albumId)}`;
}

function parseAlbumIds(query: string): string[] {
  const params = new URLSearchParams(query);
  return (params.get("albums") ?? "")
    .split(",")
    .filter(Boolean)
    .map(decodeURIComponent);
}

export function parseRoute(hash = window.location.hash): PhotoAlbumRoute {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(APP_HASH_PREFIX)) return { name: "home" };

  const relative = raw.slice(APP_HASH_PREFIX.length);
  const [path = "", query = ""] = relative.split("?", 2);
  const segments = path.split("/").filter(Boolean);

  if (segments[0] === "years") return { name: "years" };

  if (segments[0] === "year" && segments[1]) {
    const schoolYear = decodeURIComponent(segments[1]);
    if (segments[2] === "all") {
      return { name: "year-all", schoolYear, albumIds: parseAlbumIds(query) };
    }
    if (segments[2] === "album" && segments[3]) {
      return { name: "year-album", schoolYear, albumId: decodeURIComponent(segments[3]) };
    }
    return { name: "year", schoolYear };
  }

  if (segments[0] === "album" && segments[1]) {
    return { name: "album", albumId: decodeURIComponent(segments[1]) };
  }
  if (segments[0] === "all") {
    return { name: "all", albumIds: parseAlbumIds(query) };
  }
  return { name: "home" };
}

export class PhotoAlbumRouter {
  private readonly onHashChange = (): void => this.listener(parseRoute());

  constructor(private readonly listener: (route: PhotoAlbumRoute) => void) {}

  start(): void {
    window.addEventListener("hashchange", this.onHashChange);
    this.listener(parseRoute());
  }

  stop(): void {
    window.removeEventListener("hashchange", this.onHashChange);
  }

  navigate(route: PhotoAlbumRoute): void {
    const href = routeHref(route);
    if (window.location.hash === href) this.listener(route);
    else window.location.hash = href;
  }
}
