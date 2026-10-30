// Zentraler Zustand: Konfiguration, Einstellungen, Verlauf im Speicher.
import { kv, records } from './db.js';

export const GAMES = [
  { id: 'sterne', name: 'Sterne suchen', trains: 'Visuelles Absuchen' },
  { id: 'blick', name: 'Blick folgen', trains: 'Augenfolgebewegung' },
  { id: 'finden', name: 'Finden und zählen', trains: 'Selektive Aufmerksamkeit' },
  { id: 'paare', name: 'Paare finden', trains: 'Arbeitsgedächtnis' },
  { id: 'folge', name: 'Folge merken', trains: 'Sequenzgedächtnis' },
  { id: 'nur', name: 'Nur dieses', trains: 'Daueraufmerksamkeit' }
];
export const gameName = id => (GAMES.find(g => g.id === id) || {}).name || id;
export const FATIGUE = ['frisch', 'mittel', 'müde'];

const DEFAULTS = {
  theme: 'light',
  anchorOn: true,
  anchorW: 112,
  linksHilfe: true,
  volume: 0.8,
  speech: true,
  showTimer: false,
  roundSeconds: null,      // null = Wert aus config.json
  dailyLimit: null,        // Minuten, null = Wert aus config.json
  unitMinutes: 8,
  plan: GAMES.map(g => g.id),
  levels: Object.fromEntries(GAMES.map(g => [g.id, 1])),
  lastPlayed: {}
};

export const state = {
  config: null,
  settings: null,
  records: [],
  updateReady: false
};

export async function loadState() {
  const res = await fetch('./config.json');
  state.config = await res.json();
  let s = null;
  try { s = await kv.get('settings'); } catch (e) { s = null; }
  state.settings = { ...structuredClone(DEFAULTS), ...(s || {}) };
  state.settings.levels = { ...DEFAULTS.levels, ...(s && s.levels) };
  try { state.records = (await records.all()) || []; } catch (e) { state.records = []; }
}

export function saveSettings() {
  return kv.set('settings', state.settings).catch(() => {});
}

export const cfg = () => state.config;
export const roundSeconds = () => state.settings.roundSeconds || state.config.session.roundSeconds;
export const dailyLimitMin = () => state.settings.dailyLimit || state.config.session.dailyLimitMinutes;

// Wert einer Stufe aus config.json (Stufe 1..8)
export function lv(game, key, level) {
  const arr = state.config.games[game][key];
  return arr[Math.max(0, Math.min(7, level - 1))];
}

export function dayKey(d = new Date()) {
  const p = n => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`;
}

export function todayRecords() {
  const k = dayKey();
  return state.records.filter(r => r.date === k);
}

export function playedTodaySeconds() {
  return todayRecords().reduce((s, r) => s + (r.durationMs || 0), 0) / 1000;
}

export function limitReached() {
  return playedTodaySeconds() >= dailyLimitMin() * 60;
}

export function doneToday() {
  return new Set(todayRecords().map(r => r.game));
}

// Nächste Spiele im Tagesplan, beginnend mit dem ersten noch nicht gespielten
export function planQueue() {
  const plan = state.settings.plan.length ? state.settings.plan : GAMES.map(g => g.id);
  const done = doneToday();
  const start = plan.findIndex(g => !done.has(g));
  const from = start === -1 ? 0 : start;
  const ordered = [...plan.slice(from), ...plan.slice(0, from)];
  const n = Math.max(1, Math.round(state.settings.unitMinutes * 60 / roundSeconds()));
  return ordered.slice(0, Math.min(n, ordered.length));
}

export function nextGame() {
  return planQueue()[0];
}

export async function addRecord(rec) {
  const id = await records.add(rec);
  rec.id = id;
  state.records.push(rec);
  return rec;
}

export async function updateRecord(rec) {
  await records.put(rec);
}

// ---------- Empfehlung (Abschnitt 6) ----------
export function gameRecords(game, level) {
  return state.records.filter(r => r.game === game && (level == null || r.level === level)).sort((a, b) => a.ts - b.ts);
}

export function recommend(game, level = state.settings.levels[game]) {
  const R = state.config.recommendation;
  const last = gameRecords(game, level).slice(-R.lastSessions);
  if (last.length < R.lastSessions) return 'none';
  const rate = last.reduce((s, r) => s + r.hitRate, 0) / last.length;
  const tired = last.filter(r => r.fatigueAfter === 2).length;
  let rec;
  if (rate < R.holdMinRate || tired >= R.downTiredCount) rec = 'down';
  else if (rate >= R.upMinRate && last.every(r => r.fatigueAfter == null || r.fatigueAfter <= 1)) rec = 'up';
  else rec = 'hold';
  if (rec === 'up' && level >= 8) rec = 'hold';
  if (rec === 'down' && level <= 1) rec = 'hold';
  return rec;
}

export function masteredLevels(game) {
  const R = state.config.recommendation;
  const out = new Set();
  for (let l = 1; l <= 8; l++) {
    if (gameRecords(game, l).filter(r => r.hitRate >= R.masteredMinRate).length >= R.masteredSessions) out.add(l);
  }
  return out;
}

export function flowersFor(rate) {
  const t = state.config.flowers;
  let n = 1;
  t.forEach(th => { if (rate >= th) n++; });
  return n;
}
