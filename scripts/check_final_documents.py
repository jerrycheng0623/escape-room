"""Record applicability, checksums and local links of every Markdown source."""
from pathlib import Path
import json,hashlib,re,urllib.parse
root=Path(__file__).resolve().parents[1];file=root/'assets/final-v14/markdown-registry.json';d=json.loads(file.read_text());bad=[]
for item in d['documents']:
 p=root/item['path'];item['sha256']=hashlib.sha256(p.read_bytes()).hexdigest();missing=[]
 for match in re.finditer(r'\[[^\]\n]*\]\((?:<([^>\n]+)>|((?:[^()\n]|\([^()\n]*\))+))\)',p.read_text()):
  href=(match.group(1)or match.group(2)).strip().split(' "')[0].strip('<>');url=urllib.parse.urlsplit(href)
  if url.scheme or href.startswith('#'):continue
  target=urllib.parse.unquote(url.path)
  if target and not (p.parent/target).exists():missing.append(href)
 item['missingLocalLinks']=sorted(set(missing))
 if missing and item['role']=='現行維護文件':bad.append({'path':item['path'],'links':missing})
file.write_text(json.dumps(d,ensure_ascii=False,indent=2)+'\n');print(json.dumps({'documents':len(d['documents']),'currentMissingLinks':bad},ensure_ascii=False));raise SystemExit(1 if bad else 0)
