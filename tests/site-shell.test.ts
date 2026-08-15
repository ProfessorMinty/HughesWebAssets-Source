import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = process.cwd();
const sourceCss = readFileSync(resolve(root, "apps/site-shell/src/site-shell.css"), "utf8");
const sourceJs = readFileSync(resolve(root, "apps/site-shell/src/site-shell.js"), "utf8");
const releaseCss = readFileSync(resolve(root, "releases/site-shell/2026.08.14.1/site-shell.css"), "utf8");
const releaseJs = readFileSync(resolve(root, "releases/site-shell/2026.08.14.1/site-shell.js"), "utf8");

function withoutComments(value: string): string {
  return value.replace(/\/\*[\s\S]*?\*\//g, "");
}

describe("HRV global site shell", () => {
  it("ships immutable release bytes that exactly match the approved source", () => {
    expect(releaseCss).toBe(sourceCss);
    expect(releaseJs).toBe(sourceJs);
  });

  it("keeps CSS limited to shared header/navigation presentation", () => {
    const css = withoutComments(sourceCss);

    expect(css).toContain(".main-navigation");
    expect(css).toContain(".site-header");

    for (const forbidden of [
      ".ctc",
      "#qod",
      ".lib-",
      "#bat-night-overlay",
      ".comments-area",
      ".wp-block-button",
      ".widget",
      "input[",
      "textarea",
      "#hrv-page",
      "#hrv-posts-page",
      "zinnia",
      "classroom-explorations"
    ]) {
      expect(css).not.toContain(forbidden);
    }
  });

  it("keeps JavaScript limited to guarded sitewide auto-scroll", () => {
    const js = withoutComments(sourceJs);

    expect(() => new Function(sourceJs)).not.toThrow();
    expect(js).toContain("window.location.hash");
    expect(js).toContain("customize.php");
    expect(js).toContain("wpadminbar");
    expect(js).toContain("window.scrollY > MANUAL_SCROLL_THRESHOLD");
    expect(js).toContain("[data-hrv-auto-scroll-target]");

    for (const forbidden of [
      "hrv-photo",
      "hrv-posts",
      "zinnia",
      "classroom-explorations",
      "DriveSync",
      "wp-json",
      "google.com/spreadsheets"
    ]) {
      expect(js).not.toContain(forbidden);
    }
  });
});
