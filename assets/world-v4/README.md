# 機關v4素材與實測

> 2026-11-05 正式版 v14｜網站 1.0.0｜機關 v4／存檔 schema 4／影片 v10。正式發布分支為 `Websit-final`；桌機與手機共用 `https://jerrycheng0623.github.io/escape-room/final/`。Q 切換保留，取消置中的「繼續探索」遮擋框；僅保留底部不遮畫面的手動替代控制。製作預覽／跨關跳過入口已移除；未解鎖章節與影片不能提前開啟，通關後可回訪、獨立重玩及回看。模型與四方向圖見 `3D/final-v14/manifest.json`；本輪實測以 `assets/final-v14/verification/` 及 test.md 為準，舊測試紀錄僅代表其標示版本。


本資料夾收錄86個物件的確定性SVG、更新文書、三張新版插畫及測試證據。`world.mjs`是物件位置與圖面文字來源，`build_world_v4.py`重建物件圖面；精確文字、孔位與圖路以SVG／DOM呈現。

三張插畫使用內建imagegen產生，保留原始PNG並提供WebP：

- `previews/preview-source.png`、`previews/preview.webp`：18:29構圖預覽，無人、無時鐘，清楚呈現現役雙螺栓與有缺口的護罩。時間與K卷邊碼另疊，不把正式18:30合照改時間冒充預覽。
- `previews/old-source.png`、`previews/old.webp`：五年前舊裝修、灰色工作服與單螺栓清點鉤。沒有新增出席者；舊衣物與設備提供年代區別。
- `previews/clinic-source.png`、`previews/clinic.webp`：保留診療區原構圖，移除UV燈及紫光，換透明襯頁、細筆與雙層資料匣。氛圍插畫不取代可操作頁的精確孔路。

生成提示（最終使用）採用 illustration-story／precise-object-edit：以前一版合照作畫風參考，要求陰暗棕綠色電影插畫；預覽拍空山屋構圖及雙螺栓護罩，禁止文字／時鐘／人物；舊片拍舊木牆、單螺栓掛鉤與灰工作服，禁止本次合照；診療圖以原D-01作編輯目標，只替換舊UV道具為透明硬襯頁、細工具及雙層匣，保持房間、桌椅、皮箱、瓶子與恐怖氣氛。所有關鍵數字與中文由獨立確定性圖層補入。

`assets/story-v9/video/`僅替換CIN-A舊密碼箱鏡頭及CIN-D舊UV鏡頭。完整原音軌與其餘鏡頭保留，舊v5/v6/v7公開影片檔不覆寫；新版主格式H.264/AAC MP4，備援VP9/Opus WebM。

原生Three.js模型由roomModelsV4.js建立，另匯出3D/scene/enclosed-*-v9.glb供檢視；網頁實際使用原生幾何與動態物件狀態，不宣稱以GLB提供互動邏輯。網站圖面原解析度可放大，GLB為縮減貼圖的檢視交付。

verification只存本輪實際紀錄；原始截圖與完整本機輸出位於/tmp/embers-v4。實體手機、第一次玩家盲測與長時間熱降頻未驗證。

B設備櫃另提供audio/work-fragment.mp3，使用macOS Eddy（中文台灣）合成試錄，與work-fragment.txt字幕完全相同，經230–3300Hz濾波。不是正式角色演員配音；只有工作流程關係，沒有直接報正確片夾ID。播放依聲音／音量設定，離開近景或切背景停止。
