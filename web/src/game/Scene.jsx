import {useEffect,useRef,useState} from 'react';
import * as THREE from 'three';
import {ROOMS,EVIDENCE,PUZZLE_TARGETS} from './content.js';
import {totalWeight} from './engine.mjs';
import {SPACE,EYE_HEIGHT,safePosition,movePlayer,visibleTarget} from './space.mjs';
import {makeMaterials,buildRoom} from './roomModels.js';

const OWNERS={desk:'desk',box:'desk','door-sign':'door',camera:'workbench',camp:'records',storage:'storage-crate',grill:'grill',module:'module',medical:'medical',cabinet:'cabinet'};
export default function Scene({room,settings,paused,input,found,onTarget,onReady,onError,onPosition,initialPosition,puzzleState,cabinetMoved,solvedRooms}){
 const container=useRef(),api=useRef(),latest=useRef();const [loading,setLoading]=useState(true);
 latest.current={room,settings,paused,found,onTarget,onReady,onError,onPosition,initialPosition,puzzleState,cabinetMoved,solvedRooms};
 useEffect(()=>{
  setLoading(true);
  const host=container.current,track={geometries:[],materials:[],textures:[]},keys=new Set();let alive=true,failed=false,renderer,observer,ready=false;
  const fail=message=>{if(alive){failed=true;latest.current.onError(message);}};
  try{renderer=new THREE.WebGLRenderer({antialias:settings.quality==='high',powerPreference:'high-performance'});}catch{fail('無法啟動3D繪圖。調查進度仍保留，請重試或更換支援WebGL的瀏覽器。');return;}
  const gl=renderer.getContext(),extension=gl.getExtension('WEBGL_debug_renderer_info'),rendererName=extension?gl.getParameter(extension.UNMASKED_RENDERER_WEBGL):'',software=/swiftshader|llvmpipe|software/i.test(rendererName);
  let ratio=Math.min(devicePixelRatio||1,software?.65:settings.quality==='high'?1.6:settings.quality==='low'?.85:1.2);
  renderer.setPixelRatio(ratio);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.setClearColor('#100f0c');renderer.shadowMap.enabled=!software&&settings.quality!=='low';renderer.shadowMap.type=THREE.PCFSoftShadowMap;
  const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('aria-label','密閉3D調查空間；WASD移動，拖曳環顧，E查看實物');host.append(canvas);
  const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(62,1,.045,35);camera.rotation.order='YXZ';let yaw=0,pitch=0;
  scene.add(new THREE.HemisphereLight('#e5d5b9','#40382b',.85));scene.add(new THREE.AmbientLight('#c9b999',.25));
  const lamp=new THREE.PointLight('#ffd39b',32,16,1.55);lamp.castShadow=renderer.shadowMap.enabled;lamp.shadow.mapSize.set(1024,1024);lamp.shadow.bias=-.001;lamp.shadow.normalBias=.035;scene.add(lamp);
  const flashlight=new THREE.SpotLight('#f2dcb5',32,9,.6,.65,1.3);scene.add(flashlight,flashlight.target);
  const fill=new THREE.PointLight('#ad997a',5,12,1.7);scene.add(fill);
  const manager=new THREE.LoadingManager();manager.onError=()=>fail('場景中的圖片或材質未能載入。請重新載入場景，避免缺少關鍵線索。');
  const loader=new THREE.TextureLoader(manager),safeLoader={load:(url,ok,progress,error)=>loader.load(url,t=>{if(!alive){t.dispose();return;}ok(t);},progress,error)};
  const mats=makeMaterials(track,safeLoader,{bump:!software&&settings.quality!=='low',anisotropy:software?1:4}),rooms={};
  for(const r of Object.keys(SPACE)){rooms[r]=buildRoom(r,mats,track,safeLoader,()=>fail('證物圖片未能載入，請重新載入場景。'));rooms[r].root.visible=r===latest.current.room;scene.add(rooms[r].root);}
  // Markers are small highlights attached to real objects; they never render through walls.
  const markerGeo=new THREE.SphereGeometry(.022,8,6),markerMat=new THREE.MeshStandardMaterial({color:'#e5c282',emissive:'#b38b40',emissiveIntensity:.6});track.geometries.push(markerGeo);track.materials.push(markerMat);const markers=[];
  for(const [id,item] of Object.entries(EVIDENCE)){const mark=new THREE.Mesh(markerGeo,markerMat);mark.position.set(...item.pos);mark.userData={id,room:item.room};scene.add(mark);markers.push(mark);}
  const changeRoom=r=>{const state=latest.current,s=SPACE[r],p=safePosition(r,state.initialPosition,{cabinetMoved:state.cabinetMoved});camera.position.set(p.x,s.floor+EYE_HEIGHT,p.z);const direction=new THREE.Vector3(...ROOMS[r].look).sub(camera.position).normalize();yaw=Math.atan2(-direction.x,-direction.z);pitch=Math.asin(direction.y);camera.rotation.set(pitch,yaw,0);for(const [id,data] of Object.entries(rooms))data.root.visible=id===r;const [a,b,c,d]=s.bounds;lamp.position.set((a+b)/2,s.floor+s.height-.55,(c+d)/2);lamp.color.set({A:'#ffd39b',B:'#e5ad97',C:'#efc28f',D:'#d0d8c6'}[r]);fill.position.set(p.x,s.floor+1.3,p.z);keys.clear();latest.current.onTarget(null);};
  api.current={changeRoom};changeRoom(latest.current.room);
  manager.onLoad=()=>{if(!alive||failed)return;renderer.compileAsync(scene,camera).then(()=>{if(!alive||failed)return;ready=true;setLoading(false);latest.current.onReady();renderer.render(scene,camera);}).catch(()=>fail('場景準備失敗，請降低畫質後重試。'));};
  observer=new ResizeObserver(()=>{const w=host.clientWidth,h=host.clientHeight;if(w&&h){renderer.setSize(w,h);camera.aspect=w/h;camera.updateProjectionMatrix();if(ready)renderer.render(scene,camera);}});observer.observe(host);
  const drag={down:false,x:0,y:0};
  const pointerDown=e=>{if(latest.current.paused)return;canvas.focus({preventScroll:true});drag.down=true;drag.x=e.clientX;drag.y=e.clientY;canvas.setPointerCapture(e.pointerId);};
  const pointerMove=e=>{if(!drag.down||latest.current.paused)return;const sens=latest.current.settings.sensitivity; yaw-=(e.clientX-drag.x)*.0036*sens;pitch=THREE.MathUtils.clamp(pitch-(e.clientY-drag.y)*.0036*sens,-1.25,1.25);drag.x=e.clientX;drag.y=e.clientY;};
  const pointerUp=()=>{drag.down=false;};
  const keyDown=e=>{if(latest.current.paused||e.target.matches('input,select,textarea'))return;if(['KeyW','KeyA','KeyS','KeyD','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code)){e.preventDefault();keys.add(e.code);}};
  const keyUp=e=>keys.delete(e.code),blur=()=>{keys.clear();drag.down=false;input.current={x:0,y:0};};
  const lost=e=>{e.preventDefault();fail('3D繪圖已中斷。調查進度仍保留，請重新載入場景。');};
  canvas.addEventListener('pointerdown',pointerDown);canvas.addEventListener('pointermove',pointerMove);canvas.addEventListener('pointerup',pointerUp);canvas.addEventListener('pointercancel',pointerUp);canvas.addEventListener('webglcontextlost',lost);window.addEventListener('keydown',keyDown);window.addEventListener('keyup',keyUp);window.addEventListener('blur',blur);
  let last=performance.now(),sampleStart=last,frames=0,slow=0,lastTarget='',lastInspect=0,lastState=null;const forward=new THREE.Vector3();
  const syncModels=state=>{if(lastState&&lastState.puzzles===state.puzzleState&&lastState.cabinet===state.cabinetMoved&&lastState.solved===state.solvedRooms&&lastState.lang===state.settings.lang)return;lastState={puzzles:state.puzzleState,cabinet:state.cabinetMoved,solved:state.solvedRooms,lang:state.settings.lang};
   const a=rooms.A.dynamics.lock;if(a){a.lid.rotation.x=state.solvedRooms?.includes('A')?-.95:0;a.labels.forEach((o,i)=>o.userData.setText(String(state.puzzleState?.A?.digits[i]||0)));}
   for(const photo of rooms.B.dynamics.photos){const map=state.puzzleState?.B?.confirmed[photo.userData.photoIndex]?photo.userData.picture:null;if(photo.material.map!==map){photo.material.map=map;photo.material.color.set(map?'#ffffff':'#ded5bb');photo.material.needsUpdate=true;}}
   const placed=state.puzzleState?.C?.placed||[],all=rooms.C.dynamics;for(const [i,g] of all.weights.entries()){g.position.set(...(placed.includes(g.name)?[-.72+(i%4)*.48,i<2?1.835:1.77,12.92+Math.floor(i/4)*.44]:[3.05+(i%2)*.65,i<2?1.155:1.09,12.85+Math.floor(i/2)*.4]));}
   all.historyReadout.userData.setText(state.settings.lang==='en'?'HISTORY 65.0':'歷史 65.0');all.currentReadout.userData.setText((state.settings.lang==='en'?'NET ':'即時 ')+totalWeight(placed).toFixed(1));const unlocked=state.puzzleState?.C?.completedAtLoad===65;all.hatch.position.x=unlocked?.66:0;all.rewards.visible=unlocked;
   rooms.D.dynamics.cabinet.position.set(state.cabinetMoved?11.2:13,-1.88,state.cabinetMoved?14.91:16.6);
  };
  renderer.setAnimationLoop(now=>{
   const state=latest.current,dt=Math.min((now-last)/1000,.06);last=now;if(!alive||!ready)return;
   syncModels(state);if(state.paused||document.hidden){keys.clear();frames=0;sampleStart=now;return;}
   const ix=(keys.has('KeyD')||keys.has('ArrowRight')?1:0)-(keys.has('KeyA')||keys.has('ArrowLeft')?1:0)+(input.current?.x||0),iz=(keys.has('KeyW')||keys.has('ArrowUp')?1:0)-(keys.has('KeyS')||keys.has('ArrowDown')?1:0)-(input.current?.y||0),norm=Math.max(1,Math.hypot(ix,iz));
   const p=movePlayer(state.room,{x:camera.position.x,z:camera.position.z},(Math.cos(yaw)*ix-Math.sin(yaw)*iz)/norm*dt*1.85,(-Math.sin(yaw)*ix-Math.cos(yaw)*iz)/norm*dt*1.85,{cabinetMoved:state.cabinetMoved});
   camera.position.set(p.x,SPACE[state.room].floor+EYE_HEIGHT,p.z);camera.rotation.set(pitch,yaw,0);camera.getWorldDirection(forward);flashlight.position.copy(camera.position);flashlight.target.position.copy(camera.position).addScaledVector(forward,4);renderer.toneMappingExposure=state.settings.brightness;
   if(now-lastInspect>120){lastInspect=now;const eye=camera.position.toArray();let target=null,best=Infinity;for(const [id,item] of Object.entries({...EVIDENCE,...PUZZLE_TARGETS})){if(item.room!==state.room)continue;const v=new THREE.Vector3(...item.pos).sub(camera.position),distance=v.length();if(distance>2.65||v.normalize().dot(forward)<.77||!visibleTarget(state.room,eye,item.pos,OWNERS[id],{cabinetMoved:state.cabinetMoved}))continue;const score=distance*.18+(1-v.dot(forward))*5;if(score<best){best=score;target=id;}}
    for(const marker of markers){const id=marker.userData.id;marker.visible=marker.userData.room===state.room&&!state.found.includes(id)&&visibleTarget(state.room,eye,marker.position.toArray(),OWNERS[id],{cabinetMoved:state.cabinetMoved});}
    if((target||'')!==lastTarget){lastTarget=target||'';state.onTarget(target);}
    const diag=window.__EMBERS_DIAGNOSTICS__||{samples:[]};diag.camera={x:+p.x.toFixed(3),y:camera.position.y,z:+p.z.toFixed(3)};diag.yaw=yaw;diag.pitch=pitch;diag.collisionVersion=6;diag.room=state.room;window.__EMBERS_DIAGNOSTICS__=diag;
   }
   renderer.render(scene,camera);frames++;
   if(now-sampleStart>=1000){const fps=frames*1000/(now-sampleStart),diag=window.__EMBERS_DIAGNOSTICS__||{samples:[]};diag.samples.push({room:state.room,fps:+fps.toFixed(1),drawCalls:renderer.info.render.calls,triangles:renderer.info.render.triangles,pixelRatio:renderer.getPixelRatio(),renderer:rendererName,software});diag.samples=diag.samples.slice(-120);window.__EMBERS_DIAGNOSTICS__=diag;state.onPosition({...diag.camera});if(fps<27)slow++;else slow=Math.max(0,slow-1);if(slow>=3&&ratio>.55){ratio=Math.max(.55,ratio-.1);renderer.setPixelRatio(ratio);renderer.shadowMap.enabled=false;slow=0;}sampleStart=now;frames=0;}
  });
  return()=>{alive=false;api.current=null;renderer.setAnimationLoop(null);observer.disconnect();canvas.removeEventListener('pointerdown',pointerDown);canvas.removeEventListener('pointermove',pointerMove);canvas.removeEventListener('pointerup',pointerUp);canvas.removeEventListener('pointercancel',pointerUp);canvas.removeEventListener('webglcontextlost',lost);window.removeEventListener('keydown',keyDown);window.removeEventListener('keyup',keyUp);window.removeEventListener('blur',blur);for(const g of new Set(track.geometries))g.dispose();for(const m of new Set(track.materials))m.dispose();for(const t of new Set(track.textures))t.dispose();renderer.dispose();canvas.remove();};
 },[settings.quality]);
 useEffect(()=>{api.current?.changeRoom(room);},[room]);
 return <div className="scene" ref={container} data-testid="scene"><span className="sr-only">{ROOMS[room].name}：不透明封閉房間與實體道具</span>{loading&&<div className="scene-loading"><span className="loading-line"/><p>{settings.lang==='en'?'Preparing the enclosed investigation room…':'正在準備密閉調查空間…'}</p></div>}</div>;
}
