"""相容入口：使用已核定新版原畫重製v5正式敘事。"""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name("build_story_v5.py")),run_name="__main__")
