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

// Installation: Chrome meldet, dass die App installiert werden kann
let installEvent = null;
export const canInstall = () => !!installEvent;
export const isInstalled = () => matchMedia('(display-mode: standalone)').matches || matchMedia('(display-mode: fullscreen)').matches || navigator.standalone === true;
export async function promptInstall() {
  if (!installEvent) return false;
  installEvent.prompt();
  const r = await installEvent.userChoice.catch(() => null);
  installEvent = null;
  return r && r.outcome === 'accepted';
}

// App beenden: installierte Apps lassen sich per window.close() schließen.
// Geht das nicht, bleibt der Hinweis auf den Home-Knopf von Android.
export function closeApp() {
  try { window.close(); } catch (e) { /* weiter mit Hinweis */ }
}

export function initSystem() {
  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    installEvent = e;
    window.dispatchEvent(new Event('fokus-installable'));
  });
  window.addEventListener('appinstalled', () => { installEvent = null; window.dispatchEvent(new Event('fokus-installable')); });
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
