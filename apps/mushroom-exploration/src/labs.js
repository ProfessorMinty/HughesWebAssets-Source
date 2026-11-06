// Interactive teaching models and separately credited, real research footage.
import { catapultArtwork, sporeMushroomArtwork, roleArtwork, lifecycleStageArtwork, cutawayArtwork } from "./art.js";
import { mushroomVideoAsset, mushroomVideoURL } from "./video-assets.js";
import { createTeachingTimeline, connectedGrowthProgress, doughRiseState, advanceWindParticle } from "./process.js";
function labNode(tag,className,text){const node=document.createElement(tag);if(className)node.className=className;if(text!==undefined)node.textContent=text;return node;}
function labButton(label,action,cleanups,priority='primary'){const button=labNode('button','mushroom-lab-button',label);button.type='button';button.dataset.actionPriority=priority;button.addEventListener('click',action);cleanups.push(()=>button.removeEventListener('click',action));return button;}
function labSVG(markup){const t=document.createElement('template');t.innerHTML=markup;return t.content;}
function processLabel(copy,key){return copy.labels.find(label=>label.id==='mushroom-label:'+copy.mode+'-'+key).text;}
function modelKey(copy,keys){const key=labNode('div','mushroom-diagram-key');keys.forEach((id,i)=>key.append(labNode('span','key-'+id,processLabel(copy,id))));return key;}
function processControls(owner,copy,{duration,checkpoints,render,beforePlay=()=>{},beforeStep=()=>{},onStep=()=>{},selectedIndex},prefix){
  const node=labNode('div','mushroom-process-controls'),cleanups=[],sequence=labNode('ol','mushroom-process-steps'),actions=labNode('div','mushroom-lab-actions'),status=labNode('p','mushroom-model-status'),motionNote=labNode('p','mushroom-motion-note',copy.lessMotion);
  status.id=prefix+'-'+copy.mode+'-status';status.setAttribute('aria-live','polite');sequence.setAttribute('aria-label',copy.label);const buttons=[];let timeline;
  copy.steps.forEach((step,index)=>{const li=labNode('li'),b=labButton(String(index+1)+'. '+step.label,()=>{onStep(index);timeline.seek(checkpoints[index]);},cleanups,'secondary');b.dataset.recordId=step.id;b.setAttribute('aria-controls',status.id);buttons.push(b);li.append(b);sequence.append(li);});
  const play=labButton(copy.controls.play,()=>{beforePlay();timeline.restart();},cleanups),pause=labButton(copy.controls.pause,()=>{if(timeline.snapshot().state==='running')timeline.pause();else timeline.play();},cleanups,'secondary'),step=labButton(copy.controls.step,()=>{beforeStep();timeline.step();},cleanups,'secondary'),reset=labButton(copy.controls.reset,()=>{beforePlay();timeline.reset();},cleanups,'secondary');
  const motionLabel=labNode('label','mushroom-motion-choice'),motionToggle=labNode('input');motionToggle.type='checkbox';motionLabel.append(motionToggle,document.createTextNode(copy.controls.motion));const motionChange=()=>timeline.setReduced(motionToggle.checked);motionToggle.addEventListener('change',motionChange);cleanups.push(()=>motionToggle.removeEventListener('change',motionChange));
  function update(value){const index=selectedIndex?selectedIndex(value):Math.max(0,checkpoints.findLastIndex(t=>t<=value.time+1e-6));buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));owner.dataset.modelState=value.state;owner.dataset.modelTime=value.time.toFixed(3);owner.dataset.lessMotion=String(value.reduced);play.textContent=value.time>0?copy.controls.replay:copy.controls.play;play.hidden=value.reduced;play.disabled=value.state==='running';pause.hidden=value.reduced;pause.disabled=['ready','complete'].includes(value.state);pause.textContent=value.state==='paused'?copy.controls.resume:copy.controls.pause;pause.setAttribute('aria-pressed',String(value.state==='paused'));step.disabled=value.time>=duration;step.dataset.actionPriority=value.reduced?'primary':'secondary';reset.disabled=value.state==='ready';motionNote.hidden=!value.reduced;motionToggle.checked=value.reduced;const text=value.state==='ready'?copy.initial:value.state==='running'?copy.playing:value.state==='complete'&&!(selectedIndex&&index>=0)?copy.finished:copy.steps[Math.max(0,index)].body;if(status.textContent!==text)status.textContent=text;}
  timeline=createTeachingTimeline({duration,checkpoints,onRender:(time,state)=>render(time,state),onState:update});actions.append(play,pause,step);const options=labNode('div','mushroom-process-options');options.append(motionLabel,reset);node.append(sequence,actions,options,motionNote,status);timeline.refresh();
  const hidden=()=>{if(document.hidden)timeline.suspend();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)timeline.suspend();});observer.observe(owner);cleanups.push(()=>observer.disconnect());
  return {node,timeline,status,suspend:timeline.suspend,destroy(){timeline.destroy();cleanups.forEach(fn=>fn());}};
}
export function createGrowthLab(block,prefix,photoRenderer){
  const copy=block.growth,node=labNode('div','mushroom-cutaway-panel'),cleanups=[],illustration=labNode('div','mushroom-cutaway-illustration');illustration.append(labSVG(cutawayArtwork(prefix+'-cutaway')));
  const controls=labNode('div','mushroom-cutaway-controls'),switcher=labNode('div','mushroom-view-switch'),explanation=labNode('div','mushroom-cutaway-copy'),viewButtons=[];let process;
  switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Cutaway view');
  function chooseView(index){node.dataset.view=index===0?'surface':'below';viewButtons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));explanation.replaceChildren(labNode('h3','',block.views[index].label),labNode('p','',block.views[index].body));if(index===0)process?.suspend();}
  block.views.forEach((view,i)=>{const b=labButton(view.label,()=>chooseView(i),cleanups,'secondary');viewButtons.push(b);switcher.append(b);});
  const paths=[...illustration.querySelectorAll('.cutaway-network path')],ending=Math.max(...paths.map(path=>Number(path.dataset.growthStart)+Number(path.dataset.growthDuration)));
  process=processControls(node,copy,{duration:8,checkpoints:[0,8/3,16/3,8],beforePlay:()=>chooseView(1),beforeStep:()=>chooseView(1),onStep:()=>chooseView(1),render(time,state){const position=state.state==='ready'?ending:time/8*ending;paths.forEach(path=>{path.style.strokeDasharray='1';path.style.strokeDashoffset=String(1-connectedGrowthProgress(position,Number(path.dataset.growthStart),Number(path.dataset.growthDuration)));});}},prefix);
  controls.append(switcher,explanation,process.node,labNode('p','mushroom-diagram-note',copy.label));node.append(illustration,controls);if(block.media)node.append(photoRenderer(block.media,'mushroom-cutaway-photo'));chooseView(0);
  return {node,suspend:process.suspend,destroy(){process.destroy();cleanups.forEach(fn=>fn());}};
}
export function sporeLaunchState(seconds){const time=Math.max(0,Math.min(3.8,Number.isFinite(seconds)?seconds:0));return {phase:time<1.4?0:time<1.85?1:2,dropRadius:4+Math.min(time/1.4,1)*14,dropOpacity:1-Math.max(0,Math.min((time-1.4)/.45,1)),mergedOpacity:Math.max(0,Math.min((time-1.4)/.45,1))*.8,x:time<=1.85?0:-105*Math.min((time-1.85)/.35,1)};}
function createCatapultLab(copy,prefix){
  const node=labNode('div','mushroom-catapult-panel'),stage=labNode('div','mushroom-catapult-stage'),diagram=labNode('div','mushroom-callout-diagram');
  const top=labNode('div','mushroom-callout-row'),bottom=labNode('div','mushroom-callout-row');['spore','film'].forEach(key=>top.append(labNode('span','catapult-name-'+key,processLabel(copy,key))));['drop','stalk'].forEach(key=>bottom.append(labNode('span','catapult-name-'+key,processLabel(copy,key))));
  diagram.append(labSVG(catapultArtwork(prefix)));stage.append(labNode('p','mushroom-model-label',copy.label),top,diagram,bottom);
  const moving=diagram.querySelector('.catapult-moving-spore'),drop=diagram.querySelector('.catapult-drop'),merged=diagram.querySelector('.catapult-merged');
  const process=processControls(node,copy,{duration:3.8,checkpoints:[0,1.7,3.8],render(time){const state=sporeLaunchState(time);drop.setAttribute('r',String(state.dropRadius));drop.setAttribute('opacity',String(state.dropOpacity));merged.setAttribute('opacity',String(state.mergedOpacity));moving.setAttribute('transform',`translate(${state.x} 0)`);diagram.querySelector('.catapult-drop-label').setAttribute('opacity',state.phase===2?'0':'1');diagram.querySelector('.catapult-leader-drop').setAttribute('opacity',state.phase===2?'0':'1');diagram.querySelector('.catapult-leader-spore').setAttribute('d',`M150 20L220 62L${329+state.x} 126`);diagram.querySelector('.catapult-leader-film').setAttribute('d',`M510 20L450 65L${386+state.x} 130`);node.dataset.launchPhase=String(state.phase);},selectedIndex:({time})=>sporeLaunchState(time).phase},prefix);
  node.append(stage,process.node);return {node,suspend:process.suspend,destroy:process.destroy};
}
function createWindLab(copy,prefix){
  const node=labNode('div','mushroom-wind-panel'),cleanups=[],stage=labNode('div','mushroom-wind-stage');stage.append(labSVG(sporeMushroomArtwork(prefix)),labNode('p','mushroom-model-label',copy.label));
  const controls=labNode('div','mushroom-wind-controls'),label=labNode('label','mushroom-wind-label',processLabel(copy,'breeze')),range=labNode('input');range.type='range';range.min='-100';range.max='100';range.value='35';range.step='5';range.setAttribute('aria-label',processLabel(copy,'breeze'));label.append(range);
  const output=labNode('output','mushroom-wind-output'),directions=labNode('div','mushroom-breeze-directions');directions.setAttribute('role','group');directions.setAttribute('aria-label',processLabel(copy,'breeze'));const directionButtons=[];
  function update(){const value=Number(range.value),description=value===0?processLabel(copy,'still'):processLabel(copy,value<0?'left-state':'right-state');output.textContent=description;range.setAttribute('aria-valuetext',description);directionButtons.forEach(([button,direction])=>button.setAttribute('aria-pressed',String(direction===Math.sign(value))));}
  for(const [key,value] of [['left',-70],['still',0],['right',70]]){const b=labButton(processLabel(copy,key),()=>{range.value=String(value);update();},cleanups,'secondary');directionButtons.push([b,Math.sign(value)]);directions.append(b);}range.addEventListener('input',update);cleanups.push(()=>range.removeEventListener('input',update));update();
  const group=stage.querySelector('.spore-particles');let particles=[],lastTime=0;
  function resetParticles(){group.replaceChildren();particles=Array.from({length:36},(_,i)=>{const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',String(2.2+i%3*.45));group.append(dot);return {dot,x:i%2?295+(i*29)%64:478+(i*23)%63,y:225,delay:(i%9)*.16,speed:i%7*3};});lastTime=0;}
  const process=processControls(node,copy,{duration:9,checkpoints:[0,3,9],render(time,state){if(time<lastTime||state.state==='ready'||!particles.length)resetParticles();const start=lastTime;particles=particles.map(p=>{const dt=Math.max(0,time-Math.max(start,p.delay));const next=advanceWindParticle(p,dt,Number(range.value));next.dot.setAttribute('cx',next.x.toFixed(2));next.dot.setAttribute('cy',next.y.toFixed(2));next.dot.setAttribute('opacity',time<p.delay||next.x<0||next.x>1000?'0':'.9');return next;});lastTime=time;}},prefix);
  controls.append(label,output,directions,process.node);node.append(stage,controls);return {node,suspend:process.suspend,destroy(){process.destroy();cleanups.forEach(fn=>fn());particles=[];}};
}
export function recordingPlaybackState({failed,ended,paused},copy){return {disabled:failed,button:ended?copy.replay:paused?copy.play:copy.pause,priority:paused?'primary':'secondary',retry:failed,status:failed?copy.error:ended?copy.finished:paused?copy.paused:copy.playing};}
function recordingPanel(reference,prefix,cleanups,copy,safety=''){
  const asset=mushroomVideoAsset(reference.url);if(!asset)throw new Error('Unregistered research recording.');
  const node=labNode('article','mushroom-spore-film'),video=labNode('video','mushroom-research-video');node.append(labNode('p','mushroom-eyebrow','REAL RESEARCH FOOTAGE'),labNode('h3','',reference.title));
  video.src=mushroomVideoURL(asset.file);video.poster=mushroomVideoURL(asset.poster);video.controls=true;video.preload='metadata';video.playsInline=true;video.muted=true;video.width=asset.width;video.height=asset.height;video.setAttribute('aria-label',reference.title);
  const track=labNode('track');track.kind='captions';track.srclang='en';track.label='English description';track.src=mushroomVideoURL(asset.captions);video.append(track);
  const text=labNode('div','mushroom-film-description'),caption=labNode('p','mushroom-film-caption',reference.caption);caption.id=prefix+'-description';const timing=labNode('p','mushroom-film-timing',asset.slowdownFactor===5?copy.silentPuffball:copy.silentMicroscope);timing.id=prefix+'-timing';text.append(caption,timing);if(safety)text.append(labNode('p','mushroom-safety-rule',safety));video.setAttribute('aria-describedby',caption.id+' '+timing.id);
  let failed=false,disposed=false;const status=labNode('p','mushroom-model-status',copy.paused);status.setAttribute('aria-live','polite');
  const actions=labNode('div','mushroom-film-actions'),play=labButton(copy.play,()=>{if(video.paused){if(video.ended)video.currentTime=0;video.play().catch(error=>{if(disposed)return;if(error.name==='AbortError')update();else{failed=true;update();}});}else video.pause();},cleanups),fullscreen=labButton(copy.fullscreen,()=>video.requestFullscreen().catch(()=>{status.textContent=copy.fullscreenError;}),cleanups,'secondary'),retry=labButton(copy.retry,()=>{failed=false;video.load();update();},cleanups,'secondary');fullscreen.hidden=typeof video.requestFullscreen!=='function';
  function update(){if(disposed)return;failed=failed||!!video.error;const value=recordingPlaybackState({failed,ended:video.ended,paused:video.paused},copy);play.disabled=value.disabled;play.textContent=value.button;play.dataset.actionPriority=value.priority;retry.hidden=!value.retry;status.textContent=value.status;}
  const error=()=>{failed=true;update();};['play','pause','ended','loadedmetadata'].forEach(event=>{video.addEventListener(event,update);cleanups.push(()=>video.removeEventListener(event,update));});video.addEventListener('error',error);cleanups.push(()=>video.removeEventListener('error',error));
  const credit=labNode('p','mushroom-film-credit'),link=labNode('a','',asset.creator+' · '+asset.license);link.href=asset.page;link.target='_blank';link.rel='noopener noreferrer';credit.append(link);actions.append(play,fullscreen,retry,status);node.append(video,text,actions,credit);update();
  function suspend(){video.pause();if(document.fullscreenElement===video)document.exitFullscreen().catch(()=>{});}
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)suspend();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend,destroy(){disposed=true;suspend();video.removeAttribute('src');video.load();}};
}
function createLifecycleLab(block,prefix,photoRenderer){
  const {steps,cycle}=block,node=labNode('div','mushroom-lifecycle-workbench'),cleanups=[],canvas=labNode('div','mushroom-cycle-map'),list=labNode('ol','mushroom-cycle-overview'),detail=labNode('div','mushroom-step-detail'),buttons=[];detail.id=prefix+'-life-detail';detail.setAttribute('aria-live','polite');
  function select(index){const step=steps[index];detail.replaceChildren(labNode('p','mushroom-eyebrow',String(index+1)+' / '+steps.length),labNode('h3','',step.title),labNode('p','',step.body));if(step.media&&photoRenderer)detail.append(photoRenderer(step.media,'mushroom-life-photo'));buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
  steps.forEach((step,index)=>{const li=labNode('li'),button=labButton('',()=>select(index),cleanups,'secondary'),preview=labNode('span','mushroom-life-preview');preview.dataset.step=String(index);preview.setAttribute('aria-hidden','true');preview.append(labSVG(lifecycleStageArtwork(index,prefix+'-cycle-'+index)));button.className='mushroom-cycle-stage';button.setAttribute('aria-controls',detail.id);button.dataset.recordId=step.id;button.append(preview,labNode('span','mushroom-cycle-stage-label',String(index+1)+'. '+step.title));buttons.push(button);li.append(button);list.append(li);});
  const back=labNode('div','mushroom-cycle-return');back.append(labSVG(`<svg viewBox='0 0 1000 60' preserveAspectRatio='none' aria-hidden='true' xmlns='http://www.w3.org/2000/svg'><path d='M880 4V40H120V4M112 14L120 4L128 14' fill='none' stroke='#e1ad4d' stroke-width='3'/></svg>`),labNode('p','',cycle.returnLabel));canvas.append(list,back,labNode('p','mushroom-diagram-note',cycle.label));const copy=labNode('div','mushroom-lifecycle-copy');copy.append(detail,labNode('p','mushroom-cycle-scope',cycle.scopeNote));node.append(canvas,copy);select(0);
  return {node,destroy(){cleanups.forEach(fn=>fn());}};
}
export function sporeActivityState(view){if(!['launch','wind','puffball','cycle'].includes(view))throw new Error('Unknown spore activity.');return {comparison:view==='launch'||view==='wind',launch:view==='launch',wind:view==='wind',puffball:view==='puffball',cycle:view==='cycle',launchFilm:view==='launch'};}
export function createSporeLab(block,photoRenderer,prefix='mushroom'){
  const node=labNode('div','mushroom-spore-lab'),cleanups=[],comparison=labNode('div','mushroom-spore-comparison'),model=labNode('div','mushroom-spore-model'),bridge=labNode('div','mushroom-scale-bridge');bridge.append(labNode('span','','Under the cap'),labNode('span','','Along a gill'),labNode('strong','','One spore, magnified'));model.append(bridge);
  const catapult=createCatapultLab(block.launch,prefix+'-launch'),wind=createWindLab(block.wind,prefix+'-wind');catapult.node.id='mushrooms-launch';wind.node.id='mushrooms-wind';model.append(catapult.node,wind.node);comparison.append(model);const films=[];let launchFilm;
  if(block.video){launchFilm=recordingPanel(block.video,prefix+'-micro',cleanups,block.recording);comparison.append(launchFilm.node);films.push(launchFilm);}
  const cloud=labNode('div','mushroom-cloud-workbench');cloud.id='mushrooms-puffball';if(block.plumeVideo){const film=recordingPanel(block.plumeVideo,prefix+'-cloud',cleanups,block.recording,block.activities.find(a=>a.view==='puffball').learning.safety);cloud.append(film.node);films.push(film);}
  const life=createLifecycleLab(block,prefix,photoRenderer);life.node.id='mushrooms-cycle';
  function suspend(){catapult.suspend();wind.suspend();films.forEach(f=>f.suspend());}
  function select(view){const state=sporeActivityState(view);suspend();node.dataset.activity=view;comparison.hidden=!state.comparison;catapult.node.hidden=!state.launch;wind.node.hidden=!state.wind;cloud.hidden=!state.puffball;life.node.hidden=!state.cycle;bridge.hidden=!state.launch;if(launchFilm)launchFilm.node.hidden=!state.launchFilm;}
  node.append(comparison,cloud,life.node);select('launch');const hidden=()=>{if(document.hidden)suspend();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  return {node,select,suspend,destroy(){catapult.destroy();wind.destroy();life.destroy();films.forEach(f=>f.destroy());cleanups.forEach(fn=>fn());}};
}
export function createRolesLab(block,photoRenderer,prefix,learningNotes){
  const {cards,learning}=block,node=labNode('div','mushroom-role-labs'),cleanups=[],activities=[],exhibits=[],roleButtons=[],roleSwitch=labNode('div','mushroom-role-switch');roleSwitch.setAttribute('role','group');roleSwitch.setAttribute('aria-label','Fungal job');node.append(roleSwitch);
  function selectRole(index){activities.forEach(a=>a.suspend?.());exhibits.forEach((exhibit,i)=>{exhibit.hidden=i!==index;roleButtons[i].setAttribute('aria-pressed',String(i===index));});}
  cards.forEach((card,index)=>{
    const spec=card.process,article=labNode('article','mushroom-role-exhibit'),picture=labNode('div','mushroom-role-picture'),copy=labNode('div','mushroom-role-copy');article.dataset.recordId=card.id;article.dataset.role=card.visual;picture.append(labSVG(roleArtwork(card.visual,prefix+'-role-'+index)),labNode('p','mushroom-model-label',spec.label));copy.append(labNode('p','mushroom-eyebrow','JOB / '+String(index+1).padStart(2,'0')),labNode('h3','',card.title),labNode('p','',card.body));
    if(card.visual==='leaf'){
      picture.append(modelKey(spec,['material','threads','food','nutrients']));if(card.media){const evidence=labNode('details','mushroom-role-evidence');evidence.append(labNode('summary','',processLabel(spec,'evidence')),photoRenderer(card.media,'mushroom-role-photo'));picture.append(evidence);}
      const sequence=labNode('ol','mushroom-process-steps'),status=labNode('p','mushroom-model-status',spec.initial);status.setAttribute('aria-live','polite');let stage=-1;const buttons=[];
      function select(i){stage=i;article.dataset.stage=String(i);status.textContent=i<0?spec.initial:spec.steps[i].body;buttons.forEach((b,n)=>b.setAttribute('aria-pressed',String(n===i)));next.disabled=i===spec.steps.length-1;}
      spec.steps.forEach((step,i)=>{const li=labNode('li'),b=labButton(String(i+1)+'. '+step.label,()=>select(i),cleanups,'secondary');b.dataset.recordId=step.id;buttons.push(b);li.append(b);sequence.append(li);});const actions=labNode('div','mushroom-lab-actions'),next=labButton(spec.controls.step,()=>select(Math.min(stage+1,2)),cleanups),reset=labButton(spec.controls.reset,()=>select(-1),cleanups,'secondary');actions.append(next,reset);copy.append(sequence,actions,status);select(-1);
    }else if(card.visual==='tree'){
      const sunlight=labNode('p','mushroom-sunlight-label',processLabel(spec,'sunlight'));picture.prepend(sunlight);picture.append(modelKey(spec,['root','threads','sugar','water']));const sugar=picture.querySelector('.exchange-sugars'),water=picture.querySelector('.exchange-nutrients'),sugarDot=picture.querySelector('.trade-sugar-marker'),waterDot=picture.querySelector('.trade-water-marker');let highlight='both',both;
      const process=processControls(article,spec,{duration:6,checkpoints:[0,6],beforePlay(){highlight='both';},onStep(i){highlight=i===0?'sugar':'water';},selectedIndex(){return highlight==='sugar'?0:highlight==='water'?1:-1;},render(time,state){article.dataset.exchange=highlight;both?.setAttribute('aria-pressed',String(highlight==='both'));const t=state.state==='ready'?.4:Math.min(1,time/6);for(const [path,dot] of [[sugar,sugarDot],[water,waterDot]]){const point=path.getPointAtLength(path.getTotalLength()*t);dot.setAttribute('transform',`translate(${point.x} ${point.y})`);}article.dataset.running='false';}},prefix+'-trade');activities.push(process);copy.append(process.node);
      both=labButton(processLabel(spec,'both'),()=>{highlight='both';process.timeline.pause();process.timeline.refresh();},cleanups,'secondary');process.node.querySelector('.mushroom-lab-actions').append(both);process.timeline.refresh();
    }else{
      picture.append(modelKey(spec,['outline','gas','bowl']));const volume=picture.querySelector('.dough-volume'),pockets=[...picture.querySelectorAll('.dough-gas-pockets ellipse')];
      const process=processControls(article,spec,{duration:6,checkpoints:[0,3,6],render(time){const value=doughRiseState(time/6);volume.setAttribute('transform',`translate(0 287) scale(1 ${value.scale}) translate(0 -287)`);pockets.forEach(p=>{p.setAttribute('rx',String(Number(p.dataset.rx)*value.pocketScale));p.setAttribute('ry',String(Number(p.dataset.ry)*value.pocketScale));});}},prefix+'-dough');activities.push(process);copy.append(process.node);
    }
    if(learningNotes)copy.append(learningNotes({...card.learning,words:[...card.learning.words,...learning.words]}));article.append(picture,copy);exhibits.push(article);const choose=labButton(card.title,()=>selectRole(index),cleanups);roleButtons.push(choose);roleSwitch.append(choose);node.append(article);
  });selectRole(0);return {node,suspend(){activities.forEach(a=>a.suspend());},destroy(){activities.forEach(a=>a.destroy());cleanups.forEach(fn=>fn());}};
}
export function modelSignalSample(x,seed=0){return .5+Math.sin(x*.052+seed)*.22+Math.sin(x*.127+seed*2)*.1;}
export function createWonderLab(experiments, photoRenderer, learningNotes) {
  const node=labNode('div','mushroom-wonder-labs'),cleanups=[];let audio=null,oscillators=[],raf=0,playing=false,destroyed=false,start=0,seed=0,run=0;
  const glow=experiments.find(e=>e.mode==='glow'),sound=experiments.find(e=>e.mode==='sound');
  const light=labNode('article','mushroom-light-lab');light.id='mushrooms-glow';light.dataset.recordId=glow.id;light.dataset.night='false';
  const lightCopy=labNode('div','mushroom-lab-copy');lightCopy.append(labNode('p','mushroom-eyebrow','LIGHT LAB'),labNode('h3','',glow.title),labNode('p','',glow.body));
  if(glow.media && photoRenderer)light.append(photoRenderer(glow.media,'mushroom-lab-photo'));
  light.append(lightCopy);
  const music=labNode('article','mushroom-sound-lab');music.id='mushrooms-sound';music.dataset.recordId=sound.id;
  const graph=labNode('div','mushroom-signal-graph');
  graph.append(labSVG(`<svg viewBox='0 0 650 260' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='An invented changing pattern. The height of the line is mapped to a musical note. This is not fungal data.'><g fill='none' stroke='#8fc3ab' stroke-opacity='.22'><path d='M30 50H620M30 100H620M30 150H620M30 200H620M80 30V225M180 30V225M280 30V225M380 30V225M480 30V225M580 30V225'/></g><path class='model-signal-line' fill='none' stroke='#b6dca1' stroke-width='3'/><circle class='model-signal-cursor' r='7' fill='#f6d298' cx='30' cy='130'/></svg>`),labNode('span','mushroom-model-label','Invented pattern · not fungal data'),labNode('span','mushroom-graph-high','Higher note'),labNode('span','mushroom-graph-low','Lower note'));
  const signal=graph.querySelector('.model-signal-line'),cursor=graph.querySelector('.model-signal-cursor');
  function sample(x){return modelSignalSample(x,seed);}
  function draw(){signal.setAttribute('d',Array.from({length:119},(_,i)=>`${i?'L':'M'}${30+i*5},${(220-sample(i*5)*180).toFixed(1)}`).join(' '));}
  draw();
  const musicCopy=labNode('div','mushroom-lab-copy');musicCopy.append(labNode('p','mushroom-eyebrow','SIGNAL → SOUND LAB'),labNode('h3','',sound.title),labNode('p','',sound.body));
  const ion=labNode('details','mushroom-learn-more');ion.append(labNode('summary','','What makes electrical changes?'),labNode('p','','Living cells move charged particles called ions. This helps cells do their work. Scientists study how these movements relate to fungal growth and responses. They have not decoded a mushroom language.'));musicCopy.append(ion);
  ion.append(labNode('p','mushroom-sound-explanation','People can turn sensor measurements into notes by choosing a musical rule. Here, a made-up pattern controls the pitch: higher line, higher note. This is a model of the conversion, not a mushroom’s voice.'));
  const mapping=labNode('ol','mushroom-sound-mapping');['Fungus + sensors','Changing measurements','Notes chosen by a person'].forEach(label=>mapping.append(labNode('li','',label)));musicCopy.prepend(mapping);
  const actions=labNode('div','mushroom-lab-actions'),status=labNode('p','mushroom-model-status','Sound is off. You choose when to listen.');status.setAttribute('aria-live','polite');
  let play,stop;
  function halt(){run++;playing=false;cancelAnimationFrame(raf);oscillators.forEach(o=>{try{o.stop();}catch{}o.disconnect();});oscillators=[];if(audio){const old=audio;audio=null;old.close().catch(()=>{});}if(play)play.disabled=false;if(stop)stop.disabled=true;status.textContent='Sound is off.';}
  async function begin(){
    if(playing||destroyed)return;
    const Audio=window.AudioContext||window.webkitAudioContext;
    if(!Audio){status.textContent='This browser cannot play the model sound. You can still explore the pattern.';return;}
    play.disabled=true;playing=true;const ticket=++run;status.textContent='Starting the model sound…';
    try{
      audio=new Audio();const activeAudio=audio;await activeAudio.resume();if(destroyed||!playing||audio!==activeAudio||ticket!==run)return;
      const notes=[261.63,293.66,329.63,392,440,523.25,587.33,659.25];const now=activeAudio.currentTime+.08;
      for(let i=0;i<16;i++){const value=sample(i*590/16),o=activeAudio.createOscillator(),gain=activeAudio.createGain();o.type='sine';o.frequency.value=notes[Math.min(7,Math.floor(value*8))];gain.gain.setValueAtTime(0,now+i*.5);gain.gain.linearRampToValueAtTime(.035,now+i*.5+.03);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.5+.43);o.connect(gain);gain.connect(activeAudio.destination);o.start(now+i*.5);o.stop(now+i*.5+.46);oscillators.push(o);}
      start=now;stop.disabled=false;status.textContent='Playing an invented pattern for eight seconds. Higher line, higher note.';
      function move(t){if(!playing||destroyed)return;const p=Math.max(0,Math.min((activeAudio.currentTime-start)/8,1)),x=p*590;cursor.setAttribute('cx',String(30+x));cursor.setAttribute('cy',String(220-sample(x)*180));if(p>=1){halt();status.textContent='Pattern finished. Try another pattern or listen again.';}else raf=requestAnimationFrame(move);}
      raf=requestAnimationFrame(move);
    }catch{if(ticket===run){halt();status.textContent='Sound could not start. Try Play model sound again.';}}
  }
  play=labButton('Play model sound',begin,cleanups);stop=labButton('Stop sound',halt,cleanups,'secondary');stop.disabled=true;
  const another=labButton('Try another pattern',()=>{halt();seed=(seed+1)%9;draw();cursor.setAttribute('cx','30');cursor.setAttribute('cy',String(220-sample(0)*180));status.textContent='New invented pattern ready. Press Play to hear it.';},cleanups,'secondary');
  actions.append(play,stop,another);musicCopy.append(actions,status);music.append(graph,musicCopy);node.append(light,music);
  const hidden=()=>{if(document.hidden&&playing)halt();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)halt();});observer.observe(music);cleanups.push(()=>observer.disconnect());
  function select(view){if(playing)halt();light.hidden=view!=='glow';music.hidden=view!=='sound';node.dataset.activity=view;}select('glow');
  return {node,select,suspend(){if(playing)halt();},destroy(){destroyed=true;halt();cleanups.forEach(f=>f());}};
}
export function createDiscoveryQuestions(questions) {
  const node=labNode('div','mushroom-quiz'),cleanups=[];
  node.append(labNode('p','mushroom-eyebrow','YOUR TURN / EXPLORER THINKING'));
  questions.forEach((question,i)=>{
    const field=labNode('fieldset','mushroom-question');field.dataset.recordId=question.id;field.append(labNode('legend','',`${i+1}. ${question.prompt}`));
    const choices=labNode('div','mushroom-answer-options'),feedback=labNode('p','mushroom-answer-feedback');feedback.setAttribute('aria-live','polite');const buttons=[];
    question.choices.forEach(choice=>{const b=labButton(choice.label,()=>{buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));feedback.textContent=choice.feedback;feedback.dataset.correct=String(choice.correct);},cleanups);b.setAttribute('aria-pressed','false');b.dataset.recordId=choice.id;buttons.push(b);choices.append(b);});field.append(choices,feedback);node.append(field);
  });
  return {node,destroy(){cleanups.forEach(f=>f());}};
}
