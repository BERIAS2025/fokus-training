// Spiel 2: Blick folgen (Augenfolgebewegung)
// Ein Ball wandert von rechts nach links in den Ring. Dort tippt Conny ihn an.
import { shape } from '../icons.js';
import { rnd, bounds, tap } from './common.js';
import { hitSound } from '../audio.js';

export default function blick(R) {
  let trial = null;
  let endAfter = false;
  let lastStartY = null;

  function newTrial() {
    if (trial) trial.els.forEach(e => e.remove());
    if (R.timeUp || endAfter) return R.end();
    const b = bounds();
    const amp = R.p('amplitude'), waves = R.p('waves'), size = R.p('ball');
    const x0 = 1280 - 70 - size / 2, x1 = b.x0 + 80;
    const lo = 170 + amp, hi = 690 - amp;
    // Höhe wechselt von Runde zu Runde
    let ys;
    do { ys = rnd(lo, hi); } while (lastStartY != null && Math.abs(ys - lastStartY) < 80 && hi - lo > 160);
    lastStartY = ys;
    const ye = R.p('diagonal') ? rnd(lo, hi) : ys;
    const phase = Math.random() < 0.5 ? 1 : -1;
    const yAt = x => {
      const f = (x0 - x) / (x0 - x1);
      return ys + (ye - ys) * f + phase * amp * Math.sin(Math.PI * waves * f);
    };

    const els = [];
    // Pfadpunkte: hinter dem Ball kräftig, vor dem Ball nur auf leichten Stufen
    const dots = [];
    for (let x = x0 - 40; x > x1 + size * 0.6; x -= 34) {
      const d = document.createElement('div');
      d.className = 'dot';
      const ahead = R.p('showPath');
      d.style.cssText = `left:${x - 4}px;top:${yAt(x) - 4}px;width:8px;height:8px;opacity:${ahead ? 0.55 : 0}`;
      R.field.appendChild(d); els.push(d); dots.push({ x, d });
    }
    const ringSize = size * 0.875 + 67;
    const ring = document.createElement('div');
    ring.className = 'ring-goal';
    ring.style.cssText = `left:${x1 - ringSize / 2}px;top:${yAt(x1) - ringSize / 2}px;width:${ringSize}px;height:${ringSize}px`;
    ring.innerHTML = shape('ring', ringSize);
    R.field.appendChild(ring); els.push(ring);

    const halo = document.createElement('div');
    halo.className = 'ball-halo';
    const hs = size + 32;
    halo.style.cssText = `left:0;top:0;width:${hs}px;height:${hs}px`;
    const ball = document.createElement('div');
    ball.className = 'ball';
    ball.style.cssText = `left:0;top:0;width:${size}px;height:${size}px`;
    R.field.appendChild(halo); R.field.appendChild(ball); els.push(halo, ball);

    trial = { els, x: x0, y: yAt(x0), arrived: false, tg: null, timer: null, ring, ball, done: false };
    const place = () => {
      halo.style.transform = `translate(${trial.x - hs / 2}px, ${trial.y - hs / 2}px)`;
      ball.style.transform = `translate(${trial.x - size / 2}px, ${trial.y - size / 2}px)`;
    };
    place();
    trial.move = dt => {
      if (trial.arrived) return;
      trial.x = Math.max(x1, trial.x - R.p('speed') / R.slow * dt / 1000);
      trial.y = yAt(trial.x);
      dots.forEach(o => { if (o.x > trial.x + size * 0.6 && !o.passed) { o.passed = true; o.d.style.cssText += ';width:12px;height:12px;opacity:1;margin:-2px 0 0 -2px'; } });
      place();
      if (trial.x <= x1) arrive();
    };

    const onTap = () => {
      if (!trial.arrived || trial.done) return;
      trial.done = true;
      R.cancel(trial.timer);
      R.hit(trial.tg);
      hitSound();
      ball.classList.add('found');
      ring.classList.remove('hint');
      R.after(900, gap);
    };
    tap(ball, onTap);
    tap(halo, onTap);
    tap(ring, onTap);
  }

  function arrive() {
    trial.arrived = true;
    trial.tg = R.present(trial.x, trial.y);
    const t = trial;
    R.after(3000, () => { if (!t.done) t.ring.classList.add('hint'); });
    trial.timer = R.after(R.p('tapSeconds') * 1000 * R.slow, () => {
      if (trial.done) return;
      trial.done = true;
      R.miss(trial.tg);
      R.error();
      gap();
    });
  }

  function gap() {
    trial.els.forEach(e => { e.style.transition = 'opacity .4s'; e.style.opacity = '0'; });
    R.after(700, newTrial);
  }

  R.onFrame(dt => { if (trial && !trial.done) trial.move(dt); });

  return {
    start: newTrial,
    hint() { if (trial && trial.arrived && !trial.done) trial.ring.classList.add('hint'); },
    unhint() {},
    onTimeUp() { if (!trial || trial.done) R.end(); else endAfter = true; },
    finish() {
      if (trial && trial.tg && !trial.done) R.drop(trial.tg);
      if (trial) trial.els.forEach(e => e.remove());
    }
  };
}
