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
  const panelActivities=new Map(),blockControllers=new Map();
  function registerActivity(type,activity){if(!panelActivities.has(type))panelActivities.set(type,[]);panelActivities.get(type).push(activity);}
  function attachLab(parent,lab){blockControllers.set(parent.closest('[data-block-type]').dataset.blockType,lab);parent.append(lab.node);registerActivity(parent.closest('[data-block-type]').dataset.blockType,lab);cleanups.push(()=>lab.destroy());}
  let photoDialog,photoDialogTitle,photoDialogContent,photoOpener;
  function learningNotes(learning){
    const bar=element('div','mushroom-learning-notes');
    if(learning.action)bar.append(element('p','mushroom-instruction',learning.action));
    if(learning.observe){const prompt=element('p','mushroom-observe');prompt.append(element('strong','','Notice: '),document.createTextNode(learning.observe));bar.append(prompt);}
    if(learning.safety)bar.append(element('p','mushroom-safety-rule',learning.safety));
    if(learning.words.length||learning.teacher){const details=element('details','mushroom-science-words');details.append(element('summary','','Science words & teacher notes'));const dl=element('dl');learning.words.forEach(word=>{const term=element('dt','',word.term);if(word.pronunciation)term.append(element('span','mushroom-pronunciation',' · '+word.pronunciation));dl.append(term,element('dd','',word.body));});if(learning.words.length)details.append(dl);if(learning.teacher)details.append(element('p','',learning.teacher));bar.append(details);}
    return bar;
  }
  function creditLine(photo){
    const credit=element('p','mushroom-photo-credit');
    credit.append(anchor(photo.creator,photo.page),document.createTextNode(' · '),anchor(photo.license,photo.licenseUrl),document.createTextNode(' · resized'));
    credit.querySelectorAll('a').forEach(link=>{link.target='_blank';link.rel='noopener noreferrer';});
    return credit;
  }
  function openPhoto(reference){
    photoOpener=document.activeElement;
    const photo=mushroomPhotoAsset(reference.url);
    if(!photoDialog){
      photoDialog=element('dialog','mushroom-photo-dialog');
      photoDialogTitle=element('h2','mushroom-photo-dialog-title');photoDialogTitle.id=idPrefix+'-photo-title';
      photoDialog.setAttribute('aria-labelledby',photoDialogTitle.id);
      photoDialogContent=element('div','mushroom-photo-dialog-content');
      const close=button('Back to the exhibit',()=>photoDialog.close(),'mushroom-photo-close');
      photoDialog.append(close,photoDialogTitle,photoDialogContent);root.append(photoDialog);
      listen(photoDialog,'close',()=>{if(photoOpener?.isConnected)photoOpener.focus({preventScroll:true});});
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
    inspect.setAttribute('aria-label','Enlarge the photograph: '+(photo?.name||reference.alt));inspect.setAttribute('aria-haspopup','dialog');
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
    const refs=new Set();function collect(value){if(!value||typeof value!=='object')return;if(Array.isArray(value.sourceRefs))value.sourceRefs.forEach(ref=>refs.add(ref));Object.values(value).forEach(item=>{if(Array.isArray(item))item.forEach(collect);else if(item&&typeof item==='object')collect(item);});}collect(block);
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
        const journalReady=source.data.blocks.find(b=>b.type==='journal').entries.length>0;
        const actions=element('div','mushroom-hero-actions');actions.append(anchor(block.entry.exploreLabel,'#mushrooms-discover','mushroom-button'),anchor(journalReady?block.entry.journalReadyLabel:block.entry.journalLabel,'#mushrooms-journal','mushroom-text-link'));copy.append(actions,element('p','mushroom-hero-note',block.entry.note));inner.append(copy);
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
        attachLab(inner,createRolesLab(block,photoFigure,idPrefix,learningNotes));
      }else if(block.type==='anatomy'){
        const layout=element('div','mushroom-anatomy-layout'),diagram=element('div','mushroom-diagram');
        diagram.append(block.media?sourceImage(block.media,'mushroom-diagram-image'):artwork(anatomyArtwork(idPrefix+'-anatomy')));
        const detail=element('div','mushroom-observation-card');detail.id=idPrefix+'-observation';detail.setAttribute('aria-live','polite');const markers=[],partButtons=[],mapNumbers=[],gillPhoto=block.detailMedia?photoFigure(block.detailMedia,'mushroom-anatomy-photo'):null;
        const partList=element('div','mushroom-anatomy-parts');partList.setAttribute('role','group');partList.setAttribute('aria-label','Mushroom parts');
        function choose(point,index){detail.replaceChildren(element('p','mushroom-eyebrow','PART '+String(index+1).padStart(2,'0')+' OF '+block.hotspots.length),element('h3','',point.label),element('p','',point.body));[markers,partButtons].forEach(list=>list.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i))));mapNumbers.forEach((mark,i)=>mark.dataset.selected=String(i===index));if(gillPhoto)gillPhoto.hidden=point.id!=='mushroom-point:gills';diagram.dataset.selected=point.id.split(':')[1];}
        block.hotspots.forEach((point,index)=>{const b=button(String(index+1).padStart(2,'0'),()=>choose(point,index),'mushroom-hotspot');b.style.left=point.x+'%';b.style.top=point.y+'%';b.setAttribute('aria-label','Part '+String(index+1)+': '+point.label);b.setAttribute('aria-controls',detail.id);b.dataset.recordId=point.id;markers.push(b);diagram.append(b);const mapNumber=element('span','mushroom-map-number',String(index+1).padStart(2,'0'));mapNumber.setAttribute('aria-hidden','true');mapNumber.style.left=point.x+'%';mapNumber.style.top=point.y+'%';mapNumbers.push(mapNumber);diagram.append(mapNumber);const named=button(String(index+1).padStart(2,'0')+' · '+point.label,()=>choose(point,index),'mushroom-part-button');named.setAttribute('aria-controls',detail.id);partButtons.push(named);partList.append(named);});choose(block.hotspots[0],0);
        const desk=element('div','mushroom-specimen-desk');desk.append(diagram,element('p','mushroom-diagram-note','A model of a gilled mushroom · not a guide for identifying mushrooms'));
        const aside=element('div','mushroom-anatomy-aside');aside.append(partList,detail);if(gillPhoto)aside.append(gillPhoto);
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
        attachLab(inner,createSporeLab(block,photoFigure,idPrefix));

      }else if(block.type==='lab')attachLab(inner,createWonderLab(block.experiments,photoFigure,learningNotes));
      else if(block.type==='facts'){
        const grid=element('div','mushroom-fact-grid');block.cards.forEach((fact,i)=>{const card=element('article','mushroom-fact');card.dataset.recordId=fact.id;const symbol=element('span','mushroom-fact-mark',String(i+1).padStart(2,'0'));symbol.setAttribute('aria-hidden','true');card.append(symbol,element('h3','',fact.title),element('p','',fact.body));grid.append(card);});inner.append(grid);attachLab(inner,createDiscoveryQuestions(block.questions));
      }else if(block.type==='journal'){
        const notebook=element('div','mushroom-journal-placeholder');notebook.append(element('span','mushroom-journal-year','2026 / 2027'),element('h3','','The next chapter is ours.'),element('p','','Our classroom journal is getting ready. Come back for our growing story.'));inner.append(notebook);
      }
      const notes=learningNotes(block.type==='roles'?{...block.learning,action:'',observe:'',words:[]}:block.learning);notes.dataset.blockNotes=block.type;inner.append(notes);const sources=sourcesFor(block);if(sources)inner.append(sources);
    });
    const stationControllers=[];
    function learningStation(id,number,stationCopy,entries){
      const station=element('section','mushroom-learning-station');station.id=id;station.setAttribute('aria-labelledby',id+'-title');station.tabIndex=-1;
      const wrap=element('div','mushroom-station-inner'),head=element('header','mushroom-station-heading'),titleWrap=element('div');
      const stationTitle=element('h2','',stationCopy.title);stationTitle.id=id+'-title';titleWrap.append(element('p','mushroom-eyebrow','EXHIBIT / '+number),stationTitle);head.append(titleWrap,element('p','mushroom-station-intro',stationCopy.intro));
      const tabs=element('div','mushroom-station-tabs');tabs.setAttribute('role','tablist');tabs.setAttribute('aria-label',stationCopy.title);
      const pickerLabel=element('label','mushroom-activity-picker','Choose an investigation');const picker=element('select');picker.setAttribute('aria-label','Choose an investigation in '+stationCopy.title);pickerLabel.append(picker);
      const content=element('div','mushroom-station-content'),buttons=[],sections=[];
      const panels=[...new Set(entries.map(entry=>root.querySelector('#mushrooms-'+entry.type)))];
      const next=button('',()=>{const index=Number(station.dataset.activeIndex);if(index+1<entries.length)select(index+1,{focusPanel:true,history:true,scroll:true});else if(id==='mushrooms-discover'){stationControllers.find(c=>c.station.id==='mushrooms-motion').select(0);goTo('#mushrooms-motion');}else goTo('#mushrooms-journal');},'mushroom-next');
      function select(index,options={}){
        const entry=entries[index],active=root.querySelector('#mushrooms-'+entry.type);
        panels.forEach(panel=>{panel.hidden=panel!==active;(panelActivities.get(panel.dataset.blockType)||[]).forEach(lab=>lab.suspend?.());});
        buttons.forEach((tab,i)=>{tab.setAttribute('aria-selected',String(i===index));tab.tabIndex=i===index?0:-1;});
        picker.value=String(index);picker.setAttribute('aria-controls',active.id);station.dataset.activeIndex=String(index);station.dataset.activePanel=entry.view||entry.type;active.setAttribute('aria-labelledby',buttons[index].id);
        if(entry.view)blockControllers.get(entry.type)?.select(entry.view);
        const block=source.data.blocks.find(b=>b.type===entry.type),context=entry.view?(entry.type==='lifecycle'?block.activities.find(a=>a.view===entry.view):block.experiments.find(a=>a.mode===entry.view)):block;
        active.querySelector('.mushroom-section-heading h2').textContent=context.title;
        active.querySelector('.section-intro').textContent=context.intro||context.body;
        const combined=entry.type==='roles'?{...block.learning,action:'',observe:'',words:[]}:entry.view?{...context.learning,words:[...context.learning.words,...block.learning.words],teacher:[context.learning.teacher,block.learning.teacher].filter(Boolean).join(' ')}:context.learning;
        const notes=learningNotes(combined);notes.dataset.blockNotes=entry.type;
        active.querySelector('[data-block-notes]').replaceWith(notes);
        next.textContent=index+1<entries.length?'Next: '+entries[index+1].label:id==='mushrooms-discover'?'Next: Life in motion':'Next: Our growing story';
        if(options.focusTab)buttons[index].focus();
        if(options.history)history.replaceState(null,'','#'+entry.target);
        if(options.scroll)active.scrollIntoView({block:'start',behavior:'instant'});
        if(options.focusPanel)active.focus({preventScroll:true});
      }
      entries.forEach((entry,index)=>{
        const panel=root.querySelector('#mushrooms-'+entry.type),tab=button(entry.label,()=>select(index,{history:true}),'mushroom-station-tab');tab.id=id+'-tab-'+(entry.view||entry.type);tab.setAttribute('role','tab');tab.setAttribute('aria-controls',panel.id);panel.setAttribute('role','tabpanel');panel.tabIndex=0;
        listen(tab,'keydown',event=>{let nextIndex=index;if(event.key==='ArrowRight')nextIndex=(index+1)%entries.length;else if(event.key==='ArrowLeft')nextIndex=(index+entries.length-1)%entries.length;else if(event.key==='Home')nextIndex=0;else if(event.key==='End')nextIndex=entries.length-1;else return;event.preventDefault();select(nextIndex,{focusTab:true,history:true});});
        const option=element('option','',entry.label);option.value=String(index);picker.append(option);buttons.push(tab);sections.push(panel);tabs.append(tab);
      });
      listen(picker,'change',()=>select(Number(picker.value),{history:true}));
      panels.forEach(panel=>content.append(panel));head.append(next);wrap.append(head,tabs,pickerLabel,content);station.append(wrap);main.insertBefore(station,root.querySelector('#mushrooms-journal'));select(0);stationControllers.push({station,entries,select});
    }
    const familyBlock=source.data.blocks.find(b=>b.type==='family'),lifeBlock=source.data.blocks.find(b=>b.type==='lifecycle'),labBlock=source.data.blocks.find(b=>b.type==='lab');
    learningStation('mushrooms-discover','01',familyBlock.station,[['family','Meet the kingdom'],['anatomy','Inside a mushroom'],['cutaway','Hidden threads'],['roles','Fungi at work']].map(([type,label])=>({type,label,target:'mushrooms-'+type})));
    learningStation('mushrooms-motion','02',lifeBlock.station,[...lifeBlock.activities.map(activity=>({type:'lifecycle',view:activity.view,label:activity.label,target:'mushrooms-'+activity.view})),...labBlock.experiments.map(activity=>({type:'lab',view:activity.mode,label:activity.label,target:'mushrooms-'+activity.mode})),{type:'facts',label:'Explorer questions',target:'mushrooms-facts'}]);
    function resolveDestination(hash){
      const value=hash.slice(1);
      for(const controller of stationControllers){
        let index=controller.entries.findIndex(entry=>entry.target===value);
        // Historical block links keep their former first activity as the landing view.
        if(index<0&&['mushrooms-lifecycle','mushrooms-lab'].includes(value))index=controller.entries.findIndex(entry=>'mushrooms-'+entry.type===value);
        if(index>=0)return {controller,index};
      }
      const target=Array.from(root.querySelectorAll('[id]')).find(node=>node.id===value),panel=target?.closest('[role=tabpanel]');
      if(panel)for(const controller of stationControllers){const index=controller.entries.findIndex(entry=>'mushrooms-'+entry.type===panel.id);if(index>=0)return {controller,index};}
      return null;
    }
    function revealHash(){const destination=resolveDestination(location.hash);if(destination)destination.controller.select(destination.index);}
    function goTo(hash,push=true){
      const destination=resolveDestination(hash);if(destination)destination.controller.select(destination.index);
      const target=destination?root.querySelector('#mushrooms-'+destination.controller.entries[destination.index].type):Array.from(root.querySelectorAll('[id]')).find(node=>'#'+node.id===hash);
      if(!target)return;if(push&&location.hash!==hash)history.pushState(null,'',hash);target.tabIndex=target.tabIndex<0?-1:target.tabIndex;target.scrollIntoView({block:'start',behavior:'instant'});target.focus({preventScroll:true});scheduleChapter();
    }
    listen(window,'hashchange',()=>{revealHash();goTo(location.hash,false);});listen(window,'popstate',()=>{revealHash();goTo(location.hash,false);});
    listen(root,'click',event=>{const link=event.target.closest('a[href]');if(!link)return;const url=new URL(link.href,location.href);if(url.origin!==location.origin||url.pathname!==location.pathname||url.search!==location.search||!url.hash)return;const known=resolveDestination(url.hash)||Array.from(root.querySelectorAll('[id]')).some(node=>'#'+node.id===url.hash);if(known){event.preventDefault();if(link.matches('.mushroom-hero-actions .mushroom-button'))stationControllers.find(c=>c.station.id==='mushrooms-discover').select(0);goTo(url.hash);}});
    revealHash();
    // Track the section at the reading edge without changing scroll position or history.
    const navObserver=new ResizeObserver(()=>root.style.setProperty('--mushroom-nav-height',Math.ceil(nav.getBoundingClientRect().height)+'px'));navObserver.observe(nav);cleanups.push(()=>navObserver.disconnect());
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
    let initialFrame=requestAnimationFrame(()=>{if(location.hash)goTo(location.hash,false);});cleanups.push(()=>cancelAnimationFrame(initialFrame));
    const footer=element('footer','mushroom-footer');footer.append(element('span','','Hughes Room Views · Keep wondering.'),anchor('Back to Classroom Explorations','https://rmhughes.edublogs.org/hub/'));root.append(footer);
    const observer=new ResizeObserver(fitViewport);observer.observe(document.documentElement);cleanups.push(()=>observer.disconnect());root.dataset.hrvState='ready';
  }catch(error){cleanups.forEach(f=>f());root.innerHTML=original.html;root.className=original.className;root.removeAttribute('data-hrv-state');root.removeAttribute('data-research-status');root.style.removeProperty('--mushroom-viewport-width');root.style.removeProperty('--mushroom-nav-height');throw error;}
  const controller={destroy(){if(destroyed)return;destroyed=true;cleanups.forEach(f=>f());root.innerHTML=original.html;root.className=original.className;root.removeAttribute('data-hrv-state');root.removeAttribute('data-research-status');root.style.removeProperty('--mushroom-viewport-width');root.style.removeProperty('--mushroom-nav-height');mushroomMounts.delete(root);}};
  mushroomMounts.set(root,controller);return controller;
}
