# 餘燼裡的第六人：網站 v6

此分支收錄目前網站原始碼、故事文件、2D 圖片與影片、音效、3D 模型及製作紀錄。正式設計與驗收依據為 PLAN.md、verify.md、test.md。

公開網站：https://jerrycheng0623.github.io/escape-room/

原始碼分支：Website-2。GitHub Pages 發布分支：gh-pages（只存正式建置產物）。原始碼更新後需重新執行測試、建置與發布，並非推送任何檔案都會自動部署。

## 本機執行

使用 Node.js 22.12 以上版本及 pnpm：

```sh
cd web
pnpm install --frozen-lockfile
pnpm test
pnpm build
pnpm dev
```

建置會依來源素材重建 web/public/media/、media.json，再產生 web/dist/。套件、快取、系統檔與這些產生副本不納入原始碼分支；實際用於公開網站的產物另發布至 gh-pages。

網站操作與現有範圍見 web/README.md；素材與模型見 素材交付.md、3D/README.md。通關進度儲存在各瀏覽器的 localStorage，本機網址與 GitHub Pages 的存檔互不共用。

現行四章機關可完整通關；PLAN.md 的進階機關提案尚未替換現行玩法。沒有真人配音、帳號同步或完整離線功能；實體手機的效能驗收仍待執行。歷史來源、舊版報告與本輪實測紀錄需依日期和版本區分，不能視為全部測試已通過。
