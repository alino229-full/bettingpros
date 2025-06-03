"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CheckCircle, XCircle, Clock, Search, Filter, Download, Trash2, Trophy, TrendingUp, Target, Zap, RefreshCw } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useAuth } from "@/components/auth/auth-provider"
import { getUserBets, deleteBet, updateBet } from "@/app/actions/bet-actions"
import type { Bet } from "@/lib/types/database"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { useUserCurrency } from "@/hooks/use-user-currency"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"

export function BetHistory() {
  const [searchTerm, setSearchTerm] = useState("")
  const [sportFilter, setSportFilter] = useState("all")
  const [statusFilter, setStatusFilter] = useState("all")
  const [bets, setBets] = useState<Bet[]>([])
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()
  const { formatAmount, formatAmountWithSign } = useUserCurrency()

  const fetchBets = async (retryCount = 0) => {
    if (!user) return

    try {
      const result = await getUserBets()
      if (result.success) {
        setBets(result.data || [])
        setError(null)
      } else {
        // If it's a rate limit error and we haven't retried too many times
        if (result.error?.includes("Trop de requêtes") && retryCount < 3) {
          setTimeout(
            () => {
              fetchBets(retryCount + 1)
            },
            (retryCount + 1) * 2000,
          ) // Exponential backoff: 2s, 4s, 6s
          setError(`${result.error} Nouvelle tentative dans ${(retryCount + 1) * 2} secondes...`)
        } else {
          setError(result.error || "Erreur lors du chargement des paris")
        }
      }
    } catch (err) {
      console.error("Error in fetchBets:", err)
      if (retryCount < 3) {
        setTimeout(
          () => {
            fetchBets(retryCount + 1)
          },
          (retryCount + 1) * 2000,
        )
        setError(`Erreur de connexion. Nouvelle tentative dans ${(retryCount + 1) * 2} secondes...`)
      } else {
        setError("Erreur inattendue lors du chargement")
      }
    } finally {
      if (retryCount === 0) {
        setLoading(false)
      }
    }
  }

  const refreshBets = async () => {
    setRefreshing(true)
    try {
      const result = await getUserBets()
      if (result.success) {
        setBets(result.data || [])
        setError(null)
      } else {
        setError(result.error || "Erreur lors du rechargement")
      }
    } catch (err) {
      setError("Erreur lors du rechargement")
    } finally {
      setRefreshing(false)
    }
  }

  useEffect(() => {
    fetchBets()
  }, [user])

  const handleDeleteBet = async (betId: string) => {
    try {
      console.log("🗑️ Tentative de suppression du pari:", betId)
      
      // Optimistic update - remove immediately from UI
      const originalBets = [...bets]
      setBets(bets.filter((bet) => bet.id !== betId))
      
      const result = await deleteBet(betId)
      console.log("📊 Résultat de la suppression:", result)
      
      if (result.success) {
        console.log("✅ Pari supprimé avec succès")
        // Force refresh to ensure synchronization
        await refreshBets()
        setError(null)
      } else {
        console.error("❌ Erreur lors de la suppression:", result.error)
        // Failure - revert the optimistic update
        setBets(originalBets)
        setError(result.error || "Erreur lors de la suppression du pari")
      }
    } catch (err) {
      console.error("💥 Erreur inattendue:", err)
      // Failure - revert and refresh
      await refreshBets()
      setError("Erreur inattendue lors de la suppression")
    }
  }

  const handleUpdateBetStatus = async (betId: string, status: "won" | "lost", actualWin?: number) => {
    try {
      const result = await updateBet(betId, {
        status,
        actual_win: status === "won" ? (actualWin ?? 0) : 0,
      })
      if (result.success) {
        setBets(
          bets.map((bet) =>
            bet.id === betId ? { ...bet, status, actual_win: status === "won" ? (actualWin ?? 0) : 0 } : bet,
          ),
        )
      } else {
        setError(result.error || "Erreur lors de la mise à jour")
      }
    } catch (err) {
      setError("Erreur inattendue lors de la mise à jour")
    }
  }

  const filteredBets = bets.filter((bet) => {
    const matchesSearch =
      bet.match_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.prediction.toLowerCase().includes(searchTerm.toLowerCase()) ||
      bet.sport.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesSport = sportFilter === "all" || bet.sport.toLowerCase() === sportFilter.toLowerCase()
    const matchesStatus = statusFilter === "all" || bet.status === statusFilter

    return matchesSearch && matchesSport && matchesStatus
  })

  const getUniqueValues = (field: keyof Bet) => {
    return [...new Set(bets.map((bet) => bet[field] as string))]
  }

  const exportToCsv = () => {
    const headers = ["Date", "Match", "Sport", "Type", "Prédiction", "Cote", "Mise", "Statut", "Gain/Perte"]
    const csvData = filteredBets.map((bet) => [
      new Date(bet.created_at).toLocaleDateString("fr-FR"),
      bet.match_name,
      bet.sport,
      bet.bet_type,
      bet.prediction,
      bet.odds,
      bet.stake,
      bet.status,
      bet.status === "won" ? bet.actual_win || 0 : bet.status === "lost" ? -bet.stake : 0,
    ])

    const csvContent = [headers, ...csvData].map((row) => row.map((cell) => `"${cell}"`).join(",")).join("\n")

    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = `paris_${new Date().toISOString().split("T")[0]}.csv`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading état modernisé */}
        <div className="space-y-6">
          {/* Barre de recherche et filtres */}
          <div className="flex flex-col lg:flex-row gap-4">
            <div className="relative flex-1">
              <div className="h-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
            </div>
            <div className="flex gap-3">
              <div className="h-12 w-44 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-12 w-36 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
              <div className="h-12 w-12 bg-gradient-to-r from-gray-100 to-gray-200 rounded-xl animate-pulse"></div>
            </div>
          </div>
          
          {/* Onglets */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-10 w-24 bg-gradient-to-r from-gray-100 to-gray-200 rounded-lg animate-pulse" style={{ animationDelay: `${i * 100}ms` }}></div>
            ))}
          </div>

          {/* Liste des paris */}
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gradient-to-r from-gray-100 to-gray-200 rounded-2xl animate-pulse" style={{ animationDelay: `${i * 200}ms` }}></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && (
        <Alert variant="destructive" className="border-red-200 bg-red-50/50 rounded-xl">
          <AlertDescription className="text-red-700">{error}</AlertDescription>
        </Alert>
      )}

      {/* Barre de recherche et filtres modernisés */}
      <div className="bg-white rounded-2xl p-4 md:p-6 border border-gray-200">
        {/* Mobile Layout */}
        <div className="block md:hidden space-y-4">
          {/* Barre de recherche mobile */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Rechercher..."
              className="pl-10 h-11 text-base border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          {/* Filtres mobile en grid */}
          <div className="grid grid-cols-2 gap-3">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <span className="font-medium text-sm truncate">Sport</span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tous les sports</SelectItem>
                {getUniqueValues("sport").map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="h-11 border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <span className="font-medium text-sm truncate">Statut</span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="won">Gagnés</SelectItem>
                <SelectItem value="lost">Perdus</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Actions mobile */}
          <div className="flex gap-3 justify-center">
            <Button 
              variant="outline" 
              size="sm"
              onClick={exportToCsv}
              className="flex-1 h-10 border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-200"
            >
              <Download className="h-4 w-4 text-blue-600 mr-2" />
              <span className="text-sm">Exporter</span>
            </Button>
            
            <Button 
              variant="outline" 
              size="sm"
              onClick={refreshBets}
              disabled={refreshing}
              className="flex-1 h-10 border-gray-200 hover:bg-green-50 hover:border-green-300 rounded-xl transition-all duration-200"
            >
              <RefreshCw className={`h-4 w-4 text-green-600 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm">Actualiser</span>
            </Button>
          </div>
        </div>

        {/* Desktop Layout */}
        <div className="hidden md:flex flex-col lg:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <Input
              placeholder="Rechercher un match, un sport, une prédiction..."
              className="pl-12 h-12 text-lg border-gray-200 focus:border-blue-400 focus:ring-blue-400/20 rounded-xl"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <div className="flex gap-3">
            <Select value={sportFilter} onValueChange={setSportFilter}>
              <SelectTrigger className="w-44 h-12 border-gray-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-blue-500" />
                  <span className="font-medium">Sport</span>
                </div>
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tous les sports</SelectItem>
                {getUniqueValues("sport").map((sport) => (
                  <SelectItem key={sport} value={sport}>
                    {sport}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-36 h-12 border-gray-200 rounded-xl">
                <SelectValue placeholder="Statut" />
              </SelectTrigger>
              <SelectContent className="rounded-xl">
                <SelectItem value="all">Tous</SelectItem>
                <SelectItem value="won">Gagnés</SelectItem>
                <SelectItem value="lost">Perdus</SelectItem>
                <SelectItem value="pending">En attente</SelectItem>
              </SelectContent>
            </Select>

            <Button 
              variant="outline" 
              size="icon" 
              onClick={exportToCsv}
              className="h-12 w-12 border-gray-200 hover:bg-blue-50 hover:border-blue-300 rounded-xl transition-all duration-200"
            >
              <Download className="h-5 w-5 text-blue-600" />
            </Button>
            
            <Button 
              variant="outline" 
              size="icon" 
              onClick={refreshBets}
              disabled={refreshing}
              className="h-12 w-12 border-gray-200 hover:bg-green-50 hover:border-green-300 rounded-xl transition-all duration-200"
            >
              <RefreshCw className={`h-5 w-5 text-green-600 ${refreshing ? 'animate-spin' : ''}`} />
            </Button>
          </div>
        </div>
      </div>

      <Tabs value={statusFilter} onValueChange={setStatusFilter} className="space-y-6">
        {/* Onglets modernisés */}
        <div className="bg-white rounded-2xl p-2 border border-gray-200">
          {/* Mobile Tabs - Scrollable */}
          <div className="block md:hidden">
            <div className="flex overflow-x-auto gap-1 p-1 bg-gray-50 rounded-xl scrollbar-hide">
              <button 
                onClick={() => setStatusFilter("all")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === "all" 
                    ? 'bg-white text-gray-700 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Target className="w-4 h-4" />
                <span className="text-sm">Tous ({filteredBets.length})</span>
              </button>
              <button 
                onClick={() => setStatusFilter("won")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === "won" 
                    ? 'bg-white text-green-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Trophy className="w-4 h-4" />
                <span className="text-sm">Gagnés ({bets.filter((b) => b.status === "won").length})</span>
              </button>
              <button 
                onClick={() => setStatusFilter("lost")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === "lost" 
                    ? 'bg-white text-red-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <XCircle className="w-4 h-4" />
                <span className="text-sm">Perdus ({bets.filter((b) => b.status === "lost").length})</span>
              </button>
              <button 
                onClick={() => setStatusFilter("pending")}
                className={`flex items-center gap-2 px-3 py-2 rounded-lg font-medium transition-all duration-200 whitespace-nowrap ${
                  statusFilter === "pending" 
                    ? 'bg-white text-blue-600 shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                <Clock className="w-4 h-4" />
                <span className="text-sm">Attente ({bets.filter((b) => b.status === "pending").length})</span>
              </button>
            </div>
          </div>

          {/* Desktop Tabs */}
          <div className="hidden md:block">
          <TabsList className="grid w-full grid-cols-4 bg-gray-50 rounded-xl p-1">
            <TabsTrigger 
              value="all" 
              className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-gray-700 transition-all duration-200 text-gray-500"
            >
              <Target className="w-4 h-4 mr-2" />
              Tous ({filteredBets.length})
            </TabsTrigger>
            <TabsTrigger 
              value="won" 
              className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-green-600 transition-all duration-200 text-gray-500"
            >
              <Trophy className="w-4 h-4 mr-2" />
              Gagnés ({bets.filter((b) => b.status === "won").length})
            </TabsTrigger>
            <TabsTrigger 
              value="lost" 
              className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-red-600 transition-all duration-200 text-gray-500"
            >
              <XCircle className="w-4 h-4 mr-2" />
              Perdus ({bets.filter((b) => b.status === "lost").length})
            </TabsTrigger>
            <TabsTrigger 
              value="pending" 
              className="rounded-lg font-medium data-[state=active]:bg-white data-[state=active]:text-blue-600 transition-all duration-200 text-gray-500"
            >
              <Clock className="w-4 h-4 mr-2" />
              En attente ({bets.filter((b) => b.status === "pending").length})
            </TabsTrigger>
          </TabsList>
          </div>
        </div>

        <TabsContent value={statusFilter} className="space-y-4">
          {/* Titre dynamique */}
          <div className="flex items-center gap-3 mb-4 md:mb-6">
            {statusFilter === "all" && <Target className="w-5 h-5 md:w-6 md:h-6 text-gray-600" />}
            {statusFilter === "won" && <Trophy className="w-5 h-5 md:w-6 md:h-6 text-green-600" />}
            {statusFilter === "lost" && <XCircle className="w-5 h-5 md:w-6 md:h-6 text-red-600" />}
            {statusFilter === "pending" && <Clock className="w-5 h-5 md:w-6 md:h-6 text-blue-600" />}
            
            <h2 className="text-xl md:text-2xl font-bold text-gray-900">
              {statusFilter === "all"
                ? "Tous les paris"
                : statusFilter === "won"
                  ? "Paris gagnés"
                  : statusFilter === "lost"
                    ? "Paris perdus"
                    : "Paris en attente"}
            </h2>
            <Badge variant="outline" className="text-xs md:text-sm px-2 py-1 bg-gray-50 text-gray-600 border-gray-300">
              {filteredBets.length}
            </Badge>
          </div>

          {/* Liste des paris */}
          <div className="space-y-3">
            {filteredBets.map((bet, index) => (
              <BetItem 
                key={bet.id} 
                bet={bet} 
                onDelete={handleDeleteBet} 
                onUpdateStatus={handleUpdateBetStatus} 
                index={index}
                formatAmount={formatAmount}
                formatAmountWithSign={formatAmountWithSign}
              />
            ))}

            {filteredBets.length === 0 && (
              <div className="text-center py-12 md:py-16">
                <div className="w-12 h-12 md:w-16 md:h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3 md:mb-4">
                  <TrendingUp className="w-6 h-6 md:w-8 md:h-8 text-gray-400" />
                </div>
                <h3 className="text-base md:text-lg font-semibold text-gray-700 mb-2">
                  {bets.length === 0
                    ? "Aucun pari enregistré"
                    : "Aucun pari trouvé"}
                </h3>
                <p className="text-gray-500 max-w-md mx-auto text-sm px-4">
                  {bets.length === 0
                    ? "Commencez par ajouter votre premier pari ! Utilisez l'appareil photo pour scanner vos tickets automatiquement."
                    : "Essayez de modifier vos filtres de recherche pour trouver les paris que vous cherchez."}
                </p>
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

function BetItem({
  bet,
  onDelete,
  onUpdateStatus,
  index = 0,
  formatAmount,
  formatAmountWithSign
}: {
  bet: Bet
  onDelete: (id: string) => void
  onUpdateStatus: (id: string, status: "won" | "lost", actualWin?: number) => void
  index?: number
  formatAmount: (amount: number) => string
  formatAmountWithSign: (amount: number) => string
}) {
  const [isUpdating, setIsUpdating] = useState(false)

  const handleMarkAsWon = async () => {
    setIsUpdating(true)
    const potentialWin = bet.potential_win || bet.stake * bet.odds
    await onUpdateStatus(bet.id, "won", potentialWin)
    setIsUpdating(false)
  }

  const handleMarkAsLost = async () => {
    setIsUpdating(true)
    await onUpdateStatus(bet.id, "lost")
    setIsUpdating(false)
  }

  const getStatusConfig = () => {
    switch (bet.status) {
      case "won":
        return {
          bgColor: "bg-white",
          borderColor: "border-gray-200 border-l-green-400 border-l-4",
          iconBg: "bg-green-50",
          iconColor: "text-green-600",
          icon: CheckCircle,
          amount: formatAmountWithSign(bet.actual_win || 0),
          amountColor: "text-green-600 font-semibold",
          statusLabel: "Gagné"
        }
      case "lost":
        return {
          bgColor: "bg-white",
          borderColor: "border-gray-200 border-l-red-400 border-l-4",
          iconBg: "bg-red-50",
          iconColor: "text-red-600",
          icon: XCircle,
          amount: `-${formatAmount(bet.stake)}`,
          amountColor: "text-red-600 font-semibold",
          statusLabel: "Perdu"
        }
      default:
        return {
          bgColor: "bg-white",
          borderColor: "border-gray-200 border-l-blue-400 border-l-4",
          iconBg: "bg-blue-50",
          iconColor: "text-blue-600",
          icon: Clock,
          amount: formatAmount(bet.stake),
          amountColor: "text-blue-600 font-semibold",
          statusLabel: "En attente"
        }
    }
  }

  const statusConfig = getStatusConfig()
  const StatusIcon = statusConfig.icon

  return (
    <div 
      className={`${statusConfig.bgColor} ${statusConfig.borderColor} border rounded-xl p-4 md:p-5 hover:shadow-md transition-all duration-200 group`}
      style={{ animationDelay: `${index * 100}ms` }}
    >
      {/* Mobile Layout */}
      <div className="block md:hidden space-y-4">
        {/* Header Mobile - Match et Statut */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex-1 min-w-0">
            <h3 className="text-base font-semibold text-gray-900 leading-tight mb-1 break-words">
              {bet.match_name}
            </h3>
            <p className="text-sm font-medium text-gray-700 break-words">
              {bet.prediction}
            </p>
          </div>
          <div className="flex flex-col items-end gap-2 flex-shrink-0">
            <div className={`${statusConfig.iconBg} w-8 h-8 rounded-full flex items-center justify-center`}>
              <StatusIcon className={`h-4 w-4 ${statusConfig.iconColor}`} />
            </div>
            <div className={`text-right ${statusConfig.amountColor} text-lg font-semibold leading-none`}>
              {statusConfig.amount}
            </div>
          </div>
        </div>

        {/* Competition Mobile */}
        {bet.competition && (
          <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
            {bet.competition}
          </p>
        )}

        {/* Détails Mobile */}
        <div className="grid grid-cols-2 gap-2 text-xs">
          <div className="space-y-1">
            <p className="text-gray-500">Mise</p>
            <p className="font-medium text-gray-700">{formatAmount(bet.stake)}</p>
          </div>
          <div className="space-y-1">
            <p className="text-gray-500">Cote</p>
            <p className="font-medium text-gray-700">{bet.odds}</p>
          </div>
        </div>

        {/* Badges Mobile */}
        <div className="flex flex-wrap items-center gap-2">
          <Badge 
            variant="outline" 
            className="capitalize font-medium px-2 py-1 bg-gray-50 text-gray-700 border-gray-200 text-xs"
          >
            {bet.bet_type}
          </Badge>
          <Badge 
            variant="secondary" 
            className="font-medium px-2 py-1 bg-blue-50 text-blue-700 text-xs"
          >
            {bet.sport}
          </Badge>
          {bet.is_ocr_extracted && (
            <Badge 
              variant="outline" 
              className="font-medium px-2 py-1 bg-purple-50 text-purple-600 border-purple-200 text-xs"
            >
              <Zap className="w-3 h-3 mr-1" />
              IA
            </Badge>
          )}
          {bet.bookmaker && (
            <Badge 
              variant="outline" 
              className="font-medium px-2 py-1 bg-orange-50 text-orange-600 border-orange-200 text-xs"
            >
              {bet.bookmaker}
            </Badge>
          )}
        </div>

        {/* Date et Actions Mobile */}
        <div className="flex items-center justify-between gap-2">
          <span className="text-xs text-gray-500">
            {new Date(bet.created_at).toLocaleDateString("fr-FR", { 
              weekday: 'short', 
              day: 'numeric',
              month: 'short'
            })}
          </span>
          
          <div className="flex items-center gap-2">
            {/* Actions pour paris en attente */}
            {bet.status === "pending" && (
              <>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-xs px-2 py-1 h-7"
                  onClick={handleMarkAsWon}
                  disabled={isUpdating}
                >
                  <Trophy className="w-3 h-3 mr-1" />
                  Gagné
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-xs px-2 py-1 h-7"
                  onClick={handleMarkAsLost}
                  disabled={isUpdating}
                >
                  <XCircle className="w-3 h-3 mr-1" />
                  Perdu
                </Button>
              </>
            )}

            {/* Bouton de suppression */}
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button 
                  size="sm" 
                  variant="ghost" 
                  className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 h-7 w-7 p-0"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent className="rounded-2xl mx-4 max-w-sm">
                <AlertDialogHeader>
                  <AlertDialogTitle className="text-lg">Supprimer ce pari ?</AlertDialogTitle>
                  <AlertDialogDescription className="text-gray-600 text-sm">
                    Cette action est irréversible. Le pari sera définitivement supprimé.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter className="gap-2">
                  <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                  <AlertDialogAction 
                    onClick={() => onDelete(bet.id)}
                    className="bg-red-600 hover:bg-red-700 rounded-xl"
                  >
                    Supprimer
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </div>
      </div>

      {/* Desktop Layout */}
      <div className="hidden md:flex items-start justify-between gap-6">
        {/* Informations principales */}
        <div className="flex-1 space-y-3">
          {/* En-tête du pari */}
          <div className="flex items-start justify-between">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">{bet.match_name}</h3>
              <p className="text-base font-medium text-gray-700">{bet.prediction}</p>
              {bet.competition && (
                <p className="text-xs text-gray-500 bg-gray-50 px-2 py-1 rounded-md inline-block">
                  {bet.competition}
                </p>
              )}
            </div>
            
            {/* Icône de statut */}
            <div className={`${statusConfig.iconBg} w-10 h-10 rounded-full flex items-center justify-center`}>
              <StatusIcon className={`h-5 w-5 ${statusConfig.iconColor}`} />
            </div>
          </div>

          {/* Badges et métadonnées */}
          <div className="flex flex-wrap items-center gap-2">
            <Badge 
              variant="outline" 
              className="capitalize font-medium px-2 py-1 bg-gray-50 text-gray-700 border-gray-200 text-xs"
            >
              {bet.bet_type}
            </Badge>
            <Badge 
              variant="secondary" 
              className="font-medium px-2 py-1 bg-blue-50 text-blue-700 text-xs"
            >
              {bet.sport}
            </Badge>
            {bet.is_ocr_extracted && (
              <Badge 
                variant="outline" 
                className="font-medium px-2 py-1 bg-purple-50 text-purple-600 border-purple-200 text-xs"
              >
                <Zap className="w-3 h-3 mr-1" />
                IA
              </Badge>
            )}
            {bet.bookmaker && (
              <Badge 
                variant="outline" 
                className="font-medium px-2 py-1 bg-orange-50 text-orange-600 border-orange-200 text-xs"
              >
                {bet.bookmaker}
              </Badge>
            )}
            <span className="text-xs text-gray-500 ml-auto">
              {new Date(bet.created_at).toLocaleDateString("fr-FR", { 
                weekday: 'short', 
                year: 'numeric', 
                month: 'short', 
                day: 'numeric' 
              })}
            </span>
          </div>
        </div>

        {/* Panneau de droite Desktop */}
        <div className="flex flex-col items-end gap-3 min-w-[180px]">
          {/* Montant principal */}
          <div className="text-right">
            <div className={`text-xl font-semibold ${statusConfig.amountColor}`}>
              {statusConfig.amount}
            </div>
            <div className="text-xs text-gray-500 mt-1">
              Mise: {formatAmount(bet.stake)} • Cote: {bet.odds}
            </div>
          </div>

          {/* Actions pour paris en attente */}
          {bet.status === "pending" && (
            <div className="flex gap-2">
              <Button
                size="sm"
                variant="outline"
                className="bg-green-50 text-green-700 border-green-200 hover:bg-green-100 hover:border-green-300 transition-all duration-200 text-xs px-3"
                onClick={handleMarkAsWon}
                disabled={isUpdating}
              >
                <Trophy className="w-3 h-3 mr-1" />
                Gagné
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-red-50 text-red-700 border-red-200 hover:bg-red-100 hover:border-red-300 transition-all duration-200 text-xs px-3"
                onClick={handleMarkAsLost}
                disabled={isUpdating}
              >
                <XCircle className="w-3 h-3 mr-1" />
                Perdu
              </Button>
            </div>
          )}

          {/* Bouton de suppression */}
          <AlertDialog>
            <AlertDialogTrigger asChild>
              <Button 
                size="sm" 
                variant="ghost" 
                className="text-gray-400 hover:text-red-500 hover:bg-red-50 transition-all duration-200 h-7 w-7 p-0"
              >
                <Trash2 className="h-3 w-3" />
              </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="rounded-2xl">
              <AlertDialogHeader>
                <AlertDialogTitle className="text-xl">Supprimer ce pari ?</AlertDialogTitle>
                <AlertDialogDescription className="text-gray-600">
                  Cette action est irréversible. Le pari "{bet.match_name}" sera définitivement supprimé de votre historique.
                </AlertDialogDescription>
              </AlertDialogHeader>
              <AlertDialogFooter>
                <AlertDialogCancel className="rounded-xl">Annuler</AlertDialogCancel>
                <AlertDialogAction 
                  onClick={() => onDelete(bet.id)}
                  className="bg-red-600 hover:bg-red-700 rounded-xl"
                >
                  Supprimer
                </AlertDialogAction>
              </AlertDialogFooter>
            </AlertDialogContent>
          </AlertDialog>
        </div>
      </div>
    </div>
  )
}
