"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Switch } from "@/components/ui/switch"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState, useEffect } from "react"
import { Check, Loader2 } from "lucide-react"
import { useAuth } from "@/components/auth/auth-provider"
import { createClient } from "@/lib/supabase/client"
import { Alert, AlertDescription } from "@/components/ui/alert"

const profileFormSchema = z.object({
  username: z.string().optional(),
  full_name: z.string().optional(),
  currency: z.string().default("EUR"),
})

const notificationsFormSchema = z.object({
  betResults: z.boolean().default(true),
  newFeatures: z.boolean().default(false),
  marketingEmails: z.boolean().default(false),
})

const preferencesFormSchema = z.object({
  currency: z.string().default("EUR"),
  theme: z.string().default("system"),
  language: z.string().default("fr"),
})

type ProfileFormValues = z.infer<typeof profileFormSchema>
type NotificationsFormValues = z.infer<typeof notificationsFormSchema>
type PreferencesFormValues = z.infer<typeof preferencesFormSchema>

export function SettingsForm() {
  const [isSaved, setIsSaved] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user, profile, refreshUser } = useAuth()
  const supabase = createClient()

  const profileForm = useForm<ProfileFormValues>({
    resolver: zodResolver(profileFormSchema),
    defaultValues: {
      username: "",
      full_name: "",
      currency: "FCFA",
    },
  })

  const notificationsForm = useForm<NotificationsFormValues>({
    resolver: zodResolver(notificationsFormSchema),
    defaultValues: {
      betResults: true,
      newFeatures: false,
      marketingEmails: false,
    },
  })

  const preferencesForm = useForm<PreferencesFormValues>({
    resolver: zodResolver(preferencesFormSchema),
    defaultValues: {
      currency: "FCFA",
      theme: "system",
      language: "fr",
    },
  })

  // Load profile data when component mounts
  useEffect(() => {
    if (profile) {
      profileForm.reset({
        username: profile.username || "",
        full_name: profile.full_name || "",
        currency: profile.currency || "FCFA",
      })

      preferencesForm.reset({
        currency: profile.currency || "FCFA",
        theme: "system", // This would come from localStorage or profile
        language: "fr",
      })
    }
  }, [profile, profileForm, preferencesForm])

  async function onProfileSubmit(data: ProfileFormValues) {
    if (!user) return

    console.log("🚀 Début sauvegarde profil:", data)
    setIsLoading(true)
    setError(null)

    try {
      // Utiliser la nouvelle API route au lieu de l'appel direct Supabase
      console.log("📤 Envoi requête vers /api/auth/profile")
      const response = await fetch('/api/auth/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username: data.username,
          full_name: data.full_name,
          currency: data.currency,
        }),
      })

      console.log("📥 Réponse reçue:", response.status, response.statusText)

      if (!response.ok) {
        const errorData = await response.json()
        console.error("❌ Erreur réponse:", errorData)
        throw new Error(errorData.error || 'Erreur lors de la sauvegarde')
      }

      const result = await response.json()
      console.log("✅ Données sauvegardées:", result)

      // Actualiser les données utilisateur
      await refreshUser()
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
      console.log("🎉 Sauvegarde terminée avec succès")
    } catch (err) {
      console.error('💥 Erreur sauvegarde profil:', err)
      setError((err as Error).message || "Erreur inattendue lors de la sauvegarde")
    } finally {
      setIsLoading(false)
    }
  }

  function onNotificationsSubmit(data: NotificationsFormValues) {
    // For now, just simulate saving to localStorage
    // In a real app, you'd save this to the database or user preferences
    localStorage.setItem("notifications", JSON.stringify(data))
    setIsSaved(true)
    setTimeout(() => setIsSaved(false), 3000)
  }

  async function onPreferencesSubmit(data: PreferencesFormValues) {
    // Save theme to localStorage
    localStorage.setItem("theme", data.theme)
    localStorage.setItem("language", data.language)

    // Update currency in profile via API
    if (data.currency !== profile?.currency) {
      await onProfileSubmit({ currency: data.currency })
    } else {
      setIsSaved(true)
      setTimeout(() => setIsSaved(false), 3000)
    }
  }

  const handlePasswordReset = async () => {
    if (!user?.email) return

    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(user.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) {
        setError(error.message)
      } else {
        setIsSaved(true)
        setTimeout(() => setIsSaved(false), 3000)
      }
    } catch (err) {
      setError("Erreur lors de l'envoi de l'email de réinitialisation")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Tabs defaultValue="profile" className="max-w-2xl mx-auto">
      <TabsList className="grid grid-cols-3 mb-8">
        <TabsTrigger value="profile">Profil</TabsTrigger>
        <TabsTrigger value="notifications">Notifications</TabsTrigger>
        <TabsTrigger value="preferences">Préférences</TabsTrigger>
      </TabsList>

      {error && (
        <Alert variant="destructive" className="mb-6">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <TabsContent value="profile">
        <Card>
          <CardHeader>
            <CardTitle>Profil</CardTitle>
            <CardDescription>Gérez vos informations personnelles</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...profileForm}>
              <form onSubmit={profileForm.handleSubmit(onProfileSubmit)} className="space-y-6">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input value={user?.email || ""} disabled />
                  <p className="text-xs text-muted-foreground">
                    L'email ne peut pas être modifié. Contactez le support si nécessaire.
                  </p>
                </div>

                <FormField
                  control={profileForm.control}
                  name="full_name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom complet</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom complet" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="username"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nom d'utilisateur</FormLabel>
                      <FormControl>
                        <Input placeholder="Votre nom d'utilisateur" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={profileForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise par défaut</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="FCFA">Franc CFA (FCFA)</SelectItem>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="USD">Dollar américain ($)</SelectItem>
                          <SelectItem value="GBP">Livre sterling (£)</SelectItem>
                          <SelectItem value="CHF">Franc suisse (CHF)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="flex gap-4">
                  <Button type="submit" disabled={isLoading}>
                    {isLoading ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Enregistrement...
                      </>
                    ) : isSaved ? (
                      <>
                        <Check className="mr-2 h-4 w-4" /> Enregistré
                      </>
                    ) : (
                      "Enregistrer les modifications"
                    )}
                  </Button>

                  <Button type="button" variant="outline" onClick={handlePasswordReset} disabled={isLoading}>
                    Réinitialiser le mot de passe
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="notifications">
        <Card>
          <CardHeader>
            <CardTitle>Notifications</CardTitle>
            <CardDescription>Configurez vos préférences de notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...notificationsForm}>
              <form onSubmit={notificationsForm.handleSubmit(onNotificationsSubmit)} className="space-y-6">
                <FormField
                  control={notificationsForm.control}
                  name="betResults"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Résultats des paris</FormLabel>
                        <FormDescription>Recevez des notifications lorsque vos paris sont terminés</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationsForm.control}
                  name="newFeatures"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Nouvelles fonctionnalités</FormLabel>
                        <FormDescription>Soyez informé des nouvelles fonctionnalités de l'application</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={notificationsForm.control}
                  name="marketingEmails"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                      <div className="space-y-0.5">
                        <FormLabel className="text-base">Emails marketing</FormLabel>
                        <FormDescription>Recevez des offres et des promotions par email</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <Button type="submit">
                  {isSaved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Enregistré
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>

      <TabsContent value="preferences">
        <Card>
          <CardHeader>
            <CardTitle>Préférences</CardTitle>
            <CardDescription>Personnalisez votre expérience</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...preferencesForm}>
              <form onSubmit={preferencesForm.handleSubmit(onPreferencesSubmit)} className="space-y-6">
                <FormField
                  control={preferencesForm.control}
                  name="currency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Devise</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une devise" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="EUR">Euro (€)</SelectItem>
                          <SelectItem value="USD">Dollar américain ($)</SelectItem>
                          <SelectItem value="GBP">Livre sterling (£)</SelectItem>
                          <SelectItem value="CHF">Franc suisse (CHF)</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="theme"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Thème</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez un thème" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="light">Clair</SelectItem>
                          <SelectItem value="dark">Sombre</SelectItem>
                          <SelectItem value="system">Système</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={preferencesForm.control}
                  name="language"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Langue</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Sélectionnez une langue" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="fr">Français</SelectItem>
                          <SelectItem value="en">Anglais</SelectItem>
                          <SelectItem value="es">Espagnol</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit">
                  {isSaved ? (
                    <>
                      <Check className="mr-2 h-4 w-4" /> Enregistré
                    </>
                  ) : (
                    "Enregistrer les modifications"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </TabsContent>
    </Tabs>
  )
}
