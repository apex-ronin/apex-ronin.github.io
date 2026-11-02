import { html, raw, jsonScript } from '../lib/html.mjs';
import { MARK, BENCHMARK } from './ui.mjs';
import { products } from '../assets/js/data/products.mjs';
import { site } from '../config.mjs';

const NAV = [
  ['/sub-radar/', 'Sub Radar'],
  ['/trade-map-desk/', 'Trade Map Desk'],
  ['/catalog-exception-desk/', 'Catalog Desk'],
  ['/labs/', 'Labs'],
  ['/pricing/', 'Pricing'],
  ['/company/', 'Company'],
];

function csp(build) {
  const connect = ["'self'"];
  if (build.leadEndpoint) connect.push(new URL(build.leadEndpoint).origin);
  return [
    "default-src 'self'",
    "script-src 'self'",
    "style-src 'self'",
    "img-src 'self' data:",
    "font-src 'self'",
    `connect-src ${connect.join(' ')}`,
    "base-uri 'self'",
    "form-action 'self' mailto:",
    "object-src 'none'",
    'upgrade-insecure-requests',
  ].join('; ');
}

const asset = (build, path) => `${path}?v=${build.version}`;

export function layout(page, body, build) {
  const url = site.url + page.path;
  const title = page.path === '/' ? page.title : `${page.title} | Apex Ronin`;
  const theme = page.theme || 'film';
  const ld = [
    { '@context': 'https://schema.org', '@type': 'Organization', name: site.name, url: site.url, email: site.email, sameAs: [site.github],
      founder: { '@type': 'Person', name: site.founder } },
    ...(page.ld || []),
  ];
  return html`<!doctype html>
<html lang="en" data-theme="${theme}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta http-equiv="Content-Security-Policy" content="${csp(build)}">
<meta name="referrer" content="strict-origin-when-cross-origin">
<title>${title}</title>
<meta name="description" content="${page.description}">
<link rel="canonical" href="${url}">
${page.noindex ? raw('<meta name="robots" content="noindex">') : ''}
<meta name="theme-color" content="${theme === 'night' ? '#0d1821' : '#eef0ec'}">
<meta property="og:type" content="website">
<meta property="og:site_name" content="Apex Ronin">
<meta property="og:title" content="${title}">
<meta property="og:description" content="${page.description}">
<meta property="og:url" content="${url}">
<meta property="og:image" content="${site.url}/assets/og.png">
<meta property="og:image:width" content="1200">
<meta property="og:image:height" content="630">
<meta name="twitter:card" content="summary_large_image">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<link rel="preload" href="/assets/fonts/barlow-latin-400-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="preload" href="/assets/fonts/barlow-semi-condensed-latin-700-normal.woff2" as="font" type="font/woff2" crossorigin>
<link rel="stylesheet" href="${asset(build, '/assets/css/site.css')}">
${(page.styles || []).map((s) => html`<link rel="stylesheet" href="${asset(build, s)}">`)}
<script type="application/json" id="site-config">${jsonScript({ leadEndpoint: build.leadEndpoint, email: site.email })}</script>
<script type="application/ld+json">${jsonScript(ld)}</script>
<script type="module" src="${asset(build, '/assets/js/site.mjs')}"></script>
${(page.scripts || []).map((s) => html`<script type="module" src="${asset(build, s)}"></script>`)}
</head>
<body class="${page.bodyClass || ''}">
<a class="skip" href="#main">Skip to content</a>
${page.chrome === false ? '' : header(page)}
<main id="main" tabindex="-1">
${body}
</main>
${page.chrome === false ? '' : footer()}
</body>
</html>`;
}

function header(page) {
  return html`<header class="site-header">
  <div class="wrap site-header__inner">
    <a class="brand" href="/">${MARK}<span>Apex Ronin</span></a>
    <button class="nav-toggle" type="button" aria-expanded="false" aria-controls="site-nav">Menu</button>
    <nav id="site-nav" class="site-nav" aria-label="Main">
      <ul>
        ${NAV.map(([href, label]) => html`<li><a href="${href}" ${page.path.startsWith(href) ? raw('aria-current="page"') : ''}>${label}</a></li>`)}
      </ul>
      <a class="btn btn--primary btn--small" href="/sub-radar/audit/">Request an audit</a>
    </nav>
  </div>
</header>`;
}

function footer() {
  const live = products.filter((p) => p.status !== 'roadmap');
  return html`<footer class="site-footer">
  <div class="wrap site-footer__grid">
    <div class="site-footer__brand">
      <a class="brand" href="/">${MARK}<span>Apex Ronin</span></a>
      <p>Monitoring for the changes that cost you money, with the source for every finding.</p>
      <p><a href="mailto:${site.email}">${site.email}</a></p>
    </div>
    <nav aria-label="Products">
      <h2 class="site-footer__h">Products</h2>
      <ul>${live.map((p) => html`<li><a href="${p.href}">${p.name}</a></li>`)}<li><a href="/labs/">Labs</a></li><li><a href="/pricing/">Pricing</a></li></ul>
    </nav>
    <nav aria-label="Company">
      <h2 class="site-footer__h">Company</h2>
      <ul>
        <li><a href="/company/">About Apex Ronin</a></li>
        <li><a href="/research/">Research</a></li>
        <li><a href="/contact/">Contact</a></li>
        <li><a href="/privacy/">Privacy</a></li>
        <li><a href="${site.github}" rel="noopener">GitHub</a></li>
      </ul>
    </nav>
    <a class="footer-benchmark" href="/public-sector/">${BENCHMARK}<span>Public sector</span></a>
  </div>
  <div class="wrap site-footer__legal">
    <p>&copy; ${new Date().getFullYear()} Apex Ronin. Product demonstrations on this site use simulated data and say so where they appear.</p>
  </div>
</footer>`;
}
