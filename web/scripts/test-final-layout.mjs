import assert from 'node:assert/strict';import {WORLD} from '../src/game/world.mjs';import {SPACE,walkable,visibleTarget} from '../src/game/space.mjs';import {writeFile,mkdir} from 'node:fs/promises';
const report={version:14,date:new Date().toISOString(),checks:[],failures:[]};
for(const w of Object.values(WORLD)){
 const s=SPACE[w.room],size=w.size,bottom=w.pos[1]-size[1]/2;if(w.support.id!=='fixed-mount'&&w.support.id!=='coat-hook')try{assert(Math.abs(bottom-w.support.y)<.00001,'底面與承托面吻合');}catch(e){report.failures.push(w.id+': '+e.message);}
 const step=.12,q=[s.spawn],seen=new Set();let found=null;for(let n=0;n<q.length&&!found;n++){const [x,z]=q[n],key=[Math.round(x/step),Math.round(z/step)].join(',');if(seen.has(key))continue;seen.add(key);if(!walkable(w.room,x,z))continue;const eye=[x,s.floor+1.65,z],d=Math.hypot(...eye.map((v,i)=>v-w.pos[i]));const owner=w.owner||s.obstacles.find(o=>w.pos[0]>=o.box[0]-.1&&w.pos[0]<=o.box[1]+.1&&w.pos[2]>=o.box[2]-.1&&w.pos[2]<=o.box[3]+.1)?.id;if(d<2.55&&visibleTarget(w.room,eye,w.pos,owner))found=[x,z];else for(const [dx,dz]of [[step,0],[-step,0],[0,step],[0,-step]])q.push([x+dx,z+dz]);}
 if(!found)report.failures.push(w.id+': 無可達的視線調查站位');else report.checks.push({id:w.id,support:w.support,viewpoint:found});
}
await mkdir('/tmp/embers-final',{recursive:true});await writeFile('/tmp/embers-final/layout.json',JSON.stringify(report,null,2));console.log(JSON.stringify({passed:report.checks.length,failures:report.failures},null,2));assert.equal(report.failures.length,0);
