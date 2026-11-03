import {GUIDANCE_STAGES} from './guidance.mjs';
import {ROOM_ORDER,WEIGHT_VALUES,totalWeight,codeMatches,rgbMatches,maskComplete,canVisit,freshPuzzles,MECHANIC_REVISION,overlayAligned,scanRegions,regionsComplete,REGION_CELLS,SYMBOLS,indexMatches,weightMatches} from './engine.mjs';
export const RUN_KEY='embers.investigation.v1',BACKUP_KEY=RUN_KEY+'.backup',SETTINGS_KEY='embers.settings.v1',REPLAY_KEY='embers.replay.v2';
export const DEFAULT_SETTINGS={lang:'zh-Hant',device:'desktop',hint:'novice',sound:false,volume:.35,quality:'medium',brightness:1.15,reducedMotion:false,subtitles:true,subtitleLanguage:'auto',textSize:18,sensitivity:1};
const IDS=new Set('invitation commission police threat card formula door-sign notes clipping first-photo last-photo worklog diary watch blood weight manual necklace key surface uv-module report recording cabinet exit-traces identity overlay b-tools a-receipt a-structure b-samples c-parts d-card'.split(' '));
const REWARDS={A:['notes','clipping'],B:['first-photo','last-photo','worklog'],C:['key','necklace'],D:['report','recording']};
const REQUIRED={A:['notes','clipping'],B:['first-photo','last-photo','worklog'],C:['key','necklace','diary','watch','surface'],D:['report','recording','cabinet','exit-traces']};
const uniq=x=>Array.isArray(x)&&new Set(x).size===x.length;
const nonnegative=x=>Number.isInteger(x)&&x>=0;
export function createRun(now=new Date().toISOString()){return {version:3,mechanicRevision:MECHANIC_REVISION,legacyCompleted:[],migrationNotice:null,mode:'story',phase:'intro',room:'A',solved:[],evidence:['invitation','commission','police'],seen:[],hints:{},hintStages:{},helpCount:0,helpRooms:[],seconds:0,roomSeconds:{A:0,B:0,C:0,D:0},savedAt:now,position:null,pendingFilm:'CIN-00',cabinetMoved:false,crown:false,firstResult:null,bestBonus:false,puzzles:freshPuzzles()};}
export function validLegacyRun(x){if(!x||x.version!==2||x.mode!=='story'||!['intro','explore','cinematic','bonus','ending','epilogue','completed'].includes(x.phase)||!ROOM_ORDER.includes(x.room)||!uniq(x.solved)||x.solved.some((id,i)=>id!==ROOM_ORDER[i])||!canVisit(x,x.room)||!uniq(x.evidence)||x.evidence.some(id=>!IDS.has(id))||!uniq(x.seen)||x.seen.some(id=>!['CIN-00','CIN-A','CIN-B','CIN-C','CIN-D','CIN-END','CIN-EPILOGUE'].includes(id))||!nonnegative(x.helpCount)||!nonnegative(x.seconds)||typeof x.savedAt!=='string'||!x.hints||Object.entries(x.hints).some(([k,v])=>!ROOM_ORDER.includes(k)||!uniq(v)||v.some(n=>!Number.isInteger(n)||n<0||n>6))||!uniq(x.helpRooms)||x.helpRooms.some(id=>!ROOM_ORDER.includes(id))||x.helpCount!==x.helpRooms.length||!x.roomSeconds||ROOM_ORDER.some(r=>!nonnegative(x.roomSeconds[r]))||typeof x.crown!=='boolean'||typeof x.bestBonus!=='boolean'||typeof x.cabinetMoved!=='boolean')return false;
 const phaseFilm={intro:'CIN-00',ending:'CIN-END',epilogue:'CIN-EPILOGUE'};
 if(phaseFilm[x.phase]&&x.pendingFilm!==phaseFilm[x.phase])return false;
 if(x.phase==='cinematic'&&(!/^CIN-[ABCD]$/.test(x.pendingFilm)||!x.solved.includes(x.pendingFilm.slice(4))))return false;
 if(['explore','bonus','completed'].includes(x.phase)&&x.pendingFilm!==null)return false;
 if(x.firstResult&&(!nonnegative(x.firstResult.seconds)||!nonnegative(x.firstResult.helpCount)||typeof x.firstResult.crown!=='boolean'||typeof x.firstResult.at!=='string'||!x.firstResult.hints))return false;
 if(x.position&&(!Number.isFinite(x.position.x)||!Number.isFinite(x.position.z)))return false;
 const p=x.puzzles;if(!p||!Array.isArray(p.A?.digits)||p.A.digits.length!==3||p.A.digits.some(n=>!Number.isInteger(n)||n<0||n>9)||!Array.isArray(p.B?.values)||p.B.values.length!==2||p.B.values.some(v=>!Array.isArray(v)||v.length!==3||v.some(n=>!Number.isInteger(n)||n<0||n>100))||!Array.isArray(p.B.confirmed)||p.B.confirmed.length!==2||p.B.confirmed.some(n=>typeof n!=='boolean')||totalWeight(p.C?.placed)===null||!uniq(p.D?.mask)||p.D.mask.some(n=>!Number.isInteger(n)||n<0||n>=6000))return false;
 if(x.solved.includes('A')&&!codeMatches(p.A.digits))return false;
 if(x.solved.includes('B')&&(!p.B.confirmed.every(Boolean)||!p.B.values.every(v=>rgbMatches(v,0))))return false;
 if(x.solved.includes('C')&&p.C.completedAtLoad!==65)return false;
 if(x.solved.includes('D')&&(!maskComplete(p.D.mask)||!x.evidence.includes('uv-module')))return false;
 if(x.evidence.includes('identity')&&x.phase!=='completed')return false;
 if(['bonus','ending','epilogue','completed'].includes(x.phase)&&x.solved.length!==4)return false;
 if(x.phase==='completed'&&(!x.firstResult||!x.seen.includes('CIN-EPILOGUE')))return false;
 if(x.crown&&(!x.bestBonus||x.solved.length!==4))return false;
 return true;}
export function validRun(x){if(!x||x.version!==3||x.mechanicRevision!==MECHANIC_REVISION||!uniq(x.legacyCompleted)||x.legacyCompleted.some(r=>!Array.isArray(x.solved)||!x.solved.includes(r))||x.mode!=='story'||!['intro','explore','cinematic','bonus','ending','epilogue','completed'].includes(x.phase)||!ROOM_ORDER.includes(x.room)||!uniq(x.solved)||x.solved.some((id,i)=>id!==ROOM_ORDER[i])||!canVisit(x,x.room)||!uniq(x.evidence)||x.evidence.some(id=>!IDS.has(id))||!uniq(x.seen)||x.seen.some(id=>!['CIN-00','CIN-A','CIN-B','CIN-C','CIN-D','CIN-END','CIN-EPILOGUE'].includes(id))||!nonnegative(x.helpCount)||!nonnegative(x.seconds)||typeof x.savedAt!=='string'||!x.hints||Object.entries(x.hints).some(([k,v])=>!ROOM_ORDER.includes(k)||!uniq(v)||v.some(n=>!Number.isInteger(n)||n<0||n>200))||!uniq(x.helpRooms)||x.helpRooms.some(id=>!ROOM_ORDER.includes(id))||x.helpCount!==x.helpRooms.length||!x.roomSeconds||ROOM_ORDER.some(r=>!nonnegative(x.roomSeconds[r]))||typeof x.crown!=='boolean'||typeof x.bestBonus!=='boolean'||typeof x.cabinetMoved!=='boolean')return false;
 const phaseFilm={intro:'CIN-00',ending:'CIN-END',epilogue:'CIN-EPILOGUE'};
 if(phaseFilm[x.phase]&&x.pendingFilm!==phaseFilm[x.phase])return false;
 if(x.phase==='cinematic'&&(!/^CIN-[ABCD]$/.test(x.pendingFilm)||!x.solved.includes(x.pendingFilm.slice(4))))return false;
 if(['explore','bonus','completed'].includes(x.phase)&&x.pendingFilm!==null)return false;
 if(x.firstResult&&(!nonnegative(x.firstResult.seconds)||!nonnegative(x.firstResult.helpCount)||typeof x.firstResult.crown!=='boolean'||typeof x.firstResult.at!=='string'||!x.firstResult.hints))return false;
 if(x.position&&(!Number.isFinite(x.position.x)||!Number.isFinite(x.position.z)))return false;
 if(!x.hintStages||typeof x.hintStages!=='object'||Array.isArray(x.hintStages)||Object.entries(x.hintStages).some(([k,v])=>!/^([ABCD]):/.test(k)||!GUIDANCE_STAGES.includes(k.slice(2))||!uniq(v)||v.some(n=>!Number.isInteger(n)||n<0||n>6)))return false;
 const p=x.puzzles;if(!p||!Array.isArray(p.A?.digits)||p.A.digits.length!==3||p.A.digits.some(n=>!Number.isInteger(n)||n<0||n>9)||['lidClosed','innerUnlocked','innerOpened'].some(k=>typeof p.A[k]!=='boolean')||p.A.innerOpened&&!p.A.innerUnlocked)return false;
 if(!Array.isArray(p.B?.values)||p.B.values.length!==2||p.B.values.some(v=>!Array.isArray(v)||v.length!==3||v.some(n=>![0,100].includes(n)))||!Array.isArray(p.B.confirmed)||p.B.confirmed.length!==2||p.B.confirmed.some((v,i)=>typeof v!=='boolean'||v&&!rgbMatches(p.B.values[i],i))||!['rack','hand','stand'].includes(p.B.holderLocation)||![0,90,180,270].includes(p.B.holderRotation)||!Array.isArray(p.B.sampleSelections)||p.B.sampleSelections.length!==2||p.B.sampleSelections.some(n=>n!==null&&![0,1].includes(n))||['filtersRemoved','whiteLightOn','catchReleased','filmFrameOpened'].some(k=>typeof p.B[k]!=='boolean')||p.B.filmFrameOpened&&!p.B.catchReleased)return false;
 if(totalWeight(p.C?.placed)===null||['extractionCommitted','cartridgeExtracted'].some(k=>typeof p.C[k]!=='boolean')||p.C.extractionCommitted!==p.C.cartridgeExtracted||p.C.cartridgeExtracted&&p.C.completedAtLoad!==65)return false;
 const d=p.D;if(!d||['overlayAcquired','overlayFlipped','archiveReleased','archiveOpened'].some(k=>typeof d[k]!=='boolean')||!['inventory','original','other'].includes(d.overlayLocation)||![0,90,180,270].includes(d.overlayRotation)||!d.overlayOffset||!['x','y'].every(k=>Number.isFinite(d.overlayOffset[k])&&Math.abs(d.overlayOffset[k])<=.22)||!Array.isArray(d.regions)||d.regions.length!==3||d.regions.some((cells,i)=>!uniq(cells)||cells.some(n=>!REGION_CELLS[i].includes(n)))||!Array.isArray(d.indexBuffer)||d.indexBuffer.length>3||d.indexBuffer.some(s=>!SYMBOLS.includes(s))||d.archiveOpened&&!d.archiveReleased)return false;
 if(d.overlayAcquired!==x.evidence.includes('overlay')||d.overlayLocation!=='inventory'&&!d.overlayAcquired)return false;
 if(regionsComplete(d.regions)&&(!x.evidence.includes('report')||!x.evidence.includes('uv-module')))return false;
 for(const r of x.solved){if(x.legacyCompleted.includes(r))continue;if(r==='A'&&!p.A.innerOpened||r==='B'&&(!p.B.confirmed.every(Boolean)||!p.B.filmFrameOpened)||r==='C'&&!p.C.cartridgeExtracted||r==='D'&&(!regionsComplete(d.regions)||!d.archiveOpened))return false;}
 if(x.evidence.includes('identity')&&x.phase!=='completed')return false;
 if(['bonus','ending','epilogue','completed'].includes(x.phase)&&x.solved.length!==4)return false;
 if(x.phase==='completed'&&(!x.firstResult||!x.seen.includes('CIN-EPILOGUE')))return false;
 if(x.crown&&(!x.bestBonus||x.solved.length!==4))return false;
 return true;}
function migrateV1(x){if(!x||x.version!==1||x.mode!=='story'||x.room!=='A'||!['intro','explore'].includes(x.phase)||!Array.isArray(x.evidence))return null;const r=createRun();r.phase=x.phase;r.pendingFilm=x.phase==='intro'?'CIN-00':null;r.seen=x.phase==='explore'?['CIN-00']:[];r.seconds=nonnegative(x.seconds)?x.seconds:0;r.roomSeconds.A=r.seconds;r.evidence.push(...(x.evidence.includes('reporter')?['threat']:[]));r.hints={A:[...new Set((x.hints?.A||[]).filter(n=>Number.isInteger(n)&&n>=0&&n<7))]};r.helpRooms=x.helpCount>0?['A']:[];r.helpCount=r.helpRooms.length;r.position=x.position&&Number.isFinite(x.position.x)&&Number.isFinite(x.position.z)?x.position:null;return r;}
export function migrateV2(x){if(!validLegacyRun(x))return null;const p=freshPuzzles();for(const room of x.solved){if(room==='C')p.C.placed=[...x.puzzles.C.placed];}if(!x.solved.includes('A'))p.A.digits=[...x.puzzles.A.digits];const acquired=x.evidence.includes('surface');p.D.overlayAcquired=acquired;return {...x,version:3,mechanicRevision:MECHANIC_REVISION,legacyCompleted:[...x.solved],hintStages:{},migrationNotice:'新版機關已啟用。已完成章節與首次紀錄保留；未完成章節的操作重新開始，已取得證物保留。',puzzles:p,evidence:[...new Set([...x.evidence,...(acquired?['overlay']:[])])]};}
export function readRun(storage,key=RUN_KEY){let corrupt=false;for(const k of [key,key===RUN_KEY?BACKUP_KEY:key+'.backup']){try{const raw=storage.getItem(k);if(!raw)continue;const x=JSON.parse(raw);if(validRun(x))return {run:x,recovered:k!==key,error:null,migrated:false};const migrated=migrateV2(x)||migrateV1(x);if(migrated){try{storage.setItem(key+'.before-schema3',raw);}catch{}return {run:migrated,recovered:k!==key,error:null,migrated:true};}corrupt=true;}catch{corrupt=true;}}return {run:null,recovered:false,error:corrupt?'corrupt':null};}
export function saveRun(storage,run,key=RUN_KEY){if(!validRun(run))return {ok:false,error:'invalid'};try{const old=storage.getItem(key);if(old){try{const x=JSON.parse(old);if(validRun(x)||migrateV2(x)||migrateV1(x))storage.setItem(key===RUN_KEY?BACKUP_KEY:key+'.backup',old);}catch{}}storage.setItem(key,JSON.stringify({...run,savedAt:new Date().toISOString()}));return {ok:true};}catch{return {ok:false,error:'storage'};}}
export function addEvidence(run,id){if(!IDS.has(id)||run.evidence.includes(id)||id==='identity')return run;const evidence=[...run.evidence,id];if(id==='surface'){evidence.push('overlay');return {...run,evidence:[...new Set(evidence)],puzzles:{...run.puzzles,D:{...run.puzzles.D,overlayAcquired:true}}};}return {...run,evidence};}
export function revealHint(run,room,index,stage=null){if(!ROOM_ORDER.includes(room)||!Number.isInteger(index)||index<0||index>6||stage!==null&&!GUIDANCE_STAGES.includes(stage))return run;const key=room+':'+stage,stageOld=run.hintStages[key]||[],old=run.hints[room]||[],event=stage===null?index:100+GUIDANCE_STAGES.indexOf(stage)*7+index;if(stage===null?old.includes(event):stageOld.includes(index))return run;return {...run,hints:{...run.hints,[room]:[...old,event]},hintStages:stage===null?run.hintStages:{...run.hintStages,[key]:[...stageOld,index]}};}
export function requestHelp(run,room){if(run.helpRooms.includes(room))return run;return {...run,helpRooms:[...run.helpRooms,room],helpCount:run.helpCount+1};}
export function setPuzzle(run,room,p){if(!canVisit(run,room)||run.legacyCompleted.includes(room)||(run.solved.includes(room)&&room!=='C'&&room!=='A'&&room!=='B'))return run;const next={...run,puzzles:{...run.puzzles,[room]:{...run.puzzles[room],...p}}};return validRun(next)?next:run;}
export function solvePuzzle(run,room){if(run.solved.includes(room)||run.solved.length!==ROOM_ORDER.indexOf(room))return run;const p=run.puzzles;const success=room==='A'?p.A.innerOpened:room==='B'?p.B.confirmed.every(Boolean)&&p.B.filmFrameOpened:room==='C'?p.C.cartridgeExtracted:regionsComplete(p.D.regions)&&p.D.archiveOpened&&run.evidence.includes('uv-module');if(!success)return run;return {...run,solved:[...run.solved,room],evidence:[...new Set([...run.evidence,...REWARDS[room]])]};}
// All reward boundaries are committed in the same update as the physical opening.
export function mechanismAction(run,room,action){if(run.phase!=='explore'||!canVisit(run,room)||run.room!==room||run.legacyCompleted.includes(room))return run;const p=run.puzzles[room];let n={...p};const a=action;
 if(room==='A'){
  if(a.type==='lid')n.lidClosed=!p.lidClosed;
  else if(a.type==='digits'&&!p.innerOpened&&Array.isArray(a.digits)&&a.digits.length===3&&a.digits.every(v=>Number.isInteger(v)&&v>=0&&v<=9))n.digits=a.digits;
  else if(a.type==='handle'&&codeMatches(p.digits))n.innerUnlocked=true;
  else if(a.type==='pull'&&p.innerUnlocked)n.innerOpened=true;
 }else if(room==='B'){
  if(a.type==='channel'&&!p.confirmed[a.photo]&&[0,1].includes(a.photo)&&[0,1,2].includes(a.channel)&&[0,100].includes(a.value)){n.values=p.values.map(v=>[...v]);n.values[a.photo][a.channel]=a.value;}
  else if(a.type==='sample'&&[0,1].includes(a.photo)&&[0,1].includes(a.sample)){n.sampleSelections=[...p.sampleSelections];n.sampleSelections[a.photo]=a.sample;}
  else if(a.type==='confirm'&&[0,1].includes(a.photo)&&rgbMatches(p.values[a.photo],a.photo)){n.confirmed=[...p.confirmed];n.confirmed[a.photo]=true;}
  else if(a.type==='holder'&&['rack','hand','stand'].includes(a.location))n.holderLocation=a.location;
  else if(a.type==='rotate')n.holderRotation=(p.holderRotation+90)%360;
  else if(a.type==='filters')n.filtersRemoved=!p.filtersRemoved;
  else if(a.type==='light')n.whiteLightOn=!p.whiteLightOn;
  else if(a.type==='catch')n.catchReleased=true;
  else if(a.type==='pull'&&p.catchReleased)n.filmFrameOpened=true;
 }else if(room==='C'){
  if(a.type==='weight'&&Object.hasOwn(WEIGHT_VALUES,a.id)){n.placed=p.placed.includes(a.id)?p.placed.filter(id=>id!==a.id):[...p.placed,a.id];}
  else if(a.type==='pull'&&!p.cartridgeExtracted&&weightMatches(totalWeight(p.placed))&&a.stable===true){n.extractionCommitted=true;n.cartridgeExtracted=true;n.completedAtLoad=65;}
 }else if(room==='D'){
  if(a.type==='place'&&p.overlayAcquired&&['original','other','inventory'].includes(a.location))n.overlayLocation=a.location;
  else if(a.type==='rotate')n.overlayRotation=(p.overlayRotation+90)%360;
  else if(a.type==='flip')n.overlayFlipped=!p.overlayFlipped;
  else if(a.type==='offset'&&Number.isFinite(a.x)&&Number.isFinite(a.y))n.overlayOffset={x:Math.max(-.22,Math.min(.22,a.x)),y:Math.max(-.22,Math.min(.22,a.y))};
  else if(a.type==='scan'&&run.evidence.includes('uv-module')&&overlayAligned(p))n.regions=scanRegions(p.regions,a.x,a.y);
  else if(a.type==='index'&&SYMBOLS.includes(a.symbol)&&p.indexBuffer.length<3&&!p.archiveReleased)n.indexBuffer=[...p.indexBuffer,a.symbol];
  else if(a.type==='reset'&&!p.archiveReleased)n.indexBuffer=[];
  else if(a.type==='handle'&&!p.archiveReleased){if(indexMatches(p.indexBuffer))n.archiveReleased=true;else n.indexBuffer=[];}
  else if(a.type==='pull'&&p.archiveReleased)n.archiveOpened=true;
  if(overlayAligned(n))n.overlayOffset={x:0,y:0};
 }
 let next={...run,puzzles:{...run.puzzles,[room]:n}};
 if(room==='D'&&regionsComplete(n.regions))next={...next,evidence:[...new Set([...next.evidence,'report'])]};
 next=solvePuzzle(next,room);return validRun(next)?next:run;
}
export function startChapterFilm(run){const r=run.room;if(!run.solved.includes(r)||!REQUIRED[r].every(id=>run.evidence.includes(id)))return run;return {...run,phase:'cinematic',pendingFilm:`CIN-${r}`};}
export function completeFilm(run,id){if(run.pendingFilm!==id)return run;const seen=[...new Set([...run.seen,id])];if(id==='CIN-00')return {...run,phase:'explore',pendingFilm:null,seen};if(['CIN-A','CIN-B','CIN-C'].includes(id)){const room=ROOM_ORDER[ROOM_ORDER.indexOf(id.slice(4))+1];return {...run,room,phase:'explore',pendingFilm:null,seen,position:null};}if(id==='CIN-D')return {...run,phase:'bonus',pendingFilm:null,seen};if(id==='CIN-END')return {...run,phase:'epilogue',pendingFilm:'CIN-EPILOGUE',seen};if(id==='CIN-EPILOGUE'){const result=run.firstResult||{seconds:run.seconds,hints:JSON.parse(JSON.stringify(run.hints)),helpCount:run.helpCount,crown:run.crown,at:new Date().toISOString()};return {...run,phase:'completed',pendingFilm:null,seen,evidence:[...new Set([...run.evidence,'identity'])],firstResult:result};}return run;}
export function submitBonus(run,answers){if(run.phase!=='bonus'&&run.phase!=='completed')return run;const correct=[0,1,2,0,2].every((n,i)=>answers[i]===n);if(!correct)return run;return {...run,crown:true,bestBonus:true};}
export function watchEnding(run){return run.solved.length===4?{...run,phase:'ending',pendingFilm:'CIN-END'}:run;}
export function replayRun(room){let r=createRun();r.phase='explore';r.pendingFilm=null;r.room='A';r.seen=['CIN-00'];for(const prev of ROOM_ORDER.slice(0,ROOM_ORDER.indexOf(room))){if(prev==='A'){r=mechanismAction(r,'A',{type:'digits',digits:[1,2,0]});r=mechanismAction(r,'A',{type:'handle'});r=mechanismAction(r,'A',{type:'pull'});}if(prev==='B'){r.puzzles.B.values=[[0,100,100],[100,100,0]];r.puzzles.B.confirmed=[true,true];r=mechanismAction(r,'B',{type:'catch'});r=mechanismAction(r,'B',{type:'pull'});}if(prev==='C'){for(const id of ['iron-0','iron-1','timber-0','sand-0'])r=mechanismAction(r,'C',{type:'weight',id});r=mechanismAction(r,'C',{type:'pull',stable:true});r=addEvidence(r,'surface');}r.seen.push('CIN-'+prev);r.room=ROOM_ORDER[ROOM_ORDER.indexOf(prev)+1];}r.room=room;return r;}
export function readSettings(storage){try{const p=JSON.parse(storage.getItem(SETTINGS_KEY)||'{}');const d={...DEFAULT_SETTINGS};for(const k of ['sound','reducedMotion','subtitles'])if(typeof p[k]==='boolean')d[k]=p[k];for(const [k,values] of Object.entries({lang:['zh-Hant','en'],device:['desktop','mobile'],hint:['novice','standard','hard'],quality:['low','medium','high'],subtitleLanguage:['auto','zh-Hant','en']}))if(values.includes(p[k]))d[k]=p[k];for(const [k,min,max] of [['volume',0,1],['brightness',.75,1.7],['textSize',16,26],['sensitivity',.5,2]])if(Number.isFinite(p[k]))d[k]=Math.max(min,Math.min(max,p[k]));return d;}catch{return {...DEFAULT_SETTINGS};}}
