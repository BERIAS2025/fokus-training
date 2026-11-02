// Gemeinsame Spiellogik: Spielzeit, Messung, Hinweise, Zufall nach Regeln
import { state, cfg, lv } from '../state.js';
import { unit } from '../flow.js';
import { toStage } from '../ui.js';

export const W = 1280, H = 800;
export const rnd = (a, b) => a + Math.random() * (b - a);
export const pick = a => a[Math.floor(Math.random() * a.length)];
export function shuffle(a) { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; }
export const zoneOf = x => x < W / 3 ? 'L' : x < W * 2 / 3 ? 'M' : 'R';

// Spielfeld rechts vom Anker
export function bounds() {
  const ax = state.settings.anchorOn ? state.settings.anchorW : 0;
  return { x0: ax + 40, x1: W - 40, y0: 60, y1: H - 40, mid: (ax + W) / 2 };
}

// Pause-Knopf oben rechts bleibt frei
const PAUSE_BOX = { x: 1100, y: 0, w: 180, h: 175 };
function blocked(cx, cy, r, avoid) {
  return [PAUSE_BOX, ...avoid].some(b => cx + r > b.x && cx - r < b.x + b.w && cy + r > b.y && cy - r < b.y + b.h);
}

// Wie viele Ziele links? Links immer mindestens so viele wie rechts,
// nie zweimal hintereinander dieselbe Verteilung.
const lastSplit = {};
export function leftCount(key, n, share) {
  const lo = Math.ceil(n / 2);
  const hi = Math.max(lo, Math.min(n, Math.round(n * share) + 1));
  let nl = Math.max(lo, Math.round(n * share));
  if (hi > lo) {
    let tries = 0;
    do { nl = lo + Math.floor(Math.random() * (hi - lo + 1)); tries++; } while (nl === lastSplit[key] && tries < 10);
  }
  lastSplit[key] = nl;
  return nl;
}

// n Punkte verstreuen, Mindestabstand d, Radius r. Fehlt Platz, wird der freieste Punkt genommen.
export function scatter(n, r, d, nl, opts = {}) {
  const b = bounds();
  const y0 = opts.y0 ?? b.y0, y1 = opts.y1 ?? b.y1, avoid = opts.avoid || [];
  const out = [];
  for (let k = 0; k < n; k++) {
    const left = k < nl;
    let best = null, bestD = -1;
    for (let t = 0; t < 2500; t++) {
      const cx = left ? rnd(b.x0 + r, b.mid - 10) : rnd(b.mid + 10, b.x1 - r);
      const cy = rnd(y0 + r, y1 - r);
      if (blocked(cx, cy, r, avoid)) continue;
      const md = out.reduce((m, p) => Math.min(m, Math.hypot(p.x - cx, p.y - cy)), 1e9);
      if (md > bestD) { bestD = md; best = { x: cx, y: cy, left }; }
      if (md >= d) break;
    }
    if (best) out.push(best);
  }
  return out;
}

// Raster mit Zufallsversatz für dichte Felder
export function grid(cols, rows, jit, opts = {}) {
  const b = bounds();
  const x0 = opts.x0 ?? b.x0, x1 = opts.x1 ?? b.x1, y0 = opts.y0 ?? b.y0, y1 = opts.y1 ?? b.y1;
  const cw = (x1 - x0) / cols, ch = (y1 - y0) / rows, out = [];
  for (let c = 0; c < cols; c++) for (let r = 0; r < rows; r++) {
    const x = x0 + cw * (c + .5) + rnd(-jit, jit) * cw, y = y0 + ch * (r + .5) + rnd(-jit, jit) * ch;
    if (!blocked(x, y, opts.r || 40, opts.avoid || [])) out.push({ x, y, left: x < b.mid });
  }
  return out;
}

export class Runner {
  constructor(field, game, level, hooks) {
    this.field = field;
    this.game = game;
    this.level = level;
    this.hooks = hooks;           // { onEnd(rec), onAutoPause(), onTick(frac) }
    this.t = 0;
    this.paused = false;
    this.ended = false;
    this.tasks = [];
    this.frames = [];
    this.roundMs = hooks.roundMs;
    this.target = hooks.target || null;   // Zielsymbol aus der Erklärung
    this.timeUp = false;
    this.zones = { L: z(), M: z(), R: z() };
    this.falseTaps = 0;
    this.repeats = 0;
    this.pauses = 0;
    this.taps = [];
    this.missedPts = [];
    this.lastAction = 0;
    this.hinted = false;
    this.errStreak = 0;
    this.goodStreak = 0;
    this.slow = 1;
    this.S = cfg().session;
    this.impl = null;
    this._raf = 0;
    this._last = 0;
    function z() { return { targets: 0, hits: 0, missed: 0, rtSum: 0, rtN: 0 }; }

    this._onDown = e => {
      if (!e.isPrimary || this.paused || this.ended) return;
      if (e.target === this.field || e.target.dataset.bg != null) {
        const p = toStage(e);
        this.falseTap(p.x, p.y);
      }
    };
    field.addEventListener('pointerdown', this._onDown);
  }

  p(key) { return lv(this.game, key, this.level); }

  // Links-Hilfe: Ziele links größer und heller, sinkt mit steigender Stufe
  helpScale(x) {
    if (!state.settings.linksHilfe || x >= bounds().mid) return 1;
    return 1 + cfg().linksHilfe.sizeBoost[this.level - 1];
  }
  helpHalo(x) {
    if (!state.settings.linksHilfe || x >= bounds().mid) return 'transparent';
    const a = cfg().linksHilfe.haloAlpha[this.level - 1];
    return a > 0 ? `rgba(var(--help-halo), ${a})` : 'transparent';
  }

  start(impl) {
    this.impl = impl;
    impl.start();
    this._last = performance.now();
    const loop = now => {
      if (this.ended) return;
      const dt = Math.min(100, now - this._last);
      this._last = now;
      if (!this.paused) this.step(dt);
      this._raf = requestAnimationFrame(loop);
    };
    this._raf = requestAnimationFrame(loop);
  }

  step(dt) {
    this.t += dt;
    unit.playSincePause += dt;
    const due = this.tasks.filter(k => k.at <= this.t);
    this.tasks = this.tasks.filter(k => k.at > this.t);
    due.forEach(k => k.fn());
    this.frames.forEach(f => f(dt, this.t));
    if (this.hooks.onTick) this.hooks.onTick(Math.min(1, this.t / this.roundMs));
    if (!this.hinted && this.t - this.lastAction > this.S.idleHintSeconds * 1000) {
      this.hinted = true;
      if (this.impl.hint) this.impl.hint();
    }
    if (!this.timeUp && this.t >= this.roundMs) {
      this.timeUp = true;
      if (this.impl.onTimeUp) this.impl.onTimeUp(); else this.end();
    }
    if (!this.ended && unit.playSincePause >= this.S.pauseAfterSeconds * 1000) {
      unit.playSincePause = 0;
      this.hooks.onAutoPause();
    }
  }

  // Zeitgeber in Spielzeit: steht während der Pause still
  after(ms, fn) { const k = { at: this.t + ms, fn }; this.tasks.push(k); return k; }
  cancel(k) { this.tasks = this.tasks.filter(x => x !== k); }
  onFrame(fn) { this.frames.push(fn); }

  pause() { if (!this.ended) { this.paused = true; this.pauses++; } }
  resume() { this.paused = false; this._last = performance.now(); this.lastAction = this.t; this.hinted = false; }

  action() { this.lastAction = this.t; this.hinted = false; if (this.impl && this.impl.unhint) this.impl.unhint(); }

  // ---------- Messung ----------
  present(x, y) { const tg = { x, y, zone: zoneOf(x), shownAt: this.t, done: false }; this.zones[tg.zone].targets++; return tg; }
  hit(tg, rt) {
    if (tg.done) return;
    tg.done = true;
    const z = this.zones[tg.zone];
    z.hits++;
    z.rtSum += rt ?? (this.t - tg.shownAt); z.rtN++;
    this.taps.push([Math.round(tg.x), Math.round(tg.y), 1]);
    this.action();
    this.errStreak = 0;
    if (++this.goodStreak >= 4) { this.slow = Math.max(1, this.slow - this.S.slowDownStep / 2); this.goodStreak = 0; }
  }
  miss(tg) {
    if (tg.done) return;
    tg.done = true;
    this.zones[tg.zone].missed++;
    this.missedPts.push([Math.round(tg.x), Math.round(tg.y)]);
  }
  // Ziel wurde nicht gezählt (z. B. Brett kurz vor Ende)
  drop(tg) { if (!tg.done) { tg.done = true; this.zones[tg.zone].targets--; } }
  falseTap(x, y) {
    this.falseTaps++;
    this.taps.push([Math.round(x), Math.round(y), 0]);
    this.action();
    this.error();
  }
  repeat() { this.repeats++; this.action(); }
  // Fehler: nichts passiert sichtbar. Nach mehreren in Folge ein sanfter Hinweis und etwas langsamer.
  error() {
    this.goodStreak = 0;
    if (++this.errStreak >= this.S.errorsBeforeHint) {
      this.errStreak = 0;
      this.slow = Math.min(this.S.slowDownMax, this.slow + this.S.slowDownStep);
      if (this.impl.hint) this.impl.hint();
    }
  }

  end(aborted = false) {
    if (this.ended) return;
    this.ended = true;
    cancelAnimationFrame(this._raf);
    this.field.removeEventListener('pointerdown', this._onDown);
    if (this.impl.finish) this.impl.finish(aborted);
    const Z = this.zones;
    const targets = Z.L.targets + Z.M.targets + Z.R.targets;
    const hits = Z.L.hits + Z.M.hits + Z.R.hits;
    const missed = Z.L.missed + Z.M.missed + Z.R.missed;
    let rate = this.impl.rate ? this.impl.rate() : (hits + missed ? hits / (hits + missed) : 1);
    if (!isFinite(rate)) rate = 1;
    const now = new Date();
    const pad = n => String(n).padStart(2, '0');
    this.hooks.onEnd({
      ts: now.getTime(),
      date: `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`,
      game: this.game, level: this.level, durationMs: Math.round(this.t),
      targets, hits, missed, hitRate: Math.max(0, Math.min(1, rate)),
      zones: Z, falseTaps: this.falseTaps, repeats: this.repeats,
      pauses: this.pauses, aborted, taps: this.taps, missedPts: this.missedPts,
      extra: this.impl.extra ? this.impl.extra() : null
    });
  }

  destroy() { this.ended = true; cancelAnimationFrame(this._raf); }
}

// Zielelement mit großer Tippfläche
export function targetEl(x, y, size, inner, opts = {}) {
  const box = size + (opts.pad ?? 40);
  const d = document.createElement('div');
  d.className = 'target' + (opts.cls ? ' ' + opts.cls : '');
  d.style.cssText = `left:${Math.round(x - box / 2)}px;top:${Math.round(y - box / 2)}px;width:${Math.round(box)}px;height:${Math.round(box)}px;${opts.halo && opts.halo !== 'transparent' ? `background:${opts.halo};` : ''}${opts.color ? `color:${opts.color};` : ''}`;
  d.innerHTML = inner;
  return d;
}

export function tap(el, fn) {
  el.addEventListener('pointerdown', e => {
    if (!e.isPrimary) return;
    e.stopPropagation();
    fn(e);
  });
}
