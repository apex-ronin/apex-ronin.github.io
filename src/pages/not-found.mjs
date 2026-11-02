import { html } from '../lib/html.mjs';

export default {
  path: '/404.html',
  title: 'Page not found',
  description: 'This page does not exist on apexronin.com. Find Sub Radar, pricing and contact details from the homepage.',
  noindex: true,
  render: () => html`
<section class="page-head" aria-labelledby="nf-title">
  <div class="wrap">
    <h1 id="nf-title">Red tag: no record at this address.</h1>
    <p class="lede">The page you asked for doesn’t exist, or it moved when the site was rebuilt.</p>
    <div class="actions"><a class="btn btn--primary" href="/">Go to the homepage</a><a class="btn" href="/sub-radar/">See Sub Radar</a><a class="btn" href="/contact/">Contact us</a></div>
  </div>
</section>`,
};
