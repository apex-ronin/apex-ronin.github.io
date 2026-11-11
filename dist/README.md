# apexronin.com

Static site served by GitHub Pages from `main` via `.github/workflows/site.yml`.

**2026-11-10:** product and pricing pages removed. They described services ahead of what was built and verified. The site is a single holding page until the rebuild, which lists only what runs today, with evidence.

## Verify

```bash
node tests/check.mjs                       # metadata, links, sitemap, banned claims
npm run build && python3 -m http.server 8080 --directory dist &
python3 tests/e2e/run_e2e.py               # live routes 200, removed routes 404
```

`tests/check.mjs` fails the build if prices, removed product names, or unverified claims ("guarantee", "uptime", fake registry alerts) reappear. Remove a pattern only when the claim is backed by evidence.
