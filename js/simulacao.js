
(() => {
  const chart = document.getElementById('simulationPlot');
  const figure = chart.closest('figure');
  const value = document.getElementById('simulationValue');
  const status = document.getElementById('simulationStatus');
  const button = document.getElementById('simulationPause');
  const grid = chart.querySelector('.simulationGrid');
  const line = chart.querySelector('.simulationLine');
  const fill = chart.querySelector('.simulationArea');
  const dot = chart.querySelector('.simulationDot');
  const counts = [18, 18, 19, 19, 19, 21, 21, 22, 22, 22, 23, 24];
  const changes = [0, 1, 0, 2, 0, 1, 1, 0, 2, 1, 0, 1, 0, 1];
  const format = new Intl.NumberFormat('pt-BR');
  const motion = matchMedia('(prefers-reduced-motion: reduce)');
  const initialStatus = status.textContent;
  let index = 0;
  let pause = false;
  let onScreen = false;
  let clock = null;

  function axisElement(tag, attrs) {
    const element = document.createElementNS(chart.namespaceURI, tag);
    for (const [name, value] of Object.entries(attrs)) element.setAttribute(name, value);
    grid.append(element);
    return element;
  }

  function draw() {
    const latest = counts.at(-1);
    value.textContent = format.format(latest);
    const bottom = 79;
    const left = 34;
    const right = 292;
    const step = Math.max(2, Math.ceil((latest - counts[0]) / 2));
    const min = Math.floor(counts[0] / step) * step;
    const max = Math.max(min + 2 * step, Math.ceil(latest / step) * step);
    const y = total => bottom - (total - min) / (max - min) * 65;
    const points = counts.map((total, i) => [left + (right - left) * i / (counts.length - 1), y(total)]);
    const trace = points.map(([x, y], i) => (i ? 'L' : 'M') + x.toFixed(2) + ',' + y.toFixed(2)).join(' ');

    grid.replaceChildren();
    for (const tick of [max, Math.round((min + max) / 2), min]) {
      const mark = y(tick);
      axisElement('line', { x1: left, x2: right, y1: mark, y2: mark });
      axisElement('text', { x: left - 5, y: mark + 4, 'text-anchor': 'end' }).textContent = format.format(tick);
    }

    line.setAttribute('d', trace);
    fill.setAttribute('d', trace + ' L' + right + ',' + bottom + ' H' + left + ' Z');
    dot.setAttribute('cx', right);
    dot.setAttribute('cy', y(latest));
  }

  function advance() {
    const previous = counts.at(-1);
    const next = previous + changes[index % changes.length];
    index += 1;
    counts.push(next);
    counts.shift();
    draw();
    if (!motion.matches) {
      line.animate([{ opacity: .48 }, { opacity: 1 }], { duration: 340, easing: 'ease-out' });
      if (next !== previous) value.animate([{ opacity: .6 }, { opacity: 1 }], { duration: 420 });
    }
  }

  function syncClock() {
    const running = onScreen && !pause && !document.hidden;
    if (running && clock === null) clock = setInterval(advance, 4000);
    if (!running && clock !== null) {
      clearInterval(clock);
      clock = null;
    }
  }

  button.addEventListener('click', () => {
    pause = !pause;
    button.textContent = pause ? 'Retomar' : 'Pausar';
    button.setAttribute('aria-label', pause ? 'Retomar simulação' : 'Pausar simulação');
    status.textContent = pause ? 'Simulação pausada · últimas 12 leituras.' : initialStatus;
    syncClock();
  });

  draw();
  new IntersectionObserver(([entry]) => {
    onScreen = entry.isIntersecting;
    syncClock();
  }).observe(figure);
  document.addEventListener('visibilitychange', syncClock);
})();

