import assert from 'node:assert/strict';
import {mkdir,writeFile} from 'node:fs/promises';
import {join} from 'node:path';
import {homedir,tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';

const {chromium,webkit,devices}=await import(pathToFileURL(process.env.PLAYWRIGHT_MODULE||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const url=process.env.EMBERS_URL||'http://127.0.0.1:5173/',out=process.env.EMBERS_QA_DIR||join(tmpdir(),'embers-settings-guidance'),rows=[];
await mkdir(out,{recursive:true});
for(const [engine,type,mobile] of [['chromium',chromium,false],['webkit',webkit,true]]){
 const b=await type.launch(engine==='chromium'?{args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']}:{}),c=await b.newContext(mobile?{...devices['iPhone 13'],viewport:{width:844,height:390}}:{viewport:{width:1440,height:900}});
 const p=await c.newPage(),row={engine,browser:await b.version(),mobile,hints:[],errors:[]};rows.push(row);
 p.on('pageerror',e=>row.errors.push(e.message));
 const button=(name,exact=true)=>p.getByRole('button',{name,exact});
 const go=async (name,exact=true)=>mobile?button(name,exact).tap():button(name,exact).click();
 const settings=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('embers.settings.v1')));
 const run=()=>p.evaluate(()=>JSON.parse(localStorage.getItem('embers.investigation.v1')));
 try{
  await p.goto(url);await go('設定');await p.locator('dialog select').nth(0).selectOption('en');await button('Begin investigation').waitFor();await p.locator('dialog select').nth(0).selectOption('zh-Hant');await button('開始調查').waitFor();await go('關閉 / Close');row.languageRoundtrip=true;
  await go('開始調查');await go(mobile?'手機':'電腦');await go('困難',false);assert.equal((await settings()).hint,'hard');await go('進入故事');await p.locator('.guide-nav button').last().click();await go('準備好了，進入故事');await go('略過動畫');await p.locator('.scene canvas').waitFor({timeout:45000});
  for(const [level,count] of [['novice',3],['standard',5],['hard',7]]){
   if(row.hints.length){await p.goto(url);await go('開始調查');await go(mobile?'手機':'電腦');await go(level==='standard'?'標準':'困難',false);await go('進入故事');await p.locator('.guide-nav button').last().click();await go('準備好了，進入故事');const before=await run();await go('取消，保留存檔');assert.deepEqual(await run(),before);await go('準備好了，進入故事');await go('確認開始新調查');await go('略過動畫');}
   else{await go('暫停');await go('調查設定');await p.locator('dialog select').nth(2).selectOption('novice');await go('關閉 / Close');if(await button('繼續調查').isVisible())await go('繼續調查');}
   assert.equal((await settings()).hint,level);await go('指引');for(let i=1;i<=count;i++){await go('再看一則指引');assert.equal(await p.locator('.hint-list p').count(),i);}
   assert(await button('指引已全部展開').isDisabled());await go('查看可調查區域');assert(await p.locator('.help-direction').isVisible());const state=await run();assert.equal(state.solved.length,0);assert(state.helpRooms.includes('A'));await go('關閉 / Close');
   await p.goto(url);await go('繼續調查',false);await go('指引');assert.equal(await p.locator('.hint-list p').count(),count);row.hints.push({level,count,reload:true,helpDoesNotSolve:true});await go('關閉 / Close');
  }
  assert.deepEqual(row.errors,[]);row.pass=true;
 }catch(e){row.pass=false;row.failure=e.stack;console.error(e.stack);await p.screenshot({path:join(out,'settings-'+engine+'-failure.png')});}
 finally{await b.close();await writeFile(join(out,'settings.json'),JSON.stringify({url,rows},null,2));}
}
if(rows.some(r=>!r.pass))process.exitCode=1;
