(() => {
  "use strict";
  const root = document.getElementById("hrv-classroom-explorations-root");
  if (!root || root.dataset.hrvDoorwayStarted === "true") return;
  root.dataset.hrvDoorwayStarted = "true";
  const bootstrap = document.createElement("script");
  bootstrap.src = "__PINNED_IMMUTABLE_BOOTSTRAP_URL__";
  bootstrap.dataset.mount = root.id;
  bootstrap.dataset.publication = "__PINNED_IMMUTABLE_PUBLICATION_URL__";
  bootstrap.addEventListener("error", () => { root.dataset.hrvState = "unavailable"; }, { once: true });
  document.head.appendChild(bootstrap);
})();
