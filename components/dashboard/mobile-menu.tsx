"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { 
  X, 
  Home, 
  Camera, 
  History, 
  BarChart3, 
  Settings, 
  LogOut, 
  User,
  TrendingUp,
  Bell,
  ChevronRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCurrency } from "@/hooks/use-user-currency"

interface MobileMenuProps {
  isOpen: boolean
  onClose: () => void
}

const navigationItems = [
  {
    href: "/",
    label: "Tableau de bord",
    icon: Home,
    description: "Vue d'ensemble de vos performances"
  },
  {
    href: "/capture",
    label: "Nouveau pari",
    icon: Camera,
    description: "Scanner un ticket de pari"
  },
  {
    href: "/history",
    label: "Historique",
    icon: History,
    description: "Tous vos paris passés"
  },
  {
    href: "/analysis",
    label: "Analyses",
    icon: BarChart3,
    description: "Statistiques et insights"
  },
  {
    href: "/settings",
    label: "Paramètres",
    icon: Settings,
    description: "Configuration du compte"
  }
]

export function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const { user, profile, signOut } = useAuth()
  const { currency } = useUserCurrency()
  const pathname = usePathname()
  const router = useRouter()
  const [mounted, setMounted] = useState(false)
  const [animateItems, setAnimateItems] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
      // Délai pour l'animation des éléments
      setTimeout(() => setAnimateItems(true), 100)
    } else {
      document.body.style.overflow = 'unset'
      setAnimateItems(false)
    }

    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])

  // Fermer le menu quand l'URL change
  useEffect(() => {
    if (isOpen) {
      handleClose()
    }
  }, [pathname])

  // Fermer avec la touche Échap
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape' && isOpen) {
        handleClose()
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isOpen])

  const handleSignOut = async () => {
    await signOut()
    onClose()
    router.push("/auth/login")
  }

  const handleNavigation = (href: string) => {
    router.push(href)
    onClose()
  }

  const handleClose = () => {
    setAnimateItems(false)
    setTimeout(onClose, 150)
  }

  if (!mounted || !user) return null

  return (
    <>
      {/* Overlay */}
      <div 
        className={`fixed inset-0 bg-black/50 backdrop-blur-sm z-50 transition-opacity duration-300 ${
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        }`}
        onClick={handleClose}
      />

      {/* Menu Drawer */}
      <div 
        className={`fixed top-0 left-0 h-full w-80 bg-white shadow-2xl z-50 transform transition-transform duration-300 ease-out ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-green-600 p-6 text-white">
          <div className={`flex items-center justify-between mb-4 transition-all duration-500 delay-100 ${
            animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <TrendingUp className="w-4 h-4 text-white" />
              </div>
              <span className="text-lg font-bold">BettingTipsPro</span>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={handleClose}
              className="text-white hover:bg-white/20 rounded-xl"
            >
              <X className="h-5 w-5" />
            </Button>
          </div>

          {/* User Info */}
          <div className={`flex items-center space-x-3 transition-all duration-500 delay-200 ${
            animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-4'
          }`}>
            <Avatar className="h-12 w-12 border-2 border-white/30">
              <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
              <AvatarFallback className="bg-white/20 text-white font-semibold">
                {profile?.full_name
                  ? profile.full_name
                      .split(" ")
                      .map((n) => n[0])
                      .join("")
                      .toUpperCase()
                  : user.email?.[0].toUpperCase()}
              </AvatarFallback>
            </Avatar>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">
                {profile?.full_name || "Utilisateur"}
              </p>
              <p className="text-xs text-white/80 truncate">{user.email}</p>
              <p className="text-xs text-white/60 mt-1">Devise: {currency}</p>
            </div>
          </div>
        </div>

        {/* Navigation */}
        <div className="flex-1 py-6 overflow-y-auto">
          <div className="space-y-2 px-4">
            {navigationItems.map((item, index) => {
              const isActive = pathname === item.href
              const Icon = item.icon

              return (
                <button
                  key={item.href}
                  onClick={() => handleNavigation(item.href)}
                  className={`w-full flex items-center justify-between p-4 rounded-xl transition-all duration-500 text-left group ${
                    isActive
                      ? 'bg-gradient-to-r from-blue-50 to-green-50 border border-blue-200 text-blue-700'
                      : 'hover:bg-gray-50 text-gray-700'
                  } ${
                    animateItems 
                      ? 'opacity-100 translate-x-0' 
                      : 'opacity-0 -translate-x-4'
                  }`}
                  style={{ 
                    transitionDelay: animateItems ? `${300 + index * 100}ms` : '0ms'
                  }}
                >
                  <div className="flex items-center space-x-4">
                    <div className={`p-2 rounded-lg transition-colors ${
                      isActive 
                        ? 'bg-gradient-to-r from-blue-500 to-green-500 text-white' 
                        : 'bg-gray-100 text-gray-600 group-hover:bg-gray-200'
                    }`}>
                      <Icon className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="font-medium">{item.label}</p>
                      <p className="text-xs text-gray-500 mt-1">{item.description}</p>
                    </div>
                  </div>
                  <ChevronRight className={`w-4 h-4 transition-transform ${
                    isActive ? 'text-blue-600' : 'text-gray-400'
                  }`} />
                </button>
              )
            })}
          </div>

          {/* Notifications Section */}
          <div className={`mx-4 mt-6 p-4 bg-amber-50 border border-amber-200 rounded-xl transition-all duration-500 delay-700 ${
            animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-amber-100 rounded-lg">
                <Bell className="w-4 h-4 text-amber-600" />
              </div>
              <div className="flex-1">
                <p className="text-sm font-medium text-amber-800">Notifications</p>
                <p className="text-xs text-amber-600">3 nouvelles notifications</p>
              </div>
              <div className="w-2 h-2 bg-amber-500 rounded-full animate-pulse"></div>
            </div>
          </div>

          {/* User Actions */}
          <div className={`mx-4 mt-6 pt-6 border-t border-gray-200 space-y-2 transition-all duration-500 delay-800 ${
            animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
          }`}>
            <button
              onClick={() => handleNavigation('/settings')}
              className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-gray-50 transition-colors text-left"
            >
              <div className="p-2 bg-gray-100 rounded-lg">
                <User className="w-4 h-4 text-gray-600" />
              </div>
              <span className="text-gray-700 font-medium">Mon profil</span>
            </button>
            
            <button
              onClick={handleSignOut}
              className="w-full flex items-center space-x-4 p-3 rounded-xl hover:bg-red-50 transition-colors text-left"
            >
              <div className="p-2 bg-red-100 rounded-lg">
                <LogOut className="w-4 h-4 text-red-600" />
              </div>
              <span className="text-red-700 font-medium">Se déconnecter</span>
            </button>
          </div>
        </div>

        {/* Footer */}
        <div className={`p-4 border-t border-gray-200 bg-gray-50 transition-all duration-500 delay-900 ${
          animateItems ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'
        }`}>
          <div className="text-center">
            <p className="text-xs text-gray-500">BettingTipsPro v2.0</p>
            <p className="text-xs text-gray-400 mt-1">Optimisez vos stratégies de paris</p>
          </div>
        </div>
      </div>
    </>
  )
} 