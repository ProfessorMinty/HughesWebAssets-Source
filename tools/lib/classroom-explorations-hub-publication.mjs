import {canonicalJson, sha256Text, projectHubRuntime, validateHubSemantics, validateAuthoringCompatibility, validateRouteRegistryCompatibility} from './classroom-explorations-hub-contract.mjs';
import {validateSchema} from './json-schema-lite.mjs';
import envelopeSchema from '../../schemas/hrv-page-envelope.schema.json' with {type:'json'};
import sourceSchema from '../../schemas/classroom-explorations-hub.source.schema.json' with {type:'json'};
import routeSchema from '../../schemas/hrv-route-registry.schema.json' with {type:'json'};
import manifestSchema from '../../schemas/classroom-explorations-hub.runtime.schema.json' with {type:'json'};
import runtimeProfile from '../../apps/classroom-explorations-hub/source/hub.runtime-profile.json' with {type:'json'};

export const HUB_PAGE_ID='hrv-page:classroom-explorations';
export const HUB_PUBLIC_BASE='https://cdn.nlightlabs.com/hrv/classroom-explorations-hub/';
export const HUB_OBJECT_PREFIX='hrv/classroom-explorations-hub/';
export const HUB_PUBLICATION_SCHEMA='hrv-hub-selection/1.0.0';
export const HUB_RUNTIME_PROFILE=Object.freeze(runtimeProfile);
export const HUB_RUNTIME_FINGERPRINT=sha256Text(canonicalJson(runtimeProfile));
export const hubJson=value=>JSON.stringify(value,null,2)+'\n';
const sha=/^[a-f0-9]{64}$/,commit=/^[a-f0-9]{40}$/,id=/^hub-[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/;
function requireValue(value,message){if(!value)throw new Error(message);}
export function validateHubDocuments(source,routes){
 validateAuthoringCompatibility(source);validateRouteRegistryCompatibility(routes);
 validateSchema(source,envelopeSchema);validateSchema(source.data,sourceSchema);validateSchema(routes,routeSchema);validateHubSemantics(source,routes);
 return {source,routes};
}
export function hubDocumentHash(documents){validateHubDocuments(documents.source,documents.routes);return sha256Text(canonicalJson(documents));}
export function hubChannelKey(channel){requireValue(['review','production'].includes(channel),'Unknown Hub publication channel');return HUB_OBJECT_PREFIX+'channels/'+channel+'.json';}
export function validateHubPublicationRef(ref){
 requireValue(ref&&id.test(ref.id)&&commit.test(ref.sourceCommit)&&sha.test(ref.sha256)&&sha.test(ref.documentsSha256)&&sha.test(ref.stateSha256)&&/^sha256:[a-f0-9]{64}$/.test(ref.snapshotId),'Invalid Hub publication identity');
 const base=HUB_PUBLIC_BASE+'publications/'+ref.id+'/';
 requireValue(ref.url===base+'publication.json'&&ref.documentsUrl===base+'documents.json','Hub publication reference escaped its fixed public path');
 return ref;
}
export function validateHubSelection(value,channel){
 hubChannelKey(channel);
 requireValue(value&&value.schemaVersion===HUB_PUBLICATION_SCHEMA&&value.pageId===HUB_PAGE_ID&&value.channel===channel&&Number.isSafeInteger(value.generation)&&value.generation>0,'Invalid Hub publication selection');
 validateHubPublicationRef(value.publication);if(value.previous!==null)validateHubPublicationRef(value.previous);
 requireValue(typeof value.activatedAt==='string'&&Number.isFinite(Date.parse(value.activatedAt)),'Invalid Hub activation time');
 requireValue(value.runtimeFingerprint===HUB_RUNTIME_FINGERPRINT,'Hub runtime changed without a reviewed loader update');
 return value;
}
export function createHubSelection({channel,publication,previous=null,generation,activatedAt}){
 return validateHubSelection({schemaVersion:HUB_PUBLICATION_SCHEMA,pageId:HUB_PAGE_ID,channel,generation,publication,previous,runtimeFingerprint:HUB_RUNTIME_FINGERPRINT,activatedAt},channel);
}
export function buildHubPublication({documents,sourceCommit,publicationId,previousPublicationId=null}){
 validateHubDocuments(documents.source,documents.routes);requireValue(commit.test(sourceCommit)&&id.test(publicationId),'Invalid immutable Hub release identity');
 const manifest=projectHubRuntime(documents.source,documents.routes);validateSchema(manifest,manifestSchema);
 const base=HUB_PUBLIC_BASE+'publications/'+publicationId+'/',prefix=HUB_OBJECT_PREFIX+'publications/'+publicationId+'/';
 const documentsText=hubJson(documents),manifestText=hubJson(manifest);
 const publication={schemaVersion:'1.0',publicationId,pageId:HUB_PAGE_ID,pageType:'classroom-explorations-hub',sourceRevision:sourceCommit,previousKnownGoodPublication:previousPublicationId,runtime:structuredClone(runtimeProfile),content:{snapshotId:manifest.snapshotId,runtimeSchemaVersion:'1.0',manifest:{path:base+'manifest.json',sha256:sha256Text(manifestText)}}};
 const publicationText=hubJson(publication);
 const reference=validateHubPublicationRef({id:publicationId,url:base+'publication.json',sha256:sha256Text(publicationText),snapshotId:manifest.snapshotId,sourceCommit,documentsUrl:base+'documents.json',documentsSha256:sha256Text(documentsText),stateSha256:hubDocumentHash(documents)});
 return {reference,manifest,publication,files:[{key:prefix+'documents.json',text:documentsText},{key:prefix+'manifest.json',text:manifestText},{key:prefix+'publication.json',text:publicationText}].map(f=>({...f,sha256:sha256Text(f.text)}))};
}

/** Complete isolated preview; the runtime remains owned and pinned by Source. */
export function hubPreviewHtml(documents, previewScript, previewScriptSha256) {
 validateHubDocuments(documents.source,documents.routes);
 requireValue(sha256Text(previewScript)===previewScriptSha256,'Preview script digest mismatch');
 const data=JSON.stringify({manifest:projectHubRuntime(documents.source,documents.routes),runtime:runtimeProfile}).replace(/</g,'\\u003c');
 return '<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>Hub change preview</title></head><body><div id="hrv-classroom-explorations-root">Loading Hub preview…</div><script id="hub-preview-data" type="application/json">'+data+'</script><script>'+previewScript+'</script></body></html>';
}
