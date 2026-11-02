// Feed-to-storefront comparison. Pure functions; runs entirely in the browser.

export const CATALOG_ALIASES = {
  sku: ['sku', 'id', 'item id', 'product id', 'mpn', 'item number'],
  title: ['title', 'name', 'product name', 'item name'],
  price: ['price', 'sale price', 'current price', 'list price'],
  availability: ['availability', 'stock', 'in stock', 'inventory status', 'status'],
};

export function parsePrice(v) {
  if (v === undefined || v === null) return null;
  const m = String(v).replace(/,/g, '').match(/-?\d+(?:\.\d+)?/);
  return m ? Number(m[0]) : null;
}

export function normalizeAvailability(v) {
  const s = String(v || '').trim().toLowerCase().replace(/[_-]+/g, ' ');
  if (!s) return '';
  if (/^(out of stock|oos|sold out|unavailable|no|false|0)$/.test(s)) return 'out of stock';
  if (/^(in stock|available|yes|true|instock)$/.test(s) || /^\d+$/.test(s)) return 'in stock';
  if (/pre ?order|backorder/.test(s)) return 'preorder';
  return s;
}

const normTitle = (t) => String(t || '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Compare feed records with storefront records keyed by SKU.
 * Returns exceptions sorted by impact (severity, then price delta).
 */
export function diffCatalog(feed, store, { priceTolerance = 0.01 } = {}) {
  const storeBySku = new Map();
  const dupes = [];
  for (const r of store) {
    const k = (r.sku || '').trim();
    if (!k) continue;
    if (storeBySku.has(k)) dupes.push(k);
    storeBySku.set(k, r);
  }
  const exceptions = [];
  const seen = new Set();
  for (const f of feed) {
    const sku = (f.sku || '').trim();
    if (!sku) continue;
    seen.add(sku);
    const s = storeBySku.get(sku);
    if (!s) {
      exceptions.push({ sku, type: 'missing', severity: 'red', title: f.title, message: 'In feed, not found on storefront', feed: f.title || sku, store: '' });
      continue;
    }
    const fp = parsePrice(f.price);
    const sp = parsePrice(s.price);
    if (fp !== null && sp !== null && Math.abs(fp - sp) > priceTolerance) {
      exceptions.push({ sku, type: 'price', severity: sp < fp ? 'red' : 'caution', title: f.title, delta: +(sp - fp).toFixed(2),
        message: sp < fp ? 'Storefront price is lower than the feed' : 'Storefront price is higher than the feed', feed: fp.toFixed(2), store: sp.toFixed(2) });
    }
    const fa = normalizeAvailability(f.availability);
    const sa = normalizeAvailability(s.availability);
    if (fa && sa && fa !== sa) {
      exceptions.push({ sku, type: 'availability', severity: fa === 'in stock' ? 'red' : 'caution', title: f.title,
        message: `Feed says ${fa}, storefront says ${sa}`, feed: fa, store: sa });
    }
    if (f.title && s.title && normTitle(f.title) !== normTitle(s.title)) {
      exceptions.push({ sku, type: 'title', severity: 'caution', title: f.title, message: 'Title differs', feed: f.title, store: s.title });
    }
  }
  for (const [sku, s] of storeBySku) {
    if (!seen.has(sku)) exceptions.push({ sku, type: 'unlisted', severity: 'caution', title: s.title, message: 'On storefront, missing from feed', feed: '', store: s.title || sku });
  }
  for (const sku of new Set(dupes)) {
    exceptions.push({ sku, type: 'duplicate', severity: 'caution', title: storeBySku.get(sku)?.title, message: 'SKU appears more than once on storefront', feed: '', store: sku });
  }
  const rank = { red: 2, caution: 1 };
  exceptions.sort((a, b) => rank[b.severity] - rank[a.severity] || Math.abs(b.delta || 0) - Math.abs(a.delta || 0) || a.sku.localeCompare(b.sku));
  const counts = exceptions.reduce((c, e) => ((c[e.type] = (c[e.type] || 0) + 1), c), {});
  return { exceptions, counts, compared: seen.size };
}

export const EXCEPTION_TYPES = {
  missing: 'Missing on storefront',
  price: 'Price mismatch',
  availability: 'Availability mismatch',
  title: 'Title mismatch',
  unlisted: 'Not in feed',
  duplicate: 'Duplicate SKU',
};
