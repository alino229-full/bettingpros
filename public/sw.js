// Service Worker pour BettingTipsPros PWA - Version Optimisée
const CACHE_NAME = 'bettingtipspros-v3'
const STATIC_CACHE_NAME = 'bettingtipspros-static-v3'

// URLs statiques à mettre en cache
const staticAssets = [
  '/',
  '/web-app-manifest-192x192.png',
  '/web-app-manifest-512x512.png'
]

// Fonction pour vérifier si une requête peut être mise en cache
const canCacheRequest = (request) => {
  const url = new URL(request.url)
  
  // Exclure les requêtes non-GET
  if (request.method !== 'GET') return false
  
  // Exclure les APIs externes et internes
  if (url.pathname.startsWith('/api/') || 
      url.hostname.includes('supabase.co') ||
      url.hostname.includes('googleapis.com') ||
      url.hostname.includes('gstatic.com')) {
    return false
  }
  
  // Exclure les chunks Next.js dynamiques (ils changent souvent)
  if (url.pathname.includes('/_next/static/chunks/') ||
      url.pathname.includes('/_next/static/webpack/') ||
      url.pathname.includes('.hot-update.')) {
    return false
  }
  
  // Permettre seulement les ressources statiques et pages
  return url.pathname.startsWith('/_next/static/') ||
         url.pathname.endsWith('.png') ||
         url.pathname.endsWith('.jpg') ||
         url.pathname.endsWith('.jpeg') ||
         url.pathname.endsWith('.svg') ||
         url.pathname.endsWith('.ico') ||
         url.pathname.endsWith('.css') ||
         !url.pathname.includes('.')
}

// Installation du Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE_NAME)
      .then((cache) => cache.addAll(staticAssets))
      .then(() => self.skipWaiting())
      .catch((error) => {
        console.error('Erreur lors de l\'installation du SW:', error)
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          // Supprimer les anciens caches
          if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE_NAME) {
            console.log('Suppression de l\'ancien cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
    }).then(() => self.clients.claim())
  )
})

// Stratégie de cache intelligente
self.addEventListener('fetch', (event) => {
  const request = event.request
  
  // Ignorer les requêtes qui ne peuvent pas être mises en cache
  if (!canCacheRequest(request)) {
    return
  }

  event.respondWith(
    caches.match(request)
      .then((cachedResponse) => {
        // Si on a une réponse en cache pour les assets statiques, la retourner
        if (cachedResponse && request.url.includes('/_next/static/')) {
          return cachedResponse
        }
        
        // Pour les autres ressources, essayer le réseau d'abord
        return fetch(request)
          .then((networkResponse) => {
            // Si la réponse réseau est valide, la mettre en cache
            if (networkResponse && networkResponse.status === 200) {
              const responseClone = networkResponse.clone()
              
              caches.open(CACHE_NAME).then((cache) => {
                cache.put(request, responseClone)
              })
            }
            
            return networkResponse
          })
          .catch(() => {
            // En cas d'erreur réseau, retourner le cache si disponible
            if (cachedResponse) {
              return cachedResponse
            }
            
            // Fallback pour les pages
            if (request.destination === 'document') {
              return caches.match('/')
            }
            
            throw new Error('No cached response available')
          })
      })
  )
})

// Gestion des notifications push
self.addEventListener('push', (event) => {
  if (event.data) {
    const data = event.data.json()
    const options = {
      body: data.body,
      icon: '/web-app-manifest-192x192.png',
      badge: '/web-app-manifest-192x192.png',
      vibrate: [100, 50, 100],
      data: {
        dateOfArrival: Date.now(),
        primaryKey: '1'
      }
    }
    event.waitUntil(
      self.registration.showNotification(data.title, options)
    )
  }
})

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    clients.openWindow('/')
  )
})

console.log('Service Worker BettingTipsPros v3 chargé') 