// Qualitative scientific teaching illustrations. Critical labels are rendered in HTML.
const capOutline='M156 268C178 220 196 169 265 119C322 78 361 61 417 63C490 45 564 91 615 132C661 169 693 219 705 270C651 266 611 250 547 246C458 238 361 242 288 254C239 261 195 259 156 268Z';
function decimal(n){return n.toFixed(2);}
function random(n){const value=Math.sin(n*127.1+31.7)*43758.5453;return value-Math.floor(value);}
const stemBase={x:438,y:463};
function stemBaseAt(x=0,y=0,scale=1){return {x:x+stemBase.x*scale,y:y+stemBase.y*scale};}
export function hyphalNetwork(x,y,width,height,seed=3,anchors=[{x:x+width*.5,y}]){
  // A multi-source growth tree, seeded at the actual attachment points, plus cross-links.
  const nodes=anchors.map((point,index)=>({id:index,x:point.x,y:point.y,depth:0,parent:null,origin:index}));
  const origins=nodes.length;
  for(let i=0;i<180;i++)nodes.push({id:nodes.length,x:x+(0.025+random(i*3+seed)*.95)*width,y:y+(0.035+random(i*11+seed+23)*.93)*height,depth:Infinity,parent:null,origin:null});
  const grown=new Set(anchors.map((_,index)=>index));
  // Give every stem its own first strand before the regions compete for nearby points.
  // Merely putting anchors in the grown set can otherwise leave one stem isolated.
  for(let index=0;index<origins;index++){
    const base=nodes[index];
    const first=nodes.filter(n=>!grown.has(n.id)).sort((a,b)=>Math.hypot(a.x-base.x,a.y-base.y)-Math.hypot(b.x-base.x,b.y-base.y))[0];
    first.parent=base.id;first.depth=1;first.origin=index;grown.add(first.id);
  }
  while(grown.size<nodes.length){
    let best=null,bestDistance=Infinity;
    for(const id of grown)for(const candidate of nodes){
      if(grown.has(candidate.id))continue;
      const distance=Math.hypot(nodes[id].x-candidate.x,nodes[id].y-candidate.y);
      if(distance<bestDistance){bestDistance=distance;best=[id,candidate.id];}
    }
    const [from,to]=best;nodes[to].parent=from;nodes[to].depth=nodes[from].depth+1;nodes[to].origin=nodes[from].origin;grown.add(to);
  }
  const maxDepth=Math.max(...nodes.map(n=>n.depth)),duration=Math.min(190,3500/(maxDepth+1)),step=duration+12,paths=[];
  const dependencies=points=>points.filter(n=>n.parent!==null).map(n=>'branch-'+n.id);
  function edge(a,b,id,depth,parents,thin=false){
    const dx=b.x-a.x,dy=b.y-a.y,length=Math.hypot(dx,dy)||1;
    const prior=a.parent===null?a:nodes[a.parent],px=a.x-prior.x,py=a.y-prior.y,priorLength=Math.hypot(px,py)||length;
    // Blend the incoming and outgoing direction to keep growing strands gently curved.
    let tx=dx/length*.7+(a.parent===null?dx/length:px/priorLength)*.3,ty=dy/length*.7+(a.parent===null?dy/length:py/priorLength)*.3;
    const tangent=Math.hypot(tx,ty)||1;tx/=tangent;ty/=tangent;
    const bend=(random(a.id+b.id+seed)-.5)*Math.min(12,length*.32);
    paths.push({id,parents,start:depth*step,duration,thin,anchor:a.parent===null&&depth===0?a.origin:null,from:{x:a.x,y:a.y},to:{x:b.x,y:b.y},d:`M${decimal(a.x)} ${decimal(a.y)}C${decimal(a.x+tx*length*.32)} ${decimal(a.y+ty*length*.32)} ${decimal(b.x-dx*.28-dy/length*bend)} ${decimal(b.y-dy*.28+dx/length*bend)} ${decimal(b.x)} ${decimal(b.y)}`});
  }
  for(const n of nodes)if(n.parent!==null)edge(nodes[n.parent],n,'branch-'+n.id,n.depth-1,dependencies([nodes[n.parent]]));
  for(const n of nodes){
    if(n.id%3===0){
      const nearby=nodes.filter(v=>v.id!==n.id&&v.parent!==n.id&&n.parent!==v.id).sort((a,b)=>Math.hypot(n.x-a.x,n.y-a.y)-Math.hypot(n.x-b.x,n.y-b.y));
      const next=nearby[1];
      if(next&&Math.hypot(n.x-next.x,n.y-next.y)<width*.09)edge(n,next,'link-'+n.id,Math.max(n.depth,next.depth),dependencies([n,next]),true);
    }
    if(n.id%2===0&&n.parent!==null){
      const angle=random(n.id+seed+47)*Math.PI*2;
      const tip={id:n.id+1000,x:Math.min(x+width,Math.max(x,n.x+Math.cos(angle)*15)),y:Math.min(y+height,Math.max(y,n.y+Math.sin(angle)*12))};
      edge(n,tip,'tip-'+n.id,n.depth,dependencies([n]),true);
    }
  }
  // Join the regions grown from separate stems so both fruiting bodies belong to one mat.
  for(let index=1;index<origins;index++){
    let bridge=null,distance=Infinity;
    for(const a of nodes.filter(n=>n.origin===index))for(const b of nodes.filter(n=>n.origin<index)){
      const next=Math.hypot(a.x-b.x,a.y-b.y);if(next<distance){distance=next;bridge=[a,b];}
    }
    const [a,b]=bridge;edge(a,b,'join-'+index,Math.max(a.depth,b.depth),dependencies([a,b]));
  }
  return paths;
}
function networkMarkup(bounds,seed=3,anchors){
  return hyphalNetwork(...bounds,seed,anchors).map(p=>`<path data-growth-id='${p.id}'${p.anchor!==null?` data-growth-anchor='${p.anchor}'`:''} data-growth-start='${p.start}' data-growth-duration='${p.duration}' pathLength='1' stroke-width='${p.thin?1:1.8}' d='${p.d}'/>`).join('');
}
function specimenGradients(prefix){
  return `<defs><linearGradient id='${prefix}-cap' x1='.15' y1='0' x2='.7' y2='1'><stop stop-color='#f2ce90'/><stop offset='.27' stop-color='#d69b5b'/><stop offset='.65' stop-color='#a0653d'/><stop offset='1' stop-color='#633c2a'/></linearGradient><linearGradient id='${prefix}-stem'><stop stop-color='#ac9068'/><stop offset='.27' stop-color='#f3dfb9'/><stop offset='.61' stop-color='#e9d0a1'/><stop offset='1' stop-color='#a68c64'/></linearGradient><radialGradient id='${prefix}-gills'><stop stop-color='#886c49'/><stop offset='.35' stop-color='#c3a077'/><stop offset='.8' stop-color='#f3dcb0'/><stop offset='1' stop-color='#97724b'/></radialGradient><linearGradient id='${prefix}-soil' x2='0' y2='1'><stop stop-color='#806b4b'/><stop offset='.2' stop-color='#6a583e'/><stop offset='1' stop-color='#3e382b'/></linearGradient><radialGradient id='${prefix}-water'><stop stop-color='#e9ffff'/><stop offset='.6' stop-color='#91dbe1'/><stop offset='1' stop-color='#3d8192'/></radialGradient><clipPath id='${prefix}-cap-clip'><path d='${capOutline}'/></clipPath></defs>`;
}
function mushroomForm(prefix,x=0,y=0,scale=1){
  const gills=Array.from({length:72},(_,i)=>{
    const a=i/71*Math.PI*2,ex=430+269*Math.cos(a),ey=278+64*Math.sin(a),sx=434+24*Math.cos(a),sy=286+12*Math.sin(a),bend=Math.sin(a)*7;
    return `<path d='M${decimal(sx)} ${decimal(sy)}Q${decimal(432+(ex-432)*.52+bend)} ${decimal(294+(ey-277)*.62)} ${decimal(ex)} ${decimal(ey)}' stroke='${i%3?'#9b794e':'#6d5339'}' stroke-width='${i%3?1.8:2.8}'/><path d='M${decimal(sx+2)} ${decimal(sy)}Q${decimal(434+(ex-432)*.52+bend)} ${decimal(297+(ey-277)*.62)} ${decimal(ex+2)} ${decimal(ey+1)}' stroke='#ffe9c3' stroke-width='.8'/>`;
  }).join('');
  const fibres=Array.from({length:28},(_,i)=>`<path d='M${411+i*2.3} 305C${402+i*3} 353 ${423+i*2.1} 408 ${404+i*3.1} 458'/>`).join('');
  const flecks=Array.from({length:190},(_,i)=>{const a=i*2.399,r=Math.sqrt(i/190);return `<ellipse cx='${decimal(431+Math.cos(a)*r*249)}' cy='${decimal(181+Math.sin(a)*r*101)}' rx='${1+i%3}' ry='${.5+i%2*.35}' transform='rotate(${i%60-30} ${decimal(431+Math.cos(a)*r*249)} ${decimal(181+Math.sin(a)*r*101)})'/>`;}).join('');
  return `<g transform='translate(${x} ${y}) scale(${scale})'><path class='anatomy-stem' d='M411 284C414 333 428 362 419 403L402 455Q430 476 485 455C458 416 459 382 467 345L466 285Z' fill='url(#${prefix}-stem)'/><g fill='none' stroke='#92744e' stroke-width='.9' opacity='.38'>${fibres}</g><ellipse cx='430' cy='278' rx='274' ry='67' fill='url(#${prefix}-gills)'/><g class='anatomy-gills' fill='none'>${gills}</g><g class='anatomy-cap'><path d='${capOutline}' fill='url(#${prefix}-cap)'/><g clip-path='url(#${prefix}-cap-clip)' fill='#ffe3a3' opacity='.3'>${flecks}</g><path d='M183 242C265 165 359 99 443 88C508 79 555 106 595 141' fill='none' stroke='#ffe0a6' stroke-width='3' opacity='.32'/><path d='M156 268Q272 253 350 250T546 248Q645 257 705 270' fill='none' stroke='#f6d095' stroke-width='4'/></g><path d='M159 280Q430 359 703 280' fill='none' stroke='#dbba87' stroke-width='2'/></g>`;
}
function substrate(prefix,y,height){
  const grains=Array.from({length:290},(_,i)=>`<ellipse cx='${18+i*137%964}' cy='${y+7+i*53%(height-14)}' rx='${1+i%5}' ry='${.65+i%2}' fill='${i%2?'#cfb17b':'#2d291f'}' opacity='.24'/>`).join('');
  return `<path d='M15 ${y}Q192 ${y-11} 380 ${y+2}T985 ${y-5}V${y+height}H15Z' fill='url(#${prefix}-soil)'/>${grains}`;
}
function startSVG(label,box,cls=''){return `<svg class='${cls}' viewBox='${box}' xmlns='http://www.w3.org/2000/svg' role='img' aria-label='${label}'>`;}
export function anatomyArtwork(prefix){
  return startSVG('Generic gilled mushroom with folded gills, textured cap, fibrous stem, an interconnected mycelial mat in substrate and enlarged spores.','0 0 1000 640','mushroom-anatomy-art')+specimenGradients(prefix)+`<ellipse cx='430' cy='279' rx='342' ry='258' fill='#dde6d0'/>${substrate(prefix,460,175)}<g class='anatomy-network' fill='none' stroke='#f3e8c8' stroke-width='1.9' stroke-linecap='round'>${networkMarkup([24,465,945,158],11,[stemBaseAt()])}</g>${mushroomForm(prefix)}<path d='M638 302Q697 314 753 283' fill='none' stroke='#506e5c' stroke-width='2' stroke-dasharray='5 7'/><circle cx='843' cy='281' r='94' fill='#f9f3df' stroke='#96a584' stroke-width='2'/><g class='anatomy-spores' fill='url(#${prefix}-cap)' stroke='#846441' stroke-width='1.5'><ellipse cx='809' cy='260' rx='15' ry='24' transform='rotate(-29 809 260)'/><ellipse cx='857' cy='302' rx='16' ry='25' transform='rotate(24 857 302)'/><ellipse cx='878' cy='252' rx='12' ry='19' transform='rotate(34 878 252)'/><ellipse cx='798' cy='314' rx='10' ry='16'/></g></svg>`;
}
export function cutawayArtwork(prefix='mushroom-cutaway'){
  const specimens=[{x:145,y:17,scale:.46},{x:558,y:100,scale:.28}];
  const woodLines=Array.from({length:18},(_,i)=>`<path d='M131 ${296+i*4}Q381 ${277+i*5} 617 ${317+i*3}'/>`).join('');
  const leaves=Array.from({length:16},(_,i)=>`<path d='M${20+i*61} ${223+(i%3)*3}q8 -18 21 -11q-4 15 -21 11' fill='${i%2?'#8c764c':'#5f7250'}'/>`).join('');
  return startSVG('Forest-floor cutaway. Fungal threads connect directly to both mushroom stem bases and spread outward through soil and decaying wood.','0 0 1000 500','cutaway-art')+specimenGradients(prefix)+`<path d='M0 0H1000V235Q690 215 482 230T0 232Z' fill='#153e35'/>${substrate(prefix,230,270)}<path d='M0 231Q210 210 486 230T1000 225' fill='none' stroke='#8ca979' stroke-width='7'/>${leaves}<g transform='rotate(-7 350 330)'><path d='M128 290L618 310L607 391L124 373Z' fill='#806345' stroke='#b39461' stroke-width='2'/><ellipse cx='127' cy='332' rx='27' ry='42' fill='#b28e5d'/><ellipse cx='127' cy='332' rx='18' ry='31' fill='none' stroke='#785838' stroke-width='3'/><ellipse cx='127' cy='332' rx='8' ry='17' fill='none' stroke='#88643f' stroke-width='2'/><g fill='none' stroke='#4b3c2a' stroke-width='2' opacity='.65'>${woodLines}</g></g><g class='cutaway-network' fill='none' stroke='#f0e9ca' stroke-width='2' stroke-linecap='round'>${networkMarkup([15,239,970,245],6,specimens.map(p=>stemBaseAt(p.x,p.y,p.scale)))}</g><g class='cutaway-surface'>${specimens.map(p=>mushroomForm(prefix,p.x,p.y,p.scale)).join('')}</g></svg>`;
}
export function sporeMushroomArtwork(prefix='mushroom-wind'){
  return startSVG('Gilled mushroom wind model. Spores leave the folded gills, fall clear of the cap, and then drift on moving air.','0 0 1000 500','mushroom-wind-art')+specimenGradients(prefix)+`<g fill='none' stroke='#95bfaa' stroke-width='1.5' stroke-dasharray='9 12' opacity='.5'><path d='M22 330Q260 306 498 336T980 330M22 420Q360 394 590 424T980 420'/></g>${mushroomForm(prefix,50,-18,.8)}<g class='spore-particles' fill='#ffe2a1' stroke='#efc77e' stroke-width='.5'></g></svg>`;
}
export function catapultArtwork(prefix='mushroom-catapult'){
  return startSVG('Magnified spore on a tiny stalk growing from a gill cell. A water drop joins a surface film and launches the spore away from the cell.','0 0 650 360','mushroom-catapult-art')+specimenGradients(prefix)+`<path d='M650 29C588 41 589 117 551 157C528 182 492 194 474 220C462 241 492 257 518 248C571 228 605 244 650 276Z' fill='url(#${prefix}-stem)' stroke='#d5bd8e' stroke-width='2'/><g fill='none' stroke='#a58a61' stroke-width='1.2' opacity='.6'><path d='M641 47Q603 100 601 170T638 250M624 39Q587 132 573 170T591 238M647 114Q603 165 578 188'/></g><path d='M498 220Q451 215 405 195L386 178' fill='none' stroke='#e7cb99' stroke-width='7' stroke-linecap='round'/><g class='catapult-moving-spore'><ellipse cx='352' cy='151' rx='43' ry='52' transform='rotate(-20 352 151)' fill='url(#${prefix}-cap)' stroke='#e6c994' stroke-width='2'/><path d='M331 114Q307 147 334 180' fill='none' stroke='#f0d69e' stroke-width='2' opacity='.5'/><path d='M378 110Q404 143 387 176Q378 165 378 148Q384 127 378 110Z' fill='url(#${prefix}-water)'/><circle class='catapult-drop' cx='386' cy='194' r='4' fill='url(#${prefix}-water)' stroke='#c5f2ed' stroke-width='1.3'/><ellipse class='catapult-merged' cx='382' cy='162' rx='13' ry='28' fill='#9edce0' opacity='0'/></g><path class='catapult-flight-guide' d='M269 151H60m0 0l16 -9m-16 9l16 9' fill='none' stroke='#bed7bf' stroke-width='2' stroke-dasharray='5 7' opacity='.5'/><g fill='none' stroke='#a6c0aa' stroke-width='1.5'><path d='M355 95L326 53H270M415 193L451 139H500'/></g><circle class='catapult-drop-label' cx='386' cy='194' r='29' fill='none' stroke='#a8ddd5' stroke-width='1.3' stroke-dasharray='4 5'/></svg>`;
}
export function roleArtwork(kind,prefix='mushroom-role'){
  if(kind==='tree'){
    const fibres=Array.from({length:22},(_,i)=>`<path d='M${137+i*3} ${17+i*2}C${176+i*3} ${82+i*3} ${229+i*3} ${121+i*3} ${289+i*4} ${226+i*2}'/>`).join('');
    return startSVG('Magnified plant root and fungal partner. Fine fungal hyphae form a sheath around a root tip and extend into the surroundings. Gold markers carry sugars toward the fungus; blue markers carry nutrients toward the plant.','0 0 600 320','mushroom-role-art')+specimenGradients(prefix)+`<rect width='600' height='320' fill='#163c33'/><path d='M103 -16C137 51 170 92 216 120S252 176 321 225L365 273L390 248C323 196 308 145 263 117S193 64 164 -16Z' fill='url(#${prefix}-stem)' stroke='#ddc28c' stroke-width='2'/><g fill='none' stroke='#997b53' stroke-width='.9' opacity='.55'>${fibres}</g><path d='M184 97C215 105 241 120 263 145S292 197 336 222Q368 244 378 263Q359 276 342 256C300 220 281 193 251 167S212 135 193 124Z' fill='#bad9c1' fill-opacity='.25' stroke='#a9d9ba' stroke-width='3'/><g class='partner-hyphae' fill='none' stroke='#c4e4cc' stroke-width='2.3'><path d='M599 86C489 74 366 100 291 113S206 116 198 102Q194 88 220 82M600 145C454 144 307 134 249 152S233 181 268 173M600 220C447 221 369 206 288 191S230 214 293 221M600 280C461 258 386 259 329 237S278 230 290 254M454 92L486 45L528 26M486 45L475 16M455 149L495 185L541 175M421 250L453 297L523 317M453 297L436 319'/></g><path class='exchange-sugars' d='M272 129C340 102 424 98 547 103' fill='none' stroke='#f7c87d' stroke-width='5' stroke-dasharray='2 22' stroke-linecap='round'/><path class='exchange-nutrients' d='M547 211C425 213 333 191 278 175' fill='none' stroke='#93e5de' stroke-width='5' stroke-dasharray='2 22' stroke-linecap='round'/><path d='M536 95L551 103L536 111M289 168L274 175L289 183' fill='none' stroke='#e4e8c9' stroke-width='2'/></svg>`;
  }
  if(kind==='bread'){
    const pockets=Array.from({length:32},(_,i)=>`<ellipse cx='${decimal(141+random(i+9)*308)}' cy='${decimal(130+random(i+71)*128)}' rx='${5+i%5*2}' ry='${4+i%4*2}' fill='#9b6835' fill-opacity='.6' stroke='#f4d99d' stroke-width='1'/>`).join('');
    return startSVG('Cross-section of dough inside a glass bowl. Gas pockets are visible in the dough. In the rising model the dough expands as gas pockets grow.','0 0 600 320','mushroom-role-art')+specimenGradients(prefix)+`<rect width='600' height='320' fill='#163c33'/><path d='M80 102L120 278Q300 328 480 278L520 102' fill='#a8c2b5' fill-opacity='.12' stroke='#c1d9cb' stroke-width='3'/><g class='dough-volume'><path d='M96 135Q156 88 217 113Q305 67 387 111Q441 90 504 134L474 267Q300 310 126 267Z' fill='#d9b779' stroke='#f5dba1' stroke-width='2'/>${pockets}</g><path d='M80 102Q300 159 520 102' fill='none' stroke='#c8ddcf' stroke-width='3'/><path d='M76 283H524' fill='none' stroke='#8ead9a' stroke-width='2'/></svg>`;
  }
  return '';
}
export function lifecycleArtwork(prefix='mushroom-life'){
  const specimen={x:185,y:-12,scale:.65},base=stemBaseAt(specimen.x,specimen.y,specimen.scale),germTip={x:478,y:345};
  return startSVG('Simplified mushroom life cycle. Stages reveal a germinating spore, branching fungal network, mushroom fruiting body and released spores.','0 0 1000 500','mushroom-lifecycle-art')+specimenGradients(prefix)+`${substrate(prefix,284,216)}<g class='life-network' fill='none' stroke='#f3e7c6' stroke-width='2'>${networkMarkup([28,300,944,175],19,[germTip])}</g><g class='life-fruit'><path class='life-stem-connection' d='M${decimal(base.x)} ${decimal(base.y)}C470 308 461 327 ${germTip.x} ${germTip.y}' fill='none' stroke='#f3e7c6' stroke-width='2.5'/>${mushroomForm(prefix,specimen.x,specimen.y,specimen.scale)}</g><g class='life-germ'><ellipse cx='343' cy='293' rx='17' ry='25' fill='#c9ab74' stroke='#f8dda6' stroke-width='2'/><path d='M354 310Q398 315 425 338Q449 359 ${germTip.x} ${germTip.y}M424 338Q425 370 457 386' fill='none' stroke='#f2e4bd' stroke-width='4' stroke-linecap='round'/></g><g class='life-release' fill='#f8d792'>${Array.from({length:35},(_,i)=>`<ellipse cx='${340+i*61%380}' cy='${206+i*37%83}' rx='${2+i%2}' ry='${3+i%2}'/>`).join('')}</g></svg>`;
}
