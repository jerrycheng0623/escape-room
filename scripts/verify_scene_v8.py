"""Verify the four actual exported rooms; no claim of real-world engineering or phone performance."""
import json,struct,hashlib,datetime
from pathlib import Path
import numpy as np
root=Path(__file__).resolve().parents[1];results=[]
for room in 'ABCD':
 p=root/f'3D/scene/enclosed-{room}-v8.glb';raw=p.read_bytes();magic,version,size=struct.unpack_from('<4sII',raw);assert magic==b'glTF' and version==2 and size==len(raw)
 length,kind=struct.unpack_from('<I4s',raw,12);assert kind==b'JSON';d=json.loads(raw[20:20+length]);off=20+length;length,kind=struct.unpack_from('<I4s',raw,off);assert kind==b'BIN\0';binary=raw[off+8:off+8+length];assert len(binary)>=d['buffers'][0]['byteLength']
 def accessor(index):
  a=d['accessors'][index];v=d['bufferViews'][a['bufferView']];dt={5126:'<f4',5125:'<u4',5123:'<u2',5121:'u1'}[a['componentType']];width={'VEC2':2,'VEC3':3,'VEC4':4,'SCALAR':1}[a['type']];offset=v.get('byteOffset',0)+a.get('byteOffset',0);stride=v.get('byteStride',np.dtype(dt).itemsize*width);arr=np.ndarray((a['count'],width),dtype=dt,buffer=binary,offset=offset,strides=(stride,np.dtype(dt).itemsize));assert np.isfinite(arr).all();return arr
 triangles=0;degenerate=0
 for mesh in d['meshes']:
  for primitive in mesh['primitives']:
   pos=accessor(primitive['attributes']['POSITION']);normal=accessor(primitive['attributes']['NORMAL']);assert np.allclose(np.linalg.norm(normal,axis=1),1,atol=.003)
   indices=accessor(primitive['indices']).ravel() if 'indices' in primitive else np.arange(len(pos));assert len(indices)%3==0 and indices.max()<len(pos)
   points=pos[indices.reshape(-1,3)];areas=np.linalg.norm(np.cross(points[:,1]-points[:,0],points[:,2]-points[:,0]),axis=1);degenerate+=int((areas<1e-14).sum());triangles+=len(points)
 assert degenerate==0,(room,degenerate)
 results.append({'room':room,'path':str(p.relative_to(root)),'bytes':len(raw),'triangles':triangles,'sha256':hashlib.sha256(raw).hexdigest(),'pass':True})
out=root/'assets/mechanisms-v3/scene-verification.json';out.write_text(json.dumps({'date':datetime.datetime.now().astimezone().isoformat(),'method':'GLB header, bounds, typed accessors, finite positions, unit normals, indices and triangle area','rooms':results},ensure_ascii=False,indent=2)+'\n');print('四區v8 GLB結構、索引、法線與非退化三角面通過')
