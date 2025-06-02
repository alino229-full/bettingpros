import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import type { Profile } from "@/lib/types/database"

export async function GET() {
  try {
    const supabase = await createServerClient()
    
    // Get the current user - recommended way for server-side
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Fetch user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .maybeSingle()

    if (profileError) {
      console.error("Erreur récupération profil:", profileError)
      return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
    }

    // If no profile exists, create one
    if (!profile) {
      const { data: newProfile, error: createError } = await supabase
        .from("profiles")
        .insert({
          id: user.id,
          username: null,
          full_name: null,
          avatar_url: null,
          currency: "EUR",
        })
        .select()
        .single()

      if (createError) {
        console.error("Erreur création profil:", createError)
        return NextResponse.json({ error: "Erreur création profil" }, { status: 500 })
      }

      return NextResponse.json(newProfile)
    }

    return NextResponse.json(profile)
  } catch (error) {
    console.error("Erreur API profil:", error)
    return NextResponse.json({ error: "Erreur inattendue" }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  console.log("🔄 API PUT /api/auth/profile - Début de la requête")
  
  try {
    const supabase = await createServerClient()
    console.log("✅ Client Supabase créé")
    
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    console.log("👤 Utilisateur récupéré:", user?.id, "Erreur auth:", authError)
    
    if (authError || !user) {
      console.error("❌ Erreur authentification:", authError)
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const updates = await request.json()
    console.log("📝 Données à mettre à jour:", updates)
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update({
        ...updates,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)
      .select()
      .single()

    console.log("📊 Résultat mise à jour:", { updatedProfile, updateError })

    if (updateError) {
      console.error("❌ Erreur mise à jour profil:", updateError)
      return NextResponse.json({ 
        error: `Erreur mise à jour: ${updateError.message}`,
        details: updateError
      }, { status: 500 })
    }

    console.log("✅ Profil mis à jour avec succès")
    return NextResponse.json(updatedProfile)
  } catch (error) {
    console.error("💥 Erreur API mise à jour profil:", error)
    return NextResponse.json({ 
      error: "Erreur inattendue",
      details: error instanceof Error ? error.message : String(error)
    }, { status: 500 })
  }
} 