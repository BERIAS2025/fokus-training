// Töne werden lokal per Web Audio erzeugt (keine Dateien, kein Netz).
import { state } from './state.js';

let ctx = null;
function ac() {
  if (!ctx) {
    const C = window.AudioContext || window.webkitAudioContext;
    if (!C) return null;
    ctx = new C();
  }
  if (ctx.state === 'suspended') ctx.resume();
  return ctx;
}

export function unlockAudio() { ac(); }

function bell(freq, at = 0, dur = 0.6, gain = 0.35) {
  const c = ac(); if (!c) return;
  const vol = state.settings ? state.settings.volume : 0.8;
  if (vol <= 0) return;
  const t = c.currentTime + at;
  const g = c.createGain();
  g.gain.setValueAtTime(0.0001, t);
  g.gain.exponentialRampToValueAtTime(gain * vol, t + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  g.connect(c.destination);
  [[1, 'sine', 1], [2, 'sine', 0.25], [3, 'triangle', 0.08]].forEach(([m, type, a]) => {
    const o = c.createOscillator();
    const og = c.createGain();
    o.type = type; o.frequency.value = freq * m;
    og.gain.value = a;
    o.connect(og); og.connect(g);
    o.start(t); o.stop(t + dur + 0.05);
  });
}

// Kurzer warmer Klang bei Treffer
export const hitSound = () => bell(659.25, 0, 0.5, 0.3);
// Ruhiger Dreiklang am Ende einer Runde
export const triad = () => { bell(523.25, 0, 1.2, 0.25); bell(659.25, 0.18, 1.2, 0.22); bell(783.99, 0.36, 1.6, 0.22); };
// Absteigend: "Für heute genug" (Sonne geht unter)
export const sunsetSound = () => { bell(783.99, 0, 1.0, 0.2); bell(659.25, 0.3, 1.0, 0.2); bell(523.25, 0.6, 1.8, 0.22); };
// Töne für die Felder in "Folge merken"
const PAD_NOTES = [392.0, 440.0, 523.25, 587.33, 659.25, 783.99];
export const padSound = i => bell(PAD_NOTES[i % PAD_NOTES.length], 0, 0.7, 0.3);
export const softTick = () => bell(880, 0, 0.25, 0.12);

// Sprachausgabe (Deutsch für Ansagen, Italienisch fürs Lob), abschaltbar
export function say(text, lang = 'de-DE') {
  try {
    if (!state.settings.speech || !('speechSynthesis' in window)) return;
    const u = new SpeechSynthesisUtterance(text);
    u.lang = lang;
    const v = speechSynthesis.getVoices().find(x => x.lang && x.lang.toLowerCase().startsWith(lang.slice(0, 2)));
    if (v) u.voice = v;
    u.rate = 0.9;
    u.volume = Math.max(0.1, state.settings.volume);
    speechSynthesis.cancel();
    speechSynthesis.speak(u);
  } catch (e) { /* ohne Stimme weiter */ }
}
