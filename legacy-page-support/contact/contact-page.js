(function(){
  "use strict";

  function normalizedText(el){
    return (el && el.textContent ? el.textContent : "").replace(/\s+/g," ").trim();
  }

  function isProtected(el){
    if(!el) return true;
    if(el.matches && el.matches("html,body,#page,#content,.site-content,.entry-content,.post-content,main,article")) return true;
    if(el.classList && el.classList.contains("ctc")) return true;
    if(el.querySelector && el.querySelector(".ctc")) return true;
    return false;
  }

  function findHelperSeed(){
    var nodes = document.querySelectorAll("h1,h2,h3,h4,p,a,button,span,strong,div,section,aside");
    for(var i=0;i<nodes.length;i++){
      var el = nodes[i];
      if(el.closest && el.closest(".ctc")) continue;
      var text = normalizedText(el);
      if(text.indexOf("Website Helper Reset") !== -1 || text.indexOf("Restore Navigation Helper") !== -1){
        return el;
      }
    }

    /* Fallback for the illustrated helper after its text has already been stripped. */
    var images = document.querySelectorAll("img");
    for(var j=0;j<images.length;j++){
      var img = images[j];
      if(img.closest && img.closest(".ctc")) continue;
      var alt = String(img.getAttribute("alt") || "").toLowerCase();
      var title = String(img.getAttribute("title") || "").toLowerCase();
      if(alt.indexOf("psst") !== -1 || title.indexOf("psst") !== -1 || alt.indexOf("helper") !== -1 || title.indexOf("helper") !== -1){
        return img;
      }
    }

    return null;
  }

  function removeLegacyHelperReset(){
    var seed = findHelperSeed();
    if(!seed) return false;

    var target = seed;
    var parent = target.parentElement;

    /* Climb to the outermost helper-only wrapper, but never cross into the
       Contact app or the WordPress content/article containers. */
    while(parent && !isProtected(parent)){
      target = parent;
      parent = parent.parentElement;
    }

    if(target && target.parentNode && !isProtected(target)){
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
      },1200);
    }

    function getText(selector){
      var el = document.querySelector(selector);
      if(!el) return "";
      return (el.textContent || el.value || "").trim();
    }

    document.addEventListener("click",function(event){
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
      if(attempts >= 20) clearInterval(timer);
    },350);

    if(window.MutationObserver){
      var observer = new MutationObserver(function(){
        removeLegacyHelperReset();
      });
      observer.observe(document.documentElement,{childList:true,subtree:true});
      setTimeout(function(){ observer.disconnect(); },10000);
    }
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();
