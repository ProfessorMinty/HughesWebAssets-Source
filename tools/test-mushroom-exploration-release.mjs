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
const settle=async()=>{for(let i=0;i<8;i++)await new Promise(r=>setImmediate(r));};
const sha=bytes=>createHash('sha256').update(bytes).digest('hex');
async function rejection({manifest,expectedHash,assets={}}){
 const dom=new JSDOM('<main><div id="hrv-mushroom-exploration-root"><p>Our growing story will be back soon.</p></div></main>',{url:'https://rmhughes.edublogs.org/new-page/'});
 const bytes=Buffer.from(JSON.stringify(manifest));const script=dom.window.document.createElement('script');
 script.src='https://cdn.jsdelivr.net/gh/ProfessorMinty/HughesWebAssets-Source@'+'a'.repeat(40)+'/releases/mushroom-exploration/2026.11.07.1/src/bootstrap.js';
 script.setAttribute('data-release-version','2026.11.07.1');script.setAttribute('data-release-sha256',expectedHash||sha(bytes));
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
function doorwayCode(){let code=template;for(const [token,value]of Object.entries({__BOOTSTRAP_URL__:'https://cdn.jsdelivr.net/example/src/bootstrap.js',__BOOTSTRAP_SRI__:'sha256-test',__RELEASE_SHA256__:'a'.repeat(64),__RELEASE_VERSION__:'2026.11.07.1'}))code=code.replace(token,value);return code;}
test('JS-window doorway creates one mount while preserving unrelated native content',()=>{
 const dom=new JSDOM('<article class="page"><div class="entry-content"><p id="preserve">Teacher text</p></div></article>',{url:'https://rmhughes.edublogs.org/new-page/',runScripts:'outside-only'});
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 assert.equal(dom.window.document.querySelectorAll('#hrv-mushroom-exploration-root').length,1);assert.equal(dom.window.document.querySelectorAll('script[src]').length,1);assert.equal(dom.window.document.querySelector('#preserve').textContent,'Teacher text');
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));dom.window.close();
});
test('a failed doorway exposes a retry and handles a fresh successful startup',()=>{
 const dom=new JSDOM('<article class="page"><div class="entry-content"></div></article>',{url:'https://rmhughes.edublogs.org/new-page/',runScripts:'outside-only'});
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));
 dom.window.document.querySelector('script[src]').dispatchEvent(new dom.window.Event('error'));
 assert.equal(dom.window.document.querySelector('#hrv-mushroom-exploration-root').dataset.hrvState,'unavailable');
 dom.window.document.querySelector('.hrv-mushroom-retry').click();assert.equal(dom.window.document.querySelectorAll('script[src]').length,1);
 dom.window.dispatchEvent(new dom.window.CustomEvent('hrv:mushrooms-ready',{detail:{pageId:'hrv-page:mushrooms-2026-2027'}}));dom.window.close();
});
test('doorway does not guess between multiple page content mounts',()=>{
 const dom=new JSDOM('<article class="page"><div class="entry-content"></div><div class="entry-content"></div></article>',{runScripts:'outside-only'});
 dom.window.eval(doorwayCode());dom.window.document.dispatchEvent(new dom.window.Event('DOMContentLoaded'));assert.equal(dom.window.document.querySelectorAll('script[src]').length,0);dom.window.close();
});
