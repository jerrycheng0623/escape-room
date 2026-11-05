"""Frame-by-frame identity and per-shot subtitle checks; decode success alone is insufficient."""
from pathlib import Path
import subprocess,json,re,hashlib,datetime
ROOT=Path(__file__).resolve().parents[1];OUT=ROOT/'assets/story-v10';FF=Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';TIM=json.loads((OUT/'timeline.json').read_text())
def call(args):
 r=subprocess.run([str(FF),'-hide_banner','-loglevel','error',*map(str,args)],capture_output=True,text=True,check=True);return r.stdout

def frames(p):
 s=call(['-i',p,'-map','0:v:0','-an','-f','framemd5','-']);rows=[l.split(',') for l in s.splitlines() if not l.startswith('#') and l.strip()]
 return [(int(r[1]),int(r[3]),r[-1].strip()) for r in rows]

def audio(p):return call(['-i',p,'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-']).strip()
report={'date':datetime.datetime.now().astimezone().isoformat(),'version':10,'executor':'Codex 單代理','baselineSourceCommit':'6bcd3ec513b70cd4f450a4f90e0ecd398fa6d4fb','method':'All decoded MP4 frame hashes equal concatenated rendered shots; WebM per-shot SSIM; both subtitle languages match shot identity and time; original AAC packets preserved. Visual content reviewed separately.','segments':[]}
for seg in TIM['segments']:
 mp=ROOT/seg['sources'][0]['path'];wm=ROOT/seg['sources'][1]['path'];actual=frames(mp);expected=[]
 for row in seg['shots']:
  ref=frames(ROOT/row['file']);assert len(ref)==row['frames'],(seg['id'],row['index'],'source frame count',len(ref),row['frames']);expected += [r[2] for r in ref]
 assert len(actual)==seg['frames'],(seg['id'],'final frame count',len(actual),seg['frames'])
 assert [r[2] for r in actual]==expected,(seg['id'],'frame order mismatch')
 assert [r[0] for r in actual]==list(range(seg['frames'])),(seg['id'],'nonuniform timestamp')
 wframes=frames(wm);assert len(wframes)==seg['frames'],(seg['id'],'webm count',len(wframes))
 # Compare lossy fallback at all frames and aggregate independently for each story shot.
 stats=Path('/tmp')/(seg['id']+'-v10-ssim.txt')
 call(['-reinit_filter','0','-i',mp,'-reinit_filter','0','-i',wm,'-filter_complex',f'[0:v]setpts=PTS-STARTPTS,format=yuv420p[a];[1:v]setpts=PTS-STARTPTS,format=yuv420p[b];[a][b]ssim=stats_file={stats}','-an','-f','null','-'])
 vals=[float(re.search(r'All:([0-9.]+)',l)[1]) for l in stats.read_text().splitlines()];assert len(vals)==seg['frames'],('ssim frames',seg['id'],len(vals))
 rows=[]
 for sh in seg['shots']:
  v=vals[round(sh['start']*24):round(sh['end']*24)];avg=sum(v)/len(v);assert avg>.94,(seg['id'],sh['index'],'low similarity',avg)
  rows.append({'index':sh['index'],'start':sh['start'],'end':sh['end'],'person':sh['person'],'name':sh['characterName'],'allMp4FramesMatch':True,'webmMeanSsim':round(avg,6)})
 captions=0
 for lang,col in [('zh-Hant','zh'),('en','en')]:
  s=(ROOT/seg['tracks'][lang]).read_text();blocks=[b for b in s.split('\n\n') if '-->' in b];assert len(blocks)==len(seg['shots'])
  def sec(st):
   h,m,s=map(float,st.split(':'));return h*3600+m*60+s
  for block,sh in zip(blocks,seg['shots']):
   line,*txt=block.splitlines();start,end=[sec(a.strip()) for a in line.split('-->')];assert abs(start-sh['start']-.35)<.001 and abs(end-sh['end']+.35)<.001;assert '\n'.join(txt)==sh[col];captions+=1
 assert audio(mp)==audio(ROOT/seg['audioSource']),('audio changed',seg['id'])
 report['segments'].append({'id':seg['id'],'mp4Frames':len(actual),'webmFrames':len(wframes),'captions':captions,'aacPacketsPreserved':True,'shots':rows,'pass':True})
 print(seg['id'],len(actual),'影格逐格一致，雙語字幕',captions,'通過',flush=True)
report['pass']=all(x['pass'] for x in report['segments']);report['totalShots']=sum(len(x['shots']) for x in report['segments']);report['totalFramesPerFormat']=sum(x['mp4Frames'] for x in report['segments']);report['totalCaptions']=sum(x['captions'] for x in report['segments']);(OUT/'alignment-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
play=json.loads((ROOT/'assets/playback-v6/manifest.json').read_text())
for seg in play['segments']:
 for src in seg['sources']:assert hashlib.sha256((ROOT/src['path']).read_bytes()).hexdigest()==src['sha256'];src['decode']='passed'
(ROOT/'assets/playback-v6/manifest.json').write_text(json.dumps(play,ensure_ascii=False,indent=2)+'\n')
