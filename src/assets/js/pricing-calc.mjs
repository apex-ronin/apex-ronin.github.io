// Pricing calculator: sums the selected plans. Display only; nothing is submitted.
const calc = document.querySelector('[data-calc]');
if (calc) {
  const fmt = (n) => '$' + n.toLocaleString('en-US');
  const update = () => {
    let monthly = 0; let once = 0;
    for (const box of calc.querySelectorAll('input[type=checkbox]:checked')) {
      if (box.dataset.unit === 'month') monthly += Number(box.dataset.price); else once += Number(box.dataset.price);
    }
    calc.querySelector('[data-monthly]').firstChild.textContent = fmt(monthly);
    calc.querySelector('[data-onetime]').firstChild.textContent = fmt(once);
  };
  calc.addEventListener('change', update);
  update();
}
