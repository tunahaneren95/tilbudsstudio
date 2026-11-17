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

/* Hammeren uden lag: ingen filtre på hele siden, færre gnister, kun GPU-venlige animationer */
document.head.insertAdjacentHTML('beforeend',`<style>
body.hm-shock{animation:none!important}
body.hm-shock .stage{animation:hmShake2 .7s cubic-bezier(.36,.07,.19,.97)!important;will-change:transform}
@keyframes hmShake2{0%{transform:translate3d(0,0,0)}8%{transform:translate3d(-22px,16px,0) rotate(-1deg)}16%{transform:translate3d(20px,-14px,0) rotate(.9deg)}24%{transform:translate3d(-16px,-10px,0) rotate(-.6deg)}32%{transform:translate3d(14px,10px,0)}45%{transform:translate3d(-8px,5px,0)}60%{transform:translate3d(5px,-3px,0)}80%{transform:translate3d(-2px,1px,0)}100%{transform:translate3d(0,0,0)}}
.hm-ov .hm-bolts polyline{filter:none!important;stroke:#FFF3B0;stroke-width:3.5}
.hm-ov .hm-rings i{box-shadow:none!important;border-width:5px;will-change:transform,opacity}
.hm-ov .hm-word{will-change:transform,opacity;text-shadow:0 0 24px #FF3B44,4px 4px 0 #ED0812,-3px -3px 0 #FFD24A!important}
.hm-ov .hm-img{filter:drop-shadow(0 24px 30px rgba(0,0,0,.6))!important}
.hm-ov .hm-flash{will-change:opacity}
.hm-zap{position:absolute;inset:0;background:#fff;mix-blend-mode:normal;opacity:0;will-change:opacity}
.hm-ov.hit .hm-zap{animation:hmZap2 .5s steps(1)}
@keyframes hmZap2{0%{opacity:.55;background:#fff}12%{opacity:0}24%{opacity:.35;background:#FF3B44}36%{opacity:0}100%{opacity:0}}
</style>`);
(function(){
 const forrige=lxHammer;
 lxHammer=function(){
  const b=burst;burst=(x,y,n)=>b(x,y,Math.round(n*.35));
  forrige();
  setTimeout(()=>{burst=b},1600);
  const o=document.querySelector('.hm-ov');if(o&&!o.querySelector('.hm-zap')){const z=document.createElement('div');z.className='hm-zap';o.prepend(z)}
 };
})();

/* 📅 Kalender */
document.head.appendChild(Object.assign(document.createElement('script'),{src:'kalender.js?v='+Math.floor(Date.now()/6e4)}));

/* Ingen "Klar til Outlook"-banner når man kopierer */
document.head.insertAdjacentHTML('beforeend','<style>#banner{display:none!important}</style>');

/* Touchpoint Bruger (49 kr.) i omstillingssektionen */
(function(){
 const NY={id:'tp-bruger',cat:'tp',name:'Touchpoint Bruger',list:49,trin:[{binding:0,camp:0,max:0,ny:0,forl:0}]};
 if(!DEFAULT_PLANS.some(p=>p.id==='tp-bruger')){const i=DEFAULT_PLANS.findIndex(p=>p.id==='tp-menu');DEFAULT_PLANS.splice(i<0?DEFAULT_PLANS.length:i+1,0,JSON.parse(JSON.stringify(NY)))}
 const harDen=l=>l.some(p=>/touchpoint bruger/i.test(p.name));
 function sikr(){if(harDen(plans))return false;let i=plans.findIndex(p=>/touchpoint menu/i.test(p.name));if(i<0)i=plans.map(p=>p.cat).lastIndexOf('tp');plans.splice(i<0?plans.length:i+1,0,JSON.parse(JSON.stringify(NY)));return true}
 /* findes den ikke i Google-arket endnu, lægges den ind, indtil admin trykker "Gem for alle" */
 function medBruger(P){
  if(!P||!P.plan||P.plan.length<2)return P;
  if(P.plan.some(r=>/touchpoint bruger/i.test(r.join(' '))))return P;
  const h=P.plan[0].map(String),ix=re=>h.findIndex(c=>re.test(c)),row=h.map(()=>'');
  const at=P.plan.findIndex(r=>/touchpoint menu/i.test(r.join(' ')));
  const set=(re,v)=>{const i=ix(re);if(i>=0)row[i]=v};
  set(/kategori/i,at>0?P.plan[at][ix(/kategori/i)]:'Omstilling');set(/abonnement/i,'Touchpoint Bruger');set(/liste/i,'49');set(/binding/i,'0');set(/udløb/i,'Nej');
  const plan=P.plan.slice();plan.splice(at>0?at+1:plan.length,0,row);return Object.assign({},P,{plan});
 }
 const ap=lxApplyPrices;lxApplyPrices=function(P){return ap(medBruger(P))};
 if(sikr())try{render()}catch(e){}
})();

/* 💰 Valutaen hedder Berries (One Piece) */
(function(){
 const R=[[/Luffy[ -]?points?/gi,'Berries'],[/\b1 point\b/g,'1 Berry'],[/\bpointene\b/gi,'Berries'],[/\bPoint\b/g,'Berries'],[/\bpoint\b/g,'Berries'],[/\bLP\b/g,'฿']];
 const TEST=/Luffy[ -]?points?|\bpoint(ene)?\b|\bLP\b/i,SKIP=/^(SCRIPT|STYLE|TEXTAREA|INPUT|CODE)$/;
 const fix=n=>{const v=n.nodeValue;if(!v||!TEST.test(v))return;const p=n.parentNode;if(!p||SKIP.test(p.nodeName))return;let x=v;R.forEach(([a,b])=>{x=x.replace(a,b)});if(x!==v)n.nodeValue=x};
 const walk=root=>{if(root.nodeType===3)return fix(root);if(root.nodeType!==1||SKIP.test(root.nodeName))return;const w=document.createTreeWalker(root,NodeFilter.SHOW_TEXT);let n;while((n=w.nextNode()))fix(n)};
 walk(document.body);
 new MutationObserver(ms=>{for(const m of ms){if(m.type==='characterData')fix(m.target);else m.addedNodes.forEach(walk)}}).observe(document.body,{subtree:true,childList:true,characterData:true});
 document.title=document.title.replace(/Luffy[ -]?points?/gi,'Berries');
})();

/* ⚽ SIUUU når en lukket ordre bliver sendt ind */
document.head.insertAdjacentHTML('beforeend',`<style>
.si-ov{position:fixed;inset:0;z-index:96;pointer-events:none;overflow:hidden;display:grid;place-items:center}
.si-bg{position:absolute;inset:0;background:radial-gradient(60% 50% at 50% 70%,rgba(237,8,18,.45),rgba(8,2,3,.8) 70%);opacity:0;animation:siBg 3.8s ease forwards}
@keyframes siBg{0%{opacity:0}10%{opacity:1}80%{opacity:1}100%{opacity:0}}
.si-fig{position:absolute;left:50%;bottom:12vh;width:min(260px,42vw);margin-left:calc(min(260px,42vw)/-2);transform-origin:50% 100%;will-change:transform;animation:siJump 3.8s cubic-bezier(.3,.7,.3,1) forwards}
.si-fig svg{display:block;width:100%;height:auto;overflow:visible}
@keyframes siJump{0%{transform:translateY(120%) scaleX(1)}12%{transform:translateY(0) scale(1,1)}17%{transform:translateY(4%) scale(1.08,.88)}30%{transform:translateY(-42%) scaleX(1)}36%{transform:translateY(-50%) scaleX(-1)}42%{transform:translateY(-44%) scaleX(1)}50%{transform:translateY(0) scale(1.14,.82)}56%{transform:translateY(0) scale(.97,1.04)}62%{transform:translateY(0) scale(1)}88%{transform:translateY(0) scale(1);opacity:1}100%{transform:translateY(10%) scale(1);opacity:0}}
.si-arm{transform-box:fill-box;will-change:transform}
.si-arm.l{transform-origin:100% 0%;animation:siArmL 3.8s ease forwards}
.si-arm.r{transform-origin:0% 0%;animation:siArmR 3.8s ease forwards}
@keyframes siArmL{0%,45%{transform:rotate(115deg)}50%,100%{transform:rotate(0)}}
@keyframes siArmR{0%,45%{transform:rotate(-115deg)}50%,100%{transform:rotate(0)}}
.si-word{position:absolute;top:14vh;left:0;right:0;text-align:center;font-family:var(--display);font-weight:900;font-size:clamp(70px,15vw,210px);letter-spacing:-.04em;line-height:1;color:#fff;text-shadow:0 0 40px rgba(237,8,18,.9),6px 6px 0 #ED0812,-4px -4px 0 #FFD24A}
.si-word span{display:inline-block;opacity:0;transform:scale(.2) translateY(40px);animation:siLet .5s cubic-bezier(.2,1.6,.4,1) forwards}
.si-word span.u{transform-origin:0 50%}
.si-word.go span.u{animation:siLet .5s cubic-bezier(.2,1.6,.4,1) forwards,siU 1.4s ease-in-out .5s forwards}
@keyframes siLet{to{opacity:1;transform:none}}
@keyframes siU{0%{transform:none}50%{transform:scaleX(1.5)}100%{transform:scaleX(1.25)}}
.si-word.ud{animation:siUd .5s ease forwards}
@keyframes siUd{to{opacity:0;transform:translateY(-30px) scale(1.1)}}
.si-ring{position:absolute;left:50%;bottom:12vh;width:40px;height:14px;margin:0 0 -7px -20px;border-radius:50%;border:4px solid #FFD24A;opacity:0;will-change:transform,opacity}
.si-ov.hit .si-ring{animation:siRing .9s ease-out forwards}
.si-ov.hit .si-ring.b{animation-delay:.12s;border-color:#FF3B44}
@keyframes siRing{0%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(16)}}
.si-flash{position:absolute;inset:0;background:#fff;opacity:0}
.si-ov.hit .si-flash{animation:siFlash .35s ease-out}
@keyframes siFlash{0%{opacity:.5}100%{opacity:0}}
body.si-shock .stage{animation:hmShake2 .6s cubic-bezier(.36,.07,.19,.97)}
@media (prefers-reduced-motion:reduce){.si-fig,.si-arm,.si-word span{animation:none!important;opacity:1;transform:none}}
</style>`);
function lxSiuuu(){
 document.querySelectorAll('.si-ov').forEach(x=>x.remove());
 const o=document.createElement('div');o.className='si-ov';o.setAttribute('aria-hidden','true');
 /* stiliseret spiller set bagfra i den berømte landing: arme ud, ben spredt, nr. 7 på ryggen */
 o.innerHTML=`<div class="si-bg"></div><div class="si-flash"></div><i class="si-ring"></i><i class="si-ring b"></i>
 <div class="si-fig"><svg viewBox="0 0 200 300" aria-hidden="true">
  <defs><linearGradient id="siJ" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#FF2A33"/><stop offset="1" stop-color="#B0050D"/></linearGradient></defs>
  <ellipse cx="100" cy="296" rx="70" ry="6" fill="rgba(0,0,0,.45)"/>
  <path d="M78 180 L52 236 L44 288" fill="none" stroke="#2A1416" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M122 180 L148 236 L156 288" fill="none" stroke="#2A1416" stroke-width="20" stroke-linecap="round" stroke-linejoin="round"/>
  <path d="M49 250 L45 286" stroke="#ED0812" stroke-width="21" stroke-linecap="round"/><path d="M151 250 L155 286" stroke="#ED0812" stroke-width="21" stroke-linecap="round"/>
  <path d="M36 292 h20 M144 292 h20" stroke="#111" stroke-width="10" stroke-linecap="round"/>
  <g class="si-arm l"><path d="M74 74 L44 118 L22 150" fill="none" stroke="url(#siJ)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M40 124 L22 150" stroke="#2A1416" stroke-width="15" stroke-linecap="round"/></g>
  <g class="si-arm r"><path d="M126 74 L156 118 L178 150" fill="none" stroke="url(#siJ)" stroke-width="18" stroke-linecap="round" stroke-linejoin="round"/><path d="M160 124 L178 150" stroke="#2A1416" stroke-width="15" stroke-linecap="round"/></g>
  <path d="M68 66 Q100 58 132 66 L140 150 Q100 158 60 150 Z" fill="url(#siJ)"/>
  <path d="M60 148 Q100 156 140 148 L146 186 L106 188 L100 176 L94 188 L54 186 Z" fill="#F7F2F2"/>
  <text x="100" y="128" text-anchor="middle" font-family="Unbounded,Arial Black,sans-serif" font-weight="900" font-size="56" fill="#fff">7</text>
  <rect x="91" y="48" width="18" height="16" rx="5" fill="#2A1416"/>
  <circle cx="100" cy="34" r="21" fill="#2A1416"/><path d="M80 30 Q84 10 100 12 Q118 10 121 30 Q110 20 100 22 Q88 20 80 30Z" fill="#120809"/>
 </svg></div>
`;
 document.body.appendChild(o);
 let w=null;
 setTimeout(()=>{ /* landing */
  o.classList.add('hit');
  o.insertAdjacentHTML('beforeend','<div class="si-word go">'+['S','I','U','U','U','!'].map((c,i)=>`<span class="${c==='U'?'u':''}" style="animation-delay:${i*.07}s${c==='U'?','+(.5+i*.07)+'s':''}">${c}</span>`).join('')+'</div>');
  w=o.querySelector('.si-word');
  document.body.classList.remove('si-shock');void document.body.offsetWidth;document.body.classList.add('si-shock');
  try{const f=o.querySelector('.si-fig').getBoundingClientRect();burst(f.left+f.width/2,f.bottom-10,70)}catch(e){}
  try{sky.kick()}catch(e){}
 },1900);
 setTimeout(()=>{if(w)w.classList.add('ud')},3300);
 setTimeout(()=>{o.remove();document.body.classList.remove('si-shock')},3900);
}
(function(){
 const send=lxSendOrder;
 lxSendOrder=async function(){const nr=LX.of&&LX.of.nr,el=LX.of&&+LX.of.el||0;await send.apply(this,arguments);if(LX.of&&LX.of.nr!==nr)setTimeout(lxSiuuu,el>0?2500:0)};
 addEventListener('keydown',e=>{if(e.altKey&&(e.key==='s'||e.key==='S')){e.preventDefault();lxSiuuu()}});
})();
