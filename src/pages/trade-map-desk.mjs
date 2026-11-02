import { html, money } from '../lib/html.mjs';
import { tag, simNotice, field, textarea, checkbox, consent, leadControls, leadResult, faq } from '../components/ui.mjs';
import { byId } from '../assets/js/data/products.mjs';

const desk = byId['trade-map-desk'];
const monitor = byId['sub-radar'].offers[1];
const bundle = monitor.price + desk.offers[0].price;

// SIMULATED scorecard for an invented contractor.
const scorecard = [
  ['Listings found', '16 of 18 directories checked', 'caution'],
  ['Name, address and phone consistent', '10 of 16 listings', 'red'],
  ['Listings with the old office address', '4', 'red'],
  ['Phone numbers that route elsewhere', '1', 'red'],
  ['New reviews, last 30 days', '7 across 3 platforms', 'clear'],
  ['Reviews older than 7 days with no reply', '3', 'caution'],
];

export default {
  path: '/trade-map-desk/',
  title: 'Trade Map Desk and NAP-Shield: local listing and review monitoring',
  description: 'Trade Map Desk keeps your business name, address and phone consistent across directories and tracks new reviews. Free NAP consistency check, $449 per month.',
  scripts: ['/assets/js/nap-tool.mjs', '/assets/js/forms.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="tmd-title">
  <div class="wrap split">
    <div>
      <p class="kicker">Trade Map Desk ${tag('caution', 'Pilot enrollment open')}</p>
      <h1 id="tmd-title">Customers look you up by name, address and phone. Every listing should agree.</h1>
    </div>
    <div>
      <p class="lede">Trade Map Desk watches your business listings, flags the ones that disagree with your real details, tracks new reviews and gives you a short, ranked list of what to fix each month.</p>
      <p>NAP-Shield is the consistency engine inside it. Try it on your own listings below; it runs entirely in your browser.</p>
      <div class="actions">
        <a class="btn btn--primary" href="#pilot">Join the pilot</a>
        <a class="btn" href="#nap-check">Check your listings free</a>
      </div>
    </div>
  </div>
</section>

<section class="band" id="nap-check" aria-labelledby="nap-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="nap-title">NAP-Shield consistency check</h2>
      <p class="lede">Enter your correct details, then paste how each directory lists you. We normalize abbreviations, suite numbers and phone formats, then show what genuinely differs.</p>
    </div>
    <form class="tool" data-nap-tool novalidate>
      <div class="tool__grid">
        <fieldset class="group">
          <legend>Your correct details</legend>
          ${field({ name: 'c_name', label: 'Business name', id: 'nap-name', max: 150 })}
          ${field({ name: 'c_address', label: 'Street address with ZIP', id: 'nap-address', max: 250 })}
          ${field({ name: 'c_phone', label: 'Main phone', id: 'nap-phone', type: 'tel', max: 40 })}
        </fieldset>
        <div>
          ${textarea({ name: 'listings', id: 'nap-listings', label: 'How directories list you', rows: 9, max: 20000,
            hint: 'One listing per line: Source | Name | Address | Phone' })}
        </div>
      </div>
      <div class="actions">
        <button class="btn btn--primary" type="submit">Check consistency</button>
        <button class="btn" type="button" data-sample>Load a sample</button>
        <button class="btn" type="button" data-clear>Clear</button>
      </div>
      <p class="tool__privacy">Nothing you type here is sent anywhere. The check runs on this page and is gone when you leave it.</p>
      <div class="tool__out" data-out aria-live="polite"></div>
    </form>
  </div>
</section>

<section class="band band--sheet" aria-labelledby="score-title">
  <div class="wrap split">
    <div>
      <h2 id="score-title">The monthly scorecard</h2>
      <p class="lede">One page, ranked by what costs you calls. Each line links to the listing and the exact field to fix.</p>
      <p>Directories and review platforms we check are agreed with you during setup. We work from what is publicly visible and do not need your account logins to monitor.</p>
    </div>
    <div class="form-panel">
      ${simNotice('Simulated scorecard for an invented contractor.')}
      <table class="data-table">
        <caption class="visually-hidden">Sample local visibility scorecard</caption>
        <thead><tr><th scope="col">Check</th><th scope="col">Result</th><th scope="col">Tag</th></tr></thead>
        <tbody>${scorecard.map(([k, v, t]) => html`<tr><td>${k}</td><td>${v}</td><td>${tag(t, t === 'red' ? 'Fix first' : t === 'caution' ? 'Fix soon' : 'Fine')}</td></tr>`)}</tbody>
      </table>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="reviews-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="reviews-title">Review monitoring that tells you what to do</h2>
      <p class="lede">New reviews arrive in one place, with the ones that need a reply first.</p>
    </div>
    ${simNotice('Sample review alerts. Reviewers and businesses are invented.')}
    <div class="facts">
      <div><p>${tag('red', 'Reply today')}</p><h3>1-star review mentions a missed inspection</h3><p>Posted yesterday on a major map listing. Mentions a job address and a permit. Suggested next step: reply with a phone number and take it offline.</p></div>
      <div><p>${tag('caution', 'Reply this week')}</p><h3>Three reviews with no reply after 7 days</h3><p>All positive. A short thank-you on each keeps the listing active and shows prospects you answer.</p></div>
      <div><p>${tag('clear', 'For your files')}</p><h3>Review mentions a crew lead by name</h3><p>Worth passing along internally. No action needed on the listing.</p></div>
    </div>
    <p class="muted">We never write, buy or filter reviews, and we never post replies as you without your approval.</p>
  </div>
</section>

<section class="band band--sheet" id="pilot" aria-labelledby="pilot-title">
  <div class="wrap split">
    <div>
      <h2 id="pilot-title">Join the pilot</h2>
      <p class="lede">${money(desk.offers[0].price)} per month. Pilot clients set the directory list with us and get the first scorecard within the first month.</p>
      <h3>Already monitoring subs with Sub Radar?</h3>
      <p>Add Trade Map Desk to the same account: Sub Radar monitoring (${money(monitor.price)}) plus Trade Map Desk (${money(desk.offers[0].price)}) is ${money(bundle)} per month, one invoice, one contact. Tick the box in the form and we’ll set it up on your existing account. Nothing needs connecting.</p>
    </div>
    <div class="form-panel">
      <form class="form" data-lead="trade-map-desk-pilot" data-subject="Trade Map Desk pilot request" novalidate>
        <div class="form-grid">
          ${field({ name: 'company', label: 'Business name', required: true, autocomplete: 'organization', max: 150 })}
          ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name', max: 120 })}
          ${field({ name: 'email', label: 'Work email', type: 'email', required: true, autocomplete: 'email', max: 200 })}
          ${field({ name: 'website', label: 'Website', type: 'url', autocomplete: 'url', max: 200, hint: 'Optional. Starts with https://' })}
        </div>
        ${field({ name: 'service_area', label: 'Main service area', max: 200, hint: 'City or region where most of your customers are.' })}
        ${checkbox({ name: 'current_sub_radar_client', label: 'I’m a current Sub Radar client' })}
        ${textarea({ name: 'notes', label: 'What prompted this?', rows: 3, max: 2000, hint: 'Optional. A wrong phone number somewhere, a bad review, a new office.' })}
        ${consent()}
        ${leadControls('Request a pilot spot', 'Email pilot request')}
      </form>
      ${leadResult({ sentTitle: 'Pilot request received', sentBody: 'We’ll reply by email to agree your directory list and start date.' })}
    </div>
  </div>
</section>

<section class="band" aria-labelledby="tmd-faq">
  <div class="wrap split">
    <h2 id="tmd-faq">Questions</h2>
    ${faq([
      ['Do you need my Google or Yelp login?', html`<p>Not to monitor. We check what the public sees. If you want us to make corrections for you later, we’ll agree that separately and in writing.</p>`],
      ['Will you fix listings for me?', html`<p>The scorecard tells you exactly what to change and where. During the pilot, fixes stay with you or your marketing contact, so nothing changes without your say.</p>`],
      ['How is this different from Sub Radar?', html`<p>Sub Radar watches your subcontractors’ records. Trade Map Desk watches your own public footprint. Same method: a source of truth, a scheduled check, and exceptions with evidence.</p>`],
    ])}
  </div>
</section>`,
};
