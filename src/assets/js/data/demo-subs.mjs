// SIMULATED DATA. Every company, person and identifier here is invented for demonstration.
// License identifiers use a DEMO- prefix on purpose so they can never collide with a real record.

export const SIMULATED_NOTICE = 'Simulated data. Companies and license numbers are invented.';

export const subs = [
  { id: 's1', name: 'Halverson Framing', trade: 'Framing', state: 'CA', license: 'DEMO-4101', jobs: 3 },
  { id: 's2', name: 'Bright Line Electric', trade: 'Electrical', state: 'CA', license: 'DEMO-4102', jobs: 2 },
  { id: 's3', name: 'Mesa Verde Concrete', trade: 'Concrete', state: 'CA', license: 'DEMO-4103', jobs: 4 },
  { id: 's4', name: 'Coastal Air Mechanical', trade: 'HVAC', state: 'TX', license: 'DEMO-7201', jobs: 1 },
  { id: 's5', name: 'Pine Hollow Roofing', trade: 'Roofing', state: 'FL', license: 'DEMO-9301', jobs: 2 },
  { id: 's6', name: 'Sandpiper Drywall', trade: 'Drywall', state: 'CA', license: 'DEMO-4104', jobs: 3 },
  { id: 's7', name: 'Ironwood Steel Erectors', trade: 'Structural steel', state: 'CA', license: 'DEMO-4105', jobs: 1 },
  { id: 's8', name: 'Gulfline Plumbing', trade: 'Plumbing', state: 'FL', license: 'DEMO-9302', jobs: 2 },
  { id: 's9', name: 'Redbank Electrical Services', trade: 'Electrical', state: 'TX', license: 'DEMO-7202', jobs: 2 },
  { id: 's10', name: 'Clearwater Glazing', trade: 'Glazing', state: 'FL', license: 'DEMO-9303', jobs: 1 },
  { id: 's11', name: 'Fairmont Painting', trade: 'Painting', state: 'CA', license: 'DEMO-4106', jobs: 2 },
  { id: 's12', name: 'Arroyo Earthworks', trade: 'Grading', state: 'CA', license: 'DEMO-4107', jobs: 1 },
];

// severity: red = stop and verify before more work; caution = act soon; clear = resolved / informational
export const events = [
  { day: 3, sub: 's6', field: 'expiration', from: '2026-12-31', to: '2026-12-31', severity: 'caution',
    title: 'License expires in 30 days', detail: 'No renewal recorded yet.' },
  { day: 6, sub: 's2', field: 'bond', from: 'Active', to: 'Cancellation pending', severity: 'caution',
    title: 'Contractor bond cancellation pending', detail: 'Surety filed a cancellation with a future effective date.' },
  { day: 9, sub: 's4', field: 'expiration', from: 'Active', to: 'Expired', severity: 'red',
    title: 'Trade license expired', detail: 'Status changed after the expiration date passed.' },
  { day: 12, sub: 's7', field: 'workersComp', from: 'Policy on file', to: 'Policy expired', severity: 'red',
    title: 'Workers’ comp policy expired', detail: 'No replacement policy on file at the last check.' },
  { day: 14, sub: 's5', field: 'status', from: 'Current, Active', to: 'Delinquent', severity: 'red',
    title: 'License status changed to delinquent', detail: 'Registry status no longer reads current and active.' },
  { day: 17, sub: 's6', field: 'expiration', from: '2026-12-31', to: '2028-12-31', severity: 'clear',
    title: 'License renewed', detail: 'New expiration date recorded. Earlier caution cleared.' },
  { day: 19, sub: 's11', field: 'classifications', from: 'C-33', to: 'C-33 (removed C-61)', severity: 'caution',
    title: 'Classification removed', detail: 'A specialty classification no longer appears on the record.' },
  { day: 22, sub: 's1', field: 'discipline', from: 'None shown', to: 'Pending action flag', severity: 'caution',
    title: 'Disciplinary flag added', detail: 'Registry shows a pending disciplinary action.' },
  { day: 24, sub: 's7', field: 'workersComp', from: 'Policy expired', to: 'New policy on file', severity: 'clear',
    title: 'Workers’ comp restored', detail: 'New policy recorded. Gap of 12 days between policies.' },
  { day: 27, sub: 's2', field: 'bond', from: 'Cancellation pending', to: 'Cancelled', severity: 'red',
    title: 'Contractor bond cancelled', detail: 'Cancellation took effect. No replacement bond on file.' },
];

export const SEVERITY_RANK = { red: 3, caution: 2, clear: 1 };

/** Current tag per sub after replaying events up to and including `day`. */
export function stateAt(day) {
  const state = Object.fromEntries(subs.map((s) => [s.id, { tag: 'clear', open: [] }]));
  for (const e of events) {
    if (e.day > day) break;
    const s = state[e.sub];
    // a 'clear' event resolves earlier findings on the same field
    s.open = s.open.filter((o) => o.field !== e.field);
    if (e.severity !== 'clear') s.open.push(e);
    const worst = s.open.reduce((m, o) => Math.max(m, SEVERITY_RANK[o.severity]), 1);
    s.tag = worst === 3 ? 'red' : worst === 2 ? 'caution' : 'clear';
  }
  return state;
}

/** Deterministic pseudo-hash for the sample evidence trail (clearly not a real snapshot). */
export function sampleHash(seed) {
  let h = 2166136261;
  for (const c of String(seed)) { h ^= c.charCodeAt(0); h = Math.imul(h, 16777619); }
  const hex = (h >>> 0).toString(16).padStart(8, '0');
  return `sample-${hex}${hex.split('').reverse().join('')}`;
}
