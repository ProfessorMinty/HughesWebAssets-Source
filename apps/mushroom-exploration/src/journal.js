export const MUSHROOM_JOURNAL_FEED = 'https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/feature/mushroom-exhibit-scaffold/apps/mushroom-exploration/source/journal/index.json';
const recordRoot = 'https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/feature/mushroom-exhibit-scaffold/';
const labels = { observation:'Our observations',fact:'Did you know?', 'teacher-note':'Teacher note','student-note':'Student note' };
function node(tag,className,text){const result=document.createElement(tag);if(className)result.className=className;if(text!==undefined)result.textContent=text;return result;}
function mediaURL(url){const parsed=new URL(url);if(parsed.origin!=='https://cdn.nlightlabs.com'||!parsed.pathname.startsWith('/hrv/mushrooms/')||parsed.username||parsed.password)throw new Error('Unapproved journal media');return parsed.href;}
function dateLabel(date){if(!/^\d{4}-\d{2}-\d{2}$/.test(date))throw new Error('Invalid journal date');return new Intl.DateTimeFormat('en-US',{weekday:'long',month:'long',day:'numeric',year:'numeric'}).format(new Date(date+'T12:00:00'));}
async function json(fetcher,url,signal,bound){const response=await fetcher(url,{credentials:'omit',redirect:'error',signal,cache:'no-cache'});if(!response.ok)throw new Error('Journal unavailable');const reader=response.body.getReader();let bytes=0,text='';const decoder=new TextDecoder();try{while(true){const chunk=await reader.read();if(chunk.done)break;bytes+=chunk.value.length;if(bytes>bound){await reader.cancel();throw new Error('Journal record too large');}text+=decoder.decode(chunk.value,{stream:true});}return JSON.parse(text+decoder.decode());}finally{reader.releaseLock();}}
export function createGrowingJournal(fallback,options={}){
  const fetcher=options.fetcher||(typeof window.fetch==='function'?window.fetch.bind(window):null),abort=new AbortController();let destroyed=false,started=false;const cleanups=[];
  const grid=node('div','mushroom-journal-days');
  function pause(){grid.querySelectorAll('video').forEach(video=>video.pause());}
  function listen(target,event,handler){target.addEventListener(event,handler);cleanups.push(()=>target.removeEventListener(event,handler));}
  async function loadDay(entry,details,content){
    const path=entry.recordPath;if(!/^apps\/mushroom-exploration\/source\/journal\/days\/[a-f0-9-]+-\d+-[a-f0-9]{12}\.json$/.test(path))throw new Error('Invalid journal path');
    const record=await json(fetcher,recordRoot+path,abort.signal,1000000);if(destroyed)return;
    if(record.schemaVersion!=='1.0.0'||record.id!==entry.id||record.date!==entry.date||record.revision!==entry.revision||!Array.isArray(record.media)||!Array.isArray(record.cards))throw new Error('Journal record mismatch');
    const gallery=node('div','mushroom-journal-gallery');
    for(const media of record.media){const figure=node('figure');if(media.kind==='video'){const video=node('video');video.controls=true;video.preload='none';video.playsInline=true;video.poster=mediaURL(media.thumbnailUrl);video.src=mediaURL(media.url);listen(video,'play',()=>{pauseOther(video);options.onPlay?.();});figure.append(video);}else if(media.kind==='image'){const image=node('img');image.src=mediaURL(media.url);image.alt=typeof media.alt==='string'&&media.alt.trim()?media.alt:typeof media.caption==='string'&&media.caption.trim()?media.caption:'Our classroom mushroom growing block';image.loading='lazy';image.decoding='async';figure.append(image);}else throw new Error('Invalid media kind');if(typeof media.caption==='string'&&media.caption)figure.append(node('figcaption','',media.caption));gallery.append(figure);}
    const notes=node('div','mushroom-journal-notes');for(const card of record.cards){if(!Object.hasOwn(labels,card.type)||typeof card.text!=='string'||!card.text.trim())continue;const note=node('article','mushroom-journal-note '+card.type);note.append(node('span','mushroom-journal-kind',labels[card.type]));if(typeof card.heading==='string'&&card.heading)note.append(node('h4','',card.heading));note.append(node('p','',card.text));if(typeof card.author==='string'&&card.author)note.append(node('p','mushroom-journal-author','— '+card.author));if(card.type==='fact'&&card.sourceUrl){const url=new URL(card.sourceUrl);if(url.protocol==='https:'&&!url.username&&!url.password){const link=node('a','','Learn more');link.href=url.href;link.target='_blank';link.rel='noopener noreferrer';note.append(link);}}notes.append(note);}
    content.replaceChildren(gallery,notes);details.dataset.loaded='true';
  }
  function pauseOther(active){grid.querySelectorAll('video').forEach(video=>{if(video!==active)video.pause();});}
  async function load(){
    if(started||destroyed||!fetcher)return;started=true;
    try{const index=await json(fetcher,MUSHROOM_JOURNAL_FEED,abort.signal,300000);if(destroyed)return;if(index.schemaVersion!=='1.0.0'||!Array.isArray(index.entries))throw new Error('Invalid journal index');if(!index.entries.length)return;
      const seen=new Set();for(const entry of index.entries){if(typeof entry.id!=='string'||!entry.id.match(/^[a-f0-9-]{36}$/)||seen.has(entry.id)||!Number.isInteger(entry.revision)||entry.revision<1)throw new Error('Invalid journal identity');seen.add(entry.id);
        const details=node('details','mushroom-journal-day'),summary=node('summary'),copy=node('div','mushroom-journal-summary-copy');
        if(entry.cover){const image=node('img','mushroom-journal-cover');image.src=mediaURL(entry.cover.url);image.alt=typeof entry.cover.alt==='string'?entry.cover.alt:'';image.loading='lazy';summary.append(image);}
        copy.append(node('span','mushroom-journal-date',dateLabel(entry.date)),node('h3','',entry.title||'Our growing story'));if(entry.stage)copy.append(node('p','',entry.stage));summary.append(copy,node('span','mushroom-journal-toggle','Open this day'));const content=node('div','mushroom-journal-day-body');details.append(summary,content);
        let loading=false;listen(details,'toggle',()=>{if(!details.open){details.querySelectorAll('video').forEach(video=>video.pause());return;}if(details.dataset.loaded||loading)return;loading=true;content.replaceChildren(node('p','mushroom-journal-status','Opening this day…'));loadDay(entry,details,content).catch(()=>{if(destroyed)return;const retry=node('button','mushroom-button','Try this day again');listen(retry,'click',()=>{details.open=false;details.open=true;});content.replaceChildren(node('p','','This day could not open just now.'),retry);}).finally(()=>{loading=false;});});grid.append(details);
      }fallback.replaceWith(grid);options.onReady?.(index.entries.length);
    }catch{started=false;}
  }
  function navigation(event){const anchor=event.target.closest?.('a[href]');if(anchor&&anchor.hash&&anchor.hash!=='#mushrooms-journal')pause();}
  listen(document,'click',navigation);listen(document,'visibilitychange',()=>{if(document.hidden)pause();});
  let observer;if(typeof window.IntersectionObserver==='function'){observer=new window.IntersectionObserver(entries=>{if(entries.some(entry=>entry.isIntersecting)){void load();observer.disconnect();}},{rootMargin:'500px'});observer.observe(fallback);}
  // An explicit loader also supports the exhibit's offline test harness.
  return {node:grid,load,suspend:pause,destroy(){destroyed=true;abort.abort();observer?.disconnect();pause();cleanups.forEach(cleanup=>cleanup());grid.querySelectorAll('video').forEach(video=>{video.removeAttribute('src');video.load();});}};
}
