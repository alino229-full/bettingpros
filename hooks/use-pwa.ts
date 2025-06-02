'use client'

import { useState, useEffect } from 'react'

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[]
  readonly userChoice: Promise<{
    outcome: 'accepted' | 'dismissed'
    platform: string
  }>
  prompt(): Promise<void>
}

declare global {
  interface WindowEventMap {
    beforeinstallprompt: BeforeInstallPromptEvent
  }
}

interface PWAStatus {
  isSupported: boolean
  isInstalled: boolean
  isInstallable: boolean
  canInstall: boolean
  isOffline: boolean
  swRegistration: ServiceWorkerRegistration | null
  installPrompt: BeforeInstallPromptEvent | null
}

export function usePWA() {
  const [status, setStatus] = useState<PWAStatus>({
    isSupported: false,
    isInstalled: false,
    isInstallable: false,
    canInstall: false,
    isOffline: false,
    swRegistration: null,
    installPrompt: null,
  })

  // Fonctions utilitaires
  const checkIfInstalled = () => {
    if (typeof window === 'undefined') return false
    return window.matchMedia('(display-mode: standalone)').matches ||
           (window.navigator as any).standalone ||
           document.referrer.includes('android-app://')
  }

  const checkIfSupported = () => {
    if (typeof window === 'undefined') return false
    return 'serviceWorker' in navigator && 'PushManager' in window
  }

  const checkIfOffline = () => {
    if (typeof window === 'undefined') return false
    return !navigator.onLine
  }

  // Enregistrement du Service Worker
  const registerServiceWorker = async () => {
    if (!checkIfSupported()) return null

    try {
      const registration = await navigator.serviceWorker.register('/sw.js', {
        scope: '/',
        updateViaCache: 'none',
      })

      console.log('Service Worker enregistré:', registration)
      
      setStatus(prev => ({
        ...prev,
        swRegistration: registration,
      }))

      return registration
    } catch (error) {
      console.error('Erreur lors de l\'enregistrement du Service Worker:', error)
      return null
    }
  }

  // Installation de l'app
  const installApp = async () => {
    if (!status.installPrompt) return { success: false, error: 'Pas de prompt disponible' }

    try {
      await status.installPrompt.prompt()
      const { outcome } = await status.installPrompt.userChoice

      if (outcome === 'accepted') {
        setStatus(prev => ({
          ...prev,
          installPrompt: null,
          canInstall: false,
          isInstalled: true,
        }))
        return { success: true, outcome }
      } else {
        return { success: false, outcome }
      }
    } catch (error) {
      console.error('Erreur lors de l\'installation:', error)
      return { success: false, error: error instanceof Error ? error.message : 'Erreur inconnue' }
    }
  }

  // Mise à jour du Service Worker
  const updateServiceWorker = async () => {
    if (!status.swRegistration) return

    try {
      await status.swRegistration.update()
      console.log('Service Worker mis à jour')
    } catch (error) {
      console.error('Erreur lors de la mise à jour du Service Worker:', error)
    }
  }

  // Désinstallation du Service Worker
  const unregisterServiceWorker = async () => {
    if (!status.swRegistration) return

    try {
      await status.swRegistration.unregister()
      setStatus(prev => ({
        ...prev,
        swRegistration: null,
      }))
      console.log('Service Worker désinstallé')
    } catch (error) {
      console.error('Erreur lors de la désinstallation du Service Worker:', error)
    }
  }

  // Vérification du statut PWA
  const refreshPWAStatus = () => {
    setStatus(prev => ({
      ...prev,
      isSupported: checkIfSupported(),
      isInstalled: checkIfInstalled(),
      isOffline: checkIfOffline(),
    }))
  }

  // Effects
  useEffect(() => {
    if (typeof window === 'undefined') return

    // Statut initial
    setStatus({
      isSupported: checkIfSupported(),
      isInstalled: checkIfInstalled(),
      isInstallable: false,
      canInstall: false,
      isOffline: checkIfOffline(),
      swRegistration: null,
      installPrompt: null,
    })

    // Enregistrer le Service Worker
    if (checkIfSupported()) {
      registerServiceWorker()
    }

    // Événements PWA
    const handleBeforeInstallPrompt = (e: BeforeInstallPromptEvent) => {
      e.preventDefault()
      setStatus(prev => ({
        ...prev,
        installPrompt: e,
        isInstallable: true,
        canInstall: !prev.isInstalled,
      }))
    }

    const handleAppInstalled = () => {
      setStatus(prev => ({
        ...prev,
        isInstalled: true,
        installPrompt: null,
        canInstall: false,
      }))
    }

    const handleOnline = () => {
      setStatus(prev => ({ ...prev, isOffline: false }))
    }

    const handleOffline = () => {
      setStatus(prev => ({ ...prev, isOffline: true }))
    }

    // Écouter les événements
    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
    window.addEventListener('appinstalled', handleAppInstalled)
    window.addEventListener('online', handleOnline)
    window.addEventListener('offline', handleOffline)

    // Nettoyage
    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt)
      window.removeEventListener('appinstalled', handleAppInstalled)
      window.removeEventListener('online', handleOnline)
      window.removeEventListener('offline', handleOffline)
    }
  }, [])

  return {
    ...status,
    installApp,
    updateServiceWorker,
    unregisterServiceWorker,
    refreshPWAStatus,
    registerServiceWorker,
  }
} 