"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { TrendingUp, TrendingDown, Percent, Target, Trophy, AlertCircle, DollarSign } from "lucide-react"
import { useEffect, useState } from "react"
import { getBetStats } from "@/app/actions/bet-actions"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCurrency } from "@/hooks/use-user-currency"

interface BetStats {
  totalBets: number
  wonBets: number
  lostBets: number
  pendingBets: number
  cancelledBets: number
  totalStaked: number
  totalWon: number
  totalLost: number
  netProfit: number
  successRate: number
  roi: number
}

export function DashboardSummary() {
  const { user } = useAuth()
  const { formatAmount, formatAmountWithSign } = useUserCurrency()
  const [stats, setStats] = useState<BetStats | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchStats = async () => {
      if (!user) return

      try {
        const result = await getBetStats()
        if (result.success && result.data) {
          setStats(result.data)
        }
      } catch (error) {
        console.error("Erreur chargement stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchStats()
  }, [user])

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div className="h-4 bg-gray-200 rounded w-24"></div>
              <div className="h-4 w-4 bg-gray-200 rounded"></div>
            </CardHeader>
            <CardContent>
              <div className="h-8 bg-gray-200 rounded w-16 mb-2"></div>
              <div className="h-3 bg-gray-200 rounded w-32"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (!stats || stats.totalBets === 0) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Paris total</CardTitle>
            <Target className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">0</div>
            <p className="text-xs text-blue-600">Commencez à parier !</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Gains totaux</CardTitle>
            <TrendingUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatAmount(0)}</div>
            <p className="text-xs text-green-600">En attente de vos premiers gains</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-red-700">Pertes totales</CardTitle>
            <TrendingDown className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatAmount(0)}</div>
            <p className="text-xs text-red-600">Aucune perte pour le moment</p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Profit net</CardTitle>
            <DollarSign className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-gray-900 mb-1">{formatAmount(0)}</div>
            <p className="text-xs text-purple-600">ROI: 0%</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
      <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-blue-700">Paris total</CardTitle>
          <Target className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">{stats.totalBets}</div>
          <p className="text-xs text-blue-600">
            {stats.wonBets} gagnés • {stats.lostBets} perdus • {stats.pendingBets} en attente
            {stats.cancelledBets > 0 && ` • ${stats.cancelledBets} remboursés`}
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-green-700">Gains totaux</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">{formatAmountWithSign(stats.totalWon)}</div>
          <p className="text-xs text-green-600">
            Taux de réussite: {stats.successRate.toFixed(1)}%
          </p>
        </CardContent>
      </Card>

      <Card className="bg-gradient-to-br from-red-50 to-red-100 border-red-200 hover:shadow-md transition-shadow">
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium text-red-700">Pertes totales</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-3xl font-bold text-gray-900 mb-1">-{formatAmount(stats.totalLost)}</div>
          <p className="text-xs text-red-600">
            Misé au total: {formatAmount(stats.totalStaked)}
          </p>
        </CardContent>
      </Card>

      <Card
        className={`bg-gradient-to-br ${
          stats.netProfit >= 0
            ? "from-purple-50 to-purple-100 border-purple-200"
            : "from-orange-50 to-orange-100 border-orange-200"
        } hover:shadow-md transition-shadow`}
      >
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle
            className={`text-sm font-medium ${
              stats.netProfit >= 0 ? "text-purple-700" : "text-orange-700"
            }`}
          >
            Profit net
          </CardTitle>
          <DollarSign
            className={`h-4 w-4 ${stats.netProfit >= 0 ? "text-purple-600" : "text-orange-600"}`}
          />
        </CardHeader>
        <CardContent>
          <div
            className={`text-3xl font-bold mb-1 ${
              stats.netProfit >= 0 ? "text-green-600" : "text-red-600"
            }`}
          >
            {formatAmountWithSign(stats.netProfit)}
          </div>
          <p
            className={`text-xs ${stats.netProfit >= 0 ? "text-purple-600" : "text-orange-600"}`}
          >
            ROI: {stats.roi.toFixed(1)}%
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
