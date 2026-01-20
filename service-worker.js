
const CACHE_NAME = 'exam-ide-cache-v3';
const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './questions/sample_question.pdf'
];
self.addEventListener('install', (evt) => {
  evt.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(CORE_ASSETS)).then(self.skipWaiting()));
});
self.addEventListener('activate', (evt) => { evt.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', (evt) => {
  const url = new URL(evt.request.url);
  // Cache-first for Pyodide CDN assets
  if (url.host.includes('cdn.jsdelivr.net') && url.pathname.includes('/pyodide/')) {
    evt.respondWith(caches.open(CACHE_NAME).then(async cache => {
      const cached = await cache.match(evt.request);
      if (cached) return cached;
      try { const res = await fetch(evt.request); cache.put(evt.request, res.clone()); return res; }
      catch(e){ return cached || Response.error(); }
    }));
    return;
  }
  // Cache-first for our app assets and /questions/ content
  if (url.origin === self.location.origin) {
    evt.respondWith(caches.match(evt.request).then(resp => resp || fetch(evt.request)));
    return;
  }
  // Otherwise fall back to network
  evt.respondWith(fetch(evt.request));
});
