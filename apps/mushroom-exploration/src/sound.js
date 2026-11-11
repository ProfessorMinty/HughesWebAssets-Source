// Invented, normalized teaching data. No biological recording or sample library.
export const MUSHROOM_MUSIC_DEMO = {
  id:'mushroom-demo:plantwave-kealia',creator:'Data Garden / PlantWave',
  title:'Mushroom Music with PlantWave at Kealia Forest Reserve',
  source:'https://plantwave.com/blogs/blog/listen-to-mushroom-music',
  embed:'https://www.youtube-nocookie.com/embed/w0tNEp4m5PY?rel=0',
  watch:'https://www.youtube.com/watch?v=w0tNEp4m5PY',
  measurement:'Changes in conductivity between two contacts on mushrooms',
  artisticChoices:'Celestial Being sound set: electric piano, bass, chimes and flute',
  processing:'Raw readings, full mapping parameters and playback-speed statement not supplied by creator',
  permission:'Official creator-enabled YouTube embed only; no download, rehosting or remix license',
  permissionSource:'https://www.youtube.com/static?template=terms',
  checked:'2026-11-06',external:true
};
export const MUSHROOM_NOTE_SCALE = [
  ['C4',261.6256],['D4',293.6648],['E4',329.6276],['G4',391.9954],
  ['A4',440],['C5',523.2511],['D5',587.3295],['E5',659.2551]
];
export function mushroomExamplePattern(seed=0){
  return Array.from({length:16},(_,i)=>Number(Math.max(0,Math.min(1,.5+Math.sin(i*.63+seed)*.3+Math.sin(i*1.43+seed*2)*.12)).toFixed(2)));
}
export function mushroomNoteEvents(values){
  return values.map((value,index)=>{const band=Math.min(7,Math.floor(Math.max(0,Math.min(1,value))*8));return {index,value,time:index*.5,duration:.44,band,note:MUSHROOM_NOTE_SCALE[band][0],frequency:MUSHROOM_NOTE_SCALE[band][1]};});
}
export function createMushroomAudio({values=mushroomExamplePattern(),audioFactory=()=>new (window.AudioContext||window.webkitAudioContext)(),request=fn=>requestAnimationFrame(fn),cancel=id=>cancelAnimationFrame(id),onChange=()=>{},onTick=()=>{}}={}){
  let events=mushroomNoteEvents(values),state='ready',elapsed=0,instrument='flute',volume=.25,context=null,master=null,voices=[],frame=null,generation=0,origin=0,destroyed=false;
  const duration=()=>events.length*.5;
  const snapshot=()=>({state,elapsed,index:Math.min(events.length-1,Math.floor(elapsed/.5)),instrument,volume,events:events.map(e=>({...e})),duration:duration()});
  function report(){const s=snapshot();onTick(s);onChange(s);return s;}
  function clock(){if(state==='playing'&&context)elapsed=Math.max(0,Math.min(duration(),context.currentTime-origin));}
  function release(){generation++;if(frame!==null)cancel(frame);frame=null;for(const voice of voices){try{voice.stop();}catch{}voice.disconnect();}voices=[];if(context){const old=context;context=null;old.onstatechange=null;Promise.resolve(old.close()).catch(()=>{});}master=null;}
  function pause(){if(!['playing','starting'].includes(state))return snapshot();clock();release();state='paused';return report();}
  function stop(){release();elapsed=0;state='ready';return report();}
  function voice(event,start,remaining,active){
    const harmonics=instrument==='bell'?[[1,.7],[2,.22],[3,.08]]:[[1,.86],[2,.1],[3,.04]];
    for(const [ratio,weight] of harmonics){
      const oscillator=active.createOscillator(),gain=active.createGain();oscillator.type='sine';oscillator.frequency.value=event.frequency*ratio;
      gain.gain.setValueAtTime(0,start);gain.gain.linearRampToValueAtTime(.16*weight,start+Math.min(remaining*.25,instrument==='bell'?.008:.035));
      if(instrument==='bell')gain.gain.exponentialRampToValueAtTime(.0001,start+remaining);else{gain.gain.setValueAtTime(.12*weight,start+remaining*.7);gain.gain.linearRampToValueAtTime(0,start+remaining);}
      oscillator.connect(gain);gain.connect(master);oscillator.start(start);oscillator.stop(start+remaining);voices.push(oscillator);
    }
  }
  async function play(){
    if(destroyed||['playing','starting'].includes(state))return snapshot();
    if(elapsed>=duration())elapsed=0;
    state='starting';report();const ticket=++generation;
    try{
      const active=audioFactory();context=active;await active.resume();
      if(destroyed||ticket!==generation||context!==active)return snapshot();
      if(active.state!=='running')throw new Error('Audio unavailable');
      master=active.createGain();master.gain.value=volume;master.connect(active.destination);origin=active.currentTime+.05-elapsed;
      for(const event of events){const end=event.time+event.duration;if(end<=elapsed)continue;const offset=Math.max(event.time,elapsed);voice(event,origin+offset,end-offset,active);}
      state='playing';active.onstatechange=()=>{if(context===active&&active.state!=='running'&&state==='playing')pause();};report();
      function tick(){if(destroyed||ticket!==generation||state!=='playing')return;clock();onTick(snapshot());if(elapsed>=duration()){release();state='complete';report();}else frame=request(tick);}
      frame=request(tick);
    }catch{if(ticket===generation){release();state='error';report();}}
    return snapshot();
  }
  return {snapshot,play,pause,stop,replay(){stop();return play();},
    selectInstrument(value){if(!['flute','bell'].includes(value))throw new Error('Unknown synthesized instrument');stop();instrument=value;return report();},
    setVolume(value){volume=Math.max(0,Math.min(1,Number.isFinite(value)?value:0));if(master&&context)master.gain.setTargetAtTime(volume,context.currentTime,.015);return report();},
    inspect(index){release();elapsed=Math.max(0,Math.min(events.length-1,index))*.5;state='paused';return report();},
    setPattern(next){stop();events=mushroomNoteEvents(next);return report();},
    destroy(){destroyed=true;release();state='destroyed';}
  };
}
