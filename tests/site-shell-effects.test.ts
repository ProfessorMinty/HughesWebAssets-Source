import { createHash } from "node:crypto";
import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const source = readFileSync(resolve(process.cwd(), "apps/site-shell/src/site-shell.js"), "utf8");
const shellWindow = window as Window & { __HRV_SITE_SHELL__?: { version: string; destroy(): void } };
const boot = () => { new Function(source)(); document.dispatchEvent(new Event("DOMContentLoaded")); };
const toggle = () => document.querySelector<HTMLButtonElement>(".hrv-shell-effects-toggle")!;

beforeEach(() => {
  shellWindow.__HRV_SITE_SHELL__?.destroy();
  document.body.innerHTML = '<header class="site-header"><a href="#content">Hughes Room Views</a></header><main id="content">Lesson</main>';
  document.documentElement.removeAttribute("data-hrv-effects");
  localStorage.clear();
  vi.useFakeTimers();
  vi.spyOn(window, "scrollTo").mockImplementation(() => {});
});
afterEach(() => {
  shellWindow.__HRV_SITE_SHELL__?.destroy();
  vi.restoreAllMocks();
  vi.useRealTimers();
});

describe("the shared Reduced Effects preference", () => {
  it("defaults to full without using OS preferences or installing a floating control", () => {
    const media = vi.fn(() => ({ matches: true }));
    vi.stubGlobal("matchMedia", media);
    boot();
    expect(document.documentElement.dataset.hrvEffects).toBe("full");
    expect(toggle().getAttribute("aria-pressed")).toBe("false");
    expect(toggle().closest(".site-header")).not.toBeNull();
    expect(media).not.toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
  it("changes immediately, persists explicit choice, and restores it on another page load", () => {
    const changes: unknown[] = [];
    const listener = (event: Event) => changes.push((event as CustomEvent).detail);
    window.addEventListener("hrv:effectschange", listener);
    boot();
    toggle().click();
    expect(localStorage.getItem("hrv:effects:v1")).toBe("reduced");
    expect(document.documentElement.dataset.hrvEffects).toBe("reduced");
    expect(toggle().getAttribute("aria-pressed")).toBe("true");
    expect(changes.at(-1)).toEqual({version:1,mode:"reduced"});
    shellWindow.__HRV_SITE_SHELL__!.destroy();
    boot();
    expect(document.documentElement.dataset.hrvEffects).toBe("reduced");
    toggle().click();
    expect(localStorage.getItem("hrv:effects:v1")).toBe("full");
    window.removeEventListener("hrv:effectschange",listener);
  });
  it("synchronizes another tab and falls back to full for invalid or cleared choices", () => {
    localStorage.setItem("hrv:effects:v1","unexpected");
    boot();
    expect(document.documentElement.dataset.hrvEffects).toBe("full");
    window.dispatchEvent(new StorageEvent("storage", {key:"hrv:effects:v1",newValue:"reduced",storageArea:localStorage}));
    expect(toggle().getAttribute("aria-pressed")).toBe("true");
    window.dispatchEvent(new StorageEvent("storage", {key:"other",newValue:"full",storageArea:localStorage}));
    expect(document.documentElement.dataset.hrvEffects).toBe("reduced");
    window.dispatchEvent(new StorageEvent("storage", {key:null,storageArea:localStorage}));
    expect(document.documentElement.dataset.hrvEffects).toBe("full");
  });
  it("works for this page when storage is blocked and truthfully reports the persistence limit", () => {
    vi.spyOn(Storage.prototype,"getItem").mockImplementation(() => {throw new Error("blocked");});
    vi.spyOn(Storage.prototype,"setItem").mockImplementation(() => {throw new Error("blocked");});
    boot();
    toggle().click();
    expect(document.documentElement.dataset.hrvEffects).toBe("reduced");
    expect(document.querySelector('[role="status"]')?.textContent).toContain("could not save");
    expect(document.querySelector<HTMLElement>('[role="status"]')?.hidden).toBe(false);
  });
  it("mounts once, leaves the lesson intact, and removes listeners and UI on cleanup", () => {
    boot(); boot();
    expect(document.querySelectorAll("#hrv-effects-control")).toHaveLength(1);
    expect(document.getElementById("content")?.textContent).toBe("Lesson");
    const old = toggle();
    shellWindow.__HRV_SITE_SHELL__!.destroy();
    old.click();
    expect(localStorage.getItem("hrv:effects:v1")).toBeNull();
    expect(document.querySelector("#hrv-effects-control")).toBeNull();
    window.dispatchEvent(new StorageEvent("storage", {key:"hrv:effects:v1",newValue:"reduced",storageArea:localStorage}));
    expect(document.documentElement.dataset.hrvEffects).toBe("full");
  });
  it("uses immediate guarded scroll in reduced mode and smooth scroll in full mode", () => {
    localStorage.setItem("hrv:effects:v1","reduced");
    boot(); vi.advanceTimersByTime(700);
    expect(window.scrollTo).toHaveBeenLastCalledWith({top:520,behavior:"instant"});
    shellWindow.__HRV_SITE_SHELL__!.destroy();
    localStorage.setItem("hrv:effects:v1","full");
    boot(); vi.advanceTimersByTime(700);
    expect(window.scrollTo).toHaveBeenLastCalledWith({top:520,behavior:"smooth"});
  });
  it("leaves the immutable August release unchanged", () => {
    const digest = (name:string) => createHash("sha256").update(readFileSync(resolve(process.cwd(),"releases/site-shell/2026.08.15.1",name))).digest("hex");
    expect(digest("site-shell.js")).toBe("440c5434d5ae4f0c9bcf4f905f1fe4e03d4409d52df055c94736724448655612");
    expect(digest("site-shell.css")).toBe("67a0a2c880daab5ae1a53b82d37fdcc1bdd526e866cbff5cc932e0c92d94400f");
  });
  it("does not auto-scroll after the visitor starts using the page or effects control", () => {
    boot();
    window.dispatchEvent(new KeyboardEvent("keydown",{key:"Tab"}));
    vi.advanceTimersByTime(700);
    expect(window.scrollTo).not.toHaveBeenCalled();
    shellWindow.__HRV_SITE_SHELL__!.destroy();
    boot(); toggle().click(); vi.advanceTimersByTime(700);
    expect(window.scrollTo).not.toHaveBeenCalled();
  });
});
