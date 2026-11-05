"""Rebuild all active films from the authoritative storyboard; immutable v10 outputs.
Every shot has a content-addressed cache and exactly seconds*24 frames. Typography,
portrait selection, external captions and verification use the same shot record.
No import of historical builders, whose module-level code rewrites current scripts.
"""
from pathlib import Path
import json,subprocess,hashlib,unicodedata,datetime,shutil,concurrent.futures,struct
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/story-v10';OUT.mkdir(exist_ok=True)
CACHE=OUT/'.render-cache';CACHE.mkdir(exist_ok=True)
FF=Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1'
FONT='/System/Library/Fonts/STHeiti Medium.ttc'
STORY=json.loads((ROOT/'assets/story-v5/storyboard.json').read_text());DATA=json.loads((ROOT/'assets/story/content-v5.json').read_text());CHARS={c['id']:c for c in DATA['characters']}
PLAY=json.loads((ROOT/'assets/playback-v6/manifest.json').read_text());BASE=json.loads((ROOT/'assets/story-v5/manifest.json').read_text())
def run(args):
 r=subprocess.run([str(FF),'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr[-4000:])
 return r

def wrap(txt,n=23):
 lines=[]
 for par in txt.split('\n'):
  line='';width=0
  for ch in par:
   w=1 if unicodedata.east_asian_width(ch) in 'WF' else .56
   if width+w>n and line:lines.append(line);line='';width=0
   line+=ch;width+=w
  lines.append(line)
 return '\n'.join(lines)

def stamp(t):
 ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
 return f'{h:02}:{m:02}:{s:02}.{ms:03}'

def source(s):
 if s.get('person'):return ROOT/'assets/art-redesign-v4/portraits'/f"{s['person']}.png"
 return ROOT/s.get('sourceArt',f"assets/art-redesign-v4/images/{s['image']}.png")

# Explicit scene associations; do not use present-day Liu Han to illustrate the old fire.
STORY['CIN-D']['shots'][1]['sourceArt']='assets/world-v4/previews/old.webp'
STORY['CIN-D']['shots'][1]['visualContext']='五年前山屋舊片；空景，無本次聚會人物；舊事由字幕敘述，沒有以劉涵代替親屬。'
# The old wide grill art contains a fabricated 65.3 display. Use the validated
# fixed-base 65.0 image and identify this as the historical display, not the lifting load.
STORY['CIN-C']['shots'][5].update(image='C-05',document='key',text=wrap(DATA['documents']['key']['body']),zh='滑輪配重抬起檢修蓋後，我取得地下室內門鑰匙；底座顯示的六十五公斤仍是歷史紀錄。',en='After the pulley counterweight raised the service cover, I retrieved the inner-door key. The base’s 65 kg display remained the historical record.')
STORY['CIN-END']['shots'][1].update(image='00-04',visualContext='當晚火災後廢墟，配合真相重建敘述；不將歷史秤重畫面冒充縱火動作。')
for seg in STORY.values():
 for sh in seg['shots']:
  if sh['image']=='D-01-v9':sh['sourceArt']='assets/world-v4/previews/clinic-source.png'
  if sh.get('document')=='recording':sh['text']=sh['text'].replace('合照前遭襲','最後合照前遭襲')

def demux_source(src):
 # Preserve all original image bytes. For FFmpeg only, strip bytes after PNG IEND;
 # IHDR/IDAT/pixels and their CRCs are unchanged. Some image2 loops stop on that tail.
 b=src.read_bytes()
 if not b.startswith(b'\x89PNG\r\n\x1a\n'):return src
 at=8
 while at+12<=len(b):
  size=struct.unpack('>I',b[at:at+4])[0];tag=b[at+4:at+8];at+=size+12
  if tag==b'IEND':
   if at<len(b):
    clean=CACHE/(hashlib.sha256(b).hexdigest()+'-iend.png');clean.write_bytes(b[:at]);return clean
   return src
 raise ValueError('PNG has no IEND: '+str(src))

def render_shot(sid,i,sh):
 src=source(sh);signature=hashlib.sha256(src.read_bytes()+json.dumps(sh,sort_keys=True,ensure_ascii=False).encode()+b'v10-fit-complete-24fps-clean-iend').hexdigest()[:20]
 dest=CACHE/f'{sid}-{i:02}-{signature}.mp4'
 title='';body=sh.get('text','')
 if sh.get('person'):
  c=CHARS[sh['person']];title=c['name']+'｜'+c['role'];body=wrap(c['intro'] if sid=='CIN-00' else c['truth'])
 elif sh.get('document'):
  title=DATA['documents'][sh['document']]['name']+(f" {sh['page']}/{sh['pages']}" if sh.get('pages',1)>1 else '')
 panel=bool(title)
 # Fit, never crop: the right-hand document must not conceal people in the photographs.
 vf=['fps=24','setpts=PTS-STARTPTS']
 if panel:
  vf+=['scale=680:620:force_original_aspect_ratio=decrease','pad=1280:720:10:(oh-ih)/2:color=0x100e0b','setsar=1','drawbox=x=700:y=48:w=544:h=566:color=0x18140f@0.96:t=fill','drawbox=x=710:y=58:w=524:h=546:color=0xb59b6b@0.6:t=2']
  tp=CACHE/f'{signature}-title.txt';bp=CACHE/f'{signature}-body.txt';tp.write_text(title);bp.write_text(body)
  vf += [f"drawtext=fontfile='{FONT}':textfile='{tp}':x=732:y=85:fontsize=28:fontcolor=0xf0dfb9",f"drawtext=fontfile='{FONT}':textfile='{bp}':x=732:y=145:fontsize=21:line_spacing=12:fontcolor=0xdecba6"]
 else:vf+=['scale=1280:720:force_original_aspect_ratio=decrease','pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x100e0b','setsar=1']
 vf+=['fade=t=in:st=0:d=0.35',f"fade=t=out:st={sh['seconds']-.4}:d=0.4"]
 if not dest.exists() or dest.stat().st_size<1000:
  run(['-f','image2','-loop','1','-framerate','24','-i',demux_source(src),'-vf',','.join(vf),'-frames:v',round(sh['seconds']*24),'-r','24','-an','-c:v','libx264','-profile:v','high','-level:v','3.1','-video_track_timescale','12288','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-threads','2',dest])
 return {'file':str(dest.relative_to(ROOT)),'sourceArt':str(src.relative_to(ROOT)),'sha256':hashlib.sha256(src.read_bytes()).hexdigest(),'person':sh.get('person'),'characterName':CHARS[sh['person']]['name'] if sh.get('person') else None,'frames':round(sh['seconds']*24),'title':title}

def build(seg):
 sid=seg['id'];timeline=[];files=[];at=0
 for i,sh in enumerate(STORY[sid]['shots']):
  row=render_shot(sid,i,sh);files.append(ROOT/row['file']);timeline.append({**row,'index':i,'start':at,'end':at+sh['seconds'],'zh':sh['zh'],'en':sh['en']});at+=sh['seconds']
 listing=CACHE/f'{sid}.txt';listing.write_text('\n'.join("file '"+str(p)+"'" for p in files))
 old=ROOT/'assets/playback-v6/video'/f"{sid}-compatible-{'v9' if sid in ['CIN-A','CIN-D'] else 'v7'}.mp4";master=OUT/f'{sid}-aligned-v10.mp4'
 run(['-f','concat','-safe','0','-i',listing,'-i',old,'-map','0:v:0','-map','1:a:0','-c','copy','-t',at,'-movflags','+faststart',master])
 video=ROOT/'assets/playback-v6/video'/f'{sid}-compatible-v10.mp4';shutil.copy2(master,video)
 webm=video.with_suffix('.webm');run(['-i',master,'-map','0:v:0','-map','0:a:0','-c:v','libvpx-vp9','-deadline','realtime','-cpu-used','6','-row-mt','1','-threads','2','-crf','30','-b:v','0','-c:a','libopus','-ac','2','-b:a','96k',webm])
 tracks={}
 for lang,col in [('zh-Hant','zh'),('en','en')]:
  p=OUT/f'{sid}-{lang}-aligned-v10.vtt';lines=['WEBVTT','']
  for row in timeline:lines += [f"{stamp(row['start']+.35)} --> {stamp(row['end']-.35)}",row[col],'']
  p.write_text('\n'.join(lines));tracks[lang]=str(p.relative_to(ROOT))
 poster=OUT/f'{sid}-v10.webp';run(['-ss','2','-i',master,'-frames:v','1',poster])
 seg.setdefault('alignmentPriorOriginal',seg['original']);seg['original']=str(master.relative_to(ROOT));seg['originalSha256']=hashlib.sha256(master.read_bytes()).hexdigest();seg['durationMs']=round(at*1000)
 seg['sources']=[{'path':str(p.relative_to(ROOT)),'type':mime,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode':'pending'} for p,mime in [(video,'video/mp4; codecs="avc1.64001F, mp4a.40.2"'),(webm,'video/webm; codecs="vp9, opus"')]]
 baseline=next(s for s in BASE['segments'] if s['id']==sid);baseline.update(video=str(master.relative_to(ROOT)),poster=str(poster.relative_to(ROOT)),subtitleTracks=tracks,sha256=seg['originalSha256'])
 print(sid,len(timeline),'幕',at,'秒重新對齊',flush=True)
 return {'id':sid,'duration':at,'frames':round(at*24),'shots':timeline,'audioSource':str(old.relative_to(ROOT)),'sources':seg['sources'],'tracks':tracks,'poster':str(poster.relative_to(ROOT))}
if __name__=='__main__':
 with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:results=list(pool.map(build,PLAY['segments']))
 (OUT/'timeline.json').write_text(json.dumps({'version':10,'fps':24,'segments':results},ensure_ascii=False,indent=2)+'\n')
 (ROOT/'assets/story-v5/storyboard.json').write_text(json.dumps(STORY,ensure_ascii=False,indent=2)+'\n')
 PLAY.update(version=10,date=datetime.datetime.now().astimezone().isoformat(),purpose='All seven films rebuilt with exact frame counts and one shared shot/caption timeline. Full photographs remain visible. Released URLs preserved.')
 (ROOT/'assets/playback-v6/manifest.json').write_text(json.dumps(PLAY,ensure_ascii=False,indent=2)+'\n');(ROOT/'assets/story-v5/manifest.json').write_text(json.dumps(BASE,ensure_ascii=False,indent=2)+'\n')
