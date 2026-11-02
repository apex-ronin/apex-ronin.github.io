#!/usr/bin/env node
// Static checks on the built site: links, metadata, CSP-compatibility, ids, budgets, claims hygiene.
import { readFile, readdir, stat } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { join, relative } from 'node:path';

const dist = new URL('../dist/', import.meta.url).pathname;
const problems = [];
const fail = (file, msg) => problems.push(`${relative(dist, file)}: ${msg}`);

async function walk(dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) out.push(...await walk(p)); else out.push(p);
  }
  return out;
}

const files = await walk(dist);
const htmlFiles = files.filter((f) => f.endsWith('.html'));
const pages = new Map();
for (const f of htmlFiles) pages.set(f, await readFile(f, 'utf8'));

const resolve = (urlPath) => {
  const clean = decodeURIComponent(urlPath.split(/[?#]/)[0]);
  const p = join(dist, clean);
  if (clean.endsWith('/')) return join(p, 'index.html');
  return p;
};
const idsOf = (src) => new Set([...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));

const BANNED = [/\bTODO\b/, /\bFIXME\b/i, /lorem ipsum/i, /production[- ]ready/i, /\bwe guarantee\b|\bguaranteed (compliance|results|accuracy|coverage)\b/i, /trusted by/i, /\bcustomers love\b/i];
const sitemap = await readFile(join(dist, 'sitemap.xml'), 'utf8');

for (const [file, src] of pages) {
  const isRedirect = /http-equiv="refresh"/.test(src);
  if (!/^<!doctype html>/i.test(src)) fail(file, 'missing doctype');
  if (!/<html lang="en"/.test(src)) fail(file, 'missing lang');
  if (!/<title>[^<]{3,}<\/title>/.test(src)) fail(file, 'missing title');
  if (isRedirect) continue;

  const h1 = (src.match(/<h1[\s>]/g) || []).length;
  if (h1 !== 1) fail(file, `expected exactly one h1, found ${h1}`);
  const desc = src.match(/<meta name="description" content="([^"]*)"/)?.[1] || '';
  if (desc.length < 50 || desc.length > 200) fail(file, `meta description length ${desc.length}`);
  if (!/<link rel="canonical" href="https:\/\/apexronin\.com\//.test(src)) fail(file, 'missing canonical');
  if (/\sstyle="/.test(src)) fail(file, 'inline style attribute (blocked by CSP)');
  for (const m of src.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)) {
    const attrs = m[1];
    if (/src="https?:/.test(attrs)) fail(file, 'external script');
    if (!/src=/.test(attrs) && !/type="application\/(ld\+)?json"/.test(attrs)) fail(file, 'inline executable script (blocked by CSP)');
  }
  if (/\son[a-z]+="/i.test(src)) fail(file, 'inline event handler');
  if (/href="http:\/\//.test(src)) fail(file, 'insecure http link');
  for (const re of BANNED) if (re.test(src.replace(/<[^>]+>/g, ' '))) fail(file, `banned phrase ${re}`);

  const allIds = [...src.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]);
  const dupes = allIds.filter((x, i) => allIds.indexOf(x) !== i);
  if (dupes.length) fail(file, `duplicate ids: ${[...new Set(dupes)].join(', ')}`);
  const ids = new Set(allIds);
  for (const m of src.matchAll(/aria-(?:labelledby|describedby|controls)="([^"]+)"/g)) {
    for (const ref of m[1].split(/\s+/)) if (!ids.has(ref)) fail(file, `aria reference to missing id ${ref}`);
  }
  for (const m of src.matchAll(/<label for="([^"]+)"/g)) if (!ids.has(m[1])) fail(file, `label for missing id ${m[1]}`);

  for (const m of src.matchAll(/(?:href|src)="([^"]+)"/g)) {
    const url = m[1];
    if (url.startsWith('#')) {
      if (url.length > 1 && !ids.has(url.slice(1))) fail(file, `broken in-page anchor ${url}`);
    } else if (url.startsWith('/')) {
      const target = resolve(url);
      if (!existsSync(target)) { fail(file, `broken link ${url}`); continue; }
      const hash = url.split('#')[1];
      if (hash && target.endsWith('.html') && !idsOf(pages.get(target) || '').has(hash)) fail(file, `broken anchor ${url}`);
    }
  }

  const rel = '/' + relative(dist, file).replace(/index\.html$/, '');
  const noindex = /name="robots" content="noindex"/.test(src);
  if (!noindex && !sitemap.includes(`<loc>https://apexronin.com${rel}</loc>`)) fail(file, 'missing from sitemap');

  // Budget: HTML + stylesheets + scripts referenced directly by the page.
  let bytes = Buffer.byteLength(src);
  for (const m of src.matchAll(/(?:href|src)="(\/assets\/[^"?]+\.(?:css|mjs))/g)) bytes += (await stat(resolve(m[1]))).size;
  if (bytes > 200_000) fail(file, `page weight ${bytes} bytes exceeds 200 KB budget`);
}

// Simulated-data hygiene: any page rendering demo data must label it.
for (const [file, src] of pages) {
  if (/DEMO-\d|data-dashboard|data-queue|data-tagboard/.test(src) && !/Simulated|Sample/.test(src)) fail(file, 'demo data without a simulated-data label');
}

// No secrets in output.
for (const f of files.filter((x) => /\.(m?js|html|css|json)$/.test(x))) {
  const s = await readFile(f, 'utf8');
  if (/(sk-[A-Za-z0-9]{20,}|AKIA[0-9A-Z]{16}|-----BEGIN [A-Z ]*PRIVATE KEY|ghp_[A-Za-z0-9]{30,})/.test(s)) fail(f, 'possible secret');
}

if (problems.length) {
  console.error(`check-dist: ${problems.length} problem(s)\n` + problems.map((p) => `  - ${p}`).join('\n'));
  process.exit(1);
}
console.log(`check-dist: ${htmlFiles.length} HTML files OK (links, anchors, metadata, CSP, ids, budgets, demo labels, secrets)`);
