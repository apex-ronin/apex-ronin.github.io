#!/usr/bin/env node
/* Static verification for Multi-Page Static Site:
   links, required metadata, duplicate ids, secret leaks,
   placeholder buttons, and unit tests for form-core. */
import { readFileSync, readdirSync, existsSync } from "node:fs";
import { join, resolve } from "node:path";
import { validateStep, isValidEmail, buildMailto } from "../assets/form-core.js";

const ROOT = resolve(import.meta.dirname, "..");
const PAGES = readdirSync(ROOT).filter(f => f.endsWith(".html"));
let fails = 0, checks = 0;
const fail = (m) => { fails++; console.error("  ✗ " + m); };
const pass = () => { checks++; };

/* ---------- 1. unit tests ---------- */
const FIELDS = [
  { name:"email", label:"Work email", required:true, type:"email" },
  { name:"name", label:"Name", required:true, type:"short" },
  { name:"consent", label:"Consent", required:true, type:"checkbox" },
];
const cases = [
  ["empty -> all three required", {}, ["email","name","consent"]],
  ["bad email", { email:"nope", name:"A", consent:true }, ["email"]],
  ["good", { email:"a@b.co", name:"A", consent:true }, []],
  ["whitespace name rejected", { email:"a@b.co", name:"   ", consent:true }, ["name"]],
];
for (const [label, values, expect] of cases){
  const got = Object.keys(validateStep(FIELDS, values));
  JSON.stringify(got.sort()) === JSON.stringify(expect.sort()) ? pass() : fail("unit: " + label + " got " + JSON.stringify(got));
}
isValidEmail("x@y.dev") ? pass() : fail("unit: valid email rejected");
!isValidEmail("x@y") ? pass() : fail("unit: invalid email accepted");
buildMailto("t", { a:"b" }, "x@y.co").startsWith("mailto:x@y.co?subject=") ? pass() : fail("unit: mailto malformed");

/* ---------- 2. per-page structure ---------- */
const REQUIRED = [
  /<html lang="en">/,
  /<meta name="viewport"/,
  /<title>[^<]{10,70}<\/title>/,
  /<meta name="description" content="[^"]{40,}/,
  /<link rel="canonical"/,
  /class="skip"/,
  /<main id="main"/
];

for (const page of PAGES){
  const src = readFileSync(join(ROOT, page), "utf8");
  for (const re of REQUIRED) re.test(src) ? pass() : fail(page + ": missing " + re);
  if (page === "404.html") continue;

  /* duplicate ids */
  const ids = [...src.matchAll(/\sid="([^"]+)"/g)].map(m => m[1]);
  const dupes = ids.filter((v, i) => ids.indexOf(v) !== i);
  dupes.length ? fail(page + ": duplicate id " + [...new Set(dupes)].join(", ")) : pass();

  /* internal links resolve */
  for (const m of src.matchAll(/href="([^"#][^"]*)"/g)){
    const href = m[1];
    if (/^(https?:|mailto:|tel:|\/\/)/.test(href)) continue;
    const target = href.split("#")[0].split("?")[0];
    if (!target || target === "/") continue;
    existsSync(join(ROOT, target)) ? pass() : fail(page + ": dead link -> " + href);
  }
  /* anchor targets exist */
  for (const m of src.matchAll(/href="#([^"]+)"/g)){
    new RegExp('\\sid="' + m[1] + '"').test(src) ? pass() : fail(page + ": dead anchor #" + m[1]);
  }
  /* placeholder buttons */
  /<button[^>]*>(?:\s*)(?:Click here|TODO|Learn more)<\/button>/.test(src) ? fail(page + ": placeholder button text") : pass();
  /* secrets */
  /(?:sk|pk)_(?:live|test)_[A-Za-z0-9]{6,}/.test(src) ? fail(page + ": hardcoded API key") : pass();
  /* labelled inputs */
  for (const m of src.matchAll(/<input\b[^>]*name="([^"]+)"[^>]*>/g)){
    if (m[1] === "website") continue;
    const idm = /id="([^"]+)"/.exec(m[0]);
    if (!idm) { fail(page + ": input without id -> " + m[1]); continue; }
    new RegExp('for="' + idm[1] + '"').test(src) ? pass() : fail(page + ": unlabelled input " + idm[1]);
  }
  /* form engine wiring */
  if (/<form[^>]*data-form/.test(src)){
    /assets\/form\.js|site\.js/.test(src) ? pass() : fail(page + ": form without engine");
    /data-progress/.test(src) ? pass() : fail(page + ": form missing progress bar");
    /aria-live="polite"/.test(src) ? pass() : fail(page + ": form missing live region");
  }
}

/* ---------- 3. required files ---------- */
for (const f of [
  "robots.txt",
  "sitemap.xml",
  "assets/base.css",
  "assets/site.js",
  "assets/config.js",
  "assets/form.js",
  "assets/form-core.js",
  "assets/demo.css",
  "assets/demos/radar.js",
  "assets/demos/nap.js",
  "assets/demos/catalog.js",
  "assets/demos/fleet.js"
]){
  existsSync(join(ROOT, f)) ? pass() : fail("missing file: " + f);
}

/* ---------- 4. sitemap parity ---------- */
const sitemap = readFileSync(join(ROOT, "sitemap.xml"), "utf8");
for (const p of PAGES.filter(p => p !== "404.html" && p !== "index.html"))
  sitemap.includes(p) ? pass() : fail("sitemap missing " + p);

console.log("\n" + (fails ? "FAIL" : "PASS") + " — " + checks + " checks, " + fails + " failures");
process.exit(fails ? 1 : 0);
