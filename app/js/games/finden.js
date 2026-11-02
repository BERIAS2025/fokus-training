// Spiel 3: Finden und zählen (selektive Aufmerksamkeit)
// Zwischen Ablenkern alle Zielsymbole antippen. Der Zähler oben zeigt die Treffer.
import { shape } from '../icons.js';
import { scatter, grid, shuffle, pick, leftCount, targetEl, bounds } from './common.js';
import { boardCycle } from './board.js';

// Ablenker je Zielsymbol, nach Ähnlichkeit: 0 deutlich anders, 1 mittel, 2 sehr ähnlich
const SETS = {
  sun8: [['square', 'triangle'], ['circle', 'sun4'], ['sun4', 'sunO']],
  star: [['circle', 'square'], ['triangle', 'starO'], ['starO', 'diamond']]
};

export default function finden(R) {
  let counter = null, found = 0, total = 0, kind = 'sun8';

  const updateCounter = () => {
    counter.innerHTML = `${shape(kind, 56)}<span>${found} / ${total}</span>`;
  };

  return boardCycle(R, {
    boardSeconds: () => R.p('boardSeconds'),
    build() {
      const nT = R.p('targets'), nD = R.p('distractors'), size = R.p('size'), sim = R.p('similarity');
      kind = R.target || 'sun8';
      const n = nT + nD;
      const nl = leftCount('finden', nT, 0.6);
      const b = bounds();
      let cells;
      if (n <= 16) {
        cells = scatter(n, size * 0.6, size * 1.5 + 20, Math.ceil(n * 0.55), { y0: 170, y1: 770 });
      } else {
        const cols = Math.ceil(Math.sqrt(n * 1.9)), rows = Math.ceil(n / cols) + 1;
        cells = grid(cols, rows, 0.22, { y0: 170, y1: 770, r: size / 2 });
      }
      cells = shuffle(cells);
      const left = cells.filter(c => c.x < b.mid), right = cells.filter(c => c.x >= b.mid);
      const tl = Math.min(nl, left.length), tr = Math.min(nT - tl, right.length);
      const targets = [...left.slice(0, tl), ...right.slice(0, tr)];
      const rest = [...left.slice(tl), ...right.slice(tr)];
      const distract = shuffle(rest).slice(0, nD);
      total = targets.length; found = 0;
      const dKinds = SETS[kind][sim];
      const items = [
        ...targets.map(c => {
          const s = size * R.helpScale(c.x);
          return { x: c.x, y: c.y, target: true, el: targetEl(c.x, c.y, s, shape(kind, s), { halo: R.helpHalo(c.x), pad: 24 }) };
        }),
        ...distract.map(c => {
          const k = pick(dKinds);
          return { x: c.x, y: c.y, target: false, el: targetEl(c.x, c.y, size * (sim === 0 ? 0.85 : 1), shape(k, size * (sim === 0 ? 0.85 : 1)), { pad: 24, cls: sim === 0 ? 'dim' : '' }) };
        })
      ];
      counter = document.createElement('div');
      counter.className = 'counter';
      counter.style.cssText = `left:${b.mid - 150}px;width:300px`;
      updateCounter();
      return { items, extras: [counter] };
    },
    onHit() { found++; updateCounter(); }
  });
}
