import { describe, expect, it, vi } from "vitest";
import { PhotoLightbox } from "../apps/photo-album/src/components/lightbox";
import { photo } from "./helpers";

describe("lightbox", () => {
  it("navigates the logical photo set with buttons and keyboard", () => {
    const root = document.createElement("div");
    const trigger = document.createElement("button");
    document.body.append(trigger, root);
    trigger.focus();
    const lightbox = new PhotoLightbox(root);
    const photos = [photo("1"), photo("2"), photo("3")];

    lightbox.open(photos, 0, trigger);
    expect(lightbox.isOpen).toBe(true);
    expect(root.querySelector<HTMLImageElement>(".hrv-lightbox__image")?.src).toBe(photos[0]?.galleryUrl);
    root.querySelector("dialog")?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowRight", bubbles: true }));
    expect(lightbox.currentIndex).toBe(1);
    root.querySelector("dialog")?.dispatchEvent(new KeyboardEvent("keydown", { key: "ArrowLeft", bubbles: true }));
    expect(lightbox.currentIndex).toBe(0);
  });

  it("uses only the sanitized full derivative for Open Full Size and restores focus on Escape", () => {
    const root = document.createElement("div");
    const trigger = document.createElement("button");
    document.body.append(trigger, root);
    trigger.focus();
    const lightbox = new PhotoLightbox(root);
    const item = photo("full-check");

    lightbox.open([item], 0, trigger);
    const fullLink = root.querySelector<HTMLAnchorElement>(".hrv-lightbox__footer a")!;
    expect(fullLink.href).toBe(item.fullSizeUrl);
    expect(fullLink.href).not.toBe(item.galleryUrl);
    root.querySelector("dialog")?.dispatchEvent(new KeyboardEvent("keydown", { key: "Escape", bubbles: true }));
    expect(lightbox.isOpen).toBe(false);
    expect(document.activeElement).toBe(trigger);
  });

  it("hides the full-size action when the optional full derivative is missing", () => {
    const root = document.createElement("div");
    document.body.append(root);
    const lightbox = new PhotoLightbox(root);
    const item = photo("no-full");
    item.fullSizeUrl = null;
    lightbox.open([item], 0);

    expect(root.querySelector<HTMLAnchorElement>(".hrv-lightbox__footer a")?.hidden).toBe(true);
  });

  it("locks html and body, blocks modal wheel propagation, and restores exact page state", () => {
    const scrollX = vi.spyOn(window, "scrollX", "get").mockReturnValue(24);
    const scrollY = vi.spyOn(window, "scrollY", "get").mockReturnValue(640);
    const scrollTo = vi.spyOn(window, "scrollTo");
    document.documentElement.style.scrollBehavior = "smooth";
    document.body.style.position = "relative";
    const root = document.createElement("div");
    const trigger = document.createElement("button");
    document.body.append(trigger, root);
    const lightbox = new PhotoLightbox(root);

    lightbox.open([photo("1"), photo("2")], 0, trigger);

    expect(document.documentElement.classList.contains("hrv-lightbox-open")).toBe(true);
    expect(document.body.classList.contains("hrv-lightbox-open")).toBe(true);
    expect(document.body.style.getPropertyValue("position")).toBe("fixed");
    expect(document.body.style.getPropertyPriority("position")).toBe("important");
    expect(document.body.style.top).toBe("-640px");
    expect(document.body.style.left).toBe("-24px");
    const wheel = new WheelEvent("wheel", { bubbles: true, cancelable: true, deltaY: 800 });
    root.querySelector("dialog")?.dispatchEvent(wheel);
    expect(wheel.defaultPrevented).toBe(true);

    lightbox.next();
    lightbox.previous();
    expect(scrollTo).not.toHaveBeenCalled();
    lightbox.close();

    expect(document.documentElement.classList.contains("hrv-lightbox-open")).toBe(false);
    expect(document.body.classList.contains("hrv-lightbox-open")).toBe(false);
    expect(document.documentElement.style.scrollBehavior).toBe("smooth");
    expect(document.body.style.position).toBe("relative");
    expect(document.body.style.top).toBe("");
    expect(scrollTo).toHaveBeenLastCalledWith(24, 640);
    expect(document.activeElement).toBe(trigger);
    scrollX.mockRestore();
    scrollY.mockRestore();
    scrollTo.mockRestore();
  });
});
