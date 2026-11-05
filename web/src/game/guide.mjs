export const GUIDE_PAGES=[
 {id:'welcome',title:'走進灰燼之前',tag:'入場叮嚀',body:'這是第一人稱的虛構密室調查。火災、死亡與食人題材以恐怖插畫和聲音呈現；你可以關閉聲音、減少動態或隨時暫停。',notes:['沒有死亡、倒數失敗或生命值。試錯不會讓整場遊戲報廢。','固定家具與牆面不能強拆或穿越；依物件提供的操作調查。裝飾不一定能拿走。','主機關不能跳過；故事影片可暫停、略過，並從檔案重看。']},
 {id:'controls',title:'探索與操作，各有自己的時間',tag:'視角與螢幕',body:'探索時控制鏡頭；閱讀與操作時使用游標。兩種狀態不會同時生效。',notes:['空白鍵可開關背包，選擇「拿在手上」後回到目標使用。打字時與指南練習中不會觸發正式背包。','電腦：按 Q 切換游標與探索視角。成功鎖定游標後用滑鼠環顧、WASD移動。準星對準物品，按E或點左鍵查看。','Esc釋放游標並暫停。開啟任何操作頁會固定鏡頭；關閉後按Q即可恢復探索，Q只在3D探索畫面生效，操作頁及打字時不切換。','若瀏覽器無法鎖定游標，可明確選擇「使用方向鍵探索」；方向鍵環顧，游標移動不帶動鏡頭；Q切換時保留你選的探索方式。','手機：橫向持握，左搖桿移動、右側空白處拖曳環顧，點「查看」調查。閱讀時可上下捲動，探索輸入會停止。','全螢幕只改變顯示範圍，與游標鎖定分開；不支援時仍可使用一般模式。']},
 {id:'objects',title:'先看清楚，再決定是否拿起',tag:'查看與翻面',body:'靠近物品，將準星對準它。出現「查看」時才能開啟近看頁；近看中的動作按鈕才是可嘗試的操作。',notes:['紙張與物件可能正反兩面有不同資料，也可依提供的按鈕旋轉。','「拿起」將可攜物放進背包；固定設備保留在場景。不能拿走不代表沒有用途。','只有觀察過，不等於收集過；已取得的資料才會出現在證物整理頁。']},
 {id:'mechanism',title:'改變裝置後，還要檢查它的回應',tag:'機關與密碼鎖',body:'部分裝置需要提、壓、拉、轉等動作。聽到聲音或看到鬆動後，仍可能要打開蓋板或拉動把手，最後取出物品。',notes:['密碼鎖可以逐字輸入、刪改、貼上，或用＋／−調整數字輪；填完不會自動拉開櫃門。','示範鎖可打字、輸入全形數字或點＋／−數字輪，接受任意四位數，僅說明操作；正式鎖仍要依現場線索找答案。','配重、繩路、紙張與影像裝置依各自圖示操作，不能一律當密碼鎖。','動作沒有反應時，核對位置、手持物、方向與先後；需要時依物件提供的復位動作重試。']},
 {id:'tools',title:'背包裡有工具，還需要選到手上',tag:'取物與使用',body:'電腦按空白鍵開背包，手機直接點背包；再點「拿在手上」，再查看要使用的目標，依它提供的「放置手持物」或其他動作操作。',notes:['畫面會顯示目前手持哪件物品；拿了另一件物品後，原工具可能已不在手上。','不要把整理頁當成機關操作台。閱讀、翻頁與放大不會改動實物；需要操作時回到物品近看頁。','放到吊籃、片帶或索引台的物件仍只有一份；可依裝置規則取回或退件。']},
 {id:'evidence',title:'讀到內容，和收進案件，是兩件事',tag:'證據與個人筆記',body:'在物品近看頁按「收錄這份證物」，才能把正式記錄加進證據簿。拿起的紙張與已收錄的證據會自動加入分區整理頁。',notes:['整理頁左上按A／B／C／D場所分類；左右滑動、按箭頭或選單切換，每次看一件完整資料。','可以放大圖面、閱讀可選取的文字；每個場所的個人筆記分開保存。','機關解開後還不能繼續時，檢查是否真的取出了物品、收錄了現場資料。讀過不會自動幫你收錄。']},
 {id:'guidance',title:'卡住時，先整理觀察',tag:'指引、存檔與離場',body:'右上「指引」提供觀察方向，並可查看尚能調查的區域。新手、標準、困難改變資訊程度，不改謎底。',notes:['指引可重讀；求助與指引次數會記錄，但不影響可選Bonus皇冠。','進度自動存於目前瀏覽器；不同裝置或瀏覽器不會自動同步。儲存失敗時會顯示提醒。','暫停選單可重看本指南、調整靈敏度與亮度，或返回主選單。重新開始會另行確認是否覆寫舊進度。','本指南的物品、數字與小動畫只作操作示範，不是正式線索。']}
];

export const GUIDE_PAGES_EN=[
  {
    "id": "welcome",
    "tag": "Before you enter",
    "title": "Before entering the ashes",
    "body": "A fictional first-person escape-room investigation. Horror illustrations and sound depict fire, death and cannibalism. You can mute sound, reduce motion or pause at any time.",
    "notes": [
      "There is no death, health bar or countdown failure. Trying an incorrect action does not ruin your game.",
      "You cannot dismantle fixed furniture or walk through walls. Use the actions available on an object; decorations may not be portable.",
      "Main mechanisms cannot be skipped. Story films can be paused, skipped and replayed from the archive."
    ]
  },
  {
    "id": "controls",
    "tag": "View and screen",
    "title": "Explore with the camera, interact with the cursor",
    "body": "Looking around and using interface controls are separate modes. The camera stays still while you read or operate a mechanism.",
    "notes": [
      "Desktop: Q switches between cursor and exploration. With pointer lock, use the mouse to look and WASD to move. Aim at an object and press E or left-click to examine it.",
      "Space opens or closes your backpack. Choose an item to hold, then return to the target object. Typing and guide demonstrations do not trigger the game shortcut.",
      "Esc releases the pointer and pauses. Opening an interface releases the camera; press Q to resume exploration after closing it.",
      "If pointer lock is unavailable, choose keyboard exploration. Arrow keys turn the camera; moving the cursor does not. Q remembers your chosen exploration mode.",
      "Mobile: hold the device in landscape. Move with the left joystick, drag an empty area on the right to look, and tap Examine. Q and Space are not required.",
      "Fullscreen and pointer lock are independent. If fullscreen is unsupported, you can continue in the regular view."
    ]
  },
  {
    "id": "objects",
    "tag": "Inspect and turn",
    "title": "Look closely before picking something up",
    "body": "Approach an object and aim the reticle at it. When Examine appears, open its close-up. The close-up action buttons show the interactions you can try.",
    "notes": [
      "The front and back may contain different information. Use the rotation controls where available.",
      "Pick up puts a portable object in your backpack. Fixed equipment stays in the room; an object can be useful without being portable.",
      "Seeing something is not the same as collecting it. The notebook only lists material you have acquired."
    ]
  },
  {
    "id": "mechanism",
    "tag": "Devices and locks",
    "title": "After an action, check the device's response",
    "body": "Some devices require lifting, pressing, pulling or turning. A sound or movement may mean you still need to open a cover or pull a handle, then collect what is inside.",
    "notes": [
      "Type, delete or paste a lock code, or use the + and − wheels. Entering digits does not automatically pull a door open.",
      "The practice lock accepts any four digits, including full-width digits. It teaches the controls; the real lock needs the room's clues.",
      "Weights, ropes, sheets and film devices have their own diagrams and actions. They are not all combination locks.",
      "If nothing happens, check the target, held item, orientation and sequence. Use the device's reset action when necessary."
    ]
  },
  {
    "id": "tools",
    "tag": "Backpack and tools",
    "title": "Having a tool is not the same as holding it",
    "body": "Press Space on desktop or tap Backpack on mobile. Choose Hold in hand, then examine the target and use Place held item or another available action.",
    "notes": [
      "Check the held-item indicator. Picking up another item may replace the tool in your hand.",
      "The notebook is for reading, paging and zooming. To manipulate an object, return to its close-up.",
      "Objects placed in baskets, film strips or the index board are still unique physical items. Retrieve them according to the device's rules."
    ]
  },
  {
    "id": "evidence",
    "tag": "Evidence and notes",
    "title": "Read the material, then record it in the case",
    "body": "Use Record this evidence in an object's close-up to add it to the evidence log. Collected papers and recorded evidence automatically appear in the room-based notebook.",
    "notes": [
      "Use the A/B/C/D tabs, swipe or press arrows to browse one complete item at a time.",
      "Zoom the image or read selectable text. Each room has its own saved personal notes.",
      "If the next chapter is unavailable after solving a mechanism, check that you collected the reward and recorded the scene evidence. Reading alone does not record it."
    ]
  },
  {
    "id": "guidance",
    "tag": "Hints, saves and leaving",
    "title": "When stuck, revisit what you have observed",
    "body": "Guidance suggests places and relationships to investigate. Guided, Balanced and Subtle change the amount of information, not the puzzle answers.",
    "notes": [
      "Reread hints as often as you like. Hint and help counts are recorded, but do not affect the optional bonus crown.",
      "Progress is saved in this browser. It does not automatically sync across browsers or devices. A warning appears if saving fails.",
      "Pause to revisit this guide, adjust sensitivity or brightness, or return to the main menu. Starting again asks before replacing your progress.",
      "The practice objects, numbers and animations in this guide are examples, not clues to the real puzzles."
    ]
  }
];
export const GUIDE_TRANSLATIONS={
  "獨立操作示範，不改變正式進度": "Independent practice; does not change your game",
  "觀察 · 記錄 · 推理": "Observe · Record · Deduce",
  "這裡沒有倒數，留時間給每一個細節。": "No countdown. Take time to notice the details.",
  "示範：探索中，游標隱藏": "Practice: exploring, cursor hidden",
  "示範：操作中，鏡頭固定": "Practice: cursor active, camera still",
  "示範按 Q 切換": "Practice Q switching",
  "在本頁按 Q 也能切換示範；不會真的鎖住游標。Esc 在正式遊戲中仍可暫停。": "Press Q here to switch the example without locking your pointer. In the game, Esc pauses.",
  "示範紙張 ·": "Practice paper ·",
  "背面": "Back",
  "正面": "Front",
  "邊緣的印記，也值得查看。": "Check the marks along the edges, too.",
  "一張留下摺痕的紙。": "A sheet of paper with folded edges.",
  "翻面看看": "Turn it over",
  "已加入示範背包": "Added to practice backpack",
  "示範拿起": "Practice picking up",
  "可攜物已收起；正式物品要依現場動作調查。": "The portable item is packed. Investigate real items using their available actions.",
  "觀察後，再決定要做的動作。": "Observe, then decide what to try.",
  "示範號碼": "Practice code",
  "指南示範號碼": "Guide practice code",
  "任意四位數": "Any four digits",
  "指南示範數字輪": "Guide practice number wheels",
  "清空示範號碼": "Clear practice code",
  "示範檢查號碼": "Check practice code",
  "示範拉開把手": "Pull practice handle",
  "抽屜打開了，接著才是取物。": "The drawer is open. Now you can collect what is inside.",
  "鎖舌已鬆，抽屜還需要拉開。": "The latch is released. You still need to pull the drawer open.",
  "輸入四位數後，先檢查，再拉把手。": "Enter four digits, check the code, then pull the handle.",
  "示範工具在手上": "Practice tool held",
  "從示範背包拿在手上": "Hold the practice tool",
  "在示範目標使用": "Use on practice target",
  "工具與目標產生了回應。": "The target has responded to the tool.",
  "手持工具後，查看目標提供的動作。": "With the tool held, check the target's actions.",
  "背包裡有工具，不代表目前正拿著它。": "A tool in your backpack is not necessarily in your hand.",
  "區": "room",
  "區 · 示範資料": "room · Practice document",
  "這份資料已收錄，可重新閱讀。": "This document is recorded and can be read again.",
  "讀完後，還可以把它收進案件。": "After reading, record the document in the case.",
  "示範：已收錄": "Practice: recorded",
  "示範收錄這份證物": "Practice recording evidence",
  "各區資料與個人筆記分開整理。": "Room documents and personal notes are organized separately.",
  "示範操作不會替你取得任何正式證據。": "Practice does not collect any real case evidence.",
  "先找觀察方向，再自己推理。": "Find a direction to explore, then reason it out.",
  "試看一則示範指引": "Try a practice hint",
  "「這件物品的背面，是否留下了不同的資訊？」": "“Does the back of this object contain different information?”",
  "沒有倒數催促你，隨時可以停下來整理。": "There is no countdown. Pause and review whenever you need.",
  "返回": "Back",
  "返回設定": "Back to setup",
  "調查入門 ·": "Investigation guide ·",
  "操作指南章節": "Guide chapters",
  "上一頁": "Previous",
  "示範與正式機關分開，不會洩漏謎底。": "Practice is separate from the case and reveals no puzzle solutions.",
  "閱讀完畢，返回": "Finish and return",
  "準備好了，進入故事": "Ready, enter the story",
  "下一頁 →": "Next →",
  "示範按空白鍵開背包": "Practice Space: backpack",
  "示範背包已開啟": "Practice backpack open",
  "示範背包已關閉": "Practice backpack closed",
  "空白鍵可開關背包；輸入文字時不觸發。手機直接點背包。": "Space toggles your backpack except while typing. On mobile, tap Backpack.",
  "指南第1位加一": "Guide digit 1 increase",
  "指南第1位減一": "Guide digit 1 decrease",
  "指南第1位": "Guide digit 1",
  "指南第2位加一": "Guide digit 2 increase",
  "指南第2位減一": "Guide digit 2 decrease",
  "指南第2位": "Guide digit 2",
  "指南第3位加一": "Guide digit 3 increase",
  "指南第3位減一": "Guide digit 3 decrease",
  "指南第3位": "Guide digit 3",
  "指南第4位加一": "Guide digit 4 increase",
  "指南第4位減一": "Guide digit 4 decrease",
  "指南第4位": "Guide digit 4"
};
