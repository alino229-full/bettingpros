"use client"

import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { DashboardSummary } from "@/components/dashboard/dashboard-summary"
import { RecentBets } from "@/components/dashboard/recent-bets"
import { QuickActions } from "@/components/dashboard/quick-actions"
import { PerformanceChart } from "@/components/dashboard/performance-chart"
import { PWAInstall } from "@/components/ui/pwa-install"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function Dashboard() {
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
        {/* Header skeleton */}
        <div className="bg-white/80 backdrop-blur-sm border-b border-gray-200 sticky top-0 z-10 shadow-sm">
          <div className="container mx-auto px-6 py-4 flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-200 to-green-200 rounded-lg animate-pulse"></div>
              <span className="text-xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                BettingTipsPro
              </span>
            </div>
            <div className="animate-pulse bg-gradient-to-r from-gray-200 to-gray-300 rounded-full h-10 w-10"></div>
          </div>
        </div>
        
        {/* Main content skeleton */}
        <main className="flex-1 container mx-auto px-6 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-10 bg-gradient-to-r from-gray-200 to-gray-300 rounded-xl w-72"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="h-40 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg"></div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <div className="space-y-6">
                <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg"></div>
                <div className="h-80 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg"></div>
              </div>
              <div className="h-96 bg-gradient-to-br from-gray-100 to-gray-200 rounded-2xl shadow-lg"></div>
            </div>
          </div>
        </main>
      </div>
    )
  }

  if (!user) {
    return null // Will redirect to login
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50 relative overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-96 h-96 bg-gradient-to-br from-blue-200/20 to-green-200/20 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-96 h-96 bg-gradient-to-tr from-purple-200/20 to-blue-200/20 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-gradient-to-r from-green-200/10 to-blue-200/10 rounded-full blur-3xl"></div>
      </div>

      <DashboardHeader />
      
      <main className="flex-1 container mx-auto px-6 py-8 relative z-10">
        {/* Header with improved typography */}
        <div className="mb-8">
          <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-gray-900 via-blue-800 to-green-800 bg-clip-text text-transparent mb-2">
            Tableau de bord
          </h1>
          <p className="text-lg text-gray-600 font-medium">
            Suivez vos performances et optimisez vos stratégies de paris
          </p>
        </div>

        {/* Stats cards with enhanced spacing */}
        <div className="mb-10">
          <DashboardSummary />
        </div>

        {/* Main content grid with improved layout */}
        <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
          {/* Left column - 2/3 width */}
          <div className="xl:col-span-2 space-y-8">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6">
              <QuickActions />
            </div>
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-0 md:p-6">
              <RecentBets />
            </div>
          </div>
          
          {/* Right column - 1/3 width */}
          <div className="xl:col-span-1">
            <div className="bg-white/60 backdrop-blur-sm rounded-2xl shadow-lg border border-white/20 p-6 h-fit">
              <PerformanceChart />
            </div>
          </div>
        </div>
      </main>

      {/* PWA Install prompt */}
      <PWAInstall />
    </div>
  )
}
