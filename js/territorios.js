let currentArea = 'IRN';
function syncHighlight(){
  document.querySelectorAll('#geo [data-country]').forEach(g=>g.setAttribute('aria-pressed',String(g.dataset.country===currentArea)));
}
function chooseArea(code){
  currentArea=code;
  const localArea=['GAZ','ISR','PSE'].includes(code);
  if(regional===localArea){regional=!localArea;map()}
  $('areaPicker').value=code;
  syncHighlight();
  const records=refs.filter(r=>r.country===code);
  const rows=sheet.filter(r=>r.country===code);
  $('dossierTitle').textContent=countryNames[code]||code;
  $('sourceList').replaceChildren();
  for(const r of records){
    const item=element('article'),a=element('a',r.source+' ↗');
    a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';
    const d=element('details'),summary=element('summary',topics[r.topic]+' · '+r.value);
    d.append(summary,element('small',r.area+' · '+r.date),element('p',r.note),a);item.append(d);$('sourceList').append(item);
  }
  if(!records.length)$('sourceList').append(element('p','A base ainda não reúne fontes individuais para este território.'));
  const periods=new Map();
  rows.forEach(r=>periods.set(r.period,(periods.get(r.period)||0)+1));
  $('periods').replaceChildren();
  const max=Math.max(1,...periods.values());
  for(const [period,n] of [...periods].sort(([a],[b])=>a.localeCompare(b))){
    const row=element('div');row.className='periodRow';
    const bar=element('i');bar.style.width=(100*n/max)+'%';
    const track=element('span');track.append(bar);
    row.append(element('small',period),track,element('b',n));$('periods').append(row);
  }
  if(!rows.length)$('periods').append(element('p','A planilha não traz registros por semestre para este território.'));
  $('openRows').textContent='Consultar '+rows.length+' registro'+(rows.length===1?'':'s')+' da planilha →';
  $('openRows').hidden=!rows.length;
  $('openRows').onclick=()=>selectData(code,'','sheet');
  if(document.documentElement.dataset.motion==='on')$('dossierTitle').animate([{opacity:.35,transform:'translateY(6px)'},{opacity:1,transform:'none'}],{duration:300});
}
Object.entries(countryNames).sort((a,b)=>a[1].localeCompare(b[1],'pt')).forEach(([k,v])=>$('areaPicker').add(new Option(v,k)));
$('areaPicker').onchange=()=>chooseArea($('areaPicker').value);
$('region').onclick=()=>chooseArea('IRN');
$('local').onclick=()=>chooseArea('GAZ');
$('reset').onclick=()=>{
  selectData('','','sheet');
  const basePicker = $('base').nextElementSibling || $('base');
  basePicker.focus({ preventScroll: true });
};
chooseArea('IRN');

const homeMap=$('geo').cloneNode(true);
homeMap.id='homeGeo';
homeMap.setAttribute('aria-label','Consultar mortes de mulheres por território');
homeMap.querySelectorAll('.atlasMapLabels,.liftedCountries,.reliefBase,text,defs,circle,title,path:not(.land)').forEach(node=>node.remove());
homeMap.querySelectorAll('[aria-pressed]').forEach(node=>node.removeAttribute('aria-pressed'));
$('atlasArt').prepend(homeMap);
shadeAtlas(homeMap);
const homeBounds=homeMap.getBBox();
if(homeBounds.width && homeBounds.height){
  const inset=5;
  homeMap.setAttribute('viewBox',[homeBounds.x-inset,homeBounds.y-inset,homeBounds.width+2*inset,homeBounds.height+2*inset].join(' '));
  homeMap.setAttribute('preserveAspectRatio','xMidYMid meet');
}
function connectDeathMap(root,box){
  document.body.append(box);
  box.classList.add('cursorInfo');
  box.hidden=true;
  let active=null, pinned=false, x=0, y=0, frame=0;
  function place(){
    frame=0;
    if(box.hidden)return;
    const pad=8,gap=16,w=box.offsetWidth,h=box.offsetHeight;
    const vw=document.documentElement.clientWidth,vh=document.documentElement.clientHeight;
    const left=x+gap+w<=vw-pad?x+gap:x-gap-w;
    const top=y+gap+h<=vh-pad?y+gap:y-gap-h;
    box.style.left=Math.max(pad,Math.min(vw-w-pad,left))+'px';
    box.style.top=Math.max(pad,Math.min(vh-h-pad,top))+'px';
  }
  function setLift(area,on){
    if(!area)return;
    const surface=root.querySelector('[data-lift="'+area.dataset.country+'"]');
    if(surface)surface.toggleAttribute('data-raised',on);
  }
  function hide(){
    if(frame)cancelAnimationFrame(frame);
    frame=0;
    setLift(active,false);
    active?.removeAttribute('data-active');
    active?.removeAttribute('aria-describedby');
    active=null;pinned=false;box.hidden=true;box.classList.remove('pinned');
  }
  root.addEventListener('reset-map-hint',hide);
  function show(area,px,py){
    x=px;y=py;
    if(active!==area){
      setLift(active,false);
    active?.removeAttribute('data-active');
      active?.removeAttribute('aria-describedby');
      active=area;
    const code=area.dataset.country;
    const name=area.dataset.place;
    const rec=refs.find(record=>record.country===code && record.topic==='deaths');
    const head=element('b',name);
    box.replaceChildren(head);
    if (!rec) box.append(element('p','As fontes reunidas aqui não informam quantas mulheres morreram neste território.'));
    else {
      const quantified=rec.value!=='Documentada';
      const unit=code==='GAZ'?'mulheres e meninas mortas':rec.value==='1'?'mulher morta':'mulheres mortas';
      box.append(element('p',quantified?rec.value+' '+unit:'Mortes documentadas. A fonte não informa a quantidade.'),element('small',rec.date));
      const link=element('a',rec.source+' ↗');
      link.href=rec.url;link.target='_blank';link.rel='noopener noreferrer';
      box.append(link);
    }

      area.setAttribute('data-active','');
      setLift(area,true);
      area.setAttribute('aria-describedby',box.id);
      if(rec&&root.id!=='geo')box.append(element('small','Clique ou use Enter para manter a ficha aberta.'));
      box.hidden=false;
      place();
    }else if(!frame)frame=requestAnimationFrame(place);
  }
  root.addEventListener('pointermove',e=>{
    if(pinned||e.pointerType==='touch')return;
    const area=e.target.closest('[data-country]');
    if(area)show(area,e.clientX,e.clientY);else hide();
  });
  root.addEventListener('pointerleave',()=>{if(!pinned)hide()});
  function byFocus(area){
    const rect=area.getBoundingClientRect();
    show(area,rect.left+rect.width/2,rect.top+rect.height/2);
  }
  root.addEventListener('focusin',e=>{
    const area=e.target.closest('[data-country]');
    if(area){pinned=false;box.classList.remove('pinned');byFocus(area)}
  });
  function pin(){pinned=true;box.classList.add('pinned');const hint=box.querySelector('a + small');if(hint)hint.hidden=true;place()}
  root.addEventListener('click',e=>{
    if(root.id==='geo'){hide();return}
    const area=e.target.closest('[data-country]');
    if(area){if(e.detail)show(area,e.clientX,e.clientY);else byFocus(area);pin()}
  },true);
  root.addEventListener('keydown',e=>{
    const area=e.target.closest('[data-country]');
    if(!area||(e.key!=='Enter'&&e.key!==' '))return;
    if(root.id==='geo'){hide();return}
    e.preventDefault();byFocus(area);pin();box.querySelector('a')?.focus({preventScroll:true});
  },true);
  document.addEventListener('pointerdown',e=>{if(!root.contains(e.target)&&!box.contains(e.target))hide()});
  document.addEventListener('focusin',e=>{if(!root.contains(e.target)&&!box.contains(e.target))hide()});
  document.addEventListener('keydown',e=>{if(e.key==='Escape'&&!box.hidden){if(box.contains(document.activeElement))active?.focus({preventScroll:true});hide()}});
  window.addEventListener('scroll',hide,{passive:true});
  window.addEventListener('resize',hide);
}
connectDeathMap(homeMap,$('homeDeath'));
connectDeathMap($('geo'),$('regionalDeath'));
