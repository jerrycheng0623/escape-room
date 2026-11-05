// Completed-fixture seeking audit: separate from natural playback tests.
import fs from 'node:fs/promises';import {join,resolve} from 'node:path';import {homedir,tmpdir} from 'node:os';import {pathToFileURL} from 'node:url';
const completed=JSON.parse(await fs.readFile(new URL('../../assets/final-v14/verification/completed-desktop.json',import.meta.url),'utf8'));
const {chromium,webkit,devices}=await import(pathToFileURL(join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs')).href);
const timeline=JSON.parse(await fs.readFile(new URL('../../assets/story-v10/timeline.json',import.meta.url))),url=process.env.EMBERS_URL||'http://127.0.0.1:5173/',out=process.env.EMBERS_QA_DIR||join(tmpdir(),'embers-caption-alignment');await fs.mkdir(out,{recursive:true});
const report={date:new Date().toISOString(),url,method:'Browser plugin not available; Playwright. Completed-fixture archive seeking verifies every shot in zh-Hant and en, not a natural-playback claim. Film frame identity checked separately.',cases:[]};
for(const [engine,btype,profile]of [['chromium',chromium,{viewport:{width:1440,height:900}}],['webkit',webkit,{...devices['iPhone 13'],viewport:{width:844,height:390}}]]){
 const b=await btype.launch({headless:true});
 for(const fallback of [false,true]){
 const c=await b.newContext(profile),p=await c.newPage(),row={engine,browser:await b.version(),viewport:profile.viewport,format:fallback?'webm':'mp4',checks:[],errors:[]};report.cases.push(row);p.on('pageerror',e=>row.errors.push(e.message));
 if(fallback)await c.route('**/*compatible-v*.mp4',r=>r.abort());
 const action=async l=>engine==='webkit'?l.tap():l.click();
 try{
 await p.addInitScript(r=>localStorage.setItem('embers.investigation.v1',JSON.stringify(r)),completed);await p.goto(url);row.title=await p.title();if(!row.title.includes('餘燼'))throw Error('Wrong page');await action(p.getByRole('button',{name:'調查檔案',exact:true}));
 for(let i=0;i<timeline.segments.length;i++){
  const film=timeline.segments[i];await action(p.locator('.film-tile').nth(i));await p.waitForFunction(()=>document.querySelector('video')?.readyState>=2);await action(p.getByRole('button',{name:'暫停動畫',exact:true}));
  const source=await p.locator('video').evaluate(v=>v.currentSrc);if(!source.includes('-v'+(process.env.EMBERS_CINEMATIC_AUDIO_VERSION||'11')+'.')||!source.endsWith(fallback?'.webm':'.mp4'))throw Error('Wrong active release: '+source);
  for(const shot of film.shots){
   const time=Math.round((shot.start+shot.end)*5)/10;await p.getByLabel('影片進度',{exact:true}).fill(String(time));await p.waitForFunction(t=>Math.abs(document.querySelector('video').currentTime-t)<.15&&!document.querySelector('video').seeking,time);
   for(const [lang,key]of [['zh-Hant','zh'],['en','en']]){
    await p.getByLabel('影片字幕',{exact:true}).selectOption(lang);
    await p.waitForFunction(({lang,expected})=>{const v=document.querySelector('video'),track=[...v.textTracks].find(t=>t.language===lang);return track?.mode==='showing'&&[...track.activeCues||[]].some(c=>c.text===expected)},{lang,expected:shot[key]});
    row.checks.push({film:film.id,index:shot.index,time,lang,person:shot.person,expected:shot[key],pass:true});
   }
   if(!fallback&&film.id==='CIN-00'&&shot.person==='reporter'){
    await p.getByLabel('影片字幕',{exact:true}).selectOption('zh-Hant');await p.screenshot({path:join(out,engine+'-reporter-aligned.png')});
   }
  }
  await action(p.getByRole('button',{name:'結束回看',exact:true}));
 }
 if(await p.locator('vite-error-overlay').count())throw Error('Framework overlay');row.pass=!row.errors.length;
 }catch(e){row.pass=false;row.failure=e.stack;console.error(e.stack);await p.screenshot({path:join(out,engine+'-'+row.format+'-failure.png')});}
 finally{await c.close();await fs.writeFile(join(out,'browser-alignment.json'),JSON.stringify(report,null,2));console.log(engine,row.format,row.pass,row.checks.length);}
 }
 await b.close();
}
if(report.cases.some(c=>!c.pass))process.exitCode=1;
