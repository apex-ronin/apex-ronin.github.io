// Catalog Exception Desk: (1) simulated triage queue, (2) real in-browser feed vs storefront comparison.
import { queue, STAGES, sampleFeedCSV, sampleStoreCSV } from './data/demo-catalog.mjs';
import { parseCSV, toRecords, toCSV } from './lib/csv.mjs';
import { diffCatalog, CATALOG_ALIASES, EXCEPTION_TYPES } from './lib/catalog.mjs';
import { esc, tagHTML } from './lib/render.mjs';

const usd = (n) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });

// ---------- (1) exception queue ----------
const q = document.querySelector('[data-queue]');
if (q) {
  const stage = Object.fromEntries(queue.map((x) => [x.id, 0]));
  let filter = '';
  let selected = '';
  const list = q.querySelector('tbody');
  const detail = q.querySelector('.queue__detail');
  const counts = q.querySelector('[data-counts]');

  const visible = () => queue
    .filter((x) => !filter || x.type === filter)
    .sort((a, b) => (stage[a.id] === 3) - (stage[b.id] === 3) || b.impact - a.impact);

  function render() {
    const open = queue.filter((x) => stage[x.id] < 3);
    counts.innerHTML = `<span><strong>${open.length}</strong> open</span><span><strong>${usd(open.reduce((s, x) => s + x.impact, 0))}</strong> estimated weekly exposure, open items</span><span><strong>${queue.length - open.length}</strong> resolved</span>`;
    list.innerHTML = visible().map((x) => `<tr data-selected="${x.id === selected}">
      <td><button type="button" class="row-btn" data-item="${x.id}">${esc(x.sku)}</button><br><span class="muted">${esc(x.title)}</span></td>
      <td>${esc(EXCEPTION_TYPES[x.type])}</td><td>${stage[x.id] === 3 ? tagHTML('clear', 'Resolved') : tagHTML(x.severity, x.severity === 'red' ? 'Red tag' : 'Caution')}</td>
      <td class="num">${usd(x.impact)}</td><td>${STAGES[stage[x.id]]}</td></tr>`).join('') ||
      '<tr><td colspan="5">No exceptions of this type. Choose All to see the full queue.</td></tr>';
  }

  function showDetail(id, focus = true) {
    const x = queue.find((i) => i.id === id);
    const s = stage[id];
    detail.innerHTML = `<h3 tabindex="-1">${esc(x.sku)}: ${esc(EXCEPTION_TYPES[x.type])}</h3>
      <p>${esc(x.title)}</p>
      <dl class="evidence"><dt>Feed says</dt><dd>${esc(x.feed)}</dd><dt>Storefront shows</dt><dd>${esc(x.store)}</dd>
      <dt>Seen</dt><dd>${esc(x.seen)}</dd><dt>Estimated exposure</dt><dd>${usd(x.impact)} per week (simulated)</dd><dt>Status</dt><dd>${STAGES[s]}</dd></dl>
      <p class="muted">${esc(x.note)}</p>
      <div class="actions">${s < 3 ? `<button class="btn btn--primary" type="button" data-advance="${id}">Mark ${STAGES[s + 1].toLowerCase()}</button>` : ''}
      ${s > 0 ? `<button class="btn" type="button" data-reopen="${id}">Reopen</button>` : ''}</div>`;
    if (focus) detail.querySelector('h3').focus();
  }

  q.addEventListener('click', (e) => {
    const item = e.target.closest('[data-item]');
    const adv = e.target.closest('[data-advance]');
    const re = e.target.closest('[data-reopen]');
    const chip = e.target.closest('[data-filter]');
    if (item) { selected = item.dataset.item; render(); showDetail(selected); }
    if (adv) { stage[adv.dataset.advance] = Math.min(3, stage[adv.dataset.advance] + 1); render(); showDetail(adv.dataset.advance, false); detail.querySelector('button')?.focus(); }
    if (re) { stage[re.dataset.reopen] = 0; render(); showDetail(re.dataset.reopen, false); }
    if (chip) {
      filter = chip.dataset.filter;
      q.querySelectorAll('[data-filter]').forEach((c) => c.setAttribute('aria-pressed', String(c === chip)));
      render();
    }
  });
  render();
}

// ---------- (2) feed vs storefront comparison ----------
const tool = document.querySelector('[data-catalog-tool]');
if (tool) {
  const feedTA = tool.querySelector('#cat-feed');
  const storeTA = tool.querySelector('#cat-store');
  const out = tool.querySelector('[data-out]');
  let lastCSV = '';

  for (const [input, ta] of [[tool.querySelector('#cat-feed-file'), feedTA], [tool.querySelector('#cat-store-file'), storeTA]]) {
    input.addEventListener('change', () => {
      const f = input.files?.[0];
      if (!f) return;
      if (f.size > 5_000_000) { out.innerHTML = '<p class="field-error">Files over 5 MB are too large for the in-browser check. Send it to us instead.</p>'; return; }
      const r = new FileReader();
      r.onload = () => { ta.value = String(r.result); };
      r.readAsText(f);
    });
  }

  tool.querySelector('[data-sample]').addEventListener('click', () => { feedTA.value = sampleFeedCSV; storeTA.value = sampleStoreCSV; run(true); });
  tool.querySelector('[data-clear]').addEventListener('click', () => { tool.reset(); out.innerHTML = ''; feedTA.focus(); });
  tool.addEventListener('submit', (e) => { e.preventDefault(); run(false); });

  function load(text, label) {
    const rows = parseCSV(text, { maxRows: 20000 });
    const { records, missing } = toRecords(rows, CATALOG_ALIASES);
    if (missing.includes('sku')) throw new Error(`${label}: no SKU column found. Name a column sku, id or product id.`);
    return records;
  }

  function run(isSample) {
    try {
      if (!feedTA.value.trim() || !storeTA.value.trim()) throw new Error('Add both a feed export and a storefront snapshot.');
      const { exceptions, counts, compared } = diffCatalog(load(feedTA.value, 'Feed export'), load(storeTA.value, 'Storefront snapshot'));
      lastCSV = toCSV([['sku', 'type', 'severity', 'message', 'feed', 'storefront'], ...exceptions.map((x) => [x.sku, EXCEPTION_TYPES[x.type], x.severity, x.message, x.feed, x.store])]);
      out.innerHTML = `${isSample ? '<p class="sim-notice"><span class="sim-notice__mark" aria-hidden="true"></span>Sample files. Products and prices are invented.</p>' : ''}
        <p><strong>${compared.toLocaleString()} SKUs compared, ${exceptions.length} exception${exceptions.length === 1 ? '' : 's'}.</strong>
        ${Object.entries(counts).map(([k, v]) => `${esc(EXCEPTION_TYPES[k])}: ${v}`).join('; ')}</p>
        ${exceptions.length ? `<div class="scroll-box"><table class="data-table"><thead><tr><th scope="col">SKU</th><th scope="col">Exception</th><th scope="col">Tag</th><th scope="col">Feed</th><th scope="col">Storefront</th></tr></thead>
        <tbody>${exceptions.slice(0, 500).map((x) => `<tr><td>${esc(x.sku)}</td><td>${esc(x.message)}</td><td>${tagHTML(x.severity, x.severity === 'red' ? 'Red tag' : 'Caution')}</td><td>${esc(x.feed)}</td><td>${esc(x.store)}</td></tr>`).join('')}</tbody></table></div>
        <div class="actions"><button class="btn" type="button" data-export>Download exceptions as CSV</button></div>` : '<p>No exceptions. Feed and storefront agree on every compared field.</p>'}`;
    } catch (err) {
      out.innerHTML = `<p class="field-error">${esc(err.message)}</p>`;
    }
  }

  out.addEventListener('click', (e) => {
    if (!e.target.closest('[data-export]')) return;
    const url = URL.createObjectURL(new Blob([lastCSV], { type: 'text/csv;charset=utf-8' }));
    const a = Object.assign(document.createElement('a'), { href: url, download: 'catalog-exceptions.csv' });
    document.body.append(a); a.click(); a.remove();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  });
}
