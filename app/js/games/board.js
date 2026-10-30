// Ablauf für Such-Spiele mit Brettern (Sterne suchen, Finden und zählen):
// Brett aufbauen, alle Ziele finden, nächstes Brett. Nicht gefundene Ziele zählen als verpasst.
import { hitSound } from '../audio.js';
import { tap } from './common.js';

export function boardCycle(R, opts) {
  let board = null;   // { entries, timer, born, extras }
  let lastHit = 0;
  let ending = false;

  function clear() {
    if (!board) return;
    R.cancel(board.timer);
    board.entries.forEach(e => e.el.remove());
    board.extras.forEach(x => x.remove());
    board = null;
  }

  function next() {
    clear();
    if (R.timeUp) return R.end();
    const built = opts.build();
    board = { entries: [], timer: null, born: R.t, extras: built.extras || [] };
    board.extras.forEach(x => R.field.appendChild(x));
    // Von links nach rechts einblenden: der Blick startet links
    const sorted = [...built.items].sort((a, b) => a.x - b.x);
    sorted.forEach((it, i) => {
      it.el.style.opacity = '0';
      R.field.appendChild(it.el);
      const entry = { ...it, tg: null };
      board.entries.push(entry);
      R.after(i * 70, () => {
        it.el.style.transition = 'opacity .35s ease, background .3s, color .3s';
        it.el.style.opacity = '1';
        if (it.target) entry.tg = R.present(it.x, it.y);
      });
      tap(it.el, () => onTap(entry));
    });
    lastHit = R.t;
    board.timer = R.after(opts.boardSeconds() * 1000 * R.slow, expire);
    if (opts.onBoard) opts.onBoard(board);
  }

  function onTap(entry) {
    if (!entry.target) {
      if (opts.onDistractor) opts.onDistractor(entry);
      R.falseTap(entry.x, entry.y);
      return;
    }
    if (!entry.tg) return;
    if (entry.tg.done) { R.repeat(); return; }
    R.hit(entry.tg, R.t - Math.max(entry.tg.shownAt, lastHit));
    lastHit = R.t;
    hitSound();
    entry.el.classList.remove('hint');
    entry.el.style.background = '';
    entry.el.classList.add('found');
    if (opts.onHit) opts.onHit(entry, board);
    if (remaining().length === 0) {
      R.cancel(board.timer);
      board.timer = R.after(900, next);
    }
  }

  const remaining = () => board ? board.entries.filter(e => e.target && (!e.tg || !e.tg.done)) : [];

  function expire() {
    remaining().forEach(e => { if (e.tg) R.miss(e.tg); });
    next();
  }

  return {
    start: next,
    hint() {
      const r = remaining().filter(e => e.tg).sort((a, b) => a.x - b.x)[0];
      if (r) r.el.classList.add('hint');
    },
    unhint() {},
    onTimeUp() {
      if (ending || !board) return R.end();
      ending = true;
      // Frisches Brett nicht werten, sonst Brett noch zu Ende spielen lassen
      if (R.t - board.born < 6000) {
        remaining().forEach(e => { if (e.tg) R.drop(e.tg); else e.dropped = true; });
        board.entries.forEach(e => { if (!e.tg && e.target) e.dropped = true; });
        R.end();
      } else {
        R.cancel(board.timer);
        board.timer = R.after(20000, expire);
      }
    },
    finish() {
      // Bei "Ende" zählen offene Ziele nicht als verpasst
      remaining().forEach(e => { if (e.tg) R.drop(e.tg); });
      clear();
    }
  };
}
