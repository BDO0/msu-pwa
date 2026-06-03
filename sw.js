const CACHE_NAME = 'msu-museum-cache-v16';
const ASSETS_TO_CACHE = [
    '/',
    '/index.html',
    '/admin.html',
    '/css/styles.css',
    '/css/matchup.css',
    '/js/app.js',
    '/js/admin.js',
    '/js/matchup.js',
    '/js/firebase-ui.js',
    '/js/html5-qrcode.min.js',
    '/manifest.json',
    '/data/station1.json',
    '/data/station2.json',
    '/data/station3.json',
    '/images/Chapter1.webp',
    '/images/chapter2.webp',
    '/images/chapter3.webp',
    '/images/Kampilan.webp',
    '/images/Kris.webp',
    '/images/Panolong.webp',
    '/images/icons/icon-192x192.png',
    '/images/icons/icon-512x512.png',
    'https://fonts.googleapis.com/css2?family=Poppins:wght@400;500;600;700&display=swap'
];

// Install Event: Pre-cache App Shell and Data
self.addEventListener('install', (event) => {
    self.skipWaiting(); // Force the waiting service worker to become the active service worker
    event.waitUntil(
        caches.open(CACHE_NAME)
        .then((cache) => {
            console.log('Opened cache');
            return cache.addAll(ASSETS_TO_CACHE);
        })
    );
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return Promise.all(
                cacheNames.map((cacheName) => {
                    if (cacheName !== CACHE_NAME && cacheName !== 'msu-museum-images') {
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim()) // Immediately take control of the page
    );
});

// Fetch Event: Cache-First Strategy for App Shell, Stale-While-Revalidate for Storage
self.addEventListener('fetch', (event) => {
    // Only cache GET requests
    if (event.request.method !== 'GET') return;
    
    // For API calls to Firebase Firestore, skip caching
    if (event.request.url.includes('firestore.googleapis.com')) {
        return;
    }

    const isFirebaseStorage = event.request.url.includes('firebasestorage.googleapis.com');

    if (isFirebaseStorage) {
        // Stale-While-Revalidate Strategy for Images
        event.respondWith(
            caches.match(event.request).then((cachedResponse) => {
                const fetchedResponse = fetch(event.request).then((networkResponse) => {
                    // Allow basic and cors
                    if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors' || networkResponse.type === 'opaque')) {
                        caches.open(CACHE_NAME).then(cache => cache.put(event.request, networkResponse.clone()));
                    }
                    return networkResponse;
                }).catch(() => {
                    // Offline fallback managed by returning cachedResponse
                });
                
                return cachedResponse || fetchedResponse;
            })
        );
    } else {
        // Cache-First Strategy for App Shell
        event.respondWith(
            caches.match(event.request, { ignoreSearch: true })
                .then((response) => {
                    if (response) {
                        return response;
                    }
                    
                    return fetch(event.request).then(
                        function(networkResponse) {
                            // Check if valid
                            if(!networkResponse || networkResponse.status !== 200 || (networkResponse.type !== 'basic' && networkResponse.type !== 'cors')) {
                                return networkResponse;
                            }

                            var responseToCache = networkResponse.clone();

                            caches.open(CACHE_NAME)
                                .then(function(cache) {
                                    cache.put(event.request, responseToCache);
                                });

                            return networkResponse;
                        }
                    ).catch(() => {
                        // Offline fallback for navigation requests
                        if (event.request.mode === 'navigate' || event.request.headers.get('accept').includes('text/html')) {
                            return caches.match('/index.html');
                        }
                    });
                })
        );
    }
});
