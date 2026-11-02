# apexronin.com

Static site for Apex Ronin. Zero runtime dependencies, no third-party requests, no build framework.
Node renders HTML at build time; the browser gets plain HTML, one stylesheet per layer and small ES modules.

## Run it

```bash
npm ci                 # dev-only deps: two OFL font packages + axe-core for testing
npm test               # unit tests, build, static checks
npm run serve          # http://localhost:8080
npm run test:e2e       # needs the server running and Python Playwright + Chrome
```

## Configure

| Setting | Where | Effect |
|---|---|---|
| `LEAD_ENDPOINT` | build env (GitHub Actions variable) | Forms POST JSON here. Unset = forms open the visitor's email app, addressed to `jay@apexronin.com`, and say so on the button. |
| Product launch state | `src/assets/js/data/products.mjs` (`status`) | `available`, `pilot`, `consult`, `roadmap`. Nav, tags, pricing and structured data follow. |
| Prices, audit cap, cadence | same file | Single source for every page. |
| Registry coverage | `src/assets/js/data/registries.mjs` | Drives the coverage table. Only mark a field `yes` after verifying the registry publishes it. |
| Galaxy components | `src/assets/js/data/galaxy.mjs` | Status per component, tied to repo paths. |

## Deploy (GitHub Pages)

1. Repo **Settings > Pages > Source: GitHub Actions** (one-time; replaces branch publishing).
2. Merge to `main`. `.github/workflows/site.yml` builds, runs unit, static and browser tests, then deploys `dist/`.
3. `CNAME` (`apexronin.com`) ships from `src/static/`.

Pull requests build and test but never deploy.

## Lead endpoint (optional, free tier)

`worker/` is a reference endpoint: Cloudflare Worker + D1. Free tier covers this traffic many times over.
Steps are in `worker/wrangler.toml.example`. It enforces an origin allowlist, JSON-only, 64 KB cap, schema
validation, consent, a honeypot, and per-network rate limiting using a salted IP hash (raw IPs are never stored).
It is a standard `fetch` handler, so it also runs on Deno, Bun or Node with a small storage adapter.

## Layout

```
build.mjs                     static build -> dist/
src/config.mjs                site constants, build settings
src/lib/html.mjs              escaping tagged-template renderer
src/components/               layout, UI primitives, page blocks, galaxy SVG
src/pages/                    one module per route
src/assets/js/data/           shared data (build + browser): products, registries, demos, galaxy
src/assets/js/lib/            pure logic: CSV, NAP, catalog diff, lead submission, renderers
src/assets/js/*.mjs           per-page behavior
src/assets/css/               site.css (commercial), galaxy.css (PG-0)
tests/unit, tests/e2e, tests/check-dist.mjs
worker/                       lead endpoint
docs/                         architecture, status and decisions
```

See `docs/ARCHITECTURE.md` and `docs/STATUS.md`.
