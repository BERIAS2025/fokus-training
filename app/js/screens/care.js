// 7 Pflege-Bereich: Stufen, Plan, Verlauf, Einstellungen. Bedienung über Symbole, Text nur als Zusatz.
import { register, go, onAct, applyTheme, toast } from '../ui.js';
import { ICON, gameIcon } from '../icons.js';
import { state, GAMES, gameName, saveSettings, recommend, masteredLevels, gameRecords, roundSeconds, dailyLimitMin, playedTodaySeconds } from '../state.js';
import { hitSound, unlockAudio } from '../audio.js';
import { isPersisted, requestPersistence } from '../db.js';
import { renderHistory } from './history.js';
import { exportBackup, importBackup } from '../export.js';

const REC = {
  up: { icon: () => ICON.up(40), label: 'Bereit für schwerer' },
  hold: { icon: () => ICON.hold(40), label: 'Hier bleiben' },
  down: { icon: () => ICON.down(40), label: 'Eine Stufe leichter' },
  none: { icon: () => `<span style="color:var(--muted)">${ICON.hourglass(36)}</span>`, label: 'Noch zu wenig Daten' }
};
const miniRec = r => r === 'up' ? ICON.up(22) : r === 'down' ? ICON.down(22) : r === 'hold' ? ICON.hold(22) : '';

const view = { tab: 'stufen', game: 'sterne' };

register('care', el => {
  const s = state.settings;
  let offInner = null;

  function render() {
    if (offInner) { offInner(); offInner = null; }
    const tabs = [['stufen', ICON.stairs(32), 'Stufen'], ['plan', ICON.calendar(32), 'Plan'], ['verlauf', ICON.chart(32), 'Verlauf'], ['settings', ICON.sliders(32), 'Einstellungen']];
    el.innerHTML = `
      <div class="care">
        <div class="care-top">
          <div style="display:flex;gap:12px">
            ${tabs.map(([id, ic, l]) => `<button class="care-tab ${view.tab === id ? 'on' : ''}" data-act="tab" data-tab="${id}">${ic}${l}</button>`).join('')}
          </div>
          <div style="flex:1"></div>
          <button class="care-home" data-act="home" aria-label="Start">${ICON.home(36)}</button>
        </div>
        <div class="care-body" data-body></div>
      </div>`;
    const body = el.querySelector('[data-body]');
    if (view.tab === 'stufen') stufen(body);
    else if (view.tab === 'plan') plan(body);
    else if (view.tab === 'verlauf') offInner = renderHistory(body);
    else settings(body);
  }

  // ---------- Stufen ----------
  function stufen(body) {
    const g = view.game;
    const sel = s.levels[g];
    const flag = s.lastPlayed[g];
    const mastered = masteredLevels(g);
    const rec = recommend(g, sel);
    const recAt = rec === 'up' ? sel + 1 : rec === 'down' ? sel - 1 : rec === 'hold' ? sel : null;
    const last7 = gameRecords(g).slice(-7);
    body.innerHTML = `
      <div class="care-nav">
        ${GAMES.map(x => `<button class="${x.id === g ? 'on' : ''}" data-act="game" data-game="${x.id}" aria-label="${x.name}">${gameIcon(x.id, 52)}<span class="rec">${miniRec(recommend(x.id))}</span></button>`).join('')}
      </div>
      <div class="care-main">
        <div class="care-head">
          ${gameIcon(g, 56)}
          <div class="name">${gameName(g)}</div>
          <div style="flex:1"></div>
          <div class="rec-badge ${rec}">${REC[rec].icon()}<span>${REC[rec].label}</span></div>
        </div>
        <div class="panel">
          <div class="steps">
            ${[1, 2, 3, 4, 5, 6, 7, 8].map(n => {
              const cls = [n === sel ? 'sel' : '', mastered.has(n) ? 'mastered' : '', n === recAt && rec === 'up' ? 'rec-up' : '', n === recAt && rec === 'down' ? 'rec-down' : ''].join(' ');
              return `<div class="step">
                <div class="marks">
                  ${n === recAt ? (rec === 'up' ? ICON.up(48) : rec === 'down' ? ICON.down(48) : ICON.hold(48)) : ''}
                  ${n === flag ? ICON.flag(44, 'var(--ink)') : ''}
                </div>
                <button class="${cls}" style="height:${88 + n * 18}px" data-act="level" data-n="${n}">
                  <span>${n}</span>${mastered.has(n) ? ICON.check(28, 3.5) : ''}
                </button>
              </div>`;
            }).join('')}
          </div>
          <div class="steps-legend"><div>leicht</div><div>schwer</div></div>
        </div>
        <div class="row">
          <div class="mini-hist">
            ${ICON.chart(40)}
            <div class="bars">${Array.from({ length: 7 }, (_, i) => {
              const r = last7[i - (7 - last7.length)];
              return r ? `<i style="height:${Math.max(6, Math.round(72 * r.hitRate))}px"></i>` : `<i class="empty"></i>`;
            }).join('')}</div>
            <div class="lbl">letzte 7 Einheiten</div>
          </div>
          <button class="btn-dark" data-act="restore" ${flag ? '' : 'disabled style="opacity:.4"'}>${ICON.flag(44, 'var(--surface)')}${ICON.restore(32)}<span>Letzte Stufe</span></button>
        </div>
      </div>`;
  }

  // ---------- Plan ----------
  function plan(body) {
    const plan = s.plan;
    const usedMin = Math.round(playedTodaySeconds() / 60);
    body.innerHTML = `
      <div class="care-main">
        <div class="care-head">${ICON.calendar(44)}<div class="name">Tagesplan</div></div>
        <div class="plan-tiles">
          ${GAMES.map(g => {
            const i = plan.indexOf(g.id);
            return `<button class="plan-tile ${i >= 0 ? 'on' : ''}" data-act="plan" data-game="${g.id}" aria-label="${g.name}">
              ${gameIcon(g.id, 64)}<span class="lv">Stufe ${s.levels[g.id]}</span>
              ${i >= 0 ? `<span class="badge">${i + 1}</span>` : ''}
            </button>`;
          }).join('')}
        </div>
        <div class="set-grid">
          ${stepper('unit', ICON.play(30), 'Einheit', `${s.unitMinutes} min`, 'Länge einer Einheit nach „Los"')}
          ${seg('round', ICON.hourglass(32), 'Runde', [[120, '2'], [150, '2½'], [180, '3']].map(([v, l]) => [v, l + ' min']), roundSeconds())}
          ${stepper('limit', ICON.clock(32), 'Tageslimit', `${dailyLimitMin()} min`, `Heute gespielt: ${usedMin} min`)}
        </div>
        <div class="note">Antippen nimmt ein Spiel in den Plan auf oder heraus. Die Zahl zeigt die Reihenfolge. „Los" spielt die nächsten Spiele des Plans.</div>
      </div>`;
  }

  // ---------- Einstellungen ----------
  function settings(body) {
    body.innerHTML = `
      <div class="care-main">
        <div class="set-grid">
          ${toggle('anchorOn', ICON.anchor(32), 'Anker links', s.anchorOn)}
          ${seg('anchorW', ICON.anchor(32), 'Ankerbreite', [[80, bars(1)], [112, bars(2)], [136, bars(3)]], s.anchorW)}
          ${toggle('linksHilfe', ICON.leftHelp(36), 'Links-Hilfe', s.linksHilfe, 'Ziele links größer und heller')}
          ${stepper('volume', s.volume > 0 ? ICON.speaker(36) : ICON.speakerOff(36), 'Lautstärke', `${Math.round(s.volume * 10)}`, '')}
          ${toggle('speech', ICON.voice(32), 'Sprachausgabe', s.speech, 'Ansagen und Lob')}
          ${seg('theme', ICON.sun(32), 'Helligkeit', [['light', ICON.sun(30)], ['dark', ICON.moon(28)]], s.theme)}
          ${toggle('showTimer', ICON.clock(32), 'Zeit anzeigen', s.showTimer, 'Dezenter Ring am Pause-Knopf')}
          <div class="set-item"><div class="ic">${ICON.shield(32)}</div><div class="lbl">Speicher<small data-persist>…</small></div>
            <button class="seg-btn" data-act="persist" style="height:72px;padding:0 18px;border-radius:20px;border:2px solid var(--line);background:var(--bg);font-size:20px;font-weight:700">${ICON.check(28, 4)}</button></div>
          <div class="set-item"><div class="ic">${ICON.download(32)}</div><div class="lbl">Sicherung<small>Alle Daten als Datei speichern</small></div>
            <div class="seg"><button data-act="backup">${ICON.download(28)}</button><button data-act="restoreFile">${ICON.upload(28)}</button></div></div>
          <div class="set-item"><div class="ic">${ICON.gear(32)}</div><div class="lbl">Version<small>${buildId()} · ${state.records.length} Einheiten gespeichert</small></div></div>
        </div>
        <input type="file" accept="application/json" data-file hidden>
      </div>`;
    isPersisted().then(p => { const e = body.querySelector('[data-persist]'); if (e) e.textContent = p ? 'Dauerhaft gesichert' : 'Nicht dauerhaft, bitte antippen'; });
    const f = body.querySelector('[data-file]');
    f.addEventListener('change', async () => {
      if (!f.files[0]) return;
      try { const n = await importBackup(f.files[0]); toast(`${n} Einheiten übernommen`); render(); } catch (e) { toast('Datei nicht lesbar'); }
    });
  }

  const bars = n => `<svg width="${12 + n * 10}" height="32" viewBox="0 0 ${12 + n * 10} 32"><rect width="${n * 10}" height="32" rx="3" fill="var(--orange)"/></svg>`;
  const toggle = (key, ic, label, on, sub = '') => `<div class="set-item"><div class="ic">${ic}</div><div class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</div><button class="switch ${on ? 'on' : ''}" data-act="toggle" data-key="${key}" aria-pressed="${on}"></button></div>`;
  const stepper = (key, ic, label, val, sub) => `<div class="set-item"><div class="ic">${ic}</div><div class="lbl">${label}${sub ? `<small>${sub}</small>` : ''}</div><div class="stepper"><button data-act="step" data-key="${key}" data-d="-1">${ICON.minus(32)}</button><div class="val">${val}</div><button data-act="step" data-key="${key}" data-d="1">${ICON.plus(32)}</button></div></div>`;
  const seg = (key, ic, label, opts, cur) => `<div class="set-item"><div class="ic">${ic}</div><div class="lbl">${label}</div><div class="seg">${opts.map(([v, l]) => `<button class="${String(v) === String(cur) ? 'on' : ''}" data-act="seg" data-key="${key}" data-v="${v}">${l}</button>`).join('')}</div></div>`;

  const commit = () => { saveSettings(); applyTheme(); render(); };

  render();
  const off = onAct(el, {
    home: () => go('start'),
    tab: t => { view.tab = t.dataset.tab; render(); },
    game: t => { view.game = t.dataset.game; render(); },
    level: t => { s.levels[view.game] = +t.dataset.n; commit(); },
    restore: () => { const l = s.lastPlayed[view.game]; if (l) { s.levels[view.game] = l; commit(); } },
    plan: t => {
      const g = t.dataset.game, i = s.plan.indexOf(g);
      if (i >= 0) { if (s.plan.length > 1) s.plan.splice(i, 1); } else s.plan.push(g);
      commit();
    },
    toggle: t => { s[t.dataset.key] = !s[t.dataset.key]; commit(); },
    seg: t => {
      const k = t.dataset.key, v = t.dataset.v;
      if (k === 'round') s.roundSeconds = +v;
      else if (k === 'anchorW') s.anchorW = +v;
      else s[k] = v;
      commit();
    },
    step: t => {
      const k = t.dataset.key, d = +t.dataset.d;
      if (k === 'unit') s.unitMinutes = Math.max(3, Math.min(20, s.unitMinutes + d));
      if (k === 'limit') s.dailyLimit = Math.max(10, Math.min(120, dailyLimitMin() + d * 5));
      if (k === 'volume') { s.volume = Math.max(0, Math.min(1, Math.round((s.volume + d * 0.1) * 10) / 10)); unlockAudio(); hitSound(); }
      commit();
    },
    persist: async () => { const ok = await requestPersistence(); toast(ok ? 'Dauerhaft gesichert' : 'Android hat noch nicht zugestimmt'); render(); },
    backup: () => exportBackup(),
    restoreFile: () => el.querySelector('[data-file]').click()
  });
  return () => { off(); if (offInner) offInner(); };
});

function buildId() {
  const b = (document.querySelector('meta[name=build]') || {}).content || '';
  return b && !b.startsWith('__') ? 'Stand ' + b.slice(0, 7) : 'lokal';
}
