'use strict';
const $ = id => document.getElementById(id);
const topics = {deaths:'Mortes',injuries:'Ferimentos',sexual:'Violência sexual',displacement:'Deslocamento'};
const countryNames={TUR:"Turquia",CYP:"Chipre",NCY:"Norte de Chipre",IRN:'Irã',OMN:'Omã',BHR:'Bahrein',IRQ:'Iraque',KWT:'Kuwait',ARE:'Emirados Árabes Unidos',SAU:'Arábia Saudita',QAT:'Catar',ISR:'Israel',PSE:'Palestina',GAZ:'Faixa de Gaza',LBN:'Líbano',JOR:'Jordânia',SYR:'Síria',YEM:'Iêmen',EGY:'Egito'};
const codeMap={TR:"TUR",CY:"CYP","CY-N":"NCY",IR:'IRN',OM:'OMN',BH:'BHR',IQ:'IRQ',KW:'KWT',AE:'ARE',SA:'SAU',QA:'QAT',IL:'ISR','PS-GZ':'GAZ','PS-WB':'PSE',LB:'LBN',JO:'JOR',SY:'SYR',YE:'YEM',EG:'EGY'};
const element=(name,content)=>{const el=document.createElement(name);if(content!=null)el.textContent=content;return el};
function options(el,obj,all){el.replaceChildren(new Option(all,''));for(const [key,label] of Object.entries(obj))el.add(new Option(label,key))}
const sheet=window.sheetRows||[], refs=window.records||[];
options($('topic'),topics,'Todos os indicadores');
const countries={...countryNames};for(const r of sheet)if(!countries[r.country])countries[r.country]=r.area;
options($('country'),Object.fromEntries(Object.entries(countries).sort((a,b)=>a[1].localeCompare(b[1],'pt'))),'Todos os territórios');
function distributionChart(rows){
 const panel=element('section');panel.className='plot distribution';
 panel.append(element('h3','Distribuição por indicador'));
 const ring=element('div');ring.className='donut';
 const center=element('div');center.append(element('b',rows.length),element('small','registros'));ring.append(center);
 const legend=element('div');legend.className='donutLegend';
 const colors=['#e8ab85','#82bbb3','#a99acb','#829bbd'];
 let cumulative=0;const stops=[];
 Object.entries(topics).forEach(([key,label],i)=>{
   const n=rows.filter(r=>r.topic===key).length;if(!n)return;
   const start=cumulative;cumulative+=100*n/rows.length;
   stops.push(colors[i]+' '+start+'% '+cumulative+'%');
   const b=element('button');b.type='button';b.style.setProperty('--swatch',colors[i]);
   b.append(element('span',label),element('strong',n+' · '+(100*n/rows.length).toLocaleString('pt-BR',{maximumFractionDigits:1})+'%'));
   b.onclick=()=>{$('topic').value=key;render();($('topic').nextElementSibling||$('topic')).focus({preventScroll:true})};legend.append(b)
 });
 ring.style.background='conic-gradient('+stops.join(',')+')';panel.append(ring,legend);return panel
}
function semesterPlot(records, numbers) {
  const ns = 'http://www.w3.org/2000/svg';
  const graph = document.createElementNS(ns, 'svg');
  const figure = element('figure');
  figure.className = 'semesterFigure';
  const reading = element('figcaption', 'Aponte ou toque em um ponto para ver o valor.');
  reading.className = 'semesterReading';
  reading.setAttribute('aria-live', 'polite');
  figure.append(graph, reading);

  const add = (tag, attrs, text, parent = graph) => {
    const node = document.createElementNS(ns, tag);
    for (const [name, value] of Object.entries(attrs)) node.setAttribute(name, value);
    if (text !== undefined) node.textContent = text;
    parent.append(node);
    return node;
  };

  graph.setAttribute('viewBox', '0 0 580 192');
  graph.setAttribute('role', 'group');
  graph.setAttribute('aria-label', 'Valores por semestre. Use as setas para mudar de ponto e Enter para fixar o valor.');
  graph.classList.add('semesterPlot');

  const ticks = records.map(record => {
    const match = record.period.match(/(\d{4}).*?([12])º/);
    return match ? Number(match[1]) * 2 + Number(match[2]) - 1 : null;
  });
  if (ticks.some(tick => tick === null) || !numbers.some(value => value !== null)) return null;

  const start = Math.min(...ticks);
  const end = Math.max(...ticks);
  const peak = Math.max(1, ...numbers.filter(value => value !== null));
  const format = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 });
  const x = tick => end === start ? 306 : 55 + (tick - start) * 492 / (end - start);
  for (const scale of [0, .5, 1]) {
    const y = 150 - scale * 116;
    add('line', { x1: 55, x2: 548, y1: y, y2: y, stroke: '#38383d' });
    add('text', { x: 49, y: y + 4, 'text-anchor': 'end' }, format.format(scale * peak));
  }
  for (let tick = start; tick <= end; tick++) {
    add('text', { x: x(tick), y: 177, 'text-anchor': 'middle' }, (tick % 2 + 1) + 'S/' + String(Math.floor(tick / 2)).slice(2));
  }

  const guide = add('line', { class: 'plotGuide', y1: 23, y2: 150, 'aria-hidden': 'true' });
  const hitWidth = Math.min(58, 492 / Math.max(1, end - start));
  const points = [];
  let previous = null;
  let pinned = null;
  let active = null;

  function show(point) {
    if (active === point) return;
    active?.removeAttribute('data-active');
    active = point;
    guide.classList.toggle('visible', Boolean(point));
    if (!point) {
      reading.textContent = 'Aponte ou toque em um ponto para ver o valor.';
      return;
    }
    point.setAttribute('data-active', '');
    guide.setAttribute('x1', point.dataset.x);
    guide.setAttribute('x2', point.dataset.x);
    reading.replaceChildren(element('span', point.dataset.period), element('strong', point.dataset.value));
  }

  function pin(point) {
    const next = pinned === point ? null : point;
    pinned?.setAttribute('aria-pressed', 'false');
    pinned = next;
    pinned?.setAttribute('aria-pressed', 'true');
    show(point);
  }

  records.forEach((record, index) => {
    const value = numbers[index];
    if (value === null) {
      previous = null;
      return;
    }
    const tick = ticks[index];
    const cx = x(tick);
    const cy = 150 - value / peak * 116;
    if (previous?.tick === tick - 1) {
      const stroke = add('path', {
        d: 'M' + previous.cx + ' ' + previous.cy + ' L' + cx + ' ' + cy,
        pathLength: 1, class: 'semesterLine', 'aria-hidden': 'true',
      });
      stroke.style.setProperty('--trace-delay', Math.min(index * 45, 280) + 'ms');
    }
    const valueLabel = format.format(value);
    const point = add('g', {
      class: 'plotPoint', tabindex: 0, role: 'button',
      'aria-pressed': 'false', 'aria-label': record.period + ', ' + valueLabel,
      'data-x': cx, 'data-period': record.period, 'data-value': valueLabel,
    });
    add('rect', { x: cx - hitWidth / 2, y: 19, width: hitWidth, height: 139, class: 'plotHit' }, undefined, point);
    add('circle', { cx, cy, r: 5, class: 'plotDot' }, undefined, point);
    points.push(point);

    point.addEventListener('pointerenter', () => show(point));
    point.addEventListener('focus', () => show(point));
    point.addEventListener('click', () => pin(point));
    point.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        pin(point);
      }
      if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
        event.preventDefault();
        const step = event.key === 'ArrowRight' ? 1 : -1;
        points[points.indexOf(point) + step]?.focus({ preventScroll: true });
      }
    });
    previous = { tick, cx, cy };
  });
  // Keep every marker above the trace and keep the interaction regions stable.
  graph.append(...points);
  graph.addEventListener('pointerleave', () => show(pinned || points.find(point => point === document.activeElement) || null));
  graph.addEventListener('focusout', event => {
    if (!graph.contains(event.relatedTarget)) show(pinned);
  });
  return figure;
}
function countChart(rows,field,labels,title){
 const panel=element('section');panel.className='plot';
 panel.append(element('h3',title),element('p','Número de registros na seleção'));panel.classList.add('ranking');
 const counts=new Map();
 for(const r of rows)counts.set(r[field],(counts.get(r[field])||0)+1);
 const sorted=[...counts].sort((a,b)=>b[1]-a[1]);
 for(const [key,n] of sorted){
   const button=element('button');button.className='plotRow';button.type='button';
   button.append(element('span',labels[key]||key));
   const rail=element('span');rail.className='rail';const bar=element('i');
   bar.style.width=(100*n/sorted[0][1])+'%';rail.append(bar);
   button.append(rail,element('strong',n));panel.append(button);
   button.setAttribute('aria-label',(labels[key]||key)+', '+n+' registros. Filtrar.');
   button.onclick=()=>{$(field).value=key;render();($(field).nextElementSibling||$(field)).focus({preventScroll:true})};
 }
 return panel
}
function recordSheet(r,isSheet){
 const panel=element('article');panel.className='recordSheet';
 const identity=element('div'),valueBlock=element('div');
 const area=element('h3',r.area),metric=element('p',topics[r.topic]);metric.className='recordMetric';
 identity.append(metric,area,element('small',isSheet?r.period:r.date));
 const raw=isSheet?r.detail:r.value;
 const numeric=/^\d+$/.test(raw);
 const value=element('strong',numeric?Number(raw).toLocaleString('pt-BR'):raw);
 if(raw.length>18)value.className='textReading';
 valueBlock.append(element('small','Valor registrado'),value);
 panel.append(identity,valueBlock);
 const foot=element('div');foot.className='recordFoot';
 if(isSheet)foot.append(element('span','Origem · Planilha do projeto'));
 else{foot.append(element('p',r.note));const a=element('a',r.source+' ↗');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';foot.append(a)}
 panel.append(foot);return panel
}
function seriesChart(rows,isSheet){
 const panel=element('section');panel.className='plot series';
 const series=new Map();
 for(const r of rows){const key=r.country+'|'+r.topic;if(!series.has(key))series.set(key,[]);series.get(key).push(r)}
 const label=element('label','Território e indicador');const picker=element('select');
 for(const [key,group] of series){const r=group[0];picker.add(new Option((countryNames[r.country]||r.area)+' · '+topics[r.topic],key))}
 label.append(picker);
 const chart=element('div');
 const head=element('div');
 head.className='seriesHead';
 head.append(element('h3',isSheet?'Valores por semestre':'Valores publicados e fontes'),label);
 panel.append(head,chart);
 function draw(){
   chart.replaceChildren();
   const records=series.get(picker.value).slice();
   if(isSheet)records.sort((a,b)=>a.period.localeCompare(b.period));
   const numbers=records.map(r=>{
     const raw=isSheet?r.detail:r.value;
     return /^\d+(?:\.\d{3})*$/.test(raw)?Number(raw.replaceAll('.','')):null
   });
   if(records.length===1){chart.append(recordSheet(records[0],isSheet));return}
   if(isSheet){const timeline=semesterPlot(records,numbers);if(timeline)chart.append(timeline)}
   records.forEach((r,i)=>{
     const item=element('div');item.className='reading';
     const raw=isSheet?r.detail:r.value;
     item.append(element('small',isSheet?r.period:r.area+' · '+r.date),element('strong',/^\d+$/.test(raw)?Number(raw).toLocaleString('pt-BR'):raw));
     if(!isSheet){const a=element('a',r.source+' ↗');a.href=r.url;a.target='_blank';a.rel='noopener noreferrer';item.append(element('p',r.note),a)}
     chart.append(item)
   });
 }
 picker.onchange=draw;draw();return panel
}
function render(){
 $('reset').hidden=$('base').value==='sheet'&&!$('country').value&&!$('topic').value;
 const isSheet=$('base').value==='sheet';
 const rows=(isSheet?sheet:refs).filter(r=>(!$('topic').value||r.topic===$('topic').value)&&(!$('country').value||r.country===$('country').value));
 $('count').textContent=rows.length+' registro'+(rows.length===1?'':'s')+' · '+(countryNames[$('country').value]||'Todos os territórios')+' · '+(topics[$('topic').value]||'Todos os indicadores');
 const chart=$('results');chart.replaceChildren();
 if(!rows.length){chart.append(element('p','Sem registros nesta seleção. A ausência de registros não indica zero ocorrências.'));return}
 if(rows.length===1){chart.append(recordSheet(rows[0],isSheet));return}
 chart.append(seriesChart(rows,isSheet));
 const breakdown=element('div');
 breakdown.className='recordBreakdown';
 if(new Set(rows.map(r=>r.topic)).size>1){
   breakdown.append(distributionChart(rows));
 }
 if(new Set(rows.map(r=>r.country)).size>1){
   breakdown.append(countChart(rows,'country',countryNames,'Cobertura por território'));
 }
 if(breakdown.childElementCount)chart.append(breakdown);
}
for(const id of ['base','topic','country'])$(id).addEventListener('change',render);
function selectData(country,topic,base){$('country').value=country;$('topic').value=topic;$('base').value=base;render();document.dispatchEvent(new CustomEvent('atlas:open-panel',{detail:'dados'}))}
const icons=['M12 21s-8-5.3-8-11a4.3 4.3 0 0 1 8-2 4.3 4.3 0 0 1 8 2c0 5.7-8 11-8 11Z','M9 3h6v6h6v6h-6v6H9v-6H3V9h6Z','M12 3l8 3v6c0 5-4 8-8 10-4-2-8-5-8-10V6Z','M3 17l6-6 4 4 8-9m-6 0h6v6'];
const tones=[['#9d5446','#f9ebe4'],['#966821','#f6eedc'],['#745b89','#f3ecf6'],['#397978','#e5f2ed']];
Object.keys(topics).forEach((key,i)=>{const rec=refs.find(r=>r.country===(key==='sexual'?'PSE':'IRN')&&r.topic===key);if(!rec)return;let b=element('button');b.className='card';b.dataset.metric=key;b.style.setProperty('--ink',tones[i][0]);b.style.setProperty('--tint',tones[i][1]);let icon=element('span');icon.className='ico';icon.innerHTML='<svg aria-hidden="true" viewBox="0 0 24 24"><path d="'+icons[i]+'" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';b.append(icon,element('b',topics[key]),element('strong',rec.value),element('small',({deaths:'Mulheres entre as mortes civis',injuries:'Mulheres feridas',sexual:'Mulheres e meninas · casos verificados',displacement:'Mulheres e meninas deslocadas'})[key]),element('small',rec.area+' · '+rec.date));const arrow=element('span','→');arrow.className='metricArrow';arrow.setAttribute('aria-hidden','true');b.append(arrow);b.onclick=()=>selectData(rec.country,key,'ref');$('cards').append(b)});
const NS='http://www.w3.org/2000/svg';function svg(tag,attrs,parent,txt){const e=document.createElementNS(NS,tag);for(const [k,v] of Object.entries(attrs||{}))e.setAttribute(k,v);if(txt)e.textContent=txt;parent.append(e);return e}
let regional=false;
function shadeAtlas(root){
  const ns='http://www.w3.org/2000/svg';
  const node=(name)=>document.createElementNS(ns,name);
  const defs=node('defs');
  for(const [kind,tones] of [['land',['#737a80','#515961','#343b42']],['lit',['#dba27c','#ac7658','#795240']]]){
    const gradient=node('linearGradient');
    gradient.id=root.id+'-'+kind;
    gradient.setAttribute('x2','0.68');gradient.setAttribute('y2','1');
    tones.forEach((tone,i)=>{const stop=node('stop');stop.setAttribute('offset',String(i/2));stop.setAttribute('stop-color',tone);gradient.append(stop)});
    defs.append(gradient);
    root.style.setProperty('--'+kind+'-fill','url(#'+gradient.id+')');
  }
  const base=node('g');base.classList.add('reliefBase');base.setAttribute('aria-hidden','true');
  const contour=root.querySelectorAll('.land');
  for(const depth of [4,2]){const layer=node('g');layer.setAttribute('transform','translate(0 '+depth+')');
    layer.dataset.reliefDepth = depth;
    for (const land of contour) {
      const face = node('path');
      face.setAttribute('d',land.getAttribute('d'));
      face.setAttribute('fill-rule','evenodd');
      const country = land.parentElement.dataset.country;
      if (country) face.dataset.reliefCountry = country;
      layer.append(face);
    }
    base.append(layer);
  }
  const lifted=node('g');
  lifted.classList.add('liftedCountries');
  lifted.setAttribute('aria-hidden','true');
  root.querySelectorAll('.geo-link').forEach(area=>{
    const surface=node('g');
    surface.classList.add('liftSurface');
    surface.dataset.lift=area.dataset.country;
    area.querySelectorAll('path').forEach(path=>{
      const copy=path.cloneNode(false);
      if(copy.classList.contains('land'))copy.setAttribute('class','liftFace');
      surface.append(copy);
    });
    lifted.append(surface);
  });
  root.append(lifted);
  root.prepend(defs,base);
}
// Coordenadas das legendas e, quando necessário, das linhas de chamada.
const regionalLabels = [
  { code: 'TUR', at: [35.1, 39.25] },
  { code: 'SYR', at: [38.5, 35.15] },
  { code: 'IRQ', at: [43.5, 33.15] },
  { code: 'IRN', at: [53.9, 32.65] },
  { code: 'SAU', at: [44.4, 23.55] },
  { code: 'EGY', at: [29.2, 26.7] },
  { code: 'OMN', at: [56.85, 20.55] },
  { code: 'YEM', at: [47.45, 15.85] },
  { code: 'NCY', at: [33.54, 35.31], callout: [-4, 49, 'end'] },
  { code: 'CYP', at: [32.91, 34.84], callout: [-4, 74, 'end'] },
  { code: 'LBN', at: [35.82, 33.9], callout: [24, 99, 'end'] },
  { code: 'PSE', name: 'Cisjordânia', at: [35.23, 31.75], callout: [18, 123, 'end'] },
  { code: 'GAZ', at: [34.38, 31.48], callout: [14, 147, 'end'] },
  { code: 'ISR', at: [34.96, 30.62], callout: [26, 172, 'end'] },
  { code: 'JOR', at: [36.65, 30.89], callout: [130, 148, 'start'] },
  { code: 'KWT', at: [47.59, 29.39], callout: [294, 167, 'start'] },
  { code: 'BHR', at: [50.55, 26.06], callout: [302, 200, 'end'] },
  { code: 'QAT', at: [51.19, 25.34], callout: [341, 211, 'start'] },
  { code: 'ARE', name: ['Emirados Árabes', 'Unidos'], at: [54.45, 23.76], callout: [456, 264, 'start'] },
  { name: 'Estreito de Ormuz', at: [56.4, 26.55], callout: [449, 222, 'start'] },
];
const localLabels = [
  { name: 'Mar Mediterrâneo', at: [33.4, 32.8] },
  { code: 'PSE', name: 'Cisjordânia', at: [35.23, 32.04], callout: [362, 108, 'start'] },
  { code: 'GAZ', at: [34.39, 31.43], callout: [193, 177, 'end'] },
  { code: 'ISR', at: [34.95, 30.86], callout: [369, 237, 'start'] },
];

function drawMapLabels(root, project, isRegional) {
  const layer = svg('g', { class: 'atlasMapLabels', 'aria-hidden': 'true' }, root);
  for (const { code, name = countryNames[code], at, callout } of isRegional ? regionalLabels : localLabels) {
    const [cx, cy] = project(at);
    const [x, y, anchor] = callout || [cx, cy, 'middle'];
    const attrs = code ? { class: 'atlasMapName', 'data-country': code, 'data-place': [].concat(name).join(' ') }
      : { class: 'atlasMapWater' };
    const item = svg('g', attrs, layer);
    if (code) item.addEventListener('click', () => chooseArea(code));
    if (callout) {
      const endX = x + (anchor === 'end' ? 5 : -5);
      svg('line', { x1: cx, y1: cy, x2: endX, y2: y - 3 }, item);
      if (code) svg('circle', { cx, cy, r: 2 }, item);
    }
    const text = svg('text', { x, y, 'text-anchor': anchor }, item);
    for (const [index, line] of [].concat(name).entries()) {
      svg('tspan', { x, dy: index ? '1.08em' : 0 }, text, line);
    }
  }
}
function map(){const root=$('geo');root.replaceChildren();root.setAttribute('role','group');root.setAttribute('aria-label',regional?'Mapa regional do Oriente Médio e Estreito de Ormuz':'Israel e Palestina, com Gaza e Cisjordânia');const defs=svg('defs',{},root);const hatch=svg('pattern',{id:'dots',width:6,height:6,patternUnits:'userSpaceOnUse'},defs);svg('circle',{cx:2,cy:2,r:.85,fill:'#e5ece6',opacity:.34},hatch);
const p=([lon,lat])=>regional?[(lon-30)*15+13,(40-lat)*16]:[(lon-35.1)*76+300,(33.45-lat)*85+5];
const features=window.atlasGeo?.features||[];for(const f of features){const id=f.properties.id||f.id;const local=['IL','PS-GZ','PS-WB'].includes(id);if(!regional&&!local)continue;const polys=f.geometry.type==='Polygon'?[f.geometry.coordinates]:f.geometry.coordinates;const d=polys.flatMap(poly=>poly.map(ring=>'M'+ring.map(pair=>p(pair).map(n=>n.toFixed(1)).join(',')).join('L')+'Z')).join(' ');const country=codeMap[id];const fill=id==='PS-GZ'?'#f7a079':id==='PS-WB'?'#daa788':id==='IL'?'#7398a2':id==='IR'?'#75939c':country?'#476575':'#30495a';const g=svg('g',{},root);svg('path',{d,fill,stroke:'#a9bcc2','stroke-width':regional?.55:1.3,class:'land','fill-rule':'evenodd'},g);if(!regional)svg('path',{d,fill:'url(#dots)','pointer-events':'none'},g);if(country){g.classList.add('geo-link');g.setAttribute('tabindex',0);g.setAttribute('role','button');g.setAttribute('aria-label','Ver registros de '+(countryNames[country]||country));svg('title',{},g,countryNames[country]);g.dataset.country=country;g.dataset.place=f.properties.name;g.setAttribute('aria-label',f.properties.name+' · consultar mortes documentadas');const go=()=>chooseArea(country);g.onclick=go;g.onkeydown=e=>{if(e.key==='Enter'||e.key===' '){e.preventDefault();go()}}}}
$('mapCaption').textContent=regional?'ORIENTE MÉDIO · MAPA REGIONAL':'MEDITERRÂNEO ORIENTAL';$('local').setAttribute('aria-pressed',!regional);$('region').setAttribute('aria-pressed',regional);shadeAtlas(root);
drawMapLabels(root,p,regional);
const bounds=root.getBBox();
if(bounds.width && bounds.height)root.setAttribute('viewBox',[bounds.x-14,bounds.y-14,bounds.width+28,bounds.height+28].join(' '));
}
map();render();
