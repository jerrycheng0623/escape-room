"""依新版鏡頭時間重新配置原創音效，不循環含舊提示點的混音。"""
from pathlib import Path
import json,sys,subprocess,shutil,hashlib
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/story-v5';sys.path.insert(0,str(Path.home()/'.cache/codex-video-tools'));import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe();STORY=json.loads((OUT/'storyboard.json').read_text());M=json.loads((OUT/'manifest.json').read_text());SFX=OUT/'audio/sfx';SFX.mkdir(exist_ok=True)
for p in (ROOT/'assets/art-redesign-v4/audio/sfx').glob('*'):shutil.copy2(p,SFX/p.name)
for seg in M['segments']:
 sid=seg['id'];duration=seg['durationMs']/1000;events=[];at=0
 for s in STORY[sid]['shots']:
  if s['document']:events.append(('paper',at+.3,.35))
  if s['image']=='END-PLATE' and sid=='CIN-END' and '森林出口' in s['zh']:events.append(('footsteps',at+.4,.7))
  if s['image']=='END-04':events += [('swallow',at+1,.75),('sensor-reset',at+4,.6)]
  if s['image']=='D-06':events.append(('cabinet-slide',at+.6,.5))
  at+=s['seconds']
 args=[FF,'-hide_banner','-loglevel','error','-y','-i',str(ROOT/seg['video']),'-f','lavfi','-i',f'anoisesrc=color=brown:amplitude=0.045:r=44100:d={duration}']
 for name,_,_ in events:args+=['-i',str(SFX/f'{name}-synthetic-v1.wav')]
 filters=['[1:a]highpass=f=35,lowpass=f=480,volume=0.8[bed]'];labels=['[bed]']
 for i,(_,at,vol) in enumerate(events,2):filters.append(f'[{i}:a]volume={vol},adelay={int(at*1000)}|{int(at*1000)}[s{i}]');labels.append(f'[s{i}]')
 filters.append(''.join(labels)+f'amix=inputs={len(labels)}:normalize=0,alimiter=limit=0.8,afade=t=in:d=1,afade=t=out:st={duration-1}:d=1[a]')
 tmp=OUT/'video'/f'{sid}-aligned.mp4';args+=['-filter_complex',';'.join(filters),'-map','0:v:0','-map','[a]','-map','0:s?','-c:v','copy','-c:a','aac','-b:a','144k','-c:s','copy','-t',str(duration),'-movflags','+faststart',str(tmp)];subprocess.run(args,check=True);tmp.replace(ROOT/seg['video']);seg['sha256']=hashlib.sha256((ROOT/seg['video']).read_bytes()).hexdigest();seg['audioEvents']=[{'sound':n,'seconds':at,'volume':v} for n,at,v in events];print(sid,'音軌完成',flush=True)
M['sound']='依v5鏡頭時間重新混製低頻環境音與原創音效；無真人配音';(OUT/'manifest.json').write_text(json.dumps(M,ensure_ascii=False,indent=2)+'\n')
