// Primordial Galaxy interactions: inspect a component, highlight a layer, or trace a solicitation.
import { nodes, edges, LAYERS, STATUS_TEXT, trace } from './data/galaxy.mjs';
import { esc } from './lib/render.mjs';

const map = document.querySelector('.pg-map');
if (map) {
  const panel = document.querySelector('[data-panel]');
  const defaultPanel = panel.innerHTML;
  const nav = document.querySelector('[data-trace-nav]');
  const byId = Object.fromEntries(nodes.map((n) => [n.id, n]));
  const layerName = (id) => (id === 'gate' ? 'Publication boundary' : LAYERS.find((l) => l.id === id).name);
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let step = -1;

  if (!reduce) {
    map.classList.add('pg-arrive');
    try { sessionStorage.removeItem('pg-arrival'); } catch { /* ignore */ }
  }

  const setLit = (ids, edgeFilter) => {
    map.classList.toggle('has-focus', ids.length > 0);
    map.querySelectorAll('[data-node]').forEach((a) => a.classList.toggle('is-lit', ids.includes(a.dataset.node)));
    map.querySelectorAll('.pg-edges line').forEach((l) => l.classList.toggle('is-lit', edgeFilter(l.dataset.from, l.dataset.to)));
  };

  const focusTitle = () => panel.querySelector('h3')?.focus({ preventScroll: true });

  function select(id) {
    exitTrace(false);
    const n = byId[id];
    const out = edges.filter(([a]) => a === id).map(([, b]) => b);
    const inn = edges.filter(([, b]) => b === id).map(([a]) => a);
    const link = (x) => `<button type="button" class="pg-link" data-goto="${x}">${esc(byId[x].name)}</button>`;
    panel.innerHTML = `
      <p class="pg-kicker">${esc(layerName(n.layer))}</p>
      <h3 id="pg-panel-title" tabindex="-1">${esc(n.name)}</h3>
      <p><span class="pg-badge pg-badge--${n.status}">${STATUS_TEXT[n.status]}</span></p>
      <p>${esc(n.body)}</p>
      ${n.measure ? `<p class="pg-measure">${esc(n.measure)}</p>` : ''}
      ${n.module ? `<p class="pg-muted">Source: <code>${esc(n.module)}</code></p>` : ''}
      ${inn.length ? `<p class="pg-muted">Receives from: ${inn.map(link).join(', ')}</p>` : ''}
      ${out.length ? `<p class="pg-muted">Feeds: ${out.map(link).join(', ')}</p>` : ''}
      <button type="button" class="pg-btn pg-btn--ghost" data-reset>Back to the legend</button>`;
    setLit([id, ...inn, ...out], (a, b) => a === id || b === id);
    focusTitle();
  }

  function showStep(i) {
    step = i;
    const s = trace[i];
    const path = trace.slice(0, i + 1).flatMap((x) => x.nodes);
    panel.innerHTML = `
      <p class="pg-kicker">Trace, step ${i + 1} of ${trace.length}</p>
      <h3 id="pg-panel-title" tabindex="-1">${esc(s.title)}</h3>
      <p>${esc(s.body)}</p>
      <p class="pg-muted">Components: ${s.nodes.map((x) => esc(byId[x].name)).join(', ')}</p>`;
    nav.hidden = false;
    nav.querySelector('[data-trace-count]').textContent = `${i + 1} / ${trace.length}`;
    nav.querySelector('[data-trace-prev]').disabled = i === 0;
    nav.querySelector('[data-trace-next]').disabled = i === trace.length - 1;
    map.classList.add('is-tracing');
    setLit(path, (a, b) => path.includes(a) && path.includes(b));
    map.querySelectorAll('[data-node]').forEach((a) => a.classList.toggle('is-current', s.nodes.includes(a.dataset.node)));
    focusTitle();
  }

  function exitTrace(restore = true) {
    if (step === -1 && !restore) return;
    step = -1;
    nav.hidden = true;
    map.classList.remove('is-tracing');
    map.querySelectorAll('.is-current').forEach((a) => a.classList.remove('is-current'));
    if (restore) reset();
  }

  function reset() {
    panel.innerHTML = defaultPanel;
    setLit([], () => false);
  }

  map.addEventListener('click', (e) => {
    const a = e.target.closest('[data-node]');
    if (!a) return;
    e.preventDefault();
    select(a.dataset.node);
  });

  document.addEventListener('click', (e) => {
    const t = e.target;
    if (t.closest('[data-goto]')) select(t.closest('[data-goto]').dataset.goto);
    else if (t.closest('[data-reset]')) { reset(); focusTitle(); }
    else if (t.closest('[data-trace-start]')) showStep(0);
    else if (t.closest('[data-trace-next]') && step < trace.length - 1) showStep(step + 1);
    else if (t.closest('[data-trace-prev]') && step > 0) showStep(step - 1);
    else if (t.closest('[data-trace-exit]')) { exitTrace(); focusTitle(); }
    const chip = t.closest('[data-layer]');
    if (chip) {
      document.querySelectorAll('[data-layer]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      map.dataset.layer = chip.dataset.layer;
    }
  });

  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (step !== -1) exitTrace(); else reset();
  });
}
