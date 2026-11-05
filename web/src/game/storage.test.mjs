import test from 'node:test';import assert from 'node:assert/strict';import {createRun,readRun,saveRun,addEvidence,revealHint,RUN_KEY,BACKUP_KEY} from './storage.mjs';
function storage(){const data=new Map();return {getItem:k=>data.get(k)??null,setItem:(k,v)=>data.set(k,v)};}
test('新增證物／重讀提示不重複計數',()=>{let r=createRun();r=addEvidence(r,'watch');r=addEvidence(r,'watch');r=revealHint(r,'A',0);r=revealHint(r,'A',0);assert.deepEqual(r.evidence,['watch']);assert.deepEqual(r.hints.A,[0]);assert.equal(addEvidence(r,'report'),r);});
test('毀損主檔可恢復安全備份',()=>{const s=storage(),r=createRun();saveRun(s,r);saveRun(s,addEvidence(r,'watch'));s.setItem(RUN_KEY,'broken');const loaded=readRun(s);assert.equal(loaded.recovered,true);assert.equal(loaded.run.room,'A');});
test('拒收偽造通關旗標／非法章節，不把缺失機關當完成',()=>{const s=storage();s.setItem(RUN_KEY,JSON.stringify({...createRun(),phase:'completed',room:'D'}));assert.equal(readRun(s).run,null);assert.equal(saveRun(s,{...createRun(),mode:'preview'}).ok,false);});
test('儲存空間失敗會回報，不假稱成功',()=>{assert.equal(saveRun({getItem:()=>null,setItem:()=>{throw Error('quota');}},createRun()).ok,false);});
