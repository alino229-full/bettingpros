"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import {
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
} from "recharts"
import { useEffect, useState } from "react"
import { getUserBets, getBetStats } from "@/app/actions/bet-actions"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCurrency } from "@/hooks/use-user-currency"
import { TrendingUp, Target, Trophy, AlertCircle, BarChart3, PieChart as PieChartIcon, LineChart as LineChartIcon } from "lucide-react"

interface AnalysisData {
  name: string
  value: number
  profit?: number
  loss?: number
  count?: number
}

export function AnalysisDashboard() {
  const [period, setPeriod] = useState("6months")
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [performanceData, setPerformanceData] = useState<AnalysisData[]>([])
  const [betTypeData, setBetTypeData] = useState<AnalysisData[]>([])
  const [sportData, setSportData] = useState<AnalysisData[]>([])
  const [marketData, setMarketData] = useState<AnalysisData[]>([])
  const { user } = useAuth()
  const { formatAmount, formatAmountWithSign } = useUserCurrency()
  const [stats, setStats] = useState<any>(null)

  const COLORS = ["#1E88E5", "#43A047", "#E53935", "#FFA726", "#8E24AA"]

  useEffect(() => {
    const fetchBets = async () => {
      if (!user) return

      try {
        const result = await getUserBets()
        if (result.success && result.data) {
          setBets(result.data)
        }
      } catch (error) {
        console.error("Error fetching bets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchBets()
  }, [user])

  useEffect(() => {
    if (bets.length === 0) return

    const filteredBets = filterBetsByPeriod(bets, period)

    // Performance data by month
    const monthlyPerformance = processMonthlyPerformance(filteredBets)
    setPerformanceData(monthlyPerformance)

    // Bet type analysis
    const betTypes = processBetTypes(filteredBets)
    setBetTypeData(betTypes)

    // Sport analysis
    const sports = processSports(filteredBets)
    setSportData(sports)

    // Market analysis (based on predictions)
    const markets = processMarkets(filteredBets)
    setMarketData(markets)
  }, [bets, period])

  useEffect(() => {
    const fetchAnalysisData = async () => {
      if (!user) return

      try {
        const result = await getBetStats()
        if (result.success) {
          setStats(result.data)
          
          // Ici vous pourriez ajouter des données plus détaillées pour l'analyse
          // comme les stats par sport, par type de pari, etc.
        }
      } catch (error) {
        console.error("Erreur chargement données analyse:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchAnalysisData()
  }, [user])

  const filterBetsByPeriod = (allBets: Bet[], selectedPeriod: string): Bet[] => {
    const now = new Date()
    const cutoffDate = new Date()

    switch (selectedPeriod) {
      case "1month":
        cutoffDate.setMonth(now.getMonth() - 1)
        break
      case "3months":
        cutoffDate.setMonth(now.getMonth() - 3)
        break
      case "6months":
        cutoffDate.setMonth(now.getMonth() - 6)
        break
      case "1year":
        cutoffDate.setFullYear(now.getFullYear() - 1)
        break
      default:
        return allBets
    }

    return allBets.filter((bet) => new Date(bet.created_at) >= cutoffDate)
  }

  const processMonthlyPerformance = (filteredBets: Bet[]): AnalysisData[] => {
    const monthlyData: { [key: string]: { profit: number; loss: number } } = {}

    filteredBets.forEach((bet) => {
      const month = new Date(bet.created_at).toLocaleDateString("fr-FR", {
        month: "short",
        year: "2-digit",
      })

      if (!monthlyData[month]) {
        monthlyData[month] = { profit: 0, loss: 0 }
      }

      if (bet.status === "won") {
        monthlyData[month].profit += bet.actual_win || 0
      } else if (bet.status === "lost") {
        monthlyData[month].loss += bet.stake
      }
    })

    return Object.entries(monthlyData)
      .map(([name, data]) => ({
        name,
        profit: data.profit,
        loss: data.loss,
        value: data.profit - data.loss,
      }))
      .sort((a, b) => a.name.localeCompare(b.name))
  }

  const processBetTypes = (filteredBets: Bet[]): AnalysisData[] => {
    const typeCount: { [key: string]: number } = {}

    filteredBets.forEach((bet) => {
      const type = bet.bet_type.charAt(0).toUpperCase() + bet.bet_type.slice(1)
      typeCount[type] = (typeCount[type] || 0) + 1
    })

    const total = filteredBets.length
    return Object.entries(typeCount).map(([name, count]) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
    }))
  }

  const processSports = (filteredBets: Bet[]): AnalysisData[] => {
    const sportCount: { [key: string]: number } = {}

    filteredBets.forEach((bet) => {
      sportCount[bet.sport] = (sportCount[bet.sport] || 0) + 1
    })

    const total = filteredBets.length
    return Object.entries(sportCount).map(([name, count]) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
    }))
  }

  const processMarkets = (filteredBets: Bet[]): AnalysisData[] => {
    const marketCount: { [key: string]: number } = {}

    filteredBets.forEach((bet) => {
      // Categorize predictions into market types
      const prediction = bet.prediction.toLowerCase()
      let market = "Autres"

      if (prediction.includes("victoire") || prediction.includes("win") || prediction.includes("1x2")) {
        market = "Victoire"
      } else if (prediction.includes("but") || prediction.includes("goal") || prediction.includes("total")) {
        market = "Buts/Total"
      } else if (prediction.includes("handicap")) {
        market = "Handicap"
      } else if (prediction.includes("score") || prediction.includes("exact")) {
        market = "Score exact"
      } else if (prediction.includes("carton") || prediction.includes("card")) {
        market = "Cartons"
      }

      marketCount[market] = (marketCount[market] || 0) + 1
    })

    const total = filteredBets.length
    return Object.entries(marketCount).map(([name, count]) => ({
      name,
      value: total > 0 ? Math.round((count / total) * 100) : 0,
      count,
    }))
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-gray-100 rounded-lg animate-pulse"></div>
          ))}
        </div>
        <div className="h-96 bg-gray-100 rounded-lg animate-pulse"></div>
      </div>
    )
  }

  if (bets.length === 0) {
    return (
      <div className="text-center py-12">
        <h3 className="text-lg font-medium mb-2">Aucune donnée d'analyse</h3>
        <p className="text-muted-foreground">Commencez par ajouter des paris pour voir vos analyses de performance.</p>
      </div>
    )
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-sm font-medium text-gray-600 mb-1">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: entry.color }}>
              {entry.name}: {typeof entry.value === 'number' && entry.name.toLowerCase().includes('profit') 
                ? formatAmountWithSign(entry.value) 
                : entry.value}
            </p>
          ))}
        </div>
      )
    }
    return null
  }

  return (
    <div className="space-y-6">
      {/* KPI Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-blue-700">Rentabilité</CardTitle>
            <TrendingUp className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.roi ? `${stats.roi.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-blue-600">
              Retour sur investissement
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-green-700">Précision</CardTitle>
            <Target className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {stats?.successRate ? `${stats.successRate.toFixed(1)}%` : '0%'}
            </div>
            <p className="text-xs text-green-600">
              Taux de réussite global
            </p>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-purple-700">Meilleur mois</CardTitle>
            <Trophy className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">
              {formatAmount(198)}
            </div>
            <p className="text-xs text-purple-600">
              Performance maximale
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-end">
        <Select value={period} onValueChange={setPeriod}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Période" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1month">Dernier mois</SelectItem>
            <SelectItem value="3months">3 derniers mois</SelectItem>
            <SelectItem value="6months">6 derniers mois</SelectItem>
            <SelectItem value="1year">Dernière année</SelectItem>
            <SelectItem value="all">Tout</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <Tabs defaultValue="overview">
        <TabsList className="mb-4">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="bettypes">Types de paris</TabsTrigger>
          <TabsTrigger value="sports">Sports</TabsTrigger>
          <TabsTrigger value="markets">Marchés</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Évolution des gains et pertes</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {performanceData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée pour cette période
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={performanceData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip
                        formatter={(value: number, name: string) => [
                          `${value.toFixed(2)}€`,
                          name === "profit" ? "Gains" : "Pertes",
                        ]}
                      />
                      <Legend />
                      <Bar dataKey="profit" name="Gains" fill="#43A047" />
                      <Bar dataKey="loss" name="Pertes" fill="#E53935" />
                    </BarChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Répartition des types de paris</CardTitle>
              </CardHeader>
              <CardContent className="h-[350px]">
                {betTypeData.length === 0 ? (
                  <div className="flex items-center justify-center h-full text-muted-foreground">
                    Aucune donnée pour cette période
                  </div>
                ) : (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={betTypeData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, value }) => `${name}: ${value}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {betTypeData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => [`${value}%`, "Pourcentage"]} />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="bettypes">
          <Card>
            <CardHeader>
              <CardTitle>Analyse par type de pari</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {betTypeData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucune donnée pour cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={betTypeData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip formatter={(value: number) => [`${value}%`, "Pourcentage"]} />
                    <Legend />
                    <Bar dataKey="value" name="Pourcentage" fill="#1E88E5" />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sports">
          <Card>
            <CardHeader>
              <CardTitle>Analyse par sport</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {sportData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucune donnée pour cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={sportData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {sportData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Pourcentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets">
          <Card>
            <CardHeader>
              <CardTitle>Analyse par marché</CardTitle>
            </CardHeader>
            <CardContent className="h-[400px]">
              {marketData.length === 0 ? (
                <div className="flex items-center justify-center h-full text-muted-foreground">
                  Aucune donnée pour cette période
                </div>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={marketData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}%`}
                      outerRadius={120}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {marketData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value: number) => [`${value}%`, "Pourcentage"]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
