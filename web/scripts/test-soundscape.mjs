import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {homedir,tmpdir} from 'node:os';
import {join} from 'node:path';
import {pathToFileURL} from 'node:url';
import {DEFAULT_SETTINGS,replayRun} from '../src/game/storage.mjs';

const {chromium,webkit}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const url=process.env.EMBERS_URL||'http://127.0.0.1:5173/',out=process.env.EMBERS_QA_DIR||join(tmpdir(),'embers-soundscape');
await mkdir(out,{recursive:true});
const result={url,date:new Date().toISOString(),method:'Tracks real HTMLMediaElements; no mock playback. Engineering room fixtures. Loop wrap checked at natural 1x from a position near the end.',rows:[]};
for(const [engine,type,mobile] of [['chromium',chromium,false],['chromium',chromium,true],['webkit',webkit,true]]){
 const b=await type.launch(engine==='chromium'?{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{}),row={engine,mobile,browser:await b.version(),checks:[],errors:[]};
 result.rows.push(row);
 try{
  for(const room of ['A','B','C','D']){
   const context=await b.newContext(mobile?{viewport:{width:844,height:390},isMobile:true,hasTouch:true}:{viewport:{width:1440,height:900}});
   const run=replayRun(room);
   if(room==='B')run.position={x:10.6,z:8.1};
   await context.addInitScript(({run,settings})=>{
    const seen=[];window.__soundscapeQA=seen;
    window.Audio=new Proxy(window.Audio,{construct(target,args,newTarget){const media=Reflect.construct(target,args,newTarget);seen.push(media);return media;}});
    localStorage.setItem('embers.investigation.v1',JSON.stringify(run));localStorage.setItem('embers.settings.v1',JSON.stringify(settings));
   },{run,settings:{...DEFAULT_SETTINGS,sound:true,device:mobile?'mobile':'desktop'}});
   const page=await context.newPage();page.on('pageerror',e=>row.errors.push(e.message));
   page.on('response',r=>{if(r.url().includes('room-rain-thunder')&&r.status()>=400)row.errors.push(r.status()+' '+r.url());});
   const button=(name,exact=true)=>page.getByRole('button',{name,exact}),tap=async(name,exact=true)=>mobile?button(name,exact).tap():button(name,exact).click();
   const state=()=>page.evaluate(()=>{const a=window.__soundscapeQA[1];return {src:a?.src,time:a?.currentTime,paused:a?.paused,loop:a?.loop,duration:a?.duration,volume:a?.volume,menuPaused:window.__soundscapeQA[0]?.paused};});
   const wait=async paused=>page.waitForFunction(p=>{const a=window.__soundscapeQA[1];return a&&a.paused===p&&(p||a.currentTime>0);},paused,{timeout:15000});
   await page.goto(url);await tap('繼續調查',false);await page.waitForFunction(()=>window.__EMBERS_DIAGNOSTICS__?.camera&&!document.querySelector('.scene-loading'),null,{timeout:45000});
   // A tap in the game also exercises Safari's gesture recovery after the room mount.
   await tap('指引');await tap('關閉 / Close');await wait(false);
   const first=await state();assert(first.src.endsWith('room-rain-thunder-v15.m4a')&&first.loop&&Math.abs(first.duration-48)<.05&&first.menuPaused);
   if(room==='A'){
    await page.evaluate(()=>window.__soundscapeQA[1].currentTime=47.55);
    await page.waitForFunction(()=>{const a=window.__soundscapeQA[1];return !a.seeking&&a.currentTime<2;});
    await tap('暫停');await wait(true);const held=(await state()).time;
    await page.waitForTimeout(350);assert(Math.abs((await state()).time-held)<.02);
    await tap('調查設定');
    await page.getByRole('checkbox',{name:'啟用聲音'}).uncheck();
    await tap('關閉 / Close');await wait(true);
    await tap('暫停');await tap('調查設定');
    await page.getByRole('checkbox',{name:'啟用聲音'}).check();
    await tap('關閉 / Close');await tap('指引');await tap('關閉 / Close');await wait(false);
    if(mobile){
     await page.keyboard.press('q');assert.equal(await page.locator('dialog[open]').count(),0);
     assert(await page.getByRole('group',{name:'移動搖桿'}).isVisible());
     await page.setViewportSize({width:390,height:844});await page.getByText('讓調查橫向展開').waitFor();await wait(true);
     await page.setViewportSize({width:844,height:390});await tap('指引');await tap('關閉 / Close');await wait(false);
    }
    await tap('暫停');await tap('調查檔案');
    await page.waitForFunction(()=>window.__soundscapeQA[1]?.paused&&!window.__soundscapeQA[1]?.getAttribute('src'));
    row.checks.push('loop wraps, pause preserves position, mute/unmute, and navigation releases weather'+(mobile?', mobile Q no-op and rotation':''));
   }
   row.checks.push(room+' starts looping and menu wind is paused');await context.close();
  }
  assert.deepEqual(row.errors,[]);row.pass=true;
 }catch(e){row.pass=false;row.failure=e.stack;console.error(e.stack);process.exitCode=1;}
 finally{await b.close();await writeFile(join(out,'soundscape.json'),JSON.stringify(result,null,2));}
}
