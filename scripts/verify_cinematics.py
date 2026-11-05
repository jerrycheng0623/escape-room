"""相容入口：原v1–v3素材已由v5取代。"""
from pathlib import Path
import runpy
runpy.run_path(str(Path(__file__).with_name('verify_story_v5.py')),run_name="__main__")
