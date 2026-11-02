// RFC 4180 CSV parser (quotes, escaped quotes, CRLF/LF, embedded newlines). No dependencies.
// Also accepts tab-separated text pasted from spreadsheets.

export function detectDelimiter(text) {
  const firstLine = text.split(/\r?\n/, 1)[0] || '';
  const tabs = (firstLine.match(/\t/g) || []).length;
  const commas = (firstLine.match(/,/g) || []).length;
  return tabs > commas ? '\t' : ',';
}

export function parseCSV(text, { delimiter, maxRows = 50000 } = {}) {
  const src = String(text ?? '').replace(/^﻿/, '');
  const d = delimiter || detectDelimiter(src);
  const rows = [];
  let row = [];
  let field = '';
  let inQuotes = false;
  for (let i = 0; i < src.length; i++) {
    const c = src[i];
    if (inQuotes) {
      if (c === '"') {
        if (src[i + 1] === '"') { field += '"'; i++; } else inQuotes = false;
      } else field += c;
      continue;
    }
    if (c === '"' && field === '') inQuotes = true;
    else if (c === d) { row.push(field); field = ''; }
    else if (c === '\n' || c === '\r') {
      if (c === '\r' && src[i + 1] === '\n') i++;
      row.push(field); field = '';
      if (row.some((v) => v.trim() !== '')) rows.push(row);
      row = [];
      if (rows.length > maxRows) throw new Error(`More than ${maxRows.toLocaleString()} rows. Split the file and try again.`);
    } else field += c;
  }
  if (inQuotes) throw new Error('A quoted field is never closed. Check for a stray quotation mark.');
  row.push(field);
  if (row.some((v) => v.trim() !== '')) rows.push(row);
  return rows;
}

const norm = (h) => String(h).trim().toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/**
 * Turn rows into objects using the header row. `aliases` maps a canonical key to
 * accepted header spellings, e.g. { sku: ['sku', 'id', 'item id'] }.
 */
export function toRecords(rows, aliases) {
  if (!rows.length) return { records: [], missing: Object.keys(aliases), header: [] };
  const header = rows[0].map(norm);
  const index = {};
  const missing = [];
  for (const [key, names] of Object.entries(aliases)) {
    const i = header.findIndex((h) => names.map(norm).includes(h));
    if (i === -1) missing.push(key); else index[key] = i;
  }
  const records = rows.slice(1).map((r, n) => {
    const rec = { _row: n + 2 };
    for (const [key, i] of Object.entries(index)) rec[key] = (r[i] ?? '').trim();
    return rec;
  });
  return { records, missing, header: rows[0] };
}

export function toCSV(rows) {
  return rows
    .map((r) => r.map((v) => {
      const s = String(v ?? '');
      // neutralize spreadsheet formula injection in exported files
      const safe = /^[=+\-@\t\r]/.test(s) ? `'${s}` : s;
      return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
    }).join(','))
    .join('\r\n');
}
