import {REPORT_ROWS} from './recordLayout.mjs';
export const ROOM_ORDER=['A','B','C','D'];
export const WEIGHT_VALUES={'timber-0':15,'timber-1':15,'iron-0':20,'iron-1':20,'sand-0':10,'sand-1':10,'stone-0':5,'stone-1':5};
export function totalWeight(ids){if(!Array.isArray(ids)||new Set(ids).size!==ids.length||ids.some(id=>!Object.hasOwn(WEIGHT_VALUES,id)))return null;return ids.reduce((s,id)=>s+WEIGHT_VALUES[id],0);}
export function canVisit(run,room){const i=ROOM_ORDER.indexOf(room);return i>=0&&(i===0||run.seen?.includes(`CIN-${ROOM_ORDER[i-1]}`));}
export function requiredDone(run,room,required){return run.solved.includes(room)&&required.every(id=>run.evidence.includes(id));}

export const MECHANIC_REVISION=4;
export function freshPuzzles(){return {A:{hooks:Array(6).fill('rest'),guard:false,latch:false,panel:false,luggage:false,digits:'0000'},B:{strip:[],transported:false,result:null,returnOpen:false,originalReleased:false,originalOpened:false,tested:false},C:{route:[],slipped:false,released:false,liftCommitted:false,hatchRaised:false,handwheel:false},D:{pages:[],sequence:[],upperReleased:false,upperOpened:false,lowerReleased:false,lowerOpened:false}};}
