import { validateMushroomSource } from "./contract.js";
import { anatomyArtwork, cutawayArtwork, specimenArtwork } from "./art.js";
import { createSporeLab, createWonderLab, createDiscoveryQuestions } from "./labs.js";
const mushroomMounts=new WeakMap();
function element(tag,className,value){const result=document.createElement(tag);if(className)result.className=className;if(value!==undefined)result.textContent=value;return result;}
function anchor(text,href,className){const result=element('a',className,text);result.href=href;return result;}
function artwork(html){const template=document.createElement('template');template.innerHTML=html;return template.content;}
function paragraphText(parent,value){value.split(/\n\s*\n/u).filter(Boolean).forEach(part=>parent.append(element('p','',part)));}
function sourceImage(reference,className){const image=element('img',className);image.src=reference.url;image.alt=reference.alt;image.loading='lazy';image.decoding='async';return image;}
export function mountMushroomExhibit(root,source,options){
  if(!(root instanceof HTMLElement))throw new TypeError('Mushroom mount requires an HTMLElement.');
  const existing=mushroomMounts.get(root);if(existing)return existing;
  const settings=options||{};validateMushroomSource(source,{allowDraft:settings.allowDraft===true});
  const original={html:root.innerHTML,className:root.className};const cleanups=[];let destroyed=false;
  const idPrefix=root.id.replace(/[^a-z0-9-]/gi,'-');
  function listen(target,name,handler){target.addEventListener(name,handler);cleanups.push(()=>target.removeEventListener(name,handler));}
  function fitViewport(){root.style.setProperty('--mushroom-viewport-width',document.documentElement.clientWidth+'px');}
  function button(label,handler,className){const b=element('button',className||'mushroom-lab-button',label);b.type='button';listen(b,'click',handler);return b;}
  function attachLab(parent,lab){parent.append(lab.node);cleanups.push(()=>lab.destroy());}
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
    const links=element('div','mushroom-navigation-links');links.append(anchor('Explorations','https://rmhughes.edublogs.org/hub/'),anchor('The exhibit','#mushrooms-family'),anchor('Field journal','#mushrooms-journal'));nav.append(brand,links);root.append(skip,nav);
    const main=element('div','mushroom-main');main.id='mushrooms-main';root.append(main);
    source.data.blocks.forEach(block=>{
      const section=element('section','mushroom-block mushroom-section-'+block.type);section.dataset.blockId=block.id;section.dataset.blockType=block.type;section.id='mushrooms-'+block.type;section.setAttribute('aria-labelledby',section.id+'-title');
      const inner=element('div','mushroom-inner');section.append(inner);main.append(section);
      if(block.type==='hero'){
        if(block.media){const custom=sourceImage(block.media,'mushroom-hero-custom');section.prepend(custom);}
        const copy=element('div','mushroom-hero-copy');const title=element('h1','mushroom-hero-title',block.title);title.id=section.id+'-title';
        copy.append(element('p','mushroom-eyebrow',block.eyebrow),title,element('p','mushroom-hero-intro',block.intro));
        const actions=element('div','mushroom-hero-actions');actions.append(anchor('Enter the hidden world','#mushrooms-family','mushroom-button'),anchor('Our field journal','#mushrooms-journal','mushroom-text-link'));copy.append(actions,element('p','mushroom-hero-note','LOOK CLOSER. THERE’S A WHOLE WORLD HERE.'));inner.append(copy);
        section.append(element('p','mushroom-art-caption',block.media?.caption||'Imagined woodland artwork · the science starts below'));
        const chapters=element('nav','mushroom-chapters');chapters.setAttribute('aria-label','Exhibit stations');
        [['01','Meet the fungi','family'],['02','Look beneath','cutaway'],['03','Send spores flying','lifecycle'],['04','Enter the wonder lab','lab']].forEach(([n,label,target])=>{const a=anchor('','#mushrooms-'+target);a.append(element('span','chapter-number',n),element('span','',label),element('span','chapter-arrow'));chapters.append(a);});section.append(chapters);return;
      }
      const heading=element('header','mushroom-section-heading');const h2=element('h2','',block.title);h2.id=section.id+'-title';heading.append(element('p','mushroom-eyebrow',block.eyebrow),h2);if(block.intro)heading.append(element('p','section-intro',block.intro));inner.append(heading);
      if(block.type==='family'||block.type==='roles'){
        const grid=element('div','mushroom-specimens');block.cards.forEach((card,i)=>{const article=element('article','mushroom-specimen');article.dataset.recordId=card.id;const art=element('div','mushroom-specimen-object');art.append(artwork(specimenArtwork(card.visual)));const copy=element('div','mushroom-specimen-copy');copy.append(element('p','mushroom-object-number',(block.type==='family'?'MEET':'JOB')+' / '+String(i+1).padStart(2,'0')),element('h3','',card.title),element('p','',card.body));article.append(art,copy);grid.append(article);});inner.append(grid);
      }else if(block.type==='anatomy'){
        const layout=element('div','mushroom-anatomy-layout'),diagram=element('div','mushroom-diagram');
        diagram.append(block.media?sourceImage(block.media,'mushroom-diagram-image'):artwork(anatomyArtwork(idPrefix+'-anatomy')));
        const detail=element('div','mushroom-observation-card');detail.id=idPrefix+'-observation';detail.setAttribute('aria-live','polite');const markers=[];
        function choose(point,index){detail.replaceChildren(element('p','mushroom-eyebrow','LOOK CLOSER / '+String(index+1).padStart(2,'0')),element('h3','',point.label),element('p','',point.body));markers.forEach((b,i)=>b.setAttribute('aria-pressed',String(index===i)));diagram.dataset.selected=point.id.split(':')[1];}
        block.hotspots.forEach((point,index)=>{const b=button(String(index+1).padStart(2,'0'),()=>choose(point,index),'mushroom-hotspot');b.style.left=point.x+'%';b.style.top=point.y+'%';b.setAttribute('aria-label',point.label);b.setAttribute('aria-controls',detail.id);b.dataset.recordId=point.id;markers.push(b);diagram.append(b);});choose(block.hotspots[0],0);
        const desk=element('div','mushroom-specimen-desk');desk.append(diagram,element('p','mushroom-diagram-note','A model of a gilled mushroom · not a guide for identifying mushrooms'));
        layout.append(desk,detail);inner.append(layout);
      }else if(block.type==='cutaway'){
        const panel=element('div','mushroom-cutaway-panel'),illustration=element('div','mushroom-cutaway-illustration');illustration.append(artwork(cutawayArtwork()));
        const controls=element('div','mushroom-cutaway-controls'),switcher=element('div','mushroom-view-switch'),explanation=element('div','mushroom-cutaway-copy');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Cutaway view');explanation.setAttribute('aria-live','polite');const buttons=[];let animations=[];
        function chooseView(index){panel.dataset.view=index===0?'surface':'below';buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));explanation.replaceChildren(element('h3','',block.views[index].label),element('p','',block.views[index].body));}
        block.views.forEach((view,i)=>{const b=button(view.label,()=>chooseView(i),'');switcher.append(b);buttons.push(b);});chooseView(0);
        const grow=button('Grow the threads',()=>{chooseView(1);animations.forEach(a=>a.cancel());animations=Array.from(illustration.querySelectorAll('.cutaway-network path')).map((path,i)=>path.animate([{strokeDasharray:'1',strokeDashoffset:1},{strokeDasharray:'1',strokeDashoffset:0}],{duration:1800,delay:i<4?0:700+(i%4)*200,easing:'ease-out',fill:'backwards'}));});
        cleanups.push(()=>animations.forEach(a=>a.cancel()));controls.append(switcher,explanation,grow,element('p','mushroom-diagram-note','Threads are highlighted to make them visible. Growth is greatly sped up.'));panel.append(illustration,controls);inner.append(panel);
      }else if(block.type==='lifecycle'){
        attachLab(inner,createSporeLab());const steps=element('ol','mushroom-lifecycle');block.steps.forEach((step,i)=>{const item=element('li','mushroom-step');item.dataset.recordId=step.id;item.append(element('span','mushroom-step-number',String(i+1).padStart(2,'0')),element('h3','',step.title),element('p','',step.body));if(step.media)item.append(sourceImage(step.media,'mushroom-step-image'));steps.append(item);});inner.append(steps,element('p','mushroom-diagram-note','A simplified life cycle for mushroom-forming fungi. Fungi have many different ways of growing and reproducing.'));
      }else if(block.type==='lab')attachLab(inner,createWonderLab(block.experiments));
      else if(block.type==='facts'){
        const grid=element('div','mushroom-fact-grid');block.cards.forEach((fact,i)=>{const card=element('article','mushroom-fact');card.dataset.recordId=fact.id;const symbol=element('span','mushroom-fact-mark',String(i+1).padStart(2,'0'));symbol.setAttribute('aria-hidden','true');card.append(symbol,element('h3','',fact.title),element('p','',fact.body));grid.append(card);});inner.append(grid);attachLab(inner,createDiscoveryQuestions(block.questions));
      }else if(block.type==='journal'){
        const notebook=element('div','mushroom-journal-placeholder');notebook.append(element('span','mushroom-journal-year','2026 / 2027'),element('h3','','The next chapter is ours.'),element('p','','Our classroom journal is getting ready. Come back for our growing story.'));inner.append(notebook);
      }
      const sources=sourcesFor(block);if(sources)inner.append(sources);
    });
    const footer=element('footer','mushroom-footer');footer.append(element('span','','Hughes Room Views · Keep wondering.'),anchor('Back to Classroom Explorations','https://rmhughes.edublogs.org/hub/'));root.append(footer);
    const observer=new ResizeObserver(fitViewport);observer.observe(document.documentElement);cleanups.push(()=>observer.disconnect());root.dataset.hrvState='ready';
  }catch(error){cleanups.forEach(f=>f());root.innerHTML=original.html;root.className=original.className;root.removeAttribute('data-hrv-state');root.removeAttribute('data-research-status');root.style.removeProperty('--mushroom-viewport-width');throw error;}
  const controller={destroy(){if(destroyed)return;destroyed=true;cleanups.forEach(f=>f());root.innerHTML=original.html;root.className=original.className;root.removeAttribute('data-hrv-state');root.removeAttribute('data-research-status');root.style.removeProperty('--mushroom-viewport-width');mushroomMounts.delete(root);}};
  mushroomMounts.set(root,controller);return controller;
}
