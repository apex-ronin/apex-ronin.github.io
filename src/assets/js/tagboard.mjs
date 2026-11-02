// Homepage hero: replay a simulated month of registry changes across a GC's subcontractors.
import { rosterHTML, summaryHTML, feedHTML } from './lib/render.mjs';

const board = document.querySelector('[data-tagboard]');
if (board) {
  const range = board.querySelector('input[type=range]');
  const out = board.querySelector('output');
  const roster = board.querySelector('.roster');
  const summary = board.querySelector('.board__summary');
  const feed = board.querySelector('.feed ol');
  const play = board.querySelector('[data-play]');
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)');
  let timer = null;

  const render = (day) => {
    range.value = day;
    out.textContent = `Day ${day}`;
    range.setAttribute('aria-valuetext', `Day ${day} of 30`);
    roster.innerHTML = rosterHTML(day);
    summary.innerHTML = summaryHTML(day);
    feed.innerHTML = feedHTML(day);
  };

  const stop = () => {
    clearInterval(timer); timer = null;
    summary.setAttribute('aria-live', 'polite');
    play.textContent = 'Replay month';
    play.setAttribute('aria-pressed', 'false');
  };

  range.addEventListener('input', () => { stop(); render(Number(range.value)); });

  play.addEventListener('click', () => {
    if (timer) { stop(); return; }
    // Reduced motion: jump to the end state instead of animating day by day.
    if (reduce.matches) { render(30); return; }
    let day = Number(range.value) >= 30 ? 0 : Number(range.value);
    summary.setAttribute('aria-live', 'off');
    render(day);
    play.textContent = 'Pause';
    play.setAttribute('aria-pressed', 'true');
    timer = setInterval(() => {
      day += 1;
      render(day);
      if (day >= 30) stop();
    }, 260);
  });
}
