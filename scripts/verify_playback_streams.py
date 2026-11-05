import json,subprocess,datetime,os,shutil
from pathlib import Path
root=Path(__file__).resolve().parents[1];ff=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or str(Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1');m=json.loads((root/'assets/playback-v6/manifest.json').read_text());report={'date':datetime.datetime.now().astimezone().isoformat(),'method':'FFmpeg SHA256 of demuxed audiovisual packets with stream copy; container metadata and embedded subtitle tracks excluded','segments':[]}
def digest(path,kind):return subprocess.check_output([ff,'-v','error','-i',str(root/path),'-map','0:'+kind+':0','-c','copy','-f','hash','-hash','sha256','-'],text=True).strip().split('=')[-1]
for seg in m['segments']:
 dst=seg['sources'][0]['path'];r={'id':seg['id'],'original':seg['original'],'delivery':dst}
 for kind in ['v','a']:
  a=digest(seg['original'],kind);b=digest(dst,kind);r[kind]={'original':a,'delivery':b,'identical':a==b}
 r['pass']=r['v']['identical']and r['a']['identical'];assert r['pass'],seg['id'];report['segments'].append(r)
(root/'assets/playback-v6/stream-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('All seven video and audio streams are byte-identical to originals.')
