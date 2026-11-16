/* Read-only, fixed-fixture investigation of the Lanternworks visitor runtime. */
(async function () {
  'use strict';
  const site = 'https://rmhughes.edublogs.org';
  const cdn = 'https://cdn.nlightlabs.com/hrv/hub-destinations/';
  const runtimeHash = '4989af5c8cfd6f6a453124a8f2c25a432afd1525d220b45adab68f3be0efe408';
  const runtimeUrl = cdn + 'runtime/' + runtimeHash + '/bootstrap.js';
  const runtimeSri = 'sha256-SYmvXIz9b2pFMSSo8sJaQyr9FSXSILRa2raPO+Dv5Ag=';
  const samples = [
    {page:2682, id:'f857f2ad-b6f9-4c13-ac10-252dd5282de5', slug:'lanternworks-sample-exploration'},
    {page:2684, id:'2ee6b4f8-de79-4359-b74e-432c81c9e356', slug:'lanternworks-sample-learning-story'},
  ];
  const host = document.getElementById('lanternworks-visitor-diagnostic');
  if (!host || location.origin !== site || location.pathname !== '/lanternworks-visitor-diagnostic/' ||
      !document.body.classList.contains('logged-in')) return;
  const report = {version:1, started:new Date().toISOString(), phase:'Observing ordinary child visits', frames:[], fetches:[], selectors:[], script:null, policy:[]};
  const status = document.createElement('p');
  status.setAttribute('role', 'status');
  const output = document.createElement('pre');
  output.id = 'lw-visitor-results';
  output.style.cssText = 'white-space:pre-wrap;overflow-wrap:anywhere;text-align:left';
  const previews = document.createElement('div');
  host.replaceChildren(status, output, previews);
  const update = () => { status.textContent = report.phase; output.textContent = JSON.stringify(report,null,2); };
  const sleep = ms => new Promise(resolve => setTimeout(resolve, ms));
  function failure(error) {
    const name = typeof error?.name === 'string' && /^[A-Za-z]{1,35}$/.test(error.name) ? error.name : 'Error';
    // Browser exceptions can include an entire URL. Report only known platform wording.
    const message = String(error?.message || '').toLowerCase();
    const reason = ['failed to fetch', 'failed to execute', 'networkerror', 'network error', 'timed out', 'aborted',
      'blocked a frame', 'cross-origin', 'unexpected token', 'not valid json', 'secure context', 'integrity']
      .find(s => message.includes(s));
    return reason ? name + ': ' + reason : name;
  }
  function guardedUrl(raw) {
    try {
      const u = new URL(raw);
      if (u.origin === 'https://cdn.nlightlabs.com' && u.pathname.startsWith('/hrv/hub-destinations/')) return u.origin+u.pathname;
      if (u.origin === site) return 'Edublogs';
    } catch (_) { /* Browser policy can report inline/eval without a URL. */ }
    return raw === 'inline' || raw === 'eval' ? raw : 'other origin';
  }
  document.addEventListener('securitypolicyviolation', event => {
    if (report.policy.length < 12) report.policy.push({directive:event.effectiveDirective, target:guardedUrl(event.blockedURI)});
    update();
  });
  function renderState(doc,id) {
    const mount = doc.getElementById('hrv-story-'+id);
    const article = mount?.querySelector('article[data-hrv-story]');
    return {
      mount:!!mount, unavailable:!!mount?.querySelector('.hrv-unavailable'),
      rendered:article?.getAttribute('data-hrv-story') === id,
      revision:article?.getAttribute('data-revision')?.match(/^\d{1,10}$/)?.[0] || null
    };
  }
  // Polling here observes DOM only. It never refreshes the frame, changes its content or reissues a request.
  async function observeRender(doc,id) {
    for (let i=0;i<40;i++) {
      const result=renderState(doc,id);
      if (result.rendered) return result;
      await sleep(200);
    }
    return renderState(doc,id);
  }
  async function frameProbe(sample) {
    const record={page:sample.page,url:site+'/hub/'+sample.slug+'/',event:'pending'};
    report.frames.push(record); update();
    const frame=document.createElement('iframe');
    frame.title='Unmodified visitor Page '+sample.page;
    frame.style.cssText='border:1px solid #ccc;display:block;width:100%;height:210px';
    const loaded=new Promise(resolve=>{
      let timer;
      const done=kind=>{clearTimeout(timer);resolve(kind);};
      frame.addEventListener('load',()=>done('load'),{once:true});
      frame.addEventListener('error',()=>done('error'),{once:true});
      timer=setTimeout(()=>done('timeout'),20000);
    });
    frame.src=record.url; previews.appendChild(frame);
    try {
      record.event=await loaded;
      if(record.event!=='load') return;
      const doc=frame.contentDocument;
      if(!doc || frame.contentWindow.location.origin!==site) {record.observation='no same-origin document';return;}
      record.nativePage=doc.body.classList.contains('page-id-'+sample.page);
      record.state=await observeRender(doc,sample.id);
      record.installers=Array.from(doc.querySelectorAll('script')).filter(s=>!s.src && s.textContent.includes(runtimeUrl) && s.textContent.includes(sample.id)).map(s=>({
        type:s.type || 'classic', nativeJsField:s.getAttribute('data-wp-block-html')==='js',
        integrityTextMatches:s.textContent.includes(runtimeSri), connected:s.isConnected
      }));
      record.scripts=Array.from(doc.querySelectorAll('script[data-story-id]')).filter(s=>s.dataset.storyId===sample.id).map(s=>({
        expectedUrl:s.src===runtimeUrl, expectedIntegrity:s.integrity===runtimeSri, crossOrigin:s.crossOrigin,
        type:s.type || 'classic', connected:s.isConnected
      }));
      record.resources=frame.contentWindow.performance.getEntriesByType('resource')
        .filter(t=>t.name===runtimeUrl || t.name.startsWith(cdn+sample.id+'/')).slice(0,12)
        .map(t=>({url:guardedUrl(t.name),initiator:t.initiatorType,status:t.responseStatus??null,transferBytes:t.transferSize,
          encodedBytes:t.encodedBodySize,decodedBytes:t.decodedBodySize}));
    } catch(error){record.error=failure(error);}
    finally {update();}
  }
  async function hash(bytes) {
    const digest=await crypto.subtle.digest('SHA-256',bytes);
    return Array.from(new Uint8Array(digest),v=>v.toString(16).padStart(2,'0')).join('');
  }
  async function bytesProbe(url,cache,expected) {
    const row={url,cache,expectedSha256:expected || null};
    report.fetches.push(row);update();
    try {
      const response=await fetch(url,{method:'GET',cache,credentials:'omit',mode:'cors',redirect:'error',signal:AbortSignal.timeout(12000)});
      row.status=response.status;row.corsType=response.type;row.contentType=response.headers.get('content-type');
      row.cacheControl=response.headers.get('cache-control');
      if (!response.ok) {await response.body?.cancel();return null;}
      const data=await response.arrayBuffer();
      row.bytes=data.byteLength;row.sha256=await hash(data);
      if(expected) row.hashMatches=row.sha256===expected;
      return data;
    } catch(error) {row.error=failure(error);return null;}
    finally {update();}
  }
  async function selectorProbe(sample) {
    const prefix=cdn+sample.id+'/', selector=prefix+'current.json';
    const info={page:sample.page,id:sample.id};report.selectors.push(info);
    const data=await bytesProbe(selector,'no-store',null);
    if(!data) return;
    try {
      const selected=JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(data));
      info.identityMatches=selected.storyId===sample.id;
      info.revision=Number.isSafeInteger(selected.revision)&&selected.revision>0?selected.revision:null;
      info.validHash=/^[a-f0-9]{64}$/.test(selected.sha256);
      info.publicationMatches=info.validHash && selected.publicationUrl===prefix+'releases/'+selected.sha256+'/story.html';
      if(!info.identityMatches || !info.revision || !info.publicationMatches) return;
      const body=await bytesProbe(selected.publicationUrl,'default',selected.sha256);
      if(body) {
        const fragment=new TextDecoder('utf-8',{fatal:true}).decode(body);
        info.withinRuntimeLimit=body.byteLength<=1024*1024;
        // A detached <template> is inert, including descendant image and script requests.
        const template=document.createElement('template');
        template.innerHTML=fragment;
        const article=template.content.querySelector('article[data-hrv-story]');
        info.fragmentIdentityMatches=article?.dataset.hrvStory===sample.id && article?.dataset.revision===String(info.revision);
      }
    } catch(error){info.error=failure(error);}
    finally {update();}
  }
  async function isolatedScript() {
    const sample=samples[0];
    const row={url:runtimeUrl,integrity:runtimeSri,crossOrigin:'anonymous',event:'pending'};
    report.script=row;update();
    const testRoot=document.createElement('div');
    testRoot.id='hrv-story-'+sample.id;
    const box=document.createElement('details');
    const label=document.createElement('summary');
    label.textContent='Isolated production script render on the diagnostic Page';
    box.append(label,testRoot);host.appendChild(box);
    const script=document.createElement('script');
    script.src=runtimeUrl;script.integrity=runtimeSri;script.crossOrigin='anonymous';script.dataset.storyId=sample.id;
    const stableError=event=>{if(event.filename===runtimeUrl) {row.runtimeError=failure(event.error);update();}};
    window.addEventListener('error',stableError);
    try {
      row.event=await new Promise(resolve=>{
        const timer=setTimeout(()=>resolve('timeout'),12000);
        script.addEventListener('load',()=>{clearTimeout(timer);resolve('load');},{once:true});
        script.addEventListener('error',()=>{clearTimeout(timer);resolve('error');},{once:true});
        document.head.appendChild(script);
      });
      row.state=await observeRender(document,sample.id);
    } finally {window.removeEventListener('error',stableError);update();}
  }
  update();
  try {
    await Promise.all(samples.map(frameProbe));
    report.phase='Checking the production script element on the diagnostic Page';update();
    await isolatedScript();
    report.phase='Reading the anonymous runtime and selected publications';update();
    for(const mode of ['default','no-store','reload']) await bytesProbe(runtimeUrl,mode,runtimeHash);
    for(const sample of samples) await selectorProbe(sample);
    report.phase='Diagnostic complete';
  } catch(error) {report.phase='Diagnostic stopped';report.error=failure(error);}
  report.finished=new Date().toISOString();update();
})();
