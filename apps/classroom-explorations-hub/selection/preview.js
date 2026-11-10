/* The preview uses the same verified renderer, stylesheet and artwork as the public Hub. */
(async () => {
  const root = document.getElementById("hrv-classroom-explorations-root");
  const data = JSON.parse(
    document.getElementById("hub-preview-data").textContent,
  );
  const urls = [];
  async function verified(asset) {
    const response = await fetch(asset.path, {
      credentials: "omit",
      redirect: "error",
      signal: AbortSignal.timeout(15000),
    });
    if (!response.ok) throw new Error("Preview asset unavailable");
    const bytes = await response.arrayBuffer();
    const digest = Array.from(
      new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)),
      (b) => b.toString(16).padStart(2, "0"),
    ).join("");
    if (digest !== asset.sha256)
      throw new Error("Preview asset verification failed");
    return bytes;
  }
  try {
    const [style, script, artwork] = await Promise.all([
      verified(data.runtime.style),
      verified(data.runtime.script),
      Promise.all(
        Object.entries(data.runtime.artwork).map(async ([key, asset]) => {
          const url = URL.createObjectURL(
            new Blob([await verified(asset)], { type: asset.mediaType }),
          );
          urls.push(url);
          return [key, url];
        }),
      ),
    ]);
    const css = document.createElement("style");
    css.textContent = new TextDecoder().decode(style);
    document.head.append(css);
    const url = URL.createObjectURL(
      new Blob([script], { type: "text/javascript" }),
    );
    urls.push(url);
    const renderer = await import(url);
    renderer.mountClassroomExplorationsHub(root, data.manifest, {
      artwork: Object.fromEntries(artwork),
    });
    document.addEventListener("click", (event) => {
      if (event.target.closest("a[href]")) event.preventDefault();
    });
  } catch {
    root.textContent =
      "The preview could not load. Your saved change is safe. Please try again.";
  }
  window.addEventListener(
    "pagehide",
    () => urls.forEach((url) => URL.revokeObjectURL(url)),
    { once: true },
  );
})();
