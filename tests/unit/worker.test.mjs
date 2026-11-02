import { test } from 'node:test';
import assert from 'node:assert/strict';
import worker, { validate } from '../../worker/src/index.mjs';

function fakeDB({ count = 0, fail = false } = {}) {
  const inserted = [];
  return {
    inserted,
    prepare(sql) {
      return {
        bind(...args) {
          return {
            first: async () => { if (fail) throw new Error('down'); return { n: count }; },
            run: async () => { if (fail) throw new Error('down'); inserted.push({ sql, args }); },
          };
        },
      };
    },
  };
}
const env = (db) => ({ DB: db, ALLOWED_ORIGINS: 'https://apexronin.com', IP_SALT: 's' });
const good = { type: 'contact', page: '/contact/', elapsedMs: 9000, fields: { name: 'A', email: 'a@b.co', message: 'hi', consent: true } };
const req = (body, { origin = 'https://apexronin.com', method = 'POST', type = 'application/json' } = {}) =>
  new Request('https://w.test/lead', { method, headers: { Origin: origin, 'Content-Type': type, 'CF-Connecting-IP': '1.2.3.4' }, body: method === 'POST' ? JSON.stringify(body) : undefined });

test('worker: accepts a valid lead and stores a hashed IP, never the raw IP', async () => {
  const db = fakeDB();
  const res = await worker.fetch(req(good), env(db));
  assert.equal(res.status, 200);
  assert.equal(res.headers.get('Access-Control-Allow-Origin'), 'https://apexronin.com');
  const args = db.inserted[0].args;
  assert.ok(!args.includes('1.2.3.4'));
  assert.match(args[6], /^[0-9a-f]{64}$/);
});

test('worker: rejects bad origin, method, content type, schema, missing consent', async () => {
  assert.equal((await worker.fetch(req(good, { origin: 'https://evil.test' }), env(fakeDB()))).status, 403);
  assert.equal((await worker.fetch(req(good, { method: 'GET' }), env(fakeDB()))).status, 405);
  assert.equal((await worker.fetch(req(good, { type: 'text/plain' }), env(fakeDB()))).status, 415);
  const noConsent = { ...good, fields: { ...good.fields, consent: undefined } };
  const r = await worker.fetch(req(noConsent), env(fakeDB()));
  assert.equal(r.status, 400);
  assert.match((await r.json()).error, /Consent/);
  assert.match(validate({ ...good, type: 'nope' }), /Unknown/);
  assert.match(validate({ ...good, fields: { ...good.fields, email: 'x' } }), /email/);
});

test('worker: preflight, rate limit, honeypot, storage failure', async () => {
  const pre = await worker.fetch(new Request('https://w.test/lead', { method: 'OPTIONS', headers: { Origin: 'https://apexronin.com' } }), env(fakeDB()));
  assert.equal(pre.status, 204);
  assert.equal((await worker.fetch(req(good), env(fakeDB({ count: 99 })))).status, 429);
  const db = fakeDB();
  assert.equal((await worker.fetch(req({ ...good, fields: { ...good.fields, company_site: 'x' } }), env(db))).status, 200);
  assert.equal(db.inserted.length, 0);
  assert.equal((await worker.fetch(req(good), env(fakeDB({ fail: true })))).status, 500);
});
