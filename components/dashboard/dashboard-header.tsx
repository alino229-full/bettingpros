"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Bell, Menu, User, LogOut, TrendingUp } from "lucide-react"
import { Button } from "@/components/ui/button"
import { useAuth } from "@/components/auth/auth-provider"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useRouter, usePathname } from "next/navigation"
import { MobileMenu } from "./mobile-menu"

export function DashboardHeader() {
  const { user, profile, signOut, loading } = useAuth()
  const router = useRouter()
  const pathname = usePathname()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    router.push("/auth/login")
  }

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen)
  }

  // Raccourci clavier pour ouvrir le menu mobile
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + M pour ouvrir le menu mobile
      if ((event.ctrlKey || event.metaKey) && event.key === 'm' && !isMobileMenuOpen) {
        event.preventDefault()
        setIsMobileMenuOpen(true)
      }
    }

    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [isMobileMenuOpen])

  if (loading) {
    return (
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg animate-pulse"></div>
            <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
              BettingTipsPro
            </span>
          </div>
          <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-10 w-10"></div>
        </div>
      </header>
    )
  }

  if (!user) {
    router.push("/auth/login")
    return null
  }

  return (
    <>
      <header className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-40 shadow-sm">
        <div className="container mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
          <div className="flex items-center">
            <Button 
              variant="ghost" 
              size="icon" 
              className={`md:hidden mr-3 rounded-xl transition-all duration-200 relative group ${
                isMobileMenuOpen 
                  ? 'bg-blue-100 text-blue-600 shadow-sm' 
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
              onClick={toggleMobileMenu}
              title="Ouvrir le menu (Ctrl+M)"
            >
              <Menu className={`h-5 w-5 transition-transform duration-200 ${
                isMobileMenuOpen ? 'rotate-90' : 'rotate-0'
              }`} />
              <span className="sr-only">Menu</span>
              
              {/* Tooltip pour le raccourci - masqué quand le menu est ouvert */}
              {!isMobileMenuOpen && (
                <div className="absolute -top-12 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap">
                  Ctrl+M
                </div>
              )}
            </Button>
            <Link href="/" className="flex items-center space-x-3 group">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center group-hover:scale-105 transition-transform duration-200 shadow-lg">
                <TrendingUp className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                BettingTipsPro
              </span>
            </Link>
          </div>

          {/* Desktop Navigation - Hidden on mobile */}
          <nav className="hidden lg:flex items-center space-x-6">
            <Link 
              href="/capture" 
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname === '/capture'
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>Nouveau pari</span>
              {pathname === '/capture' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/history" 
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname === '/history'
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>Historique</span>
              {pathname === '/history' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
            <Link 
              href="/analysis" 
              className={`relative flex items-center space-x-2 px-3 py-2 rounded-lg transition-all duration-200 font-medium ${
                pathname === '/analysis'
                  ? 'bg-blue-50 text-blue-600 shadow-sm'
                  : 'text-gray-700 hover:text-blue-600 hover:bg-blue-50'
              }`}
            >
              <span>Analyses</span>
              {pathname === '/analysis' && (
                <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-1.5 h-1.5 bg-blue-600 rounded-full"></div>
              )}
            </Link>
          </nav>

          <div className="flex items-center gap-3">
            <Button variant="ghost" size="icon" className="relative hover:bg-gray-100 rounded-xl transition-all duration-200">
              <Bell className="h-5 w-5 text-gray-600" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-gradient-to-r from-red-500 to-orange-500 rounded-full animate-pulse"></div>
              <span className="sr-only">Notifications</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-10 w-10 rounded-xl hover:bg-gray-100 transition-all duration-200">
                  <Avatar className="h-9 w-9">
                    <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                    <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                      {profile?.full_name
                        ? profile.full_name
                            .split(" ")
                            .map((n) => n[0])
                            .join("")
                            .toUpperCase()
                        : user.email?.[0].toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-64 bg-white border border-gray-200 shadow-xl" align="end" forceMount>
                <DropdownMenuLabel className="font-normal p-4">
                  <div className="flex flex-col space-y-2">
                    <div className="flex items-center space-x-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={profile?.avatar_url || ""} alt={profile?.full_name || ""} />
                        <AvatarFallback className="bg-gradient-to-r from-blue-500 to-green-500 text-white font-semibold">
                          {profile?.full_name
                            ? profile.full_name
                                .split(" ")
                                .map((n) => n[0])
                                .join("")
                                .toUpperCase()
                            : user.email?.[0].toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="text-sm font-semibold text-gray-900">{profile?.full_name || "Utilisateur"}</p>
                        <p className="text-xs text-gray-500">{user.email}</p>
                      </div>
                    </div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild className="hover:bg-blue-50 cursor-pointer transition-colors duration-200">
                  <Link href="/settings" className="flex items-center px-4 py-3">
                    <User className="mr-3 h-4 w-4 text-blue-600" />
                    <span className="text-gray-700">Profil</span>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem 
                  onClick={handleSignOut} 
                  className="hover:bg-red-50 cursor-pointer transition-colors duration-200 px-4 py-3"
                >
                  <LogOut className="mr-3 h-4 w-4 text-red-600" />
                  <span className="text-gray-700">Se déconnecter</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </header>

      {/* Mobile Menu */}
      <MobileMenu 
        isOpen={isMobileMenuOpen} 
        onClose={() => setIsMobileMenuOpen(false)} 
      />
    </>
  )
}
