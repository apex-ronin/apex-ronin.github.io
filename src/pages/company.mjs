import { html } from '../lib/html.mjs';
import { site } from '../config.mjs';
import { ctaBand } from '../components/blocks.mjs';

export default {
  path: '/company/',
  title: 'About Apex Ronin',
  description: 'Apex Ronin is a founder-led company building monitoring products that report exceptions with evidence. Founded by Jason “Jay” Nelson.',
  render: () => html`
<section class="page-head" aria-labelledby="co-title">
  <div class="wrap split">
    <h1 id="co-title">Founder-led. Evidence first.</h1>
    <p class="lede">Apex Ronin builds monitors for the changes that quietly cost businesses money: a subcontractor’s lapsed license, a wrong phone number on a directory, a storefront price that drifted from the feed. Every finding comes with its source.</p>
  </div>
</section>

<section class="band" aria-labelledby="founder-title">
  <div class="wrap split">
    <h2 id="founder-title">${site.founder}</h2>
    <div class="measure">
      <p class="lede">Jay has worked across trades since 1989: automotive diagnostics in a family repair shop, three seasons as a CAL FIRE wildland firefighter, small-business funding sales, his own computer repair business, and construction and restoration work.</p>
      <p>He has worked full time on AI systems engineering since 2025. The through-line is diagnostic: find what actually failed, prove it, then fix it. Apex Ronin products are built the same way, which is why they show their evidence instead of asking to be trusted.</p>
      <p>His public work, including the Primordial Galaxy research system and published security research, is on <a href="${site.github}" rel="noopener">GitHub</a>.</p>
    </div>
  </div>
</section>

<section class="band band--sheet" aria-labelledby="pr-title">
  <div class="wrap">
    <div class="section-head"><h2 id="pr-title">How we work</h2></div>
    <div class="facts">
      <div><h3>Start with evidence</h3><p>Every finding traces to a source and a time. If we can’t show where something came from, we don’t report it as fact.</p></div>
      <div><h3>Ask for as little access as possible</h3><p>Public records and exports you already produce come first. No admin logins by default, and nothing installed on your systems.</p></div>
      <div><h3>Say what we don’t know</h3><p>Coverage gaps, registry delays and unmatched records are reported, not hidden. A short honest report beats a long confident one.</p></div>
    </div>
  </div>
</section>

<section class="band" aria-labelledby="data-title">
  <div class="wrap split">
    <h2 id="data-title">What you can hold us to</h2>
    <ul class="quiet-list">
      <li>We use what you send us only to do the work you asked for. We don’t sell or share it.</li>
      <li>Demonstrations on this site use simulated data, and say so wherever they appear.</li>
      <li>Products marked in development are not available, and we don’t describe them as if they were.</li>
      <li>You won’t find testimonials or client logos here yet. We’re early, and we’d rather show you the work. They’ll appear only with each client’s written permission.</li>
      <li>Questions go to a person: <a href="mailto:${site.email}">${site.email}</a>.</li>
    </ul>
  </div>
</section>

${ctaBand({ title: 'Bring us a problem with a paper trail.', body: 'If it can be checked against a source, we can probably watch it for you.', primary: ['/contact/', 'Get in touch'], secondary: ['/sub-radar/audit/', 'Request a Sub Radar audit'] })}`,
};
