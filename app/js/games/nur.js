// Spiel 6: Nur dieses (Daueraufmerksamkeit)
// Symbole erscheinen nacheinander, Conny tippt nur auf das Zielsymbol (oben gezeigt).
import { shape } from '../icons.js';
import { rnd, pick, bounds, targetEl, tap } from './common.js';
import { hitSound, softTick } from '../audio.js';

// Ablenker je Ziel, nach Ähnlichkeit: 0 deutlich anders, 1 mittel, 2 sehr ähnlich
const SETS = {
  star: [['circle', 'square'], ['triangle', 'starO'], ['starO', 'diamond']],
  circle: [['square', 'triangle'], ['hexagon', 'moon'], ['hexagon', 'drop']],
  triangle: [['circle', 'square'], ['diamond', 'drop'], ['diamond', 'leaf']],
  heart: [['square', 'circle'], ['drop', 'moon'], ['drop', 'leaf']]
};

export default function nur(R) {
  let box = null, kind = 'star', cur = null, count = 0, sinceSwitch = 0;
  let nL = 0, nR = 0, lastSide = null;

  function setTarget(k, changed) {
    kind = k;
    box.innerHTML = shape(kind, 80);
    if (changed) {
      box.classList.add('changed');
      softTick();
      R.after(3500, () => box.classList.remove('changed'));
    }
  }

  // Links und rechts im Wechsel, links nie seltener als rechts
  function side() {
    let s = lastSide === 'L' ? 'R' : 'L';
    if (s === 'R' && (nR >= nL || Math.random() < 0.2)) s = 'L';
    if (s === 'L') nL++; else nR++;
    lastSide = s;
    return s;
  }

  function next() {
    if (R.timeUp) return R.end();
    const every = R.p('switchEvery');
    if (every && sinceSwitch >= every) {
      sinceSwitch = 0;
      setTarget(pick(Object.keys(SETS).filter(k => k !== kind)), true);
      R.after(2000, next);
      return;
    }
    sinceSwitch++;
    count++;
    const isTarget = count === 1 || Math.random() < R.p('targetShare');
    const k = isTarget ? kind : pick(SETS[kind][R.p('similarity')]);
    const b = bounds();
    const size = R.p('size');
    const s = side();
    // Erstes Symbol immer links
    const x = count === 1 || s === 'L' ? rnd(b.x0 + size * 0.7, b.mid - 40) : rnd(b.mid + 40, b.x1 - size * 0.7);
    const y = rnd(200 + size / 2, 780 - size * 0.6);
    const sz = size * (isTarget ? R.helpScale(x) : 1);
    const el = targetEl(x, y, sz, shape(k, sz), { halo: isTarget ? R.helpHalo(x) : 'transparent' });
    el.style.opacity = '0';
    el.style.transition = 'opacity .3s ease, background .3s, color .3s';
    el.dataset.t = isTarget ? '1' : '0';
    R.field.appendChild(el);
    requestAnimationFrame(() => { el.style.opacity = '1'; });
    const item = { el, isTarget, tg: isTarget ? R.present(x, y) : null, x, y, done: false };
    cur = item;
    tap(el, () => {
      if (item.done) { R.repeat(); return; }
      if (item.isTarget) {
        item.done = true;
        R.hit(item.tg);
        hitSound();
        el.style.background = '';
        el.classList.add('found');
        R.cancel(item.timer);
        item.timer = R.after(500, () => leave(item));
      } else {
        R.falseTap(x, y);
      }
    });
    item.timer = R.after(R.p('showMs') * R.slow, () => {
      if (item.isTarget && !item.done) { R.miss(item.tg); R.error(); }
      item.done = true;
      leave(item);
    });
  }

  function leave(item) {
    item.el.style.opacity = '0';
    R.after(300, () => item.el.remove());
    R.after(R.p('gapMs') * R.slow, next);
  }

  return {
    start() {
      const b = bounds();
      box = document.createElement('div');
      box.className = 'target-box';
      box.style.left = (b.mid - 110) + 'px';
      R.field.appendChild(box);
      setTarget(R.target || 'star', false);
      R.after(1200, next);
    },
    hint() { if (box) { box.classList.add('hint'); box.style.animation = 'softPulse 1.6s ease-in-out 2'; R.after(3300, () => { box.style.animation = ''; }); } },
    unhint() {},
    onTimeUp() { if (!cur || cur.done) R.end(); },
    finish() {
      if (cur && cur.tg && !cur.done) R.drop(cur.tg);
      if (cur) cur.el.remove();
      if (box) box.remove();
    }
  };
}
