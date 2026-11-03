export const ROOM_ORDER=['A','B','C','D'];
export const WEIGHT_VALUES={'timber-0':15,'timber-1':15,'iron-0':20,'iron-1':20,'sand-0':10,'sand-1':10,'stone-0':5,'stone-1':5};
export function totalWeight(ids){if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!(id in WEIGHT_VALUES)))return null;return ids.reduce((s,id)=>s+WEIGHT_VALUES[id],0);}
export const weightMatches=n=>Number.isFinite(n)&&n>=64.5&&n<=65.5;
export const weightOverload=n=>Number.isFinite(n)&&n>70;
export const validCode=digits=>Array.isArray(digits)&&digits.length===3&&digits.every(n=>Number.isInteger(n)&&n>=0&&n<=9);
export const codeMatches=digits=>validCode(digits)&&digits.join('')==='120';
export const rgbMatches=v=>Array.isArray(v)&&v.length===3&&v[0]===0&&v[1]===100&&v[2]===100;
export function paintMask(mask,x,y,r=.075,w=100,h=60){const next=new Set(mask);if(!Number.isFinite(x)||!Number.isFinite(y)||x<0||x>1||y<0||y>1)return [...next];for(let iy=Math.max(0,Math.floor((y-r)*h));iy<Math.min(h,Math.ceil((y+r)*h));iy++)for(let ix=Math.max(0,Math.floor((x-r)*w));ix<Math.min(w,Math.ceil((x+r)*w));ix++)if(((ix+.5)/w-x)**2+((iy+.5)/h-y)**2<=r*r)next.add(iy*w+ix);return [...next].sort((a,b)=>a-b);}
export const maskComplete=mask=>new Set(mask).size>4800;
export function canVisit(run,room){const i=ROOM_ORDER.indexOf(room);return i>=0&&(i===0||run.seen?.includes(`CIN-${ROOM_ORDER[i-1]}`));}
export function requiredDone(run,room,required){return run.solved.includes(room)&&required.every(id=>run.evidence.includes(id));}
