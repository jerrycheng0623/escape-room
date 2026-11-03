import {readFile,mkdir,copyFile,writeFile,rm} from 'node:fs/promises';
import {resolve,dirname} from 'node:path';
const web=resolve(import.meta.dirname,'..'),root=resolve(web,'..'),pub=resolve(web,'public');
const manifest=JSON.parse(await readFile(resolve(root,'assets/story-v5/manifest.json'),'utf8'));
const story=JSON.parse(await readFile(resolve(root,'assets/story-v5/storyboard.json'),'utf8'));
const content=JSON.parse(await readFile(resolve(root,'assets/story/content-v5.json'),'utf8'));
async function copy(src,dst){const to=resolve(pub,dst);await mkdir(dirname(to),{recursive:true});await copyFile(resolve(root,src),to);}
await rm(resolve(pub,'media'),{recursive:true,force:true});
await Promise.all(['burned-plaster','scorched-wood'].map(id=>copy(`assets/scene-v6/textures/${id}.png`,`media/scene-v6/${id}.png`)));
const {SPACE,PLAYER_RADIUS,EYE_HEIGHT,WALL_TRIM_CLEARANCE}=await import('../src/game/space.mjs');
await writeFile(resolve(root,'3D/scene/enclosed-v6-layout.json'),JSON.stringify({version:6,playerRadius:PLAYER_RADIUS,eyeHeight:EYE_HEIGHT,wallTrimClearance:WALL_TRIM_CLEARANCE,rooms:SPACE,modelSource:'web/src/game/roomModels.js'},null,2)+'\n');
await Promise.all([copy(manifest.menu,'media/menu.webp'),copy('assets/story-v5/audio/sfx/wind-loop-synthetic-v1.wav','media/wind.wav')]);
const media=[];
for(const seg of manifest.segments){const video=`media/video/${seg.id}.mp4`,poster=`media/posters/${seg.id}.webp`,tracks={};await Promise.all([copy(seg.video,video),copy(seg.poster,poster),...Object.entries(seg.subtitleTracks).map(async([lang,path])=>{tracks[lang]=`media/subtitles/${seg.id}-${lang}.vtt`;await copy(path,tracks[lang]);})]);let at=0;const transcript=story[seg.id].shots.map(s=>{const item={start:at,end:at+s.seconds,zh:s.zh,en:s.en,text:s.text,document:s.document};at+=s.seconds;return item;});media.push({id:seg.id,title:seg.title,titleEn:seg.titleEn,duration:seg.durationMs/1000,video,poster,tracks,transcript});}
await Promise.all(Object.keys(content.documents).flatMap(id=>[copy(`assets/story-v5/web/evidence/${id}.webp`,`media/evidence/${id}.webp`),copy(`assets/story-v5/web/documents/${id}.svg`,`media/documents/${id}.svg`)]));
await Promise.all(content.characters.map(c=>copy(`assets/story-v5/web/portraits/${c.id}.png`,`media/portraits/${c.id}.png`)));
await writeFile(resolve(pub,'media.json'),JSON.stringify(media,null,2)+'\n');
console.log(`已準備新版${media.length}段故事、26份文書、5位角色及3D場景。`);
