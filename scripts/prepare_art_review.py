"""v5已直接整合正式網站，不再複製舊遊戲。"""
from pathlib import Path
p=Path(__file__).resolve().parents[1]/"assets/art-redesign-v4/review.html"
assert p.exists()
print("素材入口：",p,"；正式網站：http://127.0.0.1:5173/")
