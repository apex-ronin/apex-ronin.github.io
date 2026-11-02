// Sub Radar audit request: three-step intake with client-side sub list parsing.
import { parseCSV, toCSV } from './lib/csv.mjs';
import { checkLicenseFormat } from './data/registries.mjs';
import { byId } from './data/products.mjs';
import { wireLeadForm, validateScope, serializeForm, setFieldError } from './lib/lead.mjs';
import { esc } from './lib/render.mjs';

const form = document.querySelector('form[data-lead="sub-radar-audit"]');
if (form) {
  const MAX = byId['sub-radar'].limits.auditMaxSubs;
  const steps = [...form.querySelectorAll('.step')];
  const labels = [...form.querySelectorAll('[data-step-label]')];
  const list = form.querySelector('#sub-list');
  const file = form.querySelector('#sub-file');
  const later = form.querySelector('[name=send_list_later]');
  const out = form.querySelector('[data-parse-out]');
  let parsed = [];
  let current = 0;

  const STATE = { california: 'CA', ca: 'CA', texas: 'TX', tx: 'TX', florida: 'FL', fl: 'FL' };

  function parseList() {
    parsed = [];
    const text = list.value.trim();
    if (!text) { out.innerHTML = ''; return; }
    let rows;
    try { rows = parseCSV(text, { maxRows: 2000 }); }
    catch (e) { out.innerHTML = `<p class="field-error">${esc(e.message)}</p>`; return; }
    if (rows.length && /name|license|state/i.test(rows[0].join(' '))) rows = rows.slice(1);
    parsed = rows.map((r, i) => {
      const [name = '', st = '', lic = ''] = r.map((v) => v.trim());
      const state = STATE[st.toLowerCase()] || st.toUpperCase().slice(0, 12);
      const check = checkLicenseFormat(state, lic);
      return { line: i + 1, name, state, license: lic, check };
    }).filter((r) => r.name || r.license);
    const issues = parsed.filter((r) => !r.name || !r.check.ok);
    const over = parsed.length > MAX;
    out.innerHTML = `
      <p><strong>${parsed.length} subcontractor${parsed.length === 1 ? '' : 's'} read.</strong>
      ${issues.length ? `${issues.length} need a second look. You can still send the list; we’ll confirm those with you.` : 'Every line has a name and a plausible license number.'}</p>
      ${over ? `<p class="field-error">That is more than the ${MAX} included in an audit. Send it anyway and we’ll quote the full list, or move the extra subs to monitoring.</p>` : ''}
      <div class="scroll-box"><table class="data-table"><thead><tr><th scope="col">Line</th><th scope="col">Name</th><th scope="col">State</th><th scope="col">License</th><th scope="col">Format check</th></tr></thead>
      <tbody>${parsed.slice(0, 200).map((r) => `<tr><td>${r.line}</td><td>${esc(r.name) || '<em>missing</em>'}</td><td>${esc(r.state)}</td><td>${esc(r.license)}</td>
        <td>${!r.name ? 'Name missing' : r.check.ok ? (r.check.unchecked ? 'Not a covered state' : 'Looks right') : esc(r.check.reason)}</td></tr>`).join('')}</tbody></table></div>
      <p class="hint">The format check catches typos only. Whether a license exists and what it shows is what the audit finds out.</p>`;
  }

  let t;
  list.addEventListener('input', () => { clearTimeout(t); t = setTimeout(parseList, 250); });
  file.addEventListener('change', () => {
    const f = file.files?.[0];
    if (!f) return;
    if (f.size > 1_000_000) { setFieldError(file, 'That file is over 1 MB. Paste the rows instead, or email the file.'); return; }
    setFieldError(file, null);
    const reader = new FileReader();
    reader.onload = () => { list.value = String(reader.result).slice(0, 20000); parseList(); };
    reader.onerror = () => setFieldError(file, 'The file could not be read. Paste the rows instead.');
    reader.readAsText(f);
  });

  function show(i) {
    steps.forEach((s, n) => { s.hidden = n !== i; });
    labels.forEach((l, n) => (n === i ? l.setAttribute('aria-current', 'step') : l.removeAttribute('aria-current')));
    current = i;
    if (i === 2) review();
    const target = steps[i].querySelector('input:not([type=hidden]), textarea, h2');
    if (target) { if (target.tagName === 'H2') target.setAttribute('tabindex', '-1'); target.focus(); }
  }

  function stepValid(i) {
    if (i === 1) {
      parseList();
      list.setCustomValidity(!parsed.length && !later.checked ? 'Paste at least one subcontractor, or tick “I’ll email the list separately”.' : '');
    }
    const bad = validateScope(steps[i]);
    if (bad) { bad.focus(); return false; }
    return true;
  }

  later.addEventListener('change', () => { list.setCustomValidity(''); setFieldError(list, null); });

  function review() {
    const d = serializeForm(form);
    const states = [].concat(d.states || []).join(', ') || 'Not specified';
    const rows = [
      ['Company', d.company], ['Contact', `${d.name}, ${d.email}${d.phone ? `, ${d.phone}` : ''}`], ['States', states],
      ['Subcontractors', parsed.length ? `${parsed.length} in the list${parsed.length > MAX ? ` (over the ${MAX} included; we’ll quote)` : ''}` : 'Sending separately by email'],
      ['Price', parsed.length > MAX ? 'Quoted after review' : '$149, invoiced after we confirm scope'],
    ];
    form.querySelector('[data-review]').innerHTML = rows.map(([k, v]) => `<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`).join('');
  }

  form.addEventListener('click', (e) => {
    if (e.target.closest('[data-next]') && stepValid(current)) show(current + 1);
    if (e.target.closest('[data-prev]')) show(current - 1);
  });

  wireLeadForm(form, {
    type: 'sub-radar-audit',
    subject: 'Sub Radar audit request',
    // Enter key inside steps 1-2 advances instead of submitting a partial request.
    beforeSubmit: () => {
      if (current < steps.length - 1) { if (stepValid(current)) show(current + 1); return false; }
      return true;
    },
    collect: (f) => {
      const d = serializeForm(f);
      d.sub_count = parsed.length;
      d.sub_list = parsed.length ? toCSV([['name', 'state', 'license'], ...parsed.map((r) => [r.name, r.state, r.license])]) : '';
      return d;
    },
  });
}
