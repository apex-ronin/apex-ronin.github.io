import { html } from '../lib/html.mjs';
import { site } from '../config.mjs';

export default {
  path: '/privacy/',
  title: 'Privacy notice',
  description: 'How Apex Ronin handles information submitted through apexronin.com. No analytics, no cookies, no third-party scripts.',
  render: () => html`
<section class="page-head" aria-labelledby="pv-title">
  <div class="wrap"><h1 id="pv-title">Privacy notice</h1><p class="lede">Effective November 2, 2026.</p></div>
</section>
<section class="band">
  <div class="wrap prose measure">
    <h2>The short version</h2>
    <p>This site has no analytics, no advertising, no cookies and no third-party scripts. We receive information only when you choose to send it through a form or by email, and we use it only to answer you and do the work you asked for. We do not sell or share personal information.</p>

    <h2>What we collect</h2>
    <p>When you submit a form, we receive what you typed: typically your name, company, email, optional phone number and your message. Audit requests may include a list of subcontractor names, states and license numbers. Forms also record which page you submitted from and when.</p>
    <p>The free tools on this site, such as the listing consistency check and the catalog file comparison, run entirely in your browser. What you enter into them is never sent to us.</p>
    <p>Our website host may log technical information such as IP addresses when pages are requested, under its own policies. We do not use those logs to identify visitors.</p>

    <h2>How we use it</h2>
    <p>To reply to you, to scope and deliver the service you requested, and to keep a record of the engagement. We do not use it for advertising and we do not add you to marketing lists.</p>

    <h2>How requests reach us</h2>
    <p>Depending on how the site is configured, a form either opens your own email app with your request filled in, or sends it to our form-processing service, which stores it and notifies us by email. Either way it is handled only by Apex Ronin and the infrastructure providers that run our email and form service.</p>

    <h2>How long we keep it</h2>
    <p>For as long as we need it to respond and to run and document any engagement that follows. You can ask us to delete it at any time, subject to records we must keep for invoices and taxes.</p>

    <h2>Your choices</h2>
    <p>You can ask what we hold about you, ask us to correct it, or ask us to delete it, by emailing <a href="mailto:${site.email}">${site.email}</a>. We will not treat you differently for asking. California residents have these rights under the California Consumer Privacy Act where it applies.</p>
    <p>Because this site does not track you, browser “Do Not Track” signals do not change anything here.</p>

    <h2>Children</h2>
    <p>This site is for businesses and is not directed at children under 16. We do not knowingly collect their information.</p>

    <h2>Changes</h2>
    <p>If this notice changes, we will update the effective date above.</p>
  </div>
</section>`,
};
