"""Replace two obsolete-mechanic shots; retain original sound and all released URLs."""
from pathlib import Path
import json,subprocess,hashlib,shutil,textwrap
root=Path(__file__).resolve().parents[1];ff=Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';out=root/'assets/story-v9/video';out.mkdir(parents=True,exist_ok=True);cache=Path('/tmp/embers-film-v9');cache.mkdir(exist_ok=True)
manifest=json.loads((root/'assets/playback-v6/manifest.json').read_text());story=json.loads((root/'assets/story-v5/storyboard.json').read_text());docs=json.loads((root/'assets/story/content-v5.json').read_text())['documents']
def run(args):subprocess.run([str(ff),'-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
for sid,start,seconds,src in [('CIN-A',9,9,root/'assets/art-redesign-v4/images/A-02.png'),('CIN-D',0,12,root/'assets/world-v4/previews/clinic-source.png')]:
 seg=next(s for s in manifest['segments'] if s['id']==sid);original=root/'assets/playback-v6/video'/f'{sid}-compatible-v7.mp4';duration=seg['durationMs']/1000;files=[]
 if start:
  before=cache/(sid+'-before.mp4');run(['-i',original,'-t',start,'-map','0:v:0','-an','-c:v','copy',before]);files.append(before)
 clip=cache/(sid+'-new.mp4');vf=['scale=1280:720:force_original_aspect_ratio=decrease','pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x100e0b','setsar=1']
 if sid=='CIN-D':
  title=cache/'title.txt';body=cache/'body.txt';title.write_text('張萍保留的完整案史');body.write_text('\n'.join(line for paragraph in docs['report']['body'].split('\n') for line in textwrap.wrap(paragraph,23)))
  vf+=['drawbox=x=700:y=48:w=544:h=566:color=0x18140f@0.93:t=fill',f"drawtext=fontfile='/System/Library/Fonts/STHeiti Medium.ttc':textfile='{title}':x=732:y=85:fontsize=28:fontcolor=0xf0dfb9",f"drawtext=fontfile='/System/Library/Fonts/STHeiti Medium.ttc':textfile='{body}':x=732:y=145:fontsize=21:line_spacing=12:fontcolor=0xdecba6"]
 vf+=['fade=t=in:st=0:d=0.35',f'fade=t=out:st={seconds-.4}:d=0.4']
 run(['-loop','1','-i',src,'-vf',','.join(vf),'-t',seconds,'-r','24','-an','-c:v','libx264','-profile:v','high','-level:v','3.1','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-threads','2',clip]);files.append(clip)
 after=cache/(sid+'-after.mp4');run(['-ss',start+seconds,'-i',original,'-map','0:v:0','-an','-c:v','copy',after]);files.append(after)
 listing=cache/(sid+'.txt');listing.write_text('\n'.join("file '"+str(p)+"'" for p in files));master=out/(sid+'-story-v9.mp4');run(['-f','concat','-safe','0','-i',listing,'-i',original,'-map','0:v:0','-map','1:a:0','-c','copy','-t',duration,'-movflags','+faststart',master])
 primary=root/'assets/playback-v6/video'/(sid+'-compatible-v9.mp4');shutil.copy2(master,primary)
 fallback=root/'assets/playback-v6/video'/(sid+'-fallback-v9.webm');run(['-i',master,'-map','0:v:0','-map','0:a:0','-c:v','libvpx-vp9','-crf','35','-b:v','0','-deadline','good','-cpu-used','4','-threads','2','-c:a','libopus','-b:a','96k',fallback])
 seg.setdefault('priorOriginal',seg['original']);seg['original']=str(master.relative_to(root));seg['originalSha256']=hashlib.sha256(master.read_bytes()).hexdigest()
 seg['sources']=[{'path':str(p.relative_to(root)),'type':t,'bytes':p.stat().st_size,'sha256':hashlib.sha256(p.read_bytes()).hexdigest(),'decode':'pending'} for p,t in [(primary,'video/mp4; codecs="avc1.64001F, mp4a.40.2"'),(fallback,'video/webm; codecs="vp9, opus"')]]
 print(sid,'新版鏡頭與原音軌完成',flush=True)
manifest['version']=9;manifest['purpose']='v9 replaces A old code-box shot and D UV shot; rest of each film and original sound retained. All released URLs kept immutable.';manifest['mp4']='H.264 High/yuv420p and AAC-LC, faststart, no embedded subtitle track';(root/'assets/playback-v6/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
