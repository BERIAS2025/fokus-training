// Export: CSV-Rohdaten, Sicherung (JSON), PDF-Bericht über die Druckansicht.
// Daten verlassen das Tablet nur durch diesen bewussten Export.
import { state, gameName, FATIGUE, GAMES, dayKey } from './state.js';
import { records as db } from './db.js';
import { esc } from './ui.js';
import { sectionDay, sectionGame, sectionLR, sectionHeat, sectionFatigue, sectionLevels, DISCLAIMER } from './screens/history.js';

function download(name, blob) {
  const a = document.createElement('a');
  a.href = URL.createObjectURL(blob);
  a.download = name;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1000);
}

const num = v => v == null ? '' : String(Math.round(v * 1000) / 1000).replace('.', ',');
const rate = (h, m) => h + m ? h / (h + m) : null;

export function exportCSV(list) {
  const cols = ['Datum', 'Uhrzeit', 'Spiel', 'Stufe', 'Dauer_s', 'Modus', 'Trefferquote', 'Ziele', 'Treffer', 'Verpasst',
    'Treffer_links', 'Treffer_mitte', 'Treffer_rechts', 'Verpasst_links', 'Verpasst_mitte', 'Verpasst_rechts',
    'Reaktion_links_s', 'Reaktion_mitte_s', 'Reaktion_rechts_s', 'Fehltreffer', 'Wiederholungen',
    'Muedigkeit_vorher', 'Muedigkeit_nachher', 'Pausen', 'Abgebrochen', 'Kurz', 'Links_Hilfe', 'Anker', 'Ankerbreite', 'Empfehlung'];
  const rows = [...list].sort((a, b) => a.ts - b.ts).map(r => {
    const z = r.zones, d = new Date(r.ts);
    const rt = k => z[k].rtN ? z[k].rtSum / z[k].rtN / 1000 : null;
    return [r.date, d.toTimeString().slice(0, 5), gameName(r.game), r.level, Math.round(r.durationMs / 1000), r.mode,
      num(r.hitRate), r.targets, r.hits, r.missed,
      num(rate(z.L.hits, z.L.missed)), num(rate(z.M.hits, z.M.missed)), num(rate(z.R.hits, z.R.missed)),
      z.L.missed, z.M.missed, z.R.missed, num(rt('L')), num(rt('M')), num(rt('R')),
      r.falseTaps, r.repeats,
      r.fatigueBefore != null ? FATIGUE[r.fatigueBefore] : '', r.fatigueAfter != null ? FATIGUE[r.fatigueAfter] : '',
      r.pauses, r.aborted ? 'ja' : 'nein', r.short ? 'ja' : 'nein', r.linksHilfe ? 'an' : 'aus', r.anchorOn ? 'an' : 'aus', r.anchorW, r.rec || ''];
  });
  const csv = [cols, ...rows].map(r => r.map(v => /[;"\n]/.test(String(v)) ? `"${String(v).replace(/"/g, '""')}"` : v).join(';')).join('\r\n');
  download(`fokus-training-${dayKey()}.csv`, new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }));
}

export function exportBackup() {
  const data = { app: 'fokus-training', version: 1, exported: new Date().toISOString(), settings: state.settings, records: state.records };
  download(`fokus-sicherung-${dayKey()}.json`, new Blob([JSON.stringify(data)], { type: 'application/json' }));
}

// Übernimmt nur Einheiten, die noch nicht vorhanden sind (gleicher Zeitpunkt und Spiel)
export async function importBackup(file) {
  const data = JSON.parse(await file.text());
  if (data.app !== 'fokus-training' || !Array.isArray(data.records)) throw new Error('falsches Format');
  const have = new Set(state.records.map(r => r.ts + r.game));
  const fresh = data.records.filter(r => r && r.ts && r.zones && !have.has(r.ts + r.game));
  await db.bulkAdd(fresh);
  state.records = await db.all();
  return fresh.length;
}

export function printReport(from, to) {
  const t0 = new Date(from + 'T00:00:00').getTime(), t1 = new Date(to + 'T23:59:59').getTime();
  const recs = state.records.filter(r => r.ts >= t0 && r.ts <= t1);
  const days = [...new Set(recs.map(r => r.date))].sort();
  const played = GAMES.filter(g => recs.some(r => r.game === g.id));
  const fmt = k => new Date(k + 'T12:00:00').toLocaleDateString('de-DE');
  const root = document.documentElement;
  const theme = root.dataset.theme;
  root.dataset.theme = 'light';
  document.getElementById('print').innerHTML = `
    <h1>Fokus-Training · Bericht</h1>
    <div>Zeitraum ${fmt(from)} bis ${fmt(to)} · ${recs.length} Runden an ${days.length} Tagen · erstellt am ${new Date().toLocaleDateString('de-DE')}</div>
    <p class="disclaimer">${DISCLAIMER}</p>
    <div class="sec"><h2>Links gegen rechts</h2>${sectionLR(recs)}</div>
    <div class="sec"><h2>Bildschirm-Heatmap</h2>${sectionHeat(recs)}</div>
    <div class="sec"><h2>Müdigkeit und Spielzeit</h2>${sectionFatigue(recs)}</div>
    ${played.map(g => `<div class="sec"><h2>Verlauf: ${esc(g.name)}</h2>${sectionGame(recs, g.id)}</div>`).join('')}
    <h2>Tagesübersichten</h2>
    ${days.map(k => `<div class="sec"><h2 style="font-size:12pt">${fmt(k)}</h2>${sectionDay(recs, k)}</div>`).join('')}
    <div class="sec"><h2>Stufen und Empfehlungen</h2>${sectionLevels(recs)}</div>`;
  const restore = () => { root.dataset.theme = theme; window.removeEventListener('afterprint', restore); };
  window.addEventListener('afterprint', restore);
  setTimeout(() => window.print(), 50);
}
