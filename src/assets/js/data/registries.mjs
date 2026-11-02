// What each public registry publishes, as mapped for Sub Radar.
// 'yes'      = field is published in the registry's public record and we read it
// 'no'       = not part of this registry's public record; we never infer it
// 'unmapped' = may be published, but not yet mapped and verified by us
//
// Verified against registry documentation and public record layouts, 2026-11-02.
// Re-verify before changing any value to 'yes'.

export const registries = [
  {
    id: 'CA', state: 'California', agency: 'Contractors State License Board (CSLB)',
    url: 'https://www.cslb.ca.gov/',
    scope: 'All licensed contractors, by classification.',
    fields: { status: 'yes', classifications: 'yes', expiration: 'yes', bond: 'yes', workersComp: 'yes', discipline: 'yes' },
    note: 'The CSLB record carries contractor bond and workers’ compensation details, so California has the deepest coverage.',
  },
  {
    id: 'TX', state: 'Texas', agency: 'Texas Department of Licensing and Regulation (TDLR)',
    url: 'https://www.tdlr.texas.gov/',
    scope: 'Licensed trades only, such as electrical and air conditioning and refrigeration contractors.',
    fields: { status: 'yes', classifications: 'yes', expiration: 'yes', bond: 'no', workersComp: 'no', discipline: 'unmapped' },
    note: 'Texas has no statewide general contractor license. Plumbing is licensed by a separate board (TSBPE), which we have not yet added.',
  },
  {
    id: 'FL', state: 'Florida', agency: 'Department of Business and Professional Regulation (DBPR)',
    url: 'https://www.myfloridalicense.com/',
    scope: 'Certified and registered contractors, including general, building, residential and specialty classes.',
    fields: { status: 'yes', classifications: 'yes', expiration: 'yes', bond: 'no', workersComp: 'no', discipline: 'unmapped' },
    note: 'Registered (RG, RB, RR) licenses are valid only in specific local jurisdictions; we flag the jurisdiction with the finding.',
  },
];

export const fieldLabels = {
  status: 'License status',
  classifications: 'Classifications',
  expiration: 'Expiration date',
  bond: 'Contractor bond',
  workersComp: 'Workers’ comp',
  discipline: 'Disciplinary flags',
};

export const coverageText = { yes: 'Monitored', no: 'Not in registry', unmapped: 'Not yet mapped' };

/**
 * Light format check for license identifiers. This only catches typos; it does not
 * prove a license exists. Unknown states pass through as 'unchecked'.
 */
export function checkLicenseFormat(state, value) {
  const v = String(value || '').trim().toUpperCase();
  if (!v) return { ok: false, reason: 'Missing license number' };
  if (state === 'CA') return /^\d{1,8}$/.test(v) ? { ok: true } : { ok: false, reason: 'CSLB numbers are digits only' };
  if (state === 'FL') return /^[A-Z]{2,3}\d{4,8}$/.test(v) ? { ok: true } : { ok: false, reason: 'DBPR numbers look like CGC1234567' };
  if (state === 'TX') return /^[A-Z0-9-]{3,20}$/.test(v) ? { ok: true } : { ok: false, reason: 'Unexpected characters' };
  return { ok: true, unchecked: true };
}
