// Server-side SVG for the Primordial Galaxy authority map. Concentric rings = authority layers,
// innermost = most authoritative. Positions are computed here so the map works without JavaScript.
import { html, raw } from '../lib/html.mjs';
import { nodes, edges, LAYERS, STATUS_TEXT } from '../assets/js/data/galaxy.mjs';

const C = 500;
const R = { source: 125, state: 238, orchestration: 345, interpretation: 440, gate: 486 };
const ANGLE = {
  sam: -90, grants: -35, census: 15, awards: 60, enforcement: 120, regs: 165, districts: 215,
  decisions: -90, archive: -30, entities: 30, ledger: 90, corpus: 150, clauses: 210,
  grounding: -90, router: -50, fetch: -10, orchestrator: 30, durable: 70, agents: 110, vertex: 150, applicability: 190, retrieval: 230,
  drafts: -122, redteam: -58, scoring: 40,
  gate: -90,
};

export function position(id) {
  const n = nodes.find((x) => x.id === id);
  const a = (ANGLE[id] * Math.PI) / 180;
  const r = R[n.layer];
  return { x: +(C + r * Math.cos(a)).toFixed(1), y: +(C + r * Math.sin(a)).toFixed(1), a };
}

const layerName = Object.fromEntries([...LAYERS.map((l) => [l.id, l.name]), ['gate', 'Human review gate']]);

function label(n, p) {
  if (n.id === 'gate') return '';
  const cos = Math.cos(p.a);
  const sin = Math.sin(p.a);
  const anchor = cos > 0.55 ? 'start' : cos < -0.55 ? 'end' : 'middle';
  const dx = cos * 18;
  const dy = sin * 18 + (anchor === 'middle' ? (sin > 0 ? 12 : -4) : 5);
  return html`<text x="${(p.x + dx).toFixed(1)}" y="${(p.y + dy).toFixed(1)}" text-anchor="${anchor}">${n.label || n.name}</text>`;
}

export function galaxyMap() {
  const bearings = Array.from({ length: 12 }, (_, i) => i * 30);
  return html`<svg class="pg-map" viewBox="-60 0 1120 1000" role="group" aria-labelledby="pg-map-title" aria-describedby="pg-map-desc">
  <title id="pg-map-title">Primordial Galaxy authority map</title>
  <desc id="pg-map-desc">Four concentric rings. From the center outward: validated sources, recorded state, orchestration, model interpretation. A human review gate sits on the outer boundary at the top. Each point is a system component; select one for details. The same information is available as text below the map.</desc>
  <g class="pg-grid" aria-hidden="true">
    ${bearings.map((b) => {
      const a = ((b - 90) * Math.PI) / 180;
      return html`<line x1="${C}" y1="${C}" x2="${(C + 470 * Math.cos(a)).toFixed(1)}" y2="${(C + 470 * Math.sin(a)).toFixed(1)}"/>
      ${b === 0 ? '' : html`<text x="${(C + 492 * Math.cos(a)).toFixed(1)}" y="${(C + 492 * Math.sin(a) + 4).toFixed(1)}" text-anchor="middle">${String(b).padStart(3, '0')}°</text>`}`;
    })}
  </g>
  <g aria-hidden="true">
    <circle class="pg-ring pg-ring--source" cx="${C}" cy="${C}" r="${R.source}"/>
    <circle class="pg-ring pg-ring--state" cx="${C}" cy="${C}" r="${R.state}"/>
    <circle class="pg-ring pg-ring--state-inner" cx="${C}" cy="${C}" r="${R.state - 5}"/>
    <circle class="pg-ring pg-ring--orchestration" cx="${C}" cy="${C}" r="${R.orchestration}"/>
    <circle class="pg-ring pg-ring--interpretation" cx="${C}" cy="${C}" r="${R.interpretation}"/>
    <circle class="pg-ring pg-ring--boundary" cx="${C}" cy="${C}" r="${R.gate}"/>
    <circle class="pg-core" cx="${C}" cy="${C}" r="38"/>
    <path class="pg-core-mark" d="M478 520 500 478 522 520Z"/>
  </g>
  <g class="pg-edges" aria-hidden="true">
    ${edges.map(([a, b]) => {
      const p = position(a); const q = position(b);
      return html`<line data-from="${a}" data-to="${b}" x1="${p.x}" y1="${p.y}" x2="${q.x}" y2="${q.y}"/>`;
    })}
  </g>
  <g class="pg-nodes">
    ${nodes.map((n) => {
      const p = position(n.id);
      const shape = n.id === 'gate'
        ? raw(`<rect x="${p.x - 13}" y="${p.y - 13}" width="26" height="26" transform="rotate(45 ${p.x} ${p.y})"/>`)
        : n.status === 'retired'
          ? raw(`<circle cx="${p.x}" cy="${p.y}" r="10"/><path d="M${p.x - 7} ${p.y - 7}L${p.x + 7} ${p.y + 7}M${p.x + 7} ${p.y - 7}L${p.x - 7} ${p.y + 7}"/>`)
          : raw(`<circle cx="${p.x}" cy="${p.y}" r="${n.layer === 'source' ? 12 : 10}"/>`);
      return html`<a href="#pg-node-${n.id}" class="node node--${n.layer} node--${n.status}" data-node="${n.id}"
        aria-label="${n.label ? `${n.label}. ${n.name}` : n.name}. ${layerName[n.layer]}. ${STATUS_TEXT[n.status]}.">${shape}<circle class="node__hit" cx="${p.x}" cy="${p.y}" r="22"/>${label(n, p)}</a>`;
    })}
  </g>
  <text class="pg-gate-label" x="${C + 24}" y="${C - R.gate + 6}" text-anchor="start" aria-hidden="true">Human review gate</text>
</svg>`;
}
