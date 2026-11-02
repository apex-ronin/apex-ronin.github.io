// Apex Ronin lead endpoint. Standard fetch handler (Cloudflare Workers; portable to any
// runtime with Request/Response). Stores leads in D1, never logs personal data, and stores a
// salted hash of the client IP only for rate limiting.
//
// Bindings / vars (see wrangler.toml.example):
//   DB               D1 database (schema.sql)
//   ALLOWED_ORIGINS  comma-separated, e.g. "https://apexronin.com"
//   IP_SALT          secret, random string (wrangler secret put IP_SALT)
//   NOTIFY_WEBHOOK   optional secret; receives {"text": "..."} for each accepted lead
//   RATE_LIMIT_PER_HOUR  optional, default 8

const TYPES = new Set(['sub-radar-audit', 'trade-map-desk-pilot', 'catalog-consultation', 'labs-early-access', 'contact']);
const MAX_BODY = 64 * 1024;
const MAX_FIELD = 20000;
const EMAIL = /^[^\s@]{1,64}@[^\s@]{1,255}\.[^\s@]{2,}$/;

const json = (status, body, headers = {}) => new Response(JSON.stringify(body), {
  status, headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store', ...headers },
});

function cors(request, env) {
  const allowed = (env.ALLOWED_ORIGINS || 'https://apexronin.com').split(',').map((s) => s.trim());
  const origin = request.headers.get('Origin') || '';
  if (!allowed.includes(origin)) return null;
  return {
    'Access-Control-Allow-Origin': origin,
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
    'Access-Control-Max-Age': '86400',
    Vary: 'Origin',
  };
}

export function validate(body) {
  if (!body || typeof body !== 'object') return 'Request body must be a JSON object.';
  if (!TYPES.has(body.type)) return 'Unknown request type.';
  const f = body.fields;
  if (!f || typeof f !== 'object' || Array.isArray(f)) return 'Missing form fields.';
  if (Object.keys(f).length > 40) return 'Too many fields.';
  for (const [k, v] of Object.entries(f)) {
    if (!/^[a-z0-9_-]{1,40}$/i.test(k)) return 'Invalid field name.';
    const vals = Array.isArray(v) ? v : [v];
    if (vals.length > 20) return 'Too many values.';
    for (const x of vals) {
      if (!['string', 'number', 'boolean'].includes(typeof x)) return 'Invalid field value.';
      if (String(x).length > MAX_FIELD) return 'A field is too long.';
    }
  }
  if (typeof f.email !== 'string' || !EMAIL.test(f.email)) return 'A valid email address is required.';
  if (!f.consent) return 'Consent to the privacy notice is required.';
  return null;
}

async function sha256(text) {
  const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('');
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const headers = cors(request, env);
    if (url.pathname !== '/lead') return json(404, { error: 'Not found.' });
    if (!headers) return json(403, { error: 'Origin not allowed.' });
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers });
    if (request.method !== 'POST') return json(405, { error: 'Use POST.' }, headers);
    if (!(request.headers.get('Content-Type') || '').startsWith('application/json')) return json(415, { error: 'Send JSON.' }, headers);
    if (Number(request.headers.get('Content-Length') || 0) > MAX_BODY) return json(413, { error: 'Request too large.' }, headers);

    const raw = await request.text();
    if (raw.length > MAX_BODY) return json(413, { error: 'Request too large.' }, headers);
    let body;
    try { body = JSON.parse(raw); } catch { return json(400, { error: 'Request body is not valid JSON.' }, headers); }
    const problem = validate(body);
    if (problem) return json(400, { error: problem }, headers);

    // Honeypot: accept silently, store nothing.
    if (body.fields.company_site) return json(200, { ok: true }, headers);

    const ip = request.headers.get('CF-Connecting-IP') || '';
    const ipHash = await sha256(`${env.IP_SALT || ''}:${ip}`);
    const limit = Number(env.RATE_LIMIT_PER_HOUR || 8);
    try {
      const since = new Date(Date.now() - 3600_000).toISOString();
      const row = await env.DB.prepare('SELECT COUNT(*) AS n FROM leads WHERE ip_hash = ?1 AND created_at > ?2').bind(ipHash, since).first();
      if ((row?.n || 0) >= limit) return json(429, { error: 'Too many requests from this network. Try again in an hour, or email us.' }, headers);

      const flagged = Number(body.elapsedMs) > 0 && Number(body.elapsedMs) < 1500 ? 1 : 0;
      const id = crypto.randomUUID();
      await env.DB.prepare('INSERT INTO leads (id, created_at, type, page, email, payload, ip_hash, flagged) VALUES (?1, ?2, ?3, ?4, ?5, ?6, ?7, ?8)')
        .bind(id, new Date().toISOString(), body.type, String(body.page || '').slice(0, 200), body.fields.email, JSON.stringify(body.fields), ipHash, flagged)
        .run();

      if (env.NOTIFY_WEBHOOK && !flagged) {
        const who = [body.fields.name, body.fields.company].filter(Boolean).join(', ');
        // Notification carries no form content beyond who and what; read the lead in D1.
        await fetch(env.NOTIFY_WEBHOOK, { method: 'POST', headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ text: `New ${body.type} request from ${who || 'a visitor'} (${id})` }) }).catch(() => {});
      }
      return json(200, { ok: true, id }, headers);
    } catch {
      return json(500, { error: 'Storage unavailable.' }, headers);
    }
  },
};
