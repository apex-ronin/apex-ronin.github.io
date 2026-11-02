// String renderers shared by the static build (server) and browser modules (client),
// so the no-JS page and the interactive page show identical markup.
import { subs, events, stateAt } from '../data/demo-subs.mjs';

export const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

export const TAG_TEXT = { clear: 'Clear', caution: 'Caution', red: 'Red tag', idle: 'Not checked' };

export function tagHTML(tone, text = TAG_TEXT[tone]) {
  return `<span class="tag tag--${tone}"><span class="tag__hole" aria-hidden="true"></span>${esc(text)}</span>`;
}

export function rosterHTML(day, { buttons = false, selected = '' } = {}) {
  const st = stateAt(day);
  return subs.map((s) => {
    const t = st[s.id].tag;
    const label = `<span class="roster__name">${esc(s.name)}</span><span class="roster__meta">${esc(s.trade)}, ${esc(s.state)}, ${esc(s.license)}</span>`;
    const body = buttons
      ? `<button type="button" data-sub="${s.id}" aria-pressed="${selected === s.id}">${label}</button>`
      : `<div>${label}</div>`;
    return `<li data-tag="${t}">${body}${tagHTML(t)}</li>`;
  }).join('');
}

export function summaryHTML(day) {
  const st = stateAt(day);
  const n = { red: 0, caution: 0, clear: 0 };
  for (const v of Object.values(st)) n[v.tag]++;
  return `${tagHTML('red', `${n.red} red tag${n.red === 1 ? '' : 's'}`)}${tagHTML('caution', `${n.caution} caution`)}${tagHTML('clear', `${n.clear} clear`)}`;
}

const subName = Object.fromEntries(subs.map((s) => [s.id, s.name]));

export function feedHTML(day) {
  const list = events.filter((e) => e.day <= day).reverse();
  if (!list.length) return '<li class="feed__empty">No changes recorded yet. Move the slider forward or press Replay month.</li>';
  return list.map((e) => `<li><span class="feed__day">D${e.day}</span>${tagHTML(e.severity)}<span><strong>${esc(subName[e.sub])}</strong>: ${esc(e.title)}</span></li>`).join('');
}
