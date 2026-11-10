/* Two simulated previews: QA run + slot watcher. */
const ASSERTS = [
  ["Variant matrix renders all sizes", "pass"],
  ["Price parity vs feed", "fail", "3 variants diverge"],
  ["Image set ≥ 4 per SKU", "fail", "SKU-8890 has 1"],
  ["Alt text present", "warn", "12 of 340 missing"],
  ["Canonical tags resolve", "pass"],
  ["Availability sync < 5 min", "pass"],
];

document.querySelectorAll('[data-demo="fleet"]').forEach(root => {
  root.innerHTML = `<div class="demo__bar"><span class="mono">Run · build 2026.10.28-a</span><span class="mono" style="color:var(--caution)">6 assertions</span></div>
    <div style="padding:14px" data-out>
      <p class="mono" style="color:#6C727A;margin:0 0 12px">Assertions not yet executed.</p>
    </div>
    <div class="demo__tools"><button class="chip" data-run>Run validation</button><button class="chip" data-reset>Reset</button></div>
    <div class="demo__foot"><span>Simulated run</span><span>Evidence captured per failure</span></div>`;
  const out = root.querySelector("[data-out]");
  root.addEventListener("click", async e => {
    if (e.target.closest("[data-reset]")){
      out.innerHTML = `<p class="mono" style="color:#6C727A;margin:0">Assertions not yet executed.</p>`;
      return;
    }
    if (!e.target.closest("[data-run]")) return;
    out.innerHTML = "";
    for (const [name, res, note] of ASSERTS){
      const row = document.createElement("div");
      row.style.cssText = "display:flex;gap:10px;align-items:baseline;padding:6px 0;border-bottom:1px solid #171B21;font-size:.82rem;opacity:0;transition:opacity .2s";
      row.innerHTML = `<span class="sev sev--${res==="pass"?"l":res==="warn"?"m":"h"}" style="flex:none">${res}</span>
        <span>${name}${note?` <span class="mono" style="color:#6C727A;letter-spacing:0;text-transform:none">— ${note}</span>`:""}</span>`;
      out.appendChild(row);
      requestAnimationFrame(() => row.style.opacity = "1");
      await new Promise(r => setTimeout(r, 260));
    }
    const p = document.createElement("p");
    p.className = "mono"; p.style.cssText = "color:#8A9098;margin:12px 0 0;line-height:1.7";
    p.textContent = "Packet ready for review. 2 failures block sign-off; 1 warning is advisory.";
    out.appendChild(p);
  });
});

document.querySelectorAll('[data-demo="seat"]').forEach(root => {
  const SLOTS = [
    ["Tue 04 Nov", "08:20", "2.1 mi", "match"],
    ["Tue 04 Nov", "13:40", "11.4 mi", "near"],
    ["Wed 05 Nov", "07:50", "2.4 mi", "match"],
    ["Wed 05 Nov", "16:10", "18.0 mi", "far"],
  ];
  root.innerHTML = `<div class="demo__bar"><span class="mono">Watching · 3 sites · AM preferred</span><span class="mono" style="color:var(--verified)">2 window matches</span></div>
    <div style="padding:0"><table><caption class="sr">Availability matches</caption>
      <thead><tr><th>Date</th><th>Time</th><th>Distance</th><th>Fit</th></tr></thead><tbody>
      ${SLOTS.map(([d,t,m,fit]) => `<tr><td>${d}</td><td class="num">${t}</td><td class="num">${m}</td>
        <td><span class="sev sev--${fit==="match"?"l":fit==="near"?"m":"x"}">${fit}</span></td></tr>`).join("")}
      </tbody></table></div>
    <div class="demo__foot"><span>Simulated availability</span><span>Notification carries the booking link</span></div>`;
});
