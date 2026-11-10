/* Simulated catalog exception queue. */
const ROWS = [
  { id:"SKU-4471", title:"Meridian 12in Wall Sconce", cls:"price", feed:"$84.00", live:"$64.00", impact:8420, sev:"h", owner:"—", note:"Storefront undercuts feed by $20.00 across 421 trailing 30d units." },
  { id:"SKU-2210", title:"Halden Cordless Drill Kit", cls:"availability", feed:"In stock · 84", live:"Sold out", impact:6190, sev:"h", owner:"—", note:"Warehouse feed shows 84 units available; storefront PDP renders out-of-stock badge." },
  { id:"SKU-8890", title:"Ridge 4-Piece Bath Set", cls:"broken", feed:"Active", live:"404", impact:3480, sev:"h", owner:"—", note:"Canonical URL in merchant feed returns HTTP 404 on public storefront." },
  { id:"SKU-1032", title:"Alder Task Chair", cls:"price", feed:"$219.00", live:"$219.00", impact:0, sev:"l", owner:"—", note:"Consistent. Retained as control row." },
  { id:"SKU-7745", title:"Kestrel Patio Cover 10ft", cls:"missing", feed:"Active", live:"Not listed", impact:2950, sev:"m", owner:"—", note:"Active in ERP export; absent from category index and site search." },
  { id:"SKU-3319", title:"Sutter Shelf Bracket", cls:"availability", feed:"Low stock · 3", live:"In stock", impact:1200, sev:"m", owner:"—", note:"Storefront accepts bulk cart quantities above remaining feed inventory." },
];
const CLS = { price:["h","Price"], availability:["h","Availability"], broken:["h","Broken"], missing:["m","Missing"], ok:["l","OK"] };

function mount(root){
  let f = "all", sel = null, triaged = new Set();
  root.innerHTML = `
    <div class="demo__bar"><span class="mono">Merchant feed ↔ storefront</span><span class="mono" style="color:var(--blade-2)">$22,240 est. 30d exposure</span></div>
    <div class="demo__tools" role="group" aria-label="Filter by class">
      ${[["all","All"],["price","Price"],["availability","Availability"],["broken","Broken"],["missing","Missing"]].map(([k,l]) => `<button class="chip" data-f="${k}" aria-pressed="${k==="all"}">${l}</button>`).join("")}
      <button class="chip" data-csv style="margin-left:auto">Export CSV</button>
    </div>
    <div data-list></div><div data-panel></div>
    <div class="demo__foot"><span>Simulated · not live storefront data</span><span data-count>0 triaged</span></div>`;

  const list = root.querySelector("[data-list]"), panel = root.querySelector("[data-panel]");
  const money = n => "$" + n.toLocaleString("en-US");

  function render(){
    const rows = ROWS.filter(r => f === "all" || r.cls === f);
    list.innerHTML = `<table><caption class="sr">Catalog exception queue</caption>
      <thead><tr><th>Class</th><th>SKU</th><th class="demo__hide">Feed</th><th class="demo__hide">Live</th><th>Impact</th></tr></thead><tbody>
      ${rows.map(r => `<tr data-id="${r.id}" aria-selected="${sel===r.id}">
        <td><span class="sev sev--${CLS[r.cls][0]}">${CLS[r.cls][1]}</span></td>
        <td><button class="demo__rowbtn" data-open="${r.id}"><span class="num">${r.id}</span> ${r.title}</button></td>
        <td class="demo__hide num">${r.feed}</td><td class="demo__hide num" style="color:${r.feed!==r.live?"var(--blade-2)":""}">${r.live}</td>
        <td class="num">${r.impact?money(r.impact):"—"}</td></tr>`).join("") || `<tr><td colspan="5"><p class="demo__empty">No exceptions in this class.</p></td></tr>`}
      </tbody></table>`;
    panel.innerHTML = sel ? panelHTML(ROWS.find(r=>r.id===sel)) : `<div class="demo__panel"><p class="mono" style="color:#6C727A;margin:0">Select a SKU row to inspect the feed-to-storefront diff.</p></div>`;
  }
  function panelHTML(r){
    const t = triaged.has(r.id);
    return `<div class="demo__panel"><h4><span class="num">${r.id}</span> ${r.title} <span class="sev sev--${CLS[r.cls][0]}" style="margin-left:.5em">${CLS[r.cls][1]}</span></h4>
      <dl class="kv"><dt>Feed value</dt><dd>${r.feed}</dd><dt>Storefront</dt><dd style="color:var(--blade-2)">${r.live}</dd>
        <dt>30d impact</dt><dd>${r.impact?money(r.impact):"none"}</dd><dt>Assessment</dt><dd>${r.note}</dd></dl>
      <div class="flex wrapf gap">
        <button class="chip" data-triage="${r.id}" aria-pressed="${t}" style="${t?"background:var(--verified);border-color:var(--verified);color:var(--ink)":""}">${t?"Triaged ✓":"Mark triaged"}</button>
        <button class="chip" data-assign="${r.id}">Assign owner</button>
      </div></div>`;
  }
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-f]");
    if (b){ f = b.dataset.f; root.querySelectorAll("[data-f]").forEach(x => x.setAttribute("aria-pressed", String(x.dataset.f === f))); render(); return; }
    const t = e.target.closest("[data-triage]");
    if (t){ const id = t.dataset.triage; triaged.has(id) ? triaged.delete(id) : triaged.add(id); root.querySelector("[data-count]").textContent = triaged.size + " triaged"; render(); return; }
    const a = e.target.closest("[data-assign]");
    if (a){ a.textContent = "Owner: site-ops@…"; return; }
    if (e.target.closest("[data-csv]")){
      const csv = "sku,class,feed,live,impact\n" + ROWS.map(r => [r.id,r.cls,r.feed,r.live,r.impact].join(",")).join("\n");
      const blob = new Blob([csv], { type:"text/csv" });
      const url = URL.createObjectURL(blob); const link = document.createElement("a");
      link.href = url; link.download = "exceptions.csv"; link.click(); URL.revokeObjectURL(url); return;
    }
    const o = e.target.closest("[data-open]") || e.target.closest("tr");
    if (o && (o.dataset.open || o.dataset.id)){ sel = o.dataset.open || o.dataset.id; render(); }
  });
  render();
}
document.querySelectorAll('[data-demo="cat"]').forEach(mount);
