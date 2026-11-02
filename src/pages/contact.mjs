import { html, jsonScript } from '../lib/html.mjs';
import { field, textarea, consent, leadControls, leadResult } from '../components/ui.mjs';
import { site } from '../config.mjs';

export const NEEDS = [
  ['sub-radar', 'Check my subcontractors’ licenses and bonds', 'Sub Radar fits. The fastest start is a $149 audit.', '/sub-radar/audit/', 'Go straight to the audit request'],
  ['sub-radar-monitoring', 'Keep watching subs on active jobs', 'Sub Radar monitoring fits: $399 per month, weekly re-checks.', '/sub-radar/#pricing', 'See monitoring details'],
  ['trade-map-desk', 'Fix how my business shows up in directories', 'Trade Map Desk fits. Pilot enrollment is open.', '/trade-map-desk/#nap-check', 'Try the free consistency check'],
  ['catalog', 'Catch price and stock errors on my storefront', 'Catalog Exception Desk fits. It starts with a scoping consultation.', '/catalog-exception-desk/#compare', 'Try the file comparison'],
  ['labs', 'Automated QA or inspection scheduling', 'That is Labs work, in development. We’ll add you to early access.', '/labs/', 'Read about Labs'],
  ['public-sector', 'Public-sector work or research collaboration', 'Tell us about the program and we’ll reply directly.', '/public-sector/', 'Read our public-sector page'],
  ['other', 'Something else', 'Describe it below. If none of our desks fit, we’ll say so.', '', ''],
];

export default {
  path: '/contact/',
  title: 'Contact',
  description: 'Tell Apex Ronin what you need. We route you to the right product, or tell you plainly if none fit.',
  scripts: ['/assets/js/qualify.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="ct-title">
  <div class="wrap">
    <h1 id="ct-title">Tell us what you need</h1>
    <p class="lede">Pick the closest match. We’ll point you to the right place right away, and reply by email from <a href="mailto:${site.email}">${site.email}</a>.</p>
  </div>
</section>
<script type="application/json" id="needs-data">${jsonScript(NEEDS)}</script>
<section class="band" aria-label="Contact form">
  <div class="wrap split">
    <aside>
      <h2>Direct</h2>
      <p><a href="mailto:${site.email}">${site.email}</a></p>
      <p class="muted">Apex Ronin works by email first. If a call helps, include a few times that suit you and we’ll confirm one.</p>
    </aside>
    <div class="form-panel">
      <form class="form" data-lead="contact" data-custom data-subject="Apex Ronin inquiry" novalidate>
        <fieldset class="group">
          <legend>What do you need? <span class="req" aria-hidden="true">*</span></legend>
          ${NEEDS.map(([v, l]) => html`<div class="field field--check">
            <input type="radio" id="need-${v}" name="need" value="${v}" required data-label="What you need">
            <label for="need-${v}">${l}</label>
          </div>`)}
        </fieldset>
        <div class="limits" data-recommend hidden aria-live="polite"></div>
        <div class="form-grid">
          ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name', max: 120 })}
          ${field({ name: 'company', label: 'Company or agency', autocomplete: 'organization', max: 150 })}
          ${field({ name: 'email', label: 'Email', type: 'email', required: true, autocomplete: 'email', max: 200 })}
          ${field({ name: 'phone', label: 'Phone', type: 'tel', autocomplete: 'tel', max: 40, hint: 'Optional.' })}
        </div>
        ${textarea({ name: 'message', label: 'What’s going on?', required: true, rows: 5, max: 4000 })}
        ${field({ name: 'call_times', label: 'Times that suit you for a call', max: 300, hint: 'Optional. Include your time zone.' })}
        ${consent()}
        ${leadControls('Send message', 'Email this message')}
      </form>
      ${leadResult({ sentTitle: 'Message received', sentBody: 'We’ll reply by email. If you suggested call times, we’ll confirm one.' })}
    </div>
  </div>
</section>`,
};
