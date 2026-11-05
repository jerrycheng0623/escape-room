> 版本註記（2026-11-05）：本文保留原始來源或歷史交付，不是正式版 v14 的操作規格。現況請以專案根目錄 PLAN.md、verify.md、test.md 與 3D/final-v14/manifest.json 為準；本文舊版本的預覽入口及舊模型不會重新啟用。

# v5原始母版與目前播放的界線

目前播放器依assets/playback-v6/manifest.json version9：A/D使用story-v9替換片，其他五片保留v7相容交付；storyboard與字幕已同步機關v4。以下原母版交付脈絡保留，完整現況見專案根目錄素材交付.md及test.md第11.5節。

# 正式敘事與網站素材 v5

2026-11-03；七段484.5秒、雙字幕軌、26文書、五人肖像。來源原畫在../art-redesign-v4/，共用故事在../story/content-v5.json。

重製：python scripts/build_story_v5.py（需Python環境、imageio_ffmpeg）；音軌自動按鏡頭重排。檢查：scripts/verify_story_v5.py；網站：web/。完整逐鏡全文在../story/2D敘事與畫面文字-v5.md。

cleanup-manifest.json保存已刪舊檔雜湊／新對照；verification內保存本輪技術與網站測試證據。沒有真人配音、電影級3D精修或實體手機驗收。
