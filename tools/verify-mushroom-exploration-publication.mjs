import {createHash} from 'node:crypto';
import {readFile,writeFile} from 'node:fs/promises';
import {resolve} from 'node:path';
import {fileURLToPath} from 'node:url';
import {validateMushroomSource} from '../apps/mushroom-exploration/src/contract.js';
import {MUSHROOM_JOURNAL_FEED,MUSHROOM_JOURNAL_REPOSITORY} from '../apps/mushroom-exploration/src/journal.js';
export const hash=bytes=>createHash('sha256').update(bytes).digest('hex');
const canonical='ProfessorMinty/HughesWebAssets-Source';
export function safeReleasePath(path){return typeof path==='string'&&/^[a-zA-Z0-9_./-]+$/.test(path)&&!path.startsWith('/')&&!path.split('/').some(p=>!p||p==='.'||p==='..');}
async function download(fetcher,url,bound){
 const response=await fetcher(url,{credentials:'omit',redirect:'error',signal:AbortSignal.timeout(20000),cache:'no-store'});
 if(response.status!==200||!response.body)throw new Error(`Publication file unavailable: ${url} (${response.status})`);
 const reader=response.body.getReader(),parts=[];let total=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;total+=value.length;if(total>bound){await reader.cancel();throw new Error('Publication response too large');}parts.push(value);}}finally{reader.releaseLock();}
 return {bytes:Buffer.concat(parts),mime:response.headers.get('content-type')||'',url,httpStatus:200};
}
export async function verifyClassroomJournal({fetcher=fetch,minimumDays=4,minimumPhotos=12,minimumVideos=3}={}){
 const indexResponse=await download(fetcher,MUSHROOM_JOURNAL_FEED,1000000),index=JSON.parse(indexResponse.bytes);
 if(index.schemaVersion!=='1.0.0'||!Array.isArray(index.entries)||index.entries.length<minimumDays)throw new Error(`Published classroom journal is incomplete: ${index.entries?.length||0} days; need ${minimumDays}.`);
 const ids=new Set(),mediaURLs=new Map(),records=[];let photos=0,videos=0;
 for(const entry of index.entries){
  if(typeof entry.id!=='string'||!/^[a-f0-9-]{36}$/.test(entry.id)||ids.has(entry.id)||!Number.isInteger(entry.revision)||entry.revision<1||!/^apps\/mushroom-exploration\/source\/journal\/days\/[a-f0-9-]+-\d+-[a-f0-9]{12}\.json$/.test(entry.recordPath))throw new Error('Published journal index identity mismatch');
  ids.add(entry.id);
  const response=await download(fetcher,MUSHROOM_JOURNAL_REPOSITORY+entry.recordPath,1000000),record=JSON.parse(response.bytes);
  if(record.schemaVersion!=='1.0.0'||record.id!==entry.id||record.date!==entry.date||record.revision!==entry.revision||!Array.isArray(record.media)||!record.media.length||!Array.isArray(record.cards))throw new Error('Published journal day mismatch');
  for(const media of record.media){
   if(!['image','video'].includes(media.kind))throw new Error('Unknown published media kind');
   if(media.kind==='image')photos++;else videos++;
   for(const [field,kind] of [['url',media.kind],['thumbnailUrl','image']]){
    const url=new URL(media[field]);if(url.origin!=='https://cdn.nlightlabs.com'||!url.pathname.startsWith(`/hrv/mushrooms/${entry.id}/`)||url.username||url.password||url.search||url.hash)throw new Error('Published media escapes the approved classroom destination');
    mediaURLs.set(url.href,kind);
   }
  }
  if(!entry.cover||!record.media.some(m=>[m.url,m.thumbnailUrl].includes(entry.cover.url)))throw new Error('Day cover is not one of its published media files');
  records.push({id:entry.id,date:entry.date,revision:entry.revision,path:entry.recordPath,sha256:hash(response.bytes)});
 }
 if(photos<minimumPhotos||videos<minimumVideos)throw new Error(`Published classroom media is incomplete: ${photos} photos and ${videos} videos.`);
 const media=[];
 for(const [url,kind]of mediaURLs){
  const result=await download(fetcher,url,32000000),header=result.bytes.subarray(0,12);
  if(kind==='video'&&(!result.mime.startsWith('video/mp4')||header.subarray(4,8).toString()!=='ftyp'))throw new Error('Published classroom video is not a readable MP4 container');
  const image=(header[0]===0xff&&header[1]===0xd8)||(header.subarray(0,8).equals(Buffer.from([137,80,78,71,13,10,26,10])))||(header.subarray(0,4).toString()==='RIFF'&&header.subarray(8,12).toString()==='WEBP');
  if(kind==='image'&&(!result.mime.startsWith('image/')||!image))throw new Error('Published classroom image has no supported image signature');
  media.push({url,bytes:result.bytes.length,mime:result.mime,sha256:hash(result.bytes),httpStatus:200});
 }
 return {indexURL:MUSHROOM_JOURNAL_FEED,indexSha256:hash(indexResponse.bytes),days:records.length,photos,videos,records,media};
}
export async function verifyRelease({directory,commit,version,fetcher=fetch,requireClassroom=true}){
 if(!/^[a-f0-9]{40}$/.test(commit||'')||!/^\d{4}\.\d{2}\.\d{2}\.\d+$/.test(version||''))throw new Error('An exact commit and release version are required');
 const manifestBytes=await readFile(resolve(directory,'release.json')),manifest=JSON.parse(manifestBytes);
 if(manifest.schemaVersion!=='1.0.0'||manifest.application!=='hrv-page:mushrooms-2026-2027'||manifest.version!==version||!Array.isArray(manifest.files)||manifest.files.length>80)throw new Error('Release manifest mismatch');
 const base=`https://raw.githubusercontent.com/${canonical}/${commit}/releases/mushroom-exploration/${version}/`,files=[];
 const expected=[{path:'release.json',bytes:manifestBytes.length,sha256:hash(manifestBytes)},...manifest.files];
 const bootstrap=await readFile(resolve(directory,'src/bootstrap.js'));expected.push({path:'src/bootstrap.js',bytes:bootstrap.length,sha256:hash(bootstrap)});
 const seen=new Set();
 for(const entry of expected){
  if(!safeReleasePath(entry.path)||seen.has(entry.path)||!Number.isSafeInteger(entry.bytes)||entry.bytes<1||entry.bytes>20000000||!/^[a-f0-9]{64}$/.test(entry.sha256))throw new Error('Invalid release asset');seen.add(entry.path);
  const local=await readFile(resolve(directory,entry.path));if(local.length!==entry.bytes||hash(local)!==entry.sha256)throw new Error('Staged release integrity mismatch');
  const remote=await download(fetcher,new URL(entry.path,base).href,entry.bytes);
  if(remote.bytes.length!==entry.bytes||hash(remote.bytes)!==entry.sha256)throw new Error('CDN bytes differ from the staged immutable release');
  files.push({...entry,url:remote.url,httpStatus:200});
 }
 validateMushroomSource(JSON.parse(await readFile(resolve(directory,'src/mushrooms.source.json'),'utf8')));
 const journal=requireClassroom?await verifyClassroomJournal({fetcher}):null;
 return {verifier:'mushroom-exploration-publication',schemaVersion:'1.0.0',repository:canonical,releaseCommit:commit,version,releaseSha256:hash(manifestBytes),bootstrapSri:'sha256-'+createHash('sha256').update(bootstrap).digest('base64'),files,journal,cdnVerified:true,classroomVerified:Boolean(journal),checkedAt:new Date().toISOString()};
}
if(process.argv[1]&&resolve(process.argv[1])===fileURLToPath(import.meta.url)){
 const [directory,commit,version,output,...extra]=process.argv.slice(2);
 if(!directory||!output||extra.length)throw new Error('Usage: CANDIDATE_DIRECTORY EXACT_COMMIT VERSION EVIDENCE_OUTPUT');
 try{const evidence=await verifyRelease({directory:resolve(directory),commit,version});await writeFile(resolve(output),JSON.stringify(evidence,null,2)+'\n');console.log(JSON.stringify({cdnVerified:true,classroomVerified:true,days:evidence.journal.days,photos:evidence.journal.photos,videos:evidence.journal.videos,output:resolve(output)}));}
 catch(error){console.error('NOT READY FOR INJECTION: '+error.message);process.exitCode=1;}
}
