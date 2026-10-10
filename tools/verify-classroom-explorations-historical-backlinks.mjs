import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { readFile, writeFile } from 'node:fs/promises';
import { JSDOM } from 'jsdom';

const evidence = 'evidence/classroom-explorations-hub/page17-migration-2026-10-10/backlinks';
const retired = 'https://rmhughes.edublogs.org/classroom-explorations/';
const canonical = 'https://rmhughes.edublogs.org/hub/';
const hash = bytes => createHash('sha256').update(bytes).digest('hex');
const routes = JSON.parse(await readFile('registry/hrv-routes.source.json','utf8'));
const repaired = new Set([886,674,413,1043]);
const reports = [];
for (const route of routes.routes.filter(r=>r.wordpressParentPageId===17 && ['exploration','twwl'].includes(r.kind))) {
  const id = route.wordpressPageId;
  const url = `https://rmhughes.edublogs.org${route.path}`;
  const response = await fetch(url,{redirect:'error',headers:{'Cache-Control':'no-cache'}});
  assert.equal(response.status,200);
  const bytes = Buffer.from(await response.arrayBuffer());
  const document = new JSDOM(bytes.toString('utf8')).window.document;
  assert.ok(document.body.classList.contains(`page-id-${id}`));
  const links = [...document.querySelectorAll('a[href]')];
  const returns = links.filter(a=>/Back to Exploration Hub/i.test(a.textContent));
  const menu = links.filter(a=>a.textContent.trim()==='Classroom Explorations');
  assert.ok(menu.some(a=>a.href===canonical),`Page ${id} canonical global menu missing`);
  assert.ok(!links.some(a=>a.href===retired),`Page ${id} stale Hub destination remains`);
  assert.ok(returns.every(a=>a.href===canonical));
  const fields = [];
  if (repaired.has(id)) {
    assert.equal(returns.length,1);
    for (const field of ['HTML','CSS','JavaScript']) {
      const before = await readFile(`${evidence}/page${id}-before-${field}.txt`,'utf8');
      const expected = field==='HTML' ? before.replace(retired,canonical) : before;
      if (field==='HTML') assert.equal(before.split(retired).length,2);
      const saved = await readFile(`${evidence}/page${id}-saved-${field}.txt`,'utf8');
      assert.equal(saved,expected,`Page ${id}: unexpected ${field} change`);
      fields.push({field,beforeBytes:Buffer.byteLength(before),beforeSha256:hash(before),savedBytes:Buffer.byteLength(saved),savedSha256:hash(saved),change:field==='HTML'?'one exact href substitution':'none'});
    }
    await writeFile(`${evidence}/page${id}-public.html`,bytes);
  }
  reports.push({pageId:id,url,status:response.status,publicSha256:hash(bytes),repaired:repaired.has(id),explicitReturns:returns.map(a=>({label:a.textContent.trim(),href:a.href})),canonicalGlobalMenu:true,fields});
}
for (const field of ['HTML','CSS','JavaScript']) {
  const before = await readFile(`${evidence}/page413-unmodified-block2-before-${field}.txt`);
  const saved = await readFile(`${evidence}/page413-unmodified-block2-saved-${field}.txt`);
  assert.deepEqual(saved,before,'Mushrooms main content block must be untouched');
}
await writeFile(`${evidence}/verification.json`,JSON.stringify({generatedAt:new Date().toISOString(),method:'Unauthenticated public GET plus authenticated-editor readback captures',repairedPageCount:4,checkedManagedChildCount:reports.length,mushroomsMainBlockByteExact:true,pages:reports},null,2)+'\n');
console.log(`Verified ${reports.length} managed children; four exact one-URL repairs and untouched Mushrooms content block.`);
