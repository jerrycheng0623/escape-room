import {createHash} from 'node:crypto';
import {readFile,mkdir,writeFile} from 'node:fs/promises';
import {resolve,join} from 'node:path';
import {tmpdir} from 'node:os';
import assert from 'node:assert/strict';

const root=resolve(import.meta.dirname,'..'),local=resolve(root,'public');
const base=process.env.EMBERS_URL||'http://127.0.0.1:5173/',out=process.env.EMBERS_QA_DIR||join(tmpdir(),'embers-media-http');
await mkdir(out,{recursive:true});
const report={date:new Date().toISOString(),base,method:'Compare the live index with prepared assets; verify complete bytes, MIME, byte-range contents, and every subtitle file.',files:[],subtitles:[]};
try{
 const expected=JSON.parse(await readFile(resolve(local,'media.json'),'utf8'));
 const index=await fetch(new URL('media.json?verify='+Date.now(),base));
 assert.equal(index.status,200);
 assert.deepEqual(await index.json(),expected,'Deployed and locally prepared media indexes differ');
 for(const film of expected){
  for(const {src,type} of film.sources){
   const url=new URL(src,base),name=src.split('/').at(-1),mime=type.split(';')[0];
   const bytes=await readFile(resolve(local,src)),sha256=createHash('sha256').update(bytes).digest('hex');
   const r=await fetch(url),hash=createHash('sha256');let length=0;
   for await(const chunk of r.body){hash.update(chunk);length+=chunk.length;}
   const digest=hash.digest('hex'),range=await fetch(url,{headers:{Range:'bytes=0-1023'}}),rangeBytes=Buffer.from(await range.arrayBuffer());
   const row={id:film.id,name,status:r.status,mime:r.headers.get('content-type'),bytes:length,sha256:digest,rangeStatus:range.status,contentRange:range.headers.get('content-range')};
   row.pass=r.status===200&&row.mime?.split(';')[0]===mime&&length===bytes.length&&digest===sha256&&range.status===206&&row.contentRange===`bytes 0-1023/${bytes.length}`&&rangeBytes.equals(bytes.subarray(0,1024));
   report.files.push(row);assert(row.pass,`Media HTTP mismatch: ${name}`);
  }
  for(const [lang,src] of Object.entries(film.tracks)){
   const r=await fetch(new URL(src,base)),text=await r.text(),expectedText=await readFile(resolve(local,src),'utf8');
   const row={id:film.id,lang,status:r.status,exactTextMatches:text===expectedText,pass:r.status===200&&text.startsWith('WEBVTT')&&text===expectedText};
   report.subtitles.push(row);assert(row.pass,`Subtitle HTTP mismatch: ${film.id} ${lang}`);
  }
 }
 report.pass=true;
}catch(e){report.pass=false;report.failure=e.stack;console.error(e.stack);process.exitCode=1;}
finally{await writeFile(join(out,'http-media-report.json'),JSON.stringify(report,null,2));console.log(JSON.stringify({pass:report.pass,files:report.files.length,subtitles:report.subtitles.length}));}
