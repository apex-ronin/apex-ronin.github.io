import { initForm } from "./form.js";

/* reveal */
const io = new IntersectionObserver((es) => {
  for (const e of es) if (e.isIntersecting){ e.target.classList.add("is-in"); io.unobserve(e.target); }
}, { rootMargin: "0px 0px -8% 0px", threshold: 0.08 });
document.querySelectorAll("[data-reveal]").forEach(el => io.observe(el));

/* mobile sheet */
const burger = document.querySelector(".burger");
const sheet = document.getElementById("sheet");
if (burger && sheet){
  const set = (open) => {
    sheet.dataset.open = String(open);
    burger.setAttribute("aria-expanded", String(open));
    burger.textContent = open ? "Close" : "Menu";
  };
  burger.addEventListener("click", () => set(sheet.dataset.open !== "true"));
  sheet.addEventListener("click", e => { if (e.target.tagName === "A") set(false); });
  document.addEventListener("keydown", e => {
    if (e.key === "Escape" && sheet.dataset.open === "true"){ set(false); burger.focus(); }
  });
}

/* year */
document.querySelectorAll("[data-year]").forEach(el => el.textContent = new Date().getFullYear());

/* forms */
document.querySelectorAll("form[data-form]").forEach(initForm);

/* easter egg: type "ronin" */
let buf = "";
document.addEventListener("keydown", (e) => {
  if (e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.matches("input,textarea,select")) return;
  if (e.key.length !== 1) return;
  buf = (buf + e.key.toLowerCase()).slice(-5);
  if (buf === "ronin" && !location.pathname.includes("primordial")) location.href = "primordial-galaxy.html";
});
