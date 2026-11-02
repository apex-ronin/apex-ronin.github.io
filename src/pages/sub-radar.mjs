import { html, money } from '../lib/html.mjs';
import { tag, simNotice, faq, select } from '../components/ui.mjs';
import { exampleAlert, coverageTable, ctaBand, subRadar } from '../components/blocks.mjs';
import { site } from '../config.mjs';

const [audit, monitor] = subRadar.offers;

export default {
  path: '/sub-radar/',
  title: 'Sub Radar: subcontractor license and bond monitoring',
  description: 'Monitor subcontractor licenses, bonds and workers’ comp from the California CSLB, Texas TDLR and Florida DBPR public registries. $149 audit, $399 per month monitoring.',
  scripts: ['/assets/js/dashboard.mjs'],
  ld: [{
    '@context': 'https://schema.org', '@type': 'Service', name: 'Sub Radar', serviceType: 'Subcontractor license and bond monitoring',
    provider: { '@type': 'Organization', name: 'Apex Ronin', url: site.url }, areaServed: ['California', 'Texas', 'Florida'],
    offers: [
      { '@type': 'Offer', name: audit.name, price: audit.price, priceCurrency: 'USD' },
      { '@type': 'Offer', name: monitor.name, price: monitor.price, priceCurrency: 'USD',
        priceSpecification: { '@type': 'UnitPriceSpecification', price: monitor.price, priceCurrency: 'USD', unitText: 'MONTH' } },
    ],
  }],
  render: () => html`
<section class="page-head" aria-labelledby="sr-title">
  <div class="wrap split">
    <div>
      <p class="kicker">Sub Radar ${tag('clear', 'Taking audit requests')}</p>
      <h1 id="sr-title">Your subcontractor’s license can change before anyone on your team notices.</h1>
    </div>
    <div>
      <p class="lede">Sub Radar watches the public state record for each of your subs and flags the warning signs: a lapsed license, a cancelled bond, an expired workers’ comp policy, a new disciplinary flag.</p>
      <div class="actions">
        <a class="btn btn--primary" href="/sub-radar/audit/">Request a $149 audit</a>
        <a class="btn" href="#pricing">See monitoring plans</a>
      </div>
    </div>
  </div>
</section>

<section class="band" id="dashboard" aria-labelledby="dash-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="dash-title">The sample risk dashboard</h2>
      <p class="lede">This is what a monitored sub list looks like after a month. Filter it, then open any subcontractor to see the change history and where each finding came from.</p>
    </div>
    <div class="dash" data-dashboard>
      <div class="dash__bar">
        ${select({ name: 'f-state', label: 'State', options: [['', 'All states'], ['CA', 'California'], ['TX', 'Texas'], ['FL', 'Florida']], id: 'f-state' })}
        ${select({ name: 'f-tag', label: 'Tag', options: [['', 'All tags'], ['red', 'Red tag'], ['caution', 'Caution'], ['clear', 'Clear']], id: 'f-tag' })}
        <p class="muted" data-count aria-live="polite"></p>
        ${simNotice()}
      </div>
      <div class="dash__body">
        <div class="table-scroll" role="region" aria-label="Subcontractor list" tabindex="0">
          <table class="data-table">
            <thead><tr><th scope="col">Subcontractor</th><th scope="col">State</th><th scope="col">License</th><th scope="col">Tag</th><th scope="col">Latest change</th></tr></thead>
            <tbody><tr><td colspan="5">The sample dashboard needs JavaScript. The example alert below shows the same evidence trail.</td></tr></tbody>
          </table>
        </div>
        <div class="dash__detail" aria-live="polite">
          <h3>Select a subcontractor</h3>
          <p class="muted">Choose a name in the list to see its registry record, change history and stored snapshot reference.</p>
        </div>
      </div>
    </div>
  </div>
</section>

<section class="band band--sheet" aria-labelledby="alert-head">
  <div class="wrap split">
    <div>
      <h2 id="alert-head">What an alert looks like</h2>
      <p class="lede">Short enough to read on a phone at the jobsite. Specific enough to act on.</p>
      <ul>
        <li>The field that changed, with the old and new value</li>
        <li>When we saw it, and when we last saw it unchanged</li>
        <li>A link to the registry record</li>
        <li>A stored copy of what the registry showed, kept for your records</li>
      </ul>
      <p>Red tags go out by email as soon as we see them. Cautions are batched into a weekly digest so your inbox stays usable.</p>
    </div>
    ${exampleAlert()}
  </div>
</section>

<section class="band" id="coverage" aria-labelledby="cov-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="cov-title">What each registry publishes</h2>
      <p class="lede">We monitor what the state publishes, and nothing we would have to guess at. Where a registry does not carry a field, the table says so.</p>
    </div>
    ${coverageTable()}
  </div>
</section>

<section class="band band--sheet" aria-labelledby="zl-title">
  <div class="wrap split">
    <h2 id="zl-title">Zero logins, by design.</h2>
    <div>
      <p class="lede">Sub Radar works from public registry records. We never ask for portal passwords, admin access to your systems or anything from your subcontractors.</p>
      <p>That keeps onboarding to a spreadsheet and keeps your exposure small: the only things you share with us are the names and license numbers you already have.</p>
    </div>
  </div>
</section>

<section class="band" id="pricing" aria-labelledby="price-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="price-title">Two ways to start</h2>
      <p class="lede">Most general contractors start with an audit, then move the subs on active jobs to monitoring.</p>
    </div>
    <div class="plans">
      <div class="plan">
        <h3>${audit.name}</h3>
        <p class="plan__price">${money(audit.price)} <span class="plan__unit">one-time</span></p>
        <ul>
          <li>Up to ${subRadar.limits.auditMaxSubs} subcontractors across CA, TX and FL</li>
          <li>Current status of every field the registry publishes</li>
          <li>A report with a source link for every finding</li>
          <li>A list of subs we could not match, with what we need</li>
        </ul>
        <a class="btn btn--primary" href="/sub-radar/audit/">Request an audit</a>
      </div>
      <div class="plan">
        <h3>${monitor.name}</h3>
        <p class="plan__price">${money(monitor.price)} <span class="plan__unit">per month</span></p>
        <ul>
          <li>Your active subs re-checked ${subRadar.limits.cadence}</li>
          <li>Red-tag alerts by email as soon as we see them</li>
          <li>Weekly digest of cautions, monthly summary report</li>
          <li>Add or remove subs any time by email</li>
        </ul>
        <a class="btn" href="/contact/?interest=sub-radar-monitoring">Ask about monitoring</a>
      </div>
    </div>
    <p class="muted">You won’t be charged when you submit a request. We confirm scope by email and send an invoice before any work starts.</p>
  </div>
</section>

<section class="band band--sheet" aria-labelledby="faq-title">
  <div class="wrap split">
    <h2 id="faq-title">Questions general contractors ask</h2>
    ${faq([
      ['Is this a compliance guarantee?', html`<p>No. Sub Radar reports what public registries showed when we checked. It flags changes for your team to act on. It does not replace your subcontract terms, certificate-of-insurance review or legal advice.</p>`],
      ['How current is the data?', html`<p>As current as the registry and our last check. Monitoring re-checks ${subRadar.limits.cadence}; every finding shows the time we saw it. Registries can lag behind real-world events such as a policy cancellation.</p>`],
      ['What if a sub works in a state you don’t cover?', html`<p>Tell us in the request. We list it as not covered rather than leaving a silent gap, and it helps us decide which registry to add next.</p>`],
      ['Do you contact my subcontractors?', html`<p>No. We never contact your subs. Findings go to you.</p>`],
      ['What happens to my sub list?', html`<p>We use it only to run your audit or monitoring. We don’t sell or share it. See the <a href="/privacy/">privacy notice</a>.</p>`],
      ['Texas has no general contractor license. What do you check there?', html`<p>Trade licenses that TDLR issues, such as electrical and air conditioning contractors. Plumbing licenses come from a separate board that we have not added yet.</p>`],
    ])}
  </div>
</section>

${ctaBand({
  title: 'Find out where your sub list stands today.',
  body: `${money(audit.price)} for up to ${subRadar.limits.auditMaxSubs} subcontractors. Paste your list and we’ll take it from there.`,
  primary: ['/sub-radar/audit/', 'Request an audit'],
})}`,
};
