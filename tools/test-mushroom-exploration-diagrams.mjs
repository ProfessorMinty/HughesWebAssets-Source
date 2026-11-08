import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {JSDOM} from 'jsdom';
import {mountMushroomExhibit} from '../apps/mushroom-exploration/src/runtime.js';
import {MUSHROOM_DIAGRAMS} from '../apps/mushroom-exploration/src/diagram-catalog.js';

const source=JSON.parse(await readFile(new URL('../apps/mushroom-exploration/source/mushrooms.source.json',import.meta.url)));
const settle=async()=>{for(let i=0;i<4;i++)await new Promise(resolve=>setImmediate(resolve));};
async function setup(run){
 const dom=new JSDOM('<div id="mushroom-root"></div>',{url:'https://classroom.invalid/'}),saved=new Map();
 const observer=class {observe(){} disconnect(){}};
 dom.window.matchMedia=()=>({matches:false,addEventListener(){},removeEventListener(){}});
 dom.window.HTMLMediaElement.prototype.pause=function(){};dom.window.HTMLMediaElement.prototype.load=function(){};
 dom.window.HTMLElement.prototype.scrollIntoView=function(){};
 dom.window.fetch=async()=>new Response(JSON.stringify({schemaVersion:'1.0.0',entries:[]}));
 let destroyed=0;
 dom.window.YT={Player:class{constructor(_frame,{events}){queueMicrotask(()=>events.onReady());}destroy(){destroyed++;}getCurrentTime(){return 0;}}};
 const bindings={window:dom.window,document:dom.window.document,HTMLElement:dom.window.HTMLElement,CustomEvent:dom.window.CustomEvent,location:dom.window.location,history:dom.window.history,ResizeObserver:observer,IntersectionObserver:observer,requestAnimationFrame:()=>0,cancelAnimationFrame:()=>{}};
 for(const [key,value] of Object.entries(bindings)){saved.set(key,Object.getOwnPropertyDescriptor(globalThis,key));Object.defineProperty(globalThis,key,{value,writable:true,configurable:true});}
 let controller;
 try{const root=document.querySelector('#mushroom-root');controller=mountMushroomExhibit(root,source,{allowDraft:true});await settle();await run(root,dom,()=>destroyed);}
 finally{controller?.destroy();dom.window.close();for(const [key,descriptor] of saved){if(descriptor)Object.defineProperty(globalThis,key,descriptor);else delete globalThis[key];}}
}

test('published diagrams have intact delivery files and accessible provenance',async()=>{
 for(const diagram of MUSHROOM_DIAGRAMS){const bytes=await readFile(new URL('../apps/mushroom-exploration/src/'+diagram.file,import.meta.url));assert.equal(bytes.length,diagram.bytes);assert.equal(createHash('sha256').update(bytes).digest('hex'),diagram.sha256);assert.ok(diagram.creator&&diagram.alt&&diagram.changes);assert.equal(new URL(diagram.page).protocol,'https:');assert.equal(new URL(diagram.licenseUrl).protocol,'https:');}
});
test('science uses published pictures while anatomy and life-cycle explanations remain selectable',async()=>setup(async(root)=>{
 assert.equal(root.dataset.hrvState,'ready');assert.equal(root.querySelectorAll('.mushroom-main svg').length,0);
 for(const diagram of MUSHROOM_DIAGRAMS)assert.ok(root.querySelector('[data-photo-id="'+diagram.id+'"] img'),diagram.id);
 const gills=root.querySelector('.mushroom-part-button[data-record-id="mushroom-point:gills"]');gills.click();assert.equal(gills.getAttribute('aria-pressed'),'true');assert.match(root.querySelector('.mushroom-observation-card').textContent,/gills/i);assert.equal(root.querySelector('.mushroom-anatomy-photo').hidden,false);
 const steps=[...root.querySelectorAll('.mushroom-cycle-stage')];assert.equal(steps.length,4);steps[3].click();assert.equal(steps[3].getAttribute('aria-pressed'),'true');assert.ok(root.querySelector('.mushroom-step-detail').textContent.includes(source.data.blocks.find(b=>b.type==='lifecycle').steps[3].body));
}));
test('one collapsed bottom drawer credits illustrations, photos, research footage and Reuters',async()=>setup(async(root)=>{
 const credits=root.querySelector('.mushroom-credits'),explore=root.querySelector('.mushroom-optional-exploration'),journal=root.querySelector('#mushrooms-journal');
 assert.equal(credits.open,false);assert.equal(credits.querySelector('summary').textContent,'Credits & sources');assert.ok(journal.compareDocumentPosition(explore)&4);assert.ok(explore.compareDocumentPosition(credits)&4);
 for(const diagram of MUSHROOM_DIAGRAMS){assert.ok(credits.textContent.includes(diagram.creator));assert.ok([...credits.querySelectorAll('a')].some(a=>a.href===diagram.page));assert.ok(credits.textContent.includes(diagram.license));}
 assert.ok(credits.textContent.includes('Reuters'));assert.equal(root.querySelectorAll('.mushroom-sources').length,0);
}));
test('music opens only the real Reuters documentary and removes it when closed or switched',async()=>setup(async(root,_dom,destroyed)=>{
 const soundTab=root.querySelector('#mushrooms-motion-tab-sound');soundTab.click();const music=root.querySelector('.mushroom-documentary');
 assert.equal(music.querySelector('iframe'),null);assert.equal(music.querySelectorAll('input,select,svg,canvas,audio').length,0);
 const watch=[...music.querySelectorAll('button')].find(b=>b.textContent==='Watch the short documentary');watch.click();await settle();
 const frame=music.querySelector('iframe'),url=new URL(frame.src);assert.equal(url.hostname,'www.youtube-nocookie.com');assert.equal(url.pathname,'/embed/PVzPD4U-Lno');assert.equal(url.searchParams.get('autoplay'),'0');assert.equal(music.dataset.demoState,'ready');
 [...music.querySelectorAll('button')].find(b=>b.textContent==='Close video').click();assert.equal(music.querySelector('iframe'),null);assert.equal(watch.disabled,false);assert.ok(destroyed()>0);
 watch.click();await settle();root.querySelector('#mushrooms-motion-tab-glow').click();assert.equal(music.querySelector('iframe'),null);
}));
