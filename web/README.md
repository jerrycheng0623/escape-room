# 《餘燼裡的第六人》網站 v9（機關v4）

本機入口：http://127.0.0.1:5173/ 。已實作四章正式機關、七段故事影片、32份文書、五位新版角色、提示／求助、可選皇冠推理與通關回訪。

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

桌機先明確選探索方式，WASD移動，原生鎖定後滑鼠環顧或明確選方向鍵環顧（Esc暫停）、E／左鍵查看；手機橫向搖桿移動、拖曳環顧。機關依房內物件分開觀察、拿取、翻面與操作；證物整理頁依場所分類、翻頁、放大及個人筆記，所有操作可用鍵盤及觸控。I/J背包、H指引、Esc暫停。

新手／標準／困難為3／5／7階段資訊量，內容只指觀察地點與關聯，不列解法或下一步操作；地點回看另記，不跳機關。沒有死亡、倒數失敗與第二結局。首次通關快照保留；後續推理可補皇冠。

主存檔localStorage鍵embers.investigation.v1（內容schema 4），備份加.backup。獨立重玩鍵embers.replay.v4；場景／影片預覽不改正式紀錄。刷新後按繼續可恢復pendingFilm或章節。舊schema1／2／3保留原始備份；舊已通關以完成來源保留，未完成機關重新開始。

故事：assets/story/content-v5.json；純判定：src/game/engine.mjs；存檔：storage.mjs；場景：Scene.jsx；主機關：Puzzles.jsx；提示與證物：Game.jsx；電影：Cinematic.jsx。3D已重製封閉房間、實體道具及膠囊碰撞／遮擋，目前各區由導航轉換，不代表整棟寫實精修與無縫走廊已完成。無真人配音、帳號同步或完整離線。GitHub Pages 發布設定與網址見根目錄 README.md。

## 可核對驗收

本輪機關v3測試與環境見根目錄test.md第11.5節。Browser plugin未提供，使用既有Playwright／Chromium，另有SwiftShader軟體繪圖條件；觸控視窗模擬不代表實體手機效能。影片完整解碼與字幕報告：assets/story-v5/verification/media-report.json。不要將173項測試規格全部當成已執行通過。

本輪3D來源：src/game/roomModels.js；碰撞與視線：space.mjs；指引：guidance.mjs。材質與生成紀錄：assets/scene-v6/。四個可獨立檢視GLB：3D/scene/enclosed-{A,B,C,D}-v6.glb。GLB不含互動、動態文字與Three.js bumpMap；網站以原生場景為準。

回歸：pnpm test（最新數量見test.md）；pnpm test:ui（真實操作的正式通關）；pnpm test:space（工程fixture逐區碰撞／六面檢視／手機模擬，不能算親解通關）。Playwright用既有執行環境，可用PLAYWRIGHT_MODULE指定。所有測試用獨立profile，EMBERS_QA_DIR指定外部證據資料夾。

網站0.11.0：證物整理頁按A/B/C/D分類，自動收納已收集資料，左右翻頁、放大與分區筆記。啟程先看七頁互動操作指南。桌機明確啟用游標鎖定才滑鼠環顧，或選方向鍵探索；操作頁固定鏡頭，關閉後需重新選探索，Esc暫停。全螢幕依瀏覽器API可用性顯示結果。行李鎖支援逐字／刪改／部分碼保存及觸控數字輪。test:notebook、test:luggage提供操作回歸；影片仍為v10且未修改。

操作指南與模式規格見專案根目錄 `操作指南與探索模式規格.md`。`test:guide`測試教學與操作分離；原生游標鎖定須另以實際取得鎖定的瀏覽器驗證。
