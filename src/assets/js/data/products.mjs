// Single source of truth for the product line. Shared by the static build and browser modules.
// Progressive launch: change `status` here and rebuild. Nav, badges, CTAs, pricing and
// structured data all follow.
//
// status:
//   available  - taking orders now
//   pilot      - enrolling a limited pilot group
//   consult    - sold through a scoping consultation
//   roadmap    - in development; interest list only (never shown as operational)

export const STATUS = {
  available: { label: 'Taking audit requests', tag: 'clear' },
  pilot: { label: 'Pilot enrollment open', tag: 'caution' },
  consult: { label: 'By consultation', tag: 'caution' },
  roadmap: { label: 'In development', tag: 'idle' },
};

export const products = [
  {
    id: 'sub-radar',
    name: 'Sub Radar',
    href: '/sub-radar/',
    status: 'available',
    kind: 'Subcontractor license and bond monitoring',
    oneLiner: 'Know when a subcontractor’s license, bond, or workers’ comp changes.',
    audience: 'General contractors',
    offers: [
      // Audit scope cap and monitoring cadence: see docs/STATUS.md, decisions 1 and 2.
      { id: 'audit', name: 'Subcontractor audit', price: 149, unit: 'one-time',
        detail: 'Up to 25 subcontractors checked against public state registries, delivered as a report with a source link for every finding.' },
      { id: 'monitor', name: 'Monitoring', price: 399, unit: 'month',
        detail: 'Your active subs re-checked every week. Email alerts when a record changes, plus a monthly summary.' },
    ],
    limits: { auditMaxSubs: 25, cadence: 'weekly' },
  },
  {
    id: 'trade-map-desk',
    name: 'Trade Map Desk',
    href: '/trade-map-desk/',
    status: 'pilot',
    kind: 'Local listing, citation and review monitoring',
    oneLiner: 'Keep your name, address and phone consistent everywhere customers look you up.',
    audience: 'Contractors and local service firms',
    modules: ['NAP-Shield'],
    offers: [
      { id: 'desk', name: 'Trade Map Desk', price: 449, unit: 'month',
        detail: 'Listing and citation checks, NAP consistency, review tracking and a prioritized fix list every month.' },
    ],
  },
  {
    id: 'catalog-exception-desk',
    name: 'Catalog Exception Desk',
    href: '/catalog-exception-desk/',
    status: 'consult',
    kind: 'Merchant feed and storefront discrepancy monitoring',
    oneLiner: 'Find where your product feed and your live storefront disagree.',
    audience: 'Merchants and commerce operations teams',
    offers: [
      { id: 'catalog', name: 'Catalog monitoring', price: 1000, unit: 'month', from: true,
        detail: 'Feed-to-storefront comparison, price and availability exceptions, and a triage queue your team works from.' },
    ],
  },
  {
    id: 'fleet-collision-lab',
    name: 'Fleet Collision Lab',
    href: '/labs/#fleet-collision-lab',
    status: 'roadmap',
    kind: 'Automated QA and operational exception detection',
    oneLiner: 'Repeatable validation runs that turn operational failures into evidence-backed reports.',
    audience: 'Enterprise operations',
    offers: [
      { id: 'fleet', name: 'Fleet Collision Lab', price: 1800, unit: 'month', from: true, planned: true,
        detail: 'Planned engagement pricing. Not yet available.' },
    ],
  },
  {
    id: 'seat-sniper',
    // Public name under review: see docs/STATUS.md, decision 4.
    name: 'Seat Sniper',
    href: '/labs/#seat-sniper',
    status: 'roadmap',
    kind: 'Inspection slot and availability monitoring',
    oneLiner: 'Get notified the moment an inspection or appointment slot opens.',
    audience: 'Operations and scheduling teams',
    offers: [],
  },
];

export const byId = Object.fromEntries(products.map((p) => [p.id, p]));

/** Every purchasable monthly/one-time line, flattened (used by the pricing calculator). */
export const priceLines = products.flatMap((p) =>
  p.offers.map((o) => ({ ...o, productId: p.id, productName: p.name, status: p.status })),
);
