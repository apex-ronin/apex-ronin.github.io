import { html } from '../lib/html.mjs';
import { MARK } from '../components/ui.mjs';
import { galaxyMap } from '../components/galaxy-map.mjs';
import { nodes, LAYERS, STATUS_TEXT, trace } from '../assets/js/data/galaxy.mjs';
import { site } from '../config.mjs';

const layerTitle = (id) => (id === 'gate' ? 'Human review gate' : LAYERS.find((l) => l.id === id).name);
const measured = nodes.filter((n) => n.measure);

export default {
  path: '/public-sector/primordial-galaxy/',
  title: 'Primordial Galaxy, reference architecture PG-0',
  description: 'Primordial Galaxy (PG-0): Apex Ronin\u2019s research architecture for evidence-first procurement fraud prevention, with model output kept behind a human review gate.',
  theme: 'night',
  chrome: false,
  bodyClass: 'pg',
  styles: ['/assets/css/galaxy.css'],
  scripts: ['/assets/js/galaxy.mjs'],
  render: () => html`
<div class="pg-top wrap">
  <a class="brand" href="/">${MARK}<span>Apex Ronin</span></a>
  <nav aria-label="Breadcrumb"><ol class="pg-crumbs"><li><a href="/public-sector/">Public sector</a></li><li aria-current="page">PG-0</li></ol></nav>
  <a class="pg-surface" href="/">Return to the surface</a>
</div>

<section class="pg-intro wrap" aria-labelledby="pg-title">
  <p class="pg-ref">Reference architecture PG-0</p>
  <h1 id="pg-title">Primordial Galaxy</h1>
  <p class="pg-lede">A research architecture for stopping procurement fraud before award. It is built on one rule: every statement resolves to a source, or says plainly that it doesn’t.</p>
  <p class="pg-status"><span class="pg-status__dot" aria-hidden="true"></span>Research system. Not a deployed government product and not offered for sale.</p>
</section>

<section class="pg-stage wrap" aria-labelledby="pg-map-h">
  <h2 id="pg-map-h" class="visually-hidden">Authority map</h2>
  <div class="pg-toolbar">
    <div class="pg-filters" role="group" aria-label="Highlight a layer">
      <button type="button" class="pg-chip" data-layer="" aria-pressed="true">All layers</button>
      ${LAYERS.map((l) => html`<button type="button" class="pg-chip pg-chip--${l.id}" data-layer="${l.id}" aria-pressed="false">${l.short}</button>`)}
    </div>
    <button type="button" class="pg-btn" data-trace-start>Trace a solicitation</button>
  </div>
  <div class="pg-grid-layout">
    <div class="pg-map-wrap">${galaxyMap()}</div>
    <aside class="pg-panel" aria-live="polite" aria-labelledby="pg-panel-title">
      <div data-panel>
        <h3 id="pg-panel-title" tabindex="-1">How to read the map</h3>
        <p>Authority falls with distance from the center. The inner ring can establish facts; the outer ring can only offer interpretation, and nothing leaves through the boundary without passing the gate at the top.</p>
        <ul class="pg-legend">
          ${LAYERS.map((l) => html`<li class="pg-legend__item pg-legend__item--${l.id}"><span class="pg-swatch" aria-hidden="true"></span><span><strong>${l.name}.</strong> ${l.rule}</span></li>`)}
          <li class="pg-legend__item pg-legend__item--gate"><span class="pg-swatch" aria-hidden="true"></span><span><strong>Human review gate.</strong> A person approves or rejects. Every decision is logged.</span></li>
        </ul>
        <p class="pg-muted">Filled points are implemented, hollow points are planned, crossed points were retired. Implemented means the code runs; it does not mean the idea is proven. Select any point for detail.</p>
      </div>
      <div class="pg-trace-nav" data-trace-nav hidden>
        <button type="button" class="pg-btn pg-btn--ghost" data-trace-prev>Previous step</button>
        <span data-trace-count></span>
        <button type="button" class="pg-btn" data-trace-next>Next step</button>
        <button type="button" class="pg-btn pg-btn--ghost" data-trace-exit>End trace</button>
      </div>
    </aside>
  </div>
</section>

<section class="pg-section wrap" aria-labelledby="pg-auth">
  <h2 id="pg-auth">Interpretation never becomes source.</h2>
  <div class="pg-cols">
    <p>Most AI systems flatten everything into one answer. Here, each piece of information carries the layer it came from. A model can read a solicitation, propose a fraud scheme and draft protective contract language, but its words stay labeled as interpretation for their whole life. They cannot overwrite a recorded fact, and they cannot become a citation.</p>
    <p>Deterministic code does the load-bearing work: fetching, recording, matching, filtering and checking citations. Models add judgment on top of that floor. When the two disagree, the record wins, and when the evidence is not good enough, the system says so and stops.</p>
  </div>
</section>

<section class="pg-section wrap" aria-labelledby="pg-ledger">
  <h2 id="pg-ledger">What the ledger shows</h2>
  <p class="pg-muted">Figures as recorded in the project ledger on the dates shown. They describe the size of the evidence base, not the quality of any output.</p>
  <dl class="pg-measures">
    ${measured.map((n) => {
      const [num, ...rest] = n.measure.split(' ');
      return html`<div><dt>${n.name}</dt><dd><span class="pg-num">${num}</span> ${rest.join(' ')}</dd></div>`;
    })}
    <div class="pg-measures__gate"><dt>Human review gate</dt><dd><span class="pg-num">Closed</span> No draft clause has passed review. None is published or offered.</dd></div>
  </dl>
</section>

<section class="pg-section wrap" aria-labelledby="pg-text">
  <h2 id="pg-text">Every component, as text</h2>
  <p class="pg-muted">The map above and this list carry the same information.</p>
  ${[...LAYERS.map((l) => l.id), 'gate'].map((layer) => html`<div class="pg-textlayer">
    <h3>${layerTitle(layer)}</h3>
    <ul>
      ${nodes.filter((n) => n.layer === layer).map((n) => html`<li id="pg-node-${n.id}"><strong>${n.name}</strong> <span class="pg-badge pg-badge--${n.status}">${STATUS_TEXT[n.status]}</span><br>${n.body}${n.module ? html`<br><code>${n.module}</code>` : ''}</li>`)}
    </ul>
  </div>`)}
  <h3>The trace, step by step</h3>
  <ol class="pg-steps">${trace.map((s) => html`<li><strong>${s.title}.</strong> ${s.body}</li>`)}</ol>
</section>

<section class="pg-section pg-exit wrap" aria-labelledby="pg-exit">
  <h2 id="pg-exit">Review it. Challenge it.</h2>
  <p>We are looking for experienced procurement-integrity reviewers, researchers and program staff to test this method against their own judgment. If the evidence doesn’t hold up, we want to hear it first.</p>
  <div class="pg-actions">
    <a class="pg-btn" href="mailto:${site.email}?subject=Primordial%20Galaxy%20review">Write to ${site.email}</a>
    <a class="pg-btn pg-btn--ghost" href="/research/">Published research</a>
    <a class="pg-btn pg-btn--ghost" href="/">Return to the surface</a>
  </div>
  <p class="pg-muted pg-foot">&copy; Apex Ronin. Module paths refer to the project’s source repository.</p>
</section>`,
};
