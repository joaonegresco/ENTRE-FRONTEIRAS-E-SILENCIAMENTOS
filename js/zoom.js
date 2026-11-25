
(()=>{
  const svg=homeMap;
  const regionView=svg.getAttribute('viewBox');
  const regionBounds=regionView.trim().split(/\s+/).map(Number);
  const codes=['ISR','GAZ','PSE'];
  const areas=codes.map(code=>svg.querySelector('[data-country="'+code+'"]'));
  const boxes=areas.map(area=>area.getBBox());
  const left=Math.min(...boxes.map(b=>b.x)),right=Math.max(...boxes.map(b=>b.x+b.width));
  const top=Math.min(...boxes.map(b=>b.y)),bottom=Math.max(...boxes.map(b=>b.y+b.height));
  const pad=4;
  const closeView=[left-pad,top-pad,right-left+2*pad,bottom-top+2*pad].join(' ');
  const tools=document.createElement('div');tools.className='mapTools';
  const change=element('button','Ampliar Israel e Palestina');change.type='button';
  tools.append(change);svg.after(tools);
  const shortcuts=areas.map(area=>{
    const b=element('button',area.dataset.place);b.hidden=true;tools.append(b);
    b.onclick=()=>area.focus({preventScroll:true});return b
  });
  let zoom=false,armed=true,exitTimer=0;
  const host=svg.parentElement;
  const tip=document.getElementById('homeDeath');
  function stay(){clearTimeout(exitTimer);exitTimer=0}
  function returnSoon(){if(zoom&&!exitTimer)exitTimer=setTimeout(()=>{exitTimer=0;switchView(false)},520)}
  for (const part of svg.querySelectorAll('[data-country],[data-lift],[data-relief-country]')) {
    const country = part.dataset.country || part.dataset.lift || part.dataset.reliefCountry;
    if (!codes.includes(country)) part.setAttribute('data-zoom-away','');
  }

  const reliefLayers = Array.from(svg.querySelectorAll('[data-relief-depth]'));
  let viewportWidth = svg.clientWidth;
  let viewportHeight = svg.clientHeight;

  // Mantém a altura aparente da elevação enquanto a câmera aproxima o mapa.
  function updateRelief(view) {
    if (!viewportWidth || !viewportHeight) return;
    const fit = bounds => Math.min(viewportWidth / bounds[2], viewportHeight / bounds[3]);
    const ratio = fit(regionBounds) / fit(view);
    const units = value => (value * ratio).toFixed(4);
    svg.style.setProperty('--atlas-lift', units(-9) + 'px');
    svg.style.setProperty('--atlas-shadow-y', units(4) + 'px');
    svg.style.setProperty('--atlas-shadow-blur', units(2) + 'px');
    for (const layer of reliefLayers) {
      layer.setAttribute('transform', 'translate(0 ' + units(Number(layer.dataset.reliefDepth)) + ')');
    }
  }

  new ResizeObserver(() => {
    viewportWidth = svg.clientWidth;
    viewportHeight = svg.clientHeight;
    updateRelief(svg.getAttribute('viewBox').trim().split(/\s+/).map(Number));
  }).observe(svg);
  let cameraFrame=0;
  function moveCamera(next){
    cancelAnimationFrame(cameraFrame);
    const from=svg.getAttribute('viewBox').trim().split(/\s+/).map(Number);
    const to=(next?closeView:regionView).split(/\s+/).map(Number);
    const start=performance.now();
    svg.classList.add('zoomLocal');
    function step(now){
      const t=Math.min(1,(now-start)/340);
      const ease=t*t*(3-2*t);
      const view = from.map((value, index) => value + (to[index] - value) * ease);
      svg.setAttribute('viewBox', view.join(' '));
      updateRelief(view);
      if(t<1)cameraFrame=requestAnimationFrame(step);
      else{cameraFrame=0;svg.classList.toggle('zoomLocal',next)}
    }
    cameraFrame=requestAnimationFrame(step);
  }
  function switchView(next){
    if(next===zoom)return;
    stay();zoom=next;
    svg.dispatchEvent(new Event("reset-map-hint"));
    svg.dispatchEvent(new PointerEvent('pointerleave'));
    moveCamera(zoom);
    change.textContent=zoom?'← Voltar ao Oriente Médio':'Ampliar Israel e Palestina';
    change.setAttribute('aria-pressed',String(zoom));
    shortcuts.forEach(b=>b.hidden=!zoom);
    svg.querySelectorAll('[data-country]').forEach(area=>{
      area.setAttribute('tabindex',zoom&&!codes.includes(area.dataset.country)?'-1':'0');
    });

    if(!zoom)armed=false;
  }
  change.setAttribute('aria-pressed','false');change.onclick=()=>switchView(!zoom);
  function detect(e){
    if(cameraFrame)return;
    const matrix=svg.getScreenCTM();if(!matrix)return;
    const point=new DOMPoint(e.clientX,e.clientY).matrixTransform(matrix.inverse());
    const margin=(zoom?35:8)/matrix.a;
    const near=point.x>=left-margin&&point.x<=right+margin&&point.y>=top-margin&&point.y<=bottom+margin;
    if(zoom){if(near)stay();else returnSoon();return}
    if(!near){armed=true;return}
    if(armed){switchView(true);e.stopImmediatePropagation()}
  }
  svg.addEventListener('pointermove',e=>{if(e.pointerType!=='touch')detect(e)},true);
  svg.addEventListener('click',detect,true);
  host.addEventListener('pointerleave',()=>{armed=true;returnSoon()});
  tools.addEventListener('pointerenter',stay);
  tip.addEventListener('pointerenter',stay);
  tip.addEventListener('pointerleave',returnSoon);
  host.addEventListener('focusout',e=>{if(!host.contains(e.relatedTarget)&&!tip.contains(e.relatedTarget))returnSoon()});
  host.addEventListener('focusin',stay);
  document.addEventListener('pointerdown',e=>{if(zoom&&!host.contains(e.target)&&!tip.contains(e.target))switchView(false)},true);
  new IntersectionObserver(entries=>{if(!entries[0].isIntersecting&&zoom)switchView(false)}).observe(host);
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&zoom){switchView(false);change.focus({preventScroll:true})}});
})();
