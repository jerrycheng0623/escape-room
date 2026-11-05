export function mobileTools(p,cdp){
 const points=new Map();
 const touchPoint=(id,x,y)=>({id,x,y,radiusX:4,radiusY:4,force:1});
 const send=type=>cdp.send('Input.dispatchTouchEvent',{type,touchPoints:[...points.values()]});
 // WebKit exposes touch taps but no Playwright API for a touch drag.
 // Use the same UI with native mouse pointer drags; this is not a touch gesture test.
 const down=async(id,x,y)=>{if(!cdp){await p.mouse.move(x,y);await p.mouse.down();return;}points.set(id,touchPoint(id,x,y));await send('touchStart')};
 const move=async(id,x,y)=>{if(!cdp){await p.mouse.move(x,y);return;}points.set(id,touchPoint(id,x,y));await send('touchMove')};
 const up=async id=>{if(!cdp){await p.mouse.up();return;}const point=points.get(id);points.delete(id);await cdp.send('Input.dispatchTouchEvent',{type:'touchEnd',touchPoints:point?[point]:[]});};
 const clear=async()=>{if(!cdp){await p.mouse.up();return;}points.clear();await send('touchCancel')};
 const drag=async(x,y,dx,dy,steps=8,id=2)=>{await down(id,x,y);for(let i=1;i<=steps;i++)await move(id,x+dx*i/steps,y+dy*i/steps);await up(id)};
 const tap=async name=>p.getByRole('button',{name,exact:name!=='繼續調查'}).tap();
 const diag=async()=>{const room=(await state()).room;await p.waitForFunction(room=>!!document.querySelector('.scene canvas')&&!document.querySelector('.scene-loading')&&window.__EMBERS_DIAGNOSTICS__?.room===room&&!!window.__EMBERS_DIAGNOSTICS__.camera,room,{timeout:45000});return p.evaluate(()=>window.__EMBERS_DIAGNOSTICS__);};
 const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('embers.investigation.v1')));
 const stick=async(ix,iy,ms)=>{const r=await p.getByRole('group',{name:'移動搖桿'}).boundingBox(),x=r.x+r.width/2,y=r.y+r.height/2;await down(1,x,y);await move(1,x+ix*r.width*.32,y+iy*r.width*.32);await p.waitForTimeout(ms);await up(1);await p.waitForTimeout(140)};
 const moveTo=async(x,z)=>{for(let i=0;i<65;i++){const d=await diag(),dx=x-d.camera.x,dz=z-d.camera.z,dist=Math.hypot(dx,dz);if(dist<.2)return;const ix=Math.cos(d.yaw)*dx-Math.sin(d.yaw)*dz,iz=-Math.sin(d.yaw)*dx-Math.cos(d.yaw)*dz;await stick(ix/dist,-iz/dist,Math.min(400,Math.max(65,dist/1.85*520)));}throw Error('觸控行走無法抵達 '+x+','+z+' '+JSON.stringify((await diag()).camera))};
 const lookAt=async(pos,start=.62)=>{for(let pass=0;pass<14;pass++){const d=await diag(),dx=pos[0]-d.camera.x,dy=pos[1]-d.camera.y,dz=pos[2]-d.camera.z,wanted=Math.atan2(-dx,-dz),pitch=Math.atan2(dy,Math.hypot(dx,dz));let diff=d.yaw-wanted;while(diff>Math.PI)diff-=Math.PI*2;while(diff<-Math.PI)diff+=Math.PI*2;const scale=cdp?Math.PI/Math.max(1000,Math.min(p.viewportSize().width,p.viewportSize().height)*3.2):.0036,mx=Math.max(-210,Math.min(210,diff/scale)),my=Math.max(-70,Math.min(70,(d.pitch-pitch)/(scale*(cdp?.78:1))));if(Math.abs(diff)<.015&&Math.abs(d.pitch-pitch)<.015)break;const v=p.viewportSize();await drag(v.width*start,v.height*.5,mx,my,8);await p.waitForTimeout(180)}};
 const inspect=async(name,pos)=>{await lookAt(pos);await p.getByRole('button',{name:'查看 '+name,exact:false}).tap({timeout:5000})};
 return {down,move,up,clear,drag,tap,diag,state,stick,moveTo,lookAt,inspect};
}
