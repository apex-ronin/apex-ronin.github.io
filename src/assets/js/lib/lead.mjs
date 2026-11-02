// Lead capture. Two delivery modes, chosen by site config at build time:
//   endpoint - POST JSON to LEAD_ENDPOINT (see /worker for the reference Cloudflare Worker)
//   email    - no endpoint configured: validate, then hand the request to the visitor's email app
// No third-party scripts, no tracking. Nothing leaves the browser until the visitor submits.

export function getConfig() {
  try { return JSON.parse(document.getElementById('site-config')?.textContent || '{}'); }
  catch { return {}; }
}

const MAX_FIELD = 8000;

export function serializeForm(form) {
  const data = {};
  for (const el of form.elements) {
    if (!el.name || el.disabled || el.dataset.noSubmit !== undefined) continue;
    if ((el.type === 'checkbox' || el.type === 'radio') && !el.checked) continue;
    const v = String(el.value).slice(0, MAX_FIELD);
    if (el.type === 'checkbox' && data[el.name] !== undefined) {
      data[el.name] = [].concat(data[el.name], v);
    } else data[el.name] = el.type === 'checkbox' && el.value === 'on' ? true : v;
  }
  return data;
}

export function formatLeadText(payload) {
  const lines = [`Request type: ${payload.type}`, `Page: ${payload.page}`, ''];
  for (const [k, v] of Object.entries(payload.fields)) {
    const label = k.replace(/[-_]/g, ' ');
    const val = Array.isArray(v) ? v.join(', ') : v === true ? 'yes' : v;
    if (String(val).includes('\n')) lines.push(`${label}:`, String(val), '');
    else lines.push(`${label}: ${val}`);
  }
  return lines.join('\n');
}

export function mailtoHref(email, subject, body, maxLen = 1800) {
  let b = body;
  const note = '\n\n[Request truncated for email. The full text is attached or pasted below.]';
  if (encodeURIComponent(b).length > maxLen) {
    while (b.length && encodeURIComponent(b + note).length > maxLen) b = b.slice(0, Math.floor(b.length * 0.9));
    b += note;
  }
  return `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(b)}`;
}

// ---------- validation UI ----------

function messageFor(el) {
  const v = el.validity;
  const label = el.dataset.label || el.labels?.[0]?.textContent?.replace('*', '').trim() || 'This field';
  if (v.valueMissing) {
    if (el.type === 'checkbox') return `${label} is required.`;
    if (el.type === 'radio' || el.tagName === 'SELECT') return `Choose ${label.toLowerCase()}.`;
    return `Enter ${label.toLowerCase()}.`;
  }
  if (v.typeMismatch && el.type === 'email') return 'Enter an email address like name@company.com.';
  if (v.patternMismatch) return el.dataset.patternMessage || `Check the format of ${label.toLowerCase()}.`;
  if (v.tooLong) return `${label} is too long.`;
  if (v.customError) return el.validationMessage;
  return `Check ${label.toLowerCase()}.`;
}

export function setFieldError(el, msg) {
  const id = `${el.id}-error`;
  let node = document.getElementById(id);
  if (!msg) {
    el.removeAttribute('aria-invalid');
    node?.remove();
    el.setAttribute('aria-describedby', (el.getAttribute('aria-describedby') || '').split(' ').filter((x) => x && x !== id).join(' '));
    return;
  }
  el.setAttribute('aria-invalid', 'true');
  if (!node) {
    node = document.createElement('p');
    node.id = id;
    node.className = 'field-error';
    (el.closest('.field') || el.parentElement).append(node);
    el.setAttribute('aria-describedby', `${el.getAttribute('aria-describedby') || ''} ${id}`.trim());
  }
  node.textContent = msg;
}

/** Validate fields inside `scope` (a form or a step). Returns the first invalid element or null. */
export function validateScope(scope) {
  let first = null;
  const radios = new Set();
  for (const el of scope.querySelectorAll('input, select, textarea')) {
    if (el.disabled || el.type === 'hidden' || el.closest('[hidden]') || el.dataset.noSubmit !== undefined) continue;
    if (el.type === 'radio') { if (radios.has(el.name)) continue; radios.add(el.name); }
    if (el.checkValidity()) { setFieldError(el, null); continue; }
    setFieldError(el, messageFor(el));
    first ||= el;
  }
  return first;
}

// ---------- submission ----------

export async function postLead(endpoint, payload, { timeoutMs = 15000, fetchImpl = fetch } = {}) {
  const ctrl = new AbortController();
  const t = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetchImpl(endpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: ctrl.signal,
      credentials: 'omit',
    });
    if (!res.ok) {
      let detail = '';
      try { detail = (await res.json()).error || ''; } catch { /* ignore */ }
      throw new Error(detail || `The server answered ${res.status}.`);
    }
    return true;
  } catch (err) {
    if (err.name === 'AbortError') throw new Error('The request timed out.');
    if (err instanceof TypeError) throw new Error('The request could not reach our server.');
    throw err;
  } finally { clearTimeout(t); }
}

function download(name, text) {
  const url = URL.createObjectURL(new Blob([text], { type: 'text/plain;charset=utf-8' }));
  const a = Object.assign(document.createElement('a'), { href: url, download: name });
  document.body.append(a); a.click(); a.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/**
 * Wire a lead form.
 * Markup contract: form[data-lead=TYPE] containing .form-status, [data-result] panel (hidden),
 * a hidden honeypot input[name=company_site], and a submit button.
 */
export function wireLeadForm(form, { type, subject, collect = serializeForm, beforeSubmit } = {}) {
  const cfg = getConfig();
  const endpoint = cfg.leadEndpoint || '';
  const email = cfg.email || 'jay@apexronin.com';
  const started = Date.now();
  const button = form.querySelector('[type=submit]');
  const status = form.querySelector('.form-status');
  const result = form.parentElement.querySelector('[data-result]');
  const mode = endpoint ? 'endpoint' : 'email';
  form.dataset.mode = mode;
  if (mode === 'email' && button) {
    button.textContent = button.dataset.emailLabel || 'Email this request';
    form.querySelector('[data-email-note]')?.removeAttribute('hidden');
  }

  form.addEventListener('input', (e) => {
    const t = e.target.type === 'radio' ? form.querySelector(`input[type=radio][name="${CSS.escape(e.target.name)}"]`) : e.target;
    if (t.getAttribute('aria-invalid') === 'true' && t.checkValidity()) setFieldError(t, null);
  });

  form.addEventListener('submit', async (e) => {
    e.preventDefault();
    if (form.dataset.busy) return;
    if (beforeSubmit && beforeSubmit() === false) return;
    const invalid = validateScope(form);
    if (invalid) {
      status.textContent = 'Some fields need attention.';
      status.dataset.tone = 'error';
      invalid.focus();
      return;
    }
    const fields = collect(form);
    const honeypot = fields.company_site;
    delete fields.company_site;
    const payload = { type, page: location.pathname, submittedAt: new Date().toISOString(), elapsedMs: Date.now() - started, fields };
    const text = formatLeadText(payload);

    if (honeypot) { showResult('sent'); return; } // silently drop bot submissions

    if (mode === 'email') {
      showResult('email', text);
      window.location.href = mailtoHref(email, subject || `Apex Ronin: ${type}`, text);
      return;
    }

    form.dataset.busy = '1';
    form.setAttribute('aria-busy', 'true');
    button.disabled = true;
    const label = button.textContent;
    button.textContent = 'Sending…';
    status.dataset.tone = '';
    status.textContent = 'Sending your request.';
    try {
      await postLead(endpoint, payload);
      showResult('sent');
    } catch (err) {
      status.dataset.tone = 'error';
      status.textContent = `Not sent. ${err.message} Your entries are still here. Try again, or email the request instead.`;
      const fb = form.querySelector('[data-fallback]');
      if (fb) {
        fb.hidden = false;
        fb.querySelector('a').href = mailtoHref(email, subject || `Apex Ronin: ${type}`, text);
      }
      status.focus();
    } finally {
      delete form.dataset.busy;
      form.removeAttribute('aria-busy');
      button.disabled = false;
      button.textContent = label;
    }
  });

  function showResult(kind, text = '') {
    if (!result) return;
    result.querySelector(`[data-when="sent"]`)?.toggleAttribute('hidden', kind !== 'sent');
    result.querySelector(`[data-when="email"]`)?.toggleAttribute('hidden', kind !== 'email');
    if (kind === 'email') {
      const pre = result.querySelector('[data-request-text]');
      if (pre) pre.textContent = text;
      result.querySelector('[data-copy]')?.addEventListener('click', async (ev) => {
        try { await navigator.clipboard.writeText(text); ev.target.textContent = 'Copied'; }
        catch { ev.target.textContent = 'Select the text above to copy'; }
      });
      result.querySelector('[data-download]')?.addEventListener('click', () => download('apex-ronin-request.txt', text));
      const mail = result.querySelector('[data-mailto]');
      if (mail) mail.href = mailtoHref(email, subject || `Apex Ronin: ${type}`, text);
    }
    form.hidden = true;
    result.hidden = false;
    const h = result.querySelector('h2, h3');
    h?.setAttribute('tabindex', '-1');
    h?.focus();
  }
}
