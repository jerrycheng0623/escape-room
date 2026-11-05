// Rendering and collision share metre-based footprints. Player is a vertical capsule;
// its horizontal circle is swept in short steps to prevent wall tunnelling.
export const PLAYER_RADIUS=.28;
export const EYE_HEIGHT=1.65;
export const WALL_TRIM_CLEARANCE=.23;
export const SPACE={
 A:{bounds:[3,10,5.5,10.5],floor:0,height:3,spawn:[8.5,9.6],door:[8.9,5.52],obstacles:[
  {id:'desk',box:[6.12,7.88,6.5,7.5],top:.87},
  {id:'bed',box:[3.35,5.35,7.3,10.04],top:1.12},
  {id:'chair',box:[6.35,7.05,7.65,8.25],top:1.12},
  {id:'dresser',box:[3.3,4.2,5.8,6.75],top:1.35}]},
 B:{bounds:[10,14,6.5,9.5],floor:0,height:2.8,spawn:[11,8.9],door:[13.25,9.48],obstacles:[
  {id:'workbench',box:[10.65,13.35,6.95,7.75],top:.94},
  {id:'sink',box:[13.38,13.82,7,8.25],top:1.05}]},
 C:{bounds:[-6,6,12,22],floor:.45,height:3.35,spawn:[1.5,15.2],door:[-4.8,21.98],obstacles:[
  {id:'grill',box:[-1.64,1.05,12.65,13.72],top:1.63},
  {id:'records',box:[.6,2.6,13.8,14.6],top:1.27},
  {id:'world-basket',box:[-1.08,-.52,15.46,15.94],top:1.52},
  {id:'world-hatch',box:[-1.07,-.33,13.67,14.13],top:2.12},
  {id:'weight-rack',box:[2.7,4.1,12.6,14.35],top:1.45},
  {id:'storage-shelf',box:[-5.65,-4.7,13.2,17],top:2.5},
  {id:'storage-divider',box:[-2.8,-2.58,12.18,15.1],top:3.8},
  {id:'storage-return',box:[-5.8,-4.2,17.45,17.65],top:3.8},
  {id:'storage-crate',box:[-4.3,-3.35,13.25,14.15],top:1.35}]},
 D:{bounds:[7,15,14,20],floor:-2.4,height:2.85,spawn:[11.8,18.6],door:[8,19.98],obstacles:[
  {id:'medical',box:[9.12,10.88,15.5,16.5],top:-1.45},
  {id:'module',box:[12.3,12.9,18.1,18.65],top:-1.56},
  {id:'cabinet',box:[12.1,13.9,16.04,17.16],top:-1.35},
  {id:'files',box:[7.28,8.15,14.5,17.15],top:-.15},
  {id:'recess-side',box:[14.18,14.38,14.2,17.4],top:.4}]}
};
export function obstaclesFor(room,state={}){return SPACE[room].obstacles.map(o=>o.id==='cabinet'&&state.cabinetMoved?{...o,box:[10.3,12.1,14.35,15.47]}:o);}
export function overlapsCircle(x,z,box,r=PLAYER_RADIUS){const [a,b,c,d]=box,px=Math.max(a,Math.min(b,x)),pz=Math.max(c,Math.min(d,z));return (x-px)**2+(z-pz)**2<r*r-1e-9;}
export function walkable(room,x,z,state={}){const s=SPACE[room];if(!s||!Number.isFinite(x)||!Number.isFinite(z))return false;const [a,b,c,d]=s.bounds;const margin=PLAYER_RADIUS+WALL_TRIM_CLEARANCE;if(x<a+margin||x>b-margin||z<c+margin||z>d-margin)return false;return !obstaclesFor(room,state).some(o=>overlapsCircle(x,z,o.box));}
export function safePosition(room,saved,state={}){const s=SPACE[room];return saved&&walkable(room,saved.x,saved.z,state)?{x:saved.x,z:saved.z}:{x:s.spawn[0],z:s.spawn[1]};}
export function movePlayer(room,position,dx,dz,state={}){let {x,z}=safePosition(room,position,state);const n=Math.max(1,Math.ceil(Math.hypot(dx,dz)/.06));for(let i=0;i<n;i++){const nx=x+dx/n,nz=z+dz/n;if(walkable(room,nx,z,state))x=nx;if(walkable(room,x,nz,state))z=nz;}return {x,z};}
export function segmentHitsBox(from,to,b){let lo=0,hi=1;for(let i=0;i<3;i++){const v=to[i]-from[i];if(Math.abs(v)<1e-9){if(from[i]<b[i]||from[i]>b[i+3])return false;continue;}let a=(b[i]-from[i])/v,c=(b[i+3]-from[i])/v;if(a>c)[a,c]=[c,a];lo=Math.max(lo,a);hi=Math.min(hi,c);if(lo>hi)return false;}return hi>0.01&&lo<.98;}
export function visibleTarget(room,eye,target,owner,state={}){const s=SPACE[room],[a,b,c,d]=s.bounds;if(target[0]<a||target[0]>b||target[2]<c||target[2]>d)return false;return !obstaclesFor(room,state).filter(o=>o.id!==owner).some(o=>{const [x1,x2,z1,z2]=o.box;return segmentHitsBox(eye,target,[x1,s.floor,z1,x2,o.top,z2]);});}
