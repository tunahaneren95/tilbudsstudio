/* ================= LUFFY POINTS ================= */
/* Linket til Google-scriptet ligger i api.txt, så det kan skiftes uden at røre denne fil */
const LUFFY_API=(()=>{const fb='https://script.google.com/macros/s/AKfycbw2ynvchCud9Bb6LM_v7_W7OkS0GaPFNOVSeV7zXJsDAKfyvD7JsmWjLyp-_2SApiXRSQ/exec';if(!location.protocol.startsWith('http'))return fb;try{const x=new XMLHttpRequest();x.open('GET','api.txt?v='+Date.now(),false);x.send();const t=(x.responseText||'').trim();if(x.status===200&&/^https:\/\/script\.google\.com\/macros\/s\/[\w-]+\/exec$/.test(t))return t}catch(e){}return fb})();
const LX={api:LUFFY_API||store.get('ts.lapi',''),tok:store.get('ts.ltok',''),me:store.get('ts.lme',null),items:[],rules:null,codes:[],cart:store.get('ts.lcart',{}),board:null,mode:'md',admin:'',adm:null,offer:Math.random().toString(36).slice(2,10)};
try{LX.admin=sessionStorage.getItem('ts.ladm')||''}catch(e){}
/* ekstra stil, der kan opdateres uden ny index.html */
document.head.insertAdjacentHTML('beforeend','<style>.lx-acts{display:flex;gap:14px;flex-wrap:wrap}.lx-del{color:var(--dim)}.lx-del:hover{color:var(--red-hi)}.lx-del.arm{color:#fff;background:var(--red);border-radius:8px;padding:4px 8px;text-decoration:none}</style>');
var LX_F;const lnum=n=>Math.round(+n||0).toLocaleString('da-DK');
LX_F=store.get('ts.lfoto',{});
function lxFoto(id){const f=LX_F[id];return f&&f.d||''}
function lxAv(x,cls){const f=lxFoto(x.id);return `<span class="lx-av${cls?' '+cls:''}">${f?`<img src="${f}" alt="">`:esc(ini(x.navn))}</span>`}
let lxFBusy=false;
async function lxFotoSync(list){if(!list||lxFBusy)return;const need=[];let ch=false;
 list.forEach(x=>{const c=LX_F[x.id];if(!x.v){if(c){delete LX_F[x.id];ch=true}}else if(!c||c.v!==x.v)need.push(x)});
 if(need.length){lxFBusy=true;try{const j=await lapi('billeder',{ids:need.map(x=>x.id)});need.forEach(x=>{if(j.billeder[x.id]){LX_F[x.id]={v:x.v,d:j.billeder[x.id]};ch=true}})}catch(e){}lxFBusy=false}
 if(ch){store.set('ts.lfoto',LX_F);const v=view();if(v==='top')lxBoard();if(v==='shop')lxShop();if(v==='admin')lxAdminPaint()}}
const ini=n=>String(n||'?').trim().split(/\s+/).map(w=>w[0]).slice(0,2).join('').toUpperCase();
const HAT=()=>$('lf-hat').src;
async function lapi(a,o={}){
 if(!LX.api)throw new Error('OFFLINE');
 let r;try{r=await fetch(LX.api,{method:'POST',body:JSON.stringify(Object.assign({a},o))})}catch(e){throw new Error('Ingen forbindelse til Luffy-serveren')}
 let j;try{j=await r.json()}catch(e){throw new Error('Serveren svarede ikke rigtigt')}
 if(!j.ok){if(j.fejl==='LOGIN'){lxLogout(true);throw new Error('Log ind igen')}throw new Error(j.fejl||'Noget gik galt')}
 return j}
function lxSetMe(m){LX.me=m;store.set('ts.lme',m);lxPaintNav()}
function lxLogout(silent){LX.tok='';LX.me=null;store.set('ts.ltok','');store.set('ts.lme',null);LX.codes=[];lxPaintNav();lxRoute();if(!silent)toast('Du er logget ud')}
function lxPaintNav(){const b=$('nav-bal');if(LX.me){const v=lnum(LX.me.saldo);if(b.textContent!==v&&!b.hidden){b.classList.remove('bump');void b.offsetWidth;b.classList.add('bump')}b.textContent=v;b.hidden=false}else b.hidden=true}
function lxCount(n,to){const from=+(n.dataset.v||LX.shown||0);LX.shown=to;n.dataset.v=to;if(RM||from===to){n.textContent=lnum(to);return}const t0=performance.now(),d=900;const f=t=>{const k=Math.min(1,(t-t0)/d),e=1-Math.pow(1-k,3);n.textContent=lnum(from+(to-from)*e);if(k<1)requestAnimationFrame(f)};requestAnimationFrame(f)}
function lxPop(x,y,t){const p=document.createElement('div');p.className='lx-pop';p.textContent=t;p.style.left=x+'px';p.style.top=y+'px';document.body.appendChild(p);setTimeout(()=>p.remove(),1700)}

/* ---- ordrer: point når en lukket ordre er godkendt ---- */
LX.of={nr:'',kunde:'',kv:'',el:0};LX.ords=[];
const lxR=()=>Object.assign({min_kontraktvaerdi:500,point_pr_ordre:1,point_pr_elsalg:1,point_pr_100_kr:0},LX.rules||{});
function lxCalc(kv,el){const R=lxR();return (kv>=R.min_kontraktvaerdi?R.point_pr_ordre+Math.floor(kv/100*R.point_pr_100_kr):0)+el*R.point_pr_elsalg}
const lxNum=v=>Math.max(0,Math.round(+String(v||'').replace(/\s|kr\.?/gi,'').replace(/\./g,'').replace(',','.')||0));
/* kontraktværdi fra tilbuddet: md.-pris x bindingsmåneder x antal (gratis måneder trækkes fra) */
function lxKV(){let v=0;active().forEach(({p,it})=>{const m=Math.max(0,(+it.binding||0)-(it.free6?6:0));v+=unit(p,it)*m*qty(it)});return Math.round(v)}
function lxHint(kv,p){const R=lxR();return p>0?'Afventer godkendelse, når du sender den':kv>0&&kv<R.min_kontraktvaerdi?`Under ${lnum(R.min_kontraktvaerdi)} kr. giver ingen point, men ordren bliver stadig registreret`:'Giver ingen point, men ordren bliver stadig registreret'}
function lxOrder(){const el=$('lx-order'),m=LX.me,R=lxR(),o=LX.of;
 if(!LX.api){el.innerHTML='';return}
 const kv=lxNum(o.kv),pts=lxCalc(kv,o.el),under=kv>0&&kv<R.min_kontraktvaerdi;
 el.innerHTML=`<div class="lx-ob"><div class="lx-ol"><span class="lx-tag">Optjen point</span><h2>Lukket en ordre?</h2>
   <p>Alt med en kontraktværdi på mindst <b>${lnum(R.min_kontraktvaerdi)} kr. ekskl. moms</b> giver point, og det gør hvert elsalg også. Pointene kommer, når Tunahan har godkendt ordren.</p>
   <div class="lx-rules"><span class="lx-rule"><b>+${lnum(R.point_pr_ordre)}</b>pr. ordre over ${lnum(R.min_kontraktvaerdi)} kr.</span><span class="lx-rule"><b>+${lnum(R.point_pr_elsalg)}</b>pr. elsalg</span>${R.point_pr_100_kr?`<span class="lx-rule"><b>+${lnum(R.point_pr_100_kr)}</b>pr. 100 kr. kontraktværdi</span>`:''}</div></div>
  <div class="lx-of">
   <label class="f">Ordrenummer<input id="lo-nr" value="${esc(o.nr)}" placeholder="Fx 40012345" autocomplete="off"></label>
   <label class="f">Kunde<input id="lo-k" value="${esc(o.kunde)}" placeholder="Firmanavn"></label>
   <label class="f lx-kv">Kontraktværdi, kr. ekskl. moms<span class="lx-kvw"><input id="lo-kv" inputmode="numeric" value="${esc(o.kv)}" placeholder="0"><button type="button" class="lx-fill" id="lo-fill" title="Udregnet som pris pr. md. × bindingsmåneder × antal">Hent fra tilbuddet</button></span></label>
   <div class="f">Elaftaler i ordren<div class="lx-step lx-step-l"><button type="button" data-el="-1" aria-label="Færre">−</button><span id="lo-el">${o.el}</span><button type="button" data-el="1" aria-label="Flere">+</button></div></div>
   <div class="lx-ores"><div class="lx-gets"><small>Ordren giver</small><b id="lo-p">${lnum(pts)}</b><i>LP</i></div>
    <p class="lx-oh" id="lo-h">${lxHint(kv,pts)}</p>
    <button class="primary" type="button" id="lo-go"${o.nr.trim().length>2?'':' disabled'}>${m?'Send til godkendelse':'Log ind for at sende'}</button></div>
  </div></div>`;
 const upd=()=>{o.nr=$('lo-nr').value;o.kunde=$('lo-k').value;o.kv=$('lo-kv').value;const kv=lxNum(o.kv),p=lxCalc(kv,o.el);$('lo-p').textContent=lnum(p);
  $('lo-h').textContent=lxHint(kv,p);$('lo-go').disabled=!(o.nr.trim().length>2)};
 ['lo-nr','lo-k','lo-kv'].forEach(id=>$(id).addEventListener('input',upd));
 $('lo-fill').onclick=()=>{const v=lxKV();if(!v){toast('Der er ingen bundne abonnementer i tilbuddet');return}o.kv=lnum(v);if(!o.kunde&&S.company)o.kunde=S.company;o.el=Math.max(o.el,Object.keys(S.el).filter(k=>S.el[k]).length);lxOrder();const r=$('lo-kv').getBoundingClientRect();burst(r.left+r.width-40,r.top+r.height/2,30)};
 el.querySelectorAll('[data-el]').forEach(b=>b.onclick=()=>{o.el=Math.max(0,Math.min(50,o.el+ +b.dataset.el));$('lo-el').textContent=o.el;upd()});
 $('lo-go').onclick=()=>m?lxSendOrder():lxLogin()}
async function lxSendOrder(){const b=$('lo-go'),o=LX.of;b.disabled=true;b.textContent='Sender…';
 try{const j=await lapi('ordre',{token:LX.tok,ordrenr:o.nr.trim(),kunde:o.kunde.trim(),vaerdi:lxNum(o.kv),el:o.el});
  LX.of={nr:'',kunde:'',kv:'',el:0};lxSetMe(j.mig);LX.ords=j.ordrer;lxShop();const r=$('lx-order').getBoundingClientRect();burst(r.left+r.width*.75,r.top+r.height/2,90);sky.kick();sfx.whoosh();
  toast(j.point>0?`Ordren er sendt. ${lnum(j.point)} point venter på godkendelse`:'Ordren er registreret')}
 catch(e){toast(e.message);b.disabled=false;b.textContent='Send til godkendelse'}}
function lxOrds(){const c=LX.ords||[];$('lx-ords').hidden=!c.length||!LX.me;
 $('lx-ot').innerHTML=c.map(x=>`<div class="lx-cr"><code>${esc(x.ordrenr)}</code><span class="v">${esc(x.kunde||'')}${x.vaerdi?' · '+lnum(x.vaerdi)+' kr.':''}${x.el?' · '+x.el+' el':''}</span><span class="p">${lnum(x.point)} LP</span><span class="lx-st ${esc(x.status)}">${esc(x.status)}</span></div>`).join('')}

/* ---- login ---- */
function lxLogin(then){
 const d=document.createElement('div');d.className='lx-modal';let mode='login';
 d.innerHTML=`<div class="lx-box" role="dialog" aria-modal="true" aria-labelledby="lx-lh"><button class="lx-x" type="button" data-x aria-label="Luk">×</button>
  <h2 id="lx-lh">Din Luffy-profil</h2><p>Så tæller dine tilbud med i point og på leaderboardet.</p>
  <div class="lx-tabs"><button type="button" data-t="login" class="on">Log ind</button><button type="button" data-t="opret">Opret profil</button></div>
  <label class="f">Dit navn<input id="lx-n" autocomplete="name" placeholder="Fornavn Efternavn" value="${esc(LX.me?LX.me.navn:me||'')}"></label>
  <label class="f">PIN (4-8 cifre)<input id="lx-p" type="password" inputmode="numeric" autocomplete="current-password" maxlength="8" placeholder="••••"></label>
  <p class="hint" id="lx-hint" style="margin:0 0 4px">Brug ikke din Norlys-adgangskode. PIN'en gemmes krypteret.</p>
  <p class="lx-err" id="lx-e"></p>
  <div class="lx-cta"><button class="primary" type="button" id="lx-go">Log ind</button></div></div>`;
 document.body.appendChild(d);const close=()=>{d.remove();removeEventListener('keydown',k)};const k=e=>{if(e.key==='Escape')close()};addEventListener('keydown',k);
 d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-x]'))close();const t=e.target.closest('[data-t]');if(t){mode=t.dataset.t;d.querySelectorAll('[data-t]').forEach(b=>b.classList.toggle('on',b===t));d.querySelector('#lx-go').textContent=mode==='login'?'Log ind':'Opret profil';d.querySelector('#lx-p').autocomplete=mode==='login'?'current-password':'new-password'}});
 const go=async()=>{const b=d.querySelector('#lx-go'),e=d.querySelector('#lx-e');e.textContent='';b.disabled=true;b.textContent='Et øjeblik…';
  try{const j=await lapi(mode,{navn:d.querySelector('#lx-n').value,pin:d.querySelector('#lx-p').value});LX.tok=j.token;store.set('ts.ltok',j.token);lxSetMe(j.mig);close();if(!me){me=j.mig.navn.split(' ')[0];store.set('ts.name',me);paintMe()}
   const r=$('nav-shop').getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,70);sky.kick();toast(mode==='opret'?'Velkommen ombord, '+j.mig.navn.split(' ')[0]:'Logget ind som '+j.mig.navn);lxRefreshMe();then&&then()}
  catch(err){e.textContent=err.message==='OFFLINE'?'Luffy-serveren er ikke koblet på endnu':err.message;b.disabled=false;b.textContent=mode==='login'?'Log ind':'Opret profil'}};
 d.querySelector('#lx-go').onclick=go;d.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go()}));
 setTimeout(()=>d.querySelector(LX.me||me?'#lx-p':'#lx-n').focus(),60)}
async function lxRefreshMe(){return lxSync()}

/* ---- routing ---- */
const view=()=>(location.hash||'').replace('#','');
function lxRoute(){const v=view(),ok=['shop','top','admin'].includes(v);
 document.body.classList.toggle('in-view',ok);
 document.querySelectorAll('.view').forEach(s=>s.hidden=s.dataset.view!==v);
 $('nav-shop').classList.toggle('on',v==='shop');$('nav-top').classList.toggle('on',v==='top'||v==='admin');
 if(!ok)return;scrollTo({top:0});sky.kick();
 if(v==='shop'){lxShop();lxLoadShop()}
 if(v==='top'){lxBoard();lxLoadBoard()}
 if(v==='admin')lxAdmin(true)}
addEventListener('hashchange',lxRoute);

/* ---- shop ---- */
function lxOfflineCard(){return `<div class="lx-blank" style="grid-column:1/-1"><h3>Luffy-serveren er ikke koblet på endnu</h3><p>Når Google-arket er sat op, dukker butikken op her.</p></div>`}
/* ét kald henter alt (shop, regler, leaderboard, min profil) og gemmes lokalt, så siderne åbner med det samme */
(()=>{const c=store.get('ts.lcache',null);if(c){LX.items=c.varer||[];LX.rules=c.regler||null;if(c.top){LX.board=c.top;LX.board.at=c.at?new Date(c.at):null}if(c.koder)LX.codes=c.koder;if(c.ordrer)LX.ords=c.ordrer}})();
let lxBusy=null;
function lxSync(){if(!LX.api)return Promise.resolve();if(lxBusy)return lxBusy;
 lxBusy=lapi('alt',{token:LX.tok}).then(j=>{LX.items=j.varer;LX.rules=j.regler;LX.board=j.top;LX.board.at=new Date();
  if(j.mig){lxSetMe(j.mig);LX.codes=j.koder||[];LX.ords=j.ordrer||[]}else if(LX.tok){lxLogout(true)}
  store.set('ts.lcache',{varer:j.varer,regler:j.regler,top:j.top,at:Date.now(),koder:LX.codes,ordrer:LX.ords});
  if(j.priser){store.set('ts.central',j.priser);store.set('ts.centralAt',Date.now());if(lxApplyPrices(j.priser)){render();if(!$('drawer').hidden)renderPrices()}if(!$('drawer').hidden)lxPriceBar()}
  const v=view();if(v==='shop')lxShop();if(v==='top')lxBoard();lxFotoSync(j.top.liste)}).catch(e=>{if(view()==='shop'||view()==='top')toast(e.message)}).finally(()=>{lxBusy=null});
 return lxBusy}
async function lxLoadShop(){lxShop();lxSync()}
function lxCartSum(){let n=0,p=0;for(const id in LX.cart){const it=LX.items.find(x=>x.id===id);if(!it){continue}n+=LX.cart[id];p+=LX.cart[id]*it.pris}return{n,p}}
function lxShop(){
 const m=LX.me,R=LX.rules;
 // regler
 $('lx-rules').innerHTML='';
 // wallet
 const w=$('lx-wallet');
 if(m){w.innerHTML=`<div class="lx-who"><span class="lx-wme">${lxAv(m,'lg')}<small>${esc(m.navn)} · din saldo</small></span><button class="lx-link" type="button" id="lx-out">Log ud</button></div>
  <div class="lx-num"><span id="lx-sal"></span><i>LP</i></div>
  <div class="lx-sub"><span>Optjent <b>${lnum(m.optjent)}</b></span><span>Brugt <b>${lnum(m.brugt)}</b></span>${m.afventer?`<span>Afventer <b>${lnum(m.afventer)}</b></span>`:''}</div><img class="lx-hat" src="${HAT()}" alt="">`;
  lxCount($('lx-sal'),m.saldo);$('lx-out').onclick=()=>lxLogout()}
 else{w.innerHTML=`<small>Din saldo</small><div class="lx-num">?<i>LP</i></div><p style="color:var(--muted);margin:6px 0 16px">Log ind for at se dine point og shoppe.</p><button class="primary" type="button" id="lx-in" style="padding:14px 22px">Log ind eller opret profil</button><img class="lx-hat" src="${HAT()}" alt="">`;
  $('lx-in').onclick=()=>lxLogin()}
 // varer
 const sal=m?m.saldo:0,{p:cartP}=lxCartSum();
 $('lx-cnt').textContent=LX.items.length?LX.items.length+' ting':'';
 $('lx-items').innerHTML=!LX.api?lxOfflineCard():!LX.items.length?`<div class="lx-blank" style="grid-column:1/-1"><h3>Henter butikken…</h3></div>`:LX.items.map((it,i)=>{const q=LX.cart[it.id]||0,left=sal-cartP;const miss=m&&!q&&it.pris>left?it.pris-left:0;
  return `<article class="lx-item${q?' in':''}" style="animation-delay:${i*50}ms" data-id="${esc(it.id)}">${miss?`<span class="lx-miss">Mangler ${lnum(miss)}</span>`:''}<div class="lx-ico">${esc(it.ikon)}</div><h3>${esc(it.navn)}</h3><p>${esc(it.tekst)}</p>
  <div class="lx-price"><b>${lnum(it.pris)}<i>LP</i></b>${q?`<div class="lx-step"><button type="button" data-d="-1" aria-label="Færre">−</button><span>${q}</span><button type="button" data-d="1" aria-label="Flere">+</button></div>`:`<button class="lx-add" type="button" data-d="1"${miss?' disabled':''}>Læg i kurv</button>`}</div></article>`}).join('');
 lxCart();lxCodes();lxOrds();lxOrder()}
function lxCart(){
 const m=LX.me,{n,p}=lxCartSum(),sal=m?m.saldo:0,after=sal-p;
 const rows=Object.keys(LX.cart).map(id=>{const it=LX.items.find(x=>x.id===id);return it?`<li><span class="e">${esc(it.ikon)}</span><span class="n">${esc(it.navn)}<small>${LX.cart[id]} × ${lnum(it.pris)} LP</small></span><b>${lnum(LX.cart[id]*it.pris)}</b><button type="button" data-rm="${esc(id)}" aria-label="Fjern">×</button></li>`:''}).join('');
 $('lx-cart').innerHTML=`<h3>Kurven ${n?`<em>${n}</em>`:''}</h3>${rows?`<ul class="lx-cl">${rows}</ul>`:`<div class="lx-empty">Kurven er tom.<br>Find noget, du har fortjent.</div>`}
  <div class="lx-sum"><div><span>Din saldo</span><span>${m?lnum(sal)+' LP':'-'}</span></div><div><span>I alt</span><span class="big">${lnum(p)} LP</span></div>${m&&n?`<div class="${after<0?'bad':''}"><span>Saldo bagefter</span><b>${lnum(after)} LP</b></div>`:''}</div>
  <button class="primary lx-buy" type="button" id="lx-buy"${!n||(m&&after<0)?' disabled':''}>${m?'Indløs Luffy points':'Log ind for at indløse'}</button>
  <p class="lx-note">${m&&after<0?'Du mangler '+lnum(-after)+' point. Luk en ordre mere.':'Du får en kode. Vis den til Tunahan, så indløser han den.'}</p>`;
 $('lx-buy').onclick=()=>m?lxBuy():lxLogin()}
function lxCodes(){const c=LX.codes||[];$('lx-codes').hidden=!c.length||!LX.me;
 $('lx-ct').innerHTML=c.map(x=>`<div class="lx-cr"><code>${esc(x.kode)}</code><span class="v">${esc(x.varer)}</span><span class="p">${lnum(x.point)} LP</span><span class="lx-st ${esc(x.status)}">${esc(x.status)}</span></div>`).join('')}
$('lx-items').addEventListener('click',e=>{const b=e.target.closest('[data-d]');if(!b||b.disabled)return;const id=b.closest('[data-id]').dataset.id;
 if(!LX.me&&LX.api){lxLogin();return}
 const q=Math.max(0,Math.min(20,(LX.cart[id]||0)+ +b.dataset.d));if(q)LX.cart[id]=q;else delete LX.cart[id];store.set('ts.lcart',LX.cart);
 if(+b.dataset.d>0){const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,26);sfx.blip()}lxShop()});
$('lx-cart').addEventListener('click',e=>{const b=e.target.closest('[data-rm]');if(!b)return;delete LX.cart[b.dataset.rm];store.set('ts.lcart',LX.cart);lxShop()});
async function lxBuy(){const b=$('lx-buy');b.disabled=true;b.textContent='Henter kode…';
 try{const j=await lapi('koeb',{token:LX.tok,kurv:Object.keys(LX.cart).map(id=>({id,antal:LX.cart[id]}))});
  LX.cart={};store.set('ts.lcart',{});lxSetMe(j.mig);LX.codes=j.koder;lxShop();lxReveal(j)}
 catch(e){toast(e.message);lxShop()}}
function lxReveal(j){const d=document.createElement('div');d.className='lx-reveal';
 d.innerHTML=`<div class="lx-rv"><small>Din kode</small><div class="lx-code">${[...j.kode].map((c,i)=>`<span class="${c==='-'?'dash':''}" style="animation-delay:${200+i*90}ms">${esc(c)}</span>`).join('')}</div>
  <h2>${esc(j.varer)}</h2><p>Vis koden til Tunahan. Når han indløser den, er det dit. ${lnum(j.pris)} point er trukket fra din saldo.</p>
  <div class="row"><button class="primary" type="button" data-c style="padding:14px 22px">Kopiér koden</button><button class="ghost" type="button" data-x>Luk</button></div></div>`;
 document.body.appendChild(d);sky.kick();sfx.whoosh();
 setTimeout(()=>{const r=d.querySelector('.lx-code').getBoundingClientRect();for(let i=0;i<4;i++)setTimeout(()=>burst(r.left+r.width*(.15+.23*i),r.top+r.height/2,70),i*110)},700);
 const close=()=>{d.remove();removeEventListener('keydown',k)};const k=e=>{if(e.key==='Escape')close()};addEventListener('keydown',k);
 d.addEventListener('click',e=>{if(e.target.closest('[data-c]'))copyPlain(j.kode,'Koden er kopieret');else if(e.target===d||e.target.closest('[data-x]'))close()})}

/* ---- leaderboard ---- */
async function lxLoadBoard(){lxBoard();lxSync()}
function lxBoard(){
 const B=LX.board,el=$('lx-board'),mk=LX.mode;
 const mn=B&&B.maaned?new Date(B.maaned+'-01T12:00').toLocaleDateString('da-DK',{month:'long',year:'numeric'}):'';
 $('lx-month').textContent=mk==='md'?'✦ '+(mn||'Denne måned'):'✦ Alle tider';
 $('lx-upd').textContent=B&&B.at?'Opdateret '+B.at.toLocaleTimeString('da-DK',{hour:'2-digit',minute:'2-digit'}):'';
 if(!LX.api){el.innerHTML=`<div class="lx-blank"><h3>Luffy-serveren er ikke koblet på endnu</h3><p>Leaderboardet vises, så snart Google-arket er sat op.</p></div>`;return}
 if(!B){el.innerHTML=`<div class="lx-blank"><h3>Henter dusører…</h3></div>`;return}
 const L=B.liste.map(x=>Object.assign({},x,{p:mk==='md'?x.md:x.alt})).sort((a,b)=>b.p-a.p||a.navn.localeCompare(b.navn,'da'));
 if(!L.length){el.innerHTML=`<div class="lx-blank"><h3>Ingen på plakaten endnu</h3><p>Når kollegerne opretter en profil i Shop, dukker de op her.</p></div>`;return}
 const myId=LX.me&&LX.me.id,top=L.slice(0,3),rot=['-1.5deg','2.2deg','-2.6deg'];
 const poster=(x,i)=>{if(!x)return '';const w=x.p>0,f=lxFoto(x.id);return `<div class="lx-p${i+1}"><div class="lx-wanted${w?'':' lx-not'}${x.id===myId?' lx-me':''}" style="--r:${rot[i]};animation-delay:${[200,0,350][i]}ms">${w?`<span class="lx-rank">${i+1}</span>`:''}<p class="lx-w1">${w?'WANTED':'<s>NOT</s> WANTED'}</p>
  <div class="lx-pic${f?' has':''}">${f?`<img class="ph" src="${f}" alt="${esc(x.navn)}">`:''}${i===0&&w?`<img class="hat" src="${HAT()}" alt="">`:''}${f?'':`<b>${esc(ini(x.navn))}</b>`}</div><p class="lx-doa">${w?'DEAD OR ALIVE':'NO BOUNTY · YET'}</p><p class="lx-wn">${esc(x.navn)}</p>
  <div class="lx-bounty">${lnum(x.p)}<i>LP</i></div><div class="lx-mar">NORLYS ERHVERV</div></div></div>`};
 const max=L[0].p||1;
 el.innerHTML=`<div class="lx-pod">${top.map(poster).join('')}</div>`+(L.length>3?`<div class="lx-list">${L.slice(3).map((x,i)=>{const w=x.p>0;return `<div class="lx-lr${w?'':' lx-zero'}${x.id===myId?' lx-me':''}" style="animation-delay:${i*40}ms"><span class="k">${w?i+4:'–'}</span>${lxAv(x)}
  <span class="nm">${esc(x.navn)}${x.id===myId?' · dig':''}<small>${x.ordrer||0} ordrer denne måned</small></span>${w?`<span class="lx-track"><i style="width:${Math.max(2,x.p/max*100)}%"></i></span><span class="pt">${lnum(x.p)}</span>`:`<span class="lx-track lx-nt"></span><span class="lx-nw">NOT WANTED</span>`}</div>`}).join('')}</div>`:'')}
$('lx-seg').addEventListener('click',e=>{const b=e.target.closest('[data-m]');if(!b)return;LX.mode=b.dataset.m;$('lx-seg').querySelectorAll('button').forEach(x=>x.classList.toggle('on',x===b));lxBoard()});
$('lx-ref').addEventListener('click',()=>{sky.kick();lxLoadBoard()});
setInterval(()=>{if(view()==='top'&&!document.hidden)lxLoadBoard()},60000);

/* ---- admin ---- */
async function lxAdmin(load){
 const el=$('lx-admin');
 if(!LX.admin){el.innerHTML=`<div class="lx-card" style="max-width:520px"><h3>Log ind som admin</h3>
  ${LX.api?'':`<label class="f">Web-app URL fra Google Apps Script<input id="lx-url" placeholder="https://script.google.com/macros/s/…/exec"></label><p class="hint" style="margin:0">Gemmes kun i din browser, så du kan teste. Send URL'en til Claude, så den bages ind til alle.</p>`}
  <label class="f">Admin-kode<input id="lx-ak" type="password" autocomplete="current-password"></label><p class="lx-err" id="lx-ae"></p><button class="primary" type="button" id="lx-ago">Åbn kahytten</button></div>`;
  const go=async()=>{const u=$('lx-url');if(u&&u.value.trim()){LX.api=u.value.trim();store.set('ts.lapi',LX.api)}
   LX.admin=$('lx-ak').value;try{await lxAdmLoad();try{sessionStorage.setItem('ts.ladm',LX.admin)}catch(e){}sky.kick();lxAdminPaint()}catch(e){LX.admin='';$('lx-ae').textContent=e.message==='OFFLINE'?'Indsæt web-app URL\'en først':e.message}};
  $('lx-ago').onclick=go;el.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',e=>{if(e.key==='Enter')go()}));return}
 if(LX.adm)lxAdminPaint();if(load||!LX.adm){if(!LX.adm)el.innerHTML=`<div class="lx-blank"><h3>Åbner kahytten…</h3></div>`;try{await lxAdmLoad()}catch(e){if(/admin/i.test(e.message)){LX.admin='';try{sessionStorage.removeItem('ts.ladm')}catch(x){}lxAdmin();return}toast(e.message)}}
 lxAdminPaint()}
async function lxAdmLoad(){LX.adm=await lapi('admin',{admin:LX.admin});lxFotoSync(LX.adm.saelgere)}
/* profilbilleder: beskær til kvadrat, 240 px, jpeg */
function lxShrink(file){return new Promise((ok,bad)=>{const u=URL.createObjectURL(file),im=new Image();im.onload=()=>{const c=document.createElement('canvas'),S=240;c.width=c.height=S;const k=Math.min(im.width,im.height),x=(im.width-k)/2,y=(im.height-k)*.35;const g=c.getContext('2d');g.fillStyle='#fff';g.fillRect(0,0,S,S);g.drawImage(im,x,Math.max(0,y),k,k,0,0,S,S);URL.revokeObjectURL(u);let q=.85,d=c.toDataURL('image/jpeg',q);while(d.length>46000&&q>.3){q-=.1;d=c.toDataURL('image/jpeg',q)}ok(d)};im.onerror=()=>bad(new Error('Kunne ikke læse billedet'));im.src=u})}
const lxPicIn=document.createElement('input');lxPicIn.type='file';lxPicIn.accept='image/*';lxPicIn.hidden=true;document.body.appendChild(lxPicIn);let lxPicFor='';
async function lxSetPic(id,d){try{const j=await lapi('billede',{admin:LX.admin,id,data:d});LX.adm=j;if(d){const s=j.saelgere.find(x=>x.id===id);LX_F[id]={v:s?s.v:Date.now(),d}}else delete LX_F[id];store.set('ts.lfoto',LX_F);lxAdminPaint();toast(d?'Billedet er sat ind':'Billedet er fjernet');if(d){const b=document.querySelector(`[data-pic="${id}"]`);if(b){const r=b.getBoundingClientRect();burst(r.left+r.width/2,r.top+r.height/2,60)}}}catch(e){toast(e.message)}}
lxPicIn.addEventListener('change',async()=>{const f=lxPicIn.files[0];lxPicIn.value='';if(!f||!lxPicFor)return;toast('Uploader billede…');try{await lxSetPic(lxPicFor,await lxShrink(f))}catch(e){toast(e.message)}});
function lxAdminPaint(){const A=LX.adm,el=$('lx-admin');if(!A)return;
 const pend=A.koder.filter(k=>k.status==='Afventer'),done=A.koder.filter(k=>k.status!=='Afventer').slice(0,15);
 const S2=[...A.saelgere].sort((a,b)=>b.saldo-a.saldo),dt=s=>s?new Date(s).toLocaleString('da-DK',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
 const op=(A.ordrer||[]).filter(o=>o.status==='Afventer');
 el.innerHTML=`<div class="lx-adm"><div style="display:grid;gap:22px">
  <div class="lx-card lx-gold"><h3>Ordrer til godkendelse ${op.length?`<em>${op.length}</em>`:''}</h3>${op.length?op.map(o=>`<div class="lx-oa"><div class="lx-oa-t"><code>${esc(o.ordrenr)}</code><b>${lnum(o.point)} LP</b></div>
   <div class="lx-oa-m"><b>${esc(o.navn)}</b>${o.kunde?' · '+esc(o.kunde):''} · ${dt(o.tid)}</div>
   <div class="lx-oa-m">${o.vaerdi?'Kontraktværdi '+lnum(o.vaerdi)+' kr.':'Ingen kontraktværdi'}${o.el?' · '+o.el+' elaftale'+(o.el>1?'r':''):''}</div>
   <div class="row" style="display:flex;gap:8px;flex-wrap:wrap"><button class="lx-ok" type="button" data-god="${esc(o.id)}">Godkend</button><button class="lx-no" type="button" data-gno="${esc(o.id)}">Afvis</button></div></div>`).join(''):'<p class="hint" style="margin:0">Ingen ordrer venter på dig.</p>'}</div>
  <div class="lx-card"><h3>Indløs en kode</h3><div class="lx-scan"><input id="lx-k" placeholder="LUF-XXXXX" autocomplete="off" spellcheck="false"><button class="primary" type="button" id="lx-kgo" style="padding:0 22px">Find</button></div><div id="lx-hit"></div></div>
  <div class="lx-card"><h3>Koder der venter ${pend.length?`<em>${pend.length}</em>`:''}</h3>${pend.length?pend.map(k=>`<div class="lx-mini"><code>${esc(k.kode)}</code><span class="v"><b style="color:#fff">${esc(k.navn)}</b> · ${esc(k.varer)}</span><button class="lx-ok" type="button" data-ok="${esc(k.kode)}">Indløs</button></div>`).join(''):'<p class="hint" style="margin:0">Ingen koder venter. Stille vand.</p>'}</div>
  <div class="lx-card"><h3>Seneste</h3>${done.length?`<div class="lx-tw"><table class="lx-tbl"><thead><tr><th>Kode</th><th>Sælger</th><th>Varer</th><th class="n">Point</th><th>Status</th></tr></thead><tbody>${done.map(k=>`<tr><td><code>${esc(k.kode)}</code></td><td>${esc(k.navn)}</td><td>${esc(k.varer)}</td><td class="n">${lnum(k.point)}</td><td><span class="lx-st ${esc(k.status)}">${esc(k.status)}</span></td></tr>`).join('')}</tbody></table></div>`:'<p class="hint" style="margin:0">Intet endnu.</p>'}</div>
 </div><div style="display:grid;gap:22px">
  <div class="lx-card"><h3>Giv bonus</h3><p class="hint" style="margin:0">Fx for en lukket aftale. Skriv minus for at trække point.</p><div class="lx-bonus">
   <label class="f">Sælger<select id="lx-bs">${S2.map(s=>`<option value="${esc(s.id)}">${esc(s.navn)}</option>`).join('')}</select></label>
   <label class="f">Point<input id="lx-bp" inputmode="numeric" placeholder="100"></label>
   <label class="f">Begrundelse<input id="lx-bn" placeholder="Lukket aftale på 12 Corporate 50 GB"></label></div>
   <button class="primary" type="button" id="lx-bgo"${S2.length?'':' disabled'}>Giv point</button></div>
  <div class="lx-card"><h3>Sælgere</h3><p class="hint" style="margin:0">Klik på et ansigt for at sætte et profilbillede ind. Det bliver beskåret firkantet og gjort lille automatisk.</p>${S2.length?`<div class="lx-people">${S2.map(s=>`<div class="lx-person"><button type="button" class="lx-avbtn" data-pic="${esc(s.id)}" title="Skift billede af ${esc(s.navn)}">${lxAv(s,'xl')}<span class="lx-cam">${lxFoto(s.id)?'Skift':'+ Billede'}</span></button><div class="lx-pn"><b>${esc(s.navn)}</b><small>Saldo ${lnum(s.saldo)} · optjent ${lnum(s.optjent)} · brugt ${lnum(s.brugt)}</small><span class="lx-acts">${lxFoto(s.id)?`<button type="button" class="lx-link" data-rmpic="${esc(s.id)}">Fjern billede</button>`:''}<button type="button" class="lx-link lx-del" data-del="${esc(s.id)}">Slet sælger</button></span></div></div>`).join('')}</div>`:'<p class="hint" style="margin:0">Ingen har oprettet en profil endnu.</p>'}</div>
  <div class="lx-card"><h3>Optjeningsregler</h3><p class="hint" style="margin:0">Ret tallene i Google-arket under fanen Regler. Shoppens varer retter du under fanen Shop.</p>
   <table class="lx-tbl"><tbody>${Object.keys(A.regler).map(k=>`<tr><td>${esc(k.replace(/_/g,' '))}</td><td class="n">${lnum(A.regler[k])}</td></tr>`).join('')}</tbody></table>
   <div class="row" style="display:flex;gap:10px;flex-wrap:wrap"><button class="ghost" type="button" id="lx-are">Opdatér</button><button class="ghost" type="button" id="lx-aout">Log ud af admin</button></div></div>
 </div></div>`;
 const find=()=>{const v=$('lx-k').value.trim().toUpperCase().replace(/^(?!LUF-)/,'LUF-'),k=A.koder.find(x=>x.kode===v);const h=$('lx-hit');
  if(!k){h.innerHTML=`<p class="lx-err">Ingen kode der hedder ${esc(v)}</p>`;return}
  h.innerHTML=`<div class="lx-hit"><div class="top"><code>${esc(k.kode)}</code><span class="lx-st ${esc(k.status)}">${esc(k.status)}</span></div><div><b>${esc(k.navn)}</b> · ${dt(k.tid)}</div><div style="color:var(--muted)">${esc(k.varer)} · <b style="color:#fff">${lnum(k.point)} LP</b></div>
   ${k.status==='Afventer'?`<div class="row"><button class="lx-ok" type="button" data-ok="${esc(k.kode)}">Indløs</button><button class="lx-no" type="button" data-no="${esc(k.kode)}">Afvis og giv point tilbage</button></div>`:`<p class="hint" style="margin:0">Behandlet ${dt(k.indloest)}</p>`}</div>`};
 $('lx-kgo').onclick=find;$('lx-k').addEventListener('keydown',e=>{if(e.key==='Enter')find()});
 $('lx-bgo').onclick=async()=>{const p=parseInt($('lx-bp').value,10);if(!p){toast('Skriv et antal point');return}
  try{const j=await lapi('bonus',{admin:LX.admin,id:$('lx-bs').value,point:p,note:$('lx-bn').value});toast((p>0?'+':'')+lnum(p)+' point til '+j.mig.navn);const r=$('lx-bgo').getBoundingClientRect();burst(r.left+r.width/2,r.top,60);LX.adm=j;lxAdminPaint();if(LX.me&&LX.me.id===j.mig.id)lxSetMe(j.mig)}catch(e){toast(e.message)}};
 $('lx-are').onclick=async()=>{try{await lxAdmLoad();lxAdminPaint();toast('Opdateret')}catch(e){toast(e.message)}};
 $('lx-aout').onclick=()=>{LX.admin='';LX.adm=null;try{sessionStorage.removeItem('ts.ladm')}catch(e){}lxAdmin()}}
let lxDelArm='',lxDelT=0;
async function lxDel(btn){const id=btn.dataset.del;
 if(lxDelArm!==id){lxDelArm=id;btn.textContent='Tryk igen for at slette';btn.classList.add('arm');clearTimeout(lxDelT);lxDelT=setTimeout(()=>{lxDelArm='';btn.textContent='Slet sælger';btn.classList.remove('arm')},4000);return}
 lxDelArm='';btn.disabled=true;btn.textContent='Sletter…';
 try{const j=await lapi('slet',{admin:LX.admin,id});LX.adm=j;delete LX_F[id];store.set('ts.lfoto',LX_F);if(LX.board)LX.board.liste=LX.board.liste.filter(x=>x.id!==id);lxAdminPaint();toast(j.slettet+' er slettet')}
 catch(e){toast(e.message);btn.disabled=false;btn.textContent='Slet sælger'}}
$('lx-admin').addEventListener('click',async e=>{const dl=e.target.closest('[data-del]');if(dl){lxDel(dl);return}const pc=e.target.closest('[data-pic]');if(pc){lxPicFor=pc.dataset.pic;lxPicIn.click();return}const rp=e.target.closest('[data-rmpic]');if(rp){lxSetPic(rp.dataset.rmpic,'');return}const g=e.target.closest('[data-god],[data-gno]');if(g){const id=g.dataset.god||g.dataset.gno,afvis=!!g.dataset.gno;g.disabled=true;
  try{const j=await lapi('godkend',{admin:LX.admin,id,afvis});const r=g.getBoundingClientRect();if(!afvis){burst(r.left+r.width/2,r.top+r.height/2,90);sky.kick();sfx.whoosh()}
   toast(afvis?'Ordre '+j.ordre.ordrenr+' er afvist':j.ordre.point+' point til '+j.ordre.navn);LX.adm=j;lxAdminPaint();if(LX.me&&LX.me.id===j.ordre.saelger)lxRefreshMe()}catch(err){toast(err.message);g.disabled=false}return}
 const b=e.target.closest('[data-ok],[data-no]');if(!b)return;const kode=b.dataset.ok||b.dataset.no,afvis=!!b.dataset.no;
 b.disabled=true;try{const j=await lapi('indloes',{admin:LX.admin,kode,afvis});LX.adm=j;const r=b.getBoundingClientRect();if(!afvis){burst(r.left+r.width/2,r.top+r.height/2,90);sky.kick();sfx.whoosh()}
  toast(afvis?kode+' er afvist, og pointene er givet tilbage':kode+' er indløst');lxAdminPaint()}catch(err){toast(err.message);b.disabled=false}});


/* ---- fælles prisliste fra Google-arket ---- */
const lxIsAdm=()=>!!LX.admin;
const lxF=v=>+v?String(v).replace('.',','):'';
function lxElRows(){return [['Produkt','Elpris øre/kWh','Transport og afgifter øre/kWh','Tillæg øre/kWh','Abonnement kr./md.','Gælder for (måned)'],...el.map(e=>[e.name,lxF(e.pris),lxF(e.transport),lxF(e.tillaeg),lxF(e.abon),e.month||'']),['Mail-linje',elNote||'','','','','']]}
function lxPlanRows(){return toTSV().split('\n').map(l=>l.split('\t'))}
function lxApplyPrices(P){if(!P)return false;let ch=false;
 if(P.plan&&P.plan.length>1){const r=parse(P.plan.map(x=>x.join('\t')).join('\n'));
  if(r.kind==='plans'&&r.list.length){const ids=new Map([...DEFAULT_PLANS,...plans].map(p=>[p.name.toLowerCase(),p.id]));r.list.forEach(p=>{const id=ids.get(p.name.toLowerCase());if(id)p.id=id});
   if(JSON.stringify(r.list)!==JSON.stringify(plans)){const keep=new Set(r.list.map(p=>p.id));plans=r.list;S.lines=S.lines.filter(l=>keep.has(l.pid));ch=true}}}
 if(P.el&&P.el.length>1){const r=parse(P.el.map(x=>x.join('\t')).join('\n'));
  if(r.kind==='el'&&r.list.length){const n=el.map(x=>{const y=r.list.find(z=>z.id===x.id);return y?{...x,...y}:x});if(JSON.stringify(n)!==JSON.stringify(el)){el=n;ch=true}}
  const ml=P.el.find(x=>String(x[0]).toLowerCase()==='mail-linje');const nn=ml?String(ml[1]||''):'';if(nn!==elNote){elNote=nn;ch=true}}
 LX.central=!!((P.plan&&P.plan.length>1)||(P.el&&P.el.length>1));return ch}
function lxPriceBar(){const b=$('cp-bar'),d=$('drawer');if(!LX.api){b.hidden=true;d.classList.remove('cp-lock');return}
 const adm=lxIsAdm(),at=store.get('ts.centralAt',0),t=at?new Date(at).toLocaleString('da-DK',{day:'numeric',month:'short',hour:'2-digit',minute:'2-digit'}):'';
 b.hidden=false;d.classList.toggle('cp-lock',!adm);$('imp-sec').hidden=!adm;
 b.innerHTML=adm?`<span class="ic">⚓</span><span class="tx"><b>${LX.central?'Du styrer priserne for alle':'Arket har ingen priser endnu'}</b>${LX.central?'Ret priserne her eller i Google-arket. Ændringer her gælder først for alle, når du trykker Gem for alle.':'Tryk Gem for alle for at lægge de nuværende priser ind i Google-arket.'}</span><span class="row"><button class="primary" type="button" id="cp-save">Gem for alle</button>${LX.central?'<button class="ghost" type="button" id="cp-load">Hent fra arket</button>':''}</span>`
  :`<span class="ic">🔒</span><span class="tx"><b>Priserne er ens for alle</b>De styres centralt af Tunahan og hentes automatisk${t?'. Senest hentet '+t:''}.</span>`;
 const sv=$('cp-save');if(sv)sv.onclick=async()=>{sv.disabled=true;sv.textContent='Gemmer…';
  try{const j=await lapi('gempriser',{admin:LX.admin,plan:lxPlanRows(),el:lxElRows()});store.set('ts.central',{plan:j.plan,el:j.el});store.set('ts.centralAt',Date.now());LX.central=true;lxPriceBar();const r=$('cp-bar').getBoundingClientRect();burst(r.left+r.width-80,r.top+r.height/2,70);sky.kick();toast('Priserne er gemt for alle')}
  catch(e){toast(e.message==='OFFLINE'?'Luffy-serveren er ikke koblet på':e.message);sv.disabled=false;sv.textContent='Gem for alle'}};
 const ld=$('cp-load');if(ld)ld.onclick=async()=>{ld.disabled=true;try{const j=await lapi('priser');store.set('ts.central',{plan:j.plan,el:j.el});store.set('ts.centralAt',Date.now());lxApplyPrices(j);renderPrices();render();lxPriceBar();toast('Priserne er hentet fra arket')}catch(e){toast(e.message);ld.disabled=false}}}
$('btn-prices').addEventListener('click',lxPriceBar);
if(LX.api){if(!lxIsAdm()){plans=clone(DEFAULT_PLANS);el=DEFAULT_EL.map(d=>clone(d));elNote=DEFAULT_EL_NOTE}lxApplyPrices(store.get('ts.central',null));render()}

/* ---- start ---- */
lxPaintNav();lxRoute();if(LX.api)setTimeout(lxSync,view()?0:200)
/* små rettelser kan lægges i patch.js uden at røre denne fil */
if(location.protocol.startsWith('http'))document.head.appendChild(Object.assign(document.createElement('script'),{src:'patch.js?v='+Math.floor(Date.now()/6e4)}))
