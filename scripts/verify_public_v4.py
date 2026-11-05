"""Compare deployed root and version assets with the local release, not HTTP200 alone."""
from pathlib import Path
import json,urllib.request,hashlib,time,datetime,os
root=Path(__file__).resolve().parents[1];out=root/'assets/world-v4/verification/public-build.json';release=json.loads((root/'web/dist/release.json').read_text());base=os.environ.get('EMBERS_PUBLIC_ROOT','https://jerrycheng0623.github.io/escape-room/');files=['index.html','release.json',*['assets/'+n for n in release['assets']]];checks=[]
def get(url):return urllib.request.urlopen(urllib.request.Request(url,headers={'Cache-Control':'no-cache'}),timeout=30).read()
for attempt in range(24):
 try:
  live=json.loads(get(base+'mechanisms-v4/release.json?verify='+str(time.time_ns())))
  if live['sourceCodeCommit']!=release['sourceCodeCommit']:raise AssertionError('Published source is not the final patch yet')
  current=[]
  for prefix in ['', 'mechanisms-v4/']:
   for name in files:
    data=get(base+prefix+name);sha=hashlib.sha256(data).hexdigest();expected=hashlib.sha256((root/'web/dist'/name).read_bytes()).hexdigest();assert sha==expected,prefix+name
    current.append({'url':base+prefix+name,'sha256':sha,'pass':True})
  old=get(base+'mechanisms-v3/index.html');assert hashlib.sha256(old).hexdigest()=='edd80d16b524b465ca7fa482ca767661d27bcfb6e27212cc829de56cd2014371';current.append({'url':base+'mechanisms-v3/index.html','preservedOldVersion':True,'pass':True})
  audio=get(base+'mechanisms-v4/media/world-v4/work-fragment.mp3');assert hashlib.sha256(audio).digest()==hashlib.sha256((root/'assets/world-v4/audio/work-fragment.mp3').read_bytes()).digest();current.append({'url':base+'mechanisms-v4/media/world-v4/work-fragment.mp3','sha256':hashlib.sha256(audio).hexdigest(),'pass':True})
  checks=current;break
 except Exception as e:
  if attempt==23:raise
  if attempt%3==0:print('等待部署／CDN同步：',str(e),flush=True)
  time.sleep(10)
report={'date':datetime.datetime.now().astimezone().isoformat(),'sourceCodeCommit':release['sourceCodeCommit'],'pagesCommit':os.environ.get('EMBERS_PAGES_COMMIT'),'files':checks,'pass':bool(checks)};out.write_text(json.dumps(report,ensure_ascii=False,indent=2)+'\n');print('公開root／v4建置、原v3入口與工作MP3逐位元組核對通過',len(checks),flush=True)
