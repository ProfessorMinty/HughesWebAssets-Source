(function(){
  "use strict";

  var stage = document.querySelector(".ngb-stage");
  if(!stage || stage.getAttribute("data-ngb-runtime") === "ready") return;
  stage.setAttribute("data-ngb-runtime","ready");
  stage.classList.add("ngb-js");

  function showAllReveals(){
    stage.querySelectorAll(".reveal").forEach(function(el){
      el.classList.add("is-visible");
    });
  }

  function setupReveal(){
    var items = Array.prototype.slice.call(stage.querySelectorAll(".reveal"));
    if(!items.length) return;

    if(!("IntersectionObserver" in window)){
      showAllReveals();
      return;
    }

    var observer = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add("is-visible");
          observer.unobserve(entry.target);
        }
      });
    },{threshold:0.12});

    items.forEach(function(el){ observer.observe(el); });
  }

  function setupNightOverlay(){
    var svg = document.getElementById("bat-night-svg");
    if(!svg) return;

    var mask = svg.querySelector("#batNightMask");
    if(!mask) return;

    var ns = "http://www.w3.org/2000/svg";
    var ticking = false;

    function makeRect(x,y,w,h,rx){
      var rect = document.createElementNS(ns,"rect");
      rect.setAttribute("x",x.toFixed(2));
      rect.setAttribute("y",y.toFixed(2));
      rect.setAttribute("width",w.toFixed(2));
      rect.setAttribute("height",h.toFixed(2));
      rect.setAttribute("rx",rx);
      rect.setAttribute("ry",rx);
      rect.setAttribute("fill","white");
      return rect;
    }

    function updateMask(){
      var vw = window.innerWidth;
      var vh = window.innerHeight;
      svg.setAttribute("viewBox","0 0 " + vw + " " + vh);

      while(mask.children.length > 1){
        mask.removeChild(mask.lastChild);
      }

      var padding = 18;
      var radius = 22;
      stage.querySelectorAll(".ngb-hero, .ngb-sec").forEach(function(el){
        var box = el.getBoundingClientRect();
        if(box.bottom < -50 || box.top > vh + 50) return;

        var x = Math.max(0,box.left - padding);
        var y = Math.max(0,box.top - padding);
        var width = Math.min(vw - x,box.width + padding * 2);
        var height = Math.min(vh - y,box.height + padding * 2);
        if(width > 0 && height > 0){
          mask.appendChild(makeRect(x,y,width,height,radius));
        }
      });
    }

    function requestUpdate(){
      if(ticking) return;
      ticking = true;
      window.requestAnimationFrame(function(){
        updateMask();
        ticking = false;
      });
    }

    window.addEventListener("scroll",requestUpdate,{passive:true});
    window.addEventListener("resize",requestUpdate);
    window.addEventListener("orientationchange",requestUpdate);
    window.addEventListener("load",requestUpdate,{once:true});

    if("ResizeObserver" in window){
      var resizeObserver = new ResizeObserver(requestUpdate);
      resizeObserver.observe(stage);
    }

    updateMask();
  }

  function init(){
    setupReveal();
    setupNightOverlay();
  }

  if(document.readyState === "loading"){
    document.addEventListener("DOMContentLoaded",init,{once:true});
  }else{
    init();
  }
})();
