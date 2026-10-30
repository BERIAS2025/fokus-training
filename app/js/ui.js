// Bühne, Navigation und kleine Helfer
import { ICON } from './icons.js';
import { state } from './state.js';

const screens = {};
let current = null;
let cleanup = null;
export const stage = () => document.getElementById('stage');

export function register(name, fn) { screens[name] = fn; }

export function go(name, params = {}) {
  if (cleanup) { try { cleanup(); } catch (e) { console.error(e); } }
  cleanup = null;
  if (name === 'start' && state.updateReady) { location.reload(); return; }
  const root = stage();
  root.innerHTML = '';
  const el = document.createElement('div');
  el.className = 'screen';
  el.dataset.screen = name;
  root.appendChild(el);
  current = name;
  const c = screens[name](el, params);
  if (typeof c === 'function') cleanup = c;
}

export const currentScreen = () => current;

export function applyTheme() {
  const s = state.settings;
  document.documentElement.dataset.theme = s.theme;
  document.documentElement.style.setProperty('--anchor-w', (s.anchorOn ? s.anchorW : 0) + 'px');
  document.querySelector('meta[name=theme-color]')?.setAttribute('content', s.theme === 'dark' ? '#1A1D24' : '#F3F0E9');
}

export function fitStage() {
  const s = Math.min(window.innerWidth / 1280, window.innerHeight / 800);
  stage().style.transform = `scale(${s})`;
  stage().dataset.scale = s;
}

// Bildschirmkoordinaten in Bühnenkoordinaten (1280 x 800)
export function toStage(e) {
  const r = stage().getBoundingClientRect();
  const s = r.width / 1280;
  return { x: (e.clientX - r.left) / s, y: (e.clientY - r.top) / s };
}

export const anchorHTML = () => state.settings.anchorOn ? `<div class="anchor">${ICON.anchorArrow()}</div>` : '';

export function homeHTML() {
  return `<div class="home-slot"><button class="btn-home btn" data-act="home" aria-label="Start">${ICON.home(56)}</button></div>`;
}

// Ein einziger Listener pro Bildschirm, Aktionen über data-act
export function onAct(el, handlers) {
  const fn = e => {
    const t = e.target.closest('[data-act]');
    if (!t || !el.contains(t) || t.disabled) return;
    const h = handlers[t.dataset.act];
    if (h) h(t, e);
  };
  el.addEventListener('click', fn);
  return () => el.removeEventListener('click', fn);
}

// Halten für n Millisekunden (Zugang zum Pflege-Bereich)
export function holdToOpen(btn, ms, done) {
  let timer = null;
  const start = e => {
    e.preventDefault();
    btn.classList.add('holding');
    timer = setTimeout(() => { btn.classList.remove('holding'); done(); }, ms);
  };
  const stop = () => { btn.classList.remove('holding'); clearTimeout(timer); };
  btn.addEventListener('pointerdown', start);
  ['pointerup', 'pointerleave', 'pointercancel'].forEach(ev => btn.addEventListener(ev, stop));
}

export function toast(msg) {
  const t = document.createElement('div');
  t.className = 'toast';
  t.textContent = msg;
  stage().appendChild(t);
  setTimeout(() => t.remove(), 2600);
}

export function esc(s) {
  return String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
}
