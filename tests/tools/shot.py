"""Screenshot helper: python3 tests/tools/shot.py OUTDIR WIDTH PATH [PATH...]"""
import sys, re
from playwright.sync_api import sync_playwright
out, width, paths = sys.argv[1], int(sys.argv[2]), sys.argv[3:]
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", args=["--no-sandbox"])
    pg = b.new_page(viewport={"width": width, "height": 900})
    errs = []
    pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
    pg.on("pageerror", lambda e: errs.append(str(e)))
    for path in paths:
        pg.goto("http://localhost:8080" + path, wait_until="networkidle")
        name = re.sub(r"[^a-z0-9]+", "_", path.strip("/") or "home") + f"_{width}.png"
        pg.screenshot(path=f"{out}/{name}", full_page=True)
        print(name, "overflow:", pg.evaluate("document.documentElement.scrollWidth > innerWidth"))
    print("errors:", errs)
    b.close()
