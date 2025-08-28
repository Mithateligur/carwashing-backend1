// CarWashing Admin Service Worker
const CACHE_VERSION = 'v1.0.0';
const CACHE_NAME = `carwashing-cache-${CACHE_VERSION}`;
const DATA_CACHE_NAME = `carwashing-data-${CACHE_VERSION}`;

// Resources to cache
const STATIC_CACHE_URLS = [
    '/',
    '/index.html',
    '/static/css/main.css',
    '/static/js/bundle.js',
    '/manifest.json',
    '/offline.html'
];

// API endpoints to cache
const API_CACHE_URLS = [
    '/api/auth/profile',
    '/api/jobs',
    '/api/customers'
];

// Install Event - Cache static resources
self.addEventListener('install', (event) => {
    console.log('[ServiceWorker] Install CarWashing Admin v' + CACHE_VERSION);
    
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('[ServiceWorker] Caching static resources');
                return cache.addAll(STATIC_CACHE_URLS);
            })
            .catch(error => {
                console.log('[ServiceWorker] Cache failed:', error);
                // Continue without caching if some resources fail
                return Promise.resolve();
            })
            .then(() => self.skipWaiting())
    );
});

// Activate Event - Clean old caches
self.addEventListener('activate', (event) => {
    console.log('[ServiceWorker] Activate');
    
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames
                    .filter(cacheName => {
                        return cacheName.startsWith('carwashing-') && 
                               cacheName !== CACHE_NAME && 
                               cacheName !== DATA_CACHE_NAME;
                    })
                    .map(cacheName => {
                        console.log('[ServiceWorker] Deleting old cache:', cacheName);
                        return caches.delete(cacheName);
                    })
            );
        }).then(() => self.clients.claim())
    );
});

// Fetch Event - Network first, then cache strategy for API
self.addEventListener('fetch', (event) => {
    const { request } = event;
    const url = new URL(request.url);

    // Skip non-http requests
    if (!url.protocol.startsWith('http')) {
        return;
    }

    // Handle API requests (Network First strategy)
    if (url.pathname.startsWith('/api/')) {
        event.respondWith(
            fetch(request)
                .then(response => {
                    // Only cache successful responses
                    if (response.status === 200) {
                        const responseToCache = response.clone();
                        
                        caches.open(DATA_CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });
                    }
                    
                    return response;
                })
                .catch(() => {
                    // If network fails, try cache
                    return caches.match(request)
                        .then(response => {
                            if (response) {
                                console.log('[ServiceWorker] Serving API from cache:', request.url);
                                return response;
                            }
                            // Return offline message for API calls
                            return new Response(
                                JSON.stringify({ 
                                    offline: true, 
                                    message: 'Çevrimdışı mod - İnternet bağlantınızı kontrol edin',
                                    timestamp: new Date().toISOString()
                                }),
                                { 
                                    headers: { 'Content-Type': 'application/json' },
                                    status: 503
                                }
                            );
                        });
                })
        );
        return;
    }

    // Handle static resources (Cache First strategy)
    event.respondWith(
        caches.match(request)
            .then(response => {
                if (response) {
                    return response;
                }
                
                return fetch(request)
                    .then(response => {
                        // Don't cache non-successful responses
                        if (!response || response.status !== 200 || response.type !== 'basic') {
                            return response;
                        }
                        
                        const responseToCache = response.clone();
                        
                        caches.open(CACHE_NAME)
                            .then(cache => {
                                cache.put(request, responseToCache);
                            });
                        
                        return response;
                    });
            })
            .catch(() => {
                // Return offline page for navigation requests
                if (request.mode === 'navigate') {
                    return caches.match('/offline.html');
                }
            })
    );
});

// Background Sync for WhatsApp Messages
self.addEventListener('sync', (event) => {
    if (event.tag === 'send-whatsapp-messages') {
        event.waitUntil(sendPendingWhatsAppMessages());
    }
});

async function sendPendingWhatsAppMessages() {
    try {
        const db = await openIndexedDB();
        const tx = db.transaction('pendingMessages', 'readonly');
        const messages = await tx.objectStore('pendingMessages').getAll();
        
        for (const message of messages) {
            try {
                // Generate WhatsApp URL
                const whatsappUrl = `https://wa.me/${message.phone}?text=${encodeURIComponent(message.text)}`;
                
                // Send notification to user
                self.registration.showNotification('WhatsApp Mesajı Hazır', {
                    body: `${message.customerName} için mesaj gönderilmeye hazır`,
                    icon: '/icon-192x192.png',
                    badge: '/badge-72x72.png',
                    actions: [
                        { action: 'send', title: 'Gönder', icon: '/icon-send.png' },
                        { action: 'later', title: 'Daha Sonra', icon: '/icon-later.png' }
                    ],
                    data: { whatsappUrl, messageId: message.id }
                });
                
            } catch (error) {
                console.error('[ServiceWorker] Failed to process message:', error);
            }
        }
    } catch (error) {
        console.error('[ServiceWorker] Background sync failed:', error);
    }
}

// Push Notifications
self.addEventListener('push', (event) => {
    const options = {
        body: event.data ? event.data.text() : 'Yeni bildirim',
        icon: '/icon-192x192.png',
        badge: '/badge-72x72.png',
        vibrate: [100, 50, 100],
        data: {
            dateOfArrival: Date.now(),
            primaryKey: 'notification'
        },
        actions: [
            {
                action: 'view',
                title: 'Görüntüle',
                icon: '/icon-view.png'
            },
            {
                action: 'close',
                title: 'Kapat',
                icon: '/icon-close.png'
            }
        ],
        requireInteraction: true,
        silent: false
    };
    
    event.waitUntil(
        self.registration.showNotification('CarWashing Admin', options)
    );
});

// Notification Click Handler
self.addEventListener('notificationclick', (event) => {
    event.notification.close();
    
    if (event.action === 'send' && event.notification.data.whatsappUrl) {
        // Open WhatsApp URL
        event.waitUntil(
            clients.openWindow(event.notification.data.whatsappUrl)
        );
        
        // Remove from pending messages
        if (event.notification.data.messageId) {
            removeFromPendingMessages(event.notification.data.messageId);
        }
    } else if (event.action === 'view' || !event.action) {
        // Open the app
        event.waitUntil(
            clients.matchAll({ type: 'window' }).then(clientList => {
                for (const client of clientList) {
                    if (client.url === '/' && 'focus' in client) {
                        return client.focus();
                    }
                }
                if (clients.openWindow) {
                    return clients.openWindow('/');
                }
            })
        );
    }
});

// Message from client
self.addEventListener('message', (event) => {
    if (event.data.action === 'skipWaiting') {
        self.skipWaiting();
    } else if (event.data.action === 'queueWhatsApp') {
        queueWhatsAppMessage(event.data.message);
    }
});

// Helper function to open IndexedDB
function openIndexedDB() {
    return new Promise((resolve, reject) => {
        const request = indexedDB.open('CarWashingDB', 1);
        
        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result);
        
        request.onupgradeneeded = (event) => {
            const db = event.target.result;
            
            if (!db.objectStoreNames.contains('pendingMessages')) {
                const store = db.createObjectStore('pendingMessages', { 
                    keyPath: 'id', 
                    autoIncrement: true 
                });
                store.createIndex('timestamp', 'timestamp', { unique: false });
            }
        };
    });
}

// Queue WhatsApp message for offline sending
async function queueWhatsAppMessage(messageData) {
    try {
        const db = await openIndexedDB();
        const tx = db.transaction('pendingMessages', 'readwrite');
        const store = tx.objectStore('pendingMessages');
        
        await store.add({
            ...messageData,
            timestamp: Date.now(),
            retryCount: 0
        });
        
        console.log('[ServiceWorker] WhatsApp message queued for offline sending');
    } catch (error) {
        console.error('[ServiceWorker] Failed to queue message:', error);
    }
}

// Remove message from pending queue
async function removeFromPendingMessages(messageId) {
    try {
        const db = await openIndexedDB();
        const tx = db.transaction('pendingMessages', 'readwrite');
        await tx.objectStore('pendingMessages').delete(messageId);
    } catch (error) {
        console.error('[ServiceWorker] Failed to remove pending message:', error);
    }
}
