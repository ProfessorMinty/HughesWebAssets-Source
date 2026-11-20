import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { resolve, join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync, spawnSync } from 'node:child_process';

// This verifies renderer compatibility and immutable bytes. It does not research a
// topic, call a model, publish content, or establish browser/Edublogs acceptance.
const here=dirname(fileURLToPath(import.meta.url));
const repository=resolve(here,'../..');
const builder=join(here,'build/build.mjs');
const scratch=await mkdtemp(join(tmpdir(),'hrv-classroom-renderer-'));
const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const results=[];
const run=(source,revision,target,host)=>JSON.parse(execFileSync(process.execPath,
	[builder,source,String(revision),target,...(host ? [host] : [])],{encoding:'utf8'}));
try {
	const oldSource=join(here,'pages/73c66b8a-7c4f-4d31-971a-ab1e19a24965/revisions/2/source.json');
	const oldManifest=await readFile(join(repository,'releases/classroom-page/73c66b8a-7c4f-4d31-971a-ab1e19a24965/studio-r2/release.json'));
	const expected=JSON.parse(oldManifest);
	const legacy=join(scratch,'legacy');
	const legacyBuild=run(oldSource,2,legacy,expected.hostId);
	for (const file of expected.artifacts) {
		const bytes=await readFile(join(legacy,file.path));
		assert.equal(bytes.length,file.bytes);assert.equal(hash(bytes),file.sha256);
	}
	assert.deepEqual(await readFile(join(legacy,'release.json')),oldManifest);
	results.push({fixture:'existing-published-source-r2',exactLegacyBytes:true,...legacyBuild});
	for (const name of ['post-v2','museum-page-v3','museum-post-v3']) {
		const sourcePath=join(here,'fixtures',name+'.source.json');
		const source=JSON.parse(await readFile(sourcePath,'utf8'));
		const output=join(scratch,name);
		const result=run(sourcePath,1,output);
		assert.deepEqual(run(sourcePath,1,output),result);
		const manifest=JSON.parse(await readFile(join(output,'release.json'),'utf8'));
		for (const file of manifest.artifacts) {
			const bytes=await readFile(join(output,file.path));
			assert.equal(bytes.length,file.bytes);assert.equal(hash(bytes),file.sha256);
		}
		const fragment=await readFile(join(output,'story.html'),'utf8');
		if (source.page.nativeKind === 'post') {
			assert.equal(manifest.nativeKind,'post');assert.match(fragment,/data-native-kind="post"/);
			assert.doesNotMatch(fragment,/body\.page/);
		}
		if (source.data.experience) {
			assert.equal(manifest.schemaVersion,'3.0');assert.match(fragment,/data-experience="museum-v1"/);
			assert.match(fragment,/html\[data-hrv-effects="reduced"\]/);
			assert.doesNotMatch(fragment,/<script|prefers-reduced-motion/);
			assert.equal((fragment.match(/data-station-layout="/g)??[]).length,3);
		}
		const altered=join(scratch,name+'-altered.json');
		await writeFile(altered,JSON.stringify({...source,data:{...source.data,title:'Different immutable bytes'}}));
		const refused=spawnSync(process.execPath,[builder,altered,'1',output],{encoding:'utf8'});
		assert.notEqual(refused.status,0);
		assert.equal(hash(await readFile(join(output,'release.json'))),result.releaseSha256);
		results.push({fixture:name,synthetic:true,immutableRetryVerified:true,...result});
	}
	console.log(JSON.stringify({verified:true,networkRequests:0,publicationPerformed:false,results},null,2));
} finally {
	// Only this process's freshly allocated temporary directory is removed.
	await rm(scratch,{recursive:true,force:true});
}
