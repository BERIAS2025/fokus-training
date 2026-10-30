// Spiel 4: Paare finden (Arbeitsgedächtnis)
// Karten im ganzen Feld, zwei aufdecken, gleiche Paare bleiben offen.
import { shape } from '../icons.js';
import { grid, shuffle, tap, bounds, leftCount } from './common.js';
import { hitSound } from '../audio.js';

const FACES = ['star', 'moon', 'triangle', 'diamond', 'cross', 'circle', 'square', 'sun8', 'heart', 'drop', 'hexagon', 'leaf'];

export default function paare(R) {
  let board = null;
  let pairs = 0, memErrors = 0, mismatches = 0;
  let ending = false;

  // Raster mit Reserve-Feldern und Versatz: jedes Mal andere Positionen, links mindestens so viele wie rechts
  function layout(nCards, w, h) {
    const b = bounds();
    const fw = b.x1 - b.x0, fh = 740;
    let best = null;
    for (let cols = 2; cols <= 10; cols++) {
      const rows = Math.ceil((nCards + 2) / cols);
      if (fw / cols < w + 44 || fh / rows < h + 40) continue;
      best = { cols, rows };
      break;
    }
    if (!best) return null;
    const cw = fw / best.cols, ch = fh / best.rows;
    const jit = Math.max(0, Math.min(0.12, (cw - w - 44) / cw / 2, (ch - h - 40) / ch / 2));
    const cells = shuffle(grid(best.cols, best.rows, jit, { y0: 40, y1: 780, r: Math.max(w, h) / 2 }));
    if (cells.length < nCards) return null;
    const left = cells.filter(c => c.left), right = cells.filter(c => !c.left);
    const nl = Math.min(left.length, leftCount('paare', nCards, 0.55));
    return [...left.slice(0, nl), ...right.slice(0, nCards - nl), ...left.slice(nl)].slice(0, nCards);
  }

  function newBoard() {
    if (board) board.cards.forEach(c => c.el.remove());
    if (R.timeUp) return R.end();
    const n = R.p('pairs');
    const w = Math.round(210 - (n - 3) * 14), h = Math.round(w * (1.24 - (n - 3) * 0.02));
    const boost = 1 + (R.helpScale(0) - 1) * 0.4;
    let pts = null;
    for (let k = 1; !pts && k > 0.5; k -= 0.06) pts = layout(n * 2, w * boost * k, h * boost * k);
    const faces = shuffle([...shuffle([...FACES]).slice(0, n)].flatMap(f => [f, f]));
    board = { cards: [], open: [], busy: false, born: R.t, lastFlip: R.t, left: n };
    pts.forEach((p, i) => {
      const s = 1 + (R.helpScale(p.x) - 1) * 0.4;
      const cw = w * s, ch = h * s;
      const el = document.createElement('div');
      el.className = 'card';
      el.style.cssText = `left:${Math.round(p.x - cw / 2)}px;top:${Math.round(p.y - ch / 2)}px;width:${Math.round(cw)}px;height:${Math.round(ch)}px;opacity:0;transition:opacity .35s, background .2s, border-color .2s`;
      el.innerHTML = `<div class="face">${shape(faces[i], Math.round(Math.min(cw, ch) * 0.55))}</div>`;
      const card = { el, face: faces[i], x: p.x, y: p.y, tg: null, seen: false, matched: false };
      board.cards.push(card);
      R.field.appendChild(el);
      R.after(Math.min(70, 1000 / pts.length) * i, () => { el.style.opacity = '1'; });
      card.tg = R.present(p.x, p.y);
      tap(el, () => flip(card));
    });
  }

  function flip(card) {
    if (board.busy) return;
    if (card.matched || board.open.includes(card)) { R.repeat(); return; }
    R.action();
    card.el.classList.add('open');
    card.el.classList.remove('hint');
    board.open.push(card);
    if (board.open.length < 2) { board.firstSeenBefore = board.cards.some(c => c !== card && c.face === card.face && c.seen); card.seen = true; return; }
    const [a, b] = board.open;
    b.seen = true;
    if (a.face === b.face) {
      a.matched = b.matched = true;
      [a, b].forEach(c => { c.el.classList.remove('open'); c.el.classList.add('matched'); R.hit(c.tg, R.t - board.lastFlip); });
      hitSound();
      pairs++;
      board.open = [];
      if (--board.left === 0) { board.busy = true; R.after(1000, newBoard); }
    } else {
      mismatches++;
      // Gedächtnisfehler nur, wenn der Partner der ersten Karte schon einmal zu sehen war
      if (board.firstSeenBefore) { memErrors++; R.error(); }
      board.busy = true;
      R.after(R.p('flipBackMs') * R.slow, () => {
        a.el.classList.remove('open'); b.el.classList.remove('open');
        board.open = []; board.busy = false;
      });
    }
    board.lastFlip = R.t;
  }

  return {
    start: newBoard,
    hint() {
      if (!board) return;
      const c = board.cards.filter(x => !x.matched && !board.open.includes(x)).sort((p, q) => p.x - q.x)[0];
      if (c) c.el.classList.add('hint');
    },
    unhint() { if (board) board.cards.forEach(c => c.el.classList.remove('hint')); },
    onTimeUp() {
      if (ending || !board) return R.end();
      ending = true;
      if (R.t - board.born < 6000) R.end();
      else R.after(20000, () => R.end());
    },
    finish(aborted) {
      if (!board) return;
      // Nie aufgedeckte Karten zählen als verpasst (Auslassung), aufgedeckte ohne Paar nicht
      const counts = !aborted && R.t - board.born >= 6000;
      board.cards.forEach(c => { if (!c.matched) (counts && !c.seen ? R.miss(c.tg) : R.drop(c.tg)); });
      board.cards.forEach(c => c.el.remove());
    },
    rate: () => (pairs + memErrors) ? pairs / (pairs + memErrors) : 1,
    extra: () => ({ pairs, mismatches, memErrors })
  };
}
