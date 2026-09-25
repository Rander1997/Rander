const CACHE_NAME = 'rander-store-v2'; // قمنا بتحديث رقم الإصدار لإجبار المتصفح على التحديث
const OFFLINE_URL = './offline.html';

// تثبيت الـ Service Worker وتخزين صفحة عدم الاتصال مسبقاً
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.add(OFFLINE_URL);
    })
  );
  self.skipWaiting();
});

// تفعيل وتحديث الـ Cache وحذف النسخ القديمة
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// استراتيجية التحميل
self.addEventListener('fetch', (event) => {
  const request = event.request;
  
  // إذا كان الطلب عبارة عن صورة
  if (request.destination === 'image' || request.url.match(/\.(jpg|jpeg|png|gif|webp|svg)/)) {
    event.respondWith(
      caches.open(CACHE_NAME).then((cache) => {
        return cache.match(request).then((cachedResponse) => {
          if (cachedResponse) {
            return cachedResponse;
          }
          return fetch(request).then((networkResponse) => {
            cache.put(request, networkResponse.clone());
            return networkResponse;
          });
        });
      })
    );
  } else {
    // باقي الطلبات العادية مع عرض صفحة الـ offline المخزنة مسبقاً عند انقطاع النت
    event.respondWith(
      caches.match(request).then((response) => {
        return response || fetch(request).catch(() => {
          return caches.match(OFFLINE_URL);
        });
      })
    );
  }
});

