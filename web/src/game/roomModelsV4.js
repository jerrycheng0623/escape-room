import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {SPACE} from './space.mjs';
import {WORLD} from './world.mjs';
import {asset} from './content.js';
import {detailedProp} from './propModelsFinal.js';
export {makeMaterials} from './roomModels.js';
export function buildRoom(room,m,track,loader,onAssetError){
 const root=new THREE.Group(),s=SPACE[room],objects={},[x1,x2,z1,z2]=s.bounds,f=s.floor,h=s.height,cx=(x1+x2)/2,cz=(z1+z2)/2;
 root.name='封閉調查區_final14_'+room;let activeParent=root;const fixtures={};
 const mesh=(geo,mat,pos,parent=activeParent,rot=[0,0,0])=>{track.geometries.push(geo);const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(pos,size,mat=m.wood,parent=activeParent)=>mesh(new THREE.BoxGeometry(...size),mat,pos,parent);
 const cylinder=(pos,r,len,mat=m.metal,parent=activeParent,rot=[0,0,0])=>mesh(new THREE.CylinderGeometry(r,r,len,12),mat,pos,parent,rot);
 const ring=(pos,r,parent=activeParent,rot=[Math.PI/2,0,0])=>mesh(new THREE.TorusGeometry(r,.012,6,18),m.brass,pos,parent,rot);
 box([cx,f-.13,cz],[x2-x1+.4,.26,z2-z1+.4],m.floor);box([cx,f+h+.1,cz],[x2-x1+.4,.2,z2-z1+.4],m.char);
 for(const x of [x1-.12,x2+.12])box([x,f+h/2,cz],[.24,h,z2-z1+.48],m.wall);
 for(const z of [z1-.12,z2+.12])box([cx,f+h/2,z],[x2-x1,h,.24],m.wall);
 for(let x=x1+.3;x<x2;x+=1.15)box([x,f+h-.16,cz],[.16,.25,z2-z1],m.char);
 for(const z of [z1+.03,z2-.03]){box([cx,f+.12,z],[x2-x1,.2,.06],m.char);box([cx,f+.96,z],[x2-x1,.07,.08],m.wood);}
 const [doorX,doorZ]=s.door;box([doorX,f+1.1,doorZ],[.95,2.2,.06],m.char);cylinder([doorX+.3,f+1.05,doorZ+(doorZ>cz?-.05:.05)],.035,.08,m.brass,root,[Math.PI/2,0,0]);
 // Solid furnishings use exactly the shared collision footprints.
 for(const ob of s.obstacles){if(ob.id.startsWith('world-')||ob.collisionOnly)continue;const [a,b,c,d]=ob.box;if(ob.id==='cabinet')continue;const height=ob.top-f;activeParent=new THREE.Group();activeParent.name='fixture-'+room+'-'+ob.id;activeParent.userData.dynamic=true;root.add(activeParent);fixtures[ob.id]=activeParent;if(/divider|return|recess/.test(ob.id)){box([(a+b)/2,f+height/2,(c+d)/2],[b-a,height,d-c],m.wall);continue;}
  const mx=(a+b)/2,mz=(c+d)/2;
  if(ob.id==='bed'){box([mx,ob.top-.18,mz],[b-a,.35,d-c],m.fabric);box([mx,ob.top-.42,mz],[b-a,.12,d-c],m.wood);box([mx,ob.top+.06,c+.36],[b-a-.2,.12,.52],m.paper);for(const x of [a+.1,b-.1])for(const z of [c+.1,d-.1])box([x,f+(height-.42)/2,z],[.12,height-.42,.12],m.char);}
  else if(ob.id==='chair'){box([mx,f+.46,mz],[b-a,.12,d-c],m.wood);box([mx,f+.82,d-.06],[b-a,.6,.1],m.wood);for(const x of [a+.05,b-.05])for(const z of [c+.05,d-.05])box([x,f+.22,z],[.07,.44,.07],m.char);}
  else if(/shelf|files/.test(ob.id)){box([mx,f+height/2,c+.03],[b-a,height,.06],m.char);box([mx,f+height/2,d-.03],[b-a,height,.06],m.char);box([a+.025,f+height/2,mz],[.05,height,d-c],m.char);const levels=ob.id==='storage-shelf'?[f+.1,1.68,2.5]:ob.id==='west-shelf'?[.55,1.12,1.7]:[-2.3,-1.1,-.15];for(const y of levels)box([mx,y-.025,mz],[b-a,.05,d-c],m.wood);}
  else if(ob.id==='sink'){box([mx,ob.top-.08,mz],[b-a,.16,d-c],m.paper);box([mx,ob.top+.005,mz],[b-a-.08,.008,d-c-.18],m.black);for(const x of [a+.05,b-.05])box([x,f+(height-.16)/2,mz],[.05,height-.16,d-c-.1],m.metal);cylinder([mx,ob.top+.18,c+.13],.025,.36,m.metal);box([mx,ob.top+.35,c+.21],[.05,.05,.2],m.metal);}
  else if(ob.id==='grill'){box([mx,ob.top-.25,mz],[b-a,.32,d-c],m.char);for(let x=a+.06;x<b;x+=.13)box([x,ob.top-.02,mz],[.025,.04,d-c],m.metal);for(const x of [a+.1,b-.1])for(const z of [c+.1,d-.1])box([x,f+(height-.4)/2,z],[.07,height-.4,.07],m.rust);}
  else {box([mx,ob.top-.06,mz],[b-a,.12,d-c],m.wood);for(const x of [a+.08,b-.08])for(const z of [c+.08,d-.08])box([x,f+(height-.12)/2,z],[.08,height-.12,.08],m.char);if(ob.id==='desk'||ob.id==='dresser'){box([mx,ob.top-.26,c+.22],[b-a-.2,.27,.4],m.char);box([mx,ob.top-.26,c-.015],[.22,.035,.04],m.brass);}}

 }
 activeParent=root;
 // Window has an opaque boarded backing, never an exterior panorama.
 box([x1+.03,f+1.9,z1+.8],[.06,1.1,.8],m.black);for(let n=0;n<5;n++)box([x1+.08,f+1.45+n*.22,z1+.8],[.08,.13,.9],m.wood);
 if(room==='A')box([7.1,1.68,5.59],[2.6,.72,.18],m.char);
 let basketStop=null;let cabinet=null;if(room==='D')box([13.2,-1.3,14.04],[1.35,2.2,.07],m.char);
 for(const w of Object.values(WORLD).filter(w=>w.room===room)){
  const g=detailedProp(w,m,track,loader,asset,onAssetError);g.position.set(...w.pos);root.add(g);objects[w.id]=g;if(w.kind==='cabinet')cabinet=g;
 }
 // Visible load paths and support surfaces are part of the same closed room model.
 if(room==='A'){for(const [x,y] of [[6.5,1.9],[7,2.08]]){box([x,y,5.76],[.12,.08,.16],m.brass);}}
 if(room==='B'){box([12.85,1.86,6.8],[.07,.04,.05],m.wood);cylinder([12.85,1.86,6.8],.008,1.6,m.fabric,root,[0,0,Math.PI/2]);for(const x of [12.05,13.65])box([x,1.86,6.65],[.035,.08,.35],m.metal);}
 if(room==='C'){for(const x of [-1.1,-.34])box([x,1.8,13.94],[.045,2.7,.045],m.metal);basketStop=box([-.8,.725,15.7],[.6,.55,.5],m.char);basketStop.userData.dynamic=true;for(const [x,y,z] of [[-1.4,2.7,14.1],[.3,2.8,14.1],[-2.3,2.1,15.7],[-4.6,2.2,16.8]])box([x,(.45+y)/2,z-.1],[.1,y-.45+.3,.12],m.char);}
 root.updateMatrixWorld(true);const buckets=new Map(),remove=[];root.traverse(o=>{if(!o.isMesh)return;for(let p=o.parent;p&&p!==root;p=p.parent)if(p.userData.dynamic)return;const clone=o.geometry.clone().applyMatrix4(o.matrixWorld),geo=clone.index?clone.toNonIndexed():clone;if(geo!==clone)clone.dispose();if(!buckets.has(o.material.uuid))buckets.set(o.material.uuid,{mat:o.material,geos:[]});buckets.get(o.material.uuid).geos.push(geo);remove.push(o);});for(const o of remove)o.removeFromParent();for(const {mat,geos} of buckets.values()){const geo=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());track.geometries.push(geo);const o=new THREE.Mesh(geo,mat);o.castShadow=true;o.receiveShadow=true;root.add(o);}
 const ropeGroup=new THREE.Group();root.add(ropeGroup);let previous='';
 function sync(state){if(basketStop)basketStop.visible=!state.puzzleState.C.hatchRaised;for(const [id,g] of Object.entries(objects)){const o=state.objects[id],w=WORLD[id];if(id==='b-f31')g.rotation.x=o.container==='strip'?-Math.PI/2:0;g.visible=(o.container==='world'||['basket','pan','strip','board'].includes(o.container))&&(!w.behind||state.objects[w.behind].opened);if(o.container==='world')g.position.set(...w.pos);if(['basket','pan'].includes(o.container)){const ids=Object.keys(objects).filter(id=>state.objects[id].container===o.container),slot=ids.indexOf(id),base=o.container==='basket'?objects['c-basket'].position:objects['c-pan'].position;const support=base.y+(o.container==='basket'?-.249:-.0079),stack=ids.slice(0,slot).filter((_,i)=>i%2===slot%2).reduce((n,id)=>n+WORLD[id].size[1],0);g.position.set(base.x+(slot%2?-.135:.135),support+w.size[1]/2+stack,base.z);}if(o.container==='strip'){const slot=state.puzzleState.B.strip.indexOf(id);g.position.set(11.15+slot*.32,.94+(id==='b-f31'?w.size[2]:w.size[1])/2,7.65);}if(o.container==='board'){const slot=state.puzzleState.D.pages.indexOf(id);g.position.set(10.3,-1.45+.035+w.size[1]/2+slot*.015,16.25);}if(w.kind==='box'&&o.opened)g.position.z=w.pos[2]-.55;if(w.kind==='drawers'){g.userData.upper.position.z=state.puzzleState.D.upperOpened?.25:0;g.userData.lower.position.z=state.puzzleState.D.lowerOpened?.25:0;}if(w.kind==='reader')g.userData.lower.position.z=state.puzzleState.B.originalOpened?.25:0;if(w.kind==='hook')g.position.y=w.pos[1]+(state.puzzleState.A.hooks[w.index]==='lift'?.1:0);if(w.kind==='panel')g.position.y=w.pos[1]-(state.puzzleState.A.panel?w.pos[1]-w.size[1]/2:0);if(w.kind==='panel')g.position.z=w.pos[2]+(state.puzzleState.A.latch?.045:0);if(w.node==='M')g.position.y=w.pos[1]+(state.puzzleState.C.hatchRaised?.6:0);if(w.kind==='hatch')g.position.y=w.pos[1]+(state.puzzleState.C.hatchRaised?.6:0);if(w.kind==='basket')g.position.y=w.pos[1]-(state.puzzleState.C.hatchRaised?.55:0);}
 if(room==='D')cabinet.position.set(state.cabinetMoved?11.2:13,-1.88,state.cabinetMoved?14.91:16.6);
 if(room==='C'){const p=state.puzzleState.C,key=p.route.join(',')+p.hatchRaised;if(key!==previous){previous=key;for(const child of [...ropeGroup.children]){child.geometry.dispose();ropeGroup.remove(child);}if(p.route.length>1){const nodes={A0:'c-a0',M:'c-m',F:'c-f',B:'c-basket',OLD:'c-oldhook',RING:'c-ring'},pts=p.route.map(n=>objects[nodes[n]].position.clone()),curve=new THREE.CurvePath();for(let i=1;i<pts.length;i++)curve.add(new THREE.LineCurve3(pts[i-1],pts[i]));const geo=new THREE.TubeGeometry(curve,Math.max(8,pts.length*8),.018,5,false);track.geometries.push(geo);ropeGroup.add(new THREE.Mesh(geo,m.fabric));}}}
 }
 return {root,dynamics:{cabinet},sync,objects,fixtures};
}
