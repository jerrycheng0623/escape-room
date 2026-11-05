"""Render editable mechanism documents from the canonical story JSON; no film/image regeneration."""
import json,html,textwrap,os
from pathlib import Path
os.chdir(Path(__file__).resolve().parents[1])
data=json.loads(Path('assets/story/content-v5.json').read_text());d=data['documents']
out=Path('assets/mechanisms-v3');out.mkdir(exist_ok=True)
for id,doc in d.items():
 if 'art' not in doc:continue
 lines=[]
 for line in doc['body'].split('\n'):lines.extend(textwrap.wrap(line,29) or [''])
 h=max(620,190+len(lines)*43)
 rows=''.join(f'<text x="64" y="{175+i*43}" font-size="27">{html.escape(line)}</text>' for i,line in enumerate(lines))
 diagram=''
 if id in ['manual','c-parts']:
  h+=300
  diagram=f'''<defs><pattern id="hatch" width="12" height="12" patternUnits="userSpaceOnUse"><path d="M-3 3L3-3M0 12L12 0M9 15L15 9" stroke="#837255" stroke-width="2"/></pattern></defs><g transform="translate(65 {h-280})"><rect width="650" height="180" fill="url(#hatch)" stroke="#423f31" stroke-width="5"/><rect x="25" y="30" width="320" height="110" fill="#c0ae87" stroke="#423f31" stroke-width="5"/><text x="45" y="85" font-size="28">K2 內芯 50 kg</text><text x="385" y="85" font-size="28">F1 襯框 10 kg</text><path d="M0 200H650" stroke="#423f31" stroke-width="12"/><text x="0" y="245" font-size="24">G1 隨動導座 5 kg · 填紋皆隨匣退出</text><path d="M700 15h70v175h-70z" fill="none" stroke="#423f31"/><text x="680" y="230" font-size="19">固定平台</text></g>'''
 svg=f'<svg xmlns="http://www.w3.org/2000/svg" width="960" height="{h}" viewBox="0 0 960 {h}"><rect width="960" height="{h}" fill="#c7b591"/><path d="M28 28H932V{h-28}H28Z" fill="none" stroke="#746347" stroke-width="3"/><g fill="#352f25" font-family="PingFang TC,Microsoft JhengHei,sans-serif"><text x="64" y="94" font-size="38">{html.escape(doc["name"])}</text><path d="M64 124H890" stroke="#746347"/>{rows}{diagram}</g></svg>'
 (out/f'{id}.svg').write_text(svg)
# Avoid a transparent overlay illustrated as a prose substitute in the inventory.
(out/'overlay.svg').write_text('<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650"><defs><pattern id="p" width="4" height="4" patternUnits="userSpaceOnUse"><rect width="1000" height="2" fill="white"/></pattern><mask id="m"><rect width="1000" height="650" fill="url(#p)"/></mask></defs><rect width="1000" height="650" fill="#b4a785" opacity=".45"/><g stroke="#494a36" fill="none" stroke-width="4"><circle cx="48" cy="85" r="9"/><path d="M914 85h40M35 580l18 14-18 14"/></g><g font-size="25" fill="#3b4030" font-family="sans-serif"><text x="65" y="59">WJ-05 · 裝訂面</text><g mask="url(#m)"><text x="85" y="160">保密附記　五年前事件　王杰倫自述受困多日</text><text x="85" y="325">後續反覆提及難以面對的進食記憶</text><text x="85" y="490">偵探重建　五年前火災與受困</text></g></g></svg>')
(out/'manifest.json').write_text(json.dumps({'revision':3,'source':'machine.md v3','documents':[id for id,v in d.items() if 'art' in v],'artMethod':'確定性 SVG／Canvas 圖層與原生 3D 幾何；保持既有焦痕紙張配色','cinematicsChanged':False},ensure_ascii=False,indent=2)+'\n')

import json,unicodedata,html
from pathlib import Path
d=json.loads(Path('assets/story/content-v5.json').read_text())['documents']['report']['body'].split('\n')[1:4]
rows=[];indices=['歸檔②／圓孔','歸檔③／斜槽','歸檔①／雙短線']
for i,part in enumerate(d):
 y=[.19,.45,.71][i]*650+24;line='';w=0
 for ch in part:
  cw=24 if unicodedata.east_asian_width(ch) in 'WF' else 13
  if w+cw>825:rows.append({'text':line,'x':85,'y':y,'width':w,'size':24,'region':i});line='';w=0;y+=27
  line+=ch;w+=cw
 rows.append({'text':line,'x':85,'y':y,'width':w,'size':24,'region':i})
 rows.append({'text':indices[i],'x':85,'y':[.36,.62,.88][i]*650-4,'width':len(indices[i])*21,'size':21,'region':i})
Path('web/src/game/recordLayout.mjs').write_text('// Shared physical layout: the attachment, original UV layer and scan regions use these same rows.\nexport const REPORT_ROWS='+json.dumps(rows,ensure_ascii=False)+';\nexport const REPORT_PARTS='+json.dumps(d,ensure_ascii=False)+';\n')
svg='<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="650"><defs><pattern id="p" width="16" height="16" patternUnits="userSpaceOnUse"><path d="M0 0h8v8H0zM8 8h8v8H8z" fill="white"/></pattern><mask id="m"><rect width="1000" height="650" fill="url(#p)"/></mask></defs><rect width="1000" height="650" fill="#b4a785" opacity=".45"/><g stroke="#494a36" fill="none" stroke-width="4"><circle cx="48" cy="85" r="9"/><path d="M914 85h40M35 580l18 14-18 14"/></g><text x="65" y="59" font-family="sans-serif" font-size="22">WJ-05 · 裝訂面</text><g mask="url(#m)" font-family="PingFang TC,sans-serif" fill="#3b4030">'+''.join(f'<text x="{r["x"]}" y="{r["y"]}" font-size="{r["size"]}">{html.escape(r["text"])}</text>' for r in rows)+'</g></svg>'
Path('assets/mechanisms-v3/overlay.svg').write_text(svg)
