import { APP_HASH_PREFIX } from "../config";
import type { AppRoute } from "../types";

export function routeHref(route: AppRoute): string {
  const base = `#${APP_HASH_PREFIX}`;
  if (route.name === "home") return base;
  if (route.name === "years") return `${base}/years`;
  if (route.name === "album") return `${base}/album/${encodeURIComponent(route.albumId)}`;
  const query = route.albumIds.length > 0
    ? `?albums=${route.albumIds.map(encodeURIComponent).join(",")}`
    : "";
  return `${base}/all${query}`;
}

export function parseRoute(hash = window.location.hash): AppRoute {
  const raw = hash.replace(/^#/, "");
  if (!raw.startsWith(APP_HASH_PREFIX)) return { name: "home" };
  const relative = raw.slice(APP_HASH_PREFIX.length);
  const [path = "", query = ""] = relative.split("?", 2);
  const segments = path.split("/").filter(Boolean);
  if (segments[0] === "years") return { name: "years" };
  if (segments[0] === "album" && segments[1]) {
    return { name: "album", albumId: decodeURIComponent(segments[1]) };
  }
  if (segments[0] === "all") {
    const params = new URLSearchParams(query);
    const albumIds = (params.get("albums") ?? "")
      .split(",")
      .filter(Boolean)
      .map(decodeURIComponent);
    return { name: "all", albumIds };
  }
  return { name: "home" };
}

export class HashRouter {
  private readonly onHashChange = (): void => this.listener(parseRoute());

  constructor(private readonly listener: (route: AppRoute) => void) {}

  start(): void {
    window.addEventListener("hashchange", this.onHashChange);
    this.listener(parseRoute());
  }

  stop(): void {
    window.removeEventListener("hashchange", this.onHashChange);
  }

  navigate(route: AppRoute): void {
    const href = routeHref(route);
    if (window.location.hash === href) this.listener(route);
    else window.location.hash = href;
  }
}
