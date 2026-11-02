"""Regenerate src/assets/og.png (1200x630 social card) from the site's own fonts and tokens."""
import pathlib
from playwright.sync_api import sync_playwright
root = pathlib.Path(__file__).resolve().parents[2]
fonts = root / "node_modules/@fontsource"
html = f"""<!doctype html><html><head><style>
@font-face {{ font-family: B; src: url('file://{fonts}/barlow/files/barlow-latin-500-normal.woff2'); }}
@font-face {{ font-family: BC; src: url('file://{fonts}/barlow-semi-condensed/files/barlow-semi-condensed-latin-700-normal.woff2'); }}
body {{ margin:0; width:1200px; height:630px; background:#eef0ec; color:#1b2422; font-family:B;
  background-image: radial-gradient(circle, rgba(27,36,34,.09) 1.5px, transparent 2px); background-size: 22px 22px; }}
.w {{ padding: 72px 80px; display:flex; flex-direction:column; height:100%; box-sizing:border-box; }}
.brand {{ display:flex; align-items:center; gap:14px; font: 700 34px BC; }}
.brand svg {{ width:44px; height:44px; color:#b3122e; }}
h1 {{ font: 700 80px/1 BC; letter-spacing:-.01em; margin: 64px 0 0; max-width: 22ch; }}
.tags {{ margin-top:auto; display:flex; gap:14px; }}
.t {{ font: 600 26px B; padding: 8px 22px 8px 34px; clip-path: polygon(16px 0,100% 0,100% 100%,16px 100%,0 50%); position:relative; }}
.t::before {{ content:''; position:absolute; left:17px; top:50%; width:9px; height:9px; margin-top:-4.5px; border-radius:50%; background:#eef0ec; }}
.r {{ background:#b3122e; color:#fff; }} .c {{ background:#f2c230; }} .g {{ background:#2a7149; color:#fff; }}
</style></head><body><div class="w">
<div class="brand"><svg viewBox="0 0 100 100"><path d="M18 78 50 19 82 78H65L50 49 35 78Z M42 78 50 63 58 78Z" fill="currentColor"/></svg>Apex Ronin</div>
<h1>Know when a sub&rsquo;s license, bond, or insurance changes.</h1>
<div class="tags"><span class="t r">Red tag</span><span class="t c">Caution</span><span class="t g">Clear</span></div>
</div></body></html>"""
tmp = root / "tests/tools/_og.html"; tmp.write_text(html)
with sync_playwright() as p:
    b = p.chromium.launch(channel="chrome", args=["--no-sandbox", "--allow-file-access-from-files"])
    pg = b.new_page(viewport={"width": 1200, "height": 630})
    pg.goto(tmp.as_uri()); pg.wait_for_timeout(400)
    pg.screenshot(path=str(root / "src/assets/og.png"))
    b.close()
tmp.unlink()
print("wrote src/assets/og.png")
