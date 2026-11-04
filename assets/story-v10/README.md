# 七片影像與字幕對齊 v10

故事依核定角色與現行機關v4，保留原畫與舊影片。七片52幕，484.5秒，24FPS；MP4 H.264/AAC及WebM VP9/Opus，使用外部繁中／英文VTT。timeline.json同時記錄每幕來源圖片SHA、人物ID／姓名、字幕、開始結束秒及渲染快取。

repair_cinematic_alignment.py重建七片，verify_cinematic_alignment.py逐影格比對MP4與來源渲染、WebM各幕SSIM、104則字幕與原AAC封包；web/scripts/test-caption-alignment.mjs在實際播放器驗證字幕切換及語句。SSIM比較停用filter自動重新初始化，避免來源色彩中繼資料改變時統計檔被重設；原始每格MD5另核對，不能只信容器長度。所有暫存與截圖在/tmp/embers-subtitle-audit，渲染快取不提交。

修正：序幕／後記的記者卡影格不足；文書遮住合照人物；五年前回顧誤用本次人物；65.3錯誤秤面。記者PNG檔尾有32bytes，保留原檔，僅在暫存複本去除IEND後資料，不重新生成或改動像素。文書圖完整縮放置左，文字另置右。五年前以既有舊屋空景搭配回顧字幕；敘事重建不是連續犯罪錄影。

正式播放器來源見assets/playback-v6/manifest.json version10，素材準備程式採版本化影片／字幕／poster。原v7／v9與舊VTT仍保留；新檔名避開Safari Range快取混用。實體iOS Safari尚未驗證。
