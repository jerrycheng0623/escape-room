"""Deterministic object faces; preserve canonical cinematic images/audio."""
from pathlib import Path
import json,html,textwrap,base64,subprocess
root=Path(__file__).resolve().parents[1]
node=Path.home()/'.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node'
source="import {WORLD,PAGES} from './web/src/game/world.mjs';console.log(JSON.stringify({WORLD,PAGES}));"
data=json.loads(subprocess.check_output([str(node),'--input-type=module','-e',source],cwd=root))
out=root/'assets/world-v4';out.mkdir(exist_ok=True)
def esc(s):return html.escape(str(s))
for id,w in data['WORLD'].items():
 parts=['<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" width="1000" height="760" viewBox="0 0 1000 760">','<defs><filter id="grain"><feTurbulence baseFrequency=".4" numOctaves="3" stitchTiles="stitch"/><feColorMatrix type="saturate" values="0"/><feComponentTransfer><feFuncA type="linear" slope=".07"/></feComponentTransfer><feBlend in="SourceGraphic" mode="multiply"/></filter></defs>','<rect width="1000" height="760" fill="#202720"/>','<rect x="28" y="25" width="944" height="710" rx="10" fill="#cbbd9a" stroke="#8b7051" stroke-width="5" filter="url(#grain)"/>',f'<text x="65" y="82" fill="#443423" font-family="serif" font-size="28">{esc(w["name"])} · {esc(w["zone"])}</text>']
 if w['kind']=='film':
  photo=(root/'assets/world-v4/previews/preview.webp') if id=='b-f27' else (root/'assets/world-v4/previews/old.webp') if id=='b-o12' else root/f'assets/story-v5/web/evidence/{w.get("photo","first-photo")}.webp';raw=base64.b64encode(photo.read_bytes()).decode()
  people='18:30 四人入鏡' if id in ['b-f28','b-p28'] else '18:29 構圖預覽' if id=='b-f27' else '20:00 三人入鏡' if id=='b-f31' else '五年前／舊設備' if id=='b-o12' else '曝光測試'
  parts+=['<rect x="75" y="110" width="850" height="410" fill="#151d19"/>']
  if id!='b-t00': parts+=[f'<image href="data:image/webp;base64,{raw}" x="100" y="135" width="800" height="350" preserveAspectRatio="xMidYMid slice" opacity=".85"/>']
  else: parts+=['<path d="M400 420V280Q500 150 600 280V420Z" fill="#aab0a4"/><circle cx="500" cy="210" r="55" fill="#afb4a8"/>']
  if id!='b-p28':
   for x in range(100,900,55):parts+=[f'<rect x="{x}" y="116" width="23" height="15" fill="#d6cbaf"/><rect x="{x}" y="493" width="23" height="15" fill="#d6cbaf"/>']
  transform='transform="translate(1000 0) scale(-1 1)"' if id=='b-p28' else ''
  parts+=[f'<g {transform}><rect x="130" y="153" width="230" height="52" fill="#18221b"/><text x="145" y="190" fill="#ede1c3" font-family="monospace" font-size="30">{esc(w["time"])} {w["roll"]}/{w["frame"]}</text></g>']
  if id in ['b-f27','b-f28','b-f31','b-o12']:
   parts+=['<rect x="775" y="210" width="90" height="110" fill="#6b745e" stroke="#d6cbaf"/>','<circle cx="800" cy="235" r="8" fill="#e2d5ac"/>']
   if id!='b-o12':parts+=['<circle cx="840" cy="285" r="8" fill="#e2d5ac"/>','<path d="M784 260H858" stroke="#283a2a" stroke-width="12"/>']
  y=555
 elif w.get('diagram'):
  parts+=['<rect x="80" y="365" width="840" height="275" fill="#9b9276" stroke="#473c2d"/>']
  if w['diagram']=='upper':
   parts+=['<path d="M240 400H700M440 530H600" fill="none" stroke="#5a5140" stroke-width="12"/>','<circle cx="520" cy="540" r="30" fill="none" stroke="#544835" stroke-width="10"/>','<rect x="425" y="580" width="185" height="42" fill="#574d3c"/>','<text x="620" y="608" font-size="24" fill="#332b22">70 kg 等效</text>','<path d="M140 420V590M120 420H160M120 590H160" stroke="#413d30" stroke-width="3"/>','<text x="165" y="510" font-size="22" fill="#332b22">框位移</text>']
  elif w['diagram']=='lower':
   parts+=['<path d="M260 400V550Q300 610 340 550V400" fill="none" stroke="#5b4631" stroke-width="9"/>','<circle cx="300" cy="550" r="33" fill="none" stroke="#605442" stroke-width="10"/>','<circle cx="620" cy="420" r="32" fill="none" stroke="#605442" stroke-width="10"/>','<circle cx="210" cy="410" r="10" fill="#44372a"/><circle cx="210" cy="455" r="10" fill="#44372a"/>','<text x="390" y="600" font-size="24" fill="#332b22">另一視向・兩股托同一輪</text>']
  else:
   parts+=['<path d="M250 590V450Q300 390 350 450V590" stroke="#514435" stroke-width="9" fill="none"/>','<circle cx="300" cy="440" r="32" stroke="#5a4d3d" stroke-width="10" fill="none"/>','<rect x="200" y="590" width="100" height="30" fill="#514435"/>','<text x="480" y="500" font-size="28" fill="#463a2b">單股／拆件參考</text>']
  y=145
 elif w.get('page'):

  pg=data['PAGES'][w['page']];parts+=['<rect x="510" y="125" width="420" height="480" fill="#b0c9b2" fill-opacity=".27" stroke="#6b7d6d"/>','<path d="M530 150V130H550" fill="none" stroke="#473e2f" stroke-width="4"/>']
  point={i:[565+(i-1)%3*140,235+(i-1)//3*190] for i in range(1,7)}
  for n in pg['holes']:x,y=point[n];parts+=[f'<circle cx="{x}" cy="{y}" r="20" fill="#202720" stroke="#66563d"/>']
  if pg['path']:
   a,b=[point[n] for n in pg['path']];parts+=[f'<path d="M{a[0]} {a[1]}L{b[0]} {b[1]}" stroke="#54432c" stroke-width="4" fill="none"/>']
  for label,key in [('起','start'),('終','end')]:
   if key in pg:x,y=point[pg[key]];parts+=[f'<text x="{x}" y="{y-35}" text-anchor="middle" fill="#493d2d" font-size="25">{label}</text>']
  y=140
 else:
  if w['kind'] not in ['paper','record']:
   parts+=['<path d="M660 180L850 140L910 290L760 345Z" fill="#615d4e" stroke="#aa9674" stroke-width="6"/>','<path d="M760 345V470L910 410V290M660 180V365L760 470" fill="#373e34" stroke="#9c8868" stroke-width="5"/>']
  y=145
 width=21 if w.get('page') else 43
 for line in w['body'].split('\n'):
  for text in textwrap.wrap(line,width=width,replace_whitespace=False,drop_whitespace=False) or ['']:
   parts+=[f'<text x="65" y="{y}" fill="#342d22" font-family="serif" font-size="20">{esc(text)}</text>'];y+=32
  y+=12
 if w.get('back'):parts+=[f'<text x="65" y="690" fill="#69553a" font-family="serif" font-size="16">背面另有文字，可翻面查看</text>']
 parts+=['</svg>'];(out/(id+'.svg')).write_text(''.join(parts),encoding='utf8')
(out/'manifest.json').write_text(json.dumps({'revision':4,'source':'web/src/game/world.mjs','objects':list(data['WORLD']),'method':'Native SVG document/film faces; canonical photos retained, new readable time/edge/fixture details explicitly authored.'},ensure_ascii=False,indent=2)+'\n')
print('已建立',len(data['WORLD']),'件物件圖面')
