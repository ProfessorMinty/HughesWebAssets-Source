(function(){
  "use strict";

  if (document.querySelector('script[data-hrv-archive-2025-2026]')) return;

  var runtime = document.createElement("script");
  runtime.src = "https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@8331606ba430e039a78174da3825c275fefa9c46/legacy-page-support/archive-2025-2026/archive-2025-2026.js";
  runtime.async = false;
  runtime.setAttribute("data-hrv-archive-2025-2026", "1");
  runtime.addEventListener("error", function(){
    var root = document.getElementById("hrv-archive-2025-2026");
    if (!root) return;
    root.dataset.hrvArchiveState = "error";
    var status = root.querySelector("[data-archive-status]");
    if (status) {
      status.hidden = false;
      status.textContent = "The interactive archive could not load, but the preserved fallback links are still available.";
    }
  }, { once:true });
  document.head.appendChild(runtime);
})();