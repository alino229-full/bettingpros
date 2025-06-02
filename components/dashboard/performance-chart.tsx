"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, Area, AreaChart } from "recharts"
import { TrendingUp, TrendingDown, Calendar, BarChart3 } from "lucide-react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { getBetStats } from "@/app/actions/bet-actions"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCurrency } from "@/hooks/use-user-currency"

export function PerformanceChart() {
  const [period, setPeriod] = useState("30")
  const [chartType, setChartType] = useState("line")
  const [performanceData, setPerformanceData] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isMobile, setIsMobile] = useState(false)
  const { user } = useAuth()
  const { formatAmount } = useUserCurrency()

  // Detect mobile screen size
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 640)
    }
    
    // Initial check
    handleResize()
    
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    const fetchPerformanceData = async () => {
      if (!user) return

      try {
        // Récupérer les stats pour construire les données de performance
        const result = await getBetStats()
        if (result.success) {
          // Simuler des données de performance par semaine/mois
          // En production, vous voudrez une API spécifique pour les données de graphique
          const mockData = [
            { date: "Jan", profit: Math.random() * 200 - 100 },
            { date: "Fév", profit: Math.random() * 200 - 100 },
            { date: "Mar", profit: Math.random() * 200 - 100 },
            { date: "Avr", profit: Math.random() * 200 - 100 },
            { date: "Mai", profit: Math.random() * 200 - 100 },
            { date: "Juin", profit: Math.random() * 200 - 100 },
          ]
          setPerformanceData(mockData)
        }
      } catch (error) {
        console.error("Erreur chargement données performance:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchPerformanceData()
  }, [user, period])

  if (loading) {
    return (
      <Card className="w-full">
        <CardHeader>
          <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
            <div className="space-y-2">
              <div className="h-5 sm:h-6 bg-gray-200 rounded w-32 sm:w-48 animate-pulse"></div>
              <div className="h-3 sm:h-4 bg-gray-200 rounded w-24 sm:w-32 animate-pulse"></div>
            </div>
            <div className="flex gap-2">
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

  const totalProfit = performanceData.reduce((sum, data) => sum + data.profit, 0)
  const isPositive = totalProfit >= 0

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-2 sm:p-3 rounded-lg shadow-lg border border-gray-200">
          <p className="text-xs sm:text-sm font-medium text-gray-600 mb-1">{label}</p>
          <p className={`text-sm sm:text-lg font-semibold ${payload[0].value >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {payload[0].value >= 0 ? '+' : ''}{formatAmount(payload[0].value)}
          </p>
        </div>
      )
    }
    return null
  }

  const renderChart = () => {
    const commonProps = {
      data: performanceData,
      margin: { 
        top: 5, 
        right: isMobile ? 10 : 30, 
        left: isMobile ? 10 : 20, 
        bottom: 5 
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
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
              tickFormatter={(value) => formatAmount(value)}
              width={isMobile ? 50 : 60}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar 
              dataKey="profit" 
              fill="#3b82f6"
              radius={[4, 4, 0, 0]}
            />
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
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
              tickFormatter={(value) => formatAmount(value)}
              width={isMobile ? 50 : 60}
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
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
            />
            <YAxis 
              axisLine={false}
              tickLine={false}
              tick={{ fontSize: isMobile ? 10 : 12, fill: '#666' }}
              tickFormatter={(value) => formatAmount(value)}
              width={isMobile ? 50 : 60}
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

  return (
    <Card className="w-full bg-white border-gray-200 shadow-sm">
      <CardHeader className="pb-3 px-4 sm:px-6">
        <div className="flex flex-col space-y-4 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
          <div className="space-y-2">
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-3">
              <CardTitle className="text-lg sm:text-xl font-semibold text-gray-900">
                Évolution des performances
              </CardTitle>
              <div className={`flex items-center gap-1 px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm font-medium w-fit ${
                isPositive 
                  ? 'bg-green-50 text-green-700 border border-green-200' 
                  : 'bg-red-50 text-red-700 border border-red-200'
              }`}>
                {isPositive ? (
                  <TrendingUp className="w-3 h-3 sm:w-4 sm:h-4" />
                ) : (
                  <TrendingDown className="w-3 h-3 sm:w-4 sm:h-4" />
                )}
                {isPositive ? '+' : ''}{formatAmount(totalProfit)}
              </div>
            </div>
            <p className="text-xs sm:text-sm text-gray-500">
              Profit net cumulé sur la période sélectionnée
            </p>
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-28 sm:w-32 h-8 sm:h-9 text-xs sm:text-sm border-gray-200">
                <Calendar className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500" />
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
              <SelectTrigger className="w-20 sm:w-24 h-8 sm:h-9 text-xs sm:text-sm border-gray-200">
                <BarChart3 className="w-3 h-3 sm:w-4 sm:h-4 mr-1 sm:mr-2 text-gray-500" />
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
      
      <CardContent className="pt-0 px-2 sm:px-6">
        <div className="h-64 sm:h-80 w-full overflow-hidden">
          <ResponsiveContainer width="100%" height="100%">
            {renderChart()}
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  )
}
