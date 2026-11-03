import test from 'node:test';import assert from 'node:assert/strict';import {HINTS,HINT_MAPPING,HELP} from './guidance.mjs';
test('指引保留四區中英7則與3／5／7種資訊程度',()=>{assert.deepEqual(Object.values(HINT_MAPPING).map(a=>a.length),[3,5,7]);for(const r of ['A','B','C','D']){assert.equal(HINTS[r].length,7);assert.equal(HELP[r].length,2);for(const row of HINTS[r])assert(row.length===2&&row.every(s=>typeof s==='string'&&s.length>5));}});
test('指引不可回填已知答案、計算算法或先取物再操作的完整清單',()=>{const all=[...Object.values(HINTS).flat(),...Object.values(HELP)].flat();for(const text of all){assert(!/\b120\b|\b65\s*(?:kg|公斤)|R\s*[=:]\s*0|乘二|乘以二|先.{0,30}再|collect.+then.+sweep|double the previous/i.test(text),text);}});
test('指引每則可重讀，難度映射只選既有觀察節點且不重複',()=>{for(const ids of Object.values(HINT_MAPPING)){assert.equal(new Set(ids).size,ids.length);assert(ids.every((n,i)=>Number.isInteger(n)&&n>=0&&n<7&&(i===0||n>ids[i-1])));}});

test('提示依陷阱與物件狀態切換',async()=>{const S=await import('./storage.mjs'),G=await import('./guidance.mjs');let a=S.replayRun('A');assert.equal(G.guidanceStage(a,'A'),'A');a=S.worldAction(a,'a-hook5','pull');assert.equal(G.guidanceStage(a,'A'),'ABell');});
