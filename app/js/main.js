import { loadState, state } from './state.js';
import { go, fitStage, applyTheme } from './ui.js';
import { requestPersistence } from './db.js';
import { initSystem, keepAwake } from './system.js';
import './screens/basic.js';
import './screens/game.js';
import './screens/care.js';

async function boot() {
  initSystem();
  await loadState();
  applyTheme();
  fitStage();
  window.addEventListener('resize', fitStage);
  requestPersistence();
  keepAwake();
  await document.fonts.ready.catch(() => {});
  go('start');
  // Für Fernwartung und Tests in der Konsole erreichbar
  window.fokus = { state, go };
}

boot();
