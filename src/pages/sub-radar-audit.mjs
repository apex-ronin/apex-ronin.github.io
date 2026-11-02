import { html, raw, money } from '../lib/html.mjs';
import { field, textarea, checkbox, consent, leadControls, leadResult } from '../components/ui.mjs';
import { subRadar } from '../components/blocks.mjs';
import { site } from '../config.mjs';

const audit = subRadar.offers[0];
const max = subRadar.limits.auditMaxSubs;

export default {
  path: '/sub-radar/audit/',
  title: 'Request a Sub Radar audit',
  description: `Request a ${money(audit.price)} Sub Radar audit: up to ${max} subcontractors checked against the California, Texas and Florida public registries.`,
  scripts: ['/assets/js/audit-flow.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="audit-title">
  <div class="wrap">
    <h1 id="audit-title">Request a Sub Radar audit</h1>
    <p class="lede">${money(audit.price)}, one-time, for up to ${max} subcontractors. Three short steps. You won’t be charged now: we confirm scope by email and invoice before work starts.</p>
  </div>
</section>

<section class="band" aria-label="Audit request form">
  <div class="wrap split">
    <aside>
      <h2>What you’ll get</h2>
      <ul>
        <li>The current registry status of each sub, with every published field</li>
        <li>Red tags and cautions explained in plain language</li>
        <li>A source link and retrieval time for every finding</li>
        <li>A list of anything we could not match, with what we need from you</li>
      </ul>
      <p class="muted">Your list stays in your browser until you submit. We use it only for this audit; see the <a href="/privacy/">privacy notice</a>.</p>
    </aside>

    <div class="form-panel">
      <noscript><p><strong>This form needs JavaScript.</strong> Email your sub list to <a href="mailto:${site.email}">${site.email}</a> with the subject “Sub Radar audit” and we’ll reply with next steps.</p></noscript>
      <form class="form" data-lead="sub-radar-audit" novalidate>
        <ol class="stepper" aria-label="Progress">
          <li data-step-label="1" aria-current="step">Your company</li>
          <li data-step-label="2">Your subs</li>
          <li data-step-label="3">Review</li>
        </ol>

        <fieldset class="step" data-step="1">
          <legend class="visually-hidden">Step 1 of 3: Your company</legend>
          <div class="form-grid">
            ${field({ name: 'company', label: 'Company', required: true, autocomplete: 'organization', max: 150 })}
            ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name', max: 120 })}
            ${field({ name: 'email', label: 'Work email', type: 'email', required: true, autocomplete: 'email', max: 200 })}
            ${field({ name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', max: 40, hint: 'Optional.' })}
          </div>
          <fieldset class="group">
            <legend>Where do your subs work?</legend>
            <div class="checks">
              ${checkbox({ name: 'states', value: 'CA', label: 'California' })}
              ${checkbox({ name: 'states', value: 'TX', label: 'Texas' })}
              ${checkbox({ name: 'states', value: 'FL', label: 'Florida' })}
              ${checkbox({ name: 'states', value: 'Other', label: 'Other states' })}
            </div>
          </fieldset>
          <div class="step-nav"><button class="btn btn--primary" type="button" data-next>Continue to your subs</button></div>
        </fieldset>

        <fieldset class="step" data-step="2" hidden>
          <legend class="visually-hidden">Step 2 of 3: Your subs</legend>
          <div class="field">
            <label for="sub-list">Paste your subcontractor list</label>
            <p class="hint" id="sub-list-hint">One sub per line: name, state, license number. Columns pasted from a spreadsheet work too. A header row is fine.</p>
            <textarea id="sub-list" name="sub_list" rows="8" maxlength="20000" aria-describedby="sub-list-hint" placeholder="Halverson Framing, CA, 1234567"></textarea>
          </div>
          <div class="field">
            <label for="sub-file">Or choose a CSV file</label>
            <input id="sub-file" type="file" accept=".csv,.txt,text/csv,text/plain" data-no-submit>
          </div>
          <div aria-live="polite" data-parse-out></div>
          ${checkbox({ name: 'send_list_later', label: 'I’ll email the list separately' })}
          <div class="step-nav">
            <button class="btn" type="button" data-prev>Back</button>
            <button class="btn btn--primary" type="button" data-next>Review request</button>
          </div>
        </fieldset>

        <fieldset class="step" data-step="3" hidden>
          <legend class="visually-hidden">Step 3 of 3: Review</legend>
          <h2 class="result__title">Check your request</h2>
          <dl class="evidence" data-review></dl>
          ${textarea({ name: 'notes', label: 'Anything we should know?', rows: 3, max: 2000, hint: 'Optional. Deadlines, jobs to prioritize, subs you are worried about.' })}
          ${consent()}
          ${leadControls('Send audit request', 'Email audit request')}
          <div class="step-nav"><button class="btn" type="button" data-prev>Back</button></div>
        </fieldset>
      </form>
      ${leadResult({ sentTitle: 'Audit request received', sentBody: raw(`We’ll reply from ${site.email} to confirm scope and send the invoice. If anything in your list needs clarifying, we’ll ask then.`) })}
    </div>
  </div>
</section>`,
};
