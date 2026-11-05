import {REPORT_ROWS} from './recordLayout.mjs';
export const ROOM_ORDER=['A','B','C','D'];
export const WEIGHT_VALUES={'timber-0':15,'timber-1':15,'iron-0':20,'iron-1':20,'sand-0':10,'sand-1':10,'stone-0':5,'stone-1':5};
export function totalWeight(ids){if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!Object.hasOwn(WEIGHT_VALUES,id)))return null;return ids.reduce((s,id)=>s+WEIGHT_VALUES[id],0);}
export const weightMatches=n=>Number.isFinite(n)&&n>=64.5&&n<=65.5;
export const weightOverload=n=>Number.isFinite(n)&&n>70;
export const validCode=digits=>Array.isArray(digits)&&digits.length===3&&digits.every(n=>Number.isInteger(n)&&n>=0&&n<=9);
export const codeMatches=digits=>validCode(digits)&&digits.join('')==='120';
export const PHOTO_TARGETS=[[0,100,100],[100,100,0]];
export const rgbMatches=(v,photo=0)=>Array.isArray(v)&&v.length===3&&v.every((n,i)=>n===PHOTO_TARGETS[photo]?.[i]);
export function paintMask(mask,x,y,r=.075,w=100,h=60){const next=new Set(mask);if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return [...next];for(let iy=Math.max(0,Math.floor((y-r)*h));iy<Math.min(h,Math.ceil((y+r)*h));iy++)for(let ix=Math.max(0,Math.floor((x-r)*w));ix<Math.min(w,Math.ceil((x+r)*w));ix++)if(((ix+.5)/w-x)**2+((iy+.5)/h-y)**2<=r*r)next.add(iy*w+ix);return [...next].sort((a,b)=>a-b);}
// Legacy schema 2 validation only; revision 3 uses three text regions.
export const maskComplete=mask=>new Set(mask).size>4800;
export function canVisit(run,room){const i=ROOM_ORDER.indexOf(room);return i>=0&&(i===0||run.seen?.includes(`CIN-${ROOM_ORDER[i-1]}`));}
export function requiredDone(run,room,required){return run.solved.includes(room)&&required.every(id=>run.evidence.includes(id));}

// Revision 3: persistent results and transient physical readiness are separate.
export const MECHANIC_REVISION=3;
export const SYMBOLS=['圓孔','雙短線','斜槽','方框','三角'];
export const INDEX_TARGET=['雙短線','圓孔','斜槽'];
export const indexMatches=buffer=>Array.isArray(buffer)&&buffer.length===3&&buffer.every((s,i)=>s===INDEX_TARGET[i]);
export const UV_REGIONS=[{id:'upper',x1:.08,x2:.92,y1:.19,y2:.36,index:'歸檔②／圓孔'}, {id:'middle',x1:.08,x2:.92,y1:.45,y2:.62,index:'歸檔③／斜槽'}, {id:'lower',x1:.08,x2:.92,y1:.71,y2:.88,index:'歸檔①／雙短線'}];
export function regionCells(region){const ids=[];for(let y=0;y<60;y++)for(let x=0;x<100;x++)if((x+.5)/100>=region.x1&&(x+.5)/100<=region.x2&&(y+.5)/60>=region.y1&&(y+.5)/60<=region.y2)ids.push(y*100+x);return ids;}
export const REGION_CELLS=UV_REGIONS.map((region,i)=>{const rows=REPORT_ROWS.filter(r=>r.region===i),cells=[];for(let y=0;y<60;y++)for(let x=0;x<100;x++){const px=(x+.5)*10,py=(y+.5)*650/60;if(rows.some(r=>px>=r.x&&px<=r.x+r.width&&py>=r.y-r.size&&py<=r.y+3))cells.push(y*100+x);}return cells;});
const REGION_SETS=REGION_CELLS.map(ids=>new Set(ids));
export const regionCoverage=(cells,i)=>new Set(cells.filter(n=>REGION_SETS[i].has(n))).size/REGION_CELLS[i].length;
export const regionsComplete=regions=>Array.isArray(regions)&&regions.length===3&&regions.every((cells,i)=>regionCoverage(cells,i)>=.7);
export const overlayAligned=p=>p.overlayLocation==='original'&&!p.overlayFlipped&&p.overlayRotation===0&&Math.hypot(p.overlayOffset.x,p.overlayOffset.y*.65)<.03;
export function scanRegions(regions,x,y){const painted=paintMask([],x,y);return regions.map((cells,i)=>[...new Set([...cells,...painted.filter(n=>REGION_SETS[i].has(n))])].sort((a,b)=>a-b));}
export function freshPuzzles(){return {A:{digits:[0,0,0],lidClosed:false,innerUnlocked:false,innerOpened:false},B:{values:[[100,0,0],[100,0,0]],confirmed:[false,false],sampleSelections:[null,null],holderLocation:'rack',holderRotation:90,filtersRemoved:false,whiteLightOn:false,catchReleased:false,filmFrameOpened:false},C:{placed:[],extractionCommitted:false,cartridgeExtracted:false},D:{overlayAcquired:false,overlayLocation:'inventory',overlayFlipped:false,overlayRotation:90,overlayOffset:{x:.08,y:.06},regions:[[],[],[]],indexBuffer:[],archiveReleased:false,archiveOpened:false}};}
