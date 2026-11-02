// Wires every simple lead form on the page (multi-step flows wire themselves).
import { wireLeadForm } from './lib/lead.mjs';

for (const form of document.querySelectorAll('form[data-lead]:not([data-custom])')) {
  wireLeadForm(form, { type: form.dataset.lead, subject: form.dataset.subject });
}
