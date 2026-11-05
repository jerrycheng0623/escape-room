from pathlib import Path
import subprocess,json,hashlib,concurrent.futures,datetime,os,shutil
root=Path(__file__).resolve().parents[1];ff=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or str(Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1');old=json.loads((root/'assets/story-v5/manifest.json').read_text());out=root/'assets/playback-v6/video';out.mkdir(parents=True,exist_ok=True)
def build(seg):
 src=root/seg['video'];base=out/(seg['id']+'-compatible-v7');mp4=base.with_suffix('.mp4');webm=base.with_suffix('.webm')
 common=[ff,'-hide_banner','-loglevel','error','-y','-i',str(src),'-map','0:v:0','-map','0:a:0','-sn']
 subprocess.run(common+['-c','copy','-movflags','+faststart',str(mp4)],check=True)
 subprocess.run(common+['-c:v','libvpx-vp9','-pix_fmt','yuv420p','-deadline','realtime','-cpu-used','6','-row-mt','1','-threads','2','-crf','35','-b:v','0','-c:a','libopus','-ac','2','-b:a','80k',str(webm)],check=True)
 record={'id':seg['id'],'durationMs':seg['durationMs'],'original':seg['video'],'originalSha256':hashlib.sha256(src.read_bytes()).hexdigest(),'sources':[]}
 for p,mime in [(mp4,'video/mp4; codecs="avc1.64001F, mp4a.40.2"'),(webm,'video/webm; codecs="vp9, opus"')]:
  subprocess.run([ff,'-v','error','-i',str(p),'-f','null','-'],check=True,stdout=subprocess.DEVNULL)
  record['sources'].append({'path':str(p.relative_to(root)),'type':mime,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode':'passed'})
 print(seg['id'],'two compatible encodes + full decode passed',flush=True);return record
with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:records=list(pool.map(build,old['segments']))
(root/'assets/playback-v6/manifest.json').write_text(json.dumps({'version':7,'date':datetime.datetime.now().astimezone().isoformat(),'purpose':'Playback compatibility derivatives; original story-v5 images, sound and timing preserved. External VTT subtitles remain authoritative.','mp4':'Original H.264 High / AAC-LC streams copied / faststart; no embedded mov_text','webm':'VP9 / Opus stereo','segments':records},ensure_ascii=False,indent=2)+'\n')
