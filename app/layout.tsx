import type React from "react"
import "@/app/globals.css"
import { Inter } from "next/font/google"
import { ThemeProvider } from "@/components/theme-provider"
import { AuthProvider } from "@/components/auth/auth-provider"
import { createServerClient } from "@/lib/supabase/server"
import type { Metadata, Viewport } from 'next'

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "BettingTipsPros - Suivi de Paris Sportifs",
  description: "Application PWA de suivi et d'analyse de paris sportifs avec intelligence artificielle",
  generator: 'Next.js',
  manifest: '/manifest.json',
  keywords: ['paris sportifs', 'analyse', 'IA', 'statistiques', 'bookmaker', 'cotes'],
  authors: [
    { name: 'BettingTipsPros' }
  ],
  creator: 'BettingTipsPros',
  publisher: 'BettingTipsPros',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    type: 'website',
    siteName: 'BettingTipsPros',
    title: {
      default: 'BettingTipsPros - Suivi de Paris Sportifs',
      template: '%s | BettingTipsPros'
    },
    description: 'Application PWA de suivi et d\'analyse de paris sportifs avec intelligence artificielle',
    images: [
      {
        url: '/web-app-manifest-512x512.png',
        width: 512,
        height: 512,
        alt: 'BettingTipsPros Logo',
      }
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'BettingTipsPros - Suivi de Paris Sportifs',
    description: 'Application PWA de suivi et d\'analyse de paris sportifs avec intelligence artificielle',
    images: ['/web-app-manifest-512x512.png'],
  },
  icons: {
    icon: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
    apple: [
      { url: '/web-app-manifest-192x192.png', sizes: '192x192', type: 'image/png' },
    ],
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'BettingTipsPros',
  },
  verification: {
    google: 'google-site-verification-token',
  },
}

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#1E88E5' },
    { media: '(prefers-color-scheme: dark)', color: '#1565C0' },
  ],
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  userScalable: true,
  viewportFit: 'cover',
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
