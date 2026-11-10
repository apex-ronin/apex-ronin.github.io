/* Pure form logic. Imported by the browser AND by node tests. */
export const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
export const PHONE_RE = /^[+()\d\s.\-]{7,22}$/;

const MAX = { short: 120, mid: 400, long: 4000 };

export function isValidEmail(v){ return EMAIL_RE.test(String(v||"").trim()); }

export function validateStep(fields, values){
  const errors = {};
  for (const f of fields){
    const raw = values[f.name];
    const v = typeof raw === "string" ? raw.trim() : raw;
    const empty = v === undefined || v === null || v === "" || (Array.isArray(v) && !v.length);
    if (f.required && empty){ errors[f.name] = f.label + " is required."; continue; }
    if (empty) continue;
    if (f.type === "email" && !isValidEmail(v)) errors[f.name] = "Enter a valid work email address.";
    if (f.type === "tel" && !PHONE_RE.test(v)) errors[f.name] = "Enter a reachable phone number.";
    if (f.type === "checkbox" && f.required && v !== true && v !== "true")
      errors[f.name] = "Confirmation required.";
    const cap = MAX[f.max] || MAX.mid;
    if (typeof v === "string" && v.length > cap)
      errors[f.name] = "Keep this under " + cap + " characters.";
  }
  return errors;
}

export function buildPayload(kind, values, meta = {}){
  return {
    form: kind,
    submittedAt: new Date().toISOString(),
    page: meta.page || (typeof location !== "undefined" ? location.pathname : ""),
    referrer: meta.referrer || (typeof document !== "undefined" ? document.referrer : ""),
    fields: values,
  };
}

export function buildMailto(kind, values, to){
  const subject = "Apex Ronin — " + kind + " — " + (values.company || values.name || "new enquiry");
  const body = Object.entries(values)
    .filter(([,v]) => v !== "" && v !== undefined && v !== null)
    .map(([k,v]) => k.replace(/_/g," ").toUpperCase() + ": " + (Array.isArray(v) ? v.join(", ") : v))
    .join("\n");
  return "mailto:" + to + "?subject=" + encodeURIComponent(subject) + "&body=" + encodeURIComponent(body);
}
