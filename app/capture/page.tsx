"use client"

import { BetCapture } from "@/components/capture/bet-capture"
import { OcrStats } from "@/components/capture/ocr-stats"
import { OcrTips } from "@/components/capture/ocr-tips"
import { DashboardHeader } from "@/components/dashboard/dashboard-header"
import { useAuth } from "@/components/auth/auth-provider"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function CapturePage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login")
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="flex flex-col min-h-screen">
        <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
          <div className="container mx-auto px-4 py-3 flex items-center justify-between">
            <span className="text-xl font-bold text-primary">BettingTipsPro</span>
            <div className="animate-pulse bg-gray-200 rounded-full h-8 w-8"></div>
          </div>
        </div>
        <main className="flex-1 container mx-auto px-4 py-6">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-200 rounded w-48"></div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2 h-96 bg-gray-200 rounded"></div>
              <div className="space-y-6">
                <div className="h-40 bg-gray-200 rounded"></div>
                <div className="h-40 bg-gray-200 rounded"></div>
              </div>
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
    <div className="flex flex-col min-h-screen">
      <DashboardHeader />
      <main className="flex-1 container mx-auto px-4 py-6">
        <h1 className="text-3xl font-bold mb-6">Nouveau pari</h1>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2">
            <BetCapture />
          </div>
          <div className="space-y-6">
            <OcrStats />
            <OcrTips />
          </div>
        </div>
      </main>
    </div>
  )
}
