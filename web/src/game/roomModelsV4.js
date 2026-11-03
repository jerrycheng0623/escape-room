import * as THREE from 'three';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {SPACE} from './space.mjs';
import {WORLD} from './world.mjs';
import {asset} from './content.js';
export {makeMaterials} from './roomModels.js';
export function buildRoom(room,m,track,loader,onAssetError){
 const root=new THREE.Group(),s=SPACE[room],objects={},[x1,x2,z1,z2]=s.bounds,f=s.floor,h=s.height,cx=(x1+x2)/2,cz=(z1+z2)/2;
 root.name='封閉調查區_v4_'+room;
 const mesh=(geo,mat,pos,parent=root,rot=[0,0,0])=>{track.geometries.push(geo);const o=new THREE.Mesh(geo,mat);o.position.set(...pos);o.rotation.set(...rot);o.castShadow=true;o.receiveShadow=true;parent.add(o);return o;};
 const box=(pos,size,mat=m.wood,parent=root)=>mesh(new THREE.BoxGeometry(...size),mat,pos,parent);
 const cylinder=(pos,r,len,mat=m.metal,parent=root,rot=[0,0,0])=>mesh(new THREE.CylinderGeometry(r,r,len,12),mat,pos,parent,rot);
 const ring=(pos,r,parent=root,rot=[Math.PI/2,0,0])=>mesh(new THREE.TorusGeometry(r,.012,6,18),m.brass,pos,parent,rot);
 box([cx,f-.13,cz],[x2-x1+.4,.26,z2-z1+.4],m.floor);box([cx,f+h+.1,cz],[x2-x1+.4,.2,z2-z1+.4],m.char);
 for(const x of [x1-.12,x2+.12])box([x,f+h/2,cz],[.24,h,z2-z1+.48],m.wall);
 for(const z of [z1-.12,z2+.12])box([cx,f+h/2,z],[x2-x1,h,.24],m.wall);
 for(let x=x1+.3;x<x2;x+=1.15)box([x,f+h-.16,cz],[.16,.25,z2-z1],m.char);
 for(const z of [z1+.03,z2-.03]){box([cx,f+.12,z],[x2-x1,.2,.06],m.char);box([cx,f+.96,z],[x2-x1,.07,.08],m.wood);}
 const [doorX,doorZ]=s.door;box([doorX,f+1.1,doorZ],[.95,2.2,.06],m.char);cylinder([doorX+.3,f+1.05,doorZ+(doorZ>cz?-.05:.05)],.035,.08,m.brass,root,[Math.PI/2,0,0]);
 // Solid furnishings use exactly the shared collision footprints.
 for(const ob of s.obstacles){if(ob.id.startsWith('world-'))continue;const [a,b,c,d]=ob.box;if(ob.id==='cabinet')continue;const height=ob.top-f;if(/divider|return|recess/.test(ob.id)){box([(a+b)/2,f+height/2,(c+d)/2],[b-a,height,d-c],m.wall);continue;}
  if(/desk|workbench|records|medical|rack/.test(ob.id)){box([(a+b)/2,ob.top-.06,(c+d)/2],[b-a,.12,d-c],m.wood);for(const x of [a+.08,b-.08])for(const z of [c+.08,d-.08])box([x,f+(height-.12)/2,z],[.08,height-.12,.08],m.char);}
  else box([(a+b)/2,f+height/2,(c+d)/2],[b-a,height,d-c],ob.id==='bed'?m.fabric:m.char);
 }
 // Window has an opaque boarded backing, never an exterior panorama.
 box([x1+.03,f+1.9,z1+.8],[.06,1.1,.8],m.black);for(let n=0;n<5;n++)box([x1+.08,f+1.45+n*.22,z1+.8],[.08,.13,.9],m.wood);
 if(room==='A')box([7.1,1.45,5.685],[2.28,.36,.015],m.black);
 const cabinet=new THREE.Group();cabinet.userData.dynamic=true;if(room==='D'){root.add(cabinet);cabinet.position.set(13,-1.88,16.6);box([0,0,0],[1.8,1.04,1.12],m.metal,cabinet);for(let i=0;i<3;i++)box([-.58+i*.58,.03,.574],[.54,.88,.025],m.rust,cabinet);box([13.2,-1.3,14.04],[1.35,2.2,.07],m.char);}
 for(const w of Object.values(WORLD).filter(w=>w.room===room)){
  const g=new THREE.Group();g.name=w.id;g.userData.dynamic=true;g.position.set(...w.pos);root.add(g);objects[w.id]=g;
  if(['paper','film','record'].includes(w.kind)){
   box([0,-.008,0],[w.kind==='film'?.3:.29,.012,w.kind==='film'?.21:.23],w.kind==='film'?m.black:m.paper,g);
   const mat=new THREE.MeshStandardMaterial({color:'#d6c8a7',roughness:.9,side:THREE.DoubleSide});track.materials.push(mat);mesh(new THREE.PlaneGeometry(w.kind==='film'?.3:.29,w.kind==='film'?.21:.23),mat,[0,.002,0],g,[-Math.PI/2,0,0]);
   loader.load(asset('media/world-v4/'+w.id+'.svg'),t=>{t.colorSpace=THREE.SRGBColorSpace;track.textures.push(t);mat.map=t;mat.color.set('#ffffff');mat.needsUpdate=true;},undefined,onAssetError);
  }else if(w.kind==='hook'){box([0,0,0],[.12,.25,.04],m.wood,g);ring([0,-.04,.07],.055,g,[0,Math.PI/2,0]);}
  else if(w.kind==='panel'){box([0,0,0],[2.45,.46,.035],m.wood,g);}
  else if(w.kind==='anchor'){if(['M','F'].includes(w.node)){ring([0,0,0],.13,g,[0,0,0]);cylinder([0,0,0],.04,.07,m.metal,g,[Math.PI/2,0,0]);}else{box([0,0,0],[.17,.24,.045],m.rust,g);for(const by of w.node==='A0'?[-.075,.075]:[.075])cylinder([0,by,.03],.018,.025,m.brass,g,[Math.PI/2,0,0]);ring([0,0,.08],.07,g,[0,Math.PI/2,0]);}}
  else if(w.kind==='weight'){box([0,0,0],[.24,.18,.23],w.kg===10?m.fabric:w.kg===5?m.stone:w.kg===15?m.wood:m.metal,g);ring([0,.13,0],.05,g);}
  else if(w.kind==='rope'){const pts=[];for(let i=0;i<=64;i++){const t=i/64*Math.PI*6;pts.push(new THREE.Vector3(Math.cos(t)*(.07+i*.001),i*.001,Math.sin(t)*(.07+i*.001)));}mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),64,.014,5,false),m.fabric,[0,0,0],g);}
  else if(w.kind==='basket'){box([0,-.13,0],[.55,.045,.45],m.metal,g);for(const x of [-.26,.26])box([x,0,0],[.02,.3,.45],m.metal,g);for(const z of [-.21,.21])box([0,0,z],[.55,.3,.025],m.rust,g);ring([0,.4,0],.045,g);}
  else if(w.kind==='tool'){cylinder([0,0,0],.014,.22,m.brass,g,[0,0,Math.PI/2]);}
  else if(w.kind==='board'){box([0,0,0],[.58,.035,.4],m.wood,g);for(let i=0;i<6;i++)cylinder([-.18+i%3*.18,.023,-.1+Math.floor(i/3)*.2],.018,.006,m.black,g);}
  else if(w.kind==='drawers'||w.kind==='reader'||w.kind==='luggage'){box([0,-.06,0],[.55,.3,.38],m.metal,g);for(const y of [-.13,0]){const tray=new THREE.Group();g.add(tray);box([0,y,.2],[.5,.12,.025],m.char,tray);ring([0,y,.23],.035,tray,[0,0,0]);if(y<0)g.userData.lower=tray;else g.userData.upper=tray;}}
  else if(w.kind==='hatch'){box([0,0,0],[.7,.12,.45],m.rust,g);ring([.42,.04,.04],.12,g,[0,0,0]);}
  else if(w.kind==='pan'){box([0,0,0],[.6,.035,.45],m.metal,g);}
  else if(w.kind!=='cabinet'){box([0,0,0],[.15,.12,.15],w.kind==='small'?m.fabric:m.wood,g);}
 }
 root.updateMatrixWorld(true);const buckets=new Map(),remove=[];root.traverse(o=>{if(!o.isMesh)return;for(let p=o.parent;p&&p!==root;p=p.parent)if(p.userData.dynamic)return;const clone=o.geometry.clone().applyMatrix4(o.matrixWorld),geo=clone.index?clone.toNonIndexed():clone;if(geo!==clone)clone.dispose();if(!buckets.has(o.material.uuid))buckets.set(o.material.uuid,{mat:o.material,geos:[]});buckets.get(o.material.uuid).geos.push(geo);remove.push(o);});for(const o of remove)o.removeFromParent();for(const {mat,geos} of buckets.values()){const geo=mergeGeometries(geos,false);geos.forEach(g=>g.dispose());track.geometries.push(geo);const o=new THREE.Mesh(geo,mat);o.castShadow=true;o.receiveShadow=true;root.add(o);}
 const ropeGroup=new THREE.Group();root.add(ropeGroup);let previous='';
 function sync(state){for(const [id,g] of Object.entries(objects)){const o=state.objects[id],w=WORLD[id];g.visible=(o.container==='world'||['basket','pan','strip','board'].includes(o.container))&&(!w.behind||state.objects[w.behind].opened);if(o.container==='world')g.position.set(...w.pos);if(['basket','pan'].includes(o.container)){const ids=Object.keys(objects).filter(id=>state.objects[id].container===o.container),slot=ids.indexOf(id),base=o.container==='basket'?objects['c-basket'].position:objects['c-pan'].position;g.position.set(base.x+(slot%2?-.12:.12),base.y+(o.container==='basket'?-.04:.12)+Math.floor(slot/2)*.2,base.z);}if(o.container==='strip'){const slot=state.puzzleState.B.strip.indexOf(id);g.position.set(11.15+slot*.14,1.15,7.3);}if(o.container==='board'){const slot=state.puzzleState.D.pages.indexOf(id);g.position.set(10.3,-1.265+slot*.003,16.3);}if(w.kind==='drawers'){g.userData.upper.position.z=state.puzzleState.D.upperOpened?.25:0;g.userData.lower.position.z=state.puzzleState.D.lowerOpened?.25:0;}if(w.kind==='reader')g.userData.lower.position.z=state.puzzleState.B.originalOpened?.25:0;if(w.kind==='hook')g.position.y=w.pos[1]+(state.puzzleState.A.hooks[w.index]==='lift'?.1:0);if(w.kind==='panel')g.position.y=w.pos[1]-(state.puzzleState.A.panel?1.15:0);if(w.kind==='panel')g.position.z=w.pos[2]+(state.puzzleState.A.latch?.045:0);if(w.node==='M')g.position.y=w.pos[1]+(state.puzzleState.C.hatchRaised?.6:0);if(w.kind==='hatch')g.position.y=w.pos[1]+(state.puzzleState.C.hatchRaised?.6:0);if(w.kind==='basket')g.position.y=w.pos[1]-(state.puzzleState.C.hatchRaised?.55:0);}
 if(room==='D')cabinet.position.set(state.cabinetMoved?11.2:13,-1.88,state.cabinetMoved?14.91:16.6);
 if(room==='C'){const p=state.puzzleState.C,key=p.route.join(',')+p.hatchRaised;if(key!==previous){previous=key;for(const child of [...ropeGroup.children]){child.geometry.dispose();ropeGroup.remove(child);}if(p.route.length>1){const nodes={A0:'c-a0',M:'c-m',F:'c-f',B:'c-basket',OLD:'c-oldhook',RING:'c-ring'},pts=p.route.map(n=>objects[nodes[n]].position.clone()),geo=new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts),40,.018,5,false);track.geometries.push(geo);ropeGroup.add(new THREE.Mesh(geo,m.fabric));}}}
 }
 return {root,dynamics:{cabinet},sync,objects};
}
