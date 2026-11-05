# 正式版 v14 模型與四方向圖

本目錄由遊戲實際的 `roomModelsV4.js`／`propModelsFinal.js` 匯出。每個 ID 資料夾包含 `model.glb` 與前、後、左、右四張 480×480 WebP，模型尺寸及每檔 SHA256 見 manifest.json。互動物品 86 件，家具 19 組，完整封閉房間 4 組，共 109 組／436 張實際模型渲染圖。房間是建築整體，門、窗、牆與樑併入房間模型；互動裝置仍另有獨立模型。GLB 供檢視與再加工，網站使用同源 Three.js 幾何與互動程式；不虛稱使用掃描或 AI 自動重建。

前／後／左／右指模型的本地方向；皆有約 31 度俯角，讓平放紙張仍能看見表面。文書精確內容與孔洞以網站可放大近景為準，不以縮圖代替線索。

`references/iron.png` 與 `references/sandbag.png` 為 built-in imagegen 產生的風格參考：焦黑山屋用的舊鑄鐵配重（倒角底座、整體提把、銘牌）、束口麻布沙袋（扁底、綁繩、縫線），各含四方向。它們不是實際模型渲染圖，也不是新的劇情物證。原始生成檔保留於 Codex generated_images，專案交付使用此處副本。

重跑：`node scripts/export_final_models.mjs`；驗證：`python scripts/verify_final_models.py`（需 numpy、Pillow）。layout.json 為實際接觸面與碰撞配置；verification.json 為結構與圖片完整性驗證。GLTF 不包含網站存檔、玩法、互動及 Three.js bumpMap。實體手機效能需另測，不能由模型驗證推定。
