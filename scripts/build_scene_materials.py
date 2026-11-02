from pathlib import Path
import json,math
import numpy as np
from PIL import Image,ImageDraw,ImageFont
from build_material_models import Mesh,COLORS,R,build
OUT=R/'3D/scene';OUT.mkdir(parents=True,exist_ok=True)
font=ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc',20)
small=ImageFont.truetype('/System/Library/Fonts/STHeiti Medium.ttc',15)
rooms=[('入口',[0,0,0],[6,8]),('客廳／廚房殘角',[0,0,8],[6,8]),('A客房',[6.5,0,8],[7,5]),('B暗房',[12,0,8],[4,3]),('C貼屋露台',[0,.45,17],[12,10]),('D地下診療',[11,-2.4,17],[8,6])]
scene=Mesh();colliders=[]
for name,(x,y,z),(w,d) in rooms:
 scene.box(name+'地坪',[x,y-.08,z],[w,.16,d],'wood')
 # 灰盒用低殘牆，門口分段留空，沒有把所有房間封死。
 for a in [-1,1]:
  scene.box(name+'殘牆',[x+a*w/2,y+.38,z],[.12,.76,max(.1,d-2.4)],'metal')
  for side in [-1,1]:scene.box(name+'殘牆',[x+side*(w/4+.6),y+.38,z+a*d/2],[max(.1,w/2-1.2),.76,.12],'metal')
 colliders.append({'name':name+'地坪','type':'box','center':[x,y-.08,z],'size':[w,.16,d],'kind':'walkable','stage':'規劃碰撞體，未在遊戲引擎測試'})
# 只作建模比例檢查的連接板；無網站互動。
scene.box('B往C廊道',[8.5,-.08,11.4],[7,.16,1.2],'wood');scene.box('B廊道接板',[12,-.08,10.2],[1.2,.16,2.4],'wood')
for k in range(3):scene.box('露台短階',[5,.075*(k+1),11.7+.25*k],[1.2,.15*(k+1),.25],'wood')
scene.box('C到D階梯平台',[7,.37,20],[2,.16,1.3],'wood')
for k in range(16):
 top=.45-(k+1)*2.85/16
 scene.box('地下室第'+str(k+1)+'階',[8,(top-2.4)/2,20-(k+.5)*6/16],[1.25,max(.02,top+2.4),6/16],'wood')
# 出口沿外部緩坡回到森林地坪。
for k in range(20):
 top=-2.4+(k+1)*2.4/20
 scene.box('出口回升坡灰盒'+str(k),[15+(k+.5)*.45,top-.08,17],[.45,.16,1.4],'wood')
placements=[('P001',[7,0,7]),('P002',[12,0,7.8]),('P004',[0,.45,12.55]),('P005',[21,0,21]),('P006',[7,0,20]),('P007',[11,-2.4,17]),('P008',[1,.45,14]),('P009',[5.5,0,9]),('P012',[12,0,8.5]),('P016',[11,-2.4,18]),('P017',[10,-2.4,16]),('P018',[1.8,0,8]),('P019',[6,.45,20]),('P020',[0,0,4]),('P021',[15,-2.4,17]),('P022',[21,0,21]),('P023',[0,0,1]),('P026',[1,.45,14]),('P031',[-2,.45,16]),('P032',[-2,.45,18]),('P033',[0,0,-3]),('P036',[-2,0,10]),('P037',[8.8,0,7]),('P038',[.3,.8,12.7]),('P039',[12,1.7,8.9]),('P040',[2,0,7]),('P041',[-1,0,7]),('P042',[14.3,-2.4,17])]
objs=json.loads((R/'3D/objects.json').read_text())
planned=json.loads((R/'3D/planned-objects.json').read_text())['objects'];dims={37:(.04,.11,.015),38:(.09,.14,.008),39:(.24,.035,.09),40:(.255,.075,.21),41:(.28,.18,.34),42:(.9,.4,1.8)}
for o in planned:
 if o['id'] not in {q['id'] for q in objs}:
  x,z,y=dims[int(o['id'][1:])];o['dimensionsMeters']={'x':x,'y':z,'z':y};objs.append(o)
by={o['id']:o for o in objs}
for id,p in placements:
 model=build(by[id])
 for n,v,f,mat in model.parts:
  if id=='P042':
   v=v.copy();v[:,[0,1]]=np.stack([v[:,1],v[:,0]],axis=1);v[:,1]+=.45
  scene.add(id+'_'+n,v+np.array(p),f,mat)
result=scene.export(OUT/'rooms-layout-blockout-v1.glb',{'stage':'靜態場景灰盒，非網站或完成的寫實場景','source':'3D/scene/scene-layout.json'})
layout={'version':1,'coordinates':'glTF，X東／Y上／Z南，公尺','rooms':[{'name':n,'floorCenter':p,'widthDepthMeters':d} for n,p,d in rooms],'placements':[{'id':i,'position':p} for i,p in placements],'colliders':colliders,'stairs':{'top':[8,.45,20],'bottom':[8,-2.4,14],'steps':16,'width':1.25},'collapse':{'grillBefore':[0,.45,12.55],'landingArea':[0,0,11.4],'direction':[0,-.45,-1.15],'isPhysicsSimulation':False},'bodyRecoverySites':[{'person':'記者','position':[-1,0,7]},{'person':'攝影師','position':[1,0,7.8]},{'person':'醫師','position':[.5,0,9]},{'person':'恩人','position':[0,0,11.4]}],'notes':['D4現場遺體已移走，採集點只供案件圖對照','剖面與通路為靜態幾何檢查；引擎碰撞、坡面與真人視角未測','P005在樹洞代表可拆控制器；烤架P004含固定底座服務面板，不複製同一控制器'],'model':result}
(OUT/'scene-layout.json').write_text(json.dumps(layout,ensure_ascii=False,indent=2)+'\n')
# 自製幾何預覽渲染，只畫程式建立的模型，非修改AI圖片。
def preview(mesh,size=260,yaw=3.84,pitch=.45):
 cy,sy=math.cos(yaw),math.sin(yaw);cp,sp=math.cos(pitch),math.sin(pitch)
 rot=np.array([[cy,0,sy],[-sp*sy,cp,sp*cy],[-cp*sy,-sp,cp*cy]])
 verts=np.concatenate([v for _,v,_,_ in mesh.parts]);center=(verts.min(0)+verts.max(0))/2
 allp=(verts-center)@rot.T;span=max(np.ptp(allp[:,0]),np.ptp(allp[:,1]),.001);scale=size*.8/span
 im=Image.new('RGB',(size,size),(22,25,29));draw=ImageDraw.Draw(im);faces=[]
 for _,v,f,mat in mesh.parts:
  q=(v-center)@rot.T
  for tri in f:
   p=q[tri];normal=np.cross(p[1]-p[0],p[2]-p[0]);normal/=max(np.linalg.norm(normal),1e-9);shade=.45+.5*abs(float(normal@np.array([.3,.5,.8])))
   color=tuple(int(min(255,max(0,255*c*shade))) for c in COLORS[mat][:3]);pts=[(float(x*scale+size/2),float(-y*scale+size/2)) for x,y,_ in p];faces.append((float(p[:,2].mean()),pts,color))
 for _,p,c in sorted(faces,key=lambda x:x[0]):draw.polygon(p,fill=c)
 return im
pre=R/'3D/previews';pre.mkdir(exist_ok=True)
contact=Image.new('RGB',(7*260,6*296),(16,19,23))
for idx,o in enumerate(objs):
 im=preview(build(o));im.save(pre/(o['id']+'-model-v1.png'));x=(idx%7)*260;y=(idx//7)*296;contact.paste(im,(x,y));ImageDraw.Draw(contact).text((x+10,y+264),o['id']+' '+o['name'],font=small,fill=(220,221,215))
contact.save(pre/'all-42-models-v1.png')
# 新六物件真實幾何六角度圖，與生成外觀表分開。
for o in objs:
 sheet=Image.new('RGB',(780,560),(16,19,23));dr=ImageDraw.Draw(sheet)
 for i,(label,yaw,pitch) in enumerate([('正面',0,0),('右側',math.pi/2,0),('背面',math.pi,0),('左側',-math.pi/2,0),('頂面',0,math.pi/2),('底面',0,-math.pi/2)]):
  im=preview(build(o),240,yaw,pitch);viewsdir=pre/o['id'];viewsdir.mkdir(exist_ok=True);im.save(viewsdir/(['front','right','back','left','top','bottom'][i]+'-v1.png'));xx=(i%3)*260;yy=(i//3)*280;sheet.paste(im,(xx,yy));dr.text((xx+10,yy+242),label,font=small,fill=(220,221,215))
 sheet.save(pre/(o['id']+'-model-six-views-v1.png'))
# 俯視平面SVG與剖面SVG，文字不烘焙進模型。
svg=['<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="900" viewBox="0 0 1200 900"><rect width="1200" height="900" fill="#10161a"/><g font-family="sans-serif" fill="#e6dfd2">','<text x="45" y="45" font-size="26">場景灰盒配置｜X東、Z南｜單位公尺</text>']
for n,(x,y,z),(w,d) in rooms:
 xx=300+(x-w/2)*27;yy=160+(z-d/2)*27;svg.append(f'<rect x="{xx}" y="{yy}" width="{w*27}" height="{d*27}" fill="#26383f" stroke="#8ca1a6"/><text x="{xx+8}" y="{yy+25}" font-size="16">{n}｜地坪{y}m</text>')
svg+=['<text x="50" y="850" font-size="18">D採地下層；與地上區投影不等於同高。路徑／樓梯詳scene-layout.json。非火災物理模擬。</text></g></svg>'];(OUT/'floor-plan.svg').write_text(''.join(svg))
section='''<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="620" viewBox="0 0 1200 620"><rect width="1200" height="620" fill="#10161a"/><g font-family="sans-serif" fill="#e6dfd2"><text x="45" y="48" font-size="28">客廳—貼屋露台剖面｜故事空間配置</text><path d="M80 400H550V355H1110" fill="none" stroke="#98a7a3" stroke-width="9"/><text x="100" y="440" font-size="23">客廳地坪 ±0.00m</text><text x="750" y="400" font-size="23">露台 +0.45m</text><rect x="610" y="240" width="150" height="25" fill="#607078"/><path d="M625 265V355M745 265V355" stroke="#607078" stroke-width="7"/><text x="610" y="216" font-size="22">烤架位於貼屋端</text><path d="M650 285Q570 320 485 380" fill="none" stroke="#bb7654" stroke-width="5"/><polygon points="485,380 510,352 518,377" fill="#bb7654"/><text x="220" y="300" font-size="21">靠屋托梁失效 → 向客廳低側落下</text><text x="50" y="530" font-size="20">本圖核對高差、落點與敘事；未模擬熱、承載或真實倒塌。</text><text x="50" y="565" font-size="20">四名死者原位採集點見scene-layout.json，D4正式探索遺體已移出。</text></g></svg>''';(OUT/'collapse-section.svg').write_text(section)
print('已輸出場景GLB、平面／剖面SVG、42模型預覽及42類獨立幾何六視圖')
