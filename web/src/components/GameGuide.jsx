import { useEffect, useRef, useState } from 'react';
import { GUIDE_PAGES, GUIDE_PAGES_EN, GUIDE_TRANSLATIONS } from '../game/guide.mjs';
function Demonstration({
  type,
  g
}) {
  const [bag, setBag] = useState(false),
    [opened, setOpened] = useState(false),
    [back, setBack] = useState(false),
    [held, setHeld] = useState(false),
    [recorded, setRecorded] = useState(false),
    [code, setCode] = useState(''),
    [released, setReleased] = useState(false),
    [tab, setTab] = useState('A');
  const composing = useRef(false),
    normalize = value => value.normalize('NFKC').replace(/[^0-9]/g, '').slice(0, 4);
  const changeCode = value => {
    setCode(value);
    setReleased(false);
    setOpened(false);
  };
  const wheel = (index, delta) => {
    const digits = normalize(code).padEnd(4, '0').split('');
    digits[index] = String((Number(digits[index]) + delta + 10) % 10);
    changeCode(digits.join(''));
  };
  useEffect(() => {
    if (type !== 'controls') return;
    const key = e => {
      if (e.code !== 'KeyQ' || e.repeat || e.isComposing || e.ctrlKey || e.altKey || e.metaKey || e.target.closest?.('input,select,textarea,[contenteditable=true]')) return;
      e.preventDefault();
      setOpened(value => !value);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [type]);
  useEffect(() => {
    if (type !== 'tools') return;
    const key = e => {
      if (e.code !== 'Space' || e.repeat || e.isComposing || e.ctrlKey || e.metaKey || e.altKey || e.target.closest?.('input,select,textarea,[contenteditable=true]')) return;
      e.preventDefault();
      setBag(v => !v);
    };
    window.addEventListener('keydown', key);
    return () => window.removeEventListener('keydown', key);
  }, [type]);
  return <div className={`guide-demo guide-demo-${type}`} aria-label={g("獨立操作示範，不改變正式進度")}>
  {type === 'welcome' && <><div className="guide-sigil" aria-hidden="true">◇</div><p>{g("\u89C0\u5BDF \xB7 \u8A18\u9304 \xB7 \u63A8\u7406")}</p><span className="guide-demo-caption">{g("\u9019\u88E1\u6C92\u6709\u5012\u6578\uFF0C\u7559\u6642\u9593\u7D66\u6BCF\u4E00\u500B\u7D30\u7BC0\u3002")}</span></>}
  {type === 'controls' && <><div className={'guide-control-illustration ' + (opened ? 'demo-exploring' : '')} aria-hidden="true"><span className="demo-reticle">＋</span><span className="demo-cursor">↖</span><span className="demo-door" /></div><strong role="status">{opened ? g('示範：探索中，游標隱藏') : g('示範：操作中，鏡頭固定')}</strong><button className="secondary" onClick={() => setOpened(v => !v)}>{g("\u793A\u7BC4\u6309 Q \u5207\u63DB")}</button><small>{g("\u5728\u672C\u9801\u6309 Q \u4E5F\u80FD\u5207\u63DB\u793A\u7BC4\uFF1B\u4E0D\u6703\u771F\u7684\u9396\u4F4F\u6E38\u6A19\u3002Esc \u5728\u6B63\u5F0F\u904A\u6232\u4E2D\u4ECD\u53EF\u66AB\u505C\u3002")}</small></>}
  {type === 'objects' && <><div className={'demo-paper ' + (back ? 'demo-back' : '')}><small>{g("\u793A\u7BC4\u7D19\u5F35 \xB7")}{back ? g('背面') : g('正面')}</small><p>{back ? g('邊緣的印記，也值得查看。') : g('一張留下摺痕的紙。')}</p><span aria-hidden="true">{back ? '⌑' : '≋'}</span></div><div className="guide-demo-actions"><button className="secondary" onClick={() => setBack(v => !v)}>{g("\u7FFB\u9762\u770B\u770B")}</button><button className="secondary" onClick={() => setHeld(true)}>{held ? g('已加入示範背包') : g('示範拿起')}</button></div><p role="status">{held ? g('可攜物已收起；正式物品要依現場動作調查。') : g('觀察後，再決定要做的動作。')}</p></>}
  {type === 'mechanism' && <><div className={'demo-drawer ' + (opened ? 'demo-open' : '')} aria-hidden="true"><div className="demo-drawer-front"><span>—</span></div><div className="demo-drawer-content">◇</div></div><label>{g("\u793A\u7BC4\u865F\u78BC")}<input aria-label={g("指南示範號碼")} value={code} inputMode="numeric" autoComplete="off" autoCapitalize="none" spellCheck={false} placeholder={g("任意四位數")} onCompositionStart={() => {
          composing.current = true;
        }} onCompositionEnd={e => {
          composing.current = false;
          changeCode(normalize(e.currentTarget.value));
        }} onChange={e => changeCode(composing.current || e.nativeEvent.isComposing ? e.target.value : normalize(e.target.value))} onKeyDown={e => e.stopPropagation()} /></label><div className="guide-code-wheels" role="group" aria-label={g("指南示範數字輪")}>{[0, 1, 2, 3].map(i => <div key={i}><button type="button" aria-label={g(`指南第${i + 1}位加一`)} onClick={() => wheel(i, 1)}>＋</button><output aria-label={g(`指南第${i + 1}位`)}>{normalize(code).padEnd(4, '0')[i]}</output><button type="button" aria-label={g(`指南第${i + 1}位減一`)} onClick={() => wheel(i, -1)}>−</button></div>)}</div><button className="text-btn" onClick={() => changeCode('')}>{g("\u6E05\u7A7A\u793A\u7BC4\u865F\u78BC")}</button><div className="guide-demo-actions"><button className="secondary" disabled={composing.current || !/^\d{4}$/.test(code)} onClick={() => setReleased(true)}>{g("\u793A\u7BC4\u6AA2\u67E5\u865F\u78BC")}</button><button className="secondary" disabled={!released} onClick={() => setOpened(true)}>{g("\u793A\u7BC4\u62C9\u958B\u628A\u624B")}</button></div><p role="status">{opened ? g('抽屜打開了，接著才是取物。') : released ? g('鎖舌已鬆，抽屜還需要拉開。') : g('輸入四位數後，先檢查，再拉把手。')}</p></>}
  {type === 'tools' && <><button className="secondary" onClick={() => setBag(v => !v)}>{g("\u793A\u7BC4\u6309\u7A7A\u767D\u9375\u958B\u80CC\u5305")}</button><p role="status">{bag ? g('示範背包已開啟') : g('示範背包已關閉')}</p><small>{g("\u7A7A\u767D\u9375\u53EF\u958B\u95DC\u80CC\u5305\uFF1B\u8F38\u5165\u6587\u5B57\u6642\u4E0D\u89F8\u767C\u3002\u624B\u6A5F\u76F4\u63A5\u9EDE\u80CC\u5305\u3002")}</small><div className={'demo-tool-scene ' + (opened ? 'demo-tool-used' : '')} aria-hidden="true"><span className="demo-tool">╱</span><span className="demo-slot">▱</span></div><div className="guide-demo-actions"><button className="secondary" onClick={() => setHeld(true)}>{held ? g('示範工具在手上') : g('從示範背包拿在手上')}</button><button className="secondary" disabled={!held} onClick={() => setOpened(true)}>{g("\u5728\u793A\u7BC4\u76EE\u6A19\u4F7F\u7528")}</button></div><p role="status">{opened ? g('工具與目標產生了回應。') : held ? g('手持工具後，查看目標提供的動作。') : g('背包裡有工具，不代表目前正拿著它。')}</p></>}
  {type === 'evidence' && <><div className="demo-room-tabs">{['A', 'B', 'C', 'D'].map(r => <button key={r} className={tab === r ? 'selected' : ''} aria-pressed={tab === r} onClick={() => setTab(r)}>{r}{' '}{g("\u5340")}</button>)}</div><div className="demo-paper"><small>{tab}{g("\u5340 \xB7 \u793A\u7BC4\u8CC7\u6599")}</small><p>{recorded ? g('這份資料已收錄，可重新閱讀。') : g('讀完後，還可以把它收進案件。')}</p></div><button className="secondary" onClick={() => setRecorded(true)}>{recorded ? g('示範：已收錄') : g('示範收錄這份證物')}</button><p role="status">{recorded ? g('各區資料與個人筆記分開整理。') : g('示範操作不會替你取得任何正式證據。')}</p></>}
  {type === 'guidance' && <><div className="guide-sigil" aria-hidden="true">⌕</div><strong>{g("\u5148\u627E\u89C0\u5BDF\u65B9\u5411\uFF0C\u518D\u81EA\u5DF1\u63A8\u7406\u3002")}</strong><button className="secondary" onClick={() => setOpened(true)}>{g("\u8A66\u770B\u4E00\u5247\u793A\u7BC4\u6307\u5F15")}</button><p role="status">{opened ? g('「這件物品的背面，是否留下了不同的資訊？」') : g('沒有倒數催促你，隨時可以停下來整理。')}</p></>}
 </div>;
}
export default function GameGuide({
  onBack,
  onComplete,
  review = false,
  compact = false,
  lang = 'zh-Hant'
}) {
  const g = key => lang === 'en' ? GUIDE_TRANSLATIONS[key] ?? key : key,
    pages = lang === 'en' ? GUIDE_PAGES_EN : GUIDE_PAGES;
  const [page, setPage] = useState(0),
    item = pages[page],
    last = page === pages.length - 1;
  const heading = useRef();
  useEffect(() => {
    if (page > 0) {
      heading.current?.focus({
        preventScroll: true
      });
      heading.current?.scrollIntoView({
        block: 'start',
        behavior: 'instant'
      });
    }
  }, [page]);
  const change = n => {
    setPage(n);
  };
  return <main className={`game-guide ${compact ? 'compact-guide' : 'screen-background'}`} data-testid="game-guide">
  <header className="guide-top"><button className="text-btn" onClick={onBack}>← {review ? g('返回') : g('返回設定')}</button><span>{g("\u8ABF\u67E5\u5165\u9580 \xB7")}{String(page + 1).padStart(2, '0')} / {pages.length}</span></header>
  <div className="guide-layout"><nav className="guide-nav" aria-label={g("操作指南章節")}>{pages.map((p, i) => <button key={p.id} className={i === page ? 'selected' : ''} aria-current={i === page ? 'step' : undefined} onClick={() => change(i)}><span>{String(i + 1).padStart(2, '0')}</span>{p.tag}</button>)}</nav><section className="guide-chapter" aria-labelledby="guide-title"><small className="eyebrow">{item.tag}</small><h1 id="guide-title" ref={heading} tabIndex={-1}>{item.title}</h1><p className="guide-lead">{item.body}</p><div className="guide-content"><Demonstration key={item.id} type={item.id} g={g} /><ul className="guide-rules">{item.notes.map(note => <li key={note}>{note}</li>)}</ul></div><footer className="guide-bottom"><button className="secondary" disabled={page === 0} onClick={() => change(page - 1)}>{g("\u4E0A\u4E00\u9801")}</button><span>{g("\u793A\u7BC4\u8207\u6B63\u5F0F\u6A5F\u95DC\u5206\u958B\uFF0C\u4E0D\u6703\u6D29\u6F0F\u8B0E\u5E95\u3002")}</span>{last ? <button className="primary" onClick={onComplete}>{review ? g('閱讀完畢，返回') : g('準備好了，進入故事')}</button> : <button className="primary" onClick={() => change(page + 1)}>{g("\u4E0B\u4E00\u9801 \u2192")}</button>}</footer></section></div>
 </main>;
}
