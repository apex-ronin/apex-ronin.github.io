# Status: what is done, what is not, what needs a decision

Branch `redesign/b2b-launch-2026-11`. Not merged, not deployed.

## Verified complete

- 14 routes plus 5 legacy redirects, responsive from 390 px up, keyboard operable.
- Working tools (real logic, in-browser, nothing transmitted): subcontractor list parser with per-state format
  checks, NAP consistency checker, feed vs storefront diff with CSV export, pricing calculator, contact qualifier.
- Simulated demos, each labeled where it appears: tag board replay, risk dashboard, exception queue,
  scorecard, sample alerts. Demo license numbers use a `DEMO-` prefix so they cannot match a real contractor.
- Lead capture in two modes (endpoint / email), with validation, loading, success, failure and fallback states.
- Reference lead endpoint (`worker/`) with tests.
- Primordial Galaxy authority map, trace, layer filter, text equivalent, arrival sequence. Node statuses reviewed against the source repository and project ledger on 2026-11-02.

## Test results (2026-11-02, Chrome, local)

| Suite | Result |
|---|---|
| Unit (`node --test`): CSV, NAP, catalog diff, escaping, registries, demo replay, products, galaxy graph, lead client, worker | 14/14 |
| Static checks (`tests/check-dist.mjs`): links, anchors, metadata, CSP compatibility, ids, ARIA refs, budgets, demo labels, secrets | 19 files, 0 problems |
| Browser, email mode: axe WCAG 2.2 AA tags on 14 pages x 2 widths and after interactions, overflow, console errors, CSP enforced, every flow | 105/105 |
| Browser, endpoint mode: success, server failure, honeypot | 9/9 |

axe catches roughly half of WCAG issues. A manual screen reader pass (VoiceOver, NVDA) has not been done.

## Not done, and why

| Item | Block | Workable now |
|---|---|---|
| Lead endpoint live | Needs a free Cloudflare account and 5 commands (`worker/wrangler.toml.example`) | Email mode works today with no infrastructure |
| Deploy | Needs your go, then Settings > Pages > Source: GitHub Actions | Branch is ready |
| Payments | Deliberately none; invoice after scope confirmation | Stripe Payment Links later if wanted (fees, no subscription) |
| Scheduling | No paid scheduler; forms collect preferred times | Self-hosted Cal.com later |
| Texas plumbing (TSBPE) | Not mapped | Shown as a gap in the coverage table |
| Manual a11y audit, legal review of privacy notice | Needs people | |

## Decisions for Jay (each is a one-line change)

1. **Audit scope**: set to 25 subs (`products.mjs`, `limits.auditMaxSubs`). The brief gave a price, not a scope.
2. **Monitoring cadence**: set to weekly. Do not promise faster than you can deliver.
3. **Service promises written into copy**: red tags emailed when seen, cautions in a weekly digest, subs added by
   email, no contact with subs, Trade Map Desk scorecard in the first month. Confirm or edit.
4. **"Seat Sniper" name**: reads as a scalping bot to agencies. Copy limits it to notify-only. Suggest "Slot Watch".
5. **Bond coverage**: only California's registry publishes bond data. "License & Bond Monitor" is accurate for CA only;
   the site says so.
6. **PG-0 candor**: the page states the review gate is closed (no clause has passed). That is the credibility move
   with evaluators, but it is your call to publish it.
7. **Mailbox**: confirm `jay@apexronin.com` receives mail before email mode goes live.
