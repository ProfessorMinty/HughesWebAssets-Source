import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {createHash,webcrypto} from 'node:crypto';
import vm from 'node:vm';
import {JSDOM} from 'jsdom';
import {safeReleasePath,verifyClassroomJournal,hash} from './verify-mushroom-exploration-publication.mjs';
import {MUSHROOM_JOURNAL_FEED} from '../apps/mushroom-exploration/src/journal.js';
const bootstrap=await readFile(new URL('../apps/mushroom-exploration/release-bootstrap.template.js',import.meta.url),'utf8');
const template=await readFile(new URL('../apps/mushroom-exploration/doorway.template.js',import.meta.url),'utf8');
const staticDoorway=await readFile(new URL('../apps/mushroom-exploration/doorway.template.html',import.meta.url),'utf8');
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r));};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function rejection({manifest,expectedHash,assets={}}){
 const dom=new JSDOM('<main><div id="hrv-mushroom-exploration-root"><p>Our growing story will be back soon.</p></div></main>',{url:'https://rmhughes.edublogs.org/new-page/'});
 const bytes=Buffer.from(JSON.stringify(manifest));const script=dom.window.document.createElement('script');
 script.src='https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@'+'a'.repeat(40)+'/releases/mushroom-exploration/2026.11.07.1/src/bootstrap.js';
 script.setAttribute('data-release-root','https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/'+'a'.repeat(40)+'/releases/mushroom-exploration/2026.11.07.1/');script.setAttribute('data-release-version','2026.11.07.1');script.setAttribute('data-release-sha256',expectedHash||sha(bytes));
 Object.defineProperty(dom.window.document,'currentScript',{value:script,configurable:true});
 let failures=0,finished,watch;const failed=new Promise(resolve=>{finished=resolve;});dom.window.addEventListener('hrv:mushrooms-error',()=>{failures++;finished();});
 const context=vm.createContext({document:dom.window.document,window:dom.window,URL,Blob,AbortController,TextDecoder,crypto:webcrypto,CustomEvent:dom.window.CustomEvent,setTimeout,clearTimeout,fetch:async url=>new Response(url.endsWith('/release.json')?bytes:assets[new URL(url).pathname.split('/').at(-1)]||'',{status:200})});
 new vm.Script(bootstrap).runInContext(context);
 try{await Promise.race([failed,new Promise((_resolve,reject)=>{watch=setTimeout(()=>reject(new Error('Expected release failure did not arrive')),1000);})]);}finally{clearTimeout(watch);}
 assert.equal(failures,1);assert.equal(dom.window.document.querySelector('#hrv-mushroom-exploration-root').dataset.hrvState,'unavailable');
 assert.match(dom.window.document.body.textContent,/back soon/);assert.equal(dom.window.document.querySelectorAll('[data-hrv-mushrooms-style]').length,0);dom.window.close();
}
const base={schemaVersion:'1.0.0',application:'hrv-page:mushrooms-2026-2027',version:'2026.11.07.1',files:[]};
test('release paths refuse traversal, absolute paths and duplicate separators',()=>{
 for(const p of ['../x','src/../x','/src/runtime.js','src//x','src/./x','https://other.invalid/x'])assert.equal(safeReleasePath(p),false,p);
 assert.equal(safeReleasePath('src/assets/entrance-v1.webp'),true);
});
test('loader refuses a tampered manifest and restores the host fallback',()=>rejection({manifest:base,expectedHash:'0'.repeat(64)}));
test('loader refuses unsafe manifest paths before mounting or injecting styles',()=>rejection({manifest:{...base,files:[{path:'../outside.js',bytes:1,sha256:'a'.repeat(64)}]}}));
test('loader refuses missing production entry points',()=>rejection({manifest:base}));
test('loader refuses changed asset bytes before execution',()=>{
 const files=['runtime.js','exhibit.css','host-compat.css','mushrooms.source.json'].map(name=>({path:'src/'+name,bytes:1,sha256:sha(Buffer.from('x'))}));
 return rejection({manifest:{...base,files},assets:{'runtime.js':'y','exhibit.css':'x','host-compat.css':'x','mushrooms.source.json':'x'}});
});
test('an empty published journal cannot pass integration preflight',async()=>{
 await assert.rejects(verifyClassroomJournal({fetcher:async()=>new Response(JSON.stringify({schemaVersion:'1.0.0',entries:[]}))}),/incomplete/);
});
test('journal preflight checks record identity before trusting classroom media',async()=>{
 const entries=[1,2,3,4].map(n=>({id:`00000000-0000-4000-8000-00000000000${n}`,date:'2026-11-04',revision:1,recordPath:`apps/mushroom-exploration/source/journal/days/00000000-0000-4000-8000-00000000000${n}-1-123456789abc.json`}));
 await assert.rejects(verifyClassroomJournal({fetcher:async url=>new Response(JSON.stringify(url===MUSHROOM_JOURNAL_FEED?{schemaVersion:'1.0.0',entries}:{schemaVersion:'1.0.0',id:'wrong',date:'2026-11-04',revision:1,media:[],cards:[]}))}),/day mismatch/);
});
const bootstrapFixture='/* verified bootstrap fixture */';
function doorwayCode(){let code=template;for(const [token,value]of Object.entries({__BOOTSTRAP_URL__:'https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/'+'a'.repeat(40)+'/releases/mushroom-exploration/2026.11.07.1/src/bootstrap.js',__BOOTSTRAP_SHA256__:sha(Buffer.from(bootstrapFixture)),__RELEASE_ROOT__:'https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/'+'a'.repeat(40)+'/releases/mushroom-exploration/2026.11.07.1/',__RELEASE_SHA256__:'a'.repeat(64),__RELEASE_VERSION__:'2026.11.07.1'}))code=code.replace(token,value);return code;}
function doorwayDom(body){const dom=new JSDOM(body,{url:'https://rmhughes.edublogs.org/new-page/',runScripts:'outside-only'});Object.defineProperty(dom.window,'crypto',{value:webcrypto});dom.window.fetch=async()=>new Response(bootstrapFixture);dom.window.URL.createObjectURL=()=> 'blob:https://rmhughes.edublogs.org/bootstrap';dom.window.URL.revokeObjectURL=()=>{};return dom;}
async function until(dom,predicate){const end=Date.now()+1000;while(!predicate()){if(Date.now()>end)throw new Error('Expected doorway state did not arrive');await new Promise(resolve=>setTimeout(resolve,5));}}
test('JS-window doorway creates one mount while preserving unrelated native content',async()=>{
 const dom=doorwayDom('<article class="page"><div class="entry-content"><p id="preserve">Teacher text</p></div></article>');
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 await until(dom,()=>dom.window.document.querySelector('script[src]'));
 assert.equal(dom.window.document.querySelectorAll('#hrv-mushroom-exploration-root').length,1);assert.equal(dom.window.document.querySelectorAll('script[src]').length,1);assert.equal(dom.window.document.querySelector('#preserve').textContent,'Teacher text');
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));dom.window.close();
});
test('a failed doorway exposes a retry and handles a fresh successful startup',async()=>{
 const dom=doorwayDom('<article class="page"><div class="entry-content"></div></article>');
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 await until(dom,()=>dom.window.document.querySelector('script[src]'));
 dom.window.document.querySelector('script[src]').dispatchEvent(new dom.window.Event('error'));
 assert.equal(dom.window.document.querySelector('#hrv-mushroom-exploration-root').dataset.hrvState,'unavailable');
 dom.window.document.querySelector('.hrv-mushroom-retry').click();await until(dom,()=>dom.window.document.querySelector('script[src]'));
 assert.equal(dom.window.document.querySelectorAll('script[src]').length,1);
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));dom.window.close();
});
test('doorway refuses modified bootstrap bytes before creating an executable script',async()=>{
 const dom=doorwayDom('<article class="page"><div class="entry-content"></div></article>');dom.window.fetch=async()=>new Response('changed executable');
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));await until(dom,()=>dom.window.document.querySelector('.hrv-mushroom-retry'));
 assert.equal(dom.window.document.querySelectorAll('script[src]').length,0);dom.window.close();
});
test('doorway does not guess between multiple page content mounts',()=>{
 const dom=doorwayDom('<article class="page"><div class="entry-content"></div><div class="entry-content"></div></article>');
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));assert.equal(dom.window.document.querySelectorAll('script[src]').length,0);dom.window.close();
});
test('three-field doorway keeps a readable outage and illustration with no JavaScript or external asset',()=>{
 const dom=doorwayDom(staticDoorway),notice=dom.window.document.querySelector('[data-hrv-outage-notice]');
 assert.equal(notice.hidden,false);assert.match(notice.textContent,/temporarily unavailable/);
 assert.match(notice.querySelector('[aria-hidden=true]').textContent,/🍄/);
 assert.equal(notice.querySelectorAll('img,script,link,iframe').length,0);
 assert.equal(notice.querySelector('button').hidden,true);
 assert.equal(notice.parentNode,dom.window.document.querySelector('#hrv-mushroom-exploration-root').parentNode);
 dom.window.close();
});
test('three-field doorway survives a network failure and exposes one working retry',async()=>{
 const dom=doorwayDom(staticDoorway);dom.window.fetch=async()=>{throw new Error('Offline');};
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 const notice=dom.window.document.querySelector('[data-hrv-outage-notice]'),root=dom.window.document.querySelector('#hrv-mushroom-exploration-root');
 await until(dom,()=>root.dataset.hrvState==='unavailable');
 assert.equal(notice.hidden,false);assert.equal(root.hidden,true);assert.equal(notice.querySelector('button').hidden,false);
 dom.window.fetch=async()=>new Response(bootstrapFixture);notice.querySelector('button').click();
 await until(dom,()=>dom.window.document.querySelector('script[src]'));
 assert.equal(root.hidden,false);assert.match(notice.textContent,/Opening our classroom/);
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'different-page'}}));assert.equal(notice.hidden,false);
 root.dataset.hrvState='ready';dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));
 assert.equal(notice.hidden,true);assert.equal(root.hasAttribute('aria-busy'),false);dom.window.close();
});
test('three-field outage remains outside partial app content after a runtime error',async()=>{
 const dom=doorwayDom(staticDoorway);dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 await until(dom,()=>dom.window.document.querySelector('script[src]'));
 const root=dom.window.document.querySelector('#hrv-mushroom-exploration-root');root.innerHTML='<p>Partial app</p>';
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-error',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));
 assert.equal(root.childElementCount,0);assert.equal(root.hidden,true);
 const notice=dom.window.document.querySelector('[data-hrv-outage-notice]');assert.equal(notice.hidden,false);assert.match(notice.textContent,/taking a little rest/);
 dom.window.close();
});
test('three-field doorway timeout exposes the static outage and ignores late success',()=>{
 const dom=doorwayDom(staticDoorway);dom.window.fetch=()=>new Promise(()=>{});
 let deadline;dom.window.setTimeout=(callback)=>{deadline=callback;return 1;};dom.window.clearTimeout=()=>{};
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));deadline();
 const notice=dom.window.document.querySelector('[data-hrv-outage-notice]');assert.equal(notice.hidden,false);assert.equal(notice.querySelector('button').hidden,false);
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));assert.equal(notice.hidden,false);
 dom.window.close();
});
