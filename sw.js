const CACHE_NAME = 'rander-store-v4';
const OFFLINE_URL = './offline.html';

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.add(OFFLINE_URL))
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.map((key) => key !== CACHE_NAME ? caches.delete(key) : null))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;

  // لا نتدخل إلا في طلبات GET
  if (request.method !== 'GET') return;

  const url = new URL(request.url);

  // لا نتدخل أبداً في طلبات Firebase وGoogle (قاعدة البيانات والإشعارات)
  if (
    url.hostname.includes('googleapis.com') ||
    url.hostname.includes('firebaseio.com') ||
    url.hostname.includes('firebaseapp.com') ||
    url.hostname.includes('gstatic.com')
  ) {
    return;
  }

  // الصفحة نفسها: الشبكة أولاً دائماً، وإن لم يوجد إنترنت تظهر صفحة offline
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request).catch(() => caches.match(OFFLINE_URL))
    );
    return;
  }

  // الصور: الكاش أولاً للسرعة
  if (request.destination === 'image' || /\.(jpg|jpeg|png|gif|webp|svg)(\?|$)/i.test(request.url)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((networkResponse) => {
            if (networkResponse && (networkResponse.ok || networkResponse.type === 'opaque')) {
              cache.put(request, networkResponse.clone());
            }
            return networkResponse;
          }).catch(() => Response.error());
        })
      )
    );
    return;
  }

  // باقي الملفات (manifest وغيره): الشبكة أولاً ثم الكاش
  event.respondWith(
    fetch(request).catch(() => caches.match(request))
  );
});
