"""程序合成獨立擬音；無外部音檔、真人配音或錄音。"""
from pathlib import Path
import json,hashlib,wave
import numpy as np
R=Path(__file__).resolve().parents[1];out=R/'assets/cinematics/audio/sfx';out.mkdir(parents=True,exist_ok=True)
sr=44100;rng=np.random.default_rng(1047);items=[]
for id,seconds,desc in [('swallow',.9,'合成喉部濕音，非真人吞嚥錄音'),('sensor-reset',.35,'感測器歸零電子音'),('cabinet-slide',1.8,'金屬滑座摩擦與定位聲'),('footsteps',3.2,'四步碎石腳步擬音'),('paper',1.2,'翻閱紙頁擬音'),('radio-click',.45,'通訊開關喀聲，不含人聲'),('door-creak',1.7,'門鉸鏈低沉擬音'),('wind-loop',8,'首尾包絡風聲背景')]:
 n=int(sr*seconds);t=np.arange(n)/sr;noise=rng.normal(size=n);x=np.zeros(n)
 if id=='swallow':
  x=.12*np.sin(2*np.pi*(115*t-24*t*t))*np.exp(-5*t)*np.sin(np.pi*t/seconds)**2
  x+=.012*np.convolve(noise,np.ones(17)/17,mode='same')*np.sin(np.pi*t/seconds)**2
 elif id=='sensor-reset':x=.12*np.sin(2*np.pi*1150*t)*np.sin(np.pi*t/seconds)**2
 elif id=='cabinet-slide':x=.08*np.convolve(noise,np.ones(11)/11,mode='same')*(.5+.5*np.sin(2*np.pi*14*t))+.02*np.sin(2*np.pi*(165*t+15*t*t))
 elif id=='footsteps':
  for at in [.2,.9,1.6,2.3]:
   d=t-at;m=(d>=0)&(d<.3);x[m]=.12*noise[m]*np.exp(-20*d[m])+.05*np.sin(2*np.pi*70*d[m])*np.exp(-15*d[m])
 elif id=='paper':x=.035*noise*(.2+.8*np.sin(2*np.pi*3*t)**8)
 elif id=='radio-click':x=.08*noise*np.exp(-20*t)+.025*np.sin(2*np.pi*1400*t)*np.exp(-25*t)
 elif id=='door-creak':x=.04*np.sin(2*np.pi*(90*t+12*np.sin(2*t)))*(.6+.4*np.sin(2*np.pi*7*t))
 else:x=.14*np.convolve(noise,np.ones(101)/101,mode='same')
 env=np.minimum(1,t/.03)*np.minimum(1,(seconds-t)/.08);x=np.clip(x*env,-.7,.7);st=np.stack([x,x*.98],1);p=out/(id+'-synthetic-v1.wav')
 with wave.open(str(p),'wb') as w:w.setnchannels(2);w.setsampwidth(2);w.setframerate(sr);w.writeframes((st*32767).astype('<i2').tobytes())
 items.append({'id':id,'path':str(p.relative_to(R)),'description':desc,'seconds':seconds,'sampleRate':sr,'channels':2,'peak':float(abs(x).max()),'sha256':hashlib.sha256(p.read_bytes()).hexdigest()})
(out/'manifest.json').write_text(json.dumps({'version':1,'origin':'本專案以程序合成，無外部素材與真人錄音','voice':'正式配音等使用者第四部分，現階段字幕敘事','assets':items},ensure_ascii=False,indent=2)+'\n');print('已輸出8個獨立合成音效WAV與索引')
