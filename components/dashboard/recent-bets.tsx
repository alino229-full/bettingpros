"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, XCircle, Clock, TrendingUp, Calendar, Plus, AlertCircle } from "lucide-react"
import Link from "next/link"
import { useEffect, useState } from "react"
import { getUserBets } from "@/app/actions/bet-actions"
import { useAuth } from "@/components/auth/auth-provider"
import { useUserCurrency } from "@/hooks/use-user-currency"
import type { Bet } from "@/lib/types/database"

export function RecentBets() {
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const { user } = useAuth()
  const { formatAmount, formatAmountWithSign } = useUserCurrency()

  useEffect(() => {
    const fetchRecentBets = async () => {
      if (!user) return

      try {
        const result = await getUserBets(5) // Get last 5 bets
        if (result.success) {
          setBets(result.data || [])
        }
      } catch (error) {
        console.error("Error fetching recent bets:", error)
      } finally {
        setLoading(false)
      }
    }

    fetchRecentBets()
  }, [user])

  if (loading) {
    return (
      <div>
        <CardHeader className="pb-6 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              Paris récents
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-3 px-4 md:px-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="space-y-3">
                <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-3/4"></div>
                <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-1/2"></div>
                <div className="flex gap-2 flex-wrap">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-16"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"></div>
                </div>
                <div className="flex justify-between items-center">
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-32"></div>
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-20"></div>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </div>
    )
  }

  if (bets.length === 0) {
    return (
      <div>
        <CardHeader className="pb-6 px-4 md:px-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="w-3 h-3 md:w-4 md:h-4 text-white" />
              </div>
              Paris récents
            </CardTitle>
            <Link href="/capture" className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1">
              <Plus className="w-3 h-3 md:w-4 md:h-4" />
              <span className="hidden sm:inline">Ajouter</span>
            </Link>
          </div>
        </CardHeader>
        <CardContent className="px-4 md:px-6">
          <div className="text-center py-8 md:py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-12 h-12 md:w-16 md:h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-6 h-6 md:w-8 md:h-8 text-white" />
            </div>
            <h3 className="text-base md:text-lg font-semibold text-gray-900 mb-2">Aucun pari enregistré</h3>
            <p className="text-sm md:text-base text-gray-600 mb-6">Commencez par ajouter votre premier pari !</p>
            <Link href="/capture">
              <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-4 md:px-6 py-2 md:py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto text-sm md:text-base">
                <Plus className="w-4 h-4 md:w-5 md:h-5" />
                Nouveau pari
              </button>
            </Link>
          </div>
        </CardContent>
      </div>
    )
  }

  return (
    <div>
      <CardHeader className="pb-4 md:pb-6 px-4 md:px-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-xl md:text-2xl font-semibold text-gray-900 flex items-center gap-2 md:gap-3">
            <div className="w-6 h-6 md:w-8 md:h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="w-3 h-3 md:w-4 md:h-4 text-white" />
            </div>
            <span className="text-lg md:text-2xl">Paris récents</span>
          </CardTitle>
          <Link href="/history" className="text-xs md:text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1">
            <TrendingUp className="w-3 h-3 md:w-4 md:h-4" />
            <span className="hidden sm:inline">Voir tout</span>
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-3 md:space-y-4 px-4 md:px-6">
        {bets.map((bet, index) => (
          <div 
            key={bet.id} 
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200 hover:shadow-md"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex-1 min-w-0 pr-3">
                <h4 className="font-semibold text-gray-900 text-base md:text-lg leading-tight truncate">{bet.match_name}</h4>
                <p className="text-gray-600 font-medium text-sm md:text-base mt-1 line-clamp-2">{bet.prediction}</p>
              </div>
              <div className="flex-shrink-0">
                {bet.status === "won" && (
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-green-100 rounded-full flex items-center justify-center">
                    <CheckCircle className="h-4 w-4 md:h-5 md:w-5 text-green-600" />
                  </div>
                )}
                {bet.status === "lost" && (
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-red-100 rounded-full flex items-center justify-center">
                    <XCircle className="h-4 w-4 md:h-5 md:w-5 text-red-600" />
                  </div>
                )}
                {bet.status === "pending" && (
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-amber-100 rounded-full flex items-center justify-center">
                    <Clock className="h-4 w-4 md:h-5 md:w-5 text-amber-600" />
                  </div>
                )}
              </div>
            </div>
            
            <div className="flex items-center gap-2 mb-3 flex-wrap">
              <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200 text-xs">
                {bet.bet_type}
              </Badge>
              <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200 text-xs">
                {bet.sport}
              </Badge>
              {bet.is_ocr_extracted && (
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                  IA
                </Badge>
              )}
              <div className="flex items-center gap-1 text-xs text-gray-500 ml-auto">
                <Calendar className="w-3 h-3" />
                <span className="whitespace-nowrap">
                  {new Date(bet.created_at).toLocaleDateString("fr-FR", { 
                    day: '2-digit', 
                    month: '2-digit',
                    year: undefined 
                  })}
                </span>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between text-sm">
                <div className="text-gray-600 flex items-center gap-3">
                  <span><span className="font-medium">Mise:</span> {formatAmount(bet.stake)}</span>
                  <span className="text-gray-400">|</span>
                  <span><span className="font-medium">Cote:</span> {bet.odds}</span>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="text-xs text-gray-500">
                  {bet.status === "won" && "Gain"}
                  {bet.status === "lost" && "Perte"}
                  {bet.status === "pending" && "En attente"}
                </div>
                <div className={`font-bold text-base md:text-lg ${
                  bet.status === "won" ? "text-green-600" : 
                  bet.status === "lost" ? "text-red-600" : 
                  "text-amber-600"
                }`}>
                  {bet.status === "won" && bet.actual_win && formatAmountWithSign(bet.actual_win)}
                  {bet.status === "lost" && `-${formatAmount(bet.stake)}`}
                  {bet.status === "pending" && `+${formatAmount((bet.stake * bet.odds) - bet.stake)}`}
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
