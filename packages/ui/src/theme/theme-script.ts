export const THEME_INIT_SCRIPT = `(function(){try{
var d=document.documentElement;
var raw=localStorage.getItem("hogoshi:theme");
var p=raw?JSON.parse(raw):{};
var mode=p.mode||"system";
var resolved=mode==="system"?(window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"):mode;
d.setAttribute("data-mode",resolved);
d.setAttribute("data-font-size",String(p.fontSize??4));
d.setAttribute("data-radius",String(p.radius??8));
if(p.density==="compact")d.setAttribute("data-density","compact");
if(p.motion&&p.motion!=="full")d.setAttribute("data-motion",p.motion);
d.style.colorScheme=resolved;
}catch(e){}})();`;
