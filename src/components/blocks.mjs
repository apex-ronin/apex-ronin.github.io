// Larger reusable blocks used across pages.
import { html, raw, money } from '../lib/html.mjs';
import { tag, statusTag, simNotice } from './ui.mjs';
import { products, byId } from '../assets/js/data/products.mjs';
import { rosterHTML, summaryHTML, feedHTML } from '../assets/js/lib/render.mjs';
import { registries, fieldLabels, coverageText } from '../assets/js/data/registries.mjs';

export function tagBoard() {
  return html`<figure class="board" data-tagboard aria-labelledby="board-title">
    ${simNotice('Simulated month. Companies and license numbers are invented.')}
    <div class="board__head">
      <h2 class="board__title" id="board-title">Twelve subs, one month of registry changes</h2>
      <button class="btn btn--small" type="button" data-play>Replay month</button>
    </div>
    <div class="board__summary" aria-live="polite">${raw(summaryHTML(30))}</div>
    <div class="board__controls">
      <label for="board-day">Show changes through</label>
      <input id="board-day" type="range" min="0" max="30" step="1" value="30" aria-valuetext="Day 30 of 30">
      <output class="board__day" for="board-day">Day 30</output>
    </div>
    <ul class="roster" aria-label="Subcontractors and their current tag">${raw(rosterHTML(30))}</ul>
    <div class="feed">
      <h3>What changed, newest first</h3>
      <ol tabindex="0" aria-label="Change log">${raw(feedHTML(30))}</ol>
    </div>
  </figure>`;
}

export function exampleAlert() {
  return html`<article class="alert-card" aria-labelledby="alert-title">
    ${simNotice('Sample alert. The company, license and snapshot are invented.')}
    <div class="alert-card__top">${tag('red', 'Red tag')}<span class="muted">Sub Radar alert</span></div>
    <h3 id="alert-title">Contractor bond cancelled</h3>
    <p class="muted">Bright Line Electric, California license DEMO-4102. On 2 active jobs.</p>
    <dl class="evidence">
      <dt>Registry</dt><dd>California Contractors State License Board</dd>
      <dt>Field</dt><dd>Contractor bond</dd>
      <dt>Change</dt><dd><span class="diff-from">Cancellation pending</span> to <span class="diff-to">Cancelled</span></dd>
      <dt>Seen</dt><dd>Oct 28, 2026, 6:10 am PT (previous check Oct 21)</dd>
      <dt>Source</dt><dd><a href="https://www.cslb.ca.gov/" rel="noopener">cslb.ca.gov license detail</a></dd>
      <dt>Snapshot</dt><dd><code>sample-3f9a1c07701ca9f3</code></dd>
    </dl>
  </article>`;
}

export function lineup({ exclude = [] } = {}) {
  return html`<div class="lineup">
    ${products.filter((p) => !exclude.includes(p.id) && p.id !== 'seat-sniper').map((p, i) => {
      const isLabs = p.id === 'fleet-collision-lab';
      const name = isLabs ? 'Labs: Fleet Collision Lab and Seat Sniper' : p.name;
      const href = isLabs ? '/labs/' : p.href;
      const offer = p.offers[0];
      return html`<div class="lineup__item ${i === 0 && !exclude.length ? 'lineup__item--lead' : ''}">
        <div>
          <h3><a href="${href}">${name}</a></h3>
          ${statusTag(p)}
        </div>
        <div>
          <p class="lineup__kind">${isLabs ? 'Automated QA, inspection slot monitoring and the orchestration underneath them.' : p.kind}</p>
          <p>${isLabs ? 'In development. Join the early access list to hear first.' : p.oneLiner}</p>
        </div>
        <div>${offer && !offer.planned ? html`<p class="lineup__price">${offer.from ? 'From ' : ''}${money(offer.price)}<small> ${offer.unit === 'month' ? 'per month' : 'one-time'}</small></p>
          ${p.offers[1] ? html`<p class="lineup__price">${money(p.offers[1].price)}<small> per month</small></p>` : ''}` : html`<p class="muted">Pricing at early access</p>`}</div>
      </div>`;
    })}
  </div>`;
}

export function coverageTable() {
  const keys = Object.keys(fieldLabels);
  return html`<div class="table-scroll" role="region" aria-labelledby="coverage-caption" tabindex="0">
  <table class="coverage">
    <caption id="coverage-caption" class="visually-hidden">What each state registry publishes and what Sub Radar monitors</caption>
    <thead><tr><th scope="col">Registry</th>${keys.map((k) => html`<th scope="col">${fieldLabels[k]}</th>`)}</tr></thead>
    <tbody>
      ${registries.map((r) => html`<tr>
        <th scope="row"><strong>${r.state}</strong><br><a href="${r.url}" rel="noopener">${r.agency}</a></th>
        ${keys.map((k) => html`<td data-v="${r.fields[k]}">${coverageText[r.fields[k]]}</td>`)}
      </tr>`)}
    </tbody>
  </table></div>
  <ul class="quiet-list">${registries.map((r) => html`<li><strong>${r.state}.</strong> ${r.scope} ${r.note}</li>`)}</ul>`;
}

export function ctaBand({ title, body, primary, secondary }) {
  return html`<section class="band cta-band" aria-labelledby="cta-title">
    <div class="wrap">
      <h2 id="cta-title">${title}</h2>
      <p class="lede">${body}</p>
      <div class="actions">
        <a class="btn btn--primary" href="${primary[0]}">${primary[1]}</a>
        ${secondary ? html`<a class="btn" href="${secondary[0]}">${secondary[1]}</a>` : ''}
      </div>
    </div>
  </section>`;
}

export const subRadar = byId['sub-radar'];
