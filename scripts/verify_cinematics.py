from pathlib import Path
import sys,json,subprocess,re,wave,hashlib
from concurrent.futures import ThreadPoolExecutor
import numpy as np
ROOT=Path(__file__).resolve().parents[1];P=ROOT/'assets/cinematics'
sys.path.insert(0,str(Path.home()/'.cache/codex-video-tools'))
import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe()
m=json.loads((P/'manifest.json').read_text())
def check(s):
 f=ROOT/s['video']
 assert f.exists() and hashlib.sha256(f.read_bytes()).hexdigest()==s['sha256']
 r=subprocess.run([FF,'-hide_banner','-i',str(f),'-map','0:v:0','-map','0:a:0','-progress','pipe:1','-f','null','-'],capture_output=True,text=True)
 assert r.returncode==0,r.stderr
 for expected in ['Video: h264','Audio: aac','1280x720','Subtitle: mov_text']:
  assert expected in r.stderr,(s['id'],expected)
 assert r.stderr.count('Subtitle: mov_text')==2
 for lang,path in s['subtitleTracks'].items():
  t=(ROOT/path).read_text();assert t.startswith('WEBVTT')
  assert len(re.findall(r' --> ',t))==len(s['sourceImages'])
 for a in s['sourceImages']:assert (ROOT/a).exists()
 dur=re.search(r'Duration: (\d+):(\d+):(\d+\.\d+)',r.stderr)
 h,mi,se=map(float,dur.groups());seconds=h*3600+mi*60+se
 assert abs(seconds-s['durationMs']/1000)<.15
 wav=ROOT/s.get('audioFile','assets/cinematics/audio/'+s['id']+'-procedural-v1.wav')
 with wave.open(str(wav),'rb') as w:x=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(float)/32768
 peak=float(np.max(np.abs(x)));rms=float(np.sqrt(np.mean(x*x)))
 assert 0<peak<.95
 snap=P/'verification'/(s['id']+'-sample.png')
 at=24.5 if s['id']=='CIN-END' else (s['durationMs']/1000/2)
 q=subprocess.run([FF,'-hide_banner','-loglevel','error','-y','-ss',str(at),'-i',str(f),'-frames:v','1',str(snap)],capture_output=True,text=True)
 assert q.returncode==0,q.stderr
 result={'id':s['id'],'fullDecode':'pass','width':1280,'height':720,'durationSeconds':seconds,'videoCodec':'h264','audioCodec':'aac','subtitleTracks':2,'peak':round(peak,4),'rms':round(rms,4),'bytes':f.stat().st_size,'sample':str(snap.relative_to(ROOT))}
 print(json.dumps(result,ensure_ascii=False),flush=True)
 return result
with ThreadPoolExecutor(max_workers=2) as ex:results=list(ex.map(check,m['segments']))
report={'date':'2026-11-02','method':'FFmpeg 完整解碼、實際時長、雙字幕軌、字幕數與源檔、音軌峰值／均方根、SHA-256、抽樣畫面','results':results,'notTested':['真實手機／桌機瀏覽器播放','完整網站整合','正式角色對白','真人配音與最終角色混音','最終身分證據鏈與逃離路徑']}
(P/'verification/report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2))
print('全部六段媒體檢查通過')
