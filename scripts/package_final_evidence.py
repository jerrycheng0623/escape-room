"""Copy QA reports and compress review copies of screenshots; originals remain in the QA directory."""
from pathlib import Path
from PIL import Image
import json,hashlib,shutil,sys
root=Path(__file__).resolve().parents[1];qa=Path(sys.argv[1]if len(sys.argv)>1 else'/tmp/embers-final/validated');out=root/'assets/final-v14/verification';out.mkdir(exist_ok=True);mapping=[]
for folder in qa.iterdir():
 if not folder.is_dir()or(folder.name.startswith('natural-')and not folder.name.endswith('-final')):continue
 dest=(out/'initial-failures'/folder.name)if folder.name in ['boundaries','boundaries-final']else out/folder.name;dest.mkdir(parents=True,exist_ok=True)
 for p in folder.iterdir():
  if not p.is_file():continue
  if p.suffix=='.json':shutil.copyfile(p,dest/p.name)
  elif p.suffix=='.png':
   target=dest/(p.stem+'.webp');im=Image.open(p).convert('RGB');im.save(target,'WEBP',quality=90,method=4);assert Image.open(target).size==im.size;mapping.append({'original':str(p),'originalSHA256':hashlib.sha256(p.read_bytes()).hexdigest(),'file':str(target.relative_to(root)),'sha256':hashlib.sha256(target.read_bytes()).hexdigest(),'losslessPixels':False,'sameDimensions':True})
   duplicate=dest/p.name
   if duplicate.exists():duplicate.unlink()
(out/'screenshots.json').write_text(json.dumps({'method':'PNG screenshot → quality-90 WebP review copy; dimensions preserved; original PNG and its SHA256 retained in QA directory','images':mapping},ensure_ascii=False,indent=2)+'\n')
shutil.copyfile(qa/'regression.json',out/'regression.json');print('reports and screenshots packaged',len(mapping))
