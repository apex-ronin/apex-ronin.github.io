#!/usr/bin/env node
/* Static checks: required metadata, internal links resolve, sitemap parity,
   no secrets, and no reintroduced claims from the pages removed 2026-11-10. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");
const PAGES = readdirSync(ROOT).filter(f => f.endsWith(".html"));
let fails = 0, checks = 0;
const ok = (cond, msg) => { checks++; if (!cond) { fails++; console.error("  ✗ " + msg); } };

const REQUIRED = [
  /<html lang="en">/, /<meta name="viewport"/, /<title>[^<]{10,70}<\/title>/,
  /<meta name="description" content="[^"]{40,}/, /<link rel="canonical"/,
  /class="skip"/, /<main id="main"/
];
/* Claims that must not come back without evidence: prices, removed products, fake alerts. */
const BANNED = [/\$\d/, /Sub Radar/i, /Trade Map/i, /Catalog Exception/i, /Fleet Collision/i,
  /Seat Sniper/i, /SUSPENDED/, /guarantee/i, /uptime/i, /customers?\s+trust/i];

ok(PAGES.includes("index.html"), "index.html missing");
for (const page of PAGES) {
  const src = readFileSync(join(ROOT, page), "utf8");
  for (const re of REQUIRED) ok(re.test(src), `${page}: missing ${re}`);
  for (const re of BANNED) ok(!re.test(src), `${page}: banned claim ${re}`);
  ok(!/(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{6,}/.test(src), `${page}: hardcoded key`);
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  ok(new Set(ids).size === ids.length, `${page}: duplicate id`);
  for (const m of src.matchAll(/(?:href|src)="([^"#][^"]*)"/g)) {
    const h = m[1];
    if (/^(https?:|mailto:|tel:|\/\/)/.test(h) || h === "/") continue;
    ok(existsSync(join(ROOT, h.replace(/^\//, "").split("#")[0].split("?")[0])), `${page}: dead link -> ${h}`);
  }
  for (const m of src.matchAll(/href="#([^"]+)"/g))
    ok(new RegExp(`\\sid="${m[1]}"`).test(src), `${page}: dead anchor #${m[1]}`);
}

const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
for (const p of PAGES.filter(p => p !== "404.html" && p !== "index.html"))
  ok(sitemap.includes(p), `sitemap missing ${p}`);
for (const m of sitemap.matchAll(/<loc>https:\/\/apexronin\.com\/([^<]*)<\/loc>/g))
  ok(m[1] === "" || existsSync(join(ROOT, m[1])), `sitemap lists missing page ${m[1]}`);
ok(readFileSync(join(ROOT, "CNAME"), "utf8").trim() === "apexronin.com", "CNAME changed");

console.log(`\n${fails ? "FAIL" : "PASS"} — ${checks} checks, ${fails} failures`);
process.exit(fails ? 1 : 0);
