import story from '../../../assets/story/content-v5.json';
export const asset=path=>`${import.meta.env.BASE_URL}${path}`;
export const DOCUMENTS=story.documents;
export const CHARACTERS=story.characters;
export const ORDER=['A','B','C','D'];
export const ROOMS={
 A:{name:'焦黑的客房',en:'The charred guest room',index:'01',objective:'釐清記者留下的疑點',objectiveEn:'Investigate the reporter’s unanswered questions',floor:0,bounds:[3.35,9.65,5.85,10.15],spawn:[8.5,1.65,9.6],look:[7,1,7],puzzle:'三位數調查箱',puzzleEn:'Three-digit investigation box'},
 B:{name:'臨時暗房',en:'The makeshift darkroom',index:'02',objective:'辨認影像裡的不尋常之處',objectiveEn:'Find what is unusual in the photographs',floor:0,bounds:[10.35,13.65,6.85,9.15],spawn:[11,1.65,8.9],look:[12,1,7.7],puzzle:'影像工作架與底片框',puzzleEn:'Image colour calibration'},
 C:{name:'營火與儲藏室',en:'The terrace and storage room',index:'03',objective:'理解營火區留下的痕跡',objectiveEn:'Understand the traces left by the gathering',floor:.45,bounds:[-5.6,5.6,12.4,21.6],spawn:[1.5,2.1,15.2],look:[0,1.3,12.9],puzzle:'承重匣與平衡支架',puzzleEn:'Load-operated service hatch'},
 D:{name:'地下診療區',en:'The basement clinic',index:'04',objective:'重建地下室藏起的秘密',objectiveEn:'Reconstruct the secrets hidden below',floor:-2.4,bounds:[7.4,14.6,14.4,19.6],spawn:[11.8,-.75,18.6],look:[10,-1.4,16],puzzle:'覆頁顯影與歸檔資料匣',puzzleEn:'Concealed UV record'}
};
export const GROUPS={
 desk:{room:'A',name:'採訪文件與調查箱',en:'Interview papers and investigation box',pos:[6.65,1.03,7.1],docs:['threat','card','formula','a-structure'],puzzle:true},
 'door-sign':{room:'A',name:'入口門牌05',en:'Room plate 05',pos:[8.08,1.55,5.53],docs:['door-sign']},
 camera:{room:'B',name:'相機與工作副本',en:'Camera and working copies',pos:[12,1.08,7.4],docs:['b-tools','b-samples'],puzzle:true},
 camp:{room:'C',name:'營火區現場文件',en:'Terrace scene records',pos:[1.5,1.4,14],docs:['diary','weight','manual','c-parts','surface']},
 storage:{room:'C',name:'儲藏凹間停錶與血痕',en:'Storage-bay watch and traces',pos:[-3.8,1.45,14.05],docs:['watch','blood']},
 module:{room:'D',name:'維修箱UV模組',en:'Service-box UV module',pos:[12.6,-1.4,18.4],docs:['uv-module']},
 cabinet:{room:'D',name:'倒櫃與維修出口',en:'Cabinet and maintenance exit',pos:[13,-1.2,16.6],docs:['cabinet','exit-traces'],cabinet:true}
};
export const EVIDENCE=Object.fromEntries(Object.entries(GROUPS).map(([id,g])=>[id,{...g,image:DOCUMENTS[g.docs[0]].image}]));
export const PUZZLE_TARGETS={box:{room:'A',name:'三位數調查箱',en:'Investigation box',pos:[7.3,1,7]},grill:{room:'C',name:'測重儀',en:'Load mechanism',pos:[0,1.5,13.66]},medical:{room:'D',name:'診療報告',en:'Clinical record',pos:[10,-1.3,16]}};
export const WEIGHTS=[['timber',15,'木樁','Timber'],['iron',20,'鐵塊','Iron'],['sand',10,'沙袋','Sandbag'],['stone',5,'石塊','Stone']].flatMap(([type,kg,name,en])=>[0,1].map(n=>({id:`${type}-${n}`,type,kg,name:`${name}${n+1}`,en:`${en} ${n+1}`})));
export const REQUIRED={A:['notes','clipping'],B:['first-photo','last-photo','worklog'],C:['key','necklace','diary','watch','surface'],D:['report','recording','cabinet','exit-traces']};
export const REWARDS={A:['notes','clipping'],B:['first-photo','last-photo','worklog'],C:['key','necklace'],D:['report','recording']};
export {HINTS,HINT_MAPPING,HELP,guidanceFor,guidanceStage} from './guidance.mjs';
export const BONUS=[
 {id:'fire',q:'火災為何需要繼續調查？',en:'Why investigate beyond an accidental fire?',choices:[['多處火場痕跡與三杯殘留值得交叉追查','Multiple scene traces and glass residues warrant corroboration'],['門反鎖，所以已排除所有外人','A bolted door rules out every outsider'],['看見空瓶就已完成藥物鑑定','An empty bottle identifies its contents']],correct:0,evidence:['police','worklog']},
 {id:'exit',q:'主門反鎖代表什麼？',en:'What does the bolted main door establish?',choices:[['凶手一定死在屋內','The culprit must have died inside'],['只描述主門，維修出口仍是可行路徑','It describes one door; the maintenance exit remains possible'],['油痕能精確辨認使用者','Oil identifies its user']],correct:1,evidence:['cabinet','exit-traces']},
 {id:'time',q:'缺照、停錶與日記能支持什麼？',en:'What do the absence, watch and diary support?',choices:[['單看錶可確定精確死亡分鐘','The watch alone fixes the minute of death'],['未入鏡等於死亡','Absence proves death'],['支持合照前遭襲的重建，仍需正式核對','An assault before the last photograph is supported, with formal findings still needed']],correct:2,evidence:['diary','watch','worklog']},
 {id:'grill',q:'重量、項鍊與深層紀錄如何理解？',en:'How should the load, pendant and concealed record be read?',choices:[['共同支持恐怖重建，單件不足以認人或定罪','Together they support a disturbing reconstruction; none alone identifies or convicts'],['65就是劉涵精確體重','65 is Liu Han’s exact body weight'],['病歷可直接決定犯罪責任','A clinical record decides guilt']],correct:0,evidence:['weight','necklace','report']},
 {id:'host',q:'當晚可以對主辦人作什麼結論？',en:'What can be concluded about the host that night?',choices:[['已拿到數日後的正式身分報告','A later identification report is already available'],['只有算術就能確認誰活著','Arithmetic alone identifies the survivor'],['尚不能確認其死亡，出口使逃離成為可能','His death is unconfirmed; the exit makes escape possible']],correct:2,evidence:['police','exit-traces']}
];
