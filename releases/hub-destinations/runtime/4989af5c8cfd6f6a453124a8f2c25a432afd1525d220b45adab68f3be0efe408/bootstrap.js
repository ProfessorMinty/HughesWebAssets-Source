(async function () {
  "use strict";
  const script = document.currentScript;
  const id = script && script.dataset.storyId;
  if (!id || !/^[a-f0-9]{8}(?:-[a-f0-9]{4}){3}-[a-f0-9]{12}$/.test(id)) return;
  const root = document.getElementById("hrv-story-" + id);
  if (!root) return;
  try {
    if (window.parent !== window && window.parent.location.origin === location.origin &&
        window.parent.location.pathname === "/lanternworks-hub-setup/") return;
  } catch (_) { /* Cross-origin embeds follow the published selection. */ }
  const base = "https://cdn.nlightlabs.com/hrv/hub-destinations/" + id + "/";
  try {
    const pointer = await fetch(base + "current.json", {cache:"no-store", credentials:"omit", redirect:"error"});
    if (!pointer.ok) return;
    const selected = await pointer.json();
    if (selected.storyId !== id || !Number.isSafeInteger(selected.revision) || selected.revision < 1 ||
        !/^[0-9a-f]{64}$/.test(selected.sha256) || selected.publicationUrl !== base + "releases/" + selected.sha256 + "/story.html") return;
    const response = await fetch(selected.publicationUrl, {credentials:"omit", redirect:"error"});
    if (!response.ok) return;
    const bytes = await response.arrayBuffer();
    if (bytes.byteLength > 1024 * 1024) return;
    const digest = new Uint8Array(await crypto.subtle.digest("SHA-256", bytes));
    const hash = Array.from(digest, b => b.toString(16).padStart(2,"0")).join("");
    if (hash !== selected.sha256) return;
    const template = document.createElement("template");
    template.innerHTML = new TextDecoder("utf-8",{fatal:true}).decode(bytes);
    const article = template.content.querySelector("article[data-hrv-story]");
    if (!article || article.dataset.hrvStory !== id || article.dataset.revision !== String(selected.revision)) return;
    root.replaceChildren(template.content);
  } catch (_) { /* Keep the host's unavailable notice. */ }
})();
