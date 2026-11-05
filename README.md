# 餘燼裡的第六人：正式版 v17

> v17 現行更新：第三關採逐段實物圖卡、剛好 40 kg 自動升蓋及取物完成；C 現場資料改可選。桌機空白鍵開關背包；中英七頁指南與全部示範均可操作。2D 配樂替換為貝多芬〈月光奏鳴曲〉第一樂章，保留原音效並提高音量；雨雷維持 v16。存檔 schema 4、既有已開蓋進度、其他關卡謎底與圖片保留。

> 最終公開驗收：v14 吊籃修正版已上線。同一個網址通過桌機及手機模擬四關通關；先前受測試環境阻擋的公開站原生滑鼠鎖定已補測通過。實體 iPhone／iPad／Android 未測。完整範圍與限制見 [test.md](test.md) 與 [驗收證據](assets/final-v14/verification/acceptance/summary.json)。

單人第一人稱密室逃脫：四個封閉 3D 場景、分散式機關、七段 2D 故事影片、單一結局與可選皇冠推理。繁體中文為主要交付語言。

公開網址：[正式版／桌機、手機與平板共用](https://jerrycheng0623.github.io/escape-room/final/)。原入口 https://jerrycheng0623.github.io/escape-room/ 同步此版；mechanisms-v3／mechanisms-v4 路徑保留歷史版本。

來源分支：[Websit-final](https://github.com/jerrycheng0623/escape-room/tree/Websit-final)；GitHub Pages 產物位於 gh-pages。網站 1.1.0／介面 v17／聲景 v17／介面與模型 v14／機關 v4／存檔 schema4／影片聲軌 v12、畫面與字幕 v10。

桌機 Q 切換游標／探索視角，成功取得原生滑鼠鎖定後可連續轉向；Esc 釋放並暫停。開操作頁時固定鏡頭；關閉後按 Q 恢復。取消中央「繼續探索」框，底部保留不遮場景的按鈕替代。手機橫向使用左搖桿與右側拖曳；中斷、取消及離開視窗均清除輸入。全螢幕依瀏覽器能力提供，iOS 不支援時保留正常橫向操作。

正式版沒有製作預覽或跨關跳過入口。未完成關卡不能提前進入後段章節／影片；通關後可自由回訪、獨立重玩、回看動畫及閱讀完整解答。首次通關、提示及求助紀錄保留。A/B/C/D 證物整理頁支援翻頁、放大與自行筆記。

3D 使用同一套 Three.js 幾何產生遊戲物件、GLB 與四方向圖：86 件互動物品、19 組家具及四個完整房間，共 109 組模型／436 張實際渲染圖。沙袋、鐵塊、木樁、石塊外觀分開製作；停錶、日記、衣物、手套、杯具、工具與裝置均有對應造型。支撐面、層架開口、落地紙張與碰撞配置同步。詳見 [3D/final-v14](3D/final-v14/README.md)、manifest.json、layout.json、visibility.json、verification.json。AI 沙袋／鐵塊參考圖與模型實際渲染分開標明。

使用 Node.js 22.12 以上及 pnpm，在 web/ 執行：

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

匯出模型：`node scripts/export_final_models.mjs`；驗證模型：`python scripts/verify_final_models.py`（numpy、Pillow）；驗證實際視線：`node scripts/verify_final_visibility.mjs`；支撐面／可達性：web/ 的 `pnpm test:layout`。其餘瀏覽器測試命令見 web/package.json，證據可用 EMBERS_QA_DIR 指定。

規格以 PLAN.md、verify.md、machine.md、操作指南與探索模式規格.md 為準。test.md 與 assets/final-v14/verification 記錄本輪實測、版本、失敗修正與限制；不把歷史測試當成本輪結果。來源／歷史 Markdown 的適用性與 SHA256 見 assets/final-v14/markdown-registry.json。

尚未進行實體 iPhone／iPad、多機型 GPU 效能及首次玩家盲測；WebKit 與觸控模擬不等於實體 iOS 驗收。無真人配音、帳號同步或離線支援；完整英文機關文書仍需本地化。進度只存在同來源瀏覽器 localStorage，新舊同來源路徑共用，跨裝置不會自動同步。

2026-11-05 雨雷調音：雨聲訊號提升約 5.1 dB；遠雷由每 48 秒 3 次改為 7 次，間隔約 6.5～8.5 秒。以 v16 音檔避開舊快取，保留既有音量開關、暫停及手機操作；影片配樂不變。
