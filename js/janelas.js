
(() => {
  const analysis = $('atlas-analysis');
  const labels = { indicadores: 'Indicadores', mapa: 'Mapa regional', dados: 'Registros' };
  const panes = Object.fromEntries(Object.keys(labels).map(id => [id, $(id)]));

  const deck = element('nav');
  deck.className = 'windowDeck';
  deck.setAttribute('aria-label', 'Janelas de análise');

  const metrics = element('span');
  metrics.className = 'windowThumb windowMetrics';
  for (const card of $('cards').querySelectorAll('.card')) {
    const cell = element('span');
    cell.append(element('small', card.querySelector('b').textContent), element('strong', card.querySelector('strong').textContent));
    metrics.append(cell);
  }

  const mapThumb = element('span');
  mapThumb.className = 'windowThumb';
  const mapPreview = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  mapPreview.setAttribute('viewBox', homeMap.getAttribute('viewBox'));
  for (const land of homeMap.querySelectorAll('.geo-link .land')) {
    const path = document.createElementNS(mapPreview.namespaceURI, 'path');
    path.setAttribute('d', land.getAttribute('d'));
    path.setAttribute('fill', '#5a646d');
    path.setAttribute('stroke', '#9aa2a5');
    path.setAttribute('stroke-width', '.8');
    path.setAttribute('fill-rule', 'evenodd');
    mapPreview.append(path);
  }
  mapThumb.append(mapPreview);

  const records = element('span');
  records.className = 'windowThumb';
  const previewPlot = $('results').querySelector('.semesterPlot')?.cloneNode(true);
  if (previewPlot) previewPlot.querySelectorAll('[tabindex]').forEach(point => point.removeAttribute('tabindex'));
  records.append(previewPlot || element('small', 'Consultar registros'));
  const thumbs = { indicadores: metrics, mapa: mapThumb, dados: records };

  const dialog = element('dialog');
  dialog.className = 'atlasWindow';
  dialog.id = 'atlasWindow';
  const bar = element('div');
  bar.className = 'atlasWindowBar';
  const tabs = element('div');
  tabs.className = 'atlasPanelTabs';
  tabs.setAttribute('role', 'group');
  tabs.setAttribute('aria-label', 'Seções da análise');
  const close = element('button', 'Fechar ×');
  close.className = 'atlasWindowClose';
  close.type = 'button';
  close.autofocus = true;
  const stage = element('div');
  stage.className = 'atlasWindowMain';

  const tileByPanel = {};
  const tabByPanel = {};
  for (const [id, name] of Object.entries(labels)) {
    const tile = element('a');
    tileByPanel[id] = tile;
    tile.href = '#' + id;
    tile.className = 'windowTile';
    tile.dataset.panel = id;
    tile.setAttribute('aria-haspopup', 'dialog');
    const caption = element('span', name);
    caption.className = 'windowTileName';
    const arrow = element('span', '↗');
    arrow.setAttribute('aria-hidden', 'true');
    caption.append(arrow);
    thumbs[id].setAttribute('aria-hidden', 'true');
    tile.append(caption, thumbs[id]);
    deck.append(tile);

    const tab = element('button', name);
    tabByPanel[id] = tab;
    tab.type = 'button';
    tab.setAttribute('aria-controls', id);
    tab.onclick = () => openPanel(id, tab);
    tabs.append(tab);

    panes[id].querySelector('h2').id = 'atlas-heading-' + id;
    panes[id].hidden = true;
    stage.append(panes[id]);
  }
  bar.append(tabs, close);
  dialog.append(bar, stage, $('regionalDeath'));
  analysis.append(deck, dialog);

  let opener;
  let pagePosition;
  let activeId;
  let windowMotion;
  let contentMotion;
  let closing = false;
  const easing = 'cubic-bezier(.22,.75,.25,1)';

  function zoomFrom(source, bounds) {
    if (!source || source.bottom < 0 || source.top > innerHeight) return 'scale(.82)';
    const dx = source.x + source.width / 2 - bounds.x - bounds.width / 2;
    const dy = source.y + source.height / 2 - bounds.y - bounds.height / 2;
    const scale = Math.max(.28, Math.min(.78, source.width / bounds.width));
    return 'translate(' + dx + 'px,' + dy + 'px) scale(' + scale + ')';
  }

  function openPanel(id, trigger) {
    if (closing || !Object.hasOwn(panes, id) || (dialog.open && activeId === id)) return;
    const alreadyOpen = dialog.open;
    const origin = trigger?.getBoundingClientRect();
    $('geo').dispatchEvent(new Event('reset-map-hint'));
    activeId = id;
    for (const key of Object.keys(panes)) {
      panes[key].hidden = key !== id;
      tabByPanel[key].setAttribute('aria-pressed', String(key === id));
    }
    dialog.setAttribute('aria-labelledby', 'atlas-heading-' + id);
    if (!alreadyOpen) {
      opener = trigger || tileByPanel[id];
      pagePosition = { left: scrollX, top: scrollY, behavior: 'instant' };
      dialog.showModal();
    }
    stage.scrollTop = 0;
    (tabs.contains(trigger) ? trigger : close).focus({ preventScroll: true });
    if (id === 'mapa') {
      map();
      syncHighlight();
    }

    contentMotion?.cancel();
    if (alreadyOpen) {
      contentMotion = stage.animate(
        [{ opacity: .36, transform: 'translateY(8px)', filter: 'blur(3px)' }, { opacity: 1, transform: 'none', filter: 'blur(0)' }],
        { duration: 235, easing },
      );
      return;
    }
    windowMotion?.cancel();
    windowMotion = dialog.animate(
      [{ opacity: .45, transform: zoomFrom(origin, dialog.getBoundingClientRect()) },
       { opacity: 1, transform: 'none' }],
      { duration: 350, easing },
    );
  }

  function closePanel() {
    if (closing || !dialog.open) return;
    closing = true;
    dialog.dataset.closing = '';
    $('geo').dispatchEvent(new Event('reset-map-hint'));
    const style = getComputedStyle(dialog);
    const start = { opacity: style.opacity, transform: style.transform };
    windowMotion?.cancel();
    contentMotion?.cancel();
    const target = zoomFrom(opener?.getBoundingClientRect(), dialog.getBoundingClientRect());
    windowMotion = dialog.animate(
      [start, { opacity: 0, transform: target }],
      { duration: 235, easing: 'cubic-bezier(.45,0,.78,.32)', fill: 'forwards' },
    );
    windowMotion.onfinish = () => dialog.close();
  }

  tabs.addEventListener('keydown', event => {
    const keys = Object.keys(labels);
    const current = keys.findIndex(key => tabByPanel[key] === document.activeElement);
    if (current < 0 || !['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(event.key)) return;
    event.preventDefault();
    let next = (current + (event.key === 'ArrowRight' ? 1 : -1) + keys.length) % keys.length;
    if (event.key === 'Home') next = 0;
    if (event.key === 'End') next = keys.length - 1;
    const id = keys[next];
    openPanel(id, tabByPanel[id]);
  });
  document.querySelectorAll('[data-panel]').forEach(link => {
    link.setAttribute('aria-controls', dialog.id);
    link.addEventListener('click', event => {
      event.preventDefault();
      openPanel(link.dataset.panel, link);
    });
  });
  document.addEventListener('atlas:open-panel', event => openPanel(event.detail));
  stage.addEventListener('scroll', () => $('geo').dispatchEvent(new Event('reset-map-hint')), { passive: true });
  close.onclick = closePanel;
  dialog.addEventListener('cancel', event => {
    event.preventDefault();
    closePanel();
  });
  dialog.addEventListener('click', event => {
    if (event.target !== dialog) return;
    const rect = dialog.getBoundingClientRect();
    if (event.clientX < rect.left || event.clientX > rect.right ||
        event.clientY < rect.top || event.clientY > rect.bottom) closePanel();
  });
  dialog.addEventListener('close', () => {
    if (dialog.open) return;
    windowMotion?.cancel();
    delete dialog.dataset.closing;
    closing = false;
    $('geo').dispatchEvent(new Event('reset-map-hint'));
    opener?.focus({ preventScroll: true });
    if (pagePosition) window.scrollTo(pagePosition);
  });
  if (Object.hasOwn(panes, location.hash.slice(1))) openPanel(location.hash.slice(1));
})();
