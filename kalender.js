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

/* ---------- pop-up når man lander på siden ---------- */
function dagensPop(){
 const nk='ts.kal.pop.'+bruger();let set='';try{set=sessionStorage.getItem(nk)}catch(x){}
 if(set===idag())return;try{sessionStorage.setItem(nk,idag())}catch(x){}
 const l=paaDag(hent(),idag()),aaben=l.filter(a=>!a.done);
 if(!l.length)return;
 const t=new Date().getHours(),hils=t<10?'Godmorgen':t<17?'Hej':'Godaften';
 const navn=(()=>{try{return LX.me?' '+LX.me.navn.split(' ')[0]:''}catch(x){return''}})();
 const ov=overlay(`<small style="font-size:11px;letter-spacing:.2em;text-transform:uppercase;color:var(--red-hi);font-weight:800">${e(DAGE_L[new Date().getDay()])} ${new Date().getDate()}. ${MDR[new Date().getMonth()]}</small>
  <div style="display:flex;align-items:flex-end;gap:16px;margin:10px 0 4px"><div class="kl-big">${aaben.length}</div><h2>${e(hils+navn)},<br><em>${aaben.length===1?'én aftale':aaben.length?'aftaler':'alt klaret'}</em> ${aaben.length?'i dag':'for i dag'}</h2></div>
  <div class="kl-list">${l.slice(0,6).map(a=>itemHtml(a,true)).join('')}${l.length>6?`<p style="color:var(--muted);font-size:13px;margin:0">+ ${l.length-6} mere</p>`:''}</div>
  <div class="kl-btns"><button class="primary" type="button" id="kp-go">Åbn kalenderen</button><button class="kl-del" type="button" id="kp-ok" style="color:var(--ink);border-color:var(--edge-2)">Forstået</button></div>`,'kl-pop');
 ov.querySelector('#kp-go').onclick=()=>{luk(ov);K.sel=idag();location.hash='kal'};
 ov.querySelector('#kp-ok').onclick=()=>luk(ov);
 try{const r=ov.querySelector('.kl-big').getBoundingClientRect();setTimeout(()=>burst(r.left+r.width/2,r.top+r.height/2,50),350)}catch(x){}
}
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
 document.querySelectorAll('.kl-ping').forEach(x=>x.remove());
 const p=document.createElement('div');p.className='kl-ping';p.setAttribute('role','alert');
 p.innerHTML=`<small>${m?'Om '+m+' min':'Nu'}</small><h4>${e(a.titel)}</h4><p>${e(a.kunde||typ(a).n)} · kl. ${e(a.t)}</p><button type="button" aria-label="Luk">✕</button>`;
 document.body.appendChild(p);p.querySelector('button').onclick=()=>p.remove();p.onclick=ev=>{if(ev.target.tagName!=='BUTTON'){p.remove();K.sel=a.d;location.hash='kal'}};
 setTimeout(()=>p.remove(),60000);
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
