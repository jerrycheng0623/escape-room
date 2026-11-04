// Full natural playback at 1x; no seeking, skipping, ended injection or accelerated clock.
import {join} from 'node:path';
import {homedir,tmpdir} from 'node:os';
import {pathToFileURL} from 'node:url';
import fs from 'node:fs/promises';
const runtime=process.env.PLAYWRIGHT_MODULE||join(homedir(),'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.mjs');
const completed=JSON.parse(await fs.readFile(new URL('../../assets/final-v14/verification/completed-desktop.json',import.meta.url),'utf8'));
const {chromium,webkit,devices}=await import(pathToFileURL(runtime).href);
const url=process.env.EMBERS_URL||'http://127.0.0.1:5173/',out=process.env.EMBERS_QA_DIR||join(tmpdir(),'embers-media-qa');
await fs.mkdir(out,{recursive:true});
const engine=process.env.EMBERS_BROWSER==='webkit'?'webkit':'chromium';const browser=await (engine==='webkit'?webkit:chromium).launch(engine==='webkit'?{headless:true}:{headless:true,args:['--use-angle=swiftshader','--enable-unsafe-swiftshader']});
const report={date:new Date().toISOString(),url,browser:await browser.version(),engine,fallback:'Browser plugin not available; native in-app browser checked separately',method:'1x natural playback from 0 to ended; both layouts and primary/fallback formats; isolated profiles',runs:[]};
async function run(device,format){
 const id=device+'-'+format,c=await browser.newContext(device==='mobile'?{...(engine==='webkit'?devices['iPhone 13']:{}),viewport:{width:844,height:390},isMobile:true,hasTouch:true,deviceScaleFactor:2}:{viewport:{width:1440,height:900}}),p=await c.newPage();
 const row={device,format,url,films:[],errors:[],requestsFailed:[]};report.runs.push(row);p.setDefaultTimeout(20000);
 p.on('pageerror',e=>row.errors.push(e.message));p.on('requestfailed',r=>{if(!(format==='fallback'&&r.url().endsWith('.mp4')))row.requestsFailed.push({url:r.url(),error:r.failure()?.errorText})});
 if(format==='fallback')await c.route('**/*compatible-v*.mp4',r=>r.abort());
 await p.addInitScript(()=>{
  window.__FILM_QA__=[];const attached=new WeakSet();
  const attach=v=>{if(attached.has(v))return;attached.add(v);let start=performance.now();let previous=-1,stalls=0,samples=[];
   const timer=setInterval(()=>{if(v.isConnected&&!v.paused&&!v.ended){if(v.currentTime===previous)stalls++;previous=v.currentTime;samples.push({time:v.currentTime,ready:v.readyState,paused:v.paused,rate:v.playbackRate})}if(!v.isConnected)clearInterval(timer)},3000);
   v.addEventListener('ended',()=>{clearInterval(timer);const q=v.getVideoPlaybackQuality?.();window.__FILM_QA__.push({src:v.currentSrc,duration:v.duration,endedAt:v.currentTime,wallSeconds:(performance.now()-start)/1000,ended:v.ended,rate:v.playbackRate,frames:q?.totalVideoFrames||v.webkitDecodedFrameCount,dropped:q?.droppedVideoFrames,width:v.videoWidth,height:v.videoHeight,samples,stalls})});
  };
  new MutationObserver(()=>document.querySelectorAll('video').forEach(attach)).observe(document,{childList:true,subtree:true});
 });
 const action=async locator=>device==='mobile'?locator.tap():locator.click();
 try{
  await p.addInitScript(r=>localStorage.setItem('embers.investigation.v1',JSON.stringify(r)),completed);await p.goto(url);await action(p.getByRole('button',{name:'調查檔案',exact:true}));
  const indices=process.env.EMBERS_MEDIA_FILMS?process.env.EMBERS_MEDIA_FILMS.split(',').map(Number):[0,1,2,3,4,5,6];for(const i of indices){
   const previous=await p.evaluate(()=>window.__FILM_QA__.length);
   await action(p.locator('.film-tile').nth(i));
   await p.waitForFunction(()=>{const v=document.querySelector('video');return v&&v.readyState>=2},{},{timeout:45000});
   if(await p.locator('video').evaluate(v=>v.paused))await action(p.getByRole('button',{name:'播放動畫',exact:true}).first());
   const expected=await p.locator('video').evaluate(v=>v.duration);await p.waitForFunction(()=>document.querySelector('video')?.currentTime>.2);
   if(i===0)await p.screenshot({path:join(out,id+'-playing.png')});
   await p.waitForFunction(n=>window.__FILM_QA__.length>n,previous,{timeout:Math.ceil((expected+45)*1000)});
   const film=await p.evaluate(()=>window.__FILM_QA__.at(-1));film.pass=film.ended&&film.rate===1&&film.endedAt>=film.duration-.15&&film.frames>0&&film.width===1280&&film.height===720&&(format==='fallback'?film.src.endsWith('.webm'):film.src.endsWith('.mp4'));
   await p.getByRole('heading',{name:'灰燼裡，留下了名字。',exact:true}).waitFor();film.returnedToArchive=true;
   row.films.push(film);if(!film.pass)throw Error('Full playback did not meet criteria: '+film.src);
   await fs.writeFile(join(out,id+'.json'),JSON.stringify(row,null,2));console.log(id,i+1+'/7',film.duration+'s',film.frames+' frames','natural ended + archive passed');
  }
  row.pass=row.films.length===indices.length&&!row.errors.length;
 }catch(e){row.failure=e.stack;row.pass=false;row.failureMedia=await p.locator('video').evaluateAll(vs=>vs.map(v=>({src:v.currentSrc,time:v.currentTime,duration:v.duration,paused:v.paused,ended:v.ended,ready:v.readyState,network:v.networkState,error:v.error?.code,hidden:document.hidden,rate:v.playbackRate,frames:v.getVideoPlaybackQuality?.()?.totalVideoFrames||v.webkitDecodedFrameCount})));row.observedEnds=await p.evaluate(()=>window.__FILM_QA__);await p.screenshot({path:join(out,id+'-failure.png')});console.error(id,e.stack);}
 finally{await fs.writeFile(join(out,id+'.json'),JSON.stringify(row,null,2));await c.close();}
}
const matrix=(process.env.EMBERS_MEDIA_MATRIX||'desktop:primary,desktop:fallback,mobile:primary,mobile:fallback').split(',').map(x=>x.split(':'));
try{await Promise.all(matrix.map(([device,format])=>run(device,format)));}
finally{await fs.writeFile(join(out,'full-playback-report.json'),JSON.stringify(report,null,2));await browser.close();}
if(report.runs.some(r=>!r.pass))process.exitCode=1;
