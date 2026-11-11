#!/usr/bin/env python3
"""Serve-level check against a local static server on :8080.
Live routes must return 200; pages removed on 2026-11-10 must not be served."""
import sys
import urllib.error
import urllib.request

BASE = "http://localhost:8080"
LIVE = ["/", "/index.html", "/404.html", "/assets/site.css", "/robots.txt", "/sitemap.xml"]
REMOVED = ["/sub-radar.html", "/trade-map-desk.html", "/catalog-exception-desk.html", "/fleet.html",
           "/pricing.html", "/company.html", "/b2g.html", "/primordial-galaxy.html"]

for p in LIVE:
    with urllib.request.urlopen(BASE + p, timeout=5) as r:
        assert r.status == 200, f"{p} returned {r.status}"
for p in REMOVED:
    try:
        urllib.request.urlopen(BASE + p, timeout=5)
        sys.exit(f"FAIL — removed page still served: {p}")
    except urllib.error.HTTPError as e:
        assert e.code == 404, f"{p} returned {e.code}"

print(f"PASS — {len(LIVE)} live routes 200, {len(REMOVED)} removed routes 404")
