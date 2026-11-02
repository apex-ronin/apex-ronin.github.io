import { html, money } from '../lib/html.mjs';
import { tag, simNotice, field, textarea, select, consent, leadControls, leadResult } from '../components/ui.mjs';
import { byId } from '../assets/js/data/products.mjs';
import { EXCEPTION_TYPES } from '../assets/js/lib/catalog.mjs';

const p = byId['catalog-exception-desk'];
const types = ['price', 'availability', 'missing', 'title', 'unlisted'];

export default {
  path: '/catalog-exception-desk/',
  title: 'Catalog Exception Desk: merchant feed and storefront monitoring',
  description: 'Catalog Exception Desk compares your merchant feed exports with your live storefront and queues price, availability and listing exceptions by impact. From $1,000 per month.',
  scripts: ['/assets/js/catalog-tools.mjs', '/assets/js/forms.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="ced-title">
  <div class="wrap split">
    <div>
      <p class="kicker">Catalog Exception Desk ${tag('caution', 'By consultation')}</p>
      <h1 id="ced-title">Your feed says one thing. Your storefront says another.</h1>
    </div>
    <div>
      <p class="lede">Catalog Exception Desk compares the catalog you export with what shoppers actually see, then puts every price, stock and listing mismatch into a queue ranked by what it costs.</p>
      <p>It works from authorized exports and the public storefront. No admin login to your commerce platform by default.</p>
      <div class="actions">
        <a class="btn btn--primary" href="#consult">Request a consultation</a>
        <a class="btn" href="#compare">Compare two files now</a>
      </div>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="queue-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="queue-title">The exception queue</h2>
      <p class="lede">Your team works one list, largest exposure first. Open an item, see the evidence, move it through to resolved.</p>
    </div>
    ${simNotice('Simulated queue. Products, prices and exposure estimates are invented; your changes stay in this browser tab.')}
    <div class="queue" data-queue>
      <div class="queue__list">
        <div class="queue__toolbar">
          <ul class="chips" aria-label="Filter by exception type">
            <li><button class="chip" type="button" data-filter="" aria-pressed="true">All</button></li>
            ${types.map((t) => html`<li><button class="chip" type="button" data-filter="${t}" aria-pressed="false">${EXCEPTION_TYPES[t]}</button></li>`)}
          </ul>
          <div class="queue__counts" data-counts aria-live="polite"></div>
        </div>
        <div class="table-scroll" role="region" aria-label="Exception queue" tabindex="0">
          <table class="data-table">
            <thead><tr><th scope="col">SKU</th><th scope="col">Exception</th><th scope="col">Tag</th><th scope="col">Weekly exposure</th><th scope="col">Status</th></tr></thead>
            <tbody><tr><td colspan="5">The interactive queue needs JavaScript.</td></tr></tbody>
          </table>
        </div>
      </div>
      <div class="queue__detail" aria-live="polite">
        <h3>Select an exception</h3>
        <p class="muted">Choose a SKU to see what the feed and the storefront each say, when we saw it and the estimated exposure.</p>
      </div>
    </div>
  </div>
</section>

<section class="band band--sheet" id="compare" aria-labelledby="cmp-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="cmp-title">Compare a feed export with a storefront snapshot</h2>
      <p class="lede">A working version of the core check. Paste or choose two CSV files with a SKU column, plus any of title, price and availability. It runs in your browser; nothing is uploaded.</p>
    </div>
    <form class="tool" data-catalog-tool novalidate>
      <div class="tool__grid">
        <div>
          ${textarea({ name: 'feed', id: 'cat-feed', label: 'Feed export (CSV)', rows: 8, max: 5000000, hint: 'The file you send to marketplaces or ad platforms.' })}
          <div class="field"><label for="cat-feed-file">Or choose the feed file</label><input id="cat-feed-file" type="file" accept=".csv,.tsv,.txt,text/csv"></div>
        </div>
        <div>
          ${textarea({ name: 'store', id: 'cat-store', label: 'Storefront snapshot (CSV)', rows: 8, max: 5000000, hint: 'What the live site shows, exported or scraped.' })}
          <div class="field"><label for="cat-store-file">Or choose the storefront file</label><input id="cat-store-file" type="file" accept=".csv,.tsv,.txt,text/csv"></div>
        </div>
      </div>
      <div class="actions">
        <button class="btn btn--primary" type="submit">Find exceptions</button>
        <button class="btn" type="button" data-sample>Load sample files</button>
        <button class="btn" type="button" data-clear>Clear</button>
      </div>
      <p class="tool__privacy">Up to 20,000 rows per file. Prices within one cent are treated as equal.</p>
      <div class="tool__out" data-out aria-live="polite"></div>
    </form>
  </div>
</section>

<section class="band" aria-labelledby="report-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="report-title">Reported in money, not row counts</h2>
      <p class="lede">The monthly report leads with exposure: what the open exceptions were likely costing, what was fixed and how long fixes took. Exposure estimates use your own sales data when you share it, and are labeled as estimates.</p>
    </div>
    <div class="facts">
      <div><h3>Feed ingestion</h3><p>Scheduled pickup of the exports you already produce, from a location you control.</p></div>
      <div><h3>Storefront observation</h3><p>Public product pages checked on a schedule, with a stored copy of what each showed.</p></div>
      <div><h3>Triage and reporting</h3><p>A shared queue, structured exception reports and a monthly impact summary for operations leadership.</p></div>
    </div>
  </div>
</section>

<section class="band band--sheet" id="consult" aria-labelledby="consult-title">
  <div class="wrap split">
    <div>
      <h2 id="consult-title">Request a consultation</h2>
      <p class="lede">From ${money(p.offers[0].price)} per month, depending on catalog size, number of storefronts and check frequency.</p>
      <p>We start with a scoping call and a one-time comparison of a recent export against your live storefront, so you see real exceptions before committing.</p>
    </div>
    <div class="form-panel">
      <form class="form" data-lead="catalog-consultation" data-subject="Catalog Exception Desk consultation" novalidate>
        <div class="form-grid">
          ${field({ name: 'company', label: 'Company', required: true, autocomplete: 'organization', max: 150 })}
          ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name', max: 120 })}
          ${field({ name: 'email', label: 'Work email', type: 'email', required: true, autocomplete: 'email', max: 200 })}
          ${field({ name: 'role', label: 'Role', autocomplete: 'organization-title', max: 120 })}
        </div>
        <div class="form-grid">
          ${select({ name: 'catalog_size', label: 'Active SKUs', required: true, options: [['', 'Choose a range'], 'Under 1,000', '1,000 to 10,000', '10,000 to 100,000', 'Over 100,000'] })}
          ${field({ name: 'platform', label: 'Commerce platform', max: 120, hint: 'Optional.' })}
        </div>
        ${textarea({ name: 'problem', label: 'What is going wrong today?', required: true, rows: 4, max: 4000 })}
        ${field({ name: 'availability', label: 'Good times for a call', max: 300, hint: 'Optional. Days, times and time zone. We’ll reply with a confirmed time.' })}
        ${consent()}
        ${leadControls('Request consultation', 'Email consultation request')}
      </form>
      ${leadResult({ sentTitle: 'Consultation request received', sentBody: 'We’ll reply by email with a proposed call time and what to bring.' })}
    </div>
  </div>
</section>`,
};
