"""End-to-end checks in real Chrome: accessibility (axe-core, WCAG 2.2 AA tags), console errors,
mobile overflow, and every interactive flow. Usage:
    python3 tests/e2e/run_e2e.py email      # site built without LEAD_ENDPOINT
    python3 tests/e2e/run_e2e.py endpoint   # site built with LEAD_ENDPOINT=https://leads.apexronin.test/lead
Requires a static server for dist/ on BASE (default http://localhost:8080)."""
import os, sys, json, pathlib
from playwright.sync_api import sync_playwright, expect

MODE = sys.argv[1] if len(sys.argv) > 1 else "email"
BASE = os.environ.get("BASE", "http://localhost:8080")
ROOT = pathlib.Path(__file__).resolve().parents[2]
AXE = (ROOT / "node_modules/axe-core/axe.min.js").read_text()
PAGES = ["/", "/sub-radar/", "/sub-radar/audit/", "/trade-map-desk/", "/catalog-exception-desk/", "/labs/",
         "/pricing/", "/contact/", "/company/", "/research/", "/privacy/", "/public-sector/",
         "/public-sector/primordial-galaxy/", "/404.html"]
results, failures = [], []

def check(name, cond, detail=""):
    results.append((name, bool(cond)))
    if not cond:
        failures.append(f"{name} {detail}".strip())

def axe(page, label):
    page.evaluate(AXE)
    res = page.evaluate("""async () => (await axe.run(document, {runOnly: {type: 'tag', values: ['wcag2a','wcag2aa','wcag21a','wcag21aa','wcag22aa']}})).violations
        .map(v => ({id: v.id, impact: v.impact, n: v.nodes.length, t: v.nodes.slice(0,2).map(x => x.target.join(' '))}))""")
    bad = [v for v in res if v["impact"] in ("serious", "critical")]
    check(f"axe {label}", not bad, json.dumps(bad))
    minor = [v for v in res if v not in bad]
    if minor:
        print(f"  note: minor axe findings on {label}: {json.dumps(minor)}")

with sync_playwright() as p:
    channel = os.environ.get("E2E_CHANNEL", "chrome")
    browser = p.chromium.launch(channel=None if channel == "chromium" else channel, args=["--no-sandbox"])

    def new_page(width=1366, reduced=False):
        ctx = browser.new_context(viewport={"width": width, "height": 900}, bypass_csp=True,
                                  reduced_motion="reduce" if reduced else "no-preference")
        pg = ctx.new_page()
        pg.errors = []
        pg.on("pageerror", lambda e: pg.errors.append(str(e)))
        # Headless Chrome has no mail handler; that launch failure is expected, not a site error.
        pg.on("console", lambda m: pg.errors.append(m.text) if m.type == "error" and "mailto" not in m.text else None)
        return pg

    if MODE == "email":
        # ---- every page, desktop and phone: axe, errors, overflow
        for width in (1366, 390):
            pg = new_page(width)
            for path in PAGES:
                pg.goto(BASE + path, wait_until="networkidle")
                pg.wait_for_timeout(150)
                label = f"{path} @{width}"
                axe(pg, label)
                check(f"no horizontal overflow {label}", not pg.evaluate("document.documentElement.scrollWidth > window.innerWidth + 1"))
            check(f"no console errors @{width}", not pg.errors, str(pg.errors))
            pg.context.close()

        # ---- CSP is actually enforced (no bypass) and the page still works
        ctx = browser.new_context(viewport={"width": 1366, "height": 900})
        pg = ctx.new_page(); errs = []
        pg.on("console", lambda m: errs.append(m.text) if m.type == "error" else None)
        for path in PAGES:
            pg.goto(BASE + path, wait_until="networkidle")
        check("no CSP violations or errors with CSP enforced", not errs, str(errs))
        ctx.close()

        pg = new_page()
        # ---- homepage replay
        pg.goto(BASE + "/", wait_until="networkidle")
        pg.locator("#board-day").fill("0")
        check("tagboard day 0 has no red tags", "0 red tags" in pg.locator(".board__summary").inner_text())
        pg.locator("#board-day").fill("30")
        check("tagboard day 30 shows red tags", "3 red tags" in pg.locator(".board__summary").inner_text())

        # ---- mobile nav
        m = new_page(390)
        m.goto(BASE + "/", wait_until="networkidle")
        m.locator(".nav-toggle").click()
        check("mobile nav opens", m.locator("#site-nav").is_visible())
        m.keyboard.press("Escape")
        check("mobile nav closes on Escape", not m.locator("#site-nav").is_visible())
        m.context.close()

        # ---- reduced motion: replay jumps to end
        r = new_page(reduced=True)
        r.goto(BASE + "/", wait_until="networkidle")
        r.locator("#board-day").fill("5")
        r.locator("[data-play]").click()
        check("reduced motion replay jumps to day 30", r.locator(".board__day").inner_text() == "Day 30")
        r.goto(BASE + "/public-sector/primordial-galaxy/", wait_until="networkidle")
        check("reduced motion skips galaxy arrival", "pg-arrive" not in (r.locator(".pg-map").get_attribute("class") or ""))
        r.context.close()

        # ---- dashboard
        pg.goto(BASE + "/sub-radar/", wait_until="networkidle")
        pg.select_option("#f-tag", "red")
        check("dashboard filter red shows 3", "3 of 12" in pg.locator("[data-count]").inner_text())
        pg.locator("[data-sub=s2]").click()
        check("dashboard detail shows bond history", "bond cancelled" in pg.locator(".dash__detail").inner_text().lower())
        pg.select_option("#f-state", "TX"); pg.select_option("#f-tag", "caution")
        check("dashboard empty state guides", "Clear a filter" in pg.locator("[data-dashboard] tbody").inner_text())

        # ---- audit flow (email mode)
        pg.goto(BASE + "/sub-radar/audit/", wait_until="networkidle")
        check("email mode labels the submit honestly", "Email" in pg.locator("button[type=submit]").inner_text())
        pg.locator("[data-step='1'] [data-next]").click()
        check("step 1 blocks empty required fields", pg.locator("#f-company-1-error, .field-error").first.is_visible())
        check("focus moves to first invalid field", pg.evaluate("document.activeElement.name") == "company")
        pg.fill("input[name=company]", "Test Builders"); pg.fill("input[name=name]", "Pat Lee")
        pg.fill("input[name=email]", "not-an-email")
        pg.locator("input[name=email]").press("Enter")
        check("Enter in step 1 does not submit", pg.locator("form[data-lead]").is_visible() and pg.locator("[data-step='1']").is_visible())
        check("bad email message", "email address" in pg.locator(".field-error").first.inner_text())
        pg.fill("input[name=email]", "pat@example.com")
        pg.locator("[data-step='1'] [data-next]").click()
        check("advances to step 2", pg.locator("[data-step='2']").is_visible())
        pg.locator("[data-step='2'] [data-next]").click()
        check("step 2 requires a list or opt-out", pg.locator("#sub-list-error").is_visible())
        pg.fill("#sub-list", "Name,State,License\nHalverson Framing, CA, 1234567\nGulfline Plumbing, FL, CGC123\nBad Row, CA, ABC")
        pg.wait_for_timeout(400)
        out = pg.locator("[data-parse-out]").inner_text()
        check("parser reads 3 subs and flags 2 formats", "3 subcontractors read" in out and "2 need a second look" in out, out)
        pg.locator("[data-step='2'] [data-next]").click()
        check("review summarizes request", "3 in the list" in pg.locator("[data-review]").inner_text())
        pg.locator("button[type=submit]").click()
        check("consent is required", pg.locator(".field--check [aria-invalid=true]").count() == 1)
        pg.check("input[name=consent]")
        pg.locator("button[type=submit]").click()
        pg.wait_for_timeout(300)
        text = pg.locator("[data-request-text]").inner_text()
        check("email fallback shows full request", "Halverson Framing,CA,1234567" in text and "Test Builders" in text, text[:200])
        href = pg.locator("[data-mailto]").get_attribute("href")
        check("mailto addressed to company inbox", href.startswith("mailto:jay@apexronin.com?subject="))

        # ---- NAP tool
        pg.goto(BASE + "/trade-map-desk/", wait_until="networkidle")
        pg.locator("[data-sample]").click()
        check("NAP sample flags red cells", pg.locator("td[data-sev=red]").count() == 2)
        check("NAP sample labeled", "Sample data" in pg.locator("[data-out]").inner_text())
        axe(pg, "trade-map-desk after NAP run")
        pg.locator("[data-clear]").click()
        pg.locator("[data-nap-tool] button[type=submit]").click()
        check("NAP empty input explains what to do", "Enter your correct" in pg.locator("[data-out]").inner_text())

        # ---- catalog tools
        pg.goto(BASE + "/catalog-exception-desk/", wait_until="networkidle")
        pg.locator("[data-item=q8]").click()
        pg.locator("[data-advance=q8]").click(); pg.locator("[data-advance=q8]").click(); pg.locator("[data-advance=q8]").click()
        check("queue item resolves", "1 resolved" in pg.locator("[data-counts]").inner_text())
        pg.locator("[data-filter=title]").click()
        check("queue filter", pg.locator("[data-queue] tbody tr").count() == 1)
        pg.locator("[data-catalog-tool] [data-sample]").click()
        out = pg.locator("[data-catalog-tool] [data-out]").inner_text()
        check("catalog diff finds exceptions", "7 SKUs compared" in out and "Price mismatch: 3" in out, out[:200])
        with pg.expect_download() as d:
            pg.locator("[data-export]").click()
        check("exceptions CSV downloads", d.value.suggested_filename == "catalog-exceptions.csv")
        axe(pg, "catalog after interactions")

        # ---- pricing calculator
        pg.goto(BASE + "/pricing/", wait_until="networkidle")
        pg.check("#calc-audit"); pg.check("#calc-desk")
        t = pg.locator("[data-total]").inner_text()
        check("calculator totals", "$848" in t and "$149" in t, t)

        # ---- contact qualifier
        pg.goto(BASE + "/contact/?interest=trade-map-desk", wait_until="networkidle")
        check("contact prefill from interest", pg.locator("#need-trade-map-desk").is_checked())
        check("contact recommendation shown", "Trade Map Desk fits" in pg.locator("[data-recommend]").inner_text())
        pg.goto(BASE + "/contact/", wait_until="networkidle")
        pg.locator("button[type=submit]").click()
        check("radio group shows one error", pg.locator(".field-error").filter(has_text="Choose what you need").count() == 1)

        # ---- galaxy
        pg.goto(BASE + "/public-sector/", wait_until="networkidle")
        pg.locator("[data-door]").click()
        pg.wait_for_url("**/primordial-galaxy/")
        check("doorway navigates to the galaxy", pg.url.endswith("/public-sector/primordial-galaxy/"))
        pg.wait_for_timeout(1800)
        pg.locator("[data-node=redteam]").click()
        check("node opens panel", pg.locator("#pg-panel-title").inner_text() == "Fraud hypotheses")
        check("non-related nodes dim", pg.locator(".pg-map.has-focus").count() == 1)
        pg.locator("[data-goto=drafts]").click()
        check("panel links walk the graph", pg.locator("#pg-panel-title").inner_text() == "Draft anti-fraud clauses")
        axe(pg, "galaxy with panel open")
        pg.locator("[data-trace-start]").click()
        for _ in range(8):
            if pg.locator("[data-trace-next]").is_enabled():
                pg.locator("[data-trace-next]").click()
        check("trace reaches the gate", "Stopped at the gate" in pg.locator("#pg-panel-title").inner_text())
        axe(pg, "galaxy in trace mode")
        pg.keyboard.press("Escape")
        check("Escape exits trace", pg.locator("[data-trace-nav]").is_hidden())
        pg.locator("[data-layer=interpretation]").click()
        check("layer filter", pg.locator(".pg-map").get_attribute("data-layer") == "interpretation")
        pg.keyboard.press("Tab")
        # keyboard: focus a node and activate it with Enter
        pg.locator("[data-node=gate]").focus(); pg.keyboard.press("Enter")
        check("keyboard activates nodes", pg.locator("#pg-panel-title").inner_text() == "Human review gate")

        # ---- legacy redirects
        pg.goto(BASE + "/about.html"); pg.wait_for_url("**/company/")
        check("legacy /about.html redirects", pg.url.endswith("/company/"))
        check("no console errors in flows", not pg.errors, str(pg.errors))

    else:
        # ---- endpoint mode: success and failure paths, with the request intercepted
        pg = new_page()
        captured = []
        def ok(route):
            captured.append(json.loads(route.request.post_data))
            route.fulfill(status=200, content_type="application/json", body='{"ok":true}', headers={"Access-Control-Allow-Origin": "*"})
        pg.route("https://leads.apexronin.test/**", ok)
        pg.goto(BASE + "/labs/", wait_until="networkidle")
        check("endpoint mode keeps the real submit label", pg.locator("button[type=submit]").inner_text() == "Join early access")
        pg.check("input[value='Seat Sniper']")
        pg.fill("input[name=company]", "Acme Ops"); pg.fill("input[name=name]", "Sam"); pg.fill("input[name=email]", "sam@acme.test")
        pg.fill("textarea[name=workflow]", "Weekly inspection booking")
        pg.check("input[name=consent]")
        pg.locator("button[type=submit]").click()
        expect(pg.locator("[data-when=sent]")).to_be_visible()
        check("success state shown", pg.locator("[data-when=sent]").is_visible())
        body = captured[0] if captured else {}
        check("payload shape", body.get("type") == "labs-early-access" and body["fields"].get("email") == "sam@acme.test" and "company_site" not in body["fields"], json.dumps(body))
        check("focus moves to confirmation", pg.evaluate("document.activeElement.textContent").startswith("You"))

        pg.unroute("https://leads.apexronin.test/**")
        pg.route("https://leads.apexronin.test/**", lambda r: r.fulfill(status=500, content_type="application/json", body='{"error":"Storage unavailable."}', headers={"Access-Control-Allow-Origin": "*"}))
        pg.goto(BASE + "/contact/", wait_until="networkidle")
        pg.check("#need-other"); pg.fill("input[name=name]", "Sam"); pg.fill("input[name=email]", "sam@acme.test")
        pg.fill("textarea[name=message]", "Hello"); pg.check("input[name=consent]")
        pg.locator("button[type=submit]").click()
        expect(pg.locator(".form-status")).to_contain_text("Not sent")
        check("failure explains and keeps entries", "Storage unavailable" in pg.locator(".form-status").inner_text() and pg.input_value("textarea[name=message]") == "Hello")
        check("failure offers email fallback", pg.locator("[data-fallback]").is_visible())
        check("button re-enabled after failure", pg.locator("button[type=submit]").is_enabled())

        pg.unroute("https://leads.apexronin.test/**")
        pg.route("https://leads.apexronin.test/**", lambda r: r.fulfill(status=200, body='{}', headers={"Access-Control-Allow-Origin": "*"}))
        pg.goto(BASE + "/trade-map-desk/", wait_until="networkidle")
        pg.fill("#pilot input[name=company]", "Bot Co"); pg.fill("#pilot input[name=name]", "Bot")
        pg.fill("#pilot input[name=email]", "bot@x.test"); pg.check("#pilot input[name=consent]")
        pg.evaluate("document.querySelector('input[name=company_site]').value = 'spam'")
        sent = []
        pg.on("request", lambda r: sent.append(r.url) if "leads.apexronin.test" in r.url else None)
        pg.locator("#pilot button[type=submit]").click()
        pg.wait_for_timeout(300)
        check("honeypot submissions are dropped silently", not sent and pg.locator("#pilot [data-when=sent]").is_visible())
        check("no console errors in endpoint flows", not [e for e in pg.errors if "500" not in e], str(pg.errors))

    browser.close()

passed = sum(1 for _, ok in results if ok)
print(f"e2e ({MODE}): {passed}/{len(results)} checks passed")
for f in failures:
    print("  FAIL:", f)
sys.exit(1 if failures else 0)
