from pathlib import Path
import json,subprocess,hashlib,datetime
root=Path(__file__).resolve().parents[1];ff=Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1';manifest=json.loads((root/'assets/playback-v6/manifest.json').read_text());results=[]
def digest(p):return subprocess.check_output([str(ff),'-v','error','-i',str(p),'-map','0:a:0','-c','copy','-f','hash','-hash','sha256','-'],text=True).strip()
for seg in manifest['segments']:
 for src in seg['sources']:
  p=root/src['path'];assert hashlib.sha256(p.read_bytes()).hexdigest()==src['sha256'];subprocess.run([str(ff),'-v','error','-i',str(p),'-f','null','-'],check=True,stdout=subprocess.DEVNULL,stderr=subprocess.PIPE);src['decode']='passed'
 if seg['id'] in ['CIN-A','CIN-D']:
  original=root/'assets/playback-v6/video'/(seg['id']+'-compatible-v7.mp4');assert digest(original)==digest(root/seg['sources'][0]['path']);results.append({'id':seg['id'],'newVideo':seg['sources'][0]['path'],'originalSoundPacketsIdentical':True,'bothFormatsDecode':True})
(root/'assets/playback-v6/manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');(root/'assets/world-v4/verification/story-v9.json').write_text(json.dumps({'date':datetime.datetime.now().astimezone().isoformat(),'purpose':'New shots replace obsolete mechanisms. Original sound retained; released v7 files untouched.','results':results},ensure_ascii=False,indent=2)+'\n');print('七段雙格式完整解碼、A/D新鏡頭與原音軌封包核對通過')
