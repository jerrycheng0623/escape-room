"""Verify both formal entrances against the built release; no HTTP-200-only claim."""
from pathlib import Path
from concurrent.futures import ThreadPoolExecutor,as_completed
import urllib.request,json,hashlib,datetime,time,os
root=Path(__file__).resolve().parents[1];dist=root/'web/dist';base=os.environ.get('EMBERS_PUBLIC_ROOT','https://jerrycheng0623.github.io/escape-room/');release=json.loads((dist/'release.json').read_text());rows=[];errors=[]
def request(url,method='GET',headers=None):return urllib.request.urlopen(urllib.request.Request(url,method=method,headers={'Cache-Control':'no-cache','Accept-Encoding':'identity',**(headers or{})}),timeout=45)
def check(item):
 prefix,p=item;name=str(p.relative_to(dist));url=base+prefix+name;full=p.suffix in ['.html','.json','.js','.css','.vtt']or name.startswith('media/final-v14/');r=request(url,method='GET'if full else'HEAD');row={'url':url,'status':r.status,'contentType':r.headers.get('Content-Type'),'method':'SHA256'if full else'HTTP HEAD'};assert r.status==200,url
 if full:row['sha256']=hashlib.sha256(r.read()).hexdigest();assert row['sha256']==hashlib.sha256(p.read_bytes()).hexdigest(),url
 else:
  length=r.headers.get('Content-Length');row['bytes']=int(length)if length else None
  if length:assert int(length)==p.stat().st_size,(url,length,p.stat().st_size)
 row['pass']=True;return row
for prefix in ['', 'final/']:
 live=json.loads(request(base+prefix+'release.json?verify='+str(time.time_ns())).read());assert live==release,(prefix,'release mismatch');assert live['sourceCodeCommit']and live['formalRelease']and not live['previewMode']
items=[(prefix,p)for prefix in ['', 'final/']for p in dist.rglob('*')if p.is_file()]
with ThreadPoolExecutor(max_workers=8)as pool:
 for f in as_completed({pool.submit(check,i):i for i in items}):
  try:rows.append(f.result())
  except Exception as e:errors.append(str(e))
media=json.loads((dist/'media.json').read_text());ranges=[]
for prefix in ['', 'final/']:
 for film in media:
  for src in film['sources']:
   url=base+prefix+src['src'];r=request(url,headers={'Range':'bytes=0-1023'});data=r.read();assert r.status==206 and len(data)==1024 and r.headers.get('Content-Range','').startswith('bytes 0-1023/'),url
   if src['type'].startswith('video/mp4'):assert data[4:8]==b'ftyp',url
   else:assert data[:4]==b'\x1aE\xdf\xa3',url
   ranges.append({'url':url,'status':206,'contentRange':r.headers['Content-Range'],'pass':True})
report={'date':datetime.datetime.now().astimezone().isoformat(),'sourceCodeCommit':release['sourceCodeCommit'],'pagesCommit':os.environ.get('EMBERS_PAGES_COMMIT'),'files':rows,'ranges':ranges,'errors':errors,'pass':not errors,'method':'Root + final/: all built files checked; code/JSON/subtitles/new model views compared by SHA256; other media checked by HTTP HEAD/length; all seven primary and fallback films checked for byte ranges and magic bytes. Git tree audit separately covers every source/deployed file.'}
out=root/'assets/final-v14/verification/public-files.json';out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print({'files':len(rows),'ranges':len(ranges),'errors':errors});assert not errors
