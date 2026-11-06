// Interactive teaching models and separately credited, real research footage.
import { catapultArtwork, sporeMushroomArtwork } from "./art.js";
import { mushroomVideoAsset, mushroomVideoURL } from "./video-assets.js";
function labNode(tag, className, text) {
  const node=document.createElement(tag); if(className)node.className=className;
  if(text!==undefined)node.textContent=text; return node;
}
function labButton(label, action, cleanups) {
  const button=labNode('button','mushroom-lab-button',label);button.type='button';
  button.addEventListener('click',action);cleanups.push(()=>button.removeEventListener('click',action));return button;
}
function labSVG(markup) { const t=document.createElement('template');t.innerHTML=markup;return t.content; }
export function sporeLaunchState(seconds) {
  const time=Math.max(0,Math.min(3.8,Number.isFinite(seconds)?seconds:0));
  return {phase:time<1.4?0:time<1.85?1:2,dropRadius:6+Math.min(time/1.4,1)*17,dropOpacity:1-Math.max(0,Math.min((time-1.4)/.45,1)),mergedOpacity:Math.max(0,Math.min((time-1.4)/.45,1))*.8,x:time<=1.85?0:-250*Math.min((time-1.85)/1.5,1)};
}
function createCatapultLab() {
  const node=labNode('div','mushroom-catapult-panel'),cleanups=[];
  const stage=labNode('div','mushroom-catapult-stage');stage.append(labSVG(catapultArtwork()),labNode('span','mushroom-model-label','MODEL · ENLARGED AND SLOWED'));
  const sequence=labNode('ol','mushroom-launch-sequence');const labels=['A drop grows','The drops join','The spore launches'];labels.forEach(label=>sequence.append(labNode('li','',label)));
  const status=labNode('p','mushroom-model-status','A tiny water drop can power a spore’s launch.');status.setAttribute('aria-live','polite');
  const controls=labNode('div','mushroom-catapult-controls'),actions=labNode('div','mushroom-lab-actions');
  let running=false,paused=false,frame=0,last=0,elapsed=0,lastPhase=-1,destroyed=false;
  const spore=stage.querySelector('.catapult-moving-spore'),drop=stage.querySelector('.catapult-drop'),merged=stage.querySelector('.catapult-merged');
  function draw(){const state=sporeLaunchState(elapsed);drop.setAttribute('r',String(state.dropRadius));drop.setAttribute('opacity',String(state.dropOpacity));merged.setAttribute('opacity',String(state.mergedOpacity));spore.setAttribute('transform',`translate(${state.x} 0)`);stage.querySelector('.catapult-drop-label').setAttribute('opacity',state.phase===2?'0':'1');Array.from(sequence.children).forEach((item,i)=>item.setAttribute('aria-current',String(i===state.phase)));if(lastPhase!==state.phase){status.textContent=['Water gathers into a drop at the base of the spore.','The drop joins water on the spore’s surface.','The quick movement of water helps launch the spore away.'][state.phase];lastPhase=state.phase;}}
  const pause=labButton('Pause model',()=>{if(!running)return;paused=!paused;pause.textContent=paused?'Resume model':'Pause model';pause.setAttribute('aria-pressed',String(paused));if(paused)cancelAnimationFrame(frame);else{last=0;frame=requestAnimationFrame(tick);}},cleanups);pause.disabled=true;pause.setAttribute('aria-pressed','false');
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
  const update=()=>{const value=Number(range.value);wind.textContent=value===0?'Still air':`Breeze to the ${value<0?'left':'right'} · ${Math.abs(value)}%`;};range.addEventListener('input',update);cleanups.push(()=>range.removeEventListener('input',update));
  const status=labNode('p','mushroom-model-status','Spores fall clear of the gills, then drift on air.');status.setAttribute('aria-live','polite');
  let particles=[],frame=0,last=0,elapsed=0,running=false,paused=false,destroyed=false;
  const group=stage.querySelector('.spore-particles');
  const pause=labButton('Pause model',()=>{if(!running)return;paused=!paused;pause.textContent=paused?'Resume model':'Pause model';pause.setAttribute('aria-pressed',String(paused));if(paused){cancelAnimationFrame(frame);status.textContent='Model paused.';}else{last=0;status.textContent='Spores travelling.';frame=requestAnimationFrame(tick);}},cleanups);pause.disabled=true;pause.setAttribute('aria-pressed','false');
  function tick(t){if(destroyed||!running||paused)return;const dt=last?Math.min((t-last)/1000,.04):0;last=t;elapsed+=dt;particles.forEach(p=>{if(elapsed<p.delay)return;p.y+=dt*(34+p.speed);if(p.y>190)p.x+=Number(range.value)*dt*.95;p.dot.setAttribute('cx',p.x.toFixed(1));p.dot.setAttribute('cy',p.y.toFixed(1));p.dot.setAttribute('opacity',p.y>400||p.x<0||p.x>1000?'0':'.9');});if(elapsed>9){running=false;pause.disabled=true;release.disabled=false;status.textContent='Change the wind and try another journey.';return;}frame=requestAnimationFrame(tick);}
  const release=labButton('Release spores',()=>{cancelAnimationFrame(frame);group.replaceChildren();particles=[];elapsed=0;last=0;paused=false;running=true;release.disabled=true;pause.disabled=false;pause.textContent='Pause model';pause.setAttribute('aria-pressed','false');for(let i=0;i<36;i++){const dot=document.createElementNS('http://www.w3.org/2000/svg','circle');dot.setAttribute('r',String(2.2+i%3*.45));dot.setAttribute('opacity','0');group.append(dot);particles.push({dot,x:i%2?295+(i*29)%64:478+(i*23)%63,y:151,delay:(i%9)*.16,speed:i%7*3});}status.textContent='Spores travelling. Try changing the breeze.';frame=requestAnimationFrame(tick);},cleanups);
  const actions=labNode('div','mushroom-lab-actions');actions.append(release,pause);controls.append(label,wind,actions,status);node.append(stage,controls);
  function suspend(){if(running&&!paused)pause.click();}
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)suspend();});observer.observe(node);cleanups.push(()=>observer.disconnect());
  return {node,suspend,destroy(){destroyed=true;cancelAnimationFrame(frame);cleanups.forEach(fn=>fn());particles=[];}};
}
export function createSporeLab(videoReference) {
  const node=labNode('div','mushroom-spore-station'),cleanups=[];
  const model=labNode('div','mushroom-spore-model'),switcher=labNode('div','mushroom-spore-view-switch');switcher.setAttribute('role','group');switcher.setAttribute('aria-label','Spore model view');
  const catapult=createCatapultLab(),wind=createWindLab(),buttons=[];
  function select(index){catapult.node.hidden=index!==0;wind.node.hidden=index!==1;buttons.forEach((button,i)=>button.setAttribute('aria-pressed',String(i===index)));if(index===0)wind.suspend();else catapult.suspend();}
  ['The tiny drop catapult','Ride the breeze'].forEach((label,index)=>{const button=labButton(label,()=>select(index),cleanups);buttons.push(button);switcher.append(button);});
  model.append(switcher,catapult.node,wind.node);select(0);node.append(model);
  let recording=null;
  if(videoReference){
    const asset=mushroomVideoAsset(videoReference.url);if(!asset)throw new Error('Unregistered research recording.');
    const film=labNode('article','mushroom-spore-film');film.append(labNode('p','mushroom-eyebrow','REAL RESEARCH FOOTAGE'),labNode('h3','',videoReference.title));
    recording=labNode('video','mushroom-research-video');recording.src=mushroomVideoURL(asset.file);recording.poster=mushroomVideoURL(asset.poster);recording.controls=true;recording.crossOrigin='anonymous';recording.preload='metadata';recording.playsInline=true;recording.muted=true;recording.width=asset.width;recording.height=asset.height;recording.setAttribute('aria-label',videoReference.title);
    const track=labNode('track');track.kind='captions';track.srclang='en';track.label='English description';track.src=mushroomVideoURL(asset.captions);recording.append(track);
    const caption=labNode('p','mushroom-film-caption',videoReference.caption);caption.id='mushroom-spore-film-description';recording.setAttribute('aria-describedby',caption.id);
    const play=labButton('Play recording',()=>{if(recording.paused){recording.play().catch(()=>{status.textContent='Use the recording’s play control to start it.';});}else recording.pause();},cleanups);
    const status=labNode('p','mushroom-model-status','Silent microscope recording · extreme slow motion');status.setAttribute('aria-live','polite');
    function recordEvent(){play.textContent=recording.ended?'Replay recording':recording.paused?'Play recording':'Pause recording';status.textContent=recording.ended?'Recording finished. You can replay it.':recording.paused?'Recording paused.':'Watch the round spore move from right to left.';}
    ['play','pause','ended'].forEach(event=>{recording.addEventListener(event,recordEvent);cleanups.push(()=>recording.removeEventListener(event,recordEvent));});
    const credits=labNode('p','mushroom-film-credit');const link=labNode('a','',asset.creator+' · PLOS ONE · CC BY');link.href=asset.page;link.target='_blank';link.rel='noopener noreferrer';credits.append(link,document.createTextNode(' · converted to MP4'));
    film.append(recording,caption,play,status,credits);node.append(film);
    const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting)recording.pause();});observer.observe(film);cleanups.push(()=>observer.disconnect());
  }
  const hidden=()=>{if(document.hidden){catapult.suspend();wind.suspend();if(recording)recording.pause();}};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  return {node,destroy(){catapult.destroy();wind.destroy();if(recording){recording.pause();recording.removeAttribute('src');recording.load();}cleanups.forEach(fn=>fn());}};
}
export function createWonderLab(experiments, photoRenderer) {
  const node=labNode('div','mushroom-wonder-labs'),cleanups=[];let audio=null,oscillators=[],raf=0,playing=false,destroyed=false,start=0,seed=0,run=0;
  const glow=experiments.find(e=>e.mode==='glow'),sound=experiments.find(e=>e.mode==='sound');
  const light=labNode('article','mushroom-light-lab');light.dataset.recordId=glow.id;light.dataset.night='false';
  const lightCopy=labNode('div','mushroom-lab-copy');lightCopy.append(labNode('p','mushroom-eyebrow','LIGHT LAB'),labNode('h3','',glow.title),labNode('p','',glow.body));
  if(glow.media && photoRenderer)light.append(photoRenderer(glow.media,'mushroom-lab-photo'));
  light.append(lightCopy);
  const music=labNode('article','mushroom-sound-lab');music.dataset.recordId=sound.id;
  const graph=labNode('div','mushroom-signal-graph');
  graph.append(labSVG('<svg viewBox="0 0 650 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="An invented changing pattern, not a recording from a fungus. The height of the line is mapped to a musical note."><g fill="none" stroke="#8fc3ab" stroke-opacity=".18"><path d="M30 50H620M30 100H620M30 150H620M30 200H620M80 30V225M180 30V225M280 30V225M380 30V225M480 30V225M580 30V225"/></g><text x="30" y="20" fill="#b4c9af" font-size="11">higher note</text><text x="30" y="249" fill="#b4c9af" font-size="11">lower note</text><path class="model-signal-line" fill="none" stroke="#b6dca1" stroke-width="3"/><circle class="model-signal-cursor" r="7" fill="#f6d298" cx="30" cy="130"/></svg>'),labNode('span','mushroom-model-label','INVENTED PATTERN · NOT FUNGAL DATA'));
  const signal=graph.querySelector('.model-signal-line'),cursor=graph.querySelector('.model-signal-cursor');
  function sample(x){return .5+Math.sin(x*.052+seed)*.22+Math.sin(x*.127+seed*2)*.1;}
  function draw(){signal.setAttribute('d',Array.from({length:119},(_,i)=>`${i?'L':'M'}${30+i*5},${(220-sample(i*5)*180).toFixed(1)}`).join(' '));}
  draw();
  const musicCopy=labNode('div','mushroom-lab-copy');musicCopy.append(labNode('p','mushroom-eyebrow','SIGNAL → SOUND LAB'),labNode('h3','',sound.title),labNode('p','',sound.body));
  const ion=labNode('details','mushroom-learn-more');ion.append(labNode('summary','','What makes electrical changes?'),labNode('p','','Living cells move charged particles called ions. This helps cells do their work. Scientists study how these movements relate to fungal growth and responses. They have not decoded a mushroom language.'));musicCopy.append(ion);
  musicCopy.append(labNode('p','mushroom-sound-explanation','People can turn sensor measurements into notes by choosing a musical rule. Here, a made-up pattern controls the pitch: higher line, higher note. This is a model of the conversion, not a mushroom’s voice.'));
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
      for(let i=0;i<16;i++){const value=sample(i*590/15),o=activeAudio.createOscillator(),gain=activeAudio.createGain();o.type='sine';o.frequency.value=notes[Math.min(7,Math.floor(value*8))];gain.gain.setValueAtTime(0,now+i*.48);gain.gain.linearRampToValueAtTime(.035,now+i*.48+.03);gain.gain.exponentialRampToValueAtTime(.0001,now+i*.48+.43);o.connect(gain);gain.connect(activeAudio.destination);o.start(now+i*.48);o.stop(now+i*.48+.46);oscillators.push(o);}
      start=performance.now();stop.disabled=false;status.textContent='Playing an invented pattern for eight seconds. Higher line, higher note.';
      function move(t){if(!playing||destroyed)return;const p=Math.min((t-start)/8000,1),x=p*590;cursor.setAttribute('cx',String(30+x));cursor.setAttribute('cy',String(220-sample(x)*180));if(p>=1){halt();status.textContent='Pattern finished. Try another pattern or listen again.';}else raf=requestAnimationFrame(move);}
      raf=requestAnimationFrame(move);
    }catch{if(ticket===run){halt();status.textContent='Sound could not start. Try Play model sound again.';}}
  }
  play=labButton('Play model sound',begin,cleanups);stop=labButton('Stop sound',halt,cleanups);stop.disabled=true;
  const another=labButton('Try another pattern',()=>{halt();seed=(seed+1)%9;draw();cursor.setAttribute('cx','30');cursor.setAttribute('cy',String(220-sample(0)*180));status.textContent='New invented pattern ready. Press Play to hear it.';},cleanups);
  actions.append(play,stop,another);musicCopy.append(actions,status);music.append(graph,musicCopy);node.append(light,music);
  const hidden=()=>{if(document.hidden&&playing)halt();};document.addEventListener('visibilitychange',hidden);cleanups.push(()=>document.removeEventListener('visibilitychange',hidden));
  const observer=new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&playing)halt();});observer.observe(music);cleanups.push(()=>observer.disconnect());
  return {node,destroy(){destroyed=true;halt();cleanups.forEach(f=>f());}};
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
