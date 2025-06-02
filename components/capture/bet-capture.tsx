"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Camera, Check, Upload, Loader2, AlertCircle, RefreshCw, Zap } from "lucide-react"
import { BetForm } from "@/components/capture/bet-form"
import { extractBetFromImage, quickExtractBet } from "@/app/actions/ocr-actions"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { useAuth } from "@/components/auth/auth-provider"

export function BetCapture() {
  const [captureStep, setCaptureStep] = useState<"capture" | "processing" | "edit" | "confirm">("capture")
  const [imagePreview, setImagePreview] = useState<string | null>(null)
  const [extractedData, setExtractedData] = useState<any>(null)
  const [isProcessing, setIsProcessing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [confidence, setConfidence] = useState<number>(0)
  const [processingMethod, setProcessingMethod] = useState<string>("")
  const [useQuickMode, setUseQuickMode] = useState(true)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { user } = useAuth()

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Veuillez sélectionner un fichier image valide")
      return
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError("Le fichier est trop volumineux. Taille maximale: 10MB")
      return
    }

    setError(null)
    setIsProcessing(true)
    setCaptureStep("processing")

    try {
      // Convert to base64
      const reader = new FileReader()
      reader.onload = async (e) => {
        const base64 = e.target?.result as string
        setImagePreview(base64)

        let result = null

        if (useQuickMode) {
          // Method 1: Quick extraction (faster)
          setProcessingMethod("Analyse rapide en cours...")
          result = await quickExtractBet(base64)
        } else {
          // Method 2: Standard extraction (more accurate)
          setProcessingMethod("Analyse détaillée en cours...")
          result = await extractBetFromImage(base64)
        }

        if (result.success && result.data) {
          setExtractedData(result.data)
          setConfidence(result.data.confidence || 0.8)
          setCaptureStep("edit")
        } else {
          setError(result.error || "Échec de l'extraction des informations")
          setCaptureStep("capture")
        }
        setIsProcessing(false)
        setProcessingMethod("")
      }
      reader.readAsDataURL(file)
    } catch (error) {
      console.error("Error processing image:", error)
      setError("Erreur lors du traitement de l'image")
      setIsProcessing(false)
      setCaptureStep("capture")
      setProcessingMethod("")
    }
  }

  const handleCapture = () => {
    fileInputRef.current?.click()
  }

  const handleReprocess = async () => {
    if (!imagePreview) return

    setIsProcessing(true)
    setError(null)

    try {
      setProcessingMethod("Re-analyse en cours...")
      // Use the opposite mode for reprocessing
      const result = useQuickMode ? await extractBetFromImage(imagePreview) : await quickExtractBet(imagePreview)

      if (result.success && result.data) {
        setExtractedData(result.data)
        setConfidence(result.data.confidence || 0)
      } else {
        setError(result.error || "Échec de la re-validation")
      }
    } catch (error) {
      console.error("Error reprocessing:", error)
      setError("Erreur lors du retraitement")
    }
    setIsProcessing(false)
    setProcessingMethod("")
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return "bg-green-100 text-green-800"
    if (confidence >= 0.6) return "bg-yellow-100 text-yellow-800"
    return "bg-red-100 text-red-800"
  }

  const getConfidenceText = (confidence: number) => {
    if (confidence >= 0.8) return "Haute confiance"
    if (confidence >= 0.6) return "Confiance moyenne"
    return "Faible confiance"
  }

  if (!user) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <p>Vous devez être connecté pour utiliser cette fonctionnalité.</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="max-w-md mx-auto">
      <Card>
        <CardContent className="p-6">
          {captureStep === "capture" && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <div className="border-2 border-dashed border-gray-300 rounded-lg p-12 w-full flex flex-col items-center justify-center">
                <Camera className="h-12 w-12 text-gray-400 mb-4" />
                <p className="text-center text-muted-foreground mb-4">
                  Prenez une photo ou téléchargez une image de votre ticket de pari 1xbet pour extraire automatiquement
                  les informations
                </p>

                <div className="flex flex-col gap-3 w-full">
                  <div className="flex items-center justify-center gap-2 mb-2">
                    <Button
                      variant={useQuickMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseQuickMode(true)}
                    >
                      <Zap className="h-4 w-4 mr-1" />
                      Rapide
                    </Button>
                    <Button
                      variant={!useQuickMode ? "default" : "outline"}
                      size="sm"
                      onClick={() => setUseQuickMode(false)}
                    >
                      Précis
                    </Button>
                  </div>

                  <Button onClick={handleCapture} className="w-full">
                    <Upload className="h-4 w-4 mr-2" />
                    Télécharger une image
                  </Button>
                </div>
              </div>

              <input
                title="Télécharger une image"
                placeholder="Télécharger une image"
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                className="hidden"
              />

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <div className="text-center space-y-2">
                <p className="text-sm text-muted-foreground">Formats supportés: JPG, PNG, WebP (max 10MB)</p>
                <Badge variant="outline" className="text-xs">
                  Optimisé pour les tickets 1xbet
                </Badge>
                <p className="text-xs text-muted-foreground">
                  Mode {useQuickMode ? "Rapide" : "Précis"}: {useQuickMode ? "~3s" : "~10s"}
                </p>
              </div>
            </div>
          )}

          {captureStep === "processing" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <Loader2 className="h-12 w-12 animate-spin text-primary" />
              <h3 className="text-lg font-medium">{useQuickMode ? "Analyse rapide..." : "Analyse détaillée..."}</h3>
              <p className="text-center text-muted-foreground">
                {processingMethod || `L'IA analyse votre ticket 1xbet (mode ${useQuickMode ? "rapide" : "précis"})`}
              </p>
              <div className="text-xs text-muted-foreground">
                Temps estimé: {useQuickMode ? "~3 secondes" : "~10 secondes"}
              </div>
            </div>
          )}

          {captureStep === "edit" && (
            <div className="space-y-6">
              <div className="flex flex-col items-center justify-between">
                <div className="flex items-center gap-2">
                  <h3 className="text-lg font-medium">Vérifier les informations</h3>
                  <Badge className={getConfidenceColor(confidence)}>
                    {getConfidenceText(confidence)} ({Math.round(confidence * 100)}%)
                  </Badge>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" size="sm" onClick={handleReprocess} disabled={isProcessing}>
                    <RefreshCw className={`h-4 w-4 mr-1 ${isProcessing ? "animate-spin" : ""}`} />
                    Re-analyser
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => setCaptureStep("capture")}>
                    Reprendre
                  </Button>
                </div>
              </div>

              {imagePreview && (
                <div className="flex justify-center mb-4">
                  <img
                    src={imagePreview || "/placeholder.svg"}
                    alt="Ticket preview"
                    className="max-h-48 rounded-md border"
                  />
                </div>
              )}

              {confidence < 0.6 && (
                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    La confiance de l'extraction est faible. Veuillez vérifier attentivement toutes les informations
                    ci-dessous.
                  </AlertDescription>
                </Alert>
              )}

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <BetForm
                onSubmit={() => setCaptureStep("confirm")}
                initialData={extractedData}
                isOcrExtracted={true}
                confidence={confidence}
              />
            </div>
          )}

          {captureStep === "confirm" && (
            <div className="flex flex-col items-center justify-center space-y-4 py-8">
              <div className="rounded-full bg-green-100 p-3">
                <Check className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-medium">Pari enregistré avec succès</h3>
              <p className="text-center text-muted-foreground">
                Votre pari 1xbet a été ajouté à votre historique. L'IA a extrait les informations avec{" "}
                {Math.round(confidence * 100)}% de confiance.
              </p>
              <div className="flex gap-4 mt-4">
                <Button variant="outline" onClick={() => setCaptureStep("capture")}>
                  Nouveau pari
                </Button>
                <Button onClick={() => (window.location.href = "/")}>Retour au tableau de bord</Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
