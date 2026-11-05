"""Validate real model exports, their four views and geometry without claiming device QA."""
from pathlib import Path
import json,struct,hashlib,datetime
import numpy as np
from PIL import Image
root=Path(__file__).resolve().parents[1];base=root/'3D/final-v14';manifest=json.loads((base/'manifest.json').read_text());rows=[];fail=[]
for model in manifest['models']:
 try:
  folder=base/model['id'];raw=(folder/'model.glb').read_bytes();magic,version,size=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and version==2 and size==len(raw)
  length,kind=struct.unpack_from('<I4s',raw,12);assert kind==b'JSON';d=json.loads(raw[20:20+length]);off=20+length;length,kind=struct.unpack_from('<I4s',raw,off);assert kind==b'BIN\0';binary=raw[off+8:off+8+length]
  def accessor(index):
   a=d['accessors'][index];v=d['bufferViews'][a['bufferView']];dt={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']];width={'VEC2':2,'VEC3':3,'VEC4':4,'SCALAR':1}[a['type']];offset=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',np.dtype(dt).itemsize*width);arr=np.ndarray((a['count'],width),dtype=dt,buffer=binary,offset=offset,strides=(stride,np.dtype(dt).itemsize));assert np.isfinite(arr).all();return arr
  degenerate=0;triangles=0
  for mesh in d['meshes']:
   for p in mesh['primitives']:
    pos=accessor(p['attributes']['POSITION']);normal=accessor(p['attributes']['NORMAL']);assert np.allclose(np.linalg.norm(normal,axis=1),1,atol=.003),'non-unit normals'
    ix=accessor(p['indices']).ravel() if 'indices'in p else np.arange(len(pos));assert len(ix)%3==0 and ix.max()<len(pos);pts=pos[ix.reshape(-1,3)];areas=np.linalg.norm(np.cross(pts[:,1]-pts[:,0],pts[:,2]-pts[:,0]),axis=1);degenerate+=int((areas<1e-14).sum());triangles+=len(pts)
  assert degenerate==0,('zero area',degenerate)
  views=[]
  for name,metadata in model['files'].items():
   b=(folder/name).read_bytes();assert len(b)==metadata['bytes'];assert hashlib.sha256(b).hexdigest()==metadata['sha256']
   if name.endswith('.webp'):
    im=Image.open(folder/name).convert('RGB');assert im.size==(480,480);a=np.array(im);assert np.std(a)>4;views.append(name)
  assert len(views)==4
  rows.append({'id':model['id'],'triangles':triangles,'views':len(views),'pass':True})
 except Exception as e:fail.append({'id':model['id'],'error':str(e)})
report={'version':14,'date':datetime.datetime.now().astimezone().isoformat(),'models':rows,'failures':fail,'method':'GLB header, finite positions, unit normals, valid indices, nonzero triangle area; four 480px nonempty images; SHA256 of every file'}
(base/'verification.json').write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('Models',len(rows),'Failures',fail);assert not fail
