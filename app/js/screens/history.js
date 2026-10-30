// Verlaufsansicht für Therapeuten (Abschnitt 11). Einzige Ansicht mit Text und Zahlen.
import { onAct, esc } from '../ui.js';
import { ICON, gameIcon } from '../icons.js';
import { state, GAMES, gameName, FATIGUE, dayKey } from '../state.js';
import { lineChart, barChart, heatmap } from '../charts.js';
import { exportCSV, printReport } from '../export.js';

const DAY = 86400000;
const pct = v => v == null ? '–' : Math.round(v * 100) + ' %';
const sec = ms => ms == null ? '–' : (ms / 1000).toFixed(1).replace('.', ',') + ' s';
const time = ts => { const d = new Date(ts); return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`; };
const dateDE = ts => new Date(ts).toLocaleDateString('de-DE', { weekday: 'short', day: '2-digit', month: '2-digit', year: 'numeric' });
const dayStart = k => new Date(k + 'T12:00:00').getTime();
const REC_TXT = { up: '↑ schwerer', hold: '= halten', down: '↓ leichter', none: '–' };

export const DISCLAIMER = 'Die Werte sind Trainingsdaten zur Beobachtung, keine Diagnose. Die Bewertung liegt bei den Therapeuten.';

// ---------- Kennzahlen ----------
export function zoneRate(recs, z) {
  let h = 0, m = 0;
  recs.forEach(r => { h += r.zones[z].hits; m += r.zones[z].missed; });
  return h + m ? h / (h + m) : null;
}
export function zoneRT(recs, z) {
  let s = 0, n = 0;
  recs.forEach(r => { s += r.zones[z].rtSum; n += r.zones[z].rtN; });
  return n ? s / n : null;
}
const missed = (recs, z) => recs.reduce((s, r) => s + r.zones[z].missed, 0);
const avg = a => a.length ? a.reduce((s, v) => s + v, 0) / a.length : null;

function byDay(recs) {
  const m = new Map();
  recs.forEach(r => { if (!m.has(r.date)) m.set(r.date, []); m.get(r.date).push(r); });
  return [...m.entries()].sort((a, b) => a[0] < b[0] ? -1 : 1);
}

function levelMarkers(recs) {
  const out = [];
  let prev = null;
  [...recs].sort((a, b) => a.ts - b.ts).forEach(r => {
    if (prev != null && r.level !== prev) out.push({ ts: dayStart(r.date), label: 'Stufe ' + r.level });
    prev = r.level;
  });
  return out;
}

// ---------- Abschnitte (auch für den PDF-Bericht) ----------
export function sectionDay(recs, k) {
  const list = recs.filter(r => r.date === k).sort((a, b) => a.ts - b.ts);
  if (!list.length) return `<div class="empty-state">Am ${dateDE(dayStart(k))} wurde nicht gespielt.</div>`;
  const mins = list.reduce((s, r) => s + r.durationMs, 0) / 60000;
  return `
    <div class="kpis">
      <div class="kpi"><b>${list.length}</b><span>Runden</span></div>
      <div class="kpi"><b>${Math.round(mins)} min</b><span>Spielzeit</span></div>
      <div class="kpi"><b>${pct(avg(list.map(r => r.hitRate)))}</b><span>Trefferquote</span></div>
      <div class="kpi"><b>${missed(list, 'L')} / ${missed(list, 'R')}</b><span>Verpasst links / rechts</span></div>
    </div>
    <table class="data" style="margin-top:12px">
      <tr><th>Uhrzeit</th><th>Spiel</th><th class="num">Stufe</th><th class="num">Dauer</th><th class="num">Treffer</th><th class="num">links</th><th class="num">rechts</th><th class="num">Fehltreffer</th><th>Müdigkeit vor → nach</th><th>Hinweis</th></tr>
      ${list.map(r => `<tr>
        <td>${time(r.ts)}</td><td>${esc(gameName(r.game))}</td><td class="num">${r.level}</td>
        <td class="num">${Math.round(r.durationMs / 1000)} s</td><td class="num">${pct(r.hitRate)}</td>
        <td class="num">${pct(zoneRate([r], 'L'))}</td><td class="num">${pct(zoneRate([r], 'R'))}</td><td class="num">${r.falseTaps}</td>
        <td>${r.fatigueBefore != null ? FATIGUE[r.fatigueBefore] : '–'} → ${r.fatigueAfter != null ? FATIGUE[r.fatigueAfter] : '–'}</td>
        <td>${[r.aborted ? 'abgebrochen' : '', r.short ? 'kurz' : '', r.pauses ? r.pauses + '× Pause' : '', r.linksHilfe ? 'Links-Hilfe' : '', r.anchorOn ? `Anker ${r.anchorW}` : 'ohne Anker'].filter(Boolean).join(', ')}</td>
      </tr>`).join('')}
    </table>`;
}

export function sectionGame(recs, game) {
  const list = recs.filter(r => r.game === game);
  const days = byDay(list);
  const markers = levelMarkers(list);
  return `
    <h3>Trefferquote</h3>
    ${lineChart({ series: [{ name: 'Trefferquote', color: 'var(--blue)', points: days.map(([k, rs]) => [dayStart(k), avg(rs.map(r => r.hitRate))]) }], markers })}
    <h3 style="margin-top:20px">Reaktionszeit</h3>
    ${(() => {
      const pts = z => days.map(([k, rs]) => [dayStart(k), zoneRT(rs, z)]).filter(p => p[1] != null).map(p => [p[0], p[1] / 1000]);
      const all = ['L', 'M', 'R'].flatMap(z => pts(z).map(p => p[1]));
      const yMax = Math.max(1, Math.ceil(Math.max(0, ...all)));
      return lineChart({ series: [
        { name: 'links', color: 'var(--orange)', points: pts('L') },
        { name: 'Mitte', color: 'var(--muted)', dash: '4 6', points: pts('M') },
        { name: 'rechts', color: 'var(--blue)', marker: 'square', points: pts('R') }
      ], yMax, yFmt: v => v.toFixed(1).replace('.', ',') + ' s', markers });
    })()}`;
}

export function sectionLR(recs) {
  const days = byDay(recs);
  const L = zoneRate(recs, 'L'), R = zoneRate(recs, 'R');
  return `
    <div class="kpis">
      <div class="kpi"><b>${pct(L)}</b><span>Treffer links</span></div>
      <div class="kpi"><b>${pct(R)}</b><span>Treffer rechts</span></div>
      <div class="kpi"><b>${L != null && R != null ? Math.round((R - L) * 100) + ' Pkt.' : '–'}</b><span>Abstand rechts − links</span></div>
      <div class="kpi"><b>${missed(recs, 'L')} / ${missed(recs, 'R')}</b><span>Verpasst links / rechts</span></div>
      <div class="kpi"><b>${sec(zoneRT(recs, 'L'))} / ${sec(zoneRT(recs, 'R'))}</b><span>Reaktion links / rechts</span></div>
    </div>
    ${lineChart({ series: [
      { name: 'Treffer links', color: 'var(--orange)', points: days.map(([k, rs]) => [dayStart(k), zoneRate(rs, 'L')]).filter(p => p[1] != null) },
      { name: 'Treffer rechts', color: 'var(--blue)', marker: 'square', points: days.map(([k, rs]) => [dayStart(k), zoneRate(rs, 'R')]).filter(p => p[1] != null) }
    ] })}
    <div class="note">Der Abstand zwischen beiden Linien ist die zentrale Kennzahl. Links = linkes Bildschirmdrittel.</div>`;
}

export function sectionHeat(recs) {
  return heatmap(recs);
}

export function sectionFatigue(recs) {
  const days = byDay(recs);
  const f = (rs, key) => avg(rs.map(r => r[key]).filter(v => v != null));
  const names = ['frisch', 'mittel', 'müde'];
  return `
    ${lineChart({ series: [
      { name: 'vorher', color: 'var(--green)', points: days.map(([k, rs]) => [dayStart(k), f(rs, 'fatigueBefore')]).filter(p => p[1] != null) },
      { name: 'nachher', color: 'var(--orange)', marker: 'square', points: days.map(([k, rs]) => [dayStart(k), f(rs, 'fatigueAfter')]).filter(p => p[1] != null) }
    ], yMax: 2, yTicks: 2, yFmt: v => names[Math.round(v)], h: 240 })}
    <h3 style="margin-top:20px">Spielzeit pro Tag</h3>
    ${barChart({ bars: days.map(([k, rs]) => [dayStart(k), Math.round(rs.reduce((s, r) => s + r.durationMs, 0) / 60000)]), yFmt: v => v + ' min', h: 180 })}`;
}

export function sectionLevels(recs) {
  const list = [...recs].sort((a, b) => b.ts - a.ts);
  if (!list.length) return `<div class="empty-state">Keine Daten im Zeitraum.</div>`;
  return `<table class="data">
    <tr><th>Datum</th><th>Uhrzeit</th><th>Spiel</th><th class="num">Stufe</th><th class="num">Treffer</th><th>Empfehlung danach</th></tr>
    ${list.map(r => `<tr><td>${new Date(r.ts).toLocaleDateString('de-DE')}</td><td>${time(r.ts)}</td><td>${esc(gameName(r.game))}</td><td class="num">${r.level}</td><td class="num">${pct(r.hitRate)}</td><td>${REC_TXT[r.rec || 'none']}</td></tr>`).join('')}
  </table>`;
}

// ---------- Ansicht ----------
const hv = { tab: 'tag', range: 7, game: 'all', day: null };

export function renderHistory(body) {
  if (!hv.day) hv.day = dayKey();
  function draw() {
    const now = Date.now();
    const all = state.records;
    const ranged = hv.range ? all.filter(r => r.ts >= now - hv.range * DAY) : all;
    const recs = hv.game === 'all' ? ranged : ranged.filter(r => r.game === hv.game);
    const tabs = [['tag', 'Tagesübersicht'], ['spiel', 'Verlauf je Spiel'], ['lr', 'Links gegen rechts'], ['heat', 'Heatmap'], ['muede', 'Müdigkeit'], ['stufen', 'Stufen und Empfehlungen']];
    const needsGame = hv.tab === 'spiel';
    if (needsGame && hv.game === 'all') hv.game = 'sterne';
    let content = '';
    if (hv.tab === 'tag') content = `
      <div class="hist-bar"><div class="seg"><button data-act="day" data-d="-1">‹</button></div><b style="font-size:24px">${dateDE(dayStart(hv.day))}</b><div class="seg"><button data-act="day" data-d="1">›</button></div></div>
      <div class="hist-card">${sectionDay(hv.game === 'all' ? all : all.filter(r => r.game === hv.game), hv.day)}</div>`;
    else if (hv.tab === 'spiel') content = `<div class="hist-card">${sectionGame(ranged, hv.game)}</div>`;
    else if (hv.tab === 'lr') content = `<div class="hist-card">${sectionLR(recs)}</div>`;
    else if (hv.tab === 'heat') content = `<div class="hist-card">${sectionHeat(recs)}</div>`;
    else if (hv.tab === 'muede') content = `<div class="hist-card">${sectionFatigue(ranged)}</div>`;
    else content = `<div class="hist-card">${sectionLevels(recs)}</div>`;

    body.innerHTML = `
      <div class="care-main" style="gap:16px">
        <div class="hist-tabs">${tabs.map(([id, l]) => `<button class="${hv.tab === id ? 'on' : ''}" data-act="htab" data-t="${id}">${l}</button>`).join('')}</div>
        <div class="hist-bar">
          ${hv.tab !== 'tag' ? `<div class="seg">${[[7, '7 Tage'], [30, '30 Tage'], [0, 'Gesamt']].map(([v, l]) => `<button class="${hv.range === v ? 'on' : ''}" data-act="range" data-v="${v}">${l}</button>`).join('')}</div>` : ''}
          ${hv.tab !== 'muede' ? `<div class="seg">${needsGame ? '' : `<button class="${hv.game === 'all' ? 'on' : ''}" data-act="hgame" data-g="all">Alle</button>`}${GAMES.map(g => `<button class="${hv.game === g.id ? 'on' : ''}" data-act="hgame" data-g="${g.id}" aria-label="${g.name}" title="${g.name}">${gameIcon(g.id, 30)}</button>`).join('')}</div>` : ''}
          <div style="flex:1"></div>
          <div class="seg"><button data-act="csv">${ICON.download(26)} CSV</button><button data-act="report">${ICON.print(26)} Bericht</button></div>
        </div>
        ${hv.tab === 'spiel' ? `<div style="font-size:24px;font-weight:700">${esc(gameName(hv.game))}</div>` : ''}
        ${content}
        <div class="hist-bar" data-reportbar style="display:none">
          <span style="font-size:20px;font-weight:700">Bericht von</span><input type="date" data-from><span style="font-size:20px;font-weight:700">bis</span><input type="date" data-to>
          <div class="seg"><button class="on" data-act="print">${ICON.print(26)} Drucken / PDF</button></div>
        </div>
        <div class="disclaimer">${DISCLAIMER}</div>
      </div>`;
  }
  draw();
  return onAct(body, {
    htab: t => { hv.tab = t.dataset.t; if (hv.tab !== 'spiel' && hv.tab !== 'tag') hv.game = hv.game; draw(); },
    range: t => { hv.range = +t.dataset.v; draw(); },
    hgame: t => { hv.game = t.dataset.g; draw(); },
    day: t => { hv.day = dayKey(new Date(dayStart(hv.day) + (+t.dataset.d) * DAY)); draw(); },
    csv: () => exportCSV(state.records),
    report: () => {
      const bar = body.querySelector('[data-reportbar]');
      bar.style.display = 'flex';
      body.querySelector('[data-from]').value = dayKey(new Date(Date.now() - (hv.range || 30) * DAY));
      body.querySelector('[data-to]').value = dayKey();
      bar.scrollIntoView({ behavior: 'smooth', block: 'end' });
    },
    print: () => printReport(body.querySelector('[data-from]').value, body.querySelector('[data-to]').value)
  });
}
