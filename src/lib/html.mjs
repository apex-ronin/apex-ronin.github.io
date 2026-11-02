// Minimal, dependency-free HTML templating with escaping by default.
// `html` escapes every interpolated value unless it is a SafeHtml (produced by html`` or raw()).

class SafeHtml {
  constructor(value) { this.value = value; }
  toString() { return this.value; }
}

const ESC = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

export function escape(value) {
  return String(value).replace(/[&<>"']/g, (c) => ESC[c]);
}

function render(value) {
  if (value === null || value === undefined || value === false) return '';
  if (value instanceof SafeHtml) return value.value;
  if (Array.isArray(value)) return value.map(render).join('');
  return escape(value);
}

export function html(strings, ...values) {
  let out = strings[0];
  for (let i = 0; i < values.length; i++) out += render(values[i]) + strings[i + 1];
  return new SafeHtml(out);
}

/** Mark trusted markup (e.g. authored SVG) as safe. Never pass user input. */
export function raw(markup) { return new SafeHtml(String(markup)); }

/** JSON for <script type="application/json"> / ld+json: escapes `<` so it cannot close the tag. */
export function jsonScript(data) {
  return raw(JSON.stringify(data).replace(/</g, '\\u003c'));
}

export const money = (n) => '$' + Number(n).toLocaleString('en-US');
