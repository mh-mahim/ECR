/**
 * Service Worker - ENT Pulse / ECR Routine Web
 * Cache version: ent-pulse-v7-2026-m3
 * Offline caching with resilient fallback and asset versioning.
 */

const CACHE_NAME = 'ent-pulse-v10-2026-m3-stitch';

const CORE_ASSETS = [
  './',
  './index.html',
  './manifest.webmanifest',
  './manifest.json',
  './css/tokens.css',
  './css/base.css',
  './css/print.css',
  './css/components/nav.css',
  './css/components/hero.css',
  './css/components/notices.css',
  './css/components/views.css',
  './css/components/search.css',
  './css/components/modals.css',
  './icons/icon.svg',
  './icons/icon-192.png',
  './icons/icon-512.png',
  './icons/cnpi-logo.png',
  './js/app.js',
  './js/data/routine-data.js',
  './js/data/faculty-data.js',
  './js/modules/state.js',
  './js/modules/time-engine.js',
  './js/modules/i18n.js',
  './js/modules/nav.js',
  './js/modules/hero.js',
  './js/modules/routine-views.js',
  './js/modules/search-modals.js',
  './js/modules/utilities.js'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        return Promise.allSettled(
          CORE_ASSETS.map(url =>
            cache.add(url).catch(err => {
              console.warn(`[SW] Pre-cache failed for ${url}:`, err);
            })
          )
        );
      })
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log(`[SW] Purging outdated cache: ${key}`);
            return caches.delete(key);
          })
      ))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;

  const url = new URL(event.request.url);

  // Only handle same-origin or explicit font CDN requests
  const isSameOrigin = url.origin === self.location.origin;
  const isGoogleFont = url.origin === 'https://fonts.googleapis.com' || url.origin === 'https://fonts.gstatic.com';

  if (!isSameOrigin && !isGoogleFont) return;

  // Navigation requests: Stale-While-Revalidate with offline fallback to index.html
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          if (networkResponse && networkResponse.status === 200) {
            const clone = networkResponse.clone();
            caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          }
          return networkResponse;
        })
        .catch(() => {
          return caches.match('./index.html')
            .then(cachedIndex => cachedIndex || caches.match('/index.html'));
        })
    );
    return;
  }

  // Static assets & fonts: Cache-First strategy with background update
  event.respondWith(
    caches.match(event.request).then(cachedResponse => {
      if (cachedResponse) {
        // Fetch in background to update cache for next time
        fetch(event.request)
          .then(networkResponse => {
            if (networkResponse && networkResponse.status === 200) {
              const clone = networkResponse.clone();
              caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
            }
          })
          .catch(() => {/* Ignore background fetch failures */});

        return cachedResponse;
      }

      // Not in cache: fetch from network and cache
      return fetch(event.request)
        .then(networkResponse => {
          if (!networkResponse || networkResponse.status !== 200) {
            return networkResponse;
          }
          const clone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
          return networkResponse;
        })
        .catch(error => {
          // If offline and request is an HTML page
          if (event.request.headers.get('accept')?.includes('text/html')) {
            return caches.match('./index.html');
          }
          throw error;
        });
    })
  );
});
