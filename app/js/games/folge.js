// Spiel 5: Folge merken (Sequenzgedächtnis)
// Farbfelder leuchten mit Ton nacheinander auf, Conny tippt die Folge nach.
// Jedes Feld hat Farbe UND Form, die Farbe ist nie die einzige Information.
import { shape } from '../icons.js';
import { scatter, shuffle, bounds, tap, leftCount } from './common.js';
import { hitSound, padSound } from '../audio.js';

const PADS = [
  ['#1B4FA8', 'circle', '#FFFFFF'],
  ['#1E7A45', 'triangle', '#FFFFFF'],
  ['#E9B21C', 'square', '#1F2430'],
  ['#6B3FA0', 'diamond', '#FFFFFF'],
  ['#0F6E74', 'star', '#FFFFFF'],
  ['#8A5A2B', 'cross', '#FFFFFF']
];

export default function folge(R) {
  let pads = [], dots = null;
  let seq = [], pos = 0, phase = 'idle', firstTry = true, tgs = [];
  let sequences = 0, correct = 0, finished = 0, endAfter = false, lastFirst = -1;

  function build() {
    const n = R.p('fields');
    const b = bounds();
    const s = n === 4 ? 230 : n === 5 ? 200 : 170;
    let pts;
    if (R.p('scattered')) {
      pts = scatter(n, s / 2 + 12, s + 60, leftCount('folge', n, 0.5), { y0: 170, y1: 780 });
    } else {
      const cx = b.mid - 30, gap = 40;
      const rowsDef = n === 4 ? [2, 2] : n === 5 ? [3, 2] : [3, 3];
      const top = 160 + (620 - (rowsDef.length * s + gap)) / 2;
      pts = [];
      rowsDef.forEach((cnt, r) => {
        const rw = cnt * s + (cnt - 1) * gap;
        for (let i = 0; i < cnt; i++) pts.push({ x: cx - rw / 2 + s / 2 + i * (s + gap), y: top + s / 2 + r * (s + gap) });
      });
    }
    const colors = shuffle(PADS.slice(0, n).map((c, i) => ({ c, i })));
    pads = pts.map((p, k) => {
      const { c, i } = colors[k];
      const el = document.createElement('div');
      el.className = 'pad waiting';
      el.style.cssText = `left:${p.x - s / 2}px;top:${p.y - s / 2}px;width:${s}px;height:${s}px;background:${c[0]};color:${c[2]}`;
      el.innerHTML = shape(c[1], Math.round(s * 0.42));
      R.field.appendChild(el);
      const pad = { el, x: p.x, y: p.y, note: i, color: c[0] };
      tap(el, () => onTap(pad));
      return pad;
    });
    dots = document.createElement('div');
    dots.className = 'seq-dots';
    R.field.appendChild(dots);
  }

  function drawDots() {
    const len = seq.length, d = len <= 3 ? 36 : 28;
    dots.style.left = (bounds().mid - (len * d + (len - 1) * 20) / 2) + 'px';
    dots.innerHTML = seq.map((_, i) => `<i class="${i < pos ? 'on' : ''}" style="width:${d}px;height:${d}px"></i>`).join('');
  }

  function light(pad, ms) {
    pad.el.classList.add('lit');
    pad.el.style.boxShadow = `0 0 0 10px ${pad.color}, 0 0 60px 20px rgba(255,236,180,.9)`;
    padSound(pad.note);
    R.after(ms, () => { pad.el.classList.remove('lit'); pad.el.style.boxShadow = ''; });
  }

  function newSequence() {
    if (R.timeUp || endAfter) return R.end();
    const len = R.p('length');
    // Start der Folge wechselt, das erste Feld liegt oft links
    seq = [];
    for (let i = 0; i < len; i++) {
      let p;
      do { p = pads[Math.floor(Math.random() * pads.length)]; } while (seq.length && p === seq[seq.length - 1] || (i === 0 && pads.indexOf(p) === lastFirst && pads.length > 2));
      seq.push(p);
    }
    lastFirst = pads.indexOf(seq[0]);
    sequences++;
    firstTry = true;
    tgs = [];
    show();
  }

  function show() {
    phase = 'show';
    pos = 0;
    drawDots();
    pads.forEach(p => { p.el.classList.add('waiting'); p.el.classList.remove('ok', 'hint'); });
    const on = R.p('showMs') * R.slow, gap = R.p('gapMs') * R.slow;
    seq.forEach((p, i) => R.after(800 + i * (on + gap), () => light(p, on)));
    R.after(800 + seq.length * (on + gap), () => {
      phase = 'input';
      pads.forEach(p => p.el.classList.remove('waiting'));
      R.action();
      if (firstTry) tgs = seq.map(p => null);
    });
  }

  function onTap(pad) {
    if (phase !== 'input') return;
    const want = seq[pos];
    if (pad === want) {
      if (firstTry) { const tg = R.present(pad.x, pad.y); tg.shownAt = R.lastAction; R.hit(tg); tgs[pos] = tg; }
      else R.action();
      light(pad, 350);
      pos++;
      drawDots();
      if (pos === seq.length) {
        phase = 'idle';
        if (firstTry) correct++;
        finished++;
        R.after(450, () => { hitSound(); seq.forEach(p => p.el.classList.add('ok')); });
        R.after(1500, newSequence);
      }
      return;
    }
    // Falsch: kein Ton, kein Rot. Die Folge wird einmal ruhig wiederholt.
    if (firstTry) {
      R.miss(R.present(want.x, want.y));
      firstTry = false;
      phase = 'idle';
      R.after(700, show);
    } else {
      phase = 'idle';
      finished++;
      R.after(700, newSequence);
    }
    R.falseTap(pad.x, pad.y);
  }

  return {
    start() { build(); R.after(300, newSequence); },
    hint() { if (phase === 'input' && seq[pos]) seq[pos].el.classList.add('hint'); },
    unhint() { pads.forEach(p => p.el.classList.remove('hint')); },
    onTimeUp() { if (sequences === finished) R.end(); else endAfter = true; },
    finish() { pads.forEach(p => p.el.remove()); if (dots) dots.remove(); },
    rate: () => finished ? correct / finished : 1,
    extra: () => ({ sequences: finished, correct })
  };
}
