(function(){
  var tries = 0;
  var maxTries = 40;

  function waitForZinniaPage(){
    tries++;

    var page = document.querySelector('#hrv-page[data-hrv-page-type="zinnia-plant-journal"]');

    if(page){
      initZinniaPage(page);
      return;
    }

    if(tries < maxTries){
      setTimeout(waitForZinniaPage, 250);
    }
  }

  function initZinniaPage(page){
    if(page.getAttribute('data-hrv-zinnia-script') === 'running') return;
    page.setAttribute('data-hrv-zinnia-script','running');

    var debug = /[?&]debug=1/.test(location.search);
    function log(){
      if(debug && window.console){
        console.log.apply(console, arguments);
      }
    }

    var sheetUrls = [
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk0bEfVHnPk4c-yNFVHlbVCyZ3QnzmhcZrU1xaSdw83MoBPD5Y-Gj7MjJe4-5juI_ZJF_FFONNj5VS/pub?gid=0&single=true&output=csv",
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk0bEfVHnPk4c-yNFVHlbVCyZ3QnzmhcZrU1xaSdw83MoBPD5Y-Gj7MjJe4-5juI_ZJF_FFONNj5VS/gviz/tq?tqx=out:csv&gid=0",
      "https://docs.google.com/spreadsheets/d/e/2PACX-1vRk0bEfVHnPk4c-yNFVHlbVCyZ3QnzmhcZrU1xaSdw83MoBPD5Y-Gj7MjJe4-5juI_ZJF_FFONNj5VS/pubhtml?gid=0&single=true"
    ];

    var unknown = "Unknown";
    var gallery = page.querySelector("#hrv-plant-gallery");
    var count = page.querySelector("#hrv-plant-count");
    var search = page.querySelector("#hrv-plant-search");
    var buttons = Array.prototype.slice.call(page.querySelectorAll("[data-hrv-filter]"));
    var plants = [];
    var activeFilter = "all";

    function closeOpener(){
      var opener = page.querySelector(".hrv-opener");
      if(!opener) return;
      opener.classList.add("hrv-opener-gone");
      opener.setAttribute("aria-hidden","true");
    }

    var openerButton = page.querySelector(".hrv-opener-skip");
    if(openerButton){
      openerButton.addEventListener("click", closeOpener);
    }

    setTimeout(closeOpener, 1700);

    function normalize(value){
      return String(value || "").toLowerCase().replace(/[^a-z0-9]/g, "");
    }

    function clean(value){
      var cleaned = String(value == null ? "" : value).replace(/\uFEFF/g, "").trim();
      return cleaned === "" ? unknown : cleaned;
    }

    function raw(value){
      return String(value == null ? "" : value).replace(/\uFEFF/g, "").trim();
    }

    function parseCsv(text){
      var rows = [];
      var row = [];
      var cell = "";
      var inQuotes = false;

      for(var i = 0; i < text.length; i++){
        var character = text[i];
        var next = text[i + 1];

        if(character === '"'){
          if(inQuotes && next === '"'){
            cell += '"';
            i++;
          }else{
            inQuotes = !inQuotes;
          }
        }else if(character === "," && !inQuotes){
          row.push(cell);
          cell = "";
        }else if((character === "\n" || character === "\r") && !inQuotes){
          if(character === "\r" && next === "\n"){
            i++;
          }
          row.push(cell);
          rows.push(row);
          row = [];
          cell = "";
        }else{
          cell += character;
        }
      }

      row.push(cell);
      rows.push(row);

      return rows.filter(function(possibleRow){
        return possibleRow.some(function(possibleCell){
          return raw(possibleCell) !== "";
        });
      });
    }

    function parsePublishedHtml(text){
      var doc = new DOMParser().parseFromString(text, "text/html");
      var tableRows = Array.prototype.slice.call(doc.querySelectorAll("table tr"));

      return tableRows.map(function(tr){
        return Array.prototype.slice.call(tr.querySelectorAll("th,td")).map(function(cell){
          return cell.textContent.replace(/\s+/g, " ").trim();
        });
      }).filter(function(row){
        return row.some(function(cell){
          return raw(cell) !== "";
        });
      });
    }

    function hasHeader(row){
      var headerHits = row.map(normalize);
      return ["owner", "name", "plantnumber", "picturelink", "status", "height", "observations"].some(function(label){
        return headerHits.indexOf(label) !== -1;
      });
    }

    function findIndex(headers, choices, fallback){
      for(var i = 0; i < choices.length; i++){
        var found = headers.indexOf(choices[i]);
        if(found !== -1){
          return found;
        }
      }
      return fallback;
    }

    function rowsToPlants(rows){
      if(!rows.length) return [];

      var firstRowIsHeader = hasHeader(rows[0]);
      var headers = firstRowIsHeader ? rows[0].map(normalize) : [];
      var dataRows = firstRowIsHeader ? rows.slice(1) : rows;

      var nameIndex = findIndex(headers, ["name", "plantname", "plant"], 2);
      var numberIndex = findIndex(headers, ["plantnumber", "plantno", "plantid", "number"], 3);
      var pictureIndex = findIndex(headers, ["picturelink", "pictureurl", "imagelink", "imageurl", "photolink", "photo", "picture", "image"], 4);
      var statusIndex = findIndex(headers, ["status"], 5);
      var heightIndex = findIndex(headers, ["height"], 6);
      var observationIndex = findIndex(headers, ["observations", "observation", "notes", "journal", "journalnote"], 7);

      return dataRows.map(function(row){
        return {
          name: clean(row[nameIndex]),
          plantNumber: clean(row[numberIndex]),
          pictureLink: raw(row[pictureIndex]),
          status: clean(row[statusIndex]),
          height: clean(row[heightIndex]),
          observations: clean(row[observationIndex])
        };
      }).filter(function(plant){
        return [plant.name, plant.plantNumber, plant.pictureLink, plant.status, plant.height, plant.observations].some(function(value){
          return raw(value) !== "" && value !== unknown;
        });
      });
    }

    function makeElement(tag, className, text){
      var element = document.createElement(tag);
      if(className){
        element.className = className;
      }
      if(typeof text === "string"){
        element.textContent = text;
      }
      return element;
    }

    function makeStat(label, value){
      var stat = makeElement("div", "hrv-stat");
      stat.appendChild(makeElement("span", "", label));
      stat.appendChild(makeElement("b", "", value));
      return stat;
    }

    function makeUnknownPhoto(){
      var unknownPhoto = makeElement("div", "hrv-photo-unknown");
      unknownPhoto.appendChild(document.createTextNode(unknown));
      return unknownPhoto;
    }

    function makePlantCard(plant){
      var article = makeElement("article", "hrv-plant-card");
      article.setAttribute("data-status", plant.status);

      var top = makeElement("div", "hrv-card-top");
      var title = makeElement("h3", "", plant.name);
      var badge = makeElement("span", "hrv-plant-badge", "Plant " + plant.plantNumber);
      top.appendChild(title);
      top.appendChild(badge);

      var photoWrap = makeElement("div", "hrv-plant-photo");

      if(plant.pictureLink && plant.pictureLink !== unknown){
        var image = document.createElement("img");
        image.src = plant.pictureLink;
        image.alt = plant.name + " zinnia plant photo";
        image.loading = "lazy";
        image.onerror = function(){
          photoWrap.innerHTML = "";
          photoWrap.appendChild(makeUnknownPhoto());
        };
        photoWrap.appendChild(image);
      }else{
        photoWrap.appendChild(makeUnknownPhoto());
      }

      var statGrid = makeElement("div", "hrv-stat-grid");
      statGrid.appendChild(makeStat("Status", plant.status));
      statGrid.appendChild(makeStat("Height", plant.height));

      var observation = makeElement("div", "hrv-observation");
      observation.appendChild(makeElement("span", "", "Observation"));
      observation.appendChild(makeElement("p", "", plant.observations));

      article.appendChild(top);
      article.appendChild(photoWrap);
      article.appendChild(statGrid);
      article.appendChild(observation);

      return article;
    }

    function plantMatchesFilter(plant){
      var status = normalize(plant.status);
      var mystery = [plant.name, plant.plantNumber, plant.status, plant.height, plant.observations].some(function(value){
        return value === unknown;
      }) || raw(plant.pictureLink) === "";

      if(activeFilter === "all") return true;
      if(activeFilter === "alive") return status.indexOf("alive") !== -1;
      if(activeFilter === "mystery") return mystery;
      if(activeFilter === "bloom") return status.indexOf("bloom") !== -1 || normalize(plant.observations).indexOf("bloom") !== -1;

      if(activeFilter === "needs"){
        var all = normalize(plant.status + " " + plant.observations);
        return all.indexOf("need") !== -1 || all.indexOf("care") !== -1 || all.indexOf("water") !== -1 || all.indexOf("struggl") !== -1 || all.indexOf("wilt") !== -1;
      }

      return true;
    }

    function plantMatchesSearch(plant){
      var query = normalize(search ? search.value : "");
      if(!query) return true;

      var haystack = normalize([
        plant.name,
        plant.plantNumber,
        plant.status,
        plant.height,
        plant.observations
      ].join(" "));

      return haystack.indexOf(query) !== -1;
    }

    function renderPlants(){
      var filtered = plants.filter(function(plant){
        return plantMatchesFilter(plant) && plantMatchesSearch(plant);
      });

      gallery.innerHTML = "";

      if(!filtered.length){
        gallery.appendChild(makeElement("div", "hrv-empty", "Unknown plants match this search right now."));
      }else{
        var fragment = document.createDocumentFragment();
        filtered.forEach(function(plant){
          fragment.appendChild(makePlantCard(plant));
        });
        gallery.appendChild(fragment);
      }

      if(count){
        count.textContent = filtered.length + " of " + plants.length + " plants";
      }
    }

    function setError(message){
      gallery.innerHTML = "";
      gallery.appendChild(makeElement("div", "hrv-error", message || "Unknown. The greenhouse tracker could not be reached right now."));
      if(count){
        count.textContent = "Unknown";
      }
    }

    function fetchWithTimeout(url, timeoutMs){
      var controller = window.AbortController ? new AbortController() : null;
      var timer = null;

      if(controller){
        timer = setTimeout(function(){
          controller.abort();
        }, timeoutMs);
      }

      return fetch(url, {
        cache: "no-store",
        signal: controller ? controller.signal : undefined
      }).then(function(response){
        if(timer) clearTimeout(timer);
        if(!response.ok){
          throw new Error("HTTP " + response.status);
        }
        return response.text();
      }).catch(function(error){
        if(timer) clearTimeout(timer);
        throw error;
      });
    }

    function fetchRowsFromSource(index){
      if(index >= sheetUrls.length){
        return Promise.reject(new Error("No sheet source worked."));
      }

      var url = sheetUrls[index];

      return fetchWithTimeout(url, 9000).then(function(text){
        log("[hrv-zinnia] loaded source", index + 1, url);

        if(url.indexOf("pubhtml") !== -1){
          return parsePublishedHtml(text);
        }

        return parseCsv(text);
      }).then(function(rows){
        if(!rows || !rows.length){
          throw new Error("Sheet source returned no rows.");
        }
        return rows;
      }).catch(function(error){
        log("[hrv-zinnia] source failed", index + 1, error);
        return fetchRowsFromSource(index + 1);
      });
    }

    buttons.forEach(function(button){
      button.addEventListener("click", function(){
        activeFilter = button.getAttribute("data-hrv-filter") || "all";

        buttons.forEach(function(otherButton){
          otherButton.setAttribute("aria-pressed", otherButton === button ? "true" : "false");
        });

        renderPlants();
      });
    });

    if(search){
      search.addEventListener("input", renderPlants);
    }

    if(!gallery){
      return;
    }

    fetchRowsFromSource(0).then(function(rows){
      plants = rowsToPlants(rows);

      if(!plants.length){
        setError("Unknown. The greenhouse tracker opened, but no plant cards were found.");
        return;
      }

      renderPlants();
    }).catch(function(error){
      log("[hrv-zinnia] all sheet sources failed", error);
      setError("Unknown. The greenhouse tracker could not be reached right now.");
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", waitForZinniaPage);
  }else{
    waitForZinniaPage();
  }
})();
