import { validateMushroomSource } from "./contract.js";
import { anatomyArtwork, cutawayArtwork } from "./art.js";
import { createSporeLab, createWonderLab, createDiscoveryQuestions, createRolesLab } from "./labs.js";
import { mushroomPhotoAsset, mushroomPhotoURL } from "./photos.js";
const mushroomMounts=new WeakMap();
function element(tag,className,value){const result=document.createElement(tag);if(className)result.className=className;if(value!==undefined)result.textContent=value;return result;}
function anchor(text,href,className){const result=element('a',className,text);result.href=href;return result;}
function artwork(html){const template=document.createElement('template');template.innerHTML=html;return template.content;}
function paragraphText(parent,value){value.split(/\n\s*\n/u).filter(Boolean).forEach(part=>parent.append(element('p','',part)));}
function sourceImage(reference,className){const image=element('img',className),photo=mushroomPhotoAsset(reference.url);image.src=mushroomPhotoURL(reference.url);image.alt=reference.alt;image.loading='lazy';image.decoding='async';if(photo){image.width=photo.width;image.height=photo.height;}return image;}
export function mountMushroomExhibit(root,source,options){
  if(!(root instanceof HTMLElement))throw new TypeError('Mushroom mount requires an HTMLElement.');
  const existing=mushroomMounts.get(root);if(existing)return existing;
  const settings=options||{};validateMushroomSource(source,{allowDraft:settings.allowDraft===true});
  const original={html:root.innerHTML,className:root.className};const cleanups=[];let destroyed=false;
  const idPrefix=root.id.replace(/[^a-z0-9-]/gi,'-');
  function listen(target,name,handler){target.addEventListener(name,handler);cleanups.push(()=>target.removeEventListener(name,handler));}
  function fitViewport(){root.style.setProperty('--mushroom-viewport-width',document.documentElement.clientWidth+'px');}
  function button(label,handler,className){const b=element('button',className||'mushroom-lab-button',label);b.type='button';listen(b,'click',handler);return b;}
  const panelActivities=new Map();
  function registerActivity(type,activity){if(!panelActivities.has(type))panelActivities.set(type,[]);panelActivities.get(type).push(activity);}
  function attachLab(parent,lab){parent.append(lab.node);registerActivity(parent.closest('[data-block-type]').dataset.blockType,lab);cleanups.push(()=>lab.destroy());}
  let photoDialog,photoDialogTitle,photoDialogContent;
  function creditLine(photo){
    const credit=element('p','mushroom-photo-credit');
    credit.append(anchor(photo.creator,photo.page),document.createTextNode(' · '),anchor(photo.license,photo.licenseUrl),document.createTextNode(' · resized'));
    credit.querySelectorAll('a').forEach(link=>{link.target='_blank';link.rel='noopener noreferrer';});
    return credit;
  }
  function openPhoto(reference){
    const photo=mushroomPhotoAsset(reference.url);
    if(!photoDialog){
      photoDialog=element('dialog','mushroom-photo-dialog');
      photoDialogTitle=element('h2','mushroom-photo-dialog-title');photoDialogTitle.id=idPrefix+'-photo-title';
      photoDialog.setAttribute('aria-labelledby',photoDialogTitle.id);
      photoDialogContent=element('div','mushroom-photo-dialog-content');
      const close=button('Back to the exhibit',()=>photoDialog.close(),'mushroom-photo-close');
      photoDialog.append(close,photoDialogTitle,photoDialogContent);root.append(photoDialog);
      cleanups.push(()=>{if(photoDialog.open)photoDialog.close();});
    }
    photoDialogTitle.textContent=photo?.name||'A closer look';
    const image=sourceImage(reference,'mushroom-photo-full');image.loading='eager';
    photoDialogContent.replaceChildren(image,element('p','mushroom-photo-full-caption',reference.caption));
    if(photo){photoDialogContent.append(element('p','mushroom-photo-subject',photo.subject+' · '+photo.type),creditLine(photo),element('p','mushroom-photo-changes',photo.changes));}
    photoDialog.showModal();
  }
  function photoFigure(reference,className,specimen=false){
    const photo=mushroomPhotoAsset(reference.url),figure=element('figure','mushroom-photo '+(className||''));
    if(photo){figure.dataset.photoId=photo.id;figure.dataset.photoFit=photo.fit;}
    const inspect=button('',()=>openPhoto(reference),'mushroom-photo-inspect');
    inspect.setAttribute('aria-label','Look closer: '+(photo?.name||'photograph'));inspect.setAttribute('aria-haspopup','dialog');
    const image=sourceImage(reference,'mushroom-photo-image'),type=element('span','mushroom-photo-type',photo?.type.split(' · ')[0]||'Photograph');
    if(specimen){
      const window=element('span','mushroom-photo-window');window.append(image,type);inspect.append(window);
      if(photo?.fit==='contain'){
        const plate=element('span','mushroom-specimen-plate');plate.setAttribute('aria-hidden','true');
        plate.append(element('span','mushroom-specimen-view',photo.type.split(' · ')[0]),element('span','mushroom-specimen-name',photo.name));inspect.append(plate);
      }
    }else inspect.append(image,type);
    inspect.append(element('span','mushroom-photo-zoom','Look closer'));
    const caption=element('figcaption','mushroom-photo-caption',reference.caption);figure.append(inspect,caption);if(photo)caption.append(creditLine(photo));
    return figure;
  }
  function sourcesFor(block){
    const refs=new Set(block.sourceRefs);['hotspots','views','cards','steps','experiments','questions'].forEach(key=>(block[key]||[]).forEach(item=>(item.sourceRefs||[]).forEach(ref=>refs.add(ref))));
    if(!refs.size)return null;const details=element('details','mushroom-sources');details.append(element('summary','','Explore the science sources'));const list=element('ul');
    source.data.sources.filter(item=>refs.has(item.id)).forEach(item=>{const li=element('li');li.append(anchor(item.title,item.url));list.append(li);});details.append(list);return details;
  }
  root.className='hrv-mushrooms';root.dataset.hrvState='loading';root.dataset.researchStatus=source.data.meta.researchStatus;root.replaceChildren();fitViewport();listen(window,'resize',fitViewport);
  try {
    const skip=anchor('Skip to the mushroom exhibit','#mushrooms-family','mushroom-skip');
    const nav=element('nav','mushroom-navigation');nav.setAttribute('aria-label','Mushroom exhibit navigation');
    const brand=anchor('Hughes Room Views','https://rmhughes.edublogs.org/','mushroom-brand');
    const mark=element('span','mushroom-brand-mark');mark.setAttribute('aria-hidden','true');mark.append(artwork('<svg viewBox="0 0 40 40" xmlns="http://www.w3.org/2000/svg"><path d="M17 20L15 34H25L23 20" fill="currentColor"/><path d="M4 21Q20 -6 36 21Q20 29 4 21" fill="none" stroke="currentColor" stroke-width="2"/></svg>'));brand.prepend(mark);
    const links=element('div','mushroom-navigation-links'),chapterLinks=[];
    [['01','Fungi up close','discover'],['02','Life in motion','motion'],['03','Our growing story','journal']].forEach(([number,label,target])=>{
      const link=anchor('','#mushrooms-'+target,'mushroom-chapter-link');
      const badge=element('span','chapter-number',number),arrow=element('span','chapter-arrow');badge.setAttribute('aria-hidden','true');arrow.setAttribute('aria-hidden','true');
      link.append(badge,element('span','chapter-label',label),arrow);links.append(link);chapterLinks.push(link);
    });nav.append(brand,links);root.append(skip,nav);
    const main=element('div','mushroom-main');main.id='mushrooms-main';root.append(main);
    source.data.blocks.forEach(block=>{
      const section=element('section','mushroom-block mushroom-section-'+block.type);section.dataset.blockId=block.id;section.dataset.blockType=block.type;section.id='mushrooms-'+block.type;section.setAttribute('aria-labelledby',section.id+'-title');
      const inner=element('div','mushroom-inner');section.append(inner);main.append(section);
      if(block.type==='hero'){
        if(block.media){const custom=sourceImage(block.media,'mushroom-hero-custom');section.prepend(custom);}
        const copy=element('div','mushroom-hero-copy');const title=element('h1','mushroom-hero-title',block.title);title.id=section.id+'-title';
        copy.append(element('p','mushroom-eyebrow',block.eyebrow),title,element('p','mushroom-hero-intro',block.intro));
        const actions=element('div','mushroom-hero-actions');actions.append(anchor('Our growing story','#mushrooms-journal','mushroom-button'),anchor('Explore the hidden world','#mushrooms-discover','mushroom-text-link'));copy.append(actions,element('p','mushroom-hero-note','TWO EXHIBITS. A WORLD TO DISCOVER. OUR OWN GROWING STORY.'));inner.append(copy);
        section.append(element('p','mushroom-art-caption',block.media?.caption||'Imagined woodland artwork · the science starts below'));
        return;
      }
      const heading=element('header','mushroom-section-heading');const h2=element('h2','',block.title);h2.id=section.id+'-title';heading.append(element('p','mushroom-eyebrow',block.eyebrow),h2);if(block.intro)heading.append(element('p','section-intro',block.intro));inner.append(heading);
      if(block.type==='family'){
        const grid=element('div','mushroom-specimens');block.cards.forEach(card=>{
          const article=element('article','mushroom-specimen mushroom-specimen-with-photo');article.dataset.recordId=card.id;
          const title=element('h3','mushroom-specimen-title',card.title);title.id=idPrefix+'-'+card.id.replace(/[^a-z0-9-]/gi,'-');article.setAttribute('aria-labelledby',title.id);article.append(title);
          const copy=element('div','mushroom-specimen-copy');copy.append(element('p','',card.body));
          if(card.media){const figure=photoFigure(card.media,'mushroom-specimen-photo',true);figure.insertBefore(copy,figure.querySelector('figcaption'));article.append(figure);}else article.append(copy);
          grid.append(article);
        });inner.append(grid);
      }else if(block.type==='roles'){
        attachLab(inner,createRolesLab(block.cards,photoFigure,idPrefix));
      }else if(block.type==='anatomy'){
        const layout=element('div','mushroom-anatomy-layout'),diagram=element('div','mushroom-diagram');
        diagram.append(block.media?sourceImage(block.media,'mushroom-diagram-image'):artwork(anatomyArtwork(idPrefix+'-anatomy')));
        const detail=element('div','mushroom-observation-card');detail.id=idPrefix+'-observation';detail.setAttribute('aria-live','polite');const markers=[];
        function choose(point,index){detail.replaceChildren(element('p','mushroom-eyebrow','LOOK CLOSER / '+String(index+1).padStart(2,'0')),element('h3','',point.label),element('p','',point.body));markers.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i)));diagram.dataset.selected=point.id.split(':')[1];}
        block.hotspots.forEach((point,index)=>{const b=button(String(index+1).padStart(2,'0'),()=>choose(point,index),'mushroom-hotspot');b.style.left=point.x+'%';b.style.top=point.y+'%';b.setAttribute('aria-label',point.label);b.setAttribute('aria-controls',detail.id);b.dataset.recordId=point.id;markers.push(b);diagram.append(b);});choose(block.hotspots[0],0);
        const desk=element('div','mushroom-specimen-desk');desk.append(diagram,element('p','mushroom-diagram-note','A model of a gilled mushroom · not a guide for identifying mushrooms'));
        const aside=element('div','mushroom-anatomy-aside');aside.append(detail);if(block.detailMedia)aside.append(photoFigure(block.detailMedia,'mushroom-anatomy-photo'));
        layout.append(desk,aside);inner.append(layout);
      }else if(block.type==='cutaway'){
        const panel=element('div','mushroom-cutaway-panel'),illustration=element('div','mushroom-cutaway-illustration');illustration.append(artwork(cutawayArtwork(idPrefix+"-cutaway")));
        const controls=element('div','mushroom-cutaway-controls'),switcher=element('div','mushroom-view-switch'),explanation=element('div','mushroom-cutaway-copy');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Cutaway view');explanation.setAttribute('aria-live','polite');const buttons=[];let animations=[];
        function chooseView(index){panel.dataset.view=index===0?'surface':'below';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));explanation.replaceChildren(element('h3','',block.views[index].label),element('p','',block.views[index].body));}
        block.views.forEach((view,i)=>{const b=button(view.label,()=>chooseView(i),'');switcher.append(b);buttons.push(b);});chooseView(0);
        const grow=element('button','mushroom-lab-button','Grow the threads');grow.type='button';let growthRun=0;
        const growthStatus=element('p','mushroom-model-status','The mushrooms and the threads below are connected parts of a fungus.');growthStatus.setAttribute('aria-live','polite');
        const pauseGrowth=button('Pause growth',()=>{const paused=pauseGrowth.getAttribute('aria-pressed')!=='true';animations.filter(a=>a.playState===(paused?'running':'paused')).forEach(a=>paused?a.pause():a.play());pauseGrowth.setAttribute('aria-pressed',String(paused));pauseGrowth.textContent=paused?'Resume growth':'Pause growth';});pauseGrowth.disabled=true;pauseGrowth.dataset.actionPriority='secondary';
        // Replace flat-list delays with the illustration's connected parent-first schedule.
        listen(grow,'click',()=>{const ticket=++growthRun;chooseView(1);animations.forEach(a=>a.cancel());pauseGrowth.disabled=false;pauseGrowth.textContent='Pause growth';pauseGrowth.setAttribute('aria-pressed','false');
          const growthStart=document.timeline.currentTime;
          animations=Array.from(illustration.querySelectorAll('.cutaway-network path')).map(path=>{const animation=path.animate([{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:Number(path.dataset.growthDuration)||240,delay:Number(path.dataset.growthStart)||0,easing:'linear',fill:'backwards'});animation.startTime=growthStart;return animation;});growthStatus.textContent='Follow the threads out from each stem base. Growth is greatly sped up.';
          Promise.allSettled(animations.map(a=>a.finished)).then(()=>{if(destroyed||ticket!==growthRun)return;pauseGrowth.disabled=true;growthStatus.textContent='The network has spread. You can replay its growth.';});
        });
        listen(document,'visibilitychange',()=>{if(document.hidden){animations.filter(a=>a.playState==='running').forEach(a=>a.pause());if(!pauseGrowth.disabled){pauseGrowth.setAttribute('aria-pressed','true');pauseGrowth.textContent='Resume growth';}}});
        registerActivity('cutaway',{suspend(){animations.filter(a=>a.playState==='running').forEach(a=>a.pause());if(!pauseGrowth.disabled){pauseGrowth.setAttribute('aria-pressed','true');pauseGrowth.textContent='Resume growth';}}});
        cleanups.push(()=>animations.forEach(a=>a.cancel()));const growthActions=element('div','mushroom-lab-actions');growthActions.append(grow,pauseGrowth);controls.append(switcher,explanation,growthActions,growthStatus,element('p','mushroom-diagram-note','A model through soil and wood. Threads are enlarged and highlighted, not naturally glowing.'));panel.append(illustration,controls);inner.append(panel);
        if(block.media)panel.append(photoFigure(block.media,'mushroom-cutaway-photo'));
      }else if(block.type==='lifecycle'){
        attachLab(inner,createSporeLab(block.video,block.plumeVideo,block.steps,photoFigure,idPrefix));

      }else if(block.type==='lab')attachLab(inner,createWonderLab(block.experiments,photoFigure));
      else if(block.type==='facts'){
        const grid=element('div','mushroom-fact-grid');block.cards.forEach((fact,i)=>{const card=element('article','mushroom-fact');card.dataset.recordId=fact.id;const symbol=element('span','mushroom-fact-mark',String(i+1).padStart(2,'0'));symbol.setAttribute('aria-hidden','true');card.append(symbol,element('h3','',fact.title),element('p','',fact.body));grid.append(card);});inner.append(grid);attachLab(inner,createDiscoveryQuestions(block.questions));
      }else if(block.type==='journal'){
        const notebook=element('div','mushroom-journal-placeholder');notebook.append(element('span','mushroom-journal-year','2026 / 2027'),element('h3','','The next chapter is ours.'),element('p','','Our classroom journal is getting ready. Come back for our growing story.'));inner.append(notebook);
      }
      const sources=sourcesFor(block);if(sources)inner.append(sources);
    });
    const stationControllers=[];
    function learningStation(id,number,title,intro,panels){
      panels=panels.filter(([type])=>root.querySelector('#mushrooms-'+type));if(!panels.length)return;
      const station=element('section','mushroom-learning-station');station.id=id;station.setAttribute('aria-labelledby',id+'-title');
      const wrap=element('div','mushroom-station-inner'),head=element('header','mushroom-station-heading'),titleWrap=element('div');
      const stationTitle=element('h2','',title);stationTitle.id=id+'-title';titleWrap.append(element('p','mushroom-eyebrow','EXHIBIT / '+number),stationTitle);head.append(titleWrap,element('p','mushroom-station-intro',intro),anchor('Our growing story','#mushrooms-journal','mushroom-station-journal'));
      const tabs=element('div','mushroom-station-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',title);
      const content=element('div','mushroom-station-content'),buttons=[],sections=[];
      function select(index,focus=false){
        sections.forEach((panel,i)=>{panel.hidden=i!==index;buttons[i].setAttribute('aria-selected',String(i===index));buttons[i].tabIndex=i===index?0:-1;if(i!==index)(panelActivities.get(panel.dataset.blockType)||[]).forEach(lab=>lab.suspend?.());});
        station.dataset.activePanel=sections[index].dataset.blockType;if(focus)buttons[index].focus();
      }
      panels.forEach(([type,label],index)=>{
        const panel=root.querySelector('#mushrooms-'+type);if(!panel)return;const tab=button(label,()=>{select(index);history.replaceState(null,'','#'+panel.id);},'mushroom-station-tab');tab.id=id+'-tab-'+type;tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);panel.setAttribute('role','tabpanel');panel.setAttribute('aria-labelledby',tab.id);panel.tabIndex=0;
        listen(tab,'keydown',event=>{let next=index;if(event.key==='ArrowRight')next=(index+1)%panels.length;else if(event.key==='ArrowLeft')next=(index+panels.length-1)%panels.length;else if(event.key==='Home')next=0;else if(event.key==='End')next=panels.length-1;else return;event.preventDefault();select(next,true);history.replaceState(null,'','#'+sections[next].id);});
        buttons.push(tab);sections.push(panel);tabs.append(tab);content.append(panel);
      });
      wrap.append(head,tabs,content);station.append(wrap);main.insertBefore(station,root.querySelector('#mushrooms-journal'));select(0);stationControllers.push({sections,select});
    }
    learningStation('mushrooms-discover','01','Fungi up close','Pick an exhibit. Meet real fungi, peek under a cap, and uncover the hidden network.',[['family','Meet the kingdom'],['anatomy','Inside a mushroom'],['cutaway','Hidden threads'],['roles','Fungi at work']]);
    learningStation('mushrooms-motion','02','Life in motion','Follow a spore, watch a real cloud, and explore light and sound. What will you notice?', [['lifecycle','Spores & growing'],['lab','Light & sound'],['facts','Try it yourself']]);
    function revealHash(){const target=root.querySelectorAll('[id]');const panel=Array.from(target).find(node=>'#'+node.id===location.hash)?.closest('[role=tabpanel]');if(!panel)return;for(const station of stationControllers){const index=station.sections.indexOf(panel);if(index>=0)station.select(index);}}
    listen(window,'hashchange',revealHash);
    listen(root,'click',event=>{const link=event.target.closest('a[href]');if(!link)return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search)return;const panel=Array.from(root.querySelectorAll('[role=tabpanel]')).find(node=>'#'+node.id===url.hash);if(panel)for(const station of stationControllers){const index=station.sections.indexOf(panel);if(index>=0)station.select(index);}});
    revealHash();
    // Track the section at the reading edge without changing scroll position or history.
    const chapters=chapterLinks.map(link=>root.querySelector(link.getAttribute('href')));let chapterFrame=0;
    function updateChapter(){
      chapterFrame=0;if(destroyed)return;
      const edge=nav.getBoundingClientRect().bottom+24;let current=-1;
      chapters.forEach((section,index)=>{if(section.getBoundingClientRect().top<=edge)current=index;});
      if(chapters.at(-1).getBoundingClientRect().top<window.innerHeight&&document.documentElement.getBoundingClientRect().bottom<=window.innerHeight+2)current=chapters.length-1;
      chapterLinks.forEach((link,index)=>{if(index===current)link.setAttribute('aria-current','location');else link.removeAttribute('aria-current');});
    }
    function scheduleChapter(){if(!chapterFrame)chapterFrame=requestAnimationFrame(updateChapter);}
    listen(window,'scroll',scheduleChapter);listen(window,'resize',scheduleChapter);listen(window,'hashchange',scheduleChapter);
    const chapterObserver=new ResizeObserver(scheduleChapter);chapterObserver.observe(main);cleanups.push(()=>{chapterObserver.disconnect();cancelAnimationFrame(chapterFrame);});scheduleChapter();
    const footer=element('footer','mushroom-footer');footer.append(element('span','','Hughes Room Views · Keep wondering.'),anchor('Back to Classroom Explorations','https://rmhughes.edublogs.org/hub/'));root.append(footer);
    const observer=new ResizeObserver(fitViewport);observer.observe(document.documentElement);cleanups.push(()=>observer.disconnect());root.dataset.hrvState='ready';
  }catch(error){cleanups.forEach(f=>f());root.innerHTML=original.html;root.className=original.className;root.removeAttribute('data-hrv-state');root.removeAttribute('data-research-status');root.style.removeProperty('--mushroom-viewport-width');throw error;}
  const controller={destroy(){if(destroyed)return;destroyed=true;cleanups.forEach(f=>f());root.innerHTML=original.html;root.className=original.className;root.removeAttribute('data-hrv-state');root.removeAttribute('data-research-status');root.style.removeProperty('--mushroom-viewport-width');mushroomMounts.delete(root);}};
  mushroomMounts.set(root,controller);return controller;
}
