import {useEffect,useRef,useState} from 'react';
import {PointerOwner,stickVector} from '../game/controls.mjs';
export default function TouchStick({input,disabled=false,resetKey}){
 const ref=useRef(),owner=useRef(new PointerOwner()),[knob,setKnob]=useState({x:0,y:0});
 const reset=()=>{const id=owner.current.id;owner.current.release();input.current={x:0,y:0};setKnob({x:0,y:0});if(id!==null&&ref.current?.hasPointerCapture(id))ref.current.releasePointerCapture(id);};
 useEffect(()=>{if(disabled)reset();},[disabled]);
 useEffect(()=>{reset();},[resetKey]);
 useEffect(()=>{const hidden=()=>{if(document.hidden)reset();};window.addEventListener('blur',reset);window.addEventListener('pagehide',reset);document.addEventListener('visibilitychange',hidden);return()=>{input.current={x:0,y:0};window.removeEventListener('blur',reset);window.removeEventListener('pagehide',reset);document.removeEventListener('visibilitychange',hidden);};},[]);
 const update=e=>{const b=ref.current.getBoundingClientRect(),v=stickVector(e.clientX-b.x-b.width/2,e.clientY-b.y-b.height/2,b.width*.32);input.current={x:v.x,y:v.y};setKnob({x:v.knobX,y:v.knobY});};
 const stop=e=>{e.stopPropagation();if(owner.current.owns(e.pointerId))reset();};
 return <div ref={ref} className="touch-stick" role="group" aria-label="移動搖桿" aria-disabled={disabled} onContextMenu={e=>e.preventDefault()} onPointerDown={e=>{e.preventDefault();e.stopPropagation();if(disabled||!owner.current.claim(e.pointerId))return;e.currentTarget.setPointerCapture(e.pointerId);update(e);}} onPointerMove={e=>{e.stopPropagation();if(!disabled&&owner.current.owns(e.pointerId))update(e);}} onPointerUp={stop} onPointerCancel={stop} onLostPointerCapture={stop}><span style={{transform:`translate(${knob.x}px,${knob.y}px)`}}/><small>移動</small></div>;
}
