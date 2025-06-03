"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart, Cell } from "recharts"
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getPerformanceData } from "@/app/actions/bet-actions"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCurrency } from "@/hooks/use-user-currency"
import dynamic from "next/dynamic"

interface PerformanceDataPoint {
  date: string
  profit: number
  totalBets: number
  wonBets: number
  lostBets: number
  pendingBets: number
}

// Composant Chart sans SSR pour éviter les problèmes d'hydratation
const ChartContainer = dynamic(
  () => Promise.resolve(({ children }: { children: React.ReactNode }) => <>{children}</>),
  { 
    ssr: false,
    loading: () => (
      <div className="h-64 sm:h-80 bg-gray-100 rounded animate-pulse flex items-center justify-center">
        <div className="text-gray-500 text-sm">Chargement du graphique...</div>
      </div>
    )
  }
)

function PerformanceChartInner() {
  const [period, setPeriod] = useState("30")
  const [chartType, setChartType] = useState("line")
  const [performanceData, setPerformanceData] = useState<PerformanceDataPoint[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [mounted, setMounted] = useState(false)
  const { user } = useAuth()
  const { formatAmount } = useUserCurrency()

  useEffect(() => {
    setMounted(true)
  }, [])

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user || !mounted) return

      setLoading(true)
      setError(null)

      try {
        const result = await getPerformanceData(period)
        if (result.success) {
          setPerformanceData(result.data || [])
        } else {
          setError(result.error || "Erreur lors du chargement des données")
          setPerformanceData([])
        }
      } catch (error) {
        console.error("Erreur chargement données performance:", error)
        setError("Erreur inattendue lors du chargement")
        setPerformanceData([])
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [user, period, mounted])

  // Safe formatter to avoid hydration issues
  const safeFormatAmount = (amount: number): string => {
    if (!mounted) return "0"
    return formatAmount(amount)
  }

  if (!mounted) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="space-y-2 flex-1">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-8 w-20 sm:h-9 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 sm:h-9 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader className="pb-4">
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-start sm:justify-between sm:space-y-0">
            <div className="space-y-2 flex-1">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Évolution des performances
              </CardTitle>
              <p className="text-xs sm:text-sm text-gray-500">
                Chargement des données...
              </p>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <div className="h-8 w-20 sm:h-9 sm:w-24 bg-gray-200 rounded animate-pulse"></div>
              <div className="h-8 w-16 sm:h-9 sm:w-20 bg-gray-200 rounded animate-pulse"></div>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="h-64 sm:h-80 bg-gray-100 rounded animate-pulse"></div>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card className="w-full">
        <CardHeader>
          <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
            Évolution des performances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="text-red-500 mb-2">Erreur de chargement</div>
            <p className="text-gray-600 text-sm">{error}</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  const totalProfit = performanceData.reduce((sum, data) => sum + data.profit, 0)
  const isPositive = totalProfit >= 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="bg-white p-3 rounded-lg shadow-lg border border-gray-200 min-w-[160px]">
          <p className="text-sm font-medium text-gray-600 mb-2">{label}</p>
          <p className={`text-lg font-semibold mb-3 ${payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {payload[0].value >= 0 ? '+' : ''}{safeFormatAmount(payload[0].value)}
          </p>
          <div className="text-xs text-gray-500 space-y-1">
            <div className="flex justify-between">
              <span>Paris totaux:</span>
              <span className="font-medium">{data.totalBets}</span>
            </div>
            {data.wonBets > 0 && (
              <div className="flex justify-between text-green-600">
                <span>Gagnés:</span>
                <span className="font-medium">{data.wonBets}</span>
              </div>
            )}
            {data.lostBets > 0 && (
              <div className="flex justify-between text-red-600">
                <span>Perdus:</span>
                <span className="font-medium">{data.lostBets}</span>
              </div>
            )}
            {data.pendingBets > 0 && (
              <div className="flex justify-between text-amber-600">
                <span>En attente:</span>
                <span className="font-medium">{data.pendingBets}</span>
              </div>
            )}
          </div>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: performanceData,
      margin: { 
        top: 20, 
        right: 30, 
        left: 60, 
        bottom: 20 
      }
    }

    switch (chartType) {
      case "bar":
        return (
          <BarChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              height={40}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              tickFormatter={(value) => {
                const formatted = safeFormatAmount(value)
                // Raccourcir l'affichage si trop long
                return formatted.length > 8 ? formatted.replace(/\s/g, '') : formatted
              }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="profit" radius={[4, 4, 0, 0]}>
              {performanceData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.profit >= 0 ? '#10b981' : '#ef4444'} 
                />
              ))}
            </Bar>
          </BarChart>
        )
      
      case "area":
        return (
          <AreaChart {...commonProps}>
            <defs>
              <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              height={40}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              tickFormatter={(value) => {
                const formatted = safeFormatAmount(value)
                return formatted.length > 8 ? formatted.replace(/\s/g, '') : formatted
              }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6"
              strokeWidth={2}
              fillOpacity={1} 
              fill="url(#colorProfit)" 
            />
          </AreaChart>
        )
      
      default:
        return (
          <LineChart {...commonProps}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              height={40}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: 11, fill: '#666' }}
              tickFormatter={(value) => {
                const formatted = safeFormatAmount(value)
                return formatted.length > 8 ? formatted.replace(/\s/g, '') : formatted
              }}
              width={80}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6" 
              strokeWidth={3}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#3b82f6', strokeWidth: 2 }}
            />
          </LineChart>
        )
    }
  }

  const getPeriodLabel = () => {
    switch (period) {
      case "7": return "7 derniers jours"
      case "30": return "30 derniers jours"
      case "90": return "3 derniers mois"
      case "365": return "12 derniers mois"
      default: return "Période sélectionnée"
    }
  }

  return (
    <Card className="w-full bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-4 px-4 sm:px-6">
        <div className="moncss flex flex-col space-y-4  sm:items-start sm:justify-between sm:space-y-2">
          <div className="space-y-3 flex-1 min-w-0">
            <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
              Évolution des performances
            </CardTitle>
            
            {/* Badge de profit sur sa propre ligne pour éviter les chevauchements */}
            <div className="flex items-center gap-3">
              <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-full text-sm font-medium ${
                isPositive 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-4 h-4 flex-shrink-0" />
                ) : (
                  <TrendingDown className="w-4 h-4 flex-shrink-0" />
                )}
                <span className="font-semibold whitespace-nowrap">
                  {isPositive ? '+' : ''}{safeFormatAmount(totalProfit)}
                </span>
              </div>
            </div>
            
            <p className="text-xs sm:text-sm text-gray-500 hidden">
              Profit net cumulé - {getPeriodLabel()}
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap flex-shrink-0">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-32 h-9 text-sm border-gray-200">
                <Calendar className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7">7 jours</SelectItem>
                <SelectItem value="30">30 jours</SelectItem>
                <SelectItem value="90">3 mois</SelectItem>
                <SelectItem value="365">1 an</SelectItem>
              </SelectContent>
            </Select>
            
            <Select value={chartType} onValueChange={setChartType}>
              <SelectTrigger className="w-24 h-9 text-sm border-gray-200">
                <BarChart3 className="w-4 h-4 mr-2 text-gray-500 flex-shrink-0" />
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="line">Ligne</SelectItem>
                <SelectItem value="bar">Barres</SelectItem>
                <SelectItem value="area">Zone</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      
      <CardContent className="pt-0 px-4 sm:px-6">
        {performanceData.length === 0 ? (
          <div className="h-64 sm:h-80 flex items-center justify-center bg-gray-50 rounded-lg">
            <div className="text-center">
              <p className="text-gray-500 mb-2">Aucune donnée disponible</p>
              <p className="text-sm text-gray-400">
                Ajoutez des paris pour voir vos performances !
              </p>
            </div>
          </div>
        ) : (
          <ChartContainer>
            <div className="h-64 sm:h-80 w-full overflow-hidden">
              <ResponsiveContainer width="100%" height="100%">
                {renderChart()}
              </ResponsiveContainer>
            </div>
          </ChartContainer>
        )}
      </CardContent>
    </Card>
  )
}

export function PerformanceChart() {
  return <PerformanceChartInner />
}
