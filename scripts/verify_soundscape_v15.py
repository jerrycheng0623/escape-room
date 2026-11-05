"""Verify picture streams, original-audio contribution and new audio for each delivery format."""
import hashlib,json,os,re,shutil,subprocess
from pathlib import Path
import numpy as np

root=Path(__file__).resolve().parents[1]
assets=root/os.environ.get('EMBERS_AUDIO_ASSETS','assets/soundscape-v15')
ff=os.environ.get('FFMPEG') or shutil.which('ffmpeg') or str(Path.home()/'.cache/codex-video-tools/imageio_ffmpeg/binaries/ffmpeg-macos-aarch64-v7.1')
def ffout(file,*args):
    return subprocess.check_output([ff,'-nostdin','-hide_banner','-loglevel','error','-i',str(file),*args])
def picture(file):
    return ffout(file,'-map','0:v:0','-c','copy','-f','framehash','-hash','sha256','-').decode()
def pcm(file):
    return np.frombuffer(ffout(file,'-map','0:a:0','-ar','12000','-ac','1','-f','f32le','-'),'<f4')
def rms(a):return float(np.sqrt(np.mean(a*a)))
manifest=json.loads((assets/'manifest.json').read_text())
results=[]
for segment in manifest['segments']:
    for source in segment['sources']:
        old=root/source['original'];new=root/source['path']
        assert hashlib.sha256(new.read_bytes()).hexdigest()==source['sha256']
        picture1,picture2=picture(old),picture(new)
        # Container timestamps can have different absolute starts; compare every video payload, in order.
        frames=lambda h:[line.rsplit(',',1)[-1].strip() for line in h.splitlines() if line and not line.startswith('#')]
        assert frames(picture1)==frames(picture2) and len(frames(picture1))>500, new
        orig,mix=pcm(old),pcm(new)
        duration=segment['durationMs']/1000
        assert abs(len(mix)/12000-duration)<.12 and abs(len(orig)-len(mix))<1440,new
        # Codec delay can differ. Evaluate the soundtrack energy against the old track;
        # correlation at the largest original transient independently checks the original still contributes.
        n=min(len(orig),len(mix));orig,mix=orig[:n],mix[:n]
        loud=np.argmax(np.abs(orig))
        lo=max(1200,loud-500);hi=min(n-1200,loud+500)
        reference=orig[lo:hi];span=mix[lo-960:hi+960]
        numer=np.correlate(span,reference,'valid')
        power=np.convolve(span**2,np.ones(len(reference)),mode='valid')
        correlation=float(np.max(numer/(np.sqrt(power*np.sum(reference**2))+1e-10)))
        peaks=float(np.max(np.abs(mix)))
        added=rms(mix-orig)
        assert peaks<.97 and added>.001,(new,peaks,added)
        expectedCorrelation=None
        if os.environ.get('EMBERS_EXPECTED_MUSIC'):
            duration=segment['durationMs']/1000
            filt=f'[1:a]asetpts=PTS-STARTPTS,afade=d=0.2,afade=t=out:st={duration-1.4}:d=1.4,apad[music];[0:a][music]amix=inputs=2:duration=first:normalize=0[a]'
            command=[ff,'-v','error','-i',str(old),'-ss',str(segment['pianoStartSeconds']),'-t',str(duration),'-i',os.environ['EMBERS_EXPECTED_MUSIC'],'-filter_complex',filt,'-map','[a]','-ar','12000','-ac','1','-f','f32le','-']
            expected=np.frombuffer(subprocess.check_output(command),'<f4')
            reference=expected[12000:36000];span=mix[10800:37200]
            dot=np.correlate(span,reference,'valid')
            energy=np.convolve(span**2,np.ones(len(reference)),mode='valid')
            expectedCorrelation=float(np.max(dot/(np.sqrt(energy*np.sum(reference**2))+1e-12)))
            assert expectedCorrelation>.97,(new,expectedCorrelation)
        else:
            assert correlation>.18,(new,correlation)
        results.append({'id':segment['id'],'file':new.name,'picturePackets':len(frames(picture1)),'duration':len(mix)/12000,'peak':peaks,'rmsBefore':rms(orig),'rmsAfter':rms(mix),'addedSignalRms':added,'originalTransientCorrelation':correlation,'expectedMixCorrelation':expectedCorrelation,'pass':True})
weather=root/manifest['roomAmbience']['path'];rain=pcm(weather)
assert abs(len(rain)/12000-48)<.03 and .005<rms(rain)<.08 and np.max(np.abs(rain))<.5
assert hashlib.sha256(weather.read_bytes()).hexdigest()==manifest['roomAmbience']['sha256']
assert len(results)==14
report={'pass':True,'video':results,'weather':{'duration':len(rain)/12000,'rms':rms(rain),'peak':float(np.max(np.abs(rain))),'pass':True}}
(assets/'verification.json').write_text(json.dumps(report,indent=2)+'\n')
print('Verified 14 mixed audio tracks and all original picture packets; rain loop 48 s.')
