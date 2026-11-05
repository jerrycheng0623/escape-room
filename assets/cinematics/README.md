# 分幕影片與畫面素材版 v3

> 2026-11-02。六段262秒；已匯入第二部分補完。正式角色、全文與對白仍等使用者第四部分，不是最後商用定稿。

## 目前採用影片

| 段落 | 秒 | 影片 | 繁中字幕 | 英文字幕 |
| --- | --- | --- | --- | --- |
| 序幕：遲到的邀請 | 40 | [播放](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/video/CIN-00-materials-v3.mp4>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/zh-Hant/CIN-00-draft.vtt>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/en/CIN-00-draft.vtt>) |
| 客房：灰燼裡的謊言 | 40 | [播放](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/video/CIN-A-materials-v3.mp4>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/zh-Hant/CIN-A-draft.vtt>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/en/CIN-A-draft.vtt>) |
| 暗房：不在照片裡的人 | 32 | [播放](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/video/CIN-B-materials-v3.mp4>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/zh-Hant/CIN-B-draft.vtt>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/en/CIN-B-draft.vtt>) |
| 營火：善意與異常重量 | 45 | [播放](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/video/CIN-C-materials-v3.mp4>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/zh-Hant/CIN-C-draft.vtt>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/en/CIN-C-draft.vtt>) |
| 診療區：另一種飢餓 | 63 | [播放](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/video/CIN-D-materials-v3.mp4>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/zh-Hant/CIN-D-draft.vtt>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/en/CIN-D-draft.vtt>) |
| 終幕：深淵的凝視 | 42 | [播放](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/video/CIN-END-materials-v3.mp4>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/zh-Hant/CIN-END-draft.vtt>) | [WebVTT](</Users/chengchebing/Desktop/密室逃脫大/assets/cinematics/subtitles/en/CIN-END-draft.vtt>) |

## 完成內容

- 1280×720、24 FPS、H.264／AAC，六段分別40／40／32／45／63／42秒。字幕可關閉及切換，附外部WebVTT。
- 已新增／修訂10個生成素材：停錶、18:30第一照、20:00最後照、項鍊、固定底座、三杯空瓶、倒櫃、門框痕跡、無人冷灰終幕底板及透明偵探。
- 第一照四人、第二照三人；鐘面18:30／20:00已逐張檢視。角色仍沿用既有暫用設計，正式資料到齊再統一。
- 正式探索用D4時間卡；D1火場遺體畫面為序幕現場紀錄。終幕改用沒有餘火的冷灰底板。
- END-02使用真RGBA偵探層與背景分離，圖層位移演出不是骨架跑步或逐格動畫。
- 原創程序合成氣氛、心跳、吞嚥及電子音已混音；非真人配音／吞嚥錄音。另有audio/sfx/八個獨立WAV供之後整合。

## 原始資產與重建

- manifest.json為目前採用路徑，storyboard-draft.json為逐鏡暫擬敘事，不替代使用者正式對白。
- prompts.json含目前影像索引；new-generation-records.json與new-layer-generation.json保存本輪內建image_gen提示及來源路徑。
- 生成圖片已複製到專案。角色透明層：CIN-END/layers/END-ACTOR-v1.png；無人底板：同目錄END-PLATE-v1.png。
- 部分鏡頭重用同一底板，asset.aliasOf有標記；不能用鏡頭數當新生成圖片數。
- scripts/render_cinematics.py重建目前六段，scripts/verify_cinematics.py做媒體技術檢查。專案Python環境含NumPy，FFmpeg位於既有codex-video-tools依賴。
- 先前v1／v2影片保留歷史用途，不作目前網站匯入路徑。原生成紀錄及舊素材保留，不改寫為本輪新生成。

## 未完成的最終層級

正式角色／對白、全文文書、配音、精確機關提示及最終美術統一須等第三／四部分。未開始網站，未驗證瀏覽器或手機播放。證據邏輯為製作者本輪補完的虛構設定，未做現實鑑識／物理模擬。
