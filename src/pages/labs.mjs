import { html, money } from '../lib/html.mjs';
import { tag, field, textarea, checkbox, consent, leadControls, leadResult } from '../components/ui.mjs';
import { byId } from '../assets/js/data/products.mjs';

const fleet = byId['fleet-collision-lab'];
const seat = byId['seat-sniper'];

const direction = [
  ['Durable workflows', 'DBOS', 'Long-running checks that survive restarts and resume exactly where they stopped, with every step recorded.'],
  ['Browser automation', 'Stagehand', 'Reading pages that only render in a browser, with scripted steps a reviewer can replay.'],
  ['Agent orchestration', 'Hermes', 'Coordinating several specialized agents on one job, each with a narrow, auditable role.'],
  ['Owned execution', 'Self-hosted infrastructure', 'Running work on infrastructure we control and can account for, around the clock.'],
];

export default {
  path: '/labs/',
  title: 'Labs: Fleet Collision Lab and Seat Sniper',
  description: 'In development at Apex Ronin: Fleet Collision Lab for automated QA and exception detection, and Seat Sniper for inspection slot monitoring. Join the early access list.',
  scripts: ['/assets/js/forms.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="labs-title">
  <div class="wrap split">
    <div>
      <p class="kicker">Labs ${tag('idle', 'In development')}</p>
      <h1 id="labs-title">What we’re building next.</h1>
    </div>
    <div>
      <p class="lede">Two products for operations teams that need repeatable checks at a larger scale. Neither is available yet. This page describes what they are meant to do, so you can tell us whether they would matter to you.</p>
      <a class="btn btn--primary" href="#early-access">Join early access</a>
    </div>
  </div>
</section>

<section class="band" id="fleet-collision-lab" aria-labelledby="fcl-title">
  <div class="wrap split">
    <div>
      <h2 id="fcl-title">${fleet.name}</h2>
      ${tag('idle', 'In development')}
      <p class="lede">${fleet.oneLiner}</p>
    </div>
    <div>
      <p>Fleet Collision Lab runs the same validation workflow against your operation on a schedule, compares each run with the expected result and turns every failure into an evidence-backed report: what was checked, what happened, what should have happened, and the recorded proof.</p>
      <ul>
        <li>Automated quality assurance and operational exception detection</li>
        <li>Repeatable validation workflows you can rerun on demand</li>
        <li>Evidence-supported issue reports, not screenshots in a chat thread</li>
        <li>Continuous enterprise monitoring once a workflow is proven</li>
      </ul>
      <p class="muted">Planned engagements from ${money(fleet.offers[0].price)} per month. Pricing will be confirmed at early access.</p>
    </div>
  </div>
</section>

<section class="band band--sheet" id="seat-sniper" aria-labelledby="ss-title">
  <div class="wrap split">
    <div>
      <h2 id="ss-title">${seat.name}</h2>
      ${tag('idle', 'In development')}
      <p class="lede">${seat.oneLiner}</p>
    </div>
    <div>
      <p>Inspection and appointment calendars open and close slots without notice. Seat Sniper watches the calendars you choose and notifies the right person when a slot that fits appears.</p>
      <ul>
        <li>Inspection slot and availability monitoring</li>
        <li>Rules for which openings matter: date window, location, inspection type</li>
        <li>Notifications that go to the person who books, by email or text</li>
      </ul>
      <p class="muted">Seat Sniper notifies; a person on your team books. It does not book, hold or resell slots, and it respects each scheduling site’s terms of use.</p>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="dir-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="dir-title">The architecture we’re building toward</h2>
      <p class="lede">These are design directions, not shipped integrations. We name them because enterprise buyers ask what the work will run on, and the honest answer is a plan.</p>
    </div>
    <div class="table-scroll" role="region" aria-label="Architecture direction" tabindex="0">
      <table class="price-table">
        <thead><tr><th scope="col">Capability</th><th scope="col">Direction</th><th scope="col">Why it matters</th><th scope="col">Status</th></tr></thead>
        <tbody>${direction.map(([c, d, w]) => html`<tr><th scope="row">${c}</th><td>${d}</td><td>${w}</td><td>${tag('idle', 'Planned')}</td></tr>`)}</tbody>
      </table>
    </div>
  </div>
</section>

<section class="band band--sheet" id="early-access" aria-labelledby="ea-title">
  <div class="wrap split">
    <div>
      <h2 id="ea-title">Join early access</h2>
      <p class="lede">Tell us what you would use these for. Early access goes to teams with a concrete workflow we can prove first.</p>
    </div>
    <div class="form-panel">
      <form class="form" data-lead="labs-early-access" data-subject="Labs early access" novalidate>
        <fieldset class="group">
          <legend>Interested in</legend>
          <div class="checks">
            ${checkbox({ name: 'products', value: 'Fleet Collision Lab', label: 'Fleet Collision Lab' })}
            ${checkbox({ name: 'products', value: 'Seat Sniper', label: 'Seat Sniper' })}
          </div>
        </fieldset>
        <div class="form-grid">
          ${field({ name: 'company', label: 'Company', required: true, autocomplete: 'organization', max: 150 })}
          ${field({ name: 'name', label: 'Your name', required: true, autocomplete: 'name', max: 120 })}
          ${field({ name: 'email', label: 'Work email', type: 'email', required: true, autocomplete: 'email', max: 200 })}
          ${field({ name: 'role', label: 'Role', autocomplete: 'organization-title', max: 120 })}
        </div>
        ${textarea({ name: 'workflow', label: 'The workflow you want checked', required: true, rows: 4, max: 4000, hint: 'What runs, how often, and what a failure costs you.' })}
        ${consent()}
        ${leadControls('Join early access', 'Email early access request')}
      </form>
      ${leadResult({ sentTitle: 'You’re on the early access list', sentBody: 'We’ll contact you when there is something concrete to show for your workflow. We won’t add you to any other list.' })}
    </div>
  </div>
</section>`,
};
