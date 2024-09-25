const CACHE_NAME = 'expense-tracker-cache-v2';

const urlsToCache = [
  '/',                  // Root or index file
  '/index.html',         // Main HTML file
  '/style.css',          // Stylesheet
  '/script.js',          // Main JavaScript file
  '/manifest.json',      // Manifest file
  '/icons/icon-192x192.png',   // Icon file
  '/icons/icon-512x512.png'    // Larger icon file
];

// Install the service worker and cache resources
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      console.log('Opened cache');
      return cache.addAll(urlsToCache).catch(error => {
        console.error('Failed to cache resources:', error); // Logs error if any
      });
    })
  );
});

// Activate the service worker and clean up old caches
self.addEventListener('activate', event => {
  const cacheWhitelist = [CACHE_NAME];
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (!cacheWhitelist.includes(cacheName)) {
            console.log('Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Intercept fetch requests and serve cached resources
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
