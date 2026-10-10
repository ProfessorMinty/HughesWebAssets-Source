(function () {
  "use strict";

  var hub = document.querySelector(
    '.hub-wrap[aria-label="Classroom Explorations Hub"]'
  );

  if (
    !hub ||
    hub.getAttribute("data-hrv-placeholder-js") === "ready"
  ) {
    return;
  }

  hub.setAttribute(
    "data-hrv-placeholder-js",
    "ready"
  );

  function normalize(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/\s+/g, " ")
      .trim();
  }

  function installFilter(
    inputSelector,
    gridSelector,
    emptySelector
  ) {
    var input =
      hub.querySelector(inputSelector);

    var grid =
      hub.querySelector(gridSelector);

    var empty =
      hub.querySelector(emptySelector);

    if (!input || !grid) {
      return;
    }

    var cards =
      Array.prototype.slice.call(
        grid.querySelectorAll(".card-item")
      );

    function applyFilter() {
      var query =
        normalize(input.value);

      var visible = 0;

      cards.forEach(function (card) {
        var match =
          !query ||
          normalize(card.textContent)
            .indexOf(query) !== -1;

        card.hidden = !match;

        if (match) {
          visible += 1;
        }
      });

      if (empty) {
        empty.hidden =
          visible !== 0;
      }
    }

    input.addEventListener(
      "input",
      applyFilter
    );

    applyFilter();
  }

  installFilter(
    "#filterInput",
    "#exploreGrid",
    "#exploreEmpty"
  );

  installFilter(
    "#learnFilterInput",
    "#learnGrid",
    "#learnEmpty"
  );

  var celebrateButton =
    hub.querySelector("#celebrateBtn");

  var celebrateCount =
    hub.querySelector("#celebrateCount");

  var confetti =
    hub.querySelector("#confetti");

  var reduceMotion =
    window.matchMedia &&
    window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;

  var celebrateTotal = 0;

  function updateCelebrateCount() {
    if (!celebrateCount) {
      return;
    }

    celebrateCount.textContent =
      String(celebrateTotal);

    celebrateCount.setAttribute(
      "aria-label",
      "Celebrations this visit: " +
        celebrateTotal
    );
  }

  function launchConfetti() {
    if (
      !confetti ||
      reduceMotion
    ) {
      return;
    }

    confetti.innerHTML = "";
    confetti.style.display = "block";

    var colors = [
      "#fff176",
      "#f28b82",
      "#80cbc4",
      "#81d4fa",
      "#cf93d9",
      "#ffab91",
      "#a5d6a7"
    ];

    var count = 56;

    for (
      var i = 0;
      i < count;
      i += 1
    ) {
      var piece =
        document.createElement("span");

      piece.className = "piece";

      piece.style.left =
        Math.random() * 100 + "%";

      piece.style.top =
        "-10vh";

      piece.style.background =
        colors[
          Math.floor(
            Math.random() *
            colors.length
          )
        ];

      piece.style.animationDuration =
        3.2 +
        Math.random() * 2.4 +
        "s";

      piece.style.animationDelay =
        Math.random() * .35 +
        "s";

      piece.style.width =
        7 +
        Math.random() * 7 +
        "px";

      piece.style.height =
        9 +
        Math.random() * 9 +
        "px";

      confetti.appendChild(piece);
    }

    window.setTimeout(
      function () {
        confetti.style.display =
          "none";

        confetti.innerHTML = "";
      },
      6200
    );
  }

  updateCelebrateCount();

  if (celebrateButton) {
    celebrateButton.addEventListener(
      "click",
      function (event) {
        event.preventDefault();

        celebrateTotal += 1;

        updateCelebrateCount();

        launchConfetti();
      }
    );
  }
})();