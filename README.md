# 餘燼裡的第六人：網站v9／機關v4

公開網址：https://jerrycheng0623.github.io/escape-room/mechanisms-v4/（桌機、手機、平板共用）。原入口 https://jerrycheng0623.github.io/escape-room/ 同步新版。

原始碼分支Website-2；GitHub Pages產物位於gh-pages。實際發布狀態、Commit與結果以test.md第11.5節及assets/world-v4/verification為準。

四關為分散刪稿與衣架、原片帶、滑輪繩路、病歷穿孔；移除集中解題入口。86個世界物件、空白工作面、可逆陷阱、單一結局與可選Bonus。手機搖桿116/128px、獨立觸控轉向與中斷歸零。存檔schema4保留舊版備份及已完成紀錄。

使用Node.js22.12以上與pnpm，在web/執行：

```sh
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

正式建置會重建web/public/media及web/dist，不將套件／快取／產生副本推入來源分支。檢查腳本見web/package.json；Playwright使用既有執行環境，輸出預設/tmp，可透過EMBERS_QA_DIR指定。

規格依PLAN.md、verify.md及machine.md v4。歷史測試與舊機關不同，不合併宣稱全部通過。尚無實體手機／首次玩家盲測／真人配音／帳號同步／離線支援。進度只儲存於各網址同來源瀏覽器localStorage；新舊同來源路徑共用進度，跨裝置不會自動同步。
