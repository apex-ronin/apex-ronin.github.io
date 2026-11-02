import { html } from '../lib/html.mjs';

const repos = [
  ['Primordial Galaxy', 'https://github.com/apex-ronin/primordial-galaxy', 'Public mirror of the procurement intelligence research system.'],
  ['Legal Corpus', 'https://github.com/apex-ronin/legal-corpus', 'A public sample of the curated regulatory clause corpus.'],
  ['Principalities Index', 'https://github.com/apex-ronin/principalities-index', 'Public sample data for the government entity index.'],
  ['Data Arsenal', 'https://github.com/apex-ronin/data-arsenal', 'Data preparation and index-building tooling.'],
];

export default {
  path: '/research/',
  title: 'Research',
  description: 'Published research and public repositories from Apex Ronin, including The Rise of the Prompt Kiddie by Jason “Jay” Nelson.',
  render: () => html`
<section class="page-head" aria-labelledby="rs-title">
  <div class="wrap split">
    <h1 id="rs-title">Research</h1>
    <p class="lede">Published work and public repositories behind Apex Ronin’s public-sector research. Read the sources directly.</p>
  </div>
</section>
<section class="band" aria-labelledby="paper-title">
  <div class="wrap split">
    <div>
      <h2 id="paper-title">The Rise of the Prompt Kiddie</h2>
      <p class="muted">Jason “Jay” Nelson. Version 2.1. Licensed CC BY 4.0.</p>
    </div>
    <div class="measure">
      <p class="lede">How accessible AI lowers the technical barrier for threat actors, and why procurement intelligence and defensive verification are part of the response.</p>
      <p>Read the paper for the author’s methodology, examples and limitations. Regulatory references reflect the paper’s publication context; check them against current primary sources before relying on them.</p>
      <a class="btn btn--primary" href="https://github.com/apex-ronin/Rise-Of-The-Prompt-Kiddie" rel="noopener">Read the paper on GitHub</a>
    </div>
  </div>
</section>
<section class="band band--sheet" aria-labelledby="repo-title">
  <div class="wrap">
    <div class="section-head"><h2 id="repo-title">Public repositories</h2>
      <p class="lede">Public mirrors and samples. Active development happens in private repositories, so these can trail the current work.</p></div>
    <ul class="quiet-list">${repos.map(([n, u, d]) => html`<li><a href="${u}" rel="noopener"><strong>${n}</strong></a><br><span class="muted">${d}</span></li>`)}</ul>
  </div>
</section>`,
};
