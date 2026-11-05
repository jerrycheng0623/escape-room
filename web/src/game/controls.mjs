// Geometry-relative analog input; the same owner handles every termination path.
export function stickVector(dx,dy,radius){const length=Math.hypot(dx,dy),raw=Math.min(1,length/Math.max(1,radius)),strength=raw<=.14?0:((raw-.14)/.86)**1.35;return {x:length?dx/length*strength:0,y:length?dy/length*strength:0,knobX:length?dx/length*raw*radius:0,knobY:length?dy/length*raw*radius:0};}
export function lookScale(type,width,height,sensitivity=1){return type==='touch'?Math.PI/Math.max(1000,Math.min(width,height)*3.2)*sensitivity:.0036*sensitivity;}
export class PointerOwner{constructor(){this.id=null;}claim(id){if(this.id!==null)return false;this.id=id;return true;}owns(id){return this.id===id;}release(id){if(id!==undefined&&!this.owns(id))return false;this.id=null;return true;}}
