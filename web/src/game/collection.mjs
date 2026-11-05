// Only owned or explicitly recorded material is listed; observing an object is not collection.
export function collectedEntries(run,world,documents){
 const entries=[],covered=new Set();
 for(const [id,w] of Object.entries(world)){
  const o=run.objects[id];if(!o||!w.portable||!(o.collected||o.container!=='world'))continue;
  const evidence=w.evidence&&documents[w.evidence]?w.evidence:null;
  entries.push({key:'object:'+id,objectId:id,evidenceId:evidence,room:w.room});if(evidence)covered.add(evidence);
 }
 for(const id of run.evidence){const d=documents[id];if(!d||covered.has(id))continue;entries.push({key:'evidence:'+id,objectId:null,evidenceId:id,room:d.room==='POST'?'D':d.room});}
 return entries.filter(e=>['A','B','C','D'].includes(e.room));
}
