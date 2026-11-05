import assert from 'node:assert/strict';
import {readFile,writeFile,mkdir} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import {resolve} from 'node:path';
const root=resolve(fileURLToPath(new URL('..',import.meta.url)));
const read=async p=>readFile(resolve(root,p),'utf8');
const json=async p=>JSON.parse(await read(p));
const settings=await json('story-settings.json');
const story=await json('assets/story/content-v5.json');
const rules=await json('game-rules.json');
const content=await read('web/src/game/content.js');
const engine=await read('web/src/game/engine.mjs');
const docs=story.documents;
const doc=id=>docs[id];
const results=[];
function check(id,description,fn){try{fn();results.push({id,description,status:'pass'});}catch(e){results.push({id,description,status:'fail',error:e.message});}}
check('INT-01','角色設定與實際載入故事逐項一致',()=>assert.deepEqual(settings.characters,story.characters));
check('INT-02','五名非玩家角色與唯一ID，不增加第七人',()=>{assert.equal(story.characters.length,5);assert.equal(new Set(story.characters.map(c=>c.id)).size,5);assert.deepEqual(story.characters.map(c=>c.name),['林依瑤','王杰倫','劉涵','張萍','劉子傑']);});
check('INT-03','18:30四人入鏡／20:00三人入鏡，攝影師掌鏡、偵探未到',()=>{assert.match(settings.timeline.firstPhoto,/18:30四人/);assert.match(settings.timeline.lastPhoto,/20:00三人/);assert.match(doc('first-photo').body,/鏡頭後：劉子傑。偵探尚未到場/);assert.match(doc('last-photo').body,/劉子傑掌鏡，劉涵未入鏡/);});
check('INT-04','19:15歷史65kg與預定食材5kg分開',()=>{assert.equal(settings.timeline.watchAndHistory,'19:15');assert.equal(rules.puzzles.C.history,65);assert.equal(rules.puzzles.C.food,5);assert.match(doc('weight').body,/19:15[\s\S]*65\.0 kg[\s\S]*5 kg/);});
check('INT-05','停錶與缺照不是單獨的死時／身分證明',()=>{assert.match(doc('watch').body,/不是死亡時間鑑定/);assert.match(doc('last-photo').body,/缺席本身不能證明死亡/);assert.match(doc('necklace').body,/不單獨證明/);});
check('INT-06','03:00抵達、記者委託及四小時耽擱一致',()=>{assert.match(settings.timeline.detective,/D1 03:00.*四小時/);assert.match(doc('commission').body,/四小時/);assert.match(doc('commission').body,/林依瑤/);});
check('INT-07','正式四死者名單在結局後數日',()=>{assert.equal(settings.timeline.identity,'結局後數日');assert.match(doc('identity').name,/數日後/);assert.match(doc('identity').body,/林依瑤、劉子傑、劉涵、張萍/);assert.match(doc('police').body,/身分待驗/);});
check('INT-08','五年前受困與本次縱火不倒置',()=>{assert.match(settings.twoFires,/先火災受困.*本次聚會才蓄意縱火/);assert.match(doc('report').body,/先有五年前火災與受困/);});
check('INT-09','機關v4／schema4／單結局與可選Bonus',()=>{assert.equal(rules.mechanicRevision,4);assert.equal(rules.saveSchema,4);assert.equal(rules.endingCount,1);assert.equal(rules.failure,false);assert.match(rules.bonus,/可選/);});
check('INT-10','C歷史65不是維修吊籃負載；v17剛好40kg自動升蓋',()=>{assert.equal(rules.puzzles.C.balancedLoad,35);assert.equal(rules.puzzles.C.basketRating,40);assert.equal(rules.puzzles.C.maintenanceEquivalentLoad,70);assert.equal(rules.puzzles.C.requiredBasketLoad,40);assert.equal(rules.puzzles.C.automaticLift,true);assert.equal(rules.puzzles.C.balancedOpens,false);});
check('INT-11','D上下匣序列與R/Q紙孔交集',()=>{assert.deepEqual(rules.puzzles.D.lowerSequence,[2,5,1]);assert.deepEqual(rules.puzzles.D.upperSequence,[3,4,6]);const h=rules.puzzles.D.holes;const intersection=ids=>h[ids[0]].filter(n=>ids.every(id=>h[id].includes(n)));assert.deepEqual(intersection(['R1','R2','R3']),[1,2,5]);assert.deepEqual(intersection(['Q1','Q2','Q3']),[3,4,6]);});
check('INT-12','網頁實際匯入content-v5且次序A至D',()=>{assert.match(content,/assets\/story\/content-v5\.json/);assert.match(content,/ORDER=\['A','B','C','D'\]/);assert.match(engine,/MECHANIC_REVISION\s*=\s*4/);});
check('INT-13','現行玩家文書不混入舊版姓名',()=>{const playerText=JSON.stringify(story.documents);assert.doesNotMatch(playerText,/鄭筱柔|謝宇恩|邱凱浩|張凱涵|張辰瑋/);});
const report={date:new Date().toISOString(),method:'Static JSON/source assertions only; no browser or new playthrough',node:process.version,results,passed:results.filter(r=>r.status==='pass').length,failed:results.filter(r=>r.status==='fail').length};
console.log(JSON.stringify(report,null,2));
const out=process.env.INTEGRATION_QA_DIR;
if(out){await mkdir(out,{recursive:true});await writeFile(resolve(out,'story-audit.json'),JSON.stringify(report,null,2)+'\n');}
if(report.failed)process.exitCode=1;

