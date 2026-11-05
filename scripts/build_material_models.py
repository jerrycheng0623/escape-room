"""建立可重建的程序化GLB道具初模與場景灰盒；非最終寫實角色／機關模型。"""
from pathlib import Path
import json,math,struct,hashlib
import numpy as np
R=Path(__file__).resolve().parents[1]
OUT=R/'3D/models';OUT.mkdir(parents=True,exist_ok=True)
COLORS={'metal':[.18,.20,.19,1],'wood':[.14,.10,.07,1],'black':[.035,.042,.046,1],'cloth':[.17,.20,.16,1],'paper':[.65,.60,.48,1],'silver':[.52,.55,.57,1],'glass':[.65,.76,.8,.22],'red':[.28,.025,.018,1],'blue':[.025,.11,.25,1],'green':[.035,.22,.09,1],'light':[.28,.55,.75,1]}
class Mesh:
 def __init__(self):self.parts=[]
 def add(self,name,v,f,mat='metal'):
  self.parts.append((name,np.array(v,dtype=np.float32),np.array(f,dtype=np.uint32),mat))
 def box(self,name,c,d,mat='metal'):
  x,y,z=c;a,b,e=np.array(d)/2
  v=[[x+sx*a,y+sy*b,z+sz*e] for sx,sy,sz in [(-1,-1,-1),(1,-1,-1),(1,1,-1),(-1,1,-1),(-1,-1,1),(1,-1,1),(1,1,1),(-1,1,1)]]
  f=[[0,2,1],[0,3,2],[4,5,6],[4,6,7],[0,1,5],[0,5,4],[3,7,6],[3,6,2],[0,4,7],[0,7,3],[1,2,6],[1,6,5]];self.add(name,v,f,mat)
 def lathe(self,name,c,profile,mat='metal',n=32):
  v=[];f=[]
  for h,rad in profile:
   for i in range(n):
    a=i*2*math.pi/n;v.append([c[0]+rad*math.cos(a),c[1]+h,c[2]+rad*math.sin(a)])
  for j in range(len(profile)-1):
   for i in range(n):
    a=j*n+i;b=j*n+(i+1)%n;f.extend([[a,b,b+n],[a,b+n,a+n]])
  self.add(name,v,f,mat)
 def cyl(self,name,c,r,h,mat='metal',n=24):self.lathe(name,c,[(0,0),(0,r),(h,r),(h,0)],mat,n)
 def beam(self,name,a,b,r,mat='metal',n=8):
  a=np.array(a);b=np.array(b);u=b-a;u=u/np.linalg.norm(u);v=np.cross(u,[0,0,1] if abs(u[2])<.9 else [1,0,0]);v/=np.linalg.norm(v);w=np.cross(u,v);pts=[]
  for p in [a,b]:
   for i in range(n):pts.append(p+r*(math.cos(2*math.pi*i/n)*v+math.sin(2*math.pi*i/n)*w))
  f=[]
  for i in range(n):j=(i+1)%n;f.extend([[i,j,j+n],[i,j+n,i+n]])
  f.extend([[0,i+1,i] for i in range(1,n-1)]);f.extend([[n,n+i,n+i+1] for i in range(1,n-1)]);self.add(name,pts,f,mat)
 def export(self,path,extras=None):
  blob=bytearray();views=[];acs=[];meshes=[];nodes=[];mats=[];names=[]
  def acc(arr,target,typ,ct):
   while len(blob)%4:blob.append(0)
   raw=arr.tobytes();off=len(blob);blob.extend(raw);views.append({'buffer':0,'byteOffset':off,'byteLength':len(raw),'target':target})
   a={'bufferView':len(views)-1,'componentType':ct,'count':len(arr),'type':typ}
   if typ=='VEC3':a.update(min=arr.min(axis=0).tolist(),max=arr.max(axis=0).tolist())
   acs.append(a);return len(acs)-1
  allv=[];tri=0
  for name,v,f,mat in self.parts:
   # 展開三角面，避免平滑法線跨越硬邊。
   q=v[f];nr=np.cross(q[:,1]-q[:,0],q[:,2]-q[:,0]);lens=np.linalg.norm(nr,axis=1);valid=lens>1e-14;q=q[valid];nr=nr[valid];lens=lens[valid];nr/=lens[:,None];norm=np.repeat(nr,3,axis=0).astype('<f4');pos=q.reshape(-1,3).astype('<f4');idx=np.arange(len(pos),dtype='<u4')
   if mat not in names:
    names.append(mat);color=COLORS[mat];mm={'name':mat,'pbrMetallicRoughness':{'baseColorFactor':color,'metallicFactor':.75 if mat in ['metal','silver'] else 0,'roughnessFactor':.18 if mat=='glass' else .77},'doubleSided':True}
    if color[3]<1:mm['alphaMode']='BLEND'
    if mat=='light':mm['emissiveFactor']=[.08,.25,.42]
    mats.append(mm)
   pa=acc(pos,34962,'VEC3',5126);na=acc(norm,34962,'VEC3',5126);ia=acc(idx,34963,'SCALAR',5125)
   meshes.append({'name':name,'primitives':[{'attributes':{'POSITION':pa,'NORMAL':na},'indices':ia,'material':names.index(mat)}]})
   nodes.append({'name':name,'mesh':len(meshes)-1});allv.append(v);tri+=len(pos)//3
  while len(blob)%4:blob.append(0)
  doc={'asset':{'version':'2.0','generator':'餘燼素材程序化建模器 v1'},'scene':0,'scenes':[{'nodes':list(range(len(nodes)))}],'nodes':nodes,'meshes':meshes,'materials':mats,'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':acs,'extras':extras or {}}
  raw=json.dumps(doc,ensure_ascii=False,separators=(',',':')).encode();raw+=b' '*((-len(raw))%4)
  data=struct.pack('<4sII',b'glTF',2,12+8+len(raw)+8+len(blob))+struct.pack('<I4s',len(raw),b'JSON')+raw+struct.pack('<I4s',len(blob),b'BIN\x00')+blob;path.parent.mkdir(parents=True,exist_ok=True);path.write_bytes(data)
  allv=np.concatenate(allv);return {'path':str(path.relative_to(R)),'triangles':tri,'nodes':len(nodes),'boundsMeters':{'min':allv.min(axis=0).tolist(),'max':allv.max(axis=0).tolist()},'bytes':len(data),'sha256':hashlib.sha256(data).hexdigest()}
def build(o):
 m=Mesh();i=int(o['id'][1:]);d=o['dimensionsMeters'];x,z,y=d['x'],d['y'],d['z'];wood='wood'
 def b(n,c,dim,mat='metal'):m.box(n,c,dim,mat)
 def legs(h=y*.75):
  for a in [-1,1]:
   for e in [-1,1]:b('支腳',[a*x*.38,h/2,e*z*.35],[max(x*.05,.015),h,max(z*.07,.015)],wood)
 if i==18:
  m.lathe('空瓶身',[0,0,0],[(0,x*.42),(y*.7,x*.48),(y*.85,x*.28),(y,x*.28)],'metal',32)
  m.cyl('空瓶口',[0,y*.94,0],x*.3,y*.06,'black')
 elif i in [1,5,7,10,19,24,25,26,27,28,39,41]:
  mat='paper' if i in [25,26,27] else 'cloth' if i in [10,28] else 'metal'
  b('主體',[0,y*.48,0],[x,y*.9,z],mat)
  if i in [1,7,19]:
   b('獨立蓋板',[0,y*.96,0],[x,.015,z],'black')
   for a in [-1,1]:b('鉸鏈',[a*x*.32,y*.9,z*.45],[.018,.018,.018],'silver')
  if i==1:
   for k in range(3):m.cyl('待定數字輪'+str(k),[(k-1)*x*.2,y*.35,-z*.53],x*.06,.012,'silver')
  if i in [5,24,39]:b('獨立顯示面',[0,y*.52,-z*.508],[x*.8,y*.55,.002],'black')
  if i==18:m.cyl('瓶蓋',[0,y*.92,0],x*.48,y*.08,'black')
  if i==41:b('空腔遮蔽面',[0,y*.94,0],[x*.66,.005,z*.7],'black')
 elif i==2:
  b('機身',[0,y/2,0],[x,y,z*.6],'black');m.beam('鏡頭',[0,y*.55,-z*.2],[0,y*.55,-z*.55],y*.3,'metal',32);b('取景器',[0,y*.9,0],[x*.35,y*.2,z*.3],'black')
 elif i==3:
  for k,mat in enumerate(['red','green','blue']):b('濾鏡'+mat,[(k-1)*x*.31,y/2,0],[x*.28,y,z],mat)
 elif i in [4,9,12,14,16,17,32,42]:
  if i==4:
   legs();b('烤架底',[0,y*.78,0],[x,y*.12,z]);
   for k in range(17):b('獨立烤網',[(-.47+k*.94/16)*x,y*.91,0],[x*.018,y*.015,z*.9],'silver')
   b('歷史記錄固定底座',[x*.4,y*.4,z*.5],[.2,.08,.1]);b('底座服務顯示窗',[x*.4,y*.45,z*.52],[.14,.002,.05],'black')
  elif i==9:
   legs(y*.55);b('床架',[0,y*.55,0],[x,.09,z],wood);b('焦黑床墊',[0,y*.7,0],[x*.96,y*.2,z*.92],'black');b('床頭',[x*.48,y*.7,0],[.05,y*.6,z],wood)
  elif i in [12,14,32]:
   if i==12:legs();h=y*.85
   else:h=y*.12
   b('盆底',[0,h,0],[x,y*.12,z]);
   for a in [-1,1]:b('長邊',[0,h+y*.25,a*z*.47],[x,y*.45,z*.06]);b('短邊',[a*x*.47,h+y*.25,0],[x*.06,y*.45,z])
  elif i in [16,17]:
   legs();b('桌面' if i==17 else '椅面',[0,y*.77,0],[x,y*.09,z],wood)
   if i==16:b('椅背',[0,y*.88,z*.43],[x,y*.25,.04],wood)
  else:
   b('櫃背',[0,y/2,z*.47],[x,y,z*.06]);b('櫃頂',[0,y,0],[x,.035,z]);b('櫃底',[0,.04,0],[x,.04,z]);
   for a in [-1,1]:b('側板',[a*x*.48,y/2,0],[x*.04,y,z]);b('獨立櫃門',[a*x*.245,y*.51,-z*.48],[x*.48,y*.94,.025]);b('把手',[a*x*.08,y*.5,-z*.55],[.018,y*.09,.015],'black')
 elif i in [6,23]:
  r=min(y,z)/2;m.beam('筒身',[-x*.5,y/2,0],[x*.35,y/2,0],r,'black',32);m.beam('燈頭',[x*.35,y/2,0],[x*.5,y/2,0],r*1.15,'light',32)
 elif i in [13,29]:
  m.cyl('筒身',[0,0,0],min(x,z)/2,y,'black');m.cyl('燈頭',[0,y*.85,0],min(x,z)*.58,y*.15,'light' if i!=29 else 'silver')
 elif i==8:
  m.beam('匙柄',[-x*.4,y/2,0],[x*.3,y/2,0],z*.23,'silver');m.lathe('匙環',[-x*.32,y/2,0],[(0,x*.12),(.003,x*.12)],'silver',20)
  for k in range(3):b('匙齒',[x*(.1+k*.13),y/2,z*.3],[x*.09,y,z*.45],'silver')
 elif i==11:
  b('衣身',[0,y*.5,0],[x*.55,y,z*.5],'cloth')
  for a in [-1,1]:b('衣袖',[a*x*.37,y*.55,0],[x*.2,y*.7,z*.6],'cloth')
 elif i==15:
  m.beam('吊線',[-x/2,y,0],[x/2,y,0],.004,'black')
  for k in range(7):b('底片'+str(k),[(k-3)*x*.12,y*.52,0],[x*.06,y*.8,.001],'black')
 elif i in [20,21,35,36]:
  if i in [20,21]:
   b('門板',[0,y/2,0],[x*.9,y*.95,z*.45]);b('把手',[x*.3,y*.5,-z*.48],[x*.15,.03,.03],'silver')
   for a in [-1,1]:b('門框側柱',[a*x*.48,y/2,0],[x*.04,y,z]);b('門框橫梁',[0,y*.98,0],[x,y*.04,z])
  elif i==35:
   for a in [-1,1]:b('牆側',[a*x*.38,y/2,0],[x*.24,y,z],'wood')
   b('窗下牆',[0,y*.2,0],[x,y*.4,z],'wood');b('窗楣',[0,y*.9,0],[x,y*.2,z],'wood')
  else:
   b('煙囪',[0,y/2,0],[x,y,z],'wood');b('煙口暗面',[0,y*1.005,0],[x*.65,.005,z*.65],'black')
 elif i in [22,34]:
  m.lathe('焦黑樹幹',[0,0,0],[(0,x*.48),(y*.15,x*.37),(y*.5,x*.23),(y*.9,x*.12),(y,x*.03)],'wood',16)
  for k in range(5):a=k*2.4;m.beam('分枝',[0,y*(.3+k*.1),0],[x*.6*math.cos(a),y*(.55+k*.09),z*.6*math.sin(a)],x*.05,'wood')
  if i==22:b('樹洞暗面',[0,y*.22,-z*.29],[x*.39,y*.3,.01],'black')
 elif i==30:b('焦木梁',[0,y/2,0],[x,y,z],wood)
 elif i==31:
  m.lathe('石塊',[0,0,0],[(0,x*.22),(y*.4,x*.5),(y*.8,x*.35),(y,x*.1)],'metal',9)
 elif i==33:
  for a in [-1,1]:m.cyl('支架',[a*x*.46,0,0],.015,y);b('底腳',[a*x*.46,.025,0],[.3,.05,.3])
  b('封鎖帶',[0,y*.8,0],[x,.06,.002],'paper')
 elif i==37:
  m.cyl('錶殼',[0,.002,0],.02,.009,'silver',48);m.cyl('錶面',[0,.011,0],.018,.001,'black',48)
  for a in [-1,1]:b('皮錶帶',[0,.005,a*.038],[.018,.004,.041],'wood')
  # 垂直俯視面上7:15，獨立指針幾何。
  m.beam('分針',[0,.013,0],[.015,.013,0],.00045,'silver');m.beam('時針',[0,.014,0],[-.006,.014,.009],.0006,'silver')
 elif i==38:
  rad=.014
  pts=[(rad*math.cos(math.pi/6+k*math.pi/3),.004,rad*math.sin(math.pi/6+k*math.pi/3)) for k in range(6)]
  for k in range(6):m.beam('六角墜飾',pts[k],pts[(k+1)%6],.001,'silver')
  m.beam('斜桿',pts[3],pts[0],.001,'silver')
  for k in range(40):
   a=k*2*math.pi/40;aa=(k+1)*2*math.pi/40;m.beam('鏈節',[.045*math.cos(a),.003,.055*math.sin(a)+.06],[.045*math.cos(aa),.003,.055*math.sin(aa)+.06],.00055,'silver',6)
 elif i==40:
  for k in range(3):
   m.lathe('中空酒杯'+str(k),[(k-1)*.09,0,0],[(0,0),(.002,.032),(.005,.032),(.008,.004),(.095,.003),(.105,.018),(.13,.033),(.17,.037),(.21,.029),(.21,.0275),(.17,.0355),(.13,.0315),(.107,.016),(.103,0)],'glass',40)
 else:b('外形初模',[0,y/2,0],[x,y,z])
 return m

def main():
 objs=json.loads((R/'3D/objects.json').read_text());planned=json.loads((R/'3D/planned-objects.json').read_text())['objects']
 dims={37:(.04,.11,.015),38:(.09,.14,.008),39:(.24,.035,.09),40:(.255,.075,.21),41:(.28,.18,.34),42:(.9,.4,1.8)}
 for o in planned:
  x,z,y=dims[int(o['id'][1:])];o['dimensionsMeters']={'x':x,'y':z,'z':y}
  if o['id'] not in {q['id'] for q in objs}:objs.append(o)
 result=[]
 for o in objs:
  m=build(o);r=m.export(OUT/(o['id']+'-blockout-v1.glb'),{'id':o['id'],'name':o['name'],'stage':'程序化道具初模；非最終寫實資產','coordinates':'glTF右手系Y向上，單位公尺','puzzleInternals':'待使用者第三部分'});r.update(id=o['id'],name=o['name'],status='已建立GLB初模，尚待寫實雕刻／材質／機關校正');result.append(r)
 # 靜態櫃體兩態分檔；沒有假稱動畫或引擎互動已完成。
 cabinet=build(next(o for o in objs if o['id']=='P042'))
 for name,offset in [('blocked',0),('cleared',1.4)]:
  state=Mesh()
  for n,v,f,mat in cabinet.parts:
   vv=v.copy();vv[:,[0,1]]=np.stack([vv[:,1],-.0+vv[:,0]],axis=1);vv[:,1]+=.45;vv[:,0]+=offset;state.add(n,vv,f,mat)
  result.append(dict(state.export(OUT/('P042-'+name+'-v1.glb'),{'stage':'靜態狀態初模','state':name}),id='P042-'+name,name='鐵櫃'+name))
 (R/'3D/model-manifest.json').write_text(json.dumps({'version':1,'date':'2026-11-02','stage':'42類程序化初模＋櫃體兩態；不等同最終寫實可玩資產','uniquePropCount':42,'modelFileCount':len(result),'models':result,'notComplete':['正式角色','機關內部／答案／精確動畫','美術精修貼圖與LOD','引擎碰撞及手機效能實測']},ensure_ascii=False,indent=2)+'\n')
 print('已產生',len(result),'個GLB檔；42類物件初模與倒櫃兩態')
if __name__=='__main__':main()
