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
}

async function source() {
  const path = resolve(process.cwd(), "apps/classroom-explorations-hub/content/hub.source.json");
  return JSON.parse(await readFile(path, "utf8")) as {
    contentVersion: string;
    page: { routeUrl: string; currentSchoolYear: string };
    records: RecordShape[];
  };
}

describe("Classroom Explorations Hub v1 launch contract", () => {
  it("preserves the permanent Edublogs route", async () => {
    const manifest = await source();
    expect(manifest.page.routeUrl).toBe("https://rmhughes.edublogs.org/classroom-explorations/");
  });

  it("keeps Zinnia current and does not promote an unapproved TWWL", async () => {
    const manifest = await source();
    const currentYear = manifest.page.currentSchoolYear;
    const currentExploration = manifest.records.filter((record) => record.schoolYear === currentYear && record.type === "exploration" && record.status === "current");
    const twwlSlot = manifest.records.filter((record) => record.schoolYear === currentYear && record.type === "twwl" && ["current", "coming-soon"].includes(record.status));
    expect(currentExploration.map((record) => record.id)).toEqual(["summer-bloom-adoption-project"]);
    expect(twwlSlot).toHaveLength(1);
    expect(twwlSlot[0]?.status).toBe("coming-soon");
    expect(twwlSlot[0]?.pageUrl).toBeNull();
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

  it("represents prior-year content only as one archive doorway at launch", async () => {
    const manifest = await source();
    const priorYear = manifest.records.filter((record) => record.schoolYear === "2025-2026");
    expect(priorYear).toHaveLength(1);
    expect(priorYear[0]).toMatchObject({
      id: "archive-2025-2026",
      type: "archive-doorway",
      status: "coming-soon",
      archiveSchoolYear: "2025-2026",
      pageUrl: null,
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
