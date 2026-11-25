
(()=>{
 const space=document.createElement('div');space.id='cosmos';space.setAttribute('aria-hidden','true');
 const stars=Array.from({length:3},()=>space.appendChild(document.createElement('i')));
 document.body.prepend(space);
 const hero=document.querySelector('.overview');
 let mx=0,my=0,frame=0;
 function draw(){
   frame=0;
   if(document.hidden||document.documentElement.dataset.motion==='off')return;
   const depth=scrollY/(scrollY+Math.max(innerHeight,1));
   stars.forEach((layer,i)=>{
     layer.style.setProperty('--dx',(mx*(i+1)*5).toFixed(1)+'px');
     layer.style.setProperty('--dy',(my*(i+1)*4-depth*(i+1)*18).toFixed(1)+'px');
   });
   hero.style.setProperty('--titleShift',Math.min(13,scrollY*.045)+'px');
 }
 function queue(){if(!frame&&!document.hidden&&document.documentElement.dataset.motion==='on')frame=requestAnimationFrame(draw)}
 addEventListener('pointermove',e=>{if(e.pointerType==='mouse'){mx=e.clientX/innerWidth-.5;my=e.clientY/innerHeight-.5;queue()}},{passive:true});
 addEventListener('scroll',queue,{passive:true});
 document.addEventListener('visibilitychange',()=>{document.documentElement.dataset.sleep=String(document.hidden);queue()});
 new MutationObserver(queue).observe(document.documentElement,{attributes:true,attributeFilter:['data-motion']});
 queue();
})();
