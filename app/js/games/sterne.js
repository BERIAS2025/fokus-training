// Spiel 1: Sterne suchen (visuelles Absuchen)
import { shape } from '../icons.js';
import { scatter, leftCount, targetEl } from './common.js';
import { boardCycle } from './board.js';

export default function sterne(R) {
  return boardCycle(R, {
    boardSeconds: () => R.p('boardSeconds'),
    build() {
      const n = R.p('count'), size = R.p('size');
      const nl = leftCount('sterne', n, R.p('leftShare'));
      const pts = scatter(n, size * 0.62, size * 1.45 + 30, nl, { y0: 70, y1: 770 });
      const extras = [];
      if (R.p('guideLine')) {
        const g = document.createElement('div');
        g.className = 'guide';
        g.style.top = Math.round(pts.reduce((s, p) => s + p.y, 0) / pts.length - 3) + 'px';
        extras.push(g);
      }
      const items = pts.map(p => {
        const s = size * R.helpScale(p.x);
        return { x: p.x, y: p.y, target: true, el: targetEl(p.x, p.y, s, shape('star', s), { halo: R.helpHalo(p.x) }) };
      });
      return { items, extras };
    }
  });
}
