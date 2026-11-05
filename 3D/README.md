# 模型交付：v14 正式版；以下 v9 為歷史來源

> 2026-11-05 正式版 v14｜網站 1.0.0｜機關 v4／存檔 schema 4／影片 v10。正式發布分支為 `Websit-final`；桌機與手機共用 `https://jerrycheng0623.github.io/escape-room/final/`。Q 切換保留，取消置中的「繼續探索」遮擋框；僅保留底部不遮畫面的手動替代控制。製作預覽／跨關跳過入口已移除；未解鎖章節與影片不能提前開啟，通關後可回訪、獨立重玩及回看。模型與四方向圖見 `3D/final-v14/manifest.json`；本輪實測以 `assets/final-v14/verification/` 及 test.md 為準，舊測試紀錄僅代表其標示版本。


歷史 v9 原生模型來源：web/src/game/roomModelsV4.js；當時四區檢視匯出：scene/enclosed-A-v9.glb、B-v9、C-v9、D-v9，見enclosed-v9-export.json及assets/world-v4/scene-verification.json。86件世界物件含可觀察生活物品、六鉤、驗片匣、雙股繩路、透明襯頁與雙層匣；互動狀態和碰撞由網站程式處理。檢視GLB使用縮小圖面，精確孔路與全文應在網站近景放大查看。

以下舊道具／場景交付保留來源歷史，不等於新版機關規則。

# 3D素材交付：v8機關版封閉房間與既有道具來源

> 2026-11-03｜現行網站：v8原生封閉3D場景／碰撞。四個房間GLB可獨立檢視；原42類參考、44道具GLB及舊灰盒保留來源用途。仍非掃描級寫實資產。

## 查閱入口

- 現行四區：[A客房](scene/enclosed-A-v8.glb)、[B暗房](scene/enclosed-B-v8.glb)、[C營火與儲藏區](scene/enclosed-C-v8.glb)、[D診療區](scene/enclosed-D-v8.glb)
- [v8布局與碰撞尺寸](scene/enclosed-v8-layout.json)、[模型匯出統計](scene/enclosed-v8-export.json)
- 原生模型：../web/src/game/roomModels.js；碰撞與遮擋：../web/src/game/space.mjs。GLB不包含互動、動態文字與Three.js bumpMap。

下列為保留的舊資產來源：

- [42類模型預覽](<previews/all-42-models-v1.png>)
- [模型清單](<model-manifest.json>)
- [場景灰盒](<scene/rooms-layout-blockout-v1.glb>)
- [場景配置](<scene/scene-layout.json>)
- [平面配置圖](<scene/floor-plan.svg>)
- [倒塌剖面圖](<scene/collapse-section.svg>)

## 物件清單

尺寸欄位沿用X寬／Y深／Z高命名；GLB內使用標準Y向上座標，公尺。建模器已轉換，不能把JSON的Z高誤讀為GLB軸。

| ID | 物件 | 外觀參考 | GLB初模 |
| --- | --- | --- | --- |
| P001 | 三位數調查箱 | [查看](<references/P001/P001-six-views-v1.png>) | [模型](<models/P001-blockout-v1.glb>) |
| P002 | 底片相機 | [查看](<references/P002/P002-six-views-v1.png>) | [模型](<models/P002-blockout-v1.glb>) |
| P003 | RGB玻璃片組 | [查看](<references/P003/P003-six-views-v1.png>) | [模型](<models/P003-blockout-v1.glb>) |
| P004 | 重型烤肉架 | [查看](<references/P004/P004-six-views-v1.png>) | [模型](<models/P004-blockout-v1.glb>) |
| P005 | 電子重量感測器 | [查看](<references/P005/P005-six-views-v1.png>) | [模型](<models/P005-blockout-v1.glb>) |
| P006 | 紫外線探照燈 | [查看](<references/P006/P006-six-views-v1.png>) | [模型](<models/P006-blockout-v1.glb>) |
| P007 | 醫療公事包 | [查看](<references/P007/P007-six-views-v1.png>) | [模型](<models/P007-blockout-v1.glb>) |
| P008 | 門栓鑰匙 | [查看](<references/P008/P008-six-views-v1.png>) | [模型](<models/P008-blockout-v1.glb>) |
| P009 | 燒毀單人床 | [查看](<references/P009/P009-six-views-v1.png>) | [模型](<models/P009-blockout-v1.glb>) |
| P010 | 半毀背包 | [查看](<references/P010/P010-six-views-v1.png>) | [模型](<models/P010-blockout-v1.glb>) |
| P011 | 灰綠外套 | [查看](<references/P011/P011-six-views-v1.png>) | [模型](<models/P011-blockout-v1.glb>) |
| P012 | 暗房水槽 | [查看](<references/P012/P012-six-views-v1.png>) | [模型](<models/P012-blockout-v1.glb>) |
| P013 | 暗房安全燈 | [查看](<references/P013/P013-six-views-v1.png>) | [模型](<models/P013-blockout-v1.glb>) |
| P014 | 底片沖洗盤 | [查看](<references/P014/P014-six-views-v1.png>) | [模型](<models/P014-blockout-v1.glb>) |
| P015 | 底片吊掛組 | [查看](<references/P015/P015-six-views-v1.png>) | [模型](<models/P015-blockout-v1.glb>) |
| P016 | 診療木椅 | [查看](<references/P016/P016-six-views-v1.png>) | [模型](<models/P016-blockout-v1.glb>) |
| P017 | 調查工作桌 | [查看](<references/P017/P017-six-views-v1.png>) | [模型](<models/P017-blockout-v1.glb>) |
| P018 | 空藥瓶 | [查看](<references/P018/P018-six-views-v1.png>) | [模型](<models/P018-blockout-v1.glb>) |
| P019 | 維修配電箱 | [查看](<references/P019/P019-six-views-v1.png>) | [模型](<models/P019-blockout-v1.glb>) |
| P020 | 反鎖鐵門組 | [查看](<references/P020/P020-six-views-v1.png>) | [模型](<models/P020-blockout-v1.glb>) |
| P021 | 維修出口門組 | [查看](<references/P021/P021-six-views-v1.png>) | [模型](<models/P021-blockout-v1.glb>) |
| P022 | 空心焦黑枯樹 | [查看](<references/P022/P022-six-views-v1.png>) | [模型](<models/P022-blockout-v1.glb>) |
| P023 | 手電筒 | [查看](<references/P023/P023-six-views-v1.png>) | [模型](<models/P023-blockout-v1.glb>) |
| P024 | 偵探手機 | [查看](<references/P024/P024-six-views-v1.png>) | [模型](<models/P024-blockout-v1.glb>) |
| P025 | 調查筆記本 | [查看](<references/P025/P025-six-views-v1.png>) | [模型](<models/P025-blockout-v1.glb>) |
| P026 | 日記本 | [查看](<references/P026/P026-six-views-v1.png>) | [模型](<models/P026-blockout-v1.glb>) |
| P027 | 紙張與照片底材 | [查看](<references/P027/P027-six-views-v1.png>) | [模型](<models/P027-blockout-v1.glb>) |
| P028 | 食材包裝袋 | [查看](<references/P028/P028-six-views-v1.png>) | [模型](<models/P028-blockout-v1.glb>) |
| P029 | 營柱 | [查看](<references/P029/P029-six-views-v2.png>) | [模型](<models/P029-blockout-v1.glb>) |
| P030 | 焦木梁 | [查看](<references/P030/P030-six-views-v2.png>) | [模型](<models/P030-blockout-v1.glb>) |
| P031 | 石塊 | [查看](<references/P031/P031-six-views-v1.png>) | [模型](<models/P031-blockout-v1.glb>) |
| P032 | 熄滅營火盆 | [查看](<references/P032/P032-six-views-v1.png>) | [模型](<models/P032-blockout-v1.glb>) |
| P033 | 警方封鎖線支架 | [查看](<references/P033/P033-six-views-v1.png>) | [模型](<models/P033-blockout-v1.glb>) |
| P034 | 燒焦森林樹木 | [查看](<references/P034/P034-six-views-v1.png>) | [模型](<models/P034-blockout-v1.glb>) |
| P035 | 廢墟牆窗模組 | [查看](<references/P035/P035-six-views-v1.png>) | [模型](<models/P035-blockout-v1.glb>) |
| P036 | 煙囪模組 | [查看](<references/P036/P036-six-views-v1.png>) | [模型](<models/P036-blockout-v1.glb>) |
| P037 | 破裂手錶 | [查看](<references/P037/P037-six-views-v1.png>) | [模型](<models/P037-blockout-v1.glb>) |
| P038 | 特殊鈦項鍊 | [查看](<references/P038/P038-six-views-v1.png>) | [模型](<models/P038-blockout-v1.glb>) |
| P039 | 電子鐘 | [查看](<references/P039/P039-six-views-v1.png>) | [模型](<models/P039-blockout-v1.glb>) |
| P040 | 三只紅酒杯 | [查看](<references/P040/P040-six-views-v1.png>) | [模型](<models/P040-blockout-v1.glb>) |
| P041 | 容器殘骸 | [查看](<references/P041/P041-six-views-v1.png>) | [模型](<models/P041-blockout-v1.glb>) |
| P042 | 倒塌鐵櫃 | [查看](<references/P042/P042-six-views-v1.png>) | [模型](<models/P042-blockout-v1.glb>) |

## 完成界線

生成六角度表仍有透視與細節差異，不是測量圖。全部42類另有以GLB幾何渲染的六視圖，位於previews/，用於核對幾何而非替代較寫實參考。
GLB包含真正網格、法線、基本PBR材質與可分部件；只是程序化外形／尺寸初模，沒有宣稱完成雕刻、寫實貼圖、正式UV／LOD、骨架、機關內部、碰撞或引擎整合。
櫃體遮擋／移開為兩個靜態狀態檔，不是已實作的物理或互動。場景中的碰撞資料是規劃JSON，尚未在引擎執行。
模型與場景可由scripts/build_material_models.py、scripts/build_scene_materials.py重建，檢查用scripts/verify_materials.py。verification.json為前輪參考圖檢查紀錄，最新總檢查見專案material-verification.json。
第三／四部分到齊後再細化機關結構、正式角色、物件字面與美術；本輪網站主架構已接入現有初模，正式寫實精修與實機驗收仍待後續。
