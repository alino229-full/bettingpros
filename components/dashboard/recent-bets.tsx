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
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Paris récents
            </CardTitle>
          </div>
        </CardHeader>
        <CardContent className="space-y-4 p-0 md:p-6">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-xl p-4 border border-gray-200">
              <div className="flex items-center justify-between">
                <div className="space-y-3 flex-1">
                  <div className="h-5 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-40"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-32"></div>
                  <div className="flex gap-2">
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-16"></div>
                    <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-full animate-pulse w-20"></div>
                  </div>
                </div>
                <div className="text-right space-y-2">
                  <div className="h-6 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-20"></div>
                  <div className="h-4 bg-gradient-to-r from-gray-200 to-gray-300 rounded-lg animate-pulse w-24"></div>
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
        <CardHeader className="pb-6">
          <div className="flex items-center justify-between">
            <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
              <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
                <Clock className="w-4 h-4 text-white" />
              </div>
              Paris récents
            </CardTitle>
            <Link href="/capture" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1">
              <Plus className="w-4 h-4" />
              Ajouter un pari
            </Link>
          </div>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12 bg-gray-50 rounded-2xl border-2 border-dashed border-gray-300">
            <div className="w-16 h-16 bg-gradient-to-r from-gray-400 to-gray-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <AlertCircle className="w-8 h-8 text-white" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun pari enregistré</h3>
            <p className="text-gray-600 mb-6">Commencez par ajouter votre premier pari !</p>
            <Link href="/capture">
              <button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-6 py-3 rounded-xl font-medium transition-all duration-200 transform hover:scale-105 flex items-center gap-2 mx-auto">
                <Plus className="w-5 h-5" />
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
      <CardHeader className="pb-6">
        <div className="flex items-center justify-between">
          <CardTitle className="text-2xl font-semibold text-gray-900 flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-r from-green-500 to-blue-500 rounded-lg flex items-center justify-center">
              <Clock className="w-4 h-4 text-white" />
            </div>
            Paris récents
          </CardTitle>
          <Link href="/history" className="text-sm font-medium text-blue-600 hover:text-blue-500 transition-colors flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            Voir tout
          </Link>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {bets.map((bet, index) => (
          <div 
            key={bet.id} 
            className="bg-white rounded-xl p-4 border border-gray-200 hover:border-gray-300 transition-all duration-200"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h4 className="font-semibold text-gray-900 text-lg">{bet.match_name}</h4>
                    <p className="text-gray-600 font-medium">{bet.prediction}</p>
                  </div>
                  <div className="flex items-center">
                    {bet.status === "won" && (
                      <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                        <CheckCircle className="h-5 w-5 text-green-600" />
                      </div>
                    )}
                    {bet.status === "lost" && (
                      <div className="w-8 h-8 bg-red-100 rounded-full flex items-center justify-center">
                        <XCircle className="h-5 w-5 text-red-600" />
                      </div>
                    )}
                    {bet.status === "pending" && (
                      <div className="w-8 h-8 bg-amber-100 rounded-full flex items-center justify-center">
                        <Clock className="h-5 w-5 text-amber-600" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <Badge variant="outline" className="capitalize bg-blue-50 text-blue-700 border-blue-200">
                    {bet.bet_type}
                  </Badge>
                  <Badge variant="secondary" className="bg-purple-50 text-purple-700 border-purple-200">
                    {bet.sport}
                  </Badge>
                  {bet.is_ocr_extracted && (
                    <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                      IA
                    </Badge>
                  )}
                  <div className="flex items-center gap-1 text-xs text-gray-500">
                    <Calendar className="w-3 h-3" />
                    {new Date(bet.created_at).toLocaleDateString("fr-FR")}
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <div className="text-sm text-gray-600">
                    <span className="font-medium">Mise:</span> {formatAmount(bet.stake)} | 
                    <span className="font-medium"> Cote:</span> {bet.odds}
                  </div>
                  <div className={`font-bold text-lg ${
                    bet.status === "won" ? "text-green-600" : 
                    bet.status === "lost" ? "text-red-600" : 
                    "text-amber-600"
                  }`}>
                    {bet.status === "won" && bet.actual_win && formatAmountWithSign(bet.actual_win)}
                    {bet.status === "lost" && `-${formatAmount(bet.stake)}`}
                    {bet.status === "pending" && formatAmount(bet.stake)}
                  </div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </CardContent>
    </div>
  )
}
