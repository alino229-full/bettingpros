"use client"

import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AlertCircle, Sparkles } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { createBet } from "@/app/actions/bet-actions"
import { useState } from "react"
import { useAuth } from "@/components/auth/auth-provider"

const betFormSchema = z.object({
  match: z.string().min(2, {
    message: "Le match doit contenir au moins 2 caractères",
  }),
  sport: z.string().min(2, {
    message: "Le sport doit être spécifié",
  }),
  betType: z.string(),
  prediction: z.string().min(2, {
    message: "La prédiction doit contenir au moins 2 caractères",
  }),
  odds: z.coerce.number().positive({
    message: "La cote doit être un nombre positif",
  }),
  stake: z.coerce.number().positive({
    message: "La mise doit être un nombre positif",
  }),
  date: z.string(),
  time: z.string().optional(),
  bookmaker: z.string().optional(),
  ticketId: z.string().optional(),
  competition: z.string().optional(),
})

type BetFormValues = z.infer<typeof betFormSchema>

interface BetFormProps {
  onSubmit: (values: BetFormValues) => void
  initialData?: Partial<BetFormValues>
  isOcrExtracted?: boolean
  confidence?: number
}

export function BetForm({ onSubmit, initialData, isOcrExtracted = false, confidence = 0 }: BetFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const { user } = useAuth()

  const form = useForm<BetFormValues>({
    resolver: zodResolver(betFormSchema),
    defaultValues: {
      match: initialData?.match || "",
      sport: initialData?.sport || "",
      betType: initialData?.betType || "simple",
      prediction: initialData?.prediction || "",
      odds: initialData?.odds || 1.5,
      stake: initialData?.stake || 10,
      date: initialData?.date || new Date().toISOString().split("T")[0],
      time: initialData?.time || "",
      bookmaker: initialData?.bookmaker || "",
      ticketId: initialData?.ticketId || "",
      competition: initialData?.competition || "",
    },
  })

  const handleSubmit = async (values: BetFormValues) => {
    if (!user) {
      setError("Vous devez être connecté pour enregistrer un pari")
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      const result = await createBet({
        match_name: values.match,
        sport: values.sport,
        competition: values.competition || null,
        bet_type: values.betType as "simple" | "combine" | "systeme",
        prediction: values.prediction,
        odds: values.odds,
        stake: values.stake,
        potential_win: values.odds * values.stake,
        match_date: values.date || null,
        match_time: values.time || null,
        bookmaker: values.bookmaker || null,
        ticket_id: values.ticketId || null,
        confidence_score: confidence || null,
        is_ocr_extracted: isOcrExtracted,
      })

      if (result.success) {
        onSubmit(values)
      } else {
        setError(result.error || "Erreur lors de l'enregistrement")
      }
    } catch (err) {
      setError("Erreur inattendue lors de l'enregistrement")
    } finally {
      setIsSubmitting(false)
    }
  }

  const getFieldConfidenceIndicator = (fieldName: string) => {
    if (!isOcrExtracted) return null

    return (
      <div className="flex items-center gap-1 mt-1">
        <Sparkles className="h-3 w-3 text-blue-500" />
        <span className="text-xs text-blue-600">Extrait par IA</span>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {isOcrExtracted && confidence < 0.7 && (
        <Alert>
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Certaines informations ont été extraites avec une confiance modérée. Veuillez les vérifier avant de
            continuer.
          </AlertDescription>
        </Alert>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="match"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Match</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: PSG vs Marseille" {...field} />
                </FormControl>
                {getFieldConfidenceIndicator("match")}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="sport"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Sport</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un sport" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Football">Football</SelectItem>
                    <SelectItem value="Tennis">Tennis</SelectItem>
                    <SelectItem value="Basketball">Basketball</SelectItem>
                    <SelectItem value="Rugby">Rugby</SelectItem>
                    <SelectItem value="Hockey">Hockey</SelectItem>
                    <SelectItem value="Baseball">Baseball</SelectItem>
                    <SelectItem value="Volleyball">Volleyball</SelectItem>
                    <SelectItem value="Autre">Autre</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldConfidenceIndicator("sport")}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="competition"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Compétition (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Ligue 1, Serie A, Champions League" {...field} />
                </FormControl>
                {getFieldConfidenceIndicator("competition")}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="betType"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Type de pari</FormLabel>
                <Select onValueChange={field.onChange} value={field.value}>
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Sélectionnez un type de pari" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="simple">Simple</SelectItem>
                    <SelectItem value="combine">Combiné</SelectItem>
                    <SelectItem value="systeme">Système</SelectItem>
                  </SelectContent>
                </Select>
                {getFieldConfidenceIndicator("betType")}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="prediction"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Pronostic</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Victoire PSG, Plus de 2.5 buts" {...field} />
                </FormControl>
                {getFieldConfidenceIndicator("prediction")}
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="odds"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Cote</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  {getFieldConfidenceIndicator("odds")}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="stake"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Mise (€)</FormLabel>
                  <FormControl>
                    <Input type="number" step="0.01" {...field} />
                  </FormControl>
                  {getFieldConfidenceIndicator("stake")}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="date"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date du match</FormLabel>
                  <FormControl>
                    <Input type="date" {...field} />
                  </FormControl>
                  {getFieldConfidenceIndicator("date")}
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="time"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Heure (optionnel)</FormLabel>
                  <FormControl>
                    <Input type="time" {...field} />
                  </FormControl>
                  {getFieldConfidenceIndicator("time")}
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <FormField
            control={form.control}
            name="bookmaker"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Bookmaker (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Ex: Betclic, Winamax, PMU, 1xbet" {...field} />
                </FormControl>
                {getFieldConfidenceIndicator("bookmaker")}
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="ticketId"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Numéro de ticket (optionnel)</FormLabel>
                <FormControl>
                  <Input placeholder="Référence du ticket" {...field} />
                </FormControl>
                {getFieldConfidenceIndicator("ticketId")}
                <FormMessage />
              </FormItem>
            )}
          />

          <Button type="submit" className="w-full" disabled={isSubmitting}>
            {isSubmitting ? (
              "Enregistrement..."
            ) : isOcrExtracted ? (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Enregistrer le pari (IA)
              </>
            ) : (
              "Enregistrer le pari"
            )}
          </Button>
        </form>
      </Form>
    </div>
  )
}
