import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir,tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import {replayRun,worldAction,DEFAULT_SETTINGS} from '../src/game/storage.mjs';
import {WORLD} from '../src/game/world.mjs';
import {mobileTools} from './mobile-test-tools.mjs';
const {chromium,webkit}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const url=process.env.EMBERS_URL||'http://127.0.0.1:5173/',out=process.env.EMBERS_QA_DIR||join(tmpdir(),'embers-v17');
await mkdir(out,{recursive:true});const report={url,date:new Date().toISOString(),method:'Real guide input and Space key; room-specific saved fixtures for physical hatch inspection. Full new-game flow is separate.',rows:[]};
for(const [engine,type] of [['chromium',chromium],['webkit',webkit]]){
 const b=await type.launch(engine==='chromium'?{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{}),viewportCases=[[1440,900,false],[844,390,true],[390,844,true]];
 for(const [width,height,mobile] of viewportCases){
  const c=await b.newContext({viewport:{width,height},isMobile:mobile,hasTouch:mobile}),p=await c.newPage(),row={engine,mobile,width,height,browser:await b.version(),checks:[],errors:[]};report.rows.push(row);
  p.on('pageerror',e=>row.errors.push(e.message));p.on('console',e=>{if(e.type()==='error')row.errors.push(e.text());});
  const click=async(name,exact=true)=>{const el=p.getByRole('button',{name,exact});await el.scrollIntoViewIfNeeded();return mobile?el.tap():el.click();};
  const state=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('embers.investigation.v1')));
  const fixture=async run=>{
   await p.evaluate(({run,settings})=>{localStorage.setItem('embers.investigation.v1',JSON.stringify(run));localStorage.setItem('embers.settings.v1',JSON.stringify(settings));},{run,settings:{...DEFAULT_SETTINGS,device:mobile?'mobile':'desktop'}});
   await p.goto(url);await click('繼續調查',false);
   await p.waitForFunction(()=>window.__EMBERS_DIAGNOSTICS__?.camera&&window.__EMBERS_DIAGNOSTICS__.room===JSON.parse(localStorage.getItem('embers.investigation.v1')).room&&!document.querySelector('.scene-loading'),null,{timeout:45000});
   if(!mobile)await click('使用方向鍵探索');
   await p.waitForFunction(()=>!!window.__EMBERS_DIAGNOSTICS__?.targets);
  };
  try{
   await c.addInitScript(settings=>{if(!localStorage.getItem('embers.settings.v1'))localStorage.setItem('embers.settings.v1',JSON.stringify(settings));},{...DEFAULT_SETTINGS,lang:'en',device:mobile?'mobile':'desktop'});
   await p.goto(url);await click('Controls guide');await p.getByTestId('game-guide').waitFor();
   for(let i=0;i<7;i++){
    await p.locator('.guide-nav button').nth(i).click();
    const guide=p.getByTestId('game-guide');const text=await guide.innerText();
    assert(!/[\u3400-\u9fff]/.test(text),'Untranslated guide page '+i+': '+text);
    const labels=await guide.locator('[aria-label],[placeholder]').evaluateAll(es=>es.map(e=>[e.getAttribute('aria-label'),e.getAttribute('placeholder')].join(' ')).join(' '));
    assert(!/[\u3400-\u9fff]/.test(labels),'Untranslated accessible labels');
    assert.equal(await p.evaluate(()=>document.documentElement.scrollWidth>innerWidth+2),false);
    if(i===3){await p.getByLabel('Guide practice code',{exact:true}).fill('１２３４');assert.equal(await p.getByLabel('Guide practice code',{exact:true}).inputValue(),'1234');await click('Check practice code');await click('Pull practice handle');assert((await guide.innerText()).includes('The drawer is open'));}
    if(i===4){await p.keyboard.press('Space');assert(await p.getByText('Practice backpack open',{exact:true}).isVisible());await p.keyboard.press('Space');assert(await p.getByText('Practice backpack closed',{exact:true}).isVisible());await p.screenshot({path:join(out,engine+'-'+mobile+'-english-guide.png')});}
   }
   row.checks.push('All seven English guide pages, accessible labels and examples translated; practice code and Space work');
   if(height>width){row.pass=true;continue;}
   let run=worldAction(replayRun('A'),'a-fragment0','take');run.held=null;await fixture(run);
   await p.keyboard.press('Space');
   if(mobile){assert.equal(await p.locator('dialog[open]').count(),0);await click('背包');}
   else assert(await p.getByRole('heading',{name:'背包與可攜物'}).isVisible());
   await p.locator('.inventory-list').getByRole('button',{name:'拿在手上',exact:true}).first().click();assert.equal((await state()).held,'a-fragment0');
   if(mobile)await click('關閉 / Close');else await p.keyboard.press('Space');
   assert.equal(await p.locator('dialog[open]').count(),0);
   await click('證物整理頁');const notes=p.getByLabel('A區個人筆記');await notes.fill('my');await notes.press('End');await notes.press('Space');await notes.pressSequentially('note');assert.equal(await notes.inputValue(),'my note');assert.equal(await p.getByRole('heading',{name:'背包與可攜物'}).count(),0);await click('關閉 / Close');
   row.checks.push('Desktop Space toggles backpack and holds actual item; notes keep spaces; mobile controls unchanged');
   run=replayRun('C');for(const [id,verb] of [['c-box','move'],['c-rope','take'],['c-a0','place'],['c-m','place'],['c-f','place'],['c-basket','place'],['iron-0','take'],['c-basket','place'],['iron-1','take'],['c-basket','place']])run=worldAction(run,id,verb);
   run.position={x:-1.6,z:14.7};await fixture(run);
   const touch=mobile?mobileTools(p,engine==='chromium'?await c.newCDPSession(p):null):null;
   const target=()=>p.evaluate(()=>window.__EMBERS_DIAGNOSTICS__);
   for(let n=0;n<65;n++){
    const d=await target(),pos=d.targets['c-hatch']||WORLD['c-hatch'].pos;
    if(touch){await touch.lookAt(pos,.72);if(await p.getByRole('button',{name:/查看 檢修蓋$/}).isVisible())break;continue;}
    const dx=pos[0]-d.camera.x,dy=pos[1]-d.camera.y,dz=pos[2]-d.camera.z;let yaw=Math.atan2(-dx,-dz)-d.yaw;while(yaw>Math.PI)yaw-=Math.PI*2;while(yaw<-Math.PI)yaw+=Math.PI*2;const pitch=Math.atan2(dy,Math.hypot(dx,dz))-d.pitch;
    if(Math.abs(yaw)<.015&&Math.abs(pitch)<.015)break;
    const turn=Math.abs(yaw)>.015,key=turn?(yaw>0?'ArrowLeft':'ArrowRight'):(pitch>0?'ArrowUp':'ArrowDown');await p.keyboard.down(key);await p.waitForTimeout(Math.min(180,Math.max(12,(turn?Math.abs(yaw)/1.1:Math.abs(pitch)/.85)*850)));await p.keyboard.up(key);await p.waitForTimeout(120);
   }
   await click(/查看 檢修蓋$/);assert.equal(await p.getByRole('button',{name:'釋放低位固定扣',exact:true}).count(),0);assert.equal(await p.getByRole('button',{name:'輕轉維修手輪',exact:true}).count(),0);
   for(let i=0;i<3;i++){
    await click(new RegExp('^第 '+(i+1)+' 段'));const images=p.locator('.rope-pair img');assert.equal(await images.count(),2);
    await p.waitForFunction(()=>[...document.querySelectorAll('.rope-pair img')].every(e=>e.complete&&e.naturalWidth>0));
    assert(await p.getByText('起點',{exact:true}).isVisible());assert(await p.getByText('終點',{exact:true}).isVisible());
   }
   await p.screenshot({path:join(out,engine+'-'+mobile+'-rope.png')});
   assert(!(await state()).evidence.includes('weight'));await click('取出鑰匙與下緣項鍊');assert((await state()).solved.includes('C'));await click('關閉 / Close');await click('接續本章故事');assert((await state()).pendingFilm==='CIN-C');row.checks.push('Three image endpoint pairs and exact40 auto-open; separate collection advances with no optional records');
   assert.deepEqual(row.errors,[]);row.pass=true;
  }catch(e){row.pass=false;row.failure=e.stack;console.error(e.stack);await p.screenshot({path:join(out,engine+'-'+mobile+'-failure.png')});process.exitCode=1;}
  finally{await c.close();await writeFile(join(out,'release-v17.json'),JSON.stringify(report,null,2));}
 }
 await b.close();
}
