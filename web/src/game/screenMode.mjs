export const fullscreenElement=()=>document.fullscreenElement||document.webkitFullscreenElement||null;
export const supportsFullscreen=()=>Boolean(document.documentElement.requestFullscreen||document.documentElement.webkitRequestFullscreen);
export async function enterFullscreen(){const root=document.documentElement,request=root.requestFullscreen||root.webkitRequestFullscreen;if(!request)throw Error('此瀏覽器不支援頁面全螢幕；仍可橫向遊玩。');await request.call(root);}
export async function exitFullscreen(){const exit=document.exitFullscreen||document.webkitExitFullscreen;if(fullscreenElement()&&exit)await exit.call(document);}
