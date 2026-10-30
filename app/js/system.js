// Vollbild, Bildschirm an, Querformat, Offline-Updates
import { state } from './state.js';
import { currentScreen } from './ui.js';

let lock = null;

export async function keepAwake() {
  try {
    if ('wakeLock' in navigator && document.visibilityState === 'visible' && !lock) {
      lock = await navigator.wakeLock.request('screen');
      lock.addEventListener('release', () => { lock = null; });
    }
  } catch (e) { lock = null; }
}

export function enterFullscreen() {
  keepAwake();
  const d = document.documentElement;
  if (!document.fullscreenElement && d.requestFullscreen && !matchMedia('(display-mode: fullscreen)').matches) {
    d.requestFullscreen({ navigationUI: 'hide' }).then(() => {
      if (screen.orientation && screen.orientation.lock) screen.orientation.lock('landscape').catch(() => {});
    }).catch(() => {});
  }
}

export function initSystem() {
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') keepAwake(); });
  // Keine Gesten, kein Kontextmenü, kein Zoom
  document.addEventListener('contextmenu', e => e.preventDefault());
  document.addEventListener('gesturestart', e => e.preventDefault());
  document.addEventListener('dblclick', e => e.preventDefault());

  if ('serviceWorker' in navigator && location.protocol !== 'file:') {
    navigator.serviceWorker.register('./sw.js').then(reg => {
      reg.update().catch(() => {});
    }).catch(() => {});
    let had = !!navigator.serviceWorker.controller;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (!had) { had = true; return; }
      // Update erst anwenden, wenn Conny auf dem Startbildschirm ist
      if (currentScreen() === 'start' || currentScreen() === 'rest') location.reload();
      else state.updateReady = true;
    });
  }
}
