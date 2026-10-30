// Service Worker: App-Hülle offline aus dem Cache, Updates beim nächsten Start mit Internet.
// BUILD wird beim Deploy durch die Commit-ID ersetzt, damit jeder Deploy einen neuen Cache bekommt.
const BUILD = '__BUILD__';
const CACHE = 'fokus-' + BUILD;
const FILES = [
  './',
  './index.html',
  './manifest.webmanifest',
  './config.json',
  './css/app.css',
  './fonts/atkinson-400.woff2',
  './fonts/atkinson-700.woff2',
  './fonts/atkinson-700i.woff2',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/icon-maskable-512.png',
  './js/main.js',
  './js/state.js',
  './js/db.js',
  './js/ui.js',
  './js/icons.js',
  './js/audio.js',
  './js/flow.js',
  './js/system.js',
  './js/charts.js',
  './js/export.js',
  './js/screens/basic.js',
  './js/screens/game.js',
  './js/screens/care.js',
  './js/screens/history.js',
  './js/games/index.js',
  './js/games/common.js',
  './js/games/board.js',
  './js/games/sterne.js',
  './js/games/blick.js',
  './js/games/finden.js',
  './js/games/paare.js',
  './js/games/folge.js',
  './js/games/nur.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(FILES.map(f => new Request(f, { cache: 'reload' })))).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k.startsWith('fokus-') && k !== CACHE).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const req = e.request;
  if (req.method !== 'GET' || new URL(req.url).origin !== location.origin) return;
  e.respondWith(
    caches.match(req, { ignoreSearch: true }).then(hit => hit || fetch(req).then(res => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then(c => c.put(req, copy)); }
      return res;
    }).catch(() => caches.match('./index.html')))
  );
});
