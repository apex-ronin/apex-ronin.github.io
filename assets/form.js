import { validateStep, buildPayload, buildMailto } from "./form-core.js";
const CFG = window.APEX_CONFIG || {};

export function initForm(root){
  const steps = [...root.querySelectorAll("[data-step]")];
  const bar = root.querySelector("[data-progress]");
  const live = root.querySelector("[data-live]");
  const honeypot = root.querySelector("[name=website]");
  const formKey = "apex.draft." + root.dataset.form;
  let i = 0;

  const fieldsOf = (step) => [...step.querySelectorAll("input,select,textarea")]
    .filter(el => el.name && el.name !== "website")
    .map(el => ({ name: el.name, label: el.dataset.label || el.name, required: el.required,
                  type: el.type, max: el.dataset.max }));

  const read = () => {
    const v = {};
    root.querySelectorAll("input,select,textarea").forEach(el => {
      if (!el.name) return;
      if (el.type === "checkbox") v[el.name] = el.checked;
      else if (el.type === "radio") { if (el.checked) v[el.name] = el.value; }
      else v[el.name] = el.value;
    });
    return v;
  };

  const save = () => { try { localStorage.setItem(formKey, JSON.stringify(read())); } catch {} };
  const restore = () => {
    let d; try { d = JSON.parse(localStorage.getItem(formKey) || "null"); } catch { return; }
    if (!d) return;
    root.querySelectorAll("input,select,textarea").forEach(el => {
      if (!el.name || !(el.name in d)) return;
      if (el.type === "checkbox") el.checked = !!d[el.name];
      else if (el.type === "radio") el.checked = el.value === d[el.name];
      else el.value = d[el.name];
    });
    if (bar) bar.dataset.restored = "true";
  };

  const show = (n) => {
    i = Math.max(0, Math.min(n, steps.length - 1));
    steps.forEach((s, k) => { s.hidden = k !== i; });
    if (bar){
      bar.style.setProperty("--p", ((i + 1) / steps.length * 100) + "%");
      bar.textContent = "STEP " + (i + 1) + " / " + steps.length;
    }
    root.querySelectorAll("[data-prev]").forEach(b => { b.hidden = i === 0; });
    const nextBtn = root.querySelector("[data-next]");
    if (nextBtn) nextBtn.textContent = i === steps.length - 1 ? "Send" : "Continue";
    const h = steps[i].querySelector("h3, legend");
    if (h){ h.setAttribute("tabindex","-1"); h.focus({ preventScroll:true }); }
  };

  const clearErrors = (step) => {
    step.querySelectorAll("[data-err]").forEach(e => { e.textContent = ""; e.hidden = true; });
    step.querySelectorAll("[aria-invalid]").forEach(e => e.removeAttribute("aria-invalid"));
  };

  const paintErrors = (step, errors) => {
    let first = null;
    for (const [name, msg] of Object.entries(errors)){
      const el = step.querySelector('[name="' + name + '"]');
      if (!el) continue;
      el.setAttribute("aria-invalid","true");
      const box = step.querySelector('[data-err="' + name + '"]');
      if (box){ box.textContent = msg; box.hidden = false; }
      if (!first) first = el;
    }
    if (first) first.focus({ preventScroll:true });
    if (live) live.textContent = Object.keys(errors).length + " field(s) need attention.";
  };

  root.addEventListener("input", save);
  root.addEventListener("change", save);

  root.addEventListener("click", async (e) => {
    const next = e.target.closest("[data-next]");
    const prev = e.target.closest("[data-prev]");
    if (prev){ show(i - 1); return; }
    if (!next) return;
    const step = steps[i];
    clearErrors(step);
    const errors = validateStep(fieldsOf(step), read());
    if (Object.keys(errors).length){ paintErrors(step, errors); return; }
    if (i < steps.length - 1){ show(i + 1); return; }
    await submit();
  });

  root.addEventListener("keydown", (e) => {
    if (e.key === "Enter" && e.target.tagName !== "TEXTAREA"){
      e.preventDefault();
      root.querySelector("[data-next]:not([hidden])")?.click();
    }
  });

  async function submit(){
    const values = read();
    if (honeypot && honeypot.value){ /* silent pass */ }
    const btn = root.querySelector("[data-next]");
    const out = root.querySelector("[data-result]");
    btn.disabled = true; btn.dataset.label = btn.textContent; btn.textContent = "Sending…";
    const payload = buildPayload(root.dataset.form, values);

    if (CFG.formEndpoint){
      try {
        const res = await fetch(CFG.formEndpoint, {
          method: "POST",
          headers: { "Content-Type": "application/json", Accept: "application/json" },
          body: JSON.stringify(payload),
        });
        if (!res.ok) throw new Error("HTTP " + res.status);
        done(true, values);
      } catch (err){
        done(false, values, err.message);
      }
    } else {
      // Zero-backend fallback: hand off to the user's mail client, keep JSON downloadable.
      window.location.href = buildMailto(root.dataset.form, values, CFG.contactEmail || "");
      done(true, values, null, true);
    }
  }

  function done(ok, values, detail, handoff){
    const out = root.querySelector("[data-result]");
    const btn = root.querySelector("[data-next]");
    btn.disabled = false; btn.textContent = btn.dataset.label || "Send";
    if (!out) return;
    out.hidden = false;
    if (ok){
      out.dataset.state = "ok";
      out.innerHTML = handoff
        ? '<p><strong>Draft prepared.</strong> Your mail client should have opened with the details filled in. Send it to reach us directly.</p>'
        : '<p><strong>Received.</strong> We reply to qualified enquiries within one business day.</p>';
      out.innerHTML += '<p class="mono">REF ' + "AR-" + Date.now().toString(36).toUpperCase() + '</p>';
      const dl = document.createElement("button");
      dl.type = "button";
      dl.className = "btn btn--ghost btn--sm"; dl.textContent = "Download submission record (.json)";
      dl.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(buildPayload(root.dataset.form, values), null, 2)], { type: "application/json" });
        const a = document.createElement("a");
        a.href = URL.createObjectURL(blob); a.download = "apex-ronin-submission.json"; a.click();
        URL.revokeObjectURL(a.href);
      });
      out.appendChild(dl);
      try { localStorage.removeItem(formKey); } catch {}
      root.querySelectorAll("[data-step]").forEach(s => s.hidden = true);
    } else {
      out.dataset.state = "error";
      out.innerHTML = '<p><strong>Submission failed' + (detail ? " (" + detail + ")" : "") + '.</strong> Your answers are saved in this browser. Retry, or download the record below.</p>';
      const dl = document.createElement("button");
      dl.type = "button";
      dl.className = "btn btn--ghost btn--sm"; dl.textContent = "Download submission record (.json)";
      dl.addEventListener("click", () => {
        const blob = new Blob([JSON.stringify(buildPayload(root.dataset.form, values), null, 2)], { type: "application/json" });
        const a = document.createElement("a"); a.href = URL.createObjectURL(blob);
        a.download = "apex-ronin-submission.json"; a.click(); URL.revokeObjectURL(a.href);
      });
      out.appendChild(dl);
    }
    if (live) live.textContent = ok ? "Submission complete." : "Submission failed.";
  }

  if (bar) bar.style.setProperty("--p", (1 / steps.length * 100) + "%");
  restore(); show(0);
}
