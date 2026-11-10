/* Simulated Sub Radar desk. Deterministic seed data — no network. */
const DATA = [
  { id:"CSLB-1043882", name:"Northgate Framing Inc.", trade:"C-5 Framing", st:"CA", lic:"Clear → Suspended", bond:"21d", sev:"h", proj:"Riverbend Ph. 2", read:"2026-10-28T09:14Z", note:"Licence suspended since prior read; contractor bond expires in 21 days. Hold progress payment until reinstated." },
  { id:"TDLR-88214", name:"Halden Electric LLC", trade:"Electrical", st:"TX", lic:"Active", bond:"9d", sev:"h", proj:"Mesquite Retail Fitout", read:"2026-10-28T09:16Z", note:"Licence active on TDLR, but surety bond horizon is 9 days. Request renewal certificate before next draw." },
  { id:"DBPR-CGC1520441", name:"Palm Ridge Concrete", trade:"Concrete", st:"FL", lic:"Active", bond:"142d", sev:"m", proj:"Coral Way Mixed Use", read:"2026-10-28T09:18Z", note:"Qualifying agent DBA on DBPR differs from subcontract entity name. Confirm entity continuity." },
  { id:"CSLB-993771", name:"Sutter Drywall Co.", trade:"C-9 Drywall", st:"CA", lic:"Active", bond:"64d", sev:"l", proj:"Riverbend Ph. 2", read:"2026-10-28T09:14Z", note:"Active and clear. Bond renewal window opens inside 60 days." },
  { id:"TDLR-70119", name:"Bexar Mechanical", trade:"HVAC", st:"TX", lic:"Active", bond:"211d", sev:"l", proj:"Mesquite Retail Fitout", read:"2026-10-28T09:16Z", note:"Active registration, entity name and license class match roster." },
  { id:"DBPR-CGC1519880", name:"Kestrel Roofing Group", trade:"Roofing", st:"FL", lic:"Suspended", bond:"—", sev:"h", proj:"Coral Way Mixed Use", read:"2026-10-28T09:18Z", note:"DBPR record shows suspended status and no active bond record attached." },
  { id:"CSLB-1004412", name:"Alder Site Services", trade:"C-12 Earthwork", st:"CA", lic:"Active", bond:"388d", sev:"l", proj:"Riverbend Ph. 2", read:"2026-10-28T09:14Z", note:"Active and clear across CSLB licence, workers' comp, and bond fields." },
  { id:"TDLR-66502", name:"Verde Glazing", trade:"Glazing", st:"TX", lic:"Not found", bond:"—", sev:"m", proj:"Mesquite Retail Fitout", read:"2026-10-28T09:16Z", note:"No matching TDLR record under supplied entity name or number. Verify legal name or exemption." },
];
const SEV = { h:["h","High"], m:["m","Medium"], l:["l","Low"] };
const ORDER = { h:0, m:1, l:2 };

function mount(root){
  let filter = "all", sort = "sev", sel = null;

  root.innerHTML = `
    <div class="demo__bar">
      <span class="mono">Roster · Riverbend Ph. 2 + 2 sites</span>
      <span class="mono" style="color:var(--blade-2)">8 entities · 3 exceptions</span>
    </div>
    <div class="demo__tools" role="group" aria-label="Filter by severity">
      ${["all","h","m","l"].map(k => `<button class="chip" data-f="${k}" aria-pressed="${k==="all"}">${k==="all"?"All":SEV[k][1]}</button>`).join("")}
      <button class="chip" data-sort="1" style="margin-left:auto">Sort: ${sort==="sev"?"severity":"bond"}</button>
    </div>
    <div class="demo__body" data-rows></div>
    <div data-panel></div>
    <div class="demo__foot"><span>Simulated · not live registry data</span><span>Read window 09:14–09:18Z</span></div>`;

  const rows = root.querySelector("[data-rows]");
  const panel = root.querySelector("[data-panel]");

  function render(){
    let d = DATA.filter(r => filter === "all" || r.sev === filter);
    d = [...d].sort((a,b) => sort === "sev" ? ORDER[a.sev]-ORDER[b.sev] : (parseInt(a.bond)||9999)-(parseInt(b.bond)||9999));
    if (!d.length){
      rows.innerHTML = `<p class="demo__empty">No entities at this severity. Clear the filter to see the roster.</p>`;
    } else {
      rows.innerHTML = `<table><caption class="sr">Subcontractor risk register, simulated</caption><thead><tr>
        <th>Severity</th><th>Entity</th><th class="demo__hide">Trade</th><th class="demo__hide">State</th><th>Licence</th><th>Bond</th></tr></thead><tbody>
        ${d.map(r => `<tr data-id="${r.id}" aria-selected="${sel===r.id}">
          <td><span class="sev sev--${r.sev}">${SEV[r.sev][1]}</span></td>
          <td><button class="demo__rowbtn" data-open="${r.id}">${r.name}</button></td>
          <td class="demo__hide">${r.trade}</td><td class="demo__hide num">${r.st}</td>
          <td>${r.lic}</td><td class="num">${r.bond==="—"?"—":r.bond}</td></tr>`).join("")}
      </tbody></table>`;
    }
    renderPanel();
  }

  function renderPanel(){
    if (!sel){
      panel.innerHTML = `<div class="demo__panel" style="border-top:1px solid var(--line)"><p class="mono" style="color:#6C727A;margin:0">Select a row to inspect the registry snapshot and exception note.</p></div>`;
      return;
    }
    const r = DATA.find(x => x.id === sel);
    panel.innerHTML = `<div class="demo__panel">
      <h4>${r.name} <span class="sev sev--${r.sev}" style="margin-left:.5em">${SEV[r.sev][1]}</span></h4>
      <dl class="kv">
        <dt>Record</dt><dd class="num">${r.id}</dd>
        <dt>Project</dt><dd>${r.proj}</dd>
        <dt>Licence</dt><dd>${r.lic}</dd>
        <dt>Bond horizon</dt><dd>${r.bond==="—"?"no bond record":r.bond+" days"}</dd>
        <dt>Read at</dt><dd class="num">${r.read}</dd>
        <dt>Assessment</dt><dd>${r.note}</dd>
      </dl>
      <p class="src" style="margin:0">Public registry snapshot · interpretation labelled</p>
    </div>`;
  }

  root.addEventListener("click", e => {
    const f = e.target.closest("[data-f]");
    if (f){
      filter = f.dataset.f;
      root.querySelectorAll("[data-f]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.f === filter)));
      render();
      return;
    }
    if (e.target.closest("[data-sort]")){
      sort = sort === "sev" ? "bond" : "sev";
      root.querySelector("[data-sort]").textContent = "Sort: " + (sort === "sev" ? "severity" : "bond");
      render();
      return;
    }
    const o = e.target.closest("[data-open]") || e.target.closest("tr");
    if (o && (o.dataset.open || o.dataset.id)){ sel = o.dataset.open || o.dataset.id; render(); }
  });

  render();
}
document.querySelectorAll('[data-demo="radar"]').forEach(mount);
