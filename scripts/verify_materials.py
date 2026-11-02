"""驗證素材結構、指紋、GLB幾何與跨檔一致性；不假稱網站或物理驗收。"""
from pathlib import Path
import json,struct,hashlib
import numpy as np
from PIL import Image
R=Path(__file__).resolve().parents[1]
def j(p):return json.loads((R/p).read_text())
for p in R.rglob('*.json'):json.loads(p.read_text())
mm=j('3D/model-manifest.json');files=[R/x['path'] for x in mm['models']]+[R/'3D/scene/rooms-layout-blockout-v1.glb'];results=[]
for p in files:
 raw=p.read_bytes();magic,ver,total=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and ver==2 and total==len(raw)
 ln,typ=struct.unpack_from('<I4s',raw,12);assert typ==b'JSON';d=json.loads(raw[20:20+ln]);off=20+ln;bn,bt=struct.unpack_from('<I4s',raw,off);assert bt==b'BIN\x00';buf=raw[off+8:off+8+bn];assert len(buf)==d['buffers'][0]['byteLength'];tris=0
 for mesh in d['meshes']:
  for prim in mesh['primitives']:
   vals={}
   for label,ai in list(prim['attributes'].items())+[('indices',prim['indices'])]:
    a=d['accessors'][ai];bv=d['bufferViews'][a['bufferView']];dt='<f4' if a['componentType']==5126 else '<u4';width=3 if a['type']=='VEC3' else 1
    offset=bv.get('byteOffset',0)+a.get('byteOffset',0);size=a['count']*width*4;assert offset+size<=len(buf)
    arr=np.frombuffer(buf,dtype=dt,count=a['count']*width,offset=offset).reshape(-1,width);assert np.isfinite(arr).all();vals[label]=arr
   pos=vals['POSITION'];norm=vals['NORMAL'];idx=vals['indices'].ravel();assert idx.max()<len(pos) and len(idx)%3==0
   assert np.allclose(np.linalg.norm(norm,axis=1),1,atol=.002)
   tri=pos[idx.reshape(-1,3)];areas=np.linalg.norm(np.cross(tri[:,1]-tri[:,0],tri[:,2]-tri[:,0]),axis=1);assert (areas>1e-14).all();tris+=len(tri)
 results.append({'path':str(p.relative_to(R)),'triangles':tris,'sha256':hashlib.sha256(raw).hexdigest(),'status':'GLB結構／索引／有限數值／單位法線／非退化三角面通過'})
objs=j('3D/objects.json');manifest=j('3D/manifest.json');assert len(objs)==42 and len({o['id'] for o in objs})==42
assert manifest['objects']==objs and manifest['modelFileCount']==44
for o in objs:
 p=R/o['reference'];im=Image.open(p);im.verify();assert hashlib.sha256(p.read_bytes()).hexdigest()==o['sha256'];assert (R/o['model']).exists()
actor=Image.open(R/'assets/cinematics/CIN-END/layers/END-ACTOR-v1.png');assert actor.mode=='RGBA';lo,hi=actor.getextrema()[3];assert lo==0 and hi==255
story=j('story-settings.json');assert len(story['resolvedSections'])==9 and story['police']['identificationTime']=='D4 18:20' and story['investigationStart']['day']==4
assert hashlib.sha256((R/story['source']['path']).read_bytes()).hexdigest()==story['source']['sha256']
m=j('assets/cinematics/manifest.json');assert m['integrationRules']==j('game-rules.json');assert len(m['segments'])==6;assert sum(s['durationMs'] for s in m['segments'])==262000
for seg in m['segments']:
 assert 'materials-v3' in seg['video'];assert hashlib.sha256((R/seg['video']).read_bytes()).hexdigest()==seg['sha256']
for model in mm['models']:assert hashlib.sha256((R/model['path']).read_bytes()).hexdigest()==model['sha256']
report={'date':'2026-11-02','status':'通過','storySection2':'S01–S09製作者補完已同步','newObjectReferences':6,'totalObjectReferences':42,'propModelFiles':44,'uniquePropModels':42,'sceneModels':1,'activeVideoSegments':6,'videoDurationSeconds':262,'alphaLayer':'實際RGBA透明，0–255','models':results,'checks':['JSON可解析','42物件索引與來源圖指紋','GLB結構／三角形／法線','透明角色層','規則資料一致','四人身分與D4探索時序','原PDF指紋不變'],'notTested':['正式角色及機關內部','遊戲引擎碰撞與手機效能','真實火災力學或現實鑑識','網站與瀏覽器整合']}
(R/'material-verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('素材核對通過：42參考、44道具GLB、1場景GLB、6段262秒、透明角色層')
