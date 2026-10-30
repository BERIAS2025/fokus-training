// Bildschirme für Conny: Start, Einzelspiel, Müdigkeit, Kurz/Genug, Ruhebild, Ergebnis
import { register, go, onAct, anchorHTML, homeHTML, holdToOpen, applyTheme } from '../ui.js';
import { ICON, gameIcon, face, flower } from '../icons.js';
import { state, GAMES, doneToday, nextGame, limitReached, saveSettings, flowersFor } from '../state.js';
import * as flow from '../flow.js';
import { triad, say, sunsetSound, unlockAudio } from '../audio.js';
import { enterFullscreen } from '../system.js';

const gearHTML = () => `<button class="gear" data-gear aria-label="Pflege">${ICON.gear(32)}<svg class="hold-ring" viewBox="0 0 80 80"><circle cx="40" cy="40" r="38"/></svg></button>`;

function wireGear(el) {
  const g = el.querySelector('[data-gear]');
  if (g) holdToOpen(g, 3000, () => go('care'));
}

// ---------- 1 Start ----------
register('start', el => {
  if (limitReached()) return go('rest', { limit: true });
  const s = state.settings;
  const done = doneToday();
  const next = nextGame();
  const plan = new Set(s.plan);
  el.innerHTML = `
    ${anchorHTML()}
    <div class="theme-toggle">
      <button data-act="light" class="${s.theme === 'light' ? 'on' : ''}" aria-label="Hell">${ICON.sun(40)}</button>
      <button data-act="dark" class="${s.theme === 'dark' ? 'on' : ''}" aria-label="Dunkel">${ICON.moon(36)}</button>
    </div>
    ${gearHTML()}
    <div class="content center-col" style="gap:72px;padding-top:40px">
      <button class="btn btn-primary btn-los" data-act="los">${ICON.play(64)}<span>Los</span></button>
      <div class="tiles">
        ${GAMES.map(g => `
          <button class="tile ${g.id === next ? 'next' : ''} ${plan.has(g.id) ? '' : 'off'}" data-act="single" data-game="${g.id}" aria-label="${g.name}">
            ${gameIcon(g.id, 72)}
            ${done.has(g.id) ? `<span class="done">${ICON.check(24)}</span>` : ''}
            ${g.id === next ? `<span class="next-mark"><svg width="28" height="14" viewBox="0 0 28 14"><path d="M2 14L14 2L26 14Z" fill="currentColor"/></svg></span>` : ''}
          </button>`).join('')}
      </div>
    </div>`;
  wireGear(el);
  return onAct(el, {
    los: () => { unlockAudio(); enterFullscreen(); flow.startPlan(); },
    single: t => { unlockAudio(); enterFullscreen(); go('single', { game: t.dataset.game }); },
    light: () => { s.theme = 'light'; saveSettings(); applyTheme(); go('start'); },
    dark: () => { s.theme = 'dark'; saveSettings(); applyTheme(); go('start'); }
  });
});

// ---------- 1b Einzelspiel ----------
register('single', (el, { game }) => {
  el.innerHTML = `
    ${anchorHTML()}
    <div class="content center-col" style="gap:56px;padding-bottom:40px">
      <div style="display:flex;align-items:center;gap:64px">
        <div style="width:340px;height:340px;border-radius:56px;background:var(--surface);border:6px solid var(--blue);display:flex;align-items:center;justify-content:center;color:var(--ink)">${gameIcon(game, 200)}</div>
        <button class="btn btn-primary btn-los" style="width:340px;font-size:80px" data-act="los">${ICON.play(56)}<span>Los</span></button>
      </div>
    </div>
    ${homeHTML()}`;
  return onAct(el, {
    los: () => flow.startSingle(game),
    home: () => go('start')
  });
});

// ---------- 2 / 6 Müdigkeit ----------
register('fatigue', (el, { phase }) => {
  el.innerHTML = `
    ${anchorHTML()}
    <div class="content center-col" style="gap:64px">
      <div class="title-l">${phase === 'before' ? 'Wie geht es dir?' : 'Und jetzt?'}</div>
      <div style="display:flex;gap:72px">
        ${[0, 1, 2].map(i => `<button class="choice" style="width:256px;height:256px" data-act="pick" data-v="${i}" aria-label="${['frisch', 'mittel', 'müde'][i]}">${face(i, 176)}</button>`).join('')}
      </div>
    </div>`;
  let picked = false;
  return onAct(el, {
    pick: t => {
      if (picked) return;
      picked = true;
      const v = +t.dataset.v;
      t.classList.add('sel');
      t.insertAdjacentHTML('beforeend', `<span class="sel-badge">${ICON.check(30)}</span>`);
      setTimeout(() => phase === 'before' ? flow.fatigueBefore(v) : flow.fatigueAfter(v), 650);
    }
  });
});

// ---------- 2b Nach "müde": Kurz oder Genug ----------
register('tired', el => {
  el.innerHTML = `
    ${anchorHTML()}
    <div class="content" style="display:flex;align-items:center;justify-content:center;gap:80px">
      <button class="btn btn-primary" style="width:360px;height:420px;border-radius:44px;box-shadow:0 12px 0 var(--blue-dark);flex-direction:column;gap:28px;font-size:48px" data-act="short">${ICON.short(140)}<span>Kurz</span></button>
      <button class="btn btn-secondary" style="width:360px;height:420px;border-radius:44px;flex-direction:column;gap:28px;font-size:48px" data-act="enough">${ICON.sunset(160)}<span>Genug</span></button>
    </div>`;
  say('Kurz oder genug für heute?');
  return onAct(el, {
    short: () => flow.chooseShort(),
    enough: () => go('rest', { sunset: true })
  });
});

// ---------- Ruhebild (Genug / Tageslimit) ----------
register('rest', (el, { limit }) => {
  el.innerHTML = `
    ${anchorHTML()}
    ${limit ? gearHTML() : ''}
    <div class="content center-col" style="gap:40px;padding-bottom:120px">
      <div style="color:var(--ink);animation:sink 2.4s ease-out both">${ICON.sunset(360)}</div>
    </div>
    ${limit ? '' : homeHTML()}`;
  sunsetSound();
  say('Für heute genug. Gut gemacht.');
  if (limit) wireGear(el);
  return onAct(el, { home: () => go('start') });
});

// ---------- 5 Ergebnis ----------
const PRAISE = { 1: ['Bravo!'], 2: ['Bravo!', 'Che bello!'], 3: ['Bravo!', 'Che bello!'], 4: ['Bravissima!', 'Ottimo!'], 5: ['Bravissima!', 'Ottimo!'] };

register('result', (el, { rec }) => {
  const n = flowersFor(rec.hitRate);
  const list = PRAISE[n];
  const word = list[Math.floor(Math.random() * list.length)];
  el.innerHTML = `
    ${anchorHTML()}
    <div class="content" style="display:flex;flex-direction:column;align-items:center;justify-content:space-between;padding:96px 0 64px">
      <div class="flowers">${[1, 2, 3, 4, 5].map(i => `<span style="animation-delay:${i * 0.15}s">${flower(i <= n, 140)}</span>`).join('')}</div>
      <button style="display:flex;align-items:center;gap:28px;color:var(--ink)" data-act="speak"><div class="praise">${word}</div>${ICON.speaker(56)}</button>
      <div style="display:flex;gap:48px">
        <button class="btn btn-secondary btn-pill" style="width:320px" data-act="again">${ICON.retry(48)}<span>Nochmal</span></button>
        <button class="btn btn-primary btn-pill" style="width:320px" data-act="done">${ICON.check(48, 3.5)}<span>Fertig</span></button>
      </div>
    </div>`;
  triad();
  const t = setTimeout(() => say(word.replace('!', ''), 'it-IT'), 900);
  return (() => {
    const off = onAct(el, {
      speak: () => say(word.replace('!', ''), 'it-IT'),
      again: () => flow.again(),
      done: () => flow.resultDone()
    });
    return () => { off(); clearTimeout(t); };
  })();
});
