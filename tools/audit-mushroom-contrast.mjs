import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
export function colorRGBA(value){const n=value.match(/[\d.]+/g)?.map(Number);if(!n||n.length<3)throw new Error('Expected computed rgb/rgba color');return [...n.slice(0,3),n[3]??1];}
export function composite(front,back){return [0,1,2].map(i=>front[i]*front[3]+back[i]*(1-front[3])).concat(1);}
export function contrastRatio(a,b){const l=c=>{const linear=c.slice(0,3).map(v=>{const s=v/255;return s<=.04045?s/12.92:((s+.055)/1.055)**2.4;});return linear[0]*.2126+linear[1]*.7152+linear[2]*.0722;};const [lo,hi]=[l(a),l(b)].sort((x,y)=>x-y);return(hi+.05)/(lo+.05);}
export function auditComputedText(rows){return rows.filter(row=>!row.hero&&!row.overlay).map(row=>{let backgrounds=[[255,255,255,1]];for(const layer of row.layers.slice().reverse()){backgrounds=backgrounds.map(bg=>composite(colorRGBA(layer.color),bg));const stops=layer.gradient.match(/rgba?\([^)]*\)/g)||[];if(stops.length)backgrounds=stops.flatMap(color=>backgrounds.map(bg=>composite(colorRGBA(color),bg))).slice(0,128);}const minimumContrast=Math.min(...backgrounds.map(bg=>contrastRatio(composite(colorRGBA(row.foreground),bg),bg)));return{...row,minimumContrast:Number(minimumContrast.toFixed(3)),passes:minimumContrast>=row.threshold};});}
export function auditImageBounds(capture){
 const clamp=n=>Math.max(0,Math.min(1,n)),backdrops=[[0,0,0,1],[255,255,255,1]],results=[];
 for(const layout of capture.imageBacked)for(const item of layout.items){
   let alpha,mask;if(layout.width>700){const stop=layout.width>=1280?.54:.65,end=layout.width>=1280?.88:1,x=item.right;alpha=x<=stop?237/255+(219-237)/255*x/stop:219/255*(end-x)/(end-stop);mask=[4,41,37,clamp(alpha)];}
   else{const y=item.top;alpha=y<.24?119/255*y/.24:y<.35?119/255+(239-119)/255*(y-.24)/.11:y<.58?239/255+(255-239)/255*(y-.35)/.23:1;mask=[6,45,42,clamp(alpha)];}
   const minimumContrast=Math.min(...backdrops.map(bg=>contrastRatio(colorRGBA(item.foreground),composite(colorRGBA(item.background),composite(mask,bg))))),threshold=Number(item.font.replace('px',''))>=24?3:4.5;
   results.push({scope:'hero over arbitrary black/white image bounds',viewport:layout.width,text:item.text,minimumContrast:Number(minimumContrast.toFixed(3)),threshold,passes:minimumContrast>=threshold});
 }
 for(const item of capture.text.filter(row=>row.overlay&&!row.hero)){const bg=colorRGBA(item.layers[0].color),minimumContrast=Math.min(...backdrops.map(image=>contrastRatio(colorRGBA(item.foreground),composite(bg,image))));results.push({scope:'photograph label over arbitrary black/white image bounds',text:item.text,minimumContrast:Number(minimumContrast.toFixed(3)),threshold:item.threshold,passes:minimumContrast>=item.threshold});}
 return results;
}
export function evidenceJSON(value){return '{\n'+Object.entries(value).map(([key,item])=>'  '+JSON.stringify(key)+': '+(Array.isArray(item)?'[\n'+item.map(row=>'    '+JSON.stringify(row)).join(',\n')+'\n  ]':JSON.stringify(item))).join(',\n')+'\n}\n';}
if(process.argv[1]===fileURLToPath(import.meta.url)){
 const [input,output]=process.argv.slice(2);if(!input||!output)throw new Error('Provide captured DOM sample JSON and report path');
 const capture=JSON.parse(await readFile(input,'utf8')),records=auditComputedText(capture.text),css=await readFile(new URL('../apps/mushroom-exploration/src/exhibit.css',import.meta.url));
 const imageBounds=auditImageBounds(capture),report={date:capture.date,scope:'Observed DOM styles with conservative gradient-stop bounds and image-mask bounds at five viewports. UI cues recorded separately. Not a WCAG certification.',cssSha256:createHash('sha256').update(css).digest('hex'),tested:records.length,failed:records.filter(row=>!row.passes),records,imageBounds,imageBacked:capture.imageBacked,uiCues:capture.uiCues,layouts:capture.layouts,jobs:capture.jobs};await writeFile(output,evidenceJSON(report));console.log(JSON.stringify({tested:report.tested,imageCases:imageBounds.length,failed:report.failed.length,imageFailures:imageBounds.filter(row=>!row.passes)}));if(report.failed.length||imageBounds.some(row=>!row.passes))process.exitCode=1;
}
