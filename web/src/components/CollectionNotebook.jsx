import {useRef,useState} from 'react';
import {WORLD} from '../game/world.mjs';
import {DOCUMENTS,ROOMS,ORDER,asset} from '../game/content.js';
import {collectedEntries} from '../game/collection.mjs';
export default function CollectionNotebook({run,onAction,onInspect,initialItem,readOnly=false}){
 const entries=collectedEntries(run,WORLD,DOCUMENTS),first=initialItem?entries.find(e=>e.objectId===initialItem):null;
 const [room,setRoom]=useState(first?.room||run.room),[selection,setSelection]=useState(first?.key||null),[back,setBack]=useState(false),[zoom,setZoom]=useState(1);
 const swipe=useRef(null),art=useRef(null),items=entries.filter(e=>e.room===room),index=Math.max(0,items.findIndex(e=>e.key===selection)),entry=items[index],item=entry?.objectId?WORLD[entry.objectId]:null,doc=entry?.evidenceId?DOCUMENTS[entry.evidenceId]:null;
 const title=doc?.name||(item?item.name+(item.page?' · '+item.page:item.kind==='film'?' · '+item.roll+'/'+item.frame:''):'尚未收集資料');
 const select=key=>{setSelection(key);setBack(false);setZoom(1);if(art.current){art.current.scrollLeft=0;art.current.scrollTop=0;}};
 const changeRoom=r=>{setRoom(r);select(null);};
 const turn=delta=>{const next=index+delta;if(items[next])select(items[next].key);};
 const down=e=>{if(zoom>1||e.target.closest('button,input,textarea,select,a'))return;swipe.current={id:e.pointerId,x:e.clientX,y:e.clientY};};
 const up=e=>{const start=swipe.current;swipe.current=null;if(!start||start.id!==e.pointerId||window.getSelection()?.toString())return;const dx=e.clientX-start.x,dy=e.clientY-start.y;if(Math.abs(dx)>=55&&Math.abs(dx)>Math.abs(dy)*1.5)turn(dx<0?1:-1);};
 const img=doc?asset(doc.art||`media/evidence/${doc.id}.webp`):item?asset(`media/world-v4/${item.id}.svg`):null;
 const front=doc?.body||item?.body||'',body=back?(item?.back||'背面沒有其他文字。'):front;
 const annotationId=Object.keys(WORLD).find(id=>WORLD[id].room===run.room);
 return <section className="collection-notebook" aria-label="分區證物整理頁">
  <nav className="collection-tabs" aria-label="按收集場所分類">{ORDER.map(r=><button key={r} type="button" className={r===room?'selected':''} aria-pressed={r===room} onClick={()=>changeRoom(r)}><strong>{r} 區</strong><span>{entries.filter(e=>e.room===r).length} 件</span></button>)}</nav>
  <p className="quiet collection-source">{room} 區 · {ROOMS[room].name} · 只顯示已收集物件與已收錄證據</p>
  {entry?<>
   <div className="collection-pager"><button className="secondary" aria-label="上一件證物" disabled={index===0} onClick={()=>turn(-1)}>← 上一件</button><span aria-live="polite">{index+1} / {items.length}</span><button className="secondary" aria-label="下一件證物" disabled={index===items.length-1} onClick={()=>turn(1)}>下一件 →</button></div>
   <article className="collection-page" onPointerDown={down} onPointerUp={up} onPointerCancel={()=>{swipe.current=null;}} onKeyDown={e=>{if(e.target!==e.currentTarget)return;if(['ArrowLeft','ArrowRight'].includes(e.key)){e.preventDefault();turn(e.key==='ArrowLeft'?-1:1);}}} tabIndex={0} aria-label="證物閱讀頁，左右方向鍵翻頁">
    <header><small>{item?item.zone:doc.source} · {back?'背面':'正面'}</small><h3>{title}</h3></header>
    <div className="collection-reader"><div className="collection-art" ref={art} data-zoom={zoom}>{img&&<img src={img} alt={title+'的完整圖面'} draggable={false} style={{width:`${zoom*100}%`}}/>}</div><div className="collection-transcript"><h4>{back?'背面文字':'可讀文字'}</h4><p>{body}</p>{doc?.status&&<small>紀錄狀態：{doc.status}</small>}</div></div>
   </article>
   <div className="collection-tools"><button className="secondary" onClick={()=>setZoom(z=>z===1?1.6:z===1.6?2.2:1)}>{zoom===1?'放大圖面':zoom===1.6?'再放大':'恢復全圖'}</button>{item?.back&&<button className="secondary" onClick={()=>setBack(v=>!v)}>{back?'閱讀正面':'閱讀背面'}</button>}{item&&item.room===run.room&&<button className="secondary" onClick={()=>onInspect(item.id)}>查看／操作這件物品</button>}</div>
   <label className="collection-jump">快速選擇本區資料<select aria-label="選擇已收集資料" value={entry.key} onChange={e=>select(e.target.value)}>{items.map(e=><option key={e.key} value={e.key}>{e.evidenceId?DOCUMENTS[e.evidenceId].name:WORLD[e.objectId].name+(WORLD[e.objectId].page?' · '+WORLD[e.objectId].page:WORLD[e.objectId].kind==='film'?' · '+WORLD[e.objectId].roll+'/'+WORLD[e.objectId].frame:'')}</option>)}</select></label>
   <p className="quiet">左右滑動、按箭頭或聚焦閱讀頁後使用方向鍵翻頁。放大時可捲動看細節；閱讀不會移動實物或改變機關。</p>
  </>:<div className="collection-empty"><h3>這一區還沒有收集資料</h3><p>找到物品後「拿起」，或將文書「收錄這份證物」，便會自動出現在這裡。</p></div>}
  <label className="collection-notes">{room} 區個人筆記<textarea aria-label={`${room}區個人筆記`} maxLength={6000} readOnly={readOnly} value={run.annotations[room]} onChange={e=>onAction(annotationId,'annotate',{room,text:e.target.value})} placeholder="記下自己的觀察、疑點或推理。每區分開保存。"/></label><small className="quiet">{readOnly?'回訪僅閱讀；原筆記保持不變。':'筆記隨調查進度自動儲存。'}</small>
 </section>;
}
