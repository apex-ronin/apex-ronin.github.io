// Sub Radar sample risk dashboard (simulated data): filter, sort, and inspect the evidence trail.
import { subs, events, stateAt, sampleHash, SEVERITY_RANK } from './data/demo-subs.mjs';
import { registries, fieldLabels } from './data/registries.mjs';
import { esc, tagHTML } from './lib/render.mjs';

const root = document.querySelector('[data-dashboard]');
if (root) {
  const DAY = 30;
  const START = Date.UTC(2026, 9, 1); // sample month: Oct 2026
  const dateOf = (d) => new Date(START + d * 86400000).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', timeZone: 'UTC' });
  const reg = Object.fromEntries(registries.map((r) => [r.id, r]));
  const st = stateAt(DAY);
  const tbody = root.querySelector('tbody');
  const detail = root.querySelector('.dash__detail');
  const count = root.querySelector('[data-count]');
  const fState = root.querySelector('[name=f-state]');
  const fTag = root.querySelector('[name=f-tag]');
  let selected = '';

  const lastEvent = (id) => events.filter((e) => e.sub === id && e.day <= DAY).at(-1);

  function rows() {
    return subs
      .filter((s) => !fState.value || s.state === fState.value)
      .filter((s) => !fTag.value || st[s.id].tag === fTag.value)
      .sort((a, b) => SEVERITY_RANK[st[b.id].tag] - SEVERITY_RANK[st[a.id].tag] || a.name.localeCompare(b.name));
  }

  function renderTable() {
    const list = rows();
    count.textContent = `${list.length} of ${subs.length} subcontractors shown`;
    if (!list.length) {
      tbody.innerHTML = '<tr><td colspan="5">No subcontractors match these filters. Clear a filter to see more.</td></tr>';
      return;
    }
    tbody.innerHTML = list.map((s) => {
      const e = lastEvent(s.id);
      return `<tr data-selected="${s.id === selected}">
        <td><button type="button" class="row-btn" data-sub="${s.id}">${esc(s.name)}</button><br><span class="muted">${esc(s.trade)}</span></td>
        <td>${esc(s.state)}</td><td>${esc(s.license)}</td>
        <td>${tagHTML(st[s.id].tag)}</td>
        <td>${e ? `${esc(e.title)}<br><span class="muted">${dateOf(e.day)}</span>` : '<span class="muted">No change this month</span>'}</td>
      </tr>`;
    }).join('');
  }

  function renderDetail(id) {
    const s = subs.find((x) => x.id === id);
    if (!s) return;
    const r = reg[s.state];
    const hist = events.filter((e) => e.sub === id && e.day <= DAY).reverse();
    detail.innerHTML = `
      <h3 tabindex="-1">${esc(s.name)}</h3>
      <p>${tagHTML(st[id].tag)} <span class="muted">${esc(s.trade)}, on ${s.jobs} active job${s.jobs === 1 ? '' : 's'}</span></p>
      <dl class="evidence">
        <dt>Registry</dt><dd><a href="${r.url}" rel="noopener">${esc(r.agency)}</a></dd>
        <dt>License</dt><dd>${esc(s.license)}</dd>
        <dt>Last checked</dt><dd>${dateOf(DAY)}, 6:10 am PT</dd>
        <dt>Snapshot</dt><dd><code>${sampleHash(id + DAY)}</code></dd>
      </dl>
      <h4>Change history this month</h4>
      ${hist.length ? `<ol class="quiet-list">${hist.map((e) => `<li>${tagHTML(e.severity)} <strong>${esc(e.title)}</strong><br>
        <span class="muted">${esc(fieldLabels[e.field])}: </span><span class="diff-from">${esc(e.from)}</span> to <span class="diff-to">${esc(e.to)}</span><br>
        <span class="muted">${dateOf(e.day)}. ${esc(e.detail)}</span></li>`).join('')}</ol>`
        : '<p class="muted">No changes this month. The record matched the previous check every time.</p>'}`;
    detail.querySelector('h3').focus();
  }

  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-sub]');
    if (!b) return;
    selected = b.dataset.sub;
    renderTable();
    renderDetail(selected);
  });
  fState.addEventListener('change', renderTable);
  fTag.addEventListener('change', renderTable);
  renderTable();
}
