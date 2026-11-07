import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import vm from 'node:vm';
import {hash} from './verify-mushroom-exploration-publication.mjs';
const root=fileURLToPath(new URL('..',import.meta.url));
const [commit,version,evidencePath,publisherPath,...extra]=process.argv.slice(2);
if(!/^[a-f0-9]{40}$/.test(commit||'')||!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(version||'')||!evidencePath||!publisherPath||extra.length)throw new Error('Supply EXACT_COMMIT VERSION CDN_AND_JOURNAL_EVIDENCE LIVE_PUBLISHER_EVIDENCE');
const evidence=JSON.parse(await readFile(resolve(root,evidencePath),'utf8'));
const publisher=JSON.parse(await readFile(resolve(root,publisherPath),'utf8'));
if(evidence.verifier!=='mushroom-exploration-publication'||evidence.releaseCommit!==commit||evidence.version!==version||evidence.cdnVerified!==true||evidence.classroomVerified!==true||evidence.journal?.days<4||evidence.journal?.photos<12||evidence.journal?.videos<3)throw new Error('Production CDN and classroom checks must pass before generating injection code');
if(publisher.application!=='Lanternworks-Mushinator'||publisher.url!=='https://lanternworks.nlightlabs.com/mushrooms'||publisher.publisherReady!==true||!Array.isArray(publisher.publishedDays)||publisher.publishedDays.length<4||!publisher.publishedDays.every(day=>evidence.journal.records.some(record=>record.id===day.id&&record.revision===day.revision)&&/^[a-f0-9]{40}$/.test(day.commitSha)))throw new Error('The live editor must publish all four classroom days before generating injection code');
const prefix=`releases/mushroom-exploration/${version}/`,base=`https://raw.githubusercontent.com/ProfessorMinty/HughesWebAssets-Source/${commit}/${prefix}`;
const git=path=>execFileSync('git',['show',`${commit}:${prefix}${path}`],{cwd:root,maxBuffer:32*1024*1024});
for(const file of evidence.files){const bytes=git(file.path);if(file.url!==new URL(file.path,base).href||file.httpStatus!==200||bytes.length!==file.bytes||hash(bytes)!==file.sha256)throw new Error('CDN evidence no longer matches the exact committed release');}
if(hash(git('release.json'))!==evidence.releaseSha256)throw new Error('Release pin mismatch');
if(evidence.bootstrapSri!=='sha256-'+Buffer.from(hash(git('src/bootstrap.js')),'hex').toString('base64'))throw new Error('Bootstrap SRI mismatch');
let code=await readFile(resolve(root,'apps/mushroom-exploration/doorway.template.js'),'utf8');
for(const [token,value]of Object.entries({__BOOTSTRAP_URL__:base+'src/bootstrap.js',__BOOTSTRAP_SHA256__:hash(git('src/bootstrap.js')),__RELEASE_ROOT__:base,__RELEASE_SHA256__:evidence.releaseSha256,__RELEASE_VERSION__:version})){
 if(code.split(token).length!==2)throw new Error('Missing or repeated injection template token');code=code.replace(token,value);
}
new vm.Script(code);
const out=resolve(root,'docs/edublogs-integration/mushrooms-2026-2027');await mkdir(out,{recursive:true});
await writeFile(resolve(out,'JAVASCRIPT-BOX.js'),code);
await writeFile(resolve(out,'RELEASE-PIN.json'),JSON.stringify({pageId:'hrv-page:mushrooms-2026-2027',routeRef:'hrv-route:mushrooms-2026-2027',releaseCommit:commit,version,bootstrapUrl:base+'src/bootstrap.js',bootstrapSri:evidence.bootstrapSri,releaseSha256:evidence.releaseSha256,journal:evidence.journal.indexURL,injectionSha256:hash(Buffer.from(code)),readyForNewPageJavaScriptWindow:true,edublogsModified:false,wordpressPageId:null,wordpressPath:null},null,2)+'\n');
console.log(JSON.stringify({readyForNewPageJavaScriptWindow:true,file:resolve(out,'JAVASCRIPT-BOX.js'),edublogsModified:false}));
