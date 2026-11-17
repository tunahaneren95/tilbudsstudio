/* Ekstra funktioner til Tilbudsstudio. Indlæses efter patch.js. */

/* Intet point-tal på Shop-knappen i menuen */
document.head.insertAdjacentHTML('beforeend','<style>#nav-bal{display:none!important}</style>');

/* Sikkerhed: admin-koden byttes til en midlertidig nøgle efter login */
(function(){
 const hent=lxAdmLoad;
 lxAdmLoad=async function(){await hent();if(LX.adm&&LX.adm.atok&&LX.admin!==LX.adm.atok){LX.admin=LX.adm.atok;try{sessionStorage.setItem('ts.ladm',LX.admin)}catch(e){}}};
 const kald=lapi;
 lapi=function(a,o){o=o||{};
  if(a==='priser')o=Object.assign({token:LX.tok,admin:LX.admin},o);
  if(a==='gempriser'){const r=(o.plan||[]).slice(1);const harRabat=r.some(x=>(+String(x[6]||0).replace(',','.')||0)>0||(+String(x[7]||0).replace(',','.')||0)>0);
   if(!harRabat)return Promise.reject(new Error('Prislisten mangler rabatter. Tryk "Hent fra arket" først, så du ikke overskriver dem med nuller.'))}
  return kald(a,o)};
})();

/* ⚡ Elsalg-hammeren: dit eget billede (hammer.png) i stedet for den tegnede */
document.head.insertAdjacentHTML('beforeend',`<style>
.hm-img{position:absolute;height:auto;transform-origin:62.5% 97.5%;opacity:0;filter:drop-shadow(0 30px 40px rgba(0,0,0,.7)) drop-shadow(0 0 30px rgba(255,59,68,.35));will-change:transform}
.hm-ov.go .hm-img{animation:hmSwing2 2.3s cubic-bezier(.55,0,.25,1) forwards}
@keyframes hmSwing2{0%{opacity:0;transform:translateY(-60%) rotate(40deg) scale(.8)}12%{opacity:1;transform:translateY(-8%) rotate(28deg) scale(1)}28%{transform:translateY(-12%) rotate(38deg) scale(1)}35%{transform:translateY(0) rotate(-88deg) scale(1)}38%{transform:translateY(0) rotate(-78deg) scale(1)}42%{transform:translateY(0) rotate(-84deg) scale(1)}48%{transform:translateY(0) rotate(-81deg) scale(1)}80%{opacity:1;transform:translateY(0) rotate(-81deg) scale(1)}100%{opacity:0;transform:translateY(-70%) rotate(-20deg) scale(1)}}
</style>`);
(function(){
 const img=new Image();
 /* billedet ligger som tekst i hammer.js (GitHub-forbindelsen kan kun lægge tekstfiler op) */
 const sc=document.createElement('script');sc.src='hammer.js?v=1';sc.onload=()=>{if(window.HAMMER_SRC)img.src=window.HAMMER_SRC};sc.onerror=()=>{img.src='hammer.png'};document.head.appendChild(sc);
 const org=lxHammer;
 lxHammer=function(){org();const o=document.querySelector('.hm-ov');if(!o)return;const svg=o.querySelector('svg.hm-tool');
  if(!img.complete||!img.naturalWidth){return}
  const W=Math.min(620,innerWidth*.8),H=W*img.naturalHeight/img.naturalWidth,cx=innerWidth/2,cy=innerHeight*.76;
  const px=cx+.45*W,py=cy-.05*W;
  const h=document.createElement('img');h.className='hm-img';h.src=img.src;h.alt='';
  h.style.cssText=`width:${W}px;left:${px-.625*W}px;top:${py-.975*H}px`;
  if(svg)svg.replaceWith(h);else o.appendChild(h);
 };
})();
