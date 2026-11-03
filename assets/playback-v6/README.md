# 影片相容交付 revision 7（沿用資料夾名稱）

由 assets/story-v5 的正式影片轉製，保留原畫、故事、時間軸與聲音；不修改來源原畫或角色。

- 主來源：原始 H.264 High／AAC-LC 串流無損複製，移除內嵌字幕並做 MP4 faststart；不重編碼原畫或原音，也不放大下載流量。
- 備援：VP9／Opus WebM。字幕使用既有外部繁中與英文 VTT，不帶內嵌 mov_text。
- manifest.json 記錄來源 SHA-256、交付 SHA-256、大小及完整 FFmpeg 解碼結果。來源影片更新後需重新製作衍生版本，不能只替換來源而沿用舊衍生檔。
- 製作：FFMPEG=/path/to/ffmpeg python3 scripts/build_playback_compatible.py；需要 libvpx-vp9／libopus 編碼器；MP4直接複製既有串流。再執行 web 的 pnpm build。
- runtime 使用有版本檔名；同時保留 media/video/CIN-*.mp4 舊網址別名，避免已開啟或快取的舊播放器因檔名變動得到404。
- 測試：web/scripts/test-media.mjs（1倍完整自然播放）與 test-media-controls.mjs（操作及故障）。最新實測見根目錄 test.md 第11.4節。

先前compatible-v6.mp4為Baseline實驗，非現行交付；現行來源僅以manifest.json的revision 7清單為準。
