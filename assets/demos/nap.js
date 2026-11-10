/* Simulated NAP consistency desk. */
const SCORE = 61;
const CITES = [
  { id:"g", src:"Primary map listing", status:"mismatch", field:"Suite number", live:"Ste 210", canon:"Ste 200", weight:"high" },
  { id:"y", src:"Major directory", status:"mismatch", field:"Phone", live:"(512) 555-0188", canon:"(512) 555-0144", weight:"high" },
  { id:"b", src:"Industry directory", status:"mismatch", field:"Business name", live:"Halden Elec.", canon:"Halden Electric LLC", weight:"med" },
  { id:"f", src:"Social profile", status:"missing", field:"Address", live:"—", canon:"4410 Ridgemont Dr Ste 200", weight:"med" },
  { id:"c", src:"Chamber listing", status:"match", field:"—", live:"consistent", canon:"—", weight:"low" },
  { id:"d", src:"Review aggregator", status:"mismatch", field:"Postcode", live:"78731", canon:"78731-2210", weight:"low" },
];
const LABEL = { match:["l","Consistent"], mismatch:["h","Mismatch"], missing:["x","Absent"] };

function mount(root){
  let sel = null;
  root.innerHTML = `
    <div class="demo__bar"><span class="mono">Baseline · single location</span><span class="mono" style="color:var(--caution)">Score ${SCORE}/100</span></div>
    <div style="padding:14px">
      <div style="height:6px;background:#1D232B;position:relative" role="img" aria-label="Visibility score 61 of 100">
        <div style="position:absolute;inset:0 auto 0 0;width:${SCORE}%;background:var(--caution)"></div>
      </div>
      <div class="flex jc-b mono" style="color:#6C727A;margin-top:7px"><span>Citation integrity</span><span>4 defects · 1 absent</span></div>
    </div>
    <div class="demo__tools" role="group" aria-label="Filter">
      <button class="chip" data-f="all" aria-pressed="true">All</button>
      <button class="chip" data-f="mismatch" aria-pressed="false">Mismatch</button>
      <button class="chip" data-f="missing" aria-pressed="false">Absent</button>
      <button class="chip" data-f="match" aria-pressed="false">Consistent</button>
    </div>
    <div data-list></div><div data-panel></div>
    <div class="demo__foot"><span>Simulated · illustrative records</span><span>Corrections submitted by us, not you</span></div>`;

  const list = root.querySelector("[data-list]"), panel = root.querySelector("[data-panel]");
  let f = "all";

  function render(){
    const rows = CITES.filter(c => f === "all" || c.status === f);
    list.innerHTML = `<table><caption class="sr">Citation inventory</caption><thead><tr><th>Source</th><th>State</th><th class="demo__hide">Field</th></tr></thead><tbody>
      ${rows.map(c => `<tr data-id="${c.id}" aria-selected="${sel===c.id}"><td><button class="demo__rowbtn" data-open="${c.id}">${c.src}</button></td>
        <td><span class="sev sev--${LABEL[c.status][0]}">${LABEL[c.status][1]}</span></td>
        <td class="demo__hide">${c.field}</td></tr>`).join("") || `<tr><td colspan="3"><p class="demo__empty">Nothing in this state.</p></td></tr>`}
    </tbody></table>`;
    panel.innerHTML = sel ? panelHTML(CITES.find(c=>c.id===sel)) : `<div class="demo__panel"><p class="mono" style="color:#6C727A;margin:0">Select a citation to inspect the field diff.</p></div>`;
  }
  function panelHTML(c){
    if (c.status === "match") return `<div class="demo__panel"><h4>${c.src}</h4><p class="mono" style="color:var(--verified);margin:0">All NAP fields match canonical record.</p></div>`;
    return `<div class="demo__panel"><h4>${c.src} <span class="sev sev--${LABEL[c.status][0]}" style="margin-left:.5em">${LABEL[c.status][1]}</span></h4>
      <dl class="kv"><dt>Field</dt><dd>${c.field}</dd><dt>Live value</dt><dd style="color:var(--blade-2)">${c.live}</dd><dt>Canonical</dt><dd>${c.canon}</dd><dt>Priority</dt><dd>${c.weight}</dd></dl>
      <p class="mono" style="color:#8A9098;margin:0;line-height:1.7">Action: ${c.status === "missing" ? "create the listing and verify canonical address" : "submit field correction to match canonical record"}.</p></div>`;
  }
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-f]");
    if (b){ f = b.dataset.f; root.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.f === f))); render(); return; }
    const o = e.target.closest("[data-open]") || e.target.closest("tr");
    if (o && (o.dataset.open || o.dataset.id)){ sel = o.dataset.open || o.dataset.id; render(); }
  });
  render();
}
document.querySelectorAll('[data-demo="nap"]').forEach(mount);
