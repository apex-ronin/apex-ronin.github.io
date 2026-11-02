import { html, raw } from '../lib/html.mjs';
import { STATUS } from '../assets/js/data/products.mjs';
import { SIMULATED_NOTICE } from '../assets/js/data/demo-subs.mjs';

export const MARK = raw('<svg class="mark" viewBox="0 0 100 100" aria-hidden="true" focusable="false"><path d="M18 78 50 19 82 78H65L50 49 35 78Z M42 78 50 63 58 78Z" fill="currentColor"/></svg>');

/** Benchmark disc: the survey reference mark. Used only as the public-sector doorway. */
export const BENCHMARK = raw('<svg class="benchmark" viewBox="0 0 48 48" aria-hidden="true" focusable="false"><circle cx="24" cy="24" r="21" fill="none" stroke="currentColor" stroke-width="2"/><circle cx="24" cy="24" r="15" fill="none" stroke="currentColor" stroke-width="1"/><path d="M14 31 24 13 34 31Z" fill="none" stroke="currentColor" stroke-width="2"/><path d="M24 24v-11" stroke="currentColor" stroke-width="1"/></svg>');

/** Inspection tag. tone: clear | caution | red | idle */
export function tag(tone, text, extra = '') {
  return html`<span class="tag tag--${tone} ${extra}"><span class="tag__hole" aria-hidden="true"></span>${text}</span>`;
}

export function statusTag(product) {
  const s = STATUS[product.status];
  return tag(s.tag, s.label);
}

export function simNotice(text = SIMULATED_NOTICE) {
  return html`<p class="sim-notice"><span class="sim-notice__mark" aria-hidden="true"></span>${text}</p>`;
}

let fieldSeq = 0;
const fid = (name) => `f-${name}-${++fieldSeq}`;

export function field({ name, label, type = 'text', required = false, hint = '', autocomplete = '', max = 200, pattern = '', patternMessage = '', placeholder = '', value = '', inputmode = '', id }) {
  const i = id || fid(name);
  const hintId = hint ? `${i}-hint` : '';
  return html`<div class="field">
    <label for="${i}">${label}${required ? html`<span class="req" aria-hidden="true"> *</span>` : ''}</label>
    ${hint ? html`<p class="hint" id="${hintId}">${hint}</p>` : ''}
    <input id="${i}" name="${name}" type="${type}" ${required ? raw('required') : ''} maxlength="${max}"
      ${autocomplete ? raw(`autocomplete="${autocomplete}"`) : ''} ${pattern ? raw(`pattern="${pattern}"`) : ''}
      ${patternMessage ? html`data-pattern-message="${patternMessage}"` : ''}
      ${placeholder ? html`placeholder="${placeholder}"` : ''} ${value ? html`value="${value}"` : ''}
      ${inputmode ? raw(`inputmode="${inputmode}"`) : ''} ${hintId ? raw(`aria-describedby="${hintId}"`) : ''}>
  </div>`;
}

export function textarea({ name, label, required = false, hint = '', max = 4000, rows = 4, placeholder = '', id }) {
  const i = id || fid(name);
  const hintId = hint ? `${i}-hint` : '';
  return html`<div class="field">
    <label for="${i}">${label}${required ? html`<span class="req" aria-hidden="true"> *</span>` : ''}</label>
    ${hint ? html`<p class="hint" id="${hintId}">${hint}</p>` : ''}
    <textarea id="${i}" name="${name}" rows="${rows}" maxlength="${max}" ${required ? raw('required') : ''}
      ${placeholder ? html`placeholder="${placeholder}"` : ''} ${hintId ? raw(`aria-describedby="${hintId}"`) : ''}></textarea>
  </div>`;
}

export function select({ name, label, options, required = false, hint = '', id }) {
  const i = id || fid(name);
  const hintId = hint ? `${i}-hint` : '';
  return html`<div class="field">
    <label for="${i}">${label}${required ? html`<span class="req" aria-hidden="true"> *</span>` : ''}</label>
    ${hint ? html`<p class="hint" id="${hintId}">${hint}</p>` : ''}
    <select id="${i}" name="${name}" ${required ? raw('required') : ''} ${hintId ? raw(`aria-describedby="${hintId}"`) : ''}>
      ${options.map((o) => {
        const [v, l] = Array.isArray(o) ? o : [o, o];
        return html`<option value="${v}">${l}</option>`;
      })}
    </select>
  </div>`;
}

export function checkbox({ name, label, required = false, value = 'on', checked = false, id, dataLabel = 'This box' }) {
  const i = id || fid(name);
  return html`<div class="field field--check">
    <input id="${i}" type="checkbox" name="${name}" value="${value}" ${required ? raw('required') : ''} ${checked ? raw('checked') : ''} data-label="${typeof label === 'string' ? label : dataLabel}">
    <label for="${i}">${label}</label>
  </div>`;
}

export function consent() {
  return checkbox({
    name: 'consent', required: true, dataLabel: 'Agreement to the privacy notice',
    label: html`I agree that Apex Ronin may use these details to answer this request, as described in the <a href="/privacy/">privacy notice</a>.`,
  });
}

/** Shared chrome for every lead form: honeypot, status line, email-mode note, failure fallback. */
export function leadControls(submitLabel, emailLabel = 'Email this request') {
  return html`
    <div class="hp" aria-hidden="true"><label>Leave this empty <input type="text" name="company_site" tabindex="-1" autocomplete="off"></label></div>
    <p class="email-note" data-email-note hidden>Submitting opens your email app with this request filled in, addressed to us. Nothing is sent until you press send there.</p>
    <div class="form-actions">
      <button class="btn btn--primary" type="submit" data-email-label="${emailLabel}">${submitLabel}</button>
      <p class="form-status" role="status" aria-live="polite" tabindex="-1"></p>
    </div>
    <p class="fallback" data-fallback hidden>Prefer email? <a href="mailto:jay@apexronin.com">Send this request by email</a>.</p>`;
}

export function leadResult({ sentTitle, sentBody }) {
  return html`<div class="result" data-result hidden>
    <div data-when="sent" hidden>
      <h2 class="result__title">${sentTitle}</h2>
      <p>${sentBody}</p>
    </div>
    <div data-when="email" hidden>
      <h2 class="result__title">Your request is ready in your email app</h2>
      <p>If your email app did not open, use one of these instead. Send it to <a href="mailto:jay@apexronin.com">jay@apexronin.com</a>.</p>
      <div class="result__actions">
        <a class="btn btn--primary" data-mailto href="mailto:jay@apexronin.com">Open email app</a>
        <button class="btn" type="button" data-copy>Copy request</button>
        <button class="btn" type="button" data-download>Download as .txt</button>
      </div>
      <pre class="request-text" data-request-text tabindex="0"></pre>
    </div>
  </div>`;
}

export function faq(items) {
  return html`<div class="faq">${items.map(([q, a]) => html`<details><summary>${q}</summary><div class="faq__a">${a}</div></details>`)}</div>`;
}
