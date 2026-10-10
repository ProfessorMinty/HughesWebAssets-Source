import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// Read-only service verification of the new cutover, separate from publication
// 002's historical installation evidence. Never submits editor fields.
const evidence = 'evidence/classroom-explorations-hub/page17-migration-2026-10-10';
const sha256 = value => createHash('sha256').update(value).digest('hex');
const tree = node => {
  if (node.nodeType === 3) return node.textContent.replace(/\s+/gu, ' ').trim() || null;
  if (node.nodeType !== 1) return null;
  return {tag:node.localName, attributes:[...node.attributes].map(a=>[a.name,a.value]).sort((a,b)=>a[0].localeCompare(b[0])), children:[...node.childNodes].map(tree).filter(Boolean)};
};
const normalizedHtml = text => [...new JSDOM(text).window.document.body.childNodes].map(tree).filter(Boolean);
const reports = [];
for (const [id, packageName] of [[2589,'classroom-explorations-hub-test'], [17,'classroom-explorations-hub']]) {
  const directory = `docs/edublogs-integration/${packageName}`;
  const pin = JSON.parse(await readFile(`${directory}/RELEASE-PIN.json`, 'utf8'));
  assert.equal(pin.wordpressPageId, id);
  assert.equal(pin.publicationId, 'pub-2026-10-10-003');
  const fields = [];
  for (const [field, extension, savedName] of [['HTML','html','HTML'],['CSS','css','CSS'],['JAVASCRIPT','js','JavaScript']]) {
    const expected = await readFile(`${directory}/${field}-BOX.${extension}`, 'utf8');
    const saved = await readFile(`${evidence}/page${id}-saved-${savedName}-BOX.${extension}`, 'utf8');
    assert.equal(sha256(expected), pin.fields[`${field}-BOX.${extension}`].sha256);
    if (field === 'HTML') assert.deepEqual(normalizedHtml(saved), normalizedHtml(expected));
    else assert.equal(saved.replace(/(?:\r?\n)+$/u,''), expected.replace(/(?:\r?\n)+$/u,''));
    fields.push({field, expectedSha256:sha256(expected), savedSha256:sha256(saved), passed:true});
  }
  const response = await fetch(pin.targetUrl, {redirect:'error', headers:{'Cache-Control':'no-cache'}});
  assert.equal(response.status, 200);
  const publicHtml = Buffer.from(await response.arrayBuffer());
  const dom = new JSDOM(publicHtml.toString('utf8'));
  assert.ok(dom.window.document.body.classList.contains(`page-id-${id}`));
  for (const value of [pin.assetCommit, pin.publicationId, pin.bootstrapSri]) assert.ok(publicHtml.includes(value));
  assert.equal(dom.window.document.querySelectorAll('#hrv-classroom-explorations-root').length, 1);
  await writeFile(`${evidence}/page${id}-public.html`, publicHtml);
  const report = {generatedAt:new Date().toISOString(), pageId:id, url:pin.targetUrl, fields, publicHttp:{authenticated:false,status:response.status,bytes:publicHtml.length,sha256:sha256(publicHtml),assetCommit:pin.assetCommit,publicationId:pin.publicationId,bootstrapSri:pin.bootstrapSri}, limitation:'Unauthenticated HTTP is not signed-out browser rendering; live browser acceptance is recorded separately.'};
  reports.push(report);
  console.log(`Page ${id}: reloaded fields and public immutable pin verified.`);
}
await writeFile(`${evidence}/installed-doorway-verification.json`, JSON.stringify(reports,null,2)+'\n');
