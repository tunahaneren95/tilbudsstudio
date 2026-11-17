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
