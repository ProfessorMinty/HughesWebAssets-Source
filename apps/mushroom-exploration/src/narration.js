// Intentional reading of the current authored lesson, never credits or teacher drawers.
export function mushroomReadingText(block,{view,recordId,partId,stage=0,status=''}={}){
  let record=block,parts=[];
  if(block.type==='roles')record=block.cards.find(item=>item.id===recordId)||block.cards[0];
  if(block.type==='lifecycle')record=block.activities.find(item=>item.view===view)||block.activities[0];
  if(block.type==='lab')record=block.experiments.find(item=>item.mode===view)||block.experiments[0];
  parts.push(record.title,record.intro||record.body);
  if(block.type==='family')block.cards.forEach(item=>parts.push(item.title,item.body));
  if(block.type==='anatomy'){const item=block.hotspots.find(item=>item.id===partId)||block.hotspots[0];parts.push(item.label,item.body);}
  if(block.type==='cutaway'){const item=block.views[view==='below'?1:0];parts.push(item.label,item.body);}
  if(block.type==='lifecycle'&&view==='cycle'){const item=block.steps[stage];parts.push(item.title,item.body);}
  if(block.type==='lab'&&view==='sound')parts.push(block.music.mapping,block.music.limits);
  if(block.type==='facts')block.cards.forEach(item=>parts.push(item.title,item.body));
  if(status)parts.push(status);
  const learning=record.learning||block.learning;parts.push(learning.action,learning.observe,learning.safety);
  return [...new Set(parts.filter(value=>typeof value==='string'&&value.trim()).map(value=>value.trim().replace(/\n/g,' ')))].join('\n\n');
}
export function createMushroomNarration({synthesis,utteranceFactory,onChange=()=>{},schedule=fn=>setTimeout(fn,4000),unschedule=id=>clearTimeout(id)}={}){
  let voices=[],selected='',state='ready',owner=null,generation=0,timer=null,destroyed=false,utterance=null;
  const key=voice=>voice.voiceURI||voice.name+'|'+voice.lang;
  function snapshot(){return{state,owner,selected,voices:voices.map(v=>({id:key(v),name:v.name,lang:v.lang,local:v.localService}))};}
  function report(){if(!destroyed)onChange(snapshot());return snapshot();}
  function refresh(){if(destroyed)return;let available=[];try{available=synthesis?.getVoices?.()||[];}catch{}voices=available.filter(v=>/^en(?:-|$)/i.test(v.lang)).sort((a,b)=>Number(b.localService)-Number(a.localService)||Number(b.lang==='en-US')-Number(a.lang==='en-US')||a.name.localeCompare(b.name));if(!voices.some(v=>key(v)===selected))selected=voices.length?key(voices[0]):'';return report();}
  function clear(){generation++;if(timer!==null)unschedule(timer);timer=null;if(utterance){utterance.onstart=utterance.onend=utterance.onerror=null;utterance=null;synthesis?.cancel();}}
  function stop(){const active=['starting','reading'].includes(state);clear();state=active?'stopped':'ready';return report();}
  function read(text,nextOwner){
    if(destroyed)return snapshot();clear();refresh();owner=nextOwner;
    if(!synthesis||!utteranceFactory||!voices.length){state='unavailable';return report();}
    if(!text.trim()){state='error';return report();}
    const ticket=generation;state='starting';report();
    try{
      utterance=utteranceFactory(text);utterance.lang='en-US';utterance.voice=voices.find(v=>key(v)===selected);utterance.rate=.88;utterance.pitch=1;utterance.volume=1;
      const valid=()=>!destroyed&&generation===ticket;
      utterance.onstart=()=>{if(!valid())return;if(timer!==null)unschedule(timer);timer=null;state='reading';report();};
      utterance.onend=()=>{if(!valid())return;clear();state='complete';report();};
      utterance.onerror=()=>{if(!valid())return;clear();state='error';report();};
      timer=schedule(()=>{if(valid()&&state==='starting'){clear();state='error';report();}});
      synthesis.speak(utterance);
    }catch{if(generation===ticket){clear();state='error';report();}}
    return snapshot();
  }
  synthesis?.addEventListener?.('voiceschanged',refresh);refresh();
  return{snapshot,refresh,read,stop,selectVoice(id){if(!voices.some(v=>key(v)===id))return snapshot();stop();selected=id;return report();},destroy(){if(destroyed)return;clear();destroyed=true;synthesis?.removeEventListener?.('voiceschanged',refresh);}};
}
