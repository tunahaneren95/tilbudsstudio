/* 📅 Kalender: dine aftaler, kun gemt på din egen pc (localStorage). Intet sendes til serveren. */
(function(){
const DAGE=['Man','Tir','Ons','Tor','Fre','Lør','Søn'];
const DAGE_L=['søndag','mandag','tirsdag','onsdag','torsdag','fredag','lørdag'];
const MDR=['januar','februar','marts','april','maj','juni','juli','august','september','oktober','november','december'];
const TYPER={samtale:{n:'Samtale',c:'#FF3B44'},opfolg:{n:'Opfølgning',c:'#FFB347'},opkald:{n:'Opkald',c:'#4FD1C5'},intern:{n:'Internt',c:'#A78BFA'},andet:{n:'Andet',c:'#B3A4A6'}};
const e=s=>String(s==null?'':s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pad=n=>String(n).padStart(2,'0');
const iso=d=>d.getFullYear()+'-'+pad(d.getMonth()+1)+'-'+pad(d.getDate());
const fraIso=s=>{const[a,b,c]=s.split('-').map(Number);return new Date(a,b-1,c)};
const idag=()=>iso(new Date());
const tid=a=>a.t?fraIso(a.d).setHours(+a.t.slice(0,2),+a.t.slice(3,5)):+fraIso(a.d);

/* hver sælger har sin egen kalender på pc'en */
const bruger=()=>{try{if(LX&&LX.me)return String(LX.me.id||LX.me.navn)}catch(x){}return 'gaest'};
const NK=()=>'ts.kal.'+bruger();
function hent(){try{const v=JSON.parse(localStorage.getItem(NK())||'[]');return Array.isArray(v)?v:[]}catch(x){return[]}}
function gem(l){try{localStorage.setItem(NK(),JSON.stringify(l))}catch(x){toast('Kunne ikke gemme. Er browserens lager fyldt?')}}
const sorter=l=>l.sort((a,b)=>(a.d+(a.t||'00:00')).localeCompare(b.d+(b.t||'00:00')));
const paaDag=(l,d)=>sorter(l.filter(a=>a.d===d));
const nyId=()=>Date.now().toString(36)+Math.random().toString(36).slice(2,7);

const K={sel:idag(),mdr:(()=>{const d=new Date();return new Date(d.getFullYear(),d.getMonth(),1)})()};

/* ---------- styles ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.kl-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(0,1fr);gap:28px 48px;align-items:end;padding-block:30px 34px}
.kl-hero h1 em{background:linear-gradient(100deg,#FF3B44,#FFB347 60%,#FF3B44);-webkit-background-clip:text;background-clip:text;color:transparent;font-style:normal}
.kl-lock{display:inline-flex;align-items:center;gap:8px;margin-top:14px;padding:8px 14px;border-radius:999px;background:rgba(79,209,197,.08);border:1px solid rgba(79,209,197,.28);color:#9FF0E6;font-size:12.5px;font-weight:600}
.kl-lock svg{width:14px;height:14px}
.kl-next{position:relative;overflow:hidden;border-radius:30px;padding:26px 28px;background:radial-gradient(120% 140% at 100% 0%,rgba(237,8,18,.42),transparent 55%),linear-gradient(160deg,#2A0A0D,#120809 70%);border:1px solid rgba(255,59,68,.35);box-shadow:0 30px 80px -30px rgba(237,8,18,.55),inset 0 1px 0 rgba(255,255,255,.08)}
.kl-next:after{content:"";position:absolute;inset:-40%;background:conic-gradient(from 0deg,transparent 0 70%,rgba(255,59,68,.25) 80%,transparent 90%);animation:klSpin 9s linear infinite;pointer-events:none}
@keyframes klSpin{to{transform:rotate(1turn)}}
.kl-next>*{position:relative;z-index:1}
.kl-next small{font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--red-hi);font-weight:800}
.kl-cd{font-family:var(--display);font-size:clamp(34px,5vw,56px);font-weight:700;letter-spacing:-.04em;line-height:1;margin:12px 0 10px}
.kl-cd i{font-style:normal;color:var(--muted);font-size:.45em;letter-spacing:0;margin-left:6px}
.kl-next h3{margin:0;font-size:19px;font-weight:700}
.kl-next p{margin:6px 0 0;color:var(--muted);font-size:14px}
.kl-stats{display:flex;gap:10px;margin-top:18px;flex-wrap:wrap}
.kl-stats span{padding:8px 14px;border-radius:999px;background:rgba(255,255,255,.06);border:1px solid var(--edge);font-size:12.5px;font-weight:600;color:var(--muted)}
.kl-stats b{color:var(--ink);font-family:var(--display);margin-right:5px}
.kl-main{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(0,1fr);gap:24px;align-items:start}
.kl-card{border-radius:28px;background:linear-gradient(180deg,rgba(255,255,255,.05),rgba(255,255,255,.02));border:1px solid var(--edge);padding:22px;backdrop-filter:blur(12px)}
.kl-mh{display:flex;align-items:center;justify-content:space-between;gap:10px;margin-bottom:16px}
.kl-mh h2{margin:0;font-family:var(--display);font-size:22px;font-weight:600;letter-spacing:-.02em;text-transform:capitalize}
.kl-mh h2 span{color:var(--dim);font-weight:500}
.kl-arr{display:flex;gap:6px}
.kl-arr button{width:38px;height:38px;border-radius:12px;border:1px solid var(--edge);background:rgba(255,255,255,.05);color:var(--ink);font-size:16px;cursor:pointer}
.kl-arr button:hover{border-color:var(--red);background:rgba(237,8,18,.15)}
.kl-arr .kl-td{width:auto;white-space:nowrap;padding:0 14px;font-size:13px;font-weight:700}
.kl-grid{display:grid;grid-template-columns:repeat(7,minmax(0,1fr));gap:6px}
.kl-wd{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);font-weight:700;text-align:center;padding:4px 0 8px}
.kl-d{position:relative;aspect-ratio:1/.92;border-radius:14px;border:1px solid transparent;background:rgba(255,255,255,.03);color:var(--ink);font:inherit;font-size:14px;font-weight:600;cursor:pointer;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:5px;transition:transform .15s,background .15s,border-color .15s}
.kl-d:hover{transform:translateY(-2px);border-color:var(--edge-2);background:rgba(255,255,255,.07)}
.kl-d.ud{opacity:.28}
.kl-d.we{color:var(--muted)}
.kl-d.nu{border-color:rgba(255,59,68,.6);box-shadow:inset 0 0 0 1px rgba(255,59,68,.35),0 0 24px -6px rgba(237,8,18,.6)}
.kl-d.sel{background:linear-gradient(180deg,#FF2A33,var(--red));border-color:transparent;color:#fff;box-shadow:0 14px 30px -12px var(--red-glow)}
.kl-dots{display:flex;gap:3px;height:6px}
.kl-dots i{width:6px;height:6px;border-radius:50%}
.kl-d.sel .kl-dots i{background:#fff!important}
.kl-dh{display:flex;align-items:flex-end;justify-content:space-between;gap:12px;margin-bottom:16px}
.kl-dh h2{margin:0;font-family:var(--display);font-size:24px;font-weight:600;letter-spacing:-.02em}
.kl-dh h2 em{display:block;font-style:normal;font-family:var(--f);font-size:12px;letter-spacing:.18em;text-transform:uppercase;color:var(--red-hi);font-weight:800;margin-bottom:6px}
.kl-list{display:grid;gap:10px}
.kl-it{position:relative;display:grid;grid-template-columns:62px minmax(0,1fr) auto;gap:14px;align-items:start;padding:14px 14px 14px 18px;border-radius:18px;background:rgba(0,0,0,.25);border:1px solid var(--edge);overflow:hidden;cursor:pointer;transition:border-color .15s,transform .15s}
.kl-it:hover{border-color:var(--edge-2);transform:translateX(3px)}
.kl-it:before{content:"";position:absolute;left:0;top:0;bottom:0;width:4px;background:var(--c)}
.kl-it.done{opacity:.5}
.kl-it.done h4{text-decoration:line-through}
.kl-it.live{border-color:rgba(255,59,68,.6);background:linear-gradient(90deg,rgba(237,8,18,.18),rgba(0,0,0,.25) 60%)}
.kl-t{font-family:var(--display);font-size:15px;font-weight:700;letter-spacing:-.02em}
.kl-t small{display:block;font-family:var(--f);font-size:11.5px;color:var(--dim);font-weight:600;margin-top:2px}
.kl-it h4{margin:0;font-size:15px;font-weight:700;overflow-wrap:anywhere}
.kl-it p{margin:4px 0 0;font-size:13px;color:var(--muted);overflow-wrap:anywhere;white-space:pre-wrap}
.kl-tag{display:inline-block;margin-top:8px;padding:3px 9px;border-radius:999px;font-size:11px;font-weight:700;color:var(--c);background:color-mix(in srgb,var(--c) 14%,transparent);border:1px solid color-mix(in srgb,var(--c) 35%,transparent)}
.kl-chk{width:30px;height:30px;border-radius:10px;border:1px solid var(--edge-2);background:transparent;color:var(--ink);cursor:pointer;font-size:14px}
.kl-it.done .kl-chk{background:#2ECC71;border-color:#2ECC71;color:#06210f}
.kl-empty{text-align:center;padding:38px 16px;border:1px dashed var(--edge-2);border-radius:20px;color:var(--muted)}
.kl-empty b{display:block;font-family:var(--display);font-size:17px;color:var(--ink);margin-bottom:6px}
.kl-tools{display:flex;gap:8px;flex-wrap:wrap;margin-top:16px;padding-top:16px;border-top:1px solid var(--edge)}
.kl-tools .pill{font-size:12.5px}
.kl-up{margin-top:24px}
.kl-up h2{font-family:var(--display);font-size:20px;font-weight:600;margin:0 0 14px;letter-spacing:-.02em}
.kl-row{display:grid;grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:12px}
.kl-mini{padding:16px;border-radius:20px;border:1px solid var(--edge);background:rgba(255,255,255,.03);cursor:pointer;transition:transform .15s,border-color .15s;position:relative;overflow:hidden}
.kl-mini:hover{transform:translateY(-3px);border-color:var(--c)}
.kl-mini:before{content:"";position:absolute;inset:0 0 auto;height:3px;background:var(--c)}
.kl-mini small{font-size:11px;letter-spacing:.14em;text-transform:uppercase;color:var(--dim);font-weight:700}
.kl-mini h4{margin:6px 0 2px;font-size:15px}
.kl-mini p{margin:0;font-size:13px;color:var(--muted)}
/* formular + pop-up */
.kl-ov{position:fixed;inset:0;z-index:9000;display:grid;place-items:center;padding:16px;background:rgba(8,2,3,.72);backdrop-filter:blur(10px);animation:klFade .25s ease}
.kl-ov.out{animation:klFade .25s ease reverse forwards}
@keyframes klFade{from{opacity:0}}
.kl-box{position:relative;width:min(520px,100%);max-height:calc(100vh - 32px);overflow:auto;border-radius:30px;padding:28px;background:radial-gradient(120% 80% at 100% 0%,rgba(237,8,18,.25),transparent 60%),linear-gradient(180deg,#1C0B0D,#0E0607);border:1px solid rgba(255,59,68,.3);box-shadow:0 40px 120px -30px rgba(237,8,18,.6);animation:klPop .45s cubic-bezier(.2,1.3,.4,1)}
@keyframes klPop{from{transform:translateY(24px) scale(.94);opacity:0}}
.kl-box h2{margin:0 0 6px;font-family:var(--display);font-size:26px;font-weight:700;letter-spacing:-.03em;line-height:1.05}
.kl-box h2 em{font-style:normal;color:var(--red-hi)}
.kl-box>p{margin:0 0 18px;color:var(--muted);font-size:14px}
.kl-x{position:absolute;top:16px;right:16px;width:36px;height:36px;border-radius:12px;border:1px solid var(--edge);background:rgba(255,255,255,.05);color:var(--ink);cursor:pointer;font-size:16px}
.kl-f{display:grid;gap:12px}
.kl-f2{display:grid;grid-template-columns:1.3fr 1fr 1fr;gap:10px}
.kl-f .f select,.kl-f .f textarea{background:rgba(0,0,0,.25);border:1px solid var(--edge);border-radius:12px;padding:13px 14px;font:inherit;font-size:15px;color:var(--ink);width:100%;min-width:0}
.kl-f .f textarea{min-height:84px;resize:vertical}
.kl-f .f select:focus,.kl-f .f textarea:focus{border-color:var(--red);outline:none;box-shadow:0 0 0 4px rgba(237,8,18,.18)}
.kl-f .f input[type=date],.kl-f .f input[type=time]{color-scheme:dark}
.kl-types{display:flex;gap:6px;flex-wrap:wrap}
.kl-types button{padding:8px 12px;border-radius:999px;border:1px solid var(--edge);background:rgba(255,255,255,.04);color:var(--muted);font:inherit;font-size:12.5px;font-weight:700;cursor:pointer}
.kl-types button.on{color:#fff;background:var(--c);border-color:var(--c);box-shadow:0 8px 22px -10px var(--c)}
.kl-btns{display:flex;gap:10px;margin-top:6px}
.kl-btns .primary{flex:1}
.kl-del{background:none;border:1px solid rgba(255,59,68,.4);color:var(--red-hi);border-radius:14px;padding:0 16px;font-weight:700;cursor:pointer}
.kl-pop .kl-big{font-family:var(--display);font-size:64px;font-weight:800;line-height:.9;letter-spacing:-.05em;background:linear-gradient(180deg,#fff,#FF3B44);-webkit-background-clip:text;background-clip:text;color:transparent}
.kl-pop .kl-list{margin:18px 0}
.kl-pop .kl-it{cursor:default}
.kl-ping{position:fixed;right:20px;bottom:20px;z-index:8999;width:min(360px,calc(100vw - 32px));padding:18px 18px 18px 22px;border-radius:22px;background:linear-gradient(160deg,#2A0A0D,#120809);border:1px solid rgba(255,59,68,.5);box-shadow:0 30px 70px -20px rgba(237,8,18,.6);animation:klPing .6s cubic-bezier(.2,1.4,.4,1)}
@keyframes klPing{from{transform:translateY(120%) rotate(4deg)}}
.kl-ping small{font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:var(--red-hi);font-weight:800}
.kl-ping h4{margin:6px 0 2px;font-size:16px}
.kl-ping p{margin:0;color:var(--muted);font-size:13px}
.kl-ping button{position:absolute;top:10px;right:10px;background:none;border:0;color:var(--muted);font-size:16px;cursor:pointer}
@media (max-width:900px){.kl-hero,.kl-main{grid-template-columns:1fr}}
@media (max-width:520px){.kl-f2{grid-template-columns:1fr 1fr}.kl-f2 .f:first-child{grid-column:1/-1}.kl-card{padding:16px}.kl-d{font-size:13px;border-radius:10px}.kl-it{grid-template-columns:52px minmax(0,1fr) auto;gap:10px}}
@media (prefers-reduced-motion:reduce){.kl-next:after,.kl-box,.kl-ping{animation:none}}
</style>`);

/* ---------- menu-knap + side ---------- */
const IKON='<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="5" width="18" height="16" rx="3"/><path d="M3 10h18M8 3v4M16 3v4"/></svg>';
function byg(){
 if(document.getElementById('v-kal'))return;
 const shop=document.getElementById('nav-shop');
 if(shop){const a=document.createElement('a');a.className='pill lx-nav';a.id='nav-kal';a.href='#kal';a.title='Kalender';a.innerHTML=IKON+'<span class="lx-t">Kalender</span>';shop.parentNode.insertBefore(a,shop)}
 const s=document.createElement('section');s.className='view gut';s.id='v-kal';s.dataset.view='kal';s.hidden=true;
 const ref=document.getElementById('v-admin')||document.querySelector('.view:last-of-type');
 if(ref)ref.after(s);else (document.querySelector('.stage')||document.body).appendChild(s);
}

function naar(a){
 const m=Math.round((tid(a)-Date.now())/6e4);
 if(!a.t){const dd=Math.round((fraIso(a.d)-fraIso(idag()))/864e5);return dd===0?['I dag','hele dagen']:dd===1?['I morgen','']:['Om '+dd,'dage']}
 if(m<=0&&m>-((varighed(a))||30))return['Nu','i gang'];
 if(m<60)return[String(m),'min'];
 if(m<60*24){const h=Math.floor(m/60),r=m%60;return[h+'t'+(r?' '+r:''),r?'min':'']}
 const dd=Math.round((fraIso(a.d)-fraIso(idag()))/864e5);return dd===1?['I morgen',a.t]:['Om '+dd,'dage'];
}
function varighed(a){if(!a.t||!a.s)return 30;const f=x=>+x.slice(0,2)*60+ +x.slice(3,5);return Math.max(5,f(a.s)-f(a.t))}
function naeste(l){const nu=Date.now();return sorter(l.filter(a=>!a.done&&(tid(a)+varighed(a)*6e4>nu||(!a.t&&a.d>=idag()))))[0]}
const typ=a=>TYPER[a.type]||TYPER.andet;
const datoTekst=d=>{const x=fraIso(d);return DAGE_L[x.getDay()]+' '+x.getDate()+'. '+MDR[x.getMonth()]};

function itemHtml(a,lille){
 const T=typ(a),live=a.t&&!a.done&&Date.now()>=tid(a)&&Date.now()<tid(a)+varighed(a)*6e4;
 return `<div class="kl-it${a.done?' done':''}${live?' live':''}" style="--c:${T.c}" data-id="${e(a.id)}">
  <div class="kl-t">${a.t?e(a.t):'Hele<br>dagen'}${a.t&&a.s?`<small>til ${e(a.s)}</small>`:''}</div>
  <div><h4>${e(a.titel)}</h4>${a.kunde?`<p>${e(a.kunde)}</p>`:''}${!lille&&a.note?`<p>${e(a.note)}</p>`:''}<span class="kl-tag">${T.n}</span></div>
  ${lille?'':`<button class="kl-chk" type="button" data-chk title="${a.done?'Markér som ikke klaret':'Markér som klaret'}">✓</button>`}</div>`;
}

function tegn(){
 const s=document.getElementById('v-kal');if(!s)return;
 const l=hent(),nx=naeste(l),d0=idag();
 const ugeSlut=(()=>{const x=new Date();x.setDate(x.getDate()+((7-x.getDay())%7));return iso(x)})();
 const iDag=l.filter(a=>a.d===d0).length,uge=l.filter(a=>a.d>=d0&&a.d<=ugeSlut).length,klar=l.filter(a=>a.d===d0&&a.done).length;
 const navn=(()=>{try{return LX.me?LX.me.navn.split(' ')[0]:''}catch(x){return''}})();
 const nt=nx?naar(nx):null;
 /* måned */
 const m=K.mdr,start=new Date(m.getFullYear(),m.getMonth(),1),off=(start.getDay()+6)%7;
 const tael={};l.forEach(a=>{(tael[a.d]=tael[a.d]||[]).push(typ(a).c)});
 let celler='';
 for(let i=0;i<42;i++){const x=new Date(m.getFullYear(),m.getMonth(),1-off+i),k=iso(x),c=tael[k]||[];
  celler+=`<button type="button" class="kl-d${x.getMonth()!==m.getMonth()?' ud':''}${(i%7)>4?' we':''}${k===d0?' nu':''}${k===K.sel?' sel':''}" data-d="${k}" aria-label="${datoTekst(k)}${c.length?', '+c.length+' aftaler':''}">${x.getDate()}<span class="kl-dots">${c.slice(0,4).map(f=>`<i style="background:${f}"></i>`).join('')}</span></button>`}
 const valgt=paaDag(l,K.sel),selTxt=K.sel===d0?'I dag':datoTekst(K.sel);
 const kommende=sorter(l.filter(a=>a.d>d0&&!a.done)).slice(0,6);
 s.innerHTML=`
 <div class="kl-hero">
  <div>
   <a class="lx-back" href="#">← Tilbage til tilbud</a>
   <div class="eyebrow"><span>Kalender</span><em>✦ ${e(DAGE_L[new Date().getDay()])} ${new Date().getDate()}. ${MDR[new Date().getMonth()]}</em></div>
   <h1>${navn?e(navn)+', din dag':'Din dag'}<br><em>i fuld kontrol.</em></h1>
   <div class="kl-lock"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round"><rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V7a4 4 0 0 1 8 0v4"/></svg>Gemmes kun på din egen pc. Ingen andre kan se dine aftaler eller noter.</div>
   <div class="kl-stats"><span><b>${iDag}</b>i dag</span><span><b>${klar}/${iDag}</b>klaret</span><span><b>${uge}</b>resten af ugen</span></div>
  </div>
  <div class="kl-next">${nx?`<small>Næste aftale</small>
   <div class="kl-cd" id="kl-cd">${e(nt[0])}<i>${e(nt[1])}</i></div>
   <h3>${e(nx.titel)}</h3><p>${e(nx.kunde||typ(nx).n)} · ${nx.d===d0?'i dag':e(datoTekst(nx.d))}${nx.t?' kl. '+e(nx.t):''}</p>`
   :`<small>Næste aftale</small><div class="kl-cd">Frit<i>slag</i></div><h3>Ingen kommende aftaler</h3><p>Læg din første ind, så holder siden styr på dagen for dig.</p>`}
  </div>
 </div>
 <div class="kl-main">
  <div class="kl-card">
   <div class="kl-mh"><h2>${MDR[m.getMonth()]} <span>${m.getFullYear()}</span></h2>
    <div class="kl-arr"><button type="button" data-m="-1" aria-label="Forrige måned">‹</button><button type="button" class="kl-td" data-m="0">I dag</button><button type="button" data-m="1" aria-label="Næste måned">›</button></div></div>
   <div class="kl-grid">${DAGE.map(x=>`<div class="kl-wd">${x}</div>`).join('')}${celler}</div>
   <div class="kl-tools">
    <button class="pill" type="button" id="kl-imp">Hent fra Outlook (.ics)</button>
    <button class="pill" type="button" id="kl-ryd">Ryd gamle aftaler</button>
    <input type="file" id="kl-fil" accept=".ics,text/calendar" hidden>
   </div>
  </div>
  <div class="kl-card">
   <div class="kl-dh"><h2><em>${valgt.length} ${valgt.length===1?'aftale':'aftaler'}</em>${e(selTxt.charAt(0).toUpperCase()+selTxt.slice(1))}</h2>
    <button class="primary" type="button" id="kl-ny">+ Ny aftale</button></div>
   <div class="kl-list">${valgt.length?valgt.map(a=>itemHtml(a)).join(''):`<div class="kl-empty"><b>Tom dag</b>Tryk "+ Ny aftale" for at lægge noget ind.</div>`}</div>
  </div>
 </div>
 ${kommende.length?`<div class="kl-up"><h2>Kommende</h2><div class="kl-row">${kommende.map(a=>`<div class="kl-mini" style="--c:${typ(a).c}" data-go="${e(a.d)}"><small>${e(datoTekst(a.d))}${a.t?' · '+e(a.t):''}</small><h4>${e(a.titel)}</h4><p>${e(a.kunde||typ(a).n)}</p></div>`).join('')}</div></div>`:''}`;

 s.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{K.sel=b.dataset.d;tegn()});
 s.querySelectorAll('[data-m]').forEach(b=>b.onclick=()=>{const v=+b.dataset.m;if(!v){const n=new Date();K.mdr=new Date(n.getFullYear(),n.getMonth(),1);K.sel=idag()}else K.mdr=new Date(K.mdr.getFullYear(),K.mdr.getMonth()+v,1);tegn()});
 s.querySelectorAll('[data-go]').forEach(b=>b.onclick=()=>{K.sel=b.dataset.go;const x=fraIso(K.sel);K.mdr=new Date(x.getFullYear(),x.getMonth(),1);tegn();scrollTo({top:0,behavior:'smooth'})});
 s.querySelectorAll('.kl-list .kl-it').forEach(r=>r.onclick=ev=>{const id=r.dataset.id;
  if(ev.target.closest('[data-chk]')){const l2=hent(),a=l2.find(x=>x.id===id);if(a){a.done=!a.done;gem(l2);if(a.done){const q=ev.target.getBoundingClientRect();try{burst(q.left+q.width/2,q.top+q.height/2,40)}catch(x){}}tegn()}return}
  formular(hent().find(x=>x.id===id))});
 s.querySelector('#kl-ny').onclick=()=>formular(null);
 const fil=s.querySelector('#kl-fil');s.querySelector('#kl-imp').onclick=()=>fil.click();fil.onchange=()=>{if(fil.files[0])importer(fil.files[0]);fil.value=''};
 s.querySelector('#kl-ryd').onclick=()=>{const gr=new Date();gr.setDate(gr.getDate()-30);const g=iso(gr),l2=hent(),n=l2.filter(a=>a.d>=g);const fj=l2.length-n.length;
  if(!fj){toast('Ingen aftaler ældre end 30 dage');return}gem(n);tegn();toast(fj+' gamle aftaler fjernet')};
}

/* ---------- ny / redigér ---------- */
function luk(ov){ov.classList.add('out');setTimeout(()=>ov.remove(),240);document.removeEventListener('keydown',ov._esc)}
function overlay(html,cls){const ov=document.createElement('div');ov.className='kl-ov';ov.innerHTML=`<div class="kl-box ${cls||''}" role="dialog" aria-modal="true">${html}<button class="kl-x" type="button" aria-label="Luk">✕</button></div>`;
 document.body.appendChild(ov);ov.onclick=ev=>{if(ev.target===ov)luk(ov)};ov.querySelector('.kl-x').onclick=()=>luk(ov);
 ov._esc=ev=>{if(ev.key==='Escape')luk(ov)};document.addEventListener('keydown',ov._esc);return ov}

function formular(a){
 const ny=!a;a=a||{d:K.sel,t:'',s:'',titel:'',kunde:'',type:'samtale',note:''};
 const ov=overlay(`<h2>${ny?'Ny <em>aftale</em>':'Redigér <em>aftale</em>'}</h2><p>Kun du kan se det her. Det bliver på denne pc.</p>
 <div class="kl-f">
  <label class="f">Hvad skal der ske?<input id="kf-ti" maxlength="80" placeholder="Fx Samtale om mobilaftale" value="${e(a.titel)}"></label>
  <label class="f">Kunde / virksomhed<input id="kf-ku" maxlength="80" placeholder="Fx Hansen ApS" value="${e(a.kunde)}"></label>
  <div class="kl-f2">
   <label class="f">Dato<input id="kf-d" type="date" value="${e(a.d)}"></label>
   <label class="f">Fra<input id="kf-t" type="time" value="${e(a.t)}"></label>
   <label class="f">Til<input id="kf-s" type="time" value="${e(a.s)}"></label>
  </div>
  <div class="f">Type<div class="kl-types">${Object.entries(TYPER).map(([k,v])=>`<button type="button" data-ty="${k}" style="--c:${v.c}" class="${a.type===k?'on':''}">${v.n}</button>`).join('')}</div></div>
  <label class="f">Noter<textarea id="kf-no" maxlength="2000" placeholder="Hvad skal du huske? Beslutningstager, nuværende udbyder, tilbud sendt…">${e(a.note)}</textarea></label>
  <p class="g-err" id="kf-e" style="color:var(--red-hi);font-size:13px;margin:0;min-height:0"></p>
  <div class="kl-btns"><button class="primary" type="button" id="kf-ok">${ny?'Læg i kalenderen':'Gem ændringer'}</button>${ny?'':'<button class="kl-del" type="button" id="kf-del">Slet</button>'}</div>
 </div>`);
 let type=a.type||'samtale';
 ov.querySelectorAll('[data-ty]').forEach(b=>b.onclick=()=>{type=b.dataset.ty;ov.querySelectorAll('[data-ty]').forEach(x=>x.classList.toggle('on',x===b))});
 const $$=id=>ov.querySelector('#'+id);
 const ok=()=>{const ti=$$('kf-ti').value.trim(),d=$$('kf-d').value,t=$$('kf-t').value,s=$$('kf-s').value;
  if(!ti){$$('kf-e').textContent='Giv aftalen en titel';$$('kf-ti').focus();return}
  if(!/^\d{4}-\d{2}-\d{2}$/.test(d)){$$('kf-e').textContent='Vælg en dato';return}
  if(t&&s&&s<=t){$$('kf-e').textContent='Sluttid skal ligge efter starttid';return}
  const l=hent(),o={id:a.id||nyId(),d,t,s:t?s:'',titel:ti,kunde:$$('kf-ku').value.trim(),type,note:$$('kf-no').value.trim(),done:!!a.done};
  const i=l.findIndex(x=>x.id===o.id);if(i>=0)l[i]=o;else l.push(o);gem(l);
  K.sel=d;const x=fraIso(d);K.mdr=new Date(x.getFullYear(),x.getMonth(),1);
  const r=$$('kf-ok').getBoundingClientRect();try{burst(r.left+r.width/2,r.top+r.height/2,60)}catch(z){}
  luk(ov);tegn();toast(ny?'Aftalen er lagt ind':'Aftalen er opdateret');pingTjek(false)};
 $$('kf-ok').onclick=ok;
 ov.querySelectorAll('input').forEach(i=>i.addEventListener('keydown',ev=>{if(ev.key==='Enter')ok()}));
 if(!ny)$$('kf-del').onclick=()=>{const b=$$('kf-del');if(b.dataset.sure){gem(hent().filter(x=>x.id!==a.id));luk(ov);tegn();toast('Aftalen er slettet')}else{b.dataset.sure=1;b.textContent='Sikker?'}};
 setTimeout(()=>$$('kf-ti').focus(),60);
}

/* ---------- import fra Outlook (.ics) ---------- */
function importer(f){
 if(f.size>3e6){toast('Filen er for stor');return}
 const r=new FileReader();r.onload=()=>{
  const linjer=String(r.result).replace(/\r?\n[ \t]/g,'').split(/\r?\n/);
  const nye=[];let cur=null;
  const dato=v=>{const m=v.match(/^(\d{4})(\d{2})(\d{2})(?:T(\d{2})(\d{2})(\d{2})?(Z)?)?/);if(!m)return null;
   let d=m[4]?new Date(+m[1],m[2]-1,+m[3],+m[4],+m[5]):new Date(+m[1],m[2]-1,+m[3]);
   if(m[7])d=new Date(Date.UTC(+m[1],m[2]-1,+m[3],+m[4],+m[5]));return{d,heldag:!m[4]}};
  const tekst=v=>v.replace(/\\n/gi,'\n').replace(/\\([,;\\])/g,'$1').trim();
  for(const ln of linjer){
   if(ln==='BEGIN:VEVENT'){cur={};continue}
   if(ln==='END:VEVENT'){if(cur&&cur.st){const a=cur.st.d,b=cur.en&&cur.en.d;
     nye.push({id:'ics-'+(cur.uid||nyId()).slice(0,60)+'-'+iso(a),d:iso(a),t:cur.st.heldag?'':pad(a.getHours())+':'+pad(a.getMinutes()),s:(!cur.st.heldag&&b&&iso(b)===iso(a))?pad(b.getHours())+':'+pad(b.getMinutes()):'',
      titel:(cur.sum||'Aftale').slice(0,80),kunde:(cur.loc||'').slice(0,80),type:'samtale',note:(cur.desc||'').slice(0,2000),done:false})}cur=null;continue}
   if(!cur)continue;
   const i=ln.indexOf(':');if(i<0)continue;const k=ln.slice(0,i).split(';')[0].toUpperCase(),v=ln.slice(i+1);
   if(k==='DTSTART')cur.st=dato(v);else if(k==='DTEND')cur.en=dato(v);else if(k==='SUMMARY')cur.sum=tekst(v);else if(k==='LOCATION')cur.loc=tekst(v);else if(k==='DESCRIPTION')cur.desc=tekst(v);else if(k==='UID')cur.uid=v;
  }
  if(!nye.length){toast('Fandt ingen aftaler i filen');return}
  const l=hent(),ids=new Set(l.map(a=>a.id));let n=0;nye.forEach(a=>{if(!ids.has(a.id)){l.push(a);n++}});gem(l);tegn();
  toast(n?n+(n===1?' aftale':' aftaler')+' hentet fra Outlook':'Alle aftaler fandtes allerede');pingTjek(true)};
 r.readAsText(f);
}

/* ---------- lille reminder når man lander på siden (med kryds) ---------- */
document.head.insertAdjacentHTML('beforeend',`<style>
.kl-dock{position:fixed;right:20px;bottom:20px;z-index:8999;width:min(380px,calc(100vw - 32px));max-height:calc(100vh - 40px);overflow:auto;padding:20px 20px 18px;border-radius:24px;background:radial-gradient(120% 90% at 100% 0%,rgba(237,8,18,.3),transparent 60%),linear-gradient(170deg,#24090C,#0F0607);border:1px solid rgba(255,59,68,.45);box-shadow:0 34px 80px -24px rgba(237,8,18,.6),0 0 0 1px rgba(255,255,255,.03) inset;animation:klDock .55s cubic-bezier(.2,1.3,.4,1)}
.kl-dock.out{animation:klDockUd .3s ease forwards}
@keyframes klDock{from{transform:translateY(40px) scale(.95);opacity:0}}
@keyframes klDockUd{to{transform:translateY(30px);opacity:0}}
.kl-dock .kl-luk{position:absolute;top:12px;right:12px;width:34px;height:34px;border-radius:50%;border:1px solid var(--edge-2);background:rgba(255,255,255,.08);color:#fff;font-size:15px;line-height:1;cursor:pointer;display:grid;place-items:center;transition:background .15s,transform .15s}
.kl-dock .kl-luk:hover{background:var(--red);border-color:var(--red);transform:rotate(90deg)}
.kl-dock small.kl-ey{display:block;font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--red-hi);font-weight:800;padding-right:40px}
.kl-dock h3{margin:8px 40px 4px 0;font-family:var(--display);font-size:20px;font-weight:700;letter-spacing:-.03em;line-height:1.15}
.kl-dock h3 em{font-style:normal;color:var(--red-hi)}
.kl-dock>p{margin:0 0 12px;color:var(--muted);font-size:13.5px}
.kl-rl{display:grid;gap:6px;margin:12px 0 14px}
.kl-rl div{display:grid;grid-template-columns:54px minmax(0,1fr);gap:10px;align-items:center;padding:9px 12px;border-radius:14px;background:rgba(0,0,0,.28);border:1px solid var(--edge);border-left:3px solid var(--c)}
.kl-rl div.nx{border-color:rgba(255,59,68,.55);border-left-color:var(--c);background:linear-gradient(90deg,rgba(237,8,18,.16),rgba(0,0,0,.28))}
.kl-rl div.dn{opacity:.45;text-decoration:line-through}
.kl-rl b{font-family:var(--display);font-size:13px}
.kl-rl span{font-size:13.5px;font-weight:600;overflow:hidden;text-overflow:ellipsis;white-space:nowrap}
.kl-rl span i{font-style:normal;color:var(--muted);font-weight:500}
.kl-da{display:flex;gap:8px;flex-wrap:wrap}
.kl-da button{flex:1;min-width:110px;padding:11px 14px;border-radius:14px;font:inherit;font-size:13.5px;font-weight:700;cursor:pointer;border:1px solid var(--edge-2);background:rgba(255,255,255,.05);color:var(--ink)}
.kl-da button.go{background:linear-gradient(180deg,#FF2A33,var(--red));border-color:transparent;color:#fff;box-shadow:0 12px 26px -12px var(--red-glow)}
.kl-chips{display:flex;gap:6px;flex-wrap:wrap;margin:4px 0 12px}
.kl-chips button{padding:9px 13px;border-radius:999px;border:1px solid var(--edge-2);background:rgba(255,255,255,.05);color:var(--ink);font:inherit;font-size:13px;font-weight:700;cursor:pointer;transition:background .15s,border-color .15s,transform .15s}
.kl-chips button:hover{border-color:var(--red);background:rgba(237,8,18,.2);transform:translateY(-1px)}
.kl-chips button small{display:block;font-size:10.5px;color:var(--muted);font-weight:600;letter-spacing:.04em}
.kl-dock input[type=date],.kl-dock input[type=time],.kl-dock textarea{width:100%;min-width:0;background:rgba(0,0,0,.3);border:1px solid var(--edge);border-radius:12px;padding:11px 12px;font:inherit;font-size:14px;color:var(--ink);color-scheme:dark}
.kl-dock textarea{min-height:76px;resize:vertical;margin-bottom:12px}
.kl-dock input:focus,.kl-dock textarea:focus{border-color:var(--red);outline:none;box-shadow:0 0 0 3px rgba(237,8,18,.2)}
.kl-own{display:flex;gap:8px;margin-bottom:12px}
.kl-own button{padding:0 14px;border-radius:12px;border:0;background:var(--red);color:#fff;font:inherit;font-weight:700;cursor:pointer}
.kl-steps{display:flex;gap:4px;margin:12px 0 2px}
.kl-steps i{flex:1;height:3px;border-radius:3px;background:rgba(255,255,255,.12)}
.kl-steps i.on{background:linear-gradient(90deg,#FF3B44,#FFB347)}
.kl-sum{padding:10px 12px;border-radius:12px;background:rgba(0,0,0,.28);border:1px solid var(--edge);font-size:13px;color:var(--muted);margin-bottom:12px}
.kl-sum b{color:var(--ink)}
@media (max-width:520px){.kl-dock{right:12px;left:12px;bottom:12px;width:auto}}
@media (prefers-reduced-motion:reduce){.kl-dock{animation:none}}
</style>`);
function dock(html,cls){
 document.querySelectorAll('.kl-dock,.kl-ping').forEach(x=>x.remove());
 const d=document.createElement('div');d.className='kl-dock '+(cls||'');d.setAttribute('role','dialog');d.setAttribute('aria-label','Kalender');
 d.innerHTML=html+'<button class="kl-luk" type="button" aria-label="Luk" title="Luk">✕</button>';
 document.body.appendChild(d);
 d.luk=()=>{if(!d.isConnected)return;d.classList.add('out');setTimeout(()=>d.remove(),300);document.removeEventListener('keydown',d._esc)};
 d.querySelector('.kl-luk').onclick=d.luk;
 d._esc=ev=>{if(ev.key==='Escape')d.luk()};document.addEventListener('keydown',d._esc);
 return d;
}
function dagensPop(tving){
 const nk='ts.kal.pop.'+bruger();let set='';try{set=sessionStorage.getItem(nk)}catch(x){}
 if(!tving&&set===idag())return;try{sessionStorage.setItem(nk,idag())}catch(x){}
 const alle=hent(),l=paaDag(alle,idag()),aaben=l.filter(a=>!a.done),nx=naeste(alle);
 const t=new Date().getHours(),hils=t<10?'Godmorgen':t<17?'Hej':'Godaften';
 const navn=(()=>{try{return LX.me?' '+LX.me.navn.split(' ')[0]:''}catch(x){return''}})();
 const dato=`${DAGE_L[new Date().getDay()]} ${new Date().getDate()}. ${MDR[new Date().getMonth()]}`;
 let krop;
 if(l.length){
  krop=`<h3>${e(hils+navn)}, du har <em>${aaben.length?aaben.length+(aaben.length===1?' aftale':' aftaler'):'klaret alt'}</em> ${aaben.length?'i dag':'for i dag'}</h3>
  <div class="kl-rl">${l.slice(0,5).map(a=>`<div class="${a.done?'dn':''}${nx&&nx.id===a.id?' nx':''}" style="--c:${typ(a).c}"><b>${a.t?e(a.t):'Hele dagen'}</b><span>${e(a.titel)}${a.kunde?` <i>· ${e(a.kunde)}</i>`:''}</span></div>`).join('')}</div>
  ${l.length>5?`<p>+ ${l.length-5} mere i kalenderen</p>`:''}`;
 }else{
  krop=`<h3>${e(hils+navn)}, <em>ingen aftaler</em> i dag</h3><p>${nx?`Næste: <b style="color:var(--ink)">${e(nx.titel)}</b> ${e(datoTekst(nx.d))}${nx.t?' kl. '+e(nx.t):''}.`:'Kalenderen er tom. Læg din første aftale ind, så husker siden den for dig.'}</p>`;
 }
 const d=dock(`<small class="kl-ey">📅 ${e(dato)}</small>${krop}<div class="kl-da"><button class="go" type="button" data-a="aab">Åbn kalender</button><button type="button" data-a="ny">+ Ny aftale</button></div>`,'kl-rem');
 d.querySelector('[data-a=aab]').onclick=()=>{d.luk();K.sel=idag();location.hash='kal'};
 d.querySelector('[data-a=ny]').onclick=()=>{d.luk();K.sel=idag();formular(null)};
}

/* ---------- efter "Kopiér mail": skal opfølgningen i kalenderen? ---------- */
const arbDag=n=>{const x=new Date();let i=0;while(i<n){x.setDate(x.getDate()+1);if(x.getDay()%6)i++}return x};
const kortDag=x=>DAGE_L[x.getDay()].slice(0,3)+' '+x.getDate()+'/'+(x.getMonth()+1);
let sidsteSpg='';
function tilbudInfo(){
 let firma='',kontakt='',emne='';
 try{firma=(S.company||'').trim();kontakt=(S.contact||'').trim()}catch(x){}
 try{emne=subject()}catch(x){}
 return{firma,kontakt,emne};
}
function spoerg(){
 const T=tilbudInfo(),noegle=T.firma+'|'+T.emne;
 if(noegle===sidsteSpg)return;sidsteSpg=noegle;
 const svar={titel:'Opfølgning på tilbud',kunde:T.firma,d:'',t:'',note:[T.kontakt?'Kontakt: '+T.kontakt:'',T.emne].filter(Boolean).join('\n'),type:'opfolg'};
 const trin=(n)=>`<div class="kl-steps">${[1,2,3].map(i=>`<i class="${i<=n?'on':''}"></i>`).join('')}</div>`;
 const d=dock(`<small class="kl-ey">🎯 Tilbud kopieret</small>
  <h3>Skal jeg sætte en <em>opfølgning</em> i kalenderen${T.firma?' for '+e(T.firma):''}?</h3>
  <p>Så glemmer du ikke at ringe tilbage.</p>
  <div class="kl-da"><button class="go" type="button" data-a="ja">Ja, sæt den ind</button><button type="button" data-a="nej">Nej tak</button></div>`,'kl-ask');
 d.querySelector('[data-a=nej]').onclick=d.luk;
 d.querySelector('[data-a=ja]').onclick=()=>hvornaar();
 const krop=html=>{d.querySelectorAll(':scope>*:not(.kl-luk)').forEach(x=>x.remove());d.insertAdjacentHTML('afterbegin',html)};
 function hvornaar(){
  const valg=[['I morgen',1],['Om 2 dage',2],['Om 3 dage',3],['Om en uge',5]];
  krop(`<small class="kl-ey">Opfølgning${T.firma?' · '+e(T.firma):''}</small>${trin(1)}
   <h3>Hvornår vil du <em>følge op</em>?</h3>
   <div class="kl-chips">${valg.map(([n,v])=>{const x=arbDag(v);return`<button type="button" data-d="${iso(x)}">${n}<small>${kortDag(x)}</small></button>`}).join('')}</div>
   <div class="kl-own"><input type="date" id="kq-d" min="${idag()}"><button type="button" id="kq-dok">Vælg</button></div>`);
  d.querySelectorAll('[data-d]').forEach(b=>b.onclick=()=>{svar.d=b.dataset.d;klok()});
  d.querySelector('#kq-dok').onclick=()=>{const v=d.querySelector('#kq-d').value;if(v){svar.d=v;klok()}else d.querySelector('#kq-d').focus()};
 }
 function klok(){
  krop(`<small class="kl-ey">${e(datoTekst(svar.d))}</small>${trin(2)}
   <h3>Hvad <em>tid</em>?</h3>
   <div class="kl-chips">${['09:00','10:00','11:00','13:00','14:00','15:00'].map(x=>`<button type="button" data-t="${x}">${x}</button>`).join('')}<button type="button" data-t="">Ingen fast tid</button></div>
   <div class="kl-own"><input type="time" id="kq-t"><button type="button" id="kq-tok">Vælg</button></div>`);
  d.querySelectorAll('[data-t]').forEach(b=>b.onclick=()=>{svar.t=b.dataset.t;noter()});
  d.querySelector('#kq-tok').onclick=()=>{const v=d.querySelector('#kq-t').value;if(v){svar.t=v;noter()}else d.querySelector('#kq-t').focus()};
 }
 function noter(){
  krop(`<small class="kl-ey">Næsten færdig</small>${trin(3)}
   <h3>Noget du vil <em>huske</em>?</h3>
   <div class="kl-sum"><b>${e(svar.titel)}</b>${svar.kunde?' · '+e(svar.kunde):''}<br>${e(datoTekst(svar.d))}${svar.t?' kl. '+e(svar.t):', ingen fast tid'}</div>
   <textarea id="kq-n" maxlength="2000" placeholder="Fx beslutningstager, hvad de skal tænke over…">${e(svar.note)}</textarea>
   <div class="kl-da"><button class="go" type="button" data-a="gem">Læg i kalenderen</button></div>`);
  const ta=d.querySelector('#kq-n');setTimeout(()=>{ta.focus();ta.setSelectionRange(ta.value.length,ta.value.length)},50);
  d.querySelector('[data-a=gem]').onclick=()=>{
   svar.note=ta.value.trim();
   const l=hent();l.push({id:nyId(),d:svar.d,t:svar.t,s:'',titel:svar.titel,kunde:svar.kunde,type:svar.type,note:svar.note,done:false});gem(l);
   const r=d.querySelector('[data-a=gem]').getBoundingClientRect();try{burst(r.left+r.width/2,r.top+r.height/2,60)}catch(x){}
   krop(`<small class="kl-ey">✓ Lagt i kalenderen</small><h3>Opfølgning <em>${e(datoTekst(svar.d))}</em>${svar.t?' kl. '+e(svar.t):''}</h3><p>Du får en påmindelse, når dagen kommer.</p>
    <div class="kl-da"><button class="go" type="button" data-a="aab">Se kalenderen</button><button type="button" data-a="ok">Super</button></div>`);
   d.querySelector('[data-a=aab]').onclick=()=>{d.luk();K.sel=svar.d;const x=fraIso(svar.d);K.mdr=new Date(x.getFullYear(),x.getMonth(),1);location.hash='kal'};
   d.querySelector('[data-a=ok]').onclick=d.luk;
   if((location.hash||'')==='#kal')tegn();
   clearTimeout(d._auto);d._auto=setTimeout(d.luk,8000);
  };
 }
}
/* knappen tegnes om løbende, så vi lytter på hele siden */
document.addEventListener('click',ev=>{const b=ev.target.closest&&ev.target.closest('#copy');if(b&&!b.disabled)setTimeout(spoerg,1400)});
/* vent til raket-intro og login er færdige */
function naarKlar(fn){const it=document.getElementById('intro');
 if((it&&!it.hidden)||(typeof introOn!=='undefined'&&introOn)||document.querySelector('.gate')){setTimeout(()=>naarKlar(fn),400);return}
 setTimeout(fn,500)}

/* ---------- påmindelse 10 min før ---------- */
const vist=new Set();
function pingTjek(tavs){
 const nu=Date.now();
 hent().forEach(a=>{if(!a.t||a.done||a.d!==idag())return;const m=(tid(a)-nu)/6e4,k=bruger()+a.id+a.d+a.t;
  if(m<=10&&m>-1&&!vist.has(k)){vist.add(k);if(!tavs)ping(a,Math.max(0,Math.round(m)))}
  else if(m>10)vist.delete(k)});
}
function ping(a,m){
 const d=dock(`<small class="kl-ey">⏰ ${m?'Om '+m+' min':'Nu'}</small><h3>${e(a.titel)}</h3><p>${e(a.kunde||typ(a).n)} · kl. ${e(a.t)}</p><div class="kl-da"><button class="go" type="button" data-a="aab">Åbn kalender</button></div>`,'kl-pg');
 d.setAttribute('role','alert');
 d.querySelector('[data-a=aab]').onclick=()=>{d.luk();K.sel=a.d;location.hash='kal'};
 setTimeout(d.luk,60000);
}

/* ---------- routing ---------- */
function rute(){
 const v=(location.hash||'').replace('#',''),on=v==='kal';
 const n=document.getElementById('nav-kal');if(n)n.classList.toggle('on',on);
 if(!on)return;
 document.body.classList.add('in-view');
 document.querySelectorAll('.view').forEach(s=>s.hidden=s.dataset.view!=='kal');
 tegn();scrollTo({top:0});try{sky.kick()}catch(x){}
}

byg();
const forrige=lxRoute;lxRoute=function(){forrige.apply(this,arguments);rute()};
addEventListener('hashchange',rute);
rute();
/* skift bruger: ny kalender og ny pop-up */
const ud=lxLogout;lxLogout=function(){const r=ud.apply(this,arguments);vist.clear();if((location.hash||'')==='#kal')tegn();return r};
let sidst=bruger();setInterval(()=>{const b=bruger();if(b!==sidst){sidst=b;if((location.hash||'')==='#kal')tegn();naarKlar(dagensPop)}},1500);
naarKlar(()=>{pingTjek(true);dagensPop()});
setInterval(()=>{pingTjek(false);const cd=document.getElementById('kl-cd');if(cd&&(location.hash||'')==='#kal'){const nx=naeste(hent());if(nx){const t=naar(nx);cd.innerHTML=e(t[0])+'<i>'+e(t[1])+'</i>'}}},30000);
})();
