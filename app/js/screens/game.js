// 3 Spiel und 4 Pause (als Ebene über dem Spiel, damit der Spielstand bleibt)
import { register, anchorHTML, onAct } from '../ui.js';
import { ICON } from '../icons.js';
import { state, cfg, roundSeconds } from '../state.js';
import { Runner } from '../games/common.js';
import { GAME_IMPL } from '../games/index.js';
import * as flow from '../flow.js';
import { say, softTick } from '../audio.js';

register('game', (el, { game, level, target }) => {
  const showTimer = state.settings.showTimer;
  el.innerHTML = `
    <div class="field" data-field></div>
    ${anchorHTML()}
    <button class="pause-btn" data-act="pause" aria-label="Pause"><i></i><i></i>
      ${showTimer ? `<svg class="timer-ring" viewBox="0 0 114 114"><circle cx="57" cy="57" r="54" stroke-dasharray="339.3" stroke-dashoffset="339.3"/></svg>` : ''}
    </button>`;
  const field = el.querySelector('[data-field]');
  const ring = el.querySelector('.timer-ring circle');
  let overlay = null;
  const roundMs = roundSeconds() * 1000 * (flow.unit.short ? cfg().session.shortRoundFactor : 1);

  const runner = new Runner(field, game, level, {
    roundMs,
    target,
    onEnd: rec => flow.roundDone(rec),
    onAutoPause: () => openPause(true),
    onTick: f => { if (ring) ring.style.strokeDashoffset = String(339.3 * (1 - f)); }
  });

  function openPause(auto) {
    if (overlay || runner.ended) return;
    runner.pause();
    flow.unit.playSincePause = 0;
    const minS = auto ? cfg().session.pauseMinSeconds : 0;
    overlay = document.createElement('div');
    overlay.className = 'screen';
    overlay.style.zIndex = 20;
    overlay.innerHTML = `
      ${anchorHTML()}
      <div class="content" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:56px 0 64px">
        <div style="font-size:64px;font-weight:700">Pause</div>
        <div style="width:380px;height:380px;display:flex;align-items:center;justify-content:center">
          <div class="breath" style="animation-duration:${cfg().session.breathCycleSeconds}s">Atmen</div>
        </div>
        <div style="display:flex;gap:48px">
          <button class="btn btn-secondary btn-pill" style="width:300px" data-act="end">${ICON.stop(40)}<span>Ende</span></button>
          <button class="btn btn-primary btn-pill" style="width:340px" data-act="resume" ${minS ? 'disabled' : ''}>${ICON.play(40)}<span>Weiter</span></button>
        </div>
      </div>`;
    el.appendChild(overlay);
    say('Pause');
    const weiter = overlay.querySelector('[data-act=resume]');
    const timer = minS ? setTimeout(() => { weiter.disabled = false; softTick(); }, minS * 1000) : null;
    const off = onAct(overlay, {
      resume: () => close(),
      end: () => { close(true); runner.end(true); }
    });
    function close(silent) {
      clearTimeout(timer); off();
      overlay.remove(); overlay = null;
      if (!silent) runner.resume();
    }
  }

  const offAct = onAct(el, { pause: () => openPause(false) });
  const impl = GAME_IMPL[game](runner);
  runner.start(impl);
  say('Los geht\'s');

  const onHide = () => { if (document.visibilityState === 'hidden') openPause(false); };
  document.addEventListener('visibilitychange', onHide);
  return () => { offAct(); runner.destroy(); document.removeEventListener('visibilitychange', onHide); };
});
