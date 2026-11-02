import { html } from '../lib/html.mjs';
import { tagBoard, exampleAlert, lineup, ctaBand } from '../components/blocks.mjs';

export default {
  path: '/',
  title: 'Apex Ronin | Subcontractor license and bond monitoring',
  description: 'Sub Radar re-checks public state registries for every subcontractor on your jobs and shows what changed, with the source record. Audits from $149.',
  scripts: ['/assets/js/tagboard.mjs'],
  render: () => html`
<section class="hero" aria-labelledby="hero-title">
  <div class="wrap hero__grid">
    <div>
      <h1 id="hero-title">Know when a sub’s license, bond, or insurance changes.</h1>
      <p class="lede">Sub Radar re-checks the public state record for every subcontractor on your jobs and tells you what changed, with a link to the record it came from. Nothing for you or your subs to log into.</p>
      <div class="actions">
        <a class="btn btn--primary" href="/sub-radar/audit/">Request a $149 audit</a>
        <a class="btn" href="/sub-radar/">How monitoring works</a>
      </div>
      <p class="hero__note">Covers the California, Texas and Florida registries. Each state publishes different fields; <a href="/sub-radar/#coverage">see what each one shows</a>.</p>
    </div>
    ${tagBoard()}
  </div>
</section>

<section class="band band--sheet" aria-labelledby="why-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="why-title">You checked their license once. The record kept moving.</h2>
    </div>
    <div class="facts">
      <div><h3>Records change after onboarding</h3><p>Bonds get cancelled, policies lapse and license statuses change on the registry’s schedule, not yours. A check at bid time says nothing about month four.</p></div>
      <div><h3>Every state keeps its own books</h3><p>California, Texas and Florida publish different fields in different places. Watching all three by hand for every sub is somebody’s whole afternoon, every week.</p></div>
      <div><h3>The cost shows up later</h3><p>A lapsed license or missing coverage on an active job tends to surface as a payment dispute, an insurance problem or a stopped job. Earlier is cheaper.</p></div>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="how-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="how-title">How Sub Radar works</h2>
      <p class="lede">Public records first. No portal credentials, no admin access, nothing installed on your side or your subs’.</p>
    </div>
    <ol class="steps">
      <li><h3>Send your sub list</h3><p>A spreadsheet, a CSV export or names and license numbers in an email.</p></li>
      <li><h3>We match each record</h3><p>Each sub is matched to its state registry record. Anything we can’t match comes back to you as a question, not a guess.</p></li>
      <li><h3>We re-check on schedule</h3><p>Every record is retrieved, stored with a timestamp and compared with the previous copy.</p></li>
      <li><h3>You get the change and its source</h3><p>Alerts show the field that changed, old and new values, when we saw it and a link to the registry.</p></li>
    </ol>
  </div>
</section>

<section class="band band--sheet" aria-labelledby="evidence-title">
  <div class="wrap split">
    <div>
      <h2 id="evidence-title">Every finding shows its work.</h2>
      <p class="lede">You should never have to take an alert on faith. Each one carries the registry, the field, the before and after, the time we saw it and a stored copy of what the registry showed.</p>
      <p>That matters when you need to tell a sub, a surety or your own PM why a job is on hold.</p>
      <a class="text-link" href="/sub-radar/#dashboard">Explore the sample dashboard</a>
    </div>
    ${exampleAlert()}
  </div>
</section>

<section class="band" aria-labelledby="line-title">
  <div class="wrap">
    <div class="section-head">
      <h2 id="line-title">The same discipline, pointed at other blind spots.</h2>
      <p class="lede">Every Apex Ronin desk does one thing: watch a source of truth, compare it with what should be true, and hand you the exceptions with evidence attached.</p>
    </div>
    ${lineup()}
  </div>
</section>

<section class="band band--tight" aria-labelledby="limits-title">
  <div class="wrap">
    <div class="limits">
      <h2 id="limits-title">What public records can’t tell you</h2>
      <ul>
        <li>Registries update on their own schedule. We report what a registry showed when we checked it, and when that was.</li>
        <li>A clean record is not a compliance determination. Sub Radar flags changes for your team to act on; it does not replace your contracts, your insurance review or legal advice.</li>
        <li>Coverage differs by state. Bond and workers’ comp data are deepest in California; Texas has no statewide general contractor license. <a href="/sub-radar/#coverage">Full coverage table</a>.</li>
      </ul>
    </div>
  </div>
</section>

${ctaBand({
  title: 'Start with one audit.',
  body: '$149 for up to 25 subcontractors. A report with a source link for every finding, ready to forward to your project managers.',
  primary: ['/sub-radar/audit/', 'Request a $149 audit'],
  secondary: ['/pricing/', 'Compare plans'],
})}`,
};
