import { readFile, writeFile } from 'node:fs/promises';
import { createHash } from 'node:crypto';
import assert from 'node:assert/strict';
import { JSDOM } from 'jsdom';

// Read-only service verification. Captured editor fields are never submitted here.
const sha256 = value => createHash('sha256').update(value).digest('hex');
const tree = node => {
  if (node.nodeType === 3) return node.textContent.replace(/\s+/gu, ' ').trim() || null;
  if (node.nodeType !== 1) return null;
  return { tag: node.localName, attributes: [...node.attributes].map(a => [a.name, a.value]).sort((a,b) => a[0].localeCompare(b[0])), children: [...node.childNodes].map(tree).filter(Boolean) };
};
const normalizedHtml = text => [...new JSDOM(text).window.document.body.childNodes].map(tree).filter(Boolean);
const trimFinalNewline = text => text.replace(/(?:\r?\n)+$/u, '');
const targets = [
  { id:2589, route:'hub-test/', app:'hub', package:'classroom-explorations-hub-test', commit:'f2381f5b9e284e87e17c3b45b25f381a55663c1c', publication:'pub-2026-10-10-002' },
  { id:2627, route:'hub/archive-2025-2026/', app:'archive', package:'classroom-explorations-archive/2025-2026', commit:'9deaf1723109c5259b5813d271a23d336d68559d', publication:'pub-2026-09-12-001' }
];
for (const target of targets) {
  const evidence = `evidence/classroom-explorations-${target.app}/release-2026-10-10`;
  const fields = [];
  for (const [field,extension,savedName] of [['HTML','html','HTML'],['CSS','css','CSS'],['JAVASCRIPT','js','JavaScript']]) {
    const expected = await readFile(`docs/edublogs-integration/${target.package}/${field}-BOX.${extension}`, 'utf8');
    const saved = await readFile(`${evidence}/page${target.id}-saved-${savedName}-BOX.${extension}`, 'utf8');
    if (field === 'HTML') assert.deepEqual(normalizedHtml(saved), normalizedHtml(expected), `Page ${target.id} HTML differs semantically`);
    else assert.equal(trimFinalNewline(saved), trimFinalNewline(expected), `Page ${target.id} ${field} differs`);
    fields.push({ field, expectedSha256:sha256(expected), savedSha256:sha256(saved), normalization:field==='HTML'?'DOM attributes and whitespace-only formatting':'trailing field newline only', passed:true });
  }
  const url = `https://rmhughes.edublogs.org/${target.route}`;
  const response = await fetch(url, {redirect:'error',headers:{'Cache-Control':'no-cache'}});
  assert.equal(response.status,200);
  const publicHtml = Buffer.from(await response.arrayBuffer());
  const html = publicHtml.toString('utf8');
  assert.ok(html.includes(target.commit), `Page ${target.id} public pin missing`);
  assert.ok(html.includes(target.publication), `Page ${target.id} public publication missing`);
  const expectedJs = await readFile(`docs/edublogs-integration/${target.package}/JAVASCRIPT-BOX.js`,'utf8');
  const sri = expectedJs.match(/sha256-[A-Za-z0-9+/]+=*/u)?.[0];
  assert.ok(sri && html.includes(sri), `Page ${target.id} public SRI missing`);
  await writeFile(`${evidence}/page${target.id}-public.html`,publicHtml);
  const report = { generatedAt:new Date().toISOString(), pageId:target.id, url, fields, publicHttp:{authenticated:false,status:response.status,byteLength:publicHtml.length,sha256:sha256(publicHtml),assetCommit:target.commit,publication:target.publication,bootstrapSri:sri,pinPresent:true,publicationPresent:true,sriPresent:true}, limitation:'Unauthenticated HTTP readback is not a signed-out browser rendering or playback test.' };
  await writeFile(`${evidence}/installed-doorway-verification.json`,JSON.stringify(report,null,2)+'\n');
  console.log(`Page ${target.id}: editor semantics, CSS/JS, public HTTP pin and SRI verified.`);
}
