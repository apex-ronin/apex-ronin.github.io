// Contact page: route the visitor to the right product as soon as they say what they need.
import { wireLeadForm } from './lib/lead.mjs';

const form = document.querySelector('form[data-lead="contact"]');
if (form) {
  const box = form.querySelector('[data-recommend]');
  const recs = JSON.parse(document.getElementById('needs-data')?.textContent || '[]');
  const show = (v) => {
    const r = recs.find((x) => x[0] === v);
    if (!r) return;
    box.hidden = false;
    box.replaceChildren();
    const p = document.createElement('p');
    p.textContent = r[2] + ' ';
    if (r[3]) {
      const a = document.createElement('a');
      a.href = r[3]; a.textContent = r[4];
      p.append(a, document.createTextNode('. Or keep going here and we’ll reply.'));
    }
    box.append(p);
  };
  form.addEventListener('change', (e) => { if (e.target.name === 'need') show(e.target.value); });
  const pre = new URLSearchParams(location.search).get('interest');
  const radio = pre && form.querySelector(`input[name=need][value="${CSS.escape(pre)}"]`);
  if (radio) { radio.checked = true; show(pre); }
  wireLeadForm(form, { type: 'contact', subject: 'Apex Ronin inquiry' });
}
