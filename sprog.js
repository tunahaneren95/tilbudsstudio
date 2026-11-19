/* 🇬🇧 Mailen på engelsk. Indlæses af extra.js. */
let SPROG=(()=>{try{return localStorage.getItem('ts.sprog')==='en'?'en':'da'}catch(e){return 'da'}})();
document.head.insertAdjacentHTML('beforeend',`<style>
#sprog button{display:inline-flex;align-items:center;gap:7px}
#sprog .fl{width:18px;height:12px;border-radius:2px;flex:none;box-shadow:0 0 0 1px rgba(255,255,255,.15)}
</style>`);
(function(){
 const FLAG={da:'<svg class="fl" viewBox="0 0 37 28"><rect width="37" height="28" fill="#C8102E"/><rect x="12" width="4" height="28" fill="#fff"/><rect y="12" width="37" height="4" fill="#fff"/></svg>',
  en:'<svg class="fl" viewBox="0 0 60 30"><clipPath id="ukc"><path d="M0 0v30h60V0z"/></clipPath><g clip-path="url(#ukc)"><path d="M0 0v30h60V0z" fill="#012169"/><path d="M0 0l60 30m0-30L0 30" stroke="#fff" stroke-width="6"/><path d="M0 0l60 30m0-30L0 30" stroke="#C8102E" stroke-width="4"/><path d="M30 0v30M0 15h60" stroke="#fff" stroke-width="10"/><path d="M30 0v30M0 15h60" stroke="#C8102E" stroke-width="6"/></g></svg>'};
 const sit=document.getElementById('sit');
 if(sit&&!document.getElementById('sprog')){const box=sit.closest('.f');box.insertAdjacentHTML('afterend',`<div class="f" style="margin-top:16px">Sprog i mailen<div class="seg" id="sprog"><button type="button" data-l="da">${FLAG.da}Dansk</button><button type="button" data-l="en">${FLAG.en}English</button></div></div>`)}
 const marker=()=>document.querySelectorAll('#sprog button').forEach(b=>b.setAttribute('aria-pressed',b.dataset.l===SPROG));
 document.addEventListener('click',e=>{const b=e.target.closest('#sprog button');if(!b)return;SPROG=b.dataset.l;try{localStorage.setItem('ts.sprog',SPROG)}catch(x){}marker();try{renderMail()}catch(x){}});
 marker();
 const en=()=>SPROG==='en';
 const MD={januar:'January',februar:'February',marts:'March',april:'April',maj:'May',juni:'June',juli:'July',august:'August',september:'September',oktober:'October',november:'November',december:'December'};
 const W={mobil:'mobile','internet':'internet','mobilt bredbånd':'mobile broadband',omstilling:'switchboard',el:'electricity',telefoner:'phones'};
 const whatEN=()=>{const d=what().split(/, | og /);const w=d.map(x=>W[x]||x);return w.length>1?w.slice(0,-1).join(', ')+' and '+w[w.length-1]:w[0]};
 const antal=()=>{try{return active().filter(({p})=>!erTill(p.name)).reduce((n,{it})=>n+(+it.ny||0)+(+it.forl||0),0)}catch(e){return 1}};
 const INTRO_EN={
  samtale:()=>'Thank you for a good conversation. As promised, here is the offer for your new solution.',
  forl:()=>`Thank you for a good conversation. As promised, here is the offer to extend ${antal()>1?'your subscriptions':'your subscription'}.`,
  kold:c=>`I am writing to you because I believe ${c||'your company'} can get a better deal on ${whatEN()} than you have today. I have therefore put together a concrete offer for you, so you can see right away what it would cost.`};
 const NAVN=[[/^Mobilt Bredbånd/,'Mobile Broadband'],[/^Mobilt internet 5G fri data/,'5G mobile internet, unlimited data'],[/Svargruppe/,'Hunt Group'],[/Menuomstilling/,'Menu Switchboard'],[/Ekstranummer/,'Extra Number'],[/Fastnetnummer/,'Landline Number'],[/Touchpoint Bruger/,'Touchpoint User'],
  [/^Ekstra Data kort \(datadeling\)/,'Extra Data SIM (data sharing)'],[/^Fri tale fra Danmark til EU/,'Unlimited calls from Denmark to the EU'],[/\((\d+) GB data og (\d+) timers tale uden for EU\)/,'($1 GB data and $2 hours of calls outside the EU)'],
  [/ – inkl\. fri tale\/sms og (\d+) GB data i EU/,' – incl. unlimited calls/texts and $1 GB data in the EU'],[/ – inkl\. fri tale\/sms/,' – incl. unlimited calls/texts']];
 const PRIS=[[/Gratis de første 6 måneder – herefter /,'Free for the first 6 months – then '],[/ pr\. stk\./g,' each'],[/ – ingen binding/,' – no commitment'],[/ i (\d+) måneder – herefter /,' for $1 months – then '],
  [/ ved (\d+) måneders binding/,' with a $1-month commitment'],[/ – minimum (\d+) måneder/,' – minimum $1 months'],[/ – minimum (\d+) dage/,' – minimum $1 days'],[/ i (\d+) måneder/,' for $1 months'],[/ \(engangsbeløb\)/,' (one-off payment)'],
  [/Fast elpris i ([a-zæøå]+)/,(a,m)=>'Fixed electricity price in '+(MD[m]||m)],[/Elpris efter markedet/,'Market-based electricity price'],[/\(indkøbspris \+ /,'(purchase price + '],[/, lige nu fra /,', currently from '],[/ \+ transport og afgifter /,' + transport and taxes '],[/ · abonnement /,' · subscription '],[/ · uden binding/,' · no commitment'],
  [/^Efter 6 måneder: (.*) \(når Touchpoint ikke længere er gratis\)/,'After 6 months: $1 (when Touchpoint is no longer free)'],[/^Efter (\d+) måneder: /,'After $1 months: '],[/^Når kampagneperioderne udløber: /,'When the campaign periods end: ']];
 const tr=(t,R)=>R.reduce((x,[a,b])=>x.replace(a,b),String(t||''));
 const LBL={'NYE ABONNEMENTER':'NEW SUBSCRIPTIONS','FORLÆNGELSER':'EXTENSIONS','TILLÆG':'ADD-ONS'};
 const mo=model;model=function(){const m=mo.apply(this,arguments);if(!en())return m;
  const first=S.contact.trim().split(/\s+/)[0];
  m.greet=first?'Hi '+first:'Hi';
  m.intro=(INTRO_EN[S.situation]||INTRO_EN.samtale)(S.company.trim());
  m.groups.forEach(g=>{g.label=LBL[g.label]||g.label;g.lines.forEach(l=>{l.name=tr(l.name,NAVN);l.price=tr(l.price,PRIS)})});
  m.after=m.after.map(a=>tr(a,PRIS));
  m.els=m.els.map(l=>Object.assign({},l,{price:tr(l.price,PRIS)}));
  m.tel=m.tel.map(l=>Object.assign({},l,{price:tr(l.price,PRIS)}));
  if(m.phones)m.phones='You can of course still buy phones and accessories at a discount, even if you enter a commitment period – it does not affect your options there.';
  m.close='If this looks good, simply reply to this email and I will get everything started.';
  m.contact='If you have any questions in the meantime, you are always welcome to contact me or our customer service on +45 80 40 40 30.';
  return m};
 /* beløb: "1.234,50 kr./md." -> "DKK 1,234.50/month" */
 const penge=t=>t.replace(/(\d{1,3}(?:\.\d{3})*)(?:,(\d{1,2})|,-)\s*kr\.(\/md\.)?/g,(x,a,d,md)=>'DKK '+a.replace(/\./g,',')+(d?'.'+d:'')+(md?'/month':'')).replace(/(\d+),(\d+) øre/g,'$1.$2 øre');
 const FAST=[[/Samlet pris pr\. md\./g,'Total per month'],[/>El</g,'>Electricity<'],[/>Telefoner</g,'>Phones<'],[/^Telefoner:$/m,'Phones:'],[/Alle priser er ekskl\. moms\./g,'All prices exclude VAT.'],[/ – i alt /g,' – total ']];
 const hh=html;html=function(){const h=hh.apply(this,arguments);return en()?penge(tr(h,FAST)):h};
 const tx=text;text=function(){const t=tx.apply(this,arguments);return en()?penge(tr(t,FAST)):t};
 const sj=subject;subject=function(){if(!en())return sj.apply(this,arguments);const c=S.company.trim();return `Offer for ${whatEN()}${c?' for '+c:''} | Norlys Erhverv`};
 try{renderMail()}catch(e){}
})();

