"""Inventory every deliverable source file and deployed file; exclude generated copies and secrets."""
from pathlib import Path
import hashlib,json,datetime
root=Path(__file__).resolve().parents[1]
def meta(p,path):
 b=p.read_bytes();return {'path':path,'bytes':len(b),'sha256':hashlib.sha256(b).hexdigest(),'gitBlobSHA':hashlib.sha1(b'blob '+str(len(b)).encode()+b'\0'+b).hexdigest()}
source=[]
for p in sorted(root.rglob('*')):
 if not p.is_file():continue
 rel=p.relative_to(root);name=str(rel)
 if any(x in ['node_modules','dist','.git','__pycache__','.render-cache']for x in rel.parts)or p.name=='.DS_Store'or p.name.startswith('.env')or name.startswith('web/public/media/')or name=='web/public/media.json'or name=='upload-manifest.json':continue
 source.append(meta(p,name))
dist=root/'web/dist';published=[meta(p,str(p.relative_to(dist)))for p in sorted(dist.rglob('*'))if p.is_file()]
data={'version':14,'generatedAt':datetime.datetime.now().astimezone().isoformat(),'sourceBranch':'Websit-final','pagesBranch':'gh-pages','publicPrefixes':['','final/'],'canonicalURL':'https://jerrycheng0623.github.io/escape-room/final/','sourceFileCount':len(source),'deployedFilesPerEntrance':len(published),'source':source,'deployed':published,'exclusions':['upload-manifest.json 本身避免自我雜湊遞迴','node_modules、dist 在來源分支排除；Pages 另列','產生的 web/public/media 與 media.json 副本','作業系統檔案、快取、.git、.env 及私密設定'],'note':'SHA 與大小為這份快照產生時的檔案；後續驗收新增紀錄會重新產生清單。來源 Commit 與 Pages Commit 見 release-verification.json。'}
(root/'upload-manifest.json').write_text(json.dumps(data,ensure_ascii=False,indent=2)+'\n');print({'sourceFiles':len(source),'deployedPerEntrance':len(published)})
