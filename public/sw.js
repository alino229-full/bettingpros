// Service Worker pour BettingTipsPros PWA - Next.js 15 - Version 2.0
const CACHE_NAME = 'bettingtipspros-v2'
const STATIC_CACHE = 'bettingtipspros-static-v2'
const DYNAMIC_CACHE = 'bettingtipspros-dynamic-v2'

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
  console.log('SW: Installing new version')
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('SW: Caching static resources')
        return cache.addAll(urlsToCache)
      })
      .then(() => {
        console.log('SW: Static resources cached')
        return self.skipWaiting()
      })
  )
})

// Activation du Service Worker
self.addEventListener('activate', (event) => {
  console.log('SW: Activating new version')
  
  event.waitUntil(
    Promise.all([
      // Nettoyer tous les anciens caches
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
            if (![STATIC_CACHE, DYNAMIC_CACHE].includes(cacheName)) {
              console.log('SW: Deleting old cache:', cacheName)
            return caches.delete(cacheName)
          }
        })
      )
      }),
      // Prendre le contrôle immédiatement
      self.clients.claim()
    ])
  )
})

// Fonction pour vérifier si une requête peut être mise en cache
function canCacheRequest(request) {
  // Ne cacher que les requêtes GET
  if (request.method !== 'GET') {
    return false
  }
  
  // Ne pas cacher les requêtes vers les APIs (Supabase, etc.)
  if (request.url.includes('/api/') || 
      request.url.includes('/auth/') ||
      request.url.includes('supabase.co') ||
      request.url.includes('googleapis.com')) {
    return false
  }
  
  // Ne pas cacher les requêtes vers des domaines externes
  try {
    const url = new URL(request.url)
    const origin = new URL(self.location.origin)
    if (url.origin !== origin.origin) {
      return false
    }
  } catch (e) {
    return false
  }
  
  // Ne pas cacher les requêtes avec des paramètres de recherche dynamiques
  const url = new URL(request.url)
  if (url.search && (
    url.search.includes('timestamp') || 
    url.search.includes('_rsc') ||
    url.search.includes('_next')
  )) {
    return false
  }
  
  return true
}

// Fonction pour déterminer la stratégie de cache
function getCacheStrategy(request) {
  const url = new URL(request.url)
  
  // Pages statiques: Cache First
  if (url.pathname === '/' || 
      url.pathname.startsWith('/capture') ||
      url.pathname.startsWith('/history') ||
      url.pathname.startsWith('/analysis') ||
      url.pathname.startsWith('/settings')) {
    return 'cacheFirst'
  }
  
  // Assets statiques: Cache First
  if (url.pathname.endsWith('.png') ||
      url.pathname.endsWith('.jpg') ||
      url.pathname.endsWith('.jpeg') ||
      url.pathname.endsWith('.ico') ||
      url.pathname.endsWith('.css') ||
      url.pathname.endsWith('.js')) {
    return 'cacheFirst'
  }
  
  // Par défaut: Network First
  return 'networkFirst'
}

// Stratégie Cache First
async function cacheFirst(request) {
  const cache = await caches.open(STATIC_CACHE)
  const cachedResponse = await cache.match(request)
  
  if (cachedResponse) {
    return cachedResponse
  }
  
  try {
    const networkResponse = await fetch(request)
    if (networkResponse.ok && canCacheRequest(request)) {
      cache.put(request, networkResponse.clone())
    }
    return networkResponse
  } catch (error) {
    console.warn('SW: Cache First failed for:', request.url)
    throw error
  }
}

// Stratégie Network First
async function networkFirst(request) {
  const cache = await caches.open(DYNAMIC_CACHE)
  
  try {
    const networkResponse = await fetch(request)
    
    if (networkResponse.ok && canCacheRequest(request)) {
      cache.put(request, networkResponse.clone())
    }
    
    return networkResponse
  } catch (error) {
    console.warn('SW: Network failed, trying cache for:', request.url)
    const cachedResponse = await cache.match(request)
    
    if (cachedResponse) {
      return cachedResponse
    }
    
    throw error
  }
}

// Stratégie de cache principal
self.addEventListener('fetch', (event) => {
  // Ignorer complètement les requêtes non-GET
  if (event.request.method !== 'GET') {
    return
  }

  // Ignorer les requêtes internes Next.js
  if (event.request.url.includes('_next/static') ||
      event.request.url.includes('__nextjs') ||
      event.request.url.includes('_devtools')) {
    return
  }

  const strategy = getCacheStrategy(event.request)
  
  event.respondWith(
    (async () => {
      try {
        if (strategy === 'cacheFirst') {
          return await cacheFirst(event.request)
        } else {
          return await networkFirst(event.request)
        }
      } catch (error) {
        console.warn('SW: All strategies failed for:', event.request.url)
        
        // Fallback pour les documents
        if (event.request.destination === 'document') {
          const cache = await caches.open(STATIC_CACHE)
          const fallback = await cache.match('/')
          
          if (fallback) {
            return fallback
          }
          
          return new Response(`
            <!DOCTYPE html>
            <html>
              <head>
                <title>Hors ligne - BettingTipsPros</title>
                <meta charset="utf-8">
                <meta name="viewport" content="width=device-width, initial-scale=1">
                <style>
                  body { font-family: system-ui; text-align: center; padding: 2rem; }
                  .container { max-width: 400px; margin: 0 auto; }
                  .icon { font-size: 4rem; margin-bottom: 1rem; }
                </style>
              </head>
              <body>
                <div class="container">
                  <div class="icon">📱</div>
                  <h1>Vous êtes hors ligne</h1>
                  <p>Vérifiez votre connexion internet et rechargez la page.</p>
                </div>
              </body>
            </html>
          `, {
            status: 200,
            statusText: 'OK',
            headers: new Headers({
              'Content-Type': 'text/html; charset=utf-8'
            })
          })
        }
        
        // Pour les autres ressources, retourner une erreur
        return new Response('Ressource non disponible hors ligne', {
          status: 503,
          statusText: 'Service Unavailable'
        })
      }
    })()
  )
})

// Gestion des notifications push
self.addEventListener('push', (event) => {
  console.log('SW: Push notification received')
  
  if (event.data) {
    try {
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
            title: 'Ouvrir',
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
    } catch (error) {
      console.error('SW: Error showing notification:', error)
    }
  }
})

// Gestion des clics sur notifications
self.addEventListener('notificationclick', (event) => {
  console.log('SW: Notification click received')
  
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
          if (client.url.includes(urlToOpen) && 'focus' in client) {
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

// Synchronisation en arrière-plan
self.addEventListener('sync', (event) => {
  console.log('SW: Background sync triggered:', event.tag)
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Logique de synchronisation des données
      Promise.resolve().then(() => {
        console.log('SW: Background sync completed')
      })
    )
  }
})

// Gestion des messages depuis l'app
self.addEventListener('message', (event) => {
  console.log('SW: Message received:', event.data)
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting()
  }
  
  if (event.data && event.data.type === 'GET_VERSION') {
    event.ports[0].postMessage({ version: 'v2' })
  }
}) 