# Apex Ronin — Multi-Page Static Site (`multi-page/`)

Static, dependency-free multi-page site for Apex Ronin. Deploys directly to GitHub Pages or any static web server.

## Run locally

ES modules require an HTTP server:

```bash
python -m http.server 8000
# then open http://localhost:8000
```

Or using Node:

```bash
npx serve .
```

## Verify

```bash
node tests/check.mjs
```

Runs link integrity, per-page metadata, duplicate-id, input-labelling, secret-leak, and form-wiring checks across all 10 HTML pages, plus unit tests over `assets/form-core.js`. Exits non-zero on failure; CI blocks deploy on it.

## Lead capture — configure before launch

Forms work with zero backend: with `formEndpoint` empty they compose a pre-filled mail draft and offer the payload as downloadable JSON. To capture server-side, set `assets/config.js → formEndpoint` to any JSON-accepting endpoint (Formspree, Basin, self-hosted function).

Set `contactEmail` and (optionally) `calendlyUrl` in `assets/config.js` to real values.

## Structure

```text
*.html                  10 static pages (index, 4 product stages, pricing, company, b2g, primordial-galaxy, 404)
assets/base.css         design system, incl. form styles
assets/config.js        deploy-time config only
assets/site.js          reveal, nav, form mount, easter egg
assets/form.js          multi-step engine: validation, states, honeypot, draft
assets/form-core.js     pure logic, unit-tested
assets/demo.css         shared interactive demo styles
assets/demos/*.js       simulated product demos (radar, nap, catalog, fleet)
tests/check.mjs         static verification suite
```
