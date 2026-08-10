import { describe, expect, it } from "vitest";
import { parseRoute, routeHref } from "../apps/photo-album/src/runtime/router-v2";

describe("Photo Album V2 nested year routing", () => {
  it("builds archive year home, all, and album routes", () => {
    expect(routeHref({ name: "year", schoolYear: "2025-26" }))
      .toBe("#hrv-photo-album/year/2025-26");
    expect(routeHref({ name: "year-all", schoolYear: "2025-26", albumIds: ["science", "garden"] }))
      .toBe("#hrv-photo-album/year/2025-26/all?albums=science,garden");
    expect(routeHref({ name: "year-album", schoolYear: "2025-26", albumId: "museum trip" }))
      .toBe("#hrv-photo-album/year/2025-26/album/museum%20trip");
  });

  it("parses archive routes without confusing them with current-year routes", () => {
    expect(parseRoute("#hrv-photo-album/year/2025-26")).toEqual({
      name: "year",
      schoolYear: "2025-26",
    });
    expect(parseRoute("#hrv-photo-album/year/2025-26/all?albums=science,garden")).toEqual({
      name: "year-all",
      schoolYear: "2025-26",
      albumIds: ["science", "garden"],
    });
    expect(parseRoute("#hrv-photo-album/year/2025-26/album/museum%20trip")).toEqual({
      name: "year-album",
      schoolYear: "2025-26",
      albumId: "museum trip",
    });
  });
});
