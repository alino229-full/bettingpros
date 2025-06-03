import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'BettingTipsPros - Suivi de Paris Sportifs',
    short_name: 'BettingTips',
    description: 'Application PWA de suivi et d\'analyse de paris sportifs avec intelligence artificielle',
    start_url: '/',
    display: 'standalone',
    background_color: '#ffffff',
    theme_color: '#1E88E5',
    orientation: 'portrait-primary',
    scope: '/',
    lang: 'fr',
    categories: ['sports', 'finance', 'productivity'],
    icons: [
      {
        src: '/web-app-manifest-192x192.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any'
      },
      {
        src: '/web-app-manifest-512x512.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any'
      },
    ],
    shortcuts: [
      {
        name: 'Nouveau pari',
        short_name: 'Capture',
        description: 'Scanner un nouveau ticket de pari',
        url: '/capture',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Historique',
        short_name: 'Historique',
        description: 'Voir l\'historique des paris',
        url: '/history',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
      {
        name: 'Analyses',
        short_name: 'Stats',
        description: 'Consulter les analyses de performance',
        url: '/analysis',
        icons: [
          {
            src: '/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
          },
        ],
      },
    ],
  }
} 