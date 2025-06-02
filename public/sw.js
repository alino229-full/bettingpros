// Service Worker pour BettingTipsPros PWA - Next.js 15
const CACHE_NAME = 'bettingtipspros-v1'
const urlsToCache = [
  '/',
  '/capture',
  '/history',
  '/analysis',
  '/settings',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png',
]

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => cache.addAll(urlsToCache))
  )
  self.skipWaiting()
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName)
          }
        })
      )
    })
  )
  self.clients.claim()
})

// Stratégie de cache
self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((response) => {
        // Retourner la réponse mise en cache si elle existe
        if (response) {
          return response
        }
        
        // Sinon, récupérer depuis le réseau
        return fetch(event.request).then(
          (response) => {
            // Vérifier si nous avons reçu une réponse valide
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response
            }

            // Cloner la réponse
            const responseToCache = response.clone()

            caches.open(CACHE_NAME)
              .then((cache) => {
                cache.put(event.request, responseToCache)
              })

            return response
          }
        )
      })
      .catch(() => {
        // Page offline de fallback
        if (event.request.destination === 'document') {
          return caches.match('/offline.html')
        }
      })
  )
})

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: data.icon || '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: data.primaryKey || '1',
        url: data.url || '/',
      },
      actions: [
        {
          action: 'open',
          title: 'Ouvrir l\'app',
          icon: '/web-app-manifest-192x192.png'
        },
        {
          action: 'close',
          title: 'Fermer',
          icon: '/web-app-manifest-192x192.png'
        }
      ],
      tag: 'betting-notification',
      renotify: true,
    }
    
    event.waitUntil(
      self.registration.showNotification(data.title || 'BettingTipsPros', options)
    )
  }
})

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('Notification click received.')
  
  event.notification.close()

  if (event.action === 'close') {
    return
  }

  const urlToOpen = event.notification.data?.url || '/'
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true })
      .then((windowClients) => {
        // Chercher une fenêtre déjà ouverte
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus()
          }
        }
        
        // Ouvrir une nouvelle fenêtre si aucune n'est trouvée
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen)
        }
      })
  )
})

// Synchronisation en arrière-plan (optionnel)
self.addEventListener('sync', (event) => {
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Logique de synchronisation des données
      console.log('Background sync triggered')
    )
  }
}) 