#!/usr/bin/env python3
"""E2E verification over local static server on port 8080."""
import urllib.request
import sys

PAGES = [
    "/",
    "/index.html",
    "/sub-radar.html",
    "/trade-map-desk.html",
    "/catalog-exception-desk.html",
    "/fleet.html",
    "/pricing.html",
    "/company.html",
    "/b2g.html",
    "/primordial-galaxy.html",
    "/404.html",
]

for p in PAGES:
    url = f"http://localhost:8080{p}"
    with urllib.request.urlopen(url, timeout=5) as resp:
        body = resp.read().decode("utf-8")
        assert resp.status == 200, f"{p} returned {resp.status}"
        assert "<html lang=\"en\">" in body, f"{p} missing html lang=en"

print(f"PASS — verified {len(PAGES)} served routes on :8080")
sys.exit(0)
