import {readFile, mkdir, copyFile,writeFile} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const web=resolve(import.meta.dirname,'..'), root=resolve(web,'..'),pub=resolve(web,'public');
const manifest=JSON.parse(await readFile(resolve(root,'assets/cinematics/manifest.json'),'utf8'));
async function copy(source,dest){ const to=resolve(pub,dest);await mkdir(dirname(to),{recursive:true});await copyFile(resolve(root,source),to); }
await Promise.all([copy('assets/web/optimized/menu.webp','media/menu.webp'),copy('3D/scene/rooms-layout-blockout-v1.glb','media/scene.glb'),copy('assets/cinematics/audio/sfx/wind-loop-synthetic-v1.wav','media/wind.wav'),copy('3D/previews/all-42-models-v1.png','media/model-overview.png')]);
const media=[];
for(const seg of manifest.segments){
 const video=`media/video/${seg.id}.mp4`,poster=`media/posters/${seg.id}.webp`,tracks={};
 await Promise.all([copy(seg.video,video),copy(`assets/web/optimized/${seg.id}.webp`,poster),...Object.entries(seg.subtitleTracks).map(async([lang,path])=>{tracks[lang]=`media/subtitles/${seg.id}-${lang}.vtt`;await copy(path,tracks[lang]);})]);
 media.push({id:seg.id,title:seg.title,duration:seg.durationMs/1000,video,poster,tracks});
}
const pictures={'watch':'assets/cinematics/CIN-A/images/A-04-v1.png','first-photo':'assets/cinematics/CIN-B/images/B-04-v1.png','last-photo':'assets/cinematics/CIN-B/images/B-02-v2.png','necklace':'assets/cinematics/CIN-C/images/C-04-v1.png','cabinet':'assets/cinematics/CIN-D/images/D-06-v1.png','exit-traces':'assets/cinematics/CIN-D/images/D-07-v1.png','reporter':'assets/cinematics/CIN-A/images/A-02-v1.png','weight':'assets/cinematics/CIN-C/images/C-05-v1.png','report':'assets/cinematics/CIN-D/images/D-01-v1.png'};
await Promise.all(Object.entries(pictures).map(([id,path])=>copy(`assets/web/optimized/${id}.webp`,`media/evidence/${id}.webp`)));
await writeFile(resolve(pub,'media.json'),JSON.stringify(media,null,2)+'\n');
console.log(`已準備${media.length}段影片、延遲載入場景與證物圖；不輸出未公開答案或作者完整真相。`);
