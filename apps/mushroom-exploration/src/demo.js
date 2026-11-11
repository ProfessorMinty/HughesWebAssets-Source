// Official YouTube API, requested only after the visitor loads the real demonstration.
const mushroomYouTubeLoads=new WeakMap();
export function loadMushroomYouTubeAPI(win=window,doc=document){
  if(typeof win.YT?.Player==='function')return Promise.resolve(win.YT);
  if(mushroomYouTubeLoads.has(win))return mushroomYouTubeLoads.get(win);
  const promise=new Promise((resolve,reject)=>{
    const prior=win.onYouTubeIframeAPIReady,owned=Object.hasOwn(win,'onYouTubeIframeAPIReady'),script=doc.createElement('script');let timer;
    function cleanup(){win.clearTimeout(timer);script.removeEventListener('error',failed);if(win.onYouTubeIframeAPIReady===ready){if(owned)win.onYouTubeIframeAPIReady=prior;else delete win.onYouTubeIframeAPIReady;}}
    function failed(){cleanup();script.remove();reject(new Error('YouTube API unavailable'));}
    function ready(){try{if(typeof prior==='function')prior();}finally{cleanup();if(typeof win.YT?.Player==='function')resolve(win.YT);else reject(new Error('YouTube player unavailable'));}}
    win.onYouTubeIframeAPIReady=ready;try{script.src='https://www.youtube.com/iframe_api';script.async=true;script.addEventListener('error',failed);timer=win.setTimeout(failed,10000);doc.head.append(script);}catch{failed();}
  });mushroomYouTubeLoads.set(win,promise);promise.catch(()=>{if(mushroomYouTubeLoads.get(win)===promise)mushroomYouTubeLoads.delete(win);});return promise;
}
export function mushroomDemoURL(base,origin){const url=new URL(base);url.searchParams.set('enablejsapi','1');url.searchParams.set('autoplay','0');url.searchParams.set('playsinline','1');if(/^https?:\/\//.test(origin))url.searchParams.set('origin',origin);else url.searchParams.delete('origin');return url.href;}
export function connectMushroomYouTube(frame,events){return loadMushroomYouTubeAPI().then(api=>new api.Player(frame,{events}));}
export function createMushroomDemo({connect=connectMushroomYouTube,onChange=()=>{},schedule=(fn,ms)=>setTimeout(fn,ms),unschedule=id=>clearTimeout(id)}={}){
  let state='closed',error=null,time=0,player=null,generation=0,deadline=null,poll=null,disposed=false;
  const snapshot=()=>({state,error,time});
  function emit(){if(!disposed)onChange(snapshot());return snapshot();}
  function cancelDeadline(){if(deadline!==null)unschedule(deadline);deadline=null;}
  function cancelPoll(){if(poll!==null)unschedule(poll);poll=null;}
  function update(next,code=null){const same=state===next;state=next;error=code;if(!['loading','buffering'].includes(next))cancelDeadline();if(next!=='playing')cancelPoll();if(['loading','buffering'].includes(next)&&!same){cancelDeadline();const ticket=generation;deadline=schedule(()=>{deadline=null;if(ticket===generation&&!disposed&&['loading','buffering'].includes(state)){state='timeout';emit();}},12000);}return emit();}
  function close(){generation++;cancelDeadline();cancelPoll();const old=player;player=null;try{old?.destroy();}catch{}state='closed';error=null;time=0;return emit();}
  async function open(frame){
    if(disposed)return snapshot();close();const ticket=generation;update('loading');
    const valid=()=>!disposed&&ticket===generation;
    function tick(){poll=null;if(!valid()||state!=='playing')return;try{const value=Number(player?.getCurrentTime());if(Number.isFinite(value))time=Math.max(0,value);}catch{}emit();poll=schedule(tick,500);}
    const events={onReady(){if(valid())update('ready');},onStateChange(event){if(!valid())return;const next={'-1':'ready',0:'ended',1:'playing',2:'paused',3:'buffering',5:'ready'}[event.data];if(!next)return;update(next);if(next==='playing'&&poll===null)poll=schedule(tick,500);},onError(event){if(valid())update('error',event.data);},onAutoplayBlocked(){if(valid())update('blocked');}};
    try{const connected=await connect(frame,events);if(!valid()){try{connected?.destroy();}catch{}return snapshot();}player=connected;}catch{if(valid())update('unavailable');}
    return snapshot();
  }
  return{snapshot,open,close,destroy(){if(disposed)return;close();disposed=true;}};
}
