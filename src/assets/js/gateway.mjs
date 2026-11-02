// The doorway: the benchmark link opens into Primordial Galaxy with a single circular reveal
// that starts where the visitor clicked. Reduced motion or modified clicks navigate normally.
const door = document.querySelector('[data-door]');
if (door) {
  door.addEventListener('click', (e) => {
    if (e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    e.preventDefault();
    const r = door.getBoundingClientRect();
    const x = e.clientX || r.left + r.width / 2;
    const y = e.clientY || r.top + r.height / 2;
    const cover = document.createElement('div');
    cover.className = 'door-cover';
    cover.style.setProperty('--x', `${x}px`);
    cover.style.setProperty('--y', `${y}px`);
    document.body.append(cover);
    requestAnimationFrame(() => requestAnimationFrame(() => cover.classList.add('is-open')));
    try { sessionStorage.setItem('pg-arrival', '1'); } catch { /* storage unavailable */ }
    setTimeout(() => { window.location.href = door.href; }, 820);
  });
  // Back/forward cache: remove the cover if the visitor returns to this page.
  window.addEventListener('pageshow', () => document.querySelectorAll('.door-cover').forEach((c) => c.remove()));
}
