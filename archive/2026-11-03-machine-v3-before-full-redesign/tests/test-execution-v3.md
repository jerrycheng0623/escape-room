> 版本註記（2026-11-05）：本文保留原始來源或歷史交付，不是正式版 v14 的操作規格。現況請以專案根目錄 PLAN.md、verify.md、test.md 與 3D/final-v14/manifest.json 為準；本文舊版本的預覽入口及舊模型不會重新啟用。

### 11.5 機關v3全流程、檔案與發布回歸（2026-11-03）

本輪由單一Codex執行，依使用者「最新機關MD全部接入、重跑測試、公開發布」授權。來源為machine.md設計稿v3；其設計時未實作聲明是歷史快照，第11節替代方案未疊加為第五關。原173案例是歷史完整驗收計畫，不等於本次逐列全部通過；本版以47項M3案例取代舊機關表，並保留每列未測的人工部分。

儲存庫jerrycheng0623/escape-room，原始碼Website-2，發布gh-pages；本輪起點來源Commit b946966cd203ce2ef19aed697f18badaf0b453f7，發布起點c9b06ebe38f3558b3268cae9a18ead32a51c7173。本機目錄不是Git checkout，修改以檔案SHA-256核對，不冒稱本機有分支。sangi-md／agent.md已重新取得相同Git blob 2961ede22ef988b5d625cd79a0ae4f9cc7a00e2e；第二點不作執行依據、不使用子代理。其餘步驟依本節的專案、來源、修改、測試、失敗修正與發布證據核對。

環境：macOS／Node24.22.1／Vite7.3.7／Chromium151.0.7922.34／Playwright WebKit26.5 build2336。Browser plugin未提供，使用現有Playwright；桌機1440×900、觸控844×390，版面另含375×667、390×844、667×375、800×360、768×1024、1024×768。所有測試用獨立profile。WebKit引擎及觸控視窗不代表實體iPhone／iPad Safari實測。

| 檢查／案例 | 本輪實際執行與觀察 | 結果／證據 |
| --- | --- | --- |
| M3-UNIT | 28項單元測試，含256配重子集合、每照8組通道、三區70%及頁寬3%邊界、分階段提示、舊存檔／皇冠／首次結果 | 通過；assets/mechanisms-v3/verification/unit-tests.txt |
| M3-PC-FLOW | 首頁→設定→序幕→實際WASD移動與收錄→四關新操作→可選Bonus略過→結局→後記→completed；未注入通關旗標，電影在此快速流程中略過 | 通過；desktop-flow.json |
| M3-TOUCH-FLOW | 844×390搖桿、視角、實物調查、數字增減、通道、投影、配重、覆頁／UV／扣片；A半途與D分區重載、C超載恢復 | 通過；mobile-flow.json。CDP觸控；物件原生select使用selectOption，非全程實體手指 |
| M3-STAGE-PC | 31項隔離工程斷點：釋放未取物、重載、四向投影、C背景與關面板重新計時、D中段先顯影、錯面、第四步、長按不連發、先開匣後顯影 | 通過；chromium-boundaries.json。機關以鍵盤操作；不計正式新遊戲通關 |
| M3-STAGE-WK | 30項對應WebKit觸控工程斷點，覆頁與UV以真實瀏覽器觸控事件操作，原生選單使用selectOption | 通過；webkit-boundaries.json |
| M3-VIDEO-NATURAL | 七段×四組＝28次，Chromium桌機MP4／手機WebM、WebKit手機MP4／桌機WebM；1倍從0到自然ended返回檔案，不seek／skip／假ended | 通過；chromium-full.json、webkit-full.json；七段合計484.5秒 |
| M3-VIDEO-CONTROLS | 兩引擎合計22項：暫停／續播、暫停定位、字幕中英關閉、聲音、原生控制、轉錄、阻擋自播、MP4故障備援、雙格式故障重試／略過、緩衝停滯 | 通過；chromium-controls.json、webkit-controls.json |
| M3-LAYOUT | 兩引擎×七尺寸，共14組播放器實際可點擊與無遮擋檢查 | 通過；layout.json |
| M3-HTTP | 14檔完整SHA-256／MIME／Range206＋7舊影片URL＋14有效新版外掛字幕 | 通過；http.json。新版CIN-A字幕移除舊數列，影片影像／音軌未修改 |
| M3-END | 真實UI完成快照衍生的結局工程fixture；WebKit手機與Chromium桌機自然播終幕→後記，當晚不提前發身分證物 | 通過；natural-ending.json；與正式新遊戲流程分開記錄 |
| M3-SPACE | 四區四向長按碰撞、六面檢視、安全出生點、隔板遮擋、移櫃；手機搖桿／直向暫停 | 通過；space.json。SwiftShader暖機4秒樣本各區約43–58.5 FPS；不是實體手機效能保證 |
| M3-FILES | JSON可解析、32文書發行路徑、覆頁同正文分層、場內／案件資料分層、規則與引擎、源檔指紋、44既有道具GLB＋4新房間GLB、影片解碼與原音畫封包 | 通過；source-audit.json、scene-verification.json、material-verification.json、stream-verification.json |
| M3-BUILD | prepare-assets與正式Vite建置；3D／遊戲／解答分包，未新增付費或後台服務 | 通過；發布檔以web/dist為來源 |
| M3-PUBLISH | 原入口與mechanisms-v3獨立路徑均已核對；最新模型發布後重跑桌機／觸控正式流程及WebKit30項機關斷點，兩引擎×雙入口四組首頁無錯誤，14份建置檔SHA一致 | 通過；public-build.json、public-entry.json、public-desktop-flow.json、public-mobile-flow.json、public-webkit-boundaries.json |

修正過的失敗保留於fixed-regressions.json：①Game.jsx漏匯入guidanceStage造成3D黑畫面，補匯入後兩正式流程重測；②投影被底框遮住，調整同一投影面的合成順序並核對四向；③吸附距離改以頁寬計算。工程測試最初以過度精確名稱找不到「繼續調查＋章節」按鈕，已修正選擇器；這是測試腳本問題，與遊戲黑畫面分開。

可重跑：pnpm test、pnpm build、test:ui、test:mobile、test:mechanisms（另以EMBERS_BROWSER=webkit）、test:space、test:media、test:media:controls、test:media:layout、test:media:http、test:media:story；完整指令與使用的環境變數沿用11.4節，新的證據目錄為assets/mechanisms-v3/verification。原始截圖與失敗保存在/tmp/embers-mechanisms-v3，已選圖另交付assets/mechanisms-v3/review。


公開發布結果：原入口 https://jerrycheng0623.github.io/escape-room/ 與新入口 https://jerrycheng0623.github.io/escape-room/mechanisms-v3/ 共用桌機／手機版本及同來源存檔。實際機關／模型程式凍結Commit **ed045dddb93e930f895d2f4e4074ed8f8f72f6b0**，含版本戳的來源Commit **4bec8da54d51031115c1533a90ae165218ca6468**，Pages Commit **6ce3e081925e33c72be251a9c5bc2a0decb177e5**；GitHub Pages [workflow 41605696792](https://github.com/jerrycheng0623/escape-room/actions/runs/41605696792)確認success。後續QA文件Commit只補證據，不修改發布程式。兩入口index／JS／CSS／release.json共14檔逐位元組SHA-256相符，release.json對應上述程式來源。

公開站另以WebKit手機MP4及Chromium桌機WebM，把七片各完整自然播一遍，共14次；全部ended並返回檔案，未seek／skip。最新模型修正只改3D配重外觀與支架，播放器程式、影片影像／音軌與字幕檔在這段公開驗收期間保持相同。證據public-webkit-full.json及public-chromium-full.json。正式兩裝置通關及WebKit機關斷點則在最新模型上線後另跑，與影片工程預覽分開。

發布故障也保留：第一次模型補丁的Pages部署回500，重試曾排隊；後續發行含公開版本指紋的新建置已成功。第一輪公開桌機腳本讀camera過早，改為等待canvas及對應room實際ready後重測通過；首頁檢查最初漏算分行標題的空白，已修正選擇器及重測。這些測試腳本失敗不混作遊戲運行錯誤。官方狀態頁未列全站事故，未將單次500推論為GitHub全面故障。

尚未驗證：實體iOS／Android、首次玩家能否獨立辨認刻痕／小樣／總成／覆頁、各關4–12分鐘等目標、趣味與驚喜、30分鐘以上熱降頻、所有歷史案例的逐字人工驗收。這些不標為通過，也不以自動通關速度代替盲測。

