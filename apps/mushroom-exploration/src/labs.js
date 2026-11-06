// Interactive teaching models and separately credited, real research footage.
import { catapultArtwork, sporeMushroomArtwork, roleArtwork, lifecycleArtwork } from "./art.js";
import { mushroomVideoAsset, mushroomVideoURL } from "./video-assets.js";
function labNode(tag, className, text) {
  const node=document.createElement(tag); if(className)node.className=className;
  if(text!==undefined)node.textContent=text; return node;
}
function labButton(label, action, cleanups, priority='primary') {
  const button=labNode('button','mushroom-lab-button',label);button.type='button';button.dataset.actionPriority=priority;
  button.addEventListener('click',action);cleanups.push(()=>button.removeEventListener('click',action));return button;
}
function labSVG(markup) { const t=document.createElement('template');t.innerHTML=markup;return t.content; }
export function sporeLaunchState(seconds) {
  const time=Math.max(0,Math.min(3.8,Number.isFinite(seconds)?seconds:0));
  return {phase:time<1.4?0:time<1.85?1:2,dropRadius:4+Math.min(time/1.4,1)*14,dropOpacity:1-Math.max(0,Math.min((time-1.4)/.45,1)),mergedOpacity:Math.max(0,Math.min((time-1.4)/.45,1))*.8,x:time<=1.85?0:-250*Math.min((time-1.85)/1.5,1)};
}
function createCatapultLab() {
  const node=labNode('div','mushroom-catapult-panel'),cleanups=[];
  const stage=labNode('div','mushroom-catapult-stage');stage.append(labSVG(catapultArtwork()),labNode('span','mushroom-model-label','One spore · enlarged and slowed'));const key=labNode('div','mushroom-diagram-key');['Spore','Water drop','Tiny stalk on a gill cell'].forEach((label,i)=>key.append(labNode('span','key-'+i,label)));stage.append(key);
  const sequence=labNode('ol','mushroom-launch-sequence');const labels=['A drop grows','The drops join','The spore launches'];labels.forEach(label=>sequence.append(labNode('li','',label)));
  const status=labNode('p','mushroom-model-status','A tiny water drop can power a spore’s launch.');status.setAttribute('aria-live','polite');
  const controls=labNode('div','mushroom-catapult-controls'),actions=labNode('div','mushroom-lab-actions');
  let running=false,paused=false,frame=0,last=0,elapsed=0,lastPhase=-1,destroyed=false;
  const spore=stage.querySelector('.catapult-moving-spore'),drop=stage.querySelector('.catapult-drop'),merged=stage.querySelector('.catapult-merged');
  function draw(){const state=sporeLaunchState(elapsed);drop.setAttribute('r',String(state.dropRadius));drop.setAttribute('opacity',String(state.dropOpacity));merged.setAttribute('opacity',String(state.mergedOpacity));spore.setAttribute('transform',`translate(${state.x} 0)`);stage.querySelector('.catapult-drop-label').setAttribute('opacity',state.phase===2?'0':'1');Array.from(sequence.children).forEach((item,i)=>item.setAttribute('aria-current',String(i===state.phase)));if(lastPhase!==state.phase){status.textContent=['Water gathers into a drop at the base of the spore.','The drop joins water on the spore’s surface.','The quick movement of water helps launch the spore away.'][state.phase];lastPhase=state.phase;}}
  const pause=labButton('Pause model',()=>{if(!running)return;paused=!paused;pause.textContent=paused?'Resume model':'Pause model';pause.setAttribute('aria-pressed',String(paused));if(paused)cancelAnimationFrame(frame);else{last=0;frame=requestAnimationFrame(tick);}},cleanups,'secondary');pause.disabled=true;pause.setAttribute('aria-pressed','false');
  function tick(t){if(destroyed||!running||paused)return;elapsed+=last?Math.min((t-last)/1000,.04):0;last=t;draw();if(elapsed>=3.8){running=false;play.disabled=false;pause.disabled=true;status.textContent='A tiny launch! In nature, this final jump is much faster.';return;}frame=requestAnimationFrame(tick);}
  const play=labButton('Launch a spore',()=>{cancelAnimationFrame(frame);elapsed=0;last=0;lastPhase=-1;running=true;paused=false;play.disabled=true;pause.disabled=false;pause.textContent='Pause model';pause.setAttribute('aria-pressed','false');draw();frame=requestAnimationFrame(tick);},cleanups);
  actions.append(play,pause);controls.append(sequence,actions,status);node.append(stage,controls);
  function suspend(){if(running&&!paused)pause.click();}
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)suspend();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend,destroy(){destroyed=true;cancelAnimationFrame(frame);cleanups.forEach(fn=>fn());}};
}
function createWindLab(){
  const node=labNode('div','mushroom-wind-panel'),cleanups=[];
  const stage=labNode('div','mushroom-wind-stage');stage.append(labSVG(sporeMushroomArtwork()),labNode('span','mushroom-model-label','MODEL · SPORES ENLARGED'));
  const controls=labNode('div','mushroom-wind-controls'),label=labNode('label','mushroom-wind-label','Change the breeze');
  const range=labNode('input');range.type='range';range.min='-100';range.max='100';range.value='35';range.step='5';range.setAttribute('aria-label','Wind direction');label.append(range);
  const wind=labNode('output','mushroom-wind-output','Breeze to the right');wind.setAttribute('aria-live','polite');
  const update=()=>{const value=Number(range.value);const description=value===0?'Still air':`Breeze to the ${value<0?'left':'right'}`;wind.textContent=description;range.setAttribute('aria-valuetext',description);};range.addEventListener('input',update);cleanups.push(()=>range.removeEventListener('input',update));
  const status=labNode('p','mushroom-model-status','Spores fall clear of the gills, then drift on air.');status.setAttribute('aria-live','polite');
  let particles=[],frame=0,last=0,elapsed=0,running=false,paused=false,destroyed=false;
  const group=stage.querySelector('.spore-particles');
  const pause=labButton('Pause model',()=>{if(!running)return;paused=!paused;pause.textContent=paused?'Resume model':'Pause model';pause.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(frame);status.textContent='Model paused.';}else{last=0;status.textContent='Spores travelling.';frame=requestAnimationFrame(tick);}},cleanups,'secondary');pause.disabled=true;pause.setAttribute('aria-pressed','false');
  function tick(t){if(destroyed||!running||paused)return;const dt=last?Math.min((t-last)/1000,.04):0;last=t;elapsed+=dt;particles.forEach(p=>{if(elapsed<p.delay)return;p.y+=dt*(34+p.speed);if(p.y>290)p.x+=Number(range.value)*dt*.95;p.dot.setAttribute('cx',p.x.toFixed(1));p.dot.setAttribute('cy',p.y.toFixed(1));p.dot.setAttribute('opacity',p.y>490||p.x<0||p.x>1000?'0':'.9');});if(elapsed>9){running=false;pause.disabled=true;release.disabled=false;status.textContent='Change the wind and try another journey.';return;}frame=requestAnimationFrame(tick);}
  const release=labButton('Release spores',()=>{cancelAnimationFrame(frame);group.replaceChildren();particles=[];elapsed=0;last=0;paused=false;running=true;release.disabled=true;pause.disabled=false;pause.textContent='Pause model';pause.setAttribute('aria-pressed','false');for(let i=0;i<36;i++){const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',String(2.2+i%3*.45));dot.setAttribute('opacity','0');group.append(dot);particles.push({dot,x:i%2?295+(i*29)%64:478+(i*23)%63,y:225,delay:(i%9)*.16,speed:i%7*3});}status.textContent='Spores travelling. Try changing the breeze.';frame=requestAnimationFrame(tick);},cleanups);
  const actions=labNode('div','mushroom-lab-actions');actions.append(release,pause);controls.append(label,wind,actions,status);node.append(stage,controls);
  function suspend(){if(running&&!paused)pause.click();}
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)suspend();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend,destroy(){destroyed=true;cancelAnimationFrame(frame);cleanups.forEach(fn=>fn());particles=[];}};
}
function recordingPanel(reference,prefix,cleanups) {
  const asset=mushroomVideoAsset(reference.url);if(!asset)throw new Error('Unregistered research recording.');
  const node=labNode('article','mushroom-spore-film');node.append(labNode('p','mushroom-eyebrow','REAL RESEARCH FOOTAGE'),labNode('h3','',reference.title));
  const video=labNode('video','mushroom-research-video');video.src=mushroomVideoURL(asset.file);video.poster=mushroomVideoURL(asset.poster);video.controls=true;video.preload='metadata';video.playsInline=true;video.muted=true;video.width=asset.width;video.height=asset.height;video.setAttribute('aria-label',reference.title);
  const track=labNode('track');track.kind='captions';track.srclang='en';track.label='English description';track.src=mushroomVideoURL(asset.captions);video.append(track);
  const caption=labNode('p','mushroom-film-caption',reference.caption);caption.id=prefix+'-description';video.setAttribute('aria-describedby',caption.id);
  const status=labNode('p','mushroom-model-status',asset.id.endsWith('puffball-cloud')?'Silent recording · slowed five times':'Silent microscope recording · extreme slow motion');status.setAttribute('aria-live','polite');
  const play=labButton('Play recording',()=>{if(video.paused)video.play().catch(()=>{status.textContent='Use the recording’s play control to start it.';});else video.pause();},cleanups);
  function update(){play.dataset.actionPriority=video.paused?'primary':'secondary';play.textContent=video.ended?'Replay recording':video.paused?'Play recording':'Pause recording';status.textContent=video.ended?'Recording finished. You can replay it.':video.paused?'Recording paused.':'Watch closely. You can pause to inspect a moment.';}
  ['play','pause','ended'].forEach(event=>{video.addEventListener(event,update);cleanups.push(()=>video.removeEventListener(event,update));});
  const credit=labNode('p','mushroom-film-credit'),link=labNode('a','',asset.creator+' · '+asset.license);link.href=asset.page;link.target='_blank';link.rel='noopener noreferrer';credit.append(link);
  node.append(video,caption,play,status,credit);
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)video.pause();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend(){video.pause();},destroy(){video.pause();video.removeAttribute('src');video.load();}};
}
function createLifecycleLab(steps,prefix,photoRenderer) {
  const node=labNode('div','mushroom-lifecycle-workbench'),cleanups=[];
  const canvas=labNode('div','mushroom-lifecycle-canvas');canvas.append(labSVG(lifecycleArtwork(prefix+'-cycle')),labNode('p','mushroom-model-label','A simplified life cycle · not to scale'));
  const copy=labNode('div','mushroom-lifecycle-copy'),controls=labNode('div','mushroom-life-controls'),detail=labNode('div','mushroom-step-detail');detail.id=prefix+'-life-detail';detail.setAttribute('aria-live','polite');controls.setAttribute('role','group');controls.setAttribute('aria-label','Life cycle stage');const buttons=[];
  function select(index){canvas.dataset.step=String(index);const step=steps[index];detail.replaceChildren(labNode('h3','',step.title),labNode('p','',step.body));if(step.media&&photoRenderer)detail.append(photoRenderer(step.media,'mushroom-life-photo'));buttons.forEach((b,i)=>b.setAttribute('aria-pressed',String(i===index)));}
  steps.forEach((step,index)=>{const button=labButton(String(index+1).padStart(2,'0')+' / '+step.title,()=>select(index),cleanups);button.dataset.recordId=step.id;button.setAttribute('aria-controls',detail.id);buttons.push(button);controls.append(button);});
  copy.append(controls,detail);node.append(canvas,copy);if(steps.length)select(0);
  return {node,destroy(){cleanups.forEach(fn=>fn());}};
}
export function createSporeLab(videoReference,plumeReference,steps,photoRenderer,prefix='mushroom') {
  const node=labNode('div','mushroom-spore-lab'),cleanups=[],switcher=labNode('div','mushroom-spore-view-switch');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Spore investigation');
  const comparison=labNode('div','mushroom-spore-comparison'),model=labNode('div','mushroom-spore-model');
  const bridge=labNode('div','mushroom-scale-bridge');bridge.append(labNode('span','','Under the cap'),labNode('span','','Along a gill'),labNode('strong','','One spore, magnified'));model.append(bridge);
  const catapult=createCatapultLab(),wind=createWindLab();model.append(catapult.node,wind.node);comparison.append(model);
  const films=[];if(videoReference){const film=recordingPanel(videoReference,prefix+'-micro',cleanups);comparison.append(film.node);films.push(film);}
  const cloud=labNode('div','mushroom-cloud-workbench');if(plumeReference){
    const copy=labNode('div','mushroom-cloud-copy');copy.append(labNode('p','mushroom-eyebrow','ANOTHER WAY TO SEND SPORES'),labNode('h3','','A cloud from a puffball'),labNode('p','','This fungus keeps its spores inside a rounded fruiting body. In this research demonstration, a scientist squeezes a dried puffball. Watch the cloud leave through the opening.'),labNode('p','mushroom-cloud-difference','A puffball works differently from the gilled mushroom in our tiny-drop model. Two fungi, two ways to release spores.'));
    const film=recordingPanel(plumeReference,prefix+'-cloud',cleanups);cloud.append(copy,film.node);films.push(film);
  }
  const life=createLifecycleLab(steps,prefix,photoRenderer),buttons=[];
  const views=[['The tiny catapult',0],['Ride the breeze',1],...(plumeReference?[['Spore cloud',2]]:[]),['Life cycle',3]];
  function suspend(){catapult.suspend();wind.suspend();films.forEach(f=>f.suspend());}
  function select(view){suspend();comparison.hidden=view>1;catapult.node.hidden=view!==0;wind.node.hidden=view!==1;cloud.hidden=view!==2;life.node.hidden=view!==3;bridge.hidden=view===1;buttons.forEach(({b,v})=>b.setAttribute('aria-pressed',String(v===view)));}
  views.forEach(([label,v])=>{const b=labButton(label,()=>select(v),cleanups);buttons.push({b,v});switcher.append(b);});node.append(switcher,comparison,cloud,life.node);select(0);
  const hidden=()=>{if(document.hidden)suspend();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  return {node,suspend,destroy(){catapult.destroy();wind.destroy();life.destroy();films.forEach(f=>f.destroy());cleanups.forEach(fn=>fn());}};
}
export function createRolesLab(cards,photoRenderer,prefix) {
  const node=labNode('div','mushroom-role-labs'),cleanups=[],activities=[],exhibits=[],roleButtons=[];const roleSwitch=labNode('div','mushroom-role-switch');roleSwitch.setAttribute('role','group');roleSwitch.setAttribute('aria-label','Fungal job');node.append(roleSwitch);
  function selectRole(index){activities.forEach(a=>a.suspend?.());exhibits.forEach((exhibit,i)=>{exhibit.hidden=i!==index;roleButtons[i].setAttribute('aria-pressed',String(i===index));});}
  cards.forEach((card,index)=>{
    const article=labNode('article','mushroom-role-exhibit');article.dataset.recordId=card.id;article.dataset.role=card.visual;
    const picture=labNode('div','mushroom-role-picture');
    if(card.visual==='leaf'){
      const media=card.media||{kind:'image',url:'asset:mushroom-photo:mycelium-wood',alt:'Real white fungal mycelium spreading over decaying wood.',caption:'A real fungus spreading over wood. Look for its fine branching threads.'};picture.append(photoRenderer(media,'mushroom-role-photo'));
    }else {picture.append(labSVG(roleArtwork(card.visual,prefix+'-role-'+index)));if(card.media)picture.prepend(photoRenderer(card.media,'mushroom-role-photo'));}
    const copy=labNode('div','mushroom-role-copy');copy.append(labNode('p','mushroom-eyebrow','JOB / '+String(index+1).padStart(2,'0')),labNode('h3','',card.title),labNode('p','',card.body));
    const status=labNode('p','mushroom-role-explanation');status.setAttribute('aria-live','polite');const actions=labNode('div','mushroom-lab-actions');
    if(card.visual==='leaf'){
      const stages=['Fungi release chemicals called enzymes. These break down material around their threads.','The fungus absorbs smaller food molecules through its threads.','As dead material breaks down, nutrients can return to the environment and be used again.'];let stage=-1;
      const sequence=labNode('ol','mushroom-recycle-stages');['Break down','Absorb','Recycle'].forEach(label=>sequence.append(labNode('li','',label)));copy.append(sequence);
      actions.append(labButton('Follow the recycling',()=>{stage=(stage+1)%3;status.textContent=stages[stage];Array.from(sequence.children).forEach((item,i)=>item.setAttribute('aria-current',String(i===stage)));},cleanups));status.textContent='Follow what happens as a fungus feeds.';
    }else if(card.visual==='tree'){
      const key=labNode('div','mushroom-diagram-key');key.append(labNode('span','key-root','Plant root'),labNode('span','key-fungus','Fungal threads'));picture.append(key);let timer;
      function stop(){clearTimeout(timer);article.dataset.running='false';}
      function follow(direction){stop();article.dataset.exchange=direction;article.dataset.running='true';status.textContent=direction==='sugars'?'The plant supplies sugars to its fungal partner. Follow the gold markers away from the root.':'The fungus helps gather nutrients for the plant. Follow the blue markers toward the root.';timer=setTimeout(stop,5000);}
      actions.append(labButton('Follow sugars',()=>follow('sugars'),cleanups),labButton('Follow nutrients',()=>follow('nutrients'),cleanups),labButton('Pause exchange',stop,cleanups,'secondary'));activities.push({suspend:stop});status.textContent='Some fungi form partnerships with plant roots. Choose a direction to follow.';
    }else if(card.visual==='bread'){
      picture.append(labNode('p','mushroom-model-label','Dough cross-section · gas pockets enlarged'));let animation=null,run=0;const dough=picture.querySelector('.dough-volume');
      const pause=labButton('Pause rise',()=>{if(!animation)return;if(animation.playState==='paused'){animation.play();pause.textContent='Pause rise';}else{animation.pause();pause.textContent='Resume rise';}},cleanups,'secondary');pause.disabled=true;
      const play=labButton('Watch the dough rise',()=>{const ticket=++run;if(animation)animation.cancel();pause.disabled=false;pause.textContent='Pause rise';animation=dough.animate([{transform:'scaleY(.62)'},{transform:'scaleY(1)'}],{duration:2600,fill:'forwards',easing:'ease-in-out'});status.textContent='Gas pockets grow inside the dough. Watch the dough expand.';animation.finished.then(()=>{if(ticket===run){pause.disabled=true;status.textContent='Tiny gas bubbles helped the dough rise. This is a greatly sped-up model.';}}).catch(()=>{});},cleanups);actions.append(play,pause);activities.push({suspend(){if(animation&&animation.playState==='running'){animation.pause();pause.textContent='Resume rise';}},destroy(){run++;animation?.cancel();}});status.textContent='A model of dough rising. The bubbles are much larger than real yeast cells.';
    }
    copy.append(actions,status);article.append(picture,copy);exhibits.push(article);const choose=labButton(card.title,()=>selectRole(index),cleanups);roleButtons.push(choose);roleSwitch.append(choose);node.append(article);
  });
  if(exhibits.length)selectRole(0);
  function suspend(){activities.forEach(a=>a.suspend?.());}
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)suspend();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend,destroy(){suspend();activities.forEach(a=>a.destroy?.());cleanups.forEach(fn=>fn());}};
}
export function modelSignalSample(x,seed=0){return .5+Math.sin(x*.052+seed)*.22+Math.sin(x*.127+seed*2)*.1;}
export function createWonderLab(experiments, photoRenderer) {
  const node=labNode('div','mushroom-wonder-labs'),cleanups=[];let audio=null,oscillators=[],raf=0,playing=false,destroyed=false,start=0,seed=0,run=0;
  const glow=experiments.find(e=>e.mode==='glow'),sound=experiments.find(e=>e.mode==='sound');
  const light=labNode('article','mushroom-light-lab');light.dataset.recordId=glow.id;light.dataset.night='false';
  const lightCopy=labNode('div','mushroom-lab-copy');lightCopy.append(labNode('p','mushroom-eyebrow','LIGHT LAB'),labNode('h3','',glow.title),labNode('p','',glow.body));
  if(glow.media && photoRenderer)light.append(photoRenderer(glow.media,'mushroom-lab-photo'));
  light.append(lightCopy);
  const music=labNode('article','mushroom-sound-lab');music.dataset.recordId=sound.id;
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
  return {node,suspend(){if(playing)halt();},destroy(){destroyed=true;halt();cleanups.forEach(f=>f());}};
}
export function createDiscoveryQuestions(questions) {
  const node=labNode('div','mushroom-quiz'),cleanups=[];
  node.append(labNode('p','mushroom-eyebrow','YOUR TURN / EXPLORER THINKING'));
  questions.forEach((question,i)=>{
    const field=labNode('fieldset','mushroom-question');field.dataset.recordId=question.id;field.append(labNode('legend','',`${i+1}. ${question.prompt}`));
    const choices=labNode('div','mushroom-answer-options'),feedback=labNode('p','mushroom-answer-feedback');feedback.setAttribute('aria-live','polite');const buttons=[];
    question.choices.forEach(choice=>{const b=labButton(choice.label,()=>{buttons.forEach(other=>other.setAttribute('aria-pressed',String(other===b)));feedback.textContent=choice.feedback;feedback.dataset.correct=String(choice.correct);},cleanups);b.setAttribute('aria-pressed','false');b.dataset.recordId=choice.id;buttons.push(b);choices.append(b);});field.append(choices,feedback);node.append(field);
  });
  const rule=labNode('p','mushroom-safety-rule','Explorer rule: Never taste a wild mushroom. Ask a trusted adult.');node.append(rule);
  return {node,destroy(){cleanups.forEach(f=>f());}};
}
