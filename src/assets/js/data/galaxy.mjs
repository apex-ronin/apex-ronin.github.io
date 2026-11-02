// Primordial Galaxy reference architecture (PG-0).
// Every node maps to code in the private primordial-galaxy repository or is marked planned/retired.
// Source of truth: the project source repository and ledger (see docs/STATUS.md for the review record).
// Reviewed 2026-11-02. Re-verify statuses before publishing changes.
//
// status: implemented (code exists and runs in the research environment; NOT the same as validated)
//         prototype   (code exists; the concept is not yet proven)
//         planned     (not built)
//         retired     (built, then deliberately removed)

export const LAYERS = [
  { id: 'source', name: 'Validated sources', short: 'Source', rule: 'Primary public records. The only layer allowed to establish a fact.' },
  { id: 'state', name: 'Recorded state', short: 'Record', rule: 'What the system saw, when, and from where. Append-only; never rewritten by a model.' },
  { id: 'orchestration', name: 'Orchestration', short: 'Orchestration', rule: 'Deterministic code that moves, filters and checks work. Same input, same output.' },
  { id: 'interpretation', name: 'Model interpretation', short: 'Interpretation', rule: 'What a model thinks it means. Always labeled. Never promoted to source.' },
];

export const STATUS_TEXT = { implemented: 'Implemented', prototype: 'Prototype', planned: 'Planned', retired: 'Retired' };

export const nodes = [
  // --- validated sources
  { id: 'sam', layer: 'source', name: 'SAM.gov opportunities', status: 'implemented', module: 'execution/scraper_sam.py',
    body: 'Federal contract opportunities through the official SAM.gov API.' },
  { id: 'districts', layer: 'source', name: 'California district portals', label: 'California districts', status: 'implemented', module: 'execution/scraper_csda.py',
    body: 'Procurement notices from California special districts, read in a browser because the portals require it.' },
  { id: 'grants', layer: 'source', name: 'Grants.gov and SBIR', status: 'implemented', module: 'execution/grant_hunter.py',
    body: 'Federal grant and small-business research funding announcements.' },
  { id: 'regs', layer: 'source', name: 'FAR and DFARS text', status: 'implemented', module: 'scripts/ingest_ecfr.py',
    body: 'Federal acquisition regulations from official government publishing sources, including the FAR overhaul text.' },
  { id: 'census', layer: 'source', name: 'Census of Governments', status: 'implemented', module: 'observatory/entity_procurement.py',
    body: 'The universe of U.S. government units, used to identify who is buying.' },
  { id: 'enforcement', layer: 'source', name: 'Enforcement and adjudication records', label: 'Enforcement records', status: 'planned', module: null,
    body: 'False Claims Act settlements, bid protest decisions, debarments and inspector general findings. Not yet ingested.' },
  { id: 'awards', layer: 'source', name: 'Ten years of award history', label: 'Award history', status: 'planned', module: null,
    body: 'Past federal awards, to compare a new solicitation with how similar work was bought before. Not yet ingested.' },

  // --- recorded state
  { id: 'ledger', layer: 'state', name: 'Observatory run ledger', status: 'implemented', module: 'observatory/recorder.py',
    body: 'Every pipeline run, source, model provider and outcome, written to a local database as it happens.' },
  { id: 'archive', layer: 'state', name: 'Document archive', status: 'implemented', module: 'observatory/archive.py',
    body: 'Fetched solicitation text, stored with where and when it was retrieved.' },
  { id: 'entities', layer: 'state', name: 'Government entity index', status: 'implemented', module: 'observatory/entity_procurement.py',
    body: 'Government units matched to their procurement pages and portal platforms.', measure: '78,291 entities indexed (ledger, 2026-06-10)' },
  { id: 'corpus', layer: 'state', name: 'Regulatory corpus index', status: 'implemented', module: 'observatory/embed_corpus.py',
    body: 'Regulatory text split into retrievable records with provenance.', measure: '2,318 records (ledger, 2026-10-04)' },
  { id: 'clauses', layer: 'state', name: 'Curated clause corpus', status: 'implemented', module: 'legal-corpus repository',
    body: 'Contract clauses curated for retrieval. A provenance audit is open on part of it; see the gate.', measure: '104 clauses (ledger, 2026-10-03)' },
  { id: 'decisions', layer: 'state', name: 'Review decision log', status: 'implemented', module: 'execution/review_decisions.py',
    body: 'Every human approve or reject decision on a draft, with who and why. Rejected drafts are never re-queued.' },

  // --- orchestration
  { id: 'orchestrator', layer: 'orchestration', name: 'Pipeline orchestrator', status: 'implemented', module: 'execution/orchestrator.py',
    body: 'Runs each stage in order on a schedule or on demand, and records the run.' },
  { id: 'fetch', layer: 'orchestration', name: 'Safe fetch', status: 'implemented', module: 'execution/safe_fetch.py',
    body: 'Controlled retrieval of public pages and files, with errors classified rather than swallowed.' },
  { id: 'retrieval', layer: 'orchestration', name: 'Retrieval', status: 'implemented', module: 'execution/antibody_agent.py',
    body: 'Finds the regulatory text relevant to a solicitation, by meaning with a keyword fallback.' },
  { id: 'applicability', layer: 'orchestration', name: 'Applicability filter', status: 'implemented', module: 'execution/applicability.py',
    body: 'Rules that decide which authority can apply to which kind of procurement before any model sees it.' },
  { id: 'grounding', layer: 'orchestration', name: 'Grounding check', status: 'implemented', module: 'execution/antibody_agent.py',
    body: 'Confirms each citation in a draft exists in the corpus. It does not yet confirm the citation is relevant; that gap is tracked.' },
  { id: 'router', layer: 'orchestration', name: 'Model router', status: 'implemented', module: 'execution/llm_client.py',
    body: 'Local model first, external providers as fallback. The provider used is recorded on every run.' },
  { id: 'agents', layer: 'orchestration', name: 'Multi-agent coordination', status: 'planned', module: null,
    body: 'Narrow, auditable agents working one job together. Design direction only.' },
  { id: 'durable', layer: 'orchestration', name: 'Durable workflows', status: 'planned', module: null,
    body: 'Long runs that resume exactly where they stopped after a failure. Design direction only.' },
  { id: 'vertex', layer: 'orchestration', name: 'Hosted search discovery', status: 'retired', module: 'execution/discovery_engine.py',
    body: 'A hosted cloud search integration. Retired on 2026-06-10; the module is now an inert stub.' },

  // --- interpretation
  { id: 'scoring', layer: 'interpretation', name: 'Opportunity fit scoring', status: 'implemented', module: 'execution/hunter_brain.py',
    body: 'A model’s read of how well an opportunity fits. Stored as interpretation alongside the record, never in place of it.' },
  { id: 'redteam', layer: 'interpretation', name: 'Fraud hypotheses', status: 'prototype', module: 'execution/red_team_simulation.py',
    body: 'A model proposes how a procurement could be defrauded. These are hypotheses for a person to weigh, not findings.' },
  { id: 'drafts', layer: 'interpretation', name: 'Draft anti-fraud clauses', status: 'prototype', module: 'execution/antibody_agent.py',
    body: 'Protective contract language drafted from retrieved authority. Every draft must cite its sources and pass the gate.' },

  // --- the gate
  { id: 'gate', layer: 'gate', name: 'Human review gate', status: 'implemented', module: 'execution/review_decisions.py',
    body: 'Nothing a model writes leaves the system without a person approving it. Ungrounded drafts cannot be approved. Current state: closed. No draft has passed review, so none is published or offered.' },
];

// Data flow edges (from -> to). Drawn faintly; the trace lights them up.
export const edges = [
  ['sam', 'fetch'], ['districts', 'fetch'], ['grants', 'fetch'], ['fetch', 'archive'], ['fetch', 'ledger'],
  ['census', 'entities'], ['regs', 'corpus'], ['corpus', 'retrieval'], ['clauses', 'retrieval'],
  ['orchestrator', 'fetch'], ['orchestrator', 'ledger'], ['archive', 'applicability'], ['entities', 'scoring'],
  ['applicability', 'retrieval'], ['router', 'scoring'], ['router', 'redteam'], ['router', 'drafts'],
  ['archive', 'scoring'], ['scoring', 'redteam'], ['redteam', 'drafts'], ['retrieval', 'drafts'],
  ['drafts', 'grounding'], ['grounding', 'gate'], ['gate', 'decisions'],
];

export const trace = [
  { nodes: ['sam'], title: 'A solicitation is published', body: 'A contracting office posts a notice to a public source. This is the only moment the system meets the outside world, and it is a primary record.' },
  { nodes: ['orchestrator', 'fetch', 'archive', 'ledger'], title: 'Fetched and recorded first', body: 'Before anything interprets it, the notice is retrieved, stored and logged: where it came from, when, and which run fetched it.' },
  { nodes: ['census', 'entities'], title: 'Matched to the buyer', body: 'The issuing agency is matched against the index of government units, so the record knows who is buying.' },
  { nodes: ['router', 'scoring'], title: 'Scored, and labeled as a score', body: 'A model reads the record and estimates fit. Its narrative is saved as interpretation next to the record. It never overwrites a fact.' },
  { nodes: ['redteam'], title: 'Red-teamed', body: 'A model proposes how this procurement could be defrauded: shell vendors, bid rotation, false certifications. Hypotheses, not findings.' },
  { nodes: ['applicability', 'regs', 'corpus', 'clauses', 'retrieval', 'drafts'], title: 'Drafted with citations', body: 'Protective clause language is drafted only from authority retrieved for this procurement. Every sentence must point back to a source record.' },
  { nodes: ['grounding', 'gate', 'decisions'], title: 'Stopped at the gate', body: 'Citations are checked to exist. A named person approves or rejects, and the decision is logged. Today the gate is closed: no draft has met the standard yet, and that is reported here rather than hidden.' },
];
