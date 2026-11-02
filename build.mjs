#!/usr/bin/env node
// Zero-dependency static site build. Output: dist/ (deployable to GitHub Pages or any static host).
// Usage: node build.mjs   (env: LEAD_ENDPOINT, BUILD_VERSION)
import { readdir, mkdir, rm, copyFile, writeFile, cp } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { layout } from './src/components/layout.mjs';
import { site, buildSettings } from './src/config.mjs';
import { html } from './src/lib/html.mjs';

const root = dirname(fileURLToPath(import.meta.url));
const out = join(root, 'dist');
const build = buildSettings();

// Legacy URLs from the previous site. GitHub Pages has no server redirects, so each gets a
// tiny noindex page with a canonical link and meta refresh.
const REDIRECTS = {
  '/about.html': '/company/',
  '/capabilities.html': '/',
  '/contact.html': '/contact/',
  '/govtech-hunter.html': '/public-sector/',
  '/research.html': '/research/',
};

async function loadPages() {
  const dir = join(root, 'src/pages');
  const files = (await readdir(dir)).filter((f) => f.endsWith('.mjs')).sort();
  const pages = [];
  for (const f of files) pages.push((await import(pathToFileURL(join(dir, f)))).default);
  return pages;
}

function fileFor(path) {
  if (path === '/404.html') return join(out, '404.html');
  return join(out, path, 'index.html');
}

async function write(file, content) {
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, content);
}

const redirectPage = (to) => html`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Moved</title>
<meta name="robots" content="noindex"><link rel="canonical" href="${site.url + to}"><meta http-equiv="refresh" content="0; url=${to}">
</head><body><p>This page has moved to <a href="${to}">${site.url + to}</a>.</p></body></html>`;

async function main() {
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  await cp(join(root, 'src/static'), out, { recursive: true });
  await cp(join(root, 'src/assets'), join(out, 'assets'), { recursive: true });

  const fonts = join(out, 'assets/fonts');
  await mkdir(fonts, { recursive: true });
  for (const [pkg, files] of [
    ['barlow', ['barlow-latin-400-normal.woff2', 'barlow-latin-500-normal.woff2', 'barlow-latin-600-normal.woff2', 'barlow-latin-700-normal.woff2']],
    ['barlow-semi-condensed', ['barlow-semi-condensed-latin-600-normal.woff2', 'barlow-semi-condensed-latin-700-normal.woff2']],
  ]) {
    for (const f of files) await copyFile(join(root, 'node_modules/@fontsource', pkg, 'files', f), join(fonts, f));
  }

  const pages = await loadPages();
  const seen = new Set();
  for (const page of pages) {
    if (seen.has(page.path)) throw new Error(`Duplicate page path ${page.path}`);
    seen.add(page.path);
    const body = page.render(build);
    await write(fileFor(page.path), String(layout(page, body, build)));
  }

  for (const [from, to] of Object.entries(REDIRECTS)) await write(join(out, from), String(redirectPage(to)));

  const urls = pages.filter((p) => !p.noindex && p.path !== '/404.html').map((p) => `<url><loc>${site.url}${p.path}</loc></url>`);
  await write(join(out, 'sitemap.xml'), `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>\n`);
  await write(join(out, 'robots.txt'), `User-agent: *\nAllow: /\nSitemap: ${site.url}/sitemap.xml\n`);

  console.log(`Built ${pages.length} pages + ${Object.keys(REDIRECTS).length} redirects to dist/ (lead mode: ${build.leadEndpoint ? 'endpoint' : 'email'}, version ${build.version})`);
}

main().catch((e) => { console.error(e); process.exit(1); });
