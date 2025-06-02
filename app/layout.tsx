import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { createServerClient } from "@/lib/supabase/server"

const inter = Inter({ subsets: ["latin"] })

export const metadata = {
  title: "BettingTipsPro - Suivi de Paris Sportifs",
  description: "Application de suivi et d'analyse de paris sportifs",
  generator: 'v0.dev'
}

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  // Récupération SSR de l'utilisateur et du profil
  const supabase = await createServerClient()
  
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()
    profile = data
  }

  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthProvider initialUser={user} initialProfile={profile}>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
