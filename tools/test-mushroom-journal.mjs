import test from 'node:test';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';
import { createGrowingJournal, MUSHROOM_JOURNAL_FEED } from '../apps/mushroom-exploration/src/journal.js';
const id='bc8253d4-eef8-4e72-953f-6c63e9a92470';
const path=`apps/mushroom-exploration/source/journal/days/${id}-1-123456789abc.json`;
const url=`https://cdn.nlightlabs.com/hrv/mushrooms/${id}/photo/image.webp`;
const entry={id,date:'2026-11-04',title:'Little mushrooms!',stage:'Caps are visible',revision:1,recordPath:path,cover:{url,alt:'Our growing block'}};
const record={schemaVersion:'1.0.0',id,date:entry.date,revision:1,media:[{id:'media',kind:'image',url,thumbnailUrl:url,caption:'Our classroom picture',alt:'Small brown mushrooms'}],cards:[{id:'student',type:'student-note',text:'I see a tiny hat!',author:'',heading:''},{id:'teacher',type:'teacher-note',text:'',author:'',heading:''},{id:'fact',type:'fact',text:'A supporting fact',author:'',heading:'Did you notice?'}]};
async function setup(run){const dom=new JSDOM('<main><div id="fallback">Our growing story is coming.</div></main>',{url:'https://classroom.invalid/'}),old={window:globalThis.window,document:globalThis.document};globalThis.window=dom.window;globalThis.document=dom.window.document;let pauses=0;dom.window.HTMLMediaElement.prototype.pause=function(){pauses++;};dom.window.HTMLMediaElement.prototype.load=function(){};try{await run(dom,()=>pauses);}finally{globalThis.window=old.window;globalThis.document=old.document;dom.window.close();}}
const settle=async()=>{for(let i=0;i<5;i++)await new Promise(resolve=>setImmediate(resolve));};
test('journal loads only the day index before expansion and renders unnamed student words without invented notes',async()=>setup(async dom=>{
 const calls=[],fetcher=async url=>{calls.push(url);return new Response(JSON.stringify(url===MUSHROOM_JOURNAL_FEED?{schemaVersion:'1.0.0',entries:[entry]}:record));};
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher});await journal.load();assert.equal(calls.length,1);assert.equal(document.querySelectorAll('details').length,1);assert.equal(document.querySelectorAll('figure').length,0);
 const day=document.querySelector('details');day.open=true;day.dispatchEvent(new dom.window.Event('toggle'));await settle();assert.equal(calls.length,2);assert.equal(document.querySelectorAll('figure').length,1);assert.ok(document.body.textContent.includes('I see a tiny hat!'));assert.equal(document.querySelectorAll('.teacher-note').length,0);assert.equal(document.querySelectorAll('.mushroom-journal-author').length,0);journal.destroy();
}));
test('journal displays supplied text as text and never executes markup',async()=>setup(async dom=>{
 const changed=structuredClone(record);changed.cards[0].text='<img src=x onerror="alert(1)">';
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async url=>new Response(JSON.stringify(url===MUSHROOM_JOURNAL_FEED?{schemaVersion:'1.0.0',entries:[entry]}:changed))});await journal.load();const day=document.querySelector('details');day.open=true;day.dispatchEvent(new dom.window.Event('toggle'));await settle();assert.equal(document.querySelectorAll('[onerror]').length,0);assert.ok(document.body.textContent.includes('<img src=x'));journal.destroy();
}));
test('journal refuses a record from another day and retains a retryable day frame',async()=>setup(async dom=>{
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async url=>new Response(JSON.stringify(url===MUSHROOM_JOURNAL_FEED?{schemaVersion:'1.0.0',entries:[entry]}:{...record,id:'different'}))});await journal.load();const day=document.querySelector('details');day.open=true;day.dispatchEvent(new dom.window.Event('toggle'));await settle();assert.match(document.body.textContent,/could not open/);assert.equal(document.querySelectorAll('details').length,1);assert.equal(document.querySelectorAll('figure').length,0);journal.destroy();
}));
test('journal videos are intentional and pause when their day closes',async()=>setup(async(dom,pauses)=>{
 const changed=structuredClone(record);changed.media[0].kind='video';changed.media[0].url=url.replace('image.webp','video.mp4');
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async url=>new Response(JSON.stringify(url===MUSHROOM_JOURNAL_FEED?{schemaVersion:'1.0.0',entries:[entry]}:changed))});await journal.load();const day=document.querySelector('details');day.open=true;day.dispatchEvent(new dom.window.Event('toggle'));await settle();const video=document.querySelector('video');assert.equal(video.autoplay,false);assert.equal(video.preload,'none');assert.equal(video.controls,true);day.open=false;day.dispatchEvent(new dom.window.Event('toggle'));assert.ok(pauses()>0);journal.destroy();assert.equal(video.getAttribute('src'),null);
}));

test('a failed day retries directly without relying on coalesced details toggle events',async()=>setup(async dom=>{
 let attempts=0;
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async url=>{
  if(url===MUSHROOM_JOURNAL_FEED)return new Response(JSON.stringify({schemaVersion:'1.0.0',entries:[entry]}));
  attempts++;return attempts===1?new Response('',{status:503}):new Response(JSON.stringify(record));
 }});
 await journal.load();const day=document.querySelector('details');day.open=true;day.dispatchEvent(new dom.window.Event('toggle'));await settle();
 document.querySelector('.mushroom-journal-day-body button').click();await settle();
 assert.equal(attempts,2);assert.equal(day.dataset.loaded,'true');assert.equal(document.querySelectorAll('figure').length,1);journal.destroy();
}));
test('a failed index keeps the classroom fallback and exposes a functioning retry',async()=>setup(async()=>{
 let attempts=0;
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async()=>++attempts===1?new Response('',{status:503}):new Response(JSON.stringify({schemaVersion:'1.0.0',entries:[entry]}))});
 await journal.load();assert.match(document.body.textContent,/journal could not open/);assert.ok(document.querySelector('#fallback'));
 document.querySelector('#fallback button').click();await settle();assert.equal(document.querySelectorAll('.mushroom-journal-day').length,1);assert.equal(document.querySelector('#fallback'),null);journal.destroy();
}));
test('impossible calendar dates and duplicate identities never become published day frames',async()=>setup(async()=>{
 for(const entries of [[{...entry,date:'2026-02-30'}],[entry,entry]]){
  document.body.innerHTML='<div id="fallback">Our journal is getting ready.</div>';
  const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async()=>new Response(JSON.stringify({schemaVersion:'1.0.0',entries}))});
  await journal.load();assert.equal(document.querySelectorAll('.mushroom-journal-day').length,0);assert.match(document.body.textContent,/journal could not open/);journal.destroy();
 }
}));
test('a stalled request is aborted and leaves a recoverable classroom journal',async()=>setup(async()=>{
 let aborted=false;
 const journal=createGrowingJournal(document.querySelector('#fallback'),{timeoutMs:15,fetcher:(_url,options)=>new Promise((_resolve,reject)=>options.signal.addEventListener('abort',()=>{aborted=true;reject(new DOMException('Aborted','AbortError'));},{once:true}))});
 await journal.load();assert.equal(aborted,true);assert.match(document.body.textContent,/Try the journal again/);journal.destroy();
}));
test('day disclosure labels follow open and closed state',async()=>setup(async dom=>{
 const journal=createGrowingJournal(document.querySelector('#fallback'),{fetcher:async()=>new Response(JSON.stringify({schemaVersion:'1.0.0',entries:[entry]}))});
 await journal.load();const day=document.querySelector('details');day.open=true;day.dispatchEvent(new dom.window.Event('toggle'));assert.equal(day.querySelector('.mushroom-journal-toggle').textContent,'Close this day');day.open=false;day.dispatchEvent(new dom.window.Event('toggle'));assert.equal(day.querySelector('.mushroom-journal-toggle').textContent,'Open this day');journal.destroy();
}));
