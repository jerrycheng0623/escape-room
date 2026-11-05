"""Mix Moonlight Sonata I into the unchanged v10 picture and original sound effects."""
import argparse,hashlib,json,subprocess
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor
root=Path(__file__).resolve().parents[1]
ff=str(Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
out=root/'assets/release-v17';(out/'video').mkdir(parents=True,exist_ok=True)
arg=argparse.ArgumentParser();arg.add_argument('piano_caf',type=Path);args=arg.parse_args()
def run(*items):subprocess.run([ff,'-nostdin','-hide_banner','-loglevel','error','-y',*map(str,items)],check=True)
normalized=args.piano_caf.parent/'moonlight-normalized.wav'
run('-i',args.piano_caf,'-af','loudnorm=I=-28:TP=-9:LRA=8','-ar','48000','-c:a','pcm_f32le',normalized)
base=json.loads((root/'assets/playback-v6/manifest.json').read_text())
def mix(job):
 old,start=job;duration=old['durationMs']/1000;sources=[]
 for source in old['sources']:
  src=root/source['path'];dst=out/'video'/f"{old['id']}-compatible-v12{src.suffix}";webm=src.suffix=='.webm'
  filt=f'[1:a]asetpts=PTS-STARTPTS,afade=d=0.2,afade=t=out:st={duration-1.4}:d=1.4,apad[music];[0:a][music]amix=inputs=2:duration=first:normalize=0[a]'
  run('-i',src,'-ss',start,'-t',duration,'-i',normalized,'-filter_complex',filt,'-map','0:v:0','-map','[a]','-c:v','copy','-c:a','libopus' if webm else 'aac','-b:a','112k',*([] if webm else ['-movflags','+faststart']),dst)
  sources.append({'path':str(dst.relative_to(root)),'type':source['type'],'original':source['path'],'bytes':dst.stat().st_size,'sha256':hashlib.sha256(dst.read_bytes()).hexdigest()})
 return {'id':old['id'],'durationMs':old['durationMs'],'pianoStartSeconds':start,'sources':sources}
with ThreadPoolExecutor(max_workers=3) as pool:segments=list(pool.map(mix,zip(base['segments'],[0,35,77,119,170,236,300])))
ambient=json.loads((root/'assets/soundscape-v15/manifest.json').read_text())['roomAmbience']
(out/'manifest.json').write_text(json.dumps({'revision':17,'mediaAudioVersion':12,'score':'Beethoven Op.27 No.2, movement I','normalization':{'integratedLUFS':-28,'truePeakDb':-9},'roomAmbience':ambient,'segments':segments},ensure_ascii=False,indent=2)+'\n')
