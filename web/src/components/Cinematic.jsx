import Modal from './Modal.jsx';
import {useEffect,useMemo,useRef,useState} from 'react';
import {asset,DOCUMENTS} from '../game/content.js';
import Icon from './Icons.jsx';

export default function Cinematic({segment,settings,setSettings,onComplete,onBack,preview,completionLabel}){
 const video=useRef(),completed=useRef(false),intent=useRef('play'),handled=useRef(new Set()),seekAfterFallback=useRef(0),lastProgress=useRef({time:0,at:0});
 const sources=useMemo(()=>segment.sources?.length?segment.sources:[{src:segment.video,type:'video/mp4'}],[segment]);
 const [sourceIndex,setSourceIndex]=useState(()=>{const probe=document.createElement('video');const i=sources.findIndex(s=>!s.type||probe.canPlayType(s.type));return i<0?0:i;});
 const source=sources[sourceIndex],url=asset(source.src||source.path),en=settings.lang==='en',t=(a,b)=>en?b:a;
 const [transcript,setTranscript]=useState(false),[status,setStatus]=useState('loading'),[ready,setReady]=useState(false),[failure,setFailure]=useState(null),[slow,setSlow]=useState(false),[time,setTime]=useState(0),[duration,setDuration]=useState(segment.duration),[native,setNative]=useState(false);
 const playing=status==='playing'||status==='buffering';
 const positionCaptions=()=>{const el=video.current;if(!el)return;for(const track of el.textTracks)for(const cue of track.cues||[]){cue.snapToLines=false;cue.line=70;}};
 const finish=()=>{if(completed.current)return;completed.current=true;video.current?.pause();onComplete();};
 const mediaFailure=(el)=>{
  if(el!==video.current||handled.current.has(url))return;
  handled.current.add(url);const code=el.error?.code||4;
  if(sourceIndex+1<sources.length){seekAfterFallback.current=Number.isFinite(el.currentTime)?el.currentTime:0;setStatus('loading');setSourceIndex(i=>i+1);return;}
  setStatus('error');setFailure({code,message:t({1:'播放已中斷。',2:'影片資料未能完整下載。',3:'瀏覽器未能解碼影片。',4:'瀏覽器不支援可用格式，或影片來源未能載入。'}[code]||'影片載入失敗。',{1:'Playback was interrupted.',2:'The film could not be downloaded completely.',3:'The browser could not decode this film.',4:'Available formats are unsupported or could not load.'}[code]||'The film could not load.')});
 };
 const play=()=>{
  const el=video.current;if(!el)return;intent.current='play';setSlow(false);lastProgress.current={time:el.currentTime||0,at:performance.now()};
  el.play().catch(error=>{if(el!==video.current||intent.current!=='play')return;if(error.name==='AbortError')return;if(error.name==='NotAllowedError'){setStatus('blocked');return;}if(el.error)mediaFailure(el);else setStatus('paused');});
 };
 const pause=()=>{intent.current='pause';video.current?.pause();setStatus('paused');setSlow(false);};
 const retry=()=>{const el=video.current;handled.current.delete(url);seekAfterFallback.current=time;setFailure(null);setReady(false);setSlow(false);setStatus('loading');el.load();play();};
 useEffect(()=>{
  const el=video.current;el.volume=settings.volume;el.muted=!settings.sound;
  for(const track of el.textTracks)track.mode=settings.subtitles&&track.language===(settings.subtitleLanguage==='auto'?settings.lang:settings.subtitleLanguage)?'showing':'disabled';
 },[settings,ready,url]);
 useEffect(()=>{
  const el=video.current;setReady(false);setFailure(null);setSlow(false);setStatus('loading');lastProgress.current={time:0,at:performance.now()};play();
  const hidden=()=>{if(document.hidden){intent.current='pause';el.pause();setStatus('paused');}};
  const timer=setInterval(()=>{if(document.hidden||intent.current!=='play'||el.ended)return;const point=lastProgress.current;if(Math.abs(el.currentTime-point.time)>.1){lastProgress.current={time:el.currentTime,at:performance.now()};setSlow(false);}else if(performance.now()-point.at>12000&&!el.error)setSlow(true);},1000);
  document.addEventListener('visibilitychange',hidden);
  return()=>{clearInterval(timer);document.removeEventListener('visibilitychange',hidden);el.pause();};
 },[url]);
 const loaded=el=>{setReady(true);if(Number.isFinite(el.duration)&&el.duration>0)setDuration(el.duration);if(seekAfterFallback.current>0){el.currentTime=Math.min(seekAfterFallback.current,Math.max(0,el.duration-.1));seekAfterFallback.current=0;}};
 const openTranscript=()=>{pause();setTranscript(true);};
 return <main className={`cinematic ${native?'native-controls':''}`}>
  <video key={url} ref={video} data-testid="cinematic-video" data-source-format={source.type} playsInline muted={!settings.sound} preload="auto" controls={native} poster={asset(segment.poster)} src={url}
   onLoadedMetadata={e=>loaded(e.currentTarget)} onLoadedData={()=>{setReady(true);positionCaptions();}} onPlaying={()=>{setStatus('playing');setSlow(false);}}
   onPause={()=>{if(!video.current?.error)setStatus('paused');}} onWaiting={()=>{if(intent.current==='play')setStatus('buffering');}}
   onTimeUpdate={e=>setTime(e.currentTarget.currentTime)} onEnded={finish} onError={e=>mediaFailure(e.currentTarget)}>
   {Object.entries(segment.tracks).map(([lang,path])=><track key={lang} kind="subtitles" src={asset(path)} srcLang={lang} label={lang==='en'?'English':'繁體中文'} default={lang===settings.lang} onLoad={positionCaptions}/>)}
  </video>
  <div className="cinema-top"><button className="text-btn" onClick={onBack}><Icon name="back"/>{t('返回','Back')}</button><span>{preview?t('動畫預覽・不改變正式進度','Film preview · no progress changes'):(en?segment.titleEn:segment.title)}</span><button className="text-btn native-toggle" aria-pressed={native} onClick={()=>setNative(v=>!v)}>{native?t('自訂控制','Custom controls'):t('原生控制','Native controls')}</button></div>
  {!playing&&!failure&&<button className="cinema-play" onClick={play} aria-label={t('播放動畫','Play film')}><Icon name="play" size={32}/><span>{status==='blocked'?t('點一下播放故事','Tap to play the story'):ready?t('播放故事','Play story'):t('載入故事，點此播放','Loading story · tap to play')}</span></button>}
  {(status==='buffering'||slow)&&!failure&&<div className="cinema-buffer" role="status"><span>{slow?t('載入較久，進度仍保留。','Loading is taking longer. Your progress is safe.'):t('正在緩衝影片…','Buffering the film…')}</span>{slow&&<button className="text-btn" onClick={retry}>{t('重新載入影片','Reload film')}</button>}</div>}
  {failure&&<section className="cinema-error" role="alert"><h2>{t('影片暫時無法載入','The film could not be loaded')}</h2><p>{failure.message} {t('進度仍保留，重試不會重設調查。','Your investigation progress is safe.')}</p><p className="quiet">{t('播放錯誤碼','Playback error')} {failure.code} · {source.type?.split(';')[0]}</p><div className="cinema-recovery"><button className="primary" onClick={retry}>{t('重試','Retry')}</button><button className="secondary" onClick={openTranscript}>{t('閱讀本幕全文','Read the transcript')}</button><a className="secondary" href={url} target="_blank" rel="noreferrer">{t('在瀏覽器開啟影片','Open film in the browser')}</a><button className="text-btn" onClick={finish}>{completionLabel||(preview?t('結束預覽','Close preview'):t('略過動畫','Skip film'))}</button></div></section>}
  <footer className="cinema-controls"><button className="icon-btn" onClick={()=>playing?pause():play()} aria-label={playing?t('暫停動畫','Pause film'):t('播放動畫','Play film')}><Icon name={playing?'pause':'play'}/></button><span>{Math.floor(time).toString().padStart(2,'0')} / {duration.toFixed(1)}s</span><input className="time-track" type="range" min="0" max={duration} step="0.1" value={Math.min(time,duration)} disabled={!ready||!!failure} aria-label={t('影片進度','Film position')} onChange={e=>{const n=+e.target.value;video.current.currentTime=n;setTime(n);}}/><button className="text-btn transcript-button" onClick={openTranscript}>{t('本幕全文','Transcript')}</button><select className="cinema-caption" aria-label={t('影片字幕','Film subtitles')} value={settings.subtitles?(settings.subtitleLanguage==='auto'?settings.lang:settings.subtitleLanguage):'off'} onChange={e=>setSettings(s=>({...s,subtitles:e.target.value!=='off',subtitleLanguage:e.target.value==='off'?s.subtitleLanguage:e.target.value}))}><option value="zh-Hant">繁中字幕</option><option value="en">English</option><option value="off">{t('關閉字幕','Off')}</option></select><button className="icon-btn" aria-label={settings.sound?t('關閉影片聲音','Mute film'):t('啟用影片聲音','Enable film sound')} onClick={()=>{const el=video.current;el.muted=settings.sound;setSettings(s=>({...s,sound:!s.sound}));if(intent.current==='play')play();}}><Icon name={settings.sound?'sound':'mute'}/></button><input className="cinema-volume" aria-label={t('影片音量','Film volume')} type="range" min="0" max="1" step="0.05" value={settings.volume} onChange={e=>setSettings(s=>({...s,volume:+e.target.value}))}/><button className="text-btn" onClick={finish}>{completionLabel||(preview?t('結束預覽','Close preview'):t('略過動畫','Skip film'))}<Icon name="arrow" size={16}/></button></footer>
  {transcript&&<Modal wide title={t('本幕故事與畫面文字','Story and screen text')} onClose={()=>setTranscript(false)}><div className="film-transcript">{segment.transcript?.map((s,i)=><article key={i}><small>{Math.floor(s.start)}s</small><p>{en?s.en:s.zh}</p>{s.document&&<p className="screen-text">{en?DOCUMENTS[s.document]?.enBody:s.text}</p>}</article>)}</div></Modal>}
 </main>;
}
