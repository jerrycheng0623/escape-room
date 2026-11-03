import {ROOM_ORDER,MECHANIC_REVISION,freshPuzzles,totalWeight,canVisit} from './engine.mjs';
import {WORLD,OBJECT_IDS,freshObjects,commonHoles} from './world.mjs';
import {validRun as validV3,validLegacyRun as validV2,migrateV2,migrateV1ForV4} from './legacy/storage.mjs';
import {GUIDANCE_STAGES} from './guidance.mjs';
export const RUN_KEY='embers.investigation.v1',BACKUP_KEY=RUN_KEY+'.backup',SETTINGS_KEY='embers.settings.v1',REPLAY_KEY='embers.replay.v4';
export const DEFAULT_SETTINGS={lang:'zh-Hant',device:'desktop',hint:'novice',sound:false,volume:.35,quality:'medium',brightness:1.15,reducedMotion:false,subtitles:true,subtitleLanguage:'auto',textSize:18,sensitivity:1,explorationAssist:false};
const IDS=new Set('invitation commission police threat card formula door-sign notes clipping first-photo last-photo worklog diary watch blood weight manual necklace key surface uv-module report recording cabinet exit-traces identity overlay b-tools a-receipt a-structure b-samples c-parts d-card'.split(' '));
export const REQUIRED={A:['notes','clipping'],B:['first-photo','last-photo','worklog'],C:['key','necklace','diary','watch','surface','weight'],D:['report','recording','cabinet','exit-traces']};
const REWARDS={A:['notes','clipping'],B:['first-photo','last-photo','worklog'],C:['key','necklace'],D:['report']};
const uniq=x=>Array.isArray(x)&&new Set(x).size===x.length;
const nonnegative=x=>Number.isInteger(x)&&x>=0;
export function createRun(now=new Date().toISOString()){return {version:4,mechanicRevision:4,legacyCompleted:[],migrationNotice:null,mode:'story',phase:'intro',room:'A',solved:[],evidence:['invitation','commission','police'],seen:[],hints:{},hintStages:{},helpCount:0,helpRooms:[],seconds:0,roomSeconds:{A:0,B:0,C:0,D:0},savedAt:now,position:null,pendingFilm:'CIN-00',cabinetMoved:false,crown:false,firstResult:null,bestBonus:false,puzzles:freshPuzzles(),objects:freshObjects(),held:null,annotations:{A:'',B:'',C:'',D:''}}};
export function validRun(x){
 if(!x||x.version!==4||x.mechanicRevision!==4||x.mode!=='story'||!ROOM_ORDER.includes(x.room)||!canVisit(x,x.room)||!['intro','explore','cinematic','bonus','ending','epilogue','completed'].includes(x.phase)||!uniq(x.solved)||x.solved.some((r,i)=>r!==ROOM_ORDER[i])||!uniq(x.legacyCompleted)||x.legacyCompleted.some(r=>!x.solved.includes(r))||!uniq(x.evidence)||x.evidence.some(id=>!IDS.has(id))||!uniq(x.seen)||x.seen.some(id=>!['CIN-00','CIN-A','CIN-B','CIN-C','CIN-D','CIN-END','CIN-EPILOGUE'].includes(id))||!nonnegative(x.seconds)||!nonnegative(x.helpCount)||!uniq(x.helpRooms)||x.helpCount!==x.helpRooms.length||!x.roomSeconds||ROOM_ORDER.some(r=>!nonnegative(x.roomSeconds[r]))||!x.hints||!x.hintStages||typeof x.savedAt!=='string'||['crown','bestBonus','cabinetMoved'].some(k=>typeof x[k]!=='boolean'))return false;
 if(x.position&&(!Number.isFinite(x.position.x)||!Number.isFinite(x.position.z)))return false;
 if(Object.values(x.hints).some(v=>!uniq(v)||v.some(n=>!Number.isInteger(n)||n<0||n>9999))||Object.entries(x.hintStages).some(([k,v])=>!GUIDANCE_STAGES.includes(k.slice(2))||!uniq(v)||v.some(n=>!Number.isInteger(n)||n<0||n>6)))return false;
 if(!x.annotations||ROOM_ORDER.some(r=>typeof x.annotations[r]!=='string'||x.annotations[r].length>6000))return false;
 if(!x.objects||OBJECT_IDS.some(id=>{const o=x.objects[id];return !o||typeof o.discovered!=='boolean'||typeof o.opened!=='boolean'||typeof o.flipped!=='boolean'||!['world','inventory','work','basket','pan','strip','board'].includes(o.container)||![0,90,180,270].includes(o.rotation)||!Number.isFinite(o.x)||!Number.isFinite(o.y)||o.x<0||o.x>1||o.y<0||o.y>1||o.container!=='world'&&!WORLD[id].portable;}))return false;
 if(x.held!==null&&(!WORLD[x.held]||x.objects[x.held]?.container!=='inventory'))return false;
 const p=x.puzzles;if(!p||!p.A||!p.B||!p.C||!p.D)return false;
 if(!Array.isArray(p.A.hooks)||p.A.hooks.length!==6||p.A.hooks.some(v=>!['rest','lift','pull','turn'].includes(v))||!/^\d{4}$/.test(p.A.digits)||['guard','latch','panel','luggage'].some(k=>typeof p.A[k]!=='boolean')||p.A.panel&&!p.A.latch)return false;
 if(!uniq(p.B.strip)||p.B.strip.some(id=>WORLD[id]?.kind!=='film'||x.objects[id].container!=='strip')||['transported','returnOpen','originalReleased','originalOpened','tested'].some(k=>typeof p.B[k]!=='boolean')||p.B.originalOpened&&!p.B.originalReleased)return false;
 if(!Array.isArray(p.C.route)||p.C.route.length>10||p.C.route.some(v=>!['A0','M','F','B','OLD','RING'].includes(v))||['slipped','released','liftCommitted','hatchRaised','handwheel'].some(k=>typeof p.C[k]!=='boolean')||p.C.hatchRaised&&!p.C.liftCommitted)return false;
 if(!uniq(p.D.pages)||p.D.pages.some(id=>!WORLD[id]?.page||x.objects[id].container!=='board')||!Array.isArray(p.D.sequence)||p.D.sequence.length>12||p.D.sequence.some(n=>!Number.isInteger(n)||n<1||n>6)||['upperReleased','upperOpened','lowerReleased','lowerOpened'].some(k=>typeof p.D[k]!=='boolean')||p.D.lowerOpened&&!p.D.lowerReleased||p.D.upperOpened&&!p.D.upperReleased)return false;
 if(OBJECT_IDS.some(id=>x.objects[id].container==='strip'&&!p.B.strip.includes(id)||x.objects[id].container==='board'&&!p.D.pages.includes(id)))return false;
 for(const r of x.solved){if(x.legacyCompleted.includes(r))continue;if(!REWARDS[r].every(id=>x.evidence.includes(id))||r==='A'&&!p.A.panel||r==='B'&&!p.B.originalOpened||r==='C'&&!p.C.hatchRaised||r==='D'&&!p.D.lowerOpened)return false;}
 if(['bonus','ending','epilogue','completed'].includes(x.phase)&&x.solved.length!==4)return false;
 const f={intro:'CIN-00',ending:'CIN-END',epilogue:'CIN-EPILOGUE'};if(f[x.phase]&&x.pendingFilm!==f[x.phase]||['explore','bonus','completed'].includes(x.phase)&&x.pendingFilm!==null||x.phase==='cinematic'&&(!x.solved.includes(x.pendingFilm?.slice(4))||!/^CIN-[ABCD]$/.test(x.pendingFilm)))return false;
 if(x.evidence.includes('identity')&&x.phase!=='completed'||x.phase==='completed'&&(!x.firstResult||!x.seen.includes('CIN-EPILOGUE'))||x.crown&&(!x.bestBonus||x.solved.length!==4))return false;
 if(x.firstResult&&(!nonnegative(x.firstResult.seconds)||!nonnegative(x.firstResult.helpCount)||typeof x.firstResult.crown!=='boolean'||typeof x.firstResult.at!=='string'||!x.firstResult.hints))return false;
 return true;
}
export function migrateRun(old){let x;if(validV3(old))x=old;else if(validV2(old))x=migrateV2(old);else x=migrateV1ForV4(old);if(!x)return null;return {...createRun(),...x,version:4,mechanicRevision:4,legacyCompleted:[...x.solved],puzzles:freshPuzzles(),objects:freshObjects(),held:null,annotations:{A:'',B:'',C:'',D:''},hintStages:{},migrationNotice:'v4 已改成分散探索。已完成章節、首次紀錄與皇冠保留；未完成機構重新開始，舊存檔另存備份。'};}
export function readRun(storage,key=RUN_KEY){let corrupt=false;for(const k of [key,key===RUN_KEY?BACKUP_KEY:key+'.backup']){try{const raw=storage.getItem(k);if(!raw)continue;const x=JSON.parse(raw);if(validRun(x))return {run:x,recovered:k!==key,error:null,migrated:false};const run=migrateRun(x);if(run&&validRun(run)){try{storage.setItem(key+'.before-schema4',raw);}catch{}return {run,recovered:k!==key,error:null,migrated:true};}corrupt=true;}catch{corrupt=true;}}return {run:null,recovered:false,error:corrupt?'corrupt':null};}
export function saveRun(storage,run,key=RUN_KEY){if(!validRun(run))return {ok:false,error:'invalid'};try{const old=storage.getItem(key);if(old){try{const parsed=JSON.parse(old);if(validRun(parsed)||migrateRun(parsed))storage.setItem(key===RUN_KEY?BACKUP_KEY:key+'.backup',old);}catch{}}storage.setItem(key,JSON.stringify({...run,savedAt:new Date().toISOString()}));return {ok:true};}catch{return {ok:false,error:'storage'};}}
export function addEvidence(run,id){if(!IDS.has(id)||run.evidence.includes(id)||id==='identity')return run;return {...run,evidence:[...run.evidence,id]};}
export function revealHint(run,room,index,stage=null){if(!ROOM_ORDER.includes(room)||!Number.isInteger(index)||index<0||index>6||stage!==null&&!GUIDANCE_STAGES.includes(stage))return run;const key=room+':'+stage,stageOld=run.hintStages[key]||[],old=run.hints[room]||[],event=stage===null?index:100+GUIDANCE_STAGES.indexOf(stage)*7+index;if(stage===null?old.includes(event):stageOld.includes(index))return run;return {...run,hints:{...run.hints,[room]:[...old,event]},hintStages:stage===null?run.hintStages:{...run.hintStages,[key]:[...stageOld,index]}};}
export function requestHelp(run,room){if(run.helpRooms.includes(room))return run;return {...run,helpRooms:[...run.helpRooms,room],helpCount:run.helpCount+1};}
export const basketLoad=run=>Object.entries(run.objects).filter(([id,o])=>o.container==='basket'&&WORLD[id].kg).reduce((n,[id])=>n+WORLD[id].kg,0);
export const panLoad=run=>Object.entries(run.objects).filter(([id,o])=>o.container==='pan'&&WORLD[id].kg).reduce((n,[id])=>n+WORLD[id].kg,0);
export const routeWorks=p=>p.route.join(',')==='A0,M,F,B';
function settle(run){const p=run.puzzles;for(const room of ROOM_ORDER){if(run.solved.includes(room)||run.solved.length!==ROOM_ORDER.indexOf(room))continue;const yes=room==='A'?p.A.panel:room==='B'?p.B.originalOpened:room==='C'?p.C.hatchRaised:p.D.lowerOpened;if(yes&&REWARDS[room].every(id=>run.evidence.includes(id)))run={...run,solved:[...run.solved,room]};}if(run.evidence.includes('report')&&run.cabinetMoved&&['notes','clipping','first-photo','last-photo','worklog','weight','diary','watch','necklace','surface'].every(id=>run.evidence.includes(id)))run=addEvidence(run,'recording');return run;}
export function worldAction(run,id,verb,value){const item=WORLD[id];if(run.phase!=='explore'||!item||item.room!==run.room&&run.objects[id]?.container==='world'||run.legacyCompleted.includes(run.room)&&!['observe','collect','take','hold','return','work','flip','rotate','move','annotate'].includes(verb))return run;let n=structuredClone(run),o=n.objects[id],p=n.puzzles[item.room];o.discovered=true;const held=n.held,hand=held?WORLD[held]:null;
 if(o.container==='strip'&&n.puzzles.B.transported&&['take','return','flip','rotate','connect'].includes(verb))return run;
 if(verb==='annotate'&&typeof value==='string')n.annotations[n.room]=value.slice(0,6000);
 if(verb==='observe')return n;
 if(verb==='take'&&item.portable&&(!item.behind||n.objects[item.behind].opened)){if(o.container==='strip'&&n.puzzles.B.transported)return run;n.puzzles.B.strip=n.puzzles.B.strip.filter(v=>v!==id);n.puzzles.D.pages=n.puzzles.D.pages.filter(v=>v!==id);o.container='inventory';n.held=id;}
 if(verb==='hold'&&o.container==='inventory')n.held=id;
 if(verb==='return'&&item.portable){if(o.container==='strip'&&n.puzzles.B.transported)return run;o.container='world';n.puzzles.B.strip=n.puzzles.B.strip.filter(v=>v!==id);n.puzzles.D.pages=n.puzzles.D.pages.filter(v=>v!==id);if(n.held===id)n.held=null;}
 if(verb==='work'&&item.portable&&o.container==='inventory'){o.container='work';n.held=null;}
 if(verb==='flip')o.flipped=!o.flipped;
 if(verb==='rotate')o.rotation=(o.rotation+90)%360;
 if(verb==='move'&&o.container==='work'&&value&&Number.isFinite(value.x)&&Number.isFinite(value.y)){o.x=Math.max(.08,Math.min(.92,value.x));o.y=Math.max(.1,Math.min(.9,value.y));}
 if(verb==='collect'&&item.evidence)n=addEvidence(n,item.evidence);
 if(item.kind==='hook'){
  const h=item.index;if(verb==='lift')p.hooks[h]='lift';if(verb==='rest')p.hooks[h]='rest';if(verb==='turn')p.hooks[h]='turn';if(verb==='press'&&h===1&&p.hooks[h]==='lift'&&!p.guard)p.latch=true;
  if(verb==='pull'){p.hooks[h]='pull';if(h===5&&!p.panel)p.guard=true;}
 }
 if(item.kind==='bell'&&verb==='press'&&p.hooks[5]==='rest')p.guard=false;
 if(item.kind==='panel'&&verb==='pull'&&p.latch){p.panel=true;o.opened=true;}
 if(item.kind==='panel'&&verb==='collect'&&p.panel){n=addEvidence(addEvidence(n,'notes'),'clipping');}
 if(item.kind==='luggage'){if(verb==='digits'&&/^\d{4}$/.test(value))p.digits=value;if(verb==='pull'&&p.digits==='1830')p.luggage=true;}
 if(item.kind==='box'&&verb==='move')o.opened=!o.opened;
 if(item.kind==='film'&&verb==='connect'&&o.container==='inventory'&&!p.transported){o.container='strip';p.strip.push(id);if(n.held===id)n.held=null;}
 if(item.kind==='reader'){
  if(verb==='feed'&&p.strip.length){p.transported=true;const strip=p.strip;const films=strip.map(v=>WORLD[v]);p.result=films.some(v=>v.roll==='P')?'有翻拍批號':films.some(v=>v.roll!=='K')?'卷別不一致':strip.some(v=>n.objects[v].flipped||n.objects[v].rotation!==0)?'原邊反向':strip.join(',')!=='b-f27,b-f28,b-f31'?'工作段落順序不合':'accepted';}
  if(verb==='rewind'&&p.transported){if(p.result==='accepted')p.originalReleased=true;else{p.returnOpen=true;for(const f of p.strip)n.objects[f].container='inventory';p.strip=[];p.transported=false;}}
  if(verb==='pull'&&p.originalReleased)p.originalOpened=true;
  if(verb==='eject'){for(const f of p.strip)n.objects[f].container='inventory';p.strip=[];p.transported=false;p.result=null;}
  if(verb==='collect'&&p.originalOpened)for(const ev of REWARDS.B)n=addEvidence(n,ev);
 }
 if(item.kind==='shutter'&&verb==='press')p.tested=true;
 if(item.kind==='anchor'&&verb==='place'&&hand?.kind==='rope'&&!p.hatchRaised){p.route=p.route.length>=10?[item.node]:[...p.route,item.node];p.released=false;}
 if(item.kind==='basket'){
  if(verb==='place'&&hand?.kind==='rope'&&!p.hatchRaised){p.route.push('B');p.released=false;}
  if(verb==='place'&&hand?.kind==='weight'){n.objects[held].container='basket';n.held=null;const load=basketLoad(n);if(!p.hatchRaised&&(load>40||p.route.includes('OLD')&&load>20))p.slipped=true;}
  if(verb==='reset'&&basketLoad(n)<=40&&(!p.route.includes('OLD')||basketLoad(n)<=20))p.slipped=false;
  if(verb==='unrope'&&!p.hatchRaised){p.route=[];p.released=false;}
 }
 if(item.kind==='pan'&&verb==='place'&&hand?.kind==='weight'){n.objects[held].container='pan';n.held=null;}
 if(item.kind==='hatch'){
  if(verb==='release'&&!p.slipped){p.released=true;if(routeWorks(p)&&basketLoad(n)>35&&basketLoad(n)<=40){p.liftCommitted=true;p.hatchRaised=true;}}
  if(verb==='turn'){p.handwheel=true;if(p.released&&!p.slipped&&routeWorks(p)&&basketLoad(n)>=35&&basketLoad(n)<=40){p.liftCommitted=true;p.hatchRaised=true;}}
  if(verb==='collect'&&p.hatchRaised)n=addEvidence(addEvidence(n,'key'),'necklace');
 }
 if(item.kind==='board'){
  if(verb==='place'&&hand?.page){n.objects[held].container='board';p.pages.push(held);n.held=null;}
  if(verb==='poke'&&hand?.kind==='tool'&&Number.isInteger(value)&&value>=1&&value<=6&&(!p.pages.length||commonHoles(p.pages,n.objects).includes(value))&&p.sequence.length<12)p.sequence.push(value);
  if(verb==='reset')p.sequence=[];
 }
 if(item.kind==='drawers'){
  if(verb==='pull'){const seq=p.sequence.join(',');if(seq==='2,5,1')p.lowerReleased=true;if(seq==='3,4,6')p.upperReleased=true;p.sequence=[];}
  if(verb==='open-upper'&&p.upperReleased)p.upperOpened=true;
  if(verb==='open-lower'&&p.lowerReleased)p.lowerOpened=true;
  if(verb==='collect'&&p.lowerOpened)n=addEvidence(n,'report');
 }
 if(item.kind==='cabinet'&&verb==='move'){n.cabinetMoved=true;n=addEvidence(addEvidence(n,'cabinet'),'exit-traces');}
 if(item.room==='C'&&!p.hatchRaised&&(basketLoad(n)>40||p.route.includes('OLD')&&basketLoad(n)>20))p.slipped=true;
 n=settle(n);return validRun(n)?n:run;
}
// Old centralized action API is deliberately unavailable in revision 4.
export const mechanismAction=run=>run;
export const setPuzzle=run=>run;
export const solvePuzzle=run=>settle(run);
export function startChapterFilm(run){const r=run.room;if(!run.solved.includes(r)||!REQUIRED[r].every(id=>run.evidence.includes(id)))return run;return {...run,phase:'cinematic',pendingFilm:`CIN-${r}`};}
export function completeFilm(run,id){if(run.pendingFilm!==id)return run;const seen=[...new Set([...run.seen,id])];if(id==='CIN-00')return {...run,phase:'explore',pendingFilm:null,seen};if(['CIN-A','CIN-B','CIN-C'].includes(id)){const room=ROOM_ORDER[ROOM_ORDER.indexOf(id.slice(4))+1];return {...run,room,phase:'explore',pendingFilm:null,seen,position:null};}if(id==='CIN-D')return {...run,phase:'bonus',pendingFilm:null,seen};if(id==='CIN-END')return {...run,phase:'epilogue',pendingFilm:'CIN-EPILOGUE',seen};if(id==='CIN-EPILOGUE'){const result=run.firstResult||{seconds:run.seconds,hints:JSON.parse(JSON.stringify(run.hints)),helpCount:run.helpCount,crown:run.crown,at:new Date().toISOString()};return {...run,phase:'completed',pendingFilm:null,seen,evidence:[...new Set([...run.evidence,'identity'])],firstResult:result};}return run;}
export function submitBonus(run,answers){if(run.phase!=='bonus'&&run.phase!=='completed')return run;const correct=[0,1,2,0,2].every((n,i)=>answers[i]===n);if(!correct)return run;return {...run,crown:true,bestBonus:true};}
export function watchEnding(run){return run.solved.length===4?{...run,phase:'ending',pendingFilm:'CIN-END'}:run;}

export function replayRun(room){let r=createRun();r.phase='explore';r.pendingFilm=null;r.room=room;r.seen=['CIN-00',...ROOM_ORDER.slice(0,ROOM_ORDER.indexOf(room)).map(v=>'CIN-'+v)];r.solved=ROOM_ORDER.slice(0,ROOM_ORDER.indexOf(room));r.legacyCompleted=[...r.solved];for(const prev of r.solved)for(const id of REQUIRED[prev])r=addEvidence(r,id);return r;}
export function readSettings(storage){try{const p=JSON.parse(storage.getItem(SETTINGS_KEY)||'{}');const d={...DEFAULT_SETTINGS};for(const k of ['sound','reducedMotion','subtitles','explorationAssist'])if(typeof p[k]==='boolean')d[k]=p[k];for(const [k,values] of Object.entries({lang:['zh-Hant','en'],device:['desktop','mobile'],hint:['novice','standard','hard'],quality:['low','medium','high'],subtitleLanguage:['auto','zh-Hant','en']}))if(values.includes(p[k]))d[k]=p[k];for(const [k,min,max] of [['volume',0,1],['brightness',.75,1.7],['textSize',16,26],['sensitivity',.5,2]])if(Number.isFinite(p[k]))d[k]=Math.max(min,Math.min(max,p[k]));return d;}catch{return {...DEFAULT_SETTINGS};}}
