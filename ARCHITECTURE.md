# Architecture and design rationale

## Why static

No framework, no bundler, no runtime dependency. A 20-person pipeline does not justify a hydration layer, and every removed dependency is a removed upgrade path and attack surface. Progressive enhancement throughout: with JS disabled the pages still read and the nav still works; only the demos and multi-step forms degrade.

## The two layers

Layer One is a conversion instrument. Layer Two is a discovery. They share tokens and nothing else — no shared layout shell, so the deep experience can be cinematic without slowing the product pages.

The B2G gateway is a redaction. Three bars on a flat institutional note; opening all three reveals the doorway. Typing `ronin` anywhere bypasses it. The gate is curiosity, and it is visible enough that a procurement officer notices without the commercial buyer being interrupted.

## Authority model as design

The site argues that evidence and interpretation should never blend, so it refuses to blend them visually. L1–L4 are colour-coded and separately ruled. The provenance trace demo has a "break L2" control specifically to show what happens when the deterministic floor is removed and confident output survives anyway.

## Truthfulness

No invented logos, testimonials, or metrics. Status tags are literal (`Open`, `In build`, `Scoped`, `Horizon`). Every simulated surface is labelled at the surface, not in a footnote. Turnaround figures are marked as targets. The stack page names directions, not integrations.

## Conversion design

Sub Radar carries the weight: hero → exposure ledger → demo → deliverable table → intake. Trade Map Desk is framed entirely as account expansion against Sub Radar, with an explicit bundle price and a side-by-side comparison. Catalog Desk is consultation-only because a $1,000 retainer is not an impulse purchase. Stage Four collects named use cases rather than a waitlist.

Form friction is deliberate in one place only: the roster textarea. Every other field is a select. Draft autosave means an abandoned form is not a lost form.

## Accessibility

Skip link, landmark regions, labelled inputs, `aria-live` status, focus moved to the first invalid field, `aria-expanded` on the disclosure controls, `aria-selected` on demo rows, visible focus rings, and a full `prefers-reduced-motion` path that disables reveals, the constellation loop, and the trace animation.

## Maintainability

Tokens live in `:root`. Demo data is a literal array at the top of each demo module. Adding Stage Five is a page plus a nav entry plus a sitemap line — the test suite enforces the last.
