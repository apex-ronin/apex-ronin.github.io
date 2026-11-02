"""Viewport screenshot after interactions: python3 view.py OUT WIDTH PATH [js-to-run]"""
import sys
from playwright.sync_api import sync_playwright
out, width, path = sys.argv[1], int(sys.argv[2]), sys.argv[3]
js = sys.argv[4] if len(sys.argv) > 4 else ""
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": width, "height": 900})
    errs = []
    pg.on("pageerror", lambda e: errs.append(str(e)))
    pg.goto("http://localhost:8080" + path, wait_until="networkidle")
    pg.wait_for_timeout(2200)
    if js:
        pg.evaluate(js); pg.wait_for_timeout(600)
    pg.screenshot(path=out)
    print("errors:", errs)
    b.close()
