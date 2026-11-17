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
