# 機關v4素材與實測

本資料夾收錄86個物件的確定性SVG、更新文書、三張新版插畫及測試證據。`world.mjs`是物件位置與圖面文字來源，`build_world_v4.py`重建物件圖面；精確文字、孔位與圖路以SVG／DOM呈現。

三張插畫使用內建imagegen產生，保留原始PNG並提供WebP：

- `previews/preview-source.png`、`previews/preview.webp`：18:29構圖預覽，無人、無時鐘，清楚呈現現役雙螺栓與有缺口的護罩。時間與K卷邊碼另疊，不把正式18:30合照改時間冒充預覽。
- `previews/old-source.png`、`previews/old.webp`：五年前舊裝修、灰色工作服與單螺栓清點鉤。沒有新增出席者；舊衣物與設備提供年代區別。
- `previews/clinic-source.png`、`previews/clinic.webp`：保留診療區原構圖，移除UV燈及紫光，換透明襯頁、細筆與雙層資料匣。氛圍插畫不取代可操作頁的精確孔路。

生成提示（最終使用）採用 illustration-story／precise-object-edit：以前一版合照作畫風參考，要求陰暗棕綠色電影插畫；預覽拍空山屋構圖及雙螺栓護罩，禁止文字／時鐘／人物；舊片拍舊木牆、單螺栓掛鉤與灰工作服，禁止本次合照；診療圖以原D-01作編輯目標，只替換舊UV道具為透明硬襯頁、細工具及雙層匣，保持房間、桌椅、皮箱、瓶子與恐怖氣氛。所有關鍵數字與中文由獨立確定性圖層補入。

`assets/story-v9/video/`僅替換CIN-A舊密碼箱鏡頭及CIN-D舊UV鏡頭。完整原音軌與其餘鏡頭保留，舊v5/v6/v7公開影片檔不覆寫；新版主格式H.264/AAC MP4，備援VP9/Opus WebM。

原生Three.js模型由roomModelsV4.js建立，另匯出3D/scene/enclosed-*-v9.glb供檢視；網頁實際使用原生幾何與動態物件狀態，不宣稱以GLB提供互動邏輯。網站圖面原解析度可放大，GLB為縮減貼圖的檢視交付。

verification只存本輪實際紀錄；原始截圖與完整本機輸出位於/tmp/embers-v4。實體手機、第一次玩家盲測與長時間熱降頻未驗證。
