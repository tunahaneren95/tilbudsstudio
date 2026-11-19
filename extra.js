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

/* Ekstra produkter: Touchpoint Bruger, roamingpakker, Fri tale DK til EU og Ekstra Data kort.
   Findes de ikke i Google-arket endnu, lægges de ind, indtil admin trykker "Gem for alle".
   Pris 0 = "mangler pris": kun admin ser kortet, indtil prisen er skrevet ind i arket. */
const EKSTRA=[
 {id:'tp-bruger',cat:'tp',name:'Touchpoint Bruger',list:49,b:0,efter:/touchpoint menu/i},
 {id:'ex-data',cat:'till',name:'Ekstra Data kort',list:49,b:0,info:'Datadeling · ekstra SIM',mail:'Ekstra Data kort (datadeling)'},
 {id:'rw-20',cat:'till',name:'Roaming World 20 GB',list:69,b:12,info:'20 GB + 15 timers tale i 92 lande',mail:'Roaming World 20 GB (20 GB data og 15 timers tale uden for EU)'},
 {id:'rw-flex',cat:'till',name:'Roaming World Flex 20 GB',list:299,b:0,min:'minimum 30 dage',info:'20 GB + 15 timers tale · min. 30 dage',mail:'Roaming World Flex 20 GB (20 GB data og 15 timers tale uden for EU)'},
 {id:'eu-tale',cat:'till',name:'Fri tale DK til EU',list:19,b:0,info:'Fri tale fra Danmark til EU',mail:'Fri tale fra Danmark til EU'}
];
const erTill=n=>/roaming|tale dk til eu|ekstra data/i.test(n||'');
const FJERNET=/^roaming world 5 gb$/i; /* findes ikke */
(function(){
 const mk=x=>({id:x.id,cat:x.cat,name:x.name,list:x.list,trin:[{binding:x.b,camp:0,max:0,ny:0,forl:0}]});
 EKSTRA.forEach(x=>{if(!DEFAULT_PLANS.some(p=>p.id===x.id))DEFAULT_PLANS.push(mk(x))});
 /* kategori: arket kender kun Mobil/MBB/5G/Omstilling, så tillæg genkendes på navnet */
 const pa=parse;parse=function(txt){const r=pa(txt);if(r&&r.kind==='plans'){r.list=r.list.filter(p=>!FJERNET.test(p.name));r.list.forEach(p=>{if(erTill(p.name))p.cat='till'})}return r};
 const tt=toTSV;toTSV=function(){return tt().split('\n').map(l=>{const c=l.split('\t');if(erTill(c[1]))c[0]='Tillæg';return c.join('\t')}).join('\n')};
 function sikr(){let ch=false;const n0=plans.length;plans=plans.filter(p=>!FJERNET.test(p.name));if(plans.length!==n0)ch=true;EKSTRA.forEach(x=>{const f=plans.find(p=>p.name.toLowerCase()===x.name.toLowerCase());if(f){if(!(+f.list>0)&&x.list){f.list=x.list;ch=true}return}
  let i=x.efter?plans.findIndex(p=>x.efter.test(p.name)):-1;if(i<0&&x.cat==='tp')i=plans.map(p=>p.cat).lastIndexOf('tp');
  plans.splice(i<0?plans.length:i+1,0,mk(x));ch=true});return ch}
 function medEkstra(P){
  if(!P||!P.plan||P.plan.length<2)return P;
  const h=P.plan[0].map(String),ix=re=>h.findIndex(c=>re.test(c)),plan=P.plan.slice();
  EKSTRA.forEach(x=>{const fi=plan.findIndex(r=>String(r[ix(/abonnement/i)]||'').toLowerCase()===x.name.toLowerCase());
   if(fi>=0){const li=ix(/liste/i);if(li>=0&&x.list&&!(+String(plan[fi][li]||'').replace(',','.')>0)){plan[fi]=plan[fi].slice();plan[fi][li]=String(x.list)}return}
   const row=h.map(()=>''),set=(re,v)=>{const i=ix(re);if(i>=0)row[i]=v};
   const at=x.efter?plan.findIndex(r=>x.efter.test(r.join(' '))):-1;
   set(/kategori/i,x.cat==='tp'?(at>0?plan[at][ix(/kategori/i)]:'Omstilling'):'Tillæg');set(/abonnement/i,x.name);set(/liste/i,x.list?String(x.list):'');set(/binding/i,String(x.b));set(/udløb/i,'Nej');
   plan.splice(at>0?at+1:plan.length,0,row)});
  return Object.assign({},P,{plan});
 }
 const ap=lxApplyPrices;lxApplyPrices=function(P){return ap(medEkstra(P))};

 /* egen sektion: Roaming og tillæg */
 ICO.till='<svg viewBox="0 0 20 20" aria-hidden="true"><path d="M10 1.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17Zm5.9 7.7h-2.6a13 13 0 0 0-1.1-4.9 6.9 6.9 0 0 1 3.7 4.9ZM10 3.2c.8 1 1.6 3 1.8 6H8.2c.2-3 1-5 1.8-6ZM7.8 4.3a13 13 0 0 0-1.1 4.9H4.1a6.9 6.9 0 0 1 3.7-4.9ZM4.1 10.8h2.6c.1 1.9.5 3.6 1.1 4.9a6.9 6.9 0 0 1-3.7-4.9Zm5.9 6c-.8-1-1.6-3-1.8-6h3.6c-.2 3-1 5-1.8 6Zm2.2-1.1c.6-1.3 1-3 1.1-4.9h2.6a6.9 6.9 0 0 1-3.7 4.9Z"/></svg>';
 document.head.insertAdjacentHTML('beforeend',`<style>
 #g-till{grid-template-columns:repeat(auto-fill,minmax(170px,1fr))}
 .pc[data-pid].till .ico{background:rgba(120,170,255,.12)}.pc.till .ico svg{fill:#9DC2FF}.pc.till.on .ico{background:var(--red)}.pc.till.on .ico svg{fill:#fff}
 .pc.till .pc-tag{font-family:var(--f);font-weight:800;font-size:15px;letter-spacing:-.01em;line-height:1.2}
 .pc.till .tl-info{font-size:12px;color:var(--muted);line-height:1.35;min-height:32px}
 .pc.till.off .pc-from.bad{color:var(--warn,#FFB347)}
 </style>`);
 const g=document.getElementById('g-tp');
 if(g&&!document.getElementById('g-till'))g.insertAdjacentHTML('afterend','<div class="sub-h" id="h-till">Roaming og tillæg</div><div class="grid" id="g-till"></div>');
 const INFO=Object.fromEntries(EKSTRA.map(x=>[x.name.toLowerCase(),x.info||'']));
 const erAdmin=()=>{try{return !!LX.admin}catch(e){return false}};
 const rp=renderProducts;renderProducts=function(){rp.apply(this,arguments);
  const gt=document.getElementById('g-till');if(!gt)return;
  const l=plans.filter(p=>p.cat==='till'&&(+p.list>0||erAdmin()||linesOf(p.id).length));
  gt.innerHTML=l.map(p=>card(p).replace('class="pc','class="pc till')
   .replace(/<span class="cat">[^<]*<\/span>/,'<span class="cat">Tillæg</span>')
   .replace(/<div class="pc-tag">[^<]*<\/div>/,`<div class="pc-tag">${esc(p.name)}</div>`)
   .replace(/<div class="meter[^"]*" aria-hidden="true"><i[^>]*><\/i><\/div>/,`<div class="tl-info">${esc(INFO[p.name.toLowerCase()]||'')}</div>`)).join('');
  document.getElementById('h-till').hidden=!l.length;
 };
 sikr();try{render()}catch(e){}
 /* admin-login viser kort uden pris */
 let varAdm=erAdmin();setInterval(()=>{if(erAdmin()!==varAdm){varAdm=erAdmin();try{render()}catch(e){}}},1500);
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
.si-fig{position:absolute;left:50%;bottom:12vh;width:min(300px,46vw);margin-left:calc(min(300px,46vw)/-2);transform-origin:50% 100%;will-change:transform;animation:siJump 3.8s cubic-bezier(.3,.7,.3,1) forwards}
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
 /* CR7 i Portugal-trøje: den berømte landing med armene ud, benene spredt og hagen op */
 o.innerHTML=`<div class="si-bg"></div><div class="si-flash"></div><i class="si-ring"></i><i class="si-ring b"></i>
 <div class="si-fig"><svg viewBox="0 0 240 340" aria-hidden="true">
 <defs>
  <linearGradient id="sisk" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#B0714A"/><stop offset=".5" stop-color="#D9A07A"/><stop offset="1" stop-color="#A2643E"/></linearGradient>
  <linearGradient id="sish" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#EE2430"/><stop offset="1" stop-color="#A5070F"/></linearGradient>
  <linearGradient id="sipa" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#11744A"/><stop offset="1" stop-color="#084A2E"/></linearGradient>
 </defs>
 <ellipse cx="120" cy="333" rx="96" ry="6" fill="rgba(0,0,0,.45)"/>
 <path d="M100 194 C90 226 72 248 64 274" fill="none" stroke="url(#sisk)" stroke-width="26" stroke-linecap="round"/>
 <path d="M140 194 C150 226 168 248 176 274" fill="none" stroke="url(#sisk)" stroke-width="26" stroke-linecap="round"/>
 <path d="M64 272 L57 316" stroke="#E8202B" stroke-width="19" stroke-linecap="round"/>
 <path d="M176 272 L183 316" stroke="#E8202B" stroke-width="19" stroke-linecap="round"/>
 <path d="M64.5 276 l-1.6 9 M175.5 276 l1.6 9" stroke="#11744A" stroke-width="19"/>
 <path d="M38 327 Q42 314 57 315 Q67 317 67 327 Z" fill="#F4F4F4"/><path d="M202 327 Q198 314 183 315 Q173 317 173 327 Z" fill="#F4F4F4"/>
 <path d="M38 327 h30 M172 327 h30" stroke="#111" stroke-width="5" stroke-linecap="round"/>
 <path d="M86 166 L154 166 L166 214 L126 219 L120 199 L114 219 L74 214 Z" fill="url(#sipa)"/>
 <path d="M76 208 L114 213 M164 208 L126 213" stroke="#E8202B" stroke-width="3"/>
 <g class="si-arm l"><path d="M64 110 L38 150 L26 166" fill="none" stroke="url(#sisk)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M84 78 Q70 90 62 112" fill="none" stroke="url(#sish)" stroke-width="24" stroke-linecap="round"/><path d="M53 108 l16 8" stroke="#11744A" stroke-width="3"/><path d="M14 168 q4 -10 14 -6 q8 4 6 14 q-4 8 -12 6 q-8 -4 -8 -14Z" fill="#C98B62"/></g>
 <g class="si-arm r"><path d="M176 110 L202 150 L214 166" fill="none" stroke="url(#sisk)" stroke-width="15" stroke-linecap="round" stroke-linejoin="round"/><path d="M156 78 Q170 90 178 112" fill="none" stroke="url(#sish)" stroke-width="24" stroke-linecap="round"/><path d="M187 108 l-16 8" stroke="#11744A" stroke-width="3"/><path d="M226 168 q-4 -10 -14 -6 q-8 4 -6 14 q4 8 12 6 q8 -4 8 -14Z" fill="#C98B62"/></g>
 <path d="M82 74 Q120 62 158 74 Q166 96 160 118 Q154 142 152 170 Q120 176 88 170 Q86 142 80 118 Q74 96 82 74 Z" fill="url(#sish)"/>
 <path d="M96 96 Q108 104 118 98 M122 98 Q132 104 144 96" stroke="rgba(0,0,0,.2)" stroke-width="2.5" fill="none"/>
 <path d="M104 70 L120 88 L136 70" fill="none" stroke="#11744A" stroke-width="5" stroke-linejoin="round"/>
 <path d="M106 70 L120 84 L134 70 Z" fill="url(#sisk)"/>
 <text x="120" y="150" text-anchor="middle" font-family="Unbounded,Arial Black,sans-serif" font-weight="900" font-size="30" fill="#FFD24A">7</text>
 <path d="M108 52 L107 72 L133 72 L132 52 Z" fill="url(#sisk)"/>
 <path d="M100 34 Q99 50 104 58 Q112 68 120 68 Q128 68 136 58 Q141 50 140 34 Q138 18 120 16 Q102 18 100 34 Z" fill="url(#sisk)"/>
 <path d="M112 52 Q120 46 128 52 Q127 62 120 63 Q113 62 112 52 Z" fill="#3A1410"/><path d="M114 53 h12" stroke="#fff" stroke-width="2"/>
 <path d="M107 38 q4 -2.5 8 0 M125 38 q4 -2.5 8 0" stroke="#2A1A12" stroke-width="2.5" fill="none" stroke-linecap="round"/>
 <path d="M105 33 l11 -1 M124 32 l11 1" stroke="#2A1A12" stroke-width="3.2" stroke-linecap="round"/>
 <path d="M119 40 l-2 8 h4" stroke="#9A5A36" stroke-width="1.6" fill="none"/>
 <path d="M99 34 Q98 24 102 20 L103 30 Z M141 34 Q142 24 138 20 L137 30 Z" fill="#4A3324"/>
 <path d="M101 24 Q100 6 116 2 Q134 -2 140 12 Q143 18 139 26 Q132 14 120 15 Q108 15 101 24 Z" fill="#1A0F0A"/>
 <path d="M108 8 Q122 -6 140 6 Q132 0 120 2 Q112 3 108 8Z" fill="#2E1C12"/>
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

/* Forlængelse: kort intro som kollegerne ønsker, ental/flertal, ingen telefon-linje */
(function(){
 const antal=()=>{try{return active().filter(({p})=>!erTill(p.name)).reduce((n,{it})=>n+(+it.ny||0)+(+it.forl||0),0)}catch(e){return 1}};
 INTRO.forl=()=>`Tak for en god samtale. Som lovet sender jeg her tilbuddet på at forlænge ${antal()>1?'dine abonnementer':'dit abonnement'}.`;
 const mo=model;model=function(){const m=mo.apply(this,arguments);
  if(S.situation==='forl'){m.phones='';
   /* alt står under "Nye abonnementer", som i kollegernes skabelon */
   if(m.groups.length){const alle=m.groups.flatMap(g=>g.lines);m.groups=[{label:'NYE ABONNEMENTER',lines:alle}]}}
  /* roaming og tillæg i deres egen gruppe */
  const MN=Object.fromEntries(EKSTRA.filter(x=>x.mail).map(x=>[x.name,x.mail])),MIN=Object.fromEntries(EKSTRA.filter(x=>x.min).map(x=>[x.name,x.min]));
  const till=[];m.groups.forEach(g=>{g.lines=g.lines.filter(l=>{if(erTill(l.name)){till.push(Object.assign({},l,{name:MN[l.name]||l.name,price:l.price.replace(/ (?:ved|i) (\d+) måneder(?:s binding)?$/,' – minimum $1 måneder').replace(/ – ingen binding$/,MIN[l.name]?' – '+MIN[l.name]:' – ingen binding')}));return false}return true})});
  m.groups=m.groups.filter(g=>g.lines.length);if(till.length)m.groups.push({label:'TILLÆG',lines:till});
  /* samme opsætning på alle abonnementer: "x kr./md. i 36 måneder" */
  m.groups.forEach(g=>g.lines.forEach(l=>{l.price=l.price.replace(/ ved (\d+) måneders binding$/,' i $1 måneder')}));
  return m};
 try{renderMail()}catch(e){}
})();

/* ⚡ El-ordrenummer: sælgeren skriver ordrenummeret på elaftalen, så admin kan tjekke det */
document.head.insertAdjacentHTML('beforeend',`<style>
.lx-elnr{grid-column:1/-1;animation:lxElnr .35s cubic-bezier(.2,1.2,.4,1)}
.lx-elnr input{border-color:rgba(255,210,74,.45)!important;background:rgba(255,210,74,.06)!important}
.lx-elnr small{display:block;margin-top:6px;font-size:12px;color:var(--muted);font-weight:500;letter-spacing:0;text-transform:none}
@keyframes lxElnr{from{opacity:0;transform:translateY(-6px)}}
.lx-oa-el{display:inline-flex;align-items:center;gap:8px;margin-top:2px;padding:6px 10px;border-radius:10px;background:rgba(255,210,74,.08);border:1px solid rgba(255,210,74,.3);font-size:13px;color:#FFE79A}
.lx-oa-el code{font-family:ui-monospace,Menlo,Consolas,monospace;color:#fff;font-weight:700;user-select:all}
.lx-oa-el button{border:0;background:none;color:#FFE79A;cursor:pointer;font:inherit;font-size:12px;text-decoration:underline;padding:0}
</style>`);
(function(){
 const visEl=()=>{const o=LX.of,el=document.getElementById('lo-el');if(!o||!el)return;let w=document.getElementById('lo-elw');
  if(o.el>0&&!w){const box=el.closest('.f');box.insertAdjacentHTML('afterend',`<label class="f lx-elnr" id="lo-elw">El-ordrenr.<input id="lo-elnr" value="${esc(o.elnr||'')}" placeholder="Fx 7001234567" autocomplete="off" spellcheck="false"><small>Flere elaftaler? Skriv numrene med komma imellem.</small></label>`);
   const i=document.getElementById('lo-elnr');i.addEventListener('input',()=>{o.elnr=i.value})}
  else if(o.el<=0&&w)w.remove()};
 const lo=lxOrder;lxOrder=function(){lo.apply(this,arguments);visEl();
  document.querySelectorAll('#lx-order [data-el]').forEach(b=>b.addEventListener('click',()=>setTimeout(visEl,0)))};
 try{if(document.getElementById('lo-el'))lxOrder()}catch(e){}
 const send=lxSendOrder;lxSendOrder=async function(){const o=LX.of||{};
  if(o.el>0&&String(o.elnr||'').trim().length<3){toast('Skriv ordrenummeret på elaftalen, så Tunahan kan tjekke det');const i=document.getElementById('lo-elnr');if(i){i.focus();i.closest('label').animate([{transform:'translateX(-6px)'},{transform:'translateX(6px)'},{transform:'none'}],{duration:260})}return}
  return send.apply(this,arguments)};
 const kald=lapi;lapi=function(a,o){if(a==='ordre'&&LX.of&&+LX.of.el>0)o=Object.assign({},o,{elnr:String(LX.of.elnr||'').trim()});return kald(a,o)};
 /* admin: vis el-ordrenumre på ordrer til godkendelse */
 const ap=lxAdminPaint;lxAdminPaint=function(){const r=ap.apply(this,arguments);
  ((LX.adm&&LX.adm.ordrer)||[]).forEach(o=>{if(!o.elnr)return;const b=document.querySelector(`#lx-admin [data-god="${CSS.escape(o.id)}"]`);const box=b&&b.closest('.lx-oa');if(!box||box.querySelector('.lx-oa-el'))return;
   const m=box.querySelectorAll('.lx-oa-m');(m[m.length-1]||box).insertAdjacentHTML('afterend',`<div class="lx-oa-el">⚡ El-ordrenr. <code>${esc(o.elnr)}</code><button type="button" data-kop="${esc(o.elnr)}">Kopiér</button></div>`)});
  return r};
 document.addEventListener('click',e=>{const k=e.target.closest('[data-kop]');if(!k)return;navigator.clipboard.writeText(k.dataset.kop).then(()=>toast('El-ordrenummer kopieret'),()=>{})});
 /* sælgerens egne ordrer */
 const lo2=lxOrds;lxOrds=function(){const r=lo2.apply(this,arguments);(LX.ords||[]).forEach((x,i)=>{if(!x.elnr)return;const v=document.querySelectorAll('#lx-ot .lx-cr .v')[i];if(v&&!v.dataset.el){v.dataset.el=1;v.insertAdjacentHTML('beforeend',' · el '+esc(x.elnr))}});return r};
})();
