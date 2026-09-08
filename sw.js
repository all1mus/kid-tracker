const CACHE_NAME = 'kidquest-v3'; // Оновили версію кешу
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './images/icons/icon-192.png',
  './images/icons/icon-512.png',
  './css/style.css',
  './js/app.js',
  './js/config.js',
  './js/locales.js'
];

// Встановлення та завантаження нових файлів у кеш
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Caching updated app assets');
      return cache.addAll(ASSETS_TO_CACHE);
    })
  );
  self.skipWaiting(); // Відразу активувати новий Service Worker
});

// Активація та видалення ВСІХ старих кешів (v1, v2 тощо)
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Removing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim(); // Взяти під контроль усі відкриті вкладки
});

// Перехоплення запитів: Стратегія "Network First" для HTML та "Stale-While-Revalidate" для ресурсів
self.addEventListener('fetch', (event) => {
  // Для HTML файлів завжди спочатку робимо запит в мережу, щоб бачити свіжі зміни
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then((networkResponse) => {
          return caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
            return networkResponse;
          });
        })
        .catch(() => caches.match(event.request)) // Якщо немає інтернету — беремо з кешу
    );
    return;
  }

  // Для решти ресурсів (картинки, скрипти, стилі)
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        if (networkResponse && networkResponse.status === 200) {
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, networkResponse.clone());
          });
        }
        return networkResponse;
      }).catch(() => {/* Offline fallback */ });

      // Повертаємо закешовану версію, але у фоні оновлюємо її з мережі
      return cachedResponse || fetchPromise;
    })
  );
});