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
export function measurementChainArtwork(kind,prefix){
  const specimen=specimenGradients(prefix)+mushroomForm(prefix,-12,-4,.23);
  const paths={
    fungus:specimen+`<g fill='none' stroke='#ead6a9' stroke-width='1.3'><path d='M89 102Q78 117 42 119M89 102Q104 116 145 118M70 114L62 104M107 113L119 104M52 118L43 110M129 117L140 108'/></g><path d='M12 126H182' stroke='#9a805b'/>`,
    sensor:specimen+`<g fill='none' stroke-width='2.6'><path d='M100 71C129 49 176 55 170 87S192 112 211 100' stroke='#f2cc83'/><path d='M105 84C135 83 142 114 176 117S211 112 215 100' stroke='#84d4d0'/></g><g stroke='#e9e2c9' fill='#4f6260'><ellipse cx='100' cy='71' rx='8' ry='4' transform='rotate(-22 100 71)'/><ellipse cx='105' cy='84' rx='7' ry='4' transform='rotate(-22 105 84)'/></g><rect x='181' y='40' width='49' height='61' rx='8' fill='#253c39' stroke='#b1c0a6' stroke-width='2'/><rect x='188' y='48' width='35' height='23' rx='3' fill='#092522'/><path d='M192 63H199L203 54L208 65L214 57H220' fill='none' stroke='#87d6cc' stroke-width='1.8'/><circle cx='196' cy='84' r='3' fill='#e6be70'/><path d='M208 80H220M208 87H220' stroke='#9da59a'/>`,
    computer:`<path d='M24 109L43 94H199L218 109Z' fill='#8c9990' stroke='#d2d1b3' stroke-width='2'/><rect x='38' y='15' width='168' height='81' rx='6' fill='#43534b' stroke='#b5bda3' stroke-width='2'/><rect x='46' y='22' width='152' height='65' rx='2' fill='#0b2825'/><g stroke='#4f6d60' stroke-width='.8'><path d='M54 38H189M54 55H189M54 72H189M72 28V80M106 28V80M140 28V80M174 28V80'/></g><path d='M56 67L74 58L92 64L110 39L128 47L146 32L164 49L184 39' fill='none' stroke='#85d4d0' stroke-width='2.5'/><g fill='#eacb89'><circle cx='110' cy='39' r='3.5'/><circle cx='146' cy='32' r='3.5'/></g><path d='M91 113H151' stroke='#d4d1b3' stroke-width='3'/><g stroke='#42564b' stroke-width='1.3'><path d='M48 100H193M41 104H202'/></g>`,
    instrument:`<rect x='163' y='13' width='55' height='104' rx='5' fill='#263c36' stroke='#b0b79b' stroke-width='2'/><circle cx='190' cy='41' r='12' fill='#0b2420' stroke='#8c9d88'/><circle cx='190' cy='85' r='22' fill='#0b2420' stroke='#8c9d88'/><circle cx='190' cy='85' r='12' fill='#2e4941' stroke='#83967d'/><path d='M36 70V29Q47 17 55 29V70L67 91Q46 103 24 91Z' fill='#d8aa5e' stroke='#f6d591' stroke-width='2'/><path d='M24 91Q45 82 67 91M45 97V106' fill='none' stroke='#553f2b' stroke-width='2'/><path d='M89 36L147 103' stroke='#d4d4bb' stroke-width='9' stroke-linecap='round'/><path d='M88 35L147 103' stroke='#6d8a7a' stroke-width='2'/><g fill='#2b4740'>${[0,1,2,3,4].map(i=>`<circle cx='${101+i*7}' cy='${50+i*8}' r='2.5'/>`).join('')}</g><path d='M226 67Q237 83 226 99' stroke='#86d3ca' stroke-width='2' fill='none'/>`
  };
  return `<svg viewBox='0 0 244 136' xmlns='http://www.w3.org/2000/svg' aria-hidden='true' focusable='false'>${paths[kind]||''}</svg>`;
}
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
  return startSVG('Magnified spore on a tiny stalk growing from a gill cell. A water drop joins a surface film and launches the spore away from the cell.','0 0 650 360','mushroom-catapult-art')+specimenGradients(prefix)+`<path d='M650 29C588 41 589 117 551 157C528 182 492 194 474 220C462 241 492 257 518 248C571 228 605 244 650 276Z' fill='url(#${prefix}-stem)' stroke='#d5bd8e' stroke-width='2'/><g fill='none' stroke='#a58a61' stroke-width='1.2' opacity='.6'><path d='M641 47Q603 100 601 170T638 250M624 39Q587 132 573 170T591 238M647 114Q603 165 578 188'/></g><path d='M498 220Q451 215 405 195L386 178' fill='none' stroke='#e7cb99' stroke-width='7' stroke-linecap='round'/><g class='catapult-moving-spore'><ellipse cx='352' cy='151' rx='43' ry='52' transform='rotate(-20 352 151)' fill='url(#${prefix}-cap)' stroke='#e6c994' stroke-width='2'/><path d='M331 114Q307 147 334 180' fill='none' stroke='#f0d69e' stroke-width='2' opacity='.5'/><path class='catapult-surface-water' d='M378 110Q404 143 387 176Q378 165 378 148Q384 127 378 110Z' fill='url(#${prefix}-water)'/><circle class='catapult-drop' cx='386' cy='194' r='4' fill='url(#${prefix}-water)' stroke='#c5f2ed' stroke-width='1.3'/><ellipse class='catapult-merged' cx='382' cy='162' rx='13' ry='28' fill='#9edce0' opacity='0'/></g><path class='catapult-flight-guide' d='M270 151H205m0 0l12 -7m-12 7l12 7' fill='none' stroke='#bed7bf' stroke-width='2' stroke-dasharray='5 7' opacity='.5'/><g fill='none' stroke='#a6c0aa' stroke-width='1.5'><path class='catapult-leader-spore' d='M150 20L220 62L329 126'/><path class='catapult-leader-film' d='M510 20L450 65L386 130'/><path class='catapult-leader-drop' d='M155 340L263 291L386 207'/><path d='M510 340L498 290L440 207'/></g><circle class='catapult-drop-label' cx='386' cy='194' r='29' fill='none' stroke='#a8ddd5' stroke-width='1.3' stroke-dasharray='4 5'/></svg>`;
}
export function roleArtwork(kind,prefix='mushroom-role'){
  if(kind==='leaf'){
    const grains=Array.from({length:110},(_,i)=>`<ellipse cx='${20+i*71%650}' cy='${228+i*43%202}' rx='${1+i%4}' ry='1' fill='#b99e6b' opacity='.2'/>`).join('');
    const bark=Array.from({length:16},(_,i)=>`<path d='M82 ${145+i*5}Q171 ${118+i*5} 337 ${143+i*5}'/>`).join('');
    const food=Array.from({length:19},(_,i)=>`<circle cx='${225+i*31%190}' cy='${221+i*23%76}' r='${3+i%3}'/>`).join('');
    const minerals=Array.from({length:22},(_,i)=>`<path d='M${95+i*71%500} ${270+i*37%145}l4 -5l4 5l-4 5Z'/>`).join('');
    return startSVG('A decomposing leaf and log above connected fungal threads. Steps show material breaking down outside threads, small food particles entering them, and nutrients becoming available in the surrounding soil.','0 0 700 450','mushroom-role-art mushroom-recycling-art')+specimenGradients(prefix)+`<rect width='700' height='450' fill='#143a30'/><path d='M0 224Q220 206 385 231T700 219V450H0Z' fill='url(#${prefix}-soil)'/>${grains}<g class='recycle-material'><path d='M80 137L336 129L353 215L83 225Z' fill='#735033' stroke='#bc965e' stroke-width='2'/><ellipse cx='82' cy='181' rx='21' ry='44' fill='#a37b49'/><ellipse cx='82' cy='181' rx='13' ry='31' fill='none' stroke='#604026' stroke-width='3'/><ellipse cx='82' cy='181' rx='5' ry='17' fill='none' stroke='#704a2a' stroke-width='2'/><g fill='none' stroke='#3f2c1f' stroke-width='2'>${bark}</g><path d='M362 193C356 131 411 74 521 67C543 137 502 211 420 218Z' fill='#9d723f' stroke='#d4b477' stroke-width='2'/><g fill='none' stroke='#684b2f' stroke-width='2'><path d='M382 208L506 83M412 174L397 129M443 141L434 100M471 110L467 86M413 174L467 178M443 141L497 140M473 110L512 111'/></g></g><g class='recycle-fragments' fill='#153a30'><path d='M322 155l22 -8l7 26l-26 4ZM287 214l18 -25l19 14l-9 18ZM455 174l17 -13l10 9l-14 22Z'/><circle cx='469' cy='123' r='9'/><circle cx='425' cy='157' r='7'/></g><g class='recycle-hyphae' fill='none' stroke='#ecdfbc' stroke-width='1.8' stroke-linecap='round'>${networkMarkup([95,228,500,204],45,[{x:279,y:222},{x:414,y:212}])}</g><g class='recycle-food-outside' fill='#efbd70' stroke='#6a4c2c' stroke-width='1'>${food}</g><g class='recycle-food-inside' fill='#efbd70' stroke='#153a30' stroke-width='1'>${hyphalNetwork(95,228,500,204,45,[{x:279,y:222},{x:414,y:212}]).slice(0,8).map(p=>`<circle cx='${p.to.x}' cy='${p.to.y}' r='4'/>`).join('')}</g><g class='recycle-nutrients' fill='#b0d9c6' stroke='#153a30' stroke-width='1'>${minerals}</g></svg>`;
  }
  if(kind==='tree'){
    const rootFibres=Array.from({length:15},(_,i)=>`<path d='M${230+i} 203Q${223+i*2} 254 ${308+i} 331'/>`).join('');
    return startSVG('A leafy plant above soil, its root joined to fungal threads below. Sunlight helps leaves make sugars. Round gold markers go to the fungus; diamond blue-green markers go toward the plant with water and minerals.','0 0 700 450','mushroom-role-art mushroom-partnership-art')+specimenGradients(prefix)+`<defs><marker id='${prefix}-sugar-arrow' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0 0L10 5L0 10Z' fill='#edc077'/></marker><marker id='${prefix}-water-arrow' viewBox='0 0 10 10' refX='8' refY='5' markerWidth='5' markerHeight='5' orient='auto'><path d='M0 0L10 5L0 10Z' fill='#9bded7'/></marker></defs><rect width='700' height='450' fill='#143a30'/><g fill='none' stroke='#e5c578' stroke-width='3'><circle cx='87' cy='66' r='31' fill='#d4a84f' fill-opacity='.3'/><path d='M87 18V8M87 114V124M39 66H29M135 66H145M53 32L45 24M121 100L129 108M53 100L45 108M121 32L129 24'/><path d='M140 72Q169 82 197 93' stroke-dasharray='5 5' marker-end='url(#${prefix}-sugar-arrow)'/></g><path d='M238 195Q227 132 243 63' fill='none' stroke='#8eae62' stroke-width='9'/><path d='M236 128Q179 118 174 68Q226 67 239 113M240 96Q257 49 308 52Q304 99 242 115' fill='#779b55' stroke='#c5d78c' stroke-width='2'/><g fill='none' stroke='#496e42' stroke-width='2'><path d='M178 72L235 122M303 57L244 109'/></g><path d='M0 190Q250 183 429 195T700 189V450H0Z' fill='url(#${prefix}-soil)'/><path d='M0 190Q250 183 429 195T700 189' fill='none' stroke='#9bab75' stroke-width='4'/><path d='M227 188Q221 230 240 260Q262 288 285 316L315 340L326 326Q293 300 271 267Q247 229 248 188Z' fill='url(#${prefix}-stem)' stroke='#dfc38b' stroke-width='2'/><g fill='none' stroke='#a08253' stroke-width='1'>${rootFibres}</g><g class='partner-hyphae' fill='none' stroke='#e0dfbc' stroke-width='1.8' opacity='.85'>${networkMarkup([315,224,360,205],41,[{x:315,y:337}])}</g><path d='M278 313Q307 314 324 335Q323 348 308 345L280 322Z' fill='#c2ddbb' fill-opacity='.35' stroke='#d5e4ba' stroke-width='2'/><path class='exchange-sugars' d='M283 302C400 230 520 235 633 264' fill='none' stroke='#edc077' stroke-width='4' marker-end='url(#${prefix}-sugar-arrow)'/><path class='exchange-nutrients' d='M633 374C513 398 397 372 315 337' fill='none' stroke='#9bded7' stroke-width='4' stroke-dasharray='9 5' marker-end='url(#${prefix}-water-arrow)'/><g class='trade-sugar-marker' fill='#f9cc80' stroke='#4b3725' stroke-width='2'><circle r='8'/></g><g class='trade-water-marker' fill='#b8eee3' stroke='#294a43' stroke-width='2'><path d='M0 -9L9 0L0 9L-9 0Z'/></g></svg>`;
  }
  if(kind==='bread'){
    const pockets=Array.from({length:32},(_,i)=>`<ellipse data-rx='${5+i%5*2}' data-ry='${4+i%4*2}' cx='${decimal(141+random(i+9)*308)}' cy='${decimal(130+random(i+71)*128)}' rx='${5+i%5*2}' ry='${4+i%4*2}' fill='#946535' fill-opacity='.7' stroke='#f6dca1' stroke-width='1.5'/>`).join('');
    const dough='M96 135Q156 88 217 113Q305 67 387 111Q441 90 504 134L474 267Q300 310 126 267Z';
    return startSVG('Dough in a glass bowl. Growing gas pockets make the dough expand. A dashed outline stays at its starting size for comparison.','0 0 600 320','mushroom-role-art mushroom-dough-art')+specimenGradients(prefix)+`<rect width='600' height='320' fill='#163c33'/><path d='M80 102L120 278Q300 328 480 278L520 102' fill='#a8c2b5' fill-opacity='.12' stroke='#c1d9cb' stroke-width='3'/><g class='dough-volume' transform='translate(0 287) scale(1 .62) translate(0 -287)'><path d='${dough}' fill='#d9b779' stroke='#f5dba1' stroke-width='2'/><g class='dough-gas-pockets'>${pockets}</g></g><path class='dough-start-outline' d='${dough}' transform='translate(0 287) scale(1 .62) translate(0 -287)' fill='none' stroke='#fff1cf' stroke-width='2.5' stroke-dasharray='7 6'/><path d='M80 102Q300 159 520 102' fill='none' stroke='#c8ddcf' stroke-width='3'/><path d='M76 283H524' fill='none' stroke='#8ead9a' stroke-width='2'/></svg>`;
  }
  return '';
}
export function lifecycleArtwork(prefix='mushroom-life'){
  const specimen={x:185,y:-12,scale:.65},base=stemBaseAt(specimen.x,specimen.y,specimen.scale),germTip={x:478,y:345};
  return startSVG('Simplified mushroom life cycle. Stages reveal a germinating spore, branching fungal network, mushroom fruiting body and released spores.','0 0 1000 500','mushroom-lifecycle-art')+specimenGradients(prefix)+`${substrate(prefix,284,216)}<g class='life-network' fill='none' stroke='#f3e7c6' stroke-width='2'>${networkMarkup([28,300,944,175],19,[germTip])}</g><g class='life-fruit'><path class='life-stem-connection' d='M${decimal(base.x)} ${decimal(base.y)}C470 308 461 327 ${germTip.x} ${germTip.y}' fill='none' stroke='#f3e7c6' stroke-width='2.5'/>${mushroomForm(prefix,specimen.x,specimen.y,specimen.scale)}</g><g class='life-germ'><ellipse cx='343' cy='293' rx='17' ry='25' fill='#c9ab74' stroke='#f8dda6' stroke-width='2'/><path d='M354 310Q398 315 425 338Q449 359 ${germTip.x} ${germTip.y}M424 338Q425 370 457 386' fill='none' stroke='#f2e4bd' stroke-width='4' stroke-linecap='round'/></g><g class='life-release' fill='#f8d792'>${Array.from({length:35},(_,i)=>`<ellipse cx='${340+i*61%380}' cy='${206+i*37%83}' rx='${2+i%2}' ry='${3+i%2}'/>`).join('')}</g></svg>`;
}

export function lifecycleStageArtwork(index,prefix){
  const boxes=['290 240 220 170','170 278 650 220','225 0 520 500','225 0 520 500'];
  return lifecycleArtwork(prefix).replace("viewBox='0 0 1000 500'","viewBox='"+boxes[index]+"'");
}
