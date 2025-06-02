"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { User } from "@supabase/supabase-js"
import type { Profile } from "@/lib/types/database"

interface AuthContextType {
  user: User | null
  profile: Profile | null
  loading: boolean
  signOut: () => Promise<void>
  refreshUser: () => Promise<void>
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ 
  children, 
  initialUser = null, 
  initialProfile = null 
}: { 
  children: React.ReactNode
  initialUser?: User | null
  initialProfile?: Profile | null
}) {
  const [user, setUser] = useState<User | null>(initialUser)
  const [profile, setProfile] = useState<Profile | null>(initialProfile)
  const [loading, setLoading] = useState(!initialUser) // Si on a un user initial, pas de loading
  const supabase = createClient()

  const refreshUser = async () => {
    try {
      const { data: { user: currentUser } } = await supabase.auth.getUser()
      setUser(currentUser)
      
      if (currentUser) {
        // Fetch du profil via une action serveur
        const response = await fetch('/api/auth/profile')
        if (response.ok) {
          const profileData = await response.json()
          setProfile(profileData)
        }
      } else {
        setProfile(null)
      }
    } catch (error) {
      console.error("Erreur refresh user:", error)
    }
  }

  const signOut = async () => {
    try {
      await supabase.auth.signOut()
      setUser(null)
      setProfile(null)
      // Redirection handled by middleware
      window.location.href = '/auth/login'
    } catch (error) {
      console.error("Erreur déconnexion:", error)
    }
  }

  useEffect(() => {
    // Si on n'a pas d'utilisateur initial, on charge
    if (!initialUser && loading) {
      refreshUser().finally(() => setLoading(false))
    }

    // Écouter les changements d'authentification
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event: string, session: any) => {
      if (event === 'SIGNED_IN' && session?.user) {
        setUser(session.user)
        // Fetch du profil via l'API
        try {
          const response = await fetch('/api/auth/profile')
          if (response.ok) {
            const profileData = await response.json()
            setProfile(profileData)
          }
        } catch (error) {
          console.error("Erreur chargement profil:", error)
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        setProfile(null)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [initialUser, loading, supabase.auth])

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
