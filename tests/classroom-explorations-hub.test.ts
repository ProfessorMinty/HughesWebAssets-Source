import { readFile } from "node:fs/promises";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

interface RecordShape {
  id: string;
  type: string;
  status: string;
  schoolYear: string;
  pageUrl: string | null;
  completeness: string;
  archiveSchoolYear?: string;
  presentation?: Record<string, string>;
}

async function source() {
  const path = resolve(process.cwd(), "apps/classroom-explorations-hub/content/hub.source.json");
  return JSON.parse(await readFile(path, "utf8")) as {
    contentVersion: string;
    page: {
      routeUrl: string;
      currentSchoolYear: string;
      summary: string;
      museum: {
        kicker: string;
        pillars: string[];
        oathTitle: string;
        oath: string;
        footer: string;
        dividerImageUrl: string;
      };
    };
    records: RecordShape[];
  };
}

describe("Classroom Explorations Hub permanent museum contract", () => {
  it("preserves the permanent Edublogs route", async () => {
    const manifest = await source();
    expect(manifest.page.routeUrl).toBe("https://rmhughes.edublogs.org/classroom-explorations/");
  });

  it("preserves the backed-up museum identity instead of a generic redesign", async () => {
    const manifest = await source();
    expect(manifest.page.summary).toBe("Launchpads for curiosity—STEM adventures, field notes, and student-made discoveries.");
    expect(manifest.page.museum.kicker).toBe("Museum Entrance • Greenhouse Glow • Discovery Hub");
    expect(manifest.page.museum.pillars).toEqual(["Inquiry", "Teamwork", "Creativity", "Real-World Science"]);
    expect(manifest.page.museum.oathTitle).toBe("Exploration Oath");
    expect(manifest.page.museum.oath).toBe("We observe closely, ask brave questions, test ideas safely, and share what we learn.");
    expect(manifest.page.museum.footer).toBe("Pack your curiosity—adventures await.");
    expect(manifest.page.museum.dividerImageUrl).toContain("/94559b9ac4b8db60ea21e9b31cd9f98ba8c9b147/Divider2Actual.png");
  });

  it("keeps Zinnia current and does not promote an unapproved TWWL", async () => {
    const manifest = await source();
    const currentYear = manifest.page.currentSchoolYear;
    const currentExploration = manifest.records.filter((record) => record.schoolYear === currentYear && record.type === "exploration" && record.status === "current");
    const twwlSlot = manifest.records.filter((record) => record.schoolYear === currentYear && record.type === "twwl" && ["current", "coming-soon"].includes(record.status));
    expect(currentExploration.map((record) => record.id)).toEqual(["summer-bloom-adoption-project"]);
    expect(currentExploration[0]?.presentation).toMatchObject({ sectionKicker: "Featured Exhibit Hall", slotLabel: "Current Exploration", visualBadge: "Zinnia Greenhouse", actionLabel: "Explore Now" });
    expect(twwlSlot).toHaveLength(1);
    expect(twwlSlot[0]?.status).toBe("coming-soon");
    expect(twwlSlot[0]?.pageUrl).toBeNull();
    expect(twwlSlot[0]?.presentation).toMatchObject({ sectionKicker: "Learning Lantern", slotLabel: "This Week We Learned", statusLabel: "Coming Soon" });
  });

  it("launches with empty current-year past collections", async () => {
    const manifest = await source();
    const currentYear = manifest.page.currentSchoolYear;
    const pastCurrentYear = manifest.records.filter((record) =>
      record.schoolYear === currentYear &&
      ["exploration", "twwl"].includes(record.type) &&
      ["past", "archived"].includes(record.status),
    );
    expect(pastCurrentYear).toEqual([]);
  });

  it("represents prior-year content only as one museum archive doorway at launch", async () => {
    const manifest = await source();
    const priorYear = manifest.records.filter((record) => record.schoolYear === "2025-2026");
    expect(priorYear).toHaveLength(1);
    expect(priorYear[0]).toMatchObject({
      id: "archive-2025-2026",
      type: "archive-doorway",
      status: "coming-soon",
      archiveSchoolYear: "2025-2026",
      pageUrl: null,
      presentation: { sectionKicker: "Last Year", visualBadge: "Museum Archive" },
    });
  });

  it("does not embed legacy 2025-2026 page records in the launch Hub", async () => {
    const manifest = await source();
    const legacyContent = manifest.records.filter((record) =>
      record.schoolYear === "2025-2026" && ["exploration", "twwl"].includes(record.type),
    );
    expect(legacyContent).toEqual([]);
  });

  it("has stable unique record ids", async () => {
    const manifest = await source();
    const ids = manifest.records.map((record) => record.id);
    expect(new Set(ids).size).toBe(ids.length);
    ids.forEach((id) => expect(id).toMatch(/^[a-z0-9]+(?:-[a-z0-9]+)*$/));
  });

  it("never exposes Google Drive source URLs", async () => {
    const manifest = await source();
    for (const record of manifest.records) {
      if (record.pageUrl) expect(record.pageUrl).not.toMatch(/^https:\/\/(?:drive|docs)\.google\.com/i);
    }
  });
});
