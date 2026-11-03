from pathlib import Path
import json,subprocess,sys,hashlib
R=Path(__file__).resolve().parents[1];O=R/'assets/story-v5';sys.path.insert(0,str(Path.home()/'.cache/codex-video-tools'));import imageio_ffmpeg
F=imageio_ffmpeg.get_ffmpeg_exe();m=json.loads((O/'manifest.json').read_text());report={'date':'2026-11-03','version':5,'segments':[],'notVerified':['真人配音','實體手機','Safari／Firefox','長時間熱降頻']}
for s in m['segments']:
 p=R/s['video'];r=subprocess.run([F,'-hide_banner','-v','error','-i',str(p),'-f','null','-'],capture_output=True,text=True);assert r.returncode==0 and not r.stderr,r.stderr
 info=subprocess.run([F,'-hide_banner','-i',str(p)],capture_output=True,text=True).stderr;assert '1280x720' in info and '24 fps' in info;assert info.count('Subtitle: mov_text')==2;assert hashlib.sha256(p.read_bytes()).hexdigest()==s['sha256']
 for lang,path in s['subtitleTracks'].items():assert (R/path).read_text().startswith('WEBVTT')
 report['segments'].append({'id':s['id'],'decode':'通過','doubleSubtitles':True,'durationMs':s['durationMs'],'sha256':s['sha256']})
 print(s['id'],'完整解碼通過',flush=True)
report['totalMs']=sum(x['durationMs'] for x in m['segments']);report['documents']=26;report['characters']=5;(O/'verification/media-report.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n')
