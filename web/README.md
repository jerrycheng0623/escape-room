# 《餘燼裡的第六人》網站 v9（機關v4）

> v17 現行更新：第三關採逐段實物圖卡、剛好 40 kg 自動升蓋及取物完成；C 現場資料改可選。桌機空白鍵開關背包；中英七頁指南與全部示範均可操作。2D 配樂替換為貝多芬〈月光奏鳴曲〉第一樂章，保留原音效並提高音量；雨雷維持 v16。存檔 schema 4、既有已開蓋進度、其他關卡謎底與圖片保留。 素材、來源與測試索引見 [v17交付](../assets/release-v17/README.md)。

> 2026-11-05 正式版 v14｜網站 1.0.0｜機關 v4／存檔 schema 4／影片 v10。正式發布分支為 `Websit-final`；桌機與手機共用 `https://jerrycheng0623.github.io/escape-room/final/`。Q 切換保留，取消置中的「繼續探索」遮擋框；僅保留底部不遮畫面的手動替代控制。製作預覽／跨關跳過入口已移除；未解鎖章節與影片不能提前開啟，通關後可回訪、獨立重玩及回看。模型與四方向圖見 `3D/final-v14/manifest.json`；本輪實測以 `assets/final-v14/verification/` 及 test.md 為準，舊測試紀錄僅代表其標示版本。


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

桌機先按Q或按鈕選探索方式，WASD移動，原生鎖定後滑鼠環顧或明確選方向鍵環顧（Esc暫停）、E／左鍵查看；手機橫向搖桿移動、拖曳環顧。機關依房內物件分開觀察、拿取、翻面與操作；證物整理頁依場所分類、翻頁、放大及個人筆記，所有操作可用鍵盤及觸控。I/J背包、H指引、Esc暫停。

新手／標準／困難為3／5／7階段資訊量，內容只指觀察地點與關聯，不列解法或下一步操作；地點回看另記，不跳機關。沒有死亡、倒數失敗與第二結局。首次通關快照保留；後續推理可補皇冠。

主存檔localStorage鍵embers.investigation.v1（內容schema 4），備份加.backup。獨立重玩鍵embers.replay.v4；通關後回訪／影片回看不改首次紀錄。刷新後按繼續可恢復pendingFilm或章節。舊schema1／2／3保留原始備份；舊已通關以完成來源保留，未完成機關重新開始。

故事：assets/story/content-v5.json；純判定：src/game/engine.mjs；存檔：storage.mjs；場景：Scene.jsx；主機關：Puzzles.jsx；提示與證物：Game.jsx；電影：Cinematic.jsx。3D已重製封閉房間、實體道具及膠囊碰撞／遮擋，目前各區由導航轉換，不代表整棟寫實精修與無縫走廊已完成。無真人配音、帳號同步或完整離線。GitHub Pages 發布設定與網址見根目錄 README.md。

## 可核對驗收

本輪機關v3測試與環境見根目錄test.md第11.5節。Browser plugin未提供，使用既有Playwright／Chromium，另有SwiftShader軟體繪圖條件；觸控視窗模擬不代表實體手機效能。影片完整解碼與字幕報告：assets/story-v5/verification/media-report.json。不要將173項測試規格全部當成已執行通過。

本輪3D來源：src/game/roomModels.js；碰撞與視線：space.mjs；指引：guidance.mjs。材質與生成紀錄：assets/scene-v6/。四個可獨立檢視GLB：3D/scene/enclosed-{A,B,C,D}-v6.glb。GLB不含互動、動態文字與Three.js bumpMap；網站以原生場景為準。

最終公開站驗收與真機未測範圍見 [test.md](../test.md) 及 [證據索引](../assets/final-v14/verification/acceptance/summary.json)。

回歸：pnpm test（最新數量見test.md）；pnpm test:ui（真實操作的正式通關）；pnpm test:settings（語言切換、三種指引、求助與重載）；pnpm test:media:http（先準備資產或建置，再核對已部署影片及字幕完整位元組）；pnpm test:space（工程fixture逐區碰撞／六面檢視／手機模擬，不能算親解通關）。Playwright用既有執行環境，可用PLAYWRIGHT_MODULE指定。所有測試用獨立profile，EMBERS_QA_DIR指定外部證據資料夾。

網站0.12.0：證物整理頁按A/B/C/D分類，自動收納已收集資料，左右翻頁、放大與分區筆記。啟程先看七頁互動操作指南。桌機Q切換游標與探索視角，原生鎖定後滑鼠環顧，或選方向鍵探索；操作頁固定鏡頭，關閉後按Q恢復，Esc暫停。全螢幕依瀏覽器API可用性顯示結果。行李鎖支援逐字／刪改／部分碼保存及觸控數字輪。test:notebook、test:luggage提供操作回歸；影片仍為v10且未修改。

操作指南與模式規格見專案根目錄 `操作指南與探索模式規格.md`。`test:guide`測試教學與操作分離；原生游標鎖定須另以實際取得鎖定的瀏覽器驗證。

v13：示範鎖支援逐字輸入、全形數字、輸入法組字、清空及44px數字輪。Q不影響打字或操作頁，Esc仍暫停；`test:q-input`與`test:native`記錄回歸。
