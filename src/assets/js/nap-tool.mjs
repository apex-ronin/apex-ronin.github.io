// NAP-Shield consistency check. Runs entirely in the browser; nothing is transmitted.
import { scoreListings, parseListingLines } from './lib/nap.mjs';
import { esc, tagHTML } from './lib/render.mjs';

const form = document.querySelector('[data-nap-tool]');
if (form) {
  const $ = (id) => form.querySelector(id);
  const out = form.querySelector('[data-out]');
  const SAMPLE = {
    name: 'Halverson Framing LLC',
    address: '1450 N Fulton St, Suite 200, Fresno, CA 93728',
    phone: '(559) 555-0142',
    listings: [
      'Map listing | Halverson Framing LLC | 1450 North Fulton Street Ste 200, Fresno, CA 93728 | 559-555-0142',
      'Review site | Halverson Framing | 1450 N Fulton St, Fresno, CA 93728 | (559) 555-0142',
      'Trade directory | Halverson Framing LLC | 980 E Olive Ave, Fresno, CA 93728 | (559) 555-0142',
      'Chamber listing | Halverson Framing, LLC | 1450 N. Fulton St. #200, Fresno CA 93728 | 559.555.0199',
      'Old citation | Halverson Framing Inc | 1450 N Fulton St Suite 200 Fresno CA 93728 | ',
    ].join('\n'),
  };

  form.querySelector('[data-sample]').addEventListener('click', () => {
    $('#nap-name').value = SAMPLE.name;
    $('#nap-address').value = SAMPLE.address;
    $('#nap-phone').value = SAMPLE.phone;
    $('#nap-listings').value = SAMPLE.listings;
    run(true);
  });
  form.querySelector('[data-clear]').addEventListener('click', () => {
    form.reset(); out.innerHTML = ''; $('#nap-name').focus();
  });
  form.addEventListener('submit', (e) => { e.preventDefault(); run(false); });

  function run(isSample) {
    const canonical = { name: $('#nap-name').value, address: $('#nap-address').value, phone: $('#nap-phone').value };
    const listings = parseListingLines($('#nap-listings').value).slice(0, 200);
    if (!canonical.name.trim() || !canonical.address.trim() || !canonical.phone.trim()) {
      out.innerHTML = '<p class="field-error">Enter your correct name, address and phone first. Everything else is compared against them.</p>';
      return;
    }
    if (!listings.length) {
      out.innerHTML = '<p class="field-error">Paste at least one listing, one per line, as Source | Name | Address | Phone.</p>';
      return;
    }
    const { results, score } = scoreListings(canonical, listings);
    const reds = results.reduce((n, r) => n + r.findings.filter((f) => f.severity === 'red').length, 0);
    const cautions = results.reduce((n, r) => n + r.findings.filter((f) => f.severity === 'caution').length, 0);
    const cell = (r, fieldName) => {
      const f = r.findings.find((x) => x.field === fieldName);
      const val = { Name: r.listing.name, Address: r.listing.address, Phone: r.listing.phone }[fieldName];
      if (!f) return `<td data-sev="ok">${esc(val)}</td>`;
      return `<td data-sev="${f.severity}"><span class="cell-msg">${esc(f.message)}</span>${esc(val) || '<em>empty</em>'}</td>`;
    };
    out.innerHTML = `
      ${isSample ? '<p class="sim-notice"><span class="sim-notice__mark" aria-hidden="true"></span>Sample data. The business and listings are invented.</p>' : ''}
      <div class="scorecard">
        <p class="score">${score}<small>consistency score out of 100</small></p>
        <p>${tagHTML('red', `${reds} costing calls`)} ${tagHTML('caution', `${cautions} worth fixing`)}</p>
      </div>
      <div class="table-scroll" role="region" aria-label="Listing comparison" tabindex="0">
        <table class="nap-matrix"><thead><tr><th scope="col">Source</th><th scope="col">Name</th><th scope="col">Address</th><th scope="col">Phone</th></tr></thead>
        <tbody>${results.map((r) => `<tr><th scope="row">${esc(r.listing.source)}</th>${cell(r, 'Name')}${cell(r, 'Address')}${cell(r, 'Phone')}</tr>`).join('')}</tbody></table>
      </div>
      <p class="hint">Red: a customer could reach the wrong place or number. Caution: inconsistent, which can weaken how directories match your listings. Abbreviations such as St and Street are treated as the same.</p>`;
  }
}
