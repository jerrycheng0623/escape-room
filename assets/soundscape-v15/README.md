# 正式版 v15 聲景

- 2D：七段故事影片各自混入莫里斯・拉威爾《夜之加斯帕》第二首〈絞刑架〉（Le Gibet, 1908）。鋼琴為本專案由 MIDI 重新合成；配樂依段落取樣、調整速度與音量，片尾淡出。原有音軌以原增益混入，視訊封包、畫面及雙語字幕不重新編碼。MP4/AAC 與 WebM/Opus 均有新版。
- 3D：48 秒室內雨聲與遠雷循環，包含原版風聲；雷聲由程式生成，並未使用第三方錄音。進入 A～D 可自動循環，暫停、直向、轉場或開啟工作錄音機時會停下，避免蓋住證據。手機觸控、桌機 Q、既有聲音開關與儲存偏好延續。
- 來源：[拉威爾原作與初版樂譜（IMSLP）](https://imslp.org/wiki/Gaspard_de_la_nuit_(Ravel,_Maurice))；[ScoreBase MIDI 轉錄](https://scorebase.org/scores/201921)，來源為 [PDMX](https://doi.org/10.5281/zenodo.14984509)（Phoebe Long 等；資料集 CC BY 4.0），原轉錄 [MuseScore #6156396](https://musescore.com/user/6053266/scores/6156396)。資料集該筆標示為 [CC0 1.0](https://creativecommons.org/publicdomain/zero/1.0/)，`license_conflict=False`；`no_license_conflict` 清單對應路徑為 `./data/5/7/Qmf8sy4UJ4gqVG5fcHSUvitzyo9Lj8666Zfj4dfwStYTd7.json`。鋼琴音軌以 macOS 內建通用 MIDI 鋼琴離線合成。
- 重建：`swift scripts/render_piano_v15.swift assets/soundscape-v15/ravel-le-gibet-pdmx.mid /tmp/embers-piano.caf`；再以含 NumPy 的 Python 執行 `python3 scripts/build_soundscape_v15.py /tmp/embers-piano.caf`。可用 `FFMPEG` 指定 FFmpeg。原片與輸出逐檔對應見 `manifest.json`。

2026-11-05 雨雷調音：雨聲訊號提升約 5.1 dB；遠雷由每 48 秒 3 次改為 7 次，間隔約 6.5～8.5 秒。以 v16 音檔避開舊快取，保留既有音量開關、暫停及手機操作；影片配樂不變。
