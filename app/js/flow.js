// Ablauf einer Einheit: Start > Müdigkeit > Spiele > Ergebnis > Müdigkeit > Start
import { state, planQueue, addRecord, updateRecord, recommend, cfg, saveSettings } from './state.js';
import { go } from './ui.js';

export const unit = {
  id: null,
  mode: 'plan',       // 'plan' oder 'single'
  queue: [],
  short: false,
  fatigueBefore: null,
  playSincePause: 0,  // ms seit der letzten Pause
  ended: false,
  recs: []
};

function newUnit(mode, queue) {
  Object.assign(unit, { id: Date.now(), mode, queue, short: false, fatigueBefore: null, playSincePause: 0, ended: false, recs: [] });
}

export function startPlan() {
  newUnit('plan', planQueue());
  go('fatigue', { phase: 'before' });
}

export function startSingle(game) {
  newUnit('single', [game]);
  playCurrent();
}

export function fatigueBefore(v) {
  unit.fatigueBefore = v;
  if (v === 2) go('tired');
  else playCurrent();
}

export function chooseShort() {
  const S = cfg().session;
  unit.short = true;
  unit.queue = unit.queue.slice(0, S.shortMaxGames);
  playCurrent();
}

export function playCurrent() {
  const game = unit.queue[0];
  if (!game) return finishUnit();
  let level = state.settings.levels[game] || 1;
  if (unit.short) level = Math.max(1, level - cfg().session.shortLevelDrop);
  go('game', { game, level });
}

export async function roundDone(rec) {
  Object.assign(rec, {
    unit: unit.id, mode: unit.mode, short: unit.short,
    fatigueBefore: unit.fatigueBefore, fatigueAfter: null,
    linksHilfe: state.settings.linksHilfe, anchorOn: state.settings.anchorOn, anchorW: state.settings.anchorW
  });
  try { await addRecord(rec); } catch (e) { state.records.push(rec); }
  if (!unit.short) {
    state.settings.lastPlayed[rec.game] = rec.level;
    saveSettings();
  }
  rec.rec = recommend(rec.game, rec.level);
  updateRecord(rec).catch(() => {});
  unit.recs.push(rec);
  if (rec.aborted) unit.ended = true;
  go('result', { rec });
}

export function again() {
  if (unit.ended) unit.ended = false;
  playCurrent();
}

export function resultDone() {
  unit.queue.shift();
  if (unit.ended || !unit.queue.length) finishUnit();
  else playCurrent();
}

function finishUnit() {
  if (unit.mode === 'plan' && unit.recs.length) go('fatigue', { phase: 'after' });
  else go('start');
}

export async function fatigueAfter(v) {
  for (const r of unit.recs) {
    r.fatigueAfter = v;
    r.rec = recommend(r.game, r.level);
    try { await updateRecord(r); } catch (e) { /* weiter */ }
  }
  if (v === 2) go('rest', { sunset: true });
  else go('start');
}
