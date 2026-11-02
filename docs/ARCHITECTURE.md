# Architecture and design rationale

## Why no framework

A GovTech-facing site gets scrutinized for supply chain and data handling. This one ships **zero runtime
dependencies and zero third-party requests**: no CDN, no analytics, no tag manager, no web fonts from Google,
no form SaaS. Fonts are self-hosted OFL files. Dev dependencies are three packages (two font packages, axe-core),
none of which reach production as code.

Consequences you can point an evaluator at:

- **Strict CSP** (`script-src 'self'; style-src 'self'`, no `unsafe-inline`), enforced in the browser test.
- **No cookies, no tracking.** The privacy notice can say so flatly.
- **Static output.** Hostable on GitHub Pages, S3, any agency web server, or air-gapped.
- **Auditable build.** `build.mjs` is ~100 lines. Templates escape by default (`src/lib/html.mjs`).

## Information architecture

| Route | Job |
|---|---|
| `/` | Sell Sub Radar in one screen; show the method; route to the other desks |
| `/sub-radar/` | Full product: dashboard demo, alert anatomy, registry coverage, pricing, FAQ |
| `/sub-radar/audit/` | Three-step intake with in-browser sub list parsing; the primary conversion |
| `/trade-map-desk/` | Working NAP check, scorecard, review examples, pilot form, Sub Radar cross-sell |
| `/catalog-exception-desk/` | Triage queue demo, working two-file diff, consultation form |
| `/labs/` | Fleet Collision Lab and Seat Sniper, architecture direction, early access |
| `/pricing/` | Every price in one table, bundle calculator |
| `/contact/` | Qualifier that routes to the right product before the form is sent |
| `/company/`, `/research/`, `/privacy/` | Identity, published work, data handling |
| `/public-sector/` | Deliberately plain institutional page; holds the doorway |
| `/public-sector/primordial-galaxy/` | PG-0, the hidden layer |

Legacy URLs (`/about.html`, `/govtech-hunter.html`, etc.) redirect.

## Visual system

The vernacular is the **jobsite inspection tag**: clear (green), caution (amber), red tag. It is the one bold
idea, and every product uses it because every product does the same thing: compare a source of truth with
reality and tag the exceptions. Ground is cool drafting film, ink is green-black graphite. Type is **Barlow**,
derived from California highway signage: public infrastructure, not startup.

Rules: left-aligned, sentence case, no ALL-CAPS eyebrows, numbered markers only for real sequences,
motion only when the visitor acts (replay, open, trace), with one orchestrated arrival on PG-0.

## The two layers

**Layer one** is light, plain and commercial. **Layer two** inverts it. The doorway is a survey benchmark
mark in the footer and a footnote on the public-sector page ("Inspect the benchmark, PG-0"). A circular reveal
starts where the visitor clicked (skipped under reduced motion).

PG-0 is an authority map: concentric rings, most authoritative at the center.

1. Validated sources (solid line): the only layer that can establish a fact
2. Recorded state (double line): append-only record of what was seen, when, from where
3. Orchestration (dashed): deterministic code
4. Model interpretation (dotted): labeled, never promoted to source
5. Human review gate (red diamond on the boundary)

Layers are encoded by position, color and line style, never color alone. Every node maps to a module in
the project source repository or is marked planned or retired. The trace walks one solicitation from notice
to gate and ends on the truth: the gate is closed.

## Lead flow

`src/assets/js/lib/lead.mjs` validates with native constraint validation plus inline, announced errors, then:

- **endpoint mode**: POST JSON, 15 s timeout, specific error text, entries kept, email fallback offered
- **email mode**: button reads "Email this request"; a mailto opens and a panel offers copy and download for long requests

Honeypot submissions are dropped client-side and server-side. Nothing in the free tools leaves the browser.
