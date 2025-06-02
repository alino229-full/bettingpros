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

    const totalStaked = betsData.reduce((sum, bet) => sum + (bet.stake || 0), 0)
    const totalWon = betsData.reduce((sum, bet) => sum + (bet.actual_win || 0), 0)
    const totalLost = betsData.filter((bet) => bet.status === "lost").reduce((sum, bet) => sum + (bet.stake || 0), 0)

    const netProfit = totalWon - totalLost
    const successRate = totalBets > 0 ? (wonBets / (wonBets + lostBets)) * 100 : 0
    const roi = totalStaked > 0 ? (netProfit / totalStaked) * 100 : 0

    return {
      success: true,
      data: {
        totalBets,
        wonBets,
        lostBets,
        pendingBets,
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
