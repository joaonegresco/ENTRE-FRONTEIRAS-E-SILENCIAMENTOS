
const rootPage=document.documentElement;
const entrance=new IntersectionObserver(entries=>entries.forEach(e=>{
 if(e.isIntersecting){e.target.classList.add('arriving');entrance.unobserve(e.target)}
}),{threshold:.045});
document.querySelectorAll('.overview h1,.sectionHead,.card,.plate,.chart,.timeline,.controls').forEach((node,i)=>{
 if(node.matches('.card'))node.style.setProperty('--lag',(i%4)*45+'ms');
 entrance.observe(node)
});
document.addEventListener('toggle',e=>{
 if(e.target.matches?.('details[open]')&&rootPage.dataset.motion==='on')
 for(const child of [...e.target.children].slice(1))child.animate([{opacity:.2,transform:'translateY(-5px)'},{opacity:1,transform:'none'}],{duration:240})
},true);

