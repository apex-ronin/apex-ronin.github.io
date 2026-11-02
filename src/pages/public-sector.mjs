import { html } from '../lib/html.mjs';
import { tag, BENCHMARK } from '../components/ui.mjs';
import { site } from '../config.mjs';

export default {
  path: '/public-sector/',
  title: 'Public-sector research',
  description: 'Apex Ronin’s public-sector work: research into procurement fraud prevention built on primary sources, cited findings and human review.',
  scripts: ['/assets/js/gateway.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="ps-title">
  <div class="wrap">
    <h1 id="ps-title">Public-sector research</h1>
    <p class="lede">Apex Ronin’s public-sector work is research into procurement integrity: helping buyers see fraud risk in a solicitation before an award is made.</p>
  </div>
</section>
<section class="band">
  <div class="wrap">
    <article class="doc">
      <h2>Focus</h2>
      <p>Fraud against public procurement: bid rigging, false claims, shell and pass-through vendors, and concealed ownership or supply chains, including schemes run or enabled by hostile foreign actors.</p>

      <h2>Approach</h2>
      <ul>
        <li>Primary public records first. Only a source record can establish a fact.</li>
        <li>Every finding cites the record it rests on, with when it was retrieved.</li>
        <li>Model output is labeled as interpretation and is never stored as fact.</li>
        <li>Nothing a model drafts leaves the system without a named person approving it.</li>
      </ul>

      <h2>Status</h2>
      <p>${tag('idle', 'Research and development')}</p>
      <p>This work is not a deployed government product and is not offered for sale. We describe its current state, including what has not yet met our own bar, rather than what it is intended to become.</p>

      <h2>Working with us</h2>
      <p>We welcome research collaboration, discussion of pilot evaluations, and independent review of the method. In particular, we are looking for an experienced procurement-integrity or fraud examiner willing to review a blinded sample of the system’s output.</p>
      <p><a href="mailto:${site.email}?subject=Public-sector%20research">${site.email}</a>, or read our <a href="/research/">published research</a>.</p>

      <div class="footnote-door">
        ${BENCHMARK}
        <p>Each statement above is measured against a single reference architecture. <a href="/public-sector/primordial-galaxy/" data-door>Inspect the benchmark, PG-0</a>.</p>
      </div>
    </article>
  </div>
</section>`,
};
