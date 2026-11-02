import { test } from 'node:test';
import assert from 'node:assert/strict';
import { parseCSV, toRecords, toCSV } from '../../src/assets/js/lib/csv.mjs';
import { compareListing, normalizePhone, normalizeAddress, scoreListings, parseListingLines } from '../../src/assets/js/lib/nap.mjs';
import { diffCatalog, parsePrice, normalizeAvailability, CATALOG_ALIASES } from '../../src/assets/js/lib/catalog.mjs';
import { html, raw, escape, jsonScript } from '../../src/lib/html.mjs';
import { checkLicenseFormat, registries } from '../../src/assets/js/data/registries.mjs';
import { stateAt, events, subs } from '../../src/assets/js/data/demo-subs.mjs';
import { products, STATUS } from '../../src/assets/js/data/products.mjs';
import { mailtoHref, formatLeadText, postLead } from '../../src/assets/js/lib/lead.mjs';
import { nodes, edges, trace } from '../../src/assets/js/data/galaxy.mjs';

test('csv: quotes, escaped quotes, CRLF, embedded newline, BOM, tabs', () => {
  const rows = parseCSV('﻿a,b\r\n"x, y","he said ""hi"""\r\n"multi\nline",3\n');
  assert.deepEqual(rows, [['a', 'b'], ['x, y', 'he said "hi"'], ['multi\nline', '3']]);
  assert.deepEqual(parseCSV('n\ts\tl\nA\tCA\t1'), [['n', 's', 'l'], ['A', 'CA', '1']]);
  assert.throws(() => parseCSV('"open'), /never closed/);
  assert.throws(() => parseCSV('a\nb\nc\nd', { maxRows: 2 }), /More than/);
});

test('csv: header aliases and formula-injection-safe export', () => {
  const { records, missing } = toRecords(parseCSV('Product ID,Current Price\nA1,$5'), CATALOG_ALIASES);
  assert.equal(records[0].sku, 'A1');
  assert.equal(records[0].price, '$5');
  assert.deepEqual(missing, ['title', 'availability']);
  assert.equal(toCSV([['=SUM(A1)', 'a,b']]), "'=SUM(A1),\"a,b\"");
});

test('nap: normalization treats abbreviations and phone formats as equal', () => {
  assert.equal(normalizePhone('+1 (559) 555-0142'), '5595550142');
  assert.equal(normalizeAddress('1450 N. Fulton St. #200, Fresno CA 93728').unit, '200');
  assert.equal(normalizeAddress('1450 North Fulton Street Suite 200, Fresno, CA 93728').full, normalizeAddress('1450 N Fulton St, Ste 200, Fresno, CA 93728').full);
  const c = { name: 'Halverson Framing LLC', address: '1450 N Fulton St, Suite 200, Fresno, CA 93728', phone: '(559) 555-0142' };
  assert.deepEqual(compareListing(c, { name: 'Halverson Framing LLC', address: '1450 North Fulton Street Ste 200, Fresno, CA 93728', phone: '559-555-0142' }), []);
  const f = compareListing(c, { name: 'Halverson Framing', address: '980 E Olive Ave, Fresno, CA 93728', phone: '559.555.0199' });
  assert.deepEqual(f.map((x) => [x.field, x.severity]), [['Name', 'caution'], ['Address', 'red'], ['Phone', 'red']]);
  const { score } = scoreListings(c, [{ name: c.name, address: c.address, phone: c.phone }]);
  assert.equal(score, 100);
  assert.equal(parseListingLines('Map | A | B | C\n\n').length, 1);
});

test('catalog: detects price, availability, missing, unlisted, title, duplicate', () => {
  const feed = [{ sku: 'A', title: 'Drill', price: '100', availability: 'in stock' }, { sku: 'B', title: 'Saw', price: '50', availability: 'in stock' }, { sku: 'C', title: 'Tape', price: '5' }];
  const store = [{ sku: 'A', title: 'Drill', price: '$90.00', availability: 'Out of stock' }, { sku: 'B', title: 'Saw blade', price: '50.004' }, { sku: 'D', title: 'X' }, { sku: 'D', title: 'X' }];
  const { exceptions, counts, compared } = diffCatalog(feed, store);
  assert.equal(compared, 3);
  assert.deepEqual(counts, { price: 1, availability: 1, missing: 1, title: 1, unlisted: 1, duplicate: 1 });
  assert.equal(exceptions[0].severity, 'red');
  assert.equal(parsePrice('$1,299.50'), 1299.5);
  assert.equal(normalizeAvailability('OUT_OF_STOCK'), 'out of stock');
  assert.equal(normalizeAvailability('12'), 'in stock');
});

test('html: escapes by default, raw passes through, JSON cannot close script', () => {
  assert.equal(String(html`<p>${'<script>"x"&'}</p>`), '<p>&lt;script&gt;&quot;x&quot;&amp;</p>');
  assert.equal(String(html`${raw('<b>')}${['<', html`<i>`]}`), '<b>&lt;<i>');
  assert.equal(escape("'"), '&#39;');
  assert.ok(!String(jsonScript({ a: '</script>' })).includes('</script>'));
});

test('registries: license format checks catch typos only', () => {
  assert.ok(checkLicenseFormat('CA', '1234567').ok);
  assert.ok(!checkLicenseFormat('CA', 'ABC').ok);
  assert.ok(checkLicenseFormat('FL', 'cgc1234567').ok);
  assert.ok(checkLicenseFormat('NV', 'anything').unchecked);
  for (const r of registries) assert.match(r.url, /^https:\/\//);
});

test('demo data: replay is monotonic in time and clear events resolve findings', () => {
  assert.ok(Object.values(stateAt(0)).every((s) => s.tag === 'clear'));
  assert.equal(stateAt(16).s6.tag, 'caution');
  assert.equal(stateAt(17).s6.tag, 'clear');
  assert.equal(stateAt(30).s2.tag, 'red');
  for (let i = 1; i < events.length; i++) assert.ok(events[i].day >= events[i - 1].day, 'events sorted by day');
  for (const s of subs) assert.match(s.license, /^DEMO-/, 'demo licenses can never collide with real ones');
});

test('products: every status is known; roadmap products are never priced as available', () => {
  for (const p of products) {
    assert.ok(STATUS[p.status], p.id);
    if (p.status === 'roadmap') assert.ok(p.offers.every((o) => o.planned), `${p.id} roadmap offers must be planned`);
  }
});

test('galaxy: every edge and trace step references real nodes; planned nodes have no module', () => {
  const ids = new Set(nodes.map((n) => n.id));
  for (const [a, b] of edges) assert.ok(ids.has(a) && ids.has(b), `${a}->${b}`);
  for (const s of trace) for (const n of s.nodes) assert.ok(ids.has(n), n);
  for (const n of nodes) if (n.status === 'planned') assert.equal(n.module, null, n.id);
  assert.match(nodes.find((n) => n.id === 'gate').body, /closed/i);
});

test('lead: mailto stays under length cap and text format is readable', () => {
  const body = 'x'.repeat(5000);
  const href = mailtoHref('a@b.co', 'Subj', body);
  assert.ok(href.length < 2100, href.length);
  assert.match(decodeURIComponent(href), /truncated/);
  const t = formatLeadText({ type: 't', page: '/p/', fields: { name: 'A', states: ['CA', 'TX'], consent: true, notes: 'l1\nl2' } });
  assert.match(t, /states: CA, TX/);
  assert.match(t, /consent: yes/);
});

test('lead: postLead reports server and network failures in plain language', async () => {
  await assert.rejects(postLead('https://x', {}, { fetchImpl: async () => new Response(JSON.stringify({ error: 'Rate limited.' }), { status: 429 }) }), /Rate limited/);
  await assert.rejects(postLead('https://x', {}, { fetchImpl: async () => { throw new TypeError('fail'); } }), /could not reach/);
  assert.equal(await postLead('https://x', {}, { fetchImpl: async () => new Response('{}', { status: 200 }) }), true);
});
