(function(){
  "use strict";

  function removeLegacyHelperReset(){
    var candidates = Array.prototype.slice.call(
      document.querySelectorAll("section,article,aside,div,.widget,.wp-block-group,.wp-block-html")
    ).filter(function(el){
      if(el.closest && el.closest(".ctc")) return false;
      var text = (el.textContent || "").replace(/\s+/g," ").trim();
      return text.indexOf("Website Helper Reset") !== -1 &&
             text.indexOf("Restore Navigation Helper") !== -1;
    });

    if(!candidates.length) return false;

    candidates.sort(function(a,b){
      return (a.textContent || "").length - (b.textContent || "").length;
    });

    var target = candidates[0];
    if(target && target.parentNode){
      target.parentNode.removeChild(target);
      return true;
    }
    return false;
  }

  function setupCopyButtons(){
    var toast = document.getElementById("ctcToast");
    if(!toast) return;

    var hideTimer;

    function showToast(message){
      toast.textContent = message || "Copied!";
      toast.classList.add("show");
      clearTimeout(hideTimer);
      hideTimer = setTimeout(function(){
        toast.classList.remove("show");
      }, 1200);
    }

    function getText(selector){
      var el = document.querySelector(selector);
      if(!el) return "";
      return (el.textContent || el.value || "").trim();
    }

    document.addEventListener("click", function(event){
      var btn = event.target.closest ? event.target.closest("[data-copy-target]") : null;
      if(!btn) return;

      var text = getText(btn.getAttribute("data-copy-target"));
      if(!text) return;

      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          showToast("Copied!");
        }).catch(function(){
          showToast("Copy failed");
        });
      }else{
        var textarea = document.createElement("textarea");
        textarea.value = text;
        textarea.setAttribute("readonly","");
        textarea.style.position = "fixed";
        textarea.style.opacity = "0";
        document.body.appendChild(textarea);
        textarea.select();
        try{
          document.execCommand("copy");
          showToast("Copied!");
        }catch(error){
          showToast("Copy failed");
        }
        document.body.removeChild(textarea);
      }
    });
  }

  function init(){
    setupCopyButtons();
    removeLegacyHelperReset();

    var attempts = 0;
    var timer = setInterval(function(){
      attempts++;
      removeLegacyHelperReset();
      if(attempts >= 12){
        clearInterval(timer);
      }
    }, 500);

    if(window.MutationObserver){
      var observer = new MutationObserver(function(){
        removeLegacyHelperReset();
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(function(){ observer.disconnect(); }, 8000);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded", init, {once:true});
  }else{
    init();
  }
})();
