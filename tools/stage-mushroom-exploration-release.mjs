import {createHash} from 'node:crypto';
import {readFile,writeFile,mkdir,readdir,copyFile} from 'node:fs/promises';
import {resolve,relative} from 'node:path';
import {fileURLToPath} from 'node:url';
import {execFileSync} from 'node:child_process';
import {validateMushroomSource} from '../apps/mushroom-exploration/src/contract.js';
import {MUSHROOM_PHOTOS} from '../apps/mushroom-exploration/src/photo-catalog.js';
import {MUSHROOM_VIDEOS} from '../apps/mushroom-exploration/src/video-assets.js';
const root=fileURLToPath(new URL('..',import.meta.url));
const [version,...flags]=process.argv.slice(2);
if(!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(version||'')||flags.length!==1||flags[0]!=='--reviewed-source')throw new Error('Supply a release version and explicitly reviewed source: VERSION --reviewed-source');
const app=resolve(root,'apps/mushroom-exploration'),out=resolve(root,'dist/mushroom-exploration-release',version);
const source=JSON.parse(await readFile(resolve(app,'source/mushrooms.source.json'),'utf8'));
source.data.meta.state='review-ready';source.data.meta.researchStatus='reviewed';validateMushroomSource(source);
const names=['photo-catalog.js','photos.js','video-assets.js','contract.js','art.js','process.js','sound.js','narration.js','demo.js','labs.js','journal.js','runtime.js'];
const parts=await Promise.all(names.map(name=>readFile(resolve(app,'src',name),'utf8')));
const configure=`let mushroomReleaseAssetBase=import.meta.url;\nexport function configureMushroomReleaseAssetBase(url){const parsed=new URL(url);if(parsed.protocol!=='https:'||parsed.username||parsed.password)throw new Error('Invalid release asset base');mushroomReleaseAssetBase=parsed.href;}\n`;
const runtime=configure+parts.map(code=>code.replace(/^import .+;$/gm,'').replaceAll('import.meta.url','mushroomReleaseAssetBase')).join('\n');
await mkdir(resolve(out,'src/assets'),{recursive:true});
await writeFile(resolve(out,'src/runtime.js'),runtime);
await writeFile(resolve(out,'src/mushrooms.source.json'),JSON.stringify(source,null,2)+'\n');
for(const name of ['exhibit.css','host-compat.css'])await copyFile(resolve(app,'src',name),resolve(out,'src',name));
await copyFile(resolve(app,'release-bootstrap.template.js'),resolve(out,'src/bootstrap.js'));
for(const item of await readdir(resolve(app,'src/assets'),{withFileTypes:true})){
 if(!item.isFile())throw new Error('Unexpected nested source asset');
 await copyFile(resolve(app,'src/assets',item.name),resolve(out,'src/assets',item.name));
}
const hash=data=>createHash('sha256').update(data).digest('hex');
for(const photo of MUSHROOM_PHOTOS){const bytes=await readFile(resolve(app,'src',photo.file));if(hash(bytes)!==photo.sha256||bytes.length!==photo.bytes)throw new Error('Photograph provenance mismatch');}
for(const video of MUSHROOM_VIDEOS)for(const item of video.files){const bytes=await readFile(resolve(app,'src',item.path));if(hash(bytes)!==item.sha256||bytes.length!==item.bytes)throw new Error('Research footage provenance mismatch');}
async function filesAt(directory){const paths=[];for(const item of await readdir(directory,{withFileTypes:true})){const p=resolve(directory,item.name);if(item.isDirectory())paths.push(...await filesAt(p));else paths.push(p);}return paths;}
const files=[];
for(const p of (await filesAt(resolve(out,'src'))).sort()){
 const path=relative(out,p).replaceAll('\\','/');if(path==='src/bootstrap.js')continue;
 const bytes=await readFile(p);files.push({path,bytes:bytes.length,sha256:hash(bytes)});
}
const sourceCommit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8'}).trim();
const manifest={schemaVersion:'1.0.0',application:source.page.id,version,sourceCommit,contentReview:'Existing sourced science and classroom-first copy reviewed; teacher/projector and optional native-speech acceptance remain post-install checks.',journal:{repository:'ProfessorMinty/HughesWebAssets-Source',branch:'feature/mushroom-exhibit-scaffold',indexPath:'apps/mushroom-exploration/source/journal/index.json',schemaVersion:'1.0.0'},files};
await writeFile(resolve(out,'release.json'),JSON.stringify(manifest,null,2)+'\n');
execFileSync(process.execPath,['--check',resolve(out,'src/runtime.js')]);execFileSync(process.execPath,['--check',resolve(out,'src/bootstrap.js')]);
console.log(JSON.stringify({version,directory:out,files:files.length+2,sourceSha256:hash(await readFile(resolve(out,'src/mushrooms.source.json'))),candidateOnly:true,readyToPaste:false,remaining:'Published classroom media, live publisher connection, immutable CDN verification and generated doorway preflight'}));
