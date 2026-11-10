# Limitations and unverified items

## Requires configuration before launch

- `assets/config.js → formEndpoint` — until set, submissions hand off to a mail client and rely on the visitor pressing send. Set it for real capture.
- `contactEmail` — assumed `intake@apexronin.com`, unconfirmed.
- `og.png` — referenced, not supplied.
- Payment — no checkout integration. Audits are invoiced manually after scoping.

## Unverified against the repositories

Repository access was not available in this environment, so this is a standalone implementation. Specifically unverified: whether `apex-ronin.github.io` already contains components worth porting, the actual branch and deploy configuration, and the real state of the Primordial Galaxy repo. Stage Four and Primordial Galaxy are written from the brief and marked as reference architecture.

## Deliberately not claimed

- Real-time coverage (registry cadence governs freshness)
- Nationwide coverage (three states)
- Deployed government systems
- Hermes / Stagehand / DBOS as shipped integrations
- Any customer count, uptime figure, or ROI percentage

## Known gaps

- Demo state is in-memory; a reload resets triage and filters
- No dark-mode toggle — the site is a fixed two-tone composition by design
- No i18n; `lang="en"` throughout
- The constellation canvas is decorative and `aria-hidden`; nothing depends on it
- Form draft is `localStorage`-only, so it does not follow the user across devices
- `sitemap.xml` has no `lastmod` — it would need a build step to stay honest
- No CSP header; add one at the CDN/host layer if serving from elsewhere
