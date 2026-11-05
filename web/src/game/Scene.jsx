import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {GLTFLoader} from 'three/addons/loaders/GLTFLoader.js';
import {mergeGeometries} from 'three/addons/utils/BufferGeometryUtils.js';
import {ROOMS,EVIDENCE,PUZZLE_TARGETS,asset} from './content.js';

function surfaceTexture(kind){const c=document.createElement('canvas');c.width=c.height=128;const ctx=c.getContext('2d'),im=ctx.createImageData(128,128);let seed=1129;const rand=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296;};for(let y=0;y<128;y++)for(let x=0;x<128;x++){const n=rand()*22+(kind==='wood'?9*Math.sin(x*.42+Math.sin(y*.08)):4*Math.sin(x*.13)*Math.cos(y*.13));const i=(y*128+x)*4;im.data[i]=kind==='wood'?42+n:47+n;im.data[i+1]=kind==='wood'?32+n*.7:45+n*.8;im.data[i+2]=kind==='wood'?25+n*.5:42+n*.7;im.data[i+3]=255;}ctx.putImageData(im,0,0);const t=new THREE.CanvasTexture(c);t.wrapS=t.wrapT=THREE.RepeatWrapping;t.colorSpace=THREE.SRGBColorSpace;t.anisotropy=2;return t;}
function addUV(g){const p=g.getAttribute('position'),n=g.getAttribute('normal'),uv=new Float32Array(p.count*2);for(let i=0;i<p.count;i++){uv[i*2]=p.getX(i)*1.5;uv[i*2+1]=(Math.abs(n.getY(i))>.5?p.getZ(i):p.getY(i))*1.5;}g.setAttribute('uv',new THREE.BufferAttribute(uv,2));return g;}
export default function Scene({room,settings,paused,input,found,onTarget,onReady,onError,onPosition,initialPosition}){
 const container=useRef(),api=useRef(null),latest=useRef();latest.current={room,settings,paused,found,onTarget,onReady,onError,onPosition,initialPosition};const [loading,setLoading]=useState(true);
 useEffect(()=>{
  const el=container.current;let alive=true,renderer,resize,loadedRoot;const geometries=[],materials=[],textures=[],keys=new Set();const pstate={down:false,x:0,y:0,drag:0,pointer:null};
  try{renderer=new THREE.WebGLRenderer({antialias:settings.quality==='high',alpha:false,powerPreference:'high-performance'});}catch(error){onError('這個瀏覽器目前無法啟動3D畫面。可更換瀏覽器，或先查看調查檔案。');return;}
  renderer.setClearColor('#0b1016');renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;
  const gl=renderer.getContext(),debug=gl.getExtension('WEBGL_debug_renderer_info');const rendererName=debug?gl.getParameter(debug.UNMASKED_RENDERER_WEBGL):'';const software=/swiftshader|llvmpipe|software/i.test(rendererName);let pixelRatio=Math.min(window.devicePixelRatio||1,software?.65:settings.quality==='high'?1.75:settings.quality==='low'?1:1.35);renderer.setPixelRatio(pixelRatio);renderer.shadowMap.enabled=settings.quality==='high'&&!software;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  el.appendChild(renderer.domElement);renderer.domElement.tabIndex=0;renderer.domElement.setAttribute('aria-label','3D探索場景；WASD移動，拖曳環顧，E調查');
  const scene=new THREE.Scene();scene.fog=new THREE.FogExp2('#0c121a',.035);const camera=new THREE.PerspectiveCamera(65,1,.06,110);camera.rotation.order='YXZ';let yaw=0,pitch=0;
  const teleport=(r)=>{const d=ROOMS[r];camera.position.set(...d.spawn);const saved=latest.current.initialPosition;if(r==='A'&&saved&&Number.isFinite(saved.x)&&Number.isFinite(saved.z)){camera.position.x=THREE.MathUtils.clamp(saved.x,d.bounds[0],d.bounds[1]);camera.position.z=THREE.MathUtils.clamp(saved.z,d.bounds[2],d.bounds[3]);}const direction=new THREE.Vector3(...d.look).sub(camera.position).normalize();yaw=Math.atan2(-direction.x,-direction.z);pitch=Math.asin(direction.y);camera.rotation.set(pitch,yaw,0);keys.clear();};teleport(latest.current.room);api.current={teleport};
  const hemi=new THREE.HemisphereLight('#b4cce4','#34251b',1.1);scene.add(hemi);
  const moon=new THREE.DirectionalLight('#a5bddb',2.2);moon.position.set(4,14,-4);moon.castShadow=renderer.shadowMap.enabled;moon.shadow.mapSize.set(1024,1024);moon.shadow.camera.left=-20;moon.shadow.camera.right=20;moon.shadow.camera.top=25;moon.shadow.camera.bottom=-25;moon.shadow.bias=-.002;scene.add(moon);
  const torch=new THREE.SpotLight('#ffe1b2',26,15,.65,.72,1.25);torch.castShadow=false;scene.add(torch);scene.add(torch.target);
  const roomLamp=new THREE.PointLight('#cfa16d',5,8,1.5);scene.add(roomLamp);const lamps={A:[[7,2.4,6.7],'#d1a26d'],B:[[12,2,8],'#b51b26'],C:[[0,2.4,15],'#8babc8'],D:[[11,-.4,17],'#8ba9d5']};
  const wood=surfaceTexture('wood'),metal=surfaceTexture('metal');textures.push(wood,metal);
  const wallMat=new THREE.MeshStandardMaterial({color:'#77736b',map:wood,roughness:1});materials.push(wallMat);
  const shell=new THREE.Group();scene.add(shell);
  const box=(name,p,s,mat=wallMat)=>{const geo=new THREE.BoxGeometry(...s);geometries.push(geo);const mesh=new THREE.Mesh(geo,mat);mesh.name=name;mesh.position.set(...p);mesh.castShadow=true;mesh.receiveShadow=true;shell.add(mesh);return mesh;};
  // 以現有配置為基準補上可讀的殘牆與樑；不以平面圖片冒充可走動3D。
  for(const [cx,cy,cz,w,d] of [[6.5,0,8,7,5],[12,0,8,4,3],[11,-2.4,17,8,6]]){
   box('側殘牆',[cx-w/2,cy+1.4,cz],[.13,2.8,d]);box('側殘牆',[cx+w/2,cy+1.4,cz],[.13,2.8,d]);
   if(cy<0)box('地下室實牆',[cx,cy+1.4,cz-d/2],[w,2.8,.15]);else box('窗下牆',[cx,cy+.45,cz-d/2],[w,.9,.13]);box('窗上樑',[cx,cy+2.65,cz-d/2],[w,.25,.18]);
   for(let a=-1;a<=1;a++)box('窗柱',[cx+a*w*.4,cy+1.7,cz-d/2],[.16,1.6,.2]);
   for(let a=0;a<5;a++)box('焦黑頂樑',[cx-w/2+a*w/4,cy+2.8,cz],[.14,.18,d]);
  }
  box('客房桌面',[7,.8,7],[1.5,.12,.75]);for(const a of [-1,1])for(const b of [-1,1])box('桌腳',[7+a*.62,.38,7+b*.26],[.07,.76,.07]);
  box('暗房工作架',[12,.81,7.8],[2,.12,.65]);
  // Instanced silhouettes and small non-blocking debris keep depth without hundreds of draw calls.
  const trunkGeo=new THREE.CylinderGeometry(.12,.32,9,5),crownGeo=new THREE.ConeGeometry(2.2,8,6),debrisGeo=new THREE.BoxGeometry(1,1,1);geometries.push(trunkGeo,crownGeo,debrisGeo);
  const forestMat=new THREE.MeshStandardMaterial({color:'#111c20',roughness:1}),debrisMat=new THREE.MeshStandardMaterial({color:'#292822',roughness:1,map:wood});materials.push(forestMat,debrisMat);
  const trunks=new THREE.InstancedMesh(trunkGeo,forestMat,90),crowns=new THREE.InstancedMesh(crownGeo,forestMat,90),debris=new THREE.InstancedMesh(debrisGeo,debrisMat,100);const dummy=new THREE.Object3D();
  for(let i=0;i<90;i++){const angle=i*2.399963,rad=26+(i%7)*2;dummy.position.set(8+Math.cos(angle)*rad,3.5,10+Math.sin(angle)*rad);dummy.rotation.set(0,angle,0);dummy.scale.setScalar(.7+(i%4)*.2);dummy.updateMatrix();trunks.setMatrixAt(i,dummy.matrix);dummy.position.y=8;dummy.updateMatrix();crowns.setMatrixAt(i,dummy.matrix);}
  for(let i=0;i<100;i++){const r=Object.values(ROOMS)[i%4],side=i%2;dummy.position.set(side?r.bounds[0]+.15:r.bounds[1]-.15,r.floor+.03,r.bounds[2]+((i*1.713)%1)*(r.bounds[3]-r.bounds[2]));dummy.rotation.set(0,i*.8,0);dummy.scale.set(.08+(i%3)*.05,.06,.18+(i%5)*.05);dummy.updateMatrix();debris.setMatrixAt(i,dummy.matrix);}scene.add(trunks,crowns,debris);
  const photoPlanes=[];let photosLoaded=false;const decorateRoom=r=>{if(r!=='B'||photosLoaded)return;photosLoaded=true;for(const [i,id] of ['first-photo','last-photo'].entries()){new THREE.TextureLoader().load(asset('media/evidence/'+id+'.webp'),tex=>{if(!alive){tex.dispose();return;}tex.colorSpace=THREE.SRGBColorSpace;textures.push(tex);const geo=new THREE.PlaneGeometry(.7,.42),mat=new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide});geometries.push(geo);materials.push(mat);const mesh=new THREE.Mesh(geo,mat);mesh.rotation.x=-Math.PI/2;mesh.position.set(11.5+i*.9,.9,7.6);scene.add(mesh);photoPlanes.push(mesh);});}};
  const oldTeleport=api.current.teleport;api.current.teleport=r=>{oldTeleport(r);decorateRoom(r);};decorateRoom(latest.current.room);
  const markerMaterial=new THREE.MeshBasicMaterial({color:'#d5ae78',transparent:true,opacity:.8});materials.push(markerMaterial);const markerGeo=new THREE.SphereGeometry(.035,8,6);geometries.push(markerGeo);const markers=[];
  for(const [id,v] of Object.entries(EVIDENCE)){const mesh=new THREE.Mesh(markerGeo,markerMaterial);mesh.position.set(...v.pos);mesh.userData={id,room:v.room};scene.add(mesh);markers.push(mesh);}
  // 同材質靜態幾何合批，降低現有灰盒數百部件造成的draw calls。
  new GLTFLoader().load(asset('media/scene.glb'),gltf=>{
   if(!alive){gltf.scene.traverse(o=>{o.geometry?.dispose();if(o.material)for(const m of Array.isArray(o.material)?o.material:[o.material])m.dispose();});return;}
   loadedRoot=gltf.scene;loadedRoot.updateMatrixWorld(true);const buckets=new Map();
   loadedRoot.traverse(o=>{if(!o.isMesh)return;const g=o.geometry.clone().applyMatrix4(o.matrixWorld);if(o.name.startsWith('P001_'))g.translate(0,.85,0);if(o.name.startsWith('P002_'))g.translate(0,.85,0);addUV(g);const mat=o.material;const key=mat.uuid;if(!buckets.has(key))buckets.set(key,{mat,parts:[]});buckets.get(key).parts.push(g);});
   for(const {mat,parts} of buckets.values()){const g=mergeGeometries(parts,false);parts.forEach(x=>x.dispose());if(!g)continue;geometries.push(g);const mm=mat.clone();if(!['glass','light','paper'].includes(mm.name)){mm.map=mm.name==='wood'?wood:metal;mm.color.multiplyScalar(2.1);}mm.roughness=Math.max(.4,mm.roughness||.8);materials.push(mm);const mesh=new THREE.Mesh(g,mm);mesh.receiveShadow=true;mesh.castShadow=true;scene.add(mesh);}
   loadedRoot.traverse(o=>{o.geometry?.dispose();if(o.material)for(const mat of Array.isArray(o.material)?o.material:[o.material])mat.dispose();});
   setLoading(false);latest.current.onReady();renderer.render(scene,camera);
  },undefined,()=>{if(alive)latest.current.onError('場景檔案未能載入。請確認素材已準備，再重試3D畫面。');});
  resize=new ResizeObserver(()=>{const w=el.clientWidth,h=el.clientHeight;if(!w||!h)return;camera.aspect=w/h;camera.updateProjectionMatrix();renderer.setSize(w,h);renderer.render(scene,camera);});resize.observe(el);
  const down=e=>{if(e.target!==renderer.domElement)return;renderer.domElement.focus({preventScroll:true});pstate.down=true;pstate.x=e.clientX;pstate.y=e.clientY;pstate.drag=0;pstate.pointer=e.pointerId;renderer.domElement.setPointerCapture(e.pointerId);};
  const move=e=>{if(!pstate.down||latest.current.paused)return;const dx=e.clientX-pstate.x,dy=e.clientY-pstate.y;pstate.drag+=Math.abs(dx)+Math.abs(dy);yaw-=dx*.004;pitch=THREE.MathUtils.clamp(pitch-dy*.004,-1.15,1.15);pstate.x=e.clientX;pstate.y=e.clientY;};
  const up=()=>{pstate.down=false;};const keydown=e=>{if(latest.current.paused||e.target.matches('input,textarea,select'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}};const keyup=e=>keys.delete(e.code);const blur=()=>{keys.clear();pstate.down=false;input.current={x:0,y:0};};
  renderer.domElement.addEventListener('pointerdown',down);renderer.domElement.addEventListener('pointermove',move);renderer.domElement.addEventListener('pointerup',up);renderer.domElement.addEventListener('pointercancel',up);window.addEventListener('keydown',keydown);window.addEventListener('keyup',keyup);window.addEventListener('blur',blur);
  let last=performance.now(),sampleStart=last,frames=0,slow=0,lastTarget='',lastUpdate=0;const forward=new THREE.Vector3();const obstacles={A:[[7,7,.95,.58],[5.5,9,1.12,.62]],B:[],C:[[0,12.55,.9,.55]],D:[[10,16,.75,.5]]};
  const blocked=(x,z,r)=>(obstacles[r]||[]).some(([ox,oz,w,d])=>Math.abs(x-ox)<w&&Math.abs(z-oz)<d);
  renderer.setAnimationLoop(now=>{
   if(!alive)return;const state=latest.current;const dt=Math.min((now-last)/1000,.05);last=now;
   if(state.paused||document.hidden){keys.clear();frames=0;sampleStart=now;return;}
   const r=ROOMS[state.room];const ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+(input.current?.x||0);const iz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(input.current?.y||0);const len=Math.max(1,Math.hypot(ix,iz)),speed=dt*2.1;
   const nx=THREE.MathUtils.clamp(camera.position.x+(Math.cos(yaw)*ix-Math.sin(yaw)*iz)/len*speed,r.bounds[0],r.bounds[1]);const nz=THREE.MathUtils.clamp(camera.position.z+(-Math.sin(yaw)*ix-Math.cos(yaw)*iz)/len*speed,r.bounds[2],r.bounds[3]);if(!blocked(nx,camera.position.z,state.room))camera.position.x=nx;if(!blocked(camera.position.x,nz,state.room))camera.position.z=nz;
   camera.rotation.set(pitch,yaw,0);camera.position.y=r.floor+1.65;roomLamp.position.set(...lamps[state.room][0]);roomLamp.color.set(lamps[state.room][1]);torch.position.copy(camera.position);camera.getWorldDirection(forward);torch.target.position.copy(camera.position).add(forward.clone().multiplyScalar(6));renderer.toneMappingExposure=state.settings.brightness;
   for(const marker of markers){marker.visible=marker.userData.room===state.room&&!state.found.includes(marker.userData.id);marker.scale.setScalar(state.settings.reducedMotion?1:1+.15*Math.sin(now*.002));}
   if(now-lastUpdate>120){lastUpdate=now;let target=null,best=Infinity;for(const [id,item] of Object.entries({...EVIDENCE,...PUZZLE_TARGETS})){if(item.room!==state.room||state.found.includes(id))continue;const v=new THREE.Vector3(...item.pos).sub(camera.position),distance=v.length(),dot=v.normalize().dot(forward);if(distance<3.5&&dot>.5&&distance<best){target=id;best=distance;}}if((target||'')!==lastTarget){lastTarget=target||'';state.onTarget(target);}}
   renderer.render(scene,camera);frames++;
   if(now-sampleStart>1000){const fps=frames*1000/(now-sampleStart);const diag=window.__EMBERS_DIAGNOSTICS__||{samples:[]};diag.samples.push({fps:+fps.toFixed(1),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pixelRatio:renderer.getPixelRatio(),renderer:rendererName,software,room:state.room});diag.samples=diag.samples.slice(-120);diag.camera={x:+camera.position.x.toFixed(2),y:+camera.position.y.toFixed(2),z:+camera.position.z.toFixed(2)};window.__EMBERS_DIAGNOSTICS__=diag;state.onPosition(diag.camera);if(fps<28)slow++;else slow=Math.max(0,slow-1);if(slow>=2&&pixelRatio>.45){pixelRatio=Math.max(.45,pixelRatio-.15);renderer.setPixelRatio(pixelRatio);renderer.shadowMap.enabled=false;slow=0;}sampleStart=now;frames=0;}
  });
  return()=>{alive=false;api.current=null;renderer.setAnimationLoop(null);resize?.disconnect();renderer.domElement.removeEventListener('pointerdown',down);renderer.domElement.removeEventListener('pointermove',move);renderer.domElement.removeEventListener('pointerup',up);renderer.domElement.removeEventListener('pointercancel',up);window.removeEventListener('keydown',keydown);window.removeEventListener('keyup',keyup);window.removeEventListener('blur',blur);for(const g of new Set(geometries))g.dispose();for(const m of new Set(materials))m.dispose();textures.forEach(t=>t.dispose());renderer.dispose();renderer.domElement.remove();};
 },[settings.quality]);
 useEffect(()=>{api.current?.teleport(room);latest.current.onTarget(null);},[room]);
 return <div className="scene" ref={container} data-testid="scene"><span className="sr-only">{ROOMS[room].name}：第一人稱3D探索</span>{loading&&<div className="scene-loading"><span className="loading-line"/><p>正在走進灰燼裡…</p></div>}</div>;
}
