(()=>{
 const endpoint='https://data.techforpalestine.org/api/v3/summary.json';
 const labels={gaza:'Faixa de Gaza',west_bank:'Cisjordânia',lebanon:'Líbano'};
 const since={gaza:'07/10/2023',west_bank:'07/10/2023',lebanon:'08/10/2023'};
 const seed={gaza:[74742,176227,'2026-11-22'],west_bank:[1129,12356,'2026-11-22'],lebanon:[8437,29067,'2026-11-05']};
 let data={...seed},place='gaza',inFlight=false,lastAttempt=0;
 const period=300000,cacheKey='atlas-territory-totals-v1';
 function valid(row){return Array.isArray(row)&&row.length===3&&row.slice(0,2).every(n=>Number.isSafeInteger(n)&&n>=0)&&/^\d{4}-\d{2}-\d{2}$/.test(row[2])&&Number.isFinite(Date.parse(row[2]))}
 function merge(candidate){for(const k of Object.keys(labels)){const r=candidate?.[k];if(valid(r)&&r[2]>=data[k][2])data[k]=r}}
 try{merge(JSON.parse(localStorage.getItem(cacheKey)))}catch{}
 function draw(){
   const [d,i,date]=data[place];
   $('boardDeaths').textContent=d.toLocaleString('pt-BR');$('boardInjured').textContent=i.toLocaleString('pt-BR');
   $('boardPeriod').textContent=labels[place]+' · acumulado de '+since[place]+' a '+date.split('-').reverse().join('/');
 }
 document.querySelectorAll('.boardTabs button').forEach(button=>button.onclick=()=>{
   place=button.dataset.place;
   document.querySelectorAll('.boardTabs button').forEach(b=>b.setAttribute('aria-pressed',String(b===button)));
   draw()
 });
 async function check(){
   if(inFlight||document.hidden||Date.now()-lastAttempt<period-1000)return;
   lastAttempt=Date.now();inFlight=true;
   const controller=new AbortController(),timer=setTimeout(()=>controller.abort(),8000);
   $('boardStatus').textContent='Consultando o boletim…';
   try{
     const res=await fetch(endpoint,{cache:'no-store',signal:controller.signal});if(!res.ok)throw Error();
     const payload=await res.json(),next={};
     for(const k of Object.keys(labels)){const p=payload[k];next[k]=[p?.killed?.total,p?.injured?.total,p?.last_update];if(!valid(next[k]))throw Error()}
     merge(next);try{localStorage.setItem(cacheKey,JSON.stringify(data))}catch{}
     draw();$('boardStatus').textContent='Consulta às '+new Date().toLocaleTimeString('pt-BR',{hour:'2-digit',minute:'2-digit'})+' · verificação a cada 5 min';
   }catch{$('boardStatus').textContent='Consulta indisponível · exibindo o boletim salvo.'}
   finally{inFlight=false;clearTimeout(timer)}
 }
 draw();check();setInterval(check,period);document.addEventListener('visibilitychange',check);
})();