import { html, money } from '../lib/html.mjs';
import { statusTag, tag, faq } from '../components/ui.mjs';
import { products, priceLines } from '../assets/js/data/products.mjs';
import { ctaBand } from '../components/blocks.mjs';

const buyable = priceLines.filter((l) => !l.planned);

export default {
  path: '/pricing/',
  title: 'Pricing',
  description: 'Apex Ronin pricing: Sub Radar audits $149 and monitoring $399 per month, Trade Map Desk $449 per month, Catalog Exception Desk from $1,000 per month.',
  scripts: ['/assets/js/pricing-calc.mjs'],
  render: () => html`
<section class="page-head" aria-labelledby="pr-title">
  <div class="wrap">
    <h1 id="pr-title">Pricing</h1>
    <p class="lede">Published prices, no seat counts. You are never charged when you submit a request: we confirm scope by email and invoice before work starts.</p>
  </div>
</section>

<section class="band" aria-labelledby="table-title">
  <div class="wrap">
    <h2 id="table-title" class="visually-hidden">All plans</h2>
    <div class="table-scroll" role="region" aria-labelledby="table-title" tabindex="0">
      <table class="price-table">
        <thead><tr><th scope="col">Product</th><th scope="col">Plan</th><th scope="col">What’s included</th><th scope="col">Price</th><th scope="col">Availability</th></tr></thead>
        <tbody>
          ${products.filter((p) => p.offers.length).map((p) => p.offers.map((o, i) => html`<tr>
            ${i === 0 ? html`<th scope="row" rowspan="${p.offers.length}"><a href="${p.href}">${p.name}</a></th>` : ''}
            <td>${o.name}</td><td>${o.detail}</td>
            <td class="num">${o.planned ? 'Planned' : html`${o.from ? 'From ' : ''}${money(o.price)}<br><small class="muted">${o.unit === 'month' ? 'per month' : 'one-time'}</small>`}</td>
            ${i === 0 ? html`<td rowspan="${p.offers.length}">${statusTag(p)}</td>` : ''}
          </tr>`))}
          <tr><th scope="row"><a href="/labs/#seat-sniper">Seat Sniper</a></th><td>Notifications</td><td>Inspection slot monitoring and alerts.</td><td class="num">At early access</td><td>${tag('idle', 'In development')}</td></tr>
        </tbody>
      </table>
    </div>
  </div>
</section>

<section class="band band--sheet" aria-labelledby="calc-title">
  <div class="wrap split">
    <div>
      <h2 id="calc-title">Build your monthly total</h2>
      <p class="lede">Most contractor accounts pair Sub Radar monitoring with Trade Map Desk. Tick what you need.</p>
      <p class="muted">Catalog Exception Desk shows its starting price; the final figure depends on catalog size and is set at the consultation.</p>
    </div>
    <form class="calc" data-calc>
      <fieldset>
        <legend>Plans</legend>
        ${buyable.map((l) => html`<div class="calc__row">
          <input type="checkbox" id="calc-${l.id}" value="${l.id}" data-price="${l.price}" data-unit="${l.unit}" ${l.id === 'monitor' ? 'checked' : ''}>
          <label for="calc-${l.id}">${l.productName}: ${l.name}<small>${l.detail}</small></label>
          <span>${l.from ? 'from ' : ''}${money(l.price)}${l.unit === 'month' ? '/mo' : ''}</span>
        </div>`)}
      </fieldset>
      <div class="calc__total" aria-live="polite" data-total>
        <span data-monthly>$399<small>per month</small></span>
        <span data-onetime>$0<small>one-time</small></span>
      </div>
    </form>
  </div>
</section>

<section class="band" aria-labelledby="pfaq">
  <div class="wrap split">
    <h2 id="pfaq">Billing questions</h2>
    ${faq([
      ['How do I pay?', html`<p>By invoice, after we confirm scope by email. There is no card form on this site.</p>`],
      ['Is there a contract term?', html`<p>Terms are set out in writing before work starts, including how to cancel. Ask us if you need specific terms for your procurement process.</p>`],
      ['Can an audit become monitoring?', html`<p>Yes. Most clients move the subs on active jobs from the audit straight into monitoring.</p>`],
    ])}
  </div>
</section>

${ctaBand({ title: 'Not sure which fits?', body: 'Describe the problem and we’ll point you to the right desk, or tell you if none of them fit.', primary: ['/contact/', 'Talk it through'] })}`,
};
