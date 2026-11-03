# 《餘燼裡的第六人》網站 v6

本機入口：http://127.0.0.1:5173/ 。已實作四章正式機關、七段故事影片、26份中英文書、五位新版角色、提示／求助、可選皇冠推理與通關回訪。

## 啟動與建置

雙擊「啟動網站.command」；或Node.js 22.12以上、pnpm執行：

```sh
pnpm install
pnpm dev
pnpm test
pnpm build
```

本機已安裝依賴，鎖檔為準。build會先執行prepare-assets.mjs，由assets/story-v5重建public/media與media.json，再輸出dist。不要直接修改媒體副本。影片按需載入，3D與通關解答獨立分包；完整解答僅在正式完成後呈現，靜態網站不提供防原始碼檢視的保密能力。

## 操作與資料

桌機WASD／方向鍵移動、拖曳環顧、E查看；手機橫向搖桿移動、拖曳環顧。機關支援可讀面板；RGB滑桿、配重按鈕、UV掃描均有相應操作，UV另支援鍵盤。I/J證據、H指引、Esc暫停。

新手／標準／困難為3／5／7階段資訊量，內容只指觀察地點與關聯，不列解法或下一步操作；地點回看另記，不跳機關。沒有死亡、倒數失敗與第二結局。首次通關快照保留；後續推理可補皇冠。

主存檔localStorage鍵embers.investigation.v1（內容schema 2），備份加.backup。獨立重玩鍵embers.replay.v2；場景／影片預覽不改正式紀錄。刷新後按繼續可恢復pendingFilm或章節。舊schema 1進度遷移後，C停錶需重新調查。

故事：assets/story/content-v5.json；純判定：src/game/engine.mjs；存檔：storage.mjs；場景：Scene.jsx；主機關：Puzzles.jsx；提示與證物：Game.jsx；電影：Cinematic.jsx。3D已重製封閉房間、實體道具及膠囊碰撞／遮擋，目前各區由導航轉換，不代表整棟寫實精修與無縫走廊已完成。無真人配音、帳號同步或完整離線。GitHub Pages 發布設定與網址見根目錄 README.md。

## 可核對驗收

本輪測試與環境見根目錄test.md第11節。Browser plugin未提供，使用既有Playwright／Chromium，另有SwiftShader軟體繪圖條件；觸控視窗模擬不代表實體手機效能。影片完整解碼與字幕報告：assets/story-v5/verification/media-report.json。不要將173項測試規格全部當成已執行通過。

本輪3D來源：src/game/roomModels.js；碰撞與視線：space.mjs；指引：guidance.mjs。材質與生成紀錄：assets/scene-v6/。四個可獨立檢視GLB：3D/scene/enclosed-{A,B,C,D}-v6.glb。GLB不含互動、動態文字與Three.js bumpMap；網站以原生場景為準。

回歸：pnpm test（21項）；pnpm test:ui（真實操作的正式通關）；pnpm test:space（工程fixture逐區碰撞／六面檢視／手機模擬，不能算親解通關）。Playwright用既有執行環境，可用PLAYWRIGHT_MODULE指定。所有測試用獨立profile，EMBERS_QA_DIR指定外部證據資料夾。
