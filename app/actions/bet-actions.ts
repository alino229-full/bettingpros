"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { InsertBet, UpdateBet } from "@/lib/types/database"

export async function createBet(betData: Omit<InsertBet, "user_id">) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const { data, error } = await supabase
      .from("bets")
      .insert({
        ...betData,
        user_id: user.id,
      })
      .select()
      .single()

    if (error) {
      console.error("Error creating bet:", error)
      return { success: false, error: "Erreur lors de la création du pari" }
    }

    revalidatePath("/")
    revalidatePath("/history")

    return { success: true, data }
  } catch (error) {
    console.error("Error creating bet:", error)
    return { success: false, error: "Erreur inattendue" }
  }
}

export async function updateBet(betId: string, updates: UpdateBet) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const { data, error } = await supabase
      .from("bets")
      .update(updates)
      .eq("id", betId)
      .eq("user_id", user.id) // Ensure user can only update their own bets
      .select()
      .single()

    if (error) {
      console.error("Error updating bet:", error)
      return { success: false, error: "Erreur lors de la mise à jour du pari" }
    }

    revalidatePath("/")
    revalidatePath("/history")

    return { success: true, data }
  } catch (error) {
    console.error("Error updating bet:", error)
    return { success: false, error: "Erreur inattendue" }
  }
}

export async function deleteBet(betId: string) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const { error } = await supabase.from("bets").delete().eq("id", betId).eq("user_id", user.id)

    if (error) {
      console.error("Error deleting bet:", error)
      return { success: false, error: "Erreur lors de la suppression du pari" }
    }

    revalidatePath("/")
    revalidatePath("/history")

    return { success: true }
  } catch (error) {
    console.error("Error deleting bet:", error)
    return { success: false, error: "Erreur inattendue" }
  }
}

export async function getUserBets(limit?: number) {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Non autorisé" }
  }

  try {
    let query = supabase.from("bets").select("*").eq("user_id", user.id).order("created_at", { ascending: false })

    if (limit) {
      query = query.limit(limit)
    }

    const { data, error } = await query

    if (error) {
      console.error("Error fetching bets:", error)

      // Handle specific error cases
      if (error.message.includes("Too Many") || error.message.includes("rate")) {
        return { success: false, error: "Trop de requêtes. Veuillez patienter un moment." }
      }

      return { success: false, error: "Erreur lors de la récupération des paris" }
    }

    return { success: true, data: data || [] }
  } catch (error) {
    console.error("Error fetching bets:", error)
    return { success: false, error: "Erreur inattendue" }
  }
}

export async function getBetStats() {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Non autorisé" }
  }

  try {
    const { data, error } = await supabase
      .from("bets")
      .select("status, stake, actual_win, potential_win")
      .eq("user_id", user.id)

    if (error) {
      console.error("Error fetching bet stats:", error)

      if (error.message.includes("Too Many") || error.message.includes("rate")) {
        return { success: false, error: "Trop de requêtes. Veuillez patienter un moment." }
      }

      return { success: false, error: "Erreur lors de la récupération des statistiques" }
    }

    // Calculate statistics with fallback for empty data
    const betsData = data || []
    const totalBets = betsData.length
    const wonBets = betsData.filter((bet) => bet.status === "won").length
    const lostBets = betsData.filter((bet) => bet.status === "lost").length
    const pendingBets = betsData.filter((bet) => bet.status === "pending").length
    const cancelledBets = betsData.filter((bet) => bet.status === "cancelled").length

    const totalStaked = betsData.reduce((sum, bet) => sum + (bet.stake || 0), 0)
    const totalWon = betsData.reduce((sum, bet) => sum + (bet.actual_win || 0), 0)
    
    // Pour le calcul des pertes, ne pas inclure les paris remboursés
    const totalLost = betsData
      .filter((bet) => bet.status === "lost")
      .reduce((sum, bet) => sum + (bet.stake || 0), 0)

    const netProfit = totalWon - totalLost
    
    // Le taux de réussite exclut les paris en cours et remboursés
    const settledBets = wonBets + lostBets // Paris avec résultat définitif
    const successRate = settledBets > 0 ? (wonBets / settledBets) * 100 : 0
    
    // Le ROI est basé sur tous les paris sauf les remboursés
    const investedAmount = betsData
      .filter((bet) => bet.status !== "cancelled")
      .reduce((sum, bet) => sum + (bet.stake || 0), 0)
    const roi = investedAmount > 0 ? (netProfit / investedAmount) * 100 : 0

    return {
      success: true,
      data: {
        totalBets,
        wonBets,
        lostBets,
        pendingBets,
        cancelledBets,
        totalStaked,
        totalWon,
        totalLost,
        netProfit,
        successRate: isNaN(successRate) ? 0 : successRate,
        roi: isNaN(roi) ? 0 : roi,
      },
    }
  } catch (error) {
    console.error("Error calculating bet stats:", error)
    return { success: false, error: "Erreur inattendue" }
  }
}

export async function getPerformanceData(period: string = "30") {
  const supabase = await createServerClient()

  // Get the current user
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  if (authError || !user) {
    return { success: false, error: "Non autorisé" }
  }

  try {
    // Calculate date range based on period
    const now = new Date()
    const startDate = new Date()
    let groupBy = "day"
    let dateFormat = "YYYY-MM-DD"

    switch (period) {
      case "7":
        startDate.setDate(now.getDate() - 7)
        groupBy = "day"
        dateFormat = "DD/MM"
        break
      case "30":
        startDate.setDate(now.getDate() - 30)
        groupBy = "day"
        dateFormat = "DD/MM"
        break
      case "90":
        startDate.setDate(now.getDate() - 90)
        groupBy = "week"
        dateFormat = "DD/MM"
        break
      case "365":
        startDate.setFullYear(now.getFullYear() - 1)
        groupBy = "month"
        dateFormat = "MMM"
        break
      default:
        startDate.setDate(now.getDate() - 30)
    }

    // Fetch bets for the period
    const { data, error } = await supabase
      .from("bets")
      .select("*")
      .eq("user_id", user.id)
      .gte("created_at", startDate.toISOString())
      .lte("created_at", now.toISOString())
      .order("created_at", { ascending: true })

    if (error) {
      console.error("Error fetching performance data:", error)
      return { success: false, error: "Erreur lors de la récupération des données de performance" }
    }

    const betsData = data || []

    // Group data by the specified period
    const groupedData = new Map()

    betsData.forEach((bet) => {
      const betDate = new Date(bet.created_at)
      let key = ""

      if (groupBy === "day") {
        key = betDate.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
      } else if (groupBy === "week") {
        // Get week number
        const weekStart = new Date(betDate)
        weekStart.setDate(betDate.getDate() - betDate.getDay())
        key = weekStart.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
      } else if (groupBy === "month") {
        key = betDate.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")
      }

      if (!groupedData.has(key)) {
        groupedData.set(key, {
          date: key,
          profit: 0,
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          cancelledBets: 0,
        })
      }

      const group = groupedData.get(key)
      group.totalBets += 1

      if (bet.status === "won") {
        group.wonBets += 1
        group.profit += (bet.actual_win || 0) - bet.stake
      } else if (bet.status === "lost") {
        group.lostBets += 1
        group.profit -= bet.stake
      } else if (bet.status === "cancelled") {
        group.cancelledBets += 1
        // Pour les paris remboursés, pas d'impact sur le profit (mise récupérée)
        // group.profit += 0
      } else {
        group.pendingBets += 1
      }
    })

    // Convert map to array and fill missing dates with zero values
    const result = Array.from(groupedData.values())

    // If no data, return empty periods for the chart
    if (result.length === 0) {
      const emptyData = []
      const periodLength = period === "7" ? 7 : period === "30" ? 6 : period === "90" ? 12 : 12

      for (let i = 0; i < periodLength; i++) {
        const date = new Date(startDate)
        if (groupBy === "day") {
          date.setDate(startDate.getDate() + i * (period === "30" ? 5 : 1))
        } else if (groupBy === "week") {
          date.setDate(startDate.getDate() + i * 7)
        } else {
          date.setMonth(startDate.getMonth() + i)
        }

        let key = ""
        if (groupBy === "day") {
          key = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
        } else if (groupBy === "week") {
          key = date.toLocaleDateString("fr-FR", { day: "2-digit", month: "2-digit" })
        } else {
          key = date.toLocaleDateString("fr-FR", { month: "short" }).replace(".", "")
        }

        emptyData.push({
          date: key,
          profit: 0,
          totalBets: 0,
          wonBets: 0,
          lostBets: 0,
          pendingBets: 0,
          cancelledBets: 0,
        })
      }
      return { success: true, data: emptyData }
    }

    return { success: true, data: result }
  } catch (error) {
    console.error("Error calculating performance data:", error)
    return { success: false, error: "Erreur inattendue" }
  }
}
