import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { createServer } from 'node:http';
import { tmpdir } from 'node:os';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawn } from 'node:child_process';

// Synthetic renderer smoke only: fresh local profile, no signed-in host, no model
// or publication. The screenshot artifacts still require a human visual review.
const here=dirname(fileURLToPath(import.meta.url));
const output=resolve(process.env.CLASSROOM_BROWSER_OUTPUT || 'artifacts/classroom-page-browser');
const scratch=await mkdtemp(join(tmpdir(),'hrv-classroom-browser-'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const fixtureNames=['museum-page-v3','museum-post-v3'];
const files=new Map();
const results=[],screenshots=[],blockedRequests=[],exceptions=[];
let chrome,client,server,browserVersion;
const report={scope:'synthetic-renderer-browser-only',sourceCommit:process.env.GITHUB_SHA || null,
  liveHostAcceptance:false,aiRequests:0,publicationPerformed:false,results,screenshots,blockedRequests,exceptions};

class CdpClient {
  static async connect(url) {
    const socket=new WebSocket(url);
    await new Promise((accept,reject)=>{
      const timer=setTimeout(()=>reject(new Error('CDP connection timed out')),10000);
      socket.addEventListener('open',()=>{clearTimeout(timer);accept();},{once:true});
      socket.addEventListener('error',event=>{clearTimeout(timer);reject(event);},{once:true});
    });
    return new CdpClient(socket);
  }
  constructor(socket) {
    this.socket=socket;this.nextId=0;this.pending=new Map();this.listeners=new Map();
    socket.addEventListener('message',event=>{
      const message=JSON.parse(event.data);
      const pending=this.pending.get(message.id);
      if (pending) {
        this.pending.delete(message.id);clearTimeout(pending.timer);
        if (message.error) pending.reject(new Error(message.error.message));
        else pending.accept(message.result);
      }
      if (message.method) for (const listener of this.listeners.get(message.method) || []) listener(message.params,message.sessionId);
    });
    socket.addEventListener('close',()=>{
      for (const pending of this.pending.values()) {clearTimeout(pending.timer);pending.reject(new Error('CDP closed'));}
      this.pending.clear();
    });
  }
  call(method,params={},sessionId) {
    const id=++this.nextId;
    return new Promise((accept,reject)=>{
      const timer=setTimeout(()=>{this.pending.delete(id);reject(new Error(method+' timed out'));},10000);
      this.pending.set(id,{accept,reject,timer});
      this.socket.send(JSON.stringify({id,method,params,...(sessionId ? {sessionId} : {})}));
    });
  }
  on(method,listener) {
    if (!this.listeners.has(method)) this.listeners.set(method,new Set());
    this.listeners.get(method).add(listener);
  }
  close() {this.socket.close();}
}
const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
async function evaluate(page,expression) {
  const result=await page.call('Runtime.evaluate',{expression,returnByValue:true,awaitPromise:true});
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.exception?.description || result.exceptionDetails.text);
  return result.result.value;
}
async function eventually(page,expression,label) {
  for (let attempt=0;attempt<80;attempt++) {
    if (await evaluate(page,expression)) return;
    await delay(100);
  }
  throw new Error('Timed out: '+label);
}
async function capture(page,name) {
  const metrics=await page.call('Page.getLayoutMetrics');
  const size=metrics.cssContentSize;
  assert.ok(size.height<16000,'Synthetic fixture unexpectedly exceeds screenshot height limit');
  const captured=await page.call('Page.captureScreenshot',{format:'png',fromSurface:true,captureBeyondViewport:true,
    clip:{x:0,y:0,width:Math.ceil(size.width),height:Math.ceil(size.height),scale:1}});
  const bytes=Buffer.from(captured.data,'base64');
  await writeFile(join(output,name+'.png'),bytes);
  screenshots.push({file:name+'.png',bytes:bytes.length,sha256:hash(bytes),width:Math.ceil(size.width),height:Math.ceil(size.height)});
}

try {
  await mkdir(output,{recursive:true});
  for (const name of fixtureNames) {
    const target=join(scratch,name);
    execFileSync(process.execPath,[join(here,'build/build.mjs'),join(here,'fixtures',name+'.source.json'),'1',target],{stdio:'pipe'});
    files.set('/'+name+'/index.html',await readFile(join(target,'index.html')));
  }
  server=createServer((request,response)=>{
    const pathname=new URL(request.url,'http://localhost').pathname;
    if (pathname === '/favicon.ico') {response.writeHead(204);response.end();return;}
    const content=files.get(pathname);
    response.writeHead(content ? 200 : 404,{
      'Content-Type':'text/html; charset=utf-8',
      'Cache-Control':'no-store',
      'Content-Security-Policy':"default-src 'none'; style-src 'unsafe-inline'; img-src 'self'; base-uri 'none'; form-action 'none'",
    });
    response.end(content || 'Not found');
  });
  await new Promise((accept,reject)=>{server.once('error',reject);server.listen(0,'127.0.0.1',accept);});
  const origin='http://127.0.0.1:'+server.address().port;
  const chromePath=[process.env.CLASSROOM_CHROME_PATH,'/usr/bin/google-chrome','/usr/bin/google-chrome-stable','/usr/bin/chromium','/usr/bin/chromium-browser'].filter(Boolean).find(existsSync);
  assert.ok(chromePath,'Set CLASSROOM_CHROME_PATH to an installed Chrome or Chromium executable.');
  chrome=spawn(chromePath,[
    '--headless=new','--disable-background-networking','--disable-component-update','--disable-default-apps',
    '--disable-dev-shm-usage','--disable-extensions','--disable-gpu','--disable-sync','--metrics-recording-only',
    '--no-first-run','--no-default-browser-check','--no-sandbox','--remote-debugging-port=0',
    '--user-data-dir='+join(scratch,'fresh-profile'),'about:blank',
  ],{stdio:['ignore','ignore','pipe']});
  const devtools=await new Promise((accept,reject)=>{
    let stderr='';
    const timer=setTimeout(()=>reject(new Error('Chrome did not start: '+stderr.slice(-2000))),15000);
    chrome.once('error',error=>{clearTimeout(timer);reject(error);});
    chrome.once('exit',code=>{clearTimeout(timer);reject(new Error('Chrome exited before connection: '+code+' '+stderr.slice(-2000)));});
    chrome.stderr.on('data',chunk=>{
      stderr+=chunk.toString();
      const match=stderr.match(/DevTools listening on (ws:\/\/[^\s]+)/);
      if (match) {clearTimeout(timer);accept(match[1]);}
    });
  });
  client=await CdpClient.connect(devtools);
  browserVersion=await client.call('Browser.getVersion');
  client.on('Fetch.requestPaused',(params,sessionId)=>{
    const allowed=new URL(params.request.url).origin === origin;
    if (!allowed) blockedRequests.push({url:params.request.url,resourceType:params.resourceType});
    void client.call(allowed ? 'Fetch.continueRequest' : 'Fetch.failRequest',
      allowed ? {requestId:params.requestId} : {requestId:params.requestId,errorReason:'BlockedByClient'},sessionId)
      .catch(error=>exceptions.push({phase:'interception',message:error.message}));
  });
  client.on('Runtime.exceptionThrown',params=>exceptions.push(params.exceptionDetails));
  for (const name of fixtureNames) for (const viewport of [{name:'desktop',width:1440,height:1000},{name:'mobile',width:390,height:844}]) {
    const {targetId}=await client.call('Target.createTarget',{url:'about:blank'});
    const {sessionId}=await client.call('Target.attachToTarget',{targetId,flatten:true});
    const page={call:(method,params)=>client.call(method,params,sessionId)};
    try {
      await page.call('Page.enable');await page.call('Runtime.enable');
      await page.call('Fetch.enable',{patterns:[{urlPattern:'*',requestStage:'Request'}]});
      await page.call('Emulation.setDeviceMetricsOverride',{width:viewport.width,height:viewport.height,deviceScaleFactor:1,mobile:viewport.name === 'mobile'});
      // The owner chose Full by default, even when the OS preference is reduced.
      await page.call('Emulation.setEmulatedMedia',{features:[{name:'prefers-reduced-motion',value:'reduce'}]});
      await page.call('Page.navigate',{url:origin+'/'+name+'/index.html'});
      await eventually(page,"document.readyState === 'complete' && document.querySelectorAll('[data-station-layout]').length === 3",'rendered stations');
      await eventually(page,"getComputedStyle(document.querySelector('.lw-museum-opener')).visibility === 'hidden'",'opening moment ends');
      const layout=await evaluate(page,"(()=>{const visible=e=>e.getClientRects().length && getComputedStyle(e).visibility!=='hidden';return {width:innerWidth,scrollWidth:document.documentElement.scrollWidth,layouts:[...document.querySelectorAll('[data-station-layout]')].map(e=>e.dataset.stationLayout),nativeKind:document.querySelector('[data-experience]').dataset.nativeKind || 'page',fullAnimation:getComputedStyle(document.querySelector('.lw-station-stamp')).animationName,overflows:[...document.querySelectorAll('h1,h2,h3,p,summary,a,fieldset,label')].filter(visible).filter(e=>{const r=e.getBoundingClientRect();return r.left < -1 || r.right > innerWidth+1;}).map(e=>({tag:e.tagName,text:e.textContent.slice(0,100)})),credits:document.querySelectorAll('.lw-sources details').length};})()");
      assert.ok(layout.scrollWidth<=layout.width+1,'Horizontal page overflow: '+JSON.stringify(layout));
      assert.deepEqual(layout.overflows,[],'Readable content exceeds viewport');
      assert.equal(new Set(layout.layouts).size,3);
      assert.equal(layout.nativeKind,name.includes('post') ? 'post' : 'page');
      assert.match(layout.fullAnimation,/lwMuseumFloat/);
      assert.ok(layout.credits>=2,'Station and complete credits must render');
      const interaction=await evaluate(page,"(()=>{const radios=[...document.querySelectorAll('.lw-stage-control')];const first=radios[0].checked;radios[1].click();const panel=document.getElementById(radios[1].getAttribute('aria-controls'));const disclosure=document.querySelector('.lw-interactive details');disclosure.querySelector('summary').click();const credits=document.querySelector('.lw-sources details');credits.querySelector('summary').click();return {first,second:radios[1].checked,panelVisible:getComputedStyle(panel).display!=='none',disclosureOpen:disclosure.open,creditsOpen:credits.open,creditText:credits.textContent};})()");
      assert.equal(interaction.first,true);assert.equal(interaction.second,true);assert.equal(interaction.panelVisible,true);
      assert.equal(interaction.disclosureOpen,true);assert.equal(interaction.creditsOpen,true);
      assert.match(interaction.creditText,/Synthetic fixture/);
      await capture(page,name+'-'+viewport.name+'-full');
      await evaluate(page,"document.documentElement.dataset.hrvEffects='reduced';window.dispatchEvent(new CustomEvent('hrv:effectschange',{detail:{version:1,mode:'reduced'}}));true");
      const reduced=await evaluate(page,"(()=>{const selectors=['.lw-station-stamp','.lw-station-trace','.lw-divider-center','.lw-divider-orbit','.lw-divider-satellite','.lw-museum-parade>div','.lw-museum-world i:first-child','.lw-museum-world i:last-child'];return {animations:selectors.map(selector=>getComputedStyle(document.querySelector(selector)).animationName),opener:getComputedStyle(document.querySelector('.lw-museum-opener')).display,text:document.body.textContent};})()");
      assert.ok(reduced.animations.every(value=>value === 'none'));
      assert.equal(reduced.opener,'none');assert.match(reduced.text,/exact classroom wording 1/);
      await capture(page,name+'-'+viewport.name+'-reduced');
      await evaluate(page,"document.documentElement.dataset.hrvEffects='full';window.dispatchEvent(new CustomEvent('hrv:effectschange',{detail:{version:1,mode:'full'}}));true");
      assert.match(await evaluate(page,"getComputedStyle(document.querySelector('.lw-station-stamp')).animationName"),/lwMuseumFloat/);
      results.push({fixture:name,viewport,layout,interaction,explicitReducedEffects:true,fullRestored:true,passed:true});
    } finally {await client.call('Target.closeTarget',{targetId});}
  }
  assert.deepEqual(blockedRequests,[],'Fixture attempted external resources');
  assert.deepEqual(exceptions,[],'Browser runtime exceptions');
  report.passed=true;
} catch (error) {
  report.passed=false;report.error=error.stack || String(error);process.exitCode=1;
} finally {
  report.browserVersion=browserVersion || null;
  await mkdir(output,{recursive:true});
  await writeFile(join(output,'report.json'),JSON.stringify(report,null,2)+'\n');
  if (client) client.close();
  if (chrome && chrome.exitCode === null) {
    chrome.kill('SIGTERM');
    await Promise.race([new Promise(resolve=>chrome.once('exit',resolve)),delay(3000)]);
    if (chrome.exitCode === null) chrome.kill('SIGKILL');
  }
  if (server) await new Promise(resolve=>server.close(resolve));
  // Remove only this process's newly allocated scratch directory, never a real profile.
  await rm(scratch,{recursive:true,force:true});
}
console.log(JSON.stringify(report,null,2));
