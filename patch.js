/* Små rettelser til Tilbudsstudio. Indlæses efter luffy.js. */

/* Serverstatus på admin-siden: viser præcis hvad der går galt med forbindelsen */
(function(){
  const box=document.createElement('div');
  box.id='lx-diag';
  box.style.cssText='max-width:520px;margin-top:18px;padding:16px 18px;border-radius:18px;border:1px solid rgba(255,255,255,.12);background:rgba(255,255,255,.04);font-size:13px;line-height:1.5;color:var(--muted)';
  async function tjek(){
    if(view()!=='admin')return;
    const host=$('lx-admin');if(!host)return;
    if(!document.getElementById('lx-diag'))host.after(box);
    const id=(LX.api.match(/\/s\/([\w-]+)\//)||[])[1]||'';
    box.innerHTML='<b style="color:#fff">Serverstatus</b><br>Tjekker forbindelsen…';
    const linjer=['Script-link: …'+id.slice(-10)];
    try{
      const r=await fetch(LX.api+'?t='+Date.now());
      const txt=await r.text();
      let j=null;try{j=JSON.parse(txt)}catch(e){}
      if(j&&j.ok)linjer.push('<span style="color:#6EE7A4">✓ Scriptet svarer: '+esc(j.besked||'ok')+'</span>');
      else if(j)linjer.push('<span style="color:#FF6B72">✗ Scriptet svarer med fejl: '+esc(j.fejl||txt.slice(0,200))+'</span>');
      else linjer.push('<span style="color:#FF6B72">✗ Scriptet svarer ikke med data. Det ligner en Google-fejlside: '+esc(txt.replace(/<[^>]+>/g,' ').replace(/\s+/g,' ').slice(0,220))+'</span>');
    }catch(e){
      linjer.push('<span style="color:#FF6B72">✗ Kan ikke nå scriptet. Typisk betyder det, at "Hvem har adgang" ikke står til "Alle", eller at linket er forkert.</span>');
    }
    try{
      const j=await (await fetch(LX.api,{method:'POST',body:JSON.stringify({a:'alt'})})).json();
      linjer.push(j.ok?'<span style="color:#6EE7A4">✓ Arket kan læses ('+(j.top&&j.top.liste?j.top.liste.length:0)+' sælgere)</span>':'<span style="color:#FF6B72">✗ Arket: '+esc(j.fejl||'ukendt fejl')+'</span>');
    }catch(e){linjer.push('<span style="color:#FF6B72">✗ Kunne ikke læse arket</span>')}
    box.innerHTML='<b style="color:#fff">Serverstatus</b><br>'+linjer.join('<br>')+'<br><span style="opacity:.7">Send et screenshot af denne boks til Claude, hvis noget er rødt.</span>';
  }
  addEventListener('hashchange',tjek);
  setTimeout(tjek,300);
})();

/* Leaderboard med optjent / brugt / tilbage + holdets skattekiste */
document.head.insertAdjacentHTML('beforeend',`<style>
.lx-chest{position:relative;overflow:hidden;display:grid;grid-template-columns:auto repeat(3,minmax(0,1fr));gap:18px;align-items:center;max-width:980px;margin:0 auto 46px;padding:22px 26px;border-radius:26px;
 background:radial-gradient(circle at 0% 50%,rgba(255,201,90,.28),transparent 45%),linear-gradient(120deg,rgba(255,201,90,.12),rgba(237,8,18,.12) 70%,rgba(255,255,255,.03));border:1px solid rgba(255,201,90,.35);box-shadow:0 40px 90px -50px rgba(255,190,60,.55)}
.lx-chest::after{content:"";position:absolute;inset:0;background:linear-gradient(105deg,transparent 40%,rgba(255,255,255,.08) 50%,transparent 60%);transform:translateX(-100%);animation:lxShine 5s ease-in-out infinite;pointer-events:none}
@keyframes lxShine{60%,100%{transform:translateX(100%)}}
.lx-chest .ic{font-size:44px;filter:drop-shadow(0 8px 14px rgba(255,190,60,.45));animation:lxBob 3s ease-in-out infinite}
@keyframes lxBob{50%{transform:translateY(-5px) rotate(-4deg)}}
.lx-chest .st small{display:block;font-size:10.5px;letter-spacing:.16em;text-transform:uppercase;font-weight:800;color:#FFD98A;opacity:.85}
.lx-chest .st b{font-family:var(--display);font-size:clamp(24px,3.2vw,38px);letter-spacing:-.03em;line-height:1.1;color:#fff}
.lx-chest .st b i{font-style:normal;font-size:.38em;color:#FFC95A;margin-left:5px;letter-spacing:.08em}
.lx-chest .st.lx-left b{background:linear-gradient(92deg,#fff,#FFD98A);-webkit-background-clip:text;background-clip:text;color:transparent}
@media (max-width:700px){.lx-chest{grid-template-columns:repeat(3,minmax(0,1fr));padding:18px}.lx-chest .ic{display:none}}
.lx-ledger{display:grid;grid-template-columns:repeat(3,1fr);margin-top:10px;border-top:2px solid rgba(58,34,16,.35);border-bottom:2px solid rgba(58,34,16,.35)}
.lx-ledger div{padding:6px 2px;font-family:Georgia,"Times New Roman",serif}
.lx-ledger div+div{border-left:1px dashed rgba(58,34,16,.35)}
.lx-ledger small{display:block;font-size:8.5px;letter-spacing:.18em;font-weight:700;opacity:.65}
.lx-ledger b{font-family:var(--display);font-size:clamp(12px,1.4vw,15px);letter-spacing:-.01em}
.lx-ledger .lx-left b{color:#9B0A10}
.lx-lr{grid-template-columns:44px 40px minmax(0,1fr) auto minmax(60px,140px) auto!important}
.lx-mini3{display:flex;gap:6px}
.lx-mini3 span{display:grid;justify-items:end;min-width:58px;padding:5px 9px;border-radius:10px;background:rgba(255,255,255,.04);border:1px solid var(--edge)}
.lx-mini3 small{font-size:9.5px;letter-spacing:.12em;text-transform:uppercase;color:var(--dim);font-weight:800}
.lx-mini3 b{font-family:var(--display);font-size:13px}
.lx-mini3 .lx-left{border-color:rgba(255,201,90,.4);background:rgba(255,201,90,.08)}
.lx-mini3 .lx-left b{color:#FFD98A}
@media (max-width:900px){.lx-lr{grid-template-columns:30px 36px minmax(0,1fr) auto!important}.lx-lr .lx-track{display:none}.lx-mini3{grid-column:2/-1;grid-row:2}.lx-lr .pt,.lx-lr .lx-nw{grid-column:4;grid-row:1}}
</style>`);
function lxBoard(){
 const B=LX.board,el=$('lx-board'),mk=LX.mode;
 const mn=B&&B.maaned?new Date(B.maaned+'-01T12:00').toLocaleDateString('da-DK',{month:'long',year:'numeric'}):'';
 $('lx-month').textContent=mk==='md'?'✦ '+(mn||'Denne måned'):'✦ Alle tider';
 $('lx-upd').textContent=B&&B.at?'Opdateret '+B.at.toLocaleTimeString('da-DK',{hour:'2-digit',minute:'2-digit'}):'';
 if(!LX.api){el.innerHTML=`<div class="lx-blank"><h3>Luffy-serveren er ikke koblet på endnu</h3></div>`;return}
 if(!B){el.innerHTML=`<div class="lx-blank"><h3>Henter dusører…</h3></div>`;return}
 const L=B.liste.map(x=>{const brugt=+x.brugt||0,alt=+x.alt||0;return Object.assign({},x,{p:mk==='md'?x.md:x.alt,brugt,alt,saldo:x.saldo!=null?+x.saldo:alt-brugt})}).sort((a,b)=>b.p-a.p||a.navn.localeCompare(b.navn,'da'));
 if(!L.length){el.innerHTML=`<div class="lx-blank"><h3>Ingen på plakaten endnu</h3><p>Når kollegerne opretter en profil i Shop, dukker de op her.</p></div>`;return}
 const T=L.reduce((a,x)=>(a.o+=x.alt,a.b+=x.brugt,a.s+=x.saldo,a),{o:0,b:0,s:0});
 const myId=LX.me&&LX.me.id,top=L.slice(0,3),rot=['-1.5deg','2.2deg','-2.6deg'];
 const ledger=x=>`<div class="lx-ledger"><div><small>I ALT</small><b>${lnum(x.alt)}</b></div><div><small>BRUGT</small><b>${lnum(x.brugt)}</b></div><div class="lx-left"><small>TILBAGE</small><b>${lnum(x.saldo)}</b></div></div>`;
 const poster=(x,i)=>{if(!x)return '';const w=x.p>0,f=lxFoto(x.id);return `<div class="lx-p${i+1}"><div class="lx-wanted${w?'':' lx-not'}${x.id===myId?' lx-me':''}" style="--r:${rot[i]};animation-delay:${[200,0,350][i]}ms">${w?`<span class="lx-rank">${i+1}</span>`:''}<p class="lx-w1">${w?'WANTED':'<s>NOT</s> WANTED'}</p>
  <div class="lx-pic${f?' has':''}">${f?`<img class="ph" src="${f}" alt="${esc(x.navn)}">`:''}${i===0&&w?`<img class="hat" src="${HAT()}" alt="">`:''}${f?'':`<b>${esc(ini(x.navn))}</b>`}</div><p class="lx-doa">${w?'DEAD OR ALIVE':'NO BOUNTY · YET'}</p><p class="lx-wn">${esc(x.navn)}</p>
  <div class="lx-bounty">${lnum(x.p)}<i>LP</i></div>${ledger(x)}<div class="lx-mar">NORLYS ERHVERV</div></div></div>`};
 const max=L[0].p||1;
 el.innerHTML=`<div class="lx-chest"><span class="ic">💰</span><div class="st"><small>Optjent af holdet</small><b data-n="${T.o}">0<i>LP</i></b></div><div class="st"><small>Brugt i shoppen</small><b data-n="${T.b}">0<i>LP</i></b></div><div class="st lx-left"><small>Tilbage i kisterne</small><b data-n="${T.s}">0<i>LP</i></b></div></div>`
  +`<div class="lx-pod">${top.map(poster).join('')}</div>`
  +(L.length>3?`<div class="lx-list">${L.slice(3).map((x,i)=>{const w=x.p>0;return `<div class="lx-lr${w?'':' lx-zero'}${x.id===myId?' lx-me':''}" style="animation-delay:${i*40}ms"><span class="k">${w?i+4:'–'}</span>${lxAv(x)}
  <span class="nm">${esc(x.navn)}${x.id===myId?' · dig':''}<small>${x.ordrer||0} ordrer denne måned</small></span>
  <span class="lx-mini3"><span><small>I alt</small><b>${lnum(x.alt)}</b></span><span><small>Brugt</small><b>${lnum(x.brugt)}</b></span><span class="lx-left"><small>Tilbage</small><b>${lnum(x.saldo)}</b></span></span>
  ${w?`<span class="lx-track"><i style="width:${Math.max(2,x.p/max*100)}%"></i></span><span class="pt">${lnum(x.p)}</span>`:`<span class="lx-track lx-nt"></span><span class="lx-nw">NOT WANTED</span>`}</div>`}).join('')}</div>`:'');
 el.querySelectorAll('.lx-chest b[data-n]').forEach(b=>{const to=+b.dataset.n,i=b.querySelector('i').outerHTML;if(RM||!to){b.innerHTML=lnum(to)+i;return}const t0=performance.now();const f=t=>{const k=Math.min(1,(t-t0)/1100),e=1-Math.pow(1-k,3);b.innerHTML=lnum(to*e)+i;if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)});
}
if(view()==='top')lxBoard();

/* ⚡ Elsalg: kæmpehammeren slår ned og giver stød til hele siden */
document.head.insertAdjacentHTML('beforeend',`<style>
.hm-ov{position:fixed;inset:0;z-index:95;pointer-events:none;overflow:hidden}
.hm-flash{position:absolute;inset:0;background:radial-gradient(circle at 50% 72%,#fff 0%,rgba(255,240,180,.9) 18%,rgba(255,59,68,.35) 45%,transparent 70%);opacity:0}
.hm-ov.hit .hm-flash{animation:hmFlash .9s ease-out}
@keyframes hmFlash{0%{opacity:1}15%{opacity:.2}25%{opacity:.85}100%{opacity:0}}
.hm-tool{position:absolute;left:50%;top:72%;width:min(520px,80vw);margin-left:calc(min(520px,80vw)*-.18);transform-origin:18% 92%;transform:translate(-10%,-92%) rotate(-75deg);opacity:0;filter:drop-shadow(0 30px 40px rgba(0,0,0,.6))}
.hm-ov.go .hm-tool{animation:hmSwing 2.1s cubic-bezier(.5,0,.2,1) forwards}
@keyframes hmSwing{0%{opacity:0;transform:translate(10%,-140%) rotate(-95deg)}14%{opacity:1;transform:translate(0,-100%) rotate(-80deg)}26%{transform:translate(-4%,-96%) rotate(-92deg)}38%{transform:translate(-10%,-92%) rotate(8deg)}42%{transform:translate(-10%,-91%) rotate(2deg)}48%{transform:translate(-10%,-92%) rotate(5deg)}78%{opacity:1;transform:translate(-10%,-92%) rotate(4deg)}100%{opacity:0;transform:translate(20%,-160%) rotate(-40deg)}}
.hm-rings{position:absolute;left:50%;top:76%;width:0;height:0}
.hm-rings i{position:absolute;left:0;top:0;width:40px;height:40px;margin:-20px;border-radius:50%;border:4px solid rgba(255,230,120,.95);box-shadow:0 0 30px rgba(255,200,60,.9),inset 0 0 20px rgba(255,59,68,.6);opacity:0}
.hm-ov.hit .hm-rings i{animation:hmRing 1.1s cubic-bezier(.1,.7,.3,1) forwards}
.hm-ov.hit .hm-rings i:nth-child(2){animation-delay:.12s;border-color:rgba(255,59,68,.9)}
.hm-ov.hit .hm-rings i:nth-child(3){animation-delay:.24s;border-color:rgba(255,255,255,.8)}
@keyframes hmRing{0%{opacity:1;transform:scale(.4)}100%{opacity:0;transform:scale(40)}}
.hm-bolts{position:absolute;inset:0;width:100%;height:100%}
.hm-bolts polyline{fill:none;stroke:#FFF6C8;stroke-width:4;stroke-linejoin:round;filter:drop-shadow(0 0 8px #FFD24A) drop-shadow(0 0 22px #FF3B44);opacity:0}
.hm-ov.hit .hm-bolts polyline{animation:hmBolt .5s steps(2) 3}
.hm-ov.hit .hm-bolts polyline:nth-child(2n){animation-delay:.08s}.hm-ov.hit .hm-bolts polyline:nth-child(3n){animation-delay:.16s}
@keyframes hmBolt{0%{opacity:1}50%{opacity:0}100%{opacity:1}}
.hm-crack{position:absolute;left:50%;top:76%;width:min(700px,95vw);transform:translate(-50%,-50%);opacity:0}
.hm-ov.hit .hm-crack{animation:hmCrack 1.6s ease-out forwards}
@keyframes hmCrack{0%{opacity:1;transform:translate(-50%,-50%) scale(.6)}10%{transform:translate(-50%,-50%) scale(1)}70%{opacity:.9}100%{opacity:0}}
.hm-word{position:absolute;left:50%;top:36%;transform:translate(-50%,-50%) scale(.2) rotate(-8deg);font-family:var(--display);font-weight:800;font-size:clamp(54px,12vw,170px);letter-spacing:-.04em;line-height:.9;text-align:center;color:#fff;opacity:0;
 text-shadow:0 0 30px #FFD24A,0 0 60px #FF3B44,4px 4px 0 #ED0812,-4px -4px 0 #FFD24A;white-space:nowrap}
.hm-word small{display:block;font-size:.22em;letter-spacing:.3em;margin-top:.4em;color:#FFE79A;text-shadow:0 0 16px #FF3B44}
.hm-ov.hit .hm-word{animation:hmWord 1.8s cubic-bezier(.2,1.6,.4,1) forwards}
@keyframes hmWord{0%{opacity:0;transform:translate(-50%,-50%) scale(.2) rotate(-8deg)}12%{opacity:1;transform:translate(-50%,-50%) scale(1.15) rotate(-4deg)}20%{transform:translate(-48%,-52%) scale(1) rotate(-6deg)}24%{transform:translate(-52%,-48%) scale(1.02) rotate(-3deg)}80%{opacity:1;transform:translate(-50%,-50%) scale(1) rotate(-5deg)}100%{opacity:0;transform:translate(-50%,-60%) scale(1.3) rotate(-5deg)}}
body.hm-shock .stage{animation:hmShake .9s cubic-bezier(.36,.07,.19,.97)}
body.hm-shock{animation:hmZap .9s steps(1)}
@keyframes hmShake{0%{transform:translate(0,0)}5%{transform:translate(-28px,22px) rotate(-1.4deg)}10%{transform:translate(26px,-18px) rotate(1.2deg)}15%{transform:translate(-22px,-14px) rotate(-.9deg)}20%{transform:translate(20px,16px) rotate(.8deg)}30%{transform:translate(-14px,10px) rotate(-.5deg)}40%{transform:translate(12px,-8px) rotate(.4deg)}55%{transform:translate(-7px,5px)}70%{transform:translate(5px,-3px)}85%{transform:translate(-2px,2px)}100%{transform:none}}
@keyframes hmZap{0%{filter:none}6%{filter:invert(1) hue-rotate(180deg)}10%{filter:none}16%{filter:saturate(3) brightness(1.6) hue-rotate(-20deg)}22%{filter:none}30%{filter:contrast(1.8) brightness(1.3)}36%{filter:none}}
</style>`);
function lxHammer(){
 if(typeof RM!=='undefined'&&RM){toast('⚡ ELSALG!');return}
 document.querySelectorAll('.hm-ov').forEach(x=>x.remove());
 const W=innerWidth,H=innerHeight,cx=W/2,cy=H*.76;
 const bolt=(x1,y1,x2,y2,seg)=>{let p=[[x1,y1]];for(let i=1;i<seg;i++){const t=i/seg;p.push([x1+(x2-x1)*t+(Math.random()-.5)*90,y1+(y2-y1)*t+(Math.random()-.5)*90])}p.push([x2,y2]);return `<polyline points="${p.map(q=>q.map(Math.round).join(',')).join(' ')}"/>`};
 let bolts='';[[0,0],[W,0],[0,H*.4],[W,H*.35],[W*.25,H],[W*.8,H],[0,H],[W,H],[W*.5,0]].forEach(([x,y])=>bolts+=bolt(cx,cy,x,y,9));
 const o=document.createElement('div');o.className='hm-ov';o.setAttribute('aria-hidden','true');
 o.innerHTML=`<div class="hm-flash"></div><svg class="hm-bolts" viewBox="0 0 ${W} ${H}" preserveAspectRatio="none">${bolts}</svg>
 <svg class="hm-crack" viewBox="0 0 700 220"><g fill="none" stroke="rgba(255,240,200,.9)" stroke-width="3" stroke-linecap="round"><path d="M350 110 L300 90 L250 100 L190 70 L120 80 L40 50"/><path d="M350 110 L410 85 L470 98 L540 66 L620 74 L690 40"/><path d="M350 110 L330 150 L280 170 L230 210"/><path d="M350 110 L380 160 L440 175 L480 215"/><path d="M300 90 L290 50 L300 10"/><path d="M470 98 L490 140 L560 150"/></g></svg>
 <div class="hm-rings"><i></i><i></i><i></i></div>
 <svg class="hm-tool" viewBox="0 0 520 300"><defs>
  <linearGradient id="hmWood" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#C98B4E"/><stop offset=".5" stop-color="#8A5428"/><stop offset="1" stop-color="#5A3216"/></linearGradient>
  <linearGradient id="hmHead" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#4A4F58"/><stop offset=".45" stop-color="#2A2D33"/><stop offset="1" stop-color="#121418"/></linearGradient>
  <linearGradient id="hmBand" x1="0" x2="0" y1="0" y2="1"><stop offset="0" stop-color="#FF5A60"/><stop offset="1" stop-color="#8E040A"/></linearGradient></defs>
  <rect x="60" y="128" width="300" height="34" rx="14" fill="url(#hmWood)" transform="rotate(-2 210 145)"/>
  <rect x="70" y="134" width="40" height="22" rx="8" fill="#3B2210" opacity=".55"/><rect x="118" y="134" width="40" height="22" rx="8" fill="#3B2210" opacity=".35"/>
  <rect x="330" y="30" width="170" height="230" rx="34" fill="url(#hmHead)" stroke="#0A0B0D" stroke-width="6"/>
  <rect x="330" y="62" width="170" height="26" fill="url(#hmBand)"/><rect x="330" y="202" width="170" height="26" fill="url(#hmBand)"/>
  <rect x="344" y="40" width="20" height="210" rx="10" fill="#fff" opacity=".12"/>
  <path d="M428 100 L398 150 L422 150 L404 196 L452 136 L428 136 L446 100 Z" fill="#FFD24A" stroke="#fff" stroke-width="4" stroke-linejoin="round"/></svg>
 <div class="hm-word">ELSALG!<small>⚡ STRØM PÅ KONTOEN ⚡</small></div>`;
 document.body.appendChild(o);
 requestAnimationFrame(()=>o.classList.add('go'));
 try{sfx.whoosh()}catch(e){}
 setTimeout(()=>{o.classList.add('hit');document.body.classList.remove('hm-shock');void document.body.offsetWidth;document.body.classList.add('hm-shock');
  try{sky.kick();sky.kick()}catch(e){}
  for(let i=0;i<6;i++)setTimeout(()=>burst(cx+(Math.random()-.5)*240,cy+(Math.random()-.5)*60,80),i*70);
  if(navigator.vibrate)try{navigator.vibrate([60,40,120])}catch(e){}
 },800);
 setTimeout(()=>{document.body.classList.remove('hm-shock');o.remove()},3200);
}
/* hammeren slår, når en ordre med elsalg sendes, og når admin godkender en */
(function(){
 const send=lxSendOrder;
 lxSendOrder=async function(){const el=LX.of.el,nr=LX.of.nr;await send();if(el>0&&LX.of.nr!==nr)lxHammer()};
 $('lx-admin').addEventListener('click',e=>{const g=e.target.closest('[data-god]');if(!g||!LX.adm)return;const o=(LX.adm.ordrer||[]).find(x=>x.id===g.dataset.god);if(o&&o.el>0)setTimeout(lxHammer,250)},true);
 addEventListener('keydown',e=>{if(e.altKey&&(e.key==='e'||e.key==='E')){e.preventDefault();lxHammer()}});
})();
