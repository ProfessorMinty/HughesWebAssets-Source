(function(){
  "use strict";

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

    function copyFallback(text){
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

    document.addEventListener("click",function(event){
      var button = event.target.closest ? event.target.closest("[data-copy-target]") : null;
      if(!button) return;

      var text = getText(button.getAttribute("data-copy-target"));
      if(!text) return;

      if(navigator.clipboard && navigator.clipboard.writeText){
        navigator.clipboard.writeText(text).then(function(){
          showToast("Copied!");
        }).catch(function(){
          copyFallback(text);
        });
      }else{
        copyFallback(text);
      }
    });
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",setupCopyButtons,{once:true});
  }else{
    setupCopyButtons();
  }
})();
