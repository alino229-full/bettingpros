'use client'

import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Download, X, Smartphone, Wifi, WifiOff, RefreshCw } from 'lucide-react'
import { usePWA } from '@/hooks/use-pwa'

export function PWAInstall() {
  const {
    isSupported,
    isInstalled,
    canInstall,
    isOffline,
    installApp,
    updateServiceWorker,
  } = usePWA()

  const handleInstall = async () => {
    const result = await installApp()
    if (result.success) {
      console.log('App installée avec succès')
    } else {
      console.error('Erreur installation:', result.error)
    }
  }

  const handleUpdate = () => {
    updateServiceWorker()
  }

  // Ne pas afficher si pas supporté ou déjà installé
  if (!isSupported || isInstalled || !canInstall) {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 right-4 z-50 md:left-auto md:right-4 md:bottom-4 md:max-w-sm">
      <Card className="border-blue-200 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 dark:border-blue-800 shadow-lg animate-in slide-in-from-bottom-2 duration-500">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-500 text-white rounded-lg">
                <Smartphone className="h-4 w-4" />
              </div>
              <div>
                <CardTitle className="text-sm font-semibold text-blue-900 dark:text-blue-100 flex items-center gap-2">
                  Installer BettingTipsPros
                  {isOffline && <WifiOff className="h-3 w-3 text-orange-500" />}
                  {!isOffline && <Wifi className="h-3 w-3 text-green-500" />}
                </CardTitle>
                <CardDescription className="text-xs text-blue-700 dark:text-blue-300">
                  {isOffline 
                    ? 'Mode hors ligne - Fonctionnalités limitées'
                    : 'Accès rapide depuis votre écran d\'accueil'
                  }
                </CardDescription>
              </div>
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-0">
          <div className="flex gap-2">
            <Button
              onClick={handleInstall}
              size="sm"
              className="flex-1 bg-blue-600 hover:bg-blue-700 text-white"
              disabled={isOffline}
            >
              <Download className="h-4 w-4 mr-2" />
              Installer
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={handleUpdate}
              className="border-blue-300 text-blue-700 hover:bg-blue-200 dark:border-blue-600 dark:text-blue-300 dark:hover:bg-blue-800"
              title="Mettre à jour l'app"
            >
              <RefreshCw className="h-4 w-4" />
            </Button>
          </div>
          
          {/* Avantages PWA */}
          <div className="mt-3 text-xs text-blue-600 dark:text-blue-400">
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>Fonctionne hors ligne</span>
            </div>
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>Notifications push</span>
            </div>
            <div className="flex items-center gap-1">
              <span>•</span>
              <span>Accès rapide</span>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

// Composant de statut PWA pour debug
export function PWAStatus() {
  const pwa = usePWA()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 z-50 bg-black/80 text-white p-2 rounded text-xs">
      <div>PWA Support: {pwa.isSupported ? '✅' : '❌'}</div>
      <div>Installé: {pwa.isInstalled ? '✅' : '❌'}</div>
      <div>Installable: {pwa.isInstallable ? '✅' : '❌'}</div>
      <div>Peut installer: {pwa.canInstall ? '✅' : '❌'}</div>
      <div>Hors ligne: {pwa.isOffline ? '❌' : '✅'}</div>
      <div>SW: {pwa.swRegistration ? '✅' : '❌'}</div>
    </div>
  )
} 