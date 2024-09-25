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
self.addEventListener("install", installEvent => {
  installEvent.waitUntil(
    caches.open(staticDevCoffee).then(cache => {
      cache.addAll(assets)
    })
  )
})

// Intercept fetch requests and serve cached resources
self.addEventListener("fetch", fetchEvent => {
  fetchEvent.respondWith(
    caches.match(fetchEvent.request).then(res => {
      return res || fetch(fetchEvent.request)
    })
  )
})