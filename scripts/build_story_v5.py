"""以新版原畫、可編輯文字層與共用故事資料製作正式敘事，不生成另一套人物。"""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import json,textwrap,html,subprocess,sys,hashlib,unicodedata,shutil
ROOT=Path(__file__).resolve().parents[1];ART=ROOT/'assets/art-redesign-v4';OUT=ROOT/'assets/story-v5';OUT.mkdir(exist_ok=True)
DATA=json.loads((ROOT/'assets/story/content-v5.json').read_text());DOC=DATA['documents']
sys.path.insert(0,str(Path.home()/'.cache/codex-video-tools'));import imageio_ffmpeg
FF=imageio_ffmpeg.get_ffmpeg_exe();FONT='/System/Library/Fonts/STHeiti Medium.ttc'
for d in ['video','subtitles/zh-Hant','subtitles/en','web/posters','web/documents','web/evidence','web/portraits','audio','.render-cache','verification']:(OUT/d).mkdir(parents=True,exist_ok=True)
CACHE=OUT/'.render-cache'
def wrap(s,limit=23):
 lines=[]
 for paragraph in s.split('\n'):
  line='';width=0
  for ch in paragraph:
   w=1 if unicodedata.east_asian_width(ch) in 'WF' else .56
   if width+w>limit and line:lines.append(line);line='';width=0
   line+=ch;width+=w
  lines.append(line)
 return lines
# Native vector typography remains editable and is reused as a Three.js texture and a document download.
for i,d in DOC.items():
 lines=wrap(d['body'],28);h=max(900,200+len(lines)*42)
 rows=''.join(f'<tspan x="72" dy="42">{html.escape(line)}</tspan>' for line in lines)
 svg=f'''<svg xmlns="http://www.w3.org/2000/svg" width="960" height="{h}" viewBox="0 0 960 {h}"><rect width="960" height="{h}" fill="#c3b08a"/><rect x="26" y="26" width="908" height="{h-52}" fill="none" stroke="#6c5738" stroke-width="3"/><text x="72" y="100" fill="#382c20" font-family="STHeiti,Microsoft JhengHei,sans-serif" font-size="38">{html.escape(d['name'])}</text><path d="M72 130H888" stroke="#685236"/><text x="72" y="145" fill="#382c20" font-family="STHeiti,Microsoft JhengHei,sans-serif" font-size="28">{rows}</text></svg>'''
 (OUT/'web/documents'/f'{i}.svg').write_text(svg)
STORY={}
def segment(i,title,en):STORY[i]={'id':i,'title':title,'titleEn':en,'shots':[]}
def shot(i,img,zh,en,doc=None,person=None,seconds=None):
 lines=wrap(DOC[doc]['body']) if doc else []
 pages=[lines[n:n+9] for n in range(0,len(lines),9)] or [[]]
 for n,page in enumerate(pages):
  secondsHere=seconds or max(9,len(page)*1.5)
  STORY[i]['shots'].append({'image':img,'zh':zh,'en':en,'document':doc,'person':person,'text':'\n'.join(page),'page':n+1,'pages':len(pages),'seconds':secondsHere})
segment('CIN-00','序幕：遲到的邀請','Prologue · The late invitation')
shot('CIN-00','00-01','山路拋錨使行程耽擱四小時。凌晨三點，我抵達山屋。','A breakdown delayed me by four hours. I reached the cabin at three in the morning.')
shot('CIN-00','00-02','委託我的人，是記者林依瑤。她害怕那封邀請背後的意思。','The reporter Lin Yiyao had hired me. The invitation frightened her.',doc='commission')
shot('CIN-00','00-02','邀請函來自主辦人王杰倫。五年前，他從另一場大火中活了下來。','The invitation was signed by Wang Jielun, survivor of another fire five years ago.',doc='invitation')
for c in DATA['characters']:shot('CIN-00','00-03',c['name']+'，'+c['role']+'。'+c['intro'],c['en']+', '+c['roleEn']+'. '+c['introEn'],person=c['id'],seconds=8)
shot('CIN-00','00-04','警方通報四具成年人焦屍，身分待驗；起火原因仍在調查。','Four adult bodies, identification pending. The cause remained under investigation.',doc='police')
shot('CIN-00','00-03','我留在封鎖線外，取得許可後，只沿已確認的安全區調查。','I waited outside the cordon, then entered only the cleared investigation route.')
segment('CIN-A','客房：灰燼裡的謊言','Guest room · Lies in the ashes')
shot('CIN-A','A-01','灰綠外套與金屬箱留下了記者的痕跡。那封信，是她恐懼的來源。','The coat and metal box marked the reporter’s belongings. The letter explained her fear.',doc='threat')
shot('CIN-A','A-04','採訪日、房號與遞迴算式，打開了她刻意保留的資料。','The interview day, room number and recurrence opened the records she had kept.')
shot('CIN-A','A-02','她隱匿的，是原本能繼續追查的線索。為了名聲，她把事件寫成懸案。','She had suppressed leads to preserve the attention of an unsolved case.',doc='notes')
shot('CIN-A','A-02','報紙與私人筆記並不一致。但她的秘密，還不能證明她犯下今晚的罪。','The clipping and private notes differed. Her secret did not prove responsibility for tonight.',doc='clipping')
shot('CIN-A','EVIDENCE-01','三只杯子與空瓶留下殘留。此刻，我只能記錄，不能用肉眼完成鑑定。','Three glasses and a bottle held residues. I could record them, not identify them by sight.')
segment('CIN-B','暗房：不在照片裡的人','Darkroom · The missing face')
shot('CIN-B','B-01','手機保留了拍攝預覽與工作花絮，警方交付的是當晚匯出的副本。','The phone retained previews and work fragments. Police supplied a copy exported that night.')
shot('CIN-B','B-04','十八點三十分，四人在鏡頭前。劉子傑掌鏡，偵探尚未到場。','At 18:30 four people stood in frame. Liu Zijie held the camera; I had not arrived.',doc='first-photo')
shot('CIN-B','B-02','二十點，鏡頭前只剩三人。劉涵消失了。','At 20:00 only three remained in frame. Liu Han was absent.',doc='last-photo')
shot('CIN-B','B-03','缺席不是死亡證明。我需要把時刻、工作片段與其他痕跡放在一起。','Absence was not proof of death. I needed to compare the times, recordings and traces.',doc='worklog')
segment('CIN-C','營火：善意與異常重量','Terrace · An unusual weight')
shot('CIN-C','C-01','劉涵是成年恩人好友。這次聚會，他只希望讓王杰倫重新開心。','Liu Han, an adult friend and benefactor, had hoped to cheer Wang up.')
shot('CIN-C','C-02','十九點十分，他還在為自己的好意道歉。','At 19:10 he was still apologizing for a well-meant gesture.',doc='diary')
shot('CIN-C','WATCH','儲藏室的錶停在十九點十五分，血痕旁有擦拭與撞擊痕跡。','The storage-room watch stopped at 19:15, beside wiped blood and impact traces.',doc='watch')
shot('CIN-C','C-02','表層報告讓我一度把顫抖看成對火的恐懼。這只是暫時推測。','The visible report made me read the trembling as fear of fire. It was only a hypothesis.',doc='surface')
shot('CIN-C','C-05','預定食材五公斤，歷史淨載重卻是六十五公斤；即時值與歷史分開保存。','Five kilograms of planned food, but sixty-five in the historical record. Current and historical values were separate.',doc='weight')
shot('CIN-C','C-03','重新配重，解除檢修卡榫。我取出了通往地下室內門的鑰匙。','Reproducing the load released the service latch and revealed the inner-door key.')
shot('CIN-C','C-04','開格後才可觸及的項鍊，輪廓與第一張照片一致。','The pendant, reachable only after opening the hatch, matched the first photograph.',doc='necklace')
shot('CIN-C','C-01','日記、停錶、重量與項鍊指向同一處。但真正的原因，仍在地下。','The diary, watch, load and pendant converged. The reason remained below.')
segment('CIN-D','診療區：另一種飢餓','Clinic · Another hunger')
shot('CIN-D','D-01','虛構UV調查模組，讓張萍原件中被遮住的附記顯現。','The UV investigation module revealed the concealed note on Zhang Ping’s original.',doc='report')
shot('CIN-D','D-02','五年前，先有火災與受困，才有在極端飢餓下食用親屬遺體的往事。','Five years earlier the fire and entrapment came first, followed by consumption of relatives’ remains in extreme hunger.')
shot('CIN-D','C-01','五年後的營火，喚醒的可能不是恐懼，而是王杰倫壓抑的食慾。','The new barbecue may have awakened Wang’s suppressed appetite rather than fear.')
shot('CIN-D','C-02','【案件重建】十九點十五分附近，劉涵在儲藏室遭襲，手錶撞裂。','[Reconstruction] Around 19:15 Liu Han was assaulted in storage and the watch shattered.')
shot('CIN-D','C-05','【案件重建】異常載重與項鍊，把劉涵、儲藏室與烤架連在一起。','[Reconstruction] The load and pendant linked Liu Han, storage and the grill.')
shot('CIN-D','EVIDENCE-01','工作片段顯示取瓶與三人後來失去活動；殘留成分仍待正式檢驗。','Fragments showed a bottle being taken and three guests later unresponsive. Residues still awaited testing.')
shot('CIN-D','D-03','張萍的紀錄不是定罪書。我要用照片、日記與現場關係交叉重建。','Zhang’s notes were not a verdict. Photographs, diary and scene relationships had to corroborate one another.',doc='recording')
shot('CIN-D','D-06','鐵櫃在火災中倒下。警方協助移開後，原先的通路才重新露出。','The cabinet fell in the fire. With police assistance it was moved, exposing the route.')
shot('CIN-D','D-07','門框先被使用，灰後來才覆上。痕跡只支持相對先後，不單獨認人。','The frame had been used before ash settled. Traces established order, not a unique person.',doc='exit-traces')
shot('CIN-D','D-05','主門反鎖，卻不代表所有出口封死。當晚不能確認王杰倫死亡，他可能已逃離。','A bolted main door did not seal every exit. Wang’s death was unconfirmed. He might have escaped.')
segment('CIN-END','終幕：深淵的凝視','Finale · The abyss looks back')
shot('CIN-END','D-05','【真相重建】王杰倫利用聚會控制舊事相關者，氣味觸發後，對劉涵與其餘三人下手。','[Truth reconstructed] Wang used the gathering for control. The smell triggered the attacks on Liu Han and the others.')
shot('CIN-END','C-03','他反鎖主門並引發火災掩飾，火開始蔓延時，從維修出口離開。','He bolted the main door and set the new fire to conceal the crime, escaping as it spread.')
shot('CIN-END','D-06','之後鐵櫃倒下。貼屋露台與烤架塌向低側客廳，先遇害的劉涵也包括在四具遺體中。','The cabinet fell later. The terrace and grill collapsed toward the lower living room; Liu Han was included among the four bodies.')
shot('CIN-END','END-PLATE','我朝森林出口奔去。身後的視角，卻留在原地。','I ran toward the forest exit. The viewpoint behind me remained still.',seconds=9)
shot('CIN-END','END-03','當晚返回取控制器的身影，躲入了枯樹。有人一直注視這裡。','Returning for the controller that night, a figure hid in the hollow tree. Someone was watching.',seconds=9)
shot('CIN-END','END-04','［吞嚥聲］控制器當前值歸零，固定底座的歷史紀錄並未刪除。','[Swallowing] The controller’s current reading reset. History remained in the fixed base.',seconds=9)
shot('CIN-END','END-05','冷光照亮那張熟悉的臉。王杰倫還活著。','Cold light revealed the familiar face. Wang Jielun was alive.',seconds=9)
shot('CIN-END','END-PLATE','真相有時比廢墟還要焦黑。真正的怪物，已隱入森林。','Truth can be darker than the ruins. The monster had vanished into the forest.',seconds=9)
segment('CIN-EPILOGUE','後記：留下名字的人','Epilogue · The names that remain')
shot('CIN-EPILOGUE','D-04','數日後，正式身分核對才完成。當晚的四具遺體，終於有了名字。','Days later formal identification was completed. The four bodies finally had names.',doc='identity')
for c in DATA['characters']:
 if c['id']=='host':continue
 shot('CIN-EPILOGUE','END-PLATE',c['name']+'。'+c['truth'],c['en']+'. '+c['truthEn'],person=c['id'],seconds=10)
shot('CIN-EPILOGUE','END-PLATE','調查結束。你可以回訪章節、重看動畫、閱讀完整解答，或重新整理最終推理。','The investigation is complete. Revisit chapters, replay films, read solutions or retry the final reasoning.',seconds=10)
(OUT/'storyboard.json').write_text(json.dumps(STORY,ensure_ascii=False,indent=2)+'\n')
# Plain text transcript includes every document, cast profile and scene with disclosure stage.
transcript=['# 《餘燼裡的第六人》正式2D敘事全文 v5','\n所有新增文書／英文由製作者依本輪授權補寫；角色姓名依新版美術。原畫不作永久燒字，影片使用獨立可編輯文字層。\n']
for seg in STORY.values():
 transcript+=['## '+seg['title']]
 for n,s in enumerate(seg['shots'],1):transcript+=[f"### {n:02}｜{s['image']}｜{s['seconds']}秒",s['zh'],s['en']]+(['\n**畫面文字**\n'+s['text']] if s['text'] else [])
(ROOT/'assets/story/2D敘事與畫面文字-v5.md').write_text('\n\n'.join(transcript)+'\n')
def run(args):
 r=subprocess.run([FF,'-hide_banner','-loglevel','error','-y',*map(str,args)],capture_output=True,text=True)
 if r.returncode:raise RuntimeError(r.stderr[-3000:])
def make_shot(sid,n,s):
 src=ART/'images'/f"{s['image']}.png";out=CACHE/f'{sid}-{n:02}.mp4';seconds=s['seconds'];title='';body=s['text'];
 if out.exists() and out.stat().st_size>10000:return out
 filters=['fps=24','setpts=PTS-STARTPTS','scale=1280:720:force_original_aspect_ratio=decrease','pad=1280:720:(ow-iw)/2:(oh-ih)/2:color=0x100e0b','setsar=1']
 if s['document']:
  title=DOC[s['document']]['name']+(f" {s['page']}/{s['pages']}" if s['pages']>1 else '')
  filters+=['drawbox=x=700:y=48:w=544:h=566:color=0x18140f@0.93:t=fill','drawbox=x=710:y=58:w=524:h=546:color=0xb59b6b@0.6:t=2']
 elif s['person']:
  c=next(c for c in DATA['characters'] if c['id']==s['person']);title=c['name']+'｜'+c['role'];body='\n'.join(wrap(c['intro'] if sid=='CIN-00' else c['truth'],23))
  # Portrait is an additional input over the original background, not a new generated character.
  filters+=['drawbox=x=700:y=48:w=544:h=566:color=0x18140f@0.94:t=fill']
 if title:
  tp=CACHE/f'{sid}-{n:02}-title.txt';bp=CACHE/f'{sid}-{n:02}-body.txt';tp.write_text(title);bp.write_text(body)
  filters += [f"drawtext=fontfile='{FONT}':textfile='{tp}':x=732:y=85:fontsize=28:fontcolor=0xf0dfb9",f"drawtext=fontfile='{FONT}':textfile='{bp}':x=732:y=145:fontsize=21:line_spacing=12:fontcolor=0xdecba6"]
 if s['person']:
  src=ART/'portraits'/f"{s['person']}.png"
  filters[:4]=['fps=24','setpts=PTS-STARTPTS','scale=580:620:force_original_aspect_ratio=decrease','pad=1280:720:70:(oh-ih)/2:color=0x100e0b']
  filters += ['fade=t=in:st=0:d=0.35',f'fade=t=out:st={seconds-.4}:d=0.4']
  args=['-f','image2','-loop','1','-framerate','24','-i',src,'-vf',','.join(filters),'-frames:v',int(seconds*24),'-r','24']
 else:
  filters += ['fade=t=in:st=0:d=0.35',f'fade=t=out:st={seconds-.4}:d=0.4']
  args=['-f','image2','-loop','1','-i',src,'-vf',','.join(filters),'-t',seconds,'-r','24']
 run(args+['-an','-c:v','libx264','-preset','veryfast','-crf','21','-pix_fmt','yuv420p','-threads','2',out]);return out

def stamp(t,sep='.'):
 m=round(t*1000);h,m=divmod(m,3600000);mi,m=divmod(m,60000);ss,ms=divmod(m,1000);return f'{h:02}:{mi:02}:{ss:02}{sep}{ms:03}'
def build_segment(sid,data):
 files=[make_shot(sid,n,s) for n,s in enumerate(data['shots'])];listing=CACHE/f'{sid}.txt';listing.write_text('\n'.join("file '"+str(x)+"'" for x in files));silent=CACHE/f'{sid}-silent.mp4';run(['-f','concat','-safe','0','-i',listing,'-c','copy',silent]);duration=sum(s['seconds'] for s in data['shots'])
 tracks={};srts=[]
 for lang,col in [('zh-Hant','zh'),('en','en')]:
  vt=['WEBVTT',''];st=[];at=0
  for n,s in enumerate(data['shots'],1):
   end=at+s['seconds'];vt += [f'{stamp(at+.35)} --> {stamp(end-.35)}',s[col],''];st += [str(n),f"{stamp(at+.35,',')} --> {stamp(end-.35,',')}",s[col],''];at=end
  v=OUT/'subtitles'/lang/f'{sid}.vtt';v.write_text('\n'.join(vt));p=CACHE/f'{sid}-{lang}.srt';p.write_text('\n'.join(st));srts.append(p);tracks[lang]=str(v.relative_to(ROOT))
 audio=OUT/'audio/sfx/wind-loop-synthetic-v1.wav'
 # Reuse original authored sound bed, loop/fade to match new story duration; no fake voice-over claim.
 out=OUT/'video'/f'{sid}-story-v5.mp4'
 run(['-i',silent,'-stream_loop','-1','-i',audio,'-i',srts[0],'-i',srts[1],'-map','0:v:0','-map','1:a:0','-map','2:s:0','-map','3:s:0','-c:v','copy','-c:a','aac','-af',f'afade=t=out:st={duration-1}:d=1','-b:a','144k','-c:s','mov_text','-metadata:s:s:0','language=zho','-metadata:s:s:1','language=eng','-movflags','+faststart','-t',duration,out])
 poster=OUT/'web/posters'/f'{sid}.webp';run(['-i',out,'-ss','1','-frames:v','1','-quality','88',poster]);print('已完成',sid,duration,'秒',flush=True)
 return {'id':sid,'title':data['title'],'titleEn':data['titleEn'],'durationMs':int(duration*1000),'video':str(out.relative_to(ROOT)),'poster':str(poster.relative_to(ROOT)),'subtitleTracks':tracks,'sourceImages':sorted(set(str((ART/'images'/f"{s['image']}.png").relative_to(ROOT)) for s in data['shots'])),'sha256':hashlib.sha256(out.read_bytes()).hexdigest(),'shots':len(data['shots'])}
if __name__=='__main__':
 if '--text-only' in sys.argv:print('文書向量圖、分鏡、逐幕全文已寫入');raise SystemExit()
 results={}
 with ThreadPoolExecutor(max_workers=2) as pool:
  jobs={pool.submit(build_segment,i,d):i for i,d in STORY.items()}
  for job in as_completed(jobs):results[jobs[job]]=job.result()
 for i,d in DOC.items():
  dest=OUT/'web/evidence'/f'{i}.webp';run(['-i',ART/'images'/f"{d['image']}.png",'-vf','scale=1440:-2','-frames:v','1','-quality','90',dest])
 for c in DATA['characters']:shutil.copy2(ART/'portraits'/f"{c['id']}.png",OUT/'web/portraits'/f"{c['id']}.png")
 run(['-i',ART/'images/MENU.png','-vf','scale=1920:1080','-frames:v','1','-quality','90',OUT/'web/menu.webp'])
 manifest={'version':5,'date':'2026-11-03','status':'正式共用故事版','segments':[results[i] for i in STORY],'documents':'assets/story/content-v5.json','menu':'assets/story-v5/web/menu.webp','evidence':{i:f'assets/story-v5/web/evidence/{i}.webp' for i in DOC},'sourceArt':'assets/art-redesign-v4','sound':'沿用原創合成音床，延展配合敘事；無正式人物配音'}
 (OUT/'manifest.json').write_text(json.dumps(manifest,ensure_ascii=False,indent=2)+'\n');print('全部完成',sum(s['durationMs'] for s in manifest['segments'])/1000,'秒',flush=True);subprocess.run([sys.executable,str(ROOT/'scripts/align_story_audio.py')],check=True)
