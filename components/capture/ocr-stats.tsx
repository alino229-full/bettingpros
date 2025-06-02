"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Sparkles, TrendingUp, Clock, CheckCircle, Zap, Target, Brain, Gauge } from "lucide-react"
import { useEffect, useState } from "react"
import { getUserBets } from "@/app/actions/bet-actions"
import { useAuth } from "@/components/auth/auth-provider"

interface OcrStatsData {
  totalProcessed: number
  averageConfidence: number
  processingTime: number
  successRate: number
}

export function OcrStats() {
  const [stats, setStats] = useState<OcrStatsData>({
    totalProcessed: 0,
    averageConfidence: 0,
    processingTime: 2.3,
    successRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()

  useEffect(() => {
    const fetchOcrStats = async () => {
      if (!user) return

      try {
        const result = await getUserBets()
        if (result.success && result.data) {
          const bets = result.data
          const ocrBets = bets.filter((bet) => bet.is_ocr_extracted)

          const totalProcessed = ocrBets.length
          const averageConfidence =
            ocrBets.length > 0 ? ocrBets.reduce((sum, bet) => sum + (bet.confidence_score || 0), 0) / ocrBets.length : 0

          // Calculate success rate based on confidence scores
          const highConfidenceBets = ocrBets.filter((bet) => (bet.confidence_score || 0) >= 0.7)
          const successRate = ocrBets.length > 0 ? highConfidenceBets.length / ocrBets.length : 0

          setStats({
            totalProcessed,
            averageConfidence,
            processingTime: 2.3, // This would be tracked in a real implementation
            successRate,
          })
        }
      } catch (error) {
        console.error("Error fetching OCR stats:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchOcrStats()
  }, [user])

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "text-green-600"
    if (confidence >= 0.6) return "text-yellow-600"
    return "text-red-600"
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 0.8) return "from-green-50 to-green-100 border-green-200"
    if (confidence >= 0.6) return "from-yellow-50 to-yellow-100 border-yellow-200"
    return "from-red-50 to-red-100 border-red-200"
  }

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 0.8) return "text-green-600"
    if (rate >= 0.6) return "text-blue-600"
    return "text-orange-600"
  }

  if (loading) {
    return (
      <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
              <Brain className="h-4 w-4 text-white" />
            </div>
            <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
              Intelligence Artificielle
            </span>
          </CardTitle>
          <p className="text-purple-600 text-xs sm:text-sm">Performances de reconnaissance automatique</p>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl p-3 border border-purple-100 animate-pulse">
                <div className="space-y-2">
                  <div className="h-3 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg"></div>
                  <div className="h-1 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full"></div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="bg-gradient-to-br from-purple-50 to-indigo-50 border-purple-200 shadow-lg hover:shadow-xl transition-all duration-300">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <div className="w-8 h-8 bg-gradient-to-r from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center">
            <Brain className="h-4 w-4 text-white" />
          </div>
          <span className="bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent font-bold">
            Intelligence Artificielle
          </span>
        </CardTitle>
        <p className="text-purple-600 text-xs sm:text-sm">Performances de reconnaissance automatique</p>
      </CardHeader>

      <CardContent className="grid grid-cols-2 gap-3">
        {/* Tickets traités */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-blue-100 hover:border-blue-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg flex items-center justify-center">
                <Zap className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">Tickets traités</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold text-gray-900">{stats.totalProcessed}</span>
            <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200 text-xs px-1.5 py-0.5 hidden">
              Total
            </Badge>
          </div>
        </div>

        {/* Confiance moyenne */}
        <div className={`bg-gradient-to-br ${getConfidenceBg(stats.averageConfidence)} rounded-xl p-3 sm:p-4 border hover:shadow-md transition-all duration-200`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-r from-green-500 to-emerald-500 rounded-lg flex items-center justify-center">
                <Target className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">Précision IA</span>
            </div>
          </div>
          <div className="space-y-2">
            <span className={`text-2xl sm:text-3xl font-bold ${getConfidenceColor(stats.averageConfidence)}`}>
              {stats.totalProcessed > 0 ? Math.round(stats.averageConfidence * 100) : 0}%
            </span>
            <div className="flex items-center gap-1">
              <Progress 
                value={stats.totalProcessed > 0 ? stats.averageConfidence * 100 : 0} 
                className="h-1.5 flex-1"
              />
              <Badge variant="secondary" className="text-xs px-1.5 py-0.5 text-white hidden">
                {stats.averageConfidence >= 0.8
                  ? "Excellent"
                  : stats.averageConfidence >= 0.6
                    ? "Bon"
                    : stats.totalProcessed > 0
                      ? "Moyen"
                      : "N/A"}
              </Badge>
            </div>
          </div>
        </div>

        {/* Temps moyen */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-purple-100 hover:border-purple-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-r from-purple-500 to-violet-500 rounded-lg flex items-center justify-center">
                <Clock className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">Vitesse</span>
            </div>
          </div>
          <div className="space-y-1">
            <span className="text-2xl sm:text-3xl font-bold text-purple-600">{stats.processingTime}s</span>
            <div className="flex items-center gap-1">
              <Gauge className="h-3 w-3 text-purple-500" />
              <span className="text-xs text-purple-600 font-medium truncate">Instantané</span>
            </div>
          </div>
        </div>

        {/* Taux de réussite */}
        <div className="bg-white rounded-xl p-3 sm:p-4 border border-orange-100 hover:border-orange-200 transition-all duration-200">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-1.5">
              <div className="w-6 h-6 bg-gradient-to-r from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                <TrendingUp className="h-3 w-3 text-white" />
              </div>
              <span className="text-xs font-medium text-gray-600">Fiabilité</span>
            </div>
          </div>
          <div className="space-y-2">
            <span className={`text-2xl sm:text-3xl font-bold ${getSuccessRateColor(stats.successRate)}`}>
              {stats.totalProcessed > 0 ? Math.round(stats.successRate * 100) : 0}%
            </span>
            <div className="flex items-center gap-1">
              <Progress 
                value={stats.totalProcessed > 0 ? stats.successRate * 100 : 0} 
                className="h-1.5 flex-1"
              />
              <Badge variant="outline" className="bg-orange-50 text-orange-700 border-orange-200 text-xs px-1.5 py-0.5 hidden">
                Qualité
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
