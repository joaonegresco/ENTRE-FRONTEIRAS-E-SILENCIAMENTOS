(()=>{
 const dialog=document.createElement('dialog');dialog.className='filterDialog';
 const title=element('h3');title.id='filterTitle';dialog.setAttribute('aria-labelledby',title.id);
 const close=element('button','×');close.type='button';close.setAttribute('aria-label','Fechar opções');
 const top=element('div');top.className='filterHead';top.append(title,close);
 const search=document.createElement('input');search.type='search';search.placeholder='Buscar…';search.setAttribute('aria-label','Buscar nas opções');
 const list=element('div');list.className='filterOptions';dialog.append(top,search,list);document.body.append(dialog);
 let current,trigger;
 const clean=s=>s.normalize('NFD').replace(/[\u0300-\u036f]/g,'').toLowerCase();
 function refresh(){
   document.querySelectorAll('select').forEach(select=>{
     let button=select.nextElementSibling;
     if(!button?.classList.contains('filterTrigger')){
       const host=select.closest('label'),name=select.labels?.[0]?.firstChild?.textContent?.trim()||'Selecionar';
       button=element('button');button.className='filterTrigger';button.type='button';
       button.setAttribute('aria-haspopup','dialog');button.dataset.caption=name;button.setAttribute('aria-expanded','false');
       select.after(button);select.hidden=true;
       button.onclick=e=>{e.preventDefault();open(select,button)};
       if(host)host.addEventListener('click',e=>{if(e.target===host){e.preventDefault();button.click()}});
     }
     const value=select.selectedOptions[0]?.textContent||'Selecionar';
     if(button.textContent!==value)button.textContent=value;
     button.setAttribute('aria-label',button.dataset.caption+' · '+value);
   });
 }
 function options(){
   list.replaceChildren();
   const query=clean(search.value.trim());
   for(const option of current.options){
     if(query&&!clean(option.textContent).includes(query))continue;
     const b=element('button',option.textContent);b.type='button';
     b.className='filterOption';b.setAttribute('aria-pressed',String(option.selected));
     b.onclick=()=>{
       const target=current;dialog.close();target.value=option.value;
       target.dispatchEvent(new Event('change',{bubbles:true}));refresh();
     };list.append(b);
   }
   if(!list.children.length)list.append(element('p','Nenhum resultado para “'+search.value.trim()+'”.'));
 }
 function position(){
   const rect=trigger.getBoundingClientRect(),vw=document.documentElement.clientWidth,vh=innerHeight;
   const w=Math.min(vw-24,Math.max(286,rect.width));dialog.style.width=w+'px';
   const h=dialog.getBoundingClientRect().height;
   const side=vh-rect.bottom>=h+10?rect.bottom+6:rect.top>=h+10?rect.top-h-6:Math.max(12,(vh-h)/2);
   dialog.style.left=Math.max(12,Math.min(rect.left,vw-w-12))+'px';dialog.style.top=side+'px';
 }
 function open(select,button){
   current=select;trigger=button;title.textContent=button.dataset.caption;search.value='';search.placeholder=select.id==='country'||select.id==='areaPicker'?'Buscar território':select.id==='topic'?'Buscar indicador':'Buscar opção';
   search.hidden=select.options.length<7;options();dialog.showModal();position();
   trigger.setAttribute('aria-expanded','true');
   (search.hidden?list.querySelector('[aria-pressed=true]')||close:search).focus({preventScroll:true});
 }
 close.onclick=()=>dialog.close();dialog.onclose=()=>{trigger?.setAttribute('aria-expanded','false')};
 dialog.onclick=e=>{if(e.target===dialog){const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close()}};
 dialog.onkeydown=e=>{
   if(e.key==='Escape'){
     e.preventDefault();
     e.stopPropagation();
     dialog.close();
     return;
   }
   if(!['ArrowDown','ArrowUp','Home','End'].includes(e.key)||(e.target===search&&['Home','End'].includes(e.key)))return;
   const buttons=[...list.querySelectorAll('button')];if(!buttons.length)return;
   e.preventDefault();const i=buttons.indexOf(document.activeElement);
   buttons[e.key==='Home'?0:e.key==='End'?buttons.length-1:e.key==='ArrowDown'?(i+1)%buttons.length:(i-1+buttons.length)%buttons.length].focus();
 };
 search.oninput=options;addEventListener('resize',()=>{if(dialog.open)position()});
 new MutationObserver(refresh).observe($('results'),{childList:true});
 new MutationObserver(refresh).observe($('dossierTitle'),{childList:true});
 refresh();
})();