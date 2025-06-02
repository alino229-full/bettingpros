"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { BetHistory } from "@/components/history/bet-history"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"
import { ErrorBoundary } from "@/components/error-boundary"
import { BarChart3, TrendingUp } from "lucide-react"

export default function HistoryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-xl font-bold text-primary">BettingTipsPro</span>
            <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
          </div>
        </div>
        <main className="flex-1 container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-12 bg-gray-200 rounded-xl w-80"></div>
            <div className="h-[600px] bg-gray-200 rounded-2xl"></div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <ErrorBoundary>
      <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
        {/* Éléments décoratifs */}
        <div className="fixed inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse"></div>
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-green-200 rounded-full mix-blend-multiply filter blur-xl opacity-30 animate-pulse" style={{ animationDelay: '2s' }}></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-20 animate-pulse" style={{ animationDelay: '4s' }}></div>
        </div>

        <DashboardHeader />
        <main className="flex-1 container mx-auto px-4 py-8 relative ">
          {/* Titre modernisé */}
          <h1 className="text-3xl font-bold mb-6">Historique des paris</h1>
          
          <BetHistory />
        </main>
      </div>
    </ErrorBoundary>
  )
}
