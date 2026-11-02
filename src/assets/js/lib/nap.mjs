// NAP (name, address, phone) normalization and comparison. Pure functions, runs in the browser.

const STREET = {
  st: 'street', str: 'street', ave: 'avenue', av: 'avenue', blvd: 'boulevard', rd: 'road', dr: 'drive',
  ln: 'lane', ct: 'court', cir: 'circle', pl: 'place', pkwy: 'parkway', hwy: 'highway', ter: 'terrace',
  trl: 'trail', wy: 'way', sq: 'square', ctr: 'center', fwy: 'freeway',
  n: 'north', s: 'south', e: 'east', w: 'west', ne: 'northeast', nw: 'northwest', se: 'southeast', sw: 'southwest',
};
const UNIT = /(?:^|[\s,])(?:suite|ste|unit|apt|apartment|bldg|building|#)\s*\.?\s*#?\s*([a-z0-9-]+)\b/i;
const NAME_SUFFIX = /\b(llc|l\.l\.c\.|inc|incorporated|corp|corporation|co|company|ltd|lp|llp|pc)\.?$/i;

export function normalizePhone(p) {
  const digits = String(p || '').replace(/\D/g, '');
  return digits.length === 11 && digits.startsWith('1') ? digits.slice(1) : digits;
}

export function formatPhone(d) {
  return d.length === 10 ? `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}` : d;
}

export function normalizeName(n) {
  const base = String(n || '').toLowerCase().replace(/&/g, ' and ').replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim();
  const suffix = (base.match(NAME_SUFFIX) || [])[1] || '';
  return { full: base, core: base.replace(NAME_SUFFIX, '').trim(), suffix };
}

export function normalizeAddress(a) {
  let s = String(a || '').toLowerCase();
  const unitMatch = s.match(UNIT);
  const unit = unitMatch ? unitMatch[1].toLowerCase() : '';
  s = s.replace(UNIT, ' ');
  const zip = (s.match(/\b(\d{5})(?:-\d{4})?\b/) || [])[1] || '';
  s = s.replace(/[.,#]/g, ' ').replace(/\s+/g, ' ').trim();
  const words = s.split(' ').map((w) => STREET[w] || w);
  const number = (words[0] && /^\d+[a-z]?$/.test(words[0])) ? words[0] : '';
  return { full: words.join(' '), number, unit, zip };
}

/**
 * Compare one listing to the canonical record.
 * Returns findings with severity 'red' (customers reach the wrong place) or 'caution' (inconsistent, fixable).
 */
export function compareListing(canonical, listing) {
  const findings = [];
  const cName = normalizeName(canonical.name);
  const lName = normalizeName(listing.name);
  if (lName.core !== cName.core) findings.push({ field: 'Name', severity: 'caution', message: 'Business name differs', expected: canonical.name, found: listing.name });
  else if (lName.suffix !== cName.suffix) findings.push({ field: 'Name', severity: 'caution', message: 'Legal suffix differs (LLC, Inc., Co.)', expected: canonical.name, found: listing.name });

  const cA = normalizeAddress(canonical.address);
  const lA = normalizeAddress(listing.address);
  if (!listing.address?.trim()) findings.push({ field: 'Address', severity: 'caution', message: 'Address missing', expected: canonical.address, found: '' });
  else if (cA.number !== lA.number || cA.zip !== lA.zip) findings.push({ field: 'Address', severity: 'red', message: 'Street number or ZIP differs', expected: canonical.address, found: listing.address });
  else if (cA.unit !== lA.unit) findings.push({ field: 'Address', severity: 'caution', message: cA.unit ? 'Suite or unit missing or different' : 'Listing adds a suite or unit', expected: canonical.address, found: listing.address });
  else if (cA.full !== lA.full) findings.push({ field: 'Address', severity: 'caution', message: 'Street spelled differently', expected: canonical.address, found: listing.address });

  const cP = normalizePhone(canonical.phone);
  const lP = normalizePhone(listing.phone);
  if (!lP) findings.push({ field: 'Phone', severity: 'caution', message: 'Phone missing', expected: canonical.phone, found: '' });
  else if (cP !== lP) findings.push({ field: 'Phone', severity: 'red', message: 'Phone number differs', expected: formatPhone(cP), found: formatPhone(lP) });
  return findings;
}

/** Consistency score 0-100: red findings cost 20, caution findings cost 6, per listing. */
export function scoreListings(canonical, listings) {
  const results = listings.map((l) => ({ listing: l, findings: compareListing(canonical, l) }));
  const cost = results.reduce((t, r) => t + r.findings.reduce((s, f) => s + (f.severity === 'red' ? 20 : 6), 0), 0);
  const max = Math.max(1, listings.length) * 26;
  return { results, score: Math.max(0, Math.round(100 - (cost / max) * 100)) };
}

/** Parse pasted listing lines: "Source | Name | Address | Phone" */
export function parseListingLines(text) {
  return String(text || '').split(/\r?\n/).map((l) => l.trim()).filter(Boolean).map((line, i) => {
    const [source, name, address, phone] = line.split('|').map((v) => (v || '').trim());
    return { source: source || `Listing ${i + 1}`, name: name || '', address: address || '', phone: phone || '', line: i + 1 };
  });
}
