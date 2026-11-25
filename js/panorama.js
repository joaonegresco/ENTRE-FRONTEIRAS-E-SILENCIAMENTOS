
const statBox=document.getElementById('stats');
for(const [value,label] of [[sheet.length,'registros'],[new Set(sheet.map(r=>r.country)).size,'territórios']]){
 const cell=document.createElement('div');cell.append(element('strong',value),element('small',label));statBox.append(cell);
}
const blocks=[...document.querySelectorAll('.reveal')];
const observer=new IntersectionObserver(entries=>entries.forEach(e=>{if(e.isIntersecting){e.target.classList.add('visible');observer.unobserve(e.target)}}),{threshold:0,rootMargin:'0px 0px -18px 0px'});
blocks.forEach(b=>observer.observe(b));
function updateScroll(){
 const max=document.documentElement.scrollHeight-innerHeight;
 $('progress').style.transform='scaleX('+(max>0?Math.min(1,scrollY/max):0)+')';
 document.querySelector('header nav a[href="#inicio"]').setAttribute('aria-current','location');
}
addEventListener('scroll',updateScroll,{passive:true});addEventListener('resize',updateScroll);updateScroll();
