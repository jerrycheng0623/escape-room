"""Render the v15 soundtrack using the locally synthesized piano CAF and v10 masters."""
import argparse, hashlib, json, os, shutil, subprocess, wave
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor

import numpy as np

root=Path(__file__).resolve().parents[1]
output=root/'assets/soundscape-v15'
ff=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or str(Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
def run(*args):
    subprocess.run([ff,'-nostdin','-hide_banner','-loglevel','error','-y',*map(str,args)],check=True)
def rms(samples):
    return np.sqrt(np.mean(samples**2))
def file_info(file):
    return {'bytes':file.stat().st_size,'sha256':hashlib.sha256(file.read_bytes()).hexdigest()}

def weather():
    rate=44100
    length=rate*48
    time=np.arange(length)/rate
    freq=np.fft.rfftfreq(length,1/rate)
    rng=np.random.default_rng(1908)
    def noise(lo,hi):
        spec=np.fft.rfft(rng.normal(size=length))
        mask=(freq/np.maximum(freq,lo))**2 / (1+(freq/hi)**2)
        data=np.fft.irfft(spec*mask,n=length)
        return data/rms(data)
    rain=noise(350,2350)*(.013+.0018*np.cos(2*np.pi*time/16)+.0016*np.sin(2*np.pi*time/12))
    rumble=np.zeros(length)
    for start,amp,tail in [(7.5,.044,2.2),(27,.058,3.1),(39,.039,1.9)]:
        age=np.maximum(time-start,0)
        envelope=(1-np.exp(-age/.29))*np.exp(-age/tail)*np.minimum(1,np.maximum(0,(10-age)/2))
        rumble+=amp*envelope
    thunder=noise(31,86)*rumble
    # Reuse the original wind at unity; spectral rain spans the loop without a hard seam.
    with wave.open(str(root/'assets/story-v5/audio/sfx/wind-loop-synthetic-v1.wav')) as w:
        assert w.getframerate()==rate and w.getnchannels()==2 and w.getsampwidth()==2
        wind=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').reshape(-1,2)/32768
    assert length%len(wind)==0
    samples=np.tile(wind,(length//len(wind),1))
    samples+=np.column_stack((rain+thunder+.0025*noise(510,2900),rain+thunder+.0025*noise(510,2900)))
    pcm=np.round(np.clip(samples,-1,1)*32767).astype('<i2')
    destination=output/'room-rain-thunder-v15.m4a'
    subprocess.run([ff,'-nostdin','-hide_banner','-loglevel','error','-y','-f','s16le','-ar',str(rate),'-ac','2','-i','pipe:0','-c:a','aac','-b:a','96k','-movflags','+faststart',str(destination)],input=pcm.tobytes(),check=True)
    return {'path':str(destination.relative_to(root)),'duration':48,'rainRMS':float(rms(rain)),'thunderOnsets':[7.5,27,39],**file_info(destination)}

def main():
    cli=argparse.ArgumentParser(description=__doc__)
    cli.add_argument('piano_caf',type=Path)
    cli.add_argument('--weather-only',action='store_true')
    cli.add_argument('--segment',help='Rebuild only this segment in an existing soundscape manifest')
    args=cli.parse_args()
    (output/'video').mkdir(parents=True,exist_ok=True)
    prior=json.loads((output/'manifest.json').read_text()) if args.segment else None
    rain=prior['roomAmbience'] if prior else weather()
    if args.weather_only:return
    piano=args.piano_caf.parent/'piano-tempo.wav'
    run('-i',args.piano_caf,'-af','atempo=0.72','-c:a','pcm_f32le',piano)
    original=json.loads((root/'assets/playback-v6/manifest.json').read_text())
    score=[(0,3),(48,1),(90,-7),(124,2),(176,2),(228,-1),(282,1)]
    assert len(original['segments'])==len(score)
    def mix(job):
        old,(start,gain)=job
        duration=old['durationMs']/1000
        sources=[]
        for source in old['sources']:
            src=root/source['path']
            webm=src.suffix=='.webm'
            dst=output/'video'/f"{old['id']}-compatible-v11{src.suffix}"
            filt=f'[1:a]asetpts=PTS-STARTPTS,aresample=48000,volume={gain}dB,afade=d=0.18,afade=t=out:st={duration-1.4}:d=1.4,apad[score];[0:a][score]amix=inputs=2:duration=first:normalize=0[a]'
            mux=[] if webm else ['-movflags','+faststart']
            run('-i',src,'-ss',start,'-t',duration,'-i',piano,'-filter_complex',filt,'-map','0:v:0','-map','[a]','-c:v','copy','-c:a','libopus' if webm else 'aac','-b:a','112k',*mux,dst)
            sources.append({'path':str(dst.relative_to(root)),'type':source['type'],'original':source['path'],**file_info(dst)})
        return {'id':old['id'],'durationMs':old['durationMs'],'pianoStartSeconds':start,'pianoGainDb':gain,'sources':sources}
    with ThreadPoolExecutor(max_workers=3) as pool:
        jobs=list(zip(original['segments'],score))
        if args.segment:
            old_segments={s['id']:s for s in prior['segments']}
            assert args.segment in old_segments
            segments=[mix(job) if job[0]['id']==args.segment else old_segments[job[0]['id']] for job in jobs]
        else:
            segments=list(pool.map(mix,jobs))
    (output/'manifest.json').write_text(json.dumps({'revision':15,'mediaAudioVersion':11,'scoreTempo':.72,'roomAmbience':rain,'segments':segments},ensure_ascii=False,indent=2)+'\n')

if __name__=='__main__': main()
