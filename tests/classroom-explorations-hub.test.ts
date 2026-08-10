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
  notice?: string;
}

async function source() {
  const path = resolve(process.cwd(), "apps/classroom-explorations-hub/content/hub.source.json");
  return JSON.parse(await readFile(path, "utf8")) as {
    page: { routeUrl: string; currentSchoolYear: string };
    records: RecordShape[];
  };
}

describe("Classroom Explorations Hub v1 contract", () => {
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

  it("preserves verified 2025-2026 history by content type", async () => {
    const manifest = await source();
    const historical = manifest.records.filter((record) => record.schoolYear === "2025-2026");
    const explorationIds = historical.filter((record) => record.type === "exploration").map((record) => record.id).sort();
    const twwlIds = historical.filter((record) => record.type === "twwl").map((record) => record.id).sort();
    expect(explorationIds).toEqual([
      "caterpillars-in-the-classroom",
      "great-barrier-reef",
      "mushrooms",
    ]);
    expect(twwlIds).toEqual([
      "autumn-spiders-gentle-web-artists",
      "bats-dont-go-bump-in-the-night",
      "botany-lets-talk-about-tubers",
      "silent-wings-wise-eyes-learning-about-owls",
      "traditions-of-russian-winter",
    ]);
  });

  it("truthfully labels Tubers as incomplete", async () => {
    const manifest = await source();
    const tubers = manifest.records.find((record) => record.id === "botany-lets-talk-about-tubers");
    expect(tubers?.completeness).toBe("incomplete");
    expect(tubers?.notice).toBeTruthy();
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
