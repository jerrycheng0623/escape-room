"""從已生成的分幕圖片製作可重建的動態預覽。不是遊戲程式或最終對白。"""
from pathlib import Path
import sys, os, json, subprocess, wave, hashlib
from concurrent.futures import ThreadPoolExecutor, as_completed
import numpy as np

ROOT=Path(__file__).resolve().parents[1]
MEDIA=ROOT/'assets/cinematics'
sys.path.insert(0,str(Path.home()/'.cache/codex-video-tools'))
import imageio_ffmpeg
FFMPEG=os.environ.get('ESCAPE_FFMPEG') or imageio_ffmpeg.get_ffmpeg_exe()
FONT='/System/Library/Fonts/STHeiti Medium.ttc'
FPS=24
# 字幕為依核定故事改寫的暫擬旁白，等待使用者之後的正式對話。
STORY={
'CIN-00':{'title':'序幕：遲到的邀請','seconds':8,'lines':[
('00-01','山路上的故障耽誤了行程。隔日凌晨三點，我才抵達。','A breakdown delayed my journey. I arrived at 03:00 the following morning.'),
('00-02','邀請我的人，是五年前火災的倖存者——王杰倫。','My host was Wang Jielun, a survivor of the fire five years ago.'),
('00-03','聚會的小屋，只剩下仍在冒煙的廢墟。','The cabin where we were to meet was a smoking ruin.'),
('00-04','警方找到了四具焦屍，身分仍在複核；初步判定是意外。','The police found four burned bodies. Identification was pending; the initial finding was an accident.') ]},
'CIN-A':{'title':'客房：灰燼裡的謊言','seconds':8,'lines':[
('A-01','鄭筱柔的筆記，藏在燒毀的行李之中。','Zheng Xiaorou\'s notes were hidden in the burned luggage.'),
('A-02','她曾報導王家無人生還，但小兒子其實活了下來。','She reported that no one in the Wang family survived. The younger son had lived.'),
('A-03','那封威脅信，讓這次聚會有了另一種意味。','The threatening letter cast a different light on this gathering.') ]},
'CIN-B':{'title':'暗房：不在照片裡的人','seconds':8,'lines':[
('B-01','被光線吞沒的影像，重新浮現。','An image lost in the light began to emerge.'),
('B-02','鏡頭前只有王杰倫、鄭筱柔與張凱涵。算上攝影師，只有四人。','Only Wang Jielun, Zheng Xiaorou and Zhang Kaihan faced the camera. With the photographer, four people.'),
('B-03','謝宇恩不在照片裡。他當時去了哪裡？','Xie Yuen was not in the photograph. Where had he gone?') ]},
'CIN-C':{'title':'營火：善意與異常重量','seconds':9,'lines':[
('C-01','謝宇恩帶來烤肉架，原本只是想讓朋友開心。','Xie Yuen brought the grill hoping to cheer up his friend.'),
('C-02','日記裡的道歉，加上表層報告，讓我以為這是恐懼引起的失控。','The apologies in the diary and the surface report made me suspect a collapse brought on by fear.'),
('C-03','預定食材只有五公斤，歷史紀錄卻留下六十五公斤。','The planned food weighed five kilograms. The historical record showed sixty-five.') ]},
'CIN-D':{'title':'診療區：另一種飢餓','seconds':9,'lines':[
('D-01','深層報告記錄了極度飢餓，以及曾食用親屬遺體的疑慮。','The deeper report recorded extreme hunger and suspected consumption of relatives\' remains.'),
('D-02','烤肉的氣味，可能喚醒的不是恐懼，而是食慾。','Perhaps the smell of the grill awakened appetite rather than fear.'),
('D-03','照片、重量與報告，指向一場被刻意安排的殺局。','The photograph, the weight and the report pointed to a deliberately planned killing.'),
('D-04','警方確認了四名死者：鄭筱柔、邱凱浩、謝宇恩、張凱涵。沒有王杰倫。','Police identified the four dead: Zheng Xiaorou, Qiu Kaihao, Xie Yuen and Zhang Kaihan. Wang Jielun was not among them.'),
('D-05','主門雖然反鎖，地下室卻有對外維修出口。他有機會活著離開。','The main door was bolted, but a basement maintenance exit led outside. He could have escaped alive.') ]},
'CIN-END':{'title':'終幕：深淵的凝視','seconds':7,'lines':[
('END-01','王杰倫的屍體不在四名死者之中。他還活著。','Wang Jielun was not among the four dead. He was still alive.'),
('END-02','我朝出口奔去，身後的黑暗卻留在原地。','I ran for the exit. The darkness behind me remained.'),
('END-03','樹洞裡，有一雙眼睛一直看著我。','A pair of eyes watched me from the hollow tree.'),
('END-04','［吞嚥聲待補］［感測器歸零音］','[Swallowing sound pending] [Sensor reset tone]'),
('END-05','冷光照亮了那張熟悉的臉。','The cold light revealed a familiar face.'),
('END-06','［風聲逐漸消失］','[The wind fades away]') ]}
}

STORY['CIN-00']['lines'].append(('00-05','火災後第四天，現場完成初步處置。我獲准回來調查。','On the fourth day after the fire, I was permitted to return after initial site stabilization.'))
STORY['CIN-A']['lines'].extend([
('A-04','破錶停在十九點十五分。但停錶，還不是死亡時間的證明。','The broken watch stopped at 19:15. That alone did not establish a time of death.'),
('EVIDENCE-01','三只杯子與空瓶，留下了尚待交叉比對的痕跡。','Three glasses and an empty bottle left traces that needed corroboration.')])
STORY['CIN-B']['lines'].insert(1,('B-04','十八點三十分的照片裡，謝宇恩仍在。','Xie Yuen was present in the photograph taken at 18:30.'))
STORY['CIN-B']['lines'][2]=('B-02','二十點的最後合照，鏡頭前三人，加上攝影師，共四人。','At 20:00, the last photograph showed three people; with the photographer, four.')
STORY['CIN-C']['lines'].extend([
('C-05','固定底座保存了二十一點的歷史紀錄。控制器卻不在座上。','The fixed base retained the 21:00 record. Its detachable controller was missing.'),
('C-04','烤架下的項鍊，與第一張照片裡的輪廓一致。','The pendant beneath the grill matched the outline in the first photograph.')])
STORY['CIN-D']['lines'][2]=('D-03','拍攝紀錄、現場採樣與檢查摘要，讓線索有了相互支持的方向。','Recording logs, scene samples and examination summaries began to corroborate one another.')
STORY['CIN-D']['lines'].insert(4,('D-06','他先離開。火災中倒下的鐵櫃，後來才擋住出口。','He left first. The cabinet fell during the fire and blocked the exit afterward.'))
STORY['CIN-D']['lines'].insert(5,('D-07','門框先被使用，細灰後來才覆上；這仍不能單獨辨認使用者。','The frame was used before ash settled on it. The traces alone could not identify who used it.'))
STORY['CIN-END']['lines'][0]=('END-01','四名死者之中，沒有王杰倫。那條出口，讓另一種可能浮現。','Wang Jielun was not among the four dead. The exit left another possibility.')
STORY['CIN-END']['lines'][3]=('END-04','［吞嚥聲］［感測器歸零音］','[Swallowing sound] [Sensor reset tone]')
records=json.loads((MEDIA/'prompts.json').read_text())['assets']
BY_ID={a['id']:a for a in records}
TMP=MEDIA/'.render-cache';TMP.mkdir(exist_ok=True)

def run(args):
    r=subprocess.run([FFMPEG,'-hide_banner','-loglevel','error','-y',*args],capture_output=True,text=True)
    if r.returncode:raise RuntimeError(r.stderr[-6000:])

def text_filter(text,x='24',y='24',size=22,enable=None):
    safe=text.replace('\\','\\\\').replace(':','\\:').replace("'",'’')
    f=f"drawtext=fontfile='{FONT}':text='{safe}':x={x}:y={y}:fontsize={size}:fontcolor=0xeee6d8:box=1:boxcolor=black@0.65:boxborderw=10"
    if enable:f+=f":enable='{enable}'"
    return f

def render_shot(segment,item,index,seconds):
    sid=item[0];a=BY_ID[sid];src=ROOT/a['path'];frames=seconds*FPS
    dest=TMP/(sid+f"-v{a['version']}-materials-v3.mp4")
    # 中心緩推不生成新敘事動作；全圖保留後才縮放約 4%。
    z="min(zoom+0.00022,1.045)"
    x="iw/2-iw/zoom/2";y="ih/2-ih/zoom/2"
    if sid=='END-02':x="min(on*0.75,iw-iw/zoom)";z='1.06'
    vf=["scale=1600:900:force_original_aspect_ratio=decrease","pad=1600:900:(ow-iw)/2:(oh-ih)/2:black",
        f"zoompan=z='{z}':x='{x}':y='{y}':d={frames}:s=1280x720:fps={FPS}",
        "setsar=1",f"fade=t=in:st=0:d=0.45",f"fade=t=out:st={seconds-0.55}:d=0.55",
        text_filter('分鏡預覽 / 字幕暫擬',size=18)]
    if sid=='00-05':
        vf.append(text_filter('D4 19:00｜火災後第四天／重返現場',y='h-100',size=28))
    if sid=='A-04':
        vf.append(text_filter('現場紀錄｜停錶 19:15／死時待交叉重建',y='h-100',size=25))
    if sid=='C-05':
        vf.append(text_filter('固定底座紀錄｜D0 21:00／淨載重 65 kg',y='h-100',size=26))
    if sid=='C-03':
        vf.append(text_filter('預定食材 5 kg　／　歷史紀錄 65 kg',y='h-100',size=28))
    if sid=='D-04':
        vf.append(text_filter('D4｜已完成的核對摘要',y='h-90',size=25))
        for row,label in enumerate(['警方身分複核','鄭筱柔','邱凱浩','謝宇恩','張凱涵']):
            vf.append(text_filter(label,x='w-370',y=str(165+row*48),size=28))
    if sid=='D-05':
        vf.append(text_filter('地下室對外維修出口',y='h-100',size=28))
    if sid=='END-04':
        vf.append(text_filter('感測器讀數 65 kg',y='h-100',size=28,enable='lt(t,3)'))
        vf.append(text_filter('感測器讀數 0.0 kg',y='h-100',size=28,enable='gte(t,3)'))
    if sid=='END-02':
        # 背景鏡頭不跟隨角色；獨立透明層沿路縮小遠離。這不是骨架跑步動畫。
        actor=ROOT/BY_ID['END-ACTOR']['path']
        filt="[0:v]scale=1280:720,setsar=1[bg];[1:v]scale=150:200,format=rgba,colorchannelmixer=aa=0.90[actor];[bg][actor]overlay=x='760-18*t':y='500-12*t':shortest=1,fade=t=in:st=0:d=0.3,fade=t=out:st="+str(seconds-.55)+":d=0.55,"+text_filter('分鏡素材版 / 角色暫用',size=18)+"[v]"
        run(['-loop','1','-i',str(src),'-loop','1','-i',str(actor),'-filter_complex',filt,'-map','[v]','-t',str(seconds),'-r',str(FPS),'-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-threads','2',str(dest)])
    else:
        run(['-i',str(src),'-vf',','.join(vf),'-frames:v',str(frames),'-an','-c:v','libx264','-preset','veryfast','-crf','20','-pix_fmt','yuv420p','-threads','2',str(dest)])
    return sid,dest

def audio(segment,seconds):
    # 原創程序合成：風噪、低頻氣氛、結尾心跳和電子音。沒有冒充真人吞嚥或配音。
    sr=44100;n=int(seconds*sr);t=np.arange(n,dtype=np.float64)/sr
    rng=np.random.default_rng(sum(map(ord,segment)))
    noise=rng.normal(0,1,n)
    wind=np.convolve(noise,np.ones(71)/71,mode='same')
    drone=np.sin(2*np.pi*48*t)*0.022+np.sin(2*np.pi*73.3*t)*0.013
    track=wind*(0.10+0.04*np.sin(2*np.pi*0.11*t))+drone
    for st in np.arange(3,seconds,7.5):
        dt=t-st;mask=(dt>=0)&(dt<0.5)
        track[mask]+=0.025*np.sin(2*np.pi*180*dt[mask])*np.exp(-12*dt[mask])
    if segment=='CIN-END':
        for st in np.arange(0.8,14,1.2):
            for offset,amp in [(0,0.08),(.16,.045)]:
                dt=t-(st+offset);m=(dt>=0)&(dt<.35)
                track[m]+=amp*np.sin(2*np.pi*58*dt[m])*np.exp(-18*dt[m])
        # END-04 起於 21 秒；三秒後讀數切到零，電子音同步在 24 秒。
        dt=t-24;m=(dt>=0)&(dt<.22)
        track[m]+=0.07*np.sin(2*np.pi*1150*dt[m])*np.sin(np.pi*dt[m]/.22)**2
    if segment=='CIN-END':
        # 原創合成喉部濕音，清楚標為擬音，非真人錄音。
        dt=t-22.8;m=(dt>=0)&(dt<.85)
        local=dt[m];wet=np.sin(2*np.pi*(115*local-24*local*local))*np.exp(-5*local)
        texture=rng.normal(0,1,len(local));wet+=.2*np.convolve(texture,np.ones(17)/17,mode='same')
        track[m]+=.075*wet*np.sin(np.pi*local/.85)**2
    cues={'CIN-00':[(8.2,'paper'),(24.3,'radio-click')],
          'CIN-A':[(.5,'paper'),(9,'paper')],
          'CIN-B':[(8.2,'paper'),(16.3,'paper')],
          'CIN-C':[(9.3,'paper'),(27.7,'sensor-reset')],
          'CIN-D':[(.4,'paper'),(27.5,'radio-click'),(37,'cabinet-slide'),(55,'door-creak')],
          'CIN-END':[(7.6,'footsteps')]}
    for at,sfx in cues.get(segment,[]):
        fxpath=MEDIA/'audio/sfx'/(sfx+'-synthetic-v1.wav')
        if fxpath.exists():
            with wave.open(str(fxpath),'rb') as fx:
                pcm=np.frombuffer(fx.readframes(fx.getnframes()),dtype='<i2').astype(float).reshape(-1,2).mean(1)/32768
            start=int(at*sr);count=min(len(pcm),len(track)-start)
            if count>0:track[start:start+count]+=pcm[:count]*.65
    env=np.minimum(1,t/1.5)*np.minimum(1,(seconds-t)/2)
    track=np.clip(track*env,-.8,.8)
    stereo=np.stack([track,track*.98],axis=1)
    dest=MEDIA/'audio'/(segment+'-procedural-v2.wav');dest.parent.mkdir(exist_ok=True)
    with wave.open(str(dest),'wb') as f:
        f.setnchannels(2);f.setsampwidth(2);f.setframerate(sr);f.writeframes((stereo*32767).astype('<i2').tobytes())
    return dest

def timestamp(t,sep='.'):
    ms=round(t*1000);h,ms=divmod(ms,3600000);m,ms=divmod(ms,60000);s,ms=divmod(ms,1000)
    return f'{h:02}:{m:02}:{s:02}{sep}{ms:03}'

def subtitles(segment,data,lang):
    idx=1 if lang=='zh-Hant' else 2
    vtt=['WEBVTT','','NOTE 暫擬字幕，非正式對白定稿',''];srt=[]
    for i,item in enumerate(data['lines']):
        start=i*data['seconds']+.55;end=(i+1)*data['seconds']-.65
        text=item[idx]
        vtt += [f'{timestamp(start)} --> {timestamp(end)}',text,'']
        srt += [str(i+1),f"{timestamp(start,',')} --> {timestamp(end,',')}",text,'']
    dest=MEDIA/'subtitles'/lang;dest.mkdir(parents=True,exist_ok=True)
    vp=dest/(segment+'-draft.vtt');sp=TMP/(segment+'-'+lang+'.srt')
    vp.write_text('\n'.join(vtt));sp.write_text('\n'.join(srt))
    return vp,sp

def main():
    futures=[];rendered={}
    with ThreadPoolExecutor(max_workers=3) as pool:
        for segment,data in STORY.items():
            for i,item in enumerate(data['lines']):
                futures.append(pool.submit(render_shot,segment,item,i,data['seconds']))
        for f in as_completed(futures):
            sid,path=f.result();rendered[sid]=path;print('已合成鏡頭',sid,flush=True)
    manifest={'version':1,'date':'2026-11-02','status':'動態預覽，正式字幕與證據鏈待補','imageTool':'built-in image_gen','assets':records,'segments':[]}
    for segment,data in STORY.items():
        duration=data['seconds']*len(data['lines'])
        listing=TMP/(segment+'.txt')
        listing.write_text('\n'.join("file '"+str(rendered[x[0]])+"'" for x in data['lines']))
        silent=TMP/(segment+'-silent.mp4')
        run(['-f','concat','-safe','0','-i',str(listing),'-c','copy',str(silent)])
        wav=audio(segment,duration)
        zh,zhsrt=subtitles(segment,data,'zh-Hant');en,ensrt=subtitles(segment,data,'en')
        dest=MEDIA/'video'/(segment+'-materials-v3.mp4');dest.parent.mkdir(exist_ok=True)
        run(['-i',str(silent),'-i',str(wav),'-i',str(zhsrt),'-i',str(ensrt),'-map','0:v:0','-map','1:a:0','-map','2:s:0','-map','3:s:0','-c:v','copy','-c:a','aac','-b:a','160k','-c:s','mov_text','-metadata:s:s:0','language=zho','-metadata:s:s:0','title=繁體中文（暫擬）','-metadata:s:s:1','language=eng','-metadata:s:s:1','title=English (draft)','-disposition:s:0','default','-movflags','+faststart','-t',str(duration),str(dest)])
        manifest['segments'].append({'id':segment,'title':data['title'],'status':'動態預覽；未正式定稿','durationMs':duration*1000,'width':1280,'height':720,'fps':FPS,'video':str(dest.relative_to(ROOT)),'poster':BY_ID[data['lines'][0][0]]['path'],'subtitleTracks':{'zh-Hant':str(zh.relative_to(ROOT)),'en':str(en.relative_to(ROOT))},'audio':('原創程序合成氣氛／擬音，無配音；含合成吞嚥、腳步與歸零音，非真人錄音' if segment=='CIN-END' else '原創程序合成氣氛及情境擬音，無配音'),'sourceImages':[BY_ID[x[0]]['path'] for x in data['lines']],'onCompleteEvent':segment.replace('-','_')+'_COMPLETE','sha256':hashlib.sha256(dest.read_bytes()).hexdigest()})
        print('已輸出影片',segment,duration,'秒',flush=True)
    rules_path=ROOT/'game-rules.json'
    if rules_path.exists():manifest['integrationRules']=json.loads(rules_path.read_text())
    apply_story_metadata(manifest)
    (MEDIA/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2))
    (MEDIA/'storyboard-draft.json').write_text(json.dumps(STORY,ensure_ascii=False,indent=2))
    print('共',len(manifest['segments']),'段影片',sum(x['durationMs'] for x in manifest['segments'])/1000,'秒',flush=True)

def apply_story_metadata(manifest):
    manifest['storySettings']='story-settings.json'
    manifest['revisionPlan']='assets/cinematics/revision-plan.json'
    manifest['status']='故事補完素材版；新版證物畫面與合成音效已匯入，正式角色／對白待提供'
    manifest['integrationRules']=json.loads((ROOT/'game-rules.json').read_text())
    manifest['version']=3
    for segment in manifest['segments']:
        segment['storySyncStatus']='已匯入第二部分補完；第三／第四部分與最終寫實美術待提供'
        segment['audioFile']='assets/cinematics/audio/'+segment['id']+'-procedural-v2.wav'

def sync_opening_subtitles():
    # 僅替換開場內嵌字幕，視訊及音訊以copy保留，不重新生成或編碼畫面。
    manifest=json.loads((MEDIA/'manifest.json').read_text())
    segment=next(x for x in manifest['segments'] if x['id']=='CIN-00')
    original=ROOT/segment['video']
    dest=original.with_name('CIN-00-preview-v2.mp4')
    if original==dest:
        original=original.with_name('CIN-00-preview-v1.mp4')
    zh,zhsrt=subtitles('CIN-00',STORY['CIN-00'],'zh-Hant')
    en,ensrt=subtitles('CIN-00',STORY['CIN-00'],'en')
    run(['-i',str(original),'-i',str(zhsrt),'-i',str(ensrt),'-map','0:v:0','-map','0:a:0','-map','1:s:0','-map','2:s:0','-c','copy','-c:s','mov_text','-metadata:s:s:0','language=zho','-metadata:s:s:0','title=繁體中文（暫擬）','-metadata:s:s:1','language=eng','-metadata:s:s:1','title=English (draft)','-disposition:s:0','default','-movflags','+faststart',str(dest)])
    segment['video']=str(dest.relative_to(ROOT))
    segment['sha256']=hashlib.sha256(dest.read_bytes()).hexdigest()
    segment['subtitleRevision']=2
    apply_story_metadata(manifest)
    (MEDIA/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n')
    (MEDIA/'storyboard-draft.json').write_text(json.dumps(STORY,ensure_ascii=False,indent=2)+'\n')
    print('已輸出開場v2：僅同步內嵌中英字幕，原v1保留',flush=True)

if __name__=='__main__':
    if '--sync-opening-subtitles' in sys.argv:sync_opening_subtitles()
    else:main()
