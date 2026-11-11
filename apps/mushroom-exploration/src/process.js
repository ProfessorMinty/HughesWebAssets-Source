let rememberedMotion=null;
export function browserMotionPreference(){
  const media=window.matchMedia('(prefers-reduced-motion: reduce)'),wrappers=new Map(),key='hrv:mushrooms:less-motion',eventName='hrv-mushrooms-motion-change';
  function value(){let stored=null;try{stored=window.localStorage.getItem(key);}catch{}return rememberedMotion??(stored==='1'?true:stored==='0'?false:media.matches);}
  const result={get matches(){return value();},setMatches(next){rememberedMotion=!!next;try{window.localStorage.setItem(key,next?'1':'0');}catch{}window.dispatchEvent(new Event(eventName));},addEventListener(type,fn){const update=event=>{if(event?.type==='storage'&&event.key===key)rememberedMotion=null;fn({matches:value()});};wrappers.set(fn,update);media.addEventListener(type,update);window.addEventListener(eventName,update);window.addEventListener('storage',update);},removeEventListener(type,fn){const update=wrappers.get(fn);if(!update)return;media.removeEventListener(type,update);window.removeEventListener(eventName,update);window.removeEventListener('storage',update);wrappers.delete(fn);}};return result;
}
// Finite teaching clocks. A paused or reduced-motion model never advances itself.
export function createTeachingTimeline({duration,checkpoints=[0,duration],onRender=()=>{},onState=()=>{},request=callback=>requestAnimationFrame(callback),cancel=id=>cancelAnimationFrame(id),preference=browserMotionPreference()}) {
  if(!(duration>0)||!Number.isFinite(duration))throw new TypeError('A finite positive duration is required.');
  if(checkpoints[0]!==0||checkpoints.at(-1)!==duration||checkpoints.some((t,i)=>!Number.isFinite(t)||t<0||t>duration||(i>0&&t<=checkpoints[i-1])))throw new TypeError('Teaching checkpoints must increase from zero to the ending.');
  let time=0,state='ready',frame=null,last=null,generation=0,destroyed=false,reduced=preference.matches;
  const snapshot=()=>({time,duration,state,reduced});
  function refresh(){if(destroyed)return;const value=snapshot();onRender(time,value);onState(value);}
  function unschedule(){generation++;if(frame!==null)cancel(frame);frame=null;last=null;}
  function schedule(){const ticket=generation;frame=request(t=>tick(t,ticket));}
  function tick(timestamp,ticket){if(destroyed||ticket!==generation||state!=='running')return;frame=null;const dt=last===null?0:Math.max(0,Math.min((timestamp-last)/1000,.05));last=timestamp;time=Math.min(duration,time+dt);if(time===duration)state='complete';refresh();if(state==='running')schedule();}
  function pause(){if(destroyed||state!=='running')return;unschedule();state='paused';refresh();}
  function seek(next){if(destroyed)return;unschedule();time=Math.max(0,Math.min(duration,Number.isFinite(next)?next:0));state=time===duration?'complete':'paused';refresh();}
  function step(){if(destroyed)return;seek(checkpoints.find(t=>t>time+1e-6)??duration);}
  function play(){if(destroyed||state==='running')return;if(reduced){step();return;}if(time>=duration)time=0;unschedule();state='running';refresh();schedule();}
  function reset(){if(destroyed)return;unschedule();time=0;state='ready';refresh();}
  function restart(){reset();play();}
  function changed(event){if(destroyed)return;reduced=event.matches;if(reduced&&state==='running')pause();else refresh();}
  preference.addEventListener('change',changed);
  return {snapshot,refresh,play,pause,seek,step,reset,restart,setReduced(value){if(preference.setMatches)preference.setMatches(value);else changed({matches:!!value});},suspend:pause,destroy(){if(destroyed)return;unschedule();destroyed=true;preference.removeEventListener('change',changed);}};
}
export function connectedGrowthProgress(time,start,duration){return Math.max(0,Math.min(1,(time-start)/duration));}
export function doughRiseState(progress){const p=Math.max(0,Math.min(1,Number.isFinite(progress)?progress:0));return {scale:.62+.38*p,pocketScale:.45+.55*p};}
export function advanceWindParticle(particle,seconds,breeze){
  const dt=Math.max(0,Number.isFinite(seconds)?seconds:0),wind=Math.max(-100,Math.min(100,Number.isFinite(breeze)?breeze:0));
  const falling=Math.min(dt,Math.max(0,(470-particle.y)/(34+particle.speed)));
  const clearAfter=Math.max(0,(290-particle.y)/(34+particle.speed));
  return {...particle,x:particle.x+wind*Math.max(0,falling-clearAfter)*.95,y:Math.min(470,particle.y+(34+particle.speed)*falling)};
}
