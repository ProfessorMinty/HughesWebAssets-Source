import { describe, expect, it } from "vitest";
import { parseRoute, routeHref } from "../apps/photo-album/src/runtime/router";

describe("permanent route architecture", () => {
  it("keeps current, album, multi-album, and previous-year routes scoped to the app", () => {
    expect(routeHref({ name: "home" })).toBe("#hrv-photo-album");
    expect(parseRoute("#hrv-photo-album/album/garden")).toEqual({ name: "album", albumId: "garden" });
    expect(parseRoute("#hrv-photo-album/all?albums=a,b")).toEqual({ name: "all", albumIds: ["a", "b"] });
    expect(parseRoute("#hrv-photo-album/years")).toEqual({ name: "years" });
  });
});
